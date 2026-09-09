import { Activity, IActivity } from '../models/Activity';
import { Department } from '../models/Department';
import { AuthTokenPayload } from '../middleware/authMiddleware';

export interface CreateActivityDto {
  citizenId?: string;
  applicationId?: string;
  serviceName: string;
  departmentName: string;
  action: string;
  details: string;
  type:
    | 'submission'
    | 'document_access'
    | 'verification'
    | 'consent_grant'
    | 'consent_revoke'
    | 'consent_denied'
    | 'status_change'
    | 'officer_remark'
    | 'document_requested'
    | 'document_fetched'
    | 'document_exchanged'
    | 'data_access_denied'
    | 'adapter_request'
    | 'adapter_response'
    | 'login'
    | 'security_alert';
  statusBadge: string;
  metadata?: Record<string, any>;
}

export class ActivityService {
  async getActivitiesForUser(user: AuthTokenPayload, type?: string): Promise<IActivity[]> {
    const filter: Record<string, any> = {};

    if (user.role === 'citizen') {
      filter.citizenId = user.citizenId;
    } else if (user.role === 'officer' && user.departmentId) {
      const dept = await Department.findOne({ departmentId: user.departmentId });
      const deptName = dept ? dept.name : '';
      filter.$or = [
        { departmentName: { $regex: new RegExp(deptName || user.departmentId, 'i') } },
        { details: { $regex: new RegExp(user.departmentId, 'i') } },
        { citizenId: user.citizenId },
      ];
    }

    if (type && type !== 'all') {
      filter.type = type;
    }

    return Activity.find(filter).sort({ createdAt: -1 });
  }

  async logActivity(dto: CreateActivityDto): Promise<IActivity> {
    const nowFormatted = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    return Activity.create({
      activityId: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      citizenId: dto.citizenId || 'system',
      applicationId: dto.applicationId,
      serviceName: dto.serviceName,
      departmentName: dto.departmentName,
      action: dto.action,
      details: dto.details,
      type: dto.type,
      statusBadge: dto.statusBadge,
      timestamp: nowFormatted,
      metadata: dto.metadata || {},
    });
  }
}

export const activityService = new ActivityService();
