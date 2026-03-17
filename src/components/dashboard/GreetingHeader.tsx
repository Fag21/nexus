"use client";

interface Props {
  name: string;
  joinedDaysAgo: number;
  growthScore: number;
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function getDate(): string {
  return new Date().toLocaleDateString("en", {
    weekday: "long", day: "numeric",
    month: "long", year: "numeric",
  });
}

export function GreetingHeader({ name, joinedDaysAgo, growthScore }: Props) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-end",
      justifyContent: "space-between",
      marginBottom: 24, flexWrap: "wrap", gap: 12,
    }}>
      <div>
        <div style={{
          fontSize: 12, color: "var(--color-text-secondary)",
          marginBottom: 4,
        }}>
          {getDate()}
        </div>
        <h1 style={{
          fontSize: 26, fontWeight: 600, margin: 0,
          letterSpacing: "-0.5px",
          color: "var(--color-text-primary)",
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
        }}>
          {getGreeting()}, {name}
        </h1>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "6px 14px",
          background: "var(--color-background-secondary)",
          border: "0.5px solid var(--color-border-tertiary)",
          borderRadius: 20, fontSize: 12,
          color: "var(--color-text-secondary)",
        }}>
          Day {joinedDaysAgo + 1} of your journey
        </div>

        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "6px 14px",
          background: "var(--color-background-success)",
          border: "0.5px solid var(--color-border-success)",
          borderRadius: 20, fontSize: 12, fontWeight: 500,
          color: "var(--color-text-success)",
        }}>
          Score {growthScore}
        </div>
      </div>
    </div>
  );
}