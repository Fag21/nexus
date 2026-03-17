"use client";
import { useRouter } from "next/navigation";
import { DashboardData } from "@/types";

interface Props {
  social: DashboardData["social"];
}

export function SocialSummaryCard({ social }: Props) {
  const router = useRouter();
  const hours = Math.floor(social.totalTodayMinutes / 60);
  const mins = social.totalTodayMinutes % 60;
  const timeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  const isOver = social.appsOverLimit > 0;

  return (
    <div style={{
      background: "var(--color-background-primary)",
      border: isOver
        ? "1px solid var(--color-border-danger)"
        : "0.5px solid var(--color-border-tertiary)",
      borderRadius: 14, padding: "16px 18px",
    }}>
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: 14,
      }}>
        <div style={{ fontSize: 13, fontWeight: 500 }}>Screen time</div>
        <button
          onClick={() => router.push("/social")}
          style={{ fontSize: 11.5, color: "var(--color-text-info)" }}
        >
          Manage
        </button>
      </div>

      <div style={{
        display: "flex", alignItems: "baseline",
        gap: 8, marginBottom: 8,
      }}>
        <span style={{
          fontSize: 28, fontWeight: 600, letterSpacing: "-0.5px",
          color: isOver
            ? "var(--color-text-danger)"
            : "var(--color-text-success)",
        }}>
          {timeStr}
        </span>
        <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
          today
        </span>
      </div>

      {isOver ? (
        <div style={{
          padding: "8px 12px", borderRadius: 8,
          background: "var(--color-background-danger)",
          border: "0.5px solid var(--color-border-danger)",
          fontSize: 12, color: "var(--color-text-danger)",
          marginBottom: 10,
        }}>
          {social.appsOverLimit} app{social.appsOverLimit > 1 ? "s" : ""} over
          limit today
          {social.topOffender && ` — ${social.topOffender} is the main one`}
        </div>
      ) : (
        <div style={{
          padding: "8px 12px", borderRadius: 8,
          background: "var(--color-background-success)",
          border: "0.5px solid var(--color-border-success)",
          fontSize: 12, color: "var(--color-text-success)",
          marginBottom: 10,
        }}>
          All {social.totalPlans} apps within limit today
        </div>
      )}

      <div style={{
        fontSize: 11, color: "var(--color-text-secondary)",
      }}>
        {social.totalPlans} app{social.totalPlans !== 1 ? "s" : ""} tracked
      </div>
    </div>
  );
}