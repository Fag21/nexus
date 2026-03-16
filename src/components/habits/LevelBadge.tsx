"use client";

interface Props {
  level: number;
  xp: number;
}

const XP_PER_LEVEL = 100;

export function LevelBadge({ level, xp }: Props) {
  const xpInCurrentLevel = xp % XP_PER_LEVEL;
  const pct = Math.round((xpInCurrentLevel / XP_PER_LEVEL) * 100);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div
        style={{
          background: "var(--color-background-success)",
          border: "0.5px solid var(--color-border-success)",
          borderRadius: 20,
          padding: "2px 10px",
          fontSize: 11,
          fontWeight: 500,
          color: "var(--color-text-success)",
          flexShrink: 0,
        }}
      >
        Lv {level}
      </div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            height: 4,
            background: "var(--color-background-secondary)",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${pct}%`,
              background: "var(--color-background-success)",
              borderRadius: 2,
              transition: "width 0.5s",
            }}
          />
        </div>
      </div>
      <span
        style={{
          fontSize: 10,
          color: "var(--color-text-secondary)",
          flexShrink: 0,
        }}
      >
        {xpInCurrentLevel}/{XP_PER_LEVEL} xp
      </span>
    </div>
  );
}