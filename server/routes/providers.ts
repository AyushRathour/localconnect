import { Router, Request, Response } from 'express';
import { db } from '../db/store';
import { authenticate, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { sanitizeUser } from './auth';

const router = Router();

// GET /providers (Public provider directory)
router.get('/', (req: Request, res: Response) => {
  const { area, verifiedOnly = 'true', search, page = '1', limit = '12' } = req.query as Record<string, string | undefined>;

  let profiles = db.providerProfiles.find({ active: true });

  if (verifiedOnly === 'true') {
    profiles = profiles.filter((p) => p.verificationStatus === 'approved');
  }

  if (area && area.trim()) {
    const a = area.trim().toLowerCase();
    profiles = profiles.filter((p) => p.serviceAreas.some((sa) => sa.toLowerCase().includes(a)));
  }

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    profiles = profiles.filter((p) => {
      const user = db.users.findById(p.userId);
      const nameMatch = user?.name.toLowerCase().includes(q);
      const bizMatch = p.businessName.toLowerCase().includes(q);
      const skillMatch = p.skills.some((s) => s.toLowerCase().includes(q));
      return nameMatch || bizMatch || skillMatch;
    });
  }

  const enriched = profiles.map((p) => {
    const user = db.users.findById(p.userId);
    const services = db.services.find({ providerId: p._id, active: true });
    return {
      ...p,
      user: user ? sanitizeUser(user) : null,
      serviceCount: services.length,
      sampleServices: services.slice(0, 3).map((s) => ({ _id: s._id, title: s.title, price: s.price, pricingType: s.pricingType })),
    };
  });

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 12);
  const total = enriched.length;
  const paginated = enriched.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  res.json({
    success: true,
    data: paginated,
    meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
  });
});

// GET /providers/:id (Public provider profile)
router.get('/:id', (req: Request, res: Response) => {
  const profile = db.providerProfiles.findById(req.params.id);
  if (!profile) {
    res.status(404).json({ success: false, message: 'Provider profile not found.' });
    return;
  }

  const user = db.users.findById(profile.userId);
  const services = db.services.find({ providerId: profile._id, active: true });
  const availability = db.availabilities.find({ providerId: profile._id });
  const reviews = db.reviews.find({ providerId: profile._id, moderationStatus: 'approved' });

  const enrichedReviews = reviews.map((r) => {
    const cust = db.users.findById(r.customerId);
    return {
      ...r,
      customerName: cust ? cust.name : 'Customer',
    };
  });

  res.json({
    success: true,
    data: {
      ...profile,
      user: user ? sanitizeUser(user) : null,
      services,
      availability,
      reviews: enrichedReviews,
    },
  });
});

// GET /provider/profile (Current provider's profile)
router.get('/account/profile', authenticate, requireRole(['provider']), (req: AuthenticatedRequest, res: Response) => {
  const profile = db.providerProfiles.findOne({ userId: req.user!._id });
  if (!profile) {
    res.status(404).json({ success: false, message: 'Provider profile not found.' });
    return;
  }

  const availability = db.availabilities.find({ providerId: profile._id });
  res.json({
    success: true,
    data: {
      ...profile,
      user: sanitizeUser(req.user!),
      availability,
    },
  });
});

