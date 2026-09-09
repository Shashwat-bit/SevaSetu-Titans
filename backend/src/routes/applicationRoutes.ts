import { Router } from 'express';
import {
  getApplications,
  getApplicationById,
  submitApplication,
  advanceApplicationStatus,
  getApplicationTimeline,
  getApplicationRequirements,
  getApplicationDocuments,
  requestApplicationDocumentExchange,
  fetchApplicationDocument,
  getApplicationExchanges,
} from '../controllers/applicationController';
import { authenticate, requireRole } from '../middleware/authMiddleware';

const router = Router();

// All application routes require authentication
router.use(authenticate);

// Citizen sees own applications; Officer sees department applications; Admin sees all
router.get('/', getApplications);

// Citizen only can submit applications
router.post('/', requireRole('citizen'), submitApplication);

// Part 5 Document and Requirements routes
router.get('/:id/requirements', getApplicationRequirements);
router.get('/:id/documents', getApplicationDocuments);
router.post('/:id/documents/request', requestApplicationDocumentExchange);
router.post('/:id/documents/:documentId/fetch', fetchApplicationDocument);
router.get('/:id/exchanges', getApplicationExchanges);

// Application details (ownership or department scope enforced in controller)
router.get('/:id', getApplicationById);

// Departmental action: Only officers and admins can advance application status
router.put('/:id', requireRole('officer', 'admin'), advanceApplicationStatus);

// Application timeline (ownership or department scope enforced)
router.get('/:id/timeline', getApplicationTimeline);

export default router;
