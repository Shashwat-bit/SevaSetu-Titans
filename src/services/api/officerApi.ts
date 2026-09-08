import { apiClient } from './client';
import { Application, OfficerDashboardStats, OfficerRemark, ApplicationDocument } from '../../types';

export interface OfficerApplicationsFilter {
  q?: string;
  status?: string;
  service?: string;
  sort?: string;
}

function mapApplication(app: any): Application {
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
    documentsAttached: (app.documentsAttached || []).map((d: any) => ({
      docId: d.docId,
      name: d.name,
      docType: d.docType,
      source: d.source,
      verified: d.verified,
      docNumber: d.docNumber,
      verificationStatus: d.verificationStatus || (d.verified ? 'VERIFIED' : 'PENDING'),
      verifiedBy: d.verifiedBy,
      verifiedByName: d.verifiedByName,
      verifiedDepartment: d.verifiedDepartment,
      verifiedAt: d.verifiedAt,
      rejectionReason: d.rejectionReason,
    })),
    officerRemarks: app.officerRemarks || [],
    assignedOfficerId: app.assignedOfficerId,
    assignedOfficerName: app.assignedOfficerName,
  };
}

export const officerApi = {
  async getDashboard(): Promise<OfficerDashboardStats> {
    const res = await apiClient<{ success: boolean; data: any }>('/officer/dashboard');
    const data = res.data;
    return {
      officer: data.officer,
      stats: data.stats,
      recentApplications: (data.recentApplications || []).map(mapApplication),
    };
  },

  async getApplications(params?: OfficerApplicationsFilter): Promise<Application[]> {
    const query = new URLSearchParams();
    if (params?.q) query.append('q', params.q);
    if (params?.status) query.append('status', params.status);
    if (params?.service) query.append('service', params.service);
    if (params?.sort) query.append('sort', params.sort);

    const queryString = query.toString();
    const endpoint = queryString ? `/officer/applications?${queryString}` : '/officer/applications';
    const res = await apiClient<{ success: boolean; count: number; data: any[] }>(endpoint);
    return res.data.map(mapApplication);
  },

  async getApplicationById(applicationId: string): Promise<Application> {
    const res = await apiClient<{ success: boolean; data: any }>(`/officer/applications/${applicationId}`);
    return mapApplication(res.data);
  },

  async verifyDocument(
    applicationId: string,
    documentId: string
  ): Promise<{ application: Application; document: ApplicationDocument }> {
    const res = await apiClient<{ success: boolean; data: any; application: any; message: string }>(
      `/officer/applications/${applicationId}/documents/${encodeURIComponent(documentId)}/verify`,
      {
        method: 'POST',
      }
    );
    return {
      application: mapApplication(res.application),
      document: res.data,
    };
  },

  async rejectDocument(
    applicationId: string,
    documentId: string,
    reason: string
  ): Promise<{ application: Application; document: ApplicationDocument }> {
    const res = await apiClient<{ success: boolean; data: any; application: any; message: string }>(
      `/officer/applications/${applicationId}/documents/${encodeURIComponent(documentId)}/reject`,
      {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }
    );
    return {
      application: mapApplication(res.application),
      document: res.data,
    };
  },

  async addRemark(
    applicationId: string,
    text: string
  ): Promise<{ remark: OfficerRemark; application: Application }> {
    const res = await apiClient<{ success: boolean; data: any; application: any; message: string }>(
      `/officer/applications/${applicationId}/remarks`,
      {
        method: 'POST',
        body: JSON.stringify({ text }),
      }
    );
    return {
      remark: res.data,
      application: mapApplication(res.application),
    };
  },

  async updateStatus(
    applicationId: string,
    status: string,
    reason?: string
  ): Promise<Application> {
    const res = await apiClient<{ success: boolean; data: any; message: string }>(
      `/officer/applications/${applicationId}/status`,
      {
        method: 'POST',
        body: JSON.stringify({ status, reason }),
      }
    );
    return mapApplication(res.data);
  },
};
