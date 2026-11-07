import React from 'react';
import {
  BarChart3,
  TrendingDown,
  TrendingUp,
  Car,
  Bus,
  Plane,
  Ship,
  Train,
  CheckCircle2,
  Calendar,
  Sparkles,
  Award,
} from 'lucide-react';
import { JourneyRecord, SymptomLog } from '../types';

interface AnalyticsScreenProps {
  journeys: JourneyRecord[];
  symptoms: SymptomLog[];
}

export const AnalyticsScreen: React.FC<AnalyticsScreenProps> = ({ journeys, symptoms }) => {
  // Aggregate stats
  const totalTrips = journeys.length;
  const stabilizedTrips = journeys.filter(j => j.usedTravelMode).length;
  const avgSeverity =
    journeys.length > 0
      ? (journeys.reduce((acc, j) => acc + j.actualSeverity, 0) / journeys.length).toFixed(1)
      : '0.0';

  // Mode breakdown
  const transportStats: Record<string, { count: number; avgSev: number }> = {};
  journeys.forEach(j => {
    if (!transportStats[j.transportType]) {
      transportStats[j.transportType] = { count: 0, avgSev: 0 };
    }
    transportStats[j.transportType].count += 1;
    transportStats[j.transportType].avgSev += j.actualSeverity;
  });

  // Calculate actual averages
  Object.keys(transportStats).forEach(k => {
    transportStats[k].avgSev =
      Math.round((transportStats[k].avgSev / transportStats[k].count) * 10) / 10;
  });

  // Top symptoms count
  const symptomCounts: Record<string, number> = {};
  symptoms.forEach(s => {
    s.symptoms.forEach(name => {
      symptomCounts[name] = (symptomCounts[name] || 0) + 1;
    });
  });

  const sortedSymptoms = Object.entries(symptomCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="flex-1 w-full min-h-full p-4 space-y-4 pb-8 text-slate-800 dark:text-slate-100 bg-[#FBFBF9] dark:bg-slate-950">
      {/* 1. Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
              Travel Analytics
            </h2>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              Symptom Trends & Strategy Efficacy Over Time
            </span>
          </div>
        </div>
      </div>

      {/* 2. Top Summary KPI Row */}
      <section className="grid grid-cols-3 gap-2 text-center">
        <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="block text-2xl font-black text-slate-900 dark:text-white tabular-nums">
            {totalTrips}
          </span>
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Trips</span>
        </div>

        <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="block text-2xl font-black text-emerald-700 dark:text-emerald-400 tabular-nums">
            {avgSeverity}
            <span className="text-xs font-normal text-slate-400">/10</span>
          </span>
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Avg Severity</span>
        </div>

        <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="block text-2xl font-black text-teal-700 dark:text-teal-400 tabular-nums">
            {stabilizedTrips}
          </span>
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Stabilized</span>
        </div>
      </section>

      {/* 3. Severity Trendline Chart (SVG) */}
      <section className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Severity Trend Across Recent Trips
          </h3>
          <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>-38% with Cues</span>
          </span>
        </div>

        {/* SVG Sparkline/Bar Chart */}
        <div className="h-36 w-full flex items-end justify-between gap-2 pt-4 pb-2 border-b border-slate-100 dark:border-slate-800">
          {journeys.slice(0, 7).reverse().map((j, i) => {
            const heightPercent = Math.max(12, j.actualSeverity * 10);
            return (
              <div key={j.id} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 tabular-nums">
                  {j.actualSeverity}
                </span>
                <div
                  className={`w-full max-w-[28px] rounded-t-lg transition-all ${
                    j.usedTravelMode
                      ? 'bg-gradient-to-t from-emerald-700 to-teal-500 shadow-xs'
                      : 'bg-rose-400/80 dark:bg-rose-600/80'
                  }`}
                  style={{ height: `${heightPercent}%` }}
                />
                <span className="text-[9px] text-slate-400 truncate max-w-full">
                  {j.transportType.substring(0, 3).toUpperCase()}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600" />
            <span>With Travel Mode</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-400" />
            <span>Without Cues</span>
          </div>
        </div>
      </section>

      {/* 4. Transport Type Comparisons */}
      <section className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Transport Sensitivity Breakdown
        </h3>

        <div className="space-y-2.5">
          {Object.entries(transportStats).map(([mode, stat]) => (
            <div key={mode} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                  {mode} ({stat.count} {stat.count === 1 ? 'trip' : 'trips'})
                </span>
                <span className="text-slate-500 dark:text-slate-400 font-medium tabular-nums">
                  Avg Severity: {stat.avgSev}/10
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    stat.avgSev >= 6 ? 'bg-rose-500' : stat.avgSev >= 3.5 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, (stat.avgSev / 10) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Most Frequent Symptoms */}
      <section className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Most Common Symptoms
        </h3>

        <div className="flex flex-wrap gap-1.5">
          {sortedSymptoms.map(([sym, count]) => (
            <div
              key={sym}
              className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
            >
              <span>{sym}</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 tabular-nums">
                {count}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Intervention Ranking */}
      <section className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-2.5">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Most Effective Personal Remedies
          </h3>
        </div>

        <div className="space-y-2 text-xs">
          <div className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-between">
            <span className="font-semibold text-emerald-900 dark:text-emerald-200">
              1. Visual Cues + Horizon Gaze
            </span>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
              4.8 ★ Efficacy
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
            <span className="font-medium text-slate-700 dark:text-slate-300">
              2. P6 Nei Guan Wrist Pressure
            </span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              4.5 ★ Efficacy
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
            <span className="font-medium text-slate-700 dark:text-slate-300">
              3. Direct Fresh AC Airflow
            </span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              4.3 ★ Efficacy
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};
