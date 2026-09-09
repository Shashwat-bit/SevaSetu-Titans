import React, { useState, useEffect } from 'react';
import {
  Citizen,
  AdminOverviewStats,
  AnalyticsData,
  DepartmentAnalyticsMetric,
  AuditActivity,
} from '../../types';
import { adminApi } from '../../services/api/adminApi';
import {
  Shield,
  Layers,
  Users,
  Building2,
  FileText,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Activity,
  ArrowUpRight,
  TrendingUp,
  Server,
  Lock,
  BarChart3,
  Search,
} from 'lucide-react';

interface AdminDashboardPageProps {
  adminUser: Citizen;
  activeSubTab?: 'dashboard' | 'analytics' | 'departments' | 'consent' | 'activity';
  onNavigateTab?: (tab: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  adminUser,
  activeSubTab = 'dashboard',
  onNavigateTab,
}) => {
  const [currentTab, setCurrentTab] = useState<'overview' | 'analytics' | 'departments' | 'consents' | 'activities'>(
    activeSubTab === 'analytics'
      ? 'analytics'
      : activeSubTab === 'departments'
      ? 'departments'
      : activeSubTab === 'consent'
      ? 'consents'
      : activeSubTab === 'activity'
      ? 'activities'
      : 'overview'
  );

  const [overview, setOverview] = useState<AdminOverviewStats | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [departments, setDepartments] = useState<DepartmentAnalyticsMetric[]>([]);
  const [activities, setActivities] = useState<AuditActivity[]>([]);
  const [activityFilter, setActivityFilter] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activeSubTab === 'analytics') setCurrentTab('analytics');
    else if (activeSubTab === 'departments') setCurrentTab('departments');
    else if (activeSubTab === 'consent') setCurrentTab('consents');
    else if (activeSubTab === 'activity') setCurrentTab('activities');
    else setCurrentTab('overview');
  }, [activeSubTab]);

  const fetchAdminData = async () => {
    if (adminUser.role !== 'admin') {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const [ov, an, dept, act] = await Promise.all([
        adminApi.getOverview().catch(() => null),
        adminApi.getAnalytics().catch(() => null),
        adminApi.getDepartmentAnalytics().catch(() => []),
        adminApi.getActivities().catch(() => []),
      ]);
      setOverview(ov);
      setAnalytics(an);
      setDepartments(dept);
      setActivities(act);
    } catch (err: any) {
      setError(err?.message || 'Failed to load system administrative data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [adminUser.id, adminUser.role]);

  // Security Access Guard (Admin-Only Page)
  if (adminUser.role !== 'admin') {
    return (
      <div className="min-h-[500px] flex items-center justify-center p-6 animate-in fade-in duration-300">
        <div className="max-w-md w-full bg-white dark:bg-[#111827] border border-rose-200 dark:border-rose-900/60 rounded-2xl p-8 text-center shadow-xl">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-200 dark:border-rose-800">
            <Lock className="w-7 h-7" />
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
            403 Forbidden
          </span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-3">
            Administrative Access Restricted
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            This management interface is strictly authorized for system administrators. Your current role is{' '}
            <strong className="text-slate-700 dark:text-slate-200 uppercase">{adminUser.role || 'citizen'}</strong>.
          </p>
        </div>
      </div>
    );
  }

  const filteredActivities =
    activityFilter === 'all'
      ? activities
      : activities.filter((a) => a.type === activityFilter);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Admin Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-navy-950 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/90 border border-slate-700 text-xs text-amber-300 font-semibold">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>SevaSetu System Administration &bull; Central Node</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Platform Analytics &amp; Administration
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Real-time telemetry across connected department adapters, citizen consent compliance, interoperability exchange logs, and workflow processing rates.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchAdminData}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition-all shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Metrics</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mt-6 pt-4 border-t border-slate-800 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview & KPIs', icon: BarChart3 },
            { id: 'analytics', label: 'Applications Analytics', icon: TrendingUp },
            { id: 'departments', label: 'Department Performance', icon: Building2 },
            { id: 'consents', label: 'Consent Governance', icon: Shield },
            { id: 'activities', label: 'System Audit Stream', icon: Activity },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setCurrentTab(tab.id as any);
                  if (onNavigateTab) onNavigateTab(tab.id);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. OVERVIEW & KPIS                                                       */}
      {/* ========================================================================= */}
      {currentTab === 'overview' && (
        <div className="space-y-6">
          {/* Top KPI Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Applications</span>
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-brand-600 dark:text-brand-400">
                  <FileText className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {overview?.stats.totalApplications ?? '...'}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Dispatched across {overview?.stats.totalDepartments ?? 0} departments
              </p>
            </div>

            <div className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Active Consents</span>
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                  <Shield className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {overview?.stats.totalConsents ?? '...'}
              </div>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
                DPDP Act 2023 Compliant
              </p>
            </div>

            <div className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Data Exchanges</span>
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {overview?.stats.totalExchanges ?? '...'}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                DigiLocker &amp; Department Nodes
              </p>
            </div>

            <div className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Registered Officers</span>
                <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {overview?.stats.totalOfficers ?? '...'}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Active Desk Verifiers
              </p>
            </div>
          </div>

          {/* Adapter Health Status Monitor */}
          <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Server className="w-4 h-4 text-emerald-500" />
                  <span>Simulated Department Adapter Status</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Live connectivity and protocol ping across isolated state department adapters
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                All Adapters Operational
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              {(overview?.adapterHealth || []).map((adapter) => (
                <div
                  key={adapter.id}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-[#162033] border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{adapter.name}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">{adapter.protocol}</span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      {adapter.status}
                    </span>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span>Latency: {adapter.latencyMs}ms</span>
                    <span>{adapter.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. APPLICATIONS ANALYTICS                                                */}
      {/* ========================================================================= */}
      {currentTab === 'analytics' && analytics && (
        <div className="space-y-6">
          {/* Applications by Status Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-[#111827] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                Applications by Workflow Status
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Real database count distribution across submission, verification, review, and approval
              </p>

              <div className="space-y-3">
                {(analytics.applications.byStatus || []).map((item) => {
                  const pct =
                    analytics.applications.totalApplications > 0
                      ? Math.round((item.count / analytics.applications.totalApplications) * 100)
                      : 0;
                  return (
                    <div key={item.status} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {item.status}
                        </span>
                        <span className="font-mono text-slate-500 dark:text-slate-400">
                          {item.count} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-brand-600 h-2.5 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Document Processing Metrics */}
            <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                  Document Processing Metrics
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  Aggregated document verification stats
                </p>

                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs text-slate-600 dark:text-slate-300">Total Attached Docs</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {analytics.processing?.totalDocumentsProcessed ?? 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs text-slate-600 dark:text-slate-300">Cryptographically Verified</span>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      {analytics.processing?.verifiedDocuments ?? 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs text-slate-600 dark:text-slate-300">Rejected / Flagged</span>
                    <span className="text-sm font-bold text-rose-600 dark:text-rose-400">
                      {analytics.processing?.rejectedDocuments ?? 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs text-slate-600 dark:text-slate-300">Verification Rate</span>
                    <span className="text-sm font-bold text-brand-600 dark:text-brand-400">
                      {analytics.processing?.documentVerificationRate ?? 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. DEPARTMENT PERFORMANCE TABLE                                          */}
      {/* ========================================================================= */}
      {currentTab === 'departments' && (
        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Department Performance &amp; Workload
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Comparative statistics on application intake, approvals, rejections, and desk officers
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#162033] text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Department Name</th>
                  <th className="py-3.5 px-4">Code</th>
                  <th className="py-3.5 px-4">Intake</th>
                  <th className="py-3.5 px-4">Approved</th>
                  <th className="py-3.5 px-4">Pending</th>
                  <th className="py-3.5 px-4">Officers</th>
                  <th className="py-3.5 px-4">Approval Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {departments.map((dept) => (
                  <tr key={dept.departmentId} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {dept.departmentName}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">{dept.code}</td>
                    <td className="py-3 px-4 text-slate-800 dark:text-slate-200 font-bold">
                      {dept.totalApplications}
                    </td>
                    <td className="py-3 px-4 text-emerald-600 font-semibold">{dept.approvedApplications}</td>
                    <td className="py-3 px-4 text-amber-600 font-semibold">{dept.pendingApplications}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{dept.officersCount}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        {dept.approvalRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. CONSENTS & PRIVACY GOVERNANCE                                         */}
      {/* ========================================================================= */}
      {currentTab === 'consents' && analytics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h4 className="text-xs font-semibold uppercase text-slate-400">Total Consents Recorded</h4>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
              {analytics.consents.total}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Active Permission Rate: <strong className="text-emerald-500">{analytics.consents.activeRate}%</strong>
            </p>
          </div>

          <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h4 className="text-xs font-semibold uppercase text-slate-400">Active vs Revoked</h4>
            <div className="flex items-center gap-4 mt-2">
              <div>
                <span className="text-xs text-slate-500">Active</span>
                <p className="text-2xl font-bold text-emerald-600">{analytics.consents.active}</p>
              </div>
              <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
              <div>
                <span className="text-xs text-slate-500">Revoked</span>
                <p className="text-2xl font-bold text-rose-600">{analytics.consents.revoked}</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Revocation Rate: {analytics.consents.revocationRate}%
            </p>
          </div>

          <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h4 className="text-xs font-semibold uppercase text-slate-400">Interoperability Exchanges</h4>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
              {analytics.exchanges.total}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Exchange Success Rate: <strong className="text-brand-500">{analytics.exchanges.successRate}%</strong>
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. SYSTEM AUDIT STREAM                                                   */}
      {/* ========================================================================= */}
      {currentTab === 'activities' && (
        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Live Platform Audit Stream
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Immutable system event log across authentication, adapter dispatches, and consent actions
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={activityFilter}
                onChange={(e) => setActivityFilter(e.target.value)}
                className="text-xs rounded-xl px-3 py-1.5 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#162033] text-slate-700 dark:text-slate-200"
              >
                <option value="all">All Events</option>
                <option value="submission">Submissions</option>
                <option value="consent_grant">Consent Grants</option>
                <option value="consent_revoke">Consent Revocations</option>
                <option value="verification">Verifications</option>
                <option value="login">Logins</option>
                <option value="security_alert">Security Alerts</option>
              </select>
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[500px] overflow-y-auto">
            {filteredActivities.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">No matching audit events found.</div>
            ) : (
              filteredActivities.map((act) => (
                <div key={act.id} className="p-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors flex items-start gap-3 text-xs">
                  <div className="mt-0.5 p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 shrink-0">
                    <Activity className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-900 dark:text-white truncate">
                        {act.action}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400 shrink-0">
                        {act.timestamp}
                      </span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 mt-0.5 text-[11px] leading-relaxed">
                      {act.details}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400">
                      <span>Dept: {act.departmentName}</span>
                      <span>&bull;</span>
                      <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                        {act.type}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
