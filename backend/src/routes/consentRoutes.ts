import { Router } from 'express';
import { getConsents, createConsent, revokeConsent } from '../controllers/consentController';
import { authenticate, requireRole } from '../middleware/authMiddleware';

const router = Router();

// All consent routes require authentication as a citizen
router.use(authenticate);
router.use(requireRole('citizen'));

router.get('/', getConsents);
router.post('/', createConsent);
router.post('/:id/revoke', revokeConsent);

export default router;
