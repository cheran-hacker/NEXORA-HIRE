import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ClipboardCheck,
  ListFilter,
  History as HistoryIcon,
  Clock,
  Play,
  Trophy,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  FileText,
  ArrowRight,
  Code2,
  Brain,
  Layers,
  BarChart2,
  Workflow,
  Sparkles,
  RefreshCw,
  Eye,
  ShieldCheck,
  Check
} from "lucide-react";
import { assessmentService } from "../../services/api";
import "../../shared/components/modal.css";
import "./assessments.css";

const DIFFICULTY_MAP = {
  Easy: { label: "Easy", className: "nexora-badge-diff-easy" },
  Medium: { label: "Medium", className: "nexora-badge-diff-medium" },
  Hard: { label: "Hard", className: "nexora-badge-diff-hard" },
};

const getCategoryIcon = (type = "", title = "") => {
  const text = (type + " " + title).toLowerCase();
  if (text.includes("code") || text.includes("coding") || text.includes("programming")) {
    return {
      icon: Code2,
      bg: "#ecfdf5",
      color: "#059669",
      darkBg: "rgba(16, 185, 129, 0.15)",
      darkColor: "#34d399",
    };
  }
  if (text.includes("aptitude") || text.includes("logical") || text.includes("reasoning")) {
    return {
      icon: Brain,
      bg: "#fdf2f8",
      color: "#db2777",
      darkBg: "rgba(219, 39, 119, 0.15)",
      darkColor: "#f472b6",
    };
  }
  if (text.includes("algorithm") || text.includes("data structure") || text.includes("dsa") || text.includes("challenge")) {
    return {
      icon: BarChart2,
      bg: "#fffbeb",
      color: "#d97706",
      darkBg: "rgba(245, 158, 11, 0.15)",
      darkColor: "#fbbf24",
    };
  }
  if (text.includes("qualifier") || text.includes("system") || text.includes("architecture")) {
    return {
      icon: Workflow,
      bg: "#f5f3ff",
      color: "#7c3aed",
      darkBg: "rgba(124, 58, 237, 0.15)",
      darkColor: "#a78bfa",
    };
  }
  return {
    icon: Layers,
    bg: "#eff6ff",
    color: "#2563eb",
    darkBg: "rgba(59, 130, 246, 0.15)",
    darkColor: "#60a5fa",
  };
};

