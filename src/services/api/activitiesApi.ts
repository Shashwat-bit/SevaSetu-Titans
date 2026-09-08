import { apiClient } from './client';
import { AuditActivity } from '../../types';

export const activitiesApi = {
  async getAll(citizenId: string = 'cit-001', type?: string): Promise<AuditActivity[]> {
    const query = type && type !== 'all' ? `&type=${encodeURIComponent(type)}` : '';
    const res = await apiClient<{ success: boolean; count: number; data: any[] }>(
      `/activities?citizenId=${citizenId}${query}`
    );
    return res.data.map((act) => ({
      id: act.activityId || act.id,
      timestamp: act.timestamp,
      serviceName: act.serviceName,
      departmentName: act.departmentName,
      action: act.action,
      details: act.details,
      type: act.type,
      statusBadge: act.statusBadge,
    }));
  },
};
