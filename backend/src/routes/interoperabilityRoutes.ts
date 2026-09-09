import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import {
  getAdapterStatuses,
  getCitizenVault,
  getDataExchanges,
  requestDocumentExchange,
} from '../controllers/interoperabilityController';

const router = Router();

// Protect ALL interoperability endpoints with authentication
router.use(authenticate);

router.get('/adapters', getAdapterStatuses);
router.get('/vault', getCitizenVault);
router.get('/exchanges', getDataExchanges);
router.post('/exchange/request', requestDocumentExchange);

export default router;

