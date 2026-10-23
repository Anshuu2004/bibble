export type Soundscape =
  | "off"
  | "rain"
  | "wind"
  | "drift"
  | "cafe"
  | "minecraft"
  | "nature";

export interface SoundInstance {
  stop: (fadeSeconds?: number) => void;
}

// ---------------------------------------------------------------------------
// Noise generation
// ---------------------------------------------------------------------------

function fillWhiteNoise(channel: Float32Array): void {
  for (let i = 0; i < channel.length; i++) {
    channel[i] = Math.random() * 2 - 1;
  }
}

function fillPinkNoise(channel: Float32Array): void {
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < channel.length; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    b3 = 0.86650 * b3 + white * 0.3104856;
    b4 = 0.55000 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.0168980;
    channel[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
    channel[i] *= 0.15;
    b6 = white * 0.115926;
  }
}

function fillBrownNoise(channel: Float32Array): void {
  let lastOutput = 0;
  for (let i = 0; i < channel.length; i++) {
    const white = Math.random() * 2 - 1;
    channel[i] = (lastOutput + 0.02 * white) / 1.02;
    lastOutput = channel[i];
    channel[i] *= 2.5;
  }
}

export type NoiseKind = "pink" | "brown" | "white";

// The tail is folded into the head so the buffer loops without a seam click.
export function createStereoNoiseBuffer(
  context: AudioContext,
  duration = 4,
  kind: NoiseKind = "pink"
): AudioBuffer {
  const loopSamples = Math.floor(context.sampleRate * duration);
  const fadeSamples = Math.floor(context.sampleRate * Math.min(0.75, duration * 0.15));
  const rawSamples = loopSamples + fadeSamples;
  const buffer = context.createBuffer(2, loopSamples, context.sampleRate);

  for (let channelIndex = 0; channelIndex < 2; channelIndex++) {
    const raw = new Float32Array(rawSamples);
    if (kind === "pink") fillPinkNoise(raw);
    else if (kind === "brown") fillBrownNoise(raw);
    else fillWhiteNoise(raw);

    const channel = buffer.getChannelData(channelIndex);
    const crossfade = Math.min(fadeSamples, loopSamples);
    for (let i = 0; i < loopSamples; i++) {
      if (i < crossfade) {
        const weight = i / crossfade;
        channel[i] = raw[i] * weight + raw[loopSamples + i] * (1 - weight);
      } else {
        channel[i] = raw[i];
      }
    }
  }

  return buffer;
}

export function createPinkNoiseBuffer(context: AudioContext, duration = 4): AudioBuffer {
  return createStereoNoiseBuffer(context, duration, "pink");
}

export function createBrownNoiseBuffer(context: AudioContext, duration = 4): AudioBuffer {
  return createStereoNoiseBuffer(context, duration, "brown");
}

const NOISE_LOOP_SECONDS = 12;
const noiseCache = new WeakMap<AudioContext, Map<NoiseKind, AudioBuffer>>();

function getNoiseBuffer(context: AudioContext, kind: NoiseKind): AudioBuffer {
  let cache = noiseCache.get(context);
  if (!cache) {
    cache = new Map();
    noiseCache.set(context, cache);
  }
  let buffer = cache.get(kind);
  if (!buffer) {
    buffer = createStereoNoiseBuffer(context, NOISE_LOOP_SECONDS, kind);
    cache.set(kind, buffer);
  }
  return buffer;
}

// ---------------------------------------------------------------------------
// Reverb — a synthesized, energy-normalized impulse response. No external audio.
// ---------------------------------------------------------------------------

const REVERB_SECONDS = 3.4;
const reverbCache = new WeakMap<AudioContext, AudioBuffer>();

function createReverbImpulse(context: AudioContext): AudioBuffer {
  const sampleRate = context.sampleRate;
  const length = Math.floor(sampleRate * REVERB_SECONDS);
  const preDelay = Math.floor(sampleRate * 0.022);
  const buffer = context.createBuffer(2, length, sampleRate);
  let totalEnergy = 0;

  for (let channelIndex = 0; channelIndex < 2; channelIndex++) {
    const data = buffer.getChannelData(channelIndex);
    const smooth = channelIndex === 0 ? 0.2 : 0.16;
    let filtered = 0;
    for (let i = 0; i < length; i++) {
      if (i < preDelay) continue;
      const position = (i - preDelay) / (length - preDelay);
      const envelope = Math.pow(1 - position, 2.8);
      filtered += (Math.random() * 2 - 1 - filtered) * smooth;
      data[i] = filtered * envelope;
      totalEnergy += data[i] * data[i];
    }
  }

  // Equal-energy normalization keeps the wet level predictable next to the dry mix.
  if (totalEnergy > 0) {
    const scale = 1 / Math.sqrt(totalEnergy);
    for (let channelIndex = 0; channelIndex < 2; channelIndex++) {
      const data = buffer.getChannelData(channelIndex);
      for (let i = 0; i < length; i++) data[i] *= scale;
    }
  }

  return buffer;
}

