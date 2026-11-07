import React, { useState } from 'react';
import {
  X,
  Code2,
  Terminal,
  Copy,
  Check,
  Smartphone,
  Server,
  BrainCircuit,
  FileText,
  Laptop,
} from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'guide' | 'flutter' | 'backend' | 'ml' | 'theme'>('guide');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 text-[#252C28] dark:text-[#F3F4EF] font-sans">
      <div className="w-full max-w-4xl h-[88vh] bg-white dark:bg-[#242D28] rounded-3xl border border-[#D8DCD5] dark:border-[#333E37] shadow-2xl flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-[#D8DCD5] dark:border-[#333E37] flex items-center justify-between bg-[#F3F4EF] dark:bg-[#1B221E]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#34483B] flex items-center justify-center text-white">
              <Code2 className="w-4 h-4 stroke-[1.8] text-[#91A995]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#252C28] dark:text-white leading-tight font-heading">
                MotionEase Architecture & Codebase Hub
              </h2>
              <span className="text-[11px] text-[#68746B] dark:text-[#9EACA1]">
                Sage Green + Charcoal Design System · Flutter Dart · Python FastAPI · Scikit-Learn
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#E4EBE2] dark:hover:bg-[#34483B] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-[#68746B] dark:text-[#9EACA1]" />
          </button>
        </div>

        {/* Tab Navigator */}
        <div className="px-6 border-b border-[#D8DCD5] dark:border-[#333E37] flex gap-2 overflow-x-auto bg-[#F3F4EF]/60 dark:bg-[#1B221E]/60 py-2">
          {[
            { id: 'guide', label: 'HP Victus / Windows Guide', icon: Laptop },
            { id: 'theme', label: 'Sage Minimal Theme', icon: FileText },
            { id: 'flutter', label: 'Flutter Frontend (Dart)', icon: Smartphone },
            { id: 'backend', label: 'FastAPI Backend (Python)', icon: Server },
            { id: 'ml', label: 'Machine Learning (Scikit)', icon: BrainCircuit },
          ].map(t => {
            const Icon = t.icon;
            const isSelected = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#34483B] text-white'
                    : 'text-[#68746B] dark:text-[#9EACA1] hover:text-[#252C28] dark:hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5 stroke-[1.8]" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs leading-relaxed font-mono">
          {activeTab === 'guide' && (
            <div className="space-y-4 font-sans text-xs">
              <div className="p-4 rounded-2xl bg-[#E4EBE2]/60 dark:bg-[#1B221E] border border-[#D8DCD5] dark:border-[#333E37]">
                <h3 className="font-bold text-sm text-[#34483B] dark:text-[#E4EBE2] mb-1 font-heading">
                  Setup Instructions for HP Victus & Windows 11
                </h3>
                <p className="text-[#68746B] dark:text-[#9EACA1]">
                  Complete commands to launch MotionEase on your HP Victus laptop using VS Code, Android Studio, and the Android emulator.
                </p>
              </div>

              <div className="space-y-3 font-sans">
                <h4 className="font-bold text-[#252C28] dark:text-white uppercase tracking-wider text-[11px]">
                  1. Launch FastAPI Backend
                </h4>
                <div className="p-3 rounded-xl bg-[#1B221E] text-[#E4EBE2] font-mono text-[11px] relative border border-[#333E37]">
                  <pre>{`cd backend
python -m venv venv
.\\venv\\Scripts\\activate
pip install -r requirements.txt
python train_models.py
uvicorn main:app --reload --host 0.0.0.0 --port 8000`}</pre>
                </div>

                <h4 className="font-bold text-[#252C28] dark:text-white uppercase tracking-wider text-[11px] pt-2">
                  2. Launch Flutter on Android Emulator
                </h4>
                <div className="p-3 rounded-xl bg-[#1B221E] text-[#E4EBE2] font-mono text-[11px] relative border border-[#333E37]">
                  <pre>{`cd flutter_app
flutter pub get
flutter run`}</pre>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'theme' && (
            <div className="space-y-4 font-sans text-xs">
              <div className="p-4 rounded-2xl bg-white dark:bg-[#1B221E] border border-[#D8DCD5] dark:border-[#333E37] space-y-2">
                <span className="font-bold text-sm text-[#252C28] dark:text-white font-heading block">
                  Sage Green + Charcoal Color Tokens
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
                  {[
                    { name: 'Primary Sage', hex: '#91A995' },
                    { name: 'Deep Forest Green', hex: '#34483B' },
                    { name: 'Charcoal', hex: '#252C28' },
                    { name: 'Main Background', hex: '#F3F4EF' },
                    { name: 'Card Background', hex: '#FFFFFF' },
                    { name: 'Pale Sage', hex: '#E4EBE2' },
                    { name: 'Warm Grey', hex: '#D8DCD5' },
                    { name: 'Secondary Text', hex: '#68746B' },
                    { name: 'Error', hex: '#B65D5D' },
                    { name: 'Warning', hex: '#C28B45' },
                    { name: 'Success', hex: '#557B61' },
                  ].map(c => (
                    <div key={c.hex} className="p-2 rounded-xl bg-[#F3F4EF] dark:bg-[#242D28] border border-[#D8DCD5] dark:border-[#333E37] flex items-center gap-2">
                      <div className="w-5 h-5 rounded-md border border-black/10 shrink-0" style={{ backgroundColor: c.hex }} />
                      <div>
                        <span className="block font-semibold text-[11px] text-[#252C28] dark:text-white leading-tight">{c.name}</span>
                        <span className="text-[10px] text-[#68746B] dark:text-[#9EACA1] font-mono">{c.hex}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'flutter' && (
            <div className="space-y-3">
              <span className="font-bold text-[#252C28] dark:text-white">flutter_app/lib/theme/app_theme.dart</span>
              <div className="p-3 rounded-xl bg-[#1B221E] text-[#E4EBE2] overflow-x-auto border border-[#333E37]">
                <pre>{`class AppColors {
  static const primarySage = Color(0xFF91A995);
  static const deepForestGreen = Color(0xFF34483B);
  static const charcoal = Color(0xFF252C28);
  static const mainBackground = Color(0xFFF3F4EF);
  static const cardBackground = Color(0xFFFFFFFF);
  static const paleSage = Color(0xFFE4EBE2);
  static const warmGrey = Color(0xFFD8DCD5);
  static const secondaryText = Color(0xFF68746B);
  static const error = Color(0xFFB65D5D);
  static const warning = Color(0xFFC28B45);
  static const success = Color(0xFF557B61);
}`}</pre>
              </div>
            </div>
          )}

          {activeTab === 'backend' && (
            <div className="space-y-3">
              <span className="font-bold text-[#252C28] dark:text-white">backend/main.py</span>
              <div className="p-3 rounded-xl bg-[#1B221E] text-[#E4EBE2] overflow-x-auto border border-[#333E37]">
                <pre>{`@app.post("/api/ml/predict")
def predict_risk(data: RiskInput):
    return ml_model.predict(data.dict())`}</pre>
              </div>
            </div>
          )}

          {activeTab === 'ml' && (
            <div className="space-y-3">
              <span className="font-bold text-[#252C28] dark:text-white">backend/train_models.py</span>
              <div className="p-3 rounded-xl bg-[#1B221E] text-[#E4EBE2] overflow-x-auto border border-[#333E37]">
                <pre>{`logit = LogisticRegression(max_iter=1000)
rf = RandomForestClassifier(n_estimators=100, max_depth=6)`}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
