import React, { useState } from 'react';
import {
  ShieldAlert,
  Download,
  Trash2,
  HardDrive,
  Cpu,
  WifiOff,
  Bell,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  Info,
  Lock,
} from 'lucide-react';
import { StorageService } from '../utils/storage';
import { sensorService } from '../utils/sensors';

interface SettingsScreenProps {
  onDataCleared: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onDataCleared }) => {
  const [sensorsEnabled, setSensorsEnabled] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [voiceVolume, setVoiceVolume] = useState(85);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [exportNotice, setExportNotice] = useState(false);

  const handleToggleSensors = async () => {
    if (sensorsEnabled) {
      sensorService.stop();
      setSensorsEnabled(false);
    } else {
      const granted = await sensorService.requestSensorPermission();
      sensorService.start();
      setSensorsEnabled(true);
    }
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
    <div className="flex-1 w-full min-h-full p-4 space-y-4 pb-8 text-slate-800 dark:text-slate-100 bg-[#FBFBF9] dark:bg-slate-950">
      {/* 1. Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
          Settings & Privacy
        </h2>
        <span className="text-[10px] text-slate-500 dark:text-slate-400">
          Hardware permissions, offline controls, and user data governance
        </span>
      </div>

      {/* 2. Offline Mode Status Banner */}
      <section className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-800/70 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-700 dark:text-emerald-400 shrink-0">
          <WifiOff className="w-5 h-5" />
        </div>
        <div>
          <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 block">
            Offline Mode Guaranteed
          </span>
          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-tight mt-0.5">
            All visual stabilization cues, guided breathing exercises, and ML model evaluations operate on-device without internet.
          </p>
        </div>
      </section>

      {/* 3. Hardware & Sensors Preferences */}
      <section className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Device Hardware & Sensors
        </h3>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {/* Motion Sensors */}
          <div className="py-2.5 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                Accelerometer & Gyroscope
              </span>
              <span className="text-[11px] text-slate-400">
                Required for real-time visual cue motion synchronization
              </span>
            </div>
            <button
              onClick={handleToggleSensors}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                sensorsEnabled ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform absolute top-0.5 ${
                  sensorsEnabled ? 'left-5.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {/* Haptic Feedback */}
          <div className="py-2.5 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                Haptic Vibration Pulses
              </span>
              <span className="text-[11px] text-slate-400">
                Tactile pulses during breathing phase shifts
              </span>
            </div>
            <button
              onClick={() => setHapticsEnabled(!hapticsEnabled)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                hapticsEnabled ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform absolute top-0.5 ${
                  hapticsEnabled ? 'left-5.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {/* Voice Volume */}
          <div className="py-2.5 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Audio Guidance Volume
              </span>
              <span className="text-slate-400 tabular-nums">{voiceVolume}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={voiceVolume}
              onChange={e => setVoiceVolume(parseInt(e.target.value))}
              className="w-full accent-emerald-600"
            />
          </div>
        </div>
      </section>

      {/* 4. Privacy & Data Ownership */}
      <section className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Data Governance & Privacy
          </h3>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          MotionEase stores your journey logs, symptom entries, and sensitivity profile on your local device. You retain 100% ownership and can export or delete everything at any time.
        </p>

        <div className="space-y-2 pt-1">
          {/* Download Data */}
          <button
            onClick={handleExportData}
            className="w-full h-11 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download All My Data (JSON Backup)</span>
          </button>
          {exportNotice && (
            <span className="text-[11px] text-emerald-700 dark:text-emerald-400 block text-center">
              ✓ Data export downloaded successfully!
            </span>
          )}

          {/* Delete All Data */}
          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-full h-11 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete All Personal Data & History</span>
          </button>
        </div>
      </section>

      {/* 5. Medical Safety & Disclaimer Notice */}
      <section className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 space-y-2">
        <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200">
          <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <h4 className="text-xs font-bold uppercase tracking-wider">
            Medical Safety & Product Disclaimer
          </h4>
        </div>
        <div className="text-[11px] text-amber-900 dark:text-amber-200/90 leading-relaxed space-y-1">
          <p>
            • MotionEase is a wellness and comfort companion designed to reduce sensory conflict during travel.
          </p>
          <p>
            • It does NOT diagnose, treat, or cure medical conditions, vestibular disorders, or inner-ear diseases.
          </p>
          <p>
            • MotionEase NEVER prescribes or recommends specific pharmaceutical medication dosages.
          </p>
          <p>
            • If symptoms are accompanied by sudden hearing loss, severe focal weakness, chest pain, or violent persistent vomiting, seek immediate emergency medical care.
          </p>
        </div>
      </section>

      {/* 6. Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950 flex items-center justify-center text-rose-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Permanently delete all data?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              This will erase your journeys, symptom tracker history, and custom motion profile from this browser. This action cannot be undone.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 h-10 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
              >
                Yes, Delete All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
