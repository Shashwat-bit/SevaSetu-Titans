import {
  Citizen,
  Application,
  ConsentPermission,
  AuditActivity,
  DigiLockerMockDocument,
  ApplicationStatus,
  TimelineEvent,
  ServiceItem,
} from '../types';
import {
  INITIAL_CITIZEN,
  INITIAL_APPLICATIONS,
  INITIAL_PERMISSIONS,
  INITIAL_ACTIVITIES,
  MOCK_DIGILOCKER_DOCS,
  MOCK_SERVICES,
} from '../data/mockData';

const STORAGE_KEYS = {
  CITIZEN: 'sevasetu_citizen_v2',
  APPLICATIONS: 'sevasetu_applications_v2',
  PERMISSIONS: 'sevasetu_permissions_v2',
  ACTIVITIES: 'sevasetu_activities_v2',
  DIGILOCKER_DOCS: 'sevasetu_digilocker_docs_v2',
};

class AdapterStore {
  private citizen: Citizen;
  private applications: Application[];
  private permissions: ConsentPermission[];
  private activities: AuditActivity[];
  private digiLockerDocs: DigiLockerMockDocument[];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.citizen = this.load(STORAGE_KEYS.CITIZEN, INITIAL_CITIZEN);
    this.applications = this.load(STORAGE_KEYS.APPLICATIONS, INITIAL_APPLICATIONS);
    this.permissions = this.load(STORAGE_KEYS.PERMISSIONS, INITIAL_PERMISSIONS);
    this.activities = this.load(STORAGE_KEYS.ACTIVITIES, INITIAL_ACTIVITIES);
    this.digiLockerDocs = this.load(STORAGE_KEYS.DIGILOCKER_DOCS, MOCK_DIGILOCKER_DOCS);
  }

  private load<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.warn(`Failed to read ${key} from localStorage, using default`, e);
      return defaultValue;
    }
  }

  private persist(key: string, value: any) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Failed to persist ${key} to localStorage`, e);
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  // Citizen & DigiLocker Connection
  public getCitizen(): Citizen {
    return { ...this.citizen };
  }

  public connectDigiLocker(): void {
    this.citizen.isDigiLockerConnected = true;
    this.citizen.connectedAt = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    this.persist(STORAGE_KEYS.CITIZEN, this.citizen);

    this.addActivity({
      serviceName: 'DigiLocker Interoperability Adapter',
      departmentName: 'DigiLocker (Mock Node)',
      action: 'DigiLocker account linked successfully',
      details: 'Mock adapter connected with Aadhaar, Marksheet, and Address verified credentials',
      type: 'consent_grant',
      statusBadge: 'Connected',
    });

    this.notify();
  }

  public disconnectDigiLocker(): void {
    this.citizen.isDigiLockerConnected = false;
    this.persist(STORAGE_KEYS.CITIZEN, this.citizen);

    this.addActivity({
      serviceName: 'DigiLocker Interoperability Adapter',
      departmentName: 'DigiLocker (Mock Node)',
      action: 'DigiLocker account disconnected',
      details: 'Digital credentials link removed from SevaSetu session',
      type: 'consent_revoke',
      statusBadge: 'Disconnected',
    });

    this.notify();
  }

  // Documents
  public getDigiLockerDocs(): DigiLockerMockDocument[] {
    return [...this.digiLockerDocs];
  }

  // Applications
  public getApplications(): Application[] {
    return [...this.applications];
  }

  public getApplicationById(id: string): Application | undefined {
    return this.applications.find((app) => app.id === id);
  }

  public submitApplication(params: {
    service: ServiceItem;
    prefilledFields: Record<string, { value: string; source: string; verified: boolean }>;
    userFields: Record<string, string>;
    attachedDocs: { name: string; docType: string; source: string; verified: boolean; docNumber?: string }[];
  }): Application {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newId = `SS-2026-${randomSuffix}`;
    const now = new Date();
    const formattedNow = now.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const timeline: TimelineEvent[] = [
      {
        id: 'tl-1',
        title: 'Application Submitted',
        timestamp: formattedNow,
        description: `Dispatched through SevaSetu Interoperability Layer to ${params.service.departmentName} Adapter.`,
        status: 'completed',
      },
      {
        id: 'tl-2',
        title: 'Documents Received',
        timestamp: formattedNow,
        description: 'Authorized digital payloads ingested from connected DigiLocker Mock Adapter.',
        status: 'completed',
      },
      {
        id: 'tl-3',
        title: 'Document Verification',
        timestamp: 'In Progress',
        description: 'Cross-referencing digital hashes with department registry.',
        status: 'current',
      },
      {
        id: 'tl-4',
        title: 'Department Review',
        timestamp: 'Pending',
        description: `Designated desk officer at ${params.service.departmentName} will review application.`,
        status: 'pending',
      },
      {
        id: 'tl-5',
        title: 'Approval & Issuance',
        timestamp: 'Pending',
        description: 'Final authorization and certificate/subsidy generation.',
        status: 'pending',
      },
    ];

    const newApplication: Application = {
      id: newId,
      serviceId: params.service.id,
      serviceName: params.service.title,
      departmentId: params.service.departmentId,
      departmentName: params.service.departmentName,
      citizenId: this.citizen.id,
      citizenName: this.citizen.name,
      status: 'Submitted',
      submittedAt: formattedNow,
      updatedAt: formattedNow,
      prefilledFields: params.prefilledFields,
      userFields: params.userFields,
      documentsAttached: params.attachedDocs,
      timeline,
    };

    // Prepend to applications
    this.applications = [newApplication, ...this.applications];
    this.persist(STORAGE_KEYS.APPLICATIONS, this.applications);

    // Create corresponding Granular Consent Record
    const validUntilDate = new Date();
    validUntilDate.setMonth(validUntilDate.getMonth() + 6);
    const formattedUntil = validUntilDate.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const whatDataList = Object.keys(params.prefilledFields);
    params.attachedDocs.forEach((d) => {
      if (!whatDataList.includes(d.name)) whatDataList.push(d.name);
    });

    const newPermission: ConsentPermission = {
      id: `perm-${Date.now()}`,
      whoHasAccess: `${params.service.departmentName}, Govt. of India`,
      departmentId: params.service.departmentId,
      whatData: whatDataList,
      whyPurpose: `${params.service.title} eligibility verification and credential processing`,
      whichApplicationId: newId,
      whichServiceName: params.service.title,
      fromWhen: formattedNow,
      untilWhen: formattedUntil,
      status: 'Active',
    };

    this.permissions = [newPermission, ...this.permissions];
    this.persist(STORAGE_KEYS.PERMISSIONS, this.permissions);

    // Log Activity
    this.addActivity({
      serviceName: params.service.title,
      departmentName: params.service.departmentName,
      action: `Application submitted - ${newId}`,
      details: `Dispatched via SevaSetu Interoperability Layer to ${params.service.departmentName}`,
      type: 'submission',
      statusBadge: 'Submitted',
    });

    this.addActivity({
      serviceName: params.service.title,
      departmentName: params.service.departmentName,
      action: `Consent granted for ${params.service.title}`,
      details: `Citizen authorized ${params.service.departmentName} to use pre-filled credentials until ${formattedUntil}`,
      type: 'consent_grant',
      statusBadge: 'Consent Granted',
    });

    this.notify();
    return newApplication;
  }

  // Advance application status for demo demonstration
  public advanceApplicationStatus(applicationId: string): Application | undefined {
    const app = this.applications.find((a) => a.id === applicationId);
    if (!app) return undefined;

    const statusFlow: ApplicationStatus[] = [
      'Submitted',
      'Under Verification',
      'Under Review',
      'Approved',
    ];

    const currentIndex = statusFlow.indexOf(app.status);
    if (currentIndex < statusFlow.length - 1) {
      const nextStatus = statusFlow[currentIndex + 1];
      app.status = nextStatus;
      const nowFormatted = new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      app.updatedAt = nowFormatted;

      // Update timeline items
      if (nextStatus === 'Under Verification') {
        app.timeline[2].status = 'completed';
        app.timeline[2].timestamp = nowFormatted;
        app.timeline[3].status = 'current';
      } else if (nextStatus === 'Under Review') {
        app.timeline[3].status = 'completed';
        app.timeline[3].timestamp = nowFormatted;
        app.timeline[4].status = 'current';
      } else if (nextStatus === 'Approved') {
        app.timeline[4].status = 'completed';
        app.timeline[4].timestamp = nowFormatted;
      }

      this.persist(STORAGE_KEYS.APPLICATIONS, this.applications);

      this.addActivity({
        serviceName: app.serviceName,
        departmentName: app.departmentName,
        action: `Application status updated to ${nextStatus}`,
        details: `Simulated adapter event: ${app.id} progressed to ${nextStatus}`,
        type: 'status_change',
        statusBadge: nextStatus,
      });

      this.notify();
    }

    return app;
  }

  // Permissions & Consent
  public getPermissions(): ConsentPermission[] {
    return [...this.permissions];
  }

  public revokePermission(permissionId: string): boolean {
    const permission = this.permissions.find((p) => p.id === permissionId);
    if (!permission) return false;

    permission.status = 'Access Revoked';
    permission.revokedAt = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    this.persist(STORAGE_KEYS.PERMISSIONS, this.permissions);

    // Add activity
    this.addActivity({
      serviceName: permission.whichServiceName,
      departmentName: permission.whoHasAccess,
      action: `Consent revoked for ${permission.whichServiceName}`,
      details: `Citizen revoked data access for application ${permission.whichApplicationId}. Department adapter access terminated.`,
      type: 'consent_revoke',
      statusBadge: 'Access Revoked',
    });

    this.notify();
    return true;
  }

  // Activities
  public getActivities(): AuditActivity[] {
    return [...this.activities];
  }

  public addActivity(params: Omit<AuditActivity, 'id' | 'timestamp'>): void {
    const newActivity: AuditActivity = {
      id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      ...params,
    };

    this.activities = [newActivity, ...this.activities];
    this.persist(STORAGE_KEYS.ACTIVITIES, this.activities);
  }

  // Reset Demo State
  public resetDemoData(): void {
    this.citizen = { ...INITIAL_CITIZEN };
    this.applications = JSON.parse(JSON.stringify(INITIAL_APPLICATIONS));
    this.permissions = JSON.parse(JSON.stringify(INITIAL_PERMISSIONS));
    this.activities = JSON.parse(JSON.stringify(INITIAL_ACTIVITIES));
    this.digiLockerDocs = JSON.parse(JSON.stringify(MOCK_DIGILOCKER_DOCS));

    this.persist(STORAGE_KEYS.CITIZEN, this.citizen);
    this.persist(STORAGE_KEYS.APPLICATIONS, this.applications);
    this.persist(STORAGE_KEYS.PERMISSIONS, this.permissions);
    this.persist(STORAGE_KEYS.ACTIVITIES, this.activities);
    this.persist(STORAGE_KEYS.DIGILOCKER_DOCS, this.digiLockerDocs);

    this.notify();
  }
}

export const adapterStore = new AdapterStore();
