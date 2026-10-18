export type RoomMood = "focus" | "cozy" | "quiet" | "sprint";

export interface StudyRoom {
  id: string;
  name: string;
  topic: string;
  description: string;
  mood: RoomMood;
  color: string;
  participants: number;
  capacity: number;
  minutes: number;
  host: string;
  tags: string[];
}
