"use client";

import { useAmbientAudio } from "@/hooks/use-ambient-audio";
import type { Soundscape } from "@/lib/audio/sound-synth";
import { CloudRain, Coffee, Music2, Pause, Play, Volume1, Volume2, VolumeX, Wind } from "lucide-react";

export type { Soundscape };

interface AmbientSoundProps {
  onSoundscapeChange?: (sound: Soundscape) => void;
}

export function AmbientSound({ onSoundscapeChange }: AmbientSoundProps) {
  const {
    sound,
    isPlaying,
    volume,
    isMuted,
    handlePlayPause,
    chooseSound,
    handleVolumeChange,
    toggleMute,
  } = useAmbientAudio({ onSoundscapeChange });

  const options: Array<{ id: Soundscape; label: string; icon: typeof Wind }> = [
    { id: "rain", label: "Rain", icon: CloudRain },
    { id: "wind", label: "Wind", icon: Wind },
    { id: "drift", label: "Drift", icon: Music2 },
    { id: "cafe", label: "Cafe", icon: Coffee },
    { id: "off", label: "Quiet", icon: VolumeX },
  ];

  return (
    <div className="soundscape-control">
      <div className="soundscape-header">
        <div className="soundscape-title-group">
          <span className="soundscape-title">
            <Wind size={16} /> Ambient Soundscape
          </span>

          {isPlaying && sound !== "off" && (
            <span className="soundscape-active-badge">
              <span className="sound-pulse-dot" /> Playing {sound}
            </span>
          )}
        </div>

        <div className="soundscape-controls-right">
          {/* Main Play / Pause Button */}
          <button
            onClick={handlePlayPause}
            className={`soundscape-play-btn ${isPlaying ? "playing" : ""}`}
            title={isPlaying ? "Pause ambient sound" : "Play ambient sound"}
            aria-label={isPlaying ? "Pause audio" : "Play audio"}
          >
            {isPlaying ? <Pause size={15} /> : <Play size={15} className="play-icon-offset" />}
            <span>{isPlaying ? "Pause" : "Play"}</span>
          </button>

          {/* Volume Control Bar */}
          <div className="soundscape-volume-bar">
            <button
              onClick={toggleMute}
              className="volume-mute-btn"
              title={isMuted ? "Unmute sound" : "Mute sound"}
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted || volume === 0 ? (
                <VolumeX size={15} />
              ) : volume < 0.5 ? (
                <Volume1 size={15} />
              ) : (
                <Volume2 size={15} />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="volume-slider"
              aria-label="Sound volume"
            />
            <span className="volume-percent">{isMuted ? "0%" : `${Math.round(volume * 100)}%`}</span>
          </div>
        </div>
      </div>

      <div className="soundscape-options">
        {options.map(({ id, label, icon: Icon }) => {
          const isSelected = sound === id;
          const isCurrentlyPlaying = isSelected && isPlaying && id !== "off";

          return (
            <button
              key={id}
              className={`soundscape-btn ${isSelected ? "soundscape-active" : ""} ${
                isCurrentlyPlaying ? "soundscape-playing" : ""
              }`}
              onClick={() => chooseSound(id)}
              aria-pressed={isSelected}
            >
              <Icon size={14} />
              <span>{label}</span>
              {isCurrentlyPlaying ? (
                <Pause size={12} className="btn-state-icon" />
              ) : isSelected && id !== "off" && !isPlaying ? (
                <Play size={12} className="btn-state-icon" />
              ) : null}
            </button>
          );
        })}
      </div>

      <small className="soundscape-note">
        {sound === "rain" && "🌧️ Rich rain drops pattering outside your study window"}
        {sound === "wind" && "🍃 Sweeping cozy breeze rustling through forest leaves"}
        {sound === "drift" && "🎵 Warm lofi synth pad chord for deep focus"}
        {sound === "cafe" && "☕ Cozy coffee shop room murmur with gentle cup clinks"}
        {sound === "off" && "Silent mode — select any sound above or press Play"}
      </small>
    </div>
  );
}