function getReverbImpulse(context: AudioContext): AudioBuffer {
  let impulse = reverbCache.get(context);
  if (!impulse) {
    impulse = createReverbImpulse(context);
    reverbCache.set(context, impulse);
  }
  return impulse;
}

// ---------------------------------------------------------------------------
// Sound bag — every node, source and timer is registered for safe cleanup.
// ---------------------------------------------------------------------------

interface SoundBag {
  context: AudioContext;
  input: GainNode;
  bus: GainNode;
  nodes: Set<AudioNode>;
  sources: Set<AudioScheduledSourceNode>;
  oneShotNodes: Set<AudioNode>;
  transientSources: Set<AudioScheduledSourceNode>;
  timers: Set<number>;
  stopped: boolean;
  fadeOutSeconds: number;
}

function trackNode<T extends AudioNode>(bag: SoundBag, node: T): T {
  bag.nodes.add(node);
  return node;
}

function trackSource<T extends AudioScheduledSourceNode>(bag: SoundBag, source: T): T {
  bag.sources.add(source);
  return source;
}

// One-shot voices register their nodes with finalizeOneShot instead, so these
// helpers only attach to the long-lived set unless `oneShot` is set.
function createGain(bag: SoundBag, value = 1, oneShot = false): GainNode {
  const gain = bag.context.createGain();
  gain.gain.value = value;
  return oneShot ? gain : trackNode(bag, gain);
}

function createFilter(
  bag: SoundBag,
  type: BiquadFilterType,
  frequency: number,
  q = 0.7,
  oneShot = false
): BiquadFilterNode {
  const filter = bag.context.createBiquadFilter();
  filter.type = type;
  filter.frequency.value = frequency;
  filter.Q.value = q;
  return oneShot ? filter : trackNode(bag, filter);
}

function createPanner(bag: SoundBag, pan = 0, oneShot = false): StereoPannerNode {
  const panner = bag.context.createStereoPanner();
  panner.pan.value = pan;
  return oneShot ? panner : trackNode(bag, panner);
}

function startNoise(bag: SoundBag, kind: NoiseKind, rate = 1): AudioBufferSourceNode {
  const source = bag.context.createBufferSource();
  const buffer = getNoiseBuffer(bag.context, kind);
  source.buffer = buffer;
  source.loop = true;
  source.playbackRate.value = rate;
  trackSource(bag, source);
  source.start(0, Math.random() * Math.max(0, buffer.duration - 1));
  return source;
}

interface FilterSpec {
  type: BiquadFilterType;
  frequency: number;
  q?: number;
}

interface NoiseLayer {
  source: AudioBufferSourceNode;
  gain: GainNode;
  panner: StereoPannerNode;
  filters: BiquadFilterNode[];
}

function startNoiseLayer(
  bag: SoundBag,
  kind: NoiseKind,
  filters: FilterSpec[],
  level: number,
  pan = 0,
  rate = 1
): NoiseLayer {
  const source = startNoise(bag, kind, rate);
  const filterNodes: BiquadFilterNode[] = [];
  let tail: AudioNode = source;

  for (const spec of filters) {
    const filter = createFilter(bag, spec.type, spec.frequency, spec.q);
    tail.connect(filter);
    tail = filter;
    filterNodes.push(filter);
  }

  const gain = createGain(bag, level);
  const panner = createPanner(bag, pan);
  tail.connect(gain).connect(panner).connect(bag.input);

  return { source, gain, panner, filters: filterNodes };
}

function addSlowLfo(
  bag: SoundBag,
  target: AudioParam,
  rate: number,
  depth: number,
  type: OscillatorType = "sine"
): void {
  const lfo = bag.context.createOscillator();
  const lfoDepth = bag.context.createGain();
  lfo.type = type;
  lfo.frequency.value = rate * randomBetween(0.85, 1.15);
  lfoDepth.gain.value = depth;
  trackSource(bag, lfo);
  trackNode(bag, lfoDepth);
  lfo.connect(lfoDepth).connect(target);
  lfo.start();
}

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

const MIN_GAIN = 0.0001;

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function scheduleRepeating(
  bag: SoundBag,
  nextDelay: () => number,
  fn: () => void
): void {
  const run = () => {
    if (bag.stopped) return;
    const id = window.setTimeout(() => {
      bag.timers.delete(id);
      if (bag.stopped) return;
      fn();
      run();
    }, Math.max(0, nextDelay()));
    bag.timers.add(id);
  };
  run();
}

function scheduleEvent(
  bag: SoundBag,
  minMs: number,
  maxMs: number,
  fn: () => void
): void {
  scheduleRepeating(bag, () => randomBetween(minMs, maxMs), fn);
}

