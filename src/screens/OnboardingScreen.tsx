import React, { useState } from 'react';
import { Eye, Wind, BrainCircuit, ArrowRight, ShieldCheck } from 'lucide-react';
import { sensorService } from '../utils/sensors';

interface OnboardingScreenProps {
  onComplete: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'Visual Focus Guidance',
      tagline: 'Sensory Alignment',
      description:
        'When travelling in vehicles, your inner ear feels movement while your eyes fixate on a stationary interior. MotionEase displays gentle peripheral cues synchronized with vehicle inertia, reducing visual-vestibular conflict.',
      icon: Eye,
      actionLabel: 'Next Step',
    },
    {
      title: 'Paced Grounding & Breathing',
      tagline: 'Autonomic Calming',
      description:
        'Access quick one-tap relief protocols, hands-free spoken audio guidance, rhythmic 4-7-8 breathing exercises, and clinical P6 Nei Guan wrist acupressure techniques when discomfort arises.',
      icon: Wind,
      actionLabel: 'Next Step',
    },
    {
      title: 'Personal Motion Insights',
      tagline: 'Experimental Travel ML',
      description:
        'Estimate your comfort before travel using machine learning models tuned to your personal sensitivity and seating choices.',
      icon: BrainCircuit,
      actionLabel: 'Allow Sensors & Finish',
    },
  ];

  const handleNext = async () => {
    if (currentStep === 2) {
      await sensorService.requestSensorPermission();
      onComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const activeStep = steps[currentStep];
  const Icon = activeStep.icon;

  return (
    <div className="flex-1 w-full min-h-full flex flex-col justify-between p-6 bg-[#F3F4EF] dark:bg-[#1B221E] text-[#252C28] dark:text-[#F3F4EF] transition-colors font-sans">
      {/* Top Header & Skip */}
      <div className="flex items-center justify-between pt-2">
        <span className="text-xs font-semibold text-[#34483B] dark:text-[#91A995]">
          Step {currentStep + 1} of 3
        </span>
        <button
          onClick={onComplete}
          className="text-xs text-[#68746B] dark:text-[#9EACA1] hover:text-[#252C28] dark:hover:text-white py-1 px-2 cursor-pointer"
        >
          Skip
        </button>
      </div>

      {/* Main Slide Content */}
      <div className="my-auto flex flex-col items-center text-center max-w-sm mx-auto">
        <div className="w-20 h-20 rounded-2xl bg-white dark:bg-[#242D28] border border-[#D8DCD5] dark:border-[#333E37] flex items-center justify-center text-[#34483B] dark:text-[#91A995] mb-6 shadow-xs">
          <Icon className="w-10 h-10 stroke-[1.8]" />
        </div>

        <span className="text-xs font-semibold text-[#34483B] dark:text-[#91A995] uppercase tracking-wider mb-1">
          {activeStep.tagline}
        </span>

        <h2 className="text-2xl font-bold text-[#252C28] dark:text-white font-heading tracking-tight mb-3">
          {activeStep.title}
        </h2>

        <p className="text-xs sm:text-sm text-[#68746B] dark:text-[#9EACA1] leading-relaxed mb-6 max-w-xs">
          {activeStep.description}
        </p>

        {currentStep === 2 && (
          <div className="w-full bg-white dark:bg-[#242D28] border border-[#D8DCD5] dark:border-[#333E37] rounded-xl p-3 text-left flex items-start gap-2.5 mb-2">
            <ShieldCheck className="w-4 h-4 text-[#557B61] dark:text-[#91A995] shrink-0 mt-0.5" />
            <div className="text-[11px] text-[#68746B] dark:text-[#9EACA1] leading-relaxed">
              <span className="font-semibold text-[#252C28] dark:text-white block">
                On-Device Privacy
              </span>
              Accelerometer and gyroscope data are processed locally on your device in real time and never uploaded to remote telemetry servers.
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="w-full max-w-sm mx-auto flex flex-col gap-4 pb-4">
        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-1.5">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentStep
                  ? 'w-6 bg-[#34483B] dark:bg-[#91A995]'
                  : 'w-1.5 bg-[#D8DCD5] dark:bg-[#333E37]'
              }`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          className="w-full h-12 rounded-xl bg-[#34483B] hover:bg-[#2B3C31] text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
        >
          <span>{activeStep.actionLabel}</span>
          <ArrowRight className="w-4 h-4 stroke-[2]" />
        </button>
      </div>
    </div>
  );
};
