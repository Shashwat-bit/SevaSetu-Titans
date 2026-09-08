import { Request, Response, NextFunction } from 'express';
import { applicationService } from '../services/applicationService';
import { AppError } from '../middleware/errorHandler';

export async function getApplications(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const citizenId = (req.query.citizenId as string) || 'cit-001';
    const applications = await applicationService.getApplications(citizenId);
    res.status(200).json({ success: true, count: applications.length, data: applications });
  } catch (error) {
    next(error);
  }
}

export async function getApplicationById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const application = await applicationService.getApplicationById(req.params.id);
    res.status(200).json({ success: true, data: application });
  } catch (error) {
    next(error);
  }
}

export async function submitApplication(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { serviceId, prefilledFields, userFields, attachedDocs, citizenId } = req.body;

    if (!serviceId) {
      throw new AppError('serviceId is required', 400);
    }

    const application = await applicationService.submitApplication({
      serviceId,
      prefilledFields: prefilledFields || {},
      userFields: userFields || {},
      attachedDocs: attachedDocs || [],
      citizenId: citizenId || 'cit-001',
    });

    res.status(201).json({
      success: true,
      data: application,
      message: 'Application successfully created, dispatched via adapter, and stored in MongoDB',
    });
  } catch (error) {
    next(error);
  }
}

export async function advanceApplicationStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const application = await applicationService.advanceApplicationStatus(req.params.id);
    res.status(200).json({
      success: true,
      data: application,
      message: `Application progressed to ${application.status}`,
    });
  } catch (error) {
    next(error);
  }
}

export async function getApplicationTimeline(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const timeline = await applicationService.getTimeline(req.params.id);
    res.status(200).json({ success: true, count: timeline.length, data: timeline });
  } catch (error) {
    next(error);
  }
}