function finalizeOneShot(
  bag: SoundBag,
  sources: AudioScheduledSourceNode[],
  nodes: AudioNode[]
): void {
  for (const source of sources) {
    bag.transientSources.add(source);
  }
  for (const node of nodes) {
    bag.oneShotNodes.add(node);
  }

  // Partials can end in any order, so wait for every source before tearing the
  // voice down; disconnecting early would cut a chime or clink short.
  let remaining = sources.length;
  const release = () => {
    remaining -= 1;
    if (remaining > 0) return;
    for (const source of sources) bag.transientSources.delete(source);
    for (const node of nodes) {
      bag.oneShotNodes.delete(node);
      try {
        node.disconnect();
      } catch {}
    }
  };

  for (const source of sources) {
    source.addEventListener("ended", release, { once: true });
  }
}

function fadeGain(
  param: AudioParam,
  target: number,
  seconds: number,
  context: AudioContext
): void {
  const now = context.currentTime;
  const current = param.value;
  param.cancelScheduledValues(now);
  try {
    param.cancelAndHoldAtTime(now);
  } catch {}
  param.setValueAtTime(current, now);
  param.linearRampToValueAtTime(target, now + Math.max(0.01, seconds));
}

function stopBag(bag: SoundBag): void {
  for (const id of bag.timers) window.clearTimeout(id);
  bag.timers.clear();

  const allSources = [...bag.sources, ...bag.transientSources];
  for (const source of allSources) {
    try {
      source.stop();
    } catch {}
    try {
      source.disconnect();
    } catch {}
  }
  bag.sources.clear();
  bag.transientSources.clear();

  for (const node of bag.nodes) {
    try {
      node.disconnect();
    } catch {}
  }
  for (const node of bag.oneShotNodes) {
    try {
      node.disconnect();
    } catch {}
  }
  bag.nodes.clear();
  bag.oneShotNodes.clear();
}

// ---------------------------------------------------------------------------
// One-shot voices
// ---------------------------------------------------------------------------

function playRainDrop(bag: SoundBag, level: number, delay = 0): void {
  const context = bag.context;
  const t = context.currentTime + 0.03 + delay;
  const osc = context.createOscillator();
  const filter = createFilter(bag, "lowpass", randomBetween(1600, 3000), 0.6, true);
  const gain = createGain(bag, 0, true);
  const panner = createPanner(bag, randomBetween(-0.5, 0.5), true);

  const startFrequency = randomBetween(480, 1150);
  const endFrequency = startFrequency * randomBetween(0.62, 0.88);
  const attack = randomBetween(0.008, 0.02);
  const decay = randomBetween(0.12, 0.3);
  const peak = level * randomBetween(0.65, 1.1);

  osc.type = "sine";
  osc.frequency.setValueAtTime(startFrequency, t);
  osc.frequency.exponentialRampToValueAtTime(endFrequency, t + attack + decay * 0.6);
  gain.gain.setValueAtTime(MIN_GAIN, t);
  gain.gain.exponentialRampToValueAtTime(peak, t + attack);
  gain.gain.exponentialRampToValueAtTime(MIN_GAIN, t + attack + decay);

  osc.connect(filter).connect(gain).connect(panner).connect(bag.input);
  osc.start(t);
  osc.stop(t + attack + decay + 0.04);

  finalizeOneShot(bag, [osc], [osc, filter, gain, panner]);
}

function playCupClink(bag: SoundBag, delay = 0): void {
  const context = bag.context;
  const t = context.currentTime + 0.04 + delay;
  const base = randomBetween(1500, 2500);
  const filter = createFilter(bag, "lowpass", 4800, 0.4, true);
  const panner = createPanner(bag, randomBetween(-0.35, 0.35), true);
  const nodes: AudioNode[] = [];
  const sources: AudioScheduledSourceNode[] = [];

  filter.connect(panner).connect(bag.input);
  nodes.push(filter, panner);

  const partials: Array<{ ratio: number; level: number; decay: number }> = [
    { ratio: 1, level: 0.005, decay: randomBetween(0.24, 0.44) },
    { ratio: 2.71, level: 0.0014, decay: randomBetween(0.14, 0.24) },
  ];

  for (const partial of partials) {
    const osc = context.createOscillator();
    const gain = createGain(bag, 0, true);
    osc.type = "sine";
    osc.frequency.value = base * partial.ratio;
    const attack = 0.008;
    gain.gain.setValueAtTime(MIN_GAIN, t);
    gain.gain.exponentialRampToValueAtTime(partial.level * randomBetween(0.8, 1.15), t + attack);
    gain.gain.exponentialRampToValueAtTime(MIN_GAIN, t + attack + partial.decay);
    osc.connect(gain).connect(filter);
    osc.start(t);
    osc.stop(t + attack + partial.decay + 0.04);
    sources.push(osc);
    nodes.push(osc, gain);
  }

  finalizeOneShot(bag, sources, nodes);
}

