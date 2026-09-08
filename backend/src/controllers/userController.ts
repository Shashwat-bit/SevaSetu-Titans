import { Response, NextFunction } from 'express';
import { userService } from '../services/userService';
import { AuthRequest } from '../middleware/authMiddleware';
import { AppError } from '../middleware/errorHandler';

export async function getCurrentUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }
    const user = await userService.getCurrentUser(req.user.citizenId);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}

export async function connectDigiLocker(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }
    const user = await userService.connectDigiLocker(req.user.citizenId);
    res.status(200).json({ success: true, data: user, message: 'DigiLocker connected successfully' });
  } catch (error) {
    next(error);
  }
}

export async function disconnectDigiLocker(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }
    const user = await userService.disconnectDigiLocker(req.user.citizenId);
    res.status(200).json({ success: true, data: user, message: 'DigiLocker disconnected successfully' });
  } catch (error) {
    next(error);
  }
}
