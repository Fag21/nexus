export interface SocialPlan {
    id: string;
    appName: string;
    dailyLimit: number;
    isActive: boolean;
    createdAt: string;
    logs: SocialLog[];
  }
  
  export interface SocialLog {
    id: string;
    planId: string;
    date: string;
    minutesUsed: number;
  }
  
  export interface TodaySummary {
    planId: string;
    appName: string;
    dailyLimit: number;
    usedToday: number;
    percentage: number;
    isOver: boolean;
    isNearLimit: boolean;
}