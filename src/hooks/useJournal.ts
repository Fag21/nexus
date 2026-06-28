"use client";
import { useState, useEffect, useCallback } from "react";
import { Journal, Mood } from "@/types/index";

export function useJournal() {
  const [entries, setEntries] = useState<Journal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEntries = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/journal");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setEntries(data);
    } catch {
      setError("Could not load journal entries");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const addEntry = async (data: {
    title?: string;
    content: string;
    mood: Mood;
  }) => {
    const res = await fetch("/api/journal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create entry");
    const entry = await res.json();
    setEntries((prev) => [entry, ...prev]);
  };

  const updateEntry = async (
    id: string,
    data: Partial<Pick<Journal, "title" | "content" | "mood">>
  ) => {
    const res = await fetch(`/api/journal/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update entry");
    const updated = await res.json();
    setEntries((prev) => prev.map((e) => (e.id === id ? updated : e)));
  };

  const burnEntry = async (id: string) => {
    const res = await fetch(`/api/journal/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ burned: true }),
    });
    if (!res.ok) throw new Error("Failed to burn entry");
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, burned: true } : e))
    );
  };

  const deleteEntry = async (id: string) => {
    const res = await fetch(`/api/journal/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete entry");
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  // Journaling consistency — consecutive days up to today with an entry
  const getStreak = () => {
    const days = new Set(
      entries
        .filter((e) => !e.burned)
        .map((e) => new Date(e.date).toISOString().slice(0, 10))
    );
    let streak = 0;
    const d = new Date();
    for (;;) {
      const key = d.toISOString().slice(0, 10);
      if (!days.has(key)) break;
      streak += 1;
      d.setDate(d.getDate() - 1);
    }
    return streak;
  };

  // Entries written in the last 7 days
  const getThisWeekCount = () => {
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return entries.filter((e) => !e.burned && new Date(e.date).getTime() >= cutoff)
      .length;
  };

  // Build mood chart data — last 30 days
  const getMoodChartData = () => {
    const moodScore: Record<string, number> = {
      great: 5, good: 4, neutral: 3, low: 2, bad: 1,
    };
    return entries
      .filter((e) => !e.burned)
      .slice(0, 30)
      .reverse()
      .map((e) => ({
        date: new Date(e.date).toLocaleDateString("en", {
          month: "short", day: "numeric",
        }),
        score: moodScore[e.mood] ?? 3,
        mood: e.mood,
      }));
  };

  return {
    entries,
    loading,
    error,
    addEntry,
    updateEntry,
    burnEntry,
    deleteEntry,
    getMoodChartData,
    getStreak,
    getThisWeekCount,
    refetch: fetchEntries,
  };
}