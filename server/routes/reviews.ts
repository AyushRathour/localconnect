import { Router, Request, Response } from 'express';
import { db } from '../db/store';
import { authenticate, requireRole, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Helper to recalculate provider rating
export function recalculateProviderRating(providerId: string) {
  const approvedReviews = db.reviews.find({
    providerId,
    moderationStatus: 'approved',
  });

  const count = approvedReviews.length;
  let avg = 0;
  if (count > 0) {
    const sum = approvedReviews.reduce((acc, r) => acc + r.rating, 0);
    avg = Math.round((sum / count) * 10) / 10;
  }

  db.providerProfiles.findByIdAndUpdate(providerId, {
    averageRating: avg,
    reviewCount: count,
  });
}

// POST /reviews (Customer submits review for completed booking)
router.post('/', authenticate, requireRole(['customer']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const customer = req.user!;
    const { bookingId, rating, comment } = req.body;

    if (!bookingId || !rating || !comment) {
      res.status(400).json({ success: false, message: 'Booking ID, rating, and review comment are required.' });
      return;
    }

    const ratingNum = Number(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      res.status(400).json({ success: false, message: 'Rating must be a number between 1 and 5.' });
      return;
    }

    const booking = db.bookings.findById(bookingId);
    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found.' });
      return;
    }

    // Authorization: Only the customer who placed the booking can review it
    if (booking.customerId !== customer._id) {
      res.status(403).json({ success: false, message: 'You can only review bookings placed by your account.' });
      return;
    }

    // Eligibility check: Booking must be marked 'completed'
    if (booking.status !== 'completed') {
      res.status(400).json({
        success: false,
        message: `Reviews can only be submitted after the booking is completed (current status: ${booking.status}).`,
      });
      return;
    }

    // Duplicate check: Prevent multiple reviews for the same booking
    const existing = db.reviews.findOne({ bookingId: booking._id });
    if (existing) {
      res.status(400).json({ success: false, message: 'A review has already been submitted for this completed booking.' });
      return;
    }

    const newReview = db.reviews.create({
      bookingId: booking._id,
      customerId: customer._id,
      providerId: booking.providerId,
      rating: Math.round(ratingNum),
      comment: comment.trim(),
      moderationStatus: 'approved',
    });

    // Recalculate provider profile statistics
    recalculateProviderRating(booking.providerId);

    // Notify provider
    const provProfile = db.providerProfiles.findById(booking.providerId);
    if (provProfile) {
      db.notifications.create({
        userId: provProfile.userId,
        title: `New ${ratingNum}-Star Review`,
        message: `${customer.name} reviewed your service: "${comment.trim().slice(0, 80)}..."`,
        type: 'review',
        relatedEntityId: newReview._id,
      });
    }

    // Audit log
    db.auditLogs.create({
      actorId: customer._id,
      actorRole: 'customer',
      action: 'SUBMIT_REVIEW',
      targetType: 'Review',
      targetId: newReview._id,
      safeMetadata: { rating: ratingNum, bookingId: booking._id },
    });

    res.status(201).json({
      success: true,
      message: 'Thank you! Your review has been recorded.',
      data: newReview,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to record review.' });
  }
});

// GET /reviews/provider/:id (Public list of provider reviews)
router.get('/provider/:id', (req: Request, res: Response) => {
  const reviews = db.reviews.find({
    providerId: req.params.id,
    moderationStatus: 'approved',
  });

  const enriched = reviews
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((r) => {
      const cust = db.users.findById(r.customerId);
      const bkg = db.bookings.findById(r.bookingId);
      const srv = bkg ? db.services.findById(bkg.serviceId) : null;
      return {
        ...r,
        customerName: cust ? cust.name : 'Verified Customer',
        serviceTitle: srv ? srv.title : 'Service',
      };
    });

  res.json({ success: true, data: enriched });
});

// PATCH /reviews/:id (Customer edits their own review)
router.patch('/:id', authenticate, requireRole(['customer']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const review = db.reviews.findById(req.params.id);
    if (!review) {
      res.status(404).json({ success: false, message: 'Review not found.' });
      return;
    }

    if (review.customerId !== req.user!._id) {
      res.status(403).json({ success: false, message: 'Unauthorized to edit this review.' });
      return;
    }

    const { rating, comment } = req.body;
    const updates: any = {};
    if (rating !== undefined) {
      const r = Number(rating);
      if (r >= 1 && r <= 5) updates.rating = Math.round(r);
    }
    if (comment !== undefined) {
      updates.comment = comment.trim();
    }

    const updated = db.reviews.findByIdAndUpdate(review._id, updates);
    recalculateProviderRating(review.providerId);

    res.json({ success: true, message: 'Review updated successfully.', data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to update review.' });
  }
});

// DELETE /reviews/:id (Customer deletes review)
router.delete('/:id', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const review = db.reviews.findById(req.params.id);
    if (!review) {
      res.status(404).json({ success: false, message: 'Review not found.' });
      return;
    }

    const isOwner = review.customerId === req.user!._id;
    const isAdmin = req.user!.role === 'admin';

    if (!isOwner && !isAdmin) {
      res.status(403).json({ success: false, message: 'Unauthorized to delete this review.' });
      return;
    }

    db.reviews.findByIdAndDelete(review._id);
    recalculateProviderRating(review.providerId);

    res.json({ success: true, message: 'Review deleted successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to delete review.' });
  }
});

export default router;