function playRoomMovement(bag: SoundBag, delay = 0): void {
  const context = bag.context;
  const t = context.currentTime + 0.05 + delay;
  const source = context.createBufferSource();
  source.buffer = getNoiseBuffer(context, "white");
  const filter = createFilter(bag, "lowpass", randomBetween(220, 440), 0.7, true);
  const gain = createGain(bag, 0, true);
  const panner = createPanner(bag, randomBetween(-0.55, 0.55), true);

  source.connect(filter).connect(gain).connect(panner).connect(bag.input);
  const attack = randomBetween(0.12, 0.3);
  const decay = randomBetween(0.35, 0.7);
  gain.gain.setValueAtTime(MIN_GAIN, t);
  gain.gain.linearRampToValueAtTime(randomBetween(0.004, 0.007), t + attack);
  gain.gain.exponentialRampToValueAtTime(MIN_GAIN, t + attack + decay);

  source.start(t, Math.random() * (source.buffer.duration - 1));
  source.stop(t + attack + decay + 0.05);

  finalizeOneShot(bag, [source], [source, filter, gain, panner]);
}

// ---------------------------------------------------------------------------
// Rain
// ---------------------------------------------------------------------------

function buildRain(bag: SoundBag): void {
  // Main bed: soft, slightly distant rain.
  const bed = startNoiseLayer(
    bag,
    "pink",
    [
      { type: "highpass", frequency: 90, q: 0.7 },
      { type: "lowpass", frequency: 1400, q: 0.6 },
    ],
    0.26
  );
  addSlowLfo(bag, bed.gain.gain, 0.031, 0.05);
  addSlowLfo(bag, bed.filters[1].frequency, 0.043, 170);
  addSlowLfo(bag, bed.panner.pan, 0.017, 0.08);

  // A second decorrelated bed so the texture never settles into a fixed hiss.
  const drift = startNoiseLayer(
    bag,
    "pink",
    [
      { type: "highpass", frequency: 140, q: 0.7 },
      { type: "lowpass", frequency: 1000, q: 0.6 },
    ],
    0.11,
    -0.12,
    0.97
  );
  addSlowLfo(bag, drift.gain.gain, 0.023, 0.035);
  addSlowLfo(bag, drift.filters[1].frequency, 0.037, 120);
  addSlowLfo(bag, drift.panner.pan, 0.011, 0.14);

  // Fine rain: bright, quiet detail above the bed.
  const fine = startNoiseLayer(
    bag,
    "pink",
    [
      { type: "highpass", frequency: 1900, q: 0.6 },
      { type: "lowpass", frequency: 6200, q: 0.4 },
    ],
    0.062,
    0.1
  );
  addSlowLfo(bag, fine.gain.gain, 0.061, 0.016);
  addSlowLfo(bag, fine.panner.pan, 0.027, 0.16);

  // Distant low rumble for depth.
  const distance = startNoiseLayer(
    bag,
    "brown",
    [{ type: "lowpass", frequency: 190, q: 0.7 }],
    0.09,
    0
  );
  addSlowLfo(bag, distance.gain.gain, 0.019, 0.025);
  addSlowLfo(bag, distance.panner.pan, 0.013, 0.1);

  // Sparse droplets, occasionally arriving as a short soft cluster.
  scheduleEvent(bag, 240, 900, () => {
    playRainDrop(bag, 0.014);
    if (Math.random() < 0.22) {
      const cluster = Math.floor(randomBetween(1, 3));
      for (let i = 0; i < cluster; i++) {
        playRainDrop(bag, 0.01, randomBetween(0.05, 0.24));
      }
    }
  });
}

// ---------------------------------------------------------------------------
// Wind
// ---------------------------------------------------------------------------

function buildWind(bag: SoundBag): void {
  const body = startNoiseLayer(
    bag,
    "brown",
    [{ type: "lowpass", frequency: 360, q: 0.45 }],
    0.28
  );
  addSlowLfo(bag, body.filters[0].frequency, 0.041, 150);
  addSlowLfo(bag, body.gain.gain, 0.027, 0.065);
  addSlowLfo(bag, body.panner.pan, 0.019, 0.22);

  // A quiet band-passed layer supplies the airy "outside a window" quality.
  const air = startNoiseLayer(
    bag,
    "pink",
    [
      { type: "highpass", frequency: 240, q: 0.6 },
      { type: "bandpass", frequency: 760, q: 1.1 },
    ],
    0.085,
    0.15
  );
  addSlowLfo(bag, air.filters[1].frequency, 0.031, 140);
  addSlowLfo(bag, air.gain.gain, 0.043, 0.024);
  addSlowLfo(bag, air.panner.pan, 0.013, 0.24);

  const lower = startNoiseLayer(
    bag,
    "brown",
    [{ type: "lowpass", frequency: 160, q: 0.6 }],
    0.1,
    -0.2,
    0.94
  );
  addSlowLfo(bag, lower.gain.gain, 0.017, 0.028);
}

