import React, { useState } from 'react';
import {
  Citizen,
  Application,
  ConsentPermission,
  AuditActivity,
  ServiceItem,
} from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  Search,
  GraduationCap,
  FileCheck,
  Home,
  Coins,
  Car,
  Users,
  ArrowRight,
  Shield,
  Layers,
  ChevronRight,
  Sparkles,
  Lock,
  Building2,
} from 'lucide-react';

interface DashboardPageProps {
  citizen: Citizen;
  applications: Application[];
  permissions: ConsentPermission[];
  activities: AuditActivity[];
  services: ServiceItem[];
  onSelectService: (service: ServiceItem) => void;
  onNavigateTab: (tab: 'services' | 'applications' | 'activity' | 'consent') => void;
  onSelectApplication: (app: Application) => void;
  onOpenHowItWorks: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  citizen,
  applications,
  permissions,
  activities,
  services,
  onSelectService,
  onNavigateTab,
  onSelectApplication,
  onOpenHowItWorks,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Category navigation icons
  const categories = [
    { id: 'scholarships', label: 'Scholarships', icon: GraduationCap, color: 'text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/60' },
    { id: 'certificates', label: 'Certificates', icon: FileCheck, color: 'text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/60' },
    { id: 'residence', label: 'Residence Services', icon: Home, color: 'text-emerald-600 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60' },
    { id: 'schemes', label: 'Govt. Schemes', icon: Coins, color: 'text-amber-600 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60' },
    { id: 'transport', label: 'Transport Services', icon: Car, color: 'text-purple-600 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800/60' },
    { id: 'welfare', label: 'Social Welfare', icon: Users, color: 'text-rose-600 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60' },
  ];

