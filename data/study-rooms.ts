import type { StudyRoom } from "@/types/room";

export const studyRooms: StudyRoom[] = [
  {
    id: "soft-starts",
    name: "Soft starts",
    topic: "DSA fundamentals",
    description: "A low-pressure room for getting through one problem at a time.",
    mood: "cozy",
    color: "peach",
    participants: 4,
    capacity: 8,
    minutes: 42,
    host: "Mina",
    tags: ["beginner friendly", "quiet music"],
  },
  {
    id: "react-and-tea",
    name: "React & tea",
    topic: "React patterns",
    description: "Bring your components, your questions, and something warm to drink.",
    mood: "focus",
    color: "blue",
    participants: 6,
    capacity: 10,
    minutes: 28,
    host: "Noah",
    tags: ["frontend", "pomodoro"],
  },
  {
    id: "ship-it-slowly",
    name: "Ship it slowly",
    topic: "DevOps learning",
    description: "A steady room for turning infrastructure concepts into small wins.",
    mood: "sprint",
    color: "green",
    participants: 3,
    capacity: 6,
    minutes: 55,
    host: "Leah",
    tags: ["deep work", "accountability"],
  },
  {
    id: "library-hour",
    name: "Library hour",
    topic: "Anything goes",
    description: "A quiet shared table for reading, reviewing, and making progress.",
    mood: "quiet",
    color: "lavender",
    participants: 8,
    capacity: 12,
    minutes: 61,
    host: "Ari",
    tags: ["camera optional", "no chat"],
  },
];

export function getStudyRoom(id: string) {
  return studyRooms.find((room) => room.id === id);
}
