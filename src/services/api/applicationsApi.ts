import { apiClient } from './client';
import { Application, TimelineEvent } from '../../types';

export interface SubmitApplicationPayload {
  serviceId: string;
  prefilledFields: Record<string, { value: string; source: string; verified: boolean }>;
  userFields: Record<string, string>;
  attachedDocs: { name: string; docType: string; source: string; verified: boolean; docNumber?: string }[];
  citizenId?: string;
}

export const applicationsApi = {
  async getAll(citizenId: string = 'cit-001'): Promise<Application[]> {
    const res = await apiClient<{ success: boolean; count: number; data: any[] }>(
      `/applications?citizenId=${citizenId}`
    );
    return res.data.map((app) => ({
      id: app.applicationId || app.id,
      serviceId: app.serviceId,
      serviceName: app.serviceName,
      departmentId: app.departmentId,
      departmentName: app.departmentName,
      citizenId: app.citizenId,
      citizenName: app.citizenName,
      status: app.status,
      submittedAt: app.submittedAt,
      updatedAt: app.updatedAt || app.submittedAt,
      prefilledFields: app.prefilledFields || {},
      userFields: app.userFields || {},
      timeline: app.timeline || [],
      documentsAttached: app.documentsAttached || [],
    }));
  },

  async getById(applicationId: string): Promise<Application> {
    const res = await apiClient<{ success: boolean; data: any }>(`/applications/${applicationId}`);
    const app = res.data;
    return {
      id: app.applicationId || app.id,
      serviceId: app.serviceId,
      serviceName: app.serviceName,
      departmentId: app.departmentId,
      departmentName: app.departmentName,
      citizenId: app.citizenId,
      citizenName: app.citizenName,
      status: app.status,
      submittedAt: app.submittedAt,
      updatedAt: app.updatedAt || app.submittedAt,
      prefilledFields: app.prefilledFields || {},
      userFields: app.userFields || {},
      timeline: app.timeline || [],
      documentsAttached: app.documentsAttached || [],
    };
  },

  async submit(payload: SubmitApplicationPayload): Promise<Application> {
    const res = await apiClient<{ success: boolean; data: any; message: string }>('/applications', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const app = res.data;
    return {
      id: app.applicationId || app.id,
      serviceId: app.serviceId,
      serviceName: app.serviceName,
      departmentId: app.departmentId,
      departmentName: app.departmentName,
      citizenId: app.citizenId,
      citizenName: app.citizenName,
      status: app.status,
      submittedAt: app.submittedAt,
      updatedAt: app.updatedAt || app.submittedAt,
      prefilledFields: app.prefilledFields || {},
      userFields: app.userFields || {},
      timeline: app.timeline || [],
      documentsAttached: app.documentsAttached || [],
    };
  },

  async advanceStatus(applicationId: string): Promise<Application> {
    const res = await apiClient<{ success: boolean; data: any; message: string }>(
      `/applications/${applicationId}`,
      {
        method: 'PUT',
      }
    );
    const app = res.data;
    return {
      id: app.applicationId || app.id,
      serviceId: app.serviceId,
      serviceName: app.serviceName,
      departmentId: app.departmentId,
      departmentName: app.departmentName,
      citizenId: app.citizenId,
      citizenName: app.citizenName,
      status: app.status,
      submittedAt: app.submittedAt,
      updatedAt: app.updatedAt || app.submittedAt,
      prefilledFields: app.prefilledFields || {},
      userFields: app.userFields || {},
      timeline: app.timeline || [],
      documentsAttached: app.documentsAttached || [],
    };
  },

  async getTimeline(applicationId: string): Promise<TimelineEvent[]> {
    const res = await apiClient<{ success: boolean; count: number; data: TimelineEvent[] }>(
      `/applications/${applicationId}/timeline`
    );
    return res.data;
  },
};
