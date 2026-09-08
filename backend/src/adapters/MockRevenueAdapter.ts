import { IDepartmentAdapter, AdapterDispatchResult, DepartmentStatusResult } from './interfaces';

export class MockRevenueAdapter implements IDepartmentAdapter {
  public departmentCode = 'REV-GOV';
  public departmentName = 'Revenue Department Adapter';

  async dispatchApplication(
    service: { id: string; title: string; departmentId: string; departmentName: string },
    payload: any
  ): Promise<AdapterDispatchResult> {
    const ackId = `REV-ACK-${Math.floor(100000 + Math.random() * 900000)}`;
    return {
      success: true,
      departmentAckId: ackId,
      departmentCode: this.departmentCode,
      dispatchTimestamp: new Date().toISOString(),
      message: `Payload formatted to Revenue SSDG standard and queued for Mamlatdar verification.`,
      isMockAdapter: true,
    };
  }

  async queryApplicationStatus(departmentAckId: string): Promise<DepartmentStatusResult> {
    return {
      ackId: departmentAckId,
      state: 'Under Verification',
      queuePosition: 5,
      lastUpdated: new Date().toISOString(),
    };
  }
}
