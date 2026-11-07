import React, { useState, useEffect } from 'react';
import {
  User,
  Sliders,
  EyeOff,
  Moon,
  Sun,
  Bell,
  Volume2,
  Download,
  Trash2,
  ShieldAlert,
  AlertTriangle,
  Lock,
  Check,
  Globe,
  ChevronRight,
  LogIn,
  LogOut,
  Cloud,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { UserProfile, ScreenType, SymptomLog, JourneyRecord } from '../types';
import { StorageService } from '../utils/storage';
import { useLanguage } from '../context/LanguageContext';
import { auth, signInWithGoogle, signOutUser } from '../services/firebase';
import { type User as FirebaseUser } from 'firebase/auth';

interface ProfileScreenProps {
  profile: UserProfile;
  onUpdateProfile: (newProfile: UserProfile) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  reduceMotion: boolean;
  onToggleReduceMotion: () => void;
  onDataCleared: () => void;
  onNavigate?: (screen: ScreenType) => void;
  symptoms?: SymptomLog[];
  journeys?: JourneyRecord[];
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  profile,
  onUpdateProfile,
  isDarkMode,
  onToggleDarkMode,
  reduceMotion,
  onToggleReduceMotion,
  onDataCleared,
  onNavigate,
  symptoms = [],
  journeys = [],
}) => {
  const { languageObj, openLanguageModal, t } = useLanguage();
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(auth.currentUser);
  const [sensitivityScore, setSensitivityScore] = useState(profile.sensitivityScore);
  const [notifications, setNotifications] = useState(true);
  const [audioChimes, setAudioChimes] = useState(true);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(u => {
      setCurrentUser(u);
    });
    return () => unsub();
  }, []);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [exportNotice, setExportNotice] = useState(false);

  // Learned Comfort Profile Metrics
  const symptomCounts: Record<string, number> = {};
  symptoms.forEach(log => {
    (log.symptoms || []).forEach(sym => {
      symptomCounts[sym] = (symptomCounts[sym] || 0) + 1;
    });
  });
  const learnedTopSymptom =
    Object.keys(symptomCounts).length > 0
      ? Object.entries(symptomCounts).sort((a, b) => b[1] - a[1])[0][0]
      : 'Nausea / Queasy';

  const transportCounts: Record<string, { count: number; sumSeverity: number }> = {};
  symptoms.forEach(log => {
    const tType = log.transportType || 'car';
    if (!transportCounts[tType]) transportCounts[tType] = { count: 0, sumSeverity: 0 };
    transportCounts[tType].count += 1;
    transportCounts[tType].sumSeverity += log.severity;
  });
  const learnedHighestTransport =
    Object.keys(transportCounts).length > 0
      ? Object.entries(transportCounts).sort(
          (a, b) => b[1].sumSeverity / b[1].count - a[1].sumSeverity / a[1].count
        )[0][0]
      : 'Winding Bus';

  const remedyRatings: Record<string, number> = {};
  symptoms.forEach(log => {
    (log.interventions || []).forEach(int => {
      if (int.effectiveRating >= 3) {
        remedyRatings[int.name] = (remedyRatings[int.name] || 0) + int.effectiveRating;
      }
    });
  });
  const learnedTopRemedy =
    Object.keys(remedyRatings).length > 0
      ? Object.entries(remedyRatings).sort((a, b) => b[1] - a[1])[0][0]
      : '4-7-8 Breathing';

  const severityTrendText =
    symptoms.length >= 2
      ? symptoms[0].severity <= symptoms[symptoms.length - 1].severity
        ? `Improving (-${Math.abs(symptoms[symptoms.length - 1].severity - symptoms[0].severity)} pts)`
        : 'Stable'
      : 'Baseline Establishing';

  const handleScoreChange = (score: number) => {
    setSensitivityScore(score);
    let level: UserProfile['sensitivityLevel'] = 'Low';
    if (score >= 75) level = 'Severe';
    else if (score >= 50) level = 'High';
    else if (score >= 25) level = 'Moderate';

    const updated: UserProfile = {
      ...profile,
      sensitivityScore: score,
      sensitivityLevel: level,
    };
    onUpdateProfile(updated);
    StorageService.saveProfile(updated);
  };

  const handleExportData = () => {
    StorageService.exportAllData();
    setExportNotice(true);
    setTimeout(() => setExportNotice(false), 3000);
  };

  const handleConfirmDelete = () => {
    StorageService.clearAllData();
    setShowDeleteModal(false);
    onDataCleared();
  };

  return (
    <div className="flex-1 w-full min-h-full p-4 space-y-4 pb-8 text-[#252C28] dark:text-[#F3F4EF] bg-[#F3F4EF] dark:bg-[#1B221E] transition-colors font-sans">
      {/* 1. Profile Header Card */}
      <section className="p-4 rounded-2xl bg-white dark:bg-[#242D28] border border-[#D8DCD5] dark:border-[#333E37] space-y-3">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#34483B] text-white flex items-center justify-center text-lg font-bold font-heading">
            {profile.name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#252C28] dark:text-white truncate font-heading">
                {profile.name}
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E4EBE2] dark:bg-[#34483B] text-[#34483B] dark:text-[#E4EBE2] font-semibold">
                {profile.sensitivityLevel}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-medium text-[#34483B] dark:text-[#91A995]">
                @{profile.username || profile.email.split('@')[0]}
              </span>
              <span className="text-xs text-[#68746B] dark:text-[#9EACA1]">•</span>
              <span className="text-xs text-[#68746B] dark:text-[#9EACA1] truncate">{profile.email}</span>
            </div>
            <span className="text-[11px] text-[#68746B] dark:text-[#9EACA1] block mt-0.5">
              Member since {profile.createdAt} · {profile.totalJourneys} trips logged
            </span>
          </div>
        </div>

        {/* Cloud Sync State & Sign In Controls */}
        <div className="pt-3 border-t border-[#D8DCD5] dark:border-[#333E37] space-y-2.5">
          {currentUser ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#E4EBE2] dark:bg-[#34483B] flex items-center justify-center text-[#557B61] dark:text-[#91A995]">
                  <ShieldCheck className="w-3.5 h-3.5 stroke-[2]" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-[#252C28] dark:text-white block leading-tight">
                    Signed in to Firebase Cloud
                  </span>
                  <span className="text-[10px] text-[#68746B] dark:text-[#9EACA1] block truncate max-w-[200px]">
                    {currentUser.email || currentUser.displayName}
                  </span>
                </div>
              </div>
              <button
                onClick={async () => {
                  await signOutUser();
                }}
                className="px-2.5 py-1 rounded-lg border border-[#D8DCD5] dark:border-[#333E37] hover:bg-[#F3F4EF] dark:hover:bg-[#34483B] text-[#B65D5D] text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <LogOut className="w-3 h-3" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Cloud className="w-4 h-4 text-[#C28B45]" />
                <span className="text-xs font-bold text-[#252C28] dark:text-white">
                  Cloud Account & Sync (Sign In)
                </span>
              </div>
              <p className="text-[11px] text-[#68746B] dark:text-[#9EACA1] leading-relaxed">
                Sign in to automatically sync your travel comfort settings, journey records, and personalized motion predictions across all your devices.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <button
                  onClick={async () => {
                    await signInWithGoogle();
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-[#34483B] hover:bg-[#2B3C31] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In with Google</span>
                </button>
                {onNavigate && (
                  <button
                    onClick={() => onNavigate('auth')}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#E4EBE2] dark:bg-[#34483B] hover:bg-[#D8DCD5] text-[#34483B] dark:text-[#E4EBE2] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Username / Email Sign In</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 2. Motion Sensitivity Setting Slider */}
      <section className="p-4 rounded-2xl bg-white dark:bg-[#242D28] border border-[#D8DCD5] dark:border-[#333E37] space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-[#252C28] dark:text-white uppercase tracking-wider font-heading">
              Motion Sensitivity Setting
            </h3>
            <p className="text-[11px] text-[#68746B] dark:text-[#9EACA1]">
              Adjust how easily you feel movement during travel
            </p>
          </div>
          <span className="text-base font-bold text-[#34483B] dark:text-[#91A995] tabular-nums font-heading">
            {sensitivityScore}/100
          </span>
        </div>

        <input
          type="range"
          min="10"
          max="100"
          step="1"
          value={sensitivityScore}
          onChange={e => handleScoreChange(parseInt(e.target.value))}
          className="w-full accent-[#34483B]"
        />

        <div className="flex justify-between text-[10px] text-[#68746B] dark:text-[#9EACA1]">
          <span>Mild</span>
          <span>Moderate</span>
          <span>High</span>
          <span>Severe</span>
        </div>
      </section>

      {/* 3. Personal Travel Comfort Profile (Learned from User Activity) */}
      <section className="p-4 rounded-2xl bg-white dark:bg-[#242D28] border border-[#D8DCD5] dark:border-[#333E37] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#34483B] dark:text-[#91A995]" />
            <h3 className="text-xs font-bold text-[#252C28] dark:text-white uppercase tracking-wider font-heading">
              Personal Travel Comfort Profile
            </h3>
          </div>
          <span className="text-[10px] text-[#68746B] dark:text-[#9EACA1]">
            Learned from your logs
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Top Symptoms */}
          <div className="p-2.5 rounded-xl bg-[#F3F4EF] dark:bg-[#1E2521] border border-[#E4EBE2] dark:border-[#34483B]">
            <span className="text-[10px] text-[#68746B] dark:text-[#9EACA1] block">
              Frequently Reported Sensation
            </span>
            <span className="font-bold text-[#252C28] dark:text-white block mt-0.5 truncate">
              {learnedTopSymptom}
            </span>
          </div>

          {/* Highest Discomfort Transport */}
          <div className="p-2.5 rounded-xl bg-[#F3F4EF] dark:bg-[#1E2521] border border-[#E4EBE2] dark:border-[#34483B]">
            <span className="text-[10px] text-[#68746B] dark:text-[#9EACA1] block">
              Highest Discomfort Transport
            </span>
            <span className="font-bold text-[#B65D5D] block mt-0.5 capitalize">
              {learnedHighestTransport}
            </span>
          </div>

          {/* Helpful Strategies */}
          <div className="p-2.5 rounded-xl bg-[#F3F4EF] dark:bg-[#1E2521] border border-[#E4EBE2] dark:border-[#34483B]">
            <span className="text-[10px] text-[#68746B] dark:text-[#9EACA1] block">
              Most Helpful Relief Strategy
            </span>
            <span className="font-bold text-[#557B61] dark:text-[#91A995] block mt-0.5 truncate">
              {learnedTopRemedy}
            </span>
          </div>

          {/* Severity Trend */}
          <div className="p-2.5 rounded-xl bg-[#F3F4EF] dark:bg-[#1E2521] border border-[#E4EBE2] dark:border-[#34483B]">
            <span className="text-[10px] text-[#68746B] dark:text-[#9EACA1] block">
              Severity Change Over Time
            </span>
            <span className="font-bold text-[#34483B] dark:text-[#91A995] block mt-0.5">
              {severityTrendText}
            </span>
          </div>
        </div>

        {/* Monitored Triggers List */}
        <div className="pt-2 border-t border-[#D8DCD5] dark:border-[#333E37]">
          <span className="text-[11px] font-semibold text-[#68746B] dark:text-[#9EACA1] block mb-1">
            Commonly Reported Triggers:
          </span>
          <div className="flex flex-wrap gap-1">
            {profile.triggers.map((trig, i) => (
              <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-[#E4EBE2] dark:bg-[#34483B] text-[#34483B] dark:text-[#E4EBE2]">
                {trig}
              </span>
            ))}
          </div>
        </div>

        {/* Observation Disclaimer */}
        <p className="text-[10px] text-[#68746B] dark:text-[#9EACA1] leading-relaxed italic pt-1">
          <strong>Observation Note:</strong> These patterns are observations derived from your user-entered trip logs and ratings. They do not constitute clinical or medical conclusions.
        </p>
      </section>

      {/* 4. Language Preference Card (All Indian Languages) */}
      <section className="p-4 rounded-2xl bg-white dark:bg-[#242D28] border border-[#D8DCD5] dark:border-[#333E37] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#34483B] dark:text-[#91A995] stroke-[1.8]" />
            <h3 className="text-xs font-bold text-[#252C28] dark:text-white uppercase tracking-wider font-heading">
              {t('select_language', 'Language Preference / भाषा')}
            </h3>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E4EBE2] dark:bg-[#34483B] text-[#34483B] dark:text-[#E4EBE2] font-semibold">
            {languageObj.name}
          </span>
        </div>

        <button
          onClick={openLanguageModal}
          className="w-full p-3 rounded-xl bg-[#F3F4EF] dark:bg-[#1E2521] border border-[#D8DCD5] dark:border-[#333E37] hover:border-[#91A995] flex items-center justify-between cursor-pointer transition-all group"
        >
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#252C28] dark:text-white font-heading">
                {languageObj.nativeName}
              </span>
              <span className="text-xs text-[#68746B] dark:text-[#9EACA1]">
                ({languageObj.name})
              </span>
            </div>
            <span className="text-[11px] text-[#68746B] dark:text-[#9EACA1] block mt-0.5">
              {languageObj.region} · 23 Indian Languages supported
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#34483B] dark:text-[#91A995] group-hover:translate-x-0.5 transition-transform">
            <span>Change</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </button>
      </section>

      {/* 4. Accessibility Controls */}
      <section className="p-4 rounded-2xl bg-white dark:bg-[#242D28] border border-[#D8DCD5] dark:border-[#333E37] space-y-3">
        <div className="flex items-center gap-2">
          <EyeOff className="w-4 h-4 text-[#34483B] dark:text-[#91A995] stroke-[1.8]" />
          <h3 className="text-xs font-bold text-[#252C28] dark:text-white uppercase tracking-wider font-heading">
            Accessibility & Motion Controls
          </h3>
        </div>

        <div className="divide-y divide-[#D8DCD5] dark:divide-[#333E37]">
          {/* Reduce Motion Toggle */}
          <div className="py-2.5 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-[#252C28] dark:text-white block">
                Reduce Motion
              </span>
              <span className="text-[11px] text-[#68746B] dark:text-[#9EACA1]">
                Replaces animated visual cues and pulses with static, comfortable indicators
              </span>
            </div>
            <button
              onClick={onToggleReduceMotion}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                reduceMotion ? 'bg-[#34483B]' : 'bg-[#D8DCD5] dark:bg-[#333E37]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform absolute top-0.5 ${
                  reduceMotion ? 'left-5.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {/* Dark Mode */}
          <div className="py-2.5 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-[#252C28] dark:text-white block">
                Dark Mode
              </span>
              <span className="text-[11px] text-[#68746B] dark:text-[#9EACA1]">
                Comfortable low-glare dark forest theme for night travel
              </span>
            </div>
            <button
              onClick={onToggleDarkMode}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                isDarkMode ? 'bg-[#34483B]' : 'bg-[#D8DCD5] dark:bg-[#333E37]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform absolute top-0.5 ${
                  isDarkMode ? 'left-5.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {/* Audio Chimes */}
          <div className="py-2.5 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-[#252C28] dark:text-white block">
                Audio Relaxation Bells
              </span>
              <span className="text-[11px] text-[#68746B] dark:text-[#9EACA1]">
                Synthesizes gentle 432Hz harmonic chimes during breathing
              </span>
            </div>
            <button
              onClick={() => setAudioChimes(!audioChimes)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                audioChimes ? 'bg-[#34483B]' : 'bg-[#D8DCD5] dark:bg-[#333E37]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform absolute top-0.5 ${
                  audioChimes ? 'left-5.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {/* Notifications */}
          <div className="py-2.5 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-[#252C28] dark:text-white block">
                Pre-Trip Departure Reminders
              </span>
              <span className="text-[11px] text-[#68746B] dark:text-[#9EACA1]">
                Prompts you to start visual cues 5 minutes before leaving
              </span>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                notifications ? 'bg-[#34483B]' : 'bg-[#D8DCD5] dark:bg-[#333E37]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform absolute top-0.5 ${
                  notifications ? 'left-5.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* 4. Privacy and Data Management Settings */}
      <section className="p-4 rounded-2xl bg-white dark:bg-[#242D28] border border-[#D8DCD5] dark:border-[#333E37] space-y-3">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-[#34483B] dark:text-[#91A995] stroke-[1.8]" />
          <h3 className="text-xs font-bold text-[#252C28] dark:text-white uppercase tracking-wider font-heading">
            Privacy & Data Management
          </h3>
        </div>

        <p className="text-xs text-[#68746B] dark:text-[#9EACA1] leading-relaxed">
          All sensor readings and symptom records are held on your device. You can download or purge your history at any time.
        </p>

        <div className="space-y-2 pt-1">
          <button
            onClick={handleExportData}
            className="w-full h-11 rounded-xl bg-[#F3F4EF] dark:bg-[#1B221E] hover:bg-[#E4EBE2] text-[#252C28] dark:text-white border border-[#D8DCD5] dark:border-[#333E37] font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download All Data (JSON Backup)</span>
          </button>
          {exportNotice && (
            <span className="text-[11px] text-[#557B61] dark:text-[#91A995] block text-center font-medium">
              ✓ Data export downloaded successfully
            </span>
          )}

          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-full h-11 rounded-xl bg-white dark:bg-[#242D28] hover:bg-[#B65D5D]/10 text-[#B65D5D] border border-[#B65D5D]/40 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete All Personal Data & History</span>
          </button>
        </div>
      </section>

      {/* 5. Medical Disclaimer Notice */}
      <section className="p-4 rounded-2xl bg-[#E4EBE2]/60 dark:bg-[#2A342E] border border-[#D8DCD5] dark:border-[#38453D] space-y-2">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-[#C28B45] shrink-0 stroke-[1.8]" />
          <h4 className="text-xs font-bold text-[#252C28] dark:text-white uppercase tracking-wider font-heading">
            Medical Safety & Product Notice
          </h4>
        </div>
        <p className="text-[11px] text-[#68746B] dark:text-[#9EACA1] leading-relaxed">
          MotionEase is an experimental wellness tool that assists in behavioral comfort and sensory stabilization. It does not diagnose, treat, or cure medical conditions, and never prescribes medication dosages.
        </p>
      </section>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-[#242D28] rounded-3xl p-5 shadow-2xl border border-[#D8DCD5] dark:border-[#333E37] space-y-3">
            <h3 className="text-base font-bold text-[#252C28] dark:text-white font-heading">
              Permanently delete all data?
            </h3>
            <p className="text-xs text-[#68746B] dark:text-[#9EACA1] leading-relaxed">
              This will erase all your journey history, symptom logs, and motion profile from this device. This action cannot be reversed.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 h-10 rounded-xl bg-[#F3F4EF] dark:bg-[#1B221E] text-[#252C28] dark:text-white text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 h-10 rounded-xl bg-[#B65D5D] hover:bg-[#A34E4E] text-white text-xs font-semibold"
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
