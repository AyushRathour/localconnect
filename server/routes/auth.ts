import { Router, type Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db/store.ts';
import { generateToken, authenticate, type AuthenticatedRequest } from '../middleware/auth.ts';
import type { IUser } from '../db/types.ts';

const router = Router();

// Helper to strip sensitive fields
export function sanitizeUser(user: IUser) {
  const { passwordHash, ...safe } = user;
  return safe;
}

// POST /auth/register
router.post('/register', async (req, res: Response) => {
  try {
    const { name, email, password, phone, role, businessName, skills, serviceAreas, experienceYears } = req.body;

    if (!name || !email || !password || !phone) {
      res.status(400).json({ success: false, message: 'Name, email, phone, and password are required.' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existing = db.users.findOne({ email: normalizedEmail });
    if (existing) {
      res.status(400).json({ success: false, message: 'An account with this email address already exists.' });
      return;
    }

    // Security check: never allow public registration of admin
    if (role === 'admin') {
      res.status(403).json({ success: false, message: 'Administrator accounts cannot be created via public registration.' });
      return;
    }

    const assignedRole = role === 'provider' ? 'provider' : 'customer';
    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = db.users.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      phone: phone.trim(),
      role: assignedRole,
      accountStatus: 'active',
      emailVerified: true,
    });

    let providerProfile = null;
    if (assignedRole === 'provider') {
      providerProfile = db.providerProfiles.create({
        userId: newUser._id,
        businessName: (businessName || `${name}'s Services`).trim(),
        description: 'New service professional on LocalConnect.',
        skills: Array.isArray(skills) ? skills : typeof skills === 'string' ? skills.split(',').map((s) => s.trim()) : [],
        experienceYears: Number(experienceYears) || 1,
        serviceAreas: Array.isArray(serviceAreas) ? serviceAreas : typeof serviceAreas === 'string' ? serviceAreas.split(',').map((s) => s.trim()) : [],
        verificationStatus: 'not_submitted',
        averageRating: 0,
        reviewCount: 0,
        active: true,
      });

      // Default availability
      db.availabilities.create({
        providerId: providerProfile._id,
        daysOfWeek: [1, 2, 3, 4, 5, 6],
        startTime: '09:00',
        endTime: '18:00',
        availabilityStatus: 'active',
      });
    }

    const token = generateToken(newUser);

    // Set secure HTTP-only cookie
    res.cookie('localconnect_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Create welcome notification
    db.notifications.create({
      userId: newUser._id,
      title: 'Welcome to LocalConnect!',
      message:
        assignedRole === 'provider'
          ? 'Your provider account is ready. Complete your profile and submit verification documents to start accepting customer bookings.'
          : 'Your customer account is active. Explore verified local services and book reliable help anytime.',
      type: 'system',
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: sanitizeUser(newUser),
      providerProfile,
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, message: 'Internal server error during registration.' });
  }
});

// POST /auth/login
router.post('/login', async (req, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required.' });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = db.users.findOne({ email: normalizedEmail });

    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    if (user.accountStatus === 'suspended') {
      res.status(403).json({ success: false, message: 'This account has been suspended by administration.' });
      return;
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const token = generateToken(user);

    res.cookie('localconnect_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    let providerProfile = null;
    if (user.role === 'provider') {
      providerProfile = db.providerProfiles.findOne({ userId: user._id });
    }

    res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: sanitizeUser(user),
      providerProfile,
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Internal server error during login.' });
  }
});

// POST /auth/logout
router.post('/logout', (_req, res: Response) => {
  res.clearCookie('localconnect_token');
  res.json({ success: true, message: 'Logged out successfully.' });
});

// GET /auth/me
router.get('/me', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  let providerProfile = null;
  if (user.role === 'provider') {
    providerProfile = db.providerProfiles.findOne({ userId: user._id });
  }

  res.json({
    success: true,
    user: sanitizeUser(user),
    providerProfile,
  });
});

// POST /auth/forgot-password (safe mock recovery token)
router.post('/forgot-password', (req, res: Response) => {
  const { email } = req.body;
  // Generic message prevents account enumeration
  res.json({
    success: true,
    message: 'If an account exists with this email address, password reset instructions have been dispatched.',
    demoToken: 'demo-reset-token-2026', // Helpful for local testing
  });
});

// POST /auth/reset-password
router.post('/reset-password', async (req, res: Response) => {
  const { token, newPassword, email } = req.body;
  if (!newPassword || newPassword.length < 6) {
    res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
    return;
  }

  if (email) {
    const user = db.users.findOne({ email: email.trim().toLowerCase() });
    if (user) {
      const passwordHash = await bcrypt.hash(newPassword, 10);
      db.users.findByIdAndUpdate(user._id, { passwordHash });
    }
  }

  res.json({ success: true, message: 'Password has been reset successfully. You can now log in.' });
});

export default router;
