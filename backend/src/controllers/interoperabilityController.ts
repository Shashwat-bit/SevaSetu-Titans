import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { interoperabilityService } from '../services/interoperabilityService';
import { AppError } from '../middleware/errorHandler';

export async function getAdapterStatuses(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const statuses = interoperabilityService.getSimulatedAdapterStatuses();
    res.status(200).json({
      success: true,
      data: statuses,
      isSimulation: true,
      message: 'Simulated adapter connectivity and telemetry retrieved.',
    });
  } catch (error) {
    next(error);
  }
}

export async function getCitizenVault(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Authentication required.', 401);
    }
    if (req.user.role !== 'citizen') {
      throw new AppError('Forbidden. Only citizens may access their personal credential vault.', 403);
    }
    const citizenId = req.user.citizenId || req.user.userId || req.user.id || '';
    const docs = await interoperabilityService.getCitizenVaultDocuments(citizenId);
    res.status(200).json({
      success: true,
      count: docs.length,
      data: docs,
    });
  } catch (error) {
    next(error);
  }
}

export async function getDataExchanges(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Authentication required.', 401);
    }
    const { applicationId } = req.query as { applicationId?: string };

    if (applicationId) {
      const exchanges = await interoperabilityService.getApplicationExchanges(applicationId, req.user);
      res.status(200).json({ success: true, count: exchanges.length, data: exchanges });
      return;
    }

    if (req.user.role !== 'citizen') {
      throw new AppError('Forbidden. Officers must specify an applicationId to view exchanges within their department.', 403);
    }

    const citizenId = req.user.citizenId || req.user.userId || req.user.id || '';
    const exchanges = await interoperabilityService.getCitizenExchanges(citizenId, req.user);
    res.status(200).json({ success: true, count: exchanges.length, data: exchanges });
  } catch (error) {
    next(error);
  }
}

export async function requestDocumentExchange(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Authentication required.', 401);
    }
    const { applicationId, documentId, purpose } = req.body;

    if (!applicationId || !documentId) {
      throw new AppError('applicationId and documentId are required.', 400);
    }

    const result = await interoperabilityService.requestDocumentExchange({
      applicationId,
      documentId,
      user: req.user,
      purpose,
    });

    res.status(200).json({
      success: true,
      data: result,
      message: `Document "${result.document.name}" exchanged and verified via ${result.exchange.sourceSystem}.`,
    });
  } catch (error) {
    next(error);
  }
}
