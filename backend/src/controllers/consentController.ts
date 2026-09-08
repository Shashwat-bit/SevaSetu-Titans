import { Request, Response, NextFunction } from 'express';
import { consentService } from '../services/consentService';
import { AppError } from '../middleware/errorHandler';

export async function getConsents(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const citizenId = (req.query.citizenId as string) || 'cit-001';
    const consents = await consentService.getConsents(citizenId);
    res.status(200).json({ success: true, count: consents.length, data: consents });
  } catch (error) {
    next(error);
  }
}

export async function createConsent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const {
      departmentId,
      whoHasAccess,
      whatData,
      whyPurpose,
      whichApplicationId,
      whichServiceName,
      fromWhen,
      untilWhen,
      citizenId,
    } = req.body;

    if (!departmentId || !whoHasAccess || !whichApplicationId || !whichServiceName) {
      throw new AppError('Missing required consent fields', 400);
    }

    const consent = await consentService.createConsent({
      citizenId: citizenId || 'cit-001',
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

export async function revokeConsent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const consent = await consentService.revokeConsent(req.params.id);
    res.status(200).json({
      success: true,
      data: consent,
      message: 'Consent access revoked successfully. Department access terminated.',
    });
  } catch (error) {
    next(error);
  }
}
