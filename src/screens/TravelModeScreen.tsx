import React, { useState, useEffect } from 'react';
import {
  Compass,
  Play,
  Pause,
  SlidersHorizontal,
  Square,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Wind,
  Info,
  Car,
  Ship,
  Plane,
  Bus,
  Train,
  CheckCircle2,
  Calendar,
  Sparkles,
  ShieldCheck,
  Edit3,
  Coffee,
  Smartphone,
  ChevronRight,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';
import { SensorReading, VisualCuesConfig, ScreenType, TransportType, SeatingPosition, JourneyRecord } from '../types';
import { sensorService } from '../utils/sensors';
import { StorageService } from '../utils/storage';
import { audioController } from '../utils/audio';

interface TravelModeScreenProps {
  onNavigate: (screen: ScreenType) => void;
  config: VisualCuesConfig;
  onUpdateConfig: (newConfig: VisualCuesConfig) => void;
  reduceMotion?: boolean;
  onAddJourney?: (journey: JourneyRecord) => void;
}

export const TravelModeScreen: React.FC<TravelModeScreenProps> = ({
  onNavigate,
  config,
  onUpdateConfig,
  reduceMotion = false,
  onAddJourney,
}) => {
  // Mode selection: 'live' (active tracking) vs 'plan' (comfort plan) vs 'setup' (trip setup)
  const [viewMode, setViewMode] = useState<'live' | 'plan' | 'setup'>('live');

  // Journey setup state
  const [transportType, setTransportType] = useState<TransportType>('car');
  const [durationMinutes, setDurationMinutes] = useState<number>(45);
  const [seatingPosition, setSeatingPosition] = useState<SeatingPosition>('front');
  const [isTravelingNow, setIsTravelingNow] = useState<boolean>(true);
  const [previousExperience, setPreviousExperience] = useState<'none' | 'mild' | 'frequent' | 'severe'>('mild');
  const [currentSymptoms, setCurrentSymptoms] = useState<string[]>([]);
  const [comfortPlan, setComfortPlan] = useState<any | null>(null);
  const [loadingPlan, setLoadingPlan] = useState<boolean>(false);

  // Live sensor & timer states
  const [reading, setReading] = useState<SensorReading>(sensorService.getReading());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [ambientSoundActive, setAmbientSoundActive] = useState(false);
  const [journeyEndedNotice, setJourneyEndedNotice] = useState(false);

  // Subscribe to sensors & timer
  useEffect(() => {
    sensorService.start();
    const unsubscribe = sensorService.subscribe(newReading => {
      setReading(newReading);
    });

    const timer = setInterval(() => {
      if (!isPaused && viewMode === 'live') {
        setElapsedSeconds(s => s + 1);
      }
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(timer);
    };
  }, [isPaused, viewMode]);

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggleSound = () => {
    const active = audioController.toggleSoothingNoise();
    setAmbientSoundActive(active);
  };

  const handleEndJourney = () => {
    setIsPaused(true);
    setJourneyEndedNotice(true);

    // Save journey to persistent storage
    const newRecord: JourneyRecord = {
      id: `jrn_${Date.now()}`,
      date: new Date().toISOString().substring(0, 10),
      transportType,
      durationMinutes: Math.max(1, Math.round(elapsedSeconds / 60)),
      origin: 'Current Route',
      destination: 'Waypoint Destination',
      actualSeverity: currentSymptoms.length > 0 ? 4 : 2,
      usedTravelMode: true,
      remediesUsed: ['Visual Stabilization Cues', 'Paced Breathing'],
      notes: `Completed ${transportType} ride with active stabilization cues.`,
    };
    if (onAddJourney) {
      onAddJourney(newRecord);
    } else {
      StorageService.addJourney(newRecord);
    }

    setTimeout(() => {
      setJourneyEndedNotice(false);
      onNavigate('home');
    }, 1400);
  };

  // Generate personalized comfort plan
  const handleGeneratePlan = async () => {
    setLoadingPlan(true);
    try {
      const res = await fetch('/api/journey/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transportType,
          durationMinutes,
          seatingPosition,
          timing: isTravelingNow ? 'now' : 'future',
          previousExperience,
          currentSymptoms,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setComfortPlan(data.plan);
      } else {
        throw new Error('API plan generation failed');
      }
    } catch {
      // Deterministic client fallback plan
      setComfortPlan({
        preparationTips: [
          'Eat a light, non-greasy snack (banana, crackers, or oatmeal) 30 minutes before travel.',
          'Stay hydrated with cool, non-carbonated water.',
          'Rest your head firmly back against the seat headrest to minimize head pitch and roll accelerations.',
        ],
        seatingConsiderations: [
          seatingPosition === 'back'
            ? 'Back seats experience up to 40% more rotational sway. If possible, move to the front passenger seat.'
            : 'Front or window seating provides a clear view of the distant stationary horizon.',
          'Position yourself facing forward in the direction of vehicle movement.',
        ],
        hydrationFoodReminders: [
          'Sip cool water or ginger tea every 20-30 minutes.',
          'Avoid heavy, acidic meals or reading small text on an empty stomach.',
        ],
        screenUseSuggestions: [
          'Avoid reading books or scrolling feeds on handheld phones while moving.',
          'If viewing navigation, hold the phone up at eye level against the road horizon or switch to audio guidance.',
        ],
        breathingExercises: [
          'Practice 4-7-8 rhythmic breathing: breathe in quietly for 4 seconds, hold for 7 seconds, exhale slowly for 8 seconds.',
          'Apply firm pressure to the P6 acupressure point 3 finger-widths above your inner wrist crease.',
        ],
        generalGuidance: [
          'Aim cool fresh airflow directly across your forehead and upper lip to calm autonomic responses.',
          'Never claim or assume symptoms will be completely eliminated; rest whenever needed.',
        ],
        disclaimer: 'This personalized travel plan offers supportive non-medical comfort guidance. It does not guarantee total prevention of motion discomfort.',
      });
    } finally {
      setLoadingPlan(false);
      setViewMode('plan');
    }
  };

  const simModes: { id: SensorReading['motionState']; label: string; icon: React.ElementType }[] = [
    { id: 'curved_road', label: 'Car Winding', icon: Car },
    { id: 'braking', label: 'City Traffic', icon: Bus },
    { id: 'heavy_swells', label: 'Boat Swells', icon: Ship },
    { id: 'turbulence', label: 'Turbulence', icon: Plane },
    { id: 'smooth_cruising', label: 'Smooth Rail', icon: Train },
  ];

  return (
    <div className="flex-1 w-full min-h-full p-4 flex flex-col justify-between text-[#252C28] dark:text-[#F3F4EF] bg-[#F3F4EF] dark:bg-[#1B221E] transition-colors font-sans">
      <div className="space-y-3.5">
        {/* Navigation Sub-Tabs */}
        <div className="flex p-1 rounded-xl bg-white dark:bg-[#242D28] border border-[#D8DCD5] dark:border-[#333E37] text-xs">
          <button
            onClick={() => setViewMode('live')}
            className={`flex-1 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              viewMode === 'live'
                ? 'bg-[#34483B] text-white shadow-xs'
                : 'text-[#68746B] dark:text-[#9EACA1] hover:text-[#252C28] dark:hover:text-white'
            }`}
          >
            Live Tracking
          </button>
          <button
            onClick={() => {
              if (!comfortPlan) handleGeneratePlan();
              setViewMode('plan');
            }}
            className={`flex-1 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              viewMode === 'plan'
                ? 'bg-[#34483B] text-white shadow-xs'
                : 'text-[#68746B] dark:text-[#9EACA1] hover:text-[#252C28] dark:hover:text-white'
            }`}
          >
            Comfort Plan
          </button>
          <button
            onClick={() => setViewMode('setup')}
            className={`flex-1 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              viewMode === 'setup'
                ? 'bg-[#34483B] text-white shadow-xs'
                : 'text-[#68746B] dark:text-[#9EACA1] hover:text-[#252C28] dark:hover:text-white'
            }`}
          >
            Trip Setup
          </button>
        </div>

        {/* VIEW 1: LIVE TRAVEL TRACKING */}
        {viewMode === 'live' && (
          <div className="space-y-3.5">
            {/* 1. Journey Timer & Clean Status Indicator */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#242D28] border border-[#D8DCD5] dark:border-[#333E37]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-[#68746B] dark:text-[#9EACA1] uppercase tracking-wider font-sans">
                  Active Journey Duration
                </span>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${isPaused ? 'bg-[#C28B45]' : 'bg-[#557B61] animate-pulse'}`} />
                  <span className="text-xs font-semibold text-[#557B61] dark:text-[#91A995] font-sans capitalize">
                    {isPaused ? 'Session Paused' : reading.motionState.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-[#252C28] dark:text-white tabular-nums font-heading tracking-tight">
                  {formatTime(elapsedSeconds)}
                </span>

                {/* Pause & End Journey Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleSound}
                    className={`p-2.5 rounded-xl border text-xs transition-colors cursor-pointer ${
                      ambientSoundActive
                        ? 'bg-[#34483B] text-white border-[#34483B]'
                        : 'bg-[#F3F4EF] dark:bg-[#1B221E] text-[#68746B] dark:text-[#9EACA1] border-[#D8DCD5] dark:border-[#333E37]'
                    }`}
                    title="Toggle Soothing Sound"
                  >
                    {ambientSoundActive ? <Volume2 className="w-4 h-4 stroke-[1.8]" /> : <VolumeX className="w-4 h-4 stroke-[1.8]" />}
                  </button>

                  <button
                    onClick={() => setIsPaused(!isPaused)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isPaused
                        ? 'bg-[#34483B] text-white'
                        : 'bg-[#E4EBE2] dark:bg-[#34483B] text-[#34483B] dark:text-white border border-[#D8DCD5] dark:border-[#333E37]'
                    }`}
                  >
                    {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
                    <span>{isPaused ? 'Resume' : 'Pause'}</span>
                  </button>

                  <button
                    onClick={handleEndJourney}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#F3F4EF] dark:bg-[#1B221E] hover:bg-[#E4EBE2] text-[#68746B] dark:text-[#D8DCD5] border border-[#D8DCD5] dark:border-[#333E37] flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Square className="w-3.5 h-3.5" />
                    <span>End</span>
                  </button>
                </div>
              </div>

              {journeyEndedNotice && (
                <p className="text-xs text-[#557B61] mt-2 font-medium font-sans">
                  Journey saved. Redirecting to Insights...
                </p>
              )}
            </div>

            {/* 2. Live Accelerometer and Gyroscope Readings */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 rounded-xl bg-white dark:bg-[#242D28] border border-[#D8DCD5] dark:border-[#333E37]">
                <span className="block text-[10px] text-[#68746B] dark:text-[#9EACA1] uppercase font-semibold font-sans">
                  Pitch (Front/Back)
                </span>
                <span className="text-sm font-bold text-[#252C28] dark:text-white font-heading tabular-nums">
                  {reading.pitch}°
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-[#242D28] border border-[#D8DCD5] dark:border-[#333E37]">
                <span className="block text-[10px] text-[#68746B] dark:text-[#9EACA1] uppercase font-semibold font-sans">
                  Roll (Side Tilt)
                </span>
                <span className="text-sm font-bold text-[#252C28] dark:text-white font-heading tabular-nums">
                  {reading.roll}°
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-[#242D28] border border-[#D8DCD5] dark:border-[#333E37]">
                <span className="block text-[10px] text-[#68746B] dark:text-[#9EACA1] uppercase font-semibold font-sans">
                  Acceleration
                </span>
                <span className="text-sm font-bold text-[#34483B] dark:text-[#91A995] font-heading tabular-nums">
                  {((reading.totalG ?? Math.sqrt(reading.accelX ** 2 + reading.accelY ** 2 + reading.accelZ ** 2) / 9.8)).toFixed(2)}g
                </span>
              </div>
            </div>

            {/* 3. Visual Focus Guidance Controls */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#242D28] border border-[#D8DCD5] dark:border-[#333E37] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-[#252C28] dark:text-white uppercase tracking-wider font-heading">
                    Visual Stabilization Cues
                  </h3>
                  <p className="text-[11px] text-[#68746B] dark:text-[#9EACA1] font-sans">
                    Subtle screen boundary cues syncing eyes with vehicle inertia
                  </p>
                </div>

                <button
                  onClick={() => {
                    const next = !config.enabled;
                    onUpdateConfig({ ...config, enabled: next });
                    StorageService.saveCuesConfig({ ...config, enabled: next });
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    config.enabled
                      ? 'bg-[#34483B] text-white'
                      : 'bg-[#F3F4EF] dark:bg-[#1B221E] text-[#68746B] dark:text-[#9EACA1] border border-[#D8DCD5] dark:border-[#333E37]'
                  }`}
                >
                  {config.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>{config.enabled ? 'Cues Active' : 'Cues Off'}</span>
                </button>
              </div>
            </div>

            {/* 4. Motion Dynamics Simulator */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#242D28] border border-[#D8DCD5] dark:border-[#333E37] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#252C28] dark:text-white uppercase tracking-wider font-heading">
                  Vehicle Dynamics Simulation
                </span>
                <span className="text-[10px] text-[#68746B] dark:text-[#9EACA1]">
                  Test sensor responsiveness
                </span>
              </div>

              <div className="grid grid-cols-5 gap-1.5">
                {simModes.map(m => {
                  const Icon = m.icon;
                  const isSelected = reading.motionState === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => sensorService.setSimulationMode(m.id)}
                      className={`py-2 px-1 rounded-xl text-center flex flex-col items-center justify-center transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#34483B] text-white'
                          : 'bg-[#F3F4EF] dark:bg-[#1B221E] text-[#68746B] dark:text-[#9EACA1] hover:bg-[#E4EBE2] border border-[#D8DCD5] dark:border-[#333E37]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 mb-1 stroke-[1.8]" />
                      <span className="text-[9px] font-medium leading-tight font-sans truncate max-w-full">
                        {m.label.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5. Medical Safety & Disclaimer Note */}
            <div className="p-3 rounded-xl bg-[#E4EBE2]/60 dark:bg-[#2A342E] border border-[#D8DCD5] dark:border-[#38453D] flex items-start gap-2.5">
              <Info className="w-4 h-4 text-[#34483B] dark:text-[#91A995] shrink-0 mt-0.5" />
              <p className="text-[11px] text-[#68746B] dark:text-[#9EACA1] font-sans leading-relaxed">
                <strong>Medical Notice:</strong> Sensor readings track physical device orientation and acceleration only. They do not directly diagnose motion sickness or guarantee symptom prevention.
              </p>
            </div>
          </div>
        )}

        {/* VIEW 2: PERSONALISED TRAVEL COMFORT PLAN */}
        {viewMode === 'plan' && (
          <div className="space-y-3.5">
            <div className="p-4 rounded-2xl bg-white dark:bg-[#242D28] border border-[#D8DCD5] dark:border-[#333E37] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#D8DCD5] dark:border-[#333E37]">
                <div>
                  <h3 className="text-base font-bold text-[#252C28] dark:text-white font-heading">
                    Personalized Travel Comfort Plan
                  </h3>
                  <span className="text-[11px] text-[#68746B] dark:text-[#9EACA1]">
                    Tailored for: {transportType.toUpperCase()} · {durationMinutes} mins · {seatingPosition} seat
                  </span>
                </div>
                <button
                  onClick={() => setViewMode('setup')}
                  className="px-2.5 py-1 rounded-lg bg-[#E4EBE2] dark:bg-[#34483B] text-[#34483B] dark:text-[#E4EBE2] text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Setup</span>
                </button>
              </div>

              {loadingPlan ? (
                <div className="py-8 text-center text-xs text-[#68746B] dark:text-[#9EACA1]">
                  Generating personalized comfort guidance...
                </div>
              ) : (
                <div className="space-y-3.5">
                  {/* Preparation Tips */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-[#34483B] dark:text-[#91A995] uppercase tracking-wider block">
                      1. Pre-Departure Preparation
                    </span>
                    <ul className="text-xs text-[#252C28] dark:text-[#E4EBE2] space-y-1 list-disc pl-4 leading-relaxed">
                      {(comfortPlan?.preparationTips || [
                        'Eat a light, bland snack 30-45 minutes before departure.',
                        'Hydrate with cool water; avoid carbonated or acidic drinks.',
                        'Rest your head firmly back against the seat headrest.',
                      ]).map((tip: string, i: number) => (
                        <li key={i}>{tip}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Seating Considerations */}
                  <div className="space-y-1.5 pt-2 border-t border-[#D8DCD5] dark:border-[#333E37]">
                    <span className="text-xs font-bold text-[#34483B] dark:text-[#91A995] uppercase tracking-wider block">
                      2. Seating Considerations
                    </span>
                    <ul className="text-xs text-[#252C28] dark:text-[#E4EBE2] space-y-1 list-disc pl-4 leading-relaxed">
                      {(comfortPlan?.seatingConsiderations || [
                        'Keep your eyes fixed forward on the distant horizon rather than looking sideways at moving objects.',
                        'Sit in the front passenger seat or mid-cabin to minimize rotational sway.',
                      ]).map((tip: string, i: number) => (
                        <li key={i}>{tip}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Hydration & Food */}
                  <div className="space-y-1.5 pt-2 border-t border-[#D8DCD5] dark:border-[#333E37]">
                    <span className="text-xs font-bold text-[#34483B] dark:text-[#91A995] uppercase tracking-wider block">
                      3. Hydration & Nutrition
                    </span>
                    <ul className="text-xs text-[#252C28] dark:text-[#E4EBE2] space-y-1 list-disc pl-4 leading-relaxed">
                      {(comfortPlan?.hydrationFoodReminders || [
                        'Sip cool water or ginger tea every 20-30 minutes.',
                        'Avoid heavy foods or skipping meals completely.',
                      ]).map((tip: string, i: number) => (
                        <li key={i}>{tip}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Screen Use */}
                  <div className="space-y-1.5 pt-2 border-t border-[#D8DCD5] dark:border-[#333E37]">
                    <span className="text-xs font-bold text-[#34483B] dark:text-[#91A995] uppercase tracking-wider block">
                      4. Screen-Use Guidelines
                    </span>
                    <ul className="text-xs text-[#252C28] dark:text-[#E4EBE2] space-y-1 list-disc pl-4 leading-relaxed">
                      {(comfortPlan?.screenUseSuggestions || [
                        'Avoid reading books or scrolling feeds on handheld screens while in motion.',
                        'Hold navigation devices high at eye level to keep the horizon in your peripheral view.',
                      ]).map((tip: string, i: number) => (
                        <li key={i}>{tip}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Breathing & Acupressure */}
                  <div className="space-y-1.5 pt-2 border-t border-[#D8DCD5] dark:border-[#333E37]">
                    <span className="text-xs font-bold text-[#34483B] dark:text-[#91A995] uppercase tracking-wider block">
                      5. Somatic & Relaxation Exercises
                    </span>
                    <ul className="text-xs text-[#252C28] dark:text-[#E4EBE2] space-y-1 list-disc pl-4 leading-relaxed">
                      {(comfortPlan?.breathingExercises || [
                        '4-7-8 Breathing: Inhale quietly for 4s, hold for 7s, exhale slowly for 8s.',
                        'Firmly press the P6 Nei Guan acupressure point 3 finger-widths above wrist crease.',
                      ]).map((tip: string, i: number) => (
                        <li key={i}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div className="pt-2">
                <button
                  onClick={() => setViewMode('live')}
                  className="w-full h-11 rounded-xl bg-[#34483B] hover:bg-[#2B3C31] text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <span>Start Live Tracking Mode</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: COMPLETE TRIP SETUP FORM */}
        {viewMode === 'setup' && (
          <form
            onSubmit={e => {
              e.preventDefault();
              handleGeneratePlan();
            }}
            className="p-4 rounded-2xl bg-white dark:bg-[#242D28] border border-[#D8DCD5] dark:border-[#333E37] space-y-3.5"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#D8DCD5] dark:border-[#333E37]">
              <div>
                <h3 className="text-sm font-bold text-[#252C28] dark:text-white font-heading">
                  Smart Journey Setup
                </h3>
                <span className="text-[11px] text-[#68746B] dark:text-[#9EACA1]">
                  Personalize your trip guidance before or during travel
                </span>
              </div>
            </div>

            {/* Transport type */}
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
                    className={`py-2 rounded-xl capitalize transition-colors cursor-pointer ${
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

            {/* Journey Duration */}
            <div>
              <div className="flex items-center justify-between text-[11px] text-[#68746B] dark:text-[#9EACA1] mb-1">
                <span>Journey Duration</span>
                <span className="font-bold text-[#252C28] dark:text-white tabular-nums">
                  {durationMinutes} minutes ({Math.floor(durationMinutes / 60)}h {durationMinutes % 60}m)
                </span>
              </div>
              <input
                type="range"
                min="15"
                max="300"
                step="15"
                value={durationMinutes}
                onChange={e => setDurationMinutes(parseInt(e.target.value))}
                className="w-full accent-[#34483B]"
              />
            </div>

            {/* Seating Position */}
            <div>
              <label className="block text-[11px] font-medium text-[#68746B] dark:text-[#9EACA1] mb-1">
                Seating Position
              </label>
              <div className="grid grid-cols-5 gap-1.5 text-[11px]">
                {(['front', 'window', 'aisle', 'middle', 'back'] as SeatingPosition[]).map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSeatingPosition(s)}
                    className={`py-1.5 rounded-xl capitalize transition-colors cursor-pointer ${
                      seatingPosition === s
                        ? 'bg-[#34483B] text-white font-semibold'
                        : 'bg-[#F3F4EF] dark:bg-[#1E2521] text-[#68746B] dark:text-[#9EACA1] border border-[#D8DCD5] dark:border-[#333E37]'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Timing: Traveling now or planning future */}
            <div>
              <label className="block text-[11px] font-medium text-[#68746B] dark:text-[#9EACA1] mb-1">
                Travel Timing
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setIsTravelingNow(true)}
                  className={`py-2 px-3 rounded-xl font-medium transition-colors cursor-pointer ${
                    isTravelingNow
                      ? 'bg-[#34483B] text-white'
                      : 'bg-[#F3F4EF] dark:bg-[#1E2521] text-[#68746B] dark:text-[#9EACA1] border border-[#D8DCD5] dark:border-[#333E37]'
                  }`}
                >
                  Travelling Now
                </button>
                <button
                  type="button"
                  onClick={() => setIsTravelingNow(false)}
                  className={`py-2 px-3 rounded-xl font-medium transition-colors cursor-pointer ${
                    !isTravelingNow
                      ? 'bg-[#34483B] text-white'
                      : 'bg-[#F3F4EF] dark:bg-[#1E2521] text-[#68746B] dark:text-[#9EACA1] border border-[#D8DCD5] dark:border-[#333E37]'
                  }`}
                >
                  Planning Future Trip
                </button>
              </div>
            </div>

            {/* Previous Experience */}
            <div>
              <label className="block text-[11px] font-medium text-[#68746B] dark:text-[#9EACA1] mb-1">
                Previous Motion Sickness Experience
              </label>
              <div className="grid grid-cols-4 gap-1.5 text-[11px]">
                {(['none', 'mild', 'frequent', 'severe'] as const).map(lvl => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setPreviousExperience(lvl)}
                    className={`py-1.5 rounded-xl capitalize transition-colors cursor-pointer ${
                      previousExperience === lvl
                        ? 'bg-[#34483B] text-white font-semibold'
                        : 'bg-[#F3F4EF] dark:bg-[#1E2521] text-[#68746B] dark:text-[#9EACA1] border border-[#D8DCD5] dark:border-[#333E37]'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Current Symptoms */}
            <div>
              <label className="block text-[11px] font-medium text-[#68746B] dark:text-[#9EACA1] mb-1.5">
                Current Sensations (if any)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {['Nausea', 'Dizziness', 'Headache', 'Sweating', 'Fatigue'].map(sym => {
                  const isSelected = currentSymptoms.includes(sym);
                  return (
                    <button
                      key={sym}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setCurrentSymptoms(currentSymptoms.filter(s => s !== sym));
                        } else {
                          setCurrentSymptoms([...currentSymptoms, sym]);
                        }
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#34483B] text-white font-medium'
                          : 'bg-[#F3F4EF] dark:bg-[#1E2521] text-[#68746B] dark:text-[#9EACA1] border border-[#D8DCD5] dark:border-[#333E37]'
                      }`}
                    >
                      {sym}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-11 rounded-xl bg-[#34483B] hover:bg-[#2B3C31] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#91A995]" />
              <span>Generate Travel Comfort Plan</span>
            </button>
          </form>
        )}
      </div>

      {/* 6. Bottom Emergency Shortcut */}
      <div className="pt-4">
        <button
          onClick={() => onNavigate('relief')}
          className="w-full h-12 rounded-xl bg-[#34483B] hover:bg-[#2B3C31] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer font-sans"
        >
          <Wind className="w-4 h-4" />
          <span>Need Immediate Relief? Open Guided Breathing</span>
        </button>
      </div>
    </div>
  );
};
