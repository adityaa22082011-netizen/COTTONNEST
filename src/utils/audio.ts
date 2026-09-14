// Web Audio API Synthesizer for Jackpot & Spin the Wheel Sound Effects

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Cached white noise buffer for realistic mechanical impact transient
let noiseBuffer: AudioBuffer | null = null;
function getNoiseBuffer(ctx: AudioContext): AudioBuffer {
  if (!noiseBuffer || noiseBuffer.sampleRate !== ctx.sampleRate) {
    const bufferSize = Math.floor(ctx.sampleRate * 0.05); // 50ms
    noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
  }
  return noiseBuffer;
}

// Continuous mechanical clicking sound effect for the spinning wheel ratchet
export function playMechanicalClick(enabled: boolean, intensity: number = 1, isMajorPeg: boolean = false) {
  if (!enabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    // 1. Sharp mechanical pawl impact (bandpassed noise impulse)
    const noise = ctx.createBufferSource();
    noise.buffer = getNoiseBuffer(ctx);

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    const freq = isMajorPeg ? 2400 + (Math.random() * 400 - 200) : 1800 + (Math.random() * 300 - 150);
    noiseFilter.frequency.setValueAtTime(freq, now);
    noiseFilter.Q.setValueAtTime(isMajorPeg ? 4.5 : 3.2, now);

    const noiseGain = ctx.createGain();
    const peakVol = (isMajorPeg ? 0.09 : 0.055) * Math.min(Math.max(intensity, 0.4), 1.2);
    noiseGain.gain.setValueAtTime(peakVol, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + (isMajorPeg ? 0.035 : 0.022));

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + 0.04);

    // 2. Resonant mechanical tooth body tap (acrylic/wooden body sound)
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();

    osc.type = isMajorPeg ? 'triangle' : 'sine';
    const startFreq = isMajorPeg ? 360 + Math.random() * 30 : 260 + Math.random() * 20;
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + (isMajorPeg ? 0.045 : 0.028));

    const oscVol = (isMajorPeg ? 0.06 : 0.035) * Math.min(Math.max(intensity, 0.4), 1.2);
    oscGain.gain.setValueAtTime(oscVol, now);
    oscGain.gain.exponentialRampToValueAtTime(0.0001, now + (isMajorPeg ? 0.045 : 0.028));

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  } catch {
    // AudioContext autoplay guard
  }
}

// Backward compatibility alias
export function playWheelTickSound(enabled: boolean, pitchMultiplier: number = 1) {
  playMechanicalClick(enabled, pitchMultiplier, true);
}

export function playCelebrationFanfare(enabled: boolean, amount: number) {
  if (!enabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const baseFreq = amount >= 140 ? 523.25 : 440;
    const notes = [
      baseFreq,
      baseFreq * 1.25,
      baseFreq * 1.5,
      baseFreq * 2.0,
    ];

    notes.forEach((freq, index) => {
      const startTime = ctx.currentTime + index * 0.11;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.09, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.5);
    });

    const bellTime = ctx.currentTime + 0.44;
    const bell = ctx.createOscillator();
    const bellGain = ctx.createGain();
    bell.type = 'sine';
    bell.frequency.setValueAtTime(baseFreq * 2.0, bellTime);

    bellGain.gain.setValueAtTime(0.12, bellTime);
    bellGain.gain.exponentialRampToValueAtTime(0.0001, bellTime + 1.2);

    bell.connect(bellGain);
    bellGain.connect(ctx.destination);

    bell.start(bellTime);
    bell.stop(bellTime + 1.2);
  } catch {
    // AudioContext autoplay guard
  }
}

export function playClickSound(enabled: boolean) {
  if (!enabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(650, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch {
    // AudioContext autoplay guard
  }
}
