import { apiClient } from './client';
import {
  AdminOverviewStats,
  AnalyticsData,
  DepartmentAnalyticsMetric,
  ConsentPermission,
  AuditActivity,
} from '../../types';

export const adminApi = {
  async getOverview(): Promise<AdminOverviewStats> {
    const res = await apiClient<{ success: boolean; data: AdminOverviewStats }>('/admin/overview');
    return res.data;
  },

  async getAnalytics(): Promise<AnalyticsData> {
    const res = await apiClient<{ success: boolean; data: AnalyticsData }>('/admin/analytics');
    return res.data;
  },

  async getDepartmentAnalytics(): Promise<DepartmentAnalyticsMetric[]> {
    const res = await apiClient<{ success: boolean; data: DepartmentAnalyticsMetric[] }>('/admin/departments');
    return res.data;
  },

  async getConsents(status?: string, departmentId?: string): Promise<ConsentPermission[]> {
    const params = new URLSearchParams();
    if (status && status !== 'all') params.append('status', status);
    if (departmentId && departmentId !== 'all') params.append('departmentId', departmentId);

    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await apiClient<{ success: boolean; data: any[] }>(`/admin/consents${query}`);
    return res.data.map((c) => ({
      id: c.consentId || c.id,
      whoHasAccess: c.whoHasAccess,
      departmentId: c.departmentId,
      whatData: c.whatData,
      whyPurpose: c.whyPurpose,
      whichApplicationId: c.whichApplicationId,
      whichServiceName: c.whichServiceName,
      fromWhen: c.fromWhen,
      untilWhen: c.untilWhen,
      status: c.status,
      revokedAt: c.revokedAt,
    }));
  },

  async getActivities(type?: string, departmentName?: string): Promise<AuditActivity[]> {
    const params = new URLSearchParams();
    if (type && type !== 'all') params.append('type', type);
    if (departmentName && departmentName !== 'all') params.append('departmentName', departmentName);

    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await apiClient<{ success: boolean; data: any[] }>(`/admin/activities${query}`);
    return res.data.map((a) => ({
      id: a.activityId || a.id,
      timestamp: a.timestamp,
      serviceName: a.serviceName,
      departmentName: a.departmentName,
      action: a.action,
      details: a.details,
      type: a.type,
      statusBadge: a.statusBadge,
    }));
  },
};
