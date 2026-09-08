import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';
import { AppError } from './errorHandler';
import { UserRole } from '../models/User';

export interface AuthTokenPayload {
  userId: string;
  id?: string;
  citizenId: string;
  name: string;
  email: string;
  role: UserRole;
  departmentId?: string;
}

export interface AuthRequest extends Request {
  user?: AuthTokenPayload;
}

export function authenticate(req: AuthRequest, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Authentication required. Bearer token missing.', 401));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as AuthTokenPayload;
    if (!decoded.id && decoded.userId) {
      decoded.id = decoded.userId;
    }
    req.user = decoded;
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Authentication token has expired. Please log in again.', 401));
    }
    return next(new AppError('Invalid authentication token.', 401));
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Forbidden. Requires one of the following roles: [${roles.join(', ')}]. Current role: ${req.user.role}`,
          403
        )
      );
    }

    next();
  };
}
