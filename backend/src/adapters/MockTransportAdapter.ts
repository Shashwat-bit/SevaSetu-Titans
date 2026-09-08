import { IDepartmentAdapter, AdapterDispatchResult, DepartmentStatusResult } from './interfaces';

export class MockTransportAdapter implements IDepartmentAdapter {
  public departmentCode = 'RTO-GOV';
  public departmentName = 'Transport RTO Adapter';

  async dispatchApplication(
    service: { id: string; title: string; departmentId: string; departmentName: string },
    payload: any
  ): Promise<AdapterDispatchResult> {
    const ackId = `SARATHI-MOCK-${Math.floor(100000 + Math.random() * 900000)}`;
    return {
      success: true,
      departmentAckId: ackId,
      departmentCode: this.departmentCode,
      dispatchTimestamp: new Date().toISOString(),
      message: `Dispatched to Sarathi / RTO staging adapter.`,
      isMockAdapter: true,
    };
  }

  async queryApplicationStatus(departmentAckId: string): Promise<DepartmentStatusResult> {
    return {
      ackId: departmentAckId,
      state: 'Pending Inspection',
      lastUpdated: new Date().toISOString(),
    };
  }
}
