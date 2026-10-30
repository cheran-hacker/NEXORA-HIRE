import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Filter,
  MoreVertical,
  Download,
  CheckCircle,
  XCircle,
  Mail,
  MapPin,
  GraduationCap,
  FileText,
  User,
  Briefcase,
  AlertCircle,
  X,
  ExternalLink,
  Award,
  Sparkles,
  Building,
  Calendar,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { recruiterService, placementService } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import {
  getAtsScoreData,
  viewCandidateResume,
} from "../../utils/atsScoreHelper";

export default function Candidates() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loadingResumeId, setLoadingResumeId] = useState(null);
  const [activeDropdownId, setActiveDropdownId] = useState(null);

  // Modals state
  const [selectedProfileCandidate, setSelectedProfileCandidate] = useState(null);
  const [selectedAppCandidate, setSelectedAppCandidate] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const dropdownRef = useRef(null);
  const { addToast } = useToast();

  useEffect(() => {
    fetchCandidates();
  }, []);

  // Handle click outside to close actions dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeDropdownId && !event.target.closest(".actions-dropdown-container")) {
        setActiveDropdownId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeDropdownId]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      let apps = [];

      // 1. Try placement tracking endpoint first (returns rich Application + Student records)
      try {
        const trackRes = await placementService.getTracking();
        apps = trackRes.data.data || [];
      } catch (err) {
        console.warn("Placement tracking fetch fallback to recruiter candidates:", err);
      }

      if (apps.length > 0) {
        const mapped = apps.map((app) => {
          const student = app.studentId || {};
          const profile = student.studentProfile || {};
          const job = app.jobId || {};
          const atsData = getAtsScoreData(app);

          return {
            _id: app._id,
            applicationId: app._id,
            studentId: student._id || app._id,
            name: student.name || "Unknown Candidate",
            email: student.email || "",
            college: profile.college || student.college || "NEXORA University",
            branch: profile.branch || student.department || "Engineering",
            cgpa: profile.cgpa || null,
            avatar: student.avatar || "",
            appliedRole:
              typeof job === "object"
                ? job.title || "Campus Placement"
                : "Campus Placement",
            company:
              typeof job === "object"
                ? typeof job.company === "object"
                  ? job.company?.name || "Partner Company"
                  : job.company || "Partner Company"
                : "Partner Company",
            appliedDate: new Date(
              app.createdAt || app.appliedAt || Date.now(),
            ).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            }),
            status: app.status || "Applied",
            atsScore: atsData.score,
            isAnalyzed: atsData.isAnalyzed,
            atsLabel: atsData.label,
            atsBadgeClass: atsData.badgeClass,
            resumeUrl: app.resumeUrl || profile.resumeUrl || student.resumeUrl,
            skills: profile.skills || [],
            aiAnalysis: app.aiAnalysis,
            targetCareerRole: profile.targetCareerRole || profile.careerTarget || "",
            readinessScore: profile.readinessScore ?? null,
            rawApp: app,
            rawStudent: student,
          };
        });
        setCandidates(mapped);
      } else {
        // 2. Fallback to recruiterService.getCandidates
        const recRes = await recruiterService.getCandidates();
        const rawList = recRes.data.data || [];
        const mapped = rawList.map((c) => {
          const atsData = getAtsScoreData(c);
          return {
            ...c,
            applicationId: c._id,
            atsScore: atsData.score,
            isAnalyzed: atsData.isAnalyzed,
            atsLabel: atsData.label,
            atsBadgeClass: atsData.badgeClass,
          };
        });
        setCandidates(mapped);
      }
    } catch (err) {
      console.error("Failed to load candidates:", err);
      addToast("Failed to load candidate pool", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleViewResume = async (candidate) => {
    await viewCandidateResume({
      candidate,
      student: candidate.rawStudent,
      addToast,
      onStartLoading: () => setLoadingResumeId(candidate._id),
      onEndLoading: () => setLoadingResumeId(null),
    });
  };

  const handleUpdateApplicationStatus = async (appId, newStatus) => {
    try {
      setUpdatingStatus(true);
      await placementService.updateApplicationStatus(appId, newStatus);
      setCandidates((prev) =>
        prev.map((c) =>
          c.applicationId === appId ? { ...c, status: newStatus } : c,
        ),
      );
      if (selectedAppCandidate && selectedAppCandidate.applicationId === appId) {
        setSelectedAppCandidate((prev) => ({ ...prev, status: newStatus }));
      }
      addToast(`Status updated to ${newStatus}`, "success");
    } catch (err) {
      console.error("Failed to update status:", err);
      addToast(err.response?.data?.message || "Failed to update status", "error");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const filteredCandidates = candidates.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.college?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.appliedRole?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const map = {
      Applied: "bg-secondary-subtle text-secondary border border-secondary-subtle",
      Screening: "bg-info-subtle text-info border border-info-subtle",
      Shortlisted: "bg-primary-subtle text-primary border border-primary-subtle",
      Interview: "bg-warning-subtle text-warning border border-warning-subtle",
      "Interview Scheduled": "bg-warning-subtle text-warning border border-warning-subtle",
      Offered: "bg-success-subtle text-success border border-success-subtle",
      Selected: "bg-success-subtle text-success border border-success-subtle",
      Rejected: "bg-danger-subtle text-danger border border-danger-subtle",
    };
    return `badge rounded-pill fw-semibold px-2.5 py-1 ${map[status] || "bg-secondary-subtle text-muted"}`;
  };

  if (loading) {
    return (
      <div className="container-fluid py-5 px-xl-5 text-center">
        <div className="spinner-border text-primary my-5" role="status">
          <span className="visually-hidden">Loading candidate pool...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="container-fluid py-5 px-xl-5"
      style={{
        background: "var(--bg)",
        minHeight: "100dvh",
        color: "var(--text)",
      }}
    >
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
        <div>
          <h1
            className="fw-bold mb-2 d-flex align-items-center gap-2"
            style={{
              fontSize: "2rem",
              color: "var(--text)",
              letterSpacing: "-0.03em",
            }}
          >
            <GraduationCap className="text-primary" size={32} />
            Candidate Pool
          </h1>
          <p
            className="fw-medium m-0"
            style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}
          >
            Review applicants, inspect authentic ATS scores, and access candidate resumes.
          </p>
        </div>

        <div className="d-flex gap-2">
          <button
            onClick={() => {
              const csv = [
                "Name,College,Branch,Role,Company,ATS Score,Status,Email",
                ...filteredCandidates.map(
                  (c) =>
                    `"${c.name}","${c.college}","${c.branch || ""}","${c.appliedRole}","${c.company || ""}","${c.isAnalyzed ? `${c.atsScore}%` : "Not analyzed"}","${c.status}","${c.email}"`,
                ),
              ].join("\n");
              const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "candidates-pool.csv";
              a.click();
              addToast("Candidate CSV exported successfully!", "success");
            }}
            className="btn fw-semibold rounded-pill d-flex align-items-center gap-2 px-3 shadow-sm"
            style={{
              background: "var(--surface)",
              color: "var(--text)",
              border: "1px solid var(--border)",
            }}
          >
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bento-card mb-4 p-3 d-flex flex-wrap gap-3 align-items-center justify-content-between">
        <div
          className="position-relative flex-grow-1"
          style={{ maxWidth: "420px" }}
        >
          <Search
            size={18}
            className="position-absolute top-50 translate-middle-y ms-3 text-muted"
          />
          <input
            type="text"
            className="form-control rounded-pill ps-5 bg-transparent border text-body"
            placeholder="Search candidate name, college, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="d-flex gap-2 align-items-center">
          <Filter size={18} className="text-muted" />
          <select
            className="form-select rounded-pill bg-transparent border text-body w-auto"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Applied">Applied</option>
            <option value="Screening">Screening</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Interview">Interview</option>
            <option value="Offered">Offered</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Candidates Table */}
      <div className="bento-card p-0 shadow-sm" style={{ overflow: "visible" }}>
        <div className="table-responsive" style={{ overflowX: "auto", minHeight: "360px" }}>
          <table
            className="table table-hover align-middle mb-0"
            style={{
              "--bs-table-bg": "transparent",
              "--bs-table-color": "var(--text)",
              "--bs-table-hover-bg": "rgba(99, 102, 241, 0.04)",
            }}
          >
            <thead style={{ background: "var(--surface-2)" }}>
              <tr>
                <th className="py-3 px-4 fw-semibold border-bottom border text-muted">
                  Candidate
                </th>
                <th className="py-3 px-4 fw-semibold border-bottom border text-muted">
                  Applied Role
                </th>
                <th className="py-3 px-4 fw-semibold border-bottom border text-muted">
                  Applied Date
                </th>
                <th className="py-3 px-4 fw-semibold border-bottom border text-muted text-center">
                  ATS Score
                </th>
                <th className="py-3 px-4 fw-semibold border-bottom border text-muted text-center">
                  Resume
                </th>
                <th className="py-3 px-4 fw-semibold border-bottom border text-muted text-center">
                  Status
                </th>
                <th className="py-3 px-4 fw-semibold border-bottom border text-muted text-end">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredCandidates.map((candidate) => (
                <tr key={candidate._id} className="border-bottom border">
                  {/* Candidate Identity */}
                  <td className="py-3 px-4 align-middle">
                    <div className="d-flex align-items-center gap-3">
                      {candidate.avatar ? (
                        <img
                          src={candidate.avatar}
                          alt={candidate.name}
                          className="rounded-circle shadow-sm"
                          style={{ width: 40, height: 40, objectFit: "cover" }}
                        />
                      ) : (
                        <div
                          className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold shadow-sm"
                          style={{
                            width: 40,
                            height: 40,
                            background:
                              "linear-gradient(135deg, var(--primary), var(--purple))",
                          }}
                        >
                          {candidate.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div
                          className="fw-bold text-body"
                          style={{ cursor: "pointer" }}
                          onClick={() => setSelectedProfileCandidate(candidate)}
                        >
                          {candidate.name}
                        </div>
                        <div className="text-muted small d-flex align-items-center gap-1">
                          <GraduationCap size={12} />
                          <span>{candidate.college}</span>
                          {candidate.branch && (
                            <>
                              <span>•</span>
                              <span>{candidate.branch}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Applied Role */}
                  <td className="py-3 px-4 align-middle fw-medium">
                    <div style={{ color: "var(--text)" }}>{candidate.appliedRole}</div>
                    {candidate.company && (
                      <div className="text-muted small d-flex align-items-center gap-1">
                        <Building size={11} /> {candidate.company}
                      </div>
                    )}
                  </td>

                  {/* Applied Date */}
                  <td className="py-3 px-4 align-middle text-muted small">
                    {candidate.appliedDate}
                  </td>

                  {/* Accurate ATS Score Display */}
                  <td className="py-3 px-4 align-middle text-center">
                    {candidate.isAnalyzed ? (
                      <span className={`badge rounded-pill fw-bold px-2.5 py-1 ${candidate.atsBadgeClass}`}>
                        {candidate.atsLabel}
                      </span>
                    ) : (
                      <span
                        className="badge rounded-pill fw-medium px-2.5 py-1"
                        style={{
                          background: "var(--bg-secondary)",
                          color: "var(--text-secondary)",
                          border: "1px solid var(--border)",
                          fontSize: "0.74rem",
                        }}
                      >
                        Not analyzed
                      </span>
                    )}
                  </td>

                  {/* View Resume Button */}
                  <td className="py-3 px-4 align-middle text-center">
                    <button
                      type="button"
                      onClick={() => handleViewResume(candidate)}
                      disabled={loadingResumeId === candidate._id}
                      className="btn btn-sm btn-outline-primary rounded-pill d-inline-flex align-items-center gap-1.5 fw-semibold shadow-xs"
                      style={{ fontSize: "0.78rem", padding: "4px 12px" }}
                      title={`View ${candidate.name}'s resume`}
                    >
                      {loadingResumeId === candidate._id ? (
                        <span
                          className="spinner-border spinner-border-sm"
                          role="status"
                          aria-hidden="true"
                          style={{ width: 13, height: 13 }}
                        />
                      ) : (
                        <FileText size={14} />
                      )}
                      <span>View</span>
                    </button>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-4 align-middle text-center">
                    <span className={getStatusBadge(candidate.status)}>
                      {candidate.status}
                    </span>
                  </td>

                  {/* Actions & Dropdown */}
                  <td className="py-3 px-4 align-middle text-end position-relative">
                    <div className="d-inline-flex align-items-center gap-1">
                      <button
                        onClick={() =>
                          window.open(
                            `mailto:${candidate.email || ""}?subject=Regarding Your Application for ${encodeURIComponent(candidate.appliedRole || "Placement")}&body=Hello ${encodeURIComponent(candidate.name)},%0D%0A`,
                            "_blank",
                          )
                        }
                        className="btn btn-sm btn-icon text-muted hover-glow"
                        title="Email candidate"
                      >
                        <Mail size={16} />
                      </button>

                      {/* Dropdown Container */}
                      <div className="dropdown d-inline-block position-relative actions-dropdown-container">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDropdownId(
                              activeDropdownId === candidate._id ? null : candidate._id,
                            );
                          }}
                          className={`btn btn-sm btn-icon text-muted hover-glow ${
                            activeDropdownId === candidate._id
                              ? "active bg-primary-subtle text-primary"
                              : ""
                          }`}
                          title="More actions"
                          aria-expanded={activeDropdownId === candidate._id}
                        >
                          <MoreVertical size={16} />
                        </button>

                        {activeDropdownId === candidate._id && (
                          <div
                            className="dropdown-menu dropdown-menu-end show border-0 py-2 shadow-lg"
                            style={{
                              position: "absolute",
                              right: 0,
                              top: "calc(100% + 6px)",
                              zIndex: 1090,
                              minWidth: 210,
                              background: "#ffffff",
                              border: "1px solid rgba(0, 0, 0, 0.08)",
                              borderRadius: "14px",
                              boxShadow:
                                "0 14px 35px -6px rgba(0, 0, 0, 0.16), 0 4px 12px rgba(99, 102, 241, 0.08)",
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              className="dropdown-item d-flex align-items-center gap-2 py-2 px-3 small fw-medium"
                              style={{ color: "var(--text)" }}
                              onClick={() => {
                                setActiveDropdownId(null);
                                setSelectedProfileCandidate(candidate);
                              }}
                            >
                              <User size={15} className="text-primary" />
                              <span>View Candidate Profile</span>
                            </button>

                            <button
                              type="button"
                              className="dropdown-item d-flex align-items-center gap-2 py-2 px-3 small fw-medium"
                              style={{ color: "var(--text)" }}
                              onClick={() => {
                                setActiveDropdownId(null);
                                handleViewResume(candidate);
                              }}
                            >
                              <FileText size={15} className="text-success" />
                              <span>View Resume</span>
                            </button>

                            <button
                              type="button"
                              className="dropdown-item d-flex align-items-center gap-2 py-2 px-3 small fw-medium"
                              style={{ color: "var(--text)" }}
                              onClick={() => {
                                setActiveDropdownId(null);
                                setSelectedAppCandidate(candidate);
                              }}
                            >
                              <Briefcase size={15} className="text-info" />
                              <span>View Application</span>
                            </button>

                            <div
                              className="dropdown-divider my-1"
                              style={{ borderColor: "var(--border)" }}
                            />

                            <a
                              href={`mailto:${candidate.email || ""}?subject=Regarding Your Application for ${encodeURIComponent(candidate.appliedRole || "Placement")}`}
                              className="dropdown-item d-flex align-items-center gap-2 py-2 px-3 small fw-medium text-decoration-none"
                              style={{ color: "var(--text)" }}
                              onClick={() => setActiveDropdownId(null)}
                            >
                              <Mail size={15} className="text-secondary" />
                              <span>Email Candidate</span>
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredCandidates.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-muted">
                    No candidates found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Candidate Profile Modal ── */}
      <AnimatePresence>
        {selectedProfileCandidate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
            style={{
              background: "rgba(15, 23, 42, 0.65)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              zIndex: 1070,
              inset: 0,
            }}
            onClick={(e) =>
              e.target === e.currentTarget && setSelectedProfileCandidate(null)
            }
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bento-card p-0 d-flex flex-column"
              style={{
                width: "100%",
                maxWidth: 680,
                maxHeight: "90vh",
                background: "var(--surface)",
                borderRadius: "1.25rem",
                boxShadow:
                  "0 25px 60px -15px rgba(0, 0, 0, 0.4), 0 0 1px 1px rgba(99, 102, 241, 0.2)",
                border: "1px solid var(--border)",
                overflow: "hidden",
              }}
            >
              {/* Modal Header */}
              <div
                className="d-flex align-items-center justify-content-between p-4 border-bottom"
                style={{ borderColor: "var(--border)", background: "var(--surface)" }}
              >
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle fw-bold text-white shadow-sm"
                    style={{
                      width: 48,
                      height: 48,
                      background:
                        "linear-gradient(135deg, var(--primary), var(--purple))",
                      fontSize: "1.2rem",
                    }}
                  >
                    {selectedProfileCandidate.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h5 className="fw-black mb-0" style={{ color: "var(--text)" }}>
                      {selectedProfileCandidate.name}
                    </h5>
                    <span className="small text-muted">
                      {selectedProfileCandidate.email}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedProfileCandidate(null)}
                  className="btn btn-sm btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: 36, height: 36 }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-4 overflow-y-auto" style={{ flex: 1 }}>
                {/* Academic & Placement Stats Grid */}
                <div className="row g-3 mb-4">
                  <div className="col-6 col-md-4">
                    <div
                      className="p-3 rounded-3 text-center h-100"
                      style={{
                        background: "var(--bg-secondary)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <small className="text-muted d-block fw-semibold mb-1">
                        College / Institution
                      </small>
                      <span className="fw-bold small d-block text-truncate">
                        {selectedProfileCandidate.college || "NEXORA Campus"}
                      </span>
                    </div>
                  </div>
                  <div className="col-6 col-md-4">
                    <div
                      className="p-3 rounded-3 text-center h-100"
                      style={{
                        background: "var(--bg-secondary)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <small className="text-muted d-block fw-semibold mb-1">
                        Branch
                      </small>
                      <span className="fw-bold small d-block text-truncate">
                        {selectedProfileCandidate.branch || "Engineering"}
                      </span>
                    </div>
                  </div>
                  <div className="col-12 col-md-4">
                    <div
                      className="p-3 rounded-3 text-center h-100"
                      style={{
                        background: "var(--bg-secondary)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <small className="text-muted d-block fw-semibold mb-1">
                        Cumulative CGPA
                      </small>
                      <span className="fw-black text-primary fs-5">
                        {selectedProfileCandidate.cgpa
                          ? Number(selectedProfileCandidate.cgpa).toFixed(2)
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ATS & Readiness Score Card */}
                <div
                  className="p-3 rounded-3 mb-4"
                  style={{
                    background:
                      "linear-gradient(145deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.08) 100%)",
                    border: "1px solid rgba(99, 102, 241, 0.2)",
                  }}
                >
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <div className="d-flex align-items-center gap-2">
                      <Sparkles size={16} className="text-primary" />
                      <span className="fw-bold small" style={{ color: "var(--text)" }}>
                        ATS Resume Match Score
                      </span>
                    </div>
                    {selectedProfileCandidate.isAnalyzed ? (
                      <span
                        className={`badge rounded-pill fw-bold px-2.5 py-1 ${selectedProfileCandidate.atsBadgeClass}`}
                      >
                        {selectedProfileCandidate.atsLabel} Match
                      </span>
                    ) : (
                      <span className="badge rounded-pill bg-secondary-subtle text-muted">
                        Not analyzed
                      </span>
                    )}
                  </div>
                  <div className="progress" style={{ height: "7px" }}>
                    <div
                      className="progress-bar"
                      role="progressbar"
                      style={{
                        width: `${selectedProfileCandidate.atsScore || 0}%`,
                        background:
                          "linear-gradient(90deg, var(--primary), var(--purple))",
                      }}
                      aria-valuenow={selectedProfileCandidate.atsScore || 0}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    />
                  </div>
                </div>

                {/* Skills */}
                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted text-uppercase mb-2">
                    Verified Candidate Skills
                  </label>
                  <div className="d-flex flex-wrap gap-1.5">
                    {selectedProfileCandidate.skills?.length > 0 ? (
                      selectedProfileCandidate.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="badge rounded-pill fw-medium"
                          style={{
                            background: "rgba(99, 102, 241, 0.12)",
                            color: "var(--primary)",
                            fontSize: "0.78rem",
                            padding: "6px 12px",
                          }}
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-muted small">
                        No individual skills listed on profile yet.
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div
                className="p-3 px-4 border-top d-flex align-items-center justify-content-between"
                style={{ borderColor: "var(--border)", background: "var(--surface)" }}
              >
                <button
                  type="button"
                  onClick={() => handleViewResume(selectedProfileCandidate)}
                  disabled={loadingResumeId === selectedProfileCandidate._id}
                  className="btn btn-primary rounded-pill px-4 fw-bold d-inline-flex align-items-center gap-2 shadow-sm"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--primary), var(--purple))",
                    border: "none",
                  }}
                >
                  {loadingResumeId === selectedProfileCandidate._id ? (
                    <span className="spinner-border spinner-border-sm" />
                  ) : (
                    <FileText size={16} />
                  )}
                  <span>View Resume</span>
                </button>

                <div className="d-flex gap-2">
                  <a
                    href={`mailto:${selectedProfileCandidate.email}`}
                    className="btn btn-outline-secondary rounded-pill px-3 fw-semibold d-inline-flex align-items-center gap-1.5"
                  >
                    <Mail size={15} /> Email
                  </a>
                  <button
                    type="button"
                    onClick={() => setSelectedProfileCandidate(null)}
                    className="btn btn-light rounded-pill px-4 fw-semibold border"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Application Details Modal ── */}
      <AnimatePresence>
        {selectedAppCandidate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
            style={{
              background: "rgba(15, 23, 42, 0.65)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              zIndex: 1070,
              inset: 0,
            }}
            onClick={(e) =>
              e.target === e.currentTarget && setSelectedAppCandidate(null)
            }
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bento-card p-0 d-flex flex-column"
              style={{
                width: "100%",
                maxWidth: 620,
                maxHeight: "90vh",
                background: "var(--surface)",
                borderRadius: "1.25rem",
                boxShadow:
                  "0 25px 60px -15px rgba(0, 0, 0, 0.4), 0 0 1px 1px rgba(99, 102, 241, 0.2)",
                border: "1px solid var(--border)",
                overflow: "hidden",
              }}
            >
              {/* Modal Header */}
              <div
                className="d-flex align-items-center justify-content-between p-4 border-bottom"
                style={{ borderColor: "var(--border)", background: "var(--surface)" }}
              >
                <div className="d-flex align-items-center gap-2.5">
                  <div
                    className="d-flex align-items-center justify-content-center rounded-3"
                    style={{
                      width: 40,
                      height: 40,
                      background: "rgba(99, 102, 241, 0.12)",
                      color: "var(--primary)",
                    }}
                  >
                    <Briefcase size={20} />
                  </div>
                  <div>
                    <h5 className="fw-black mb-0" style={{ color: "var(--text)" }}>
                      Application Details
                    </h5>
                    <span className="small text-muted">
                      {selectedAppCandidate.name} • {selectedAppCandidate.appliedRole}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedAppCandidate(null)}
                  className="btn btn-sm btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: 36, height: 36 }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-4 overflow-y-auto" style={{ flex: 1 }}>
                <div className="d-flex align-items-center justify-content-between p-3 rounded-3 mb-3 border" style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
                  <div>
                    <div className="fw-bold" style={{ color: "var(--text)" }}>
                      {selectedAppCandidate.appliedRole}
                    </div>
                    <div className="text-muted small">
                      {selectedAppCandidate.company} • Applied on {selectedAppCandidate.appliedDate}
                    </div>
                  </div>
                  <span className={getStatusBadge(selectedAppCandidate.status)}>
                    {selectedAppCandidate.status}
                  </span>
                </div>

                {/* Status Updater */}
                <div className="mb-4">
                  <label className="form-label small fw-bold text-muted text-uppercase mb-2">
                    Update Application Status
                  </label>
                  <select
                    className="form-select rounded-pill"
                    style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text)" }}
                    value={selectedAppCandidate.status}
                    disabled={updatingStatus}
                    onChange={(e) =>
                      handleUpdateApplicationStatus(
                        selectedAppCandidate.applicationId,
                        e.target.value,
                      )
                    }
                  >
                    {[
                      "Applied",
                      "Screening",
                      "Shortlisted",
                      "Interview",
                      "Offered",
                      "Rejected",
                    ].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* ATS Analysis Details */}
                <div className="p-3 rounded-3 mb-3 border" style={{ background: "rgba(99, 102, 241, 0.04)", borderColor: "rgba(99, 102, 241, 0.18)" }}>
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="fw-bold small" style={{ color: "var(--text)" }}>
                      AI ATS Score
                    </span>
                    {selectedAppCandidate.isAnalyzed ? (
                      <span className={`badge rounded-pill fw-bold ${selectedAppCandidate.atsBadgeClass}`}>
                        {selectedAppCandidate.atsLabel}
                      </span>
                    ) : (
                      <span className="badge rounded-pill bg-secondary-subtle text-muted">
                        Not analyzed
                      </span>
                    )}
                  </div>
                  {selectedAppCandidate.aiAnalysis?.summary && (
                    <p className="text-muted small mb-2 lh-base">
                      {selectedAppCandidate.aiAnalysis.summary}
                    </p>
                  )}
                  {selectedAppCandidate.aiAnalysis?.matchedSkills?.length > 0 && (
                    <div className="mt-2">
                      <small className="text-muted fw-semibold d-block mb-1">
                        Matched Skills:
                      </small>
                      <div className="d-flex flex-wrap gap-1">
                        {selectedAppCandidate.aiAnalysis.matchedSkills.map((s, idx) => (
                          <span
                            key={idx}
                            className="badge bg-success-subtle text-success rounded-pill px-2 py-0.5"
                            style={{ fontSize: "0.72rem" }}
                          >
                            ✓ {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div
                className="p-3 px-4 border-top d-flex align-items-center justify-content-between"
                style={{ borderColor: "var(--border)", background: "var(--surface)" }}
              >
                <button
                  type="button"
                  onClick={() => handleViewResume(selectedAppCandidate)}
                  disabled={loadingResumeId === selectedAppCandidate._id}
                  className="btn btn-primary rounded-pill px-4 fw-bold d-inline-flex align-items-center gap-2 shadow-sm"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--primary), var(--purple))",
                    border: "none",
                  }}
                >
                  {loadingResumeId === selectedAppCandidate._id ? (
                    <span className="spinner-border spinner-border-sm" />
                  ) : (
                    <FileText size={16} />
                  )}
                  <span>View Resume</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedAppCandidate(null)}
                  className="btn btn-light rounded-pill px-4 fw-semibold border"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
