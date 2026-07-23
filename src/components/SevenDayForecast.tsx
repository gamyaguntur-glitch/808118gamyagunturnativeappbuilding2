import React, { useState } from 'react';
import { DailyForecastItem, WeatherUnits } from '../types/weather';
import { formatTemp, convertTemp, formatSpeed } from '../utils/intelligenceEngine';
import { getWmoInfo } from '../utils/wmoCodes';
import { WeatherIcon } from './WeatherIcon';
import { Calendar, CloudRain, Sun, Wind, Sunrise, Sunset, ChevronDown, ChevronUp } from 'lucide-react';

interface SevenDayForecastProps {
  daily: DailyForecastItem[];
  units: WeatherUnits;
}

export const SevenDayForecast: React.FC<SevenDayForecastProps> = ({ daily, units }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (!daily || daily.length === 0) return null;

  // Calculate week min and max to draw relative temperature bars
  const allMinC = Math.min(...daily.map((d) => d.temperature_2m_min));
  const allMaxC = Math.max(...daily.map((d) => d.temperature_2m_max));
  const tempRange = Math.max(1, allMaxC - allMinC);

  const toggleExpand = (idx: number) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  return (
    <div className="p-6 sm:p-8 rounded-[32px] bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 shadow-2xl space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-sky-400" />
          7-Day Weather Forecast
        </h3>
        <span className="text-xs text-slate-400">
          Click any day for detailed metrics
        </span>
      </div>

      <div className="space-y-2.5">
        {daily.map((item, idx) => {
          const wmo = getWmoInfo(item.weather_code);
          const isExpanded = expandedIndex === idx;

          // Bar math (%)
          const minPercent = ((item.temperature_2m_min - allMinC) / tempRange) * 100;
          const maxPercent = ((item.temperature_2m_max - allMinC) / tempRange) * 100;
          const barWidth = Math.max(8, maxPercent - minPercent);

          return (
            <div
              key={item.date}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isExpanded
                  ? 'bg-slate-800/80 border-sky-500/50'
                  : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/60'
              }`}
            >
              {/* Primary Row */}
              <button
                onClick={() => toggleExpand(idx)}
                className="w-full p-3.5 flex items-center justify-between gap-3 text-left transition-colors"
              >
                {/* Day & Icon */}
                <div className="flex items-center gap-3 w-36 sm:w-44 shrink-0">
                  <div className="p-2 rounded-xl bg-slate-900 text-sky-400 shadow-inner border border-slate-700/60 shrink-0">
                    <WeatherIcon name={wmo.iconName} className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white">
                      {item.dayName}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {wmo.label}
                    </div>
                  </div>
                </div>

                {/* Rain Probability Pill */}
                <div className="w-16 hidden sm:flex items-center justify-center">
                  {item.precipitation_probability_max > 15 ? (
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[11px] font-bold flex items-center gap-1">
                      <CloudRain className="w-3 h-3" />
                      {item.precipitation_probability_max}%
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-500">0%</span>
                  )}
                </div>

                {/* Relative Temperature Bar */}
                <div className="flex-1 max-w-xs flex items-center gap-2 px-2">
                  <span className="text-xs font-semibold text-slate-400 w-9 text-right font-mono">
                    {formatTemp(item.temperature_2m_min, units.temperature)}
                  </span>
                  
                  <div className="flex-1 h-2 bg-slate-800 rounded-full relative overflow-hidden">
                    <div
                      className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-sky-400 via-amber-400 to-rose-400"
                      style={{
                        left: `${minPercent}%`,
                        width: `${barWidth}%`,
                      }}
                    />
                  </div>

                  <span className="text-xs font-bold text-white w-9 font-mono">
                    {formatTemp(item.temperature_2m_max, units.temperature)}
                  </span>
                </div>

                {/* Expand Toggle */}
                <div className="p-1 text-slate-400">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {/* Expanded Details Panel */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-950/60">
                  
                  <div className="p-2.5 rounded-xl bg-slate-900/80 flex items-center gap-2 border border-slate-800">
                    <Sunrise className="w-4 h-4 text-amber-400" />
                    <div>
                      <div className="text-[10px] text-slate-400">Sunrise</div>
                      <div className="font-semibold text-slate-200">{item.sunrise}</div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/80 flex items-center gap-2 border border-slate-800">
                    <Sunset className="w-4 h-4 text-orange-400" />
                    <div>
                      <div className="text-[10px] text-slate-400">Sunset</div>
                      <div className="font-semibold text-slate-200">{item.sunset}</div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/80 flex items-center gap-2 border border-slate-800">
                    <Sun className="w-4 h-4 text-amber-400" />
                    <div>
                      <div className="text-[10px] text-slate-400">Max UV Index</div>
                      <div className="font-semibold text-slate-200">{item.uv_index_max.toFixed(1)}</div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/80 flex items-center gap-2 border border-slate-800">
                    <Wind className="w-4 h-4 text-teal-400" />
                    <div>
                      <div className="text-[10px] text-slate-400">Max Wind</div>
                      <div className="font-semibold text-slate-200">
                        {formatSpeed(item.wind_speed_10m_max, units.speed)}
                      </div>
                    </div>
                  </div>

                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
