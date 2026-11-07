import React, { useState } from 'react';
import {
  Compass,
  Wind,
  BarChart2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Clock,
  Navigation,
  Brain,
  MapPin,
  Stethoscope,
  Volume2,
  Activity,
  HeartPulse,
  ThumbsUp,
  AlertCircle,
} from 'lucide-react';
import { ScreenType, UserProfile, JourneyRecord, SymptomLog } from '../types';
import { SoundscapesBar } from '../components/travel/SoundscapesBar';
import { useLanguage } from '../context/LanguageContext';

interface HomeScreenProps {
  profile: UserProfile;
  recentJourneys: JourneyRecord[];
  onNavigate: (screen: ScreenType) => void;
  onAddSymptom?: (log: SymptomLog) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  profile,
  recentJourneys,
  onNavigate,
  onAddSymptom,
}) => {
  const { t } = useLanguage();
  const latestJourney = recentJourneys[0];
  const firstName = profile.name.split(' ')[0] || 'Traveler';

  // Quick symptom check-in state
  const [checkInDone, setCheckInDone] = useState<string | null>(null);

  // Greeting based on time
  const hour = new Date().getHours();
  const greeting = hour < 12 
    ? t('good_morning', 'Good morning') 
    : hour < 17 
      ? t('good_afternoon', 'Good afternoon') 
      : t('good_evening', 'Good evening');

  const handleQuickCheckIn = (symptom: string, severity: number) => {
    if (onAddSymptom) {
      const newLog: SymptomLog = {
        id: `sym_${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        transportType: 'car',
        severity,
        symptoms: [symptom],
        durationMinutes: 15,
        reliefApplied: 'Quick Home Check-In',
        notes: `Quick check-in recorded from Home dashboard (${symptom})`,
      };
      onAddSymptom(newLog);
    }
    setCheckInDone(symptom);
    setTimeout(() => setCheckInDone(null), 3500);
  };

  return (
    <div className="flex-1 w-full p-4 space-y-4 pb-8 text-[#252C28] dark:text-[#F3F4EF] font-sans">
      {/* 1. Header & Personalized Greeting */}
      <section className="pt-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-semibold text-[#68746B] dark:text-[#9EACA1] uppercase tracking-wider font-sans">
            {t('tagline', 'Breathe easy. Move freely')}
          </span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#E4EBE2] dark:bg-[#34483B] text-[#34483B] dark:text-[#E4EBE2] font-semibold font-sans">
            {profile.sensitivityLevel} Sensitivity
          </span>
        </div>

        <h2 className="text-2xl font-bold text-[#252C28] dark:text-white font-heading tracking-tight">
          {greeting}, {firstName}
        </h2>

        <p className="text-xs text-[#68746B] dark:text-[#9EACA1] mt-0.5 font-sans leading-relaxed">
          {t('welcome_subtitle', 'Breathe easy. Move freely. Your motion stabilization is ready.')}
        </p>
      </section>

      {/* 2. Primary Action: Prominent Start Journey Button (Smart Journey Mode) */}
      <section>
        <button
          onClick={() => onNavigate('travel')}
          className="w-full text-left p-5 rounded-2xl bg-[#34483B] hover:bg-[#2B3C31] text-white transition-all border border-[#34483B] flex flex-col justify-between h-44 cursor-pointer group shadow-xs"
        >
          <div className="flex items-center justify-between w-full">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#E4EBE2]">
              <Compass className="w-5 h-5 stroke-[1.8]" />
            </div>
            <span className="text-[11px] font-medium tracking-wide uppercase px-2.5 py-1 rounded-full bg-white/15 text-[#E4EBE2] font-sans">
              Smart Journey Mode
            </span>
          </div>

          <div>
            <h3 className="font-bold text-lg text-white font-heading leading-tight mb-1">
              Start Journey
            </h3>
            <p className="text-xs text-[#D8DCD5] font-sans leading-relaxed">
              Personalized comfort plan & real-time visual stabilization horizon for cars, buses, trains & flights
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#91A995] group-hover:text-white transition-colors font-sans">
            <span>Setup & Begin Journey</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2]" />
          </div>
        </button>
      </section>

      {/* 3. Quick Symptom Check-In Card (Immediate user feedback) */}
      <section className="p-4 rounded-2xl bg-white dark:bg-[#242D28] border border-[#D8DCD5] dark:border-[#333E37] space-y-2.5 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#34483B] dark:text-[#91A995]" />
            <h3 className="text-xs font-bold text-[#252C28] dark:text-white uppercase tracking-wider font-heading">
              Quick Symptom Check-In
            </h3>
          </div>
          <span className="text-[10px] text-[#68746B] dark:text-[#9EACA1]">
            1-Tap Sensation Log
          </span>
        </div>

        {checkInDone ? (
          <div className="p-3 rounded-xl bg-[#E4EBE2] dark:bg-[#34483B] flex items-center justify-between text-xs text-[#34483B] dark:text-[#E4EBE2]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#557B61] dark:text-[#91A995]" />
              <span>Recorded <strong>{checkInDone}</strong> to your Symptom Tracker</span>
            </div>
            <button
              onClick={() => onNavigate('relief')}
              className="text-[11px] font-bold underline cursor-pointer"
            >
              Open Relief
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-[11px] text-[#68746B] dark:text-[#9EACA1] leading-relaxed">
              How does your stomach and balance feel right now?
            </p>
            <div className="grid grid-cols-4 gap-1.5 text-xs">
              <button
                onClick={() => handleQuickCheckIn('Comfortable', 1)}
                className="py-2 px-1 rounded-xl bg-[#F3F4EF] dark:bg-[#1E2521] border border-[#D8DCD5] dark:border-[#333E37] hover:border-[#557B61] text-center flex flex-col items-center gap-0.5 cursor-pointer transition-colors"
              >
                <ThumbsUp className="w-3.5 h-3.5 text-[#557B61]" />
                <span className="text-[10px] font-semibold text-[#252C28] dark:text-white">Settled</span>
              </button>

              <button
                onClick={() => handleQuickCheckIn('Mild Nausea', 3)}
                className="py-2 px-1 rounded-xl bg-[#F3F4EF] dark:bg-[#1E2521] border border-[#D8DCD5] dark:border-[#333E37] hover:border-[#C28B45] text-center flex flex-col items-center gap-0.5 cursor-pointer transition-colors"
              >
                <AlertCircle className="w-3.5 h-3.5 text-[#C28B45]" />
                <span className="text-[10px] font-semibold text-[#252C28] dark:text-white">Mild Queasy</span>
              </button>

              <button
                onClick={() => handleQuickCheckIn('Dizziness', 5)}
                className="py-2 px-1 rounded-xl bg-[#F3F4EF] dark:bg-[#1E2521] border border-[#D8DCD5] dark:border-[#333E37] hover:border-[#C28B45] text-center flex flex-col items-center gap-0.5 cursor-pointer transition-colors"
              >
                <Compass className="w-3.5 h-3.5 text-[#C28B45]" />
                <span className="text-[10px] font-semibold text-[#252C28] dark:text-white">Dizzy</span>
              </button>

              <button
                onClick={() => handleQuickCheckIn('Headache / Fatigue', 6)}
                className="py-2 px-1 rounded-xl bg-[#F3F4EF] dark:bg-[#1E2521] border border-[#D8DCD5] dark:border-[#333E37] hover:border-[#B65D5D] text-center flex flex-col items-center gap-0.5 cursor-pointer transition-colors"
              >
                <HeartPulse className="w-3.5 h-3.5 text-[#B65D5D]" />
                <span className="text-[10px] font-semibold text-[#252C28] dark:text-white">Headache</span>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 4. Quick-Access Relief Section (Offline Relief Guide) */}
      <section>
        <button
          onClick={() => onNavigate('relief')}
          className="w-full text-left p-4 rounded-2xl bg-[#E4EBE2] dark:bg-[#29322D] hover:bg-[#DCE5DA] dark:hover:bg-[#344039] border border-[#D8DCD5] dark:border-[#38453D] transition-all flex items-center justify-between cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#34483B] flex items-center justify-center text-[#34483B] dark:text-[#E4EBE2] shrink-0 border border-[#D8DCD5] dark:border-[#38453D]">
              <Wind className="w-5 h-5 stroke-[1.8]" />
            </div>
            <div>
              <span className="font-bold text-sm text-[#252C28] dark:text-white font-heading block leading-tight">
                Offline Relief Guide
              </span>
              <span className="text-xs text-[#68746B] dark:text-[#9EACA1] font-sans mt-0.5 block">
                Guided 4-7-8 breathing, P6 acupressure & 100% offline somatic grounding
              </span>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#68746B] dark:text-[#9EACA1] group-hover:text-[#34483B] dark:group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
        </button>
      </section>

      {/* 5. Feature Quick-Access Grid (AI Relief Assistant, Rest Stops, BioScience) */}
      <section className="grid grid-cols-3 gap-2.5">
        <button
          onClick={() => onNavigate('chat')}
          className="p-3.5 rounded-2xl bg-white dark:bg-[#242D28] border border-[#D8DCD5] dark:border-[#333E37] hover:border-[#91A995] text-left flex flex-col justify-between h-28 transition-all cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-[#E4EBE2] dark:bg-[#34483B] text-[#34483B] dark:text-[#91A995] flex items-center justify-center">
            <Stethoscope className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-[#252C28] dark:text-white block leading-tight font-heading">
              AI Assistant
            </span>
            <span className="text-[10px] text-[#68746B] dark:text-[#9EACA1] block leading-none mt-0.5">
              Dr. Sola Companion
            </span>
          </div>
        </button>

        <button
          onClick={() => onNavigate('tracker')}
          className="p-3.5 rounded-2xl bg-white dark:bg-[#242D28] border border-[#D8DCD5] dark:border-[#333E37] hover:border-[#91A995] text-left flex flex-col justify-between h-28 transition-all cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-[#E4EBE2] dark:bg-[#34483B] text-[#34483B] dark:text-[#91A995] flex items-center justify-center">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-[#252C28] dark:text-white block leading-tight font-heading">
              Symptom Tracker
            </span>
            <span className="text-[10px] text-[#68746B] dark:text-[#9EACA1] block leading-none mt-0.5">
              Trend Analytics
            </span>
          </div>
        </button>

        <button
          onClick={() => onNavigate('insights')}
          className="p-3.5 rounded-2xl bg-white dark:bg-[#242D28] border border-[#D8DCD5] dark:border-[#333E37] hover:border-[#91A995] text-left flex flex-col justify-between h-28 transition-all cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-[#E4EBE2] dark:bg-[#34483B] text-[#34483B] dark:text-[#91A995] flex items-center justify-center">
            <BarChart2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-[#252C28] dark:text-white block leading-tight font-heading">
              Risk Estimator
            </span>
            <span className="text-[10px] text-[#68746B] dark:text-[#9EACA1] block leading-none mt-0.5">
              Explainable ML
            </span>
          </div>
        </button>
      </section>

      {/* 6. Soundscapes Bar */}
      <section>
        <SoundscapesBar />
      </section>

      {/* 7. Summary of Recent Travel Activity */}
      <section className="bg-white dark:bg-[#242D28] rounded-2xl p-4 border border-[#D8DCD5] dark:border-[#333E37]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-[#34483B] dark:text-[#91A995] stroke-[1.8]" />
            <h4 className="text-xs font-bold text-[#252C28] dark:text-white uppercase tracking-wider font-heading">
              {t('recent_journey', 'Recent Journey Summary')}
            </h4>
          </div>
          <button
            onClick={() => onNavigate('insights')}
            className="text-xs text-[#34483B] dark:text-[#91A995] font-semibold hover:underline font-sans cursor-pointer"
          >
            {t('all_insights', 'All Insights')}
          </button>
        </div>

        {latestJourney ? (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-[#252C28] dark:text-white font-sans capitalize">
                  {latestJourney.transportType} Ride: {latestJourney.origin || 'Trip'} → {latestJourney.destination || 'Destination'}
                </span>
                <span className="text-[11px] text-[#68746B] dark:text-[#9EACA1] block font-sans">
                  {latestJourney.date} · {latestJourney.durationMinutes} mins
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#E4EBE2] dark:bg-[#34483B] text-[#34483B] dark:text-[#E4EBE2] font-sans">
                Severity {latestJourney.actualSeverity ?? 3}/10
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-[#F3F4EF] dark:bg-[#1B221E] text-[11px] text-[#68746B] dark:text-[#9EACA1] flex items-center justify-between font-sans">
              <span>{t('visual_focus_cues', 'Visual Stabilization Cues')}:</span>
              <span className="font-semibold text-[#557B61] dark:text-[#91A995]">
                {latestJourney.usedTravelMode ? 'Active (Effective)' : 'Inactive'}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-[#68746B] dark:text-[#9EACA1] font-sans">
            No journeys recorded yet. Tap Start Journey on your next ride.
          </p>
        )}
      </section>

      {/* 8. Personal Travel Comfort Section (Learned Insights) */}
      <section className="bg-white dark:bg-[#242D28] rounded-2xl p-4 border border-[#D8DCD5] dark:border-[#333E37] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#34483B] dark:text-[#91A995] stroke-[1.8]" />
            <h4 className="text-xs font-bold text-[#252C28] dark:text-white uppercase tracking-wider font-heading">
              Personal Travel Comfort Insights
            </h4>
          </div>
          <span className="text-[11px] text-[#68746B] dark:text-[#9EACA1] font-sans">
            {profile.totalJourneys} trips logged
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="p-3 rounded-xl bg-[#F3F4EF] dark:bg-[#1B221E] border border-[#E4EBE2] dark:border-[#2D3831]">
            <span className="block text-2xl font-bold text-[#252C28] dark:text-white font-heading tabular-nums">
              {profile.reliefSuccessRate}%
            </span>
            <span className="block text-[11px] text-[#68746B] dark:text-[#9EACA1] font-sans mt-0.5">
              Comfort Success Rate
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#F3F4EF] dark:bg-[#1B221E] border border-[#E4EBE2] dark:border-[#2D3831]">
            <span className="block text-2xl font-bold text-[#34483B] dark:text-[#91A995] font-heading tabular-nums">
              {profile.triggers.length}
            </span>
            <span className="block text-[11px] text-[#68746B] dark:text-[#9EACA1] font-sans mt-0.5">
              Monitored Triggers
            </span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-[#E4EBE2]/50 dark:bg-[#34483B]/40 text-[11px] text-[#68746B] dark:text-[#D8DCD5] leading-relaxed">
          <strong>Observed Pattern:</strong> You report greatest travel comfort when seated forward near the window with steady fresh airflow and active horizon cues.
        </div>
      </section>
    </div>
  );
};
