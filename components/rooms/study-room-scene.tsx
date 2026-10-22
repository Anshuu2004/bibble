"use client";

import type { Soundscape } from "@/components/rooms/ambient-sound";
import { useTheme } from "@/hooks/use-theme";
import type { StudyRoom } from "@/types/room";
import { Coffee, Heart, Lamp, Sparkles } from "lucide-react";

interface StudyRoomSceneProps {
  room: StudyRoom;
  soundscape?: Soundscape;
  lampOn?: boolean;
  catHearts?: number;
  onPetCat?: () => void;
  onSipTea?: () => void;
  onToggleLamp?: () => void;
}

export function StudyRoomScene({
  room,
  soundscape = "off",
  lampOn = true,
  catHearts = 0,
  onPetCat,
  onSipTea,
  onToggleLamp,
}: StudyRoomSceneProps) {
  const { motif, isDark } = useTheme();

  return (
    <div className={`room-roomscape room-roomscape-${room.color}`} aria-label={`${room.name} interactive room scape`}>
      {/* Room Badge */}
      <div className="room-roomscape-label">
        <Sparkles size={13} className="text-primary" />
        <span>{room.name} · {motif.fruitEmoji}</span>
        {soundscape !== "off" && (
          <span className="sound-active-pill">🎵 {soundscape}</span>
        )}
      </div>

      {/* Focus Board inside Scene */}
      <div className="room-focus-board">
        <span>Current Focus</span>
        <strong>{room.topic}</strong>
        <p>{room.description}</p>
        <div className="room-focus-progress">
          <i style={{ width: "65%" }} />
        </div>
      </div>

      {/* Cozy Window to Outside Sky */}
      <div className="room-roomscape-window">
        <div className="window-sky">
          <div className="room-sun" title={isDark ? "Cozy moon" : "Morning sun"} />
          <div className="room-cloud room-cloud-one" />
          <div className="room-cloud room-cloud-two" />
          <div className="preview-window-line" />

          {/* Mochi the Study Cat sitting on window sill */}
          <button
            type="button"
            className="window-sill-cat"
            onClick={onPetCat}
            title={`Pet Mochi the study cat wearing ${motif.catAccessory}!`}
            aria-label={`Pet Mochi the study cat wearing ${motif.catAccessory}. Hearts: ${catHearts}`}
          >
            <span role="img" aria-label="Cat">🐱</span>
            {catHearts > 0 && (
              <span className="cat-hearts-count">
                <Heart size={10} fill="currentColor" /> {catHearts}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Interactive Cozy Desk */}
      <div className="room-roomscape-desk">
        {/* Desk Lamp */}
        <button
          type="button"
          className={`desk-lamp ${lampOn ? "desk-lamp-on" : ""}`}
          onClick={onToggleLamp}
          title={lampOn ? "Turn off desk lamp" : "Turn on desk lamp"}
          aria-label={lampOn ? "Turn off desk lamp" : "Turn on desk lamp"}
        >
          <Lamp size={18} />
          {lampOn && <div className="lamp-glow-cone" />}
        </button>

        {/* Study Laptop */}
        <div className="desk-laptop" title="Study laptop open with notes">
          <div className="screen-code-lines">
            <i style={{ width: "70%" }} />
            <i style={{ width: "90%", marginTop: "3px" }} />
            <i style={{ width: "50%", marginTop: "3px" }} />
          </div>
        </div>

        {/* Steaming Drink Cup */}
        <button
          type="button"
          className="desk-cup"
          onClick={onSipTea}
          title={`Take a sip of ${motif.treatName}!`}
          aria-label={`Take a sip of ${motif.treatName}`}
        >
          <div className="steam-wrapper" aria-hidden="true">
            <div className="steam" />
            <div className="steam" style={{ animationDelay: "0.6s" }} />
            <div className="steam" style={{ animationDelay: "1.2s" }} />
          </div>
          <div className="preview-mug">
            <Coffee size={16} />
          </div>
        </button>
      </div>
    </div>
  );
}
