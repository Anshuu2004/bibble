export interface FocusSession {
  id: string;
  minutes: number;
  completedAt: string; // ISO date string
  roomId?: string;
  roomName?: string;
  topic?: string;
  note?: string;
}

export interface DailyStreakInfo {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  activeDates: string[]; // List of YYYY-MM-DD
  studiedToday: boolean;
}

export interface MapProgressItem {
  id: string;
  title: string;
  description: string;
  category: string;
  accent: string;
  progress: number;
  totalBibbles: number;
  completedBibbles: number;
  inProgressBibbles: number;
  notStartedBibbles: number;
  status: "completed" | "in-progress" | "not-started";
}

export interface StudyStats {
  totalMinutes: number;
  totalSessions: number;
  streak: DailyStreakInfo;
  sessions: FocusSession[];
}