// ---------------------------------------------------------------------------
// Drift
// ---------------------------------------------------------------------------

function buildDrift(bag: SoundBag): void {
  const padFilter = createFilter(bag, "lowpass", 780, 0.35);
  padFilter.connect(bag.input);
  addSlowLfo(bag, padFilter.frequency, 0.011, 150);

  // Open fifths and ninths: calm, spacious, with no leading tone or melody.
  const voices: Array<{
    frequency: number;
    type: OscillatorType;
    level: number;
    pan: number;
    swellRate: number;
    detune: number;
  }> = [
    { frequency: 73.42, type: "sine", level: 0.026, pan: -0.18, swellRate: 0.008, detune: -4 },
    { frequency: 110, type: "sine", level: 0.022, pan: 0.24, swellRate: 0.011, detune: 3 },
    { frequency: 146.83, type: "triangle", level: 0.014, pan: -0.3, swellRate: 0.013, detune: -2 },
    { frequency: 164.81, type: "sine", level: 0.012, pan: 0.34, swellRate: 0.009, detune: 5 },
    { frequency: 220, type: "triangle", level: 0.009, pan: -0.12, swellRate: 0.015, detune: -3 },
    { frequency: 293.66, type: "sine", level: 0.006, pan: 0.15, swellRate: 0.007, detune: 2 },
    { frequency: 440, type: "sine", level: 0.004, pan: -0.36, swellRate: 0.01, detune: -5 },
  ];

  for (const voice of voices) {
    const osc = bag.context.createOscillator();
    const gain = createGain(bag, voice.level);
    const panner = createPanner(bag, voice.pan);

    osc.type = voice.type;
    osc.frequency.value = voice.frequency;
    osc.detune.value = voice.detune;
    trackSource(bag, osc);

    addSlowLfo(bag, osc.detune, 0.004 + Math.random() * 0.003, 3);
    addSlowLfo(bag, gain.gain, voice.swellRate, voice.level * 0.55);
    addSlowLfo(bag, panner.pan, 0.003 + Math.random() * 0.004, 0.1);

    osc.connect(gain).connect(panner).connect(padFilter);
    osc.start();
  }

  // A whisper of air keeps the pad from feeling completely synthetic.
  const air = startNoiseLayer(
    bag,
    "pink",
    [{ type: "highpass", frequency: 2600, q: 0.5 }],
    0.008,
    0
  );
  addSlowLfo(bag, air.gain.gain, 0.021, 0.003);
  addSlowLfo(bag, air.panner.pan, 0.007, 0.25);
}

// ---------------------------------------------------------------------------
// Cafe
// ---------------------------------------------------------------------------

function buildCafe(bag: SoundBag): void {
  const room = startNoiseLayer(
    bag,
    "pink",
    [
      { type: "highpass", frequency: 70, q: 0.6 },
      { type: "lowpass", frequency: 720, q: 0.5 },
    ],
    0.1
  );
  addSlowLfo(bag, room.gain.gain, 0.024, 0.016);
  addSlowLfo(bag, room.filters[1].frequency, 0.017, 90);
  addSlowLfo(bag, room.panner.pan, 0.009, 0.08);

  const warmth = startNoiseLayer(
    bag,
    "brown",
    [{ type: "lowpass", frequency: 170, q: 0.6 }],
    0.07,
    0.06
  );
  addSlowLfo(bag, warmth.gain.gain, 0.013, 0.02);

  // Distant, indistinct conversation — two softly undulating voices, never words.
  const murmur = startNoiseLayer(
    bag,
    "pink",
    [
      { type: "bandpass", frequency: 480, q: 1.3 },
      { type: "lowpass", frequency: 1400, q: 0.5 },
    ],
    0.032,
    -0.25,
    0.96
  );
  addSlowLfo(bag, murmur.gain.gain, 0.083, 0.011);
  addSlowLfo(bag, murmur.filters[0].frequency, 0.021, 70);
  addSlowLfo(bag, murmur.panner.pan, 0.019, 0.16);

  const murmurTwo = startNoiseLayer(
    bag,
    "pink",
    [{ type: "bandpass", frequency: 980, q: 1.7 }],
    0.012,
    0.3,
    1.02
  );
  addSlowLfo(bag, murmurTwo.gain.gain, 0.061, 0.005);
  addSlowLfo(bag, murmurTwo.panner.pan, 0.013, 0.2);

  // A touch of soft air keeps the room from sounding boxy.
  const air = startNoiseLayer(
    bag,
    "white",
    [
      { type: "highpass", frequency: 3000, q: 0.5 },
      { type: "lowpass", frequency: 7000, q: 0.4 },
    ],
    0.008,
    0.16
  );
  addSlowLfo(bag, air.gain.gain, 0.037, 0.0025);

  // Rare, soft cup clinks and distant movement; the room stays calm.
  scheduleEvent(bag, 9000, 22000, () => {
    playCupClink(bag);
    if (Math.random() < 0.35) playCupClink(bag, randomBetween(0.06, 0.14));
  });
  scheduleEvent(bag, 15000, 34000, () => {
    playRoomMovement(bag);
  });
}

