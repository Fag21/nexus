"use client";

interface Props {
  score: number;
  habitScore: number;
  socialScore: number;
  journalStreak: number;
  favCount: number;
}

function ScoreRing({
  value,
  size = 90,
  stroke = 9,
  color,
}: {
  value: number;
  size?: number;
  stroke?: number;
  color: string;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.min(value, 100) / 100);
  const cx = size / 2;

  return (
    <svg
      width={size}
      height={size}
      style={{ transform: "rotate(-90deg)", display: "block" }}
    >
      <circle
        cx={cx}
        cy={cx}
        r={r}
        fill="none"
        stroke="var(--color-background-secondary)"
        strokeWidth={stroke}
      />
      <circle
        cx={cx}
        cy={cx}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
    </svg>
  );
}

const scoreLabel = (s: number) => {
  if (s >= 80) return "Excellent";
  if (s >= 60) return "Good";
  if (s >= 40) return "Building";
  return "Getting started";
};

export function GrowthScoreCard({
  score,
  habitScore,
  socialScore,
  journalStreak,
  favCount,
}: Props) {
  const journalScore = Math.min(journalStreak * 14, 100);
  const feedScore = Math.min(favCount * 10, 100);

  const pillars = [
    { label: "Habits", value: habitScore, color: "#5BAD7F" },
    { label: "Social", value: socialScore, color: "#B86B1A" },
    { label: "Journal", value: journalScore, color: "#185FA5" },
    { label: "Feed", value: feedScore, color: "#8B5CF6" },
  ];

  return (
    <div
      style={{
        background: "var(--color-background-primary)",
        border: "0.5px solid var(--color-border-tertiary)",
        borderRadius: 14,
        padding: "18px 20px",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.8px",
          textTransform: "uppercase",
          color: "var(--color-text-secondary)",
          marginBottom: 16,
        }}
      >
        Growth score
      </div>

      {/* Main ring */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 18,
          marginBottom: 20,
        }}
      >
        <div style={{ position: "relative", flexShrink: 0 }}>
          <ScoreRing value={score} size={90} stroke={9} color="#2D7A4F" />
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                fontSize: 22,
                fontWeight: 700,
                lineHeight: 1,
                color: "var(--color-text-primary)",
              }}
            >
              {score}
            </span>
            <span style={{ fontSize: 9, color: "var(--color-text-secondary)" }}>
              /100
            </span>
          </div>
        </div>

        <div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 500,
              marginBottom: 4,
              color: "var(--color-text-primary)",
            }}
          >
            {scoreLabel(score)}
          </div>
          <div
            style={{
              fontSize: 12,
              color: "var(--color-text-secondary)",
              lineHeight: 1.5,
            }}
          >
            Based on today&apos;s habits, social control, journaling, and saved
            content.
          </div>
        </div>
      </div>

      {/* Pillar breakdown */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {pillars.map((p) => (
          <div key={p.label}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 12,
                marginBottom: 4,
              }}
            >
              <span style={{ color: "var(--color-text-secondary)" }}>
                {p.label}
              </span>
              <span
                style={{ fontWeight: 500, color: "var(--color-text-primary)" }}
              >
                {p.value}%
              </span>
            </div>
            <div
              style={{
                height: 5,
                background: "var(--color-background-secondary)",
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${p.value}%`,
                  background: p.color,
                  borderRadius: 3,
                  transition: "width 0.6s ease",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
