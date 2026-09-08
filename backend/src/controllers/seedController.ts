import { Request, Response, NextFunction } from 'express';
import { seedDatabase } from '../utils/seedData';

export async function handleSeedDatabase(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await seedDatabase();
    res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    next(error);
  }
}
