import React from 'react';
import { TimelineEvent } from '../../types';
import { CheckCircle2, Clock, Circle, Play } from 'lucide-react';

interface ApplicationTimelineProps {
  timeline: TimelineEvent[];
  onAdvanceStatus?: () => void;
  canAdvance?: boolean;
}

export const ApplicationTimeline: React.FC<ApplicationTimelineProps> = ({
  timeline,
  onAdvanceStatus,
  canAdvance = false,
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

      {/* Demo helper action for judges */}
      {canAdvance && onAdvanceStatus && (
        <div className="pt-2">
          <button
            onClick={onAdvanceStatus}
            className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Play className="w-3.5 h-3.5 text-amber-400" />
            <span>Simulate Department Processing Advancement (Demo Helper)</span>
          </button>
          <p className="text-[10px] text-slate-400 text-center mt-1">
            Simulates department officer acting on this application in their backend system
          </p>
        </div>
      )}
    </div>
  );
};
