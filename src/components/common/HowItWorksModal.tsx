import React from 'react';
import { X, ArrowDown, Shield, Database, Cpu, User, Building2, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-navy-800 to-navy-900 text-white p-6 relative">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-brand-500/20 rounded-xl border border-brand-400/30 text-brand-300">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-brand-500/20 text-brand-300 border border-brand-400/30 rounded">
                  Interoperability Architecture
                </span>
              </div>
              <h2 className="text-xl font-bold text-white mt-1">How SevaSetu Works</h2>
              <p className="text-xs text-slate-300">Interoperability & Consent Middleware Architecture</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[78vh] overflow-y-auto">
          {/* Key Principle Alert */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-amber-900">Important Architectural Principle:</p>
              <p className="text-amber-800 mt-0.5">
                <strong>SevaSetu does NOT replace government department systems or legacy databases.</strong>{' '}
                It serves as a privacy-preserving interoperability and consent bridge connecting citizens,
                data repositories, and state department portals through standardized adapters.
              </p>
            </div>
          </div>

          {/* Interactive Flow Diagram */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 text-center">
              The 5-Tier Interoperability Data Flow
            </h3>

            <div className="flex flex-col items-center space-y-3">
              {/* Step 1: Citizen */}
              <div className="w-full max-w-md bg-white border border-slate-200 shadow-sm rounded-xl p-3.5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                  <User className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 uppercase">1. Citizen</span>
                    <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">User Intent</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Discovers service (e.g. Scholarship) and initiates application from single dashboard.
                  </p>
                </div>
              </div>

              <ArrowDown className="w-4 h-4 text-slate-400" />

              {/* Step 2: Consent */}
              <div className="w-full max-w-md bg-white border border-slate-200 shadow-sm rounded-xl p-3.5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <Shield className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 uppercase">2. Granular Consent</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">Privacy Guard</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Citizen gives explicit, time-bounded permission specifying <em>Who</em>, <em>What</em>, and <em>Why</em>.
                  </p>
                </div>
              </div>

              <ArrowDown className="w-4 h-4 text-slate-400" />

              {/* Step 3: SevaSetu Middleware */}
              <div className="w-full max-w-md bg-navy-900 text-white shadow-md rounded-xl p-4 flex items-center gap-3 border border-navy-700">
                <div className="w-10 h-10 rounded-lg bg-brand-500 text-white flex items-center justify-center font-bold">
                  <Cpu className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white uppercase">3. SevaSetu Interoperability Layer</span>
                    <span className="text-[10px] bg-brand-400/20 text-brand-300 border border-brand-300/30 px-1.5 py-0.5 rounded">Middleware</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Simulates credential retrieval from DigiLocker Mock Connector &amp; normalizes data payload into department schema.
                  </p>
                </div>
              </div>

              <ArrowDown className="w-4 h-4 text-slate-400" />

              {/* Step 4: Department Adapter */}
              <div className="w-full max-w-md bg-white border border-slate-200 shadow-sm rounded-xl p-3.5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                  <Database className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 uppercase">4. Department Adapter</span>
                    <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">Protocol Translator</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Adapts unified payload to legacy department format (Education, Revenue, Transport, Welfare).
                  </p>
                </div>
              </div>

              <ArrowDown className="w-4 h-4 text-slate-400" />

              {/* Step 5: Department Legacy System */}
              <div className="w-full max-w-md bg-white border border-slate-200 shadow-sm rounded-xl p-3.5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 uppercase">5. Existing Department System</span>
                    <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded">Intact Backend</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Receives application in its native format. Officers process it using their existing portal screens.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Value Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50">
              <h4 className="text-xs font-bold uppercase text-rose-800 tracking-wider mb-2 flex items-center gap-1.5">
                Current Siloed Model
              </h4>
              <ul className="text-xs text-slate-700 space-y-2">
                <li className="flex items-start gap-1.5">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Citizen visits 15+ different portals with separate passwords</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Repeatedly re-enters name, address, and marks on every form</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Scans & uploads physical PDF documents repeatedly</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>No visibility into which department still retains their data</span>
                </li>
              </ul>
            </div>

            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50">
              <h4 className="text-xs font-bold uppercase text-emerald-800 tracking-wider mb-2 flex items-center gap-1.5">
                SevaSetu Interoperability Model
              </h4>
              <ul className="text-xs text-slate-700 space-y-2">
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>One unified citizen portal for discovery, apply, and tracking</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Zero duplicate entry: Verified credentials pre-fill with consent</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Granular consent tracking: Know who holds access and revoke anytime</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Zero department rewrites: Adapters translate to existing backends</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">BeyondBits Research Prototype &bull; Interoperability Middleware</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-navy-800 hover:bg-navy-900 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Got it, Explore Demo
          </button>
        </div>
      </div>
    </div>
  );
};
