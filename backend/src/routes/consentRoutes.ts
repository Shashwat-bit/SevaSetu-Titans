import { Router } from 'express';
import { getConsents, createConsent, revokeConsent } from '../controllers/consentController';

const router = Router();

router.get('/', getConsents);
router.post('/', createConsent);
router.post('/:id/revoke', revokeConsent);

export default router;
