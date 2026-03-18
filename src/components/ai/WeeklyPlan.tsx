"use client";
import { useState } from "react";
import { WeeklyPlan as WeeklyPlanType } from "@/types";

export function WeeklyPlan() {
  const [plan, setPlan] = useState<WeeklyPlanType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkedTasks, setCheckedTasks] = useState<Set<string>>(new Set());

  const today = new Date().toLocaleDateString("en", { weekday: "long" });

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/plan");
      if (!res.ok) throw new Error("Failed to generate");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPlan(data);
      setCheckedTasks(new Set());
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      setError(message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = (key: string) => {
    setCheckedTasks((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const totalTasks = plan?.days.reduce((s, d) => s + d.tasks.length, 0) ?? 0;
  const doneTasks = checkedTasks.size;
  const pct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <div
      style={{
        background: "var(--color-background-primary)",
        border: "0.5px solid var(--color-border-tertiary)",
        borderRadius: 14,
        padding: "18px 20px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <div>
          <div style={{ fontSize: 14, fontWeight: 500 }}>Weekly plan</div>
          {plan && (
            <div
              style={{
                fontSize: 11,
                color: "var(--color-text-secondary)",
                marginTop: 2,
              }}
            >
              Week of {plan.weekOf}
            </div>
          )}
        </div>
        <button
          onClick={generate}
          disabled={loading}
          style={{
            fontSize: 12,
            padding: "5px 14px",
            background: "var(--color-background-success)",
            color: "var(--color-text-success)",
            borderColor: "var(--color-border-success)",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "Generating..." : plan ? "Regenerate" : "Generate plan"}
        </button>
      </div>

      {error && (
        <div
          style={{
            fontSize: 13,
            color: "var(--color-text-danger)",
            padding: "8px 12px",
            borderRadius: 8,
            background: "var(--color-background-danger)",
            border: "0.5px solid var(--color-border-danger)",
            marginBottom: 12,
          }}
        >
          {error}
        </div>
      )}

      {!plan && !loading && (
        <p
          style={{
            fontSize: 13,
            color: "var(--color-text-secondary)",
            lineHeight: 1.6,
          }}
        >
          Click &quot;Generate plan&quot; to get a personalised weekly schedule
          based on your habits, social media data, and recent journal moods.
        </p>
      )}

      {plan && (
        <>
          {/* Focus + progress */}
          <div
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              background: "var(--color-background-secondary)",
              border: "0.5px solid var(--color-border-tertiary)",
              marginBottom: 16,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.6px",
                textTransform: "uppercase",
                color: "var(--color-text-secondary)",
                marginBottom: 4,
              }}
            >
              This week&apos;s focus
            </div>
            <div
              style={{
                fontSize: 13.5,
                color: "var(--color-text-primary)",
                lineHeight: 1.5,
              }}
            >
              {plan.focus}
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 12,
                color: "var(--color-text-secondary)",
                marginBottom: 6,
              }}
            >
              <span>Week progress</span>
              <span>
                {doneTasks}/{totalTasks} tasks · {pct}%
              </span>
            </div>
            <div
              style={{
                height: 6,
                background: "var(--color-background-secondary)",
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${pct}%`,
                  background: "var(--color-background-success)",
                  borderRadius: 3,
                  transition: "width 0.4s",
                }}
              />
            </div>
          </div>

          {/* Daily tasks */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              marginBottom: 16,
            }}
          >
            {plan.days.map((day) => {
              const isToday = day.day === today;
              return (
                <div
                  key={day.day}
                  style={{
                    borderRadius: 10,
                    border: isToday
                      ? "1.5px solid var(--color-border-success)"
                      : "0.5px solid var(--color-border-tertiary)",
                    overflow: "hidden",
                  }}
                >
                  {/* Day header */}
                  <div
                    style={{
                      padding: "7px 12px",
                      background: isToday
                        ? "var(--color-background-success)"
                        : "var(--color-background-secondary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: isToday
                          ? "var(--color-text-success)"
                          : "var(--color-text-secondary)",
                      }}
                    >
                      {day.day}
                      {isToday && (
                        <span
                          style={{
                            fontSize: 10,
                            marginLeft: 6,
                            fontWeight: 400,
                          }}
                        >
                          Today
                        </span>
                      )}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        color: isToday
                          ? "var(--color-text-success)"
                          : "var(--color-text-secondary)",
                      }}
                    >
                      {
                        day.tasks.filter((_, ti) =>
                          checkedTasks.has(`${day.day}-${ti}`),
                        ).length
                      }
                      /{day.tasks.length}
                    </span>
                  </div>

                  {/* Tasks */}
                  <div style={{ padding: "8px 12px" }}>
                    {day.tasks.map((task, ti) => {
                      const key = `${day.day}-${ti}`;
                      const done = checkedTasks.has(key);
                      return (
                        <div
                          key={ti}
                          onClick={() => toggleTask(key)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "5px 0",
                            cursor: "pointer",
                            borderBottom:
                              ti < day.tasks.length - 1
                                ? "0.5px solid var(--color-border-tertiary)"
                                : "none",
                          }}
                        >
                          {/* Checkbox */}
                          <div
                            style={{
                              width: 16,
                              height: 16,
                              borderRadius: 4,
                              flexShrink: 0,
                              border: done
                                ? "none"
                                : "1px solid var(--color-border-secondary)",
                              background: done
                                ? "var(--color-background-success)"
                                : "transparent",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {done && (
                              <svg
                                width="10"
                                height="10"
                                viewBox="0 0 10 10"
                                fill="none"
                              >
                                <path
                                  d="M2 5l2.5 2.5L8 3"
                                  stroke="var(--color-text-success)"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                          </div>
                          <span
                            style={{
                              fontSize: 12.5,
                              color: done
                                ? "var(--color-text-secondary)"
                                : "var(--color-text-primary)",
                              textDecoration: done ? "line-through" : "none",
                              flex: 1,
                            }}
                          >
                            {task}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Coach advice */}
          <div
            style={{
              padding: "12px 14px",
              borderRadius: 10,
              background: "var(--color-background-info)",
              border: "0.5px solid var(--color-border-info)",
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.6px",
                textTransform: "uppercase",
                color: "var(--color-text-info)",
                marginBottom: 5,
              }}
            >
              Coach note
            </div>
            <p
              style={{
                fontSize: 13,
                lineHeight: 1.6,
                color: "var(--color-text-primary)",
                margin: 0,
              }}
            >
              {plan.advice}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
