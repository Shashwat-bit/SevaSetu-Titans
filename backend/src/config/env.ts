import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const isDev = (process.env.NODE_ENV || 'development') === 'development';

export const ENV = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sevasetu',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  NODE_ENV: process.env.NODE_ENV || 'development',
  // In production, JWT_SECRET must strictly be provided via environment variables
  JWT_SECRET: process.env.JWT_SECRET || (isDev ? 'sevasetu_dev_jwt_secret_key_prototype_2026' : ''),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
};

if (!ENV.JWT_SECRET) {
  throw new Error('[ENV] JWT_SECRET environment variable is required in production.');
}
