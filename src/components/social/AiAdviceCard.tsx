"use client";
import { useState } from "react";
import { TodaySummary } from "@/types/social";

interface Props {
  summaries: TodaySummary[];
}

export function AiAdviceCard({ summaries }: Props) {
  const [advice, setAdvice] = useState("");
  const [loading, setLoading] = useState(false);

  const getAdvice = async () => {
    setLoading(true);
    const context = summaries
      .map((s) => `${s.appName}: ${s.usedToday}/${s.dailyLimit} min today`)
      .join(", ");

    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content: `Give me short, specific advice on controlling my social media use. My usage today: ${context}. Keep it under 80 words.`,
          },
        ],
      }),
    });
    const data = await res.json();
    setAdvice(data.message);
    setLoading(false);
  };

  return (
    <div
      style={{
        background: "#F0FAF4",
        border: "1px solid #C8E8D4",
        borderRadius: 16,
        padding: "20px 22px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#1A1F16" }}>
            AI advice
          </div>
          <div style={{ fontSize: 12, color: "#6B7A64" }}>
            Based on your usage today
          </div>
        </div>
        <button
          onClick={getAdvice}
          disabled={loading}
          style={{
            padding: "7px 14px",
            borderRadius: 8,
            border: "none",
            background: "#2D7A4F",
            color: "white",
            fontSize: 12,
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Thinking..." : advice ? "Refresh" : "Get advice"}
        </button>
      </div>
      {advice && (
        <p
          style={{
            fontSize: 13,
            color: "#3D4A38",
            lineHeight: 1.6,
            fontStyle: "italic",
            borderTop: "1px solid #C8E8D4",
            paddingTop: 12,
          }}
        >
          &quot;{advice}&quot;
        </p>
      )}
    </div>
  );
}
