import { IDepartmentAdapter, AdapterDispatchResult, DepartmentStatusResult } from './interfaces';

export class MockTransportAdapter implements IDepartmentAdapter {
  public departmentCode = 'TRANS-GOV';
  public departmentName = 'Mock Transport Department';

  async submitApplication(
    service: { id: string; title: string; departmentId: string; departmentName: string },
    payload: any
  ): Promise<AdapterDispatchResult> {
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const departmentReferenceId = `TRANS-MOCK-2026-${randomNum}`;
    const ackId = `TRANS-ACK-${randomNum}`;

    return {
      success: true,
      departmentAckId: ackId,
      departmentReferenceId,
      departmentCode: this.departmentCode,
      department: this.departmentName,
      dispatchTimestamp: new Date().toISOString(),
      receivedAt: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      status: 'RECEIVED',
      message: `Payload verified and dispatched to Sarathi Vahan Portal (Simulated RTO Node).`,
      isMockAdapter: true,
    };
  }

  async dispatchApplication(
    service: { id: string; title: string; departmentId: string; departmentName: string },
    payload: any
  ): Promise<AdapterDispatchResult> {
    return this.submitApplication(service, payload);
  }

  async getApplicationStatus(departmentAckId: string): Promise<DepartmentStatusResult> {
    return {
      ackId: departmentAckId,
      departmentReferenceId: departmentAckId.replace('ACK', 'MOCK-2026'),
      state: 'Test Slot Allocation',
      queuePosition: 28,
      lastUpdated: new Date().toISOString(),
    };
  }

  async queryApplicationStatus(departmentAckId: string): Promise<DepartmentStatusResult> {
    return this.getApplicationStatus(departmentAckId);
  }

  async getRequiredDocuments(_serviceId: string): Promise<string[]> {
    return [
      'Aadhaar Identity Card (e-KYC)',
      'Electricity Utility Consumer Bill',
      'Class X Secondary School Marksheet',
    ];
  }

  async getServiceData(serviceId: string): Promise<{ serviceId: string; requiredDocuments: string[]; requiredFields: string[] }> {
    return {
      serviceId,
      requiredDocuments: await this.getRequiredDocuments(serviceId),
      requiredFields: ['Vehicle Category (MCWG/LMV)', 'Blood Group', 'Emergency Contact'],
    };
  }
}
