import { Response, NextFunction } from 'express';
import { officerService } from '../services/officerService';
import { AuthRequest } from '../middleware/authMiddleware';
import { AppError } from '../middleware/errorHandler';

export async function getDashboard(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }
    const dashboard = await officerService.getDashboardStats(req.user);
    res.status(200).json({ success: true, data: dashboard });
  } catch (error) {
    next(error);
  }
}

export async function getApplications(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }
    const { q, status, service, sort } = req.query as {
      q?: string;
      status?: string;
      service?: string;
      sort?: string;
    };
    const applications = await officerService.getDepartmentApplications(req.user, { q, status, service, sort });
    res.status(200).json({ success: true, count: applications.length, data: applications });
  } catch (error) {
    next(error);
  }
}

export async function getApplicationById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }
    const application = await officerService.getApplicationDetail(req.params.id, req.user);
    res.status(200).json({ success: true, data: application });
  } catch (error) {
    next(error);
  }
}

export async function verifyDocument(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }
    const { id, documentId } = req.params;
    const result = await officerService.verifyDocument(id, documentId, req.user);
    res.status(200).json({
      success: true,
      data: result.document,
      application: result.application,
      message: `Document ${result.document.name} verified successfully`,
    });
  } catch (error) {
    next(error);
  }
}

export async function rejectDocument(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }
    const { id, documentId } = req.params;
    const { reason } = req.body;
    const result = await officerService.rejectDocument(id, documentId, reason, req.user);
    res.status(200).json({
      success: true,
      data: result.document,
      application: result.application,
      message: `Document ${result.document.name} rejected`,
    });
  } catch (error) {
    next(error);
  }
}

export async function addRemark(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }
    const { id } = req.params;
    const { text } = req.body;
    const result = await officerService.addRemark(id, text, req.user);
    res.status(200).json({
      success: true,
      data: result.remark,
      application: result.application,
      message: 'Official remark added successfully',
    });
  } catch (error) {
    next(error);
  }
}

export async function updateStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }
    const { id } = req.params;
    const { status, reason } = req.body;
    if (!status) {
      throw new AppError('Target status is required', 400);
    }
    const application = await officerService.updateApplicationStatus(id, status, reason, req.user);
    res.status(200).json({
      success: true,
      data: application,
      message: `Application status successfully updated to ${application.status}`,
    });
  } catch (error) {
    next(error);
  }
}
