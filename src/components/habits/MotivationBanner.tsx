"use client";
import { useState } from "react";
import { Habit } from "@/types/index";

interface Props {
  habit: Habit;
  streak: number;
}

export function MotivationBanner({ habit, streak }: Props) {
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const fetchMotivation = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/habits/motivation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          habitName: habit.name,
          streak,
          type: habit.type,
          motivation: habit.motivation,
          ifSucceed: habit.ifSucceed,
        }),
      });
      const data = await res.json();
      setAiMessage(data.message);
      setExpanded(true);
    } catch {
      setAiMessage("Keep going — every day counts.");
      setExpanded(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: 12 }}>
      {/* Personal motivation */}
      {habit.motivation && (
        <div
          style={{
            fontSize: 12,
            color: "var(--color-text-secondary)",
            fontStyle: "italic",
            marginBottom: 8,
            padding: "8px 12px",
            background: "var(--color-background-secondary)",
            borderRadius: 8,
            borderLeft: "3px solid var(--color-border-success)",
          }}
        >
          &quot;{habit.motivation}&quot;
        </div>
      )}

      {/* ifSucceed reward */}
      {habit.ifSucceed && (
        <div
          style={{
            fontSize: 11,
            color: "var(--color-text-success)",
            marginBottom: 8,
            padding: "6px 10px",
            background: "var(--color-background-success)",
            borderRadius: 6,
            border: "0.5px solid var(--color-border-success)",
          }}
        >
          Reward: {habit.ifSucceed}
        </div>
      )}

      {/* AI motivation */}
      {expanded && aiMessage ? (
        <div
          style={{
            fontSize: 13,
            lineHeight: 1.55,
            color: "var(--color-text-primary)",
            padding: "10px 12px",
            background: "var(--color-background-info)",
            border: "0.5px solid var(--color-border-info)",
            borderRadius: 8,
            marginBottom: 6,
          }}
        >
          {aiMessage}
        </div>
      ) : (
        <button
          onClick={fetchMotivation}
          disabled={loading}
          style={{
            fontSize: 12,
            padding: "5px 12px",
            color: "var(--color-text-info)",
            background: "var(--color-background-info)",
            borderColor: "var(--color-border-info)",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "Getting motivation..." : "Motivate me ✦"}
        </button>
      )}
    </div>
  );
}
