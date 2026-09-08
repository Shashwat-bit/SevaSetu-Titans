import { Router } from 'express';
import { getDocuments, syncDocuments, verifyDocument } from '../controllers/documentController';

const router = Router();

router.get('/', getDocuments);
router.post('/sync', syncDocuments);
router.post('/:id/verify', verifyDocument);

export default router;
