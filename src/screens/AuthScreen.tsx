import React, { useState } from 'react';
import { Mail, Lock, User, AtSign, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react';
import { UserProfile } from '../types';
import { StorageService } from '../utils/storage';

interface AuthScreenProps {
  onAuthSuccess: (profile: UserProfile) => void;
  onContinueAsGuest: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess, onContinueAsGuest }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const demoUsers: { label: string; profile: UserProfile }[] = [
    {
      label: 'Maya Chen (Car & Commuter Sensitive)',
      profile: {
        id: 'usr_maya',
        name: 'Maya Chen',
        username: 'mayachen',
        email: 'maya.chen@example.com',
        sensitivityLevel: 'Moderate',
        sensitivityScore: 62,
        triggers: ['Reading on phone in car', 'Back seat riding', 'Hot cabin'],
        favoriteRemedies: ['Visual Focus Cues', 'P6 Acupressure', 'Cool AC Airflow'],
        totalJourneys: 14,
        reliefSuccessRate: 84,
        createdAt: '2026-08-15',
        accessibility: {
          reduceMotion: false,
          highContrast: false,
          notificationsEnabled: true,
          audioChimesEnabled: true,
        },
      },
    },
    {
      label: 'Liam Ross (Turbulence & Flight Sensitive)',
      profile: {
        id: 'usr_liam',
        name: 'Liam Ross',
        username: 'liamross',
        email: 'liam.ross@flighthealth.com',
        sensitivityLevel: 'High',
        sensitivityScore: 78,
        triggers: ['Airplane turbulence', 'Descent banking', 'Reading during cruise'],
        favoriteRemedies: ['4-7-8 Breathing', 'Ginger tea', 'Window seat horizon gaze'],
        totalJourneys: 22,
        reliefSuccessRate: 77,
        createdAt: '2026-05-10',
        accessibility: {
          reduceMotion: false,
          highContrast: false,
          notificationsEnabled: true,
          audioChimesEnabled: true,
        },
      },
    },
    {
      label: 'Elena Rostova (Ferry & Sea Voyage Sensitive)',
      profile: {
        id: 'usr_elena',
        name: 'Elena Rostova',
        username: 'elenar',
        email: 'elena.r@maritime.org',
        sensitivityLevel: 'Severe',
        sensitivityScore: 89,
        triggers: ['Boat ocean swell', 'Diesel engine smell', 'Enclosed lower cabin'],
        favoriteRemedies: ['Horizon Anchor', 'Acupressure Band', 'Fresh sea breeze'],
        totalJourneys: 8,
        reliefSuccessRate: 91,
        createdAt: '2026-09-01',
        accessibility: {
          reduceMotion: true,
          highContrast: false,
          notificationsEnabled: true,
          audioChimesEnabled: true,
        },
      },
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!password.trim()) {
      setErrorMsg('Please enter your password.');
      return;
    }

    if (isSignUp) {
      if (!name.trim()) {
        setErrorMsg('Please enter your full name.');
        return;
      }
      if (!username.trim()) {
        setErrorMsg('Please choose a username handle.');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setErrorMsg('Please enter a valid email address.');
        return;
      }

      const cleanUsername = username.trim().replace(/^@/, '');

      const newProfile: UserProfile = {
        id: `usr_${Date.now()}`,
        name: name.trim(),
        username: cleanUsername,
        email: email.trim(),
        sensitivityLevel: 'Moderate',
        sensitivityScore: 55,
        triggers: ['Reading in transit', 'Back row seating'],
        favoriteRemedies: ['Visual Focus Cues', '4-7-8 Breathing'],
        totalJourneys: 1,
        reliefSuccessRate: 80,
        createdAt: new Date().toISOString().split('T')[0],
        accessibility: {
          reduceMotion: false,
          highContrast: false,
          notificationsEnabled: true,
          audioChimesEnabled: true,
        },
      };

      StorageService.saveProfile(newProfile);
      onAuthSuccess(newProfile);
    } else {
      // Sign In mode
      if (!emailOrUsername.trim()) {
        setErrorMsg('Please enter your username or email address.');
        return;
      }

      const inputVal = emailOrUsername.trim();
      const isEmailInput = inputVal.includes('@');
      const cleanUsername = inputVal.replace(/^@/, '');

      const existingProfile = StorageService.getProfile();
      const newProfile: UserProfile = {
        ...existingProfile,
        id: existingProfile.id || `usr_${Date.now()}`,
        name: existingProfile.name || (isEmailInput ? inputVal.split('@')[0] : cleanUsername),
        username: existingProfile.username || cleanUsername,
        email: isEmailInput ? inputVal : existingProfile.email || `${cleanUsername}@motionease.app`,
      };

      StorageService.saveProfile(newProfile);
      onAuthSuccess(newProfile);
    }
  };

  const handleSelectDemo = (profile: UserProfile) => {
    StorageService.saveProfile(profile);
    onAuthSuccess(profile);
  };

  return (
    <div className="flex-1 w-full min-h-full flex flex-col justify-between p-6 bg-[#F3F4EF] dark:bg-[#1B221E] text-[#252C28] dark:text-[#F3F4EF] transition-colors font-sans overflow-y-auto">
      {/* Top Header */}
      <div className="pt-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#34483B] flex items-center justify-center text-white font-bold text-xs font-heading">
            A
          </div>
          <span className="font-bold text-sm tracking-tight text-[#252C28] dark:text-white font-heading">
            AVYRA🕊️
          </span>
        </div>
        <button
          onClick={onContinueAsGuest}
          className="text-xs text-[#34483B] dark:text-[#91A995] font-semibold hover:underline py-1 cursor-pointer"
        >
          Skip / Guest Mode
        </button>
      </div>

      {/* Main Form Section */}
      <div className="w-full max-w-sm mx-auto my-6">
        <div className="mb-5 text-center">
          <h2 className="text-2xl font-bold text-[#252C28] dark:text-white font-heading tracking-tight">
            {isSignUp ? 'Create your profile' : 'Welcome back'}
          </h2>
          <p className="text-xs text-[#68746B] dark:text-[#9EACA1] mt-1">
            {isSignUp
              ? 'Set up your personal motion comfort companion'
              : 'Sign in to access your trips and comfort history'}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-2.5 rounded-xl bg-white dark:bg-[#2A2323] border border-[#B65D5D] text-xs text-[#B65D5D] dark:text-[#F3A7A7]">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Sign Up: Name & Username */}
          {isSignUp ? (
            <>
              <div>
                <label className="block text-[11px] font-medium text-[#68746B] dark:text-[#9EACA1] mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#68746B] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Maya Chen"
                    className="w-full h-11 pl-9 pr-3 text-xs rounded-xl bg-white dark:bg-[#242D28] border border-[#D8DCD5] dark:border-[#333E37] text-[#252C28] dark:text-white focus:outline-hidden focus:border-[#34483B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#68746B] dark:text-[#9EACA1] mb-1">
                  Username
                </label>
                <div className="relative">
                  <AtSign className="w-4 h-4 text-[#68746B] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="maya_chen"
                    className="w-full h-11 pl-9 pr-3 text-xs rounded-xl bg-white dark:bg-[#242D28] border border-[#D8DCD5] dark:border-[#333E37] text-[#252C28] dark:text-white focus:outline-hidden focus:border-[#34483B]"
                  />
                </div>
                <span className="text-[10px] text-[#68746B] dark:text-[#9EACA1] mt-0.5 block pl-1">
                  Your unique handle across MotionEase
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#68746B] dark:text-[#9EACA1] mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#68746B] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full h-11 pl-9 pr-3 text-xs rounded-xl bg-white dark:bg-[#242D28] border border-[#D8DCD5] dark:border-[#333E37] text-[#252C28] dark:text-white focus:outline-hidden focus:border-[#34483B]"
                  />
                </div>
              </div>
            </>
          ) : (
            /* Sign In: Username or Email */
            <div>
              <label className="block text-[11px] font-medium text-[#68746B] dark:text-[#9EACA1] mb-1">
                Username or Email Address
              </label>
              <div className="relative">
                <AtSign className="w-4 h-4 text-[#68746B] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={emailOrUsername}
                  onChange={e => setEmailOrUsername(e.target.value)}
                  placeholder="e.g. @mayachen or you@domain.com"
                  className="w-full h-11 pl-9 pr-3 text-xs rounded-xl bg-white dark:bg-[#242D28] border border-[#D8DCD5] dark:border-[#333E37] text-[#252C28] dark:text-white focus:outline-hidden focus:border-[#34483B]"
                />
              </div>
            </div>
          )}

          {/* Password with Eye Visibility Toggle */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-medium text-[#68746B] dark:text-[#9EACA1]">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-[#34483B] dark:text-[#91A995] hover:underline flex items-center gap-1 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showPassword ? 'Hide password' : 'Show password'}</span>
              </button>
            </div>

            <div className="relative">
              <Lock className="w-4 h-4 text-[#68746B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={showPassword ? 'Type your password here' : '••••••••'}
                className="w-full h-11 pl-9 pr-10 text-xs rounded-xl bg-white dark:bg-[#242D28] border border-[#D8DCD5] dark:border-[#333E37] text-[#252C28] dark:text-white focus:outline-hidden focus:border-[#34483B]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#68746B] dark:text-[#9EACA1] hover:text-[#252C28] dark:hover:text-white p-1 cursor-pointer transition-colors"
                title={showPassword ? 'Hide password' : 'Show password while typing'}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 text-[#34483B] dark:text-[#91A995]" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Checkbox option to keep password visible while typing */}
            <div className="mt-1.5 flex items-center justify-between px-0.5">
              <label className="flex items-center gap-1.5 text-[11px] text-[#68746B] dark:text-[#9EACA1] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={e => setShowPassword(e.target.checked)}
                  className="w-3.5 h-3.5 rounded accent-[#34483B] dark:accent-[#91A995] cursor-pointer"
                />
                <span>See password while typing</span>
              </label>
              <span className="text-[10px] text-[#557B61] dark:text-[#91A995]">
                {showPassword ? 'Password Visible' : 'Hidden'}
              </span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full h-11 rounded-xl bg-[#34483B] hover:bg-[#2B3C31] text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all mt-3"
          >
            <span>{isSignUp ? 'Create Profile' : 'Sign In'}</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2]" />
          </button>
        </form>

        <div className="mt-3 text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg('');
            }}
            className="text-xs text-[#68746B] dark:text-[#9EACA1] hover:text-[#34483B] dark:hover:text-[#91A995] transition-colors cursor-pointer"
          >
            {isSignUp ? 'Already have a profile? Sign In' : "Don't have a profile? Create One"}
          </button>
        </div>

        {/* Pre-loaded Profile Quick Fill */}
        <div className="mt-6 pt-5 border-t border-[#D8DCD5] dark:border-[#333E37]">
          <span className="block text-[11px] font-semibold text-[#68746B] dark:text-[#9EACA1] uppercase tracking-wider mb-2 text-center">
            Or Quick Test With A Pre-loaded Profile
          </span>
          <div className="space-y-1.5">
            {demoUsers.map((d, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelectDemo(d.profile)}
                className="w-full text-left p-2.5 rounded-xl bg-white dark:bg-[#242D28] hover:bg-[#E4EBE2] dark:hover:bg-[#34483B] border border-[#D8DCD5] dark:border-[#333E37] transition-colors flex items-center justify-between text-xs cursor-pointer group"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-[#252C28] dark:text-white">
                      {d.profile.name}
                    </span>
                    <span className="text-[10px] text-[#68746B] dark:text-[#9EACA1] font-mono">
                      @{d.profile.username || 'user'}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#68746B] dark:text-[#9EACA1]">
                    {d.profile.sensitivityLevel} · {d.profile.totalJourneys} trips logged
                  </span>
                </div>
                <CheckCircle2 className="w-4 h-4 text-[#557B61] dark:text-[#91A995] opacity-60 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="text-center text-[10px] text-[#68746B] dark:text-[#9EACA1] pb-2">
        Private on-device storage · No ad tracking
      </div>
    </div>
  );
};
