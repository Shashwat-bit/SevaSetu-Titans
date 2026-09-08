import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { ENV } from './config/env';
import { connectDB } from './config/db';
import apiRouter from './routes';
import { notFoundHandler } from './middleware/notFoundHandler';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

const app = express();

// Security & Utility Middlewares
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman) or matching CLIENT_URL
      if (!origin || origin === ENV.CLIENT_URL || origin.startsWith('http://localhost:')) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in prototype development
      }
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, _res, next) => {
  logger.debug(`${req.method} ${req.path}`);
  next();
});

// Mount API Routes
app.use('/api', apiRouter);

// 404 and Centralized Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Start server function
async function startServer() {
  try {
    // Attempt MongoDB connection
    await connectDB();
  } catch (error) {
    logger.error('Failed to connect to MongoDB initially. Server will start and retry on next queries.', error);
  }

  const server = app.listen(ENV.PORT, () => {
    logger.info(`=======================================================`);
    logger.info(`SevaSetu Interoperability Platform Backend Running`);
    logger.info(`Port:        ${ENV.PORT}`);
    logger.info(`Health API:  http://localhost:${ENV.PORT}/api/health`);
    logger.info(`Environment: ${ENV.NODE_ENV}`);
    logger.info(`Database:    ${ENV.MONGODB_URI}`);
    logger.info(`=======================================================`);
  });

  const handleShutdown = async () => {
    logger.info('Shutting down server gracefully...');
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  };

  process.on('SIGINT', handleShutdown);
  process.on('SIGTERM', handleShutdown);
}

startServer();

export default app;
