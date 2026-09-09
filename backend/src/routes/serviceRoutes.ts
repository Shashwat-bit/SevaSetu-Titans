import { Router } from 'express';
import { getAllServices, getServiceById, getServiceRequirements } from '../controllers/serviceController';

const router = Router();

router.get('/', getAllServices);
router.get('/:id/requirements', getServiceRequirements);
router.get('/:id', getServiceById);

export default router;