// PATCH /provider/profile (Update business profile)
router.patch('/account/profile', authenticate, requireRole(['provider']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const profile = db.providerProfiles.findOne({ userId: req.user!._id });
    if (!profile) {
      res.status(404).json({ success: false, message: 'Provider profile not found.' });
      return;
    }

    const { businessName, description, skills, experienceYears, serviceAreas, phone, name } = req.body;

    // Update user info if provided
    if (phone || name) {
      const userUpdates: any = {};
      if (phone) userUpdates.phone = phone.trim();
      if (name) userUpdates.name = name.trim();
      db.users.findByIdAndUpdate(req.user!._id, userUpdates);
    }

    const profileUpdates: any = {};
    if (businessName !== undefined) profileUpdates.businessName = businessName.trim();
    if (description !== undefined) profileUpdates.description = description.trim();
    if (skills !== undefined) profileUpdates.skills = Array.isArray(skills) ? skills : [];
    if (experienceYears !== undefined) profileUpdates.experienceYears = Number(experienceYears) || 0;
    if (serviceAreas !== undefined) profileUpdates.serviceAreas = Array.isArray(serviceAreas) ? serviceAreas : [];

    const updated = db.providerProfiles.findByIdAndUpdate(profile._id, profileUpdates);

    res.json({
      success: true,
      message: 'Provider profile updated successfully.',
      data: updated,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
});

// POST /provider/verification (Submit verification documents & details)
router.post('/verification', authenticate, requireRole(['provider']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const profile = db.providerProfiles.findOne({ userId: req.user!._id });
    if (!profile) {
      res.status(404).json({ success: false, message: 'Provider profile not found.' });
      return;
    }

    const { documents, businessRegistrationNumber, yearsInPractice, notes } = req.body;

    // Verify existing status - allow submission if not_submitted, rejected, or resubmission_required
    if (profile.verificationStatus === 'pending') {
      res.status(400).json({ success: false, message: 'Your verification submission is already currently under review.' });
      return;
    }

    if (profile.verificationStatus === 'approved') {
      res.status(400).json({ success: false, message: 'Your provider profile is already verified and approved.' });
      return;
    }

    // Process documents submitted
    const docList = Array.isArray(documents) && documents.length > 0 ? documents : [
      { documentType: 'id_proof', documentName: 'Government_Photo_ID.pdf' },
      { documentType: 'trade_license', documentName: 'Trade_License_or_Certificate.pdf' },
    ];

    for (const doc of docList) {
      db.verificationDocuments.create({
        providerId: profile._id,
        documentType: doc.documentType || 'id_proof',
        documentName: doc.documentName || 'Verification_Doc.pdf',
        secureStorageKey: `secure_vault/${profile._id}_${Date.now()}_${doc.documentType}.enc`,
        reviewStatus: 'pending',
        submittedAt: new Date().toISOString(),
      });
    }

    // Update status to pending
    const now = new Date().toISOString();
    const updated = db.providerProfiles.findByIdAndUpdate(profile._id, {
      verificationStatus: 'pending',
      verificationSubmittedAt: now,
      verificationFeedback: undefined,
    });

    // Notify provider
    db.notifications.create({
      userId: req.user!._id,
      title: 'Verification Request Submitted',
      message: 'Your verification submission has been received and queued for administrator review. You will be notified once reviewed.',
      type: 'verification',
      relatedEntityId: profile._id,
    });

    // Notify administrators
    const admins = db.users.find({ role: 'admin' });
    for (const admin of admins) {
      db.notifications.create({
        userId: admin._id,
        title: 'New Provider Verification Submission',
        message: `${profile.businessName} (${req.user!.name}) submitted documents for verification.`,
        type: 'verification',
        relatedEntityId: profile._id,
      });
    }

    // Log audit event
    db.auditLogs.create({
      actorId: req.user!._id,
      actorRole: 'provider',
      action: 'SUBMIT_VERIFICATION',
      targetType: 'ProviderProfile',
      targetId: profile._id,
      safeMetadata: { businessName: profile.businessName, docCount: docList.length },
    });

    res.json({
      success: true,
      message: 'Verification request submitted successfully. It will be reviewed by an administrator.',
      data: updated,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to submit verification.' });
  }
});

// GET /provider/verification (Get current verification status and history)
router.get('/verification/status', authenticate, requireRole(['provider']), (req: AuthenticatedRequest, res: Response) => {
  const profile = db.providerProfiles.findOne({ userId: req.user!._id });
  if (!profile) {
    res.status(404).json({ success: false, message: 'Provider profile not found.' });
    return;
  }

  // Documents list - safe fields only (never expose secureStorageKey)
  const docs = db.verificationDocuments.find({ providerId: profile._id }).map((d) => ({
    _id: d._id,
    documentType: d.documentType,
    documentName: d.documentName,
    reviewStatus: d.reviewStatus,
    submittedAt: d.submittedAt,
    reviewedAt: d.reviewedAt,
    feedback: d.feedback,
  }));

  res.json({
    success: true,
    data: {
      status: profile.verificationStatus,
      feedback: profile.verificationFeedback,
      submittedAt: profile.verificationSubmittedAt,
      reviewedAt: profile.verificationReviewedAt,
      approvedAt: profile.approvedAt,
      documents: docs,
    },
  });
});

// PATCH /provider/availability (Update weekly working slots)
router.patch('/availability', authenticate, requireRole(['provider']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const profile = db.providerProfiles.findOne({ userId: req.user!._id });
    if (!profile) {
      res.status(404).json({ success: false, message: 'Provider profile not found.' });
      return;
    }

    const { daysOfWeek, startTime, endTime, availabilityStatus } = req.body;

    let avail = db.availabilities.findOne({ providerId: profile._id });
    if (avail) {
      avail = db.availabilities.findByIdAndUpdate(avail._id, {
        daysOfWeek: Array.isArray(daysOfWeek) ? daysOfWeek : avail.daysOfWeek,
        startTime: startTime || avail.startTime,
        endTime: endTime || avail.endTime,
        availabilityStatus: availabilityStatus || avail.availabilityStatus,
      });
    } else {
      avail = db.availabilities.create({
        providerId: profile._id,
        daysOfWeek: Array.isArray(daysOfWeek) ? daysOfWeek : [1, 2, 3, 4, 5, 6],
        startTime: startTime || '09:00',
        endTime: endTime || '18:00',
        availabilityStatus: availabilityStatus || 'active',
      });
    }

    res.json({
      success: true,
      message: 'Availability schedule updated successfully.',
      data: avail,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to update availability.' });
  }
});

// GET /provider/dashboard (Provider metrics & overview)
router.get('/dashboard/stats', authenticate, requireRole(['provider']), (req: AuthenticatedRequest, res: Response) => {
  const profile = db.providerProfiles.findOne({ userId: req.user!._id });
  if (!profile) {
    res.status(404).json({ success: false, message: 'Provider profile not found.' });
    return;
  }

  const allBookings = db.bookings.find({ providerId: profile._id });
  const pendingRequests = allBookings.filter((b) => b.status === 'pending');
  const upcomingAppointments = allBookings.filter((b) => b.status === 'accepted' || b.status === 'confirmed');
  const inProgress = allBookings.filter((b) => b.status === 'in_progress');
  const completedServices = allBookings.filter((b) => b.status === 'completed');
  const cancelledServices = allBookings.filter((b) => b.status === 'cancelled' || b.status === 'rejected');

  const services = db.services.find({ providerId: profile._id, active: true });
  const reviews = db.reviews.find({ providerId: profile._id, moderationStatus: 'approved' });

  // Total revenue earned from completed jobs
  const totalRevenue = completedServices.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  // Recent 5 bookings
  const recentBookings = [...allBookings]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map((b) => {
      const cust = db.users.findById(b.customerId);
      const srv = db.services.findById(b.serviceId);
      return {
        ...b,
        customerName: cust ? cust.name : 'Customer',
        customerPhone: cust ? cust.phone : '',
        serviceTitle: srv ? srv.title : 'Service',
      };
    });

  res.json({
    success: true,
    data: {
      profile,
      verificationStatus: profile.verificationStatus,
      totalRequests: allBookings.length,
      pendingCount: pendingRequests.length,
      upcomingCount: upcomingAppointments.length,
      inProgressCount: inProgress.length,
      completedCount: completedServices.length,
      cancelledCount: cancelledServices.length,
      activeServicesCount: services.length,
      averageRating: profile.averageRating,
      reviewCount: reviews.length,
      totalRevenue,
      recentBookings,
    },
  });
});

export default router;
