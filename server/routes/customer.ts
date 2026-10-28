import { Router, Response } from 'express';
import { db } from '../db/store';
import { authenticate, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { sanitizeUser } from './auth';

const router = Router();

// GET /customer/profile
router.get('/profile', authenticate, requireRole(['customer']), (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const addresses = db.addresses.find({ userId: user._id });
  const bookingsCount = db.bookings.count({ customerId: user._id });

  res.json({
    success: true,
    data: {
      ...sanitizeUser(user),
      addresses,
      totalBookings: bookingsCount,
    },
  });
});

// PATCH /customer/profile
router.patch('/profile', authenticate, requireRole(['customer']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const { name, phone } = req.body;

    const updates: any = {};
    if (name) updates.name = name.trim();
    if (phone) updates.phone = phone.trim();

    const updated = db.users.findByIdAndUpdate(user._id, updates);

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      data: sanitizeUser(updated!),
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to update customer profile.' });
  }
});

// GET /customer/addresses
router.get('/addresses', authenticate, requireRole(['customer']), (req: AuthenticatedRequest, res: Response) => {
  const addresses = db.addresses.find({ userId: req.user!._id });
  res.json({ success: true, data: addresses });
});

// POST /customer/addresses
router.post('/addresses', authenticate, requireRole(['customer']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const { label, addressLine, area, city, state, postalCode, isDefault } = req.body;

    if (!addressLine || !area) {
      res.status(400).json({ success: false, message: 'Address line and area are required.' });
      return;
    }

    if (isDefault) {
      // Clear other default addresses
      const userAddrs = db.addresses.find({ userId: user._id });
      for (const a of userAddrs) {
        if (a.isDefault) {
          db.addresses.findByIdAndUpdate(a._id, { isDefault: false });
        }
      }
    }

    const newAddr = db.addresses.create({
      userId: user._id,
      label: label || 'Home',
      addressLine: addressLine.trim(),
      area: area.trim(),
      city: city || 'Bengaluru',
      state: state || 'Karnataka',
      postalCode: postalCode || '560001',
      isDefault: Boolean(isDefault),
    });

    res.status(201).json({
      success: true,
      message: 'Address saved successfully.',
      data: newAddr,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to save address.' });
  }
});

// PATCH /customer/addresses/:id
router.patch('/addresses/:id', authenticate, requireRole(['customer']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const addr = db.addresses.findById(req.params.id);

    if (!addr || addr.userId !== user._id) {
      res.status(404).json({ success: false, message: 'Address not found.' });
      return;
    }

    const { label, addressLine, area, city, state, postalCode, isDefault } = req.body;

    if (isDefault) {
      const userAddrs = db.addresses.find({ userId: user._id });
      for (const a of userAddrs) {
        if (a._id !== addr._id && a.isDefault) {
          db.addresses.findByIdAndUpdate(a._id, { isDefault: false });
        }
      }
    }

    const updates: any = {};
    if (label !== undefined) updates.label = label;
    if (addressLine !== undefined) updates.addressLine = addressLine.trim();
    if (area !== undefined) updates.area = area.trim();
    if (city !== undefined) updates.city = city.trim();
    if (state !== undefined) updates.state = state.trim();
    if (postalCode !== undefined) updates.postalCode = postalCode.trim();
    if (isDefault !== undefined) updates.isDefault = Boolean(isDefault);

    const updated = db.addresses.findByIdAndUpdate(addr._id, updates);

    res.json({
      success: true,
      message: 'Address updated successfully.',
      data: updated,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to update address.' });
  }
});

// DELETE /customer/addresses/:id
router.delete('/addresses/:id', authenticate, requireRole(['customer']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const addr = db.addresses.findById(req.params.id);

    if (!addr || addr.userId !== user._id) {
      res.status(404).json({ success: false, message: 'Address not found.' });
      return;
    }

    db.addresses.findByIdAndDelete(addr._id);
    res.json({ success: true, message: 'Address removed successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to remove address.' });
  }
});

// GET /customer/dashboard/stats
router.get('/dashboard/stats', authenticate, requireRole(['customer']), (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const bookings = db.bookings.find({ customerId: user._id });

  const pending = bookings.filter((b) => b.status === 'pending');
  const active = bookings.filter((b) => ['accepted', 'confirmed', 'in_progress'].includes(b.status));
  const completed = bookings.filter((b) => b.status === 'completed');
  const cancelled = bookings.filter((b) => ['cancelled', 'rejected'].includes(b.status));

  const recent = [...bookings]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map((b) => {
      const srv = db.services.findById(b.serviceId);
      const prof = db.providerProfiles.findById(b.providerId);
      return {
        ...b,
        serviceTitle: srv?.title || 'Service',
        businessName: prof?.businessName || 'Provider',
      };
    });

  const notifications = db.notifications
    .find({ userId: user._id })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  res.json({
    success: true,
    data: {
      totalBookings: bookings.length,
      pendingCount: pending.length,
      activeCount: active.length,
      completedCount: completed.length,
      cancelledCount: cancelled.length,
      recentBookings: recent,
      recentNotifications: notifications,
    },
  });
});

export default router;
