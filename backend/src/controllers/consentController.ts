import { Response, NextFunction } from 'express';
import { consentService } from '../services/consentService';
import { AuthRequest } from '../middleware/authMiddleware';
import { AppError } from '../middleware/errorHandler';

export async function getConsents(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }
    const consents = await consentService.getConsents(req.user.citizenId);
    res.status(200).json({ success: true, count: consents.length, data: consents });
  } catch (error) {
    next(error);
  }
}

export async function createConsent(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { departmentId, whoHasAccess, whatData, whyPurpose, whichApplicationId, whichServiceName, fromWhen, untilWhen } = req.body;

    if (!departmentId || !whoHasAccess || !whichApplicationId || !whichServiceName) {
      throw new AppError('Missing required consent fields', 400);
    }

    // citizenId strictly extracted from verified JWT
    const consent = await consentService.createConsent({
      citizenId: req.user.citizenId,
      departmentId,
      whoHasAccess,
      whatData: whatData || [],
      whyPurpose: whyPurpose || 'Eligibility verification',
      whichApplicationId,
      whichServiceName,
      fromWhen: fromWhen || new Date().toISOString(),
      untilWhen: untilWhen || new Date(Date.now() + 180 * 86400000).toISOString(),
    });

    res.status(201).json({ success: true, data: consent, message: 'Consent permission granted' });
  } catch (error) {
    next(error);
  }
}

export async function revokeConsent(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }
    const consent = await consentService.revokeConsent(req.params.id, req.user.citizenId);
    res.status(200).json({
      success: true,
      data: consent,
      message: 'Consent access revoked successfully. Department access terminated.',
    });
  } catch (error) {
    next(error);
  }
}
