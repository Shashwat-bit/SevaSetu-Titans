import { apiClient } from './client';
import { DigiLockerMockDocument } from '../../types';

export const documentsApi = {
  async getAll(citizenId: string = 'cit-001'): Promise<DigiLockerMockDocument[]> {
    const res = await apiClient<{ success: boolean; count: number; data: any[] }>(
      `/documents?citizenId=${citizenId}`
    );
    return res.data.map((doc) => ({
      id: doc.documentId || doc.id,
      name: doc.name,
      docType: doc.docType,
      issuer: doc.issuer,
      issueDate: doc.issueDate,
      docNumber: doc.docNumber,
      verified: doc.verified,
      category: doc.category,
    }));
  },

  async sync(citizenId: string = 'cit-001'): Promise<DigiLockerMockDocument[]> {
    const res = await apiClient<{ success: boolean; message: string; count: number; data: any[] }>(
      '/documents/sync',
      {
        method: 'POST',
        body: JSON.stringify({ citizenId }),
      }
    );
    return res.data.map((doc) => ({
      id: doc.documentId || doc.id,
      name: doc.name,
      docType: doc.docType,
      issuer: doc.issuer,
      issueDate: doc.issueDate,
      docNumber: doc.docNumber,
      verified: doc.verified,
      category: doc.category,
    }));
  },

  async verify(documentId: string): Promise<{ verified: boolean; issuerSignature: string }> {
    const res = await apiClient<{ success: boolean; data: { verified: boolean; issuerSignature: string } }>(
      `/documents/${documentId}/verify`,
      {
        method: 'POST',
      }
    );
    return res.data;
  },
};
