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
} from "lucide-react";
import { jobService } from "../../services/api.js";
const JOB_TYPES = ["Full-Time", "Part-Time", "Internship", "Contract"];
const STATUSES = ["Open", "Closed", "Draft"];
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
        title: job.title,
        company: job.company,
        location: job.location,
        type: job.type,
        description: job.description,
        requirements: (job.requirements || []).join("\n"),
        skills: (job.skills || []).join(", "),
        salaryMin: job.salary?.min || "",
        salaryMax: job.salary?.max || "",
        experience: job.experience || "",
        deadline: job.deadline?.split("T")[0] || "",
        status: job.status,
      });
    } else {
      setEditJob(null);
      setForm(defaultForm);
    }
    setError("");
    setShowForm(true);
  };
  const handleSave = async () => {
    if (!form.title || !form.company || !form.location || !form.description) {
      setError("Title, Company, Location, and Description are required.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        company: form.company,
        location: form.location,
        type: form.type,
        description: form.description,
        status: form.status,
        requirements: form.requirements.split("\n").filter(Boolean),
        skills: form.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        salary: {
          min: +form.salaryMin || 0,
          max: +form.salaryMax || 0,
          currency: "INR",
        },
        experience: form.experience,
        deadline: form.deadline || undefined,
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
                  {job.salary?.min > 0 && (
                    <span className="badge bg-success-subtle text-success rounded-pill">
                      {" "}
                      <DollarSign size={10} className="me-1" />₹{job.salary.min}
                      –{job.salary.max}K{" "}
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
      {/* ── Post/Edit Job Modal ── */}{" "}
      <AnimatePresence>
        {" "}
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
            style={{
              background: "rgba(0,0,0,0.02)",
              zIndex: 1050,
              inset: 0,
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
            onClick={(e) => e.target === e.currentTarget && setShowForm(false)}
          >
            {" "}
            <motion.div
              initial={{ scale: 0.9, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 40 }}
              className="bento-card p-4 p-lg-5"
              style={{
                width: "100%",
                maxWidth: 700,
                maxHeight: "90vh",
                overflowY: "auto",
                background: "var(--surface)",
              }}
            >
              {" "}
              <div className="d-flex align-items-center justify-content-between mb-4">
                {" "}
                <h4
                  className="fw-black mb-0 d-flex align-items-center gap-2"
                  style={{ color: "var(--text)" }}
                >
                  {" "}
                  <Sparkles size={22} className="text-primary" />{" "}
                  {editJob ? "Edit Job Post" : "Post New Job"}{" "}
                </h4>{" "}
                <button
                  onClick={() => setShowForm(false)}
                  className="btn btn-sm btn-outline-secondary rounded-circle"
                  style={{ width: 36, height: 36 }}
                >
                  {" "}
                  <X size={16} />{" "}
                </button>{" "}
              </div>{" "}
              {error && (
                <div
                  className="alert alert-danger d-flex align-items-center gap-2 mb-3 rounded-3"
                  role="alert"
                >
                  {" "}
                  <AlertCircle size={16} /> {error}{" "}
                </div>
              )}{" "}
              <div className="row g-3">
                {" "}
                <div className="col-md-6">
                  {" "}
                  <label
                    className="form-label fw-semibold small"
                    style={{ color: "var(--text)" }}
                  >
                    Job Title *
                  </label>{" "}
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
                  />{" "}
                </div>{" "}
                <div className="col-md-6">
                  {" "}
                  <label
                    className="form-label fw-semibold small"
                    style={{ color: "var(--text)" }}
                  >
                    Company *
                  </label>{" "}
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
                  />{" "}
                </div>{" "}
                <div className="col-md-6">
                  {" "}
                  <label
                    className="form-label fw-semibold small"
                    style={{ color: "var(--text)" }}
                  >
                    Location *
                  </label>{" "}
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
                  />{" "}
                </div>{" "}
                <div className="col-md-3">
                  {" "}
                  <label
                    className="form-label fw-semibold small"
                    style={{ color: "var(--text)" }}
                  >
                    Type
                  </label>{" "}
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
                    {" "}
                    {JOB_TYPES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}{" "}
                  </select>{" "}
                </div>{" "}
                <div className="col-md-3">
                  {" "}
                  <label
                    className="form-label fw-semibold small"
                    style={{ color: "var(--text)" }}
                  >
                    Status
                  </label>{" "}
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
                    {" "}
                    {STATUSES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}{" "}
                  </select>{" "}
                </div>{" "}
                <div className="col-12">
                  {" "}
                  <label
                    className="form-label fw-semibold small"
                    style={{ color: "var(--text)" }}
                  >
                    Job Description *
                  </label>{" "}
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
                  />{" "}
                </div>{" "}
                <div className="col-12">
                  {" "}
                  <label
                    className="form-label fw-semibold small"
                    style={{ color: "var(--text)" }}
                  >
                    Requirements (one per line)
                  </label>{" "}
                  <textarea
                    className="form-control"
                    rows={3}
                    style={{
                      background: "var(--bg-secondary)",
                      borderColor: "var(--border)",
                      color: "var(--text)",
                    }}
                    placeholder="Bachelor's degree in CS&#10;3+ years React experience&#10;Strong problem-solving skills"
                    value={form.requirements}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, requirements: e.target.value }))
                    }
                  />{" "}
                </div>{" "}
                <div className="col-12">
                  {" "}
                  <label
                    className="form-label fw-semibold small"
                    style={{ color: "var(--text)" }}
                  >
                    Required Skills (comma-separated)
                  </label>{" "}
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
                  />{" "}
                </div>{" "}
                <div className="col-md-4">
                  {" "}
                  <label
                    className="form-label fw-semibold small"
                    style={{ color: "var(--text)" }}
                  >
                    Min Salary (₹K)
                  </label>{" "}
                  <input
                    type="number"
                    className="form-control"
                    style={{
                      background: "var(--bg-secondary)",
                      borderColor: "var(--border)",
                      color: "var(--text)",
                    }}
                    placeholder="e.g. 600"
                    value={form.salaryMin}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, salaryMin: e.target.value }))
                    }
                  />{" "}
                </div>{" "}
                <div className="col-md-4">
                  {" "}
                  <label
                    className="form-label fw-semibold small"
                    style={{ color: "var(--text)" }}
                  >
                    Max Salary (₹K)
                  </label>{" "}
                  <input
                    type="number"
                    className="form-control"
                    style={{
                      background: "var(--bg-secondary)",
                      borderColor: "var(--border)",
                      color: "var(--text)",
                    }}
                    placeholder="e.g. 1200"
                    value={form.salaryMax}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, salaryMax: e.target.value }))
                    }
                  />{" "}
                </div>{" "}
                <div className="col-md-4">
                  {" "}
                  <label
                    className="form-label fw-semibold small"
                    style={{ color: "var(--text)" }}
                  >
                    Experience
                  </label>{" "}
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
                  />{" "}
                </div>{" "}
                <div className="col-md-6">
                  {" "}
                  <label
                    className="form-label fw-semibold small"
                    style={{ color: "var(--text)" }}
                  >
                    Application Deadline
                  </label>{" "}
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
                  />{" "}
                </div>{" "}
              </div>{" "}
              <div className="d-flex gap-3 mt-4">
                {" "}
                <button
                  onClick={() => setShowForm(false)}
                  className="btn btn-outline-secondary rounded-pill flex-fill fw-semibold"
                >
                  {" "}
                  Cancel{" "}
                </button>{" "}
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSave}
                  disabled={saving}
                  className="btn btn-primary rounded-pill flex-fill fw-bold d-flex align-items-center justify-content-center gap-2"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--primary), var(--purple))",
                    border: "none",
                  }}
                >
                  {" "}
                  {saving ? (
                    <span className="spinner-border spinner-border-sm" />
                  ) : (
                    <CheckCircle size={18} />
                  )}{" "}
                  {saving
                    ? "Saving..."
                    : editJob
                      ? "Update Job"
                      : "Post Job"}{" "}
                </motion.button>{" "}
              </div>{" "}
            </motion.div>{" "}
          </motion.div>
        )}{" "}
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
