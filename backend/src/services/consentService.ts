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
  fromWhen?: string;
  untilWhen?: string;
  grantedAt?: string;
  expiresAt?: string;
  status?:
    | 'Active'
    | 'Access Revoked'
    | 'Expired'
    | 'Granted'
    | 'Denied'
    | 'ACTIVE'
    | 'REVOKED'
    | 'EXPIRED'
    | 'GRANTED'
    | 'DENIED';
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
      // Log unauthorized access attempt
      await Activity.create({
        activityId: `act-sec-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
        citizenId,
        applicationId: consent.whichApplicationId,
        serviceName: consent.whichServiceName,
        departmentName: consent.whoHasAccess,
        action: 'Unauthorized Consent Access Attempt',
        details: `Citizen ${citizenId} attempted to access consent record ${consentId} belonging to another citizen.`,
        type: 'data_access_denied',
        statusBadge: 'Blocked',
        timestamp: new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      });
      throw new AppError('Forbidden. You may only view your own consent records.', 403);
    }
    return consent;
  }

  async createConsent(dto: CreateConsentDto): Promise<IConsent> {
    const consentId = `perm-${Date.now()}`;
    const fromWhen = dto.fromWhen || dto.grantedAt || new Date().toISOString();
    const untilWhen = dto.untilWhen || dto.expiresAt || new Date(Date.now() + 180 * 86400000).toISOString();
    const grantedAt = dto.grantedAt || fromWhen;
    const expiresAt = dto.expiresAt || untilWhen;
    const status = dto.status || 'Active';

    const consent = await Consent.create({
      consentId,
      citizenId: dto.citizenId,
      departmentId: dto.departmentId,
      whoHasAccess: dto.whoHasAccess,
      whatData: dto.whatData,
      whyPurpose: dto.whyPurpose,
      whichApplicationId: dto.whichApplicationId,
      whichServiceName: dto.whichServiceName,
      fromWhen,
      untilWhen,
      grantedAt,
      expiresAt,
      status,
    });

    const isDenied = status.toUpperCase() === 'DENIED';

    // Log Activity
    await Activity.create({
      activityId: `act-${Date.now()}`,
      citizenId: consent.citizenId,
      applicationId: consent.whichApplicationId,
      serviceName: consent.whichServiceName,
      departmentName: consent.whoHasAccess,
      action: isDenied
        ? `Consent denied for ${consent.whichServiceName}`
        : `Consent granted for ${consent.whichServiceName}`,
      details: isDenied
        ? `Citizen denied access to data for application ${consent.whichApplicationId}`
        : `Citizen authorized ${consent.whoHasAccess} to access data until ${untilWhen}`,
      type: isDenied ? 'consent_denied' : 'consent_grant',
      statusBadge: isDenied ? 'Denied' : 'Consent Granted',
      timestamp: fromWhen,
      metadata: {
        consentId,
        whichApplicationId: consent.whichApplicationId,
        expiresAt,
      },
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
      await Activity.create({
        activityId: `act-sec-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
        citizenId,
        applicationId: consent.whichApplicationId,
        serviceName: consent.whichServiceName,
        departmentName: consent.whoHasAccess,
        action: 'Unauthorized Consent Revocation Attempt',
        details: `Citizen ${citizenId} attempted to revoke consent ${consentId} belonging to another citizen.`,
        type: 'data_access_denied',
        statusBadge: 'Blocked',
        timestamp: new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      });
      throw new AppError('Forbidden. You may only revoke your own consent.', 403);
    }

    if (consent.status === 'Access Revoked' || consent.status === 'REVOKED') {
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
      metadata: {
        consentId: consent.consentId,
        revokedAt: nowFormatted,
      },
    });

    return consent;
  }

  async denyConsent(consentId: string, citizenId: string, reason?: string): Promise<IConsent> {
    const consent = await Consent.findOne({ consentId });
    if (!consent) {
      throw new AppError(`Consent permission ${consentId} not found`, 404);
    }

    if (consent.citizenId !== citizenId) {
      throw new AppError('Forbidden. You may only deny your own consent.', 403);
    }

    const nowFormatted = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    consent.status = 'Denied';
    consent.deniedAt = nowFormatted;
    await consent.save();

    await Activity.create({
      activityId: `act-deny-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      citizenId: consent.citizenId,
      applicationId: consent.whichApplicationId,
      serviceName: consent.whichServiceName,
      departmentName: consent.whoHasAccess,
      action: `Consent denied for ${consent.whichServiceName}`,
      details: `Citizen denied data access for application ${consent.whichApplicationId}.${reason ? ` Reason: ${reason}` : ''}`,
      type: 'consent_denied',
      statusBadge: 'Denied',
      timestamp: nowFormatted,
      metadata: {
        consentId: consent.consentId,
        reason,
        deniedAt: nowFormatted,
      },
    });

    return consent;
  }
}

export const consentService = new ConsentService();
