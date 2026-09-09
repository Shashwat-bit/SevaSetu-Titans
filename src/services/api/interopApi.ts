import { apiClient } from './client';
import { SimulatedAdapterHealth, DigiLockerMockDocument, DataExchange, ServiceRequirements } from '../../types';

export const interopApi = {
  async getAdapterStatuses(): Promise<SimulatedAdapterHealth[]> {
    const res = await apiClient<{ success: boolean; data: SimulatedAdapterHealth[]; isSimulation: boolean }>(
      '/interop/adapters'
    );
    return res.data;
  },

  async getCitizenVault(): Promise<DigiLockerMockDocument[]> {
    const res = await apiClient<{ success: boolean; count: number; data: DigiLockerMockDocument[] }>(
      '/interop/vault'
    );
    return res.data;
  },

  async getDataExchanges(applicationId?: string): Promise<DataExchange[]> {
    const endpoint = applicationId ? `/interop/exchanges?applicationId=${applicationId}` : '/interop/exchanges';
    const res = await apiClient<{ success: boolean; count: number; data: DataExchange[] }>(endpoint);
    return res.data;
  },

  async requestDocumentExchange(
    applicationId: string,
    documentId: string,
    purpose?: string
  ): Promise<{ exchange: DataExchange; document: any }> {
    const res = await apiClient<{ success: boolean; data: { exchange: DataExchange; document: any }; message: string }>(
      '/interop/exchange/request',
      {
        method: 'POST',
        body: JSON.stringify({ applicationId, documentId, purpose }),
      }
    );
    return res.data;
  },

  async getServiceRequirements(serviceId: string): Promise<ServiceRequirements> {
    const res = await apiClient<{ success: boolean; data: ServiceRequirements }>(
      `/services/${serviceId}/requirements`
    );
    return res.data;
  },
};
