import { Router, Request, Response } from 'express';
import { db } from '../db/store';
import { authenticate, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { sanitizeUser } from './auth';

const router = Router();

// GET /services (with search, filtering, and sorting)
router.get('/', (req: Request, res: Response) => {
  try {
    const {
      search,
      category,
      area,
      minPrice,
      maxPrice,
      minRating,
      verifiedOnly,
      sort = 'relevance',
      page = '1',
      limit = '12',
    } = req.query as Record<string, string | undefined>;

    let services = db.services.find({ active: true });

    // Filter by category slug or ID
    if (category && category !== 'all') {
      const catObj = db.categories.findOne((c) => c.slug === category || c._id === category);
      if (catObj) {
        services = services.filter((s) => s.categoryId === catObj._id);
      }
    }

    // Filter by text search (title or description)
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      services = services.filter((s) => {
        const titleMatch = s.title.toLowerCase().includes(q);
        const descMatch = s.description.toLowerCase().includes(q);
        // Also check provider name match
        const prof = db.providerProfiles.findById(s.providerId);
        const user = prof ? db.users.findById(prof.userId) : null;
        const provMatch = prof?.businessName.toLowerCase().includes(q) || user?.name.toLowerCase().includes(q);
        return titleMatch || descMatch || provMatch;
      });
    }

    // Filter by area/location
    if (area && area.trim()) {
      const a = area.trim().toLowerCase();
      services = services.filter((s) =>
        s.serviceAreas.some((sa) => sa.toLowerCase().includes(a))
      );
    }

    // Filter by price
    if (minPrice) {
      const min = Number(minPrice);
      if (!isNaN(min)) {
        services = services.filter((s) => s.price >= min);
      }
    }
    if (maxPrice) {
      const max = Number(maxPrice);
      if (!isNaN(max)) {
        services = services.filter((s) => s.price <= max);
      }
    }

    // Enrich with provider and category details for rating/verified filters
    const enriched = services
      .map((s) => {
        const providerProfile = db.providerProfiles.findById(s.providerId);
        const providerUser = providerProfile ? db.users.findById(providerProfile.userId) : null;
        const categoryObj = db.categories.findById(s.categoryId);

        return {
          ...s,
          category: categoryObj || null,
          provider: providerProfile
            ? {
                ...providerProfile,
                user: providerUser ? sanitizeUser(providerUser) : null,
              }
            : null,
        };
      })
      .filter((s) => s.provider !== null); // Ensure provider exists

    let filtered = enriched;

    // Filter by provider verification
    if (verifiedOnly === 'true') {
      filtered = filtered.filter((s) => s.provider?.verificationStatus === 'approved');
    }

    // Filter by minimum rating
    if (minRating) {
      const rating = Number(minRating);
      if (!isNaN(rating)) {
        filtered = filtered.filter((s) => (s.provider?.averageRating || 0) >= rating);
      }
    }

    // Sorting
    filtered.sort((a, b) => {
      if (sort === 'rating') {
        return (b.provider?.averageRating || 0) - (a.provider?.averageRating || 0);
      }
      if (sort === 'price_asc') {
        return a.price - b.price;
      }
      if (sort === 'price_desc') {
        return b.price - a.price;
      }
      // Relevance / default: prioritize approved providers, then ratings
      const aScore = (a.provider?.verificationStatus === 'approved' ? 100 : 0) + (a.provider?.averageRating || 0) * 10;
      const bScore = (b.provider?.verificationStatus === 'approved' ? 100 : 0) + (b.provider?.averageRating || 0) * 10;
      return bScore - aScore;
    });

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 12);
    const total = filtered.length;
    const totalPages = Math.ceil(total / limitNum);
    const paginated = filtered.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    res.json({
      success: true,
      data: paginated,
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
      },
    });
  } catch (err: any) {
    console.error('Services query error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve services.' });
  }
});

// GET /services/featured
router.get('/featured', (_req: Request, res: Response) => {
  const approvedProviders = db.providerProfiles.find({ verificationStatus: 'approved', active: true });
  const approvedIds = new Set(approvedProviders.map((p) => p._id));

  const allServices = db.services.find({ active: true }).filter((s) => approvedIds.has(s.providerId));

  const enriched = allServices.slice(0, 8).map((s) => {
    const providerProfile = db.providerProfiles.findById(s.providerId);
    const providerUser = providerProfile ? db.users.findById(providerProfile.userId) : null;
    const category = db.categories.findById(s.categoryId);

    return {
      ...s,
      category,
      provider: providerProfile
        ? {
            ...providerProfile,
            user: providerUser ? sanitizeUser(providerUser) : null,
          }
        : null,
    };
  });

  res.json({ success: true, data: enriched });
});

