import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardData } from "@/types";
import { format, subDays, differenceInDays } from "date-fns";

export async function GET() {
  const session = await auth();
  const userId = (session as { user?: { id?: string } } | null | undefined)?.user?.id;
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sevenDaysAgo = subDays(new Date(), 7);
  const thirtyDaysAgo = subDays(new Date(), 30);

  const [user, habits, socialPlans, journals, favorites] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.habit.findMany({
      where: { userId, isActive: true },
      include: {
        logs: {
          where: { date: { gte: thirtyDaysAgo } },
          orderBy: { date: "desc" },
        },
      },
    }),
    prisma.socialPlan.findMany({
      where: { userId, isActive: true },
      include: {
        logs: {
          where: { date: { gte: sevenDaysAgo } },
        },
      },
    }),
    prisma.journal.findMany({
      where: { userId },
      orderBy: { date: "desc" },
    }),
    prisma.favorite.findMany({ where: { userId } }),
  ]);

  // ── Habits ──────────────────────────────────────────────────
  const todayStr = format(new Date(), "yyyy-MM-dd");

  const doneToday = habits.filter((h) =>
    h.logs.some(
      (l) => format(new Date(l.date), "yyyy-MM-dd") === todayStr && l.completed
    )
  ).length;

  // Streak per habit
  const getStreak = (logs: { date: Date; completed: boolean }[]) => {
    let streak = 0;
    let check = new Date();
    while (true) {
      const ds = format(check, "yyyy-MM-dd");
      const found = logs.find(
        (l) => format(new Date(l.date), "yyyy-MM-dd") === ds && l.completed
      );
      if (!found) break;
      streak++;
      check = subDays(check, 1);
    }
    return streak;
  };

  const longestStreak = Math.max(0, ...habits.map((h) => getStreak(h.logs)));
  const totalXp = habits.reduce((s, h) => s + h.xp, 0);
  const topLevel = Math.max(1, ...habits.map((h) => h.level));

  // 7-day grid for heatmap
  const weekGrid = habits.map((h) => ({
    name: h.name,
    icon: h.icon,
    color: h.color,
    days: Array.from({ length: 7 }, (_, i) => {
      const ds = format(subDays(new Date(), 6 - i), "yyyy-MM-dd");
      return h.logs.some(
        (l) => format(new Date(l.date), "yyyy-MM-dd") === ds && l.completed
      );
    }),
  }));

  // ── Social ──────────────────────────────────────────────────
  const socialTodayMinutes = socialPlans.reduce((sum, p) => {
    const todayLogs = p.logs.filter(
      (l) => format(new Date(l.date), "yyyy-MM-dd") === todayStr
    );
    return sum + todayLogs.reduce((s, l) => s + l.minutesUsed, 0);
  }, 0);

  const appsOverLimit = socialPlans.filter((p) => {
    const todayUsed = p.logs
      .filter((l) => format(new Date(l.date), "yyyy-MM-dd") === todayStr)
      .reduce((s, l) => s + l.minutesUsed, 0);
    return todayUsed > p.dailyLimit;
  }).length;

  const topOffender =
    socialPlans
      .map((p) => ({
        name: p.appName,
        used: p.logs
          .filter((l) => format(new Date(l.date), "yyyy-MM-dd") === todayStr)
          .reduce((s, l) => s + l.minutesUsed, 0),
        limit: p.dailyLimit,
      }))
      .filter((p) => p.used > p.limit)
      .sort((a, b) => b.used - b.limit - (a.used - a.limit))[0]?.name ?? null;

  // ── Journal ──────────────────────────────────────────────────
  const activeJournals = journals.filter((j) => !j.burned);
  const recentMoods = activeJournals.slice(0, 7).map((j) => j.mood);

  // Journal streak — consecutive days with an entry
  let journalStreak = 0;
  let checkDay = new Date();
  while (true) {
    const ds = format(checkDay, "yyyy-MM-dd");
    const hasEntry = activeJournals.some(
      (j) => format(new Date(j.date), "yyyy-MM-dd") === ds
    );
    if (!hasEntry) break;
    journalStreak++;
    checkDay = subDays(checkDay, 1);
  }

  const lastEntryDate = activeJournals[0]
    ? format(new Date(activeJournals[0].date), "MMM d")
    : null;

  // ── Feed ────────────────────────────────────────────────────
  const bookCount = favorites.filter((f) => f.type === "BOOK").length;
  const videoCount = favorites.filter((f) => f.type === "VIDEO").length;

  // ── Growth Score ─────────────────────────────────────────────
  // Composite: habits(40%) + social(25%) + journal(20%) + feed(15%)
  const habitScore =
    habits.length > 0 ? Math.round((doneToday / habits.length) * 100) : 0;

  const socialScore =
    socialPlans.length > 0
      ? Math.round(
          ((socialPlans.length - appsOverLimit) / socialPlans.length) * 100
        )
      : 100;

  const journalScore = Math.min(journalStreak * 14, 100);

  const feedScore = Math.min(favorites.length * 10, 100);

  const growthScore = Math.round(
    habitScore * 0.4 +
    socialScore * 0.25 +
    journalScore * 0.2 +
    feedScore * 0.15
  );

  // ── Join date ────────────────────────────────────────────────
  const joinedDaysAgo = user?.createdAt
    ? differenceInDays(new Date(), new Date(user.createdAt))
    : 0;

  const data: DashboardData = {
    user: {
      name: user?.name?.split(" ")[0] ?? "Friend",
      joinedDaysAgo,
    },
    habits: {
      total: habits.length,
      doneToday,
      longestStreak,
      totalXp,
      topLevel,
      weekGrid,
    },
    social: {
      totalTodayMinutes: socialTodayMinutes,
      appsOverLimit,
      totalPlans: socialPlans.length,
      topOffender,
    },
    journal: {
      totalEntries: activeJournals.length,
      recentMoods,
      lastEntryDate,
      currentStreak: journalStreak,
    },
    feed: {
      totalFavorites: favorites.length,
      bookCount,
      videoCount,
    },
    growthScore,
  };

  return NextResponse.json(data);
}