"use client";

import { synthesizeSoundscape, type SoundInstance, type Soundscape } from "@/lib/audio/sound-synth";
import { useEffect, useRef, useState } from "react";

interface UseAmbientAudioProps {
  onSoundscapeChange?: (sound: Soundscape) => void;
  defaultSound?: Soundscape;
  defaultVolume?: number;
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
  const gainNodeRef = useRef<GainNode | null>(null);
  const sourceRef = useRef<SoundInstance | null>(null);
  const intervalRef = useRef<number | null>(null);

  const stopCurrentSound = () => {
    if (sourceRef.current) {
      sourceRef.current.stop();
      sourceRef.current = null;
    }
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Clean up AudioContext on unmount
  useEffect(() => {
    return () => {
      stopCurrentSound();
      if (contextRef.current && contextRef.current.state !== "closed") {
        void contextRef.current.close();
      }
    };
  }, []);

  // Broadcast soundscape changes to parent listener
  useEffect(() => {
    onSoundscapeChange?.(isPlaying ? sound : "off");
  }, [sound, isPlaying, onSoundscapeChange]);

  useEffect(() => {
    const context = contextRef.current;
    const gainNode = gainNodeRef.current;

    if (!context || !gainNode) return;

    const targetGain = isPlaying && !isMuted ? volume * 0.75 : 0;
    gainNode.gain.setTargetAtTime(targetGain, context.currentTime, 0.02);
  }, [isMuted, isPlaying, volume]);

  const getAudioContext = (): AudioContext => {
    if (!contextRef.current || contextRef.current.state === "closed") {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      contextRef.current = new AudioCtx();
    }
    if (contextRef.current.state === "suspended") {
      void contextRef.current.resume();
    }
    return contextRef.current;
  };

  const startSound = (type: Soundscape) => {
    stopCurrentSound();
    if (type === "off") return;

    try {
      const context = getAudioContext();
      const masterGain = context.createGain();
      const currentTargetGain = isMuted ? 0 : volume * 0.75;

      masterGain.gain.setValueAtTime(currentTargetGain, context.currentTime);
      masterGain.connect(context.destination);
      gainNodeRef.current = masterGain;

      const { instance, intervalId } = synthesizeSoundscape(type, context, masterGain, true);
      sourceRef.current = instance;
      intervalRef.current = intervalId;
    } catch (err) {
      console.error("Audio playback error:", err);
    }
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false);
      stopCurrentSound();
    } else {
      const targetSound = sound === "off" ? "rain" : sound;
      if (sound === "off") setSound("rain");
      setIsPlaying(true);
      startSound(targetSound);
    }
  };

  const chooseSound = (next: Soundscape) => {
    if (next === "off") {
      setSound("off");
      setIsPlaying(false);
      stopCurrentSound();
      return;
    }

    if (sound === next && isPlaying) {
      setIsPlaying(false);
      stopCurrentSound();
      return;
    }

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
