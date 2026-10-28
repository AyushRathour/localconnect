import { Router, type Response } from 'express';
import crypto from 'crypto';
import { db } from '../db/store.ts';
import { authenticate, requireRole, type AuthenticatedRequest } from '../middleware/auth.ts';
import type { BookingStatus, IBookingStatusHistory } from '../db/types.ts';

const router = Router();

// POST /bookings (Customer creates a booking)
router.post('/', authenticate, requireRole(['customer']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const customer = req.user!;
    const { serviceId, providerId, addressId, customAddress, requestedDate, startTime, customerNotes } = req.body;

    if (!serviceId || !providerId || !requestedDate || !startTime) {
      res.status(400).json({
        success: false,
        message: 'Service, provider, requested date, and time slot are required.',
      });
      return;
    }

    // Verify service exists and is active
    const service = db.services.findById(serviceId);
    if (!service || !service.active) {
      res.status(404).json({ success: false, message: 'Selected service is no longer active or available.' });
      return;
    }

    // Verify provider relationship
    if (service.providerId !== providerId) {
      res.status(400).json({ success: false, message: 'Invalid service-provider association.' });
      return;
    }

    // Verify provider is approved and active
    const providerProfile = db.providerProfiles.findById(providerId);
    if (!providerProfile || !providerProfile.active) {
      res.status(404).json({ success: false, message: 'Provider profile not found.' });
      return;
    }

    if (providerProfile.verificationStatus !== 'approved') {
      res.status(400).json({
        success: false,
        message: 'This service provider is not currently approved for receiving bookings.',
      });
      return;
    }

    // Determine address snapshot
    let addressSnapshot: any = null;
    if (addressId) {
      const savedAddr = db.addresses.findById(addressId);
      if (savedAddr && savedAddr.userId === customer._id) {
        addressSnapshot = {
          label: savedAddr.label,
          addressLine: savedAddr.addressLine,
          area: savedAddr.area,
          city: savedAddr.city,
          state: savedAddr.state,
          postalCode: savedAddr.postalCode,
        };
      }
    }

    if (!addressSnapshot && customAddress) {
      addressSnapshot = {
        label: customAddress.label || 'Home',
        addressLine: customAddress.addressLine || '',
        area: customAddress.area || '',
        city: customAddress.city || 'Bengaluru',
        state: customAddress.state || 'Karnataka',
        postalCode: customAddress.postalCode || '',
      };
    }

    if (!addressSnapshot || !addressSnapshot.addressLine || !addressSnapshot.area) {
      res.status(400).json({ success: false, message: 'A valid service address with street and area is required.' });
      return;
    }

    // Double-booking check: prevent duplicate active bookings for the provider at the same date and time
    const existingConflict = db.bookings.findOne(
      (b) =>
        b.providerId === providerId &&
        b.requestedDate === requestedDate &&
        b.startTime === startTime &&
        ['pending', 'accepted', 'confirmed', 'in_progress'].includes(b.status)
    );

    if (existingConflict) {
      res.status(409).json({
        success: false,
        message: 'This provider is already booked for this time slot. Please choose another date or time.',
      });
      return;
    }

    // Calculate duration & end time
    const [startH, startM] = startTime.split(':').map(Number);
    const endH = (startH + 1) % 24;
    const endTime = `${String(endH).padStart(2, '0')}:${String(startM).padStart(2, '0')}`;

    // Generate unique booking reference
    const randomSuffix = crypto.randomInt(1000, 9999);
    const bookingReference = `LC-${new Date().getFullYear()}-${randomSuffix}`;

    const now = new Date().toISOString();
    const initialHistory: IBookingStatusHistory = {
      status: 'pending',
      changedBy: customer._id,
      note: 'Booking request created by customer.',
      timestamp: now,
    };

    // Trusted price calculated from database record
    const price = service.price;
    const totalAmount = price; // No hidden fees

    const newBooking = db.bookings.create({
      bookingReference,
      customerId: customer._id,
      providerId: providerProfile._id,
      serviceId: service._id,
      addressSnapshot,
      requestedDate,
      startTime,
      endTime,
      servicePriceSnapshot: price,
      pricingTypeSnapshot: service.pricingType,
      additionalCharges: 0,
      totalAmount,
      customerNotes: customerNotes ? customerNotes.trim() : '',
      status: 'pending',
      statusHistory: [initialHistory],
    });

    // Notify provider
    db.notifications.create({
      userId: providerProfile.userId,
      title: 'New Service Booking Request',
      message: `${customer.name} requested "${service.title}" on ${requestedDate} at ${startTime}.`,
      type: 'booking',
      relatedEntityId: newBooking._id,
    });

    // Notify customer
    db.notifications.create({
      userId: customer._id,
      title: 'Booking Request Submitted',
      message: `Your booking ${bookingReference} for "${service.title}" has been submitted to ${providerProfile.businessName}.`,
      type: 'booking',
      relatedEntityId: newBooking._id,
    });

    // Audit log
    db.auditLogs.create({
      actorId: customer._id,
      actorRole: 'customer',
      action: 'CREATE_BOOKING',
      targetType: 'Booking',
      targetId: newBooking._id,
      safeMetadata: { reference: bookingReference, amount: totalAmount },
    });

    res.status(201).json({
      success: true,
      message: 'Booking request submitted successfully.',
      data: newBooking,
    });
  } catch (err: any) {
    console.error('Create booking error:', err);
    res.status(500).json({ success: false, message: 'Failed to create booking.' });
  }
});

