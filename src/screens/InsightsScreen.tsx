import React, { useState } from 'react';
import {
  BrainCircuit,
  BarChart2,
  Calendar,
  Activity,
  Plus,
  Car,
  Bus,
  Train,
  Plane,
  Ship,
  Info,
  CheckCircle2,
  Trash2,
  Star,
  TrendingDown,
  Sparkles,
} from 'lucide-react';
import {
  UserProfile,
  JourneyRecord,
  SymptomLog,
  TransportType,
  SeatingPosition,
  VentilationType,
  MLPredictionInput,
  MLModelComparison,
} from '../types';
import { MLEngine } from '../utils/mlEngine';

interface InsightsScreenProps {
  profile: UserProfile;
  journeys: JourneyRecord[];
  symptoms: SymptomLog[];
  onAddSymptom: (log: SymptomLog) => void;
  onDeleteSymptom: (id: string) => void;
}

export const InsightsScreen: React.FC<InsightsScreenProps> = ({
  profile,
  journeys,
  symptoms,
  onAddSymptom,
  onDeleteSymptom,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'estimator' | 'history' | 'trends'>('estimator');

  // ML Risk Estimator parameters
  const [transportType, setTransportType] = useState<TransportType>('car');
  const [durationMinutes, setDurationMinutes] = useState<number>(45);
  const [seatingPosition, setSeatingPosition] = useState<SeatingPosition>('back');
  const [ventilation, setVentilation] = useState<VentilationType>('ac_fresh');
  const [screenReadingMinutes, setScreenReadingMinutes] = useState<number>(20);
  const [expectedRoughness, setExpectedRoughness] = useState<number>(3);

  // New Symptom Log Form modal / inline
  const [showLogForm, setShowLogForm] = useState(false);
  const [logSeverity, setLogSeverity] = useState(4);
  const [logTransport, setLogTransport] = useState<TransportType>('car');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(['Mild Nausea', 'Dizziness']);
  const [logDuration, setLogDuration] = useState(20);
  const [remedyName, setRemedyName] = useState('4-7-8 Breathing & Visual Cues');
  const [remedyRating, setRemedyRating] = useState(4);
  const [logNotes, setLogNotes] = useState('');

  // Calculate ML risk
  const inputData: MLPredictionInput = {
    transportType,
    durationMinutes,
    seatingPosition,
    ventilation,
    screenReadingMinutes,
    expectedRoughness,
    userSensitivityScore: profile.sensitivityScore,
    previousSicknessRate: profile.totalJourneys > 0 ? 0.4 : 0.25,
  };

  const results: MLModelComparison = MLEngine.predictRisk(inputData);

  const transportIcons: Record<string, React.ElementType> = {
    car: Car,
    bus: Bus,
    train: Train,
    plane: Plane,
    boat: Ship,
  };

  const commonSymptomOptions = [
    'Mild Nausea',
    'Severe Nausea',
    'Dizziness / Vertigo',
    'Cold Sweat',
    'Headache',
    'Excessive Salivation',
    'Drowsiness',
    'Stomach Awareness',
  ];

  const handleSaveLog = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog: SymptomLog = {
      id: `sym_${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      transportType: logTransport,
      severity: logSeverity,
      symptoms: selectedSymptoms.length > 0 ? selectedSymptoms : ['Discomfort'],
      durationMinutes: logDuration,
      interventions: [
        {
          name: remedyName,
          effectiveRating: remedyRating,
        },
      ],
      notes: logNotes.trim() || undefined,
    };

    onAddSymptom(newLog);
    setShowLogForm(false);
    setLogNotes('');
  };

  const toggleSymptomSelection = (s: string) => {
    if (selectedSymptoms.includes(s)) {
      setSelectedSymptoms(selectedSymptoms.filter(x => x !== s));
    } else {
      setSelectedSymptoms([...selectedSymptoms, s]);
    }
  };

  // Compute Weekly Trend Metrics
  const avgSeverity =
    journeys.length > 0
      ? (journeys.reduce((sum, j) => sum + j.actualSeverity, 0) / journeys.length).toFixed(1)
      : '0.0';

  return (
    <div className="flex-1 w-full min-h-full p-4 space-y-4 pb-8 text-[#252C28] dark:text-[#F3F4EF] bg-[#F3F4EF] dark:bg-[#1B221E] transition-colors">
      {/* 1. Header */}
      <div>
        <h2 className="text-xl font-bold text-[#252C28] dark:text-white font-heading tracking-tight leading-tight">
          Motion Insights
        </h2>
        <span className="text-xs text-[#68746B] dark:text-[#9EACA1] font-sans">
          Experimental risk estimates, symptom logs & personal travel patterns
        </span>
      </div>

      {/* 2. Sub-Tab Switcher */}
      <div className="flex rounded-xl bg-[#E4EBE2] dark:bg-[#29322D] p-1 text-xs border border-[#D8DCD5] dark:border-[#38453D] font-sans">
        <button
          onClick={() => setActiveSubTab('estimator')}
          className={`flex-1 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
            activeSubTab === 'estimator'
              ? 'bg-white dark:bg-[#34483B] text-[#252C28] dark:text-white shadow-xs'
              : 'text-[#68746B] dark:text-[#9EACA1]'
          }`}
        >
          AI Risk Estimator
        </button>
        <button
          onClick={() => setActiveSubTab('history')}
          className={`flex-1 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
            activeSubTab === 'history'
              ? 'bg-white dark:bg-[#34483B] text-[#252C28] dark:text-white shadow-xs'
              : 'text-[#68746B] dark:text-[#9EACA1]'
          }`}
        >
          Symptom History ({symptoms.length})
        </button>
        <button
          onClick={() => setActiveSubTab('trends')}
          className={`flex-1 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
            activeSubTab === 'trends'
              ? 'bg-white dark:bg-[#34483B] text-[#252C28] dark:text-white shadow-xs'
              : 'text-[#68746B] dark:text-[#9EACA1]'
          }`}
        >
          Weekly Trends
        </button>
      </div>

      {/* SUB-TAB 1: AI Risk Estimator */}
      {activeSubTab === 'estimator' && (
        <div className="space-y-3.5">
          {/* Estimated Probability Card */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#242D28] border border-[#D8DCD5] dark:border-[#333E37] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#68746B] dark:text-[#9EACA1] uppercase tracking-wider font-sans">
                Estimated Motion Discomfort Risk
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#E4EBE2] dark:bg-[#34483B] text-[#34483B] dark:text-[#E4EBE2] font-sans">
                {results.riskCategory} Risk
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-extrabold text-[#252C28] dark:text-white font-heading tabular-nums tracking-tight">
                {results.selectedPrediction}%
              </span>
              <span className="text-xs text-[#68746B] dark:text-[#9EACA1] font-sans">
                95% Confidence Interval: [{results.randomForest.confidenceInterval[0]}% –{' '}
                {results.randomForest.confidenceInterval[1]}%]
              </span>
            </div>

            {/* Clean Progress Meter in Primary Sage */}
            <div className="w-full h-2 rounded-full bg-[#E4EBE2] dark:bg-[#1B221E] overflow-hidden">
              <div
                className="h-full bg-[#34483B] dark:bg-[#91A995] rounded-full transition-all duration-300"
                style={{ width: `${results.selectedPrediction}%` }}
              />
            </div>

            {/* Feature Impacts */}
            {results.keyRiskFactors.length > 0 && (
              <div className="pt-2 border-t border-[#D8DCD5] dark:border-[#333E37] space-y-1">
                <span className="text-[11px] font-semibold text-[#68746B] dark:text-[#9EACA1] block font-sans">
                  Key Contributing Factors:
                </span>
                {results.keyRiskFactors.map((f, i) => (
                  <div key={i} className="flex items-center justify-between text-xs py-0.5 font-sans">
                    <span className="text-[11px] text-[#252C28] dark:text-[#E4EBE2] truncate max-w-[210px]">
                      • {f.factor}
                    </span>
                    <span className={`text-[11px] font-semibold ${f.isPositive ? 'text-[#557B61] dark:text-[#91A995]' : 'text-[#B65D5D]'}`}>
                      {f.impact}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Interactive Parameters */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#242D28] border border-[#D8DCD5] dark:border-[#333E37] space-y-3 font-sans">
            <span className="text-xs font-bold text-[#252C28] dark:text-white uppercase tracking-wider block font-heading">
              Trip Details
            </span>

            {/* Transport Mode */}
            <div>
              <label className="block text-[11px] font-medium text-[#68746B] dark:text-[#9EACA1] mb-1">
                Transport Mode
              </label>
              <div className="grid grid-cols-5 gap-1.5 text-xs">
                {(['car', 'bus', 'train', 'plane', 'boat'] as TransportType[]).map(t => {
                  const Icon = transportIcons[t];
                  const isSelected = transportType === t;
                  return (
                    <button
                      key={t}
                      onClick={() => setTransportType(t)}
                      className={`py-2 rounded-xl text-center flex flex-col items-center justify-center transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#34483B] text-white font-medium'
                          : 'bg-[#F3F4EF] dark:bg-[#1B221E] text-[#68746B] dark:text-[#9EACA1] border border-[#D8DCD5] dark:border-[#333E37]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 mb-0.5 stroke-[1.8]" />
                      <span className="text-[10px] capitalize">{t}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Seating Position */}
            <div>
              <label className="block text-[11px] font-medium text-[#68746B] dark:text-[#9EACA1] mb-1">
                Seating Position
              </label>
              <div className="grid grid-cols-5 gap-1 text-[11px]">
                {(['front', 'window', 'aisle', 'middle', 'back'] as SeatingPosition[]).map(pos => (
                  <button
                    key={pos}
                    onClick={() => setSeatingPosition(pos)}
                    className={`py-1.5 rounded-lg capitalize transition-colors cursor-pointer ${
                      seatingPosition === pos
                        ? 'bg-[#34483B] text-white font-medium'
                        : 'bg-[#F3F4EF] dark:bg-[#1B221E] text-[#68746B] dark:text-[#9EACA1] border border-[#D8DCD5] dark:border-[#333E37]'
                    }`}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>

            {/* Planned Screen Reading */}
            <div>
              <div className="flex items-center justify-between text-[11px] text-[#68746B] dark:text-[#9EACA1] mb-1">
                <span>Phone / Screen Reading Planned</span>
                <span className="font-semibold text-[#252C28] dark:text-white tabular-nums">
                  {screenReadingMinutes} minutes
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                step="5"
                value={screenReadingMinutes}
                onChange={e => setScreenReadingMinutes(parseInt(e.target.value))}
                className="w-full accent-[#34483B]"
              />
            </div>

            {/* Expected Terrain Roughness */}
            <div>
              <div className="flex items-center justify-between text-[11px] text-[#68746B] dark:text-[#9EACA1] mb-1">
                <span>Motion Roughness / Curves</span>
                <span className="font-semibold text-[#252C28] dark:text-white">
                  Level {expectedRoughness} of 5
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={expectedRoughness}
                onChange={e => setExpectedRoughness(parseInt(e.target.value))}
                className="w-full accent-[#34483B]"
              />
            </div>
          </div>

          {/* Model Comparison: Baseline vs Random Forest */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#242D28] border border-[#D8DCD5] dark:border-[#333E37] space-y-2.5 font-sans">
            <span className="text-xs font-bold text-[#252C28] dark:text-white uppercase tracking-wider block font-heading">
              ML Model Architecture Evaluation
            </span>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-[#F3F4EF] dark:bg-[#1B221E] border border-[#D8DCD5] dark:border-[#333E37]">
                <span className="font-bold text-[#252C28] dark:text-white block">
                  Logistic Regression
                </span>
                <span className="text-[10px] text-[#68746B] dark:text-[#9EACA1] block mb-1">
                  Linear Logit Baseline
                </span>
                <span className="text-lg font-bold text-[#252C28] dark:text-white tabular-nums">
                  {results.logisticRegression.probability}%
                </span>
                <span className="text-[10px] text-[#68746B] dark:text-[#9EACA1] block">
                  Accuracy: {results.logisticRegression.accuracyScore}%
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#E4EBE2] dark:bg-[#2A342E] border border-[#D8DCD5] dark:border-[#38453D]">
                <span className="font-bold text-[#34483B] dark:text-[#E4EBE2] block">
                  Random Forest
                </span>
                <span className="text-[10px] text-[#557B61] dark:text-[#91A995] block mb-1">
                  100-Tree Non-Linear
                </span>
                <span className="text-lg font-bold text-[#34483B] dark:text-[#E4EBE2] tabular-nums">
                  {results.randomForest.probability}%
                </span>
                <span className="text-[10px] text-[#557B61] dark:text-[#91A995] block font-semibold">
                  Accuracy: {results.randomForest.accuracyScore}%
                </span>
              </div>
            </div>

            {/* Mandatory Experimental Transparency Disclosure */}
            <div className="p-3 rounded-xl bg-[#E4EBE2]/60 dark:bg-[#2A342E] border border-[#D8DCD5] dark:border-[#38453D] flex items-start gap-2 text-[11px] text-[#68746B] dark:text-[#9EACA1]">
              <Info className="w-4 h-4 text-[#34483B] dark:text-[#91A995] shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Experimental Disclosure:</strong> Risk estimates are experimental machine learning models trained on simulated motion dynamics and are not medically validated. Never replace professional medical advice with these estimates.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: Symptom History */}
      {activeSubTab === 'history' && (
        <div className="space-y-3 font-sans">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#252C28] dark:text-white uppercase tracking-wider font-heading">
              Recorded Travel Discomfort Logs
            </span>
            <button
              onClick={() => setShowLogForm(!showLogForm)}
              className="px-3 py-1.5 rounded-xl bg-[#34483B] hover:bg-[#2B3C31] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showLogForm ? 'Cancel' : 'Log Event'}</span>
            </button>
          </div>

          {/* Form to log symptom */}
          {showLogForm && (
            <form
              onSubmit={handleSaveLog}
              className="p-4 rounded-2xl bg-white dark:bg-[#242D28] border border-[#D8DCD5] dark:border-[#333E37] space-y-3"
            >
              <span className="text-xs font-bold text-[#252C28] dark:text-white uppercase tracking-wider block font-heading">
                New Symptom Record
              </span>

              {/* Severity */}
              <div>
                <div className="flex items-center justify-between text-[11px] text-[#68746B] dark:text-[#9EACA1] mb-1">
                  <span>Severity Rating</span>
                  <span className="font-bold text-[#252C28] dark:text-white tabular-nums">
                    {logSeverity} / 10
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={logSeverity}
                  onChange={e => setLogSeverity(parseInt(e.target.value))}
                  className="w-full accent-[#34483B]"
                />
              </div>

              {/* Symptom selection */}
              <div>
                <label className="block text-[11px] font-medium text-[#68746B] dark:text-[#9EACA1] mb-1.5">
                  Symptoms Felt
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {commonSymptomOptions.map(sym => {
                    const isSelected = selectedSymptoms.includes(sym);
                    return (
                      <button
                        key={sym}
                        type="button"
                        onClick={() => toggleSymptomSelection(sym)}
                        className={`py-1 px-2.5 rounded-lg text-xs transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#34483B] text-white font-medium'
                            : 'bg-[#F3F4EF] dark:bg-[#1B221E] text-[#68746B] dark:text-[#9EACA1] border border-[#D8DCD5] dark:border-[#333E37]'
                        }`}
                      >
                        {sym}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Remedy Tried */}
              <div>
                <label className="block text-[11px] font-medium text-[#68746B] dark:text-[#9EACA1] mb-1">
                  Relief Strategy Used
                </label>
                <input
                  type="text"
                  value={remedyName}
                  onChange={e => setRemedyName(e.target.value)}
                  placeholder="e.g. 4-7-8 Breathing, P6 Nei Guan acupressure"
                  className="w-full h-9 px-3 text-xs rounded-xl bg-[#F3F4EF] dark:bg-[#1B221E] border border-[#D8DCD5] dark:border-[#333E37] text-[#252C28] dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full h-10 rounded-xl bg-[#34483B] hover:bg-[#2B3C31] text-white font-semibold text-xs cursor-pointer"
              >
                Save Symptom Record
              </button>
            </form>
          )}

          {/* List of Symptoms */}
          <div className="space-y-2">
            {symptoms.map(log => (
              <div
                key={log.id}
                className="p-3.5 rounded-xl bg-white dark:bg-[#242D28] border border-[#D8DCD5] dark:border-[#333E37] space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#252C28] dark:text-white capitalize">
                    {log.transportType} Travel ({log.timestamp})
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#E4EBE2] dark:bg-[#34483B] text-[#34483B] dark:text-[#E4EBE2]">
                      Severity {log.severity}/10
                    </span>
                    <button
                      onClick={() => onDeleteSymptom(log.id)}
                      className="text-[#68746B] hover:text-[#B65D5D] p-1 cursor-pointer"
                      title="Delete record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 text-[10px] text-[#68746B] dark:text-[#9EACA1]">
                  {log.symptoms.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-[#F3F4EF] dark:bg-[#1B221E] border border-[#D8DCD5] dark:border-[#333E37]"
                    >
                      {s}
                    </span>
                  ))}
                </div>

                {log.interventions && log.interventions.length > 0 && (
                  <div className="pt-1 border-t border-[#D8DCD5] dark:border-[#333E37] flex items-center justify-between text-[11px]">
                    <span className="text-[#68746B] dark:text-[#9EACA1]">
                      Remedy: {log.interventions[0].name}
                    </span>
                    <span className="text-[#557B61] dark:text-[#91A995] font-semibold">
                      {log.interventions[0].effectiveRating} ★ Efficacy
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: Weekly Trends & Patterns */}
      {activeSubTab === 'trends' && (
        <div className="space-y-3.5 font-sans">
          {/* Trend KPI Cards */}
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3 rounded-2xl bg-white dark:bg-[#242D28] border border-[#D8DCD5] dark:border-[#333E37]">
              <span className="block text-2xl font-bold text-[#252C28] dark:text-white font-heading tabular-nums">
                {avgSeverity}
                <span className="text-xs font-normal text-[#68746B]">/10</span>
              </span>
              <span className="text-[11px] text-[#68746B] dark:text-[#9EACA1]">Avg Journey Severity</span>
            </div>

            <div className="p-3 rounded-2xl bg-white dark:bg-[#242D28] border border-[#D8DCD5] dark:border-[#333E37]">
              <span className="block text-2xl font-bold text-[#557B61] dark:text-[#91A995] font-heading tabular-nums">
                -34%
              </span>
              <span className="text-[11px] text-[#68746B] dark:text-[#9EACA1]">Discomfort with Cues</span>
            </div>
          </div>

          {/* Minimalist SVG Severity Trend Chart */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#242D28] border border-[#D8DCD5] dark:border-[#333E37] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#252C28] dark:text-white uppercase tracking-wider font-heading">
                Severity Curve Across Past Trips
              </span>
              <span className="text-[11px] text-[#557B61] dark:text-[#91A995] font-semibold">
                Decreasing Trend
              </span>
            </div>

            <div className="h-32 w-full flex items-end justify-between gap-2 pt-3 pb-1 border-b border-[#D8DCD5] dark:border-[#333E37]">
              {journeys.slice(0, 6).reverse().map((j, i) => {
                const heightPercent = Math.max(15, j.actualSeverity * 10);
                return (
                  <div key={j.id} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                    <span className="text-[10px] font-bold text-[#252C28] dark:text-white tabular-nums">
                      {j.actualSeverity}
                    </span>
                    <div
                      className={`w-full max-w-[24px] rounded-t-lg transition-all ${
                        j.usedTravelMode ? 'bg-[#34483B] dark:bg-[#91A995]' : 'bg-[#D8DCD5] dark:bg-[#4A574E]'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                    <span className="text-[9px] text-[#68746B] dark:text-[#9EACA1] uppercase">
                      {j.transportType.substring(0, 3)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#68746B] dark:text-[#9EACA1]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#34483B] dark:bg-[#91A995]" />
                <span>With Travel Mode</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#D8DCD5] dark:bg-[#4A574E]" />
                <span>Standard Ride</span>
              </div>
            </div>
          </div>

          {/* Personal Travel Patterns & Triggers */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#242D28] border border-[#D8DCD5] dark:border-[#333E37] space-y-2.5">
            <span className="text-xs font-bold text-[#252C28] dark:text-white uppercase tracking-wider block font-heading">
              Personal Sensitivity Triggers
            </span>
            <div className="flex flex-wrap gap-1.5 text-xs">
              {profile.triggers.map((t, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-[#F3F4EF] dark:bg-[#1B221E] border border-[#D8DCD5] dark:border-[#333E37] text-[#252C28] dark:text-[#E4EBE2] text-[11px]"
                >
                  {t}
                </span>
              ))}
            </div>

            <div className="pt-2 border-t border-[#D8DCD5] dark:border-[#333E37]">
              <span className="text-[11px] font-semibold text-[#68746B] dark:text-[#9EACA1] block mb-1">
                Highest Efficacy Comfort Strategies:
              </span>
              <ul className="text-xs text-[#252C28] dark:text-[#E4EBE2] space-y-1">
                {profile.favoriteRemedies.slice(0, 3).map((r, i) => (
                  <li key={i} className="flex items-center gap-1.5 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#557B61] dark:text-[#91A995] shrink-0" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
