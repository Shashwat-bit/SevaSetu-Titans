import { Application, IApplication, ITimelineEvent, IAttachedDocument, IPrefilledField } from '../models/Application';
import { Service } from '../models/Service';
import { User } from '../models/User';
import { Consent } from '../models/Consent';
import { Activity } from '../models/Activity';
import { DataExchange } from '../models/DataExchange';
import { getDepartmentAdapter } from '../adapters/adapterFactory';
import { normalizationService } from './normalizationService';
import { notificationService } from './notificationService';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { AuthTokenPayload } from '../middleware/authMiddleware';

export interface SubmitApplicationDto {
  serviceId: string;
  prefilledFields: Record<string, IPrefilledField>;
  userFields: Record<string, string>;
  attachedDocs: IAttachedDocument[];
  citizenId: string;
  citizenName: string;
}

export class ApplicationService {
  async getApplications(user: AuthTokenPayload): Promise<IApplication[]> {
    const filter: Record<string, any> = {};

    if (user.role === 'citizen') {
      filter.citizenId = user.citizenId;
    } else if (user.role === 'officer') {
      if (!user.departmentId) {
        throw new AppError('Officer has no assigned department.', 403);
      }
      filter.departmentId = user.departmentId;
    }
    // Admin sees all applications

    return Application.find(filter).sort({ createdAt: -1 });
  }

  async getApplicationByIdWithAccess(applicationId: string, user: AuthTokenPayload): Promise<IApplication> {
    const app = await Application.findOne({ applicationId });
    if (!app) {
      throw new AppError(`Application ${applicationId} not found`, 404);
    }

    const nowFormatted = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    if (user.role === 'citizen' && app.citizenId !== user.citizenId) {
      await Activity.create({
        activityId: `act-sec-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
        citizenId: user.citizenId,
        applicationId: app.applicationId,
        serviceName: app.serviceName,
        departmentName: app.departmentName,
        action: 'Unauthorized Application Access Attempt',
        details: `Citizen ${user.citizenId} attempted to access application ${applicationId} belonging to citizen ${app.citizenId}.`,
        type: 'data_access_denied',
        statusBadge: 'Blocked',
        timestamp: nowFormatted,
      });
      throw new AppError('Forbidden. You may only view your own applications.', 403);
    }

    if (user.role === 'officer' && app.departmentId !== user.departmentId) {
      await Activity.create({
        activityId: `act-sec-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
        citizenId: app.citizenId,
        applicationId: app.applicationId,
        serviceName: app.serviceName,
        departmentName: app.departmentName,
        action: 'Cross-Department Access Blocked',
        details: `Officer ${user.name} (${user.departmentId}) attempted unauthorized access to ${app.departmentName} application ${applicationId}.`,
        type: 'data_access_denied',
        statusBadge: 'Blocked',
        timestamp: nowFormatted,
        metadata: { officerId: user.id || user.userId, officerDepartment: user.departmentId },
      });
      throw new AppError(`Forbidden. You may only view applications in your department (${user.departmentId}).`, 403);
    }

    return app;
  }

