export type Soundscape = "off" | "rain" | "wind" | "drift" | "cafe";

// Helper to generate Pink Noise (1/f response)
export function createPinkNoiseBuffer(context: AudioContext, duration = 4): AudioBuffer {
  const bufferSize = context.sampleRate * duration;
  const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
  const output = buffer.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    b3 = 0.86650 * b3 + white * 0.3104856;
    b4 = 0.55000 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.0168980;
    output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
    output[i] *= 0.15; // Normalized amplitude
    b6 = white * 0.115926;
  }
  return buffer;
}

// Helper to generate Brown Noise (1/f^2 response)
export function createBrownNoiseBuffer(context: AudioContext, duration = 4): AudioBuffer {
  const bufferSize = context.sampleRate * duration;
  const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
  const output = buffer.getChannelData(0);
  let lastOutput = 0.0;

  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    output[i] = (lastOutput + 0.02 * white) / 1.02;
    lastOutput = output[i];
    output[i] *= 2.5; // Gain boost
  }
  return buffer;
}

export interface SoundInstance {
  stop: () => void;
}

export function synthesizeSoundscape(
  type: Soundscape,
  context: AudioContext,
  masterGain: GainNode,
  isPlaying: boolean
): { instance: SoundInstance | null; intervalId: number | null } {
  if (type === "off") return { instance: null, intervalId: null };

  let intervalId: number | null = null;
  let instance: SoundInstance | null = null;

  if (type === "rain") {
    const pinkBuffer = createPinkNoiseBuffer(context, 4);
    const noiseSource = context.createBufferSource();
    noiseSource.buffer = pinkBuffer;
    noiseSource.loop = true;

    const rainFilter = context.createBiquadFilter();
    rainFilter.type = "lowpass";
    rainFilter.frequency.value = 1800;

    const bandFilter = context.createBiquadFilter();
    bandFilter.type = "peaking";
    bandFilter.frequency.value = 3200;
    bandFilter.gain.value = 4;
    bandFilter.Q.value = 1.0;

    noiseSource.connect(rainFilter).connect(bandFilter).connect(masterGain);
    noiseSource.start();

    intervalId = window.setInterval(() => {
      if (context.state !== "running" || !isPlaying) return;
      const osc = context.createOscillator();
      const dropGain = context.createGain();

      const freq = 1200 + Math.random() * 1600;
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, context.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.35, context.currentTime + 0.04);

      dropGain.gain.setValueAtTime(0.08, context.currentTime);
      dropGain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.05);

      osc.connect(dropGain).connect(masterGain);
      osc.start();
      osc.stop(context.currentTime + 0.06);
    }, 80 + Math.random() * 100);

    instance = {
      stop: () => {
        try {
          noiseSource.stop();
        } catch {}
      },
    };
  } else if (type === "wind") {
    const brownBuffer = createBrownNoiseBuffer(context, 5);
    const windNoise = context.createBufferSource();
    windNoise.buffer = brownBuffer;
    windNoise.loop = true;

    const windFilter = context.createBiquadFilter();
    windFilter.type = "lowpass";
    windFilter.frequency.value = 350;

    const lfo = context.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 0.18;

    const lfoGain = context.createGain();
    lfoGain.gain.value = 280;

    lfo.connect(lfoGain);
    lfoGain.connect(windFilter.frequency);

    const howlFilter = context.createBiquadFilter();
    howlFilter.type = "bandpass";
    howlFilter.frequency.value = 420;
    howlFilter.Q.value = 2.5;

    windNoise.connect(windFilter).connect(masterGain);
    windNoise.connect(howlFilter).connect(masterGain);
    windNoise.start();
    lfo.start();

    instance = {
      stop: () => {
        try {
          windNoise.stop();
          lfo.stop();
        } catch {}
      },
    };
  } else if (type === "drift") {
    const chordFrequencies = [77.78, 155.56, 196.0, 233.08, 293.66, 349.23];
    const oscs: OscillatorNode[] = [];
    const lfo = context.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 0.2;

    const lfoGain = context.createGain();
    lfoGain.gain.value = 1.5;
    lfo.start();

    const padFilter = context.createBiquadFilter();
    padFilter.type = "lowpass";
    padFilter.frequency.value = 900;

    chordFrequencies.forEach((freq, idx) => {
      const osc = context.createOscillator();
      const oscGain = context.createGain();
      osc.type = idx === 0 ? "sine" : "triangle";
      osc.frequency.value = freq;

      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      oscGain.gain.value = idx === 0 ? 0.12 : 0.06;
      osc.connect(oscGain).connect(padFilter);
      osc.start();
      oscs.push(osc);
    });

    padFilter.connect(masterGain);

    instance = {
      stop: () => {
        oscs.forEach((o) => {
          try {
            o.stop();
          } catch {}
        });
        try {
          lfo.stop();
        } catch {}
      },
    };
  } else if (type === "cafe") {
    const pinkBuffer = createPinkNoiseBuffer(context, 4);
    const cafeNoise = context.createBufferSource();
    cafeNoise.buffer = pinkBuffer;
    cafeNoise.loop = true;

    const cafeFilter = context.createBiquadFilter();
    cafeFilter.type = "bandpass";
    cafeFilter.frequency.value = 650;
    cafeFilter.Q.value = 0.8;

    cafeNoise.connect(cafeFilter).connect(masterGain);
    cafeNoise.start();

    intervalId = window.setInterval(() => {
      if (context.state !== "running" || !isPlaying) return;
      const osc = context.createOscillator();
      const clinkGain = context.createGain();
      const freq = 2600 + Math.random() * 800;

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, context.currentTime);

      clinkGain.gain.setValueAtTime(0.04, context.currentTime);
      clinkGain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.12);

      osc.connect(clinkGain).connect(masterGain);
      osc.start();
      osc.stop(context.currentTime + 0.15);
    }, 3500 + Math.random() * 3000);

    instance = {
      stop: () => {
        try {
          cafeNoise.stop();
        } catch {}
      },
    };
  }

  return { instance, intervalId };
}
