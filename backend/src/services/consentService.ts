import { Consent, IConsent } from '../models/Consent';
import { Activity } from '../models/Activity';
import { AppError } from '../middleware/errorHandler';

export interface CreateConsentDto {
  citizenId: string;
  departmentId: string;
  whoHasAccess: string;
  whatData: string[];
  whyPurpose: string;
  whichApplicationId: string;
  whichServiceName: string;
  fromWhen: string;
  untilWhen: string;
}

export class ConsentService {
  async getConsents(citizenId: string): Promise<IConsent[]> {
    return Consent.find({ citizenId }).sort({ createdAt: -1 });
  }

  async getConsentById(consentId: string, citizenId: string): Promise<IConsent> {
    const consent = await Consent.findOne({ consentId });
    if (!consent) {
      throw new AppError(`Consent permission ${consentId} not found`, 404);
    }
    if (consent.citizenId !== citizenId) {
      throw new AppError('Forbidden. You may only view your own consent records.', 403);
    }
    return consent;
  }

  async createConsent(dto: CreateConsentDto): Promise<IConsent> {
    const consentId = `perm-${Date.now()}`;
    const consent = await Consent.create({
      consentId,
      citizenId: dto.citizenId,
      departmentId: dto.departmentId,
      whoHasAccess: dto.whoHasAccess,
      whatData: dto.whatData,
      whyPurpose: dto.whyPurpose,
      whichApplicationId: dto.whichApplicationId,
      whichServiceName: dto.whichServiceName,
      fromWhen: dto.fromWhen,
      untilWhen: dto.untilWhen,
      status: 'Active',
    });

    // Log Activity
    await Activity.create({
      activityId: `act-${Date.now()}`,
      citizenId: consent.citizenId,
      applicationId: consent.whichApplicationId,
      serviceName: consent.whichServiceName,
      departmentName: consent.whoHasAccess,
      action: `Consent granted for ${consent.whichServiceName}`,
      details: `Citizen authorized ${consent.whoHasAccess} to access data until ${consent.untilWhen}`,
      type: 'consent_grant',
      statusBadge: 'Consent Granted',
      timestamp: dto.fromWhen,
    });

    return consent;
  }

  async revokeConsent(consentId: string, citizenId: string): Promise<IConsent> {
    const consent = await Consent.findOne({ consentId });
    if (!consent) {
      throw new AppError(`Consent permission ${consentId} not found`, 404);
    }

    // Ownership check: citizen can only revoke their own consent
    if (consent.citizenId !== citizenId) {
      throw new AppError('Forbidden. You may only revoke your own consent.', 403);
    }

    if (consent.status === 'Access Revoked') {
      return consent;
    }

    const nowFormatted = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    consent.status = 'Access Revoked';
    consent.revokedAt = nowFormatted;
    await consent.save();

    // Log Activity
    await Activity.create({
      activityId: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      citizenId: consent.citizenId,
      applicationId: consent.whichApplicationId,
      serviceName: consent.whichServiceName,
      departmentName: consent.whoHasAccess,
      action: `Consent revoked for ${consent.whichServiceName}`,
      details: `Citizen revoked data access for application ${consent.whichApplicationId}. Department adapter access terminated.`,
      type: 'consent_revoke',
      statusBadge: 'Access Revoked',
      timestamp: nowFormatted,
    });

    return consent;
  }
}

export const consentService = new ConsentService();
