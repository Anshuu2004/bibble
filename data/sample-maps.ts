import type { Bibble, LearningMap } from "@/types/map";

const makeBibbles = (
  items: Array<[string, string, number, number, Bibble["status"], number, string]>,
): Bibble[] =>
  items.map(([id, title, x, y, status, progress, description]) => ({
    id,
    title,
    position: { x, y },
    status,
    progress,
    description,
  }));

export const sampleMaps: LearningMap[] = [
  {
    id: "dsa-roadmap",
    title: "DSA Roadmap",
    description: "A gentle path from first arrays to confident problem solving.",
    category: "Computer Science",
    accent: "blue",
    bibbles: makeBibbles([
      ["arrays", "Arrays", 0, 100, "completed", 100, "Build the mental model for contiguous data."],
      ["strings", "Strings", 260, 100, "learning", 62, "Practice patterns for working with text."],
      ["hashing", "Hashing", 520, 100, "learning", 45, "Turn lookups into elegant little shortcuts."],
      ["recursion", "Recursion", 0, 300, "learning", 35, "Learn to trust a smaller version of the problem."],
      ["linked-lists", "Linked Lists", 260, 300, "not-started", 0, "Connect nodes and get comfortable with pointers."],
      ["trees", "Trees", 520, 300, "not-started", 0, "Explore structure, traversal, and hierarchy."],
      ["graphs", "Graphs", 260, 500, "not-started", 0, "Model the relationships hiding in plain sight."],
      ["dynamic-programming", "Dynamic Programming", 520, 500, "not-started", 0, "Save the work you have already done."],
    ]),
    edges: [
      { id: "arrays-strings", source: "arrays", target: "strings" },
      { id: "strings-hashing", source: "strings", target: "hashing" },
      { id: "arrays-recursion", source: "arrays", target: "recursion" },
      { id: "recursion-linked", source: "recursion", target: "linked-lists" },
      { id: "linked-trees", source: "linked-lists", target: "trees" },
      { id: "trees-graphs", source: "trees", target: "graphs" },
      { id: "graphs-dp", source: "graphs", target: "dynamic-programming" },
    ],
  },
  {
    id: "react-journey",
    title: "React Journey",
    description: "A practical, colorful route through modern React fundamentals.",
    category: "Frontend",
    accent: "pink",
    bibbles: makeBibbles([
      ["javascript", "JavaScript", 0, 100, "completed", 100, "The language beneath the interface."],
      ["jsx", "JSX", 260, 100, "completed", 100, "Describe UI with the warmth of familiar syntax."],
      ["components", "Components", 520, 100, "learning", 72, "Turn ideas into reusable building blocks."],
      ["props", "Props", 260, 300, "learning", 58, "Let components share what they know."],
      ["state", "State", 520, 300, "learning", 42, "Make your interface respond to change."],
      ["hooks", "Hooks", 390, 500, "not-started", 0, "Compose behavior without losing the plot."],
      ["routing", "Routing", 650, 500, "not-started", 0, "Give every important view a place to land."],
    ]),
    edges: [
      { id: "javascript-jsx", source: "javascript", target: "jsx" },
      { id: "jsx-components", source: "jsx", target: "components" },
      { id: "components-props", source: "components", target: "props" },
      { id: "components-state", source: "components", target: "state" },
      { id: "props-hooks", source: "props", target: "hooks" },
      { id: "state-hooks", source: "state", target: "hooks" },
      { id: "state-routing", source: "state", target: "routing" },
    ],
  },
  {
    id: "devops-journey",
    title: "DevOps Journey",
    description: "The tools and ideas behind calm, repeatable delivery.",
    category: "DevOps",
    accent: "green",
    bibbles: makeBibbles([
      ["linux", "Linux", 0, 100, "completed", 100, "Find your footing in the environment."],
      ["git", "Git", 260, 100, "completed", 100, "Make change trackable and reversible."],
      ["docker", "Docker", 520, 100, "learning", 62, "Package an app with its world around it."],
      ["cicd", "CI/CD", 260, 300, "learning", 48, "Let every change prove itself."],
      ["cloud", "Cloud", 520, 300, "not-started", 0, "Understand the landscape your systems inhabit."],
      ["kubernetes", "Kubernetes", 390, 500, "not-started", 0, "Coordinate containers at a larger scale."],
      ["gitops", "GitOps", 650, 500, "not-started", 0, "Manage infrastructure with the same calm loop."],
    ]),
    edges: [
      { id: "linux-git", source: "linux", target: "git" },
      { id: "git-docker", source: "git", target: "docker" },
      { id: "docker-cicd", source: "docker", target: "cicd" },
      { id: "docker-cloud", source: "docker", target: "cloud" },
      { id: "cicd-kubernetes", source: "cicd", target: "kubernetes" },
      { id: "cloud-kubernetes", source: "cloud", target: "kubernetes" },
      { id: "kubernetes-gitops", source: "kubernetes", target: "gitops" },
    ],
  },
  {
    id: "java-fundamentals",
    title: "Java Fundamentals",
    description: "A friendly first map for building durable Java instincts.",
    category: "Programming",
    accent: "peach",
    bibbles: makeBibbles([
      ["syntax", "Syntax", 0, 100, "completed", 100, "Read and write the shape of Java code."],
      ["oop", "OOP", 260, 100, "learning", 70, "Model behavior with thoughtful objects."],
      ["collections", "Collections", 520, 100, "learning", 36, "Choose the right container for each idea."],
      ["exceptions", "Exceptions", 260, 300, "not-started", 0, "Make failure useful and visible."],
      ["streams", "Streams", 520, 300, "not-started", 0, "Transform data without losing clarity."],
    ]),
    edges: [
      { id: "syntax-oop", source: "syntax", target: "oop" },
      { id: "oop-collections", source: "oop", target: "collections" },
      { id: "oop-exceptions", source: "oop", target: "exceptions" },
      { id: "collections-streams", source: "collections", target: "streams" },
    ],
  },
  {
    id: "git-github",
    title: "Git & GitHub",
    description: "A compact map for making collaboration feel less mysterious.",
    category: "Tools",
    accent: "lavender",
    bibbles: makeBibbles([
      ["commits", "Commits", 0, 100, "completed", 100, "Make small, meaningful snapshots."],
      ["branches", "Branches", 260, 100, "learning", 52, "Explore ideas without disturbing the main path."],
      ["merges", "Merges", 520, 100, "not-started", 0, "Bring good work back together."],
      ["pull-requests", "Pull Requests", 260, 300, "not-started", 0, "Make a conversation around every change."],
      ["actions", "Actions", 520, 300, "not-started", 0, "Let automation carry the repetitive parts."],
    ]),
    edges: [
      { id: "commits-branches", source: "commits", target: "branches" },
      { id: "branches-merges", source: "branches", target: "merges" },
      { id: "merges-pull-requests", source: "merges", target: "pull-requests" },
      { id: "pull-requests-actions", source: "pull-requests", target: "actions" },
    ],
  },
  {
    id: "kubernetes",
    title: "Kubernetes",
    description: "A map for learning the moving parts without losing the thread.",
    category: "DevOps",
    accent: "blue",
    bibbles: makeBibbles([
      ["containers", "Containers", 0, 100, "completed", 100, "Start with the unit Kubernetes moves."],
      ["pods", "Pods", 260, 100, "learning", 65, "Understand the smallest deployable unit."],
      ["services", "Services", 520, 100, "not-started", 0, "Give workloads a stable way to meet."],
      ["deployments", "Deployments", 260, 300, "not-started", 0, "Describe the state you want to exist."],
      ["observability", "Observability", 520, 300, "not-started", 0, "See what your cluster is telling you."],
    ]),
    edges: [
      { id: "containers-pods", source: "containers", target: "pods" },
      { id: "pods-services", source: "pods", target: "services" },
      { id: "pods-deployments", source: "pods", target: "deployments" },
      { id: "deployments-observability", source: "deployments", target: "observability" },
    ],
  },
];

export const defaultMap = sampleMaps[0];

export function getMapById(id: string) {
  return sampleMaps.find((map) => map.id === id);
}

export function getMapProgress(map: LearningMap) {
  if (!map.bibbles.length) return 0;
  return Math.round(map.bibbles.reduce((total, bibble) => total + bibble.progress, 0) / map.bibbles.length);
}
