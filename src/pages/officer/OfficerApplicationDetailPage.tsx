import React, { useState, useEffect } from 'react';
import { Application, Citizen } from '../../types';
import { officerApi } from '../../services/api/officerApi';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ApplicationTimeline } from '../../components/common/ApplicationTimeline';
import {
  ArrowLeft,
  Building2,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  Layers,
  AlertCircle,
  MessageSquare,
  Send,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react';

interface OfficerApplicationDetailPageProps {
  applicationId: string;
  officer: Citizen;
  onBack: () => void;
  onApplicationUpdated?: (updated: Application) => void;
}

export const OfficerApplicationDetailPage: React.FC<OfficerApplicationDetailPageProps> = ({
  applicationId,
  officer,
  onBack,
  onApplicationUpdated,
}) => {
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Remarks state
  const [remarkText, setRemarkText] = useState('');

  // Document rejection modal state
  const [rejectingDocId, setRejectingDocId] = useState<string | null>(null);
  const [docRejectionReason, setDocRejectionReason] = useState('');

  // Application rejection modal state
  const [isRejectingApp, setIsRejectingApp] = useState(false);
  const [appRejectionReason, setAppRejectionReason] = useState('');

  const fetchDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await officerApi.getApplicationById(applicationId);
      setApplication(data);
    } catch (err: any) {
      setError(err?.message || `Failed to retrieve application ${applicationId}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [applicationId]);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleVerifyDocument = async (docIdOrName: string) => {
    if (!application) return;
    try {
      setActionLoading(true);
      const res = await officerApi.verifyDocument(application.id, docIdOrName);
      setApplication(res.application);
      if (onApplicationUpdated) onApplicationUpdated(res.application);
      showToast(`Document "${res.document.name}" marked as VERIFIED.`);
    } catch (err: any) {
      alert(err?.message || 'Failed to verify document.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmRejectDocument = async () => {
    if (!application || !rejectingDocId) return;
    if (!docRejectionReason.trim()) {
      alert('Please specify a rejection reason for this document.');
      return;
    }
    try {
      setActionLoading(true);
      const res = await officerApi.rejectDocument(
        application.id,
        rejectingDocId,
        docRejectionReason.trim()
      );
      setApplication(res.application);
      if (onApplicationUpdated) onApplicationUpdated(res.application);
      showToast(`Document "${res.document.name}" marked as REJECTED.`);
      setRejectingDocId(null);
      setDocRejectionReason('');
    } catch (err: any) {
      alert(err?.message || 'Failed to reject document.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddRemark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!application || !remarkText.trim()) return;
    try {
      setActionLoading(true);
      const res = await officerApi.addRemark(application.id, remarkText.trim());
      setApplication(res.application);
      if (onApplicationUpdated) onApplicationUpdated(res.application);
      setRemarkText('');
      showToast('Official remark successfully recorded.');
    } catch (err: any) {
      alert(err?.message || 'Failed to record remark.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusTransition = async (targetStatus: string, reason?: string) => {
    if (!application) return;
    try {
      setActionLoading(true);
      const updated = await officerApi.updateStatus(application.id, targetStatus, reason);
      setApplication(updated);
      if (onApplicationUpdated) onApplicationUpdated(updated);
      showToast(`Application successfully transitioned to ${targetStatus}.`);
      setIsRejectingApp(false);
      setAppRejectionReason('');
    } catch (err: any) {
      alert(err?.message || 'Failed to update application status.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-slate-400 text-sm flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-6 h-6 animate-spin text-brand-600" />
        <span>Loading application scrutiny file {applicationId}...</span>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="bg-white rounded-2xl border border-rose-200 p-8 text-center space-y-4 shadow-sm">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800">Application Not Accessible</h2>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          {error || 'The requested application was not found or you are not authorized to view it.'}
        </p>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-navy-900 text-white text-xs font-semibold rounded-lg hover:bg-navy-800"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Queue
        </button>
      </div>
    );
  }

  // Determine allowed next status actions
  const currentStatus = application.status;
  const canMoveToVerification = currentStatus === 'Submitted';
  const canMoveToReview = currentStatus === 'Under Verification';
  const canApprove = currentStatus === 'Under Review';
  const canComplete = currentStatus === 'Approved';
  const canReject = ['Submitted', 'Under Verification', 'Under Review'].includes(currentStatus);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Success Toast */}
      {successToast && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-900 text-emerald-50 px-4 py-3 rounded-xl shadow-xl border border-emerald-700 text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-navy-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Applications List
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Authenticated Officer:</span>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-navy-100 text-navy-900 border border-navy-200">
            {officer.name}
          </span>
        </div>
      </div>

      {/* Main Application Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-1">
              <span className="font-mono text-lg font-black text-navy-900 tracking-tight">
                {application.id}
              </span>
              <StatusBadge status={application.status} />
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                {application.departmentName}
              </span>
            </div>
            <h1 className="text-xl font-extrabold text-slate-900">
              {application.serviceName}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Applicant</span>
              <span className="font-bold text-slate-900">{application.citizenName}</span>
            </div>
            <div className="w-px h-6 bg-slate-200" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Citizen ID</span>
              <span className="font-mono font-semibold text-slate-700">{application.citizenId}</span>
            </div>
            <div className="w-px h-6 bg-slate-200" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Submitted Date</span>
              <span className="font-semibold text-slate-700">{application.submittedAt}</span>
            </div>
          </div>
        </div>

        {/* Interoperability Dispatch & Provenance Banner */}
        <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-slate-50 p-4 rounded-xl border border-blue-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-bold text-navy-900">
              <Layers className="w-4 h-4 text-brand-600" />
              <span>Interoperability Provenance Pipeline</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">
                MOCK / SIMULATED
              </span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Dispatched from Citizen Portal &rarr; SevaSetu Unified Consent Middleware &rarr;{' '}
              <strong className="text-navy-900">{application.departmentName} Adapter</strong> &rarr; State Registry
            </p>
          </div>
          <div className="text-[11px] font-mono bg-white px-3 py-1.5 rounded-lg border border-blue-200 text-blue-900 font-semibold shrink-0">
            Digest Verified: SHA-256 (Mock UIDAI/CBSE)
          </div>
        </div>
      </div>

      {/* Grid: Left Column (Application Info + Documents + Remarks) & Right Column (Workflow + Timeline) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Application Information */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-navy-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-600" />
                Submitted Application Information
              </h2>
              <span className="text-[11px] text-slate-400">Citizen Provided &amp; Verified</span>
            </div>

            {/* Prefilled Fields */}
            {Object.keys(application.prefilledFields || {}).length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Verified Ingested Credentials (DigiLocker Mock)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(application.prefilledFields).map(([key, item]) => (
                    <div
                      key={key}
                      className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 text-xs"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-slate-500 font-medium">{key}</span>
                        {item.verified && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                            <ShieldCheck className="w-3 h-3" /> Verified
                          </span>
                        )}
                      </div>
                      <div className="font-semibold text-slate-900 text-sm">{item.value}</div>
                      <span className="text-[10px] text-slate-400 mt-1 block">Source: {item.source}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* User Form Fields */}
            {Object.keys(application.userFields || {}).length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Applicant Form Responses
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(application.userFields).map(([key, val]) => (
                    <div
                      key={key}
                      className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 text-xs"
                    >
                      <span className="text-slate-500 font-medium block mb-1">{key}</span>
                      <div className="font-semibold text-slate-900">{val}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Authorized Documents Verification Hub */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-navy-900 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  Authorized Documents &amp; Verification
                </h2>
                <p className="text-xs text-slate-500">
                  Review digital hashes. Verify or reject each credential with official signature.
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-600">
                {application.documentsAttached.length} Attached
              </span>
            </div>

            <div className="space-y-3">
              {application.documentsAttached.map((doc, idx) => {
                const isVerified = doc.verificationStatus === 'VERIFIED' || doc.verified;
                const isRejected = doc.verificationStatus === 'REJECTED';
                const isPending = !isVerified && !isRejected;
                const docIdentifier = doc.docId || doc.docNumber || doc.name || String(idx);

                return (
                  <div
                    key={docIdentifier}
                    className={`p-4 rounded-xl border transition-all ${
                      isVerified
                        ? 'border-emerald-200 bg-emerald-50/30'
                        : isRejected
                        ? 'border-rose-200 bg-rose-50/30'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs sm:text-sm">
                            {doc.name}
                          </span>
                          {/* Verification Status Badge */}
                          {isVerified && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Verified
                            </span>
                          )}
                          {isRejected && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
                              <XCircle className="w-3 h-3" /> Rejected
                            </span>
                          )}
                          {isPending && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Pending Verification
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <span>Type: {doc.docType}</span>
                          <span>&bull;</span>
                          <span>Source: {doc.source}</span>
                          {doc.docNumber && (
                            <>
                              <span>&bull;</span>
                              <span className="font-mono text-slate-600">Doc No: {doc.docNumber}</span>
                            </>
                          )}
                        </div>

                        {/* Verified Stamp Details */}
                        {isVerified && doc.verifiedByName && (
                          <div className="text-[11px] text-emerald-800 font-medium pt-1">
                            Verified by {doc.verifiedByName} on {doc.verifiedAt}
                          </div>
                        )}

                        {/* Rejection Reason Notice */}
                        {isRejected && doc.rejectionReason && (
                          <div className="text-[11px] text-rose-800 font-medium pt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 text-rose-600" />
                            <span>Rejection reason: &quot;{doc.rejectionReason}&quot;</span>
                          </div>
                        )}
                      </div>

                      {/* Document Actions */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <button
                          onClick={() => handleVerifyDocument(docIdentifier)}
                          disabled={actionLoading || isVerified}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            isVerified
                              ? 'bg-emerald-100 text-emerald-700 cursor-default opacity-80'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{isVerified ? 'Verified' : 'Verify'}</span>
                        </button>

                        <button
                          onClick={() => {
                            setRejectingDocId(docIdentifier);
                            setDocRejectionReason('');
                          }}
                          disabled={actionLoading || isRejected}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            isRejected
                              ? 'bg-rose-100 text-rose-700 cursor-default opacity-80'
                              : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                          }`}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>{isRejected ? 'Flagged' : 'Reject'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Officer Remarks Hub */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-navy-900 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-brand-600" />
                  Official Desk Remarks
                </h2>
                <p className="text-xs text-slate-500">
                  Immutable officer remarks recorded against this application record.
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-600">
                {(application.officerRemarks || []).length} Recorded
              </span>
            </div>

            {/* Existing Remarks List */}
            <div className="space-y-2.5">
              {(!application.officerRemarks || application.officerRemarks.length === 0) ? (
                <div className="p-4 rounded-xl bg-slate-50 text-center text-xs text-slate-500">
                  No official remarks recorded yet for this application.
                </div>
              ) : (
                application.officerRemarks.map((rem) => (
                  <div
                    key={rem.id}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-navy-900">{rem.officerName}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-navy-100 text-navy-800">
                          {rem.role.toUpperCase()}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">{rem.timestamp}</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed font-sans">{rem.text}</p>
                  </div>
                ))
              )}
            </div>

            {/* Add New Remark Form */}
            <form onSubmit={handleAddRemark} className="pt-3 border-t border-slate-100 space-y-2.5">
              <label className="block text-xs font-bold text-slate-700">
                Add New Official Desk Remark
              </label>
              <textarea
                value={remarkText}
                onChange={(e) => setRemarkText(e.target.value)}
                placeholder="e.g. Income certificate verified against municipal revenue ledger. Marksheet criteria fulfilled..."
                rows={3}
                className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={actionLoading || !remarkText.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-navy-900 hover:bg-navy-800 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Post Remark</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Workflow Action Bar & Timeline */}
        <div className="space-y-6">
          {/* Section 4: Application Status Workflow Actions */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div>
              <h2 className="text-sm font-bold text-navy-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-brand-600" />
                Workflow Progression
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Deterministic departmental status transitions.
              </p>
            </div>

            {/* Current Stage Indicator */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Current State</span>
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-navy-900 text-sm">{application.status}</span>
                <StatusBadge status={application.status} />
              </div>
            </div>

            {/* Allowed Workflow Action Buttons */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Available Desk Actions
              </span>

              {canMoveToVerification && (
                <button
                  onClick={() => handleStatusTransition('Under Verification')}
                  disabled={actionLoading}
                  className="w-full py-2.5 px-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span>Advance to Under Verification</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}

              {canMoveToReview && (
                <button
                  onClick={() => handleStatusTransition('Under Review')}
                  disabled={actionLoading}
                  className="w-full py-2.5 px-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span>Advance to Under Review</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}

              {canApprove && (
                <button
                  onClick={() => handleStatusTransition('Approved')}
                  disabled={actionLoading}
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve Application</span>
                </button>
              )}

              {canComplete && (
                <button
                  onClick={() => handleStatusTransition('Completed')}
                  disabled={actionLoading}
                  className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mark Completed &amp; Disbursed</span>
                </button>
              )}

              {canReject && (
                <button
                  onClick={() => {
                    setIsRejectingApp(true);
                    setAppRejectionReason('');
                  }}
                  disabled={actionLoading}
                  className="w-full py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject Application</span>
                </button>
              )}

              {/* Terminal State Message */}
              {(currentStatus === 'Approved' || currentStatus === 'Completed' || currentStatus === 'Rejected') && !canComplete && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500 font-medium">
                  Application has reached a completed workflow stage ({currentStatus}).
                </div>
              )}
            </div>
          </div>

          {/* Section 5: Application Timeline */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-navy-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-600" />
              Application Audit Timeline
            </h2>
            <ApplicationTimeline
              timeline={application.timeline}
              userRole={officer.role}
              userDeptName={officer.departmentId}
              appDeptName={application.departmentName}
            />
          </div>
        </div>
      </div>

      {/* Document Rejection Modal */}
      {rejectingDocId && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
              <AlertCircle className="w-5 h-5" />
              <span>Flag / Reject Attached Document</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Please enter an official explanation for rejecting this document. This note will be recorded in
              the citizen audit stream.
            </p>
            <textarea
              value={docRejectionReason}
              onChange={(e) => setDocRejectionReason(e.target.value)}
              placeholder="e.g. Marksheet copy is blurry and unreadable; please re-upload clear digital copy."
              rows={3}
              className="w-full p-3 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectingDocId(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRejectDocument}
                disabled={actionLoading || !docRejectionReason.trim()}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-xs"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Application Rejection Modal */}
      {isRejectingApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
              <AlertCircle className="w-5 h-5" />
              <span>Reject Entire Application</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Provide mandatory justification for application rejection. This updates the citizen application
              state and records an official audit event.
            </p>
            <textarea
              value={appRejectionReason}
              onChange={(e) => setAppRejectionReason(e.target.value)}
              placeholder="e.g. Annual income exceeds statutory quota limits for higher education subsidy."
              rows={3}
              className="w-full p-3 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsRejectingApp(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleStatusTransition('Rejected', appRejectionReason.trim())}
                disabled={actionLoading || !appRejectionReason.trim()}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-xs"
              >
                Confirm Application Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
