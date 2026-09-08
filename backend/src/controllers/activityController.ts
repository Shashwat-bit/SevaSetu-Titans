import { Response, NextFunction } from 'express';
import { activityService } from '../services/activityService';
import { AuthRequest } from '../middleware/authMiddleware';
import { AppError } from '../middleware/errorHandler';

export async function getActivities(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }
    const type = req.query.type as string | undefined;
    const activities = await activityService.getActivitiesForUser(req.user, type);
    res.status(200).json({ success: true, count: activities.length, data: activities });
  } catch (error) {
    next(error);
  }
}

export async function logActivity(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }
    const { applicationId, serviceName, departmentName, action, details, type, statusBadge, metadata } = req.body;

    if (!serviceName || !departmentName || !action || !details || !type || !statusBadge) {
      throw new AppError('Missing required activity fields', 400);
    }

    const activity = await activityService.logActivity({
      citizenId: req.user.citizenId,
      applicationId,
      serviceName,
      departmentName,
      action,
      details,
      type,
      statusBadge,
      metadata,
    });

    res.status(201).json({ success: true, data: activity });
  } catch (error) {
    next(error);
  }
}
