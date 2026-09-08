import {
  Citizen,
  Application,
  ConsentPermission,
  AuditActivity,
  DigiLockerMockDocument,
  ApplicationStatus,
  TimelineEvent,
  ServiceItem,
  UserRole,
} from '../types';
import {
  INITIAL_CITIZEN,
  INITIAL_APPLICATIONS,
  INITIAL_PERMISSIONS,
  INITIAL_ACTIVITIES,
  MOCK_DIGILOCKER_DOCS,
  MOCK_SERVICES,
} from '../data/mockData';
import {
  authApi,
  usersApi,
  applicationsApi,
  consentsApi,
  activitiesApi,
  documentsApi,
  AUTH_TOKEN_KEY,
} from './api';

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
  private isAuthenticating: boolean = false;

  constructor() {
    this.citizen = this.load(STORAGE_KEYS.CITIZEN, INITIAL_CITIZEN);
    this.applications = this.load(STORAGE_KEYS.APPLICATIONS, INITIAL_APPLICATIONS);
    this.permissions = this.load(STORAGE_KEYS.PERMISSIONS, INITIAL_PERMISSIONS);
    this.activities = this.load(STORAGE_KEYS.ACTIVITIES, INITIAL_ACTIVITIES);
    this.digiLockerDocs = this.load(STORAGE_KEYS.DIGILOCKER_DOCS, MOCK_DIGILOCKER_DOCS);

    // Listen for unauthorized events to clear session
    if (typeof window !== 'undefined') {
      window.addEventListener('sevasetu-unauthorized', () => {
        this.logout();
      });
    }

    // Initialize authentication and synchronize with backend API
    this.initAuthAndSync();
  }

  private async initAuthAndSync(): Promise<void> {
    try {
      const existingToken = localStorage.getItem(AUTH_TOKEN_KEY);
      if (!existingToken) {
        // Auto-initialize demo citizen token for seamless experience
        const res = await authApi.demoSwitch('citizen');
        localStorage.setItem(AUTH_TOKEN_KEY, res.token);
        this.citizen = res.user;
        this.persist(STORAGE_KEYS.CITIZEN, this.citizen);
      }
    } catch {
      // Backend not running, continue with offline demo state
    }
    await this.syncFromBackend();
  }

  public async syncFromBackend(): Promise<void> {
    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (!token) return;

      const [user, apps, perms, acts, docs] = await Promise.all([
        authApi.getMe().catch(() => null),
        applicationsApi.getAll().catch(() => null),
        consentsApi.getAll().catch(() => null),
        activitiesApi.getAll().catch(() => null),
        documentsApi.getAll().catch(() => null),
      ]);

      let changed = false;

      if (user) {
        this.citizen = user;
        this.persist(STORAGE_KEYS.CITIZEN, this.citizen);
        changed = true;
      }

      if (apps) {
        this.applications = apps;
        this.persist(STORAGE_KEYS.APPLICATIONS, this.applications);
        changed = true;
      }

      if (perms) {
        this.permissions = perms;
        this.persist(STORAGE_KEYS.PERMISSIONS, this.permissions);
        changed = true;
      }

      if (acts) {
        this.activities = acts;
        this.persist(STORAGE_KEYS.ACTIVITIES, this.activities);
        changed = true;
      }

      if (docs) {
        this.digiLockerDocs = docs;
        this.persist(STORAGE_KEYS.DIGILOCKER_DOCS, this.digiLockerDocs);
        changed = true;
      }

      if (changed) {
        this.notify();
      }
    } catch {
      // Offline fallback
    }
  }

  // Authentication & Demo Persona Management
  public async switchPersona(persona: 'citizen' | 'officer-edu' | 'officer-rev' | 'officer-trans' | 'admin'): Promise<Citizen> {
    this.isAuthenticating = true;
    try {
      const res = await authApi.demoSwitch(persona);
      localStorage.setItem(AUTH_TOKEN_KEY, res.token);
      this.citizen = res.user;
      this.persist(STORAGE_KEYS.CITIZEN, this.citizen);
      await this.syncFromBackend();
      this.notify();
      return this.citizen;
    } finally {
      this.isAuthenticating = false;
    }
  }

  public async login(email: string, password: string): Promise<Citizen> {
    this.isAuthenticating = true;
    try {
      const res = await authApi.login(email, password);
      localStorage.setItem(AUTH_TOKEN_KEY, res.token);
      this.citizen = res.user;
      this.persist(STORAGE_KEYS.CITIZEN, this.citizen);
      await this.syncFromBackend();
      this.notify();
      return this.citizen;
    } finally {
      this.isAuthenticating = false;
    }
  }

  public logout(): void {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    this.citizen = {
      ...INITIAL_CITIZEN,
      id: 'unauthenticated',
      name: 'Guest / Signed Out',
      email: '',
      phone: '',
      maskedAadhaar: '',
      address: '',
      isDigiLockerConnected: false,
      role: 'citizen',
    };
    this.applications = [];
    this.permissions = [];
    this.activities = [];
    this.notify();
  }

  public isAuthenticated(): boolean {
    return !!localStorage.getItem(AUTH_TOKEN_KEY) && this.citizen.id !== 'unauthenticated';
  }

  public isOfficer(): boolean {
    return this.citizen.role === 'officer';
  }

  public isAdmin(): boolean {
    return this.citizen.role === 'admin';
  }

  public getRole(): UserRole {
    return this.citizen.role || 'citizen';
  }

  public getDepartmentId(): string | undefined {
    return this.citizen.departmentId;
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

    // Sync to backend
    usersApi.connectDigiLocker().catch(() => {});
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

    // Sync to backend
    usersApi.disconnectDigiLocker().catch(() => {});
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

    // Prepend to applications immediately
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

    // Async persist to MongoDB backend API
    applicationsApi
      .submit({
        serviceId: params.service.id,
        prefilledFields: params.prefilledFields,
        userFields: params.userFields,
        attachedDocs: params.attachedDocs,
      })
      .then((serverApp) => {
        const idx = this.applications.findIndex((a) => a.id === newId);
        if (idx !== -1 && serverApp && serverApp.id) {
          this.applications[idx] = serverApp;
          this.persist(STORAGE_KEYS.APPLICATIONS, this.applications);
          this.notify();
        }
      })
      .catch((err) => {
        console.debug('[AdapterStore] Backend submit fallback to local storage:', err);
      });

    return newApplication;
  }

  // Advance application status (Department Officer action)
  public async advanceApplicationStatus(applicationId: string): Promise<Application | undefined> {
    const app = this.applications.find((a) => a.id === applicationId);
    if (!app) return undefined;

    // Authorization checks
    if (!this.isOfficer() && !this.isAdmin()) {
      console.warn('[AdapterStore] Only department officers or admins can advance application status');
      return undefined;
    }
    if (this.isOfficer() && this.citizen.departmentId && app.departmentId !== this.citizen.departmentId) {
      console.warn(`[AdapterStore] Officer (${this.citizen.departmentId}) cannot advance status of ${app.departmentId}`);
      return undefined;
    }

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
        if (app.timeline[2]) {
          app.timeline[2].status = 'completed';
          app.timeline[2].timestamp = nowFormatted;
        }
        if (app.timeline[3]) {
          app.timeline[3].status = 'current';
        }
      } else if (nextStatus === 'Under Review') {
        if (app.timeline[3]) {
          app.timeline[3].status = 'completed';
          app.timeline[3].timestamp = nowFormatted;
        }
        if (app.timeline[4]) {
          app.timeline[4].status = 'current';
        }
      } else if (nextStatus === 'Approved') {
        if (app.timeline[4]) {
          app.timeline[4].status = 'completed';
          app.timeline[4].timestamp = nowFormatted;
        }
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

      // Async backend sync via officer token
      try {
        const serverApp = await applicationsApi.advanceStatus(applicationId);
        if (serverApp) {
          const idx = this.applications.findIndex((a) => a.id === applicationId);
          if (idx !== -1) {
            this.applications[idx] = serverApp;
            this.persist(STORAGE_KEYS.APPLICATIONS, this.applications);
            this.notify();
          }
        }
      } catch (err) {
        console.debug('[AdapterStore] Backend status advance notice:', err);
      }
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

    // Async backend sync
    consentsApi.revoke(permissionId).catch((err) => {
      console.debug('[AdapterStore] Backend consent revoke fallback to local:', err);
    });

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

    // In dev mode, can reseed database
    fetch('http://localhost:5000/api/seed', {
      method: 'POST',
      headers: { 'x-dev-seed-key': 'sevasetu-dev-seed-bypass' },
    }).catch((err) => {
      console.debug('[AdapterStore] Backend seed reset notice:', err);
    });
  }
}

export const adapterStore = new AdapterStore();