// GET /bookings/my (Customer views their bookings)
router.get('/my', authenticate, requireRole(['customer']), (req: AuthenticatedRequest, res: Response) => {
  const customer = req.user!;
  const bookings = db.bookings.find({ customerId: customer._id });

  const enriched = bookings
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((b) => {
      const srv = db.services.findById(b.serviceId);
      const prof = db.providerProfiles.findById(b.providerId);
      const pUser = prof ? db.users.findById(prof.userId) : null;
      const review = db.reviews.findOne({ bookingId: b._id });

      return {
        ...b,
        service: srv || null,
        provider: prof
          ? {
              ...prof,
              contactName: pUser?.name,
              contactPhone: pUser?.phone,
            }
          : null,
        review: review || null,
      };
    });

  res.json({ success: true, data: enriched });
});

// GET /bookings/provider (Provider views incoming and past bookings)
router.get('/provider', authenticate, requireRole(['provider']), (req: AuthenticatedRequest, res: Response) => {
  const prof = db.providerProfiles.findOne({ userId: req.user!._id });
  if (!prof) {
    res.status(404).json({ success: false, message: 'Provider profile not found.' });
    return;
  }

  const { status } = req.query;
  let bookings = db.bookings.find({ providerId: prof._id });

  if (status && typeof status === 'string' && status !== 'all') {
    bookings = bookings.filter((b) => b.status === status);
  }

  const enriched = bookings
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((b) => {
      const customer = db.users.findById(b.customerId);
      const srv = db.services.findById(b.serviceId);
      const review = db.reviews.findOne({ bookingId: b._id });

      return {
        ...b,
        customer: customer
          ? {
              _id: customer._id,
              name: customer.name,
              phone: customer.phone,
              email: customer.email,
            }
          : null,
        service: srv || null,
        review: review || null,
      };
    });

  res.json({ success: true, data: enriched });
});

// GET /bookings/:id (Detailed booking view)
router.get('/:id', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const booking = db.bookings.findById(req.params.id);

  if (!booking) {
    res.status(404).json({ success: false, message: 'Booking not found.' });
    return;
  }

  // Access check: Customer, Assigned Provider, or Admin
  let isAuthorized = false;
  if (user.role === 'admin') isAuthorized = true;
  if (booking.customerId === user._id) isAuthorized = true;
  if (user.role === 'provider') {
    const prof = db.providerProfiles.findOne({ userId: user._id });
    if (prof && prof._id === booking.providerId) isAuthorized = true;
  }

  if (!isAuthorized) {
    res.status(403).json({ success: false, message: 'Unauthorized to view this booking.' });
    return;
  }

  const customer = db.users.findById(booking.customerId);
  const providerProfile = db.providerProfiles.findById(booking.providerId);
  const providerUser = providerProfile ? db.users.findById(providerProfile.userId) : null;
  const service = db.services.findById(booking.serviceId);
  const review = db.reviews.findOne({ bookingId: booking._id });

  res.json({
    success: true,
    data: {
      ...booking,
      customer: customer
        ? {
            _id: customer._id,
            name: customer.name,
            phone: customer.phone,
            email: customer.email,
          }
        : null,
      provider: providerProfile
        ? {
            ...providerProfile,
            contactName: providerUser?.name,
            contactPhone: providerUser?.phone,
            contactEmail: providerUser?.email,
          }
        : null,
      service,
      review,
    },
  });
});

