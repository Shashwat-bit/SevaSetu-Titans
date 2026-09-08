import React, { useState } from 'react';
import { Shield, CheckCircle2, Lock, X, ArrowRight, FileCheck, AlertTriangle } from 'lucide-react';
import { Citizen } from '../types';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  citizen: Citizen;
  onConnectDigiLocker: () => void;
  onDisconnectDigiLocker: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  citizen,
  onConnectDigiLocker,
  onDisconnectDigiLocker,
}) => {
  const [step, setStep] = useState<'intro' | 'consent' | 'connected'>(
    citizen.isDigiLockerConnected ? 'connected' : 'intro'
  );

  if (!isOpen) return null;

  const handleAllowConsent = () => {
    onConnectDigiLocker();
    setStep('connected');
  };

  const handleDisconnect = () => {
    onDisconnectDigiLocker();
    setStep('intro');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-navy-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-brand-500/20 rounded-lg text-brand-300 border border-brand-400/20">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-300/30">
                  Mock Integration
                </span>
                <span className="text-[10px] text-slate-300">Simulated Adapter</span>
              </div>
              <h3 className="text-base font-bold text-white">Digital Document Source</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step 1: Intro */}
        {step === 'intro' && (
          <div className="p-6 space-y-5">
            <div className="text-center py-2">
              <div className="w-16 h-16 bg-blue-50 border border-blue-200 rounded-2xl mx-auto flex items-center justify-center text-blue-700 mb-3 shadow-inner">
                <FileCheck className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Connect your digital documents</h4>
              <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
                Securely use authorized documents from DigiLocker Mock Adapter to make government applications
                faster, without repeated physical paperwork.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5 text-xs text-slate-700">
              <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-emerald-600" />
                <span>Simulated DigiLocker Credentials Available:</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 bg-white rounded-lg border border-slate-200 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Class XII CBSE Marksheet</span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-200 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Aadhaar Identity (UIDAI)</span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-200 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Electricity Address Proof</span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-200 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Income Self-Declaration</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors"
              >
                Skip for now
              </button>
              <button
                onClick={() => setStep('consent')}
                className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-md flex items-center justify-center gap-2 transition-colors"
              >
                <span>Connect DigiLocker</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Realistic Granular Consent Screen */}
        {step === 'consent' && (
          <div className="p-6 space-y-5">
            <div className="border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-brand-700 uppercase tracking-wider">
                <Shield className="w-4 h-4" />
                <span>Explicit Consent Authorization</span>
              </div>
              <h4 className="text-base font-bold text-slate-900 mt-1">
                Authorize SevaSetu to connect with DigiLocker Mock Adapter
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Please review the specific access parameters below before granting consent.
              </p>
            </div>

            {/* Granular Breakdown */}
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <span className="font-bold text-slate-900">1. Information Requested:</span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="px-2 py-0.5 bg-white border border-slate-300 rounded text-slate-700 font-medium">
                    Full Name &amp; Date of Birth
                  </span>
                  <span className="px-2 py-0.5 bg-white border border-slate-300 rounded text-slate-700 font-medium">
                    Permanent Address
                  </span>
                  <span className="px-2 py-0.5 bg-white border border-slate-300 rounded text-slate-700 font-medium">
                    Educational Marksheets
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="font-bold text-slate-900">2. Purpose of Access:</span>
                <p className="text-slate-600 mt-1">
                  To automatically pre-fill verified data in citizen-initiated government applications and
                  eliminate physical document uploads.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="font-bold text-slate-900">3. Access Duration:</span>
                  <p className="text-slate-600 mt-1">Valid for current session or until explicit revocation.</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="font-bold text-slate-900">4. Revocation Policy:</span>
                  <p className="text-slate-600 mt-1">You can revoke access anytime from the Data &amp; Consent center.</p>
                </div>
              </div>
            </div>

            {/* Warning / Non-Generic notice */}
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>
                <strong>Privacy Guarantee:</strong> SevaSetu does NOT store permanent unencrypted copies of your
                documents. Data is fetched on-demand during active service applications with your explicit approval.
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setStep('intro')}
                className="flex-1 py-2.5 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors"
              >
                Deny Access
              </button>
              <button
                onClick={handleAllowConsent}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md flex items-center justify-center gap-1.5 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Allow Specific Access</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Already Connected */}
        {step === 'connected' && (
          <div className="p-6 space-y-5 text-center">
            <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 rounded-2xl mx-auto flex items-center justify-center text-emerald-600 shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <span className="inline-block px-2.5 py-0.5 text-xs font-bold bg-emerald-100 text-emerald-800 rounded-full mb-1">
                Connected &amp; Verified
              </span>
              <h4 className="text-lg font-bold text-slate-900">DigiLocker Mock Adapter Linked</h4>
              <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
                Your verified digital identity and educational records are ready for one-click application pre-filling.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-left text-xs space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Citizen Account:</span>
                <span className="font-semibold text-slate-900">{citizen.name}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Connected At:</span>
                <span className="font-mono text-slate-700">{citizen.connectedAt || '01 Sep 2026'}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Adapter Type:</span>
                <span className="font-semibold text-amber-700">Simulated DigiLocker Adapter</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleDisconnect}
                className="flex-1 py-2.5 border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-semibold transition-colors"
              >
                Disconnect Adapter
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2.5 bg-navy-900 hover:bg-navy-800 text-white rounded-xl text-xs font-semibold shadow-md transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
