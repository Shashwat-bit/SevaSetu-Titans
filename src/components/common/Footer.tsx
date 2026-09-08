import React from 'react';
import { Shield, Layers, RefreshCw, ExternalLink } from 'lucide-react';

interface FooterProps {
  onOpenHowItWorks: () => void;
  onResetDemo: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenHowItWorks, onResetDemo }) => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-16 pb-20 md:pb-10 pt-10 text-slate-600 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-navy-900 text-white flex items-center justify-center">
                <Shield className="w-4 h-4 text-amber-400" />
              </div>
              <span className="font-extrabold text-sm text-navy-900">
                Seva<span className="text-brand-600">Setu</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-lg">
              A citizen-centric interoperability middleware prototype developed by <strong>BeyondBits</strong>.
              SevaSetu unifies service discovery, granular consent, verified credential
              auto-filling, and cross-department tracking without replacing existing departmental systems.
            </p>
            <div className="flex items-center gap-2 pt-1 text-slate-400">
              <span>Powered by Standardized Adapter Specifications</span>
              <span>&bull;</span>
              <span>Local Demo Persistence</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">Platform Architecture</h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button
                  onClick={onOpenHowItWorks}
                  className="text-brand-600 hover:text-brand-800 flex items-center gap-1 font-medium"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>How SevaSetu Works</span>
                </button>
              </li>
              <li>
                <span className="text-slate-500">Decoupled Adapter Layer</span>
              </li>
              <li>
                <span className="text-slate-500">DigiLocker Mock Adapter</span>
              </li>
              <li>
                <span className="text-slate-500">Privacy-First Granular Consent</span>
              </li>
            </ul>
          </div>

          {/* Hackathon Evaluation Tools */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">Evaluation &amp; Demo</h4>
            <p className="text-slate-500 text-[11px]">
              Easily reset state to initial mock applications &amp; consents for a clean demonstration.
            </p>
            <button
              onClick={onResetDemo}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors text-xs border border-slate-200"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Demo State</span>
            </button>
          </div>
        </div>

        {/* Bottom Disclaimer */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            &copy; 2026 <strong>BeyondBits</strong>. All mock adapters and
            department integrations are simulated for research and demonstration purposes.
          </div>
          <div className="flex items-center gap-4">
            <span>Privacy-First Architecture</span>
            <span>Zero Citizen Vendor Lock-in</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
