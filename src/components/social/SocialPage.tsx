"use client";
import { useState } from "react";
import { useSocial } from "@/hooks/useSocial";
import { useSocialAlert } from "@/hooks/useSocialAlert";
import { getTodaySummaries } from "@/lib/social";
import { PlanCard } from "./PlanCard";
import { AddPlanModal } from "./AddPlanModal";
import { AiAdviceCard } from "./AiAdviceCard";

export function SocialPage() {
  const { plans, loading, addPlan, updateLimit, deletePlan, logUsage } = useSocial();
  const [showAdd, setShowAdd] = useState(false);

  const summaries = getTodaySummaries(plans);
  useSocialAlert(summaries);

  const totalUsed = summaries.reduce((s, x) => s + x.usedToday, 0);
  const overCount = summaries.filter((s) => s.isOver).length;

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, color: "#9EAB96", fontSize: 14 }}>
        Loading your plans...
      </div>
    );
  }

  return (
    <div className="app-container">

      {/* Header stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Total screen time", value: `${Math.floor(totalUsed / 60)}h ${totalUsed % 60}m`, sub: "today" },
          { label: "Apps over limit", value: overCount, sub: `of ${plans.length} tracked`, danger: overCount > 0 },
          { label: "Plans active", value: plans.length, sub: "being tracked" },
        ].map((stat) => (
          <div key={stat.label} style={{
            background: "white", border: "1px solid #DDE5D8",
            borderRadius: 12, padding: "16px 18px",
          }}>
            <div style={{ fontSize: 11, color: "#9EAB96", fontWeight: 500, marginBottom: 6 }}>{stat.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -1, color: stat.danger ? "#B83232" : "#1A1F16", lineHeight: 1 }}>
              {stat.value}
            </div>
            <div style={{ fontSize: 12, color: "#9EAB96", marginTop: 4 }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* AI advice */}
      {plans.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <AiAdviceCard summaries={summaries} />
        </div>
      )}

      {/* Plan cards */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".8px", textTransform: "uppercase", color: "#9EAB96" }}>
          Your apps
        </div>
        <button
          onClick={() => setShowAdd(true)}
          style={{
            padding: "7px 16px", borderRadius: 8, border: "none",
            background: "#2D7A4F", color: "white", fontSize: 13,
            fontWeight: 600, cursor: "pointer",
          }}
        >
          + Add app
        </button>
      </div>

      {plans.length === 0 ? (
        <div style={{
          background: "white", border: "1px dashed #DDE5D8",
          borderRadius: 16, padding: 40, textAlign: "center",
        }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📱</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#3D4A38", marginBottom: 6 }}>No apps tracked yet</div>
          <div style={{ fontSize: 13, color: "#9EAB96", marginBottom: 20 }}>Add your first app to start tracking your screen time.</div>
          <button
            onClick={() => setShowAdd(true)}
            style={{
              padding: "10px 24px", borderRadius: 8, border: "none",
              background: "#2D7A4F", color: "white", fontSize: 13,
              fontWeight: 600, cursor: "pointer",
            }}
          >
            Add first app
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {plans.map((plan) => {
            const summary = summaries.find((s) => s.planId === plan.id)!;
            return (
              <PlanCard
                key={plan.id}
                plan={plan}
                summary={summary}
                onLog={logUsage}
                onUpdateLimit={updateLimit}
                onDelete={deletePlan}
              />
            );
          })}
        </div>
      )}

      {showAdd && (
        <AddPlanModal onClose={() => setShowAdd(false)} onAdd={addPlan} />
      )}
    </div>
  );
}