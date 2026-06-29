"use client";
import { AiChat } from "./AiChat";
import { WeeklyPlan } from "./WeeklyPlan";
import { GrowthSummary } from "./GrowthSummary";

export function AiPage() {
  return (
    <div className="app-container">

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 380px",
        gap: 20,
        alignItems: "start",
      }}>

        {/* Left — Chat */}
        <div
          style={{
            background: "var(--color-background-primary)",
            border: "0.5px solid var(--color-border-tertiary)",
            borderRadius: 14, padding: "16px 20px",
            display: "flex", flexDirection: "column",
            height: "calc(100vh - 140px)",
            minHeight: 500,
          }}
        >
          <div style={{
            fontSize: 14, fontWeight: 500, marginBottom: 2,
          }}>
            Nexus Coach
          </div>
          <div style={{
            fontSize: 12, color: "var(--color-text-secondary)",
            marginBottom: 12,
          }}>
            Your personal self-development advisor
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
            <AiChat />
          </div>
        </div>

        {/* Right — Plan + Summary */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <WeeklyPlan />
          <GrowthSummary />
        </div>
      </div>
    </div>
  );
}