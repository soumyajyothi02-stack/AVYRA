import React from 'react';
import { Smartphone, Monitor, Code2, Moon, Sun, ShieldAlert, Sparkles, EyeOff } from 'lucide-react';

interface AndroidFrameProps {
  children: React.ReactNode;
  isFrameMode: boolean;
  onToggleFrame: () => void;
  onOpenExportModal: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenPrivacyDisclaimer: () => void;
  reduceMotion?: boolean;
  onToggleReduceMotion?: () => void;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  children,
  isFrameMode,
  onToggleFrame,
  onOpenExportModal,
  isDarkMode,
  onToggleDarkMode,
  onOpenPrivacyDisclaimer,
  reduceMotion = false,
  onToggleReduceMotion,
}) => {
  const timeStr = '09:41';

  return (
    <div
      className={`min-h-screen bg-[#1F2622] flex flex-col items-center justify-start text-[#252C28] dark:text-[#F3F4EF] ${
        reduceMotion ? 'reduce-motion' : ''
      }`}
    >
      {/* Top Utility Bar (Clean & Minimal) */}
      <header className="w-full max-w-7xl mx-auto px-4 py-2 flex items-center justify-between border-b border-[#2E3832] text-xs text-[#D8DCD5]">
        <div className="flex items-center gap-3">
          <span className="font-bold tracking-tight text-white text-sm font-heading flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#91A995]" />
            AVYRA🕊️
          </span>
          <span className="text-[#68746B] hidden sm:inline">|</span>
          <span className="text-[#D8DCD5] hidden sm:inline text-[11px] font-sans">
            Breathe easy. Move freely
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Reduce Motion Shortcut */}
          {onToggleReduceMotion && (
            <button
              onClick={onToggleReduceMotion}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                reduceMotion
                  ? 'bg-[#34483B] text-white border border-[#91A995]'
                  : 'bg-[#29322D] hover:bg-[#343F39] text-[#D8DCD5]'
              }`}
              title="Toggle Reduce Motion for comfort"
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span className="hidden md:inline">
                {reduceMotion ? 'Reduce Motion: ON' : 'Reduce Motion'}
              </span>
            </button>
          )}

          {/* Code & Architecture Modal */}
          <button
            onClick={onOpenExportModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#34483B] hover:bg-[#3D5445] text-white font-medium transition-colors border border-[#91A995]/40 cursor-pointer"
            title="Inspect Flutter & Python Architecture & Code"
          >
            <Code2 className="w-3.5 h-3.5 text-[#91A995]" />
            <span>Codebase</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-1.5 rounded-lg bg-[#29322D] hover:bg-[#343F39] text-[#D8DCD5] transition-colors cursor-pointer"
            title={isDarkMode ? 'Switch to Light theme' : 'Switch to Dark theme'}
            aria-label="Toggle Theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-[#C28B45]" /> : <Moon className="w-4 h-4 text-[#91A995]" />}
          </button>

          {/* Frame Mode Toggle */}
          <button
            onClick={onToggleFrame}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#29322D] hover:bg-[#343F39] text-[#D8DCD5] transition-colors cursor-pointer"
            title={isFrameMode ? 'Expand to Full Canvas' : 'Android Mobile Frame'}
          >
            {isFrameMode ? (
              <>
                <Monitor className="w-3.5 h-3.5 text-[#91A995]" />
                <span className="hidden sm:inline">Expanded</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-[#91A995]" />
                <span className="hidden sm:inline">Mobile Frame</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Screen Container */}
      <main className="w-full flex-1 flex items-center justify-center p-0 sm:p-4 md:p-6 overflow-hidden">
        {isFrameMode ? (
          /* Realistic Android Phone Device Shell */
          <div className="relative w-full max-w-[400px] h-[860px] max-h-[96vh] bg-[#1B221E] rounded-[44px] p-2.5 shadow-2xl shadow-black/60 border-[5px] border-[#34483B]/80 flex flex-col overflow-hidden">
            {/* Front Camera Punch Hole */}
            <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-black border border-[#2E3832] z-50 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-[#1F2622]" />
            </div>

            {/* Inner Phone Screen */}
            <div className="relative flex-1 w-full h-full bg-[#F3F4EF] dark:bg-[#1B221E] rounded-[34px] overflow-hidden flex flex-col text-[#252C28] dark:text-[#F3F4EF] transition-colors">
              {/* Android Status Bar */}
              <div className="h-7 w-full px-5 pt-1 flex items-center justify-between text-[11px] font-medium tracking-tight text-[#68746B] dark:text-[#9EACA1] z-40 select-none bg-transparent">
                <span className="tabular-nums font-semibold font-sans">{timeStr}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-semibold text-[#557B61] dark:text-[#91A995]">5G</span>
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 4C7.31 4 3.07 5.9 0 8.98L12 21 24 8.98C20.93 5.9 16.69 4 12 4zm0 2.5c3.84 0 7.34 1.48 9.98 3.92L12 18.38 2.02 10.42C4.66 7.98 8.16 6.5 12 6.5z" />
                  </svg>
                  <div className="w-4.5 h-2.5 border border-current rounded-xs p-0.5 flex items-center">
                    <div className="w-full h-full bg-current rounded-xs" />
                  </div>
                </div>
              </div>

              {/* Scrollable Screen Content */}
              <div className="flex-1 w-full overflow-y-auto overflow-x-hidden relative flex flex-col">
                {children}
              </div>

              {/* Android Gesture Bar */}
              <div className="h-3.5 w-full flex items-center justify-center bg-transparent z-40 select-none pb-0.5">
                <div className="w-24 h-1 bg-[#D8DCD5] dark:bg-[#333E37] rounded-full" />
              </div>
            </div>
          </div>
        ) : (
          /* Expanded Responsive View for wide screens */
          <div className="w-full max-w-4xl h-[92vh] bg-[#F3F4EF] dark:bg-[#1B221E] rounded-2xl shadow-xl overflow-hidden flex flex-col border border-[#D8DCD5] dark:border-[#333E37] transition-colors">
            <div className="flex-1 w-full overflow-y-auto overflow-x-hidden relative flex flex-col">
              {children}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
