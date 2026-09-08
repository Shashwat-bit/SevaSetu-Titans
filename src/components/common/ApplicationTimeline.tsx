import React from 'react';
import { TimelineEvent } from '../../types';
import { CheckCircle2, Clock, Circle, Play, Shield, Building2, AlertCircle } from 'lucide-react';

interface ApplicationTimelineProps {
  timeline: TimelineEvent[];
  onAdvanceStatus?: () => void;
  canAdvance?: boolean;
  userRole?: string;
  userDeptName?: string;
  appDeptName?: string;
}

export const ApplicationTimeline: React.FC<ApplicationTimelineProps> = ({
  timeline,
  onAdvanceStatus,
  canAdvance = false,
  userRole = 'citizen',
  userDeptName,
  appDeptName,
}) => {
  return (
    <div className="space-y-4">
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {timeline.map((event, index) => {
          const isCompleted = event.status === 'completed';
          const isCurrent = event.status === 'current';
          const isPending = event.status === 'pending';

          return (
            <div key={event.id || index} className="relative group">
              {/* Marker Icon */}
              <div
                className={`absolute -left-[1.65rem] top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all ${
                  isCompleted
                    ? 'bg-emerald-500 text-white shadow-sm ring-4 ring-emerald-50'
                    : isCurrent
                    ? 'bg-brand-600 text-white ring-4 ring-brand-100 animate-pulse-subtle'
                    : 'bg-white border-2 border-slate-300 text-slate-300'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : isCurrent ? (
                  <Clock className="w-3.5 h-3.5" />
                ) : (
                  <Circle className="w-3 h-3" />
                )}
              </div>

              {/* Event Body */}
              <div
                className={`p-3.5 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-brand-50/50 border-brand-200 shadow-sm'
                    : isCompleted
                    ? 'bg-white border-slate-200'
                    : 'bg-slate-50/70 border-slate-200/60 opacity-70'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                  <span
                    className={`font-semibold text-xs ${
                      isCurrent
                        ? 'text-brand-900'
                        : isCompleted
                        ? 'text-slate-900'
                        : 'text-slate-500'
                    }`}
                  >
                    {event.title}
                  </span>
                  <span
                    className={`text-[11px] font-medium ${
                      isCurrent
                        ? 'text-brand-700 bg-brand-100/80 px-2 py-0.5 rounded-full font-semibold'
                        : 'text-slate-500'
                    }`}
                  >
                    {event.timestamp}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{event.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Officer action or security scope guard notice */}
      {canAdvance && onAdvanceStatus ? (
        <div className="pt-2 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
            <span className="font-semibold flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
              Verified Department Scope: {userDeptName || 'Authorized Officer'}
            </span>
            <span className="text-[10px] uppercase font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-300">
              Role: Officer
            </span>
          </div>
          <button
            onClick={onAdvanceStatus}
            className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-navy-900 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Play className="w-3.5 h-3.5 text-amber-400" />
            <span>Advance Simulated Application Status (Officer Action)</span>
          </button>
          <p className="text-[10px] text-slate-400 text-center">
            Simulates department officer advancing review stages in backend system
          </p>
        </div>
      ) : userRole === 'officer' && appDeptName && userDeptName && userDeptName !== appDeptName ? (
        <div className="pt-2">
          <div className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Department Scope Guard Active</p>
              <p className="text-[10px] text-amber-700 mt-0.5">
                You are logged in as a <strong>{userDeptName}</strong> Officer. Only assigned officers can advance applications for <strong>{appDeptName}</strong>.
              </p>
            </div>
          </div>
        </div>
      ) : userRole === 'citizen' ? (
        <div className="pt-2">
          <div className="text-[11px] text-slate-600 bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-center justify-center gap-2 text-center">
            <Shield className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Citizen view only. Status advancement is restricted to Department Officers.</span>
          </div>
        </div>
      ) : null}
    </div>
  );
};
