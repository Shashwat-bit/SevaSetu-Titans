import { IDepartmentAdapter, AdapterDispatchResult, DepartmentStatusResult } from './interfaces';

export class MockSocialWelfareAdapter implements IDepartmentAdapter {
  public departmentCode = 'WELFARE-GOV';
  public departmentName = 'Mock Social Welfare Department';

  async submitApplication(
    service: { id: string; title: string; departmentId: string; departmentName: string },
    payload: any
  ): Promise<AdapterDispatchResult> {
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const departmentReferenceId = `WEL-MOCK-2026-${randomNum}`;
    const ackId = `WEL-ACK-${randomNum}`;

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
      message: `Payload verified and sent to Direct Benefit Transfer (DBT) Scheme Registry (Simulated Node).`,
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
      state: 'DBT Bank Account Verification',
      queuePosition: 4,
      lastUpdated: new Date().toISOString(),
    };
  }

  async queryApplicationStatus(departmentAckId: string): Promise<DepartmentStatusResult> {
    return this.getApplicationStatus(departmentAckId);
  }

  async getRequiredDocuments(_serviceId: string): Promise<string[]> {
    return [
      'Aadhaar Identity Card (e-KYC)',
      'Bank Account Passbook / IFSC Verification',
      'Social Category / Caste Certificate',
    ];
  }

  async getServiceData(serviceId: string): Promise<{ serviceId: string; requiredDocuments: string[]; requiredFields: string[] }> {
    return {
      serviceId,
      requiredDocuments: await this.getRequiredDocuments(serviceId),
      requiredFields: ['Bank Account Number', 'IFSC Code', 'Nominee Name'],
    };
  }
}
