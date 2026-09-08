import { Router } from 'express';
import { getCurrentUser, connectDigiLocker, disconnectDigiLocker } from '../controllers/userController';
import { authenticate, requireRole } from '../middleware/authMiddleware';

const router = Router();

// GET /api/users/me requires authentication (accessible by citizen, officer, admin)
router.get('/me', authenticate, getCurrentUser);

// Citizen-only actions for DigiLocker mock connector
router.post('/me/connect-digilocker', authenticate, requireRole('citizen'), connectDigiLocker);
router.post('/me/disconnect-digilocker', authenticate, requireRole('citizen'), disconnectDigiLocker);

export default router;
