import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';
import { HourlyForecastItem, WeatherUnits } from '../types/weather';
import { formatTemp, convertTemp, convertSpeed } from '../utils/intelligenceEngine';
import { getWmoInfo } from '../utils/wmoCodes';
import { WeatherIcon } from './WeatherIcon';
import { Thermometer, CloudRain, Wind, Sun, Clock } from 'lucide-react';

interface HourlyChartsProps {
  hourly: HourlyForecastItem[];
  units: WeatherUnits;
}

type ChartMetric = 'temperature' | 'precipitation' | 'wind' | 'uv';

export const HourlyCharts: React.FC<HourlyChartsProps> = ({ hourly, units }) => {
  const [activeMetric, setActiveMetric] = useState<ChartMetric>('temperature');

  if (!hourly || hourly.length === 0) return null;

  // Process data for charts according to units
  const chartData = hourly.map((item) => {
    const tempVal = convertTemp(item.temperature_2m, units.temperature);
    const feelVal = convertTemp(item.apparent_temperature, units.temperature);
    const speedVal = convertSpeed(item.wind_speed_10m, units.speed);
    const wmo = getWmoInfo(item.weather_code);

    return {
      time: item.formattedTime,
      temperature: tempVal,
      feelsLike: feelVal,
      precipitation: item.precipitation_probability,
      windSpeed: speedVal,
      uvIndex: item.uv_index,
      weatherLabel: wmo.label,
      iconName: wmo.iconName,
    };
  });

  const getMetricConfig = () => {
    switch (activeMetric) {
      case 'temperature':
        return {
          title: '24-Hour Temperature Trend',
          unitLabel: `°${units.temperature === 'celsius' ? 'C' : 'F'}`,
          color: '#38bdf8', // sky-400
          gradientId: 'tempGradient',
          dataKey: 'temperature',
          secondaryKey: 'feelsLike',
        };
      case 'precipitation':
        return {
          title: 'Precipitation Probability',
          unitLabel: '%',
          color: '#3b82f6', // blue-500
          gradientId: 'rainGradient',
          dataKey: 'precipitation',
        };
      case 'wind':
        return {
          title: 'Wind Speed Forecast',
          unitLabel: units.speed,
          color: '#14b8a6', // teal-500
          gradientId: 'windGradient',
          dataKey: 'windSpeed',
        };
      case 'uv':
        return {
          title: 'UV Index Curve',
          unitLabel: 'UV',
          color: '#f59e0b', // amber-500
          gradientId: 'uvGradient',
          dataKey: 'uvIndex',
        };
    }
  };

  const config = getMetricConfig();

  return (
    <div className="p-6 sm:p-8 rounded-[32px] bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 shadow-2xl space-y-6">
      
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-sky-400" />
            24-Hour Weather Outlook
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Interactive hourly trends for temperature, rain, wind & UV exposure
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-950/80 border border-slate-800/80 self-start sm:self-auto overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveMetric('temperature')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeMetric === 'temperature'
                ? 'bg-slate-800 text-sky-400 shadow-md border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Thermometer className="w-3.5 h-3.5" />
            <span>Temp</span>
          </button>

          <button
            onClick={() => setActiveMetric('precipitation')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeMetric === 'precipitation'
                ? 'bg-slate-800 text-blue-400 shadow-md border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CloudRain className="w-3.5 h-3.5" />
            <span>Rain %</span>
          </button>

          <button
            onClick={() => setActiveMetric('wind')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeMetric === 'wind'
                ? 'bg-slate-800 text-teal-400 shadow-md border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            <span>Wind</span>
          </button>

          <button
            onClick={() => setActiveMetric('uv')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeMetric === 'uv'
                ? 'bg-slate-800 text-amber-400 shadow-md border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>UV</span>
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {activeMetric === 'precipitation' ? (
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
              <XAxis dataKey="time" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="p-3 rounded-xl bg-slate-900 text-white shadow-xl text-xs space-y-1 border border-slate-800">
                        <div className="font-bold">{data.time}</div>
                        <div className="text-blue-300 font-semibold flex items-center gap-1">
                          <CloudRain className="w-3.5 h-3.5" />
                          Rain Prob: {data.precipitation}%
                        </div>
                        <div className="text-slate-400 text-[11px]">{data.weatherLabel}</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="precipitation" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          ) : (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id={config.gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={config.color} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={config.color} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
              <XAxis dataKey="time" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="p-3 rounded-xl bg-slate-900 text-white shadow-xl text-xs space-y-1.5 border border-slate-800">
                        <div className="font-bold flex items-center justify-between gap-3">
                          <span>{data.time}</span>
                          <span className="text-slate-400 font-normal">{data.weatherLabel}</span>
                        </div>
                        {activeMetric === 'temperature' && (
                          <>
                            <div className="text-sky-300 font-semibold">
                              Temp: {data.temperature}°{units.temperature === 'celsius' ? 'C' : 'F'}
                            </div>
                            <div className="text-slate-300 text-[11px]">
                              Feels Like: {data.feelsLike}°{units.temperature === 'celsius' ? 'C' : 'F'}
                            </div>
                          </>
                        )}
                        {activeMetric === 'wind' && (
                          <div className="text-teal-300 font-semibold">
                            Wind: {data.windSpeed} {units.speed}
                          </div>
                        )}
                        {activeMetric === 'uv' && (
                          <div className="text-amber-300 font-semibold">
                            UV Index: {data.uvIndex}
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey={config.dataKey}
                stroke={config.color}
                strokeWidth={2.5}
                fillOpacity={1}
                fill={`url(#${config.gradientId})`}
              />
              {config.secondaryKey && (
                <Area
                  type="monotone"
                  dataKey={config.secondaryKey}
                  stroke="#94a3b8"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  fill="none"
                />
              )}
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Hourly Card Carousel */}
      <div className="pt-2 border-t border-slate-800/80">
        <div className="flex gap-3 overflow-x-auto pb-2 pt-1 scrollbar-thin scrollbar-thumb-slate-800">
          {hourly.slice(0, 24).map((item, idx) => {
            const wmo = getWmoInfo(item.weather_code);
            return (
              <div
                key={idx}
                className="flex-none w-20 p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-center space-y-2 hover:border-sky-500/50 hover:bg-slate-800/80 transition-all group"
              >
                <div className="text-[11px] font-semibold text-slate-400 group-hover:text-sky-400">
                  {item.formattedTime}
                </div>
                <div className="flex justify-center text-slate-200 group-hover:scale-110 transition-transform">
                  <WeatherIcon name={wmo.iconName} className="w-7 h-7 text-sky-400" />
                </div>
                <div className="font-bold text-sm text-white">
                  {formatTemp(item.temperature_2m, units.temperature)}
                </div>
                {item.precipitation_probability > 10 && (
                  <div className="text-[10px] font-bold text-blue-400 flex items-center justify-center gap-0.5">
                    <CloudRain className="w-2.5 h-2.5" />
                    {item.precipitation_probability}%
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
