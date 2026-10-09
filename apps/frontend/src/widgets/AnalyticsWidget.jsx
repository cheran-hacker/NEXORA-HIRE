import React from "react";
import { motion } from "framer-motion";
import Chart from "../shared/components/Chart.jsx";
const AnalyticsWidget = ({
  title,
  value,
  change,
  changeType = "up",
  sparkData = [],
  color = "#6366f1",
  height = 60,
}) => {
  return (
    <motion.div
      className="kpi-card"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -3 }}
    >
      {" "}
      <div className="d-flex justify-content-between align-items-start">
        {" "}
        <div>
          {" "}
          <p
            className="mb-1 text-uppercase fw-semibold"
            style={{
              fontSize: "0.72rem",
              letterSpacing: "0.08em",
              color: "var(--text-muted)",
            }}
          >
            {" "}
            {title}{" "}
          </p>{" "}
          <p className="metric-value mb-1">{value}</p>{" "}
          {change && (
            <span
              className="metric-change"
              style={{
                background:
                  changeType === "up"
                    ? "rgba(16,185,129,0.12)"
                    : "rgba(239,68,68,0.12)",
                color:
                  changeType === "up" ? "var(--secondary)" : "var(--danger)",
              }}
            >
              {" "}
              <i
                className={`bi bi-arrow-${changeType === "up" ? "up" : "down"}`}
                style={{ fontSize: "0.7rem" }}
              />{" "}
              {change}{" "}
            </span>
          )}{" "}
        </div>{" "}
        {sparkData.length > 0 && (
          <div style={{ width: 100 }}>
            {" "}
            <Chart
              type="line"
              labels={sparkData.map((_, i) => i)}
              datasets={[
                {
                  data: sparkData,
                  borderColor: color,
                  backgroundColor: `${color}20`,
                  fill: true,
                  tension: 0.4,
                  pointRadius: 0,
                  borderWidth: 2,
                },
              ]}
              height={height}
              legend={false}
              grid={false}
              options={{
                plugins: { tooltip: { enabled: false } },
                scales: { x: { display: false }, y: { display: false } },
              }}
            />{" "}
          </div>
        )}{" "}
      </div>{" "}
    </motion.div>
  );
};
export default AnalyticsWidget;
