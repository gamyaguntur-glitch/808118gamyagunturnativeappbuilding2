import React from 'react';
import {
  MapPin,
  Clock,
  Wind,
  Droplets,
  Sun,
  Gauge,
  Sunrise,
  Sunset,
  Cloud,
  Compass,
  Sparkles,
  Info,
} from 'lucide-react';
import { WeatherData, WeatherUnits } from '../types/weather';
import { getWmoInfo } from '../utils/wmoCodes';
import { formatTemp, formatSpeed } from '../utils/intelligenceEngine';
import { WeatherIcon } from './WeatherIcon';

interface CurrentWeatherCardProps {
  data: WeatherData;
  units: WeatherUnits;
  comfortScore: number;
  comfortLabel: string;
}

export const CurrentWeatherCard: React.FC<CurrentWeatherCardProps> = ({
  data,
  units,
  comfortScore,
  comfortLabel,
}) => {
  const { city, current, daily, timezone } = data;
  const wmo = getWmoInfo(current.weather_code);
  const isDay = current.is_day === 1;

  const bgGradient = isDay ? wmo.bgGradientDay : wmo.bgGradientNight;

  const todayDaily = daily.length > 0 ? daily[0] : null;

  // Local time formatting using city timezone
  let localTimeString = '';
  try {
    localTimeString = new Date().toLocaleTimeString('en-US', {
      timeZone: timezone !== 'auto' ? timezone : undefined,
      hour: '2-digit',
      minute: '2-digit',
      weekday: 'short',
    });
  } catch {
    localTimeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', weekday: 'short' });
  }

  // UV risk level helper
  const getUvBadge = (uv: number) => {
    if (uv <= 2) return { text: 'Low', class: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30' };
    if (uv <= 5) return { text: 'Moderate', class: 'bg-amber-500/20 text-amber-200 border-amber-500/30' };
    if (uv <= 7) return { text: 'High', class: 'bg-orange-500/20 text-orange-200 border-orange-500/30' };
    if (uv <= 10) return { text: 'Very High', class: 'bg-rose-500/20 text-rose-200 border-rose-500/30' };
    return { text: 'Extreme', class: 'bg-purple-500/20 text-purple-200 border-purple-500/30' };
  };

  const uvBadge = getUvBadge(current.uv_index);

  return (
    <div className="space-y-6">
      {/* Hero Weather Display Card */}
      <div
        className={`relative overflow-hidden rounded-[32px] bg-gradient-to-br ${bgGradient} p-6 sm:p-8 text-white shadow-2xl transition-all duration-500 border border-white/10`}
      >
        {/* Subtle Decorative Light Orbs */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-black/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          {/* Main Info */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-medium border border-white/20 shadow-sm">
                <MapPin className="w-3.5 h-3.5" />
                {city.name}
                {city.country && `, ${city.country}`}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/20 backdrop-blur-md text-xs font-mono border border-white/10">
                <Clock className="w-3.5 h-3.5 text-sky-200" />
                {localTimeString}
              </span>
            </div>

            <div className="flex items-baseline gap-4 pt-1">
              <span className="text-6xl sm:text-7xl font-extrabold tracking-tight drop-shadow-sm font-sans">
                {formatTemp(current.temperature, units.temperature)}
              </span>
              <div className="flex flex-col">
                <span className="text-lg sm:text-xl font-medium text-white/90">
                  Feels like {formatTemp(current.apparent_temperature, units.temperature)}
                </span>
                <span className="text-sm text-white/75 font-light">
                  {wmo.label}
                </span>
              </div>
            </div>

            <p className="text-sm text-white/80 max-w-md leading-relaxed">
              {wmo.description}
            </p>
          </div>

          {/* Condition Icon & Comfort Gauge */}
          <div className="flex flex-col items-start md:items-end justify-between gap-4">
            <div className="p-4 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-inner flex items-center justify-center">
              <WeatherIcon name={wmo.iconName} className="w-16 h-16 sm:w-20 sm:h-20 text-white drop-shadow-md" />
            </div>

            {/* Comfort Badge */}
            <div className="px-4 py-2 rounded-2xl bg-black/25 backdrop-blur-md border border-white/15 flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: '4s' }} />
              <div>
                <div className="text-[11px] font-semibold text-white/70 uppercase tracking-wider">
                  Comfort Index
                </div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>{comfortScore}%</span>
                  <span className="text-white/60 font-normal">({comfortLabel})</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Sub-strip with High/Low & Sun Times */}
        {todayDaily && (
          <div className="mt-8 pt-6 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-medium">
            <div className="flex items-center gap-2 bg-black/15 backdrop-blur-sm p-2.5 rounded-2xl border border-white/10">
              <span className="text-amber-300 font-bold text-base">H:</span>
              <div>
                <div className="text-white/70 text-[10px]">Max Temp</div>
                <div className="font-semibold text-sm">{formatTemp(todayDaily.temperature_2m_max, units.temperature)}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-black/15 backdrop-blur-sm p-2.5 rounded-2xl border border-white/10">
              <span className="text-sky-300 font-bold text-base">L:</span>
              <div>
                <div className="text-white/70 text-[10px]">Min Temp</div>
                <div className="font-semibold text-sm">{formatTemp(todayDaily.temperature_2m_min, units.temperature)}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-black/15 backdrop-blur-sm p-2.5 rounded-2xl border border-white/10">
              <Sunrise className="w-4 h-4 text-amber-300 shrink-0" />
              <div>
                <div className="text-white/70 text-[10px]">Sunrise</div>
                <div className="font-semibold text-sm">{todayDaily.sunrise}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-black/15 backdrop-blur-sm p-2.5 rounded-2xl border border-white/10">
              <Sunset className="w-4 h-4 text-orange-300 shrink-0" />
              <div>
                <div className="text-white/70 text-[10px]">Sunset</div>
                <div className="font-semibold text-sm">{todayDaily.sunset}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        
        {/* Humidity */}
        <div className="p-4 rounded-2xl bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 hover:border-slate-700/80 transition-all shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Humidity</span>
            <Droplets className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-xl font-bold text-white">
            {current.relative_humidity}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {current.relative_humidity > 65 ? 'High humidity' : current.relative_humidity < 30 ? 'Dry air' : 'Optimal moisture'}
          </div>
        </div>

        {/* Wind Speed */}
        <div className="p-4 rounded-2xl bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 hover:border-slate-700/80 transition-all shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Wind</span>
            <Wind className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-xl font-bold text-white">
            {formatSpeed(current.wind_speed_10m, units.speed)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <Compass className="w-3 h-3 text-slate-400" />
            <span>Direction: {current.wind_direction_10m}°</span>
          </div>
        </div>

        {/* UV Index */}
        <div className="p-4 rounded-2xl bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 hover:border-slate-700/80 transition-all shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">UV Index</span>
            <Sun className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-white flex items-center gap-2">
            {current.uv_index.toFixed(1)}
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${uvBadge.class}`}>
              {uvBadge.text}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {current.uv_index >= 6 ? 'Sun protection required' : 'Low radiation'}
          </div>
        </div>

        {/* Pressure */}
        <div className="p-4 rounded-2xl bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 hover:border-slate-700/80 transition-all shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Pressure</span>
            <Gauge className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-xl font-bold text-white">
            {Math.round(current.pressure_msl)} <span className="text-xs font-normal text-slate-400">hPa</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {current.pressure_msl > 1015 ? 'High pressure system' : 'Low pressure system'}
          </div>
        </div>

        {/* Cloud Cover */}
        <div className="p-4 rounded-2xl bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 hover:border-slate-700/80 transition-all shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Cloud Cover</span>
            <Cloud className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-bold text-white">
            {current.cloud_cover}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {current.cloud_cover > 75 ? 'Overcast skies' : current.cloud_cover < 25 ? 'Mostly clear' : 'Scattered clouds'}
          </div>
        </div>

        {/* Precipitation */}
        <div className="p-4 rounded-2xl bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 hover:border-slate-700/80 transition-all shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Precipitation</span>
            <Droplets className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl font-bold text-white">
            {current.precipitation} <span className="text-xs font-normal text-slate-400">mm</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {current.precipitation > 0 ? 'Active rainfall' : 'No rain reported'}
          </div>
        </div>

      </div>
    </div>
  );
};
