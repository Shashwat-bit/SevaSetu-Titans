import { apiClient } from './client';
import { Department } from '../../types';

export interface GetDepartmentsResponse {
  success: boolean;
  count: number;
  data: any[];
}

export const departmentsApi = {
  async getAll(): Promise<Department[]> {
    const res = await apiClient<GetDepartmentsResponse>('/departments');
    return res.data.map((d) => ({
      id: d.departmentId || d.id,
      name: d.name,
      code: d.code,
      shortName: d.shortName,
      category: d.category,
      description: d.description,
      adapterStatus: d.adapterStatus,
    }));
  },

  async getById(id: string): Promise<Department> {
    const res = await apiClient<{ success: boolean; data: any }>(`/departments/${id}`);
    const d = res.data;
    return {
      id: d.departmentId || d.id,
      name: d.name,
      code: d.code,
      shortName: d.shortName,
      category: d.category,
      description: d.description,
      adapterStatus: d.adapterStatus,
    };
  },
};
