import { studyRooms } from "@/data/study-rooms";
import type { StudyRoom } from "@/types/room";

export const CUSTOM_ROOMS_KEY = "bibble-custom-rooms";

export const MIN_CAPACITY = 2;
export const MAX_CAPACITY = 20;
export const MAX_TAGS = 5;

export interface RoomFormValues {
  name: string;
  topic: string;
  description: string;
  tags: string;
  capacity: string;
}

export type RoomFormErrors = Partial<Record<keyof RoomFormValues, string>>;

export function parseTags(value: string) {
  const tags = value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
  return tags.filter((tag, index) => tags.findIndex((other) => other.toLowerCase() === tag.toLowerCase()) === index);
}

export function validateRoomForm(values: RoomFormValues): RoomFormErrors {
  const errors: RoomFormErrors = {};
  const capacity = Number(values.capacity);

  if (!values.name.trim()) errors.name = "Give your room a name.";
  if (!values.topic.trim()) errors.topic = "Tell people what this room is for.";

  if (!values.capacity.trim() || !Number.isInteger(capacity)) {
    errors.capacity = "Capacity must be a whole number.";
  } else if (capacity < MIN_CAPACITY || capacity > MAX_CAPACITY) {
    errors.capacity = `Capacity must be between ${MIN_CAPACITY} and ${MAX_CAPACITY}.`;
  }

  if (parseTags(values.tags).length > MAX_TAGS) {
    errors.tags = `Use at most ${MAX_TAGS} tags.`;
  }

  return errors;
}

function createRoomId(name: string, takenIds: string[]) {
  const base =
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "room";
  let id = base;
  let suffix = 2;
  while (takenIds.includes(id)) {
    id = `${base}-${suffix}`;
    suffix += 1;
  }
  return id;
}

export function buildCustomRoom(values: RoomFormValues, customRooms: StudyRoom[]): StudyRoom {
  // "new" is the create form's own route under /rooms.
  const takenIds = ["new", ...studyRooms.map((room) => room.id), ...customRooms.map((room) => room.id)];

  return {
    id: createRoomId(values.name, takenIds),
    name: values.name.trim(),
    topic: values.topic.trim(),
    description: values.description.trim() || "A cozy room to study together.",
    mood: "cozy",
    color: "lavender",
    participants: 0,
    capacity: Number(values.capacity),
    minutes: 25,
    host: "You",
    tags: parseTags(values.tags),
  };
}
