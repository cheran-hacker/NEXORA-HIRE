import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  Plus,
  Edit3,
  Trash2,
  Eye,
  Users,
  X,
  ChevronRight,
  Building2,
  MapPin,
  DollarSign,
  Clock,
  CheckCircle,
  Sparkles,
  BarChart2,
  Target,
  AlertCircle,
  FileText,
  TrendingUp,
  Check,
  GraduationCap,
  Calendar,
  RotateCcw,
  CheckCircle2,
  Sliders,
  Award,
  Layers,
  HelpCircle,
} from "lucide-react";
import { jobService } from "../../services/api.js";
import { formatSalaryRange, toLakhsInput, toRupeesStorage, validateSalaryLPA } from "../../utils/salaryHelper.js";

const JOB_TYPES = ["Full-Time", "Part-Time", "Internship", "Contract"];
const STATUSES = ["Open", "Closed", "Draft"];

const BRANCH_OPTIONS = [
  "Computer Science and Engineering (CSE)",
  "Information Technology (IT)",
  "Artificial Intelligence and Data Science (AI & DS)",
  "Artificial Intelligence and Machine Learning (AI & ML)",
  "Electronics and Communication Engineering (ECE)",
  "Electrical and Electronics Engineering (EEE)",
  "Mechanical Engineering",
  "Civil Engineering",
  "Other",
];

const PASSING_YEARS = [2026, 2027, 2028, 2029];

const CGPA_PRESETS = ["6.0", "6.5", "7.0", "7.5", "8.0", "8.5"];

const COMMON_REQUIREMENTS = [
  "Bachelor's degree in CSE, IT, or related engineering discipline",
  "Minimum 60% or 6.5+ CGPA across all completed semesters",
  "Strong foundation in Data Structures, Algorithms & Problem Solving",
  "Hands-on proficiency in modern web stacks (React, Node.js / Python / Java)",
  "Familiarity with Git version control, CI/CD, and RESTful APIs",
  "Strong written and verbal communication and analytical abilities",
  "Willingness to relocate or work in hybrid/office mode as needed",
];

