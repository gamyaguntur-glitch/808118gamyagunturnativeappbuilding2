import React from 'react';
import { AlertTriangle, Info, ShieldAlert, X } from 'lucide-react';
import { WeatherAlert } from '../types/weather';

interface WeatherAlertsBannerProps {
  alerts: WeatherAlert[];
}

export const WeatherAlertsBanner: React.FC<WeatherAlertsBannerProps> = ({ alerts }) => {
  const [dismissed, setDismissed] = React.useState<Record<string, boolean>>({});

  const activeAlerts = alerts.filter((a) => !dismissed[a.id]);

  if (activeAlerts.length === 0) return null;

  return (
    <div className="space-y-2.5">
      {activeAlerts.map((alert) => {
        let style = 'bg-amber-500/10 text-amber-800 dark:text-amber-200 border-amber-500/30';
        let iconColor = 'text-amber-500';

        if (alert.severity === 'danger') {
          style = 'bg-rose-500/10 text-rose-800 dark:text-rose-200 border-rose-500/30';
          iconColor = 'text-rose-500';
        } else if (alert.severity === 'info') {
          style = 'bg-sky-500/10 text-sky-800 dark:text-sky-200 border-sky-500/30';
          iconColor = 'text-sky-500';
        }

        return (
          <div
            key={alert.id}
            className={`p-4 rounded-2xl border ${style} flex items-start justify-between gap-3 backdrop-blur-sm transition-all`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-1.5 rounded-xl bg-white/60 dark:bg-black/30 ${iconColor} shrink-0 mt-0.5`}>
                {alert.severity === 'danger' ? (
                  <ShieldAlert className="w-5 h-5" />
                ) : (
                  <AlertTriangle className="w-5 h-5" />
                )}
              </div>
              <div>
                <h4 className="font-bold text-sm tracking-tight">{alert.title}</h4>
                <p className="text-xs opacity-90 mt-0.5 leading-relaxed">{alert.description}</p>
              </div>
            </div>
            <button
              onClick={() => setDismissed((prev) => ({ ...prev, [alert.id]: true }))}
              className="p-1 rounded-lg opacity-60 hover:opacity-100 transition-opacity"
              title="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
