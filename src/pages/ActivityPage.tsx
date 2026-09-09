import React, { useState } from 'react';
import { AuditActivity } from '../types';
import {
  Activity,
  Filter,
  Send,
  CheckCircle2,
  Lock,
  XCircle,
  Clock,
  Building2,
  Calendar,
} from 'lucide-react';

interface ActivityPageProps {
  activities: AuditActivity[];
}

export const ActivityPage: React.FC<ActivityPageProps> = ({ activities }) => {
  const [filterType, setFilterType] = useState<string>('all');

  const filterOptions = [
    { id: 'all', label: 'All Activities' },
    { id: 'submission', label: 'Submissions' },
    { id: 'verification', label: 'Document Verifications' },
    { id: 'consent_grant', label: 'Consent Granted' },
    { id: 'consent_revoke', label: 'Consent Revoked' },
    { id: 'status_change', label: 'Status Updates' },
  ];

  const filtered = activities.filter((act) => {
    if (filterType === 'all') return true;
    return act.type === filterType;
  });

  const getIcon = (type: AuditActivity['type']) => {
    switch (type) {
      case 'submission':
        return <Send className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'verification':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'consent_grant':
        return <Lock className="w-4 h-4 text-brand-600 dark:text-brand-400" />;
      case 'consent_revoke':
        return <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />;
      case 'status_change':
        return <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      default:
        return <Activity className="w-4 h-4 text-slate-500 dark:text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-navy-900 dark:text-white tracking-tight">Activity Center</h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Comprehensive audit trail of all applications submitted, credentials verified, and consent permissions
              granted or revoked.
            </p>
          </div>

          <div className="text-xs font-semibold text-slate-500 dark:text-slate-300 bg-slate-50 dark:bg-[#162033] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 self-start sm:self-auto">
            Total Logged Events: <strong>{activities.length}</strong>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-1">
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1 shrink-0">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          {filterOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setFilterType(opt.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                filterType === opt.id
                  ? 'bg-navy-900 dark:bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Timeline List */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        {filtered.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-slate-50 dark:bg-[#162033] rounded-xl border border-slate-200 dark:border-slate-800 group-hover:bg-brand-50 dark:group-hover:bg-brand-950/30 group-hover:border-brand-200 dark:group-hover:border-brand-800/50 transition-colors shrink-0 mt-0.5">
                    {getIcon(item.type)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-navy-900 dark:text-white">{item.action}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {item.statusBadge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{item.details}</p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {item.departmentName}
                      </span>
                      <span>&bull;</span>
                      <span>{item.serviceName}</span>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 shrink-0 self-end sm:self-center bg-slate-50 dark:bg-[#162033] px-2 py-1 rounded-md border border-slate-100 dark:border-slate-800">
                  {item.timestamp}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-slate-500 dark:text-slate-400">
            No activities match the selected filter.
          </div>
        )}
      </div>
    </div>
  );
};
