import { Router } from 'express';
import { getActivities, logActivity } from '../controllers/activityController';

const router = Router();

router.get('/', getActivities);
router.post('/', logActivity);

export default router;