// ---------------------------------------------------------------------------
// Bundled ambience loops — decoded once per file, trimmed and crossfaded into
// seamless loops.
// ---------------------------------------------------------------------------

const NATURE_LOOP_URL = "/audio/nature-loop.mp3";

const musicBufferCache = new Map<string, Promise<AudioBuffer>>();
const preparedLoopCache = new Map<string, AudioBuffer>();

function loadMusicBuffer(context: AudioContext, url: string): Promise<AudioBuffer> {
  let pending = musicBufferCache.get(url);
  if (!pending) {
    pending = fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch ${url}: ${response.status}`);
        }
        return response.arrayBuffer();
      })
      .then((data) => context.decodeAudioData(data))
      .catch((err) => {
        musicBufferCache.delete(url);
        throw err;
      });
    musicBufferCache.set(url, pending);
  }
  return pending;
}

// Trims encoder silence at both ends, then folds the tail into the head with a
// crossfade so the file loops without a seam click or gap.
function prepareMusicLoop(context: AudioContext, buffer: AudioBuffer): AudioBuffer {
  const channels = [
    buffer.getChannelData(0),
    buffer.getChannelData(buffer.numberOfChannels > 1 ? 1 : 0),
  ];
  const total = buffer.length;
  const block = 512;
  const blocks = Math.floor(total / block);

  let peak = 0;
  let sumSquares = 0;
  for (const data of channels) {
    for (let i = 0; i < total; i++) {
      const v = data[i];
      sumSquares += v * v;
      const a = Math.abs(v);
      if (a > peak) peak = a;
    }
  }
  const rms = Math.sqrt(sumSquares / (total * channels.length));
  const threshold = Math.max(peak * 0.01, rms * 0.15, 0.001);

  const blockPeak = (index: number): number => {
    let max = 0;
    const from = index * block;
    const to = Math.min(total, from + block);
    for (const data of channels) {
      for (let i = from; i < to; i++) {
        const a = Math.abs(data[i]);
        if (a > max) max = a;
      }
    }
    return max;
  };

  let firstBlock = 0;
  while (firstBlock < blocks && blockPeak(firstBlock) <= threshold) firstBlock++;
  let lastBlock = blocks - 1;
  while (lastBlock > firstBlock && blockPeak(lastBlock) <= threshold) lastBlock--;

  const padding = 512;
  const start = Math.max(0, firstBlock * block - padding);
  const end = Math.min(total, (lastBlock + 1) * block + padding);
  const loopLength = Math.max(block * 2, end - start);

  const loop = context.createBuffer(2, loopLength, buffer.sampleRate);
  const crossfadeSamples = Math.floor(Math.min(1, loopLength / buffer.sampleRate / 10) * buffer.sampleRate);
  const out0 = loop.getChannelData(0);
  const out1 = loop.getChannelData(1);
  const tail0 = out0.length - crossfadeSamples;
  const tail1 = out1.length - crossfadeSamples;

  for (let channelIndex = 0; channelIndex < 2; channelIndex++) {
    const input = channels[channelIndex];
    const output = channelIndex === 0 ? out0 : out1;
    for (let i = 0; i < loopLength; i++) {
      output[i] = input[start + i] ?? 0;
    }
  }
  for (let i = 0; i < crossfadeSamples; i++) {
    const weight = i / crossfadeSamples;
    out0[i] = out0[i] * weight + out0[tail0 + i] * (1 - weight);
    out1[i] = out1[i] * weight + out1[tail1 + i] * (1 - weight);
  }

  return loop;
}

function getMusicLoop(context: AudioContext, url: string): Promise<AudioBuffer> {
  const prepared = preparedLoopCache.get(url);
  if (prepared) return Promise.resolve(prepared);
  return loadMusicBuffer(context, url).then((buffer) => {
    let loop = preparedLoopCache.get(url);
    if (!loop) {
      loop = prepareMusicLoop(context, buffer);
      preparedLoopCache.set(url, loop);
    }
    return loop;
  });
}

function buildFileLoop(url: string): (bag: SoundBag) => Promise<void> {
  return async (bag: SoundBag) => {
    const loop = await getMusicLoop(bag.context, url);
    if (bag.stopped) return;

    const source = bag.context.createBufferSource();
    source.buffer = loop;
    source.loop = true;
    trackSource(bag, source);
    source.connect(bag.input);
    source.start();
  };
}

// ---------------------------------------------------------------------------
// Minecraft — peaceful rainy nighttime atmosphere: soft rain, gentle wind, a
// dreamy drifting pad and extremely rare chimes. Fully synthesized, no
// recorded audio.
// ---------------------------------------------------------------------------

const CHIME_NOTES = [392, 440, 523.25, 587.33, 659.25, 783.99];

function playChime(bag: SoundBag): void {
  const context = bag.context;
  const t = context.currentTime + 0.06;
  const base =
    CHIME_NOTES[Math.floor(Math.random() * CHIME_NOTES.length)] *
    (Math.random() < 0.3 ? 2 : 1);
  const filter = createFilter(bag, "lowpass", randomBetween(2000, 3000), 0.35, true);
  const panner = createPanner(bag, randomBetween(-0.4, 0.4), true);
  const nodes: AudioNode[] = [];
  const sources: AudioScheduledSourceNode[] = [];
  filter.connect(panner).connect(bag.input);
  nodes.push(filter, panner);

  const partials: Array<{
    ratio: number;
    level: number;
    decay: number;
    type: OscillatorType;
  }> = [
    { ratio: 1, level: randomBetween(0.012, 0.018), decay: randomBetween(4, 6.5), type: "sine" },
    { ratio: 2.004, level: 0.005, decay: randomBetween(2.4, 3.6), type: "sine" },
    { ratio: 2.98, level: 0.002, decay: randomBetween(1.6, 2.4), type: "triangle" },
  ];

  for (const partial of partials) {
    const osc = context.createOscillator();
    const gain = createGain(bag, 0, true);
    osc.type = partial.type;
    osc.frequency.value = base * partial.ratio;
    osc.detune.value = randomBetween(-5, 5);
    const attack = randomBetween(0.02, 0.06);
    gain.gain.setValueAtTime(MIN_GAIN, t);
    gain.gain.exponentialRampToValueAtTime(partial.level, t + attack);
    gain.gain.exponentialRampToValueAtTime(MIN_GAIN, t + attack + partial.decay);
    osc.connect(gain).connect(filter);
    osc.start(t);
    osc.stop(t + attack + partial.decay + 0.1);
    sources.push(osc);
    nodes.push(osc, gain);
  }

  finalizeOneShot(bag, sources, nodes);
}

function buildMinecraft(bag: SoundBag): void {
  // Rain heard from inside: softer and more distant than the dedicated Rain bed.
  const rain = startNoiseLayer(
    bag,
    "pink",
    [
      { type: "highpass", frequency: 120, q: 0.6 },
      { type: "lowpass", frequency: 900, q: 0.5 },
    ],
    0.2
  );
  addSlowLfo(bag, rain.gain.gain, 0.029, 0.035);
  addSlowLfo(bag, rain.filters[1].frequency, 0.037, 120);
  addSlowLfo(bag, rain.panner.pan, 0.013, 0.06);

  const fineRain = startNoiseLayer(
    bag,
    "pink",
    [
      { type: "highpass", frequency: 1800, q: 0.6 },
      { type: "lowpass", frequency: 5200, q: 0.4 },
    ],
    0.04,
    -0.08
  );
  addSlowLfo(bag, fineRain.gain.gain, 0.047, 0.012);

  const distance = startNoiseLayer(
    bag,
    "brown",
    [{ type: "lowpass", frequency: 170, q: 0.7 }],
    0.06
  );
  addSlowLfo(bag, distance.gain.gain, 0.017, 0.018);

  // Subtle wind under the rain.
  const wind = startNoiseLayer(
    bag,
    "brown",
    [{ type: "lowpass", frequency: 220, q: 0.5 }],
    0.045,
    0.18,
    0.96
  );
  addSlowLfo(bag, wind.filters[0].frequency, 0.027, 60);
  addSlowLfo(bag, wind.gain.gain, 0.021, 0.014);
  addSlowLfo(bag, wind.panner.pan, 0.015, 0.18);

  // A small, distant stream.
  const water = startNoiseLayer(
    bag,
    "pink",
    [
      { type: "bandpass", frequency: 560, q: 0.7 },
      { type: "lowpass", frequency: 2400, q: 0.5 },
    ],
    0.026,
    -0.24
  );
  addSlowLfo(bag, water.filters[0].frequency, 0.061, 90);
  addSlowLfo(bag, water.gain.gain, 0.093, 0.008);

  // Dreamy pad: open fifths and a ninth, drifting very slowly.
  const padFilter = createFilter(bag, "lowpass", 620, 0.35);
  padFilter.connect(bag.input);
  addSlowLfo(bag, padFilter.frequency, 0.009, 110);

  const padVoices: Array<{
    frequency: number;
    type: OscillatorType;
    level: number;
    pan: number;
    swellRate: number;
  }> = [
    { frequency: 110, type: "sine", level: 0.022, pan: -0.22, swellRate: 0.007 },
    { frequency: 164.81, type: "triangle", level: 0.014, pan: 0.28, swellRate: 0.01 },
    { frequency: 220, type: "sine", level: 0.01, pan: -0.1, swellRate: 0.012 },
    { frequency: 246.94, type: "sine", level: 0.007, pan: 0.18, swellRate: 0.008 },
    { frequency: 329.63, type: "triangle", level: 0.005, pan: -0.3, swellRate: 0.011 },
  ];

  for (const voice of padVoices) {
    const osc = bag.context.createOscillator();
    const gain = createGain(bag, voice.level);
    const panner = createPanner(bag, voice.pan);
    osc.type = voice.type;
    osc.frequency.value = voice.frequency;
    osc.detune.value = randomBetween(-5, 5);
    trackSource(bag, osc);
    addSlowLfo(bag, osc.detune, 0.004 + Math.random() * 0.003, 3);
    addSlowLfo(bag, gain.gain, voice.swellRate, voice.level * 0.6);
    addSlowLfo(bag, panner.pan, 0.003 + Math.random() * 0.003, 0.1);
    osc.connect(gain).connect(panner).connect(padFilter);
    osc.start();
  }

  // Very rare chimes: a single, long, quiet tone; never a repeating figure.
  let firstChime = true;
  scheduleRepeating(
    bag,
    () => {
      const delay = firstChime
        ? randomBetween(9000, 20000)
        : randomBetween(20000, 60000);
      firstChime = false;
      return delay;
    },
    () => playChime(bag)
  );

  // Occasional soft droplets over the distant rain.
  scheduleEvent(bag, 1400, 4200, () => {
    playRainDrop(bag, 0.007);
  });
}

// ---------------------------------------------------------------------------
// Soundscape profiles and entry point
// ---------------------------------------------------------------------------

interface SoundscapeProfile {
  fadeInSeconds: number;
  fadeOutSeconds: number;
  reverbWet: number;
  // Calibrates each soundscape to a consistent perceived level.
  trim: number;
  build: (bag: SoundBag) => void | Promise<void>;
}

const PROFILES: Record<Exclude<Soundscape, "off">, SoundscapeProfile> = {
  rain: { fadeInSeconds: 2.2, fadeOutSeconds: 1.1, reverbWet: 0.16, trim: 1.6, build: buildRain },
  wind: { fadeInSeconds: 3, fadeOutSeconds: 1.4, reverbWet: 0.2, trim: 1.5, build: buildWind },
  drift: { fadeInSeconds: 4, fadeOutSeconds: 2, reverbWet: 0.45, trim: 2.4, build: buildDrift },
  cafe: { fadeInSeconds: 2.4, fadeOutSeconds: 1.2, reverbWet: 0.16, trim: 3.2, build: buildCafe },
  minecraft: {
    fadeInSeconds: 2.5,
    fadeOutSeconds: 1.6,
    reverbWet: 0.12,
    trim: 1.23,
    build: buildMinecraft,
  },
  nature: {
    fadeInSeconds: 2.5,
    fadeOutSeconds: 1.5,
    reverbWet: 0.1,
    trim: 8.35,
    build: buildFileLoop(NATURE_LOOP_URL),
  },
};

function createBag(
  context: AudioContext,
  masterGain: GainNode,
  profile: SoundscapeProfile
): SoundBag {
  const input = context.createGain();
  input.gain.value = profile.trim;

  const bus = context.createGain();
  bus.gain.setValueAtTime(0, context.currentTime);

  input.connect(bus);
  bus.connect(masterGain);

  const bag: SoundBag = {
    context,
    input,
    bus,
    nodes: new Set([input, bus]),
    sources: new Set(),
    oneShotNodes: new Set(),
    transientSources: new Set(),
    timers: new Set(),
    stopped: false,
    fadeOutSeconds: profile.fadeOutSeconds,
  };

  if (profile.reverbWet > 0) {
    const convolver = context.createConvolver();
    convolver.buffer = getReverbImpulse(context);
    const wet = context.createGain();
    wet.gain.value = profile.reverbWet;
    trackNode(bag, convolver);
    trackNode(bag, wet);
    input.connect(convolver);
    convolver.connect(wet).connect(bus);
  }

  bus.gain.linearRampToValueAtTime(1, context.currentTime + profile.fadeInSeconds);

  return bag;
}

export function synthesizeSoundscape(
  type: Soundscape,
  context: AudioContext,
  masterGain: GainNode
): SoundInstance | null {
  if (type === "off") return null;

  const profile = PROFILES[type];
  const bag = createBag(context, masterGain, profile);
  const buildResult = profile.build(bag);
  if (buildResult instanceof Promise) {
    buildResult.catch((err) => {
      console.error("Ambient audio build error:", err);
    });
  }

  return {
    stop: (fadeSeconds = bag.fadeOutSeconds) => {
      if (bag.stopped) return;
      bag.stopped = true;

      for (const id of bag.timers) window.clearTimeout(id);
      bag.timers.clear();

      const fade = clamp(fadeSeconds, 0.05, 4);
      fadeGain(bag.bus.gain, 0, fade, context);
      window.setTimeout(() => stopBag(bag), fade * 1000 + 80);
    },
  };
}