const defaultForm = {
  title: "",
  company: "",
  location: "",
  type: "Full-Time",
  description: "",
  requirements: "",
  skills: "",
  salaryMin: "",
  salaryMax: "",
  experience: "",
  deadline: "",
  status: "Open",
  eligibleBranches: [],
  eligibleBatches: [],
  minimumCGPA: "",
  allowBacklogs: "No",
  maxBacklogs: 0,
};
const RecruiterJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [pendingJobs, setPendingJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editJob, setEditJob] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [showApplicants, setShowApplicants] = useState(false);

  // Eligibility & Requirements UI states
  const [customReqInput, setCustomReqInput] = useState("");
  const [showRawRequirements, setShowRawRequirements] = useState(false);
  const [cgpaError, setCgpaError] = useState("");
  
  useEffect(() => {
    fetchJobs();
  }, []);
  
  const fetchJobs = async () => {
    try {
      setLoading(true);
      const [myJobsRes, pendingRes] = await Promise.all([
        jobService.getMyJobs(),
        jobService.getAll({ approvalStatus: 'Pending' })
      ]);
      setJobs(myJobsRes.data.data || []);
      setPendingJobs(pendingRes.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (job = null) => {
    if (job) {
      setEditJob(job);
      setForm({
        title: job.title || "",
        company: job.company || "",
        location: job.location || "",
        type: job.type || "Full-Time",
        description: job.description || "",
        requirements: (job.requirements || []).join("\n"),
        skills: (job.skills || []).join(", "),
        salaryMin: toLakhsInput(job.salary?.min),
        salaryMax: toLakhsInput(job.salary?.max),
        experience: job.experience || "",
        deadline: job.deadline?.split("T")[0] || "",
        status: job.status || "Open",
        eligibleBranches: Array.isArray(job.eligibleBranches) ? job.eligibleBranches : [],
        eligibleBatches: Array.isArray(job.eligibleBatches) ? job.eligibleBatches : [],
        minimumCGPA:
          job.minimumCGPA !== undefined && job.minimumCGPA !== null && job.minimumCGPA !== 0
            ? String(job.minimumCGPA)
            : "",
        allowBacklogs: "No",
        maxBacklogs: 0,
      });
    } else {
      setEditJob(null);
      setForm(defaultForm);
    }
    setCustomReqInput("");
    setShowRawRequirements(false);
    setCgpaError("");
    setError("");
    setShowForm(true);
  };

  // Requirements Helper handlers
  const currentRequirementsList = form.requirements
    ? form.requirements
        .split("\n")
        .map((r) => r.trim())
        .filter(Boolean)
    : [];

  const handleAddRequirement = (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (!currentRequirementsList.includes(trimmed)) {
      const updated = [...currentRequirementsList, trimmed];
      setForm((p) => ({ ...p, requirements: updated.join("\n") }));
    }
  };

  const handleRemoveRequirement = (text) => {
    const updated = currentRequirementsList.filter((r) => r !== text);
    setForm((p) => ({ ...p, requirements: updated.join("\n") }));
  };

  const handleAddCustomReq = () => {
    if (customReqInput.trim()) {
      handleAddRequirement(customReqInput);
      setCustomReqInput("");
    }
  };

  // Branch Selection Helpers
  const isAllBranchesSelected =
    BRANCH_OPTIONS.length > 0 &&
    form.eligibleBranches?.length === BRANCH_OPTIONS.length;

  const handleToggleBranch = (branch) => {
    setForm((p) => {
      const list = p.eligibleBranches || [];
      const exists = list.includes(branch);
      return {
        ...p,
        eligibleBranches: exists
          ? list.filter((b) => b !== branch)
          : [...list, branch],
      };
    });
  };

  const handleSelectAllBranches = () => {
    setForm((p) => ({ ...p, eligibleBranches: [...BRANCH_OPTIONS] }));
  };

  const handleClearAllBranches = () => {
    setForm((p) => ({ ...p, eligibleBranches: [] }));
  };

  const handleToggleAllBranchesAction = () => {
    if (isAllBranchesSelected) {
      handleClearAllBranches();
    } else {
      handleSelectAllBranches();
    }
  };

  // Passing Year Helpers
  const handleToggleBatch = (year) => {
    const num = Number(year);
    setForm((p) => {
      const list = p.eligibleBatches || [];
      const exists = list.includes(num);
      return {
        ...p,
        eligibleBatches: exists
          ? list.filter((y) => y !== num)
          : [...list, num].sort(),
      };
    });
  };

  const handleClearBatches = () => {
    setForm((p) => ({ ...p, eligibleBatches: [] }));
  };

  const handleSave = async () => {
    if (!form.title || !form.company || !form.location || !form.description) {
      setError("Title, Company, Location, and Description are required.");
      return;
    }

    if (form.minimumCGPA !== "" && form.minimumCGPA !== null) {
      const parsedCgpa = parseFloat(form.minimumCGPA);
      if (isNaN(parsedCgpa) || parsedCgpa < 0 || parsedCgpa > 10) {
        setCgpaError("Minimum CGPA must be a valid number between 0 and 10.");
        setError("Please correct the invalid CGPA value before saving.");
        return;
      }
    }

    const salaryCheck = validateSalaryLPA(form.salaryMin, form.salaryMax);
    if (!salaryCheck.isValid) {
      setError(salaryCheck.error);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        company: form.company.trim(),
        location: form.location.trim(),
        type: form.type,
        description: form.description.trim(),
        status: form.status,
        requirements: form.requirements
          .split("\n")
          .map((r) => r.trim())
          .filter(Boolean),
        skills: form.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        salary: {
          min: toRupeesStorage(form.salaryMin),
          max: toRupeesStorage(form.salaryMax),
          currency: "INR",
        },
        experience: form.experience,
        deadline: form.deadline || undefined,
        eligibleBranches: form.eligibleBranches || [],
        eligibleBatches: (form.eligibleBatches || [])
          .map(Number)
          .filter((n) => !isNaN(n) && n > 0),
        minimumCGPA: form.minimumCGPA !== "" ? parseFloat(form.minimumCGPA) : 0,
      };
      if (editJob) {
        await jobService.update(editJob._id, payload);
      } else {
        await jobService.create(payload);
      }
      await fetchJobs();
      setShowForm(false);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to save job.");
    } finally {
      setSaving(false);
    }
  };
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this job posting?")) return;
    try {
      await jobService.delete(id);
      fetchJobs();
    } catch (e) {
      console.error(e);
    }
  };
  const handleViewApplicants = async (job) => {
    setSelectedJob(job);
    try {
      const res = await jobService.getApplications(job._id);
      setApplicants(res.data.data || []);
    } catch (e) {
      setApplicants([]);
    }
    setShowApplicants(true);
  };
  const handleUpdateStatus = async (jobId, appId, status) => {
    try {
      await jobService.updateStatus(jobId, appId, status);
      const res = await jobService.getApplications(jobId);
      setApplicants(res.data.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleApprove = async (jobId) => {
    try {
      await jobService.approveVacancy(jobId);
      fetchJobs();
    } catch (e) {
      console.error(e);
      alert('Failed to approve vacancy');
    }
  };

  const statusColor = { Open: "success", Closed: "danger", Draft: "warning" };
  const appStatusColor = {
    Applied: "secondary",
    Screening: "info",
    Shortlisted: "primary",
    Interview: "warning",
    Offered: "success",
    Rejected: "danger",
  };
  return (
    <div
      className="container-fluid py-5 px-xl-5"
      style={{
        background: "var(--bg)",
        minHeight: "100dvh",
        color: "var(--text)",
      }}
    >
      {" "}
      {/* Header */}{" "}
      <div className="d-flex justify-content-between align-items-start mb-5">
        {" "}
        <div>
          {" "}
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="fw-black mb-1 d-flex align-items-center gap-3"
            style={{
              fontSize: "2.2rem",
              letterSpacing: "-0.02em",
              color: "var(--text)",
            }}
          >
            {" "}
            <Briefcase
              size={34}
              className="text-primary"
              strokeWidth={2.5}
            />{" "}
            Job Postings{" "}
          </motion.h2>{" "}
          <p className="text-muted fw-medium mb-0">
            {jobs.length} active positions · manage your recruitment pipeline
          </p>{" "}
        </div>{" "}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => handleOpen()}
          className="btn btn-primary rounded-pill px-4 py-2 fw-bold d-flex align-items-center gap-2"
          style={{
            background:
              "linear-gradient(135deg, var(--primary), var(--purple))",
            border: "none",
          }}
        >
          {" "}
          <Plus size={18} /> Post New Job{" "}
        </motion.button>{" "}
      </div>{" "}
      {/* Stats Row */}{" "}
      <div className="row g-3 mb-5">
        {" "}
        {[
          {
            label: "Total Posts",
            val: jobs.length,
            icon: <FileText size={22} />,
            color: "primary",
          },
          {
            label: "Open",
            val: jobs.filter((j) => j.status === "Open").length,
            icon: <CheckCircle size={22} />,
            color: "success",
          },
          {
            label: "Total Applicants",
            val: jobs.reduce((a, j) => a + (j.metrics?.applications || 0), 0),
            icon: <Users size={22} />,
            color: "info",
          },
          {
            label: "Total Views",
            val: jobs.reduce((a, j) => a + (j.metrics?.views || 0), 0),
            icon: <Eye size={22} />,
            color: "warning",
          },
        ].map(({ label, val, icon, color }) => (
          <div key={label} className="col-sm-6 col-xl-3">
            {" "}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bento-card p-4 d-flex align-items-center gap-3 hover-glow"
            >
              {" "}
              <div
                className={`d-flex align-items-center justify-content-center rounded-3 text-${color}`}
                style={{
                  width: 52,
                  height: 52,
                  background: `rgba(var(--${color === "primary" ? "primary" : color === "success" ? "secondary" : color === "warning" ? "accent" : "info"}-rgb, 0.12))`,
                }}
              >
                {" "}
                {icon}{" "}
              </div>{" "}
              <div>
                {" "}
                <p className="text-muted small fw-semibold mb-0">
                  {label}
                </p>{" "}
                <h3 className="fw-black mb-0" style={{ color: "var(--text)" }}>
                  {val}
                </h3>{" "}
              </div>{" "}
            </motion.div>{" "}
          </div>
        ))}{" "}
      </div>{" "}

      {/* Pending Approvals */}
      {pendingJobs.length > 0 && (
        <div className="mb-5">
          <h4 className="fw-bold mb-4 d-flex align-items-center gap-2">
            <AlertCircle className="text-warning" /> Pending Approvals ({pendingJobs.length})
          </h4>
          <div className="row g-4">
            {pendingJobs.map(job => (
              <div key={job._id} className="col-lg-6">
                <div className="bento-card h-100 p-0 overflow-hidden hover-scale border border-warning">
                  <div className="p-4 border-bottom d-flex justify-content-between align-items-start bg-warning-subtle">
                    <div>
                      <h5 className="fw-bold mb-1">{job.title}</h5>
                      <div className="d-flex align-items-center gap-3 text-muted small fw-medium">
                        <span className="d-flex align-items-center gap-1">
                          <Building2 size={14} /> {job.company}
                        </span>
                        <span className="d-flex align-items-center gap-1">
                          <MapPin size={14} /> {job.location}
                        </span>
                      </div>
                    </div>
                    <span className="badge bg-warning text-dark rounded-pill px-3 py-1 fw-semibold">Pending</span>
                  </div>
                  <div className="p-4 bg-surface">
                    <p className="text-muted small mb-4 text-truncate">{job.description}</p>
                    <div className="d-flex justify-content-end gap-2">
                      <button className="btn btn-sm btn-outline-secondary fw-bold rounded-pill" onClick={() => handleOpen(job)}>
                        Review
                      </button>
                      <button className="btn btn-sm btn-success fw-bold rounded-pill" onClick={() => handleApprove(job._id)}>
                        Approve
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Jobs Grid */}{" "}
      {loading ? (
        <div className="d-flex justify-content-center py-5">
          {" "}
          <div className="spinner-border text-primary" />{" "}
        </div>
      ) : jobs.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bento-card text-center py-5 d-flex flex-column align-items-center"
        >
          {" "}
          <Briefcase
            size={64}
            className="text-muted opacity-25 mb-4"
            strokeWidth={1}
          />{" "}
          <h5 className="fw-bold" style={{ color: "var(--text)" }}>
            No Jobs Posted Yet
          </h5>{" "}
          <p className="text-muted mb-4">
            Post your first job to start finding top talent.
          </p>{" "}
          <button
            onClick={() => handleOpen()}
            className="btn btn-primary rounded-pill px-5 fw-bold"
          >
            {" "}
            <Plus size={16} className="me-2" /> Post First Job{" "}
          </button>{" "}
        </motion.div>
      ) : (
        <div className="row g-4">
          {" "}
          {jobs.map((job, i) => (
            <div key={job._id} className="col-lg-6">
              {" "}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bento-card p-4 h-100 hover-glow"
                style={{
                  borderLeft: `3px solid var(--${statusColor[job.status] === "success" ? "secondary" : statusColor[job.status] === "danger" ? "danger" : "accent"})`,
                }}
              >
                {" "}
                <div className="d-flex justify-content-between align-items-start mb-3">
                  {" "}
                  <div className="flex-grow-1">
                    {" "}
                    <h5
                      className="fw-bold mb-1"
                      style={{ color: "var(--text)" }}
                    >
                      {job.title}
                    </h5>{" "}
                    <p className="text-muted small mb-0 d-flex align-items-center gap-2">
                      {" "}
                      <Building2 size={14} /> {job.company}{" "}
                      <span className="mx-1">·</span> <MapPin size={14} />{" "}
                      {job.location}{" "}
                    </p>{" "}
                  </div>{" "}
                  <span
                    className={`badge bg-${statusColor[job.status]}-subtle text-${statusColor[job.status]} rounded-pill px-3 py-1 fw-semibold`}
                  >
                    {" "}
                    {job.status}{" "}
                  </span>{" "}
                </div>{" "}
                <div className="d-flex gap-2 flex-wrap mb-3">
                  {" "}
                  <span className="badge bg-primary-subtle text-primary rounded-pill">
                    {job.type}
                  </span>{" "}
                  {job.experience && (
                    <span className="badge bg-secondary-subtle text-secondary rounded-pill">
                      <Clock size={10} className="me-1" />
                      {job.experience}
                    </span>
                  )}{" "}
                  {job.salary && (job.salary.min > 0 || job.salary.max > 0) && (
                    <span className="badge bg-success-subtle text-success rounded-pill d-inline-flex align-items-center gap-1">
                      <DollarSign size={10} />
                      {formatSalaryRange(job.salary)}
                    </span>
                  )}{" "}
                </div>{" "}
                <p
                  className="text-muted small mb-3 lh-base"
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {" "}
                  {job.description}{" "}
                </p>{" "}
                <div className="d-flex gap-2 mb-3">
                  {" "}
                  <div
                    className="text-center flex-fill py-2 rounded-3"
                    style={{ background: "var(--bg-secondary)" }}
                  >
                    {" "}
                    <div
                      className="fw-black fs-5"
                      style={{ color: "var(--text)" }}
                    >
                      {job.metrics?.views || 0}
                    </div>{" "}
                    <div className="text-muted" style={{ fontSize: "0.65rem" }}>
                      VIEWS
                    </div>{" "}
                  </div>{" "}
                  <div
                    className="text-center flex-fill py-2 rounded-3"
                    style={{ background: "var(--bg-secondary)" }}
                  >
                    {" "}
                    <div
                      className="fw-black fs-5"
                      style={{ color: "var(--text)" }}
                    >
                      {job.metrics?.applications || 0}
                    </div>{" "}
                    <div className="text-muted" style={{ fontSize: "0.65rem" }}>
                      APPLIED
                    </div>{" "}
                  </div>{" "}
                  <div
                    className="text-center flex-fill py-2 rounded-3"
                    style={{ background: "var(--bg-secondary)" }}
                  >
                    {" "}
                    <div
                      className="fw-black fs-5"
                      style={{ color: "var(--text)" }}
                    >
                      {job.metrics?.shortlisted || 0}
                    </div>{" "}
                    <div className="text-muted" style={{ fontSize: "0.65rem" }}>
                      SHORTLISTED
                    </div>{" "}
                  </div>{" "}
                </div>{" "}
                <div
                  className="d-flex gap-2 mt-auto pt-2 border-top"
                  style={{ borderColor: "var(--border)" }}
                >
                  {" "}
                  <button
                    onClick={() => handleViewApplicants(job)}
                    className="btn btn-sm btn-outline-primary rounded-pill flex-fill fw-semibold d-flex align-items-center justify-content-center gap-1"
                  >
                    {" "}
                    <Users size={14} /> Applicants{" "}
                  </button>{" "}
                  <button
                    onClick={() => handleOpen(job)}
                    className="btn btn-sm btn-outline-secondary rounded-pill px-3 d-flex align-items-center gap-1"
                  >
                    {" "}
                    <Edit3 size={14} /> Edit{" "}
                  </button>{" "}
                  <button
                    onClick={() => handleDelete(job._id)}
                    className="btn btn-sm btn-outline-danger rounded-pill px-3 d-flex align-items-center gap-1"
                  >
                    {" "}
                    <Trash2 size={14} />{" "}
                  </button>{" "}
                </div>{" "}
              </motion.div>{" "}
            </div>
          ))}{" "}
        </div>
      )}{" "}
      {/* ── Post/Edit Job Modal ── */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
            style={{
              background: "rgba(15, 23, 42, 0.65)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              zIndex: 1050,
              inset: 0,
            }}
            onClick={(e) => e.target === e.currentTarget && setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 25, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 25, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bento-card p-0 d-flex flex-column"
              style={{
                width: "100%",
                maxWidth: 840,
                maxHeight: "90vh",
                background: "var(--surface)",
                borderRadius: "1.25rem",
                boxShadow:
                  "0 25px 60px -15px rgba(0, 0, 0, 0.4), 0 0 1px 1px rgba(99, 102, 241, 0.2)",
                border: "1px solid var(--border)",
                overflow: "hidden",
              }}
            >
              {/* Sticky Modal Header */}
              <div
                className="d-flex align-items-center justify-content-between p-4 border-bottom"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--surface)",
                  flexShrink: 0,
                }}
              >
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="d-flex align-items-center justify-content-center rounded-3"
                    style={{
                      width: 44,
                      height: 44,
                      background:
                        "linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.2))",
                      color: "var(--primary)",
                    }}
                  >
                    <Sparkles size={22} />
                  </div>
                  <div>
                    <h4 className="fw-black mb-0" style={{ color: "var(--text)" }}>
                      {editJob ? "Edit Job Posting" : "Post New Job"}
                    </h4>
                    <span className="small text-muted">
                      {editJob
                        ? `Updating details for ${editJob.title}`
                        : "Create an active campus placement opening"}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn btn-sm btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: 36, height: 36 }}
                  title="Close modal"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Scrollable Modal Body */}
              <div
                className="p-4 p-md-5"
                style={{
                  overflowY: "auto",
                  flex: 1,
                }}
              >
                {error && (
                  <div
                    className="alert alert-danger d-flex align-items-center gap-2 mb-4 rounded-3"
                    role="alert"
                  >
                    <AlertCircle size={16} /> {error}
                  </div>
                )}

                <div className="row g-3">
                  <div className="col-md-6">
                    <label
                      className="form-label fw-semibold small"
                      style={{ color: "var(--text)" }}
                    >
                      Job Title *
                    </label>
                    <input
                      className="form-control"
                      style={{
                        background: "var(--bg-secondary)",
                        borderColor: "var(--border)",
                        color: "var(--text)",
                      }}
                      placeholder="e.g. Senior React Developer"
                      value={form.title}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, title: e.target.value }))
                      }
                    />
                  </div>

                  <div className="col-md-6">
                    <label
                      className="form-label fw-semibold small"
                      style={{ color: "var(--text)" }}
                    >
                      Company *
                    </label>
                    <input
                      className="form-control"
                      style={{
                        background: "var(--bg-secondary)",
                        borderColor: "var(--border)",
                        color: "var(--text)",
                      }}
                      placeholder="Company name"
                      value={form.company}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, company: e.target.value }))
                      }
                    />
                  </div>

                  <div className="col-md-6">
                    <label
                      className="form-label fw-semibold small"
                      style={{ color: "var(--text)" }}
                    >
                      Location *
                    </label>
                    <input
                      className="form-control"
                      style={{
                        background: "var(--bg-secondary)",
                        borderColor: "var(--border)",
                        color: "var(--text)",
                      }}
                      placeholder="e.g. Bangalore, Remote"
                      value={form.location}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, location: e.target.value }))
                      }
                    />
                  </div>

                  <div className="col-md-3">
                    <label
                      className="form-label fw-semibold small"
                      style={{ color: "var(--text)" }}
                    >
                      Job Type
                    </label>
                    <select
                      className="form-select"
                      style={{
                        background: "var(--bg-secondary)",
                        borderColor: "var(--border)",
                        color: "var(--text)",
                      }}
                      value={form.type}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, type: e.target.value }))
                      }
                    >
                      {JOB_TYPES.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-3">
                    <label
                      className="form-label fw-semibold small"
                      style={{ color: "var(--text)" }}
                    >
                      Status
                    </label>
                    <select
                      className="form-select"
                      style={{
                        background: "var(--bg-secondary)",
                        borderColor: "var(--border)",
                        color: "var(--text)",
                      }}
                      value={form.status}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, status: e.target.value }))
                      }
                    >
                      {STATUSES.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-12">
                    <label
                      className="form-label fw-semibold small"
                      style={{ color: "var(--text)" }}
                    >
                      Job Description *
                    </label>
                    <textarea
                      className="form-control"
                      rows={4}
                      style={{
                        background: "var(--bg-secondary)",
                        borderColor: "var(--border)",
                        color: "var(--text)",
                      }}
                      placeholder="Describe the role, responsibilities, and what you're looking for..."
                      value={form.description}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, description: e.target.value }))
                      }
                    />
                  </div>

                  {/* ── Enhanced Requirements Section ── */}
                  <div className="col-12">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <label
                        className="form-label fw-semibold small mb-0 d-flex align-items-center gap-2"
                        style={{ color: "var(--text)" }}
                      >
                        <Layers size={15} className="text-primary" />
                        Job Requirements
                        {currentRequirementsList.length > 0 && (
                          <span
                            className="badge rounded-pill fw-semibold"
                            style={{
                              background: "rgba(99, 102, 241, 0.15)",
                              color: "var(--primary)",
                              fontSize: "0.72rem",
                            }}
                          >
                            {currentRequirementsList.length} defined
                          </span>
                        )}
                      </label>

                      <div className="d-flex align-items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowRawRequirements((prev) => !prev)}
                          className="btn btn-sm btn-link p-0 text-decoration-none fw-medium"
                          style={{ fontSize: "0.78rem", color: "var(--primary)" }}
                        >
                          {showRawRequirements ? "Switch to Interactive Cards" : "Direct Text Edit"}
                        </button>
                        {currentRequirementsList.length > 0 && (
                          <>
                            <span className="text-muted" style={{ fontSize: "0.75rem" }}>•</span>
                            <button
                              type="button"
                              onClick={() => setForm((p) => ({ ...p, requirements: "" }))}
                              className="btn btn-sm btn-link p-0 text-danger text-decoration-none"
                              style={{ fontSize: "0.78rem" }}
                            >
                              Clear All
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {showRawRequirements ? (
                      <div>
                        <textarea
                          className="form-control"
                          rows={4}
                          style={{
                            background: "var(--bg-secondary)",
                            borderColor: "var(--border)",
                            color: "var(--text)",
                            fontSize: "0.88rem",
                            fontFamily: "inherit",
                          }}
                          placeholder="Bachelor's degree in CS&#10;3+ years React experience&#10;Strong problem-solving skills"
                          value={form.requirements}
                          onChange={(e) =>
                            setForm((p) => ({ ...p, requirements: e.target.value }))
                          }
                        />
                        <small className="text-muted d-block mt-1" style={{ fontSize: "0.75rem" }}>
                          Enter one requirement per line. Interactive cards update automatically.
                        </small>
                      </div>
                    ) : (
                      <div
                        className="p-3 rounded-3"
                        style={{
                          background: "var(--bg-secondary)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        {/* Active requirements cards */}
                        {currentRequirementsList.length === 0 ? (
                          <div className="text-center py-3 text-muted small">
                            No requirements added yet. Click common suggestions below or type a custom requirement.
                          </div>
                        ) : (
                          <div className="d-flex flex-column gap-2 mb-3">
                            {currentRequirementsList.map((req, idx) => (
                              <div
                                key={idx}
                                className="d-flex align-items-start justify-content-between p-2 px-3 rounded-2"
                                style={{
                                  background: "var(--surface)",
                                  border: "1px solid rgba(99, 102, 241, 0.2)",
                                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                                }}
                              >
                                <div className="d-flex align-items-start gap-2 me-2">
                                  <span
                                    className="badge rounded-circle d-flex align-items-center justify-content-center mt-0.5"
                                    style={{
                                      width: 18,
                                      height: 18,
                                      fontSize: "0.65rem",
                                      background: "rgba(99, 102, 241, 0.15)",
                                      color: "var(--primary)",
                                    }}
                                  >
                                    {idx + 1}
                                  </span>
                                  <span style={{ fontSize: "0.85rem", color: "var(--text)", lineHeight: 1.45 }}>
                                    {req}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveRequirement(req)}
                                  className="btn btn-sm btn-link text-muted p-0 ms-2 text-decoration-none"
                                  title="Remove requirement"
                                  style={{ lineHeight: 1 }}
                                >
                                  <X size={15} className="text-danger" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Custom requirement input */}
                        <div className="d-flex gap-2 mb-3">
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            style={{
                              background: "var(--surface)",
                              borderColor: "var(--border)",
                              color: "var(--text)",
                              fontSize: "0.85rem",
                            }}
                            placeholder="Type custom requirement and press Enter..."
                            value={customReqInput}
                            onChange={(e) => setCustomReqInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddCustomReq();
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={handleAddCustomReq}
                            disabled={!customReqInput.trim()}
                            className="btn btn-sm btn-primary rounded-pill px-3 fw-semibold d-flex align-items-center gap-1"
                            style={{
                              background: "linear-gradient(135deg, var(--primary), var(--purple))",
                              border: "none",
                              whiteSpace: "nowrap",
                            }}
                          >
                            <Plus size={14} /> Add
                          </button>
                        </div>

                        {/* Quick suggestions */}
                        <div>
                          <div className="d-flex align-items-center gap-1 mb-2 text-muted small" style={{ fontSize: "0.75rem" }}>
                            <Sparkles size={12} className="text-primary" />
                            <span>Suggested Requirements (click chip to toggle):</span>
                          </div>
                          <div className="d-flex flex-wrap gap-1.5">
                            {COMMON_REQUIREMENTS.map((sug, i) => {
                              const isSelected = currentRequirementsList.includes(sug);
                              return (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() =>
                                    isSelected
                                      ? handleRemoveRequirement(sug)
                                      : handleAddRequirement(sug)
                                  }
                                  className="btn btn-sm rounded-pill text-start d-flex align-items-center gap-1.5"
                                  style={{
                                    fontSize: "0.75rem",
                                    padding: "4px 10px",
                                    background: isSelected
                                      ? "linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.2))"
                                      : "var(--surface)",
                                    border: isSelected
                                      ? "1px solid var(--primary)"
                                      : "1px dashed var(--border)",
                                    color: isSelected ? "var(--primary)" : "var(--text-secondary)",
                                    transition: "all 0.15s ease",
                                  }}
                                >
                                  {isSelected ? (
                                    <Check size={12} className="text-primary flex-shrink-0" />
                                  ) : (
                                    <Plus size={12} className="text-muted flex-shrink-0" />
                                  )}
                                  <span className="text-truncate" style={{ maxWidth: 300 }}>
                                    {sug}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ── NEW: Eligibility Criteria Section ── */}
                  <div className="col-12">
                    <div
                      className="p-4 rounded-4"
                      style={{
                        background:
                          "linear-gradient(145deg, rgba(99, 102, 241, 0.04) 0%, rgba(139, 92, 246, 0.07) 100%)",
                        border: "1px solid rgba(99, 102, 241, 0.22)",
                        boxShadow: "0 4px 20px rgba(99, 102, 241, 0.04)",
                      }}
                    >
                      {/* Section Header */}
                      <div
                        className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom"
                        style={{ borderColor: "rgba(99, 102, 241, 0.15)" }}
                      >
                        <div className="d-flex align-items-center gap-2.5">
                          <div
                            className="d-flex align-items-center justify-content-center rounded-3"
                            style={{
                              width: 38,
                              height: 38,
                              background:
                                "linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.22))",
                              color: "var(--primary)",
                            }}
                          >
                            <GraduationCap size={20} />
                          </div>
                          <div>
                            <h6
                              className="fw-black mb-0 d-flex align-items-center gap-2"
                              style={{ color: "var(--text)", fontSize: "1rem" }}
                            >
                              Eligibility Criteria
                              <span
                                className="badge rounded-pill fw-medium"
                                style={{
                                  background: "rgba(99, 102, 241, 0.14)",
                                  color: "var(--primary)",
                                  fontSize: "0.68rem",
                                }}
                              >
                                Placement Filters
                              </span>
                            </h6>
                            <div className="small text-muted" style={{ fontSize: "0.77rem" }}>
                              Specify branch, batch, academic CGPA cutoff, and backlog criteria
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 1. Eligible Branches */}
                      <div className="mb-4">
                        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2.5">
                          <label
                            className="form-label fw-semibold small mb-0 d-flex align-items-center gap-2"
                            style={{ color: "var(--text)" }}
                          >
                            <span>Eligible Branches</span>
                            <span
                              className="badge rounded-pill fw-bold"
                              style={{
                                background:
                                  form.eligibleBranches?.length > 0
                                    ? "rgba(99, 102, 241, 0.16)"
                                    : "var(--bg-secondary)",
                                color:
                                  form.eligibleBranches?.length > 0
                                    ? "var(--primary)"
                                    : "var(--text-secondary)",
                                fontSize: "0.72rem",
                              }}
                            >
                              {form.eligibleBranches?.length || 0} of {BRANCH_OPTIONS.length} selected
                            </span>
                          </label>

                          <div className="d-flex align-items-center gap-2">
                            <button
                              type="button"
                              onClick={handleSelectAllBranches}
                              className="btn btn-sm btn-link p-0 text-decoration-none fw-semibold"
                              style={{ fontSize: "0.78rem", color: "var(--primary)" }}
                            >
                              Select All
                            </button>
                            <span className="text-muted" style={{ fontSize: "0.72rem" }}>•</span>
                            <button
                              type="button"
                              onClick={handleClearAllBranches}
                              className="btn btn-sm btn-link p-0 text-muted text-decoration-none"
                              style={{ fontSize: "0.78rem" }}
                            >
                              Clear All
                            </button>
                          </div>
                        </div>

                        {/* Branch Chips */}
                        <div className="d-flex flex-wrap gap-2">
                          {/* Independent All Branches Chip */}
                          <button
                            type="button"
                            onClick={handleToggleAllBranchesAction}
                            className="btn btn-sm rounded-pill d-flex align-items-center gap-1.5 fw-semibold"
                            style={{
                              fontSize: "0.8rem",
                              padding: "6px 14px",
                              background: isAllBranchesSelected
                                ? "linear-gradient(135deg, var(--primary), var(--purple))"
                                : "var(--surface)",
                              borderColor: isAllBranchesSelected
                                ? "var(--primary)"
                                : "rgba(99, 102, 241, 0.35)",
                              color: isAllBranchesSelected ? "#ffffff" : "var(--primary)",
                              boxShadow: isAllBranchesSelected
                                ? "0 2px 8px rgba(99, 102, 241, 0.35)"
                                : "none",
                              transition: "all 0.15s ease",
                            }}
                          >
                            {isAllBranchesSelected ? (
                              <CheckCircle2 size={14} />
                            ) : (
                              <Sliders size={13} />
                            )}
                            <span>All Branches</span>
                          </button>

                          {BRANCH_OPTIONS.map((branch) => {
                            const isSelected = form.eligibleBranches?.includes(branch);
                            return (
                              <button
                                key={branch}
                                type="button"
                                onClick={() => handleToggleBranch(branch)}
                                className="btn btn-sm rounded-pill d-flex align-items-center gap-1.5"
                                style={{
                                  fontSize: "0.8rem",
                                  padding: "6px 13px",
                                  background: isSelected
                                    ? "linear-gradient(135deg, rgba(99, 102, 241, 0.16), rgba(139, 92, 246, 0.22))"
                                    : "var(--surface)",
                                  border: isSelected
                                    ? "1px solid var(--primary)"
                                    : "1px solid var(--border)",
                                  color: isSelected ? "var(--primary)" : "var(--text-secondary)",
                                  fontWeight: isSelected ? "600" : "500",
                                  boxShadow: isSelected
                                    ? "0 2px 8px rgba(99, 102, 241, 0.18)"
                                    : "none",
                                  transition: "all 0.15s ease",
                                }}
                              >
                                {isSelected ? (
                                  <Check size={13} className="text-primary flex-shrink-0" />
                                ) : (
                                  <span
                                    className="rounded-circle flex-shrink-0"
                                    style={{
                                      width: 6,
                                      height: 6,
                                      background: "var(--border)",
                                    }}
                                  />
                                )}
                                <span>{branch}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* 2. Passing Year & 3. Minimum CGPA (Row) */}
                      <div className="row g-3">
                        {/* Passing Year */}
                        <div className="col-md-6">
                          <div className="d-flex align-items-center justify-content-between mb-2">
                            <label
                              className="form-label fw-semibold small mb-0 d-flex align-items-center gap-1.5"
                              style={{ color: "var(--text)" }}
                            >
                              <Calendar size={14} className="text-primary" />
                              <span>Eligible Passing Year</span>
                              {form.eligibleBatches?.length > 0 && (
                                <span
                                  className="badge rounded-pill"
                                  style={{
                                    background: "rgba(99, 102, 241, 0.15)",
                                    color: "var(--primary)",
                                    fontSize: "0.7rem",
                                  }}
                                >
                                  {form.eligibleBatches.length} selected
                                </span>
                              )}
                            </label>

                            {form.eligibleBatches?.length > 0 && (
                              <button
                                type="button"
                                onClick={handleClearBatches}
                                className="btn btn-sm btn-link p-0 text-muted text-decoration-none"
                                style={{ fontSize: "0.75rem" }}
                              >
                                Clear
                              </button>
                            )}
                          </div>

                          <div className="d-flex flex-wrap gap-2">
                            {PASSING_YEARS.map((year) => {
                              const isSelected = form.eligibleBatches?.includes(year);
                              return (
                                <button
                                  key={year}
                                  type="button"
                                  onClick={() => handleToggleBatch(year)}
                                  className="btn btn-sm rounded-pill d-flex align-items-center gap-1.5"
                                  style={{
                                    fontSize: "0.82rem",
                                    padding: "6px 14px",
                                    background: isSelected
                                      ? "linear-gradient(135deg, rgba(99, 102, 241, 0.16), rgba(139, 92, 246, 0.22))"
                                      : "var(--surface)",
                                    border: isSelected
                                      ? "1px solid var(--primary)"
                                      : "1px solid var(--border)",
                                    color: isSelected ? "var(--primary)" : "var(--text)",
                                    fontWeight: isSelected ? "600" : "500",
                                    boxShadow: isSelected
                                      ? "0 2px 8px rgba(99, 102, 241, 0.18)"
                                      : "none",
                                    transition: "all 0.15s ease",
                                  }}
                                >
                                  {isSelected ? (
                                    <Check size={13} className="text-primary" />
                                  ) : (
                                    <Plus size={12} className="text-muted" />
                                  )}
                                  <span>{year} Batch</span>
                                </button>
                              );
                            })}
                          </div>
                          <div
                            className="form-text small mt-1.5"
                            style={{ color: "var(--text-secondary)", fontSize: "0.75rem" }}
                          >
                            Select batches eligible to apply.
                          </div>
                        </div>

                        {/* Minimum CGPA */}
                        <div className="col-md-6">
                          <div className="d-flex align-items-center justify-content-between mb-2">
                            <label
                              className="form-label fw-semibold small mb-0 d-flex align-items-center gap-1.5"
                              style={{ color: "var(--text)" }}
                            >
                              <Award size={14} className="text-primary" />
                              <span>Minimum CGPA (0 to 10 scale)</span>
                            </label>

                            {form.minimumCGPA !== "" && (
                              <button
                                type="button"
                                onClick={() => {
                                  setForm((p) => ({ ...p, minimumCGPA: "" }));
                                  setCgpaError("");
                                }}
                                className="btn btn-sm btn-link p-0 text-muted text-decoration-none"
                                style={{ fontSize: "0.75rem" }}
                              >
                                Clear
                              </button>
                            )}
                          </div>

                          <div>
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              max="10"
                              className={`form-control ${cgpaError ? "is-invalid border-danger" : ""}`}
                              style={{
                                background: "var(--surface)",
                                borderColor: cgpaError ? "#ef4444" : "var(--border)",
                                color: "var(--text)",
                                fontSize: "0.88rem",
                              }}
                              placeholder="e.g. 6.5, 7.0, 7.5"
                              value={form.minimumCGPA}
                              onChange={(e) => {
                                const val = e.target.value;
                                setForm((p) => ({ ...p, minimumCGPA: val }));
                                if (val !== "" && (isNaN(val) || Number(val) < 0 || Number(val) > 10)) {
                                  setCgpaError("Minimum CGPA must be a valid number between 0 and 10.");
                                } else {
                                  setCgpaError("");
                                }
                              }}
                            />
                          </div>

                          {cgpaError ? (
                            <div
                              className="text-danger small mt-1 fw-medium d-flex align-items-center gap-1"
                              style={{ fontSize: "0.76rem" }}
                            >
                              <AlertCircle size={13} /> {cgpaError}
                            </div>
                          ) : (
                            <div
                              className="form-text small mt-1"
                              style={{ color: "var(--text-secondary)", fontSize: "0.75rem" }}
                            >
                              Minimum CGPA required out of 10.
                            </div>
                          )}

                          {/* Presets */}
                          <div className="d-flex flex-wrap gap-1 mt-2 align-items-center">
                            <span className="text-muted" style={{ fontSize: "0.72rem" }}>Presets:</span>
                            {CGPA_PRESETS.map((preset) => (
                              <button
                                key={preset}
                                type="button"
                                onClick={() => {
                                  setForm((p) => ({ ...p, minimumCGPA: preset }));
                                  setCgpaError("");
                                }}
                                className="btn btn-sm rounded-pill px-2 py-0"
                                style={{
                                  fontSize: "0.72rem",
                                  background:
                                    form.minimumCGPA === preset
                                      ? "var(--primary)"
                                      : "var(--surface)",
                                  color: form.minimumCGPA === preset ? "#ffffff" : "var(--text)",
                                  border: "1px solid",
                                  borderColor:
                                    form.minimumCGPA === preset
                                      ? "var(--primary)"
                                      : "var(--border)",
                                }}
                              >
                                ≥ {preset}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* 4. Backlogs (Optional) */}
                      <div
                        className="mt-4 pt-3 border-top"
                        style={{ borderColor: "rgba(99, 102, 241, 0.15)" }}
                      >
                        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
                          <div>
                            <div className="d-flex align-items-center gap-1.5">
                              <label
                                className="form-label fw-semibold small mb-0"
                                style={{ color: "var(--text)" }}
                              >
                                Allow Backlogs?
                              </label>
                              <span
                                className="badge rounded-pill fw-normal"
                                style={{
                                  background: "rgba(100, 116, 139, 0.12)",
                                  color: "var(--text-secondary)",
                                  fontSize: "0.68rem",
                                }}
                              >
                                Optional Filter
                              </span>
                            </div>
                            <div className="text-muted small" style={{ fontSize: "0.75rem" }}>
                              Filter candidates based on active backlog history
                            </div>
                          </div>

                          <div
                            className="btn-group btn-group-sm rounded-pill p-1"
                            style={{
                              background: "var(--surface)",
                              border: "1px solid var(--border)",
                            }}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                setForm((p) => ({
                                  ...p,
                                  allowBacklogs: "No",
                                  maxBacklogs: 0,
                                }))
                              }
                              className={`btn btn-sm rounded-pill px-3 fw-semibold ${
                                form.allowBacklogs === "No"
                                  ? "btn-secondary text-white"
                                  : "btn-link text-muted"
                              }`}
                              style={{
                                fontSize: "0.78rem",
                                textDecoration: "none",
                                background:
                                  form.allowBacklogs === "No"
                                    ? "var(--primary)"
                                    : "transparent",
                                border: "none",
                              }}
                            >
                              No
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setForm((p) => ({
                                  ...p,
                                  allowBacklogs: "Yes",
                                  maxBacklogs: p.maxBacklogs || 1,
                                }))
                              }
                              className={`btn btn-sm rounded-pill px-3 fw-semibold ${
                                form.allowBacklogs === "Yes"
                                  ? "btn-warning text-dark fw-bold"
                                  : "btn-link text-muted"
                              }`}
                              style={{
                                fontSize: "0.78rem",
                                textDecoration: "none",
                                background:
                                  form.allowBacklogs === "Yes"
                                    ? "#f59e0b"
                                    : "transparent",
                                border: "none",
                              }}
                            >
                              Yes
                            </button>
                          </div>
                        </div>

                        {form.allowBacklogs === "Yes" && (
                          <motion.div
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-3 rounded-3 mt-2.5 d-flex flex-wrap align-items-center justify-content-between gap-3"
                            style={{
                              background: "rgba(245, 158, 11, 0.08)",
                              border: "1px dashed rgba(245, 158, 11, 0.35)",
                            }}
                          >
                            <div
                              className="small fw-semibold"
                              style={{ color: "var(--text)", fontSize: "0.8rem" }}
                            >
                              Max Allowed Backlog Count:
                            </div>
                            <div className="d-flex gap-2">
                              {[1, 2, 3, "Any"].map((val) => (
                                <button
                                  key={val}
                                  type="button"
                                  onClick={() =>
                                    setForm((p) => ({ ...p, maxBacklogs: val }))
                                  }
                                  className="btn btn-sm rounded-pill px-3 fw-semibold"
                                  style={{
                                    fontSize: "0.75rem",
                                    background:
                                      form.maxBacklogs === val
                                        ? "#f59e0b"
                                        : "var(--surface)",
                                    color:
                                      form.maxBacklogs === val
                                        ? "#000000"
                                        : "var(--text)",
                                    border: "1px solid",
                                    borderColor:
                                      form.maxBacklogs === val
                                        ? "#f59e0b"
                                        : "var(--border)",
                                  }}
                                >
                                  {val === "Any" ? "Any Active" : `Up to ${val}`}
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="col-12">
                    <label
                      className="form-label fw-semibold small"
                      style={{ color: "var(--text)" }}
                    >
                      Required Skills (comma-separated)
                    </label>
                    <input
                      className="form-control"
                      style={{
                        background: "var(--bg-secondary)",
                        borderColor: "var(--border)",
                        color: "var(--text)",
                      }}
                      placeholder="React, Node.js, MongoDB, TypeScript"
                      value={form.skills}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, skills: e.target.value }))
                      }
                    />
                  </div>

                  <div className="col-md-4">
                    <label
                      className="form-label fw-semibold small"
                      style={{ color: "var(--text)" }}
                    >
                      Minimum Salary (LPA)
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      className="form-control"
                      style={{
                        background: "var(--bg-secondary)",
                        borderColor: "var(--border)",
                        color: "var(--text)",
                      }}
                      placeholder="e.g. 3.5"
                      value={form.salaryMin}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, salaryMin: e.target.value }))
                      }
                    />
                    <div className="form-text small" style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>
                      Enter annual salary in Lakhs Per Annum (LPA).
                    </div>
                  </div>

                  <div className="col-md-4">
                    <label
                      className="form-label fw-semibold small"
                      style={{ color: "var(--text)" }}
                    >
                      Maximum Salary (LPA)
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      className="form-control"
                      style={{
                        background: "var(--bg-secondary)",
                        borderColor: "var(--border)",
                        color: "var(--text)",
                      }}
                      placeholder="e.g. 8.0"
                      value={form.salaryMax}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, salaryMax: e.target.value }))
                      }
                    />
                    <div className="form-text small" style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>
                      Enter annual salary in Lakhs Per Annum (LPA).
                    </div>
                  </div>

                  <div className="col-md-4">
                    <label
                      className="form-label fw-semibold small"
                      style={{ color: "var(--text)" }}
                    >
                      Experience
                    </label>
                    <input
                      className="form-control"
                      style={{
                        background: "var(--bg-secondary)",
                        borderColor: "var(--border)",
                        color: "var(--text)",
                      }}
                      placeholder="e.g. 2-5 years"
                      value={form.experience}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, experience: e.target.value }))
                      }
                    />
                  </div>

                  <div className="col-md-6">
                    <label
                      className="form-label fw-semibold small"
                      style={{ color: "var(--text)" }}
                    >
                      Application Deadline
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      style={{
                        background: "var(--bg-secondary)",
                        borderColor: "var(--border)",
                        color: "var(--text)",
                      }}
                      value={form.deadline}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, deadline: e.target.value }))
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Sticky Modal Footer */}
              <div
                className="p-3 p-md-4 border-top d-flex gap-3 align-items-center justify-content-between"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--surface)",
                  flexShrink: 0,
                }}
              >
                <span className="small text-muted d-none d-sm-inline">
                  * Required fields must be completed
                </span>
                <div className="d-flex gap-3 ms-auto w-100 w-sm-auto justify-content-end">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="btn btn-outline-secondary rounded-pill px-4 fw-semibold"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
                    disabled={saving}
                    className="btn btn-primary rounded-pill px-4 fw-bold d-flex align-items-center justify-content-center gap-2"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--primary), var(--purple))",
                      border: "none",
                      boxShadow: "0 4px 14px rgba(99, 102, 241, 0.35)",
                    }}
                  >
                    {saving ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm"
                          role="status"
                          aria-hidden="true"
                        />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle size={18} />
                        <span>{editJob ? "Update Job" : "Post Job"}</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>{" "}
      {/* ── Applicants Modal ── */}{" "}
      <AnimatePresence>
        {" "}
        {showApplicants && selectedJob && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="position-fixed d-flex align-items-center justify-content-center"
            style={{
              background: "rgba(0,0,0,0.02)",
              zIndex: 1050,
              inset: 0,
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
            onClick={(e) =>
              e.target === e.currentTarget && setShowApplicants(false)
            }
          >
            {" "}
            <motion.div
              initial={{ scale: 0.9, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 40 }}
              className="bento-card p-4"
              style={{
                width: "100%",
                maxWidth: 800,
                maxHeight: "90vh",
                overflowY: "auto",
                background: "var(--surface)",
              }}
            >
              {" "}
              <div className="d-flex align-items-center justify-content-between mb-4">
                {" "}
                <div>
                  {" "}
                  <h4
                    className="fw-black mb-0"
                    style={{ color: "var(--text)" }}
                  >
                    Applicants
                  </h4>{" "}
                  <p className="text-muted small mb-0">
                    {selectedJob.title} · {applicants.length} candidates
                  </p>{" "}
                </div>{" "}
                <button
                  onClick={() => setShowApplicants(false)}
                  className="btn btn-sm btn-outline-secondary rounded-circle"
                  style={{ width: 36, height: 36 }}
                >
                  {" "}
                  <X size={16} />{" "}
                </button>{" "}
              </div>{" "}
              {applicants.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  {" "}
                  <Users size={48} className="opacity-25 mb-3" />{" "}
                  <p className="fw-semibold">
                    No applicants yet for this job.
                  </p>{" "}
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {" "}
                  {applicants.map((app) => (
                    <div
                      key={app._id}
                      className="bento-card p-3 d-flex align-items-center gap-3"
                      style={{
                        background: "var(--bg-secondary)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      {" "}
                      <div
                        className="d-flex align-items-center justify-content-center rounded-circle fw-bold text-foreground bg-primary"
                        style={{
                          width: 44,
                          height: 44,
                          fontSize: "1rem",
                          flexShrink: 0,
                        }}
                      >
                        {" "}
                        {(app.studentId?.name || "U")[0]}{" "}
                      </div>{" "}
                      <div className="flex-grow-1 min-w-0">
                        {" "}
                        <h6
                          className="fw-bold mb-0"
                          style={{ color: "var(--text)" }}
                        >
                          {app.studentId?.name || "Unknown"}
                        </h6>{" "}
                        <p className="text-muted small mb-1">
                          {app.studentId?.email}
                        </p>{" "}
                        <div className="d-flex gap-2 flex-wrap">
                          {" "}
                          {(app.studentId?.studentProfile?.skills || [])
                            .slice(0, 4)
                            .map((s) => (
                              <span
                                key={s}
                                className="badge bg-primary-subtle text-primary rounded-pill"
                                style={{ fontSize: "0.65rem" }}
                              >
                                {s}
                              </span>
                            ))}{" "}
                        </div>{" "}
                      </div>{" "}
                      <div className="d-flex flex-column align-items-end gap-2">
                        {" "}
                        <span
                          className={`badge bg-${appStatusColor[app.status]}-subtle text-${appStatusColor[app.status]} rounded-pill px-3 py-1`}
                        >
                          {" "}
                          {app.status}{" "}
                        </span>{" "}
                        <select
                          className="form-select form-select-sm rounded-pill"
                          style={{
                            background: "var(--bg)",
                            borderColor: "var(--border)",
                            color: "var(--text)",
                            fontSize: "0.7rem",
                            maxWidth: 140,
                          }}
                          value={app.status}
                          onChange={(e) =>
                            handleUpdateStatus(
                              selectedJob._id,
                              app._id,
                              e.target.value,
                            )
                          }
                        >
                          {" "}
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
                          ))}{" "}
                        </select>{" "}
                      </div>{" "}
                    </div>
                  ))}{" "}
                </div>
              )}{" "}
            </motion.div>{" "}
          </motion.div>
        )}{" "}
      </AnimatePresence>{" "}
    </div>
  );
};
export default RecruiterJobs;
