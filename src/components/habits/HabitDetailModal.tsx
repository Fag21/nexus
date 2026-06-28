"use client";
import { useEffect, useMemo, useState } from "react";
import type {
  Habit,
  BookItem,
  VideoItem,
  HabitCoachPlan,
  HabitRecommendations,
} from "@/types/index";

interface Props {
  habit: Habit;
  streak: number;
  onUpdate: (id: string, data: Partial<Habit>) => Promise<void>;
  onClose: () => void;
}

type Tab = "overview" | "plan" | "learn" | "coach";

function isoDay(d: Date) {
  return d.toISOString().slice(0, 10);
}

// ── Stats derived from logs ────────────────────────────────────────────────
function computeStats(habit: Habit) {
  const completedDays = new Set(
    habit.logs.filter((l) => l.completed).map((l) => l.date.slice(0, 10))
  );
  const totalCompletions = completedDays.size;

  // Longest streak across all history
  let longest = 0;
  let run = 0;
  const sorted = Array.from(completedDays).sort();
  let prev: Date | null = null;
  for (const day of sorted) {
    const cur = new Date(day);
    if (prev && (cur.getTime() - prev.getTime()) / 86400000 === 1) {
      run += 1;
    } else {
      run = 1;
    }
    longest = Math.max(longest, run);
    prev = cur;
  }

  // 30-day completion rate
  let hit = 0;
  for (let i = 0; i < 30; i += 1) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    if (completedDays.has(isoDay(d))) hit += 1;
  }
  const rate30 = Math.round((hit / 30) * 100);

  return { totalCompletions, longest, rate30, completedDays };
}

// ── Section helpers ────────────────────────────────────────────────────────
const labelStyle: React.CSSProperties = {
  fontSize: 12,
  color: "var(--color-text-secondary)",
  display: "block",
  marginBottom: 6,
};

const fieldStyle: React.CSSProperties = {
  width: "100%",
  marginBottom: 4,
  fontFamily: "inherit",
  fontSize: 13,
  padding: "8px 12px",
  border: "0.5px solid var(--color-border-tertiary)",
  borderRadius: 8,
  color: "var(--color-text-primary)",
  background: "var(--color-background-primary)",
  outline: "none",
};

const hintStyle: React.CSSProperties = {
  fontSize: 11,
  color: "var(--color-text-secondary)",
  marginBottom: 14,
  opacity: 0.8,
};

