import { Router } from 'express';
import {
  getAdminOverview,
  getAnalytics,
  getDepartmentAnalytics,
  getSystemConsents,
  getSystemActivities,
} from '../controllers/adminController';
import { authenticate, requireRole } from '../middleware/authMiddleware';

const router = Router();

// Strict security: all admin endpoints require valid JWT and 'admin' role
router.use(authenticate);
router.use(requireRole('admin'));

router.get('/overview', getAdminOverview);
router.get('/analytics', getAnalytics);
router.get('/departments', getDepartmentAnalytics);
router.get('/consents', getSystemConsents);
router.get('/activities', getSystemActivities);

export default router;
