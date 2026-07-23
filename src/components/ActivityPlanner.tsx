import React from 'react';
import { ActivityRecommendation } from '../types/weather';
import { WeatherIcon } from './WeatherIcon';
import { Activity, CheckCircle2, AlertCircle, XCircle, Compass } from 'lucide-react';

interface ActivityPlannerProps {
  activities: ActivityRecommendation[];
}

export const ActivityPlanner: React.FC<ActivityPlannerProps> = ({ activities }) => {
  if (!activities || activities.length === 0) return null;

  const getStatusBadge = (status: 'ideal' | 'caution' | 'avoid') => {
    switch (status) {
      case 'ideal':
        return {
          label: 'Ideal',
          bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
        };
      case 'caution':
        return {
          label: 'Caution',
          bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
          icon: <AlertCircle className="w-4 h-4 text-amber-500" />,
        };
      case 'avoid':
        return {
          label: 'Not Recommended',
          bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
          icon: <XCircle className="w-4 h-4 text-rose-500" />,
        };
    }
  };

  return (
    <div className="p-6 sm:p-8 rounded-[32px] bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 shadow-2xl space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-sky-400" />
            Activity & Outdoor Feasibility
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time weather suitability ratings for leisure & athletics
          </p>
        </div>
      </div>

      {/* Activity Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activities.map((act) => {
          const badge = getStatusBadge(act.status);

          return (
            <div
              key={act.id}
              className="p-4 rounded-2xl border border-slate-800/80 bg-slate-950/50 hover:bg-slate-800/60 transition-all flex flex-col justify-between space-y-3"
            >
              {/* Top Row */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-slate-900 text-sky-400 shadow-inner border border-slate-700/60">
                    <WeatherIcon name={act.icon} className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">
                      {act.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 capitalize">
                      {act.category} Activity
                    </span>
                  </div>
                </div>

                {/* Status Pill */}
                <span className={`px-2.5 py-1 rounded-full border text-xs font-semibold flex items-center gap-1 shrink-0 ${badge.bg}`}>
                  {badge.icon}
                  {badge.label}
                </span>
              </div>

              {/* Score Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-semibold text-slate-400">
                  <span>Suitability Score</span>
                  <span>{act.score}/100</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      act.score >= 75
                        ? 'bg-emerald-500'
                        : act.score >= 45
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${act.score}%` }}
                  />
                </div>
              </div>

              {/* Reason & Actionable Tip */}
              <div className="space-y-1.5 text-xs text-slate-300 pt-1 border-t border-slate-800/80">
                <p className="leading-relaxed font-medium">{act.reason}</p>
                {act.tip && (
                  <p className="text-[11px] text-sky-300 bg-sky-950/40 p-2 rounded-xl border border-sky-900/50">
                    💡 <strong>Tip:</strong> {act.tip}
                  </p>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
