"use client";
import { useState } from "react";

interface Props {
  content: string;
  mood: string;
}

export function AiReflectPanel({ content, mood }: Props) {
  const [reflection, setReflection] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getReflection = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/journal/ai-reflect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, mood }),
      });
      const data = await res.json();
      setReflection(data.reflection);
    } catch {
      setReflection("Could not connect. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: 10 }}>
      {reflection ? (
        <div
          style={{
            padding: "12px 14px",
            background: "var(--color-background-info)",
            border: "0.5px solid var(--color-border-info)",
            borderRadius: 8, fontSize: 13,
            lineHeight: 1.6,
            color: "var(--color-text-primary)",
          }}
        >
          <div style={{
            fontSize: 10, fontWeight: 600,
            letterSpacing: "0.8px", textTransform: "uppercase",
            color: "var(--color-text-info)", marginBottom: 6,
          }}>
            AI reflection
          </div>
          {reflection}
          <button
            onClick={() => setReflection(null)}
            style={{
              display: "block", marginTop: 8,
              fontSize: 11, color: "var(--color-text-secondary)",
              background: "transparent", border: "none",
              cursor: "pointer", padding: 0,
            }}
          >
            Dismiss
          </button>
        </div>
      ) : (
        <button
          onClick={getReflection}
          disabled={loading || !content?.trim()}
          style={{
            fontSize: 12, padding: "5px 12px",
            background: "var(--color-background-info)",
            color: "var(--color-text-info)",
            borderColor: "var(--color-border-info)",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "Reflecting..." : "AI reflect ✦"}
        </button>
      )}
    </div>
  );
}