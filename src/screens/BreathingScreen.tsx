import React, { useState, useEffect } from 'react';
import { Wind, Play, Pause, RotateCcw, Volume2, VolumeX, CheckCircle2, ArrowLeft } from 'lucide-react';
import { ScreenType } from '../types';
import { audioController } from '../utils/audio';

interface BreathingScreenProps {
  onBack: () => void;
  onNavigate: (screen: ScreenType) => void;
}

type Technique = '4-7-8' | 'box' | 'calm';

export const BreathingScreen: React.FC<BreathingScreenProps> = ({ onBack, onNavigate }) => {
  const [technique, setTechnique] = useState<Technique>('4-7-8');
  const [isActive, setIsActive] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale' | 'hold_post'>('inhale');
  const [secondsLeft, setSecondsLeft] = useState(4);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);

  // Technique timing specs in seconds
  const specs = {
    '4-7-8': { inhale: 4, hold: 7, exhale: 8, hold_post: 0 },
    box: { inhale: 4, hold: 4, exhale: 4, hold_post: 4 },
    calm: { inhale: 5, hold: 0, exhale: 5, hold_post: 0 },
  };

  const currentSpec = specs[technique];

  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev > 1) {
          return prev - 1;
        }

        // Transition to next phase
        let nextPhase: typeof phase = 'inhale';
        let nextSeconds = 4;

        if (phase === 'inhale') {
          if (currentSpec.hold > 0) {
            nextPhase = 'hold';
            nextSeconds = currentSpec.hold;
            if (soundEnabled) audioController.playHoldTone();
            audioController.vibrate([30, 50, 30]);
          } else {
            nextPhase = 'exhale';
            nextSeconds = currentSpec.exhale;
            if (soundEnabled) audioController.playExhaleTone();
            audioController.vibrate(60);
          }
        } else if (phase === 'hold') {
          nextPhase = 'exhale';
          nextSeconds = currentSpec.exhale;
          if (soundEnabled) audioController.playExhaleTone();
          audioController.vibrate(60);
        } else if (phase === 'exhale') {
          if (currentSpec.hold_post > 0) {
            nextPhase = 'hold_post';
            nextSeconds = currentSpec.hold_post;
            if (soundEnabled) audioController.playHoldTone();
          } else {
            nextPhase = 'inhale';
            nextSeconds = currentSpec.inhale;
            setCyclesCompleted(c => c + 1);
            if (soundEnabled) audioController.playChime(432, 1.8);
            audioController.vibrate(50);
          }
        } else if (phase === 'hold_post') {
          nextPhase = 'inhale';
          nextSeconds = currentSpec.inhale;
          setCyclesCompleted(c => c + 1);
          if (soundEnabled) audioController.playChime(432, 1.8);
          audioController.vibrate(50);
        }

        setPhase(nextPhase);
        return nextSeconds;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, phase, currentSpec, soundEnabled]);

  // Initial chime on mount
  useEffect(() => {
    if (soundEnabled) {
      audioController.playChime(432, 1.5);
    }
  }, []);

  const handleReset = () => {
    setPhase('inhale');
    setSecondsLeft(currentSpec.inhale);
    setCyclesCompleted(0);
    setIsActive(true);
  };

  const getPhaseInstruction = () => {
    switch (phase) {
      case 'inhale':
        return 'Inhale gently through nose';
      case 'hold':
        return 'Hold breath calmly';
      case 'exhale':
        return 'Exhale slowly through lips';
      case 'hold_post':
        return 'Rest lungs naturally';
    }
  };

  // Determine scale for orb animation
  const isExpanding = phase === 'inhale';
  const isHolding = phase === 'hold' || phase === 'hold_post';
  const orbScale = isExpanding ? 'scale-125' : isHolding ? 'scale-120' : 'scale-90';

  return (
    <div className="flex-1 w-full min-h-full p-4 flex flex-col justify-between text-slate-800 dark:text-slate-100 bg-[#FBFBF9] dark:bg-slate-950 overflow-hidden">
      {/* 1. Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white py-1 px-2 -ml-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Breathing</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Audio Chime Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border text-xs transition-colors ${
              soundEnabled
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
            title="Toggle Audio Bell Chimes"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={handleReset}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition-colors"
            title="Reset Counter"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Technique Segmented Bar */}
      <div className="flex rounded-xl bg-slate-200/80 dark:bg-slate-800 p-1 text-xs">
        {(['4-7-8', 'box', 'calm'] as const).map(t => (
          <button
            key={t}
            onClick={() => {
              setTechnique(t);
              setPhase('inhale');
              setSecondsLeft(specs[t].inhale);
            }}
            className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
              technique === t
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {t === '4-7-8' ? '4-7-8 Relax' : t === 'box' ? 'Box Breath' : 'Deep 5-5'}
          </button>
        ))}
      </div>

      {/* 3. Center Animated Breathing Orb */}
      <div className="my-auto flex flex-col items-center justify-center text-center py-6">
        <div className="relative w-64 h-64 flex items-center justify-center">
          {/* Subtle outer ripple aura */}
          <div
            className={`absolute inset-0 rounded-full transition-all duration-1000 ease-in-out ${
              phase === 'inhale'
                ? 'bg-emerald-400/20 scale-115'
                : phase === 'hold'
                ? 'bg-teal-400/25 scale-110'
                : 'bg-emerald-500/10 scale-95'
            }`}
          />

          {/* Main Breathing Orb */}
          <div
            className={`w-48 h-48 rounded-full shadow-2xl transition-transform duration-1000 ease-out flex flex-col items-center justify-center text-white ${orbScale} ${
              phase === 'inhale'
                ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-emerald-600/30'
                : phase === 'hold' || phase === 'hold_post'
                ? 'bg-gradient-to-tr from-teal-700 to-cyan-600 shadow-teal-700/30'
                : 'bg-gradient-to-tr from-emerald-800 to-teal-700 shadow-emerald-900/30'
            }`}
          >
            <span className="text-[11px] font-bold tracking-widest uppercase opacity-90 mb-1">
              {phase === 'hold_post' ? 'HOLD' : phase.toUpperCase()}
            </span>

            <span className="text-4xl font-extrabold tabular-nums tracking-tight">
              {secondsLeft}s
            </span>

            <span className="text-[10px] opacity-80 mt-1">
              Cycle {cyclesCompleted + 1}
            </span>
          </div>
        </div>

        <h3 className="text-base font-bold text-slate-900 dark:text-white mt-6 tracking-tight">
          {getPhaseInstruction()}
        </h3>

        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mt-1">
          {technique === '4-7-8'
            ? 'The slow long exhale activates your natural relaxation response to ease nausea.'
            : technique === 'box'
            ? 'Even rhythmic breathing helps calm your heart rate and steady your body.'
            : 'Smooth continuous belly breathing keeps your stomach relaxed.'}
        </p>
      </div>

      {/* 4. Bottom Controls */}
      <div className="space-y-3 pb-2">
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setIsActive(!isActive)}
            className="w-40 h-12 rounded-xl bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20 active:scale-[0.98] transition-all cursor-pointer"
          >
            {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isActive ? 'Pause Breathing' : 'Resume Breathing'}</span>
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
          <span>{cyclesCompleted} Cycles Completed</span>
          <span>·</span>
          <span>Haptics Active</span>
        </div>
      </div>
    </div>
  );
};
