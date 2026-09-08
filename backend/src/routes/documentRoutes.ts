import { Router } from 'express';
import { getDocuments, syncDocuments, verifyDocument } from '../controllers/documentController';
import { authenticate, requireRole } from '../middleware/authMiddleware';

const router = Router();

// All document endpoints require authentication
router.use(authenticate);

// Get documents (scoped to citizen or officer department)
router.get('/', getDocuments);

// Only citizen can trigger sync of their own DigiLocker vault
router.post('/sync', requireRole('citizen'), syncDocuments);

// Citizen or Officer can verify document hash
router.post('/:id/verify', verifyDocument);

export default router;