const Assessments = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") === "history" ? "history" : "available";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAssessmentsData();
  }, []);

  const fetchAssessmentsData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [resAssessments, resHistory] = await Promise.all([
        assessmentService.getAll(),
        assessmentService.getMyAssessments(),
      ]);

      const allAssessments = resAssessments.data?.data || [];
      const historyData = resHistory.data?.data || [];
      
      setHistory(historyData);

      // Filter out completed assessments from Available list
      const completedIds = new Set(
        historyData.map((h) => String(h.assessmentId?._id || h.assessmentId || ""))
      );
      
      const available = allAssessments.filter((a) => !completedIds.has(String(a._id)));
      setAssessments(available);
    } catch (err) {
      console.error("Failed to fetch assessments:", err);
      setError("Failed to load assessments from the server. Please try refreshing.");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams(tab === "history" ? { tab: "history" } : {});
  };

  const handleStartAssessment = async (assessment) => {
    try {
      // Attempt browser fullscreen on direct user gesture
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch (e) {
      // Gracefully continue to assessment engine
    }
    setSelectedAssessment(null);
    navigate(`/student/assessments/${assessment._id}`);
  };

  const formatSubmissionDate = (dateVal) => {
    if (!dateVal) return "Recently";
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return "Recently";
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Recently";
    }
  };

  return (
    <div className="nexora-assessments-page py-4 py-lg-5 px-3 px-xl-5">
      {/* ── Top Hero Header with 3D Banner ── */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-4">
        <div className="d-flex align-items-center gap-3">
          <div className="nexora-assessment-header-badge">
            <ClipboardCheck size={28} strokeWidth={2.4} />
          </div>
          <div>
            <h1 className="nexora-assessment-title mb-0">Assessments</h1>
            <p className="nexora-assessment-subtitle mb-0">
              Take scheduled assessments and track your performance history.
            </p>
          </div>
        </div>

        {/* ── Right-Side 3D Vector Illustration (Matching Design Reference) ── */}
        <div className="nexora-assessment-illustration-card">
          <svg width="260" height="130" viewBox="0 0 260 130" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#f1f5f9" stopOpacity="0.9" />
              </linearGradient>
              <linearGradient id="pencilGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
              <linearGradient id="badgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
              <filter id="softShadow" x="-10%" y="-10%" width="130%" height="130%">
                <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#6366f1" floodOpacity="0.12" />
              </filter>
            </defs>

            {/* Back card */}
            <rect x="70" y="8" width="85" height="110" rx="14" fill="#e0e7ff" opacity="0.6" transform="rotate(-6 70 8)" />
            
            {/* Front Checklist Card */}
            <rect x="85" y="10" width="85" height="110" rx="14" fill="url(#cardGrad)" filter="url(#softShadow)" />
            
            {/* Checklist Checkboxes & Lines */}
            <rect x="97" y="28" width="16" height="16" rx="4" fill="#4f46e5" />
            <path d="M101 36L104 39L109 33" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="120" y="32" width="40" height="6" rx="3" fill="#cbd5e1" />

            <rect x="97" y="52" width="16" height="16" rx="4" fill="#4f46e5" />
            <path d="M101 60L104 63L109 57" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="120" y="56" width="34" height="6" rx="3" fill="#cbd5e1" />

            <rect x="97" y="76" width="16" height="16" rx="4" fill="#4f46e5" />
            <path d="M101 84L104 87L109 81" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="120" y="80" width="38" height="6" rx="3" fill="#cbd5e1" />

            {/* 3D Angled Pencil */}
            <g transform="rotate(32 185 65)">
              <rect x="165" y="20" width="14" height="75" rx="4" fill="url(#pencilGrad)" />
              <path d="M165 95 L172 108 L179 95 Z" fill="#f8fafc" />
              <circle cx="172" cy="106" r="2" fill="#1e293b" />
            </g>

            {/* Floating Clock Badge */}
            <circle cx="195" cy="22" r="15" fill="#eff6ff" stroke="#bfdbfe" strokeWidth="1.5" />
            <circle cx="195" cy="22" r="2" fill="#3b82f6" />
            <path d="M195 14 V22 H201" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />

            {/* Floating Stats Badge */}
            <rect x="42" y="55" width="28" height="24" rx="7" fill="#f5f3ff" stroke="#ddd6fe" strokeWidth="1.5" />
            <path d="M48 72 V66 M56 72 V62 M64 72 V60" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" />

            {/* Floating Sparkles / Stars */}
            <path d="M40 28 L42 22 L44 28 L50 30 L44 32 L42 38 L40 32 L34 30 Z" fill="#818cf8" opacity="0.75" />
            <path d="M225 75 L226 71 L227 75 L231 76 L227 77 L226 81 L225 77 L221 76 Z" fill="#818cf8" opacity="0.6" />
          </svg>
        </div>
      </div>

      {/* ── Tabs Navigation ── */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
        <div className="nexora-assessment-tabs">
          <button
            className={`nexora-tab-btn ${activeTab === "available" ? "active" : ""}`}
            onClick={() => handleTabChange("available")}
          >
            <ListFilter size={16} />
            <span>Available ({loading ? "..." : assessments.length})</span>
          </button>
          <button
            className={`nexora-tab-btn ${activeTab === "history" ? "active" : ""}`}
            onClick={() => handleTabChange("history")}
          >
            <HistoryIcon size={16} />
            <span>History ({loading ? "..." : history.length})</span>
          </button>
        </div>

        {error && (
          <button
            onClick={fetchAssessmentsData}
            className="btn btn-sm btn-outline-danger rounded-pill px-3 py-1.5 d-flex align-items-center gap-1.5"
          >
            <RefreshCw size={14} /> Retry Loading
          </button>
        )}
      </div>

      {/* ── Tab Content ── */}
      <AnimatePresence mode="wait">
        {activeTab === "available" ? (
          <motion.div
            key="available-tab"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            {loading ? (
              <div className="row g-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="col-12 col-md-6 col-xl-4">
                    <div className="nexora-assessment-card p-4">
                      <div className="placeholder-glow">
                        <div className="d-flex justify-content-between mb-3">
                          <span className="placeholder col-3 rounded-pill py-2" />
                          <span className="placeholder col-3 rounded-pill py-2" />
                        </div>
                        <h5 className="placeholder col-8 py-2 mb-2" />
                        <p className="placeholder col-11 mb-4" />
                        <div className="row g-2 mb-4">
                          <div className="col-4"><div className="placeholder col-12 py-3 rounded-3" /></div>
                          <div className="col-4"><div className="placeholder col-12 py-3 rounded-3" /></div>
                          <div className="col-4"><div className="placeholder col-12 py-3 rounded-3" /></div>
                        </div>
                        <span className="placeholder col-12 py-3 rounded-pill" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-5">
                <AlertTriangle size={42} className="text-danger mb-3" />
                <h5 className="fw-bold mb-1">Failed to Load Assessments</h5>
                <p className="text-muted small mb-4">{error}</p>
                <button
                  className="btn btn-primary rounded-pill px-4 fw-bold"
                  onClick={fetchAssessmentsData}
                >
                  <RefreshCw size={16} className="me-2" /> Retry Connection
                </button>
              </div>
            ) : assessments.length === 0 ? (
              <div className="text-center py-5 my-4">
                <div
                  className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                  style={{ width: 68, height: 68, background: "rgba(99, 102, 241, 0.1)", color: "#6366f1" }}
                >
                  <ClipboardCheck size={34} />
                </div>
                <h5 className="fw-bold mb-1">No Available Assessments</h5>
                <p className="text-muted small mb-3">
                  You are completely caught up! Check the History tab to review your past results.
                </p>
                <button
                  className="btn btn-sm btn-outline-primary rounded-pill px-4 fw-bold"
                  onClick={() => handleTabChange("history")}
                >
                  View Performance History
                </button>
              </div>
            ) : (
              <div className="row g-4">
                {assessments.map((assessment, idx) => {
                  const questionsList = Array.isArray(assessment.questions) ? assessment.questions : [];
                  const questionCount = questionsList.length;
                  const totalMarks =
                    assessment.totalMarks > 0
                      ? assessment.totalMarks
                      : questionsList.reduce((sum, q) => sum + (q.marks || 1), 0);
                  const passMark = assessment.passingPercentage || 60;
                  const diffMeta = DIFFICULTY_MAP[assessment.difficulty] || DIFFICULTY_MAP.Medium;
                  const cat = getCategoryIcon(assessment.type, assessment.title);
                  const CatIcon = cat.icon;

                  return (
                    <div key={assessment._id || idx} className="col-12 col-md-6 col-xl-4">
                      <motion.div
                        className="nexora-assessment-card"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05, duration: 0.2 }}
                      >
                        {/* Top Badges: Difficulty & Duration */}
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <span className={diffMeta.className}>
                            {diffMeta.label}
                          </span>
                          <span className="nexora-badge-duration">
                            <Clock size={13} />
                            <span>{assessment.durationMinutes || 30} min</span>
                          </span>
                        </div>

                        {/* Title, Subtitle & Category Icon */}
                        <div className="d-flex justify-content-between align-items-start gap-2.5 mb-3 flex-grow-1">
                          <div className="flex-grow-1">
                            <h5
                              className="fw-bold mb-1.5"
                              style={{
                                color: "var(--text, #0f172a)",
                                fontSize: "1.05rem",
                                lineHeight: "1.35",
                              }}
                            >
                              {assessment.title}
                            </h5>
                            <p
                              className="text-muted small mb-0"
                              style={{
                                fontSize: "0.82rem",
                                lineHeight: "1.45",
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                                minHeight: "2.4rem",
                              }}
                            >
                              {assessment.description || `Benchmark evaluation for ${assessment.title}`}
                            </p>
                          </div>

                          <div
                            className="nexora-category-icon-badge"
                            style={{
                              background: cat.bg,
                              color: cat.color,
                            }}
                          >
                            <CatIcon size={20} />
                          </div>
                        </div>

                        {/* Metrics Row (Questions, Marks, Pass Mark) */}
                        <div className="row g-2 mb-4 pt-1 align-items-center">
                          <div className="col-4">
                            <div className="nexora-metric-box">
                              <div
                                className="nexora-metric-icon-circle"
                                style={{ background: "rgba(124, 58, 237, 0.12)", color: "#7c3aed" }}
                              >
                                <HelpCircle size={15} />
                              </div>
                              <div>
                                <div className="nexora-metric-number">{questionCount}</div>
                                <div className="nexora-metric-label">Questions</div>
                              </div>
                            </div>
                          </div>

                          <div className="col-4">
                            <div className="nexora-metric-box">
                              <div
                                className="nexora-metric-icon-circle"
                                style={{ background: "rgba(16, 185, 129, 0.12)", color: "#059669" }}
                              >
                                <FileText size={15} />
                              </div>
                              <div>
                                <div className="nexora-metric-number">{totalMarks}</div>
                                <div className="nexora-metric-label">Marks</div>
                              </div>
                            </div>
                          </div>

                          <div className="col-4">
                            <div className="nexora-metric-box">
                              <div
                                className="nexora-metric-icon-circle"
                                style={{ background: "rgba(245, 158, 11, 0.12)", color: "#d97706" }}
                              >
                                <Trophy size={15} />
                              </div>
                              <div>
                                <div className="nexora-metric-number">{passMark}%</div>
                                <div className="nexora-metric-label">Pass Mark</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Start Assessment Button */}
                        <button
                          type="button"
                          className="nexora-btn-start-assessment"
                          onClick={() => handleStartAssessment(assessment)}
                        >
                          <Play size={14} fill="currentColor" />
                          <span>Start Assessment</span>
                          <ArrowRight size={14} />
                        </button>
                      </motion.div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        ) : (
          /* ── History Tab ── */
          <motion.div
            key="history-tab"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            {loading ? (
              <div className="text-center py-5">
                <span className="spinner-border text-primary" />
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-5 my-4">
                <div
                  className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                  style={{ width: 68, height: 68, background: "rgba(99, 102, 241, 0.1)", color: "#6366f1" }}
                >
                  <HistoryIcon size={34} />
                </div>
                <h5 className="fw-bold mb-1">No Past Submissions</h5>
                <p className="text-muted small mb-3">
                  You have not completed any assessments yet. Choose an assessment from the Available tab to get started.
                </p>
                <button
                  className="btn btn-sm btn-primary rounded-pill px-4 fw-bold"
                  onClick={() => handleTabChange("available")}
                >
                  Browse Available Assessments
                </button>
              </div>
            ) : (
              <div className="bento-card p-0 overflow-hidden shadow-sm" style={{ borderRadius: "20px" }}>
                <div className="table-responsive">
                  <table className="table table-hover table-borderless align-middle mb-0">
                    <thead style={{ background: "var(--bg-secondary, #f8fafc)", borderBottom: "1px solid var(--border, #e2e8f0)" }}>
                      <tr className="text-muted small fw-bold text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "0.03em" }}>
                        <th className="px-4 py-3">Assessment Title</th>
                        <th className="py-3">Score & Marks</th>
                        <th className="py-3">Performance</th>
                        <th className="py-3">Result</th>
                        <th className="px-4 py-3">Date Completed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((h, i) => {
                        const score = h.totalScore ?? h.totalMarksObtained ?? 0;
                        let maxMarks =
                          h.assessmentId?.totalMarks ||
                          (Array.isArray(h.assessmentId?.questions) && h.assessmentId.questions.length > 0
                            ? h.assessmentId.questions.reduce((sum, q) => sum + (q.marks || 1), 0)
                            : 0) ||
                          h.totalMarks ||
                          100;

                        if (score > maxMarks) {
                          maxMarks = Math.max(100, Math.ceil(score / 10) * 10);
                        }

                        const percentage = Math.min(100, maxMarks > 0 ? Math.round((score / maxMarks) * 100) : (h.scorePercentage ?? 0));
                        const passingPct = h.assessmentId?.passingPercentage ?? 60;
                        const isPassed = percentage >= passingPct || h.isPassed === true;
                        const submissionDate = h.submitTime || h.createdAt || h.endTime;

                        return (
                          <tr
                            key={h._id || i}
                            style={{
                              borderTop: i > 0 ? "1px solid var(--border, #f1f5f9)" : "none",
                            }}
                          >
                            <td className="px-4 py-3.5">
                              <div className="fw-bold" style={{ color: "var(--text, #0f172a)", fontSize: "0.95rem" }}>
                                {h.assessmentId?.title || "Assessment Evaluation"}
                              </div>
                              <small className="text-muted">
                                {h.assessmentId?.type || "Technical"} · {h.assessmentId?.durationMinutes || 30} mins
                              </small>
                            </td>

                            <td className="py-3.5">
                              <span className="fw-black fs-6" style={{ color: "var(--text, #0f172a)" }}>
                                {score} <span className="text-muted fw-normal" style={{ fontSize: "0.85rem" }}>/ {maxMarks}</span>
                              </span>
                            </td>

                            <td className="py-3.5" style={{ minWidth: 160 }}>
                              <div className="d-flex align-items-center gap-2.5">
                                <span className={`fw-bold small text-${isPassed ? "success" : "danger"}`}>
                                  {percentage}%
                                </span>
                                <div
                                  className="progress flex-grow-1"
                                  style={{ height: 6, borderRadius: 9999, background: "#e2e8f0" }}
                                >
                                  <div
                                    className={`progress-bar bg-${isPassed ? "success" : "danger"} rounded-pill`}
                                    style={{ width: `${Math.min(percentage, 100)}%` }}
                                  />
                                </div>
                              </div>
                            </td>

                            <td className="py-3.5">
                              <span
                                className={`badge rounded-pill px-3 py-1.5 fw-bold d-inline-flex align-items-center gap-1.5 ${
                                  isPassed
                                    ? "bg-success-subtle text-success border border-success"
                                    : "bg-danger-subtle text-danger border border-danger"
                                }`}
                                style={{ fontSize: "0.78rem" }}
                              >
                                {isPassed ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                                <span>{isPassed ? "Passed" : "Failed"}</span>
                              </span>
                            </td>

                            <td className="px-4 py-3.5 text-muted small fw-medium">
                              {formatSubmissionDate(submissionDate)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Start Assessment Instruction Modal ── */}
      <AnimatePresence>
        {selectedAssessment && (
          <div
            className="nexora-modal-backdrop"
            onClick={() => setSelectedAssessment(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.18 }}
              className="nexora-modal-container size-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="nexora-modal-header">
                <div className="d-flex align-items-center gap-3">
                  <div className="nexora-modal-icon-badge">
                    <ClipboardCheck size={22} />
                  </div>
                  <div>
                    <h4 className="nexora-modal-title">Ready to Begin Assessment?</h4>
                    <p className="nexora-modal-subtitle">{selectedAssessment.title}</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="nexora-modal-close-btn"
                  onClick={() => setSelectedAssessment(null)}
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <div className="nexora-modal-body">
                <p className="text-muted small mb-4" style={{ lineHeight: "1.5" }}>
                  {selectedAssessment.description || "Review the guidelines below before launching your proctored assessment."}
                </p>

                {/* Stat Badges */}
                <div className="row g-3 mb-4 text-center">
                  <div className="col-4">
                    <div className="p-3 rounded-3" style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}>
                      <Clock size={20} className="text-primary mb-1 mx-auto" />
                      <div className="fw-black fs-5" style={{ color: "#0f172a" }}>
                        {selectedAssessment.durationMinutes || 30}m
                      </div>
                      <small className="text-muted fw-semibold" style={{ fontSize: "0.72rem" }}>
                        Duration
                      </small>
                    </div>
                  </div>

                  <div className="col-4">
                    <div className="p-3 rounded-3" style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}>
                      <HelpCircle size={20} className="text-info mb-1 mx-auto" />
                      <div className="fw-black fs-5" style={{ color: "#0f172a" }}>
                        {selectedAssessment.questions?.length || 0}
                      </div>
                      <small className="text-muted fw-semibold" style={{ fontSize: "0.72rem" }}>
                        Questions
                      </small>
                    </div>
                  </div>

                  <div className="col-4">
                    <div className="p-3 rounded-3" style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}>
                      <Trophy size={20} className="text-warning mb-1 mx-auto" />
                      <div className="fw-black fs-5" style={{ color: "#0f172a" }}>
                        {selectedAssessment.passingPercentage || 60}%
                      </div>
                      <small className="text-muted fw-semibold" style={{ fontSize: "0.72rem" }}>
                        Pass Mark
                      </small>
                    </div>
                  </div>
                </div>

                {/* Important Instructions Box */}
                <div
                  className="p-3 rounded-3 mb-2"
                  style={{ background: "#fffbeb", border: "1px solid #fde68a", color: "#92400e" }}
                >
                  <div className="d-flex align-items-start gap-2.5">
                    <AlertTriangle size={18} className="flex-shrink-0 mt-0.5 text-warning" />
                    <div className="small">
                      <strong>Assessment Rules & Guidelines:</strong>
                      <ul className="mb-0 mt-1 ps-3" style={{ fontSize: "0.82rem", lineHeight: "1.5" }}>
                        <li>Assessment will launch in <strong>dedicated full-screen mode</strong>.</li>
                        <li>Timer begins immediately and cannot be paused once started.</li>
                        <li>You may navigate between questions using the Question Map.</li>
                        <li>Ensure a stable internet connection. When time expires, your answers submit automatically.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="nexora-modal-footer">
                <span className="nexora-modal-footer-hint">
                  Proctored Examination Mode
                </span>
                <div className="nexora-modal-footer-actions">
                  <button
                    type="button"
                    className="nexora-modal-btn-cancel"
                    onClick={() => setSelectedAssessment(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="nexora-modal-btn-primary"
                    onClick={() => handleStartAssessment(selectedAssessment)}
                  >
                    <Play size={15} fill="currentColor" />
                    <span>Begin Fullscreen Assessment</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Assessments;
