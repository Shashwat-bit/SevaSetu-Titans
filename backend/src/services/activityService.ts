import { Activity, IActivity } from '../models/Activity';

export interface CreateActivityDto {
  citizenId?: string;
  applicationId?: string;
  serviceName: string;
  departmentName: string;
  action: string;
  details: string;
  type: 'submission' | 'document_access' | 'verification' | 'consent_grant' | 'consent_revoke' | 'status_change';
  statusBadge: string;
  metadata?: Record<string, any>;
}

export class ActivityService {
  async getActivities(citizenId: string = 'cit-001', type?: string): Promise<IActivity[]> {
    const filter: Record<string, any> = { citizenId };
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
      citizenId: dto.citizenId || 'cit-001',
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
