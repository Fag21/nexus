// ── existing social types stay above ──

export type HabitType = "BUILD" | "BREAK";

export interface HabitLog {
  id: string;
  habitId: string;
  date: string;
  completed: boolean;
  note?: string;
}

export interface Habit {
  id: string;
  name: string;
  description?: string;
  type: HabitType;
  frequency: string;
  scheduledTime?: string;
  color: string;
  icon: string;
  motivation?: string;
  ifSucceed?: string;
  level: number;
  xp: number;
  isActive: boolean;
  logs: HabitLog[];
  createdAt: string;
}