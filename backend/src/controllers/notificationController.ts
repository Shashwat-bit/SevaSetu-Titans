import { Response, NextFunction } from 'express';
import { notificationService } from '../services/notificationService';
import { AuthRequest } from '../middleware/authMiddleware';
import { AppError } from '../middleware/errorHandler';

export async function getNotifications(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Authentication required.', 401);
    }

    const unreadOnly = req.query.unreadOnly === 'true';
    const result = await notificationService.getNotifications(req.user, unreadOnly);

    res.status(200).json({
      success: true,
      count: result.notifications.length,
      unreadCount: result.unreadCount,
      data: result.notifications,
    });
  } catch (error) {
    next(error);
  }
}

export async function markAsRead(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Authentication required.', 401);
    }

    const notification = await notificationService.markAsRead(req.params.id, req.user);
    res.status(200).json({
      success: true,
      message: 'Notification marked as read.',
      data: notification,
    });
  } catch (error) {
    next(error);
  }
}

export async function markAllAsRead(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Authentication required.', 401);
    }

    const result = await notificationService.markAllAsRead(req.user);
    res.status(200).json({
      success: true,
      message: `${result.updatedCount} notifications marked as read.`,
      updatedCount: result.updatedCount,
    });
  } catch (error) {
    next(error);
  }
}