// PATCH /bookings/:id/cancel (Customer or Provider cancels a booking)
router.patch('/:id/cancel', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const booking = db.bookings.findById(req.params.id);

    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found.' });
      return;
    }

    const { cancellationReason } = req.body;

    // Check ownership
    const isCustomer = booking.customerId === user._id;
    let isProvider = false;
    if (user.role === 'provider') {
      const prof = db.providerProfiles.findOne({ userId: user._id });
      if (prof && prof._id === booking.providerId) isProvider = true;
    }
    const isAdmin = user.role === 'admin';

    if (!isCustomer && !isProvider && !isAdmin) {
      res.status(403).json({ success: false, message: 'You are not authorized to cancel this booking.' });
      return;
    }

    // Cancellation policy: Cannot cancel completed, rejected, or already cancelled bookings
    if (['completed', 'cancelled', 'rejected'].includes(booking.status)) {
      res.status(400).json({
        success: false,
        message: `Cannot cancel a booking that is already marked as ${booking.status}.`,
      });
      return;
    }

    if (booking.status === 'in_progress' && isCustomer) {
      res.status(400).json({
        success: false,
        message: 'The technician is currently on-site and in-progress. Please contact the provider directly.',
      });
      return;
    }

    const reason = cancellationReason || (isCustomer ? 'Cancelled by customer' : 'Cancelled by service provider');

    const newHistory: IBookingStatusHistory = {
      status: 'cancelled',
      changedBy: user._id,
      note: reason,
      timestamp: new Date().toISOString(),
    };

    const updated = db.bookings.findByIdAndUpdate(booking._id, {
      status: 'cancelled',
      cancellationReason: reason,
      statusHistory: [...booking.statusHistory, newHistory],
    });

    // Notify the other party
    const targetUserId = isCustomer
      ? db.providerProfiles.findById(booking.providerId)?.userId
      : booking.customerId;

    if (targetUserId) {
      db.notifications.create({
        userId: targetUserId,
        title: `Booking ${booking.bookingReference} Cancelled`,
        message: `Booking has been cancelled. Reason: ${reason}`,
        type: 'booking',
        relatedEntityId: booking._id,
      });
    }

    // Audit log
    db.auditLogs.create({
      actorId: user._id,
      actorRole: user.role,
      action: 'CANCEL_BOOKING',
      targetType: 'Booking',
      targetId: booking._id,
      safeMetadata: { reference: booking.bookingReference, reason },
    });

    res.json({
      success: true,
      message: 'Booking cancelled successfully.',
      data: updated,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to cancel booking.' });
  }
});

