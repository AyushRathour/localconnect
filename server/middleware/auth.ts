import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db/store.ts';
import type { IUser, UserRole } from '../db/types.ts';

export const JWT_SECRET = process.env.JWT_SECRET || 'localconnect_jwt_secret_dev_key_2026_academic_secure';

export interface AuthenticatedRequest extends Request {
  user?: IUser;
  providerProfileId?: string;
}

export function generateToken(user: IUser): string {
  return jwt.sign(
    {
      userId: user._id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  try {
    let token: string | undefined;

    // Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    // Check cookies as fallback or primary
    if (!token && req.cookies && req.cookies.localconnect_token) {
      token = req.cookies.localconnect_token;
    }

    if (!token) {
      res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: UserRole };
    const user = db.users.findById(decoded.userId);

    if (!user) {
      res.status(401).json({ success: false, message: 'User account not found or has been removed.' });
      return;
    }

    if (user.accountStatus === 'suspended') {
      res.status(403).json({ success: false, message: 'Your account has been suspended by administration.' });
      return;
    }

    req.user = user;

    if (user.role === 'provider') {
      const profile = db.providerProfiles.findOne({ userId: user._id });
      if (profile) {
        req.providerProfileId = profile._id;
      }
    }

    next();
  } catch (err: any) {
    res.status(401).json({ success: false, message: 'Invalid or expired session token.' });
  }
}

export function optionalAuthenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  try {
    let token: string | undefined;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.localconnect_token) {
      token = req.cookies.localconnect_token;
    }

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      const user = db.users.findById(decoded.userId);
      if (user && user.accountStatus !== 'suspended') {
        req.user = user;
        if (user.role === 'provider') {
          const profile = db.providerProfiles.findOne({ userId: user._id });
          if (profile) req.providerProfileId = profile._id;
        }
      }
    }
  } catch {
    // Ignore invalid optional tokens
  }
  next();
}

export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Forbidden. This action requires one of the following roles: [${allowedRoles.join(', ')}].`,
      });
      return;
    }

    next();
  };
}
