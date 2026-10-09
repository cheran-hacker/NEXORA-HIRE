import React, { useState, useEffect } from "react";
import { adminService } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import Chart from "../../shared/components/Chart";
import {
  Activity,
  Server,
  Database,
  HardDrive,
  RefreshCcw,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
export default function Health() {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  const fetchHealth = async () => {
    try {
      setLoading(true);
      const res = await adminService.getSystemHealth();
      setHealthData(res.data.data);
    } catch (err) {
      addToast("Failed to load system health data", "error");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchHealth(); // Auto-refresh every 30 seconds
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);
  if (loading && !healthData)
    return (
      <div className="p-4 d-flex justify-content-center">
        <div className="spinner-border text-primary"></div>
      </div>
    );
  return (
    <div className="p-4" style={{ maxWidth: "1400px", margin: "0 auto" }}>
      {" "}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
        {" "}
        <div>
          {" "}
          <h1
            className="fw-bold mb-2 d-flex align-items-center gap-3"
            style={{
              fontSize: "2rem",
              color: "var(--text)",
              letterSpacing: "-0.03em",
            }}
          >
            {" "}
            System Health{" "}
            {healthData.status === "Operational" ? (
              <span className="badge bg-success-subtle text-success border border-success rounded-pill d-flex align-items-center gap-2 fs-6 py-2 px-3">
                {" "}
                <CheckCircle2 size={16} /> Operational{" "}
              </span>
            ) : (
              <span className="badge bg-warning-subtle text-warning border border-warning rounded-pill d-flex align-items-center gap-2 fs-6 py-2 px-3">
                {" "}
                <AlertTriangle size={16} /> {healthData.status}{" "}
              </span>
            )}{" "}
          </h1>{" "}
          <p
            className="fw-medium m-0"
            style={{ color: "var(--text-secondary)", fontSize: "1rem" }}
          >
            Real-time monitoring and ecosystem diagnostics.
          </p>{" "}
        </div>{" "}
        <button
          className="btn fw-semibold rounded-pill d-flex align-items-center gap-2"
          style={{ background: "var(--surface-2)", color: "var(--text)" }}
          onClick={fetchHealth}
        >
          {" "}
          <RefreshCcw size={16} className={loading ? "fa-spin" : ""} />{" "}
          Refresh{" "}
        </button>{" "}
      </div>{" "}
      {/* KPI Row */}{" "}
      <div className="row g-4 mb-4">
        {" "}
        {[
          {
            label: "CPU Usage",
            value: `${healthData.metrics.cpuUsage}%`,
            icon: Activity,
            color:
              healthData.metrics.cpuUsage > 80
                ? "var(--danger)"
                : "var(--primary)",
          },
          {
            label: "Memory Usage",
            value: `${healthData.metrics.memoryUsage}%`,
            icon: HardDrive,
            color:
              healthData.metrics.memoryUsage > 80
                ? "var(--danger)"
                : "var(--info)",
          },
          {
            label: "Active Connections",
            value: healthData.metrics.activeConnections,
            icon: Server,
            color: "var(--success)",
          },
          {
            label: "Avg API Latency",
            value: `${healthData.metrics.apiLatency}ms`,
            icon: Database,
            color:
              healthData.metrics.apiLatency > 500
                ? "var(--danger)"
                : "var(--warning)",
          },
        ].map((kpi, i) => (
          <div key={i} className="col-md-6 col-xl-3">
            {" "}
            <div className="bento-card p-4 d-flex align-items-center gap-3 h-100">
              {" "}
              <div
                className="rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  width: 56,
                  height: 56,
                  background: `rgba(0,0,0,0.05)`,
                  color: kpi.color,
                  border: `1px solid ${kpi.color}22`,
                }}
              >
                {" "}
                <kpi.icon size={28} />{" "}
              </div>{" "}
              <div>
                {" "}
                <p
                  className="mb-1 fw-semibold small"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {kpi.label}
                </p>{" "}
                <h3
                  className="fw-black mb-0"
                  style={{ color: "var(--text)", letterSpacing: "-0.02em" }}
                >
                  {kpi.value}
                </h3>{" "}
              </div>{" "}
            </div>{" "}
          </div>
        ))}{" "}
      </div>{" "}
      <div className="row g-4 mb-4">
        {" "}
        {/* API Traffic Chart */}{" "}
        <div className="col-xl-8">
          {" "}
          <div className="bento-card p-4 h-100">
            {" "}
            <h5 className="fw-bold mb-4" style={{ color: "var(--text)" }}>
              API Request Volume (Last 6 Hours)
            </h5>{" "}
            <Chart
              type="line"
              height={320}
              labels={healthData.requestVolume.labels}
              datasets={[
                {
                  label: "Requests/min",
                  data: healthData.requestVolume.data,
                  fill: true,
                  tension: 0.4,
                  borderColor: "#6366f1",
                  backgroundColor: "rgba(99, 102, 241, 0.1)",
                },
              ]}
            />{" "}
          </div>{" "}
        </div>{" "}
        {/* System Services Status */}{" "}
        <div className="col-xl-4">
          {" "}
          <div className="bento-card p-0 h-100 overflow-hidden">
            {" "}
            <div className="p-4 border-bottom border d-flex justify-content-between align-items-center">
              {" "}
              <h5 className="fw-bold mb-0" style={{ color: "var(--text)" }}>
                Core Services
              </h5>{" "}
              <ShieldCheck size={20} className="text-success" />{" "}
            </div>{" "}
            <div className="p-0">
              {" "}
              {healthData.services.map((service, i) => (
                <div
                  key={i}
                  className="d-flex align-items-center justify-content-between p-3 border-bottom border hover-bg"
                >
                  {" "}
                  <div className="d-flex align-items-center gap-3">
                    {" "}
                    <div
                      className={`rounded-circle ${service.status === "Online" ? "bg-success" : "bg-warning"}`}
                      style={{ width: 10, height: 10 }}
                    ></div>{" "}
                    <span
                      className="fw-semibold"
                      style={{ color: "var(--text)" }}
                    >
                      {service.name}
                    </span>{" "}
                  </div>{" "}
                  <div className="d-flex flex-column align-items-end">
                    {" "}
                    <span
                      className={`small fw-bold ${service.status === "Online" ? "text-success" : "text-warning"}`}
                    >
                      {service.status}
                    </span>{" "}
                    <span
                      className="small text-muted"
                      style={{ fontSize: "0.75rem" }}
                    >
                      {service.latency}
                    </span>{" "}
                  </div>{" "}
                </div>
              ))}{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}