// GET /services/:id
router.get('/:id', (req: Request, res: Response) => {
  const service = db.services.findById(req.params.id);
  if (!service) {
    res.status(404).json({ success: false, message: 'Service not found.' });
    return;
  }

  const category = db.categories.findById(service.categoryId);
  const provider = db.providerProfiles.findById(service.providerId);
  const providerUser = provider ? db.users.findById(provider.userId) : null;
  const availability = provider ? db.availabilities.find({ providerId: provider._id }) : [];
  const reviews = provider ? db.reviews.find({ providerId: provider._id, moderationStatus: 'approved' }) : [];

  const reviewsWithCustomer = reviews.map((r) => {
    const cUser = db.users.findById(r.customerId);
    return {
      ...r,
      customerName: cUser ? cUser.name : 'Verified Customer',
    };
  });

  // Other services from this provider
  const otherServices = provider
    ? db.services.find((s) => s.providerId === provider._id && s._id !== service._id && s.active)
    : [];

  res.json({
    success: true,
    data: {
      ...service,
      category,
      provider: provider
        ? {
            ...providerProfileSafe(provider),
            user: providerUser ? sanitizeUser(providerUser) : null,
          }
        : null,
      availability,
      reviews: reviewsWithCustomer,
      otherServices,
    },
  });
});

function providerProfileSafe(prof: any) {
  return prof;
}

// POST /provider/services (Provider adds a new service)
router.post('/provider/services', authenticate, requireRole(['provider']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const providerProfile = db.providerProfiles.findOne({ userId: req.user!._id });
    if (!providerProfile) {
      res.status(404).json({ success: false, message: 'Provider profile not found.' });
      return;
    }

    const { title, categoryId, description, price, pricingType, estimatedDuration, serviceAreas } = req.body;

    if (!title || !categoryId || !price) {
      res.status(400).json({ success: false, message: 'Title, category, and price are required.' });
      return;
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const newService = db.services.create({
      providerId: providerProfile._id,
      categoryId,
      title: title.trim(),
      slug: `${slug}-${Date.now().toString(36)}`,
      description: description || '',
      price: Number(price),
      pricingType: pricingType || 'fixed',
      estimatedDuration: estimatedDuration || '1-2 hrs',
      serviceAreas: Array.isArray(serviceAreas) ? serviceAreas : providerProfile.serviceAreas,
      images: [],
      active: true,
    });

    res.status(201).json({
      success: true,
      message: 'Service created successfully.',
      data: newService,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to create service.' });
  }
});

// PATCH /provider/services/:id (Provider updates their service)
router.patch('/provider/services/:id', authenticate, requireRole(['provider']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const providerProfile = db.providerProfiles.findOne({ userId: req.user!._id });
    if (!providerProfile) {
      res.status(404).json({ success: false, message: 'Provider profile not found.' });
      return;
    }

    const service = db.services.findById(req.params.id);
    if (!service) {
      res.status(404).json({ success: false, message: 'Service not found.' });
      return;
    }

    // Enforce ownership
    if (service.providerId !== providerProfile._id) {
      res.status(403).json({ success: false, message: 'You are not authorized to edit this service.' });
      return;
    }

    const { title, categoryId, description, price, pricingType, estimatedDuration, serviceAreas, active } = req.body;

    const updates: any = {};
    if (title !== undefined) updates.title = title.trim();
    if (categoryId !== undefined) updates.categoryId = categoryId;
    if (description !== undefined) updates.description = description;
    if (price !== undefined) updates.price = Number(price);
    if (pricingType !== undefined) updates.pricingType = pricingType;
    if (estimatedDuration !== undefined) updates.estimatedDuration = estimatedDuration;
    if (serviceAreas !== undefined) updates.serviceAreas = Array.isArray(serviceAreas) ? serviceAreas : [];
    if (active !== undefined) updates.active = Boolean(active);

    const updated = db.services.findByIdAndUpdate(service._id, updates);

    res.json({
      success: true,
      message: 'Service updated successfully.',
      data: updated,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to update service.' });
  }
});

// DELETE /provider/services/:id (Provider deactivates or removes service)
router.delete('/provider/services/:id', authenticate, requireRole(['provider']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const providerProfile = db.providerProfiles.findOne({ userId: req.user!._id });
    if (!providerProfile) {
      res.status(404).json({ success: false, message: 'Provider profile not found.' });
      return;
    }

    const service = db.services.findById(req.params.id);
    if (!service) {
      res.status(404).json({ success: false, message: 'Service not found.' });
      return;
    }

    if (service.providerId !== providerProfile._id) {
      res.status(403).json({ success: false, message: 'Unauthorized to delete this service.' });
      return;
    }

    // Soft delete / deactivate
    db.services.findByIdAndUpdate(service._id, { active: false });

    res.json({ success: true, message: 'Service deactivated successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to delete service.' });
  }
});

export default router;
