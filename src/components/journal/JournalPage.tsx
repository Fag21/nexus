"use client";
import { useMemo, useState } from "react";
import { useJournal } from "@/hooks/useJournal";
import { JournalEditor } from "./JournalEditor";
import { JournalCard } from "./JournalCard";
import { MoodChart } from "./MoodChart";
import { InsightsPanel } from "./InsightsPanel";
import { Mood } from "@/types/index";
import { getPromptOfTheDay } from "@/lib/journalPrompts";

export function JournalPage() {
  const {
    entries,
    loading,
    error,
    addEntry,
    updateEntry,
    burnEntry,
    deleteEntry,
    getMoodChartData,
    getStreak,
    getThisWeekCount,
  } = useJournal();

  const [writing, setWriting] = useState(false);
  const [seedPrompt, setSeedPrompt] = useState<string | undefined>(undefined);
  const [filter, setFilter] = useState<Mood | "all">("all");
  const [search, setSearch] = useState("");
  const [showChart, setShowChart] = useState(true);

  const promptOfTheDay = useMemo(() => getPromptOfTheDay(), []);

  const visible = entries.filter((e) => {
    if (filter !== "all" && e.mood !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const hay = `${e.title ?? ""} ${e.content}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const totalEntries = entries.filter((e) => !e.burned).length;
  const streak = getStreak();
  const thisWeek = getThisWeekCount();
  const moodCounts = entries.reduce<Record<string, number>>((acc, e) => {
    if (!e.burned) acc[e.mood] = (acc[e.mood] ?? 0) + 1;
    return acc;
  }, {});

  const openBlank = () => {
    setSeedPrompt(undefined);
    setWriting(true);
  };
  const openWithPrompt = (prompt: string) => {
    setSeedPrompt(prompt);
    setWriting(true);
  };

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "var(--color-text-secondary)" }}>
        Loading journal...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "var(--color-text-danger)" }}>
        {error}
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Summary stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 12,
          marginBottom: 20,
        }}
      >
        {[
          { label: "Entries", value: String(totalEntries) },
          { label: "Day streak", value: `${streak}🔥` },
          { label: "This week", value: `${thisWeek}/7` },
          {
            label: "Top mood",
            value:
              (Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ??
                "—"),
          },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: "var(--color-background-secondary)",
              borderRadius: 10,
              padding: "14px 16px",
            }}
          >
            <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 6 }}>
              {s.label}
            </div>
            <div style={{ fontSize: 20, fontWeight: 500, textTransform: "capitalize" }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Prompt of the day */}
      {!writing && (
        <div
          style={{
            background: "var(--color-background-info)",
            border: "0.5px solid var(--color-border-info)",
            borderRadius: 12,
            padding: "16px 18px",
            marginBottom: 20,
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.8px",
              textTransform: "uppercase",
              color: "var(--color-text-info)",
              marginBottom: 8,
            }}
          >
            Today&apos;s reflection
          </div>
          <div style={{ fontSize: 15, lineHeight: 1.5, marginBottom: 14, fontStyle: "italic" }}>
            “{promptOfTheDay}”
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => openWithPrompt(promptOfTheDay)}
              style={{
                fontSize: 13,
                padding: "8px 16px",
                background: "var(--color-background-info)",
                color: "var(--color-text-info)",
                borderColor: "var(--color-border-info)",
                fontWeight: 500,
              }}
            >
              Reflect on this →
            </button>
            <button onClick={openBlank} style={{ fontSize: 13, padding: "8px 16px" }}>
              Write freely
            </button>
          </div>
        </div>
      )}

      {/* AI insights from recent entries */}
      {!writing && <InsightsPanel entryCount={totalEntries} />}

      {/* Mood chart toggle */}
      <div
        style={{
          background: "var(--color-background-primary)",
          border: "0.5px solid var(--color-border-tertiary)",
          borderRadius: 12,
          padding: "14px 18px",
          marginBottom: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: showChart ? 14 : 0,
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 500 }}>Mood over time</span>
          <button
            onClick={() => setShowChart(!showChart)}
            style={{ fontSize: 12, color: "var(--color-text-secondary)" }}
          >
            {showChart ? "Hide ↑" : "Show ↓"}
          </button>
        </div>
        {showChart && <MoodChart data={getMoodChartData()} />}
      </div>

      {/* New entry button / editor */}
      {writing ? (
        <div style={{ marginBottom: 20 }}>
          <JournalEditor
            initialPrompt={seedPrompt}
            onSave={async (data) => {
              await addEntry(data);
              setWriting(false);
              setSeedPrompt(undefined);
            }}
            onCancel={() => {
              setWriting(false);
              setSeedPrompt(undefined);
            }}
          />
        </div>
      ) : (
        <button
          onClick={openBlank}
          style={{
            width: "100%",
            padding: "13px",
            marginBottom: 20,
            fontSize: 14,
            background: "var(--color-background-success)",
            color: "var(--color-text-success)",
            borderColor: "var(--color-border-success)",
          }}
        >
          + Write today&apos;s entry
        </button>
      )}

      {/* Search */}
      {entries.length > 0 && (
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search your entries..."
          style={{
            width: "100%",
            marginBottom: 14,
            fontSize: 13,
            padding: "9px 14px",
            border: "0.5px solid var(--color-border-tertiary)",
            borderRadius: 10,
            background: "var(--color-background-primary)",
            color: "var(--color-text-primary)",
            outline: "none",
          }}
        />
      )}

      {/* Mood filter */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {(["all", "great", "good", "neutral", "low", "bad"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setFilter(m)}
            style={{
              padding: "5px 14px",
              fontSize: 12,
              borderRadius: 20,
              background:
                filter === m
                  ? "var(--color-background-info)"
                  : "var(--color-background-secondary)",
              color:
                filter === m
                  ? "var(--color-text-info)"
                  : "var(--color-text-secondary)",
              borderColor:
                filter === m
                  ? "var(--color-border-info)"
                  : "var(--color-border-tertiary)",
              fontWeight: filter === m ? 500 : 400,
            }}
          >
            {m === "all" ? "All" : m.charAt(0).toUpperCase() + m.slice(1)}
            {m !== "all" && moodCounts[m] ? ` (${moodCounts[m]})` : ""}
          </button>
        ))}
      </div>

      {/* Entries list */}
      {visible.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "40px 20px",
            color: "var(--color-text-secondary)",
            fontSize: 14,
          }}
        >
          {entries.length === 0
            ? "No entries yet. Write your first one above."
            : search.trim()
            ? "No entries match your search."
            : "No entries match this filter."}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {visible.map((entry) => (
            <JournalCard
              key={entry.id}
              entry={entry}
              onUpdate={updateEntry}
              onBurn={burnEntry}
              onDelete={deleteEntry}
            />
          ))}
        </div>
      )}
    </div>
  );
}
