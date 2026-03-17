// src/lib/utils.ts (add this function)
import { format, subDays } from "date-fns";

export function calculateStreak(logs: { date: Date; completed: boolean }[]): number {
  let streak = 0;
  let checkDate = new Date();

  while (true) {
    const dateStr = format(checkDate, "yyyy-MM-dd");
    const log = logs.find(
      l => format(new Date(l.date), "yyyy-MM-dd") === dateStr && l.completed
    );
    if (!log) break;
    streak++;
    checkDate = subDays(checkDate, 1);
  }

  return streak;
}
