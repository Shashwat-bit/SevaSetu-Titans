import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { AppError } from '../middleware/errorHandler';
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

// Data exchange audit records are strictly immutable
router.delete('/exchanges', (_req, _res, next) =>
  next(new AppError('Forbidden. Historical data exchange records cannot be modified or deleted.', 403))
);
router.put('/exchanges', (_req, _res, next) =>
  next(new AppError('Forbidden. Historical data exchange records cannot be modified or deleted.', 403))
);
router.delete('/exchanges/:id', (_req, _res, next) =>
  next(new AppError('Forbidden. Historical data exchange records cannot be modified or deleted.', 403))
);
router.put('/exchanges/:id', (_req, _res, next) =>
  next(new AppError('Forbidden. Historical data exchange records cannot be modified or deleted.', 403))
);

export default router;

