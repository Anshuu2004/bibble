"use client";

import type { Soundscape } from "@/components/rooms/ambient-sound";
import type { StudyRoom } from "@/types/room";

interface StudyRoomSceneProps {
  room: StudyRoom;
  soundscape?: Soundscape;
  lampOn?: boolean;
  catHearts?: number;
  onPetCat?: () => void;
  onSipTea?: () => void;
  onToggleLamp?: () => void;
}

export function StudyRoomScene({ room }: StudyRoomSceneProps) {
  return (
    <div className={`room-roomscape room-roomscape-${room.color}`} />
  );
}
