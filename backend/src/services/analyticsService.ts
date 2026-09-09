import { Application } from '../models/Application';
import { Consent } from '../models/Consent';
import { DataExchange } from '../models/DataExchange';
import { User } from '../models/User';
import { Department } from '../models/Department';
import { Service } from '../models/Service';
import { Activity } from '../models/Activity';

export class AnalyticsService {
  /**
   * Retrieves high-level overview metrics across the entire platform.
   */
  async getOverviewStats() {
    const [
      totalApplications,
      totalCitizens,
      totalOfficers,
      totalDepartments,
      totalServices,
      totalConsents,
      totalExchanges,
      totalActivities,
    ] = await Promise.all([
      Application.countDocuments(),
      User.countDocuments({ role: 'citizen' }),
      User.countDocuments({ role: 'officer' }),
      Department.countDocuments(),
      Service.countDocuments(),
      Consent.countDocuments(),
      DataExchange.countDocuments(),
      Activity.countDocuments(),
    ]);

    return {
      totalApplications,
      totalCitizens,
      totalOfficers,
      totalDepartments,
      totalServices,
      totalConsents,
      totalExchanges,
      totalActivities,
    };
  }

  /**
   * Aggregates application statistics by status, department, and service.
   */
  async getApplicationStats() {
    const [byStatusAgg, byDepartmentAgg, byServiceAgg] = await Promise.all([
      Application.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Application.aggregate([
        {
          $group: {
            _id: '$departmentId',
            departmentName: { $first: '$departmentName' },
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]),
      Application.aggregate([
        {
          $group: {
            _id: '$serviceId',
            serviceName: { $first: '$serviceName' },
            departmentName: { $first: '$departmentName' },
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]),
    ]);

    const totalApplications = await Application.countDocuments();
    const approvedCount = await Application.countDocuments({ status: 'Approved' });
    const rejectedCount = await Application.countDocuments({ status: 'Rejected' });
    const pendingCount = totalApplications - approvedCount - rejectedCount;
    const approvalRate = totalApplications > 0 ? Math.round((approvedCount / totalApplications) * 100) : 0;

    return {
      totalApplications,
      approvalRate,
      approvedCount,
      rejectedCount,
      pendingCount,
      byStatus: byStatusAgg.map((s) => ({ status: s._id, count: s.count })),
      byDepartment: byDepartmentAgg.map((d) => ({
        departmentId: d._id,
        departmentName: d.departmentName || d._id,
        count: d.count,
      })),
      byService: byServiceAgg.map((srv) => ({
        serviceId: srv._id,
        serviceName: srv.serviceName || srv._id,
        departmentName: srv.departmentName,
        count: srv.count,
      })),
    };
  }

  /**
   * Aggregates consent statistics by status and compliance metrics.
   */
  async getConsentStats() {
    const total = await Consent.countDocuments();

    const [active, revoked, expired, denied] = await Promise.all([
      Consent.countDocuments({ status: { $in: ['Active', 'ACTIVE', 'Granted', 'GRANTED'] } }),
      Consent.countDocuments({ status: { $in: ['Access Revoked', 'REVOKED', 'Revoked'] } }),
      Consent.countDocuments({ status: { $in: ['Expired', 'EXPIRED'] } }),
      Consent.countDocuments({ status: { $in: ['Denied', 'DENIED'] } }),
    ]);

    const byDepartmentAgg = await Consent.aggregate([
      {
        $group: {
          _id: '$departmentId',
          whoHasAccess: { $first: '$whoHasAccess' },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    return {
      total,
      active,
      revoked,
      expired,
      denied,
      activeRate: total > 0 ? Math.round((active / total) * 100) : 0,
      revocationRate: total > 0 ? Math.round((revoked / total) * 100) : 0,
      byDepartment: byDepartmentAgg.map((d) => ({
        departmentId: d._id,
        whoHasAccess: d.whoHasAccess,
        count: d.count,
      })),
    };
  }

  /**
   * Aggregates interoperability and data exchange metrics.
   */
  async getDataExchangeStats() {
    const total = await DataExchange.countDocuments();
    const fetched = await DataExchange.countDocuments({ status: 'FETCHED' });
    const denied = await DataExchange.countDocuments({ status: 'DENIED' });

    const [byDeptAgg, bySourceAgg, byDocTypeAgg] = await Promise.all([
      DataExchange.aggregate([
        { $group: { _id: '$targetDepartment', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      DataExchange.aggregate([
        { $group: { _id: '$sourceSystem', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      DataExchange.aggregate([
        { $group: { _id: '$normalizedType', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    return {
      total,
      fetched,
      denied,
      successRate: total > 0 ? Math.round((fetched / total) * 100) : 0,
      byTargetDepartment: byDeptAgg.map((d) => ({ departmentId: d._id, count: d.count })),
      bySourceSystem: bySourceAgg.map((s) => ({ sourceSystem: s._id, count: s.count })),
      byNormalizedType: byDocTypeAgg.map((t) => ({ normalizedType: t._id, count: t.count })),
    };
  }

  /**
   * Returns per-department performance analytics and workload breakdowns.
   */
  async getDepartmentMetrics() {
    const departments = await Department.find();
    const metrics = await Promise.all(
      departments.map(async (dept) => {
        const [totalApps, approvedApps, rejectedApps, pendingApps, totalOfficers] = await Promise.all([
          Application.countDocuments({ departmentId: dept.departmentId }),
          Application.countDocuments({ departmentId: dept.departmentId, status: 'Approved' }),
          Application.countDocuments({ departmentId: dept.departmentId, status: 'Rejected' }),
          Application.countDocuments({
            departmentId: dept.departmentId,
            status: { $in: ['Submitted', 'Under Verification', 'Under Review'] },
          }),
          User.countDocuments({ role: 'officer', departmentId: dept.departmentId }),
        ]);

        const approvalRate = totalApps > 0 ? Math.round((approvedApps / totalApps) * 100) : 0;

        return {
          departmentId: dept.departmentId,
          departmentName: dept.name,
          code: dept.code,
          totalApplications: totalApps,
          approvedApplications: approvedApps,
          rejectedApplications: rejectedApps,
          pendingApplications: pendingApps,
          officersCount: totalOfficers,
          approvalRate,
        };
      })
    );

    return metrics;
  }

  /**
   * Returns application and document processing metrics from real data.
   */
  async getProcessingMetrics() {
    const applications = await Application.find({}, { documentsAttached: 1, status: 1 });

    let totalDocs = 0;
    let verifiedDocs = 0;
    let rejectedDocs = 0;
    let pendingDocs = 0;

    for (const app of applications) {
      if (Array.isArray(app.documentsAttached)) {
        for (const doc of app.documentsAttached) {
          totalDocs++;
          if (doc.verificationStatus === 'VERIFIED' || doc.verified) {
            verifiedDocs++;
          } else if (doc.verificationStatus === 'REJECTED') {
            rejectedDocs++;
          } else {
            pendingDocs++;
          }
        }
      }
    }

    const docVerificationRate = totalDocs > 0 ? Math.round((verifiedDocs / totalDocs) * 100) : 0;

    return {
      totalDocumentsProcessed: totalDocs,
      verifiedDocuments: verifiedDocs,
      rejectedDocuments: rejectedDocs,
      pendingDocuments: pendingDocs,
      documentVerificationRate: docVerificationRate,
    };
  }
}

export const analyticsService = new AnalyticsService();
