"use client";
import { format, subDays } from "date-fns";

interface HabitRow {
  name: string;
  icon: string;
  color: string;
  days: boolean[];
}

interface Props {
  rows: HabitRow[];
}

export function WeeklyHeatmap({ rows }: Props) {
  const dayLabels = Array.from({ length: 7 }, (_, i) =>
    format(subDays(new Date(), 6 - i), "EEE")
  );
  const isToday = (i: number) => i === 6;

  if (rows.length === 0) {
    return (
      <div style={{
        textAlign: "center", padding: "24px",
        color: "var(--color-text-secondary)", fontSize: 13,
      }}>
        No habits yet. Add your first habit to see your heatmap.
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{
        width: "100%", borderCollapse: "collapse",
        minWidth: 340,
      }}>
        <thead>
          <tr>
            <th style={{
              width: 120, textAlign: "left",
              fontSize: 10, fontWeight: 600,
              letterSpacing: "0.8px", textTransform: "uppercase",
              color: "var(--color-text-secondary)",
              padding: "0 8px 8px 0",
            }}>
              Habit
            </th>
            {dayLabels.map((day, i) => (
              <th
                key={i}
                style={{
                  fontSize: 10, fontWeight: isToday(i) ? 600 : 400,
                  color: isToday(i)
                    ? "var(--color-text-success)"
                    : "var(--color-text-secondary)",
                  textAlign: "center",
                  padding: "0 4px 8px",
                  minWidth: 36,
                }}
              >
                {day}
                {isToday(i) && (
                  <div style={{
                    width: 4, height: 4, borderRadius: "50%",
                    background: "var(--color-text-success)",
                    margin: "3px auto 0",
                  }} />
                )}
              </th>
            ))}
            <th style={{
              fontSize: 10, fontWeight: 600,
              letterSpacing: "0.8px", textTransform: "uppercase",
              color: "var(--color-text-secondary)",
              textAlign: "center",
              padding: "0 0 8px 8px",
              minWidth: 44,
            }}>
              Rate
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => {
            const doneCount = row.days.filter(Boolean).length;
            const rate = Math.round((doneCount / 7) * 100);

            return (
              <tr key={ri}>
                {/* Habit name */}
                <td style={{
                  padding: "5px 8px 5px 0",
                  borderTop: ri > 0
                    ? "0.5px solid var(--color-border-tertiary)"
                    : "none",
                }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 7,
                  }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: 6,
                      background: `${row.color}20`,
                      display: "flex", alignItems: "center",
                      justifyContent: "center", fontSize: 12,
                      flexShrink: 0,
                    }}>
                      {row.icon}
                    </div>
                    <span style={{
                      fontSize: 12, color: "var(--color-text-primary)",
                      fontWeight: 500,
                      overflow: "hidden", textOverflow: "ellipsis",
                      whiteSpace: "nowrap", maxWidth: 80,
                    }}>
                      {row.name}
                    </span>
                  </div>
                </td>

                {/* Day cells */}
                {row.days.map((done, di) => (
                  <td
                    key={di}
                    style={{
                      padding: "5px 4px",
                      textAlign: "center",
                      borderTop: ri > 0
                        ? "0.5px solid var(--color-border-tertiary)"
                        : "none",
                    }}
                  >
                    <div style={{
                      width: 28, height: 28,
                      borderRadius: 7,
                      margin: "0 auto",
                      background: done
                        ? row.color
                        : isToday(di)
                        ? "var(--color-background-secondary)"
                        : "var(--color-background-secondary)",
                      border: isToday(di) && !done
                        ? `1.5px dashed ${row.color}`
                        : "none",
                      opacity: done ? 1 : 0.35,
                      display: "flex", alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.2s",
                    }}>
                      {done && (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path
                            d="M2 5l2.5 2.5L8 3"
                            stroke="white"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                  </td>
                ))}

                {/* Rate */}
                <td style={{
                  padding: "5px 0 5px 8px",
                  textAlign: "center",
                  borderTop: ri > 0
                    ? "0.5px solid var(--color-border-tertiary)"
                    : "none",
                }}>
                  <span style={{
                    fontSize: 11, fontWeight: 500,
                    color: rate >= 70
                      ? "var(--color-text-success)"
                      : rate >= 40
                      ? "var(--color-text-warning)"
                      : "var(--color-text-danger)",
                  }}>
                    {rate}%
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}