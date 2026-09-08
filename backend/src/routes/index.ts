import { Router } from 'express';
import healthRoutes from './healthRoutes';
import userRoutes from './userRoutes';
import departmentRoutes from './departmentRoutes';
import serviceRoutes from './serviceRoutes';
import applicationRoutes from './applicationRoutes';
import documentRoutes from './documentRoutes';
import consentRoutes from './consentRoutes';
import activityRoutes from './activityRoutes';
import seedRoutes from './seedRoutes';
import authRoutes from './authRoutes';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/health', healthRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/departments', departmentRoutes);
apiRouter.use('/services', serviceRoutes);
apiRouter.use('/applications', applicationRoutes);
apiRouter.use('/documents', documentRoutes);
apiRouter.use('/consents', consentRoutes);
apiRouter.use('/activities', activityRoutes);
apiRouter.use('/seed', seedRoutes);

export default apiRouter;
