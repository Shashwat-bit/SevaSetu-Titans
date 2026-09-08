import { Router } from 'express';
import { getActivities, logActivity } from '../controllers/activityController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// All activity routes require authentication
router.use(authenticate);

router.get('/', getActivities);
router.post('/', logActivity);

export default router;
