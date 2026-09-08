export interface AdapterDispatchResult {
  success: boolean;
  departmentAckId: string;
  departmentCode: string;
  dispatchTimestamp: string;
  message: string;
  isMockAdapter: true;
}

export interface DepartmentStatusResult {
  ackId: string;
  state: string;
  queuePosition?: number;
  lastUpdated: string;
}

export interface IDepartmentAdapter {
  departmentCode: string;
  departmentName: string;
  dispatchApplication(service: { id: string; title: string; departmentId: string; departmentName: string }, payload: any): Promise<AdapterDispatchResult>;
  queryApplicationStatus(departmentAckId: string): Promise<DepartmentStatusResult>;
}

export interface VerifiedCredential {
  id: string;
  name: string;
  docType: string;
  issuer: string;
  issueDate: string;
  docNumber: string;
  verified: boolean;
  category: 'identity' | 'education' | 'income' | 'address' | 'transport';
}

export interface IDocumentSourceAdapter {
  sourceName: string;
  fetchVerifiedCredentials(citizenId: string, requestedDocTypes: string[]): Promise<VerifiedCredential[]>;
  verifyCredentialHash(docId: string): Promise<{ verified: boolean; issuerSignature: string }>;
}
