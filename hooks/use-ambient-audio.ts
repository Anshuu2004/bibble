"use client";

import { synthesizeSoundscape, type SoundInstance, type Soundscape } from "@/lib/audio/sound-synth";
import { useEffect, useRef, useState } from "react";

interface UseAmbientAudioProps {
  onSoundscapeChange?: (sound: Soundscape) => void;
  defaultSound?: Soundscape;
  defaultVolume?: number;
}

const SWITCH_FADE_SECONDS = 0.4;
const PAUSE_FADE_SECONDS = 0.9;

function volumeToGain(volume: number): number {
  const clamped = Math.min(1, Math.max(0, volume));
  return Math.pow(clamped, 1.2) * 0.9;
}

export function useAmbientAudio({
  onSoundscapeChange,
  defaultSound = "rain",
  defaultVolume = 0.6,
}: UseAmbientAudioProps = {}) {
  const [sound, setSound] = useState<Soundscape>(defaultSound);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(defaultVolume);
  const [isMuted, setIsMuted] = useState(false);

  const contextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const instanceRef = useRef<SoundInstance | null>(null);
  const startTimerRef = useRef<number | null>(null);
  const stopReadyAtRef = useRef(0);
  const wantsPlaybackRef = useRef(false);
  const volumeRef = useRef(volume);
  const mutedRef = useRef(isMuted);

  const ensureGraph = (): { context: AudioContext; master: GainNode } => {
    let context = contextRef.current;

    if (!context || context.state === "closed") {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      context = new AudioCtx();

      const master = context.createGain();
      master.gain.value = mutedRef.current ? 0 : volumeToGain(volumeRef.current);

      // Gentle safety limiter: only catches rare overlapping transient peaks.
      const limiter = context.createDynamicsCompressor();
      limiter.threshold.value = -2;
      limiter.knee.value = 6;
      limiter.ratio.value = 12;
      limiter.attack.value = 0.003;
      limiter.release.value = 0.25;

      master.connect(limiter);
      limiter.connect(context.destination);

      contextRef.current = context;
      masterGainRef.current = master;
    }

    if (context.state === "suspended") {
      void context.resume();
    }

    return { context, master: masterGainRef.current as GainNode };
  };

  const cancelPendingStart = () => {
    if (startTimerRef.current !== null) {
      window.clearTimeout(startTimerRef.current);
      startTimerRef.current = null;
    }
  };

  const createInstance = (type: Soundscape) => {
    if (type === "off" || !wantsPlaybackRef.current) return;

    try {
      const { context, master } = ensureGraph();
      const instance = synthesizeSoundscape(type, context, master);
      instanceRef.current = instance;
    } catch (err) {
      console.error("Audio playback error:", err);
      setIsPlaying(false);
    }
  };

  const stopCurrentSound = (fadeSeconds: number) => {
    const instance = instanceRef.current;
    if (!instance) return;
    instance.stop(fadeSeconds);
    instanceRef.current = null;
    stopReadyAtRef.current = performance.now() + fadeSeconds * 1000 + 40;
  };

  // Start only after the outgoing soundscape is silent, so two never overlap.
  const startSound = (type: Soundscape) => {
    cancelPendingStart();
    if (type === "off") return;

    if (instanceRef.current) {
      stopCurrentSound(SWITCH_FADE_SECONDS);
    }

    const wait = stopReadyAtRef.current - performance.now();
    if (wait > 20) {
      startTimerRef.current = window.setTimeout(() => {
        startTimerRef.current = null;
        createInstance(type);
      }, wait);
    } else {
      createInstance(type);
    }
  };

  // Clean up the audio graph on unmount.
  useEffect(() => {
    return () => {
      wantsPlaybackRef.current = false;
      if (startTimerRef.current !== null) {
        window.clearTimeout(startTimerRef.current);
        startTimerRef.current = null;
      }
      instanceRef.current?.stop(0.05);
      instanceRef.current = null;
      const context = contextRef.current;
      contextRef.current = null;
      masterGainRef.current = null;
      if (context && context.state !== "closed") {
        void context.close();
      }
    };
  }, []);

  // Broadcast soundscape changes to parent listener
  useEffect(() => {
    onSoundscapeChange?.(isPlaying ? sound : "off");
  }, [sound, isPlaying, onSoundscapeChange]);

  // Master volume and mute, smoothed to avoid zipper noise.
  useEffect(() => {
    volumeRef.current = volume;
    mutedRef.current = isMuted;
    const context = contextRef.current;
    const master = masterGainRef.current;
    if (!context || !master) return;
    const target = isMuted ? 0 : volumeToGain(volume);
    master.gain.setTargetAtTime(target, context.currentTime, 0.06);
  }, [isMuted, volume]);

  const handlePlayPause = () => {
    if (isPlaying) {
      wantsPlaybackRef.current = false;
      setIsPlaying(false);
      cancelPendingStart();
      stopCurrentSound(PAUSE_FADE_SECONDS);
    } else {
      const targetSound = sound === "off" ? "rain" : sound;
      if (sound === "off") setSound("rain");
      wantsPlaybackRef.current = true;
      setIsPlaying(true);
      startSound(targetSound);
    }
  };

  const chooseSound = (next: Soundscape) => {
    if (next === "off") {
      wantsPlaybackRef.current = false;
      setSound("off");
      setIsPlaying(false);
      cancelPendingStart();
      stopCurrentSound(PAUSE_FADE_SECONDS);
      return;
    }

    if (sound === next && isPlaying) {
      wantsPlaybackRef.current = false;
      setIsPlaying(false);
      cancelPendingStart();
      stopCurrentSound(PAUSE_FADE_SECONDS);
      return;
    }

    wantsPlaybackRef.current = true;
    setSound(next);
    setIsPlaying(true);
    startSound(next);
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (isMuted && newVol > 0) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  return {
    sound,
    isPlaying,
    volume,
    isMuted,
    handlePlayPause,
    chooseSound,
    handleVolumeChange,
    toggleMute,
  };
}
