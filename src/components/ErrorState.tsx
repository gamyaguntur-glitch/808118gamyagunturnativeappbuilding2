import React from 'react';
import { AlertCircle, RefreshCw, Compass, MapPin } from 'lucide-react';
import { GeoCity } from '../types/weather';
import { DEFAULT_CITIES } from '../services/openMeteo';

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
  onSelectCity: (city: GeoCity) => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry, onSelectCity }) => {
  return (
    <div className="p-8 sm:p-10 rounded-[32px] bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 shadow-2xl max-w-xl mx-auto text-center space-y-6 my-12">
      
      <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/20 shadow-inner">
        <AlertCircle className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-bold text-white">
          Weather Data Unavailable
        </h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
          {message}
        </p>
      </div>

      {/* Action Retry */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={onRetry}
          className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-sm transition-colors flex items-center gap-2 shadow-lg shadow-sky-500/25"
        >
          <RefreshCw className="w-4 h-4" />
          Retry Connection
        </button>
      </div>

      {/* Suggested Popular Cities */}
      <div className="pt-6 border-t border-slate-800/80 space-y-3">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1">
          <Compass className="w-3.5 h-3.5 text-sky-400" />
          Or try selecting a major city:
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {DEFAULT_CITIES.slice(0, 5).map((city) => (
            <button
              key={city.id}
              onClick={() => onSelectCity(city)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-sky-500 hover:text-white text-slate-300 font-medium text-xs transition-colors flex items-center gap-1 border border-slate-700/60"
            >
              <MapPin className="w-3 h-3" />
              {city.name}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};
