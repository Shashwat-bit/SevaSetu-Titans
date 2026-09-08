import React, { useState } from 'react';
import { Citizen, DigiLockerMockDocument } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { adapterStore } from '../services/adapterStore';
import {
  User,
  Shield,
  FileCheck,
  CheckCircle2,
  RefreshCw,
  Lock,
  LogOut,
  Building2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

interface ProfilePageProps {
  citizen: Citizen;
  digiLockerDocs: DigiLockerMockDocument[];
  onOpenOnboarding: () => void;
  onResetDemo: () => void;
  onLogout: () => void;
  onOpenAuthModal?: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  citizen,
  digiLockerDocs,
  onOpenOnboarding,
  onResetDemo,
  onLogout,
  onOpenAuthModal,
}) => {
  const [resetting, setResetting] = useState(false);

  const isOfficer = citizen.role === 'officer';
  const isAdmin = citizen.role === 'admin';

  const deptName =
    citizen.departmentId === 'dept-edu'
      ? 'Education Department'
      : citizen.departmentId === 'dept-rev'
      ? 'Revenue Department'
      : citizen.departmentId === 'dept-trans'
      ? 'Transport Department'
      : 'Department';

  const handleReset = () => {
    setResetting(true);
    setTimeout(() => {
      onResetDemo();
      setResetting(false);
    }, 400);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-navy-800 to-navy-950 text-white flex items-center justify-center text-2xl font-bold shadow-md border border-navy-700">
              {citizen.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">{citizen.name}</h1>
                {isOfficer ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" />
                    Officer ({deptName})
                  </span>
                ) : isAdmin ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300">
                    System Admin
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    Citizen Account
                  </span>
                )}
              </div>
              {isOfficer ? (
                <p className="text-xs text-slate-500 mt-0.5">
                  Officer ID: <span className="font-mono text-slate-700">{citizen.id}</span> &bull; Scope:{' '}
                  <span className="font-semibold text-slate-700">{deptName} ({citizen.departmentId})</span> &bull; Email:{' '}
                  <span className="font-mono text-slate-700">{citizen.email}</span>
                </p>
              ) : (
                <p className="text-xs text-slate-500 mt-0.5">
                  Aadhaar: <span className="font-mono text-slate-700">{citizen.maskedAadhaar}</span> &bull; DOB:{' '}
                  {citizen.dateOfBirth} &bull; Gender: {citizen.gender}
                </p>
              )}
              <p className="text-xs text-slate-500 mt-0.5">{citizen.address}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenAuthModal && (
              <button
                onClick={onOpenAuthModal}
                className="px-3.5 py-2 bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
                <span>Switch Persona</span>
              </button>
            )}
            <button
              onClick={onLogout}
              className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Connected Data Sources & Department Adapters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Connected Data Sources (DigiLocker Mock) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-navy-900">Connected Document Sources</h2>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                    Mock Connector
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Simulated document repository connector by BeyondBits.
                </p>
              </div>

              {citizen.isDigiLockerConnected ? (
                <button
                  onClick={onOpenOnboarding}
                  className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold hover:bg-emerald-100 transition-colors"
                >
                  Manage Connector
                </button>
              ) : (
                <button
                  onClick={onOpenOnboarding}
                  className="px-3.5 py-1.5 rounded-lg bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 transition-colors"
                >
                  Connect DigiLocker Mock
                </button>
              )}
            </div>

            {/* DigiLocker Status Card */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">DigiLocker Mock Adapter</span>
                    <StatusBadge
                      status={citizen.isDigiLockerConnected ? 'Connected' : 'Disconnected'}
                      size="sm"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {citizen.isDigiLockerConnected
                      ? `Active link established on ${citizen.connectedAt || '01 Sep 2026'}`
                      : 'Not connected. Applications will require manual data entry.'}
                  </p>
                </div>
              </div>

              <span className="text-[11px] font-mono text-slate-400">
                Adapter ID: DL-MOCK-V1
              </span>
            </div>

            {/* Available Credentials in Vault */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                Simulated Credentials Available in Connected Vault ({digiLockerDocs.length})
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {digiLockerDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1.5 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{doc.name}</span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">{doc.issuer}</p>
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-100">
                      <span>Ref: {doc.docNumber}</span>
                      <span>{doc.issueDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Platform Settings & Reset Demo State */}
        <div className="space-y-6">
          {/* Department Interoperability Status */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-brand-600" />
              <span>Department Adapters (Simulated)</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="font-semibold text-slate-800">Education Dept Adapter</span>
                <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                  Active (Mock)
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="font-semibold text-slate-800">Revenue Dept Adapter</span>
                <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                  Active (Mock)
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="font-semibold text-slate-800">Transport RTO Adapter</span>
                <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                  Active (Mock)
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="font-semibold text-slate-800">Social Welfare Adapter</span>
                <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                  Active (Mock)
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
              In production, each adapter translates the normalized citizen payload into the departmental REST/SOAP
              protocol without modifying the department&apos;s internal database.
            </p>
          </div>

          {/* Demo Reset Card */}
          <div className="bg-gradient-to-br from-slate-900 to-navy-950 text-white rounded-2xl p-5 shadow-sm border border-navy-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <RefreshCw className="w-4 h-4" />
              <span>Demo State Reset Tool</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Reset the local demo storage to its default pristine state. This clears custom-submitted applications,
              restores default active permissions, and resets the activity log.
            </p>
            <button
              onClick={handleReset}
              disabled={resetting}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
              <span>{resetting ? 'Resetting Demo State...' : 'Reset Demo State to Initial'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
