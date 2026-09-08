import { Router } from 'express';
import { handleSeedDatabase } from '../controllers/seedController';

const router = Router();

router.post('/', handleSeedDatabase);

export default router;
