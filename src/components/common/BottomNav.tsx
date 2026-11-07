import React from 'react';
import { Home, Compass, Activity, Stethoscope, User } from 'lucide-react';
import { ScreenType } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface BottomNavProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentScreen, onNavigate }) => {
  const { t } = useLanguage();

  // Hide on splash, onboarding, auth
  if (['splash', 'onboarding', 'auth'].includes(currentScreen)) return null;

  const navItems: { screen: ScreenType; label: string; icon: React.ElementType }[] = [
    { screen: 'home', label: t('nav_home', 'Home'), icon: Home },
    { screen: 'travel', label: 'Journey', icon: Compass },
    { screen: 'tracker', label: 'Tracker', icon: Activity },
    { screen: 'chat', label: 'AI Assistant', icon: Stethoscope },
    { screen: 'profile', label: t('nav_profile', 'Profile'), icon: User },
  ];

  return (
    <nav className="sticky bottom-0 z-30 w-full bg-white dark:bg-[#242D28] border-t border-[#D8DCD5] dark:border-[#333E37] px-2 py-1.5 flex items-center justify-around transition-colors">
      {navItems.map(item => {
        const Icon = item.icon;
        const isActive =
          currentScreen === item.screen ||
          (item.screen === 'tracker' && ['insights', 'analytics'].includes(currentScreen)) ||
          (item.screen === 'profile' && currentScreen === 'settings');

        return (
          <button
            key={item.screen}
            onClick={() => onNavigate(item.screen)}
            className={`flex flex-col items-center justify-center min-w-[56px] py-1 px-1.5 rounded-xl transition-all cursor-pointer ${
              isActive
                ? 'bg-[#E4EBE2] dark:bg-[#34483B] text-[#34483B] dark:text-[#E4EBE2]'
                : 'text-[#68746B] dark:text-[#9EACA1] hover:text-[#252C28] dark:hover:text-white'
            }`}
          >
            <Icon className="w-5 h-5 stroke-[1.8]" />
            <span className="text-[10px] font-medium tracking-tight mt-0.5 leading-none font-sans truncate max-w-[64px]">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
