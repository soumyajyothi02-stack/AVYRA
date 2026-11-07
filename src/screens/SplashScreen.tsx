import React, { useEffect } from 'react';
import { Compass, ArrowRight } from 'lucide-react';

interface SplashScreenProps {
  onContinue: () => void;
  onSkipToHome?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onContinue, onSkipToHome }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onContinue();
    }, 3800);
    return () => clearTimeout(timer);
  }, [onContinue]);

  return (
    <div className="relative flex-1 w-full min-h-full flex flex-col items-center justify-between p-6 bg-[#F3F4EF] dark:bg-[#1B221E] text-[#252C28] dark:text-[#F3F4EF] select-none transition-colors">
      {/* Top Header */}
      <div className="w-full flex items-center justify-between pt-3 z-10">
        <span className="text-xs text-[#68746B] dark:text-[#9EACA1] font-semibold tracking-wider font-sans uppercase">
          Motion Wellness
        </span>
        {onSkipToHome && (
          <button
            onClick={onSkipToHome}
            className="text-xs text-[#68746B] dark:text-[#9EACA1] hover:text-[#252C28] dark:hover:text-white px-2 py-1 font-sans cursor-pointer"
          >
            Skip Intro
          </button>
        )}
      </div>

      {/* Center Branding & Tagline */}
      <div className="flex flex-col items-center text-center my-auto z-10 max-w-sm">
        <div className="w-20 h-20 rounded-2xl bg-[#34483B] flex items-center justify-center text-white mb-6 border border-[#91A995]/40 shadow-sm">
          <Compass className="w-9 h-9 stroke-[1.8] text-[#E4EBE2]" />
        </div>

        <h1 className="text-3xl font-extrabold text-[#252C28] dark:text-white font-heading tracking-tight mb-2">
          AVYRA🕊️
        </h1>

        <p className="text-sm font-semibold text-[#34483B] dark:text-[#91A995] font-sans mb-3 tracking-wide">
          Breathe easy. Move freely
        </p>

        <p className="text-xs text-[#68746B] dark:text-[#9EACA1] leading-relaxed px-4 font-sans max-w-xs">
          A minimalist travel wellness companion with real-time visual stabilization cues, guided breathing, and motion risk insights.
        </p>
      </div>

      {/* Bottom Action Area */}
      <div className="w-full max-w-xs z-10 pb-4 flex flex-col items-center gap-3">
        <button
          onClick={onContinue}
          className="w-full h-12 rounded-xl bg-[#34483B] hover:bg-[#2B3C31] text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer font-sans transition-all"
        >
          <span>Get Started</span>
          <ArrowRight className="w-4 h-4 stroke-[2]" />
        </button>

        <span className="text-[11px] text-[#68746B] dark:text-[#9EACA1] font-sans">
          Minimal · Sensor Stabilized · Offline Capable
        </span>
      </div>
    </div>
  );
};
