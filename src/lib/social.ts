import { SocialLog, SocialPlan, TodaySummary } from "@/types/social";

export function getTodaySummaries(plans: SocialPlan[]): TodaySummary[] {
  const todayStr = new Date().toISOString().slice(0, 10);

  return plans.map((plan) => {
    const usedToday = plan.logs
      .filter((l) => l.date.slice(0, 10) === todayStr)
      .reduce((sum, l) => sum + l.minutesUsed, 0);

    const percentage = Math.round((usedToday / plan.dailyLimit) * 100);

    return {
      planId: plan.id,
      appName: plan.appName,
      dailyLimit: plan.dailyLimit,
      usedToday,
      percentage,
      isOver: usedToday >= plan.dailyLimit,
      isNearLimit: percentage >= 80 && usedToday < plan.dailyLimit,
    };
  });
}

export function getLast7Days(
  logs: SocialLog[],
  dailyLimit: number
): { day: string; used: number; limit: number }[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayStr = d.toISOString().slice(0, 10);
    const used = logs
      .filter((l) => l.date.slice(0, 10) === dayStr)
      .reduce((sum, l) => sum + l.minutesUsed, 0);
    return {
      day: d.toLocaleDateString("en", { weekday: "short" }),
      used,
      limit: dailyLimit,
    };
  });
}