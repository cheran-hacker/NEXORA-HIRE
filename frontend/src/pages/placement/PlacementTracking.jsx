import React, { useState, useEffect } from "react";
import {
  Search,
  Briefcase,
  User,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  Filter,
  RotateCcw,
  Building2,
  FileText,
  Eye,
  Award,
  Code,
  FolderGit2,
  X,
  ExternalLink,
  AlertCircle,
  Download,
  Send,
  Sparkles,
  History,
} from "lucide-react";
import { placementService } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { motion, AnimatePresence } from "framer-motion";

export default function PlacementTracking() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterCompany, setFilterCompany] = useState("All");

  // Dropdown state
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);

  // Modals state
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);

  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleApp, setScheduleApp] = useState(null);
  const [scheduling, setScheduling] = useState(false);
  const [interviewForm, setInterviewForm] = useState({
    title: "Technical Interview Round 1",
    scheduledAt: "",
    interviewer: "Technical Hiring Team",
    notes: "",
  });

  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyStudent, setHistoryStudent] = useState(null);
  const [studentHistoryApps, setStudentHistoryApps] = useState([]);

  const { addToast } = useToast();

  useEffect(() => {
    fetchTracking();
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest(".action-dropdown-container")) {
        setActiveDropdownId(null);
      }
    };
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  const fetchTracking = async () => {
    try {
      setLoading(true);
      const res = await placementService.getTracking();
      setApplications(res.data?.data || []);
    } catch (err) {
      addToast("Failed to load placement tracking data", "error");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      setStatusUpdatingId(id);
      await placementService.updateApplicationStatus(id, { status: newStatus });
      addToast(`Status updated to ${newStatus}`, "success");
      
      // Update local state immediately for seamless responsiveness
      setApplications((prev) =>
        prev.map((app) => (app._id === id ? { ...app, status: newStatus } : app))
      );
      if (selectedApp && selectedApp._id === id) {
        setSelectedApp((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      addToast(err.response?.data?.message || err.message || "Failed to update status", "error");
    } finally {
      setStatusUpdatingId(null);
    }
  };

  // Derive unique company names from real records
  const uniqueCompanies = Array.from(
    new Set(
      applications
        .map((app) => {
          const comp =
            typeof app.jobId?.company === "object"
              ? app.jobId?.company?.name
              : app.jobId?.company;
          return comp ? comp.trim() : null;
        })
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));

  // Combined filters: search, status, and company
  const filteredApps = applications.filter((app) => {
    const candidateName = (app.studentId?.name || "").trim().toLowerCase();
    const candidateEmail = (app.studentId?.email || "").trim().toLowerCase();
    const appCompany = (
      typeof app.jobId?.company === "object"
        ? app.jobId?.company?.name
        : app.jobId?.company || ""
    ).trim().toLowerCase();
    const appRole = (app.jobId?.title || "").trim().toLowerCase();
    const term = search.trim().toLowerCase();

    const matchesSearch =
      !search ||
      candidateName.includes(term) ||
      candidateEmail.includes(term) ||
      appCompany.includes(term) ||
      appRole.includes(term);

    const matchesStatus = filterStatus === "All" || app.status === filterStatus;

    const matchesCompany =
      filterCompany === "All" ||
      appCompany === filterCompany.trim().toLowerCase();

    return matchesSearch && matchesStatus && matchesCompany;
  });

  const hasActiveFilters = Boolean(
    search || filterStatus !== "All" || filterCompany !== "All"
  );

  const resetFilters = () => {
    setSearch("");
    setFilterStatus("All");
    setFilterCompany("All");
  };

  const statuses = [
    "Applied",
    "Screening",
    "Shortlisted",
    "Interview",
    "Offered",
    "Rejected",
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case "Offered":
      case "Selected":
        return (
          <span className="badge bg-success-subtle text-success border border-success px-3 py-2 rounded-pill">
            <CheckCircle size={14} className="me-1" /> {status}
          </span>
        );
      case "Rejected":
        return (
          <span className="badge bg-danger-subtle text-danger border border-danger px-3 py-2 rounded-pill">
            <XCircle size={14} className="me-1" /> Rejected
          </span>
        );
      case "Interview":
      case "Interview Scheduled":
        return (
          <span className="badge bg-primary-subtle text-primary border border-primary px-3 py-2 rounded-pill">
            <Calendar size={14} className="me-1" /> {status}
          </span>
        );
      case "Shortlisted":
        return (
          <span className="badge bg-info-subtle text-info border border-info px-3 py-2 rounded-pill">
            <CheckCircle size={14} className="me-1" /> Shortlisted
          </span>
        );
      case "Screening":
      case "Under Review":
        return (
          <span className="badge bg-warning-subtle text-warning border border-warning px-3 py-2 rounded-pill">
            <Clock size={14} className="me-1" /> {status}
          </span>
        );
      default:
        return (
          <span className="badge bg-secondary-subtle text-secondary border px-3 py-2 rounded-pill">
            <Clock size={14} className="me-1" /> {status}
          </span>
        );
    }
  };

  // Action 1: View Student Profile
  const handleViewProfile = async (student) => {
    if (!student?._id) return;
    setSelectedStudent(student);
    setProfileModalOpen(true);
    setProfileLoading(true);

    try {
      const res = await placementService.getStudentById(student._id);
      if (res.data?.data) {
        setSelectedStudent(res.data.data);
      }
    } catch (err) {
      console.warn("Could not fetch full student details, using basic info:", err);
    } finally {
      setProfileLoading(false);
    }
  };

  // Action 2: View Resume
  const handleViewResume = async (app) => {
    const student = app.studentId;
    const resumeRef = app.resumeUrl || student?.studentProfile?.resumeUrl || student?.resumeUrl;

    if (!resumeRef || resumeRef === "NONE" || !resumeRef.trim()) {
      addToast(`Resume not uploaded yet for ${student?.name || "candidate"}`, "warning");
      return;
    }

    if (resumeRef.startsWith("http://") || resumeRef.startsWith("https://")) {
      window.open(resumeRef, "_blank");
      return;
    }

    try {
      const token = localStorage.getItem("nexora_token");
      const targetId = student?._id || app._id;
      const response = await fetch(`/api/placements/students/${targetId}/resume`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        let msg = "Resume not uploaded yet.";
        try {
          const errData = await response.json();
          msg = errData.message || msg;
        } catch (_) {}
        addToast(msg, "warning");
        return;
      }

      const blob = await response.blob();
      const fileUrl = window.URL.createObjectURL(blob);
      window.open(fileUrl, "_blank");
    } catch (err) {
      addToast(err.message || "Error accessing resume file", "error");
    }
  };

  // Action 3: View Application Details
  const handleViewAppDetails = (app) => {
    setSelectedApp(app);
    setDetailsModalOpen(true);
  };

  // Action 4: Schedule Interview
  const handleOpenScheduleInterview = (app) => {
    setScheduleApp(app);
    setInterviewForm({
      title: "Technical Interview Round 1",
      scheduledAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString().slice(0, 16),
      interviewer: "Lead Engineering Interviewer",
      notes: `Virtual interview session via Google Meet / NEXORA Room.`,
    });
    setScheduleModalOpen(true);
  };

  const handleSubmitSchedule = async (e) => {
    e.preventDefault();
    if (!scheduleApp?._id) return;

    try {
      setScheduling(true);
      const res = await placementService.updateApplicationStatus(scheduleApp._id, {
        status: "Interview",
        interviewRound: {
          title: interviewForm.title,
          scheduledAt: interviewForm.scheduledAt,
          interviewer: interviewForm.interviewer,
          feedback: interviewForm.notes,
        },
      });

      addToast("Interview scheduled and candidate notified!", "success");
      setScheduleModalOpen(false);
      fetchTracking();
    } catch (err) {
      addToast(err.response?.data?.message || err.message || "Failed to schedule interview", "error");
    } finally {
      setScheduling(false);
    }
  };

  // Action 5: View Placement History
  const handleViewHistory = (app) => {
    const student = app.studentId;
    const historyApps = applications.filter((a) => a.studentId?._id === student?._id);
    setHistoryStudent(student);
    setStudentHistoryApps(historyApps);
    setHistoryModalOpen(true);
  };

  return (
    <div className="container-fluid py-4 px-xl-5">
      {/* Page Title */}
      <div className="d-flex align-items-center justify-content-between mb-5 flex-wrap gap-3">
        <div>
          <h2 className="fw-black mb-1 text-gradient-primary">
            Placement Tracking 🛤️
          </h2>
          <p className="fw-medium m-0 text-muted">
            Master pipeline for candidate shortlisting, interviews, and offers.
          </p>
        </div>
      </div>

      {/* Filter Bento Card */}
      <div className="bento-card mb-4 p-4">
        <div className="row g-3 align-items-center">
          <div className="col-12 col-md-5 col-lg-5">
            <div className="position-relative">
              <Search
                className="position-absolute top-50 translate-middle-y ms-3 text-muted"
                size={18}
              />
              <input
                type="text"
                id="placement-search"
                className="form-control ps-5 rounded-pill"
                placeholder="Search by student, company, or role..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  height: "48px",
                  background: "var(--surface-2)",
                  color: "var(--text)",
                  border: "1px solid var(--border)",
                }}
              />
            </div>
          </div>
          <div className="col-12 col-sm-6 col-md-3 col-lg-3">
            <div className="position-relative">
              <select
                id="company-filter"
                className="form-select rounded-pill ps-4"
                value={filterCompany}
                onChange={(e) => setFilterCompany(e.target.value)}
                aria-label="All Companies"
                style={{
                  height: "48px",
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  color: "var(--text)",
                }}
              >
                <option value="All">All Companies</option>
                {uniqueCompanies.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-md-3 col-lg-3">
            <select
              id="status-filter"
              className="form-select rounded-pill ps-4"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              aria-label="Filter by Status"
              style={{
                height: "48px",
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                color: "var(--text)",
              }}
            >
              <option value="All">All Statuses</option>
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          {hasActiveFilters && (
            <div className="col-12 col-lg-1 d-flex justify-content-end">
              <button
                onClick={resetFilters}
                className="btn btn-sm btn-outline-secondary rounded-pill px-3 py-2 w-100 d-inline-flex align-items-center justify-content-center gap-1"
                title="Clear all filters"
                style={{ height: "48px", fontSize: "0.85rem", whiteSpace: "nowrap" }}
              >
                <RotateCcw size={14} /> Clear
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Applications Table Card */}
      <div className="bento-card p-0" style={{ overflow: "visible" }}>
        <div className="table-responsive" style={{ minHeight: "420px", overflow: "visible" }}>
          <table className="table table-hover align-middle mb-0">
            <thead style={{ background: "var(--surface-2)" }}>
              <tr>
                <th className="py-3 px-4 fw-semibold border-bottom">Candidate</th>
                <th className="py-3 px-4 fw-semibold border-bottom">Company & Role</th>
                <th className="py-3 px-4 fw-semibold border-bottom">Applied On</th>
                <th className="py-3 px-4 fw-semibold border-bottom">Current Status</th>
                <th className="py-3 px-4 fw-semibold border-bottom text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-5">
                    <div className="spinner-border text-primary"></div>
                  </td>
                </tr>
              ) : filteredApps.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center py-5 text-muted border border-dashed"
                  >
                    <div className="py-4 text-center">
                      <Briefcase size={36} className="text-muted mb-2 opacity-50 d-inline-block" />
                      <h6 className="fw-bold mb-1">No applications found</h6>
                      <p className="text-muted small mb-3">
                        {hasActiveFilters
                          ? "No placement applications match your selected company, status, or search filters."
                          : "No applications found in pipeline."}
                      </p>
                      {hasActiveFilters && (
                        <button
                          onClick={resetFilters}
                          className="btn btn-sm btn-outline-primary rounded-pill px-4"
                        >
                          Clear Filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredApps.map((app, idx) => {
                  const companyName =
                    typeof app.jobId?.company === "object"
                      ? app.jobId?.company?.name
                      : app.jobId?.company || "Company";

                  return (
                    <motion.tr
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      key={app._id}
                    >
                      {/* Candidate */}
                      <td className="py-3 px-4 border-bottom">
                        <div className="d-flex align-items-center gap-3">
                          <div
                            className="rounded-circle overflow-hidden bg-primary-subtle d-flex align-items-center justify-content-center flex-shrink-0"
                            style={{ width: "40px", height: "40px" }}
                          >
                            {app.studentId?.avatar ? (
                              <img
                                src={app.studentId.avatar}
                                alt="avatar"
                                className="w-100 h-100 object-fit-cover"
                              />
                            ) : (
                              <User size={20} className="text-primary" />
                            )}
                          </div>
                          <div>
                            <h6
                              className="m-0 fw-bold cursor-pointer text-hover-primary"
                              onClick={() => handleViewProfile(app.studentId)}
                              title="Click to view full profile"
                            >
                              {app.studentId?.name || "Unknown Candidate"}
                            </h6>
                            <small className="text-muted">
                              {app.studentId?.email || "N/A"}
                            </small>
                          </div>
                        </div>
                      </td>

                      {/* Company & Role */}
                      <td className="py-3 px-4 border-bottom">
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <Briefcase size={14} className="text-primary" />
                          <span className="fw-bold">{companyName}</span>
                        </div>
                        <small
                          className="text-muted text-truncate d-block"
                          style={{ maxWidth: "240px" }}
                        >
                          {app.jobId?.title || "Unknown Role"}
                        </small>
                      </td>

                      {/* Applied Date */}
                      <td className="py-3 px-4 border-bottom text-muted fw-medium">
                        {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : "N/A"}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 border-bottom">
                        {getStatusBadge(app.status)}
                      </td>

                      {/* Action Dropdown */}
                      <td
                        className="py-3 px-4 text-end border-bottom action-dropdown-container"
                        style={{ position: "relative" }}
                      >
                        <button
                          className="btn btn-sm btn-light border rounded-pill d-inline-flex align-items-center gap-2 px-3 fw-bold"
                          type="button"
                          onClick={() =>
                            setActiveDropdownId(activeDropdownId === app._id ? null : app._id)
                          }
                          style={{ background: "var(--surface-2)" }}
                        >
                          Action <ChevronDown size={14} />
                        </button>

                        {/* Dropdown Menu */}
                        {activeDropdownId === app._id && (
                          <div
                            className="shadow-lg py-2 border text-start"
                            style={{
                              position: "absolute",
                              right: "1rem",
                              top: "100%",
                              zIndex: 1050,
                              background: "var(--surface-1)",
                              minWidth: "230px",
                              borderRadius: "0.85rem",
                              borderColor: "var(--border)",
                            }}
                          >
                            <button
                              className="dropdown-item d-flex align-items-center gap-2 py-2 px-3"
                              onClick={() => {
                                setActiveDropdownId(null);
                                handleViewProfile(app.studentId);
                              }}
                            >
                              <User size={15} className="text-primary" /> View Student Profile
                            </button>

                            <button
                              className="dropdown-item d-flex align-items-center gap-2 py-2 px-3"
                              onClick={() => {
                                setActiveDropdownId(null);
                                handleViewResume(app);
                              }}
                            >
                              <FileText size={15} className="text-primary" /> View Resume
                            </button>

                            <button
                              className="dropdown-item d-flex align-items-center gap-2 py-2 px-3"
                              onClick={() => {
                                setActiveDropdownId(null);
                                handleViewAppDetails(app);
                              }}
                            >
                              <Eye size={15} className="text-primary" /> View Application Details
                            </button>

                            <button
                              className="dropdown-item d-flex align-items-center gap-2 py-2 px-3"
                              onClick={() => {
                                setActiveDropdownId(null);
                                handleOpenScheduleInterview(app);
                              }}
                            >
                              <Calendar size={15} className="text-primary" /> Schedule Interview
                            </button>

                            <button
                              className="dropdown-item d-flex align-items-center gap-2 py-2 px-3"
                              onClick={() => {
                                setActiveDropdownId(null);
                                handleViewHistory(app);
                              }}
                            >
                              <History size={15} className="text-primary" /> Placement History
                            </button>

                            <div
                              className="my-1 border-top"
                              style={{ borderColor: "var(--border)" }}
                            ></div>

                            <div
                              className="px-3 py-1 text-uppercase text-muted fw-bold"
                              style={{ fontSize: "0.65rem", letterSpacing: "0.5px" }}
                            >
                              Update Status
                            </div>

                            {statuses.map((s) => (
                              <button
                                key={s}
                                className={`dropdown-item d-flex align-items-center justify-content-between py-1 px-3 small ${
                                  app.status === s ? "active bg-primary text-white" : ""
                                }`}
                                onClick={() => {
                                  setActiveDropdownId(null);
                                  updateStatus(app._id, s);
                                }}
                                disabled={statusUpdatingId === app._id}
                              >
                                <span>Move to {s}</span>
                                {app.status === s && <CheckCircle size={13} />}
                              </button>
                            ))}
                          </div>
                        )}
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 1. Student Profile Modal */}
      <AnimatePresence>
        {profileModalOpen && selectedStudent && (
          <div
            className="modal show d-block"
            tabIndex="-1"
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.65)",
              backdropFilter: "blur(6px)",
              zIndex: 1060,
            }}
            onClick={() => setProfileModalOpen(false)}
          >
            <div
              className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="modal-content border-0 shadow-lg"
                style={{
                  background: "var(--surface-1)",
                  color: "var(--text)",
                  borderRadius: "1.25rem",
                  overflow: "hidden",
                }}
              >
                <div
                  className="modal-header border-bottom py-3 px-4 d-flex align-items-center justify-content-between"
                  style={{ borderColor: "var(--border)" }}
                >
                  <div className="d-flex align-items-center gap-2">
                    <User className="text-primary" size={20} />
                    <h5 className="modal-title fw-bold m-0">Candidate Profile</h5>
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm btn-icon rounded-circle border-0 text-muted"
                    onClick={() => setProfileModalOpen(false)}
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="modal-body p-4" style={{ maxHeight: "75vh", overflowY: "auto" }}>
                  {profileLoading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary mb-2"></div>
                      <p className="text-muted small">Loading student profile...</p>
                    </div>
                  ) : (
                    <div>
                      {/* Top identity card */}
                      <div
                        className="p-4 rounded-4 mb-4 d-flex flex-wrap align-items-center justify-content-between gap-3"
                        style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
                      >
                        <div className="d-flex align-items-center gap-3">
                          <div
                            className="rounded-circle overflow-hidden d-flex justify-content-center align-items-center border"
                            style={{
                              width: "60px",
                              height: "60px",
                              background: "rgba(var(--primary-rgb), 0.12)",
                              color: "var(--primary)",
                              borderColor: "var(--border)",
                            }}
                          >
                            {selectedStudent.avatar ? (
                              <img
                                src={selectedStudent.avatar}
                                alt="avatar"
                                className="w-100 h-100 object-fit-cover"
                              />
                            ) : (
                              <User size={30} />
                            )}
                          </div>
                          <div>
                            <h4 className="fw-black mb-1">{selectedStudent.name}</h4>
                            <div className="d-flex flex-wrap align-items-center gap-2 text-muted small">
                              <span>{selectedStudent.email}</span>
                              {(selectedStudent.studentProfile?.registerNumber || selectedStudent.regNo) && (
                                <>
                                  <span>•</span>
                                  <span className="badge bg-secondary-subtle text-secondary border">
                                    Reg: {selectedStudent.studentProfile?.registerNumber || selectedStudent.regNo}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleViewResume({ studentId: selectedStudent })}
                          className="btn btn-sm btn-primary rounded-pill px-3 py-2 d-inline-flex align-items-center gap-1 fw-bold shadow-sm"
                        >
                          <FileText size={15} /> View Resume
                        </button>
                      </div>

                      {/* Academic metrics */}
                      <div className="row g-3 mb-4">
                        <div className="col-6 col-md-3">
                          <div
                            className="p-3 rounded-3 text-center h-100"
                            style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
                          >
                            <small className="text-muted d-block fw-semibold mb-1">Department</small>
                            <span className="fw-bold small d-block text-truncate">
                              {selectedStudent.studentProfile?.branch || selectedStudent.department || "N/A"}
                            </span>
                          </div>
                        </div>
                        <div className="col-6 col-md-3">
                          <div
                            className="p-3 rounded-3 text-center h-100"
                            style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
                          >
                            <small className="text-muted d-block fw-semibold mb-1">Degree</small>
                            <span className="fw-bold small d-block">
                              {selectedStudent.course || "B.Tech / B.E."}
                            </span>
                          </div>
                        </div>
                        <div className="col-6 col-md-3">
                          <div
                            className="p-3 rounded-3 text-center h-100"
                            style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
                          >
                            <small className="text-muted d-block fw-semibold mb-1">CGPA</small>
                            <span className="fw-black text-primary fs-5">
                              {selectedStudent.studentProfile?.cgpa ? Number(selectedStudent.studentProfile.cgpa).toFixed(2) : "N/A"}
                            </span>
                          </div>
                        </div>
                        <div className="col-6 col-md-3">
                          <div
                            className="p-3 rounded-3 text-center h-100"
                            style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
                          >
                            <small className="text-muted d-block fw-semibold mb-1">Placement Status</small>
                            {selectedStudent.placementStatus === "Placed" ? (
                              <span className="badge bg-success-subtle text-success border border-success px-2 py-1">
                                <CheckCircle size={12} className="me-1" /> Placed
                              </span>
                            ) : (
                              <span className="badge bg-warning-subtle text-warning border border-warning px-2 py-1">
                                <AlertCircle size={12} className="me-1" /> Unplaced
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Career Target */}
                      {(selectedStudent.studentProfile?.targetCareerRole ||
                        selectedStudent.studentProfile?.careerTarget ||
                        selectedStudent.studentProfile?.readinessScore !== undefined) && (
                        <div
                          className="p-3 rounded-3 mb-4"
                          style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
                        >
                          <div className="row g-3 align-items-center">
                            <div className="col-md-7">
                              <small className="text-muted d-block fw-semibold mb-1">Target Career Role</small>
                              <h6 className="fw-bold mb-0 text-primary">
                                {selectedStudent.studentProfile?.targetCareerRole ||
                                  selectedStudent.studentProfile?.careerTarget ||
                                  "Software Engineer"}
                              </h6>
                            </div>
                            <div className="col-md-5">
                              <div className="d-flex align-items-center justify-content-between mb-1">
                                <small className="text-muted fw-semibold">Readiness Score</small>
                                <span className="fw-bold small text-primary">
                                  {selectedStudent.studentProfile?.readinessScore || 85}%
                                </span>
                              </div>
                              <div className="progress" style={{ height: "6px" }}>
                                <div
                                  className="progress-bar bg-primary"
                                  style={{ width: `${selectedStudent.studentProfile?.readinessScore || 85}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Skills */}
                      {(selectedStudent.studentProfile?.skills || selectedStudent.skills)?.length > 0 && (
                        <div className="mb-4">
                          <h6 className="fw-bold mb-2">Technical Skills</h6>
                          <div className="d-flex flex-wrap gap-2">
                            {(selectedStudent.studentProfile?.skills || selectedStudent.skills).map((skill, i) => (
                              <span
                                key={i}
                                className="badge rounded-pill px-3 py-2 fw-medium border"
                                style={{
                                  background: "var(--surface-2)",
                                  color: "var(--text)",
                                  borderColor: "var(--border)",
                                }}
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Projects */}
                      {selectedStudent.studentProfile?.projects?.length > 0 && (
                        <div className="mb-4">
                          <h6 className="fw-bold mb-3">Key Projects</h6>
                          <div className="row g-3">
                            {selectedStudent.studentProfile.projects.map((proj, i) => (
                              <div key={i} className="col-12 col-md-6">
                                <div
                                  className="p-3 rounded-3 h-100"
                                  style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
                                >
                                  <h6 className="fw-bold mb-1">{proj.name}</h6>
                                  {proj.stack && <small className="text-primary d-block mb-1">{proj.stack}</small>}
                                  {proj.desc && <p className="text-muted small m-0 text-truncate-2">{proj.desc}</p>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div
                  className="modal-footer py-2 px-4 border-top"
                  style={{ borderColor: "var(--border)" }}
                >
                  <button
                    type="button"
                    className="btn btn-secondary rounded-pill px-4"
                    onClick={() => setProfileModalOpen(false)}
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Application Details Modal */}
      <AnimatePresence>
        {detailsModalOpen && selectedApp && (
          <div
            className="modal show d-block"
            tabIndex="-1"
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.65)",
              backdropFilter: "blur(6px)",
              zIndex: 1060,
            }}
            onClick={() => setDetailsModalOpen(false)}
          >
            <div
              className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="modal-content border-0 shadow-lg"
                style={{
                  background: "var(--surface-1)",
                  color: "var(--text)",
                  borderRadius: "1.25rem",
                  overflow: "hidden",
                }}
              >
                <div
                  className="modal-header border-bottom py-3 px-4 d-flex align-items-center justify-content-between"
                  style={{ borderColor: "var(--border)" }}
                >
                  <div className="d-flex align-items-center gap-2">
                    <Briefcase className="text-primary" size={20} />
                    <h5 className="modal-title fw-bold m-0">Application Pipeline Record</h5>
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm btn-icon rounded-circle border-0 text-muted"
                    onClick={() => setDetailsModalOpen(false)}
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="modal-body p-4">
                  {/* Top Header Card */}
                  <div
                    className="p-4 rounded-4 mb-4 d-flex flex-wrap align-items-center justify-content-between gap-3"
                    style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
                  >
                    <div>
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <span className="badge bg-primary text-white px-2 py-1 small">
                          {selectedApp.jobId?.title || "Role Title"}
                        </span>
                        {getStatusBadge(selectedApp.status)}
                      </div>
                      <h4 className="fw-black mb-1">
                        {typeof selectedApp.jobId?.company === "object"
                          ? selectedApp.jobId?.company?.name
                          : selectedApp.jobId?.company || "Company"}
                      </h4>
                      <p className="text-muted small m-0">
                        Candidate: <strong className="text-dark-emphasis">{selectedApp.studentId?.name}</strong> ({selectedApp.studentId?.email})
                      </p>
                    </div>

                    <div className="d-flex gap-2">
                      <button
                        onClick={() => handleViewResume(selectedApp)}
                        className="btn btn-sm btn-outline-primary rounded-pill px-3 py-2 d-inline-flex align-items-center gap-1 fw-bold"
                      >
                        <FileText size={14} /> Resume
                      </button>
                      <button
                        onClick={() => {
                          setDetailsModalOpen(false);
                          handleOpenScheduleInterview(selectedApp);
                        }}
                        className="btn btn-sm btn-primary rounded-pill px-3 py-2 d-inline-flex align-items-center gap-1 fw-bold"
                      >
                        <Calendar size={14} /> Schedule Interview
                      </button>
                    </div>
                  </div>

                  {/* AI Analysis / ATS match */}
                  {selectedApp.aiAnalysis && (
                    <div
                      className="p-4 rounded-4 mb-4"
                      style={{ background: "rgba(var(--primary-rgb), 0.05)", border: "1px solid rgba(var(--primary-rgb), 0.2)" }}
                    >
                      <div className="d-flex align-items-center justify-content-between mb-3">
                        <div className="d-flex align-items-center gap-2">
                          <Sparkles size={18} className="text-primary" />
                          <h6 className="fw-bold mb-0">AI Candidate Assessment</h6>
                        </div>
                        {selectedApp.aiAnalysis.atsScore && (
                          <span className="badge bg-primary fs-6 px-3 py-1 rounded-pill">
                            {selectedApp.aiAnalysis.atsScore}% ATS Match
                          </span>
                        )}
                      </div>

                      {selectedApp.aiAnalysis.summary && (
                        <p className="small text-muted mb-3">{selectedApp.aiAnalysis.summary}</p>
                      )}

                      <div className="row g-3">
                        {selectedApp.aiAnalysis.matchedSkills?.length > 0 && (
                          <div className="col-12 col-md-6">
                            <small className="text-success fw-bold d-block mb-1">Matched Competencies</small>
                            <div className="d-flex flex-wrap gap-1">
                              {selectedApp.aiAnalysis.matchedSkills.map((sk, i) => (
                                <span key={i} className="badge bg-success-subtle text-success border border-success">
                                  {sk}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {selectedApp.aiAnalysis.missingSkills?.length > 0 && (
                          <div className="col-12 col-md-6">
                            <small className="text-danger fw-bold d-block mb-1">Missing / Gap Skills</small>
                            <div className="d-flex flex-wrap gap-1">
                              {selectedApp.aiAnalysis.missingSkills.map((sk, i) => (
                                <span key={i} className="badge bg-danger-subtle text-danger border border-danger">
                                  {sk}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Scheduled Interview Rounds */}
                  <div className="mb-3">
                    <h6 className="fw-bold mb-3">Scheduled Interview Rounds ({selectedApp.interviewRounds?.length || 0})</h6>
                    {!selectedApp.interviewRounds || selectedApp.interviewRounds.length === 0 ? (
                      <p className="text-muted small p-3 rounded-3 text-center" style={{ background: "var(--surface-2)" }}>
                        No interview rounds scheduled yet. Click "Schedule Interview" to assign a round.
                      </p>
                    ) : (
                      <div className="d-flex flex-column gap-2">
                        {selectedApp.interviewRounds.map((round, i) => (
                          <div
                            key={i}
                            className="p-3 rounded-3 d-flex align-items-center justify-content-between"
                            style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
                          >
                            <div>
                              <h6 className="fw-bold mb-1 small">{round.title}</h6>
                              <small className="text-muted d-block">
                                Date: {round.scheduledAt ? new Date(round.scheduledAt).toLocaleString() : "TBD"} • Interviewer: {round.interviewer || "Placement Panel"}
                              </small>
                              {round.feedback && <small className="text-primary mt-1 d-block">{round.feedback}</small>}
                            </div>
                            <span className="badge bg-info-subtle text-info border border-info">
                              {round.result || "Scheduled"}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div
                  className="modal-footer py-2 px-4 border-top"
                  style={{ borderColor: "var(--border)" }}
                >
                  <button
                    type="button"
                    className="btn btn-secondary rounded-pill px-4"
                    onClick={() => setDetailsModalOpen(false)}
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. Schedule Interview Modal */}
      <AnimatePresence>
        {scheduleModalOpen && scheduleApp && (
          <div
            className="modal show d-block"
            tabIndex="-1"
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.65)",
              backdropFilter: "blur(6px)",
              zIndex: 1070,
            }}
            onClick={() => setScheduleModalOpen(false)}
          >
            <div
              className="modal-dialog modal-dialog-centered"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="modal-content border-0 shadow-lg"
                style={{
                  background: "var(--surface-1)",
                  color: "var(--text)",
                  borderRadius: "1.25rem",
                  overflow: "hidden",
                }}
              >
                <div
                  className="modal-header border-bottom py-3 px-4 d-flex align-items-center justify-content-between"
                  style={{ borderColor: "var(--border)" }}
                >
                  <h5 className="modal-title fw-bold m-0">Schedule Candidate Interview</h5>
                  <button
                    type="button"
                    className="btn btn-sm btn-icon rounded-circle border-0 text-muted"
                    onClick={() => setScheduleModalOpen(false)}
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleSubmitSchedule}>
                  <div className="modal-body p-4">
                    <p className="small text-muted mb-3">
                      Scheduling for <strong>{scheduleApp.studentId?.name}</strong> • Role:{" "}
                      <strong>{scheduleApp.jobId?.title}</strong>
                    </p>

                    <div className="mb-3">
                      <label className="form-label small fw-bold">Round Title *</label>
                      <input
                        type="text"
                        className="form-control rounded-pill px-3"
                        placeholder="e.g. Technical Round 1, System Architecture"
                        value={interviewForm.title}
                        onChange={(e) => setInterviewForm({ ...interviewForm, title: e.target.value })}
                        required
                        style={{
                          background: "var(--surface-2)",
                          borderColor: "var(--border)",
                          color: "var(--text)",
                          height: "44px",
                        }}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-bold">Date & Time *</label>
                      <input
                        type="datetime-local"
                        className="form-control rounded-pill px-3"
                        value={interviewForm.scheduledAt}
                        onChange={(e) => setInterviewForm({ ...interviewForm, scheduledAt: e.target.value })}
                        required
                        style={{
                          background: "var(--surface-2)",
                          borderColor: "var(--border)",
                          color: "var(--text)",
                          height: "44px",
                        }}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-bold">Interviewer Name / Panel</label>
                      <input
                        type="text"
                        className="form-control rounded-pill px-3"
                        placeholder="e.g. Technical Interview Team, Dr. Smith"
                        value={interviewForm.interviewer}
                        onChange={(e) => setInterviewForm({ ...interviewForm, interviewer: e.target.value })}
                        style={{
                          background: "var(--surface-2)",
                          borderColor: "var(--border)",
                          color: "var(--text)",
                          height: "44px",
                        }}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-bold">Meeting Instructions / Notes</label>
                      <textarea
                        className="form-control rounded-4 p-3"
                        rows="3"
                        placeholder="Meeting link, prerequisites, or preparation notes..."
                        value={interviewForm.notes}
                        onChange={(e) => setInterviewForm({ ...interviewForm, notes: e.target.value })}
                        style={{
                          background: "var(--surface-2)",
                          borderColor: "var(--border)",
                          color: "var(--text)",
                        }}
                      ></textarea>
                    </div>
                  </div>

                  <div
                    className="modal-footer py-2 px-4 border-top d-flex justify-content-end gap-2"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <button
                      type="button"
                      className="btn btn-secondary rounded-pill px-4"
                      onClick={() => setScheduleModalOpen(false)}
                      disabled={scheduling}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary rounded-pill px-4 fw-bold"
                      disabled={scheduling}
                    >
                      {scheduling ? "Scheduling..." : "Confirm & Move to Interview"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. Placement History Modal */}
      <AnimatePresence>
        {historyModalOpen && historyStudent && (
          <div
            className="modal show d-block"
            tabIndex="-1"
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.65)",
              backdropFilter: "blur(6px)",
              zIndex: 1060,
            }}
            onClick={() => setHistoryModalOpen(false)}
          >
            <div
              className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="modal-content border-0 shadow-lg"
                style={{
                  background: "var(--surface-1)",
                  color: "var(--text)",
                  borderRadius: "1.25rem",
                  overflow: "hidden",
                }}
              >
                <div
                  className="modal-header border-bottom py-3 px-4 d-flex align-items-center justify-content-between"
                  style={{ borderColor: "var(--border)" }}
                >
                  <div className="d-flex align-items-center gap-2">
                    <History className="text-primary" size={20} />
                    <h5 className="modal-title fw-bold m-0">
                      Placement History — {historyStudent.name}
                    </h5>
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm btn-icon rounded-circle border-0 text-muted"
                    onClick={() => setHistoryModalOpen(false)}
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="modal-body p-4">
                  <div className="table-responsive rounded-3 border" style={{ borderColor: "var(--border)" }}>
                    <table className="table table-hover align-middle mb-0">
                      <thead style={{ background: "var(--surface-2)" }}>
                        <tr>
                          <th className="py-2 px-3 small fw-semibold">Company & Role</th>
                          <th className="py-2 px-3 small fw-semibold">Applied Date</th>
                          <th className="py-2 px-3 small fw-semibold text-end">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentHistoryApps.map((app) => (
                          <tr key={app._id}>
                            <td className="py-2 px-3">
                              <span className="fw-semibold small d-block">
                                {typeof app.jobId?.company === "object"
                                  ? app.jobId?.company?.name
                                  : app.jobId?.company || "Company"}
                              </span>
                              <small className="text-muted">{app.jobId?.title || "Role"}</small>
                            </td>
                            <td className="py-2 px-3 small text-muted">
                              {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : "N/A"}
                            </td>
                            <td className="py-2 px-3 text-end">
                              {getStatusBadge(app.status)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div
                  className="modal-footer py-2 px-4 border-top"
                  style={{ borderColor: "var(--border)" }}
                >
                  <button
                    type="button"
                    className="btn btn-secondary rounded-pill px-4"
                    onClick={() => setHistoryModalOpen(false)}
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
