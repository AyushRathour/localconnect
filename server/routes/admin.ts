import { Router, Response } from 'express';
import { db } from '../db/store';
import { authenticate, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { sanitizeUser } from './auth';
import { recalculateProviderRating } from './reviews';
import { VerificationStatus } from '../db/types';

const router = Router();

// Apply auth + admin guard to all routes in this file
router.use(authenticate, requireRole(['admin']));

// GET /admin/dashboard
router.get('/dashboard', (_req: AuthenticatedRequest, res: Response) => {
  const users = db.users.find();
  const customers = users.filter((u) => u.role === 'customer');
  const providers = users.filter((u) => u.role === 'provider');
  const providerProfiles = db.providerProfiles.find();

  const pendingVerifications = providerProfiles.filter((p) => p.verificationStatus === 'pending');
  const approvedProviders = providerProfiles.filter((p) => p.verificationStatus === 'approved');

  const bookings = db.bookings.find();
  const pendingBookings = bookings.filter((b) => b.status === 'pending');
  const activeBookings = bookings.filter((b) => ['accepted', 'confirmed', 'in_progress'].includes(b.status));
  const completedBookings = bookings.filter((b) => b.status === 'completed');
  const cancelledBookings = bookings.filter((b) => ['cancelled', 'rejected'].includes(b.status));

  const totalRevenue = completedBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const reviews = db.reviews.find();

  // Recent 10 audit logs
  const recentLogs = db.auditLogs
    .find()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  res.json({
    success: true,
    data: {
      totalCustomers: customers.length,
      totalProviders: providers.length,
      approvedProvidersCount: approvedProviders.length,
      pendingVerificationsCount: pendingVerifications.length,
      totalBookings: bookings.length,
      pendingBookingsCount: pendingBookings.length,
      activeBookingsCount: activeBookings.length,
      completedBookingsCount: completedBookings.length,
      cancelledBookingsCount: cancelledBookings.length,
      totalServices: db.services.count({ active: true }),
      totalReviews: reviews.length,
      totalRevenue,
      recentLogs,
    },
  });
});

// GET /admin/users
router.get('/users', (req: AuthenticatedRequest, res: Response) => {
  const { role, status, search, page = '1', limit = '15' } = req.query as Record<string, string | undefined>;

  let users = db.users.find();

  if (role && role !== 'all') {
    users = users.filter((u) => u.role === role);
  }

  if (status && status !== 'all') {
    users = users.filter((u) => u.accountStatus === status);
  }

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    users = users.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.phone.includes(q));
  }

  const sanitized = users.map((u) => {
    const prof = u.role === 'provider' ? db.providerProfiles.findOne({ userId: u._id }) : null;
    return {
      ...sanitizeUser(u),
      providerProfile: prof || null,
    };
  });

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 15);
  const total = sanitized.length;
  const paginated = sanitized.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  res.json({
    success: true,
    data: paginated,
    meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
  });
});

