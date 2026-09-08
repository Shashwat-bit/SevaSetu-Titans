import { Router } from 'express';
import {
  getApplications,
  getApplicationById,
  submitApplication,
  advanceApplicationStatus,
  getApplicationTimeline,
} from '../controllers/applicationController';
import { authenticate, requireRole } from '../middleware/authMiddleware';

const router = Router();

// All application routes require authentication
router.use(authenticate);

// Citizen sees own applications; Officer sees department applications; Admin sees all
router.get('/', getApplications);

// Citizen only can submit applications
router.post('/', requireRole('citizen'), submitApplication);

// Application details (ownership or department scope enforced in controller)
router.get('/:id', getApplicationById);

// Departmental action: Only officers and admins can advance application status
router.put('/:id', requireRole('officer', 'admin'), advanceApplicationStatus);

// Application timeline (ownership or department scope enforced)
router.get('/:id/timeline', getApplicationTimeline);

export default router;
