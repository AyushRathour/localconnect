import { Router, Request, Response } from 'express';
import { db } from '../db/store';

const router = Router();

// POST /contact (Submit contact message)
router.post('/', (req: Request, res: Response) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      res.status(400).json({ success: false, message: 'Name, email, and message are required.' });
      return;
    }

    const contact = db.contactMessages.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: (subject || 'General Inquiry').trim(),
      message: message.trim(),
      status: 'new',
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for reaching out! Our support team will get back to you shortly.',
      data: { id: contact._id },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to submit contact message.' });
  }
});

export default router;
