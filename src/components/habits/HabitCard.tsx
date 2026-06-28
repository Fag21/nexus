"use client";
import { useState } from "react";
import { Habit } from "@/types/index";
import { LevelBadge } from "./LevelBadge";
import { MotivationBanner } from "./MotivationBanner";
import { EditHabitModal } from "./EditHabitModal";
import { HabitDetailModal } from "./HabitDetailModal";

interface Props {
  habit: Habit;
  streak: number;
  weekDots: string[];
  isLoggedToday: boolean;
  onLog: (id: string, completed: boolean, note?: string) => Promise<{ levelUp: boolean; newLevel: number }>;
  onUpdate: (id: string, data: Partial<Habit>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function HabitCard({
  habit, streak, weekDots, isLoggedToday,
  onLog, onUpdate, onDelete,
}: Props) {
  const [showMotivation, setShowMotivation] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [logging, setLogging] = useState(false);
  const [levelUpMsg, setLevelUpMsg] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState("");
  const [showNote, setShowNote] = useState(false);

  const dotColors: Record<string, string> = {
    done: "#5BAD7F",
    missed: "#F5C4B3",
    today: "transparent",
    empty: "var(--color-background-secondary)",
  };

  const handleLog = async (completed: boolean) => {
    setLogging(true);
    try {
      const result = await onLog(habit.id, completed, noteInput || undefined);
      if (result.levelUp) {
        setLevelUpMsg(`Level up! You reached Level ${result.newLevel}`);
        setTimeout(() => setLevelUpMsg(null), 3000);
      }
      setShowNote(false);
      setNoteInput("");
    } finally {
      setLogging(false);
    }
  };

  return (
    <>
      <div
        style={{
          background: "var(--color-background-primary)",
          border: "0.5px solid var(--color-border-tertiary)",
          borderRadius: 14, padding: "16px 18px",
          borderTop: `3px solid ${habit.color}`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Level up flash */}
        {levelUpMsg && (
          <div
            style={{
              position: "absolute", inset: 0,
              background: "var(--color-background-success)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, fontWeight: 500,
              color: "var(--color-text-success)",
              zIndex: 10, borderRadius: 14,
            }}
          >
            {levelUpMsg}
          </div>
        )}

        {/* Header row */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12 }}>
          <div
            style={{
              width: 38, height: 38, borderRadius: 10,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, flexShrink: 0,
              background: `${habit.color}18`,
            }}
          >
            {habit.icon}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
              <span style={{ fontSize: 14, fontWeight: 500 }}>{habit.name}</span>
              <span
                style={{
                  fontSize: 10, padding: "1px 6px", borderRadius: 4,
                  background: habit.type === "BUILD"
                    ? "var(--color-background-success)"
                    : "var(--color-background-danger)",
                  color: habit.type === "BUILD"
                    ? "var(--color-text-success)"
                    : "var(--color-text-danger)",
                  border: `0.5px solid ${habit.type === "BUILD"
                    ? "var(--color-border-success)"
                    : "var(--color-border-danger)"}`,
                }}
              >
                {habit.type === "BUILD" ? "Build" : "Break"}
              </span>
            </div>
            {habit.description && (
              <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
                {habit.description}
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
            <button
              onClick={() => setShowDetail(true)}
              style={{
                fontSize: 11, padding: "3px 10px",
                color: "var(--color-text-info)",
                background: "var(--color-background-info)",
                borderColor: "var(--color-border-info)",
              }}
            >
              Coach
            </button>
            <button
              onClick={() => setShowEdit(true)}
              style={{ fontSize: 11, padding: "3px 8px", color: "var(--color-text-secondary)" }}
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(habit.id)}
              style={{ fontSize: 11, padding: "3px 8px", color: "var(--color-text-secondary)" }}
            >
              Delete
            </button>
          </div>
        </div>

        {/* Level + XP */}
        <div style={{ marginBottom: 12 }}>
          <LevelBadge level={habit.level} xp={habit.xp} />
        </div>

        {/* Streak + frequency */}
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <div
            style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              background: "var(--color-background-warning)",
              border: "0.5px solid var(--color-border-warning)",
              borderRadius: 20, padding: "3px 10px",
              fontSize: 11, fontWeight: 500,
              color: "var(--color-text-warning)",
            }}
          >
            {streak > 0 ? `${streak} day streak` : "Start your streak"}
          </div>
          <div
            style={{
              display: "inline-flex", alignItems: "center",
              background: "var(--color-background-secondary)",
              borderRadius: 20, padding: "3px 10px",
              fontSize: 11, color: "var(--color-text-secondary)",
              border: "0.5px solid var(--color-border-tertiary)",
            }}
          >
            {habit.frequency}
            {habit.scheduledTime && ` · ${habit.scheduledTime}`}
          </div>
        </div>

        {/* 7-day dots */}
        <div style={{ display: "flex", gap: 6, marginBottom: 14, alignItems: "center" }}>
          {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, flex: 1 }}>
              <div
                style={{
                  width: "100%", height: weekDots[i] === "done" ? 24 : 10,
                  borderRadius: "3px 3px 0 0", minHeight: 10,
                  background: dotColors[weekDots[i]] ?? "var(--color-background-secondary)",
                  border: weekDots[i] === "today"
                    ? `1.5px solid ${habit.color}`
                    : "none",
                  transition: "height 0.3s",
                }}
              />
              <span style={{ fontSize: 9, color: "var(--color-text-secondary)" }}>{day}</span>
            </div>
          ))}
        </div>

        {/* Optional note */}
        {showNote && (
          <input
            value={noteInput}
            onChange={(e) => setNoteInput(e.target.value)}
            placeholder="Add a note for today... (optional)"
            style={{ width: "100%", marginBottom: 10, fontSize: 12 }}
          />
        )}

        {/* Action buttons */}
        {isLoggedToday ? (
          <div
            style={{
              textAlign: "center", fontSize: 13,
              color: "var(--color-text-success)",
              padding: "8px",
              background: "var(--color-background-success)",
              borderRadius: 8,
              border: "0.5px solid var(--color-border-success)",
            }}
          >
            Logged today
          </div>
        ) : (
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => handleLog(true)}
              disabled={logging}
              style={{
                flex: 2,
                background: "var(--color-background-success)",
                color: "var(--color-text-success)",
                borderColor: "var(--color-border-success)",
                opacity: logging ? 0.6 : 1,
              }}
            >
              {logging ? "Logging..." : habit.type === "BUILD" ? "Done today" : "Kept it today"}
            </button>
            <button
              onClick={() => handleLog(false)}
              disabled={logging}
              style={{
                flex: 1,
                color: "var(--color-text-secondary)",
                opacity: logging ? 0.6 : 1,
              }}
            >
              Missed
            </button>
            <button
              onClick={() => setShowNote(!showNote)}
              style={{ fontSize: 12, padding: "6px 10px", color: "var(--color-text-secondary)" }}
            >
              Note
            </button>
          </div>
        )}

        {/* Motivation toggle */}
        <div style={{ marginTop: 10 }}>
          <button
            onClick={() => setShowMotivation(!showMotivation)}
            style={{
              fontSize: 12, padding: "4px 0",
              color: "var(--color-text-secondary)",
              background: "transparent", border: "none",
              cursor: "pointer",
            }}
          >
            {showMotivation ? "Hide motivation ↑" : "Show motivation ↓"}
          </button>
          {showMotivation && <MotivationBanner habit={habit} streak={streak} />}
        </div>
      </div>

      {showEdit && (
        <EditHabitModal
          habit={habit}
          onUpdate={onUpdate}
          onClose={() => setShowEdit(false)}
        />
      )}

      {showDetail && (
        <HabitDetailModal
          habit={habit}
          streak={streak}
          onUpdate={onUpdate}
          onClose={() => setShowDetail(false)}
        />
      )}
    </>
  );
}