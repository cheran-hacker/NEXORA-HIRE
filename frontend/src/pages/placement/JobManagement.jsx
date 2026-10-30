import React, { useState, useEffect, useMemo } from "react";
import { useToast } from '../../context/ToastContext';
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  Plus,
  Users,
  Search,
  Clock,
  MapPin,
  Building,
  Building2,
  DollarSign,
  MoreVertical,
  X,
  Save,
  CheckCircle2,
  XCircle,
  FileText,
  Calendar,
  GraduationCap,
  User,
  Mail,
  ExternalLink,
  AlertCircle,
  Sparkles,
  ArrowLeft,
  Filter,
  Check,
  ChevronRight,
} from "lucide-react";
import { jobService } from "../../services/api.js";
import { formatSalaryRange, toRupeesStorage, validateSalaryLPA } from "../../utils/salaryHelper.js";
import {
  getAtsScoreData,
  viewCandidateResume,
} from "../../utils/atsScoreHelper.js";

const JobManagement = () => {
  const { addToast } = useToast();
  const [jobs, setJobs] = useState([]);
  const [activeTab, setActiveTab] = useState('MyJobs');
  const [loading, setLoading] = useState(true); 

  // Create Job State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newJob, setNewJob] = useState({
    title: "",
    company: "",
    description: "",
    location: "",
    type: "Full-Time",
    salary: { min: "", max: "", currency: "INR" },
    skills: "",
    requirements: "",
    deadline: "",
    minimumCGPA: "",
    eligibleBatches: "",
    eligibleBranches: ""
  }); 

  // Applications View State
  const [selectedJob, setSelectedJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [loadingResumeId, setLoadingResumeId] = useState(null);
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [selectedCandidateModal, setSelectedCandidateModal] = useState(null);
  const [candidateSearch, setCandidateSearch] = useState("");
  const [candidateStatusFilter, setCandidateStatusFilter] = useState("All");

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const q = candidateSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        app.studentId?.name?.toLowerCase().includes(q) ||
        app.studentId?.email?.toLowerCase().includes(q) ||
        app.studentId?.studentProfile?.branch?.toLowerCase().includes(q) ||
        (app.studentId?.studentProfile?.skills || []).some((s) => s.toLowerCase().includes(q));

      const status = app.status || "Applied";
      let matchesStatus = true;
      if (candidateStatusFilter !== "All") {
        if (candidateStatusFilter === "Interview Scheduled") {
          matchesStatus = status === "Interview" || status === "Interview Scheduled";
        } else if (candidateStatusFilter === "Selected") {
          matchesStatus = status === "Offered" || status === "Selected";
        } else {
          matchesStatus = status.toLowerCase() === candidateStatusFilter.toLowerCase();
        }
      }

      return matchesSearch && matchesStatus;
    });
  }, [applications, candidateSearch, candidateStatusFilter]);

  const pipelineStats = useMemo(() => {
    return {
      total: applications.length,
      applied: applications.filter((a) => (a.status || "Applied") === "Applied").length,
      shortlisted: applications.filter((a) => a.status === "Shortlisted").length,
      interview: applications.filter((a) => a.status === "Interview" || a.status === "Interview Scheduled").length,
      selected: applications.filter((a) => a.status === "Offered" || a.status === "Selected").length,
      rejected: applications.filter((a) => a.status === "Rejected").length,
    };
  }, [applications]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeDropdownId && !event.target.closest(".actions-dropdown-container")) {
        setActiveDropdownId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeDropdownId]);

  useEffect(() => {
    fetchJobs();
  }, [activeTab]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      let res;
      if (activeTab === 'MyJobs') {
        res = await jobService.getMyJobs();
      } else {
        res = await jobService.getAll({ source: 'Alumni', approvalStatus: 'Pending' });
      }
      setJobs(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch recruiter jobs", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    const salaryCheck = validateSalaryLPA(newJob.salary?.min, newJob.salary?.max);
    if (!salaryCheck.isValid) {
      addToast(salaryCheck.error, 'warning');
      return;
    }
    try {
      const payload = {
        ...newJob,
        company: newJob.company.trim(),
        skills: newJob.skills.split(",").map(s => s.trim()).filter(Boolean),
        requirements: newJob.requirements.split(",").map(s => s.trim()).filter(Boolean),
        salary: {
          min: toRupeesStorage(newJob.salary.min),
          max: toRupeesStorage(newJob.salary.max),
          currency: newJob.salary.currency || "INR",
        },
        deadline: newJob.deadline ? new Date(newJob.deadline).toISOString() : undefined,
        minimumCGPA: newJob.minimumCGPA ? Number(newJob.minimumCGPA) : 0,
        eligibleBatches: newJob.eligibleBatches.split(",").map(s => Number(s.trim())).filter(Boolean),
        eligibleBranches: newJob.eligibleBranches.split(",").map(s => s.trim()).filter(Boolean),
      };
      
      await jobService.create(payload);
      setShowCreateModal(false);
      
      // Reset
      setNewJob({
        title: "", company: "", description: "", location: "", type: "Full-Time",
        salary: { min: "", max: "", currency: "INR" }, skills: "", requirements: "",
        deadline: "", minimumCGPA: "", eligibleBatches: "", eligibleBranches: ""
      });
      addToast("Opportunity successfully created", "success");
      fetchJobs();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to create opportunity", 'error');
    }
  };

  const handleDeleteJob = async (id) => {
    if (window.confirm("Are you sure you want to withdraw this opportunity? All applications will be lost.")) {
      try {
        await jobService.delete(id);
        fetchJobs();
      } catch (err) {
        addToast("Failed to delete job", 'error');
      }
    }
  };

  const viewApplications = async (job) => {
    setSelectedJob(job);
    setCandidateSearch("");
    setCandidateStatusFilter("All");
    setAppsLoading(true);
    try {
      const res = await jobService.getApplications(job._id);
      setApplications(res.data.data || []);
    } catch (err) {
      console.error("Failed to load apps", err);
    } finally {
      setAppsLoading(false);
    }
  };

  const updateStatus = async (appId, status) => {
    try {
      await jobService.updateStatus(selectedJob._id, appId, status);
      setApplications((prev) =>
        prev.map((app) => (app._id === appId ? { ...app, status } : app)),
      );
      addToast(`Status updated to ${status}`, "success");
    } catch (err) {
      addToast("Failed to update status", 'error');
    }
  };

  const handleViewResume = async (app) => {
    await viewCandidateResume({
      candidate: app,
      student: app.studentId,
      addToast,
      onStartLoading: () => setLoadingResumeId(app._id),
      onEndLoading: () => setLoadingResumeId(null),
    });
  };

  const handleApproveVacancy = async (id) => {
    try {
      await jobService.approveVacancy(id);
      addToast("Vacancy approved and students notified", 'success');
      fetchJobs();
    } catch (err) {
      addToast("Failed to approve vacancy", 'error');
    }
  };

  return (
    <div className="container-fluid py-4 px-xl-5" style={{ position: 'relative' }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-5">
        <div>
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="fw-black mb-1 d-flex align-items-center gap-3"
            style={{ fontSize: "2.5rem", letterSpacing: "-0.02em", color: "var(--text)" }}
          >
            Placement Dashboard
          </motion.h2>
          <p className="text-muted fw-medium">
            Manage campus recruitment, view applicants, and update status.
          </p>
        </div>
        <button
          className="btn btn-primary rounded-pill px-4 fw-bold d-flex align-items-center gap-2 shadow-sm hover-lift"
          style={{ background: "linear-gradient(135deg, var(--primary), var(--purple))", border: "none" }}
          onClick={() => setShowCreateModal(true)}
        >
          <Plus size={18} /> Post New Opportunity
        </button>
      </div>

      {/* Tabs */}
      {!selectedJob && (
        <ul className="nav nav-pills mb-4 gap-2">
          <li className="nav-item">
            <button 
              className={`nav-link rounded-pill fw-bold px-4 ${activeTab === 'MyJobs' ? 'active' : 'bg-card text-muted border'}`}
              onClick={() => setActiveTab('MyJobs')}
            >
              My Opportunities
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link rounded-pill fw-bold px-4 ${activeTab === 'Pending' ? 'active' : 'bg-card text-muted border'}`}
              onClick={() => setActiveTab('Pending')}
            >
              Pending Alumni Vacancies
            </button>
          </li>
        </ul>
      )}

      {/* Main Content */}
      {!selectedJob ? (
        <div className="row g-4">
          {loading ? (
            <div className="col-12 text-center py-5">
              <div className="spinner-border text-primary" />
            </div>
          ) : jobs.length === 0 ? (
            <div className="col-12 text-center py-5 bento-card w-100">
              <Briefcase size={48} className="text-muted mb-3 mx-auto" />
              <h5 className="fw-bold">No jobs posted yet</h5>
              <p className="text-muted">Click 'Post New Opportunity' to start recruiting.</p>
            </div>
          ) : (
            jobs.map((job) => (
              <motion.div key={job._id} className="col-md-6 col-lg-4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <div className="bento-card p-4 h-100 hover-glow d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h5 className="fw-bold mb-1">{job.title}</h5>
                      <div className="d-flex align-items-center gap-2">
                        <span className={`badge ${job.status === "Closed" ? "bg-danger-subtle text-danger" : "bg-success-subtle text-success"} rounded-pill`}>
                          {job.status}
                        </span>
                        <small className="text-muted fw-bold">{job.company}</small>
                      </div>
                    </div>
                    <button className="btn btn-sm btn-light rounded-circle text-danger hover-scale" onClick={() => handleDeleteJob(job._id)}>
                      <X size={16} />
                    </button>
                  </div>
                  
                  <div className="text-muted small fw-semibold d-flex flex-column gap-2 mb-4 flex-grow-1">
                    <span className="d-flex align-items-center gap-2"><MapPin size={14} /> {job.location}</span>
                    <span className="d-flex align-items-center gap-2"><Briefcase size={14} /> {job.type}</span>
                    {job.salary && (
                      <span className="d-flex align-items-center gap-2"><DollarSign size={14} /> {formatSalaryRange(job.salary)}</span>
                    )}
                    {job.deadline && (
                      <span className="d-flex align-items-center gap-2 text-warning"><Clock size={14} /> Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                    )}
                  </div>
                  
                  <div className="d-flex justify-content-between align-items-center pt-3 border-top" style={{ borderColor: "var(--border)" }}>
                    <div className="d-flex align-items-center gap-2 text-primary fw-bold small">
                      <Users size={16} /> {job.metrics?.applications || 0} Apps
                    </div>
                    {activeTab === 'Pending' ? (
                      <button className="btn btn-sm btn-success rounded-pill fw-bold" onClick={() => handleApproveVacancy(job._id)}>Approve Vacancy</button>
                    ) : (
                      <button className="btn btn-sm btn-outline-primary rounded-pill fw-bold" onClick={() => viewApplications(job)}>Review Apps</button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      ) : (
        /* Applications View */
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bento-card p-0 rounded-4 shadow-sm border"
          style={{
            background: "var(--surface)",
            borderColor: "var(--border)",
            overflow: "visible",
          }}
        >
          {/* ── 1. Premium Blue-Violet Header ── */}
          <div
            className="p-4 p-md-5 border-bottom position-relative"
            style={{
              background:
                "linear-gradient(135deg, rgba(79, 70, 229, 0.09) 0%, rgba(147, 51, 234, 0.09) 45%, rgba(59, 130, 246, 0.05) 100%)",
              borderColor: "rgba(99, 102, 241, 0.16) !important",
              borderTopLeftRadius: "1rem",
              borderTopRightRadius: "1rem",
            }}
          >
            {/* Ambient decorative glow */}
            <div
              className="position-absolute rounded-circle"
              style={{
                top: "-40px",
                right: "8%",
                width: "280px",
                height: "280px",
                background: "radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)",
                filter: "blur(50px)",
                pointerEvents: "none",
              }}
            />

            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 position-relative z-1">
              <div>
                <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                  <span
                    className="badge rounded-pill fw-bold px-3 py-1.5 d-inline-flex align-items-center gap-1.5 shadow-xs"
                    style={{
                      background: "linear-gradient(135deg, var(--primary), var(--purple))",
                      color: "#ffffff",
                      fontSize: "0.75rem",
                      letterSpacing: "0.3px",
                    }}
                  >
                    <Users size={13} /> Job Applicants
                  </span>
                  <span
                    className="badge rounded-pill px-2.5 py-1 text-muted"
                    style={{
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      fontSize: "0.75rem",
                    }}
                  >
                    {applications.length} {applications.length === 1 ? "Candidate" : "Candidates"} Total
                  </span>
                  {selectedJob.status && (
                    <span
                      className={`badge rounded-pill px-2.5 py-1 ${
                        selectedJob.status === "Open" || selectedJob.status === "Active"
                          ? "bg-success-subtle text-success"
                          : "bg-secondary-subtle text-secondary"
                      }`}
                      style={{ fontSize: "0.75rem" }}
                    >
                      ● {selectedJob.status}
                    </span>
                  )}
                </div>

                <h2
                  className="fw-black mb-2"
                  style={{
                    color: "var(--text)",
                    fontSize: "1.75rem",
                    letterSpacing: "-0.5px",
                  }}
                >
                  {selectedJob.title} Candidates
                </h2>

                <div className="d-flex flex-wrap align-items-center gap-3 text-muted small fw-medium">
                  <span className="d-inline-flex align-items-center gap-1.5" style={{ color: "var(--text)" }}>
                    <Building2 size={15} className="text-primary" />
                    <strong className="fw-bold">{selectedJob.company}</strong>
                  </span>
                  <span className="text-muted opacity-50">•</span>
                  <span className="d-inline-flex align-items-center gap-1.5">
                    <MapPin size={15} className="text-muted" />
                    {selectedJob.location || "Remote"}
                  </span>
                  <span className="text-muted opacity-50">•</span>
                  <span className="d-inline-flex align-items-center gap-1.5">
                    <Briefcase size={15} className="text-muted" />
                    {selectedJob.type || "Full-Time"}
                  </span>
                  {selectedJob.salary && (selectedJob.salary.min > 0 || selectedJob.salary.max > 0) && (
                    <>
                      <span className="text-muted opacity-50">•</span>
                      <span className="d-inline-flex align-items-center gap-1 text-success fw-bold">
                        <DollarSign size={15} />
                        {formatSalaryRange(selectedJob.salary)}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Styled Back to Jobs Button */}
              <button
                type="button"
                className="btn btn-white rounded-pill px-4 py-2.5 d-inline-flex align-items-center gap-2 fw-bold shadow-sm hover-lift border text-nowrap"
                style={{
                  background: "var(--surface)",
                  color: "var(--text)",
                  borderColor: "var(--border)",
                  fontSize: "0.88rem",
                  transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
                onClick={() => setSelectedJob(null)}
              >
                <ArrowLeft size={16} />
                <span>Back to Jobs</span>
              </button>
            </div>
          </div>

          {/* ── 2. Candidate Management Control Bar (Pipeline Stats + Filters + Search) ── */}
          <div
            className="p-4 border-bottom"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
            }}
          >
            <div className="d-flex flex-column flex-lg-row align-items-stretch align-items-lg-center justify-content-between gap-3">
              {/* Search Bar */}
              <div className="position-relative flex-grow-1" style={{ maxWidth: 440 }}>
                <Search
                  size={16}
                  className="position-absolute top-50 translate-middle-y text-muted"
                  style={{ left: "14px" }}
                />
                <input
                  type="text"
                  className="form-control rounded-pill ps-5 py-2 shadow-xs"
                  style={{
                    background: "var(--bg-secondary)",
                    borderColor: "var(--border)",
                    color: "var(--text)",
                    fontSize: "0.85rem",
                  }}
                  placeholder="Search by candidate name, email, branch, or skill..."
                  value={candidateSearch}
                  onChange={(e) => setCandidateSearch(e.target.value)}
                />
                {candidateSearch && (
                  <button
                    type="button"
                    className="btn btn-sm btn-link position-absolute top-50 translate-middle-y text-muted p-0"
                    style={{ right: "14px" }}
                    onClick={() => setCandidateSearch("")}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Status Filter Pills */}
              <div className="d-flex flex-wrap gap-1.5 align-items-center">
                {[
                  { id: "All", label: "All", count: pipelineStats.total },
                  { id: "Applied", label: "Applied", count: pipelineStats.applied },
                  { id: "Shortlisted", label: "Shortlisted", count: pipelineStats.shortlisted },
                  { id: "Interview Scheduled", label: "Interview", count: pipelineStats.interview },
                  { id: "Selected", label: "Selected", count: pipelineStats.selected },
                  { id: "Rejected", label: "Rejected", count: pipelineStats.rejected },
                ].map((tab) => {
                  const isActive = candidateStatusFilter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setCandidateStatusFilter(tab.id)}
                      className={`btn btn-sm rounded-pill fw-bold px-3 py-1.5 d-inline-flex align-items-center gap-1.5 transition-all shadow-xs ${
                        isActive
                          ? "btn-primary"
                          : "btn-outline-secondary border-0"
                      }`}
                      style={{
                        fontSize: "0.78rem",
                        background: isActive ? undefined : "var(--bg-secondary)",
                        color: isActive ? "#ffffff" : "var(--text-secondary)",
                      }}
                    >
                      <span>{tab.label}</span>
                      <span
                        className={`badge rounded-pill px-1.5 py-0.5 ${
                          isActive ? "bg-white text-primary" : "bg-secondary-subtle text-muted"
                        }`}
                        style={{ fontSize: "0.68rem" }}
                      >
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── 3. Candidate List Table ── */}
          <div className="p-0 position-relative">
            {appsLoading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status" />
                <p className="small text-muted mt-2 fw-semibold">Loading applicants...</p>
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="text-center py-5 px-4">
                <div
                  className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                  style={{
                    width: "68px",
                    height: "68px",
                    background: "rgba(99, 102, 241, 0.08)",
                    color: "var(--primary)",
                  }}
                >
                  <Users size={32} />
                </div>
                <h5 className="fw-bold mb-1" style={{ color: "var(--text)" }}>
                  {candidateSearch || candidateStatusFilter !== "All"
                    ? "No matching candidates found"
                    : "No applications received yet"}
                </h5>
                <p className="text-muted small mx-auto mb-3" style={{ maxWidth: 440 }}>
                  {candidateSearch || candidateStatusFilter !== "All"
                    ? "Try adjusting your search keywords or clear status filters to view all applicant records."
                    : "When students apply to this opportunity, their profiles, resumes, and ATS match evaluations will appear here."}
                </p>
                {(candidateSearch || candidateStatusFilter !== "All") && (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary rounded-pill px-4 fw-bold"
                    onClick={() => {
                      setCandidateSearch("");
                      setCandidateStatusFilter("All");
                    }}
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div
                className="table-responsive"
                style={{
                  minHeight: "360px",
                  overflowY: "visible",
                }}
              >
                <table
                  className="table table-hover align-middle mb-0"
                  style={{
                    "--bs-table-bg": "transparent",
                    "--bs-table-color": "var(--text)",
                    borderCollapse: "separate",
                    borderSpacing: 0,
                  }}
                >
                  <thead style={{ background: "var(--bg-secondary)" }}>
                    <tr>
                      <th className="px-4 py-3.5 border-0 text-muted fw-bold small text-uppercase" style={{ letterSpacing: "0.5px", fontSize: "0.72rem" }}>
                        Candidate
                      </th>
                      <th className="py-3.5 border-0 text-muted fw-bold small text-uppercase" style={{ letterSpacing: "0.5px", fontSize: "0.72rem" }}>
                        Technical Skills
                      </th>
                      <th className="py-3.5 border-0 text-muted fw-bold small text-uppercase" style={{ letterSpacing: "0.5px", fontSize: "0.72rem" }}>
                        ATS Match Score
                      </th>
                      <th className="py-3.5 border-0 text-muted fw-bold small text-uppercase" style={{ letterSpacing: "0.5px", fontSize: "0.72rem" }}>
                        Resume
                      </th>
                      <th className="py-3.5 border-0 text-muted fw-bold small text-uppercase" style={{ letterSpacing: "0.5px", fontSize: "0.72rem" }}>
                        Applied Date
                      </th>
                      <th className="py-3.5 border-0 text-muted fw-bold small text-uppercase" style={{ letterSpacing: "0.5px", fontSize: "0.72rem" }}>
                        Application Status
                      </th>
                      <th className="px-4 py-3.5 border-0 text-muted fw-bold small text-uppercase text-end" style={{ letterSpacing: "0.5px", fontSize: "0.72rem" }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApplications.map((app) => {
                      const skills = app.studentId?.studentProfile?.skills || [];
                      const ats = getAtsScoreData(app);
                      const isDropdownOpen = activeDropdownId === app._id;

                      return (
                        <tr
                          key={app._id}
                          style={{
                            borderTop: "1px solid var(--border)",
                            transition: "background-color 0.15s ease",
                          }}
                        >
                          {/* 1. Candidate Info */}
                          <td className="px-4 py-3.5">
                            <div className="d-flex align-items-center gap-3">
                              <img
                                src={
                                  app.studentId?.avatar ||
                                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                    app.studentId?.name || "Student"
                                  )}&background=6366f1&color=fff&bold=true`
                                }
                                width={44}
                                height={44}
                                className="rounded-circle shadow-xs border flex-shrink-0"
                                style={{ borderColor: "rgba(99, 102, 241, 0.25)" }}
                                alt={app.studentId?.name || "Candidate Avatar"}
                              />
                              <div>
                                <button
                                  type="button"
                                  className="btn btn-link p-0 text-start text-decoration-none fw-bold d-block"
                                  style={{
                                    color: "var(--text)",
                                    fontSize: "0.95rem",
                                    lineHeight: 1.25,
                                  }}
                                  onClick={() => setSelectedCandidateModal(app)}
                                  title="View full candidate profile"
                                >
                                  {app.studentId?.name || "Candidate"}
                                </button>
                                <span className="small text-muted d-block mb-1" style={{ fontSize: "0.78rem" }}>
                                  {app.studentId?.email || "No email provided"}
                                </span>
                                <div className="d-flex flex-wrap align-items-center gap-1.5">
                                  <span
                                    className="badge rounded-pill bg-light text-secondary border px-2 py-0.5 fw-semibold"
                                    style={{ fontSize: "0.7rem" }}
                                  >
                                    <GraduationCap size={11} className="me-1 text-primary" />
                                    {app.studentId?.studentProfile?.branch || "General"}
                                  </span>
                                  {app.studentId?.studentProfile?.cgpa && (
                                    <span
                                      className="badge rounded-pill bg-primary-subtle text-primary border border-primary-subtle px-2 py-0.5 fw-bold"
                                      style={{ fontSize: "0.7rem" }}
                                    >
                                      ⭐ {app.studentId.studentProfile.cgpa} CGPA
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* 2. Technical Skills */}
                          <td className="py-3.5">
                            {skills.length > 0 ? (
                              <div className="d-flex flex-wrap gap-1" style={{ maxWidth: 220 }}>
                                {skills.slice(0, 3).map((s, idx) => (
                                  <span
                                    key={idx}
                                    className="badge bg-secondary-subtle text-secondary rounded-pill fw-semibold px-2 py-0.5"
                                    style={{ fontSize: "0.72rem" }}
                                  >
                                    {s}
                                  </span>
                                ))}
                                {skills.length > 3 && (
                                  <span
                                    className="badge bg-light text-muted border rounded-pill px-1.5 py-0.5 fw-bold"
                                    style={{ fontSize: "0.68rem", cursor: "help" }}
                                    title={skills.slice(3).join(", ")}
                                  >
                                    +{skills.length - 3}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted small fst-italic" style={{ fontSize: "0.75rem" }}>
                                No skills specified
                              </span>
                            )}
                          </td>

                          {/* 3. ATS Match Score */}
                          <td className="py-3.5">
                            {ats.isAnalyzed ? (
                              <div className="d-flex flex-column gap-1" style={{ maxWidth: 130 }}>
                                <div className="d-flex align-items-center justify-content-between">
                                  <span
                                    className={`badge rounded-pill fw-bold px-2 py-0.5 ${ats.badgeClass}`}
                                    style={{ fontSize: "0.74rem" }}
                                  >
                                    <Sparkles size={11} className="me-1" />
                                    {ats.label} Match
                                  </span>
                                </div>
                                <div className="progress rounded-pill" style={{ height: 4, background: "rgba(0,0,0,0.06)" }}>
                                  <div
                                    className="progress-bar rounded-pill"
                                    style={{
                                      width: `${ats.score || 0}%`,
                                      background:
                                        ats.score >= 75
                                          ? "linear-gradient(90deg, #10b981, #059669)"
                                          : "linear-gradient(90deg, #6366f1, #8b5cf6)",
                                    }}
                                  />
                                </div>
                              </div>
                            ) : (
                              <span
                                className="badge rounded-pill fw-medium px-2.5 py-1"
                                style={{
                                  background: "var(--bg-secondary)",
                                  color: "var(--text-secondary)",
                                  border: "1px solid var(--border)",
                                  fontSize: "0.73rem",
                                }}
                              >
                                Not analyzed
                              </span>
                            )}
                          </td>

                          {/* 4. Resume Availability */}
                          <td className="py-3.5">
                            <button
                              type="button"
                              onClick={() => handleViewResume(app)}
                              disabled={loadingResumeId === app._id}
                              className="btn btn-sm btn-outline-primary rounded-pill d-inline-flex align-items-center gap-1.5 fw-semibold shadow-xs hover-lift"
                              style={{
                                fontSize: "0.78rem",
                                padding: "4px 12px",
                                borderColor: "rgba(99, 102, 241, 0.3)",
                              }}
                              title="Open & Preview Resume"
                            >
                              {loadingResumeId === app._id ? (
                                <span
                                  className="spinner-border spinner-border-sm"
                                  role="status"
                                  aria-hidden="true"
                                  style={{ width: 12, height: 12 }}
                                />
                              ) : (
                                <FileText size={13} className="text-primary" />
                              )}
                              <span>View Resume</span>
                            </button>
                          </td>

                          {/* 5. Applied On Date */}
                          <td className="py-3.5 text-muted small fw-medium text-nowrap" style={{ fontSize: "0.8rem" }}>
                            <div className="d-flex align-items-center gap-1.5">
                              <Calendar size={13} className="opacity-60" />
                              <span>
                                {new Date(app.createdAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                          </td>

                          {/* 6. Status Selector */}
                          <td className="py-3.5">
                            <select
                              className="form-select form-select-sm fw-bold rounded-pill shadow-xs border"
                              style={{
                                fontSize: "0.78rem",
                                padding: "5px 28px 5px 12px",
                                cursor: "pointer",
                                background:
                                  app.status === "Applied"
                                    ? "rgba(99, 102, 241, 0.08)"
                                    : app.status === "Shortlisted"
                                    ? "rgba(139, 92, 246, 0.12)"
                                    : app.status === "Interview" || app.status === "Interview Scheduled"
                                    ? "rgba(245, 158, 11, 0.12)"
                                    : app.status === "Offered" || app.status === "Selected"
                                    ? "rgba(16, 185, 129, 0.12)"
                                    : "rgba(239, 68, 68, 0.08)",
                                color:
                                  app.status === "Applied"
                                    ? "#4f46e5"
                                    : app.status === "Shortlisted"
                                    ? "#7c3aed"
                                    : app.status === "Interview" || app.status === "Interview Scheduled"
                                    ? "#d97706"
                                    : app.status === "Offered" || app.status === "Selected"
                                    ? "#059669"
                                    : "#dc2626",
                                borderColor: "transparent",
                              }}
                              value={app.status}
                              onChange={(e) => updateStatus(app._id, e.target.value)}
                            >
                              <option value="Applied">Applied</option>
                              <option value="Screening">Screening</option>
                              <option value="Shortlisted">Shortlisted</option>
                              <option value="Interview">Interview Scheduled</option>
                              <option value="Offered">Selected</option>
                              <option value="Rejected">Rejected</option>
                            </select>
                          </td>

                          {/* 7. Action Menu with unclipped dropdown */}
                          <td className="px-4 py-3.5 text-end position-relative">
                            <div className="d-inline-flex align-items-center gap-1.5 actions-dropdown-container">
                              {/* Quick Direct Actions */}
                              <button
                                type="button"
                                onClick={() => setSelectedCandidateModal(app)}
                                className="btn btn-sm btn-icon rounded-circle hover-lift d-none d-sm-inline-flex align-items-center justify-content-center"
                                style={{
                                  width: 32,
                                  height: 32,
                                  background: "var(--surface)",
                                  border: "1px solid var(--border)",
                                }}
                                title="View Candidate Profile"
                              >
                                <User size={14} className="text-primary" />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  window.open(
                                    `mailto:${app.studentId?.email || ""}?subject=Regarding Your Application for ${encodeURIComponent(
                                      selectedJob.title
                                    )}&body=Hello ${encodeURIComponent(app.studentId?.name || "Candidate")},%0D%0A`,
                                    "_blank"
                                  )
                                }
                                className="btn btn-sm btn-icon rounded-circle hover-lift d-none d-sm-inline-flex align-items-center justify-content-center"
                                style={{
                                  width: 32,
                                  height: 32,
                                  background: "var(--surface)",
                                  border: "1px solid var(--border)",
                                }}
                                title="Email Candidate"
                              >
                                <Mail size={14} className="text-secondary" />
                              </button>

                              {/* 3-dots Dropdown Toggle */}
                              <div className="dropdown d-inline-block position-relative">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveDropdownId(
                                      isDropdownOpen ? null : app._id
                                    );
                                  }}
                                  className={`btn btn-sm btn-icon rounded-circle hover-lift d-inline-flex align-items-center justify-content-center ${
                                    isDropdownOpen
                                      ? "bg-primary text-white shadow-sm"
                                      : "text-muted"
                                  }`}
                                  style={{
                                    width: 32,
                                    height: 32,
                                    background: isDropdownOpen ? undefined : "var(--surface)",
                                    border: isDropdownOpen ? "none" : "1px solid var(--border)",
                                  }}
                                  title="Candidate actions"
                                  aria-expanded={isDropdownOpen}
                                >
                                  <MoreVertical size={15} />
                                </button>

                                {/* Unclipped, beautifully styled dropdown */}
                                {isDropdownOpen && (
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                    transition={{ duration: 0.15 }}
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
                                      className="dropdown-item d-flex align-items-center gap-2.5 py-2 px-3 small fw-semibold transition-colors"
                                      style={{ color: "#1e293b", fontSize: "0.84rem" }}
                                      onClick={() => {
                                        setActiveDropdownId(null);
                                        setSelectedCandidateModal(app);
                                      }}
                                    >
                                      <User size={15} className="text-primary" />
                                      <span>View Candidate Profile</span>
                                    </button>

                                    <button
                                      type="button"
                                      className="dropdown-item d-flex align-items-center gap-2.5 py-2 px-3 small fw-semibold transition-colors"
                                      style={{ color: "#1e293b", fontSize: "0.84rem" }}
                                      onClick={() => {
                                        setActiveDropdownId(null);
                                        handleViewResume(app);
                                      }}
                                    >
                                      <FileText size={15} className="text-success" />
                                      <span>View Resume</span>
                                    </button>

                                    <div
                                      className="dropdown-divider my-1.5"
                                      style={{ borderColor: "rgba(0,0,0,0.06)" }}
                                    />

                                    <a
                                      href={`mailto:${app.studentId?.email || ""}?subject=Regarding Your Application for ${encodeURIComponent(
                                        selectedJob.title
                                      )}`}
                                      className="dropdown-item d-flex align-items-center gap-2.5 py-2 px-3 small fw-semibold text-decoration-none transition-colors"
                                      style={{ color: "#1e293b", fontSize: "0.84rem" }}
                                      onClick={() => setActiveDropdownId(null)}
                                    >
                                      <Mail size={15} className="text-secondary" />
                                      <span>Email Candidate</span>
                                    </a>
                                  </motion.div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Create Modal overlay */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="modal-backdrop show" style={{ zIndex: 1040 }}></div>
        )}
      </AnimatePresence>
      <div className={`modal fade ${showCreateModal ? "show d-block" : ""}`} tabIndex="-1" style={{ zIndex: 1050 }}>
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="modal-content rounded-4 border-0 shadow-lg" style={{ background: "var(--bg)" }}>
            <div className="modal-header border-bottom-0 pb-0 px-4 pt-4">
              <h4 className="fw-black text-ultra mb-0" style={{ color: "var(--text)" }}>Create New Opportunity</h4>
              <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)}></button>
            </div>
            <div className="modal-body p-4">
              <form onSubmit={handleCreateJob}>
                
                <h6 className="fw-bold text-primary mb-3"><Briefcase size={16} className="me-2" /> Basic Details</h6>
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Job Title *</label>
                    <input type="text" className="form-control" required value={newJob.title} onChange={e => setNewJob({...newJob, title: e.target.value})} placeholder="e.g. Frontend Engineer" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Company Name *</label>
                    <input type="text" className="form-control" required value={newJob.company} onChange={e => setNewJob({...newJob, company: e.target.value})} placeholder="e.g. Google" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Location *</label>
                    <input type="text" className="form-control" required value={newJob.location} onChange={e => setNewJob({...newJob, location: e.target.value})} placeholder="e.g. Remote, Bangalore" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Job Type *</label>
                    <select className="form-select" value={newJob.type} onChange={e => setNewJob({...newJob, type: e.target.value})}>
                      <option>Full-Time</option>
                      <option>Internship</option>
                      <option>Part-Time</option>
                      <option>Contract</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="form-label small fw-bold">Job Description *</label>
                    <textarea className="form-control" rows="3" required value={newJob.description} onChange={e => setNewJob({...newJob, description: e.target.value})} placeholder="Describe the role..." />
                  </div>
                </div>

                <h6 className="fw-bold text-primary mb-3 mt-4"><GraduationCap size={16} className="me-2" /> Eligibility & Requirements</h6>
                <div className="row g-3 mb-4 p-3 bg-secondary-subtle rounded-3">
                  <div className="col-md-4">
                    <label className="form-label small fw-bold">Minimum CGPA</label>
                    <input type="number" step="0.1" className="form-control" value={newJob.minimumCGPA} onChange={e => setNewJob({...newJob, minimumCGPA: e.target.value})} placeholder="e.g. 7.5" />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-bold">Eligible Batches</label>
                    <input type="text" className="form-control" value={newJob.eligibleBatches} onChange={e => setNewJob({...newJob, eligibleBatches: e.target.value})} placeholder="e.g. 2024, 2025" />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-bold">Eligible Branches</label>
                    <input type="text" className="form-control" value={newJob.eligibleBranches} onChange={e => setNewJob({...newJob, eligibleBranches: e.target.value})} placeholder="e.g. CSE, IT" />
                  </div>
                  <div className="col-12 mt-3">
                    <label className="form-label small fw-bold">Skills Required (Comma separated)</label>
                    <input type="text" className="form-control" value={newJob.skills} onChange={e => setNewJob({...newJob, skills: e.target.value})} placeholder="e.g. React, Node.js, MongoDB" />
                  </div>
                  <div className="col-12 mt-3">
                    <label className="form-label small fw-bold">Additional Requirements (Comma separated)</label>
                    <input type="text" className="form-control" value={newJob.requirements} onChange={e => setNewJob({...newJob, requirements: e.target.value})} placeholder="e.g. Strong communication, 6 months internship" />
                  </div>
                </div>

                <h6 className="fw-bold text-primary mb-3 mt-4"><DollarSign size={16} className="me-2" /> Compensation & Timeline</h6>
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label small fw-bold">Minimum Salary (LPA)</label>
                    <input type="number" step="any" min="0" className="form-control" required value={newJob.salary.min} onChange={e => setNewJob({...newJob, salary: {...newJob.salary, min: e.target.value}})} placeholder="e.g. 3.5" />
                    <div className="form-text small text-muted" style={{ fontSize: "0.72rem" }}>Enter annual salary in Lakhs Per Annum (LPA).</div>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-bold">Maximum Salary (LPA)</label>
                    <input type="number" step="any" min="0" className="form-control" required value={newJob.salary.max} onChange={e => setNewJob({...newJob, salary: {...newJob.salary, max: e.target.value}})} placeholder="e.g. 8.0" />
                    <div className="form-text small text-muted" style={{ fontSize: "0.72rem" }}>Enter annual salary in Lakhs Per Annum (LPA).</div>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-bold text-danger">Application Deadline</label>
                    <input type="date" className="form-control border-danger-subtle" required value={newJob.deadline} onChange={e => setNewJob({...newJob, deadline: e.target.value})} />
                  </div>
                </div>

                <div className="mt-5 d-flex gap-3 justify-content-end">
                  <button type="button" className="btn btn-light rounded-pill px-4 fw-bold" onClick={() => setShowCreateModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary rounded-pill px-5 fw-bold d-flex align-items-center gap-2" style={{ background: "linear-gradient(135deg, var(--primary), var(--purple))", border: "none" }}>
                    <Save size={18} /> Publish Opportunity
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Candidate Details Modal ── */}
      <AnimatePresence>
        {selectedCandidateModal && (
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
              e.target === e.currentTarget && setSelectedCandidateModal(null)
            }
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bento-card p-0 d-flex flex-column"
              style={{
                width: "100%",
                maxWidth: 640,
                maxHeight: "90vh",
                background: "var(--surface)",
                borderRadius: "1.25rem",
                boxShadow:
                  "0 25px 60px -15px rgba(0, 0, 0, 0.4), 0 0 1px 1px rgba(99, 102, 241, 0.2)",
                border: "1px solid var(--border)",
                overflow: "hidden",
              }}
            >
              {/* Header */}
              <div
                className="d-flex align-items-center justify-content-between p-4 border-bottom"
                style={{ borderColor: "var(--border)", background: "var(--surface)" }}
              >
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle fw-bold text-white shadow-sm"
                    style={{
                      width: 46,
                      height: 46,
                      background:
                        "linear-gradient(135deg, var(--primary), var(--purple))",
                      fontSize: "1.1rem",
                    }}
                  >
                    {(selectedCandidateModal.studentId?.name || "S")[0].toUpperCase()}
                  </div>
                  <div>
                    <h5 className="fw-black mb-0" style={{ color: "var(--text)" }}>
                      {selectedCandidateModal.studentId?.name || "Candidate Details"}
                    </h5>
                    <span className="small text-muted">
                      {selectedCandidateModal.studentId?.email}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCandidateModal(null)}
                  className="btn btn-sm btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: 36, height: 36 }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Body */}
              <div className="p-4 overflow-y-auto" style={{ flex: 1 }}>
                {/* Academic & Job summary */}
                <div className="row g-3 mb-4">
                  <div className="col-6 col-md-4">
                    <div
                      className="p-3 rounded-3 text-center h-100"
                      style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
                    >
                      <small className="text-muted d-block fw-semibold mb-1">Branch</small>
                      <span className="fw-bold small d-block text-truncate">
                        {selectedCandidateModal.studentId?.studentProfile?.branch || "Engineering"}
                      </span>
                    </div>
                  </div>
                  <div className="col-6 col-md-4">
                    <div
                      className="p-3 rounded-3 text-center h-100"
                      style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
                    >
                      <small className="text-muted d-block fw-semibold mb-1">CGPA</small>
                      <span className="fw-black text-primary fs-5">
                        {selectedCandidateModal.studentId?.studentProfile?.cgpa
                          ? Number(selectedCandidateModal.studentId.studentProfile.cgpa).toFixed(2)
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                  <div className="col-12 col-md-4">
                    <div
                      className="p-3 rounded-3 text-center h-100"
                      style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
                    >
                      <small className="text-muted d-block fw-semibold mb-1">Status</small>
                      <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1">
                        {selectedCandidateModal.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ATS Analysis Card */}
                {(() => {
                  const ats = getAtsScoreData(selectedCandidateModal);
                  return (
                    <div
                      className="p-3 rounded-3 mb-3 border"
                      style={{
                        background:
                          "linear-gradient(145deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.08) 100%)",
                        borderColor: "rgba(99, 102, 241, 0.2)",
                      }}
                    >
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <div className="d-flex align-items-center gap-2">
                          <Sparkles size={16} className="text-primary" />
                          <span className="fw-bold small" style={{ color: "var(--text)" }}>
                            AI ATS Match Score
                          </span>
                        </div>
                        {ats.isAnalyzed ? (
                          <span className={`badge rounded-pill fw-bold ${ats.badgeClass}`}>
                            {ats.label} Match
                          </span>
                        ) : (
                          <span className="badge rounded-pill bg-secondary-subtle text-muted">
                            Not analyzed
                          </span>
                        )}
                      </div>

                      <div className="progress mb-2" style={{ height: "6px" }}>
                        <div
                          className="progress-bar"
                          style={{
                            width: `${ats.score || 0}%`,
                            background:
                              "linear-gradient(90deg, var(--primary), var(--purple))",
                          }}
                        />
                      </div>

                      {selectedCandidateModal.aiAnalysis?.summary && (
                        <p className="text-muted small mb-2 lh-base">
                          {selectedCandidateModal.aiAnalysis.summary}
                        </p>
                      )}

                      {selectedCandidateModal.aiAnalysis?.matchedSkills?.length > 0 && (
                        <div className="mt-2">
                          <small className="text-muted fw-semibold d-block mb-1">
                            Matched Skills:
                          </small>
                          <div className="d-flex flex-wrap gap-1">
                            {selectedCandidateModal.aiAnalysis.matchedSkills.map((s, idx) => (
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
                  );
                })()}

                {/* Candidate Skills */}
                {selectedCandidateModal.studentId?.studentProfile?.skills?.length > 0 && (
                  <div className="mb-2">
                    <label className="form-label small fw-bold text-muted text-uppercase mb-2">
                      Reported Skills
                    </label>
                    <div className="d-flex flex-wrap gap-1.5">
                      {selectedCandidateModal.studentId.studentProfile.skills.map(
                        (skill, idx) => (
                          <span
                            key={idx}
                            className="badge bg-primary-subtle text-primary rounded-pill px-2.5 py-1"
                            style={{ fontSize: "0.75rem" }}
                          >
                            {skill}
                          </span>
                        ),
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div
                className="p-3 px-4 border-top d-flex align-items-center justify-content-between"
                style={{ borderColor: "var(--border)", background: "var(--surface)" }}
              >
                <button
                  type="button"
                  onClick={() => handleViewResume(selectedCandidateModal)}
                  disabled={loadingResumeId === selectedCandidateModal._id}
                  className="btn btn-primary rounded-pill px-4 fw-bold d-inline-flex align-items-center gap-2 shadow-sm"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--primary), var(--purple))",
                    border: "none",
                  }}
                >
                  {loadingResumeId === selectedCandidateModal._id ? (
                    <span className="spinner-border spinner-border-sm" />
                  ) : (
                    <FileText size={16} />
                  )}
                  <span>View Resume</span>
                </button>

                <div className="d-flex gap-2">
                  <a
                    href={`mailto:${selectedCandidateModal.studentId?.email || ""}?subject=Regarding Your Application for ${encodeURIComponent(selectedJob?.title || "")}`}
                    className="btn btn-outline-secondary rounded-pill px-3 fw-semibold d-inline-flex align-items-center gap-1.5"
                  >
                    <Mail size={15} /> Email
                  </a>
                  <button
                    type="button"
                    onClick={() => setSelectedCandidateModal(null)}
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
    </div>
  );
};

export default JobManagement;
