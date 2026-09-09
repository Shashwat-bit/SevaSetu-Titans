import { Router } from 'express';
import {
  getConsents,
  getConsentById,
  createConsent,
  revokeConsent,
  denyConsent,
} from '../controllers/consentController';
import { authenticate, requireRole } from '../middleware/authMiddleware';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// All consent routes require authentication as a citizen
router.use(authenticate);
router.use(requireRole('citizen'));

router.get('/', getConsents);
router.get('/:id', getConsentById);
router.post('/', createConsent);
router.post('/:id/revoke', revokeConsent);
router.post('/:id/deny', denyConsent);

// Consent records must never be deleted or tampered with
router.delete('/:id', (_req, _res, next) =>
  next(new AppError('Forbidden. Historical consent records cannot be deleted.', 403))
);
router.put('/:id', (_req, _res, next) =>
  next(new AppError('Forbidden. Consent records are immutable. Use revoke or deny transitions.', 403))
);

export default router;
