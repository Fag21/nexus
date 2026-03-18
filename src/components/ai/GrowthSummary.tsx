"use client";
import { useState } from "react";

interface Summary {
  headline: string;
  strength: string;
  challenge: string;
  momentum: "high" | "medium" | "low";
  advice: string;
}

const MOMENTUM_STYLES = {
  high: {
    bg: "var(--color-background-success)",
    color: "var(--color-text-success)",
    border: "var(--color-border-success)",
    label: "High momentum",
  },
  medium: {
    bg: "var(--color-background-warning)",
    color: "var(--color-text-warning)",
    border: "var(--color-border-warning)",
    label: "Building momentum",
  },
  low: {
    bg: "var(--color-background-danger)",
    color: "var(--color-text-danger)",
    border: "var(--color-border-danger)",
    label: "Needs attention",
  },
};

export function GrowthSummary() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/summary");
      if (!res.ok) throw new Error("Failed to generate");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSummary(data);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      setError(message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const style = summary
    ? (MOMENTUM_STYLES[summary.momentum] ?? MOMENTUM_STYLES.medium)
    : null;

  return (
    <div
      style={{
        background: "var(--color-background-primary)",
        border: "0.5px solid var(--color-border-tertiary)",
        borderRadius: 14,
        padding: "18px 20px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 500 }}>
          30-day growth summary
        </div>
        <button
          onClick={generate}
          disabled={loading}
          style={{
            fontSize: 12,
            padding: "5px 14px",
            background: "var(--color-background-info)",
            color: "var(--color-text-info)",
            borderColor: "var(--color-border-info)",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "Analysing..." : summary ? "Refresh" : "Analyse my month"}
        </button>
      </div>

      {error && (
        <div
          style={{
            fontSize: 13,
            color: "var(--color-text-danger)",
            padding: "8px 12px",
            borderRadius: 8,
            background: "var(--color-background-danger)",
            border: "0.5px solid var(--color-border-danger)",
            marginBottom: 12,
          }}
        >
          {error}
        </div>
      )}

      {!summary && !loading && (
        <p
          style={{
            fontSize: 13,
            color: "var(--color-text-secondary)",
            lineHeight: 1.6,
          }}
        >
          Get an honest AI analysis of your last 30 days — your biggest wins,
          main challenges, and forward momentum.
        </p>
      )}

      {summary && style && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Headline + momentum */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 10,
            }}
          >
            <p
              style={{
                fontSize: 15,
                fontWeight: 500,
                color: "var(--color-text-primary)",
                lineHeight: 1.4,
                margin: 0,
                flex: 1,
              }}
            >
              {summary.headline}
            </p>
            <span
              style={{
                fontSize: 11,
                padding: "3px 10px",
                borderRadius: 20,
                fontWeight: 500,
                flexShrink: 0,
                background: style.bg,
                color: style.color,
                border: `0.5px solid ${style.border}`,
              }}
            >
              {style.label}
            </span>
          </div>

          {/* Strength */}
          <div
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              background: "var(--color-background-success)",
              border: "0.5px solid var(--color-border-success)",
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.6px",
                textTransform: "uppercase",
                color: "var(--color-text-success)",
                marginBottom: 4,
              }}
            >
              Your biggest win
            </div>
            <p
              style={{
                fontSize: 13,
                lineHeight: 1.55,
                color: "var(--color-text-primary)",
                margin: 0,
              }}
            >
              {summary.strength}
            </p>
          </div>

          {/* Challenge */}
          <div
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              background: "var(--color-background-warning)",
              border: "0.5px solid var(--color-border-warning)",
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.6px",
                textTransform: "uppercase",
                color: "var(--color-text-warning)",
                marginBottom: 4,
              }}
            >
              Main area to improve
            </div>
            <p
              style={{
                fontSize: 13,
                lineHeight: 1.55,
                color: "var(--color-text-primary)",
                margin: 0,
              }}
            >
              {summary.challenge}
            </p>
          </div>

          {/* Advice */}
          <div
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              background: "var(--color-background-info)",
              border: "0.5px solid var(--color-border-info)",
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.6px",
                textTransform: "uppercase",
                color: "var(--color-text-info)",
                marginBottom: 4,
              }}
            >
              Moving forward
            </div>
            <p
              style={{
                fontSize: 13,
                lineHeight: 1.6,
                color: "var(--color-text-primary)",
                margin: 0,
              }}
            >
              {summary.advice}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
