import React, { useState, useEffect } from 'react';
import { ScreenType, UserProfile, JourneyRecord, SymptomLog, VisualCuesConfig, SensorReading } from './types';
import { StorageService } from './utils/storage';
import { sensorService } from './utils/sensors';
import { VisualCuesOverlay } from './components/travel/VisualCuesOverlay';
import { AndroidFrame } from './components/common/AndroidFrame';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { ExportModal } from './components/common/ExportModal';
import { LanguageSelectorModal } from './components/common/LanguageSelectorModal';
import { useLanguage } from './context/LanguageContext';

// Screens
import { SplashScreen } from './screens/SplashScreen';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { AuthScreen } from './screens/AuthScreen';
import { HomeScreen } from './screens/HomeScreen';
import { TravelModeScreen } from './screens/TravelModeScreen';
import { InstantReliefScreen } from './screens/InstantReliefScreen';
import { InsightsScreen } from './screens/InsightsScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { VoiceAssistantScreen } from './screens/VoiceAssistantScreen';
import { DrSolaChatScreen } from './screens/DrSolaChatScreen';
import { SymptomTrackerScreen } from './screens/SymptomTrackerScreen';
import { MapsExplorerScreen } from './screens/MapsExplorerScreen';
import { VestibularScienceScreen } from './screens/VestibularScienceScreen';
import { testConnection } from './services/firebase';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');
  const [profile, setProfile] = useState<UserProfile>(() => StorageService.getProfile());
  const [journeys, setJourneys] = useState<JourneyRecord[]>(() => StorageService.getJourneys());
  const [symptoms, setSymptoms] = useState<SymptomLog[]>(() => StorageService.getSymptoms());
  const [cuesConfig, setCuesConfig] = useState<VisualCuesConfig>(() => StorageService.getCuesConfig());
  const [sensorReading, setSensorReading] = useState<SensorReading>(() => sensorService.getReading());

  // UI preferences
  const [isFrameMode, setIsFrameMode] = useState<boolean>(true);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [reduceMotion, setReduceMotion] = useState<boolean>(() => {
    return profile.accessibility?.reduceMotion ?? false;
  });
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [showSafetyModal, setShowSafetyModal] = useState<boolean>(false);

  // Sync dark mode class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Sync reduce motion class
  useEffect(() => {
    if (reduceMotion) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
  }, [reduceMotion]);

  // Subscribe to sensors for cues overlay
  useEffect(() => {
    const unsub = sensorService.subscribe(reading => {
      setSensorReading(reading);
    });
    return () => unsub();
  }, []);

  const handleNavigate = (screen: ScreenType) => {
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddSymptom = (newLog: SymptomLog) => {
    const updated = StorageService.addSymptom(newLog);
    setSymptoms(updated);
  };

  const handleAddJourney = (newJourney: JourneyRecord) => {
    const updated = StorageService.addJourney(newJourney);
    setJourneys(updated);
  };

  const handleDeleteSymptom = (id: string) => {
    const updated = StorageService.deleteSymptom(id);
    setSymptoms(updated);
  };

  const handleUpdateSymptom = (updatedLog: SymptomLog) => {
    const updated = StorageService.updateSymptom(updatedLog);
    setSymptoms(updated);
  };

  const handleUpdateProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    StorageService.saveProfile(newProfile);
  };

  const handleToggleReduceMotion = () => {
    const nextVal = !reduceMotion;
    setReduceMotion(nextVal);
    const updatedProfile: UserProfile = {
      ...profile,
      accessibility: {
        ...(profile.accessibility || {
          highContrast: false,
          notificationsEnabled: true,
          audioChimesEnabled: true,
        }),
        reduceMotion: nextVal,
      },
    };
    handleUpdateProfile(updatedProfile);
  };

  const handleDataCleared = () => {
    setProfile(StorageService.getProfile());
    setJourneys(StorageService.getJourneys());
    setSymptoms(StorageService.getSymptoms());
    setCuesConfig(StorageService.getCuesConfig());
    setCurrentScreen('splash');
  };

  // Test Firebase connection on boot
  useEffect(() => {
    testConnection();
  }, []);

  const { t } = useLanguage();

  const getHeaderTitle = () => {
    switch (currentScreen) {
      case 'travel':
        return 'Smart Journey Mode';
      case 'tracker':
        return 'Symptom Tracker';
      case 'relief':
        return t('instant_relief', 'Offline Relief Guide');
      case 'insights':
        return t('motion_insights', 'Risk Estimator & Insights');
      case 'profile':
        return t('profile_settings', 'Profile & Settings');
      case 'voice':
        return t('voice_companion', 'Voice Companion');
      case 'chat':
        return t('dr_sola_ai', 'AI Relief Assistant');
      case 'maps':
        return t('rest_stops', 'Route & Rest Navigator');
      case 'science':
        return t('bioscience', 'Vestibular Science Lab');
      default:
        return undefined;
    }
  };

  return (
    <AndroidFrame
      isFrameMode={isFrameMode}
      onToggleFrame={() => setIsFrameMode(!isFrameMode)}
      onOpenExportModal={() => setIsExportModalOpen(true)}
      isDarkMode={isDarkMode}
      onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      onOpenPrivacyDisclaimer={() => setShowSafetyModal(true)}
      reduceMotion={reduceMotion}
      onToggleReduceMotion={handleToggleReduceMotion}
    >
      {/* Real-Time Visual Stabilization Cues Overlay */}
      {cuesConfig.enabled && (
        <VisualCuesOverlay
          config={cuesConfig}
          reading={sensorReading}
          interactiveMode={false}
          reduceMotion={reduceMotion}
        />
      )}

      {/* Top Header */}
      <Header
        currentScreen={currentScreen}
        onNavigate={handleNavigate}
        showBack={['voice', 'chat', 'maps', 'science'].includes(currentScreen)}
        onBack={() => handleNavigate('home')}
        title={getHeaderTitle()}
        onOpenPrivacyDisclaimer={() => setShowSafetyModal(true)}
      />

      {/* Screen Views */}
      <div className="flex-1 flex flex-col w-full relative">
        {currentScreen === 'splash' && (
          <SplashScreen
            onContinue={() => setCurrentScreen('onboarding')}
            onSkipToHome={() => {
              StorageService.setOnboarded(true);
              setCurrentScreen('home');
            }}
          />
        )}

        {currentScreen === 'onboarding' && (
          <OnboardingScreen
            onComplete={() => {
              StorageService.setOnboarded(true);
              setCurrentScreen('auth');
            }}
          />
        )}

        {currentScreen === 'auth' && (
          <AuthScreen
            onAuthSuccess={user => {
              setProfile(user);
              setCurrentScreen('home');
            }}
            onContinueAsGuest={() => setCurrentScreen('home')}
          />
        )}

        {currentScreen === 'home' && (
          <HomeScreen
            profile={profile}
            recentJourneys={journeys}
            onNavigate={handleNavigate}
            onAddSymptom={handleAddSymptom}
          />
        )}

        {currentScreen === 'travel' && (
          <TravelModeScreen
            onNavigate={handleNavigate}
            config={cuesConfig}
            onUpdateConfig={setCuesConfig}
            reduceMotion={reduceMotion}
            onAddJourney={handleAddJourney}
          />
        )}

        {currentScreen === 'tracker' && (
          <SymptomTrackerScreen
            symptoms={symptoms}
            onAddSymptom={handleAddSymptom}
            onUpdateSymptom={handleUpdateSymptom}
            onDeleteSymptom={handleDeleteSymptom}
            onNavigate={handleNavigate}
          />
        )}

        {currentScreen === 'relief' && (
          <InstantReliefScreen
            onNavigate={handleNavigate}
            reduceMotion={reduceMotion}
          />
        )}

        {currentScreen === 'insights' && (
          <InsightsScreen
            profile={profile}
            journeys={journeys}
            symptoms={symptoms}
            onAddSymptom={handleAddSymptom}
            onDeleteSymptom={handleDeleteSymptom}
          />
        )}

        {currentScreen === 'profile' && (
          <ProfileScreen
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            isDarkMode={isDarkMode}
            onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
            reduceMotion={reduceMotion}
            onToggleReduceMotion={handleToggleReduceMotion}
            onDataCleared={handleDataCleared}
            onNavigate={handleNavigate}
            symptoms={symptoms}
            journeys={journeys}
          />
        )}

        {currentScreen === 'voice' && (
          <VoiceAssistantScreen onNavigate={handleNavigate} />
        )}

        {currentScreen === 'chat' && (
          <DrSolaChatScreen
            onNavigate={handleNavigate}
            profile={profile}
            symptoms={symptoms}
            journeys={journeys}
          />
        )}

        {currentScreen === 'maps' && (
          <MapsExplorerScreen onNavigate={handleNavigate} />
        )}

        {currentScreen === 'science' && (
          <VestibularScienceScreen onNavigate={handleNavigate} />
        )}
      </div>

      {/* Fixed Bottom Navigation (5 Sections) */}
      <BottomNav
        currentScreen={currentScreen}
        onNavigate={handleNavigate}
      />

      {/* Codebase Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />

      {/* Indian Languages Selector Modal */}
      <LanguageSelectorModal />

      {/* Medical Safety Notice Modal */}
      {showSafetyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-[#242D28] rounded-3xl p-5 shadow-2xl border border-[#D8DCD5] dark:border-[#333E37] space-y-3 text-[#252C28] dark:text-[#F3F4EF] font-sans">
            <h3 className="text-base font-bold text-[#252C28] dark:text-white font-heading">
              AVYRA🕊️ Safety Notice
            </h3>
            <div className="text-xs text-[#68746B] dark:text-[#9EACA1] space-y-2 leading-relaxed">
              <p>
                AVYRA🕊️ is an intelligent travel comfort companion. It assists in reducing sensory conflict through visual focus guidance, paced breathing, and grounding adaptations.
              </p>
              <p>
                <strong>Not a Medical Device:</strong> AVYRA🕊️ does not diagnose, treat, prevent, or cure medical conditions. It never prescribes medications or dosages.
              </p>
              <p>
                <strong>Emergency care:</strong> If dizziness or nausea is sudden, severe, or accompanied by weakness, speech difficulties, or hearing loss, seek medical care immediately.
              </p>
            </div>
            <button
              onClick={() => setShowSafetyModal(false)}
              className="w-full h-11 rounded-xl bg-[#34483B] hover:bg-[#2B3C31] text-white font-semibold text-xs transition-colors cursor-pointer mt-2"
            >
              I Understand
            </button>
          </div>
        </div>
      )}
    </AndroidFrame>
  );
}
