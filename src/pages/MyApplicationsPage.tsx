import React, { useState } from 'react';
import { Application, Citizen } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { ApplicationTimeline } from '../components/common/ApplicationTimeline';
import { adapterStore } from '../services/adapterStore';
import {
  FileText,
  Search,
  Building2,
  Calendar,
  Clock,
  ArrowRight,
  ExternalLink,
  X,
  Layers,
  CheckCircle2,
  Shield,
  Play,
  AlertCircle,
} from 'lucide-react';

interface MyApplicationsPageProps {
  applications: Application[];
  selectedAppId?: string | null;
  onClearSelectedApp?: () => void;
  citizen?: Citizen;
}

export const MyApplicationsPage: React.FC<MyApplicationsPageProps> = ({
  applications,
  selectedAppId,
  onClearSelectedApp,
  citizen,
}) => {
  const currentCitizen = citizen || adapterStore.getCitizen();
  const userRole = currentCitizen.role || 'citizen';
  const userDeptId = currentCitizen.departmentId;
  const isOfficer = userRole === 'officer';
  const isAdmin = userRole === 'admin';

  const userDeptName =
    userDeptId === 'dept-edu'
      ? 'Education Department'
      : userDeptId === 'dept-rev'
      ? 'Revenue Department'
      : userDeptId === 'dept-trans'
      ? 'Transport Department'
      : 'Assigned Department';

  const [filterTab, setFilterTab] = useState<'active' | 'completed' | 'all'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [trackingApp, setTrackingApp] = useState<Application | null>(() => {
    if (selectedAppId) {
      return applications.find((a) => a.id === selectedAppId) || null;
    }
    return null;
  });

  // Sync tracking app if applications list updates or selectedAppId changes
  React.useEffect(() => {
    if (selectedAppId) {
      const found = applications.find((a) => a.id === selectedAppId);
      if (found) setTrackingApp(found);
    }
  }, [selectedAppId, applications]);

  const activeApps = applications.filter(
    (app) => app.status === 'Submitted' || app.status === 'Under Verification' || app.status === 'Under Review'
  );

  const completedApps = applications.filter(
    (app) => app.status === 'Approved' || app.status === 'Rejected'
  );

  const displayedList = (
    filterTab === 'active' ? activeApps : filterTab === 'completed' ? completedApps : applications
  ).filter((app) => {
    const q = searchQuery.toLowerCase();
    return (
      app.id.toLowerCase().includes(q) ||
      app.serviceName.toLowerCase().includes(q) ||
      app.departmentName.toLowerCase().includes(q) ||
      app.status.toLowerCase().includes(q)
    );
  });

  const handleAdvanceStatus = async (appId: string) => {
    const updated = await adapterStore.advanceApplicationStatus(appId);
    if (updated) {
      setTrackingApp({ ...updated });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-navy-900 dark:text-white tracking-tight">
                {isOfficer ? 'Department Applications' : 'My Applications'}
              </h1>
              {isOfficer && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/60 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" />
                  {userDeptName} Portal
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {isOfficer
                ? `Authorized review console for ${userDeptName}. Verify applicant credentials and advance processing stages.`
                : 'Track status, review pre-filled credentials, and inspect department audit trails for all your applications.'}
            </p>
          </div>

          {/* Quick Search */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID or service..."
              className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 dark:bg-[#162033] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white dark:focus:bg-[#162033]"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mt-6 border-b border-slate-200 dark:border-slate-800 pb-2">
          <button
            onClick={() => setFilterTab('active')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              filterTab === 'active'
                ? 'bg-navy-900 dark:bg-slate-800 text-white shadow-sm dark:border dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <span>Active Applications</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white font-mono">
              {activeApps.length}
            </span>
          </button>

          <button
            onClick={() => setFilterTab('completed')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              filterTab === 'completed'
                ? 'bg-navy-900 dark:bg-slate-800 text-white shadow-sm dark:border dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <span>Recently Completed</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono">
              {completedApps.length}
            </span>
          </button>

          <button
            onClick={() => setFilterTab('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              filterTab === 'all'
                ? 'bg-navy-900 dark:bg-slate-800 text-white shadow-sm dark:border dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <span>All Applications</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono">
              {applications.length}
            </span>
          </button>
        </div>
      </div>

      {/* Applications List */}
      {displayedList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedList.map((app) => {
            const completedStages = app.timeline.filter((t) => t.status === 'completed').length;
            const totalStages = app.timeline.length;
            const progressPercent = Math.round((completedStages / totalStages) * 100);

            return (
              <div
                key={app.id}
                className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md hover:border-brand-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-950/60 px-2.5 py-1 rounded-md border border-brand-100 dark:border-brand-800/60">
                      {app.id}
                    </span>
                    <StatusBadge status={app.status} size="sm" />
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-navy-900 dark:text-white leading-snug">{app.serviceName}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                      {app.departmentName}
                    </p>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span>Department Stage Progress</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{progressPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          app.status === 'Approved' ? 'bg-emerald-500' : 'bg-brand-600'
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Timestamps */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                    <div className="flex items-center justify-between">
                      <span>Submitted:</span>
                      <span className="font-mono text-slate-700 dark:text-slate-300">{app.submittedAt}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Last Activity:</span>
                      <span className="font-mono text-slate-700 dark:text-slate-300">{app.updatedAt}</span>
                    </div>
                  </div>
                </div>

                {/* Card CTA */}
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">
                    {app.documentsAttached.length} Verified Docs
                  </span>
                  <button
                    onClick={() => setTrackingApp(app)}
                    className="px-3.5 py-1.5 bg-navy-900 hover:bg-brand-700 dark:bg-slate-800 dark:hover:bg-brand-600 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1 dark:border dark:border-slate-700"
                  >
                    <span>View Details &amp; Track</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">No applications found in this category.</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Try switching tabs or searching for another application.</p>
        </div>
      )}

      {/* TRACKING MODAL / DRAWER */}
      {trackingApp && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/65 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111827] rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-navy-900 dark:bg-[#0B1120] text-white p-5 flex items-center justify-between shrink-0 border-b border-navy-800 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-500/20 text-brand-300 rounded-lg border border-brand-400/20">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded border border-amber-300/30">
                      {trackingApp.id}
                    </span>
                    <StatusBadge status={trackingApp.status} size="sm" />
                  </div>
                  <h3 className="text-base font-bold text-white mt-0.5">{trackingApp.serviceName}</h3>
                  <p className="text-xs text-slate-300">{trackingApp.departmentName}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setTrackingApp(null);
                  if (onClearSelectedApp) onClearSelectedApp();
                }}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Vertical Activity Timeline */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Application Processing Timeline
                  </h4>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Live Adapter Status</span>
                </div>

                <ApplicationTimeline
                  timeline={trackingApp.timeline}
                  canAdvance={
                    (isAdmin || (isOfficer && userDeptId === trackingApp.departmentId)) &&
                    trackingApp.status !== 'Approved' &&
                    trackingApp.status !== 'Rejected'
                  }
                  onAdvanceStatus={() => handleAdvanceStatus(trackingApp.id)}
                  userRole={userRole}
                  userDeptName={userDeptName}
                  appDeptName={trackingApp.departmentName}
                />
              </div>

              {/* Pre-filled & Verified Credentials Review */}
              <div className="border-t border-slate-200 dark:border-slate-800 pt-5 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Authorized Information Used</span>
                </h4>
                <div className="bg-slate-50 dark:bg-[#162033]/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 space-y-2 text-xs">
                  {Object.entries(trackingApp.prefilledFields).map(([k, v]) => (
                    <div key={k} className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800/60 last:border-0">
                      <span className="text-slate-500 dark:text-slate-400">{k}:</span>
                      <div className="text-right">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">{v.value}</span>
                        <span className="ml-2 text-[10px] text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded">
                          {v.source}
                        </span>
                      </div>
                    </div>
                  ))}
                  {Object.entries(trackingApp.userFields).map(([k, v]) => (
                    <div key={k} className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800/60 last:border-0">
                      <span className="text-slate-500 dark:text-slate-400">{k}:</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Attached Verified Documents */}
              <div className="border-t border-slate-200 dark:border-slate-800 pt-5 space-y-2.5">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Documents Attached via Mock Adapter ({trackingApp.documentsAttached.length})
                </h4>
                <div className="space-y-2 text-xs">
                  {trackingApp.documentsAttached.map((doc, idx) => {
                    const isVerified = doc.verificationStatus === 'VERIFIED' || doc.verified;
                    const isRejected = doc.verificationStatus === 'REJECTED';

                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                          isRejected
                            ? 'bg-rose-50/50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/60'
                            : isVerified
                            ? 'bg-white dark:bg-[#162033]/40 border-slate-200 dark:border-slate-800'
                            : 'bg-amber-50/30 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {isRejected ? (
                            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                          ) : (
                            <CheckCircle2
                              className={`w-4 h-4 shrink-0 ${
                                isVerified ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500 dark:text-amber-400'
                              }`}
                            />
                          )}
                          <div>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{doc.name}</span>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">
                              Source: {doc.source} {doc.docNumber ? `• Ref: ${doc.docNumber}` : ''}
                            </p>
                            {isRejected && doc.rejectionReason && (
                              <p className="text-[11px] font-medium text-rose-700 dark:text-rose-400 mt-0.5">
                                Officer Note: &quot;{doc.rejectionReason}&quot;
                              </p>
                            )}
                          </div>
                        </div>
                        <span
                          className={`self-start sm:self-center text-[10px] font-bold px-2 py-0.5 rounded ${
                            isRejected
                              ? 'text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800/60'
                              : isVerified
                              ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60'
                              : 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60'
                          }`}
                        >
                          {isRejected ? 'Flagged / Rejected' : isVerified ? 'Verified' : 'Pending Verification'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Officer Remarks (Visible to Citizen) */}
              {trackingApp.officerRemarks && trackingApp.officerRemarks.length > 0 && (
                <div className="border-t border-slate-200 dark:border-slate-800 pt-5 space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                    <span>Official Department Desk Remarks</span>
                  </h4>
                  <div className="space-y-2 text-xs">
                    {trackingApp.officerRemarks.map((rem) => (
                      <div
                        key={rem.id}
                        className="p-3 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/60 rounded-xl space-y-1"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-navy-900 dark:text-white">{rem.officerName}</span>
                          <span className="text-slate-400 dark:text-slate-500">{rem.timestamp}</span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-sans">{rem.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 dark:bg-[#162033]/60 px-6 py-3 border-t border-slate-200 dark:border-slate-800 flex justify-end shrink-0">
              <button
                onClick={() => {
                  setTrackingApp(null);
                  if (onClearSelectedApp) onClearSelectedApp();
                }}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors dark:border dark:border-slate-700"
              >
                Close Tracking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
