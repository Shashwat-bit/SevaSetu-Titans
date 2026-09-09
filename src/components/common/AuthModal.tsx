import React, { useState } from 'react';
import {
  Shield,
  User,
  Building2,
  Lock,
  ArrowRight,
  CheckCircle2,
  X,
  AlertTriangle,
  Sparkles,
  KeyRound,
  GraduationCap,
  Landmark,
  Car,
} from 'lucide-react';
import { adapterStore } from '../../services/adapterStore';
import { Citizen } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: Citizen;
  onAuthSuccess?: (user: Citizen) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onAuthSuccess,
}) => {
  const [tab, setTab] = useState<'personas' | 'credentials'>('personas');
  const [loadingPersona, setLoadingPersona] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const personas = [
    {
      id: 'citizen' as const,
      roleName: 'Citizen Persona',
      name: 'Tanishka',
      role: 'citizen',
      desc: 'Submit scholarship & certificate applications, prefill from mock DigiLocker, grant/revoke consent.',
      deptCode: 'Citizen Portal',
      icon: User,
      color: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/60',
      badgeColor: 'bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200',
    },
    {
      id: 'officer-edu' as const,
      roleName: 'Department Officer',
      name: 'Dr. Arvind Sharma',
      role: 'officer',
      desc: 'Review and advance Post-Matric Scholarship applications submitted to Higher Education portal.',
      deptCode: 'Higher Education (EDU-GOV)',
      icon: GraduationCap,
      color: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
      badgeColor: 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200',
    },
    {
      id: 'officer-rev' as const,
      roleName: 'Department Officer',
      name: 'Smt. Rekha Patel',
      role: 'officer',
      desc: 'Verify and approve Income & Residence certificates as Mamlatdar / Revenue Executive.',
      deptCode: 'Revenue Dept (REV-GOV)',
      icon: Landmark,
      color: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60',
      badgeColor: 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200',
    },
    {
      id: 'officer-trans' as const,
      roleName: 'Department Officer',
      name: 'Shri Vikram Desai',
      role: 'officer',
      desc: 'Inspect applicant credentials and approve Learner Driving License permits.',
      deptCode: 'Transport RTO (RTO-GOV)',
      icon: Car,
      color: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/60',
      badgeColor: 'bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200',
    },
    {
      id: 'admin' as const,
      roleName: 'System Administrator',
      name: 'System Administrator',
      role: 'admin',
      desc: 'Central governance, live platform telemetry, department performance, and system audit logs.',
      deptCode: 'Central Node (ADMIN)',
      icon: Shield,
      color: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60',
      badgeColor: 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200',
    },
  ];

  const handleSelectPersona = async (personaId: 'citizen' | 'officer-edu' | 'officer-rev' | 'officer-trans' | 'admin') => {
    setErrorMsg(null);
    setLoadingPersona(personaId);
    try {
      const user = await adapterStore.switchPersona(personaId);
      if (onAuthSuccess) onAuthSuccess(user);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to switch persona');
    } finally {
      setLoadingPersona(null);
    }
  };

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      const user = await adapterStore.login(email, password);
      if (onAuthSuccess) onAuthSuccess(user);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#111827] rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-navy-900 dark:bg-[#0B1120] text-white p-5 flex items-center justify-between border-b border-navy-800 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-500/20 rounded-xl text-brand-300 border border-brand-400/20">
              <Shield className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-300/30">
                  Prototype Auth Node
                </span>
                <span className="text-[10px] text-slate-300">RBAC Enabled</span>
              </div>
              <h3 className="text-base font-bold text-white">Identity &amp; Role Authentication</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice Bar */}
        <div className="bg-slate-50 dark:bg-[#162033]/60 border-b border-slate-200 dark:border-slate-800 px-6 py-2.5 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
          <Sparkles className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0" />
          <span>
            Select a verified <strong>Demo Persona</strong> for immediate evaluation or use email credentials.
          </span>
        </div>

        {/* Tab Toggle */}
        <div className="px-6 pt-4">
          <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setTab('personas')}
              className={`py-2 rounded-lg transition-all ${
                tab === 'personas'
                  ? 'bg-white dark:bg-[#162033] text-navy-900 dark:text-white shadow-sm font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              1-Click Demo Personas
            </button>
            <button
              onClick={() => setTab('credentials')}
              className={`py-2 rounded-lg transition-all ${
                tab === 'credentials'
                  ? 'bg-white dark:bg-[#162033] text-navy-900 dark:text-white shadow-sm font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Email &amp; Password
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6">
          {tab === 'personas' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                Simulate role-based access control with real cryptographic JWTs generated on-demand:
              </p>

              {personas.map((p) => {
                const Icon = p.icon;
                const isCurrent =
                  currentUser.role === p.role &&
                  (p.role === 'citizen' || currentUser.departmentId === (p.id === 'officer-edu' ? 'dept-edu' : p.id === 'officer-rev' ? 'dept-rev' : 'dept-trans'));
                const isLoading = loadingPersona === p.id;

                return (
                  <button
                    key={p.id}
                    disabled={isLoading}
                    onClick={() => handleSelectPersona(p.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3.5 group hover:shadow-md ${
                      isCurrent
                        ? 'border-brand-500 bg-brand-50/40 dark:bg-brand-950/30 ring-1 ring-brand-500/30'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#162033]/40 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl border shrink-0 ${p.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                            {p.name}
                          </span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${p.badgeColor}`}>
                            {p.roleName}
                          </span>
                        </div>

                        {isCurrent ? (
                          <span className="text-[10px] font-bold text-brand-700 dark:text-brand-300 bg-brand-100 dark:bg-brand-950/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Active
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-slate-400 group-hover:text-brand-600 dark:group-hover:text-brand-400 flex items-center gap-1">
                            {isLoading ? 'Switching...' : 'Switch'}
                            <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">{p.deptCode}</div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">{p.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {tab === 'credentials' && (
            <form onSubmit={handleCredentialsLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. tanishka@example.com, officer.edu@gov.in, or admin@sevasetu.gov.in"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#162033] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter demo password"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#162033] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="p-3 bg-slate-50 dark:bg-[#162033]/60 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  <KeyRound className="w-3 h-3 text-brand-600 dark:text-brand-400" />
                  <span>Seeded Demo Passwords:</span>
                </div>
                <div className="grid grid-cols-2 gap-1 font-mono text-[10px] text-slate-600 dark:text-slate-400">
                  <span>Citizen: Citizen@123</span>
                  <span>Edu Officer: Officer@Edu123</span>
                  <span>Rev Officer: Officer@Rev123</span>
                  <span>Transport: Officer@Trans123</span>
                  <span>Admin: Admin@SevaSetu123</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-navy-900 hover:bg-navy-800 dark:bg-brand-600 dark:hover:bg-brand-500 text-white text-xs font-bold rounded-xl shadow transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Authenticating...' : 'Sign In with Credentials'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
