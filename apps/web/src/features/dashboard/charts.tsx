"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const throughputData = [
  { day: "Mon", assignments: 11, labs: 8, feedback: 6 },
  { day: "Tue", assignments: 17, labs: 9, feedback: 8 },
  { day: "Wed", assignments: 13, labs: 14, feedback: 11 },
  { day: "Thu", assignments: 22, labs: 16, feedback: 14 },
  { day: "Fri", assignments: 19, labs: 12, feedback: 17 },
  { day: "Sat", assignments: 15, labs: 10, feedback: 12 },
];

export function ThroughputChart() {
  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
      <AreaChart data={throughputData} margin={{ left: -18, right: 8 }}>
        <defs>
          <linearGradient id="assignments" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#d9ff57" stopOpacity={0.42} />
            <stop offset="95%" stopColor="#d9ff57" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="labs" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6cf6b3" stopOpacity={0.36} />
            <stop offset="95%" stopColor="#6cf6b3" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
        <XAxis
          dataKey="day"
          stroke="var(--chart-muted)"
          fontSize={12}
          tickLine={false}
        />
        <YAxis
          stroke="var(--chart-muted)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{
            background: "var(--chart-tooltip-bg)",
            border: "1px solid var(--chart-tooltip-border)",
            borderRadius: 8,
            color: "var(--chart-tooltip-text)",
          }}
        />
        <Area
          type="monotone"
          dataKey="assignments"
          stroke="#d9ff57"
          fill="url(#assignments)"
          strokeWidth={2}
          isAnimationActive={false}
        />
        <Area
          type="monotone"
          dataKey="labs"
          stroke="#6cf6b3"
          fill="url(#labs)"
          strokeWidth={2}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function SkillRadarChart({
  data,
}: {
  data: Array<{ skill: string; score: number }>;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
      <RadarChart data={data}>
        <PolarGrid stroke="var(--chart-grid)" />
        <PolarAngleAxis
          dataKey="skill"
          tick={{ fill: "var(--chart-muted)", fontSize: 11 }}
        />
        <Radar
          dataKey="score"
          stroke="#ffb45a"
          fill="#ffb45a"
          fillOpacity={0.32}
          isAnimationActive={false}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
