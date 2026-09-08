import { Router, Response, NextFunction } from 'express';
import { handleSeedDatabase } from '../controllers/seedController';
import { authenticate, requireRole, AuthRequest } from '../middleware/authMiddleware';
import { ENV } from '../config/env';

const router = Router();

// Protect seed endpoint: requires admin role or explicit development environment flag
router.post(
  '/',
  (req, res, next: NextFunction) => {
    // Development-only exception controlled by dev environment flag and developer header
    if (ENV.NODE_ENV === 'development' && req.headers['x-dev-seed-key'] === 'sevasetu-dev-seed-bypass') {
      return next();
    }

    // Production / Default security: strictly requires admin role
    authenticate(req as AuthRequest, res, () => {
      requireRole('admin')(req as AuthRequest, res, next);
    });
  },
  handleSeedDatabase
);

export default router;
