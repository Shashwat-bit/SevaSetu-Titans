export type ApplicationStatus =
  | 'Draft'
  | 'Submitted'
  | 'Under Verification'
  | 'Under Review'
  | 'Approved'
  | 'Rejected'
  | 'Completed';

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
  docId?: string;
  name: string;
  docType: string;
  source: string;
  verified: boolean;
  docNumber?: string;
  verificationStatus?: 'PENDING' | 'VERIFIED' | 'REJECTED';
  verifiedBy?: string; // Authenticated officer User ID (req.user.id / _id), NOT citizenId
  verifiedByName?: string;
  verifiedDepartment?: string;
  verifiedAt?: string;
  rejectionReason?: string;
}

export interface OfficerRemark {
  id: string;
  applicationId: string;
  officerId: string; // Authenticated officer User ID (req.user.id / _id), NOT citizenId
  officerName: string;
  departmentId: string;
  role: string;
  text: string;
  timestamp: string;
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
  officerRemarks?: OfficerRemark[];
  assignedOfficerId?: string;
  assignedOfficerName?: string;
  departmentReferenceId?: string; // Simulated Department Reference Ack ID (e.g. "EDU-MOCK-2026-00123")
  consentId?: string; // Associated citizen consent ID
}

export interface OfficerDashboardStats {
  officer: {
    name: string;
    email: string;
    role: string;
    departmentId: string;
    departmentName: string;
  };
  stats: {
    total: number;
    pendingVerification: number;
    underReview: number;
    approved: number;
    rejected: number;
  };
  recentApplications: Application[];
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
  type:
    | 'submission'
    | 'document_access'
    | 'verification'
    | 'consent_grant'
    | 'consent_revoke'
    | 'status_change'
    | 'officer_remark'
    | 'document_requested'
    | 'document_fetched'
    | 'document_exchanged'
    | 'data_access_denied'
    | 'adapter_request'
    | 'adapter_response';
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
  normalizedType?: string;
  maskedReferenceNumber?: string;
  available?: boolean;
}

export interface DataExchange {
  id?: string;
  exchangeId: string;
  applicationId: string;
  citizenId: string;
  documentId: string;
  documentType: string;
  normalizedType: string;
  sourceSystem: string;
  targetDepartment: string;
  purpose: string;
  consentId?: string;
  requestedAt: string;
  accessedAt?: string;
  status: 'REQUESTED' | 'AUTHORIZED' | 'FETCHED' | 'VERIFIED' | 'DENIED' | 'FAILED';
  requestedBy: string;
  requestedByName: string;
  metadata?: Record<string, any>;
}

export interface SimulatedAdapterHealth {
  id: string;
  name: string;
  type: 'DOCUMENT_SOURCE' | 'DEPARTMENT_SYSTEM';
  status: 'CONNECTED' | 'AVAILABLE' | 'DEGRADED' | 'DISCONNECTED';
  protocol: string;
  latencyMs: number;
  lastPing: string;
  isMock: true;
  label: string;
}

export interface ServiceRequirements {
  serviceId: string;
  serviceTitle: string;
  departmentId: string;
  departmentName: string;
  category?: string;
  processingDays?: string;
  fee?: string;
  requiredDocuments: string[];
  requiredFields: string[];
  normalizedRequiredTypes: string[];
}

export type NotificationType =
  | 'application_submitted'
  | 'status_change'
  | 'application_approved'
  | 'application_rejected'
  | 'consent_revoked'
  | 'document_verified'
  | 'document_rejected'
  | 'system';

export interface NotificationItem {
  id?: string;
  notificationId: string;
  recipientRole: 'citizen' | 'officer' | 'admin';
  citizenId?: string;
  departmentId?: string;
  applicationId?: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  readAt?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface AdminOverviewStats {
  stats: {
    totalApplications: number;
    totalCitizens: number;
    totalOfficers: number;
    totalDepartments: number;
    totalServices: number;
    totalConsents: number;
    totalExchanges: number;
    totalActivities: number;
  };
  adapterHealth: SimulatedAdapterHealth[];
}

export interface ApplicationAnalytics {
  totalApplications: number;
  approvalRate: number;
  approvedCount: number;
  rejectedCount: number;
  pendingCount: number;
  byStatus: { status: string; count: number }[];
  byDepartment: { departmentId: string; departmentName: string; count: number }[];
  byService: { serviceId: string; serviceName: string; departmentName?: string; count: number }[];
}

export interface ConsentAnalytics {
  total: number;
  active: number;
  revoked: number;
  expired: number;
  denied: number;
  activeRate: number;
  revocationRate: number;
  byDepartment: { departmentId: string; whoHasAccess: string; count: number }[];
}

export interface DataExchangeAnalytics {
  total: number;
  fetched: number;
  denied: number;
  successRate: number;
  byTargetDepartment: { departmentId: string; count: number }[];
  bySourceSystem: { sourceSystem: string; count: number }[];
  byNormalizedType: { normalizedType: string; count: number }[];
}

export interface ProcessingMetrics {
  totalDocumentsProcessed: number;
  verifiedDocuments: number;
  rejectedDocuments: number;
  pendingDocuments: number;
  documentVerificationRate: number;
}

export interface AnalyticsData {
  applications: ApplicationAnalytics;
  consents: ConsentAnalytics;
  exchanges: DataExchangeAnalytics;
  processing: ProcessingMetrics;
}

export interface DepartmentAnalyticsMetric {
  departmentId: string;
  departmentName: string;
  code: string;
  totalApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  pendingApplications: number;
  officersCount: number;
  approvalRate: number;
}

