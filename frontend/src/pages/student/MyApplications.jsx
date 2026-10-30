import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Briefcase,
  MapPin,
  Building2,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  Clock3,
  Calendar,
  FileText,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Sparkles,
  Search,
} from "lucide-react";
import { jobService } from "../../services/api.js";
import { formatSalaryRange } from "../../utils/salaryHelper.js";

const resolveResumeUrl = (url) => {
  if (!url) return "#";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/uploads/")) return url;
  return `/api/student/resume/file/${encodeURIComponent(url.replace(/^\/+/, ""))}`;
};

const STATUS_CONFIG = {
  Applied: {
    label: "Applied",
    icon: Clock3,
    color: "#2563eb",
    bg: "rgba(37, 99, 235, 0.1)",
    border: "rgba(37, 99, 235, 0.25)",
    topBorder: "#3b82f6",
  },
  "Under Review": {
    label: "Under Review",
    icon: Clock,
    color: "#d97706",
    bg: "rgba(245, 158, 11, 0.12)",
    border: "rgba(245, 158, 11, 0.25)",
    topBorder: "#f59e0b",
  },
  Screening: {
    label: "Screening",
    icon: Clock,
    color: "#d97706",
    bg: "rgba(245, 158, 11, 0.12)",
    border: "rgba(245, 158, 11, 0.25)",
    topBorder: "#f59e0b",
  },
  Shortlisted: {
    label: "Shortlisted",
    icon: Sparkles,
    color: "#7c3aed",
    bg: "rgba(124, 58, 237, 0.12)",
    border: "rgba(124, 58, 237, 0.25)",
    topBorder: "#8b5cf6",
  },
  "Interview Scheduled": {
    label: "Interview Scheduled",
    icon: Calendar,
    color: "#0284c7",
    bg: "rgba(2, 132, 199, 0.12)",
    border: "rgba(2, 132, 199, 0.25)",
    topBorder: "#0284c7",
  },
  Interview: {
    label: "Interview",
    icon: Calendar,
    color: "#0284c7",
    bg: "rgba(2, 132, 199, 0.12)",
    border: "rgba(2, 132, 199, 0.25)",
    topBorder: "#0284c7",
  },
  Offered: {
    label: "Offered",
    icon: CheckCircle2,
    color: "#059669",
    bg: "rgba(16, 185, 129, 0.12)",
    border: "rgba(16, 185, 129, 0.25)",
    topBorder: "#10b981",
  },
  Hired: {
    label: "Hired",
    icon: CheckCircle2,
    color: "#059669",
    bg: "rgba(16, 185, 129, 0.12)",
    border: "rgba(16, 185, 129, 0.25)",
    topBorder: "#10b981",
  },
  Rejected: {
    label: "Rejected",
    icon: XCircle,
    color: "#dc2626",
    bg: "rgba(239, 68, 68, 0.12)",
    border: "rgba(239, 68, 68, 0.25)",
    topBorder: "#ef4444",
  },
};

const getStatusConfig = (status) => {
  return (
    STATUS_CONFIG[status] || {
      label: status || "Submitted",
      icon: Clock3,
      color: "#64748b",
      bg: "rgba(100, 116, 139, 0.1)",
      border: "rgba(100, 116, 139, 0.2)",
      topBorder: "#10b981",
    }
  );
};

