import { Router } from 'express';
import { login, getMe, demoSwitch } from '../controllers/authController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// Public login endpoint
router.post('/login', login);

// Prototype demo persona switch endpoint
router.post('/demo-switch', demoSwitch);

// Protected current user endpoint
router.get('/me', authenticate, getMe);

export default router;
