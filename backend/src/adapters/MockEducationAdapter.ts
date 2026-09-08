import { IDepartmentAdapter, AdapterDispatchResult, DepartmentStatusResult } from './interfaces';

export class MockEducationAdapter implements IDepartmentAdapter {
  public departmentCode = 'EDU-GOV';
  public departmentName = 'Education Department Adapter';

  async dispatchApplication(
    service: { id: string; title: string; departmentId: string; departmentName: string },
    payload: any
  ): Promise<AdapterDispatchResult> {
    const ackId = `EDU-ACK-${Math.floor(100000 + Math.random() * 900000)}`;
    return {
      success: true,
      departmentAckId: ackId,
      departmentCode: this.departmentCode,
      dispatchTimestamp: new Date().toISOString(),
      message: `Payload successfully normalized and routed to State Higher Education Portal adapter.`,
      isMockAdapter: true,
    };
  }

  async queryApplicationStatus(departmentAckId: string): Promise<DepartmentStatusResult> {
    return {
      ackId: departmentAckId,
      state: 'Under Verification',
      queuePosition: 12,
      lastUpdated: new Date().toISOString(),
    };
  }
}
