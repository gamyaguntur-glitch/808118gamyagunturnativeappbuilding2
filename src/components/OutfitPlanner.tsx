import React from 'react';
import { OutfitItem } from '../types/weather';
import { WeatherIcon } from './WeatherIcon';
import { Shirt, Sparkles, CheckCircle, Info } from 'lucide-react';

interface OutfitPlannerProps {
  outfits: OutfitItem[];
  outfitSummary: string;
  feelsLikeTemp: string;
}

export const OutfitPlanner: React.FC<OutfitPlannerProps> = ({
  outfits,
  outfitSummary,
  feelsLikeTemp,
}) => {
  if (!outfits || outfits.length === 0) return null;

  return (
    <div className="p-6 sm:p-8 rounded-[32px] bg-slate-900/50 backdrop-blur-xl text-white shadow-2xl space-y-6 border border-indigo-500/30">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-indigo-500/20">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-inner">
            <Shirt className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              Smart Outfit Recommendation
              <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                AI Intelligence
              </span>
            </h3>
            <p className="text-xs text-indigo-200/70">
              Optimal attire tailored for feels-like temperature ({feelsLikeTemp})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium px-3.5 py-1.5 rounded-xl bg-indigo-950/60 border border-indigo-500/30 self-start sm:self-auto">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Real-time Weather Match</span>
        </div>
      </div>

      {/* Summary Highlight Banner */}
      <div className="p-4 rounded-2xl bg-indigo-500/15 border border-indigo-400/20 text-sm text-indigo-100 flex items-start gap-3">
        <CheckCircle className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed font-medium">
          {outfitSummary}
        </div>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {outfits.map((item, idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-400/40 hover:bg-white/10 transition-all flex items-start gap-3 group"
          >
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-300 group-hover:scale-110 transition-transform shrink-0">
              <WeatherIcon name={item.iconName} className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="text-[10px] uppercase font-bold tracking-wider text-indigo-300/80">
                {item.category}
              </div>
              <div className="text-sm font-semibold text-white group-hover:text-indigo-200 transition-colors">
                {item.label}
              </div>
              {item.note && (
                <div className="text-xs text-amber-300 font-medium flex items-center gap-1">
                  <Info className="w-3 h-3 shrink-0" />
                  {item.note}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
