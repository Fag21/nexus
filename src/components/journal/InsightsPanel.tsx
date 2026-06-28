"use client";
import { useState } from "react";
import type { JournalInsights } from "@/types/index";

interface Props {
  entryCount: number;
}

const MIN_ENTRIES = 3;

export function InsightsPanel({ entryCount }: Props) {
  const [insights, setInsights] = useState<JournalInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/journal/insights", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to generate insights");
      setInsights(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const locked = entryCount < MIN_ENTRIES;

  return (
    <div
      style={{
        background: "var(--color-background-primary)",
        border: "0.5px solid var(--color-border-tertiary)",
        borderRadius: 12,
        padding: "16px 18px",
        marginBottom: 20,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: insights ? 14 : 0,
        }}
      >
        <div>
          <div style={{ fontSize: 13, fontWeight: 500 }}>
            Insights from your psychologist ✦
          </div>
          <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginTop: 2 }}>
            A reflective read across your recent entries — private and on-demand.
          </div>
        </div>
        <button
          onClick={generate}
          disabled={loading || locked}
          title={locked ? `Write ${MIN_ENTRIES}+ entries to unlock` : undefined}
          style={{
            flexShrink: 0,
            fontSize: 12,
            padding: "6px 14px",
            background: "var(--color-background-info)",
            color: "var(--color-text-info)",
            borderColor: "var(--color-border-info)",
            opacity: loading || locked ? 0.55 : 1,
          }}
        >
          {loading
            ? "Reflecting…"
            : insights
            ? "Refresh"
            : "Generate insights"}
        </button>
      </div>

      {locked && !insights && (
        <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 10 }}>
          Write at least {MIN_ENTRIES} entries and I&apos;ll reflect on the
          patterns, strengths, and themes I notice.
        </div>
      )}

      {error && (
        <div style={{ fontSize: 13, color: "var(--color-text-danger)", marginTop: 10 }}>
          {error}
        </div>
      )}

      {insights && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Summary */}
          <p style={{ fontSize: 14, lineHeight: 1.65, margin: 0 }}>
            {insights.summary}
          </p>

          {/* Themes */}
          {insights.themes?.length > 0 && (
            <Section title="Recurring themes">
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {insights.themes.map((t) => (
                  <span
                    key={t}
                    style={{
                      fontSize: 12,
                      padding: "3px 10px",
                      borderRadius: 20,
                      background: "var(--color-background-secondary)",
                      border: "0.5px solid var(--color-border-tertiary)",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {/* Emotional pattern */}
          {insights.emotionalPattern && (
            <Section title="Emotional pattern">
              <p style={{ fontSize: 13, lineHeight: 1.6, margin: 0 }}>
                {insights.emotionalPattern}
              </p>
            </Section>
          )}

          {/* Strengths */}
          {insights.strengths?.length > 0 && (
            <Section title="Strengths I notice">
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, lineHeight: 1.7 }}>
                {insights.strengths.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </Section>
          )}

          {/* Gentle reframe */}
          {insights.gentleReframe && (
            <div
              style={{
                padding: "12px 14px",
                background: "var(--color-background-success)",
                border: "0.5px solid var(--color-border-success)",
                borderRadius: 10,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.8px",
                  textTransform: "uppercase",
                  color: "var(--color-text-success)",
                  marginBottom: 6,
                }}
              >
                A gentler perspective
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.6, margin: 0, color: "var(--color-text-success)" }}>
                {insights.gentleReframe}
              </p>
            </div>
          )}

          {/* Suggestions */}
          {insights.suggestions?.length > 0 && (
            <Section title="Small steps to try">
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, lineHeight: 1.7 }}>
                {insights.suggestions.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </Section>
          )}

          {/* Focus */}
          {insights.focus && (
            <div
              style={{
                padding: "12px 14px",
                background: "var(--color-background-info)",
                border: "0.5px solid var(--color-border-info)",
                borderRadius: 10,
                fontSize: 13,
                color: "var(--color-text-info)",
              }}
            >
              <strong>This week&apos;s focus:</strong> {insights.focus}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.6px",
          textTransform: "uppercase",
          color: "var(--color-text-secondary)",
          marginBottom: 8,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}
