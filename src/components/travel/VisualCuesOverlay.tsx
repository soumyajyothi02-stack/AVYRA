import React from 'react';
import { SensorReading, VisualCuesConfig } from '../../types';

interface VisualCuesOverlayProps {
  config: VisualCuesConfig;
  reading: SensorReading;
  interactiveMode?: boolean;
  reduceMotion?: boolean;
}

export const VisualCuesOverlay: React.FC<VisualCuesOverlayProps> = ({
  config,
  reading,
  interactiveMode = false,
  reduceMotion = false,
}) => {
  if (!config.enabled) return null;

  // Derive displacement from sensor reading (if isStatic is on, keep zero displacement; if reduceMotion is on, dampen significantly)
  const isStaticMode = Boolean(config.isStatic);
  const sensitivity = isStaticMode ? 0 : reduceMotion ? 0.2 : (config.speedSensitivity || 1.0);
  const offsetX = isStaticMode ? 0 : -reading.roll * 2.0 * sensitivity;
  const offsetY = isStaticMode ? 0 : reading.pitch * 1.6 * sensitivity;
  const rotationDeg = isStaticMode ? 0 : -reading.roll * 0.7 * sensitivity;

  // Dot size
  const dotPx = config.dotSize === 'small' ? 7 : config.dotSize === 'large' ? 14 : 10;

  // Sage Green and Forest dots
  const dotColor = 'bg-[#34483B] dark:bg-[#91A995] border border-[#E4EBE2] dark:border-[#242D28]';
  const opacity = reduceMotion ? 0.4 : (config.intensity || 0.85);

  const dots = [
    { id: 'l1', x: '4%', y: '20%' },
    { id: 'l2', x: '4%', y: '40%' },
    { id: 'l3', x: '4%', y: '60%' },
    { id: 'l4', x: '4%', y: '80%' },
    { id: 'r1', x: '96%', y: '20%' },
    { id: 'r2', x: '96%', y: '40%' },
    { id: 'r3', x: '96%', y: '60%' },
    { id: 'r4', x: '96%', y: '80%' },
    { id: 't1', x: '40%', y: '6%' },
    { id: 't2', x: '60%', y: '6%' },
    { id: 'b1', x: '40%', y: '94%' },
    { id: 'b2', x: '60%', y: '94%' },
  ];

  return (
    <div
      className={`fixed inset-0 pointer-events-none z-30 transition-opacity duration-300 ${
        interactiveMode ? 'pointer-events-auto' : ''
      }`}
      style={{ opacity }}
    >
      {/* 1. Artificial Horizon Line (Counter-rotates to vehicle pitch/roll) */}
      {(config.type === 'horizon_and_dots' || config.type === 'horizon_only') && (
        <div
          className="absolute inset-0 flex items-center justify-center overflow-hidden transition-transform ease-out duration-100"
          style={{
            transform: `translateY(${offsetY}px) rotate(${rotationDeg}deg)`,
          }}
        >
          {/* Subtle horizontal reference plane in Primary Sage */}
          <div className="w-[130%] h-[1.5px] bg-gradient-to-r from-transparent via-[#91A995]/60 to-transparent" />
          
          {/* Central artificial horizon pitch notch */}
          <div className="absolute flex items-center gap-1.5">
            <div className="w-6 h-[1.5px] bg-[#34483B]/70 dark:bg-[#E4EBE2]/70 rounded-full" />
            <div className="w-2 h-2 border border-[#34483B] dark:border-[#E4EBE2] rounded-full" />
            <div className="w-6 h-[1.5px] bg-[#34483B]/70 dark:bg-[#E4EBE2]/70 rounded-full" />
          </div>
        </div>
      )}

      {/* 2. Peripheral Synchronized Motion Cue Dots */}
      {(config.type === 'horizon_and_dots' || config.type === 'dots_only') && (
        <div className="absolute inset-0 overflow-hidden">
          {dots.map(dot => (
            <div
              key={dot.id}
              className={`absolute rounded-full transition-transform duration-100 ease-out ${dotColor}`}
              style={{
                left: dot.x,
                top: dot.y,
                width: `${dotPx}px`,
                height: `${dotPx}px`,
                transform: `translate(-50%, -50%) translate(${offsetX}px, ${offsetY}px)`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
