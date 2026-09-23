import { Response, NextFunction } from 'express';
import { applicationService } from '../services/applicationService';
import { AuthRequest } from '../middleware/authMiddleware';
import { AppError } from '../middleware/errorHandler';

export async function getApplications(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }
    const applications = await applicationService.getApplications(req.user);
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
    const application = await applicationService.getApplicationByIdWithAccess(req.params.id, req.user);
    res.status(200).json({ success: true, data: application });
  } catch (error) {
    next(error);
  }
}

export async function submitApplication(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { serviceId, prefilledFields, userFields, attachedDocs } = req.body;

    if (!serviceId) {
      throw new AppError('serviceId is required', 400);
    }

    // citizenId and citizenName strictly extracted from verified JWT
    const application = await applicationService.submitApplication({
      serviceId,
      prefilledFields: prefilledFields || {},
      userFields: userFields || {},
      attachedDocs: attachedDocs || [],
      citizenId: req.user.citizenId,
      citizenName: req.user.name,
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

export async function advanceApplicationStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }
    const application = await applicationService.advanceApplicationStatus(req.params.id, req.user);
    res.status(200).json({
      success: true,
      data: application,
      message: `Application progressed to ${application.status}`,
    });
  } catch (error) {
    next(error);
  }
}

export async function getApplicationTimeline(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }
    const timeline = await applicationService.getTimeline(req.params.id, req.user);
    res.status(200).json({ success: true, count: timeline.length, data: timeline });
  } catch (error) {
    next(error);
  }
}

export async function getApplicationRequirements(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }
    const reqs = await applicationService.getApplicationRequirements(req.params.id, req.user);
    res.status(200).json({ success: true, data: reqs });
  } catch (error) {
    next(error);
  }
}

export async function getApplicationDocuments(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }
    const docs = await applicationService.getApplicationDocuments(req.params.id, req.user);
    res.status(200).json({ success: true, count: docs.length, data: docs });
  } catch (error) {
    next(error);
  }
}

export async function requestApplicationDocumentExchange(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }
    const { documentId, purpose } = req.body;
    if (!documentId) {
      throw new AppError('documentId is required', 400);
    }

    const { interoperabilityService } = await import('../services/interoperabilityService.js');
    const result = await interoperabilityService.requestDocumentExchange({
      applicationId: req.params.id,
      documentId,
      user: req.user,
      purpose,
    });

    res.status(200).json({
      success: true,
      data: result,
      message: `Document "${result.document.name}" verified and exchanged via interoperability layer.`,
    });
  } catch (error) {
    next(error);
  }
}

export async function fetchApplicationDocument(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }
    const { id, documentId } = req.params;
    const { purpose } = req.body || {};

    const { interoperabilityService } = await import('../services/interoperabilityService.js');
    const result = await interoperabilityService.requestDocumentExchange({
      applicationId: id,
      documentId,
      user: req.user,
      purpose,
    });

    res.status(200).json({
      success: true,
      data: result,
      message: `Document fetched successfully from simulated vault.`,
    });
  } catch (error) {
    next(error);
  }
}

export async function getApplicationExchanges(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }
    const { interoperabilityService } = await import('../services/interoperabilityService.js');
    const exchanges = await interoperabilityService.getApplicationExchanges(req.params.id, req.user);
    res.status(200).json({ success: true, count: exchanges.length, data: exchanges });
  } catch (error) {
    next(error);
  }
}

