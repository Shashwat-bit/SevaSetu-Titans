import React, { useState } from 'react';
import { ConsentPermission, AuditActivity } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { adapterStore } from '../services/adapterStore';
import {
  ShieldCheck,
  ShieldAlert,
  Building2,
  Calendar,
  Lock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Info,
  History,
} from 'lucide-react';

interface DataConsentPageProps {
  permissions: ConsentPermission[];
  activities: AuditActivity[];
}

export const DataConsentPage: React.FC<DataConsentPageProps> = ({ permissions, activities }) => {
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const activePermissions = permissions.filter((p) => p.status === 'Active');
  const revokedPermissions = permissions.filter((p) => p.status === 'Access Revoked');

  // Filter access events for the Access History timeline
  const accessHistory = activities.filter(
    (act) => act.type === 'document_access' || act.type === 'consent_grant' || act.type === 'consent_revoke'
  );

  const handleRevoke = (permissionId: string) => {
    setRevokingId(permissionId);
    setTimeout(() => {
      adapterStore.revokePermission(permissionId);
      setRevokingId(null);
    }, 400);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Privacy-First Consent Architecture &bull; Citizen Sovereignty</span>
          </div>
          <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">
            Data &amp; Consent Privacy Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
            See exactly who holds access to your credentials, which application it is tied to, what specific data
            points are shared, and when that access expires. You have the right to revoke permission at any moment.
          </p>
        </div>

        {/* Quick metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Active Permissions
            </span>
            <span className="text-xl font-extrabold text-emerald-600 mt-0.5 block">
              {activePermissions.length}
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Revoked Permissions
            </span>
            <span className="text-xl font-extrabold text-slate-600 mt-0.5 block">
              {revokedPermissions.length}
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Consent Model
            </span>
            <span className="text-sm font-bold text-slate-800 mt-1 block">
              Granular &amp; Timed
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Data Storage
            </span>
            <span className="text-sm font-bold text-slate-800 mt-1 block">
              Zero Unencrypted Clones
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 1: ACTIVE PERMISSIONS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>ACTIVE PERMISSIONS</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                {activePermissions.length} active
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Authorized departments currently permitted to read specific verified credentials.
            </p>
          </div>
        </div>

        {activePermissions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {activePermissions.map((permission) => (
              <div
                key={permission.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                {/* Granular: WHO, APPLICATION, STATUS */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-navy-50 text-navy-800 rounded-lg">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Who Has Access:
                        </span>
                        <h3 className="text-sm font-bold text-navy-900 leading-snug">
                          {permission.whoHasAccess}
                        </h3>
                      </div>
                    </div>
                    <StatusBadge status={permission.status} size="sm" />
                  </div>

                  {/* WHICH APPLICATION */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Which Application:</span>
                      <span className="font-semibold text-slate-800">{permission.whichServiceName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Application ID:</span>
                      <span className="font-mono font-bold text-brand-700">{permission.whichApplicationId}</span>
                    </div>
                  </div>

                  {/* WHAT DATA */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      What Data is Accessed:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {permission.whatData.map((field, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 text-[11px] font-medium bg-white text-slate-700 border border-slate-200 px-2 py-0.5 rounded shadow-2xs"
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          {field}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* WHY / PURPOSE */}
                  <div className="space-y-0.5 text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Purpose:
                    </span>
                    <p className="text-slate-700">{permission.whyPurpose}</p>
                  </div>

                  {/* FROM WHEN -> UNTIL WHEN */}
                  <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-500">
                    <div>
                      <span className="text-slate-400 block">Access Granted:</span>
                      <span className="font-mono text-slate-700">{permission.fromWhen}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Access Valid Until:</span>
                      <span className="font-mono text-slate-700 font-semibold">{permission.untilWhen}</span>
                    </div>
                  </div>
                </div>

                {/* REVOKE ACTION */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Lock className="w-3 h-3 text-slate-400" />
                    <span>Citizen Controlled</span>
                  </div>
                  <button
                    onClick={() => handleRevoke(permission.id)}
                    disabled={revokingId === permission.id}
                    className="px-3.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>{revokingId === permission.id ? 'Revoking...' : 'Revoke Access'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
            <CheckCircle2 className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No active permissions currently granted.</p>
            <p className="text-xs text-slate-400 mt-0.5">
              When you submit a new application, service-specific consent will appear here.
            </p>
          </div>
        )}
      </div>

      {/* SECTION 2: REVOKED PERMISSIONS */}
      {revokedPermissions.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <div>
            <h2 className="text-base font-bold text-slate-700 flex items-center gap-2">
              <span>REVOKED PERMISSIONS</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                {revokedPermissions.length}
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Data permissions that have been terminated by the citizen.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {revokedPermissions.map((permission) => (
              <div
                key={permission.id}
                className="bg-slate-50/80 rounded-2xl border border-slate-200 p-4 space-y-3 opacity-80"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">{permission.whoHasAccess}</span>
                  <StatusBadge status="Access Revoked" size="sm" />
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  <div>
                    <strong>Application:</strong> {permission.whichServiceName} ({permission.whichApplicationId})
                  </div>
                  <div>
                    <strong>Revoked At:</strong> {permission.revokedAt || 'Recently'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: ACCESS HISTORY / AUDIT LOG */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-brand-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Access History &amp; Data Disclosure Log
            </h3>
          </div>
          <span className="text-xs text-slate-400">Chronological Audit Trail</span>
        </div>

        <div className="divide-y divide-slate-100">
          {accessHistory.map((item) => (
            <div key={item.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-0.5">
                <div className="text-xs font-semibold text-slate-900 flex items-center gap-2">
                  <span>{item.action}</span>
                  <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded">
                    {item.departmentName}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{item.details}</p>
              </div>
              <div className="text-[11px] font-mono text-slate-400 shrink-0">
                {item.timestamp}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
