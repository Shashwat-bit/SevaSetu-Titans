import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/userService';

export async function getCurrentUser(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await userService.getCurrentUser();
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}

export async function connectDigiLocker(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await userService.connectDigiLocker();
    res.status(200).json({ success: true, data: user, message: 'DigiLocker connected successfully' });
  } catch (error) {
    next(error);
  }
}

export async function disconnectDigiLocker(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await userService.disconnectDigiLocker();
    res.status(200).json({ success: true, data: user, message: 'DigiLocker disconnected successfully' });
  } catch (error) {
    next(error);
  }
}
