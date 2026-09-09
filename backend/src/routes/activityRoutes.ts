import { Router } from 'express';
import { getActivities, logActivity } from '../controllers/activityController';
import { authenticate } from '../middleware/authMiddleware';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// All activity routes require authentication
router.use(authenticate);

router.get('/', getActivities);
router.post('/', logActivity);

// Historical audit logs are strictly immutable and cannot be edited or deleted
router.delete('/', (_req, _res, next) =>
  next(new AppError('Forbidden. Historical audit records are immutable and cannot be modified or deleted.', 403))
);
router.put('/', (_req, _res, next) =>
  next(new AppError('Forbidden. Historical audit records are immutable and cannot be modified or deleted.', 403))
);
router.patch('/', (_req, _res, next) =>
  next(new AppError('Forbidden. Historical audit records are immutable and cannot be modified or deleted.', 403))
);

router.all('/:id', (req, _res, next) => {
  if (['PUT', 'DELETE', 'PATCH', 'POST'].includes(req.method)) {
    return next(
      new AppError('Forbidden. Historical audit records are immutable and cannot be modified or deleted.', 403)
    );
  }
  next();
});

export default router;
