import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Play, Pause, Music, Sparkles } from 'lucide-react';
import { SoundscapePreset } from '../../types';

const PRESETS: SoundscapePreset[] = [
  {
    id: 'pink_noise',
    name: 'Ocean Pink Noise',
    subtitle: 'Gentle Steady Sound',
    type: 'pink_noise',
    color: '#91A995',
  },
  {
    id: 'alpha_432',
    name: 'Alpha 432Hz Tone',
    subtitle: 'Deep Body Calming',
    type: 'alpha_432',
    color: '#34483B',
  },
  {
    id: 'forest_rain',
    name: 'Gentle Rain Canopy',
    subtitle: 'Soothing Rain Drops',
    type: 'forest_rain',
    color: '#557B61',
  },
  {
    id: 'cabin_rumble',
    name: 'Cabin Wave Masker',
    subtitle: 'Muffle Engine Rumbling',
    type: 'cabin_rumble',
    color: '#252C28',
  },
];

export const SoundscapesBar: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentPreset, setCurrentPreset] = useState<SoundscapePreset>(PRESETS[0]);
  const [volume, setVolume] = useState<number>(0.35);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const noiseSourceRef = useRef<AudioNode | null>(null);

  // Initialize or resume AudioContext
  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new AudioContextClass();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const stopAudio = () => {
    if (noiseSourceRef.current) {
      try {
        if ('stop' in noiseSourceRef.current) {
          (noiseSourceRef.current as AudioScheduledSourceNode).stop();
        }
        noiseSourceRef.current.disconnect();
      } catch (e) {
        // Source might already be stopped
      }
      noiseSourceRef.current = null;
    }
    setIsPlaying(false);
  };

  const startAudio = (preset: SoundscapePreset) => {
    stopAudio();
    const ctx = getAudioContext();

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.connect(ctx.destination);
    gainNodeRef.current = gainNode;

    if (preset.type === 'alpha_432') {
      // 432 Hz Binaural Tone
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(432, ctx.currentTime);

      // Low frequency tremolo (10 Hz alpha wave)
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(10, ctx.currentTime);

      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(0.2, ctx.currentTime);

      lfo.connect(lfoGain.gain);
      osc.connect(gainNode);

      osc.start();
      lfo.start();
      noiseSourceRef.current = osc;
    } else {
      // Pink Noise / Rain / Cabin Masker Buffer
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      // Paul Kellet's Pink Noise filter algorithm
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Filter for rain or cabin rumble
      const biquad = ctx.createBiquadFilter();
      if (preset.type === 'cabin_rumble') {
        biquad.type = 'lowpass';
        biquad.frequency.setValueAtTime(280, ctx.currentTime);
      } else if (preset.type === 'forest_rain') {
        biquad.type = 'bandpass';
        biquad.frequency.setValueAtTime(800, ctx.currentTime);
      } else {
        biquad.type = 'lowpass';
        biquad.frequency.setValueAtTime(1200, ctx.currentTime);
      }

      whiteNoise.connect(biquad);
      biquad.connect(gainNode);

      whiteNoise.start();
      noiseSourceRef.current = whiteNoise;
    }

    setIsPlaying(true);
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      startAudio(currentPreset);
    }
  };

  const handleSelectPreset = (p: SoundscapePreset) => {
    setCurrentPreset(p);
    if (isPlaying) {
      startAudio(p);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(newVol, audioCtxRef.current.currentTime);
    }
  };

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      stopAudio();
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="bg-white dark:bg-[#252C28] rounded-2xl border border-[#D8DCD5] dark:border-[#34483B] p-3.5 shadow-xs transition-colors">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#E4EBE2] dark:bg-[#34483B] text-[#34483B] dark:text-[#E4EBE2] flex items-center justify-center">
            <Music className="w-4 h-4 text-[#557B61]" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#252C28] dark:text-white leading-tight font-heading">
              Calming Travel Sounds
            </h4>
            <p className="text-[10px] text-[#68746B] dark:text-[#9EACA1]">
              Gentle pink noise and soothing audio tones
            </p>
          </div>
        </div>

        <button
          onClick={handleTogglePlay}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            isPlaying
              ? 'bg-[#B65D5D] text-white'
              : 'bg-[#34483B] text-white hover:bg-[#252C28]'
          }`}
        >
          {isPlaying ? (
            <>
              <Pause className="w-3.5 h-3.5" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Play</span>
            </>
          )}
        </button>
      </div>

      {/* Preset Buttons */}
      <div className="grid grid-cols-2 gap-1.5 mb-2.5">
        {PRESETS.map(preset => {
          const isSelected = currentPreset.id === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => handleSelectPreset(preset)}
              className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#E4EBE2] dark:bg-[#34483B] border-[#91A995] text-[#34483B] dark:text-white font-semibold'
                  : 'bg-[#F3F4EF] dark:bg-[#1E2521] border-[#D8DCD5] dark:border-[#34483B] text-[#68746B] dark:text-[#9EACA1] hover:text-[#252C28]'
              }`}
            >
              <span className="text-[11px] block font-medium leading-tight">
                {preset.name}
              </span>
              <span className="text-[9px] opacity-75 block leading-none mt-0.5">
                {preset.subtitle}
              </span>
            </button>
          );
        })}
      </div>

      {/* Volume Slider */}
      <div className="flex items-center gap-2 px-1">
        <VolumeX className="w-3.5 h-3.5 text-[#68746B]" />
        <input
          type="range"
          min="0"
          max="0.8"
          step="0.05"
          value={volume}
          onChange={e => handleVolumeChange(Number(e.target.value))}
          className="flex-1 accent-[#34483B] dark:accent-[#91A995] h-1.5 cursor-pointer"
        />
        <Volume2 className="w-3.5 h-3.5 text-[#68746B]" />
        <span className="text-[10px] font-mono text-[#68746B] w-7 text-right">
          {Math.round(volume * 100)}%
        </span>
      </div>
    </div>
  );
};
