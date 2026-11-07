import React, { useState } from 'react';
import {
  BrainCircuit,
  Sliders,
  Car,
  Bus,
  Plane,
  Ship,
  Train,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Sparkles,
  Info,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import {
  TransportType,
  SeatingPosition,
  VentilationType,
  MLPredictionInput,
  MLModelComparison,
  UserProfile,
  ScreenType,
} from '../types';
import { MLEngine } from '../utils/mlEngine';

interface RiskEstimatorScreenProps {
  profile: UserProfile;
  onNavigate: (screen: ScreenType) => void;
}

export const RiskEstimatorScreen: React.FC<RiskEstimatorScreenProps> = ({ profile, onNavigate }) => {
  // Input parameters
  const [transportType, setTransportType] = useState<TransportType>('car');
  const [durationMinutes, setDurationMinutes] = useState<number>(45);
  const [seatingPosition, setSeatingPosition] = useState<SeatingPosition>('back');
  const [ventilation, setVentilation] = useState<VentilationType>('ac_fresh');
  const [screenReadingMinutes, setScreenReadingMinutes] = useState<number>(20);
  const [expectedRoughness, setExpectedRoughness] = useState<number>(3);
  const [sensitivityScore, setSensitivityScore] = useState<number>(profile.sensitivityScore);

  // Compute prediction dynamically
  const inputData: MLPredictionInput = {
    transportType,
    durationMinutes,
    seatingPosition,
    ventilation,
    screenReadingMinutes,
    expectedRoughness,
    userSensitivityScore: sensitivityScore,
    previousSicknessRate: profile.totalJourneys > 0 ? 0.4 : 0.25,
  };

  const results: MLModelComparison = MLEngine.predictRisk(inputData);

  const transportOptions: { id: TransportType; label: string; icon: React.ElementType }[] = [
    { id: 'car', label: 'Car', icon: Car },
    { id: 'bus', label: 'Bus', icon: Bus },
    { id: 'train', label: 'Train', icon: Train },
    { id: 'plane', label: 'Plane', icon: Plane },
    { id: 'boat', label: 'Boat', icon: Ship },
  ];

  const getRiskColor = (cat: MLModelComparison['riskCategory']) => {
    switch (cat) {
      case 'Low':
        return 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800';
      case 'Moderate':
        return 'text-amber-700 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800';
      case 'Elevated':
        return 'text-orange-700 bg-orange-50 dark:bg-orange-950/60 border-orange-200 dark:border-orange-800';
      case 'High':
        return 'text-rose-700 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800';
    }
  };

  return (
    <div className="flex-1 w-full min-h-full p-4 space-y-4 pb-8 text-slate-800 dark:text-slate-100 bg-[#FBFBF9] dark:bg-slate-950">
      {/* 1. Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
            <BrainCircuit className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
              AI Travel Risk Estimator
            </h2>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              Personalized Machine Learning Pre-Trip Analysis
            </span>
          </div>
        </div>
      </div>

      {/* 2. Primary ML Prediction Card (Dynamic) */}
      <section className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Predicted Discomfort Probability
          </span>
          <span
            className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${getRiskColor(
              results.riskCategory
            )}`}
          >
            {results.riskCategory} Risk
          </span>
        </div>

        {/* Large Score with 95% Confidence Interval */}
        <div className="flex items-baseline gap-3">
          <span className="text-4xl font-extrabold text-slate-900 dark:text-white tabular-nums tracking-tight">
            {results.selectedPrediction}%
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            95% CI: [{results.randomForest.confidenceInterval[0]}% –{' '}
            {results.randomForest.confidenceInterval[1]}%]
          </span>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              results.selectedPrediction >= 70
                ? 'bg-rose-500'
                : results.selectedPrediction >= 45
                ? 'bg-orange-500'
                : results.selectedPrediction >= 25
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${results.selectedPrediction}%` }}
          />
        </div>

        {/* Key Drivers Breakdown */}
        {results.keyRiskFactors.length > 0 && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block">
              Key Contributing Factors
            </span>
            <div className="space-y-1">
              {results.keyRiskFactors.map((f, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-xs py-0.5 text-slate-600 dark:text-slate-300"
                >
                  <span className="text-[11px] truncate max-w-[220px]">• {f.factor}</span>
                  <span
                    className={`text-[11px] font-semibold ${
                      f.isPositive ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'
                    }`}
                  >
                    {f.impact}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 3. Input Controls: Transport, Seating, Screen Time, Roughness */}
      <section className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-3.5">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Journey Parameters
        </h3>

        {/* Transport Type Pills */}
        <div>
          <label className="block text-[11px] font-medium text-slate-500 mb-1.5">Transport Mode</label>
          <div className="grid grid-cols-5 gap-1.5">
            {transportOptions.map(t => {
              const Icon = t.icon;
              const isSelected = transportType === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTransportType(t.id)}
                  className={`py-2 rounded-xl text-center flex flex-col items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mb-0.5" />
                  <span className="text-[10px] font-medium">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Duration Slider */}
        <div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
            <span>Trip Duration</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
              {durationMinutes} minutes ({Math.round((durationMinutes / 60) * 10) / 10}h)
            </span>
          </div>
          <input
            type="range"
            min="10"
            max="240"
            step="5"
            value={durationMinutes}
            onChange={e => setDurationMinutes(parseInt(e.target.value))}
            className="w-full accent-emerald-600"
          />
        </div>

        {/* Seating Position */}
        <div>
          <label className="block text-[11px] font-medium text-slate-500 mb-1.5">Seating Position</label>
          <div className="grid grid-cols-5 gap-1 text-[11px]">
            {(['front', 'window', 'aisle', 'middle', 'back'] as SeatingPosition[]).map(pos => (
              <button
                key={pos}
                onClick={() => setSeatingPosition(pos)}
                className={`py-1.5 rounded-lg capitalize transition-colors ${
                  seatingPosition === pos
                    ? 'bg-emerald-700 text-white font-medium'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {pos}
              </button>
            ))}
          </div>
        </div>

        {/* Ventilation */}
        <div>
          <label className="block text-[11px] font-medium text-slate-500 mb-1.5">Ventilation / Airflow</label>
          <div className="grid grid-cols-3 gap-1.5 text-[11px]">
            {(
              [
                { id: 'ac_fresh', label: 'Fresh AC Vent' },
                { id: 'open_window', label: 'Open Window' },
                { id: 'stuffy_poor', label: 'Stuffy / Low Air' },
              ] as const
            ).map(v => (
              <button
                key={v.id}
                onClick={() => setVentilation(v.id)}
                className={`py-1.5 px-2 rounded-lg text-center transition-colors ${
                  ventilation === v.id
                    ? 'bg-emerald-700 text-white font-medium'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* Screen Reading Time */}
        <div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
            <span>Planned Phone / Screen Reading Time</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
              {screenReadingMinutes} mins
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="60"
            step="5"
            value={screenReadingMinutes}
            onChange={e => setScreenReadingMinutes(parseInt(e.target.value))}
            className="w-full accent-emerald-600"
          />
        </div>

        {/* Expected Motion Roughness */}
        <div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
            <span>Terrain / Motion Roughness</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Level {expectedRoughness} of 5{' '}
              {expectedRoughness >= 4 ? '(Winding/Turbulent)' : expectedRoughness === 3 ? '(Average)' : '(Smooth)'}
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="5"
            step="1"
            value={expectedRoughness}
            onChange={e => setExpectedRoughness(parseInt(e.target.value))}
            className="w-full accent-emerald-600"
          />
        </div>
      </section>

      {/* 4. Model Architecture Comparison (Logistic Regression vs Random Forest) */}
      <section className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Model Comparison: Linear Baseline vs Random Forest
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Baseline: Logistic Regression */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <span className="font-bold text-slate-900 dark:text-white block mb-0.5">
              Logistic Regression
            </span>
            <span className="text-[10px] text-slate-500 block mb-2">Linear Log-Odds Baseline</span>
            <div className="text-xl font-extrabold text-slate-800 dark:text-slate-200 tabular-nums">
              {results.logisticRegression.probability}%
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">
              95% CI: [{results.logisticRegression.confidenceInterval[0]}% –{' '}
              {results.logisticRegression.confidenceInterval[1]}%]
            </span>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold block mt-1.5">
              Test Acc: {results.logisticRegression.accuracyScore}%
            </span>
          </div>

          {/* Non-Linear: Random Forest */}
          <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-800/70">
            <span className="font-bold text-emerald-900 dark:text-emerald-200 block mb-0.5">
              Random Forest
            </span>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block mb-2">
              100 Trees (Non-Linear)
            </span>
            <div className="text-xl font-extrabold text-emerald-800 dark:text-emerald-300 tabular-nums">
              {results.randomForest.probability}%
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-1">
              95% CI: [{results.randomForest.confidenceInterval[0]}% –{' '}
              {results.randomForest.confidenceInterval[1]}%]
            </span>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold block mt-1.5">
              Test Acc: {results.randomForest.accuracyScore}%
            </span>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
          Random Forest achieves superior discrimination on complex multi-factor interactions (e.g., sitting in the rear while actively looking down at text messages).
        </p>
      </section>

      {/* 5. Recommended Mitigations */}
      <section className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-2">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Suggested Comfort Preparation
        </h4>
        <div className="space-y-1.5">
          {results.recommendedMitigations.map((m, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span>{m}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Medical Transparency & Ethics Disclosure */}
      <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
        <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="text-[11px] leading-relaxed">
          <span className="font-bold block mb-0.5">Scientific Transparency Disclosure</span>
          {results.transparencyNotice} MotionEase never prescribes or recommends pharmaceutical dosages. For severe or persistent vertigo, consult a licensed physician.
        </div>
      </div>
    </div>
  );
};
