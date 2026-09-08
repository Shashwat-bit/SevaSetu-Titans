import { Request, Response, NextFunction } from 'express';
import { activityService } from '../services/activityService';
import { AppError } from '../middleware/errorHandler';

export async function getActivities(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const citizenId = (req.query.citizenId as string) || 'cit-001';
    const type = req.query.type as string | undefined;
    const activities = await activityService.getActivities(citizenId, type);
    res.status(200).json({ success: true, count: activities.length, data: activities });
  } catch (error) {
    next(error);
  }
}

export async function logActivity(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { citizenId, applicationId, serviceName, departmentName, action, details, type, statusBadge, metadata } = req.body;

    if (!serviceName || !departmentName || !action || !details || !type || !statusBadge) {
      throw new AppError('Missing required activity fields', 400);
    }

    const activity = await activityService.logActivity({
      citizenId: citizenId || 'cit-001',
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
