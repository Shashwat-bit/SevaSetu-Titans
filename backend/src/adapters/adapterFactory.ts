import { IDepartmentAdapter, IDocumentSourceAdapter } from './interfaces';
import { MockEducationAdapter } from './MockEducationAdapter';
import { MockRevenueAdapter } from './MockRevenueAdapter';
import { MockTransportAdapter } from './MockTransportAdapter';
import { MockSocialWelfareAdapter } from './MockSocialWelfareAdapter';
import { MockDigiLockerAdapter } from './MockDigiLockerAdapter';

export function getDepartmentAdapter(departmentId: string): IDepartmentAdapter {
  switch (departmentId) {
    case 'dept-edu':
      return new MockEducationAdapter();
    case 'dept-rev':
      return new MockRevenueAdapter();
    case 'dept-trans':
      return new MockTransportAdapter();
    case 'dept-welfare':
      return new MockSocialWelfareAdapter();
    default:
      return new MockEducationAdapter();
  }
}

export function getDocumentSourceAdapter(_source?: string): IDocumentSourceAdapter {
  return new MockDigiLockerAdapter();
}

export function getAllDepartmentAdapters(): { departmentId: string; adapter: IDepartmentAdapter }[] {
  return [
    { departmentId: 'dept-edu', adapter: new MockEducationAdapter() },
    { departmentId: 'dept-rev', adapter: new MockRevenueAdapter() },
    { departmentId: 'dept-trans', adapter: new MockTransportAdapter() },
    { departmentId: 'dept-welfare', adapter: new MockSocialWelfareAdapter() },
  ];
}
