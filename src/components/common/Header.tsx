import React, { useState } from 'react';
import { Citizen } from '../../types';
import { Shield, Layers, Globe, User, CheckCircle2, AlertCircle, RefreshCw, KeyRound, Building2, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface HeaderProps {
  citizen: Citizen;
  onOpenHowItWorks: () => void;
  onOpenOnboarding: () => void;
  onOpenAuthModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  citizen,
  onOpenHowItWorks,
  onOpenOnboarding,
  onOpenAuthModal,
}) => {
  const { toggleTheme, isDark } = useTheme();
  const [currentLang, setCurrentLang] = useState<'EN' | 'HI' | 'GU'>('EN');

  const getRoleBadge = () => {
    if (citizen.role === 'officer') {
      const deptName =
        citizen.departmentId === 'dept-edu'
          ? 'Education'
          : citizen.departmentId === 'dept-rev'
          ? 'Revenue'
          : citizen.departmentId === 'dept-trans'
          ? 'Transport'
          : 'Officer';
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
          <Building2 className="w-3 h-3" />
          Officer ({deptName})
        </span>
      );
    }
    if (citizen.role === 'admin') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-300">
          Admin
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
        Citizen
      </span>
    );
  };

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-[#111827] border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
      {/* Interoperability Architecture Notice Bar */}
      <div className="bg-slate-900 text-slate-200 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-slate-300 font-medium">
            Citizen Interoperability &amp; Consent Middleware
          </span>
          <span className="text-slate-500">&bull;</span>
          <span className="text-[11px] text-amber-300 font-semibold flex items-center gap-1">
            <KeyRound className="w-3 h-3" />
            JWT Role-Based Access Control Active
          </span>
        </div>
        <div className="flex items-center gap-3 text-slate-400 text-[11px]">
          <span className="hidden sm:inline bg-slate-800 px-2 py-0.5 rounded text-slate-300">
            Mock Adapters Active
          </span>
          <span>Not an official government portal</span>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-navy-800 to-navy-950 flex items-center justify-center text-white shadow-md border border-navy-700">
              <Shield className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-navy-900 dark:text-white">
                  Seva<span className="text-brand-600">Setu</span>
                </span>
                <span className="hidden md:inline-block px-2 py-0.5 text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 rounded-full border border-blue-200 dark:border-blue-800/50">
                  Interoperability Hub
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
                Unified Citizen Services &bull; Privacy-First Consent
              </p>
            </div>
          </div>

          {/* Center Actions: How It Works & Architecture button */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onOpenHowItWorks}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-navy-50 dark:bg-slate-800 text-navy-800 dark:text-slate-200 hover:bg-navy-100 dark:hover:bg-slate-700 border border-navy-200 dark:border-slate-700 transition-colors shadow-sm"
              title="View Interoperability Architecture"
            >
              <Layers className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
              <span>How SevaSetu Works</span>
            </button>

            {/* Persona Switcher Quick Button */}
            {onOpenAuthModal && (
              <button
                onClick={onOpenAuthModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 border border-amber-300 dark:border-amber-700/60 transition-all shadow-sm"
                title="Switch between Citizen and Department Officer personas"
              >
                <RefreshCw className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span className="hidden sm:inline">Switch Persona</span>
                <span className="sm:hidden">Persona</span>
              </button>
            )}

            {/* Dark Mode Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="inline-flex items-center justify-center p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors shadow-sm"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400 transition-transform" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600 transition-transform" />
              )}
            </button>

            {/* DigiLocker Mock Adapter Status (Citizen only) */}
            {citizen.role !== 'officer' && (
              citizen.isDigiLockerConnected ? (
                <div
                  onClick={onOpenOnboarding}
                  className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 text-xs font-medium cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
                  title="DigiLocker Mock Adapter is connected with verified credentials"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>DigiLocker Linked</span>
                </div>
              ) : (
                <button
                  onClick={onOpenOnboarding}
                  className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 text-xs font-medium hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
                >
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Connect DigiLocker</span>
                </button>
              )
            )}

            {/* User Profile Pill & Role Indicator */}
            <div
              onClick={onOpenAuthModal}
              className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700 cursor-pointer hover:opacity-90 transition-opacity"
              title="Click to switch persona or view auth details"
            >
              <div className="w-8 h-8 rounded-full bg-navy-100 dark:bg-slate-800 border border-navy-200 dark:border-slate-700 flex items-center justify-center text-navy-800 dark:text-slate-200 font-semibold text-xs">
                {citizen.name.charAt(0)}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight flex items-center gap-1.5">
                  <span className="truncate max-w-[120px]">{citizen.name}</span>
                  {getRoleBadge()}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                  {citizen.role === 'officer' ? citizen.email : citizen.maskedAadhaar || citizen.email}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
