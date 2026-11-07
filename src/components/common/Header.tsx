import React from 'react';
import { ArrowLeft, Mic, ShieldAlert, Stethoscope } from 'lucide-react';
import { ScreenType } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface HeaderProps {
  currentScreen: ScreenType;
  title?: string;
  onNavigate: (screen: ScreenType) => void;
  showBack?: boolean;
  onBack?: () => void;
  onOpenPrivacyDisclaimer?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  title,
  onNavigate,
  showBack = false,
  onBack,
  onOpenPrivacyDisclaimer,
}) => {
  const { t } = useLanguage();

  // If splash, onboarding, or auth, no header needed
  if (['splash', 'onboarding', 'auth'].includes(currentScreen)) return null;

  return (
    <header className="sticky top-0 z-30 h-14 bg-white/95 dark:bg-[#242D28]/95 backdrop-blur-xs px-3 sm:px-4 flex items-center justify-between border-b border-[#D8DCD5] dark:border-[#333E37] transition-colors">
      <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
        {showBack ? (
          <button
            onClick={onBack || (() => onNavigate('home'))}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#252C28] dark:text-[#E4EBE2] hover:bg-[#E4EBE2] dark:hover:bg-[#34483B] transition-colors cursor-pointer shrink-0"
            aria-label="Go Back"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2]" />
          </button>
        ) : (
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 group text-left cursor-pointer shrink-0"
          >
            <div className="w-7 h-7 rounded-lg bg-[#34483B] text-white flex items-center justify-center shrink-0">
              <span className="font-bold text-xs font-heading">A</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold tracking-tight text-[#252C28] dark:text-white block leading-tight font-heading truncate">
                {t('app_name', 'AVYRA🕊️')}
              </span>
              <span className="text-[10px] text-[#68746B] dark:text-[#9EACA1] hidden sm:block leading-none truncate">
                {t('tagline', 'Breathe easy. Move freely')}
              </span>
            </div>
          </button>
        )}

        {title && (
          <h1 className="text-xs sm:text-sm font-bold text-[#252C28] dark:text-[#F3F4EF] truncate ml-1 font-heading min-w-0">
            {title}
          </h1>
        )}
      </div>

      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        {/* Dr. Sola Shortcut */}
        <button
          onClick={() => onNavigate('chat')}
          className={`p-2 rounded-lg transition-colors cursor-pointer ${
            currentScreen === 'chat'
              ? 'bg-[#34483B] text-white'
              : 'text-[#68746B] dark:text-[#9EACA1] hover:bg-[#F3F4EF] dark:hover:bg-[#34483B]'
          }`}
          title="Dr. Sola AI Chat"
          aria-label="Open Dr. Sola"
        >
          <Stethoscope className="w-4 h-4 stroke-[1.8]" />
        </button>

        {/* Voice Assistant Shortcut */}
        <button
          onClick={() => onNavigate('voice')}
          className={`p-2 rounded-lg transition-colors cursor-pointer ${
            currentScreen === 'voice'
              ? 'bg-[#34483B] text-white'
              : 'text-[#68746B] dark:text-[#9EACA1] hover:bg-[#F3F4EF] dark:hover:bg-[#34483B]'
          }`}
          title="Voice Assistant"
          aria-label="Open Voice Assistant"
        >
          <Mic className="w-4 h-4 stroke-[1.8]" />
        </button>

        {/* Safety Disclaimer */}
        {onOpenPrivacyDisclaimer && (
          <button
            onClick={onOpenPrivacyDisclaimer}
            className="p-2 rounded-lg text-[#68746B] dark:text-[#9EACA1] hover:bg-[#F3F4EF] dark:hover:bg-[#34483B] transition-colors cursor-pointer"
            title="Safety Disclaimer"
            aria-label="Safety Disclaimer"
          >
            <ShieldAlert className="w-4 h-4 stroke-[1.8] text-[#C28B45]" />
          </button>
        )}
      </div>
    </header>
  );
};
