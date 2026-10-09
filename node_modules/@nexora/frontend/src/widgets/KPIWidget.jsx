import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
export default function KPIWidget({
  title,
  value,
  change,
  trend = "up",
  icon: Icon,
  colorClass = "text-primary",
}) {
  // Extract color name from colorClass if it follows text-{color} format
  const colorName = colorClass.startsWith("text-")
    ? colorClass.replace("text-", "")
    : "primary";
  return (
    <div className={`kpi-card kpi-card-${colorName} h-100`}>
      {" "}
      <div
        className="d-flex align-items-center justify-content-between mb-3"
        style={{ color: "var(--text-muted)" }}
      >
        {" "}
        <span className="fw-semibold fs-6">{title}</span>{" "}
        {Icon && <Icon size={22} className={colorClass} />}{" "}
      </div>{" "}
      <div className="d-flex align-items-end justify-content-between">
        {" "}
        <span
          className="fw-black"
          style={{ fontSize: "2rem", lineHeight: "1", color: "var(--text)" }}
        >
          {value}
        </span>{" "}
        {change && (
          <div
            className={`d-flex align-items-center gap-1 fw-medium ${trend === "up" ? "text-success" : "text-danger"}`}
            style={{ fontSize: "0.85rem" }}
          >
            {" "}
            {trend === "up" ? (
              <TrendingUp size={16} />
            ) : (
              <TrendingDown size={16} />
            )}{" "}
            <span>{change}</span>{" "}
          </div>
        )}{" "}
      </div>{" "}
    </div>
  );
}
