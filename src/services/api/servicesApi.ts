import { apiClient } from './client';
import { ServiceItem } from '../../types';

export interface GetServicesResponse {
  success: boolean;
  count: number;
  data: any[];
}

export interface GetServiceResponse {
  success: boolean;
  data: any;
}

export const servicesApi = {
  async getAll(category?: string): Promise<ServiceItem[]> {
    const query = category && category !== 'all' ? `?category=${encodeURIComponent(category)}` : '';
    const res = await apiClient<GetServicesResponse>(`/services${query}`);
    return res.data.map((s) => ({
      id: s.serviceId || s.id,
      title: s.title,
      departmentId: s.departmentId,
      departmentName: s.departmentName,
      category: s.category,
      categoryLabel: s.categoryLabel,
      description: s.description,
      requiredDocs: s.requiredDocs,
      requiredFields: s.requiredFields,
      processingDays: s.processingDays,
      fee: s.fee,
      eligibility: s.eligibility,
      popular: s.popular,
    }));
  },

  async getById(id: string): Promise<ServiceItem> {
    const res = await apiClient<GetServiceResponse>(`/services/${id}`);
    const s = res.data;
    return {
      id: s.serviceId || s.id,
      title: s.title,
      departmentId: s.departmentId,
      departmentName: s.departmentName,
      category: s.category,
      categoryLabel: s.categoryLabel,
      description: s.description,
      requiredDocs: s.requiredDocs,
      requiredFields: s.requiredFields,
      processingDays: s.processingDays,
      fee: s.fee,
      eligibility: s.eligibility,
      popular: s.popular,
    };
  },
};
