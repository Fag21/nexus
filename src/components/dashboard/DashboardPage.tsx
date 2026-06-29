"use client";
import { useDashboard } from "@/hooks/useDashboard";
import { GreetingHeader } from "./GreetingHeader";
import { GrowthScoreCard } from "./GrowthScoreCard";
import { HabitSummaryCard } from "./HabitSummaryCard";
import { SocialSummaryCard } from "./SocialSummaryCard";
import { JournalSummaryCard } from "./JournalSummaryCard";
import { FeedSummaryCard } from "./FeedSummaryCard";
import { AiCoachCard } from "./AiCoachCard";
import { WeeklyHeatmap } from "./WeeklyHeatmap";
import { StatCard } from "./StatCard";
import { SocialUsageChart } from "./SocialUsageChart";

function Skeleton() {
  return (
    <div className="app-container">
      <style>{`
        @keyframes shimmer {
          0%{ opacity:1 } 50%{ opacity:0.4 } 100%{ opacity:1 }
        }
      `}</style>
      <div style={{
        height: 60, borderRadius: 12, marginBottom: 24,
        background: "var(--color-background-secondary)",
        animation: "shimmer 1.4s ease-in-out infinite",
      }} />
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 12, marginBottom: 20,
      }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{
            height: 90, borderRadius: 12,
            background: "var(--color-background-secondary)",
            animation: "shimmer 1.4s ease-in-out infinite",
            animationDelay: `${i * 0.1}s`,
          }} />
        ))}
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { data, loading, error } = useDashboard();

  if (loading) return <Skeleton />;

  if (error || !data) {
    return (
      <div style={{
        padding: 40, textAlign: "center",
        color: "var(--color-text-danger)",
      }}>
        {error ?? "Could not load dashboard"}
      </div>
    );
  }

  const habitScore = data.habits.total > 0
    ? Math.round((data.habits.doneToday / data.habits.total) * 100)
    : 0;

  const socialScore = data.social.totalPlans > 0
    ? Math.round(
        ((data.social.totalPlans - data.social.appsOverLimit) /
          data.social.totalPlans) * 100
      )
    : 100;

  return (
    <div className="app-container">

      {/* Greeting */}
      <GreetingHeader
        name={data.user.name}
        joinedDaysAgo={data.user.joinedDaysAgo}
        growthScore={data.growthScore}
      />

      {/* Top stat cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
        gap: 12, marginBottom: 20,
      }}>
        <StatCard
          label="Habits done today"
          value={`${data.habits.doneToday}/${data.habits.total}`}
          sub="today"
          accent="green"
        />
        <StatCard
          label="Screen time"
          value={`${Math.floor(data.social.totalTodayMinutes / 60)}h ${data.social.totalTodayMinutes % 60}m`}
          sub="today"
          accent={data.social.appsOverLimit > 0 ? "red" : "green"}
          delta={
            data.social.appsOverLimit > 0
              ? { value: `${data.social.appsOverLimit} over`, up: false }
              : undefined
          }
        />
        <StatCard
          label="Journal streak"
          value={`${data.journal.currentStreak}d`}
          sub={data.journal.lastEntryDate
            ? `Last: ${data.journal.lastEntryDate}`
            : "No entries yet"}
          accent="blue"
        />
        <StatCard
          label="Growth score"
          value={data.growthScore}
          sub={data.growthScore >= 70 ? "On fire" : "Keep going"}
          accent={
            data.growthScore >= 70 ? "green" :
            data.growthScore >= 40 ? "amber" : "red"
          }
        />
      </div>

      {/* Main grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr",
        gap: 16, marginBottom: 16,
        alignItems: "start",
      }}>

        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Weekly heatmap */}
          <div className="skeu-card" style={{ padding: "18px 20px" }}>
            <div style={{
              fontSize: 11, fontWeight: 600, letterSpacing: "0.8px",
              textTransform: "uppercase",
              color: "var(--color-text-secondary)", marginBottom: 14,
            }}>
              This week
            </div>
            <WeeklyHeatmap rows={data.habits.weekGrid} />
          </div>

          {/* Social media usage chart */}
          <SocialUsageChart />

          {/* Bottom 2-col */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
          }}>
            <SocialSummaryCard social={data.social} />
            <JournalSummaryCard journal={data.journal} />
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <GrowthScoreCard
            score={data.growthScore}
            habitScore={habitScore}
            socialScore={socialScore}
            journalStreak={data.journal.currentStreak}
            favCount={data.feed.totalFavorites}
          />
          <HabitSummaryCard habits={data.habits} />
          <FeedSummaryCard feed={data.feed} />
        </div>
      </div>

      {/* AI Coach — full width */}
      <AiCoachCard />

    </div>
  );
}