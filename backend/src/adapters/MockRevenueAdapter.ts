import { IDepartmentAdapter, AdapterDispatchResult, DepartmentStatusResult } from './interfaces';

export class MockRevenueAdapter implements IDepartmentAdapter {
  public departmentCode = 'REV-GOV';
  public departmentName = 'Mock Revenue Department';

  async submitApplication(
    service: { id: string; title: string; departmentId: string; departmentName: string },
    payload: any
  ): Promise<AdapterDispatchResult> {
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const departmentReferenceId = `REV-MOCK-2026-${randomNum}`;
    const ackId = `REV-ACK-${randomNum}`;

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
      message: `Payload normalized and ingested into Land Records & Revenue Portal (Simulated Mamlatdar Desk).`,
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
      state: 'Field Scrutiny Pending',
      queuePosition: 7,
      lastUpdated: new Date().toISOString(),
    };
  }

  async queryApplicationStatus(departmentAckId: string): Promise<DepartmentStatusResult> {
    return this.getApplicationStatus(departmentAckId);
  }

  async getRequiredDocuments(serviceId: string): Promise<string[]> {
    if (serviceId === 'service-residence') {
      return [
        'Aadhaar Identity Card (e-KYC)',
        'Electricity Utility Consumer Bill',
        'Residence & Domicile Certificate',
      ];
    }
    // Default revenue income certificate
    return ['Aadhaar Identity Card (e-KYC)', 'Electricity Utility Consumer Bill'];
  }

  async getServiceData(serviceId: string): Promise<{ serviceId: string; requiredDocuments: string[]; requiredFields: string[] }> {
    const requiredDocs = await this.getRequiredDocuments(serviceId);
    const requiredFields =
      serviceId === 'service-residence'
        ? ['Years of Continuous Residence', 'Native District', 'Parent Residence Details']
        : ['Occupation of Parents', 'Total Annual Income (INR)', 'Taluka/Tehsil'];

    return {
      serviceId,
      requiredDocuments: requiredDocs,
      requiredFields,
    };
  }
}