const getCompanyInitials = (name) => {
  if (!name) return "CO";
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
};

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await jobService.getMyApplications();
        setApplications(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch applications", err);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const totalApplied = applications.length;
  const shortlistedCount = applications.filter((a) =>
    ["Shortlisted", "Interview Scheduled", "Interview", "Offered", "Hired"].includes(a.status)
  ).length;

  return (
    <div className="container-fluid py-4 px-3 px-xl-5">
      {/* ── HEADER BANNER ── */}
      <div className="mb-4">
        <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-3">
            <div
              className="d-flex align-items-center justify-content-center text-white shadow-sm flex-shrink-0"
              style={{
                width: 52,
                height: 52,
                borderRadius: "18px",
                background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
              }}
            >
              <Briefcase size={26} />
            </div>
            <div>
              <h1
                className="fw-black mb-1"
                style={{
                  fontSize: "1.9rem",
                  letterSpacing: "-0.02em",
                  color: "var(--text)",
                }}
              >
                My Applications
              </h1>
              <p className="text-muted small mb-0 fw-medium">
                Track your submitted applications, interview stages, and recruiter responses.
              </p>
            </div>
          </div>

          <Link
            to="/student/jobs"
            className="btn btn-outline-primary rounded-pill px-4 py-2 fw-semibold d-inline-flex align-items-center gap-2 shadow-sm transition-fast align-self-start align-self-md-auto"
            style={{ fontSize: "0.9rem" }}
          >
            <Search size={16} />
            <span>Browse Jobs</span>
          </Link>
        </div>

        {/* ── STATS / BENEFIT ROW ── */}
        <div className="d-flex flex-wrap align-items-center gap-2 mt-3 pt-1">
          <div
            className="badge rounded-pill px-3 py-2 fw-semibold d-inline-flex align-items-center gap-1.5"
            style={{
              backgroundColor: "rgba(99, 102, 241, 0.08)",
              color: "#4f46e5",
              border: "1px solid rgba(99, 102, 241, 0.18)",
              fontSize: "0.8rem",
            }}
          >
            <TrendingUp size={14} />
            <span>{totalApplied} Total Submissions</span>
          </div>

          <div
            className="badge rounded-pill px-3 py-2 fw-semibold d-inline-flex align-items-center gap-1.5"
            style={{
              backgroundColor: "rgba(16, 185, 129, 0.08)",
              color: "#059669",
              border: "1px solid rgba(16, 185, 129, 0.18)",
              fontSize: "0.8rem",
            }}
          >
            <Sparkles size={14} />
            <span>{shortlistedCount} Advanced / Shortlisted</span>
          </div>
        </div>
      </div>

      {/* ── 2-COLUMN APPLICATION CARDS GRID ── */}
      <div className="row g-4">
        {loading ? (
          /* SKELETON LOADERS (4 cards in 2x2 grid) */
          [1, 2, 3, 4].map((n) => (
            <div key={n} className="col-12 col-lg-6">
              <div
                className="p-4 rounded-4"
                style={{
                  background: "var(--card, #ffffff)",
                  border: "1px solid var(--border)",
                  borderRadius: "24px",
                  borderTop: "3.5px solid #10b981",
                  minHeight: "220px",
                }}
              >
                <div className="d-flex justify-content-between mb-3">
                  <div className="d-flex gap-3 align-items-center w-75">
                    <div
                      className="rounded-3 placeholder-glow"
                      style={{
                        width: 46,
                        height: 46,
                        background: "var(--bg-secondary)",
                      }}
                    />
                    <div className="flex-grow-1">
                      <div
                        className="placeholder col-8 rounded mb-1"
                        style={{ height: 16 }}
                      />
                      <div
                        className="placeholder col-5 rounded"
                        style={{ height: 12 }}
                      />
                    </div>
                  </div>
                  <div
                    className="placeholder col-3 rounded-pill"
                    style={{ height: 26 }}
                  />
                </div>
                <div className="d-flex gap-3 my-4">
                  <div
                    className="placeholder col-4 rounded"
                    style={{ height: 14 }}
                  />
                  <div
                    className="placeholder col-3 rounded"
                    style={{ height: 14 }}
                  />
                </div>
                <div
                  className="pt-3 border-top d-flex justify-content-between"
                  style={{ borderColor: "var(--border)" }}
                >
                  <div
                    className="placeholder col-4 rounded"
                    style={{ height: 12 }}
                  />
                  <div
                    className="placeholder col-3 rounded"
                    style={{ height: 12 }}
                  />
                </div>
              </div>
            </div>
          ))
        ) : applications.length === 0 ? (
          /* EMPTY STATE */
          <div className="col-12">
            <div
              className="text-center py-5 px-4 rounded-4 shadow-sm"
              style={{
                background: "var(--card, #ffffff)",
                border: "1px solid var(--border)",
                borderRadius: "24px",
              }}
            >
              <div
                className="mx-auto mb-3 d-flex align-items-center justify-content-center text-primary"
                style={{
                  width: 68,
                  height: 68,
                  borderRadius: "50%",
                  background: "rgba(99, 102, 241, 0.1)",
                }}
              >
                <Briefcase size={32} />
              </div>
              <h4 className="fw-bold mb-2" style={{ color: "var(--text)" }}>
                No applications submitted yet
              </h4>
              <p
                className="text-muted mx-auto mb-4"
                style={{ maxWidth: 460, fontSize: "0.95rem" }}
              >
                Explore exciting campus placement drives, internships, and full-time career opportunities on our job board.
              </p>
              <Link
                to="/student/jobs"
                className="btn btn-primary rounded-pill px-4 py-2.5 fw-bold shadow-sm d-inline-flex align-items-center gap-2"
              >
                <span>Browse Available Jobs</span>
                <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        ) : (
          /* ACTIVE APPLICATIONS LIST */
          applications.map((app, idx) => {
            const job = app.jobId;
            const companyName =
              job?.company ||
              job?.recruiterId?.recruiterProfile?.companyName ||
              "Top Enterprise Partner";
            const cfg = getStatusConfig(app.status);
            const StatusIcon = cfg.icon;

            return (
              <motion.div
                key={app._id || idx}
                className="col-12 col-lg-6"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, delay: idx * 0.04 }}
              >
                <div
                  className="p-4 h-100 d-flex flex-column transition-all"
                  style={{
                    background: "var(--card, #ffffff)",
                    borderRadius: "24px",
                    border: "1px solid var(--border)",
                    borderTop: `3.5px solid ${cfg.topBorder || "#10b981"}`,
                    boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.04), 0 2px 6px -1px rgba(0, 0, 0, 0.02)",
                  }}
                >
                  {/* Card Header: Company Icon + Job Title + Status Badge */}
                  <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                    <div className="d-flex align-items-center gap-3 min-w-0">
                      <div
                        className="d-flex align-items-center justify-content-center fw-black flex-shrink-0"
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: "14px",
                          background: "linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.16) 100%)",
                          color: "#4f46e5",
                          fontSize: "1.05rem",
                          letterSpacing: "0.02em",
                          border: "1px solid rgba(99, 102, 241, 0.2)",
                        }}
                      >
                        {getCompanyInitials(companyName)}
                      </div>
                      <div className="min-w-0">
                        <h4
                          className="fw-bold mb-1 text-truncate"
                          style={{
                            fontSize: "1.18rem",
                            color: "var(--text)",
                            letterSpacing: "-0.01em",
                          }}
                          title={job?.title || "Role Unavailable"}
                        >
                          {job?.title || "Role Unavailable"}
                        </h4>
                        <div
                          className="d-flex align-items-center gap-1.5 text-muted small fw-semibold"
                          style={{ fontSize: "0.86rem" }}
                        >
                          <Building2 size={14} className="text-primary flex-shrink-0" />
                          <span className="text-truncate">{companyName}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex-shrink-0">
                      <span
                        className="badge rounded-pill px-3 py-1.5 fw-bold d-inline-flex align-items-center gap-1.5 shadow-none"
                        style={{
                          backgroundColor: cfg.bg,
                          color: cfg.color,
                          border: `1px solid ${cfg.border}`,
                          fontSize: "0.8rem",
                        }}
                      >
                        <StatusIcon size={14} />
                        <span>{cfg.label}</span>
                      </span>
                    </div>
                  </div>

                  {/* Metadata Chips: Location, Job Type, Salary */}
                  <div className="d-flex flex-wrap align-items-center gap-2 mb-4 flex-grow-1 pt-1">
                    <span
                      className="badge rounded-pill px-2.5 py-1.5 fw-medium d-inline-flex align-items-center gap-1.5"
                      style={{
                        backgroundColor: "var(--bg-secondary)",
                        color: "var(--text-secondary)",
                        border: "1px solid var(--border)",
                        fontSize: "0.78rem",
                      }}
                    >
                      <MapPin size={13} className="text-danger opacity-75" />
                      <span>{job?.location || "Remote / Hybrid"}</span>
                    </span>

                    <span
                      className="badge rounded-pill px-2.5 py-1.5 fw-medium d-inline-flex align-items-center gap-1.5"
                      style={{
                        backgroundColor: "var(--bg-secondary)",
                        color: "var(--text-secondary)",
                        border: "1px solid var(--border)",
                        fontSize: "0.78rem",
                      }}
                    >
                      <Briefcase size={13} className="text-primary opacity-75" />
                      <span>{job?.type || "Full-Time"}</span>
                    </span>

                    {job?.salary && (job.salary.min || job.salary.max) && (
                      <span
                        className="badge rounded-pill px-2.5 py-1.5 fw-medium d-inline-flex align-items-center gap-1.5"
                        style={{
                          backgroundColor: "rgba(16, 185, 129, 0.08)",
                          color: "#059669",
                          border: "1px solid rgba(16, 185, 129, 0.2)",
                          fontSize: "0.78rem",
                        }}
                      >
                        <DollarSign size={13} />
                        <span>{formatSalaryRange(job.salary)}</span>
                      </span>
                    )}
                  </div>

                  {/* Card Footer: Application Date + View Sent Resume Link */}
                  <div
                    className="pt-3 border-top d-flex justify-content-between align-items-center text-muted small mt-auto"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <span className="d-flex align-items-center gap-1.5 text-muted" style={{ fontSize: "0.82rem" }}>
                      <Calendar size={14} className="opacity-75" />
                      <span>
                        Applied on{" "}
                        {app.createdAt
                          ? new Date(app.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "Recently"}
                      </span>
                    </span>

                    {app.resumeUrl ? (
                      <a
                        href={resolveResumeUrl(app.resumeUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="d-inline-flex align-items-center gap-1 fw-bold text-decoration-none transition-fast hover-underline"
                        style={{ color: "#4f46e5", fontSize: "0.85rem" }}
                      >
                        <FileText size={14} />
                        <span>View Sent Resume</span>
                        <ExternalLink size={12} className="opacity-75 ms-0.5" />
                      </a>
                    ) : (
                      <span className="text-muted small">No Resume Attached</span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MyApplications;
