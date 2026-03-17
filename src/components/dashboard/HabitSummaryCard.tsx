"use client";
import { useRouter } from "next/navigation";
import { DashboardData } from "@/types";

interface Props {
  habits: DashboardData["habits"];
}

export function HabitSummaryCard({ habits }: Props) {
  const router = useRouter();
  const pct = habits.total > 0
    ? Math.round((habits.doneToday / habits.total) * 100)
    : 0;

  return (
    <div style={{
      background: "var(--color-background-primary)",
      border: "0.5px solid var(--color-border-tertiary)",
      borderRadius: 14, padding: "16px 18px",
    }}>
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: 14,
      }}>
        <div style={{ fontSize: 13, fontWeight: 500 }}>Habits today</div>
        <button
          onClick={() => router.push("/habits")}
          style={{ fontSize: 11.5, color: "var(--color-text-info)" }}
        >
          View all
        </button>
      </div>

      {/* Progress ring */}
      <div style={{
        display: "flex", alignItems: "center", gap: 14, marginBottom: 14,
      }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <svg
            width={64} height={64}
            style={{ transform: "rotate(-90deg)", display: "block" }}
          >
            <circle
              cx={32} cy={32} r={26}
              fill="none"
              stroke="var(--color-background-secondary)"
              strokeWidth={7}
            />
            <circle
              cx={32} cy={32} r={26}
              fill="none"
              stroke="#5BAD7F"
              strokeWidth={7}
              strokeDasharray={2 * Math.PI * 26}
              strokeDashoffset={2 * Math.PI * 26 * (1 - pct / 100)}
              strokeLinecap="round"
            />
          </svg>
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center",
            justifyContent: "center",
            fontSize: 13, fontWeight: 700,
            color: "var(--color-text-primary)",
          }}>
            {pct}%
          </div>
        </div>

        <div>
          <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.5px" }}>
            {habits.doneToday}
            <span style={{
              fontSize: 14, color: "var(--color-text-secondary)",
              fontWeight: 400,
            }}>
              /{habits.total}
            </span>
          </div>
          <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
            done today
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
        gap: 8,
      }}>
        {[
          { label: "Best streak", value: `${habits.longestStreak}d` },
          { label: "Top level", value: `Lv ${habits.topLevel}` },
          { label: "Total XP", value: habits.totalXp },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              textAlign: "center", padding: "8px 6px",
              background: "var(--color-background-secondary)",
              borderRadius: 8,
            }}
          >
            <div style={{
              fontSize: 14, fontWeight: 600,
              color: "var(--color-text-primary)",
            }}>
              {s.value}
            </div>
            <div style={{ fontSize: 10, color: "var(--color-text-secondary)" }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}