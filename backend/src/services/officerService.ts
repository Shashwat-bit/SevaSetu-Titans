import { Application, IApplication, IAttachedDocument, IOfficerRemark, ITimelineEvent } from '../models/Application';
import { Department } from '../models/Department';
import { Activity } from '../models/Activity';
import { AppError } from '../middleware/errorHandler';
import { AuthTokenPayload } from '../middleware/authMiddleware';
import { logger } from '../utils/logger';

export interface OfficerDashboardStats {
  officer: {
    name: string;
    email: string;
    role: string;
    departmentId: string;
    departmentName: string;
  };
  stats: {
    total: number;
    pendingVerification: number;
    underReview: number;
    approved: number;
    rejected: number;
  };
  recentApplications: IApplication[];
}

export interface GetOfficerApplicationsQuery {
  q?: string;
  status?: string;
  service?: string;
  sort?: string;
}

const VALID_STATUS_TRANSITIONS: Record<string, string[]> = {
  'Draft': ['Submitted'],
  'Submitted': ['Under Verification', 'Rejected'],
  'Documents Received': ['Under Verification', 'Rejected'],
  'Under Verification': ['Under Review', 'Rejected'],
  'Under Review': ['Approved', 'Rejected'],
  'Approved': ['Completed'],
  'Rejected': [],
  'Completed': [],
};

export class OfficerService {
  private getDepartmentId(officer: AuthTokenPayload): string {
    if (officer.role === 'officer' && !officer.departmentId) {
      throw new AppError('Officer has no assigned department.', 403);
    }
    return officer.departmentId || '';
  }

