import React from 'react';
import { ApplicationStatus } from '../../types';
import { CheckCircle2, Clock, AlertCircle, RefreshCw, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: ApplicationStatus | 'Active' | 'Access Revoked' | 'Connected' | 'Disconnected' | string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  }[size];

  switch (status) {
    case 'Submitted':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200 ${sizeClasses}`}>
          <Clock className="w-3.5 h-3.5 text-blue-500" />
          Submitted
        </span>
      );

    case 'Under Verification':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-amber-50 text-amber-800 border border-amber-200 ${sizeClasses}`}>
          <RefreshCw className="w-3.5 h-3.5 text-amber-600 animate-spin" style={{ animationDuration: '3s' }} />
          Under Verification
        </span>
      );

    case 'Under Review':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 ${sizeClasses}`}>
          <Clock className="w-3.5 h-3.5 text-indigo-500" />
          Under Review
        </span>
      );

    case 'Approved':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 ${sizeClasses}`}>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Approved
        </span>
      );

    case 'Rejected':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-rose-50 text-rose-700 border border-rose-200 ${sizeClasses}`}>
          <XCircle className="w-3.5 h-3.5 text-rose-500" />
          Rejected
        </span>
      );

    case 'Active':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300 ${sizeClasses}`}>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Active
        </span>
      );

    case 'Access Revoked':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-slate-100 text-slate-600 border border-slate-300 ${sizeClasses}`}>
          <XCircle className="w-3.5 h-3.5 text-slate-400" />
          Access Revoked
        </span>
      );

    case 'Connected':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses}`}>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Connected (Mock)
        </span>
      );

    case 'Disconnected':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-slate-100 text-slate-600 border border-slate-200 ${sizeClasses}`}>
          <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
          Disconnected
        </span>
      );

    default:
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses}`}>
          {status}
        </span>
      );
  }
};
