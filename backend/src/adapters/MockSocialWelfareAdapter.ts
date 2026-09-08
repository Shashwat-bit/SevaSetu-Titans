import { IDepartmentAdapter, AdapterDispatchResult, DepartmentStatusResult } from './interfaces';

export class MockSocialWelfareAdapter implements IDepartmentAdapter {
  public departmentCode = 'WEL-GOV';
  public departmentName = 'Social Welfare Adapter';

  async dispatchApplication(
    service: { id: string; title: string; departmentId: string; departmentName: string },
    payload: any
  ): Promise<AdapterDispatchResult> {
    const ackId = `WEL-ACK-${Math.floor(100000 + Math.random() * 900000)}`;
    return {
      success: true,
      departmentAckId: ackId,
      departmentCode: this.departmentCode,
      dispatchTimestamp: new Date().toISOString(),
      message: `Dispatched to Social Welfare Direct Benefit Transfer adapter queue.`,
      isMockAdapter: true,
    };
  }

  async queryApplicationStatus(departmentAckId: string): Promise<DepartmentStatusResult> {
    return {
      ackId: departmentAckId,
      state: 'Under Review',
      queuePosition: 8,
      lastUpdated: new Date().toISOString(),
    };
  }
}
