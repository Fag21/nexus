// src/types/index.ts

// ── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  name?: string;
  email: string;
  image?: string;
}

// ── Social Media ──────────────────────────────────────────────────────────────

export interface SocialLog {
  id: string;
  planId: string;
  date: string;
  minutesUsed: number;
}

export interface SocialPlan {
  id: string;
  appName: string;
  dailyLimit: number;
  isActive: boolean;
  createdAt: string;
  logs: SocialLog[];
}

// ── Habits ────────────────────────────────────────────────────────────────────

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
  // ── Coaching plan (behavioral science) ──
  identity?: string;       // "I am someone who..."
  cue?: string;            // the trigger that starts the habit
  reward?: string;         // how you celebrate completion
  twoMinute?: string;      // the 2-minute starter version
  habitStack?: string;     // "After I [X], I will [this habit]"
  obstaclePlan?: string;   // "If [obstacle], then [plan]"
  level: number;
  xp: number;
  isActive: boolean;
  logs: HabitLog[];
  createdAt: string;
}

// ── Habit coaching (AI + recommendations) ──────────────────────────────────────

export interface HabitObstacle {
  if: string;
  then: string;
}

export interface HabitCoachPlan {
  identity: string;
  why: string;
  cue: string;
  twoMinute: string;
  habitStack: string;
  reward: string;
  obstacles: HabitObstacle[];
  firstWeek: string[];
}

export interface HabitRecommendations {
  books: BookItem[];
  videos: VideoItem[];
}

// ── Journal ───────────────────────────────────────────────────────────────────

export type Mood = "great" | "good" | "neutral" | "low" | "bad";

export interface Journal {
  id: string;
  title?: string;
  content: string;
  mood: Mood;
  burned: boolean;
  date: string;
  updatedAt: string;
}

export interface JournalInsights {
  summary: string;
  themes: string[];
  emotionalPattern: string;
  strengths: string[];
  gentleReframe: string;
  suggestions: string[];
  focus: string;
}

// ── Feed ──────────────────────────────────────────────────────────────────────

export interface BookItem {
  id: string;
  title: string;
  authors: string[];
  description: string;
  thumbnail: string;
  pageCount?: number;
  publishedDate?: string;
  previewLink?: string;
  categories?: string[];
}

export interface VideoItem {
  id: string;
  title: string;
  channelTitle: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  videoId: string;
}

export interface FavoriteItem {
  id: string;
  type: "BOOK" | "VIDEO";
  externalId: string;
  title: string;
  thumbnail?: string;
  metadata?: string;
  createdAt: string;
}

// ── AI Coach ──────────────────────────────────────────────────────────────────

export type MessageRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
}

export interface WeeklyPlanItem {
  day: string;
  tasks: string[];
}

export interface WeeklyPlan {
  weekOf: string;
  focus: string;
  days: WeeklyPlanItem[];
  advice: string;
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export interface DashboardData {
  user: {
    name: string;
    joinedDaysAgo: number;
  };
  habits: {
    total: number;
    doneToday: number;
    longestStreak: number;
    totalXp: number;
    topLevel: number;
    weekGrid: {
      name: string;
      icon: string;
      color: string;
      days: boolean[];
    }[];
  };
  social: {
    totalTodayMinutes: number;
    appsOverLimit: number;
    totalPlans: number;
    topOffender: string | null;
  };
  journal: {
    totalEntries: number;
    recentMoods: string[];
    lastEntryDate: string | null;
    currentStreak: number;
  };
  feed: {
    totalFavorites: number;
    bookCount: number;
    videoCount: number;
  };
  growthScore: number;
}