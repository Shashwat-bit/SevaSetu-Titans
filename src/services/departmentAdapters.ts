/**
 * SevaSetu Interoperability & Adapter Architecture
 * 
 * CORE PRINCIPLE:
 * SevaSetu does NOT replace existing department backend ERPs or legacy databases.
 * Instead, it provides a standardized Adapter Interface (IDepartmentAdapter) and
 * Document Source Interface (IDocumentSourceAdapter).
 * 
 * IN THIS PROTOTYPE:
 * These adapters simulate the transformation, validation, and payload dispatch.
 * In a production deployment, these adapters connect via secure mTLS REST/SOAP/GraphQL
 * endpoints to NIC, State Service Delivery Gateways (SSDG), and official DigiLocker APIs.
 */

import { Application, DigiLockerMockDocument, ServiceItem } from '../types';

export interface AdapterDispatchResult {
  success: boolean;
  departmentAckId: string;
  departmentCode: string;
  dispatchTimestamp: string;
  message: string;
  isMockAdapter: true;
}

export interface IDepartmentAdapter {
  departmentCode: string;
  departmentName: string;
  dispatchApplication(service: ServiceItem, payload: any): Promise<AdapterDispatchResult>;
  queryApplicationStatus(departmentAckId: string): Promise<any>;
}

export interface IDocumentSourceAdapter {
  sourceName: string;
  fetchVerifiedCredentials(citizenId: string, requestedDocTypes: string[]): Promise<DigiLockerMockDocument[]>;
  verifyCredentialHash(docId: string): Promise<{ verified: boolean; issuerSignature: string }>;
}

export class MockDigiLockerAdapter implements IDocumentSourceAdapter {
  public sourceName = 'DigiLocker Mock Adapter (Demo)';

  async fetchVerifiedCredentials(
    _citizenId: string,
    requestedDocTypes: string[]
  ): Promise<DigiLockerMockDocument[]> {
    // Simulates an OAuth2 credential pull from DigiLocker repository
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([]);
      }, 300);
    });
  }

  async verifyCredentialHash(docId: string): Promise<{ verified: boolean; issuerSignature: string }> {
    return {
      verified: true,
      issuerSignature: `SHA256:ECDSA-MOCK-SIG-${docId}-${Date.now().toString(36).toUpperCase()}`,
    };
  }
}

export class MockEducationDeptAdapter implements IDepartmentAdapter {
  public departmentCode = 'EDU-GOV';
  public departmentName = 'Education Department Adapter';

  async dispatchApplication(service: ServiceItem, payload: any): Promise<AdapterDispatchResult> {
    return {
      success: true,
      departmentAckId: `EDU-ACK-${Math.floor(100000 + Math.random() * 900000)}`,
      departmentCode: this.departmentCode,
      dispatchTimestamp: new Date().toISOString(),
      message: `Payload successfully normalized and routed to State Higher Education Portal adapter.`,
      isMockAdapter: true,
    };
  }

  async queryApplicationStatus(departmentAckId: string): Promise<any> {
    return { ackId: departmentAckId, state: 'Under Verification', queuePosition: 12 };
  }
}

export class MockRevenueDeptAdapter implements IDepartmentAdapter {
  public departmentCode = 'REV-GOV';
  public departmentName = 'Revenue Department Adapter';

  async dispatchApplication(service: ServiceItem, payload: any): Promise<AdapterDispatchResult> {
    return {
      success: true,
      departmentAckId: `REV-ACK-${Math.floor(100000 + Math.random() * 900000)}`,
      departmentCode: this.departmentCode,
      dispatchTimestamp: new Date().toISOString(),
      message: `Payload formatted to Revenue SSDG standard and queued for Mamlatdar verification.`,
      isMockAdapter: true,
    };
  }

  async queryApplicationStatus(departmentAckId: string): Promise<any> {
    return { ackId: departmentAckId, state: 'Under Verification', queuePosition: 5 };
  }
}

export class MockTransportDeptAdapter implements IDepartmentAdapter {
  public departmentCode = 'RTO-GOV';
  public departmentName = 'Transport RTO Adapter';

  async dispatchApplication(service: ServiceItem, payload: any): Promise<AdapterDispatchResult> {
    return {
      success: true,
      departmentAckId: `SARATHI-MOCK-${Math.floor(100000 + Math.random() * 900000)}`,
      departmentCode: this.departmentCode,
      dispatchTimestamp: new Date().toISOString(),
      message: `Dispatched to Sarathi / RTO staging adapter.`,
      isMockAdapter: true,
    };
  }

  async queryApplicationStatus(departmentAckId: string): Promise<any> {
    return { ackId: departmentAckId, state: 'Pending Inspection' };
  }
}

// Factory to resolve department adapter
export function getDepartmentAdapter(departmentId: string): IDepartmentAdapter {
  switch (departmentId) {
    case 'dept-edu':
      return new MockEducationDeptAdapter();
    case 'dept-rev':
      return new MockRevenueDeptAdapter();
    case 'dept-trans':
      return new MockTransportDeptAdapter();
    default:
      return new MockEducationDeptAdapter();
  }
}
