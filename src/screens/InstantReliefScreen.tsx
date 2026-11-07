import React, { useState, useEffect } from 'react';
import {
  Wind,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Compass,
  HandMetal,
  ThermometerSnowflake,
  ShieldCheck,
  RotateCcw,
  Eye,
  Check,
} from 'lucide-react';
import { ScreenType } from '../types';
import { audioController } from '../utils/audio';

interface InstantReliefScreenProps {
  onNavigate: (screen: ScreenType) => void;
  reduceMotion?: boolean;
}

export const InstantReliefScreen: React.FC<InstantReliefScreenProps> = ({
  onNavigate,
  reduceMotion = false,
}) => {
  const [activeTab, setActiveTab] = useState<'breathing' | 'grounding' | 'recommendations' | 'prep'>('breathing');
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Breathing state
  const [isBreathingActive, setIsBreathingActive] = useState(true);
  const [phase, setPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [secondsLeft, setSecondsLeft] = useState(4);
  const [cycles, setCycles] = useState(1);

  const spokenGuidance =
    "Take a slow breath. Rest your head firmly back against the headrest. Direct cool air toward your face. Look out toward the distant horizon, or gently close your eyes. Breathe in gently for four seconds, hold, and breathe out slowly.";

  // 4-7-8 breathing timer
  useEffect(() => {
    if (!isBreathingActive) return;

    const timer = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev > 1) {
          return prev - 1;
        }

        if (phase === 'Inhale') {
          setPhase('Hold');
          audioController.playHoldTone();
          audioController.vibrate([20, 40, 20]);
          return 7;
        } else if (phase === 'Hold') {
          setPhase('Exhale');
          audioController.playExhaleTone();
          audioController.vibrate(50);
          return 8;
        } else {
          setPhase('Inhale');
          setCycles(c => c + 1);
          audioController.playChime(432, 1.5);
          audioController.vibrate(40);
          return 4;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isBreathingActive, phase]);

  const handleToggleVoice = () => {
    if (isSpeaking) {
      audioController.stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      audioController.speakGuidance(spokenGuidance, () => setIsSpeaking(false));
    }
  };

  const handleResetBreath = () => {
    setPhase('Inhale');
    setSecondsLeft(4);
    setCycles(1);
    setIsBreathingActive(true);
  };

  return (
    <div className="flex-1 w-full min-h-full p-4 flex flex-col justify-between text-[#252C28] dark:text-[#F3F4EF] bg-[#F3F4EF] dark:bg-[#1B221E] transition-colors">
      <div className="space-y-3.5">
        {/* Top Header Card */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#242D28] border border-[#D8DCD5] dark:border-[#333E37]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-[#68746B] dark:text-[#9EACA1] uppercase tracking-wider font-sans">
              Instant Relief Protocol
            </span>
            <span className="text-xs text-[#557B61] dark:text-[#91A995] font-medium font-sans">
              Low Screen Gaze
            </span>
          </div>

          <h2 className="text-xl font-bold text-[#252C28] dark:text-white font-heading tracking-tight">
            Calm Your Motion Reflex
          </h2>

          <p className="text-xs text-[#68746B] dark:text-[#9EACA1] mt-1 font-sans leading-relaxed">
            Relax your posture, listen to audio instructions, and follow gentle breathing.
          </p>

          <button
            onClick={handleToggleVoice}
            className={`w-full mt-3 h-11 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold transition-all border cursor-pointer font-sans ${
              isSpeaking
                ? 'bg-[#34483B] text-white border-[#34483B]'
                : 'bg-[#E4EBE2] dark:bg-[#34483B] text-[#34483B] dark:text-[#E4EBE2] border-[#D8DCD5] dark:border-[#333E37]'
            }`}
          >
            {isSpeaking ? <VolumeX className="w-4 h-4 stroke-[1.8]" /> : <Volume2 className="w-4 h-4 stroke-[1.8]" />}
            <span>{isSpeaking ? 'Stop Spoken Voice Guide' : 'Play Spoken Voice Guide (Hands-Free)'}</span>
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex rounded-xl bg-[#E4EBE2] dark:bg-[#29322D] p-1 text-xs border border-[#D8DCD5] dark:border-[#38453D] font-sans">
          <button
            onClick={() => setActiveTab('breathing')}
            className={`flex-1 py-1.5 rounded-lg font-medium transition-all cursor-pointer text-center ${
              activeTab === 'breathing'
                ? 'bg-white dark:bg-[#34483B] text-[#252C28] dark:text-white shadow-xs'
                : 'text-[#68746B] dark:text-[#9EACA1]'
            }`}
          >
            Breathing
          </button>
          <button
            onClick={() => setActiveTab('grounding')}
            className={`flex-1 py-1.5 rounded-lg font-medium transition-all cursor-pointer text-center ${
              activeTab === 'grounding'
                ? 'bg-white dark:bg-[#34483B] text-[#252C28] dark:text-white shadow-xs'
                : 'text-[#68746B] dark:text-[#9EACA1]'
            }`}
          >
            Grounding
          </button>
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`flex-1 py-1.5 rounded-lg font-medium transition-all cursor-pointer text-center ${
              activeTab === 'recommendations'
                ? 'bg-white dark:bg-[#34483B] text-[#252C28] dark:text-white shadow-xs'
                : 'text-[#68746B] dark:text-[#9EACA1]'
            }`}
          >
            Comfort Tips
          </button>
          <button
            onClick={() => setActiveTab('prep')}
            className={`flex-1 py-1.5 rounded-lg font-medium transition-all cursor-pointer text-center ${
              activeTab === 'prep'
                ? 'bg-white dark:bg-[#34483B] text-[#252C28] dark:text-white shadow-xs'
                : 'text-[#68746B] dark:text-[#9EACA1]'
            }`}
          >
            Travel Prep
          </button>
        </div>

        {/* Tab 1: Guided Breathing (with Reduce Motion alternative) */}
        {activeTab === 'breathing' && (
          <div className="p-4 rounded-2xl bg-white dark:bg-[#242D28] border border-[#D8DCD5] dark:border-[#333E37] flex flex-col items-center text-center space-y-4">
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-semibold text-[#68746B] dark:text-[#9EACA1] uppercase tracking-wider font-sans">
                Cycle {cycles}
              </span>
              <button
                onClick={handleResetBreath}
                className="text-[#68746B] hover:text-[#252C28] dark:hover:text-white p-1 cursor-pointer"
                title="Reset Breathing"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Breathing Visualizer (Reduces motion if preferred) */}
            {reduceMotion ? (
              /* Reduce Motion Alternative: Static Step Indicator */
              <div className="w-full py-4 px-3 rounded-xl bg-[#F3F4EF] dark:bg-[#1B221E] border border-[#D8DCD5] dark:border-[#333E37] space-y-2">
                <span className="text-xs font-semibold text-[#68746B] dark:text-[#9EACA1] block">
                  Accessible Paced Step:
                </span>
                <div className="text-2xl font-bold text-[#34483B] dark:text-[#E4EBE2] font-heading">
                  {phase}: {secondsLeft} seconds
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                  <div className={`p-2 rounded-lg ${phase === 'Inhale' ? 'bg-[#34483B] text-white font-bold' : 'bg-white dark:bg-[#242D28] text-[#68746B]'}`}>
                    1. Inhale (4s)
                  </div>
                  <div className={`p-2 rounded-lg ${phase === 'Hold' ? 'bg-[#34483B] text-white font-bold' : 'bg-white dark:bg-[#242D28] text-[#68746B]'}`}>
                    2. Hold (7s)
                  </div>
                  <div className={`p-2 rounded-lg ${phase === 'Exhale' ? 'bg-[#34483B] text-white font-bold' : 'bg-white dark:bg-[#242D28] text-[#68746B]'}`}>
                    3. Exhale (8s)
                  </div>
                </div>
              </div>
            ) : (
              /* Subtle Breathing Circle Animation */
              <div className="relative w-44 h-44 flex items-center justify-center my-2">
                <div
                  className={`w-36 h-36 rounded-full bg-[#E4EBE2] dark:bg-[#34483B] border border-[#91A995] flex flex-col items-center justify-center transition-transform duration-1000 ease-in-out ${
                    phase === 'Inhale' ? 'scale-115' : phase === 'Hold' ? 'scale-110' : 'scale-90'
                  }`}
                >
                  <span className="text-xs font-bold text-[#34483B] dark:text-[#E4EBE2] uppercase tracking-wider font-sans mb-1">
                    {phase}
                  </span>
                  <span className="text-3xl font-extrabold text-[#252C28] dark:text-white tabular-nums font-heading">
                    {secondsLeft}s
                  </span>
                </div>
              </div>
            )}

            <div>
              <p className="text-xs font-semibold text-[#252C28] dark:text-white font-sans">
                {phase === 'Inhale'
                  ? 'Breathe in softly through your nose'
                  : phase === 'Hold'
                  ? 'Hold your breath gently without strain'
                  : 'Exhale slowly through relaxed lips'}
              </p>
              <p className="text-[11px] text-[#68746B] dark:text-[#9EACA1] mt-1 font-sans">
                4-7-8 breathing stimulates the vagus nerve and suppresses gastric motion distress.
              </p>
            </div>

            <button
              onClick={() => setIsBreathingActive(!isBreathingActive)}
              className="px-5 py-2 rounded-xl bg-[#34483B] hover:bg-[#2B3C31] text-white text-xs font-semibold flex items-center gap-2 cursor-pointer font-sans"
            >
              {isBreathingActive ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isBreathingActive ? 'Pause Exercise' : 'Resume Exercise'}</span>
            </button>
          </div>
        )}

        {/* Tab 2: Grounding Techniques */}
        {activeTab === 'grounding' && (
          <div className="space-y-2.5">
            <div className="p-3.5 rounded-xl bg-white dark:bg-[#242D28] border border-[#D8DCD5] dark:border-[#333E37]">
              <span className="font-bold text-xs text-[#252C28] dark:text-white block mb-1 font-heading">
                5-4-3-2-1 Sensory Grounding
              </span>
              <p className="text-[11px] text-[#68746B] dark:text-[#9EACA1] font-sans leading-relaxed">
                Re-orient your mind outward to interrupt the dizziness cycle:
              </p>
              <ul className="text-[11px] text-[#252C28] dark:text-[#E4EBE2] space-y-1 mt-2 font-sans">
                <li>• <strong>5 things you see:</strong> distant horizon, clouds, trees.</li>
                <li>• <strong>4 things you feel:</strong> seat beneath you, cool air, feet on floor.</li>
                <li>• <strong>3 sounds:</strong> steady engine hum, air vent, distant road.</li>
                <li>• <strong>2 breaths:</strong> slow inhale, long relaxing exhale.</li>
                <li>• <strong>1 positive:</strong> reminding yourself "This sensation will pass."</li>
              </ul>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-[#242D28] border border-[#D8DCD5] dark:border-[#333E37]">
              <span className="font-bold text-xs text-[#252C28] dark:text-white block mb-1 font-heading">
                Headrest Stabilizing Posture
              </span>
              <p className="text-[11px] text-[#68746B] dark:text-[#9EACA1] font-sans leading-relaxed">
                Press the back of your head firmly into the seat headrest. Keep your chin slightly lifted and avoid nodding or turning your neck during corners.
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Simple Comfort Recommendations */}
        {activeTab === 'recommendations' && (
          <div className="space-y-2.5">
            <div className="p-3.5 rounded-xl bg-white dark:bg-[#242D28] border border-[#D8DCD5] dark:border-[#333E37] flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#E4EBE2] dark:bg-[#34483B] flex items-center justify-center text-[#34483B] dark:text-[#E4EBE2] shrink-0">
                <HandMetal className="w-4 h-4 stroke-[1.8]" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-[#252C28] dark:text-white block mb-0.5 font-heading">
                  P6 (Nei Guan) Acupressure
                </span>
                <p className="text-[11px] text-[#68746B] dark:text-[#9EACA1] font-sans leading-relaxed">
                  Place three fingers across your inner wrist from the crease. Press your thumb firmly into the center groove between the two flexor tendons for 2–3 minutes.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-[#242D28] border border-[#D8DCD5] dark:border-[#333E37] flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#E4EBE2] dark:bg-[#34483B] flex items-center justify-center text-[#34483B] dark:text-[#E4EBE2] shrink-0">
                <ThermometerSnowflake className="w-4 h-4 stroke-[1.8]" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-[#252C28] dark:text-white block mb-0.5 font-heading">
                  Cool Direct Airflow
                </span>
                <p className="text-[11px] text-[#68746B] dark:text-[#9EACA1] font-sans leading-relaxed">
                  Open your air vent fully and direct it straight toward your forehead. Cooling skin temperature lowers parasympathetic nausea reflexes within 60 seconds.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-[#242D28] border border-[#D8DCD5] dark:border-[#333E37] flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#E4EBE2] dark:bg-[#34483B] flex items-center justify-center text-[#34483B] dark:text-[#E4EBE2] shrink-0">
                <Compass className="w-4 h-4 stroke-[1.8]" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-[#252C28] dark:text-white block mb-0.5 font-heading">
                  Distant Horizon Fixation
                </span>
                <p className="text-[11px] text-[#68746B] dark:text-[#9EACA1] font-sans leading-relaxed">
                  Avoid looking at phones or printed text. Pick a distant landmark on the true horizon straight through the front windshield.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Offline Travel Prep & Mild Symptoms Guide */}
        {activeTab === 'prep' && (
          <div className="space-y-3">
            {/* Offline Guarantee Banner */}
            <div className="p-3 rounded-xl bg-[#E4EBE2] dark:bg-[#2A372E] border border-[#C5D3C2] dark:border-[#3D4F42] flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#34483B] dark:text-[#91A995] shrink-0" />
              <p className="text-[11px] text-[#34483B] dark:text-[#D8DCD5] font-sans leading-tight">
                <strong>100% Offline Guide:</strong> All instructions, timer vibrations, and synthesizer tones run locally without internet or cellular connectivity.
              </p>
            </div>

            {/* Travel Preparation Tips */}
            <div className="p-3.5 rounded-xl bg-white dark:bg-[#242D28] border border-[#D8DCD5] dark:border-[#333E37] space-y-2">
              <span className="font-bold text-xs text-[#252C28] dark:text-white block font-heading">
                Pre-Departure Preparation
              </span>
              <ul className="text-[11px] text-[#68746B] dark:text-[#9EACA1] font-sans space-y-1.5 leading-relaxed">
                <li className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#557B61] dark:text-[#91A995] shrink-0 mt-0.5" />
                  <span><strong>Light Meal 60–90 min prior:</strong> Opt for dry crackers, bananas, or toast. Avoid high-grease, acidic citrus, and spicy meals that slow gastric emptying.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#557B61] dark:text-[#91A995] shrink-0 mt-0.5" />
                  <span><strong>Hydrate with Plain Water:</strong> Sip cool flat water. Avoid fizzy carbonated sodas or alcohol which increase vestibular sensitivity.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#557B61] dark:text-[#9EACA1] shrink-0 mt-0.5" />
                  <span><strong>Choose the Axis of Minimal Motion:</strong> Car (front passenger seat), Bus (front axle), Train (forward-facing window), Flight (over-wing rows), Boat (midship low deck).</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#557B61] dark:text-[#9EACA1] shrink-0 mt-0.5" />
                  <span><strong>Stabilize Head Movement:</strong> Adjust headrest snugly so your skull has continuous tactile support during turns and braking.</span>
                </li>
              </ul>
            </div>

            {/* Managing Mild Symptoms */}
            <div className="p-3.5 rounded-xl bg-white dark:bg-[#242D28] border border-[#D8DCD5] dark:border-[#333E37] space-y-2">
              <span className="font-bold text-xs text-[#252C28] dark:text-white block font-heading">
                Managing Early Mild Symptoms
              </span>
              <ul className="text-[11px] text-[#68746B] dark:text-[#9EACA1] font-sans space-y-1.5 leading-relaxed">
                <li className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#557B61] dark:text-[#91A995] shrink-0 mt-0.5" />
                  <span><strong>First Yawn or Warmth:</strong> The very first symptom is often excessive yawning or mild skin flushing. Intervene immediately before nausea sets in.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#557B61] dark:text-[#91A995] shrink-0 mt-0.5" />
                  <span><strong>Cease Screen Viewing Instantly:</strong> Looking down at a phone creates severe visual-vestibular sensory conflict. Stow devices immediately.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#557B61] dark:text-[#91A995] shrink-0 mt-0.5" />
                  <span><strong>Recline 20–30 Degrees:</strong> Tilting back relaxes abdominal tension and aligns the inner ear canals with the vehicle's vector of travel.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#557B61] dark:text-[#91A995] shrink-0 mt-0.5" />
                  <span><strong>Cool Air & Peppermint:</strong> Maximize airflow across the bridge of your nose and forehead. Inhale natural peppermint or ginger lozenge aroma if available.</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Medical Note */}
      <div className="pt-3 text-center">
        <p className="text-[10px] text-[#68746B] dark:text-[#9EACA1] font-sans">
          MotionEase provides non-medicinal behavioral comfort strategies. For severe persistent symptoms, seek medical advice.
        </p>
      </div>
    </div>
  );
};
