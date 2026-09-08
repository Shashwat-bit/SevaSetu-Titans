import { Response, NextFunction } from 'express';
import { authService } from '../services/authService';
import { AuthRequest } from '../middleware/authMiddleware';
import { AppError } from '../middleware/errorHandler';

export async function login(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.status(200).json({
      success: true,
      data: result,
      message: 'Login successful',
    });
  } catch (error) {
    next(error);
  }
}

export async function getMe(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }
    const user = await authService.getCurrentUser(req.user.citizenId);
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

export async function demoSwitch(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { persona } = req.body;
    if (!persona) {
      throw new AppError('Persona key is required (e.g. citizen, officer-edu, officer-rev, officer-trans, admin)', 400);
    }

    const result = await authService.demoSwitch(persona);
    res.status(200).json({
      success: true,
      data: result,
      notice: 'PROTOTYPE DEMO FEATURE: This endpoint is strictly for SIH evaluation demonstration.',
    });
  } catch (error) {
    next(error);
  }
}
