"use client";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ReferenceLine, ResponsiveContainer, Cell,
} from "recharts";
import { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";

interface Props {
  data: { day: string; used: number; limit: number }[];
}

export function UsageChart({ data }: Props) {
  return (
    <div style={{ width: "100%", height: 120 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barSize={20}>
          <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9EAB96" }} axisLine={false} tickLine={false} />
          <YAxis hide />
          <Tooltip
            formatter={(value: ValueType | undefined, _name: NameType | undefined) => [
              `${value ?? 0} min`,
              "Used",
            ]}
            contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #DDE5D8" }}
          />
          <ReferenceLine y={data[0]?.limit} stroke="#F0997B" strokeDasharray="4 4" />
          <Bar dataKey="used" radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.used >= entry.limit ? "#F0997B" : entry.used >= entry.limit * 0.8 ? "#EF9F27" : "#5BAD7F"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}