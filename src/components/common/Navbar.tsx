import React from 'react';
import {
  LayoutDashboard,
  Compass,
  FileText,
  Activity,
  ShieldCheck,
  User,
} from 'lucide-react';

export type NavTab = 'dashboard' | 'services' | 'applications' | 'activity' | 'consent' | 'profile';

interface NavbarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  activeAppsCount: number;
  activeConsentCount: number;
  userRole?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  activeAppsCount,
  activeConsentCount,
  userRole = 'citizen',
}) => {
  const isOfficer = userRole === 'officer';

  const navItems = isOfficer
    ? [
        { id: 'dashboard' as NavTab, label: 'Officer Dashboard', icon: LayoutDashboard },
        {
          id: 'applications' as NavTab,
          label: 'Applications Queue',
          icon: FileText,
          badge: activeAppsCount > 0 ? activeAppsCount : undefined,
        },
        { id: 'activity' as NavTab, label: 'Department Audit', icon: Activity },
        { id: 'profile' as NavTab, label: 'Officer Profile', icon: User },
      ]
    : [
        { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
        { id: 'services' as NavTab, label: 'Services', icon: Compass },
        {
          id: 'applications' as NavTab,
          label: 'My Applications',
          icon: FileText,
          badge: activeAppsCount > 0 ? activeAppsCount : undefined,
        },
        { id: 'activity' as NavTab, label: 'Activity', icon: Activity },
        {
          id: 'consent' as NavTab,
          label: 'Data & Consent',
          icon: ShieldCheck,
          badge: activeConsentCount > 0 ? activeConsentCount : undefined,
          badgeColor: 'bg-emerald-500',
        },
        { id: 'profile' as NavTab, label: 'Profile', icon: User },
      ];

  return (
    <>
      {/* Desktop Navigation Subheader */}
      <nav className="hidden md:block bg-navy-900 dark:bg-[#0B1120] text-white shadow-md border-b border-navy-800 dark:border-slate-800 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 py-1.5 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-navy-800/80 dark:hover:bg-slate-800/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span
                      className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold text-white ${
                        item.badgeColor || 'bg-amber-500'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-[#111827] border-t border-slate-200 dark:border-slate-800 shadow-lg px-2 py-1 flex justify-around transition-colors duration-200">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center py-1 px-2 relative transition-colors ${
                isActive ? 'text-brand-600 dark:text-brand-400 font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.badge !== undefined && (
                  <span
                    className={`absolute -top-1 -right-2 px-1 py-0.1 rounded-full text-[9px] font-bold text-white ${
                      item.badgeColor || 'bg-amber-500'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
};
