import { Router } from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from '../controllers/notificationController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// All notification endpoints require authentication
router.use(authenticate);

router.get('/', getNotifications);
router.patch('/:id/read', markAsRead);
router.post('/read-all', markAllAsRead);

export default router;
