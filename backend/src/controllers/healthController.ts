import { Request, Response } from 'express';
import { isDBConnected, getDBState } from '../config/db';

export function getHealth(_req: Request, res: Response): void {
  const dbConnected = isDBConnected();
  res.status(dbConnected ? 200 : 503).json({
    status: dbConnected ? 'ok' : 'degraded',
    message: 'SevaSetu Interoperability Platform Backend is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: {
      status: getDBState(),
      connected: dbConnected,
    },
    interoperability: {
      digiLockerAdapter: 'Active (Mock Node)',
      departmentAdapters: ['Education', 'Revenue', 'Transport', 'Social Welfare'],
      mode: 'PROTOTYPE_SIMULATION',
    },
  });
}
