"use client";
import { useEffect, useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";
import type { SocialPlan } from "@/types/social";

const ACCENT = "#e0833b"; // social feature accent

function buildLast7Days(plans: SocialPlan[]) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayStr = d.toISOString().slice(0, 10);

    const used = plans.reduce((sum, p) => {
      const dayMinutes = p.logs
        .filter((l) => l.date.slice(0, 10) === dayStr)
        .reduce((s, l) => s + l.minutesUsed, 0);
      return sum + dayMinutes;
    }, 0);

    return {
      day: d.toLocaleDateString("en", { weekday: "short" }),
      minutes: used,
    };
  });
}

export function SocialUsageChart() {
  const [data, setData] = useState<{ day: string; minutes: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [empty, setEmpty] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/social");
        if (!res.ok) throw new Error();
        const plans: SocialPlan[] = await res.json();
        const series = buildLast7Days(plans);
        setData(series);
        setEmpty(plans.length === 0 || series.every((d) => d.minutes === 0));
      } catch {
        setEmpty(true);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const weekTotal = data.reduce((s, d) => s + d.minutes, 0);
  const dailyAvg = data.length ? Math.round(weekTotal / data.length) : 0;

  return (
    <div className="skeu-card" style={{ padding: "18px 20px" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          <div style={{
            fontSize: 11, fontWeight: 600, letterSpacing: "0.8px",
            textTransform: "uppercase", color: "var(--color-text-secondary)",
          }}>
            Social media usage
          </div>
          <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 4 }}>
            Last 7 days · {Math.floor(weekTotal / 60)}h {weekTotal % 60}m total
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.5, color: ACCENT }}>
            {Math.floor(dailyAvg / 60) > 0 ? `${Math.floor(dailyAvg / 60)}h ` : ""}{dailyAvg % 60}m
          </div>
          <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>daily avg</div>
        </div>
      </div>

      {loading ? (
        <div style={{
          height: 200, borderRadius: 12,
          background: "var(--color-background-secondary)",
          animation: "shimmer 1.4s ease-in-out infinite",
        }} />
      ) : empty ? (
        <div style={{
          height: 200, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 8,
          color: "var(--color-text-secondary)", fontSize: 13,
        }}>
          <span style={{ fontSize: 28 }}>📱</span>
          No screen-time logged yet this week.
        </div>
      ) : (
        <div style={{ width: "100%", height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="socialUsageFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={ACCENT} stopOpacity={0.45} />
                  <stop offset="100%" stopColor={ACCENT} stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-tertiary)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9EAB96" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9EAB96" }} axisLine={false} tickLine={false} width={36} />
              <Tooltip
                formatter={(value) => [`${value} min`, "Used"]}
                contentStyle={{ fontSize: 12, borderRadius: 10, border: "1px solid var(--color-border-secondary)" }}
              />
              <Area
                type="monotone"
                dataKey="minutes"
                stroke={ACCENT}
                strokeWidth={2.5}
                fill="url(#socialUsageFill)"
                dot={{ r: 3, fill: ACCENT }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
