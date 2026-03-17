"use client";
import { useRouter } from "next/navigation";
import { DashboardData } from "@/types";

interface Props {
  feed: DashboardData["feed"];
}

export function FeedSummaryCard({ feed }: Props) {
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
        <div style={{ fontSize: 13, fontWeight: 500 }}>Growth feed</div>
        <button
          onClick={() => router.push("/feed")}
          style={{ fontSize: 11.5, color: "var(--color-text-info)" }}
        >
          Browse
        </button>
      </div>

      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
        gap: 8,
      }}>
        {[
          {
            label: "Saved total",
            value: String(feed.totalFavorites),
            color: "var(--color-text-primary)",
          },
          {
            label: "Books",
            value: String(feed.bookCount),
            color: "var(--color-text-info)",
          },
          {
            label: "Videos",
            value: String(feed.videoCount),
            color: "var(--color-text-warning)",
          },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              padding: "10px 8px", textAlign: "center",
              background: "var(--color-background-secondary)",
              borderRadius: 8,
            }}
          >
            <div style={{
              fontSize: 20, fontWeight: 600,
              color: s.color, letterSpacing: "-0.3px",
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

      {feed.totalFavorites === 0 && (
        <p style={{
          fontSize: 12, color: "var(--color-text-secondary)",
          marginTop: 12, lineHeight: 1.5,
        }}>
          No saved items yet. Browse the feed and save books and videos you want to revisit.
        </p>
      )}
    </div>
  );
}