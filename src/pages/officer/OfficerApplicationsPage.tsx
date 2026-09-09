import React, { useState, useEffect } from 'react';
import { Application, Citizen } from '../../types';
import { officerApi } from '../../services/api/officerApi';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  Search,
  Filter,
  ArrowUpDown,
  Building2,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Eye,
} from 'lucide-react';

interface OfficerApplicationsPageProps {
  officer: Citizen;
  onSelectApplication: (appId: string) => void;
  initialStatusFilter?: string;
}

export const OfficerApplicationsPage: React.FC<OfficerApplicationsPageProps> = ({
  officer,
  onSelectApplication,
  initialStatusFilter,
}) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Sorting state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(initialStatusFilter || 'all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await officerApi.getApplications({
        q: searchQuery || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        service: serviceFilter !== 'all' ? serviceFilter : undefined,
        sort: sortOrder,
      });
      setApplications(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load department applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [officer.id, statusFilter, serviceFilter, sortOrder]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchApplications();
  };

  // Extract unique services from currently loaded applications for the filter dropdown
  const uniqueServices = Array.from(
    new Set(applications.map((app) => app.serviceName))
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-extrabold text-navy-900 dark:text-white tracking-tight">
              Department Application Queue
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-navy-100 dark:bg-navy-950/60 text-navy-800 dark:text-brand-300 border border-navy-200 dark:border-navy-800/60">
              {applications.length} Assigned
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Official scrutiny queue for {officer.name} &bull; Department ID:{' '}
            <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">{officer.departmentId || 'All'}</span>
          </p>
        </div>

        <button
          onClick={fetchApplications}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors border border-slate-200 dark:border-slate-700 self-start sm:self-center"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh List
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          {/* Keyword Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Application ID (e.g. SS-2026-...) or Citizen Name..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-white dark:bg-[#162033] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-navy-900 dark:bg-brand-600 hover:bg-navy-800 dark:hover:bg-brand-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 bg-slate-50/50 dark:bg-[#162033] font-medium focus:ring-1 focus:ring-brand-500"
            >
              <option value="all">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Under Verification">Under Verification</option>
              <option value="Under Review">Under Review</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Sort Order */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Sort:</span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
              className="border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 bg-slate-50/50 dark:bg-[#162033] font-medium focus:ring-1 focus:ring-brand-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>

          {/* Clear Filters */}
          {(statusFilter !== 'all' || serviceFilter !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setStatusFilter('all');
                setServiceFilter('all');
                setSearchQuery('');
              }}
              className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-semibold underline text-xs ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 rounded-xl text-rose-800 dark:text-rose-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Applications Table */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 dark:text-slate-500 text-sm flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Querying department records from MongoDB...
          </div>
        ) : applications.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-sm space-y-2">
            <FileText className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">No applications matched your criteria.</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Try adjusting your search keywords or reset active filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#162033] border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Application ID</th>
                  <th className="py-3 px-4">Citizen</th>
                  <th className="py-3 px-4">Service &amp; Category</th>
                  <th className="py-3 px-4">Submitted Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Documents</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {applications.map((app) => {
                  const verifiedCount = app.documentsAttached.filter(
                    (d) => d.verificationStatus === 'VERIFIED' || d.verified
                  ).length;
                  const totalDocs = app.documentsAttached.length;

                  return (
                    <tr key={app.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-4 font-mono font-bold text-navy-900 dark:text-white">
                        {app.id}
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{app.citizenName}</div>
                        <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">ID: {app.citizenId}</div>
                      </td>
                      <td className="py-4 px-4 max-w-xs">
                        <div className="font-medium text-slate-800 dark:text-slate-200 truncate">{app.serviceName}</div>
                        <div className="text-[11px] text-slate-400 dark:text-slate-500">{app.departmentName}</div>
                      </td>
                      <td className="py-4 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {app.submittedAt}
                      </td>
                      <td className="py-4 px-4">
                        <StatusBadge status={app.status} />
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                            verifiedCount === totalDocs && totalDocs > 0
                              ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50'
                              : verifiedCount > 0
                              ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          {verifiedCount} / {totalDocs} Verified
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => onSelectApplication(app.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-navy-900 dark:bg-brand-600 hover:bg-navy-800 dark:hover:bg-brand-700 text-white font-semibold transition-colors shadow-xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Review</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
