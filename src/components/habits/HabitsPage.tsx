"use client";
import { useState } from "react";
import { useHabits } from "@/hooks/useHabits";
import { HabitCard } from "./HabitCard";
import { AddHabitModal } from "./AddHabitModal";
import { HabitScheduler } from "./HabitScheduler";

export function HabitsPage() {
  const {
    habits, loading, error,
    addHabit, updateHabit, deleteHabit, logHabit,
    getStreak, getWeekDots, isLoggedToday,
  } = useHabits();

  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState<"all" | "build" | "break">("all");

  const filtered = habits.filter((h) =>
    filter === "all" ? true : h.type === filter.toUpperCase()
  );

  const totalDoneToday = habits.filter((h) => isLoggedToday(h)).length;
  const totalStreak = habits.reduce((sum, h) => sum + getStreak(h), 0);
  const longestStreak = Math.max(0, ...habits.map((h) => getStreak(h)));

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "var(--color-text-secondary)" }}>
        Loading habits...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "var(--color-text-danger)" }}>
        {error}
      </div>
    );
  }

  return (
    <>
      <HabitScheduler habits={habits} />

      <div className="app-container">

        {/* Summary stats */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
          gap: 12, marginBottom: 24,
        }}>
          {[
            { label: "Done today", value: `${totalDoneToday} / ${habits.length}` },
            { label: "Combined streak", value: `${totalStreak} days` },
            { label: "Longest streak", value: `${longestStreak} days` },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                background: "var(--color-background-secondary)",
                borderRadius: 10, padding: "14px 16px",
              }}
            >
              <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 6 }}>
                {s.label}
              </div>
              <div style={{ fontSize: 24, fontWeight: 500 }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
          {(["all", "build", "break"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "6px 16px", fontSize: 13, borderRadius: 20,
                background: filter === f
                  ? "var(--color-background-info)"
                  : "var(--color-background-secondary)",
                color: filter === f
                  ? "var(--color-text-info)"
                  : "var(--color-text-secondary)",
                borderColor: filter === f
                  ? "var(--color-border-info)"
                  : "var(--color-border-tertiary)",
                fontWeight: filter === f ? 500 : 400,
              }}
            >
              {f === "all" ? "All habits" : f === "build" ? "Building" : "Breaking"}
            </button>
          ))}
        </div>

        {/* Habits grid */}
        {filtered.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "40px 20px",
            color: "var(--color-text-secondary)", fontSize: 14,
          }}>
            {habits.length === 0
              ? "No habits yet. Add your first one below."
              : "No habits in this filter."}
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
            gap: 16, marginBottom: 16,
          }}>
            {filtered.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                streak={getStreak(habit)}
                weekDots={getWeekDots(habit)}
                isLoggedToday={isLoggedToday(habit)}
                onLog={logHabit}
                onUpdate={updateHabit}
                onDelete={deleteHabit}
              />
            ))}
          </div>
        )}

        {/* Add habit button */}
        <button
          onClick={() => setShowAdd(true)}
          style={{
            width: "100%", padding: "13px",
            borderStyle: "dashed", fontSize: 14,
            color: "var(--color-text-secondary)",
          }}
        >
          + Add new habit
        </button>
      </div>

      {showAdd && (
        <AddHabitModal
          onAdd={addHabit}
          onClose={() => setShowAdd(false)}
        />
      )}
    </>
  );
}