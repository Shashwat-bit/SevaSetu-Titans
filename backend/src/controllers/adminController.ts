import { Response, NextFunction } from 'express';
import { analyticsService } from '../services/analyticsService';
import { interoperabilityService } from '../services/interoperabilityService';
import { Consent } from '../models/Consent';
import { Activity } from '../models/Activity';
import { AuthRequest } from '../middleware/authMiddleware';

export async function getAdminOverview(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const stats = await analyticsService.getOverviewStats();
    const adapterHealth = interoperabilityService.getSimulatedAdapterStatuses();

    res.status(200).json({
      success: true,
      data: {
        stats,
        adapterHealth,
      },
      message: 'System-level admin overview metrics retrieved successfully.',
    });
  } catch (error) {
    next(error);
  }
}

export async function getAnalytics(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const [applications, consents, exchanges, processing] = await Promise.all([
      analyticsService.getApplicationStats(),
      analyticsService.getConsentStats(),
      analyticsService.getDataExchangeStats(),
      analyticsService.getProcessingMetrics(),
    ]);

    res.status(200).json({
      success: true,
      data: {
        applications,
        consents,
        exchanges,
        processing,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getDepartmentAnalytics(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const departmentMetrics = await analyticsService.getDepartmentMetrics();
    res.status(200).json({
      success: true,
      count: departmentMetrics.length,
      data: departmentMetrics,
    });
  } catch (error) {
    next(error);
  }
}

export async function getSystemConsents(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status, departmentId } = req.query as { status?: string; departmentId?: string };
    const filter: Record<string, any> = {};

    if (status && status !== 'all') {
      filter.status = status;
    }
    if (departmentId && departmentId !== 'all') {
      filter.departmentId = departmentId;
    }

    const consents = await Consent.find(filter).sort({ createdAt: -1 }).limit(100);
    res.status(200).json({
      success: true,
      count: consents.length,
      data: consents,
    });
  } catch (error) {
    next(error);
  }
}

export async function getSystemActivities(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { type, departmentName } = req.query as { type?: string; departmentName?: string };
    const filter: Record<string, any> = {};

    if (type && type !== 'all') {
      filter.type = type;
    }
    if (departmentName && departmentName !== 'all') {
      filter.departmentName = { $regex: new RegExp(departmentName, 'i') };
    }

    const activities = await Activity.find(filter).sort({ createdAt: -1 }).limit(100);
    res.status(200).json({
      success: true,
      count: activities.length,
      data: activities,
    });
  } catch (error) {
    next(error);
  }
}
