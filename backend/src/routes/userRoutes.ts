import { Router } from 'express';
import { getCurrentUser, connectDigiLocker, disconnectDigiLocker } from '../controllers/userController';

const router = Router();

router.get('/me', getCurrentUser);
router.post('/me/connect-digilocker', connectDigiLocker);
router.post('/me/disconnect-digilocker', disconnectDigiLocker);

export default router;
