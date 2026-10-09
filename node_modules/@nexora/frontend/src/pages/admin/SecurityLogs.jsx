import React, { useState } from "react";
import {
  ShieldAlert,
  Search,
  Filter,
  ShieldCheck,
  ShieldOff,
  Terminal,
  Clock,
  Download,
} from "lucide-react";
import { motion } from "framer-motion";
export default function SecurityLogs() {
  const [search, setSearch] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("All");
  const [logs, setLogs] = useState([]);
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.type.toLowerCase().includes(search.toLowerCase()) ||
      log.user.toLowerCase().includes(search.toLowerCase());
    const matchesSev =
      filterSeverity === "All" || log.severity === filterSeverity;
    return matchesSearch && matchesSev;
  });
  const getSeverityBadge = (severity) => {
    switch (severity) {
      case "High":
        return (
          <span className="badge bg-danger-subtle text-danger border border-danger rounded-pill px-3 py-1 fw-bold">
            <ShieldOff size={12} className="me-1" /> High
          </span>
        );
      case "Warning":
        return (
          <span className="badge bg-warning-subtle text-warning border border-warning rounded-pill px-3 py-1 fw-bold">
            <ShieldAlert size={12} className="me-1" /> Warning
          </span>
        );
      default:
        return (
          <span className="badge bg-info-subtle text-info border border-info rounded-pill px-3 py-1 fw-bold">
            <ShieldCheck size={12} className="me-1" /> Info
          </span>
        );
    }
  };
  return (
    <div className="container-fluid py-4 px-xl-5">
      {" "}
      <div className="d-flex align-items-center justify-content-between mb-5 flex-wrap gap-3">
        {" "}
        <div>
          {" "}
          <h2 className="fw-black mb-1 text-gradient-primary">
            Security Logs 🛡️
          </h2>{" "}
          <p className="fw-medium m-0 text-muted">
            Monitor system events, authentication, and data modifications.
          </p>{" "}
        </div>{" "}
        <div className="d-flex gap-2">
          {" "}
          <button className="btn btn-outline-primary rounded-pill fw-bold d-flex align-items-center gap-2">
            {" "}
            <Download size={16} /> Export Logs{" "}
          </button>{" "}
        </div>{" "}
      </div>{" "}
      <div className="bento-card mb-4 p-4">
        {" "}
        <div className="row g-3">
          {" "}
          <div className="col-md-6 col-lg-8">
            {" "}
            <div className="position-relative">
              {" "}
              <Search
                className="position-absolute top-50 translate-middle-y ms-3 text-muted"
                size={18}
              />{" "}
              <input
                type="text"
                className="form-control ps-5 rounded-pill"
                placeholder="Search logs by user, IP, or event type..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  height: "48px",
                  background: "var(--surface-2)",
                  color: "var(--text)",
                  border: "1px solid var(--border)",
                }}
              />{" "}
            </div>{" "}
          </div>{" "}
          <div className="col-md-6 col-lg-4 d-flex gap-2">
            {" "}
            <select
              className="form-select rounded-pill ps-4"
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              style={{
                height: "48px",
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                color: "var(--text)",
              }}
            >
              {" "}
              <option value="All">All Severities</option>{" "}
              <option value="Info">Info</option>{" "}
              <option value="Warning">Warning</option>{" "}
              <option value="High">High</option>{" "}
            </select>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
      <div className="bento-card p-0 overflow-hidden">
        {" "}
        <div className="table-responsive" style={{ minHeight: "500px" }}>
          <table className="table table-hover align-middle mb-0 font-monospace small">
            <thead style={{ background: "var(--bg-secondary)" }}>
              <tr>
                <th className="py-3 px-4 border-0 text-muted">
                  TIMESTAMP
                </th><th className="py-3 border-0 text-muted">EVENT TYPE</th><th className="py-3 border-0 text-muted">SEVERITY</th><th className="py-3 border-0 text-muted">USER / IP</th><th className="py-3 border-0 text-muted w-25">DETAILS</th></tr></thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-5 text-muted">
                    No logs found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, idx) => (
                  <motion.tr
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={log.id}
                  >
                    <td className="py-3 px-4 text-muted">
                      <Clock size={14} className="me-1 d-inline" /> {log.time}
                    </td><td
                      className="py-3 fw-bold"
                      style={{ color: "var(--text)" }}
                    >
                      
                      <Terminal
                        size={14}
                        className="me-2 text-primary d-inline"
                      />{" "}
                      {log.type}
                    </td><td className="py-3">{getSeverityBadge(log.severity)}</td><td className="py-3 text-muted">
                      
                      <div
                        className="text-truncate"
                        style={{ maxWidth: "150px" }}
                      >
                        {log.user}
                      </div>{" "}
                      <small className="opacity-75">{log.ip}</small>
                    </td><td
                      className="py-3"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {log.details}
                    </td>
                  </motion.tr>
                ))
              )}</tbody></table>
        </div>{" "}
      </div>{" "}
    </div>
  );
}