// PATCH /admin/users/:id/status (Suspend or Reactivate)
router.patch('/users/:id/status', (req: AuthenticatedRequest, res: Response) => {
  try {
    const targetUser = db.users.findById(req.params.id);
    if (!targetUser) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    if (targetUser._id === req.user!._id) {
      res.status(400).json({ success: false, message: 'You cannot suspend your own administrative account.' });
      return;
    }

    const { status } = req.body;
    if (!['active', 'suspended'].includes(status)) {
      res.status(400).json({ success: false, message: 'Status must be active or suspended.' });
      return;
    }

    const updated = db.users.findByIdAndUpdate(targetUser._id, { accountStatus: status });

    db.auditLogs.create({
      actorId: req.user!._id,
      actorRole: 'admin',
      action: status === 'suspended' ? 'SUSPEND_USER' : 'REACTIVATE_USER',
      targetType: 'User',
      targetId: targetUser._id,
      safeMetadata: { email: targetUser.email, role: targetUser.role },
    });

    res.json({
      success: true,
      message: `User account has been ${status === 'suspended' ? 'suspended' : 'reactivated'}.`,
      data: sanitizeUser(updated!),
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to update user status.' });
  }
});

// GET /admin/verifications (Provider verification review queue)
router.get('/verifications', (req: AuthenticatedRequest, res: Response) => {
  const { status } = req.query;

  let profiles = db.providerProfiles.find();
  if (status && status !== 'all') {
    profiles = profiles.filter((p) => p.verificationStatus === status);
  }

  const enriched = profiles.map((p) => {
    const user = db.users.findById(p.userId);
    const docs = db.verificationDocuments.find({ providerId: p._id }).map((d) => ({
      _id: d._id,
      documentType: d.documentType,
      documentName: d.documentName,
      reviewStatus: d.reviewStatus,
      submittedAt: d.submittedAt,
    }));

    return {
      ...p,
      user: user ? sanitizeUser(user) : null,
      documents: docs,
    };
  });

  // Prioritize pending verifications first
  enriched.sort((a, b) => {
    if (a.verificationStatus === 'pending' && b.verificationStatus !== 'pending') return -1;
    if (b.verificationStatus === 'pending' && a.verificationStatus !== 'pending') return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  res.json({ success: true, data: enriched });
});

// PATCH /admin/verifications/:id (Review decision: approve, reject, or request resubmission)
router.patch('/verifications/:id', (req: AuthenticatedRequest, res: Response) => {
  try {
    const profile = db.providerProfiles.findById(req.params.id);
    if (!profile) {
      res.status(404).json({ success: false, message: 'Provider profile not found.' });
      return;
    }

    const { decision, feedback } = req.body as { decision: VerificationStatus; feedback?: string };

    if (!['approved', 'rejected', 'resubmission_required'].includes(decision)) {
      res.status(400).json({
        success: false,
        message: 'Decision must be approved, rejected, or resubmission_required.',
      });
      return;
    }

    if (decision !== 'approved' && (!feedback || !feedback.trim())) {
      res.status(400).json({
        success: false,
        message: 'Feedback is required when rejecting or requesting resubmission so the provider knows what to rectify.',
      });
      return;
    }

    const now = new Date().toISOString();
    const updates: any = {
      verificationStatus: decision,
      verificationFeedback: feedback ? feedback.trim() : undefined,
      verificationReviewedAt: now,
    };

    if (decision === 'approved') {
      updates.approvedAt = now;
      updates.verificationFeedback = undefined;
    }

    const updated = db.providerProfiles.findByIdAndUpdate(profile._id, updates);

    // Update documents review status
    const docs = db.verificationDocuments.find({ providerId: profile._id });
    for (const d of docs) {
      db.verificationDocuments.findByIdAndUpdate(d._id, {
        reviewStatus: decision === 'approved' ? 'approved' : 'rejected',
        reviewedAt: now,
        reviewedBy: req.user!._id,
        feedback: feedback ? feedback.trim() : undefined,
      });
    }

    // Notify provider
    let notifTitle = 'Provider Verification Approved!';
    let notifMsg = 'Congratulations! Your profile has been verified and approved. You can now accept service bookings.';

    if (decision === 'rejected') {
      notifTitle = 'Provider Verification Rejected';
      notifMsg = `Your verification application was rejected. Reason: ${feedback}`;
    } else if (decision === 'resubmission_required') {
      notifTitle = 'Verification Resubmission Requested';
      notifMsg = `Please update your documentation as requested: ${feedback}`;
    }

    db.notifications.create({
      userId: profile.userId,
      title: notifTitle,
      message: notifMsg,
      type: 'verification',
      relatedEntityId: profile._id,
    });

    // Audit log
    db.auditLogs.create({
      actorId: req.user!._id,
      actorRole: 'admin',
      action: `VERIFICATION_${decision.toUpperCase()}`,
      targetType: 'ProviderProfile',
      targetId: profile._id,
      safeMetadata: {
        businessName: profile.businessName,
        decision,
        feedback: feedback || null,
      },
    });

    res.json({
      success: true,
      message: `Provider verification has been ${decision.replace('_', ' ')}.`,
      data: updated,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to update verification decision.' });
  }
});

// GET /admin/bookings
router.get('/bookings', (req: AuthenticatedRequest, res: Response) => {
  const { status, search, page = '1', limit = '15' } = req.query as Record<string, string | undefined>;

  let bookings = db.bookings.find();

  if (status && status !== 'all') {
    bookings = bookings.filter((b) => b.status === status);
  }

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    bookings = bookings.filter((b) => b.bookingReference.toLowerCase().includes(q));
  }

  const enriched = bookings
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((b) => {
      const cust = db.users.findById(b.customerId);
      const prof = db.providerProfiles.findById(b.providerId);
      const srv = db.services.findById(b.serviceId);
      return {
        ...b,
        customerName: cust ? cust.name : 'Unknown',
        customerPhone: cust ? cust.phone : '',
        providerBusinessName: prof ? prof.businessName : 'Unknown',
        serviceTitle: srv ? srv.title : 'Unknown',
      };
    });

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 15);
  const total = enriched.length;
  const paginated = enriched.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  res.json({
    success: true,
    data: paginated,
    meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
  });
});

// GET /admin/reviews
router.get('/reviews', (_req: AuthenticatedRequest, res: Response) => {
  const reviews = db.reviews.find().map((r) => {
    const cust = db.users.findById(r.customerId);
    const prof = db.providerProfiles.findById(r.providerId);
    const bkg = db.bookings.findById(r.bookingId);
    return {
      ...r,
      customerName: cust ? cust.name : 'Customer',
      providerBusinessName: prof ? prof.businessName : 'Provider',
      bookingReference: bkg ? bkg.bookingReference : '',
    };
  });

  res.json({ success: true, data: reviews });
});

// PATCH /admin/reviews/:id/moderation
router.patch('/reviews/:id/moderation', (req: AuthenticatedRequest, res: Response) => {
  try {
    const review = db.reviews.findById(req.params.id);
    if (!review) {
      res.status(404).json({ success: false, message: 'Review not found.' });
      return;
    }

    const { moderationStatus } = req.body;
    if (!['approved', 'flagged', 'hidden'].includes(moderationStatus)) {
      res.status(400).json({ success: false, message: 'Invalid moderation status.' });
      return;
    }

    const updated = db.reviews.findByIdAndUpdate(review._id, { moderationStatus });
    recalculateProviderRating(review.providerId);

    db.auditLogs.create({
      actorId: req.user!._id,
      actorRole: 'admin',
      action: 'MODERATE_REVIEW',
      targetType: 'Review',
      targetId: review._id,
      safeMetadata: { oldStatus: review.moderationStatus, newStatus: moderationStatus },
    });

    res.json({
      success: true,
      message: `Review moderation status updated to ${moderationStatus}.`,
      data: updated,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to moderate review.' });
  }
});

// GET /admin/categories
router.get('/categories', (_req: AuthenticatedRequest, res: Response) => {
  const cats = db.categories.find().map((c) => ({
    ...c,
    serviceCount: db.services.count({ categoryId: c._id }),
  }));
  res.json({ success: true, data: cats });
});

// POST /admin/categories
router.post('/categories', (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, description, icon } = req.body;
    if (!name) {
      res.status(400).json({ success: false, message: 'Category name is required.' });
      return;
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newCat = db.categories.create({
      name: name.trim(),
      slug,
      description: description || '',
      icon: icon || 'Briefcase',
      active: true,
    });

    res.status(201).json({ success: true, message: 'Category added.', data: newCat });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to add category.' });
  }
});

// PATCH /admin/categories/:id
router.patch('/categories/:id', (req: AuthenticatedRequest, res: Response) => {
  try {
    const cat = db.categories.findById(req.params.id);
    if (!cat) {
      res.status(404).json({ success: false, message: 'Category not found.' });
      return;
    }

    const { name, description, icon, active } = req.body;
    const updates: any = {};
    if (name) updates.name = name.trim();
    if (description !== undefined) updates.description = description;
    if (icon) updates.icon = icon;
    if (active !== undefined) updates.active = Boolean(active);

    const updated = db.categories.findByIdAndUpdate(cat._id, updates);
    res.json({ success: true, message: 'Category updated.', data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to update category.' });
  }
});

// GET /admin/audit-logs
router.get('/audit-logs', (_req: AuthenticatedRequest, res: Response) => {
  const logs = db.auditLogs
    .find()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 50);

  const enriched = logs.map((log) => {
    const actor = db.users.findById(log.actorId);
    return {
      ...log,
      actorName: actor ? actor.name : 'System',
      actorEmail: actor ? actor.email : '',
    };
  });

  res.json({ success: true, data: enriched });
});

export default router;
