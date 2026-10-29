import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  Search,
  Filter,
  ShieldCheck,
  ShieldOff,
  Terminal,
  Clock,
  Download,
  RefreshCw,
  User,
  Activity,
  AlertTriangle
} from "lucide-react";
import { motion } from "framer-motion";
import { adminService } from "../../services/api";
import { useToast } from "../../context/ToastContext";

export default function SecurityLogs() {
  const [search, setSearch] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAuditLogs();
      const raw = res?.data;
      const logsData = Array.isArray(raw?.logs)
        ? raw.logs
        : Array.isArray(raw?.data)
        ? raw.data
        : Array.isArray(raw)
        ? raw
        : [];
      setLogs(logsData);
    } catch (err) {
      console.error("Failed to fetch audit logs:", err);
      setLogs([]);
      addToast("Failed to fetch security audit logs", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const logList = Array.isArray(logs) ? logs : [];
  const filteredLogs = logList.filter((log) => {
    if (!log) return false;
    const action = log.action || log.type || "";
    const userName =
      log.actor?.name ||
      log.actor?.email ||
      log.user?.name ||
      log.user?.email ||
      (typeof log.user === "string" ? log.user : "") ||
      "System";
    const ip = log.ip || log.ipAddress || "";
    const details = log.details || "";

    const matchesSearch =
      action.toLowerCase().includes(search.toLowerCase()) ||
      userName.toLowerCase().includes(search.toLowerCase()) ||
      ip.toLowerCase().includes(search.toLowerCase()) ||
      details.toLowerCase().includes(search.toLowerCase());

    const matchesSev =
      filterSeverity === "All" || (log.severity || "Info") === filterSeverity;

    const matchesStatus =
      filterStatus === "All" || (log.status || "SUCCESS") === filterStatus;

    return matchesSearch && matchesSev && matchesStatus;
  });

  const getSeverityBadge = (severity = "Info") => {
    switch (severity) {
      case "High":
        return (
          <span className="badge bg-danger-subtle text-danger border border-danger border-opacity-25 rounded-pill px-3 py-1 fw-bold">
            <ShieldOff size={12} className="me-1" /> High
          </span>
        );
      case "Warning":
        return (
          <span className="badge bg-warning-subtle text-warning border border-warning border-opacity-25 rounded-pill px-3 py-1 fw-bold">
            <ShieldAlert size={12} className="me-1" /> Warning
          </span>
        );
      default:
        return (
          <span className="badge bg-info-subtle text-info border border-info border-opacity-25 rounded-pill px-3 py-1 fw-bold">
            <ShieldCheck size={12} className="me-1" /> Info
          </span>
        );
    }
  };

  const handleExportLogs = () => {
    if (!logs.length) {
      addToast("No logs available to export", "info");
      return;
    }

    const csvRows = [
      ["TIMESTAMP", "ACTION", "SEVERITY", "STATUS", "USER", "IP", "TARGET", "DETAILS"]
    ];

    filteredLogs.forEach(l => {
      const actorStr =
        l.actor?.email ||
        l.actor?.name ||
        l.user?.email ||
        l.user?.name ||
        (typeof l.user === "string" ? l.user : "") ||
        "System";
      csvRows.push([
        new Date(l.timestamp || l.createdAt || Date.now()).toISOString(),
        l.action || l.type || "EVENT",
        l.severity || "Info",
        l.status || "SUCCESS",
        actorStr,
        l.ip || l.ipAddress || "127.0.0.1",
        l.entity || l.target || "",
        (l.details || "").replace(/,/g, ';')
      ]);
    });

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `NEXORA_Audit_Logs_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast("Audit logs exported to CSV successfully", "success");
  };

  return (
    <div className="container-fluid py-4 px-xl-5" style={{ maxWidth: '1440px', margin: '0 auto' }}>
      
      {/* HEADER */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
        <div>
          <h2 className="fw-black mb-1 text-white d-flex align-items-center gap-3" style={{ fontSize: "2.2rem" }}>
            <ShieldAlert size={34} className="text-primary" /> Security & Audit Trail 🛡️
          </h2>
          <p className="fw-medium m-0 text-muted small">
            Immutable tracking of user authentication, privilege escalations, database mutations, and administrative actions.
          </p>
        </div>
        <div className="d-flex gap-2">
          <button 
            className="btn btn-outline-secondary rounded-pill fw-bold d-flex align-items-center gap-2"
            onClick={fetchLogs}
            disabled={loading}
          >
            <RefreshCw size={15} className={loading ? "spin" : ""} /> Refresh
          </button>
          <button 
            className="btn btn-primary rounded-pill fw-bold d-flex align-items-center gap-2 px-3 shadow-sm"
            onClick={handleExportLogs}
            style={{ background: "linear-gradient(135deg, var(--primary), #8b5cf6)", border: "none" }}
          >
            <Download size={15} /> Export CSV
          </button>
        </div>
      </div>

      {/* FILTER CONTROLS */}
      <div className="bento-card mb-4 p-3">
        <div className="row g-3">
          <div className="col-md-6 col-lg-6">
            <div className="position-relative">
              <Search
                className="position-absolute top-50 translate-middle-y ms-3 text-muted"
                size={18}
              />
              <input
                type="text"
                className="form-control ps-5 rounded-pill"
                placeholder="Search audit trail by user, IP, action, or details..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  height: "44px",
                  background: "var(--surface-2, rgba(255,255,255,0.04))",
                  color: "var(--text)",
                  border: "1px solid var(--border)",
                }}
              />
            </div>
          </div>
          <div className="col-md-3 col-lg-3">
            <select
              className="form-select rounded-pill ps-3"
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              style={{
                height: "44px",
                background: "var(--surface-2, rgba(255,255,255,0.04))",
                border: "1px solid var(--border)",
                color: "var(--text)",
              }}
            >
              <option value="All">All Severities</option>
              <option value="Info">Info (Standard)</option>
              <option value="Warning">Warning</option>
              <option value="High">High (Security Alert)</option>
            </select>
          </div>
          <div className="col-md-3 col-lg-3">
            <select
              className="form-select rounded-pill ps-3"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                height: "44px",
                background: "var(--surface-2, rgba(255,255,255,0.04))",
                border: "1px solid var(--border)",
                color: "var(--text)",
              }}
            >
              <option value="All">All Statuses</option>
              <option value="SUCCESS">SUCCESS</option>
              <option value="FAILED">FAILED</option>
              <option value="WARNING">WARNING</option>
            </select>
          </div>
        </div>
      </div>

      {/* AUDIT LOG TABLE */}
      <div className="bento-card p-0 overflow-hidden">
        {loading ? (
          <div className="text-center p-5">
            <div className="spinner-border text-primary" role="status" />
            <p className="text-muted mt-3 fw-medium">Loading security audit records...</p>
          </div>
        ) : (
          <div className="table-responsive" style={{ minHeight: "450px" }}>
            <table className="table table-hover align-middle mb-0 font-monospace small">
              <thead style={{ background: "rgba(255, 255, 255, 0.03)", borderBottom: "1px solid var(--border)" }}>
                <tr>
                  <th className="py-3 px-4 border-0 text-muted">TIMESTAMP</th>
                  <th className="py-3 border-0 text-muted">ACTION EVENT</th>
                  <th className="py-3 border-0 text-muted">SEVERITY</th>
                  <th className="py-3 border-0 text-muted">STATUS</th>
                  <th className="py-3 border-0 text-muted">ACTOR / IP</th>
                  <th className="py-3 border-0 text-muted pe-4">EVENT DETAILS</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">
                      No security audit events match the specified filters.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log, idx) => {
                    const actorName =
                      log.actor?.name ||
                      log.actor?.email ||
                      log.user?.name ||
                      log.user?.email ||
                      (typeof log.user === 'string' ? log.user : null) ||
                      "System";
                    const actorIp = log.ip || log.ipAddress || "Localhost";
                    const eventDate = log.timestamp || log.createdAt;
                    return (
                      <motion.tr
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.02 }}
                        key={log._id || idx}
                        style={{ borderTop: "1px solid var(--border)" }}
                      >
                        <td className="py-3 px-4 text-muted" style={{ whiteSpace: 'nowrap' }}>
                          <Clock size={13} className="me-1 d-inline text-primary" /> 
                          {eventDate ? new Date(eventDate).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Recent'}
                        </td>
                        <td className="py-3 fw-bold text-white">
                          <Terminal size={14} className="me-2 text-primary d-inline" /> 
                          {log.action || log.type || "SECURITY_EVENT"}
                        </td>
                        <td className="py-3">
                          {getSeverityBadge(log.severity)}
                        </td>
                        <td className="py-3">
                          <span className={`badge ${log.status === 'SUCCESS' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'} small px-2 py-1`}>
                            {log.status || 'LOGGED'}
                          </span>
                        </td>
                        <td className="py-3 text-muted">
                          <div className="fw-semibold text-white">{actorName}</div>
                          <div className="small text-secondary">{actorIp}</div>
                        </td>
                        <td className="py-3 pe-4 text-muted">
                          <div className="text-truncate" style={{ maxWidth: "380px" }} title={log.details}>
                            {log.details || log.entity || log.target || "Administrative operation executed"}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
