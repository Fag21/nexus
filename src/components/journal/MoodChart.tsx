"use client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { ValueType } from "recharts/types/component/DefaultTooltipContent";

interface MoodPoint {
  date: string;
  score: number;
  mood: string;
}

interface Props {
  data: MoodPoint[];
}

const MOOD_LABELS: Record<number, string> = {
  1: "Bad",
  2: "Low",
  3: "Neutral",
  4: "Good",
  5: "Great",
};

const MOOD_COLORS: Record<string, string> = {
  great: "#2D7A4F",
  good: "#5BAD7F",
  neutral: "#B86B1A",
  low: "#D85A30",
  bad: "#A32D2D",
};

export function MoodChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "24px",
          color: "var(--color-text-secondary)",
          fontSize: 13,
        }}
      >
        No mood data yet. Start journaling to see your mood trend.
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: 180 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 8, right: 8, bottom: 0, left: -20 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--color-border-tertiary)"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "var(--color-text-secondary)" }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[1, 5]}
            ticks={[1, 2, 3, 4, 5]}
            tickFormatter={(v) => MOOD_LABELS[v] ?? ""}
            tick={{ fontSize: 10, fill: "var(--color-text-secondary)" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            formatter={(value: ValueType | undefined) => {
              const n = typeof value === "number" ? value : Number(value);
              return [MOOD_LABELS[n] ?? String(value ?? ""), "Mood"];
            }}
            contentStyle={{
              background: "var(--color-background-primary)",
              border: "0.5px solid var(--color-border-tertiary)",
              borderRadius: 8,
              fontSize: 12,
            }}
          />
          <ReferenceLine
            y={3}
            stroke="var(--color-border-secondary)"
            strokeDasharray="4 4"
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#2D7A4F"
            strokeWidth={2}
            dot={(props) => {
              const { cx, cy, payload } = props;
              return (
                <circle
                  key={payload.date}
                  cx={cx}
                  cy={cy}
                  r={4}
                  fill={MOOD_COLORS[payload.mood] ?? "#2D7A4F"}
                  stroke="var(--color-background-primary)"
                  strokeWidth={2}
                />
              );
            }}
            activeDot={{ r: 6, stroke: "#2D7A4F", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
