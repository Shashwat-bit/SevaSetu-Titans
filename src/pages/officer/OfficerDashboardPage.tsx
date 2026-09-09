import React, { useState, useEffect } from 'react';
import { Citizen, OfficerDashboardStats, Application } from '../../types';
import { officerApi } from '../../services/api/officerApi';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  Building2,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Layers,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  Search,
} from 'lucide-react';

interface OfficerDashboardPageProps {
  officer: Citizen;
  onNavigateToApplications: (statusFilter?: string) => void;
  onSelectApplication: (appId: string) => void;
}

export const OfficerDashboardPage: React.FC<OfficerDashboardPageProps> = ({
  officer,
  onNavigateToApplications,
  onSelectApplication,
}) => {
  const [data, setData] = useState<OfficerDashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await officerApi.getDashboard();
      setData(res);
    } catch (err: any) {
      setError(err?.message || 'Failed to load department dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [officer.id, officer.departmentId]);

  const deptName =
    officer.departmentId === 'dept-edu'
      ? 'Higher & Technical Education'
      : officer.departmentId === 'dept-rev'
      ? 'Revenue & Land Records'
      : officer.departmentId === 'dept-trans'
      ? 'Transport & RTO'
      : officer.departmentId || 'Department';

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Officer Greeting & Department Header */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-slate-900 dark:from-[#0B1120] dark:via-[#111827] dark:to-[#162033] rounded-2xl p-6 sm:p-8 text-white shadow-lg border border-navy-700/60 dark:border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-brand-600/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-navy-800/80 dark:bg-slate-800/80 border border-navy-600 dark:border-slate-700 text-xs text-amber-300 font-semibold shadow-inner">
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              <span>{deptName} Desk</span>
              <span className="text-slate-400">&bull;</span>
              <span className="text-emerald-300">Isolated Officer Scope</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {greeting()}, {officer.name}
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Welcome to the SevaSetu Department Officer Portal. Review citizen applications, cross-reference
              verified credentials, and sign off on digital authorizations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={fetchDashboard}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-navy-800/90 dark:bg-slate-800 hover:bg-navy-700 dark:hover:bg-slate-700 text-slate-200 rounded-xl border border-navy-600 dark:border-slate-700 transition-all shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => onNavigateToApplications()}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white rounded-xl shadow-md transition-all"
            >
              <FileText className="w-4 h-4" />
              Manage Queue
            </button>
          </div>
        </div>

        {/* Interoperability Architecture Notice */}
        <div className="mt-6 pt-4 border-t border-navy-700/60 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Dispatched via SevaSetu Interoperability Layer to Mock Department Adapter</span>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded bg-navy-800 dark:bg-slate-800 text-amber-300 dark:text-amber-400 font-mono">
            MOCK / SIMULATED ENVIRONMENT
          </span>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 rounded-xl text-rose-800 dark:text-rose-300 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchDashboard}
            className="text-xs font-bold underline hover:text-rose-900 dark:hover:text-rose-200"
          >
            Retry
          </button>
        </div>
      )}

      {/* Real Statistics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Total */}
        <div
          onClick={() => onNavigateToApplications()}
          className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total</span>
            <FileText className="w-4 h-4 text-brand-600 dark:text-brand-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {loading ? '-' : data?.stats.total ?? 0}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Department Applications</span>
        </div>

        {/* Pending Verification */}
        <div
          onClick={() => onNavigateToApplications('Under Verification')}
          className="bg-white dark:bg-[#111827] rounded-xl border border-amber-200/80 dark:border-amber-900/40 p-4 shadow-sm hover:shadow-md hover:border-amber-400 dark:hover:border-amber-700 transition-all cursor-pointer group bg-gradient-to-b from-amber-50/20 dark:from-amber-950/20 to-white dark:to-[#111827]"
        >
          <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Verification</span>
            <Clock className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-amber-900 dark:text-amber-200">
            {loading ? '-' : data?.stats.pendingVerification ?? 0}
          </div>
          <span className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">Docs Require Sign-off</span>
        </div>

        {/* Under Review */}
        <div
          onClick={() => onNavigateToApplications('Under Review')}
          className="bg-white dark:bg-[#111827] rounded-xl border border-sky-200/80 dark:border-sky-900/40 p-4 shadow-sm hover:shadow-md hover:border-sky-400 dark:hover:border-sky-700 transition-all cursor-pointer group bg-gradient-to-b from-sky-50/20 dark:from-sky-950/20 to-white dark:to-[#111827]"
        >
          <div className="flex items-center justify-between text-sky-700 dark:text-sky-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Under Review</span>
            <Layers className="w-4 h-4 text-sky-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-sky-900 dark:text-sky-200">
            {loading ? '-' : data?.stats.underReview ?? 0}
          </div>
          <span className="text-[11px] text-sky-700 dark:text-sky-400 font-medium">Desk Scrutiny Stage</span>
        </div>

        {/* Approved */}
        <div
          onClick={() => onNavigateToApplications('Approved')}
          className="bg-white dark:bg-[#111827] rounded-xl border border-emerald-200/80 dark:border-emerald-900/40 p-4 shadow-sm hover:shadow-md hover:border-emerald-400 dark:hover:border-emerald-700 transition-all cursor-pointer group bg-gradient-to-b from-emerald-50/20 dark:from-emerald-950/20 to-white dark:to-[#111827]"
        >
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Approved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-emerald-900 dark:text-emerald-200">
            {loading ? '-' : data?.stats.approved ?? 0}
          </div>
          <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">Sanctioned &amp; Completed</span>
        </div>

        {/* Rejected */}
        <div
          onClick={() => onNavigateToApplications('Rejected')}
          className="bg-white dark:bg-[#111827] rounded-xl border border-rose-200/80 dark:border-rose-900/40 p-4 shadow-sm hover:shadow-md hover:border-rose-400 dark:hover:border-rose-700 transition-all cursor-pointer group bg-gradient-to-b from-rose-50/20 dark:from-rose-950/20 to-white dark:to-[#111827]"
        >
          <div className="flex items-center justify-between text-rose-700 dark:text-rose-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Rejected</span>
            <AlertCircle className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-rose-900 dark:text-rose-200">
            {loading ? '-' : data?.stats.rejected ?? 0}
          </div>
          <span className="text-[11px] text-rose-700 dark:text-rose-400 font-medium">Ineligible or Flagged</span>
        </div>
      </div>

      {/* Recent Applications Queue */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-navy-900 dark:text-white">Recent Desk Applications</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Applications routed to {deptName} awaiting review or action
            </p>
          </div>
          <button
            onClick={() => onNavigateToApplications()}
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 inline-flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-sm flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Loading departmental queue...
          </div>
        ) : !data?.recentApplications || data.recentApplications.length === 0 ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
            No applications currently in queue for this department.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#162033] border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Application ID</th>
                  <th className="py-3 px-4">Citizen</th>
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Submitted</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.recentApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-navy-900 dark:text-white">
                      {app.id}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                      {app.citizenName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                      {app.serviceName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                      {app.submittedAt}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onSelectApplication(app.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-navy-50 dark:bg-navy-950/50 text-navy-800 dark:text-brand-300 hover:bg-navy-100 dark:hover:bg-navy-900/70 font-semibold border border-navy-200 dark:border-navy-800/60 transition-colors shadow-xs"
                      >
                        Review
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