  private formatDateNow(): string {
    return new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  async getDashboardStats(officer: AuthTokenPayload): Promise<OfficerDashboardStats> {
    const departmentId = this.getDepartmentId(officer);
    const filter: Record<string, any> = {};
    if (officer.role === 'officer') {
      filter.departmentId = departmentId;
    }

    const dept = departmentId ? await Department.findOne({ departmentId }) : null;
    const departmentName = dept ? dept.name : departmentId || 'Central Administration';

    const [total, pendingVerification, underReview, approved, rejected, recent] = await Promise.all([
      Application.countDocuments(filter),
      Application.countDocuments({
        ...filter,
        status: { $in: ['Submitted', 'Under Verification', 'Documents Received'] },
      }),
      Application.countDocuments({ ...filter, status: 'Under Review' }),
      Application.countDocuments({ ...filter, status: { $in: ['Approved', 'Completed'] } }),
      Application.countDocuments({ ...filter, status: 'Rejected' }),
      Application.find(filter).sort({ createdAt: -1 }).limit(5),
    ]);

    return {
      officer: {
        name: officer.name,
        email: officer.email,
        role: officer.role,
        departmentId,
        departmentName,
      },
      stats: {
        total,
        pendingVerification,
        underReview,
        approved,
        rejected,
      },
      recentApplications: recent,
    };
  }

  async getDepartmentApplications(
    officer: AuthTokenPayload,
    query: GetOfficerApplicationsQuery = {}
  ): Promise<IApplication[]> {
    const departmentId = this.getDepartmentId(officer);
    const filter: Record<string, any> = {};

    if (officer.role === 'officer') {
      filter.departmentId = departmentId;
    }

    if (query.status && query.status !== 'all') {
      filter.status = new RegExp(`^${query.status.trim()}$`, 'i');
    }

    if (query.service && query.service !== 'all') {
      filter.serviceId = query.service;
    }

    if (query.q && query.q.trim()) {
      const q = query.q.trim();
      filter.$or = [
        { applicationId: { $regex: q, $options: 'i' } },
        { citizenName: { $regex: q, $options: 'i' } },
        { serviceName: { $regex: q, $options: 'i' } },
      ];
    }

    const sortOrder: 1 | -1 = query.sort === 'oldest' ? 1 : -1;
    return Application.find(filter).sort({ createdAt: sortOrder });
  }

  private getOfficerUserId(officer: AuthTokenPayload): string {
    return officer.id || officer.userId;
  }

  async getApplicationDetail(applicationId: string, officer: AuthTokenPayload): Promise<IApplication> {
    const app = await Application.findOne({ applicationId });
    if (!app) {
      throw new AppError(`Application ${applicationId} not found`, 404);
    }

    if (officer.role === 'officer' && app.departmentId !== officer.departmentId) {
      throw new AppError(
        `Forbidden. You may only access applications in your department (${officer.departmentId}).`,
        403
      );
    }

    return app;
  }

  async verifyDocument(
    applicationId: string,
    documentId: string,
    officer: AuthTokenPayload
  ): Promise<{ application: IApplication; document: IAttachedDocument }> {
    const app = await this.getApplicationDetail(applicationId, officer);
    const nowFormatted = this.formatDateNow();
    const officerUserId = this.getOfficerUserId(officer);

    // Find document by docId, docNumber, name, or index
    const docIndex = app.documentsAttached.findIndex(
      (d, idx) =>
        d.docId === documentId ||
        (d.docNumber && d.docNumber === documentId) ||
        d.name.toLowerCase() === decodeURIComponent(documentId).toLowerCase() ||
        String(idx) === documentId
    );

    if (docIndex === -1) {
      throw new AppError(`Document ${documentId} not found on application ${applicationId}`, 404);
    }

    const doc = app.documentsAttached[docIndex];
    doc.verificationStatus = 'VERIFIED';
    doc.verified = true;
    doc.verifiedBy = officerUserId;
    doc.verifiedByName = officer.name;
    doc.verifiedDepartment = officer.departmentId || app.departmentId;
    doc.verifiedAt = nowFormatted;
    doc.rejectionReason = undefined;

    // Add Timeline Event
    const timelineEvent: ITimelineEvent = {
      id: `tl-verify-${Date.now()}`,
      title: `Document Verified: ${doc.name}`,
      timestamp: nowFormatted,
      description: `Verified by ${officer.name} (${officer.departmentId || app.departmentName}). Cryptographic signature & credential validated.`,
      status: 'completed',
    };
    app.timeline.push(timelineEvent);

    app.markModified('documentsAttached');
    app.markModified('timeline');
    await app.save();

    // Create Audit Activity
    await Activity.create({
      activityId: `act-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      citizenId: app.citizenId,
      applicationId: app.applicationId,
      serviceName: app.serviceName,
      departmentName: app.departmentName,
      action: `Document Verified - ${doc.name}`,
      details: `${doc.name} verified by ${officer.name} (${officer.role.toUpperCase()}) for application ${app.applicationId}`,
      type: 'verification',
      statusBadge: 'Verified',
      timestamp: nowFormatted,
      metadata: {
        officerId: officerUserId,
        officerName: officer.name,
        departmentId: officer.departmentId,
      },
    });

    logger.info(`[Officer] Document verified on ${applicationId}: ${doc.name} by ${officer.name} (${officerUserId})`);

    return { application: app, document: doc };
  }

  async rejectDocument(
    applicationId: string,
    documentId: string,
    reason: string,
    officer: AuthTokenPayload
  ): Promise<{ application: IApplication; document: IAttachedDocument }> {
    if (!reason || !reason.trim()) {
      throw new AppError('Rejection reason is required when rejecting a document.', 400);
    }

    const app = await this.getApplicationDetail(applicationId, officer);
    const nowFormatted = this.formatDateNow();
    const officerUserId = this.getOfficerUserId(officer);

    const docIndex = app.documentsAttached.findIndex(
      (d, idx) =>
        d.docId === documentId ||
        (d.docNumber && d.docNumber === documentId) ||
        d.name.toLowerCase() === decodeURIComponent(documentId).toLowerCase() ||
        String(idx) === documentId
    );

    if (docIndex === -1) {
      throw new AppError(`Document ${documentId} not found on application ${applicationId}`, 404);
    }

    const doc = app.documentsAttached[docIndex];
    doc.verificationStatus = 'REJECTED';
    doc.verified = false;
    doc.verifiedBy = officerUserId;
    doc.verifiedByName = officer.name;
    doc.verifiedDepartment = officer.departmentId || app.departmentId;
    doc.verifiedAt = nowFormatted;
    doc.rejectionReason = reason.trim();

    // Add Timeline Event
    const timelineEvent: ITimelineEvent = {
      id: `tl-reject-${Date.now()}`,
      title: `Document Flagged / Rejected: ${doc.name}`,
      timestamp: nowFormatted,
      description: `Flagged by ${officer.name}: "${reason.trim()}"`,
      status: 'current',
    };
    app.timeline.push(timelineEvent);

    app.markModified('documentsAttached');
    app.markModified('timeline');
    await app.save();

    // Create Audit Activity
    await Activity.create({
      activityId: `act-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      citizenId: app.citizenId,
      applicationId: app.applicationId,
      serviceName: app.serviceName,
      departmentName: app.departmentName,
      action: `Document Rejected - ${doc.name}`,
      details: `${doc.name} rejected by ${officer.name} for ${app.applicationId}. Reason: "${reason.trim()}"`,
      type: 'verification',
      statusBadge: 'Rejected',
      timestamp: nowFormatted,
      metadata: {
        officerId: officerUserId,
        officerName: officer.name,
        departmentId: officer.departmentId,
      },
    });

    logger.info(`[Officer] Document rejected on ${applicationId}: ${doc.name} by ${officer.name} (${officerUserId})`);

    return { application: app, document: doc };
  }

  async addRemark(
    applicationId: string,
    text: string,
    officer: AuthTokenPayload
  ): Promise<{ remark: IOfficerRemark; application: IApplication }> {
    if (!text || !text.trim()) {
      throw new AppError('Remark text is required.', 400);
    }

    const app = await this.getApplicationDetail(applicationId, officer);
    const nowFormatted = this.formatDateNow();
    const officerUserId = this.getOfficerUserId(officer);

    const remark: IOfficerRemark = {
      id: `rem-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      applicationId: app.applicationId,
      officerId: officerUserId,
      officerName: officer.name,
      departmentId: officer.departmentId || app.departmentId,
      role: officer.role,
      text: text.trim(),
      timestamp: nowFormatted,
    };

    if (!app.officerRemarks) {
      app.officerRemarks = [];
    }
    app.officerRemarks.push(remark);

    // Add Timeline Event
    app.timeline.push({
      id: `tl-rem-${Date.now()}`,
      title: `Officer Remark Added`,
      timestamp: nowFormatted,
      description: `${officer.name} (${officer.departmentId || app.departmentName}): "${text.trim()}"`,
      status: 'completed',
    });

    app.markModified('officerRemarks');
    app.markModified('timeline');
    await app.save();

    // Create Audit Activity
    await Activity.create({
      activityId: `act-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      citizenId: app.citizenId,
      applicationId: app.applicationId,
      serviceName: app.serviceName,
      departmentName: app.departmentName,
      action: `Officer Remark Added - ${app.applicationId}`,
      details: `Official remark recorded by ${officer.name} (${officer.role.toUpperCase()}): "${text.trim()}"`,
      type: 'officer_remark',
      statusBadge: 'Remark Added',
      timestamp: nowFormatted,
      metadata: {
        officerId: officerUserId,
        officerName: officer.name,
        departmentId: officer.departmentId,
      },
    });

    logger.info(`[Officer] Remark added to ${applicationId} by ${officer.name} (${officerUserId})`);

    return { remark, application: app };
  }

