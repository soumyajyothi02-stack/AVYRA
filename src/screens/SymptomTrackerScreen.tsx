import React, { useState, useMemo } from 'react';
import {
  Activity,
  Plus,
  Car,
  Bus,
  Plane,
  Ship,
  Train,
  CheckCircle2,
  Trash2,
  Edit2,
  Star,
  Sparkles,
  Calendar,
  Clock,
  TrendingDown,
  BarChart2,
  X,
  Wind,
  Compass,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { SymptomLog, TransportType, ScreenType } from '../types';

interface SymptomTrackerScreenProps {
  symptoms: SymptomLog[];
  onAddSymptom: (log: SymptomLog) => void;
  onUpdateSymptom?: (log: SymptomLog) => void;
  onDeleteSymptom: (id: string) => void;
  onNavigate?: (screen: ScreenType) => void;
}

const REQUIRED_SYMPTOMS = [
  'Nausea',
  'Dizziness',
  'Headache',
  'Sweating',
  'Salivation',
  'Vomiting',
  'Fatigue',
  'Stomach Discomfort',
  'Drowsiness',
];

const QUICK_REMEDIES = [
  '4-7-8 Breathing',
  'P6 Wrist Acupressure',
  'Horizon Gaze',
  'Cold Fresh Airflow',
  'Ginger / Hydration',
  'Headrest Stabilization',
];

export const SymptomTrackerScreen: React.FC<SymptomTrackerScreenProps> = ({
  symptoms,
  onAddSymptom,
  onUpdateSymptom,
  onDeleteSymptom,
  onNavigate,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Time filter for analytics: 'all' | 'daily' | 'weekly' | 'monthly'
  const [timeFilter, setTimeFilter] = useState<'all' | 'daily' | 'weekly' | 'monthly'>('all');

  // Form states
  const [transportType, setTransportType] = useState<TransportType>('car');
  const [severity, setSeverity] = useState<number>(4);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(['Nausea', 'Dizziness']);
  const [customSymptomInput, setCustomSymptomInput] = useState('');
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [dateTime, setDateTime] = useState<string>(() =>
    new Date().toISOString().substring(0, 16)
  );
  const [remedyName, setRemedyName] = useState('4-7-8 Breathing & Cool Airflow');
  const [remedyRating, setRemedyRating] = useState<number>(4);
  const [notes, setNotes] = useState('');

  const handleStartEdit = (log: SymptomLog) => {
    setEditingId(log.id);
    setTransportType(log.transportType || 'car');
    setSeverity(log.severity);
    setSelectedSymptoms(log.symptoms || []);
    setDurationMinutes(log.durationMinutes || 30);
    setDateTime(
      log.timestamp.includes('T')
        ? log.timestamp.substring(0, 16)
        : new Date().toISOString().substring(0, 16)
    );
    setRemedyName(log.interventions?.[0]?.name || log.reliefApplied || '');
    setRemedyRating(log.interventions?.[0]?.effectiveRating || 4);
    setNotes(log.notes || '');
    setShowForm(true);
  };

  const handleResetForm = () => {
    setEditingId(null);
    setTransportType('car');
    setSeverity(4);
    setSelectedSymptoms(['Nausea', 'Dizziness']);
    setCustomSymptomInput('');
    setDurationMinutes(30);
    setDateTime(new Date().toISOString().substring(0, 16));
    setRemedyName('4-7-8 Breathing & Cool Airflow');
    setRemedyRating(4);
    setNotes('');
    setShowForm(false);
  };

  const handleToggleSymptom = (sym: string) => {
    if (selectedSymptoms.includes(sym)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== sym));
    } else {
      setSelectedSymptoms([...selectedSymptoms, sym]);
    }
  };

  const handleAddCustomSymptom = () => {
    const trimmed = customSymptomInput.trim();
    if (trimmed && !selectedSymptoms.includes(trimmed)) {
      setSelectedSymptoms([...selectedSymptoms, trimmed]);
      setCustomSymptomInput('');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedTimestamp = dateTime.replace('T', ' ');

    const payload: SymptomLog = {
      id: editingId || `sym_${Date.now()}`,
      timestamp: formattedTimestamp,
      transportType,
      severity,
      symptoms: selectedSymptoms.length > 0 ? selectedSymptoms : ['Overall Discomfort'],
      durationMinutes,
      reliefApplied: remedyName,
      interventions: [
        {
          name: remedyName,
          effectiveRating: remedyRating,
        },
      ],
      notes: notes.trim() || undefined,
    };

    if (editingId && onUpdateSymptom) {
      onUpdateSymptom(payload);
    } else {
      onAddSymptom(payload);
    }

    handleResetForm();
  };

  // Filter symptoms based on selected timeframe
  const filteredSymptoms = useMemo(() => {
    if (timeFilter === 'all') return symptoms;

    const now = new Date().getTime();
    return symptoms.filter(log => {
      try {
        const logTime = new Date(log.timestamp.replace(' ', 'T')).getTime();
        const diffHours = (now - logTime) / (1000 * 60 * 60);

        if (timeFilter === 'daily') return diffHours <= 24;
        if (timeFilter === 'weekly') return diffHours <= 168; // 7 days
        if (timeFilter === 'monthly') return diffHours <= 720; // 30 days
        return true;
      } catch {
        return true;
      }
    });
  }, [symptoms, timeFilter]);

  // Compute trend statistics on filtered set
  const avgSeverity = useMemo(() => {
    if (filteredSymptoms.length === 0) return '0.0';
    const sum = filteredSymptoms.reduce((acc, curr) => acc + curr.severity, 0);
    return (sum / filteredSymptoms.length).toFixed(1);
  }, [filteredSymptoms]);

  const symptomCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredSymptoms.forEach(log => {
      (log.symptoms || []).forEach(sym => {
        counts[sym] = (counts[sym] || 0) + 1;
      });
    });
    return counts;
  }, [filteredSymptoms]);

  const topSymptoms = useMemo(() => {
    return Object.entries(symptomCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  }, [symptomCounts]);

  // Transport-wise average severity comparison
  const transportStats = useMemo(() => {
    const stats: Record<string, { count: number; sum: number }> = {
      car: { count: 0, sum: 0 },
      bus: { count: 0, sum: 0 },
      boat: { count: 0, sum: 0 },
      plane: { count: 0, sum: 0 },
      train: { count: 0, sum: 0 },
    };

    symptoms.forEach(log => {
      const t = log.transportType || 'car';
      if (!stats[t]) stats[t] = { count: 0, sum: 0 };
      stats[t].count += 1;
      stats[t].sum += log.severity;
    });

    return stats;
  }, [symptoms]);

  // Before & After comparison: effective relief rating vs severity
  const reliefEfficacyAvg = useMemo(() => {
    const withIntervention = symptoms.filter(s => s.interventions && s.interventions.length > 0);
    if (withIntervention.length === 0) return 4.0;
    const sum = withIntervention.reduce(
      (acc, s) => acc + (s.interventions?.[0]?.effectiveRating || 4),
      0
    );
    return (sum / withIntervention.length).toFixed(1);
  }, [symptoms]);

  return (
    <div className="flex-1 w-full min-h-full p-4 space-y-4 pb-8 text-[#252C28] dark:text-[#F3F4EF] bg-[#F3F4EF] dark:bg-[#1B221E] transition-colors font-sans">
      {/* 1. Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#252C28] dark:text-white font-heading leading-tight">
            Symptom Tracker
          </h2>
          <span className="text-[11px] text-[#68746B] dark:text-[#9EACA1]">
            Track discomfort patterns to build your personal comfort profile
          </span>
        </div>

        <button
          onClick={() => {
            if (showForm) {
              handleResetForm();
            } else {
              setShowForm(true);
            }
          }}
          className="h-9 px-3.5 rounded-xl bg-[#34483B] hover:bg-[#2B3C31] text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
        >
          {showForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          <span>{showForm ? 'Cancel' : 'Log Event'}</span>
        </button>
      </div>

      {/* 2. Time-Window Analytics Filter Bar */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-white dark:bg-[#242D28] border border-[#D8DCD5] dark:border-[#333E37] text-xs">
        <button
          onClick={() => setTimeFilter('all')}
          className={`flex-1 py-1 rounded-lg text-center font-medium transition-colors cursor-pointer ${
            timeFilter === 'all'
              ? 'bg-[#34483B] text-white'
              : 'text-[#68746B] dark:text-[#9EACA1] hover:text-[#252C28]'
          }`}
        >
          All Time
        </button>
        <button
          onClick={() => setTimeFilter('daily')}
          className={`flex-1 py-1 rounded-lg text-center font-medium transition-colors cursor-pointer ${
            timeFilter === 'daily'
              ? 'bg-[#34483B] text-white'
              : 'text-[#68746B] dark:text-[#9EACA1] hover:text-[#252C28]'
          }`}
        >
          Daily (24h)
        </button>
        <button
          onClick={() => setTimeFilter('weekly')}
          className={`flex-1 py-1 rounded-lg text-center font-medium transition-colors cursor-pointer ${
            timeFilter === 'weekly'
              ? 'bg-[#34483B] text-white'
              : 'text-[#68746B] dark:text-[#9EACA1] hover:text-[#252C28]'
          }`}
        >
          Weekly (7d)
        </button>
        <button
          onClick={() => setTimeFilter('monthly')}
          className={`flex-1 py-1 rounded-lg text-center font-medium transition-colors cursor-pointer ${
            timeFilter === 'monthly'
              ? 'bg-[#34483B] text-white'
              : 'text-[#68746B] dark:text-[#9EACA1] hover:text-[#252C28]'
          }`}
        >
          Monthly (30d)
        </button>
      </div>

      {/* 3. Simple, Calming Trend Visualisation Chart */}
      <section className="p-4 rounded-2xl bg-white dark:bg-[#242D28] border border-[#D8DCD5] dark:border-[#333E37] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-[#34483B] dark:text-[#91A995]" />
            <h3 className="text-xs font-bold text-[#252C28] dark:text-white uppercase tracking-wider font-heading">
              Symptom Severity Trend ({timeFilter.toUpperCase()})
            </h3>
          </div>
          <span className="text-[11px] text-[#68746B] dark:text-[#9EACA1]">
            Avg Severity: <strong>{avgSeverity}/10</strong>
          </span>
        </div>

        {filteredSymptoms.length === 0 ? (
          <div className="py-6 text-center text-xs text-[#68746B] dark:text-[#9EACA1] space-y-1">
            <p className="font-semibold text-[#252C28] dark:text-white">
              No entries logged for this timeframe ({timeFilter}).
            </p>
            <p>Tap "Log Event" above or switch to "All Time" to view your historical logs.</p>
          </div>
        ) : (
          <div className="space-y-3 pt-1">
            {/* Visual Bar Chart: Comfortable, non-flashing vertical bars */}
            <div className="h-28 flex items-end justify-between gap-1.5 pt-4 px-1 border-b border-[#D8DCD5] dark:border-[#333E37]">
              {filteredSymptoms.slice(0, 7).reverse().map((log, idx) => {
                const heightPercent = Math.max(12, (log.severity / 10) * 100);
                const isHigh = log.severity >= 7;
                const isMed = log.severity >= 4 && log.severity < 7;
                const barColor = isHigh ? 'bg-[#B65D5D]' : isMed ? 'bg-[#C28B45]' : 'bg-[#557B61]';

                return (
                  <div key={log.id || idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                    <span className="text-[9px] font-bold text-[#68746B] dark:text-[#9EACA1] tabular-nums opacity-0 group-hover:opacity-100 transition-opacity">
                      {log.severity}
                    </span>
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full max-w-[28px] rounded-t-md transition-all ${barColor}`}
                      title={`${log.transportType || 'trip'}: Severity ${log.severity}/10 (${log.timestamp})`}
                    />
                    <span className="text-[9px] text-[#68746B] dark:text-[#9EACA1] uppercase truncate max-w-[36px]">
                      {(log.transportType || 'trip').substring(0, 3)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Quick summary stats */}
            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div className="p-2.5 rounded-xl bg-[#F3F4EF] dark:bg-[#1E2521] border border-[#E4EBE2] dark:border-[#34483B]">
                <span className="text-[10px] text-[#68746B] dark:text-[#9EACA1] block">
                  Top Reported Sensation:
                </span>
                <span className="font-bold text-[#252C28] dark:text-white truncate block mt-0.5">
                  {topSymptoms[0] ? `${topSymptoms[0][0]} (${topSymptoms[0][1]}x)` : 'None recorded'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#F3F4EF] dark:bg-[#1E2521] border border-[#E4EBE2] dark:border-[#34483B]">
                <span className="text-[10px] text-[#68746B] dark:text-[#9EACA1] block">
                  Logged Entries:
                </span>
                <span className="font-bold text-[#34483B] dark:text-[#91A995] block mt-0.5">
                  {filteredSymptoms.length} records in view
                </span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 4. Transport-Wise Discomfort Comparison */}
      <section className="p-4 rounded-2xl bg-white dark:bg-[#242D28] border border-[#D8DCD5] dark:border-[#333E37] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#34483B] dark:text-[#91A995]" />
            <h3 className="text-xs font-bold text-[#252C28] dark:text-white uppercase tracking-wider font-heading">
              Transport Comparison (Avg Severity)
            </h3>
          </div>
          <span className="text-[10px] text-[#68746B] dark:text-[#9EACA1]">
            Vehicle Breakdown
          </span>
        </div>

        <div className="grid grid-cols-5 gap-1.5 text-center text-xs">
          {[
            { id: 'car', label: 'Car', icon: Car },
            { id: 'bus', label: 'Bus', icon: Bus },
            { id: 'boat', label: 'Boat', icon: Ship },
            { id: 'plane', label: 'Plane', icon: Plane },
            { id: 'train', label: 'Train', icon: Train },
          ].map(t => {
            const Icon = t.icon;
            const data = transportStats[t.id];
            const avg = data && data.count > 0 ? (data.sum / data.count).toFixed(1) : '-';
            const isHigh = parseFloat(avg) >= 5;

            return (
              <div
                key={t.id}
                className="p-2 rounded-xl bg-[#F3F4EF] dark:bg-[#1E2521] border border-[#E4EBE2] dark:border-[#34483B] flex flex-col items-center"
              >
                <Icon className="w-3.5 h-3.5 text-[#68746B] dark:text-[#9EACA1] mb-1" />
                <span className="text-[10px] text-[#68746B] dark:text-[#9EACA1] block font-sans">
                  {t.label}
                </span>
                <span
                  className={`text-xs font-bold mt-0.5 tabular-nums ${
                    isHigh ? 'text-[#B65D5D]' : 'text-[#34483B] dark:text-[#91A995]'
                  }`}
                >
                  {avg !== '-' ? `${avg}/10` : 'N/A'}
                </span>
                <span className="text-[9px] text-[#68746B] dark:text-[#9EACA1] mt-0.5">
                  {data?.count || 0} trips
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Before & After Relief Efficacy Metric */}
      <section className="p-3.5 rounded-2xl bg-[#E4EBE2]/60 dark:bg-[#2A342E] border border-[#D8DCD5] dark:border-[#38453D] flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-[#252C28] dark:text-white block font-heading">
            Strategy Relief Effectiveness
          </span>
          <p className="text-[11px] text-[#68746B] dark:text-[#9EACA1] mt-0.5">
            Average user rating for applied breathing & horizon techniques
          </p>
        </div>
        <div className="flex items-center gap-1 bg-white dark:bg-[#34483B] px-3 py-1.5 rounded-xl border border-[#D8DCD5] dark:border-[#38453D] shrink-0">
          <Star className="w-4 h-4 text-[#C28B45] fill-[#C28B45]" />
          <span className="text-xs font-bold text-[#252C28] dark:text-white tabular-nums font-heading">
            {reliefEfficacyAvg} / 5.0
          </span>
        </div>
      </section>

      {/* 6. Add / Edit Symptom Log Form Modal or Inline */}
      {showForm && (
        <form
          onSubmit={handleSave}
          className="p-4 rounded-2xl bg-white dark:bg-[#242D28] border border-[#34483B]/30 dark:border-[#91A995]/40 shadow-sm space-y-3.5"
        >
          <div className="flex items-center justify-between pb-2 border-b border-[#D8DCD5] dark:border-[#333E37]">
            <span className="text-xs font-bold text-[#252C28] dark:text-white uppercase tracking-wider font-heading">
              {editingId ? 'Edit Symptom Record' : 'Record Discomfort Event'}
            </span>
            <span className="text-[11px] font-semibold text-[#557B61] dark:text-[#91A995]">
              {editingId ? 'Updating' : 'New Entry'}
            </span>
          </div>

          {/* Transport Mode */}
          <div>
            <label className="block text-[11px] font-medium text-[#68746B] dark:text-[#9EACA1] mb-1">
              Transport Type
            </label>
            <div className="grid grid-cols-5 gap-1.5 text-xs">
              {(['car', 'bus', 'train', 'plane', 'boat'] as TransportType[]).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTransportType(t)}
                  className={`py-1.5 rounded-xl capitalize transition-colors cursor-pointer ${
                    transportType === t
                      ? 'bg-[#34483B] text-white font-semibold'
                      : 'bg-[#F3F4EF] dark:bg-[#1E2521] text-[#68746B] dark:text-[#9EACA1] border border-[#D8DCD5] dark:border-[#333E37]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Date & Time Picker */}
          <div>
            <label className="block text-[11px] font-medium text-[#68746B] dark:text-[#9EACA1] mb-1">
              Date & Time of Experience
            </label>
            <input
              type="datetime-local"
              value={dateTime}
              onChange={e => setDateTime(e.target.value)}
              className="w-full h-9 px-3 text-xs rounded-xl bg-[#F3F4EF] dark:bg-[#1E2521] border border-[#D8DCD5] dark:border-[#333E37] text-[#252C28] dark:text-white focus:outline-hidden focus:border-[#91A995]"
              required
            />
          </div>

          {/* Severity Slider */}
          <div>
            <div className="flex items-center justify-between text-[11px] text-[#68746B] dark:text-[#9EACA1] mb-1">
              <span>Overall Discomfort Severity</span>
              <span className="font-bold text-[#252C28] dark:text-white tabular-nums">
                {severity} / 10 ({severity <= 3 ? 'Mild' : severity <= 6 ? 'Moderate' : 'Severe'})
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={severity}
              onChange={e => setSeverity(parseInt(e.target.value))}
              className="w-full accent-[#34483B]"
            />
          </div>

          {/* Specific Sensations Checklist */}
          <div>
            <label className="block text-[11px] font-medium text-[#68746B] dark:text-[#9EACA1] mb-1.5">
              Specific Sensations Experienced (Select all that apply)
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {REQUIRED_SYMPTOMS.map(sym => {
                const isSelected = selectedSymptoms.includes(sym);
                return (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => handleToggleSymptom(sym)}
                    className={`py-1 px-2.5 rounded-lg text-xs transition-colors flex items-center gap-1 cursor-pointer ${
                      isSelected
                        ? 'bg-[#34483B] text-white font-medium shadow-xs'
                        : 'bg-[#F3F4EF] dark:bg-[#1E2521] text-[#68746B] dark:text-[#9EACA1] border border-[#D8DCD5] dark:border-[#333E37]'
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="w-3 h-3 text-[#91A995]" />}
                    <span>{sym}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom Sensation Input */}
            <div className="flex items-center gap-1.5 pt-1">
              <input
                type="text"
                value={customSymptomInput}
                onChange={e => setCustomSymptomInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomSymptom();
                  }
                }}
                placeholder="+ Add other sensation..."
                className="flex-1 h-8 px-2.5 text-xs rounded-lg bg-[#F3F4EF] dark:bg-[#1E2521] border border-[#D8DCD5] dark:border-[#333E37] text-[#252C28] dark:text-white focus:outline-hidden"
              />
              <button
                type="button"
                onClick={handleAddCustomSymptom}
                className="h-8 px-2.5 rounded-lg bg-[#E4EBE2] dark:bg-[#34483B] text-[#34483B] dark:text-[#E4EBE2] text-xs font-semibold cursor-pointer"
              >
                Add
              </button>
            </div>
          </div>

          {/* Duration */}
          <div>
            <div className="flex items-center justify-between text-[11px] text-[#68746B] dark:text-[#9EACA1] mb-1">
              <span>Sensation Duration</span>
              <span className="font-semibold text-[#252C28] dark:text-white tabular-nums">
                {durationMinutes} minutes
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="180"
              step="5"
              value={durationMinutes}
              onChange={e => setDurationMinutes(parseInt(e.target.value))}
              className="w-full accent-[#34483B]"
            />
          </div>

          {/* Relief Method Tried */}
          <div>
            <label className="block text-[11px] font-medium text-[#68746B] dark:text-[#9EACA1] mb-1">
              Relief Method Tried
            </label>
            <input
              type="text"
              value={remedyName}
              onChange={e => setRemedyName(e.target.value)}
              className="w-full h-9 px-3 text-xs rounded-xl bg-[#F3F4EF] dark:bg-[#1E2521] border border-[#D8DCD5] dark:border-[#333E37] text-[#252C28] dark:text-white focus:outline-hidden focus:border-[#91A995] mb-2"
              placeholder="e.g. 4-7-8 Breathing, P6 Acupressure, Horizon Gaze"
            />
            {/* Quick Chips */}
            <div className="flex flex-wrap gap-1 mb-2">
              {QUICK_REMEDIES.map((r, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRemedyName(r)}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-[#E4EBE2] dark:bg-[#34483B] text-[#34483B] dark:text-[#E4EBE2] hover:opacity-90 cursor-pointer"
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Rating */}
            <div className="flex items-center justify-between text-xs text-[#68746B] dark:text-[#9EACA1] pt-1">
              <span className="text-[11px]">Remedy Efficacy Rating:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRemedyRating(star)}
                    className="p-1 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        star <= remedyRating
                          ? 'text-[#C28B45] fill-[#C28B45]'
                          : 'text-[#D8DCD5] dark:text-[#333E37]'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Optional Notes */}
          <div>
            <label className="block text-[11px] font-medium text-[#68746B] dark:text-[#9EACA1] mb-1">
              Notes (Optional Context)
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Winding mountain road, sat in rear row"
              className="w-full h-9 px-3 text-xs rounded-xl bg-[#F3F4EF] dark:bg-[#1E2521] border border-[#D8DCD5] dark:border-[#333E37] text-[#252C28] dark:text-white focus:outline-hidden focus:border-[#91A995]"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="submit"
              className="flex-1 h-10 rounded-xl bg-[#34483B] hover:bg-[#2B3C31] text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              {editingId ? 'Update Symptom Entry' : 'Save Symptom Entry'}
            </button>
            <button
              type="button"
              onClick={handleResetForm}
              className="px-4 h-10 rounded-xl bg-[#E4EBE2] dark:bg-[#34483B] text-[#34483B] dark:text-[#E4EBE2] text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* 7. Symptom Log History Feed (View, Edit, Delete) */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#252C28] dark:text-white uppercase tracking-wider font-heading">
            Symptom Records ({filteredSymptoms.length})
          </h3>
          {onNavigate && (
            <button
              onClick={() => onNavigate('relief')}
              className="text-xs text-[#34483B] dark:text-[#91A995] font-semibold flex items-center gap-1 hover:underline cursor-pointer"
            >
              <Wind className="w-3.5 h-3.5" />
              <span>Offline Relief Guide</span>
            </button>
          )}
        </div>

        {filteredSymptoms.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#68746B] dark:text-[#9EACA1] bg-white dark:bg-[#242D28] rounded-2xl border border-[#D8DCD5] dark:border-[#333E37]">
            No symptoms recorded for this timeframe. Tap "Log Event" above to track your sensations.
          </div>
        ) : (
          filteredSymptoms.map(log => (
            <div
              key={log.id}
              className="p-3.5 rounded-2xl bg-white dark:bg-[#242D28] border border-[#D8DCD5] dark:border-[#333E37] shadow-2xs flex flex-col gap-2 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#E4EBE2] dark:bg-[#34483B] text-[#34483B] dark:text-[#E4EBE2] capitalize font-heading">
                    {log.transportType}
                  </span>
                  <span className="text-[11px] text-[#68746B] dark:text-[#9EACA1]">{log.timestamp}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      log.severity >= 7
                        ? 'bg-[#B65D5D]/15 text-[#B65D5D]'
                        : log.severity >= 4
                        ? 'bg-[#C28B45]/15 text-[#C28B45]'
                        : 'bg-[#557B61]/15 text-[#557B61]'
                    }`}
                  >
                    Severity {log.severity}/10
                  </span>

                  {/* Edit button */}
                  <button
                    onClick={() => handleStartEdit(log)}
                    className="text-[#68746B] hover:text-[#34483B] dark:hover:text-white p-1 rounded-md transition-colors cursor-pointer"
                    title="Edit log entry"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={() => onDeleteSymptom(log.id)}
                    className="text-[#68746B] hover:text-[#B65D5D] p-1 rounded-md transition-colors cursor-pointer"
                    title="Delete log entry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Symptoms tags */}
              <div className="flex flex-wrap gap-1 text-[11px]">
                {(log.symptoms || []).map((s, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-[#F3F4EF] dark:bg-[#1E2521] border border-[#D8DCD5] dark:border-[#333E37] text-[10px] text-[#252C28] dark:text-[#E4EBE2]"
                  >
                    {s}
                  </span>
                ))}
              </div>

              {/* Interventions tried */}
              {((log.interventions && log.interventions.length > 0) || log.reliefApplied) && (
                <div className="pt-1.5 border-t border-[#D8DCD5] dark:border-[#333E37] flex items-center justify-between text-[11px]">
                  <span className="text-[#68746B] dark:text-[#9EACA1] truncate max-w-[220px]">
                    Remedy: {log.interventions?.[0]?.name || log.reliefApplied}
                  </span>
                  <div className="flex items-center gap-0.5 text-[#C28B45]">
                    {Array.from({ length: log.interventions?.[0]?.effectiveRating || 4 }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-[#C28B45]" />
                    ))}
                  </div>
                </div>
              )}

              {log.notes && (
                <p className="text-[11px] text-[#68746B] dark:text-[#9EACA1] italic">
                  "{log.notes}"
                </p>
              )}
            </div>
          ))
        )}
      </section>
    </div>
  );
};