  async submitApplication(dto: SubmitApplicationDto): Promise<IApplication> {
    const citizenId = dto.citizenId;
    const citizenName = dto.citizenName || 'Citizen';

    const service = await Service.findOne({ serviceId: dto.serviceId });
    if (!service) {
      throw new AppError(`Service with ID ${dto.serviceId} not found`, 404);
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newId = `SS-2026-${randomSuffix}`;

    const now = new Date();
    const formattedNow = now.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    // 1. Dispatch through Interoperability Adapter
    const departmentAdapter = getDepartmentAdapter(service.departmentId);
    const dispatchResult = await departmentAdapter.dispatchApplication(
      {
        id: service.serviceId,
        title: service.title,
        departmentId: service.departmentId,
        departmentName: service.departmentName,
      },
      {
        applicationId: newId,
        citizenId,
        citizenName,
        prefilledFields: dto.prefilledFields,
        userFields: dto.userFields,
        attachedDocs: dto.attachedDocs,
      }
    );

    logger.info(`[Adapter] Dispatched to ${departmentAdapter.departmentName}: ${dispatchResult.departmentAckId}`);

    // 2. Build initial timeline
    const timeline: ITimelineEvent[] = [
      {
        id: 'tl-1',
        title: 'Application Submitted',
        timestamp: formattedNow,
        description: `Dispatched through SevaSetu Interoperability Layer to ${service.departmentName} Adapter.`,
        status: 'completed',
      },
      {
        id: 'tl-2',
        title: 'Documents Received',
        timestamp: formattedNow,
        description: 'Authorized digital payloads ingested from connected DigiLocker Mock Adapter.',
        status: 'completed',
      },
      {
        id: 'tl-3',
        title: 'Document Verification',
        timestamp: 'In Progress',
        description: 'Cross-referencing digital hashes with department registry.',
        status: 'current',
      },
      {
        id: 'tl-4',
        title: 'Department Review',
        timestamp: 'Pending',
        description: `Designated desk officer at ${service.departmentName} will review application.`,
        status: 'pending',
      },
      {
        id: 'tl-5',
        title: 'Approval & Issuance',
        timestamp: 'Pending',
        description: 'Final authorization and certificate/subsidy generation.',
        status: 'pending',
      },
    ];

    // 3. Create Granular Consent Record first so ID is linked
    const consentId = `perm-${Date.now()}`;
    const validUntilDate = new Date();
    validUntilDate.setMonth(validUntilDate.getMonth() + 6);
    const formattedUntil = validUntilDate.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const whatDataList = Object.keys(dto.prefilledFields || {});
    (dto.attachedDocs || []).forEach((d) => {
      if (!whatDataList.includes(d.name)) whatDataList.push(d.name);
    });

    await Consent.create({
      consentId,
      citizenId,
      departmentId: service.departmentId,
      whoHasAccess: `${service.departmentName}, Govt. of India`,
      whatData: whatDataList,
      whyPurpose: `${service.title} eligibility verification and credential processing`,
      whichApplicationId: newId,
      whichServiceName: service.title,
      fromWhen: formattedNow,
      untilWhen: formattedUntil,
      grantedAt: formattedNow,
      expiresAt: formattedUntil,
      status: 'Active',
    });

    // 4. Save Application in MongoDB with departmentReferenceId and consentId
    const deptRefId = dispatchResult.departmentReferenceId || dispatchResult.departmentAckId;
    const newApplication = await Application.create({
      applicationId: newId,
      citizenId,
      citizenName,
      serviceId: service.serviceId,
      serviceName: service.title,
      departmentId: service.departmentId,
      departmentName: service.departmentName,
      status: 'Submitted',
      submittedAt: formattedNow,
      prefilledFields: dto.prefilledFields || {},
      userFields: dto.userFields || {},
      documentsAttached: dto.attachedDocs || [],
      timeline,
      departmentReferenceId: deptRefId,
      consentId,
    });

    // 5. Record initial DataExchange entries for each attached document
    if (dto.attachedDocs && dto.attachedDocs.length > 0) {
      for (let i = 0; i < dto.attachedDocs.length; i++) {
        const doc = dto.attachedDocs[i];
        const normType = normalizationService.normalizeDocumentType(doc.name || doc.docType);
        await DataExchange.create({
          exchangeId: `xchg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${i}`,
          applicationId: newId,
          citizenId,
          documentId: doc.docId || `doc-${Date.now()}-${i}`,
          documentType: doc.docType,
          normalizedType: normType,
          sourceSystem: doc.source || 'DigiLocker Mock Adapter (Demo)',
          targetDepartment: service.departmentId,
          purpose: `${service.title} application verification`,
          consentId,
          requestedAt: formattedNow,
          accessedAt: formattedNow,
          status: 'FETCHED',
          requestedBy: citizenId,
          requestedByName: citizenName,
          metadata: {
            serviceId: service.serviceId,
            verified: doc.verified,
          },
        });
      }
    }

    // 6. Automatically create Activity Audit Logs
    await Activity.create({
      activityId: `act-${Date.now()}-1`,
      citizenId,
      applicationId: newId,
      serviceName: service.title,
      departmentName: service.departmentName,
      action: `Application submitted - ${newId}`,
      details: `Dispatched via SevaSetu Interoperability Layer to ${service.departmentName} (Ack: ${dispatchResult.departmentAckId}, Dept Ref: ${deptRefId})`,
      type: 'submission',
      statusBadge: 'Submitted',
      timestamp: formattedNow,
      metadata: {
        departmentAckId: dispatchResult.departmentAckId,
        departmentReferenceId: deptRefId,
        consentId,
      },
    });

    await Activity.create({
      activityId: `act-${Date.now()}-2`,
      citizenId,
      applicationId: newId,
      serviceName: service.title,
      departmentName: service.departmentName,
      action: `Consent granted for ${service.title}`,
      details: `Citizen authorized ${service.departmentName} to use pre-filled credentials until ${formattedUntil}`,
      type: 'consent_grant',
      statusBadge: 'Consent Granted',
      timestamp: formattedNow,
    });

    await Activity.create({
      activityId: `act-${Date.now()}-3`,
      citizenId,
      applicationId: newId,
      serviceName: service.title,
      departmentName: service.departmentName,
      action: `Department Adapter Dispatched (Mock)`,
      details: `Payload ingested into ${departmentAdapter.departmentName}. Reference ID: ${deptRefId}`,
      type: 'adapter_response',
      statusBadge: 'Acknowledged',
      timestamp: formattedNow,
      metadata: {
        departmentCode: departmentAdapter.departmentCode,
        departmentReferenceId: deptRefId,
      },
    });

    // 7. Dispatch Notifications
    await notificationService.createNotification({
      recipientRole: 'citizen',
      citizenId,
      applicationId: newId,
      title: 'Application Submitted',
      message: `Your application ${newId} for ${service.title} has been successfully submitted.`,
      type: 'application_submitted',
      metadata: { serviceId: service.serviceId, departmentId: service.departmentId },
    });

    await notificationService.createNotification({
      recipientRole: 'officer',
      departmentId: service.departmentId,
      applicationId: newId,
      title: 'New Application Received',
      message: `New application ${newId} for ${service.title} submitted by ${citizenName}.`,
      type: 'application_submitted',
      metadata: { serviceId: service.serviceId, citizenId },
    });

    return newApplication;
  }

  async advanceApplicationStatus(applicationId: string, officer: AuthTokenPayload): Promise<IApplication> {
    const app = await Application.findOne({ applicationId });
    if (!app) {
      throw new AppError(`Application ${applicationId} not found`, 404);
    }

    if (officer.role === 'officer' && app.departmentId !== officer.departmentId) {
      throw new AppError(
        `Forbidden. You can only advance status for applications belonging to your department (${officer.departmentId}).`,
        403
      );
    }

    const statusFlow = ['Submitted', 'Under Verification', 'Under Review', 'Approved'];
    const currentIndex = statusFlow.indexOf(app.status);

    if (currentIndex >= 0 && currentIndex < statusFlow.length - 1) {
      const nextStatus = statusFlow[currentIndex + 1];
      app.status = nextStatus;

      const nowFormatted = new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      const officerUserId = officer.id || officer.userId;
      app.assignedOfficerId = officerUserId;
      app.assignedOfficerName = officer.name;

      // Update timeline events
      if (nextStatus === 'Under Verification' && app.timeline.length >= 4) {
        app.timeline[2].status = 'completed';
        app.timeline[2].timestamp = nowFormatted;
        app.timeline[3].status = 'current';
      } else if (nextStatus === 'Under Review' && app.timeline.length >= 5) {
        app.timeline[3].status = 'completed';
        app.timeline[3].timestamp = nowFormatted;
        app.timeline[4].status = 'current';
      } else if (nextStatus === 'Approved' && app.timeline.length >= 5) {
        app.timeline[4].status = 'completed';
        app.timeline[4].timestamp = nowFormatted;
      }

      app.markModified('timeline');
      await app.save();

      // Log status change activity
      await Activity.create({
        activityId: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        citizenId: app.citizenId,
        applicationId: app.applicationId,
        serviceName: app.serviceName,
        departmentName: app.departmentName,
        action: `Application status updated to ${nextStatus}`,
        details: `Simulated department action by ${officer.name} (${officer.role.toUpperCase()}): ${app.applicationId} progressed to ${nextStatus}`,
        type: 'status_change',
        statusBadge: nextStatus,
        timestamp: nowFormatted,
        metadata: {
          officerId: officerUserId,
          officerName: officer.name,
          departmentId: officer.departmentId,
        },
      });

      await notificationService.createNotification({
        recipientRole: 'citizen',
        citizenId: app.citizenId,
        applicationId: app.applicationId,
        title: nextStatus === 'Approved' ? 'Application Approved' : 'Application Status Updated',
        message: `Your application ${app.applicationId} for ${app.serviceName} is now ${nextStatus}.`,
        type: nextStatus === 'Approved' ? 'application_approved' : 'status_change',
        metadata: { status: nextStatus, departmentId: app.departmentId },
      });
    }

    return app;
  }

  async getTimeline(applicationId: string, user: AuthTokenPayload): Promise<ITimelineEvent[]> {
    const app = await this.getApplicationByIdWithAccess(applicationId, user);
    return app.timeline;
  }

  async getApplicationRequirements(applicationId: string, user: AuthTokenPayload) {
    const app = await this.getApplicationByIdWithAccess(applicationId, user);
    const service = await Service.findOne({ serviceId: app.serviceId });
    const deptAdapter = getDepartmentAdapter(app.departmentId);
    let requiredDocs = service?.requiredDocs || [];
    let requiredFields = service?.requiredFields || [];

    try {
      const adapterData = await deptAdapter.getServiceData(app.serviceId);
      if (adapterData.requiredDocuments?.length) requiredDocs = adapterData.requiredDocuments;
      if (adapterData.requiredFields?.length) requiredFields = adapterData.requiredFields;
    } catch {
      // Fallback to service catalog
    }

    return {
      applicationId: app.applicationId,
      serviceId: app.serviceId,
      serviceName: app.serviceName,
      departmentId: app.departmentId,
      departmentName: app.departmentName,
      requiredDocuments: requiredDocs,
      requiredFields,
      normalizedRequiredTypes: requiredDocs.map((d) => normalizationService.normalizeDocumentType(d)),
    };
  }

  async getApplicationDocuments(applicationId: string, user: AuthTokenPayload): Promise<IAttachedDocument[]> {
    const app = await this.getApplicationByIdWithAccess(applicationId, user);

    if (user.role === 'officer') {
      const nowFormatted = new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      await Activity.create({
        activityId: `act-docacc-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
        citizenId: app.citizenId,
        applicationId: app.applicationId,
        serviceName: app.serviceName,
        departmentName: app.departmentName,
        action: `Application Documents Reviewed`,
        details: `Officer ${user.name} (${user.departmentId || app.departmentName}) accessed attached documents for application ${app.applicationId}.`,
        type: 'document_access',
        statusBadge: 'Accessed',
        timestamp: nowFormatted,
        metadata: {
          officerId: user.id || user.userId,
          officerName: user.name,
          departmentId: user.departmentId,
        },
      });
    }

    return app.documentsAttached || [];
  }
}

export const applicationService = new ApplicationService();
