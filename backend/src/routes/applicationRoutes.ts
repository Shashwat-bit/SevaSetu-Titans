import { Router } from 'express';
import {
  getApplications,
  getApplicationById,
  submitApplication,
  advanceApplicationStatus,
  getApplicationTimeline,
} from '../controllers/applicationController';

const router = Router();

router.get('/', getApplications);
router.post('/', submitApplication);
router.get('/:id', getApplicationById);
router.put('/:id', advanceApplicationStatus);
router.get('/:id/timeline', getApplicationTimeline);

export default router;
