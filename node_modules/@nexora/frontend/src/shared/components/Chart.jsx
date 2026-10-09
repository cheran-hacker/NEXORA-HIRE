import React, { useRef, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Filler,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import { Line, Bar, Doughnut, Pie, Radar, PolarArea } from "react-chartjs-2";
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Filler,
  Tooltip,
  Legend,
  Title,
); // ── Default styling theme ──────────────────────────────────────
const getDefaults = (isDark = false) => ({
  grid: isDark ? "rgba(0,0,0,0.05)" : "rgba(0,0,0,0.02)",
  tick: isDark ? "#64748b" : "#94a3b8",
  legend: isDark ? "#94a3b8" : "#64748b",
});
const PALETTE = [
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#3b82f6",
  "#a855f7",
  "#06b6d4",
  "#ec4899",
  "#84cc16",
  "#f97316",
];
const buildDataset = (ds, idx, type) => {
  const color = ds.color || PALETTE[idx % PALETTE.length];
  const base = {
    ...ds,
    borderColor: ds.borderColor || color,
    backgroundColor:
      ds.backgroundColor ||
      (type === "line"
        ? ds.fill
          ? `${color}22`
          : color
        : type === "bar"
          ? `${color}cc`
          : color),
  };
  if (type === "line") {
    base.tension = ds.tension ?? 0.4;
    base.pointRadius = ds.pointRadius ?? 3;
    base.pointHoverRadius = ds.pointHoverRadius ?? 6;
    base.borderWidth = ds.borderWidth ?? 2;
  }
  return base;
};
const Chart = ({
  type = "line",
  labels = [],
  datasets = [],
  height = 300,
  options = {},
  title,
  legend = true,
  grid = true,
  stacked = false,
  className = "",
  isDark = false,
}) => {
  const d = getDefaults(isDark);
  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: {
        display: legend,
        labels: {
          color: d.legend,
          font: { family: "Inter, sans-serif", size: 12 },
          usePointStyle: true,
          pointStyleWidth: 8,
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: isDark ? "#1f2937" : "#fff",
        titleColor: isDark ? "#f1f5f9" : "#0f172a",
        bodyColor: isDark ? "#94a3b8" : "#475569",
        borderColor: isDark ? "rgba(0,0,0,0.05)" : "rgba(0,0,0,0.02)",
        borderWidth: 1,
        padding: 12,
        cornerRadius: 10,
        titleFont: { family: "Inter", weight: "700" },
        bodyFont: { family: "Inter" },
      },
      title: title
        ? {
            display: true,
            text: title,
            color: d.legend,
            font: { family: "Inter", size: 14, weight: "600" },
            padding: { bottom: 16 },
          }
        : { display: false },
    },
    scales:
      type === "line" || type === "bar"
        ? {
            x: {
              grid: { color: grid ? d.grid : "transparent", drawBorder: false },
              ticks: {
                color: d.tick,
                font: { family: "Inter", size: 11 },
                maxTicksLimit: 8,
              },
              stacked,
            },
            y: {
              grid: { color: grid ? d.grid : "transparent", drawBorder: false },
              ticks: { color: d.tick, font: { family: "Inter", size: 11 } },
              stacked,
              beginAtZero: true,
            },
          }
        : type === "radar"
          ? {
              r: {
                angleLines: { color: d.grid },
                grid: { color: d.grid },
                pointLabels: {
                  color: d.tick,
                  font: { family: "Inter", size: 11 },
                },
                ticks: { display: false },
              },
            }
          : undefined,
    ...options,
  };
  const chartData = {
    labels,
    datasets: datasets.map((ds, i) => buildDataset(ds, i, type)),
  };
  const ComponentMap = {
    line: Line,
    bar: Bar,
    doughnut: Doughnut,
    pie: Pie,
    radar: Radar,
    polar: PolarArea,
  };
  const Component = ComponentMap[type] || Line;
  return (
    <div className={`chart-container ${className}`} style={{ height }}>
      {" "}
      <Component data={chartData} options={baseOptions} />{" "}
    </div>
  );
};
export default Chart;