export function HabitDetailModal({ habit, streak, onUpdate, onClose }: Props) {
  const [tab, setTab] = useState<Tab>("overview");
  const stats = useMemo(() => computeStats(habit), [habit]);
  const isBreak = habit.type === "BREAK";

  // ── Coach plan (editable behavioral-science fields) ──
  const [plan, setPlan] = useState({
    identity: habit.identity ?? "",
    cue: habit.cue ?? "",
    reward: habit.reward ?? "",
    twoMinute: habit.twoMinute ?? "",
    habitStack: habit.habitStack ?? "",
    obstaclePlan: habit.obstaclePlan ?? "",
    motivation: habit.motivation ?? "",
  });
  const [savedFlash, setSavedFlash] = useState(false);

  const savePlan = async () => {
    await onUpdate(habit.id, plan);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1800);
  };

  // ── Recommendations (books + videos) ──
  const [recs, setRecs] = useState<HabitRecommendations | null>(null);
  const [recsLoading, setRecsLoading] = useState(false);
  const [recsError, setRecsError] = useState<string | null>(null);

  const loadRecs = async () => {
    setRecsLoading(true);
    setRecsError(null);
    try {
      const params = new URLSearchParams({ habit: habit.name, type: habit.type });
      const res = await fetch(`/api/habits/recommend?${params}`);
      if (!res.ok) throw new Error("Failed to load recommendations");
      setRecs(await res.json());
    } catch (e) {
      setRecsError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setRecsLoading(false);
    }
  };

  // Auto-load recommendations the first time the Learn tab opens
  useEffect(() => {
    if (tab === "learn" && !recs && !recsLoading) loadRecs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  // ── AI coaching plan ──
  const [ai, setAi] = useState<HabitCoachPlan | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const generatePlan = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch("/api/habits/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: habit.name,
          type: habit.type,
          description: habit.description,
          motivation: habit.motivation,
        }),
      });
      if (!res.ok) throw new Error("Failed to generate plan");
      setAi(await res.json());
    } catch (e) {
      setAiError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setAiLoading(false);
    }
  };

  const applyAiPlan = async () => {
    if (!ai) return;
    const obstaclePlan = ai.obstacles
      ?.map((o) => `If ${o.if}, then ${o.then}.`)
      .join("\n");
    const next = {
      identity: ai.identity || plan.identity,
      cue: ai.cue || plan.cue,
      reward: ai.reward || plan.reward,
      twoMinute: ai.twoMinute || plan.twoMinute,
      habitStack: ai.habitStack || plan.habitStack,
      obstaclePlan: obstaclePlan || plan.obstaclePlan,
      motivation: plan.motivation || ai.why,
    };
    setPlan(next);
    await onUpdate(habit.id, next);
    setTab("plan");
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1800);
  };

  const TABS: { key: Tab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "plan", label: "Coach Plan" },
    { key: "learn", label: "Learn" },
    { key: "coach", label: "AI Coach" },
  ];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 60,
        padding: 16,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: "var(--color-background-primary)",
          border: "0.5px solid var(--color-border-tertiary)",
          borderRadius: 16,
          width: 640,
          maxWidth: "96vw",
          maxHeight: "92vh",
          overflowY: "auto",
          borderTop: `3px solid ${habit.color}`,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "18px 22px 0",
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 11,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              flexShrink: 0,
              background: `${habit.color}18`,
            }}
          >
            {habit.icon}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 17, fontWeight: 600 }}>{habit.name}</div>
            <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
              {isBreak ? "Breaking" : "Building"} · Level {habit.level} ·{" "}
              {streak > 0 ? `${streak} day streak` : "no streak yet"}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ fontSize: 13, padding: "4px 10px", color: "var(--color-text-secondary)" }}
          >
            Close
          </button>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            gap: 4,
            padding: "16px 22px 0",
            borderBottom: "0.5px solid var(--color-border-tertiary)",
          }}
        >
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                padding: "8px 14px",
                fontSize: 13,
                fontWeight: tab === t.key ? 600 : 400,
                background: "transparent",
                border: "none",
                borderBottom:
                  tab === t.key
                    ? `2px solid ${habit.color}`
                    : "2px solid transparent",
                color:
                  tab === t.key
                    ? "var(--color-text-primary)"
                    : "var(--color-text-secondary)",
                cursor: "pointer",
                marginBottom: -1,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ padding: 22 }}>
          {/* ── OVERVIEW ───────────────────────────────────────────── */}
          {tab === "overview" && (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 10,
                  marginBottom: 20,
                }}
              >
                {[
                  { label: "30-day rate", value: `${stats.rate30}%` },
                  { label: "Current streak", value: `${streak}d` },
                  { label: "Longest streak", value: `${stats.longest}d` },
                  { label: "Total done", value: `${stats.totalCompletions}` },
                ].map((s) => (
                  <div
                    key={s.label}
                    style={{
                      background: "var(--color-background-secondary)",
                      borderRadius: 10,
                      padding: "12px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        color: "var(--color-text-secondary)",
                        marginBottom: 4,
                      }}
                    >
                      {s.label}
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 600 }}>{s.value}</div>
                  </div>
                ))}
              </div>

              <MonthCalendar habit={habit} completedDays={stats.completedDays} />

              {(habit.motivation || habit.ifSucceed) && (
                <div
                  style={{
                    marginTop: 20,
                    padding: "14px 16px",
                    background: "var(--color-background-success)",
                    border: "0.5px solid var(--color-border-success)",
                    borderRadius: 10,
                  }}
                >
                  {habit.motivation && (
                    <div style={{ fontSize: 13, color: "var(--color-text-success)", marginBottom: habit.ifSucceed ? 8 : 0 }}>
                      <strong>Your why:</strong> {habit.motivation}
                    </div>
                  )}
                  {habit.ifSucceed && (
                    <div style={{ fontSize: 13, color: "var(--color-text-success)" }}>
                      <strong>Reward:</strong> {habit.ifSucceed}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* ── COACH PLAN (editable) ──────────────────────────────── */}
          {tab === "plan" && (
            <>
              <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 18 }}>
                Design your habit using proven behavioral science. Fill these in
                yourself or generate them in the <strong>AI Coach</strong> tab.
              </p>

              <label style={labelStyle}>Identity — who you&apos;re becoming</label>
              <input
                value={plan.identity}
                onChange={(e) => setPlan({ ...plan, identity: e.target.value })}
                placeholder="I am someone who never misses a workout"
                style={fieldStyle}
              />
              <div style={hintStyle}>Every action is a vote for the person you want to be.</div>

              <label style={labelStyle}>Cue — the trigger</label>
              <input
                value={plan.cue}
                onChange={(e) => setPlan({ ...plan, cue: e.target.value })}
                placeholder="Right after my morning coffee"
                style={fieldStyle}
              />
              <div style={hintStyle}>Make it obvious. Attach the habit to something you already do.</div>

              <label style={labelStyle}>Habit stack</label>
              <input
                value={plan.habitStack}
                onChange={(e) => setPlan({ ...plan, habitStack: e.target.value })}
                placeholder="After I pour my coffee, I will read one page"
                style={fieldStyle}
              />
              <div style={hintStyle}>&quot;After I [current habit], I will [new habit].&quot;</div>

              <label style={labelStyle}>{isBreak ? "Make it hard (2-min rule)" : "Two-minute version"}</label>
              <input
                value={plan.twoMinute}
                onChange={(e) => setPlan({ ...plan, twoMinute: e.target.value })}
                placeholder={isBreak ? "Put the phone in another room" : "Just put on my running shoes"}
                style={fieldStyle}
              />
              <div style={hintStyle}>Shrink it until it&apos;s impossible to fail. Showing up is the win.</div>

              <label style={labelStyle}>Reward — how you celebrate</label>
              <input
                value={plan.reward}
                onChange={(e) => setPlan({ ...plan, reward: e.target.value })}
                placeholder="Tick it off and say 'that's like me'"
                style={fieldStyle}
              />
              <div style={hintStyle}>An immediate reward makes the habit satisfying and sticky.</div>

              <label style={labelStyle}>Obstacle plan (if-then)</label>
              <textarea
                value={plan.obstaclePlan}
                onChange={(e) => setPlan({ ...plan, obstaclePlan: e.target.value })}
                placeholder="If it's raining, then I'll do a home workout instead."
                style={{ ...fieldStyle, minHeight: 64, resize: "vertical", marginBottom: 4 }}
              />
              <div style={hintStyle}>Decide your response to setbacks before they happen.</div>

              <label style={labelStyle}>Your why</label>
              <textarea
                value={plan.motivation}
                onChange={(e) => setPlan({ ...plan, motivation: e.target.value })}
                placeholder="Why this matters to you..."
                style={{ ...fieldStyle, minHeight: 64, resize: "vertical", marginBottom: 4 }}
              />

              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14 }}>
                <button
                  onClick={savePlan}
                  style={{
                    background: "var(--color-background-success)",
                    color: "var(--color-text-success)",
                    borderColor: "var(--color-border-success)",
                    padding: "9px 20px",
                  }}
                >
                  Save plan
                </button>
                {savedFlash && (
                  <span style={{ fontSize: 13, color: "var(--color-text-success)" }}>Saved ✓</span>
                )}
              </div>
            </>
          )}

          {/* ── LEARN (books + videos) ─────────────────────────────── */}
          {tab === "learn" && (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 16,
                }}
              >
                <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: 0 }}>
                  Books &amp; videos to help you {isBreak ? "break" : "build"}{" "}
                  <strong>{habit.name}</strong>.
                </p>
                <button
                  onClick={loadRecs}
                  disabled={recsLoading}
                  style={{ fontSize: 12, padding: "5px 12px", opacity: recsLoading ? 0.6 : 1 }}
                >
                  {recsLoading ? "Loading…" : "Refresh"}
                </button>
              </div>

              {recsError && (
                <div style={{ fontSize: 13, color: "var(--color-text-danger)", marginBottom: 12 }}>
                  {recsError}
                </div>
              )}

              {recsLoading && !recs && (
                <div style={{ fontSize: 13, color: "var(--color-text-secondary)", padding: "20px 0" }}>
                  Finding the best resources…
                </div>
              )}

              {recs && (
                <>
                  <SectionTitle>📚 Recommended books</SectionTitle>
                  {recs.books.length === 0 ? (
                    <EmptyNote>No books found — try Refresh.</EmptyNote>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
                      {recs.books.map((b) => (
                        <BookRow key={b.id} book={b} />
                      ))}
                    </div>
                  )}

                  <SectionTitle>▶️ Recommended videos</SectionTitle>
                  {recs.videos.length === 0 ? (
                    <EmptyNote>No videos found — try Refresh.</EmptyNote>
                  ) : (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 12,
                      }}
                    >
                      {recs.videos.map((v) => (
                        <VideoRow key={v.id} video={v} />
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* ── AI COACH ───────────────────────────────────────────── */}
          {tab === "coach" && (
            <>
              <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 16 }}>
                Get a personalised, science-based plan for{" "}
                <strong>{habit.name}</strong> — then apply it to your Coach Plan
                with one tap.
              </p>

              {!ai && (
                <button
                  onClick={generatePlan}
                  disabled={aiLoading}
                  style={{
                    width: "100%",
                    background: "var(--color-background-info)",
                    color: "var(--color-text-info)",
                    borderColor: "var(--color-border-info)",
                    padding: "11px",
                    opacity: aiLoading ? 0.6 : 1,
                  }}
                >
                  {aiLoading ? "Coaching in progress…" : "✨ Generate my coaching plan"}
                </button>
              )}

              {aiError && (
                <div style={{ fontSize: 13, color: "var(--color-text-danger)", marginTop: 12 }}>
                  {aiError}
                </div>
              )}

              {ai && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <CoachBlock title="Identity">{ai.identity}</CoachBlock>
                  <CoachBlock title="Why it matters">{ai.why}</CoachBlock>
                  <CoachBlock title="Cue / trigger">{ai.cue}</CoachBlock>
                  <CoachBlock title="Habit stack">{ai.habitStack}</CoachBlock>
                  <CoachBlock title="Two-minute version">{ai.twoMinute}</CoachBlock>
                  <CoachBlock title="Reward">{ai.reward}</CoachBlock>

                  {ai.obstacles?.length > 0 && (
                    <div>
                      <SectionTitle>If-then obstacle plan</SectionTitle>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {ai.obstacles.map((o, i) => (
                          <div
                            key={i}
                            style={{
                              fontSize: 13,
                              padding: "8px 12px",
                              background: "var(--color-background-secondary)",
                              borderRadius: 8,
                            }}
                          >
                            <strong>If</strong> {o.if}, <strong>then</strong> {o.then}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {ai.firstWeek?.length > 0 && (
                    <div>
                      <SectionTitle>Your first week</SectionTitle>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {ai.firstWeek.map((step, i) => (
                          <div key={i} style={{ display: "flex", gap: 10, fontSize: 13 }}>
                            <span
                              style={{
                                flexShrink: 0,
                                width: 22,
                                height: 22,
                                borderRadius: "50%",
                                background: `${habit.color}22`,
                                color: habit.color,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 11,
                                fontWeight: 600,
                              }}
                            >
                              {i + 1}
                            </span>
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                    <button
                      onClick={applyAiPlan}
                      style={{
                        flex: 2,
                        background: "var(--color-background-success)",
                        color: "var(--color-text-success)",
                        borderColor: "var(--color-border-success)",
                        padding: "10px",
                      }}
                    >
                      Apply to my Coach Plan
                    </button>
                    <button
                      onClick={generatePlan}
                      disabled={aiLoading}
                      style={{ flex: 1, opacity: aiLoading ? 0.6 : 1 }}
                    >
                      {aiLoading ? "…" : "Regenerate"}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Small presentational helpers ───────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.6px",
        textTransform: "uppercase",
        color: "var(--color-text-secondary)",
        marginBottom: 10,
      }}
    >
      {children}
    </div>
  );
}

function EmptyNote({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 22 }}>
      {children}
    </div>
  );
}

function CoachBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <SectionTitle>{title}</SectionTitle>
      <div style={{ fontSize: 14, lineHeight: 1.5 }}>{children}</div>
    </div>
  );
}

function BookRow({ book }: { book: BookItem }) {
  return (
    <a
      href={book.previewLink ?? "#"}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "flex",
        gap: 12,
        padding: 10,
        borderRadius: 10,
        textDecoration: "none",
        color: "inherit",
        background: "var(--color-background-secondary)",
        border: "0.5px solid var(--color-border-tertiary)",
      }}
    >
      {book.thumbnail ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={book.thumbnail}
          alt={book.title}
          style={{ width: 44, height: 64, objectFit: "cover", borderRadius: 4, flexShrink: 0 }}
        />
      ) : (
        <div style={{ width: 44, height: 64, borderRadius: 4, background: "var(--color-background-tertiary)", flexShrink: 0 }} />
      )}
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>{book.title}</div>
        <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 4 }}>
          {book.authors.join(", ") || "Unknown author"}
        </div>
        <div
          style={{
            fontSize: 11,
            color: "var(--color-text-secondary)",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {book.description}
        </div>
      </div>
    </a>
  );
}

function VideoRow({ video }: { video: VideoItem }) {
  return (
    <a
      href={`https://www.youtube.com/watch?v=${video.videoId}`}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "block",
        borderRadius: 10,
        overflow: "hidden",
        textDecoration: "none",
        color: "inherit",
        background: "var(--color-background-secondary)",
        border: "0.5px solid var(--color-border-tertiary)",
      }}
    >
      {video.thumbnail && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={video.thumbnail}
          alt={video.title}
          style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", display: "block" }}
        />
      )}
      <div style={{ padding: "8px 10px" }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 500,
            marginBottom: 2,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {video.title}
        </div>
        <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>
          {video.channelTitle}
        </div>
      </div>
    </a>
  );
}

// ── Month calendar heatmap ─────────────────────────────────────────────────
function MonthCalendar({
  habit,
  completedDays,
}: {
  habit: Habit;
  completedDays: Set<string>;
}) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startWeekday = (first.getDay() + 6) % 7; // Monday = 0
  const todayStr = isoDay(now);

  const cells: (string | null)[] = [];
  for (let i = 0; i < startWeekday; i += 1) cells.push(null);
  for (let d = 1; d <= daysInMonth; d += 1) {
    cells.push(isoDay(new Date(year, month, d)));
  }

  return (
    <div>
      <SectionTitle>
        {now.toLocaleDateString("en", { month: "long", year: "numeric" })}
      </SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 5 }}>
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <div
            key={i}
            style={{ fontSize: 9, textAlign: "center", color: "var(--color-text-secondary)" }}
          >
            {d}
          </div>
        ))}
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const done = completedDays.has(day);
          const isToday = day === todayStr;
          const dayNum = Number(day.slice(8, 10));
          return (
            <div
              key={i}
              title={day}
              style={{
                aspectRatio: "1",
                borderRadius: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                background: done ? habit.color : "var(--color-background-secondary)",
                color: done ? "#fff" : "var(--color-text-secondary)",
                border: isToday ? `1.5px solid ${habit.color}` : "0.5px solid transparent",
              }}
            >
              {dayNum}
            </div>
          );
        })}
      </div>
    </div>
  );
}
