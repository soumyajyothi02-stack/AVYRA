/**
 * MotionEase Audio & Haptic Utilities
 * Uses Web Audio API for synthetic calming chimes and pink noise (no external sound files required)
 * Uses Web Speech API for hands-free voice responses
 */

class AudioController {
  private ctx: AudioContext | null = null;
  private noiseNode: AudioNode | null = null;
  private noiseGain: GainNode | null = null;
  private isPlayingNoise = false;

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  /**
   * Plays a calming harmonic bell tone for breathing phase transitions
   * @param frequency Tone frequency in Hz (default 432Hz, known for relaxing resonance)
   */
  public playChime(frequency = 432, duration = 1.6): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Sine wave with soft harmonic
      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, now);
      // Soft pitch envelope
      osc.frequency.exponentialRampToValueAtTime(frequency * 0.99, now + duration);

      // Gentle attack and exponential decay
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.25, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch {
      // Audio autoplay policy handled silently
    }
  }

  /**
   * Plays a lower grounding tone for exhale
   */
  public playExhaleTone(): void {
    this.playChime(324, 2.0); // 432 * 0.75
  }

  /**
   * Plays a gentle double bell for breath hold
   */
  public playHoldTone(): void {
    this.playChime(540, 1.2);
  }

  /**
   * Toggles soothing pink noise (mimics soft ocean waves / steady vehicle white noise)
   */
  public toggleSoothingNoise(enable?: boolean): boolean {
    const ctx = this.getAudioContext();
    if (!ctx) return false;

    const targetState = enable !== undefined ? enable : !this.isPlayingNoise;

    if (targetState) {
      if (this.isPlayingNoise) return true;
      try {
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);

        // Pink noise generator (Paul Kellet's filtered white noise algorithm)
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
          b6 = white * 0.115926;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        // Low-pass filter for smooth warmth
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, ctx.currentTime);

        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.01, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 1.5);

        whiteNoise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);

        whiteNoise.start();
        this.noiseNode = whiteNoise;
        this.noiseGain = gainNode;
        this.isPlayingNoise = true;
        return true;
      } catch {
        return false;
      }
    } else {
      if (this.noiseGain && ctx) {
        this.noiseGain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.8);
        setTimeout(() => {
          try {
            if (this.noiseNode && 'stop' in this.noiseNode) {
              (this.noiseNode as AudioScheduledSourceNode).stop();
            }
          } catch {
            // Ignore stop errors
          }
          this.noiseNode = null;
          this.noiseGain = null;
          this.isPlayingNoise = false;
        }, 850);
      } else {
        this.isPlayingNoise = false;
      }
      return false;
    }
  }

  public isNoiseActive(): boolean {
    return this.isPlayingNoise;
  }

  /**
   * Speak a calm, reassuring sentence using speech synthesis
   */
  public speakGuidance(text: string, onEnd?: () => void): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }

    window.speechSynthesis.cancel(); // cancel any active speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.88; // gently paced
    utterance.pitch = 0.98; // warm, soothing pitch
    utterance.volume = 1.0;

    // Pick a natural English voice if available
    const voices = window.speechSynthesis.getVoices();
    const calmVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Karen')));
    if (calmVoice) {
      utterance.voice = calmVoice;
    }

    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
    }

    window.speechSynthesis.speak(utterance);
  }

  public stopSpeaking(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  /**
   * Trigger device haptic pulse if available
   */
  public vibrate(pattern: number | number[] = 40): void {
    if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Haptics not allowed without user gesture
      }
    }
  }
}

export const audioController = new AudioController();
