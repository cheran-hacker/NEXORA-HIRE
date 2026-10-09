import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
export default function ChartWidget({
  data,
  xKey = "name",
  yKey = "value",
  height = 300,
  color = "#6366f1",
}) {
  if (!data || data.length === 0) {
    return (
      <div 
        className="d-flex align-items-center justify-content-center text-muted" 
        style={{ width: "100%", height: height, background: "rgba(0,0,0,0.02)", borderRadius: "12px", border: "1px dashed var(--border)" }}
      >
        <span className="fw-semibold">No data available for this period.</span>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: height }}>
      <ResponsiveContainer>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          {" "}
          <defs>
            {" "}
            <linearGradient id={`color${yKey}`} x1="0" y1="0" x2="0" y2="1">
              {" "}
              <stop offset="5%" stopColor={color} stopOpacity={0.4} />{" "}
              <stop offset="95%" stopColor={color} stopOpacity={0} />{" "}
            </linearGradient>{" "}
          </defs>{" "}
          <XAxis
            dataKey={xKey}
            stroke="var(--text-muted)"
            tick={{ fill: "var(--text-muted)", fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />{" "}
          <YAxis
            stroke="var(--text-muted)"
            tick={{ fill: "var(--text-muted)", fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />{" "}
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            vertical={false}
          />{" "}
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--surface)",
              borderColor: "var(--border)",
              borderRadius: "8px",
              color: "var(--text)",
            }}
            itemStyle={{ color: color, fontWeight: "bold" }}
          />{" "}
          <Area
            type="monotone"
            dataKey={yKey}
            stroke={color}
            strokeWidth={3}
            fillOpacity={1}
            fill={`url(#color${yKey})`}
          />{" "}
        </AreaChart>{" "}
      </ResponsiveContainer>{" "}
    </div>
  );
}
