import { Application, IApplication, ITimelineEvent, IAttachedDocument, IPrefilledField } from '../models/Application';
import { Service } from '../models/Service';
import { User } from '../models/User';
import { Consent } from '../models/Consent';
import { Activity } from '../models/Activity';
import { getDepartmentAdapter } from '../adapters/adapterFactory';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export interface SubmitApplicationDto {
  serviceId: string;
  prefilledFields: Record<string, IPrefilledField>;
  userFields: Record<string, string>;
  attachedDocs: IAttachedDocument[];
  citizenId?: string;
}

export class ApplicationService {
  async getApplications(citizenId: string = 'cit-001'): Promise<IApplication[]> {
    return Application.find({ citizenId }).sort({ createdAt: -1 });
  }

  async getApplicationById(applicationId: string): Promise<IApplication> {
    const app = await Application.findOne({ applicationId });
    if (!app) {
      throw new AppError(`Application ${applicationId} not found`, 404);
    }
    return app;
  }

  async submitApplication(dto: SubmitApplicationDto): Promise<IApplication> {
    const citizenId = dto.citizenId || 'cit-001';
    const user = await User.findOne({ citizenId });
    const citizenName = user ? user.name : 'Tanishka';

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

    // 3. Save Application in MongoDB
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
    });

    // 4. Create Granular Consent Record
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
      consentId: `perm-${Date.now()}`,
      citizenId,
      departmentId: service.departmentId,
      whoHasAccess: `${service.departmentName}, Govt. of India`,
      whatData: whatDataList,
      whyPurpose: `${service.title} eligibility verification and credential processing`,
      whichApplicationId: newId,
      whichServiceName: service.title,
      fromWhen: formattedNow,
      untilWhen: formattedUntil,
      status: 'Active',
    });

    // 5. Automatically create Activity Audit Logs
    await Activity.create({
      activityId: `act-${Date.now()}-1`,
      citizenId,
      applicationId: newId,
      serviceName: service.title,
      departmentName: service.departmentName,
      action: `Application submitted - ${newId}`,
      details: `Dispatched via SevaSetu Interoperability Layer to ${service.departmentName} (Ack: ${dispatchResult.departmentAckId})`,
      type: 'submission',
      statusBadge: 'Submitted',
      timestamp: formattedNow,
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

    return newApplication;
  }

  async advanceApplicationStatus(applicationId: string): Promise<IApplication> {
    const app = await this.getApplicationById(applicationId);

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
        details: `Simulated adapter event: ${app.applicationId} progressed to ${nextStatus}`,
        type: 'status_change',
        statusBadge: nextStatus,
        timestamp: nowFormatted,
      });
    }

    return app;
  }

  async getTimeline(applicationId: string): Promise<ITimelineEvent[]> {
    const app = await this.getApplicationById(applicationId);
    return app.timeline;
  }
}

export const applicationService = new ApplicationService();