// PATCH /bookings/provider/:id/accept (Provider accepts pending booking)
router.patch('/provider/:id/accept', authenticate, requireRole(['provider']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const prof = db.providerProfiles.findOne({ userId: req.user!._id });
    if (!prof) {
      res.status(404).json({ success: false, message: 'Provider profile not found.' });
      return;
    }

    const booking = db.bookings.findById(req.params.id);
    if (!booking || booking.providerId !== prof._id) {
      res.status(404).json({ success: false, message: 'Booking not found or not assigned to you.' });
      return;
    }

    if (booking.status !== 'pending') {
      res.status(400).json({ success: false, message: `Only pending bookings can be accepted (current: ${booking.status}).` });
      return;
    }

    const newHistory: IBookingStatusHistory = {
      status: 'accepted',
      changedBy: req.user!._id,
      note: 'Provider accepted the service request.',
      timestamp: new Date().toISOString(),
    };

    const updated = db.bookings.findByIdAndUpdate(booking._id, {
      status: 'accepted',
      statusHistory: [...booking.statusHistory, newHistory],
    });

    // Notify customer
    db.notifications.create({
      userId: booking.customerId,
      title: `Booking Accepted!`,
      message: `${prof.businessName} has accepted your booking ${booking.bookingReference} for ${booking.requestedDate} at ${booking.startTime}.`,
      type: 'booking',
      relatedEntityId: booking._id,
    });

    res.json({ success: true, message: 'Booking accepted.', data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to accept booking.' });
  }
});

// PATCH /bookings/provider/:id/reject (Provider rejects pending booking)
router.patch('/provider/:id/reject', authenticate, requireRole(['provider']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const prof = db.providerProfiles.findOne({ userId: req.user!._id });
    if (!prof) {
      res.status(404).json({ success: false, message: 'Provider profile not found.' });
      return;
    }

    const booking = db.bookings.findById(req.params.id);
    if (!booking || booking.providerId !== prof._id) {
      res.status(404).json({ success: false, message: 'Booking not found.' });
      return;
    }

    if (booking.status !== 'pending') {
      res.status(400).json({ success: false, message: 'Only pending bookings can be rejected.' });
      return;
    }

    const { reason } = req.body;
    const rejectReason = reason || 'Provider is unavailable at the requested schedule.';

    const newHistory: IBookingStatusHistory = {
      status: 'rejected',
      changedBy: req.user!._id,
      note: rejectReason,
      timestamp: new Date().toISOString(),
    };

    const updated = db.bookings.findByIdAndUpdate(booking._id, {
      status: 'rejected',
      cancellationReason: rejectReason,
      statusHistory: [...booking.statusHistory, newHistory],
    });

    db.notifications.create({
      userId: booking.customerId,
      title: `Booking Request Declined`,
      message: `${prof.businessName} was unable to accept booking ${booking.bookingReference}. Reason: ${rejectReason}`,
      type: 'booking',
      relatedEntityId: booking._id,
    });

    res.json({ success: true, message: 'Booking rejected.', data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to reject booking.' });
  }
});

// PATCH /bookings/provider/:id/status (Provider updates progress state)
router.patch('/provider/:id/status', authenticate, requireRole(['provider']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const prof = db.providerProfiles.findOne({ userId: req.user!._id });
    if (!prof) {
      res.status(404).json({ success: false, message: 'Provider profile not found.' });
      return;
    }

    const booking = db.bookings.findById(req.params.id);
    if (!booking || booking.providerId !== prof._id) {
      res.status(404).json({ success: false, message: 'Booking not found.' });
      return;
    }

    const { newStatus, note } = req.body as { newStatus: BookingStatus; note?: string };

    // Validate state machine transitions
    const validTransitions: Record<BookingStatus, BookingStatus[]> = {
      pending: ['accepted', 'rejected', 'cancelled'],
      accepted: ['confirmed', 'in_progress', 'cancelled'],
      confirmed: ['in_progress', 'cancelled'],
      in_progress: ['completed', 'cancelled'],
      completed: [],
      rejected: [],
      cancelled: [],
    };

    if (!validTransitions[booking.status]?.includes(newStatus)) {
      res.status(400).json({
        success: false,
        message: `Invalid status transition from ${booking.status} to ${newStatus}.`,
      });
      return;
    }

    const newHistory: IBookingStatusHistory = {
      status: newStatus,
      changedBy: req.user!._id,
      note: note || `Status updated to ${newStatus}.`,
      timestamp: new Date().toISOString(),
    };

    const updated = db.bookings.findByIdAndUpdate(booking._id, {
      status: newStatus,
      statusHistory: [...booking.statusHistory, newHistory],
    });

    // Notify customer
    let notifyMessage = `Booking ${booking.bookingReference} status changed to ${newStatus}.`;
    if (newStatus === 'in_progress') {
      notifyMessage = `The technician has arrived and commenced work for booking ${booking.bookingReference}.`;
    } else if (newStatus === 'completed') {
      notifyMessage = `Your service for booking ${booking.bookingReference} has been completed! Please rate and review your experience.`;
    }

    db.notifications.create({
      userId: booking.customerId,
      title: `Service Status: ${newStatus.toUpperCase()}`,
      message: notifyMessage,
      type: 'booking',
      relatedEntityId: booking._id,
    });

    res.json({
      success: true,
      message: `Booking status updated to ${newStatus}.`,
      data: updated,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to update booking status.' });
  }
});

export default router;
