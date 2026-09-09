import { IDepartmentAdapter, AdapterDispatchResult, DepartmentStatusResult } from './interfaces';

export class MockEducationAdapter implements IDepartmentAdapter {
  public departmentCode = 'EDU-GOV';
  public departmentName = 'Mock Education Department';

  async submitApplication(
    service: { id: string; title: string; departmentId: string; departmentName: string },
    payload: any
  ): Promise<AdapterDispatchResult> {
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const departmentReferenceId = `EDU-MOCK-2026-${randomNum}`;
    const ackId = `EDU-ACK-${randomNum}`;

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
      message: `Payload successfully normalized and routed to State Higher Education Portal adapter (Mock Node).`,
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
      state: 'Under Verification',
      queuePosition: 12,
      lastUpdated: new Date().toISOString(),
    };
  }

  async queryApplicationStatus(departmentAckId: string): Promise<DepartmentStatusResult> {
    return this.getApplicationStatus(departmentAckId);
  }

  async getRequiredDocuments(_serviceId: string): Promise<string[]> {
    return [
      'Aadhaar Identity Card (e-KYC)',
      'Class XII Senior School Marksheet',
      'Income & Asset Certificate',
      'Bank Account Passbook / IFSC Verification',
    ];
  }

  async getServiceData(serviceId: string): Promise<{ serviceId: string; requiredDocuments: string[]; requiredFields: string[] }> {
    return {
      serviceId,
      requiredDocuments: await this.getRequiredDocuments(serviceId),
      requiredFields: ['College Name', 'Course & Year', 'Family Annual Income'],
    };
  }
}
