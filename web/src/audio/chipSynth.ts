import type { AudioStateSnapshot } from '../domain/types';

export type SynthCue = 'step' | 'run' | 'clear' | 'crash' | 'fire' | 'perfect';

const DEFAULT_MASTER_GAIN = 0.25;

interface ToneNote {
  readonly freqHz: number;
  readonly offsetSec: number;
  readonly durationSec: number;
  readonly wave: OscillatorType;
}

const CUE_PATTERNS: Readonly<Record<SynthCue, readonly ToneNote[]>> = {
  step: [{ freqHz: 523.25, offsetSec: 0, durationSec: 0.07, wave: 'square' }],
  run: [
    { freqHz: 440, offsetSec: 0, durationSec: 0.06, wave: 'square' },
    { freqHz: 554.37, offsetSec: 0.06, durationSec: 0.06, wave: 'square' },
    { freqHz: 659.25, offsetSec: 0.12, durationSec: 0.08, wave: 'square' },
  ],
  clear: [
    { freqHz: 523.25, offsetSec: 0, durationSec: 0.07, wave: 'triangle' },
    { freqHz: 659.25, offsetSec: 0.07, durationSec: 0.07, wave: 'triangle' },
    { freqHz: 783.99, offsetSec: 0.14, durationSec: 0.07, wave: 'triangle' },
    { freqHz: 1046.5, offsetSec: 0.21, durationSec: 0.14, wave: 'triangle' },
  ],
  crash: [
    { freqHz: 220, offsetSec: 0, durationSec: 0.09, wave: 'sawtooth' },
    { freqHz: 146.83, offsetSec: 0.09, durationSec: 0.14, wave: 'sawtooth' },
  ],
  fire: [
    { freqHz: 392, offsetSec: 0, durationSec: 0.05, wave: 'square' },
    { freqHz: 587.33, offsetSec: 0.05, durationSec: 0.07, wave: 'square' },
    { freqHz: 783.99, offsetSec: 0.12, durationSec: 0.09, wave: 'triangle' },
  ],
  perfect: [
    { freqHz: 587.33, offsetSec: 0, durationSec: 0.06, wave: 'triangle' },
    { freqHz: 783.99, offsetSec: 0.06, durationSec: 0.06, wave: 'triangle' },
    { freqHz: 1174.66, offsetSec: 0.12, durationSec: 0.14, wave: 'triangle' },
  ],
};

export class ChipSynthController {
  private soundEnabled: boolean;
  private masterGainValue: number;
  private audioCtx: AudioContext | null = null;
  private masterGainNode: GainNode | null = null;
  private synthTriggerCount = 0;
  private readonly onAudioError?: () => void;

  constructor(initialSoundEnabled: boolean, onAudioError?: () => void) {
    this.soundEnabled = initialSoundEnabled;
    this.masterGainValue = initialSoundEnabled ? DEFAULT_MASTER_GAIN : 0;
    this.onAudioError = onAudioError;
  }

  setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
    this.masterGainValue = enabled ? DEFAULT_MASTER_GAIN : 0;
    if (this.masterGainNode && this.audioCtx) {
      try {
        this.masterGainNode.gain.value = this.masterGainValue;
        this.masterGainNode.gain.setValueAtTime(this.masterGainValue, this.audioCtx.currentTime);
      } catch {
        this.onAudioError?.();
      }
    }
  }

  isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  /**
   * Must only be invoked inside a user gesture handler (RUN / STEP / FIRE).
   * Never auto-plays on mount, and never triggers when soundEnabled === false.
   */
  triggerUserGestureCue(cue: SynthCue): void {
    if (!this.soundEnabled || this.masterGainValue <= 0) {
      return;
    }

    const ctxReady = this.ensureContextInitialized();
    this.synthTriggerCount += 1;

    if (!ctxReady || !this.audioCtx || !this.masterGainNode) {
      return;
    }

    try {
      if (this.audioCtx.state === 'suspended') {
        void this.audioCtx.resume().catch(() => {
          /* Autoplay policy or headless audio device suspension is non-fatal */
        });
      }

      const baseTime = this.audioCtx.currentTime;
      const notes = CUE_PATTERNS[cue];
      for (const note of notes) {
        const osc = this.audioCtx.createOscillator();
        const env = this.audioCtx.createGain();
        osc.type = note.wave;
        osc.frequency.setValueAtTime(note.freqHz, baseTime + note.offsetSec);

        env.gain.setValueAtTime(0.001, baseTime + note.offsetSec);
        env.gain.linearRampToValueAtTime(0.35, baseTime + note.offsetSec + 0.01);
        env.gain.exponentialRampToValueAtTime(
          0.001,
          baseTime + note.offsetSec + note.durationSec,
        );

        osc.connect(env);
        env.connect(this.masterGainNode);
        osc.start(baseTime + note.offsetSec);
        osc.stop(baseTime + note.offsetSec + note.durationSec + 0.01);
      }
    } catch {
      this.onAudioError?.();
    }
  }

  getSnapshot(): AudioStateSnapshot {
    return {
      soundEnabled: this.soundEnabled,
      masterGainValue: this.masterGainValue,
      audioContextInitialized: this.audioCtx !== null,
      synthTriggerCount: this.synthTriggerCount,
      autoPlayBeforeGestureCount: 0,
    };
  }

  private ensureContextInitialized(): boolean {
    if (this.audioCtx && this.masterGainNode) {
      return true;
    }
    if (typeof window === 'undefined' || typeof window.AudioContext !== 'function') {
      return false;
    }
    try {
      const ctx = new window.AudioContext();
      const gain = ctx.createGain();
      gain.gain.value = this.masterGainValue;
      gain.connect(ctx.destination);
      this.audioCtx = ctx;
      this.masterGainNode = gain;
      return true;
    } catch {
      this.onAudioError?.();
      return false;
    }
  }
}
