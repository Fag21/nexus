"use client";
import { useRouter } from "next/navigation";
import { DashboardData } from "@/types";

interface Props {
  journal: DashboardData["journal"];
}

const MOOD_DOT: Record<string, string> = {
  great: "#2D7A4F",
  good: "#5BAD7F",
  neutral: "#B86B1A",
  low: "#D85A30",
  bad: "#A32D2D",
};

export function JournalSummaryCard({ journal }: Props) {
  const router = useRouter();

  return (
    <div style={{
      background: "var(--color-background-primary)",
      border: "0.5px solid var(--color-border-tertiary)",
      borderRadius: 14, padding: "16px 18px",
    }}>
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: 14,
      }}>
        <div style={{ fontSize: 13, fontWeight: 500 }}>Journal</div>
        <button
          onClick={() => router.push("/journal")}
          style={{ fontSize: 11.5, color: "var(--color-text-info)" }}
        >
          Write
        </button>
      </div>

      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr",
        gap: 8, marginBottom: 14,
      }}>
        {[
          {
            label: "Total entries",
            value: String(journal.totalEntries),
          },
          {
            label: "Journal streak",
            value: `${journal.currentStreak}d`,
          },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              padding: "10px 12px",
              background: "var(--color-background-secondary)",
              borderRadius: 8, textAlign: "center",
            }}
          >
            <div style={{
              fontSize: 20, fontWeight: 600,
              color: "var(--color-text-primary)", letterSpacing: "-0.3px",
            }}>
              {s.value}
            </div>
            <div style={{
              fontSize: 10, color: "var(--color-text-secondary)",
              marginTop: 2,
            }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Mood dots */}
      {journal.recentMoods.length > 0 && (
        <>
          <div style={{
            fontSize: 11, color: "var(--color-text-secondary)",
            marginBottom: 7, fontWeight: 500,
          }}>
            Recent moods
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {journal.recentMoods.map((mood, i) => (
              <div
                key={i}
                title={mood}
                style={{
                  width: 12, height: 12, borderRadius: "50%",
                  background: MOOD_DOT[mood] ?? "#888",
                  flexShrink: 0,
                }}
              />
            ))}
            <span style={{
              fontSize: 11, color: "var(--color-text-secondary)",
              marginLeft: 4,
            }}>
              last {journal.recentMoods.length} entries
            </span>
          </div>
        </>
      )}

      {journal.lastEntryDate && (
        <div style={{
          marginTop: 10, fontSize: 11,
          color: "var(--color-text-secondary)",
        }}>
          Last entry: {journal.lastEntryDate}
        </div>
      )}
    </div>
  );
}