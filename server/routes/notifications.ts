import { Router, Response } from 'express';
import { db } from '../db/store';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /notifications
router.get('/', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const notifications = db.notifications
    .find({ userId: user._id })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  res.json({
    success: true,
    data: notifications,
    unreadCount,
  });
});

// PATCH /notifications/:id/read
router.patch('/:id/read', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const notif = db.notifications.findById(req.params.id);

  if (!notif || notif.userId !== user._id) {
    res.status(404).json({ success: false, message: 'Notification not found.' });
    return;
  }

  const updated = db.notifications.findByIdAndUpdate(notif._id, {
    readAt: new Date().toISOString(),
  });

  res.json({ success: true, data: updated });
});

// PATCH /notifications/read-all
router.patch('/read-all', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const unread = db.notifications.find((n) => n.userId === user._id && !n.readAt);
  const now = new Date().toISOString();

  for (const n of unread) {
    db.notifications.findByIdAndUpdate(n._id, { readAt: now });
  }

  res.json({ success: true, message: 'All notifications marked as read.' });
});

export default router;
