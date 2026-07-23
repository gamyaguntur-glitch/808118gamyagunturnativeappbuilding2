import React from 'react';
import { GeoCity } from '../types/weather';
import { MapPin, Star, Trash2 } from 'lucide-react';

interface RecentSearchesProps {
  recentCities: GeoCity[];
  currentCity: GeoCity | null;
  onSelectCity: (city: GeoCity) => void;
  onClearRecent: () => void;
}

export const RecentSearches: React.FC<RecentSearchesProps> = ({
  recentCities,
  currentCity,
  onSelectCity,
  onClearRecent,
}) => {
  if (!recentCities || recentCities.length === 0) return null;

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
      <span className="text-slate-400 font-semibold shrink-0 flex items-center gap-1">
        <Star className="w-3.5 h-3.5 text-amber-400" />
        Saved Cities:
      </span>

      <div className="flex items-center gap-1.5 overflow-x-auto py-1">
        {recentCities.map((city) => {
          const isSelected = currentCity?.name === city.name && currentCity?.country === city.country;

          return (
            <button
              key={`${city.id}-${city.name}`}
              onClick={() => onSelectCity(city)}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 shrink-0 border ${
                isSelected
                  ? 'bg-sky-500 text-white border-sky-400 shadow-lg shadow-sky-500/25'
                  : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-sky-500/50 hover:text-sky-400'
              }`}
            >
              <MapPin className="w-3 h-3 shrink-0" />
              <span>{city.name}</span>
              {city.country_code && (
                <span className={`text-[10px] opacity-75 font-mono ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                  {city.country_code}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <button
        onClick={onClearRecent}
        title="Clear recent searches"
        className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors ml-auto shrink-0"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