  // Filter services for quick search match
  const filteredServices = searchQuery.trim()
    ? services.filter(
        (s) =>
          s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.departmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const activePermissionsCount = permissions.filter((p) => p.status === 'Active').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Greeting & Welcome Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-navy-900 via-navy-800 to-navy-950 text-white p-6 sm:p-8 shadow-xl border border-navy-700">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold mb-3 border border-brand-400/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Unified Citizen Gateway &bull; Interoperability Platform</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Good morning, {citizen.name}
          </h1>
          <p className="text-sm text-slate-300 mt-1.5 leading-relaxed">
            Access government services from one place. Seamlessly discover schemes, pre-fill verified documents
            with explicit consent, and track all applications across departments.
          </p>

          {/* Large Search Bar */}
          <div className="mt-6 relative">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search government services (e.g., Scholarship, Income Certificate, Driving License)..."
                className="w-full text-xs sm:text-sm pl-11 pr-4 py-3.5 rounded-xl bg-white dark:bg-[#162033] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 border border-transparent dark:border-slate-700 focus:outline-none focus:ring-4 focus:ring-brand-500/30 shadow-lg"
              />
            </div>

            {/* Instant Search Suggestions dropdown */}
            {searchQuery.trim() && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#111827] text-slate-900 dark:text-slate-100 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-20 max-h-72 overflow-y-auto">
                <div className="p-2 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-[#162033] border-b border-slate-100 dark:border-slate-800">
                  Matching Services ({filteredServices.length})
                </div>
                {filteredServices.length > 0 ? (
                  filteredServices.map((service) => (
                    <button
                      key={service.id}
                      onClick={() => {
                        setSearchQuery('');
                        onSelectService(service);
                      }}
                      className="w-full text-left p-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0 flex items-center justify-between"
                    >
                      <div>
                        <span className="text-xs font-bold text-navy-900 dark:text-white block">{service.title}</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">{service.departmentName}</span>
                      </div>
                      <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 px-2 py-1 rounded-lg">
                        Apply Now &rarr;
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400">
                    No matching services found for &quot;{searchQuery}&quot;. Try &quot;Scholarship&quot; or browse categories.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* Popular / Recommended Service Category Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
            Explore Government Service Categories
          </h2>
          <button
            onClick={() => onNavigateTab('services')}
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-300 flex items-center gap-1"
          >
            <span>View All Services</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => onNavigateTab('services')}
                className="group p-4 bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-brand-300 dark:hover:border-brand-500/60 transition-all text-center flex flex-col items-center"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-2.5 transition-transform group-hover:scale-105 border ${cat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-brand-700 dark:group-hover:text-brand-400 leading-snug">
                  {cat.label}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Explore &rarr;</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Visible Interoperability Architecture Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-navy-900 to-slate-900 text-white rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 border border-navy-700 shadow-md">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-brand-500/20 text-brand-300 rounded-xl border border-brand-400/20 shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">How SevaSetu Interoperability Works</span>
              <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-300/30 uppercase">
                Architecture
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
              Citizen &rarr; Consent &rarr; SevaSetu Interoperability Layer &rarr; Department Adapter &rarr; Existing Department System.
              <span className="font-semibold text-amber-300"> SevaSetu does NOT replace legacy department backends.</span>
            </p>
          </div>
        </div>
        <button
          onClick={onOpenHowItWorks}
          className="shrink-0 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
        >
          <span>View Interactive Diagram</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Grid: My Applications & Side Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: MY APPLICATIONS (Only applied services) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>MY APPLICATIONS</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {applications.length}
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Services you have actually applied for across connected departments.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('applications')}
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-300 flex items-center gap-1"
            >
              <span>View all applications</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {applications.length > 0 ? (
            <div className="space-y-3">
              {applications.slice(0, 3).map((app) => (
                <div
                  key={app.id}
                  onClick={() => onSelectApplication(app)}
                  className="p-4 bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-brand-200 dark:hover:border-slate-700 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-950/60 px-2 py-0.5 rounded border border-brand-100 dark:border-brand-800/60">
                        {app.id}
                      </span>
                      <StatusBadge status={app.status} size="sm" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand-700 dark:group-hover:text-brand-300 transition-colors">
                      {app.serviceName}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        {app.departmentName}
                      </span>
                      <span>&bull;</span>
                      <span>Submitted: {app.submittedAt}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <button className="px-3 py-1.5 text-xs font-semibold text-navy-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 group-hover:bg-brand-50 dark:group-hover:bg-slate-700 group-hover:text-brand-700 dark:group-hover:text-brand-300 rounded-lg transition-colors flex items-center gap-1">
                      <span>Track Status</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400">You have not applied for any services yet.</p>
              <button
                onClick={() => onNavigateTab('services')}
                className="mt-3 px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-semibold hover:bg-brand-700"
              >
                Browse &amp; Apply Services
              </button>
            </div>
          )}
        </div>

        {/* Right 1 Col: RECENT ACTIVITY & PRIVACY WIDGET */}
        <div className="space-y-6">
          {/* YOUR DATA & CONSENT Privacy Widget */}
          <div className="bg-gradient-to-br from-emerald-900 via-navy-900 to-navy-950 text-white rounded-xl p-5 shadow-md border border-emerald-800/40 relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                <span>Privacy &amp; Data Control</span>
              </span>
              <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-200 px-2 py-0.5 rounded border border-emerald-400/30">
                Privacy-First Architecture
              </span>
            </div>

            <h3 className="text-base font-bold text-white mb-2">YOUR DATA &amp; CONSENT</h3>
            <div className="space-y-2 text-xs text-slate-200 mb-4">
              <div className="flex items-center justify-between py-1 border-b border-white/10">
                <span>Active Permissions:</span>
                <span className="font-bold text-emerald-300 text-sm">{activePermissionsCount} active</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-white/10">
                <span>Documents Currently Shared:</span>
                <span className="font-bold text-white">4 verified credentials</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span>DigiLocker Mock Link:</span>
                <span className="font-semibold text-emerald-300">Connected</span>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('consent')}
              className="w-full py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg border border-white/20 transition-all flex items-center justify-center gap-1.5"
            >
              <span>Manage permissions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* RECENT ACTIVITY Feed */}
          <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Recent Activity
              </h3>
              <button
                onClick={() => onNavigateTab('activity')}
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-300"
              >
                View All &rarr;
              </button>
            </div>

            <div className="space-y-3">
              {activities.slice(0, 4).map((act) => (
                <div key={act.id} className="text-xs flex items-start gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800/80 last:border-0">
                  <span className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <div className="font-semibold text-slate-800 dark:text-slate-200 leading-snug">{act.action}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center justify-between">
                      <span>{act.departmentName}</span>
                      <span className="font-mono">{act.timestamp}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
