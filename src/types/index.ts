export type ApplicationStatus =
  | 'Submitted'
  | 'Under Verification'
  | 'Under Review'
  | 'Approved'
  | 'Rejected';

export type UserRole = 'citizen' | 'officer' | 'admin';

export interface Citizen {
  id: string;
  name: string;
  email: string;
  phone: string;
  maskedAadhaar: string;
  address: string;
  dateOfBirth: string;
  gender: string;
  isDigiLockerConnected: boolean;
  connectedAt?: string;
  role?: UserRole;
  departmentId?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  shortName: string;
  category: string;
  description: string;
  adapterStatus: 'Connected (Mock Adapter)' | 'Active';
}

export interface ServiceItem {
  id: string;
  title: string;
  departmentId: string;
  departmentName: string;
  category: 'scholarships' | 'certificates' | 'residence' | 'schemes' | 'transport' | 'welfare';
  categoryLabel: string;
  description: string;
  requiredDocs: string[];
  requiredFields: string[];
  processingDays: string;
  fee: string;
  eligibility: string;
  popular?: boolean;
}

export interface TimelineEvent {
  id: string;
  title: string;
  timestamp: string;
  description: string;
  status: 'completed' | 'current' | 'pending';
}

export interface ApplicationDocument {
  name: string;
  docType: string;
  source: string;
  verified: boolean;
  docNumber?: string;
}

export interface Application {
  id: string; // e.g. "SS-2026-001024"
  serviceId: string;
  serviceName: string;
  departmentId: string;
  departmentName: string;
  citizenId: string;
  citizenName: string;
  status: ApplicationStatus;
  submittedAt: string;
  updatedAt: string;
  prefilledFields: Record<string, { value: string; source: string; verified: boolean }>;
  userFields: Record<string, string>;
  timeline: TimelineEvent[];
  documentsAttached: ApplicationDocument[];
}

export interface ConsentPermission {
  id: string;
  whoHasAccess: string;
  departmentId: string;
  whatData: string[];
  whyPurpose: string;
  whichApplicationId: string;
  whichServiceName: string;
  fromWhen: string;
  untilWhen: string;
  status: 'Active' | 'Access Revoked';
  revokedAt?: string;
}

export interface AuditActivity {
  id: string;
  timestamp: string;
  serviceName: string;
  departmentName: string;
  action: string;
  details: string;
  type: 'submission' | 'document_access' | 'verification' | 'consent_grant' | 'consent_revoke' | 'status_change';
  statusBadge: string;
}

export interface DigiLockerMockDocument {
  id: string;
  name: string;
  docType: string;
  issuer: string;
  issueDate: string;
  docNumber: string;
  verified: boolean;
  category: 'identity' | 'education' | 'income' | 'address' | 'transport';
}
