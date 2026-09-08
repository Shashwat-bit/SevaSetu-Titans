import { Router } from 'express';
import {
  getDashboard,
  getApplications,
  getApplicationById,
  verifyDocument,
  rejectDocument,
  addRemark,
  updateStatus,
} from '../controllers/officerController';
import { authenticate, requireRole } from '../middleware/authMiddleware';

const router = Router();

// Protect all officer routes: must be authenticated and have role officer or admin
router.use(authenticate);
router.use(requireRole('officer', 'admin'));

router.get('/dashboard', getDashboard);
router.get('/applications', getApplications);
router.get('/applications/:id', getApplicationById);
router.post('/applications/:id/documents/:documentId/verify', verifyDocument);
router.post('/applications/:id/documents/:documentId/reject', rejectDocument);
router.post('/applications/:id/remarks', addRemark);
router.post('/applications/:id/status', updateStatus);

export default router;
