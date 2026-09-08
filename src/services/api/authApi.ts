import { apiClient } from './client';
import { Citizen, UserRole } from '../../types';

export interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    user: Citizen & { role: UserRole; departmentId?: string };
  };
  message: string;
}

export interface DemoSwitchResponse {
  success: boolean;
  data: {
    token: string;
    user: Citizen & { role: UserRole; departmentId?: string };
    message: string;
  };
  notice: string;
}

export const authApi = {
  async login(email: string, password: string): Promise<{ token: string; user: Citizen }> {
    const res = await apiClient<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return {
      token: res.data.token,
      user: {
        ...res.data.user,
        id: res.data.user.id || (res.data.user as any).citizenId,
      },
    };
  },

  async demoSwitch(persona: 'citizen' | 'officer-edu' | 'officer-rev' | 'officer-trans' | 'admin'): Promise<{ token: string; user: Citizen }> {
    const res = await apiClient<DemoSwitchResponse>('/auth/demo-switch', {
      method: 'POST',
      body: JSON.stringify({ persona }),
    });
    return {
      token: res.data.token,
      user: {
        ...res.data.user,
        id: res.data.user.id || (res.data.user as any).citizenId,
      },
    };
  },

  async getMe(): Promise<Citizen> {
    const res = await apiClient<{ success: boolean; data: any }>('/auth/me');
    const u = res.data;
    return {
      id: u.id || u.citizenId,
      name: u.name,
      email: u.email,
      phone: u.phone || '',
      maskedAadhaar: u.maskedAadhaar || '',
      address: u.address || '',
      dateOfBirth: u.dateOfBirth || '',
      gender: u.gender || '',
      isDigiLockerConnected: u.isDigiLockerConnected || false,
      connectedAt: u.connectedAt,
      role: u.role,
      departmentId: u.departmentId,
    };
  },
};
