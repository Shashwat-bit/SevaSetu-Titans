export interface AdapterDispatchResult {
  success: boolean;
  departmentAckId: string;
  departmentReferenceId?: string;
  departmentCode: string;
  dispatchTimestamp: string;
  message: string;
  isMockAdapter: true;
  status?: string;
  receivedAt?: string;
  department?: string;
}

export interface DepartmentStatusResult {
  ackId: string;
  state: string;
  queuePosition?: number;
  lastUpdated: string;
  departmentReferenceId?: string;
}

export interface ServiceRequirements {
  serviceId: string;
  serviceTitle: string;
  departmentId: string;
  departmentName: string;
  requiredDocuments: string[];
  requiredFields: string[];
  normalizedRequiredTypes: string[];
}

export interface IDepartmentAdapter {
  departmentCode: string;
  departmentName: string;
  submitApplication(
    service: { id: string; title: string; departmentId: string; departmentName: string },
    payload: any
  ): Promise<AdapterDispatchResult>;
  dispatchApplication(
    service: { id: string; title: string; departmentId: string; departmentName: string },
    payload: any
  ): Promise<AdapterDispatchResult>;
  getApplicationStatus(departmentAckId: string): Promise<DepartmentStatusResult>;
  queryApplicationStatus(departmentAckId: string): Promise<DepartmentStatusResult>;
  getRequiredDocuments(serviceId: string): Promise<string[]>;
  getServiceData(serviceId: string): Promise<{ serviceId: string; requiredDocuments: string[]; requiredFields: string[] }>;
}

export interface VerifiedCredential {
  id: string;
  documentId?: string;
  name: string;
  documentName?: string;
  docType: string;
  documentType?: string;
  normalizedType?: string;
  issuer: string;
  issueDate: string;
  issuedDate?: string;
  docNumber: string;
  maskedReferenceNumber?: string;
  verified: boolean;
  verificationStatus?: string;
  source?: string;
  available?: boolean;
  lastUpdated?: string;
  category: 'identity' | 'education' | 'income' | 'address' | 'transport';
}

export interface IDocumentSourceAdapter {
  sourceName: string;
  connect(): Promise<{ connected: boolean; source: string; status: string }>;
  disconnect(): Promise<{ connected: boolean; status: string }>;
  getAvailableDocuments(citizenId: string): Promise<VerifiedCredential[]>;
  getDocument(citizenId: string, documentId: string): Promise<VerifiedCredential | null>;
  verifyDocument(documentId: string): Promise<{ verified: boolean; issuerSignature: string }>;
  getCitizenData(citizenId: string): Promise<Record<string, any>>;
  fetchVerifiedCredentials(citizenId: string, requestedDocTypes: string[]): Promise<VerifiedCredential[]>;
  verifyCredentialHash(docId: string): Promise<{ verified: boolean; issuerSignature: string }>;
}
