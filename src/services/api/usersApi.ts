import { apiClient } from './client';
import { Citizen } from '../../types';

export const usersApi = {
  async getMe(): Promise<Citizen> {
    const res = await apiClient<{ success: boolean; data: any }>('/users/me');
    const u = res.data;
    return {
      id: u.citizenId || u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      maskedAadhaar: u.maskedAadhaar,
      address: u.address,
      dateOfBirth: u.dateOfBirth,
      gender: u.gender,
      isDigiLockerConnected: u.isDigiLockerConnected,
      connectedAt: u.connectedAt,
    };
  },

  async connectDigiLocker(): Promise<Citizen> {
    const res = await apiClient<{ success: boolean; data: any; message: string }>(
      '/users/me/connect-digilocker',
      {
        method: 'POST',
      }
    );
    const u = res.data;
    return {
      id: u.citizenId || u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      maskedAadhaar: u.maskedAadhaar,
      address: u.address,
      dateOfBirth: u.dateOfBirth,
      gender: u.gender,
      isDigiLockerConnected: u.isDigiLockerConnected,
      connectedAt: u.connectedAt,
    };
  },

  async disconnectDigiLocker(): Promise<Citizen> {
    const res = await apiClient<{ success: boolean; data: any; message: string }>(
      '/users/me/disconnect-digilocker',
      {
        method: 'POST',
      }
    );
    const u = res.data;
    return {
      id: u.citizenId || u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      maskedAadhaar: u.maskedAadhaar,
      address: u.address,
      dateOfBirth: u.dateOfBirth,
      gender: u.gender,
      isDigiLockerConnected: u.isDigiLockerConnected,
      connectedAt: u.connectedAt,
    };
  },

  async resetSeed(): Promise<{ success: boolean; message: string }> {
    return apiClient<{ success: boolean; message: string }>('/seed', {
      method: 'POST',
    });
  },
};