  async updateApplicationStatus(
    applicationId: string,
    targetStatusInput: string,
    reason: string | undefined,
    officer: AuthTokenPayload
  ): Promise<IApplication> {
    const app = await this.getApplicationDetail(applicationId, officer);

    // Normalize target status
    const statusMap: Record<string, string> = {
      'submitted': 'Submitted',
      'documents received': 'Documents Received',
      'documents_received': 'Documents Received',
      'under verification': 'Under Verification',
      'under_verification': 'Under Verification',
      'under review': 'Under Review',
      'under_review': 'Under Review',
      'approved': 'Approved',
      'rejected': 'Rejected',
      'completed': 'Completed',
    };

    const normalizedTarget = statusMap[targetStatusInput.toLowerCase().trim()] || targetStatusInput.trim();
    const currentStatus = app.status;

    if (currentStatus === normalizedTarget) {
      return app;
    }

    const allowedNext = VALID_STATUS_TRANSITIONS[currentStatus] || [];
    if (!allowedNext.includes(normalizedTarget)) {
      throw new AppError(
        `Invalid status transition from "${currentStatus}" to "${normalizedTarget}". Allowed transitions: [${allowedNext.join(
          ', '
        )}]`,
        400
      );
    }

    if (normalizedTarget === 'Rejected') {
      if (!reason || !reason.trim()) {
        throw new AppError('Rejection reason is required when rejecting an application.', 400);
      }
    }

    const nowFormatted = this.formatDateNow();
    const officerUserId = this.getOfficerUserId(officer);
    app.status = normalizedTarget;
    app.assignedOfficerId = officerUserId;
    app.assignedOfficerName = officer.name;

    // Advance timeline stages accordingly
    if (normalizedTarget === 'Under Verification') {
      if (app.timeline.length >= 3) {
        app.timeline[1].status = 'completed';
        app.timeline[2].status = 'current';
        app.timeline[2].timestamp = nowFormatted;
      }
    } else if (normalizedTarget === 'Under Review') {
      if (app.timeline.length >= 4) {
        app.timeline[2].status = 'completed';
        app.timeline[3].status = 'current';
        app.timeline[3].timestamp = nowFormatted;
      }
    } else if (normalizedTarget === 'Approved') {
      if (app.timeline.length >= 5) {
        app.timeline[3].status = 'completed';
        app.timeline[4].status = 'completed';
        app.timeline[4].timestamp = nowFormatted;
      }
    } else if (normalizedTarget === 'Completed') {
      if (app.timeline.length >= 6) {
        app.timeline[5].status = 'completed';
        app.timeline[5].timestamp = nowFormatted;
      }
    } else if (normalizedTarget === 'Rejected') {
      app.timeline.push({
        id: `tl-rejected-${Date.now()}`,
        title: 'Application Rejected',
        timestamp: nowFormatted,
        description: `Application rejected by ${officer.name}: "${reason?.trim()}"`,
        status: 'completed',
      });
    }

    app.markModified('timeline');
    await app.save();

    // Create Audit Activity
    await Activity.create({
      activityId: `act-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      citizenId: app.citizenId,
      applicationId: app.applicationId,
      serviceName: app.serviceName,
      departmentName: app.departmentName,
      action: `Application status updated to ${normalizedTarget}`,
      details: `Officer ${officer.name} (${officer.departmentId || app.departmentName}) transitioned ${
        app.applicationId
      } to ${normalizedTarget}${reason ? `. Reason: "${reason.trim()}"` : ''}`,
      type: 'status_change',
      statusBadge: normalizedTarget,
      timestamp: nowFormatted,
      metadata: {
        officerId: officerUserId,
        officerName: officer.name,
        departmentId: officer.departmentId,
      },
    });

    logger.info(
      `[Officer] Status updated on ${applicationId} to ${normalizedTarget} by ${officer.name} (${officerUserId})`
    );

    return app;
  }
}

export const officerService = new OfficerService();
