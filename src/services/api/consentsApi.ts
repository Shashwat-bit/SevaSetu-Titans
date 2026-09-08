import { apiClient } from './client';
import { ConsentPermission } from '../../types';

export const consentsApi = {
  async getAll(citizenId: string = 'cit-001'): Promise<ConsentPermission[]> {
    const res = await apiClient<{ success: boolean; count: number; data: any[] }>(
      `/consents?citizenId=${citizenId}`
    );
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

  async revoke(consentId: string): Promise<ConsentPermission> {
    const res = await apiClient<{ success: boolean; data: any; message: string }>(
      `/consents/${consentId}/revoke`,
      {
        method: 'POST',
      }
    );
    const c = res.data;
    return {
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
    };
  },
};
