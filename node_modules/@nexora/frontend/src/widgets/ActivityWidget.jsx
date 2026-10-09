import React from "react";
import { motion } from "framer-motion";
const ICONS = {
  assessment: {
    icon: "bi-journal-check",
    bg: "rgba(99,102,241,0.12)",
    color: "var(--primary)",
  },
  job: {
    icon: "bi-briefcase",
    bg: "rgba(16,185,129,0.12)",
    color: "var(--secondary)",
  },
  offer: {
    icon: "bi-gift",
    bg: "rgba(245,158,11,0.12)",
    color: "var(--accent)",
  },
  interview: {
    icon: "bi-mic",
    bg: "rgba(59,130,246,0.12)",
    color: "var(--info)",
  },
  certificate: {
    icon: "bi-award",
    bg: "rgba(168,85,247,0.12)",
    color: "var(--purple)",
  },
  default: {
    icon: "bi-activity",
    bg: "rgba(100,116,139,0.12)",
    color: "var(--text-muted)",
  },
};
const ActivityWidget = ({
  title = "Recent Activity",
  activities = [],
  loading = false,
  maxItems = 6,
}) => {
  return (
    <motion.div
      className="rounded-4 shadow-sm h-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      {" "}
      <div className="section-header mb-3">
        {" "}
        <h6 className="section-title mb-0">{title}</h6>{" "}
      </div>{" "}
      {loading ? (
        <ul className="activity-list">
          {" "}
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={i} className="activity-item">
              {" "}
              <div
                className="glass-skeleton"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  flexShrink: 0,
                }}
              />{" "}
              <div style={{ flex: 1 }}>
                {" "}
                <div
                  className="glass-skeleton"
                  style={{
                    height: 12,
                    width: "60%",
                    borderRadius: 4,
                    marginBottom: 6,
                  }}
                />{" "}
                <div
                  className="glass-skeleton"
                  style={{ height: 10, width: "40%", borderRadius: 4 }}
                />{" "}
              </div>{" "}
            </li>
          ))}{" "}
        </ul>
      ) : activities.length === 0 ? (
        <div className="empty-state">
          {" "}
          <i className="bi bi-clock-history empty-state-icon" />{" "}
          <p className="empty-state-title">No recent activity</p>{" "}
        </div>
      ) : (
        <ul className="activity-list">
          {" "}
          {activities.slice(0, maxItems).map((item, i) => {
            const cfg = ICONS[item.type] || ICONS.default;
            return (
              <motion.li
                key={i}
                className="activity-item"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                {" "}
                <div
                  className="activity-icon"
                  style={{ background: cfg.bg, color: cfg.color }}
                >
                  {" "}
                  <i className={`bi ${item.icon || cfg.icon}`} />{" "}
                </div>{" "}
                <div className="activity-content">
                  {" "}
                  <p className="activity-title">{item.title}</p>{" "}
                  <p className="activity-desc">{item.description}</p>{" "}
                </div>{" "}
                <span className="activity-time">{item.time}</span>{" "}
              </motion.li>
            );
          })}{" "}
        </ul>
      )}{" "}
    </motion.div>
  );
};
export default ActivityWidget;
