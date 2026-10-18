import type { LearningMap } from "@/types/map";

const DEFAULT_MAP_TITLE = "My learning map";
const DEFAULT_MAP_DESCRIPTION = "A little world for something I want to learn.";
const DEFAULT_MAP_CATEGORY = "Personal growth";

export interface CreateLearningMapInput {
  title: string;
  description: string;
  category: string;
}

export function createMapId(title: string) {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return `${slug || "my-map"}-${Date.now()}`;
}

export function createLearningMap({
  title,
  description,
  category,
}: CreateLearningMapInput, id?: string): LearningMap {
  const mapTitle = title.trim() || DEFAULT_MAP_TITLE;
  const mapId = id ?? createMapId(mapTitle);

  return {
    id: mapId,
    title: mapTitle,
    description: description.trim() || DEFAULT_MAP_DESCRIPTION,
    category: category.trim() || DEFAULT_MAP_CATEGORY,
    accent: "lavender",
    // Every new map begins with a small, useful path instead of an empty canvas.
    // The editor keeps these intentionally generic so they can be renamed or expanded.
    bibbles: [
      {
        id: `${mapId}-start`,
        title: "Start here",
        description: `Define the first small thing you want to understand about ${mapTitle}.`,
        status: "not-started",
        progress: 0,
        position: { x: 0, y: 130 },
      },
      {
        id: `${mapId}-practice`,
        title: "Practice it",
        description: "Choose one exercise, experiment, or tiny project to make the idea real.",
        status: "not-started",
        progress: 0,
        position: { x: 280, y: 130 },
      },
      {
        id: `${mapId}-next`,
        title: "Choose the next step",
        description: "Capture what clicked and decide where your learning should go next.",
        status: "not-started",
        progress: 0,
        position: { x: 560, y: 130 },
      },
    ],
    edges: [
      { id: `${mapId}-start-practice`, source: `${mapId}-start`, target: `${mapId}-practice` },
      { id: `${mapId}-practice-next`, source: `${mapId}-practice`, target: `${mapId}-next` },
    ],
  };
}
