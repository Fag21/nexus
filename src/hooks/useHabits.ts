"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Habit } from "@/types/index";

type WeekDot = "done" | "missed" | "today" | "empty";

interface UseHabitsState {
  habits: Habit[];
  loading: boolean;
  error: string | null;
  addHabit: (data: Partial<Habit>) => Promise<void>;
  updateHabit: (id: string, data: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  logHabit: (
    id: string,
    completed: boolean,
    note?: string
  ) => Promise<{ levelUp: boolean; newLevel: number }>;
  getStreak: (habit: Habit) => number;
  getWeekDots: (habit: Habit) => WeekDot[];
  isLoggedToday: (habit: Habit) => boolean;
}

function isoDay(d: Date) {
  return d.toISOString().slice(0, 10);
}

function todayIsoDay() {
  return isoDay(new Date());
}

export function useHabits(): UseHabitsState {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Load from the database ───────────────────────────────────
  const refetch = useCallback(async () => {
    try {
      const res = await fetch("/api/habits");
      if (!res.ok) throw new Error();
      setHabits(await res.json());
      setError(null);
    } catch {
      setError("Could not load habits");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const addHabit = useCallback(async (data: Partial<Habit>) => {
    const res = await fetch("/api/habits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Could not add habit");
    const created: Habit = await res.json();
    setHabits((prev) => [created, ...prev]);
  }, []);

  const updateHabit = useCallback(async (id: string, data: Partial<Habit>) => {
    const res = await fetch(`/api/habits/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Could not update habit");
    const updated: Habit = await res.json();
    setHabits((prev) => prev.map((h) => (h.id === id ? updated : h)));
  }, []);

  const deleteHabit = useCallback(async (id: string) => {
    const res = await fetch(`/api/habits/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Could not delete habit");
    setHabits((prev) => prev.filter((h) => h.id !== id));
  }, []);

  const isLoggedToday = useCallback((habit: Habit) => {
    const t = todayIsoDay();
    return habit.logs.some((l) => l.date.slice(0, 10) === t && l.completed);
  }, []);

  const getStreak = useCallback((habit: Habit) => {
    const completedDays = new Set(
      habit.logs.filter((l) => l.completed).map((l) => l.date.slice(0, 10))
    );

    let streak = 0;
    const d = new Date();
    for (;;) {
      const day = isoDay(d);
      if (!completedDays.has(day)) break;
      streak += 1;
      d.setDate(d.getDate() - 1);
    }
    return streak;
  }, []);

  const getWeekDots = useCallback((habit: Habit): WeekDot[] => {
    const t = todayIsoDay();
    const completedDays = new Set(
      habit.logs.filter((l) => l.completed).map((l) => l.date.slice(0, 10))
    );
    const dots: WeekDot[] = [];
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const day = isoDay(d);
      if (day === t) {
        dots.push("today");
      } else if (completedDays.has(day)) {
        dots.push("done");
      } else {
        dots.push("empty");
      }
    }
    return dots;
  }, []);

  const logHabit = useCallback(
    async (id: string, completed: boolean, note?: string) => {
      const res = await fetch("/api/habits/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habitId: id, completed, note }),
      });
      if (!res.ok) throw new Error("Could not log habit");
      const data: {
        log: { id: string; date: string };
        levelUp: boolean;
        newLevel: number;
        newXp: number;
      } = await res.json();

      setHabits((prev) =>
        prev.map((h) => {
          if (h.id !== id) return h;
          const newLog = {
            id: data.log.id,
            habitId: id,
            date: data.log.date,
            completed,
            note,
          };
          return {
            ...h,
            // XP/level only change on a completed log (matches the API)
            ...(completed ? { xp: data.newXp, level: data.newLevel } : {}),
            logs: [newLog, ...h.logs],
          };
        })
      );

      return {
        levelUp: completed && !!data.levelUp,
        newLevel: data.newLevel ?? 1,
      };
    },
    []
  );

  return useMemo(
    () => ({
      habits,
      loading,
      error,
      addHabit,
      updateHabit,
      deleteHabit,
      logHabit,
      getStreak,
      getWeekDots,
      isLoggedToday,
    }),
    [
      habits,
      loading,
      error,
      addHabit,
      updateHabit,
      deleteHabit,
      logHabit,
      getStreak,
      getWeekDots,
      isLoggedToday,
    ]
  );
}
