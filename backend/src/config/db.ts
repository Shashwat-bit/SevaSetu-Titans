import mongoose from 'mongoose';
import { ENV } from './env';

export async function connectDB(): Promise<void> {
  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(ENV.MONGODB_URI);
    console.log(`[MongoDB] Connected successfully to: ${ENV.MONGODB_URI}`);
  } catch (error) {
    console.error('[MongoDB] Connection error:', error);
    // In production we would exit, but for robust prototype startup we log clearly
    throw error;
  }
}

export function isDBConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

export function getDBState(): string {
  const states: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  return states[mongoose.connection.readyState] || 'unknown';
}
