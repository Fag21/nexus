"use client";
import { useState } from "react";
import { TodaySummary } from "@/types/social";
import { SocialPlan } from "@/types/social";
import { getLast7Days } from "@/lib/social";
import { UsageChart } from "./UsageChart";
import { LogUsageModal } from "./LogUsageModal";

interface Props {
  plan: SocialPlan;
  summary: TodaySummary;
  onLog: (planId: string, minutes: number) => Promise<void>;
  onUpdateLimit: (id: string, limit: number) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const QUICK_ADD_MINUTES = [15, 30, 60];

export function PlanCard({ plan, summary, onLog, onUpdateLimit, onDelete }: Props) {
  const [showLog, setShowLog] = useState(false);
  const [editLimit, setEditLimit] = useState(false);
  const [newLimit, setNewLimit] = useState(plan.dailyLimit);
  const [quickAdding, setQuickAdding] = useState<number | null>(null);

  const quickAdd = async (minutes: number) => {
    setQuickAdding(minutes);
    try {
      await onLog(plan.id, minutes);
    } finally {
      setQuickAdding(null);
    }
  };

  const chartData = getLast7Days(plan.logs, plan.dailyLimit);

  const barColor = summary.isOver
    ? "#B83232"
    : summary.isNearLimit
    ? "#B86B1A"
    : "#2D7A4F";

  const badgeStyle: React.CSSProperties = summary.isOver
    ? { background: "#FAECE7", color: "#712B13", border: "1px solid #F5C4B3" }
    : summary.isNearLimit
    ? { background: "#FAEEDA", color: "#633806", border: "1px solid #FAC775" }
    : { background: "#EAF3DE", color: "#3B6D11", border: "1px solid #C0DD97" };

  const badgeText = summary.isOver
    ? `${summary.usedToday - summary.dailyLimit}m over`
    : summary.isNearLimit
    ? `${summary.dailyLimit - summary.usedToday}m left`
    : "On track";

  return (
    <div style={{
      background: "white", border: "1px solid #DDE5D8",
      borderRadius: 16, padding: "20px 22px",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#1A1F16", marginBottom: 2 }}>
            {plan.appName}
          </div>
          <div style={{ fontSize: 12, color: "#9EAB96" }}>
            {editLimit ? (
              <span>
                Limit:{" "}
                <input
                  type="number"
                  value={newLimit}
                  onChange={(e) => setNewLimit(Number(e.target.value))}
                  style={{ width: 50, fontSize: 12, border: "1px solid #DDE5D8", borderRadius: 4, padding: "1px 4px" }}
                />{" "}
                min{" "}
                <button
                  onClick={async () => { await onUpdateLimit(plan.id, newLimit); setEditLimit(false); }}
                  style={{ fontSize: 11, color: "#2D7A4F", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}
                >
                  Save
                </button>
              </span>
            ) : (
              <span>
                Limit: {plan.dailyLimit} min/day{" "}
                <button
                  onClick={() => setEditLimit(true)}
                  style={{ fontSize: 11, color: "#9EAB96", background: "none", border: "none", cursor: "pointer" }}
                >
                  Edit
                </button>
              </span>
            )}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, ...badgeStyle }}>
            {badgeText}
          </span>
          <button
            onClick={() => onDelete(plan.id)}
            style={{ background: "none", border: "none", color: "#9EAB96", cursor: "pointer", fontSize: 16, lineHeight: 1 }}
          >
            ×
          </button>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 24, fontWeight: 700, color: barColor, letterSpacing: -1 }}>
          {summary.usedToday}
          <span style={{ fontSize: 14, color: "#9EAB96", fontWeight: 400 }}>/{plan.dailyLimit} min</span>
        </span>
        <span style={{ fontSize: 13, fontWeight: 600, color: barColor }}>{summary.percentage}%</span>
      </div>

      <div style={{ height: 8, background: "#EDEFEA", borderRadius: 4, overflow: "hidden", marginBottom: 16 }}>
        <div style={{
          height: "100%", borderRadius: 4,
          width: `${Math.min(summary.percentage, 100)}%`,
          background: barColor, transition: "width .4s",
        }} />
      </div>

      <UsageChart data={chartData} />

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16 }}>
        <span style={{ fontSize: 12, color: "#9EAB96", fontWeight: 500 }}>Quick add</span>
        {QUICK_ADD_MINUTES.map((m) => (
          <button
            key={m}
            onClick={() => quickAdd(m)}
            disabled={quickAdding !== null}
            style={{
              flex: 1, padding: "7px 0", borderRadius: 8,
              border: "1px solid #DDE5D8", background: "#F6F8F4",
              fontSize: 13, fontWeight: 600, color: "#3D4A38",
              cursor: quickAdding !== null ? "default" : "pointer",
              opacity: quickAdding !== null && quickAdding !== m ? 0.5 : 1,
            }}
          >
            {quickAdding === m ? "…" : `+${m}m`}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button
          onClick={() => setShowLog(true)}
          style={{
            flex: 1, padding: "9px 0", borderRadius: 8,
            border: "1px solid #DDE5D8", background: "white",
            fontSize: 13, fontWeight: 500, cursor: "pointer", color: "#3D4A38",
          }}
        >
          + Custom
        </button>
        <button
          onClick={() => {
            if (confirm(`Block ${plan.appName} for 2 hours?`)) {
              alert("Focus mode started — open your phone settings to apply the block.");
            }
          }}
          style={{
            padding: "9px 16px", borderRadius: 8,
            border: "1px solid #F5C4B3", background: "#FAECE7",
            fontSize: 13, fontWeight: 500, cursor: "pointer", color: "#712B13",
          }}
        >
          Block app
        </button>
      </div>

      {showLog && (
        <LogUsageModal
          appName={plan.appName}
          usedToday={summary.usedToday}
          dailyLimit={plan.dailyLimit}
          onClose={() => setShowLog(false)}
          onLog={async (minutes) => { await onLog(plan.id, minutes); }}
        />
      )}
    </div>
  );
}