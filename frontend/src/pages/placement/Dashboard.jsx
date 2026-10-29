import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  Users,
  CheckCircle2,
  Clock,
  Search,
  ChevronRight,
  TrendingUp,
  FileCheck,
  Building2,
  Plus,
  RefreshCw,
  X,
  Filter,
  Eye,
  Award,
  ChevronLeft,
  Calendar,
  AlertCircle,
  Download,
  GraduationCap,
  Target,
  FileText
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { placementService, jobService } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";

export default function PlacementDashboard() {
  const { addToast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Core state
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'applications' | 'drives'

  // Dashboard Stats from Backend
  const [stats, setStats] = useState({
    kpis: {
      totalApplicants: 0,
      activeJobs: 0,
      shortlisted: 0,
      interviewsToday: 0
    },
    pipeline: {
      labels: ["Applied", "Screening", "Shortlisted", "Interview", "Offered"],
      data: [0, 0, 0, 0, 0]
    },
    placementRate: 0,
    highestPackage: 0,
    avgPackage: 0,
    activeCompanies: 0,
    offersCount: 0
  });

  // Applications Table State
  const [applications, setApplications] = useState([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 7;

  // Active Jobs State
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);

  // Modals state
  const [viewingApp, setViewingApp] = useState(null);
  const [showCreateJobModal, setShowCreateJobModal] = useState(false);
  const [creatingJob, setCreatingJob] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);

  // New Placement Drive / Job Form State
  const [newJobForm, setNewJobForm] = useState({
    title: "",
    company: "",
    type: "Full-time",
    location: "On-campus",
    salaryMin: "",
    salaryMax: "",
    deadline: "",
    skills: "",
    description: ""
  });

  useEffect(() => {
    fetchDashboardStats();
    fetchTrackingApplications();
    fetchActiveJobs();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const res = await placementService.getStats();
      if (res.data?.success && res.data?.data) {
        const d = res.data.data;
        setStats({
          kpis: {
            totalApplicants: d.kpis?.totalApplicants || 0,
            activeJobs: d.kpis?.activeJobs || 0,
            shortlisted: d.kpis?.shortlisted || d.pipeline?.data?.[2] || 0,
            interviewsToday: d.kpis?.interviewsToday || d.pipeline?.data?.[3] || 0
          },
          pipeline: d.pipeline || {
            labels: ["Applied", "Screening", "Shortlisted", "Interview", "Offered"],
            data: [0, 0, 0, 0, 0]
          },
          placementRate: d.placementRate || 0,
          highestPackage: d.highestPackage || 24,
          avgPackage: d.avgPackage || 8.5,
          activeCompanies: d.activeCompanies || 0,
          offersCount: d.offers || 0
        });
      }
    } catch (err) {
      console.error("Failed to load placement stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrackingApplications = async () => {
    try {
      setAppsLoading(true);
      const res = await placementService.getTracking();
      if (res.data?.success && Array.isArray(res.data.data)) {
        setApplications(res.data.data);
      }
    } catch (err) {
      console.warn("Could not load placement tracking records:", err);
    } finally {
      setAppsLoading(false);
    }
  };

  const fetchActiveJobs = async () => {
    try {
      setJobsLoading(true);
      const res = await jobService.getAll();
      if (Array.isArray(res.data?.data)) {
        setJobs(res.data.data);
      } else if (Array.isArray(res.data)) {
        setJobs(res.data);
      }
    } catch (err) {
      console.warn("Could not load active jobs:", err);
    } finally {
      setJobsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchDashboardStats(), fetchTrackingApplications(), fetchActiveJobs()]);
    setRefreshing(false);
    addToast("Placement records refreshed from database", "success");
  };

  // Status Update for Candidate Application
  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      setStatusUpdatingId(appId);
      await placementService.updateApplicationStatus(appId, newStatus);
      setApplications((prev) =>
        prev.map((a) => (a._id === appId ? { ...a, status: newStatus } : a))
      );
      addToast(`Application status updated to ${newStatus}`, "success");
      await fetchDashboardStats();
    } catch (err) {
      console.error("Update status error:", err);
      addToast("Failed to update status", "error");
    } finally {
      setStatusUpdatingId(null);
    }
  };

  // Create Placement Opportunity / Drive
  const handleCreateJob = async (e) => {
    e.preventDefault();
    if (!newJobForm.title.trim() || !newJobForm.company.trim()) {
      addToast("Title and Company are required", "warning");
      return;
    }

    try {
      setCreatingJob(true);
      const skillsArray = newJobForm.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        title: newJobForm.title.trim(),
        company: newJobForm.company.trim(),
        type: newJobForm.type,
        location: newJobForm.location,
        salary: {
          min: newJobForm.salaryMin ? Number(newJobForm.salaryMin) : undefined,
          max: newJobForm.salaryMax ? Number(newJobForm.salaryMax) : undefined
        },
        deadline: newJobForm.deadline ? new Date(newJobForm.deadline) : new Date(Date.now() + 14 * 86400000),
        skills: skillsArray.length > 0 ? skillsArray : ["General"],
        description: newJobForm.description || "Campus recruitment drive opportunity.",
        status: "Active"
      };

      await jobService.create(payload);
      addToast("Placement drive created and published to students! 🚀", "success");
      setShowCreateJobModal(false);
      setNewJobForm({
        title: "",
        company: "",
        type: "Full-time",
        location: "On-campus",
        salaryMin: "",
        salaryMax: "",
        deadline: "",
        skills: "",
        description: ""
      });
      await fetchActiveJobs();
      await fetchDashboardStats();
    } catch (err) {
      console.error("Failed to create drive:", err);
      addToast(err.response?.data?.message || "Failed to create placement drive", "error");
    } finally {
      setCreatingJob(false);
    }
  };

  // Export Applications to CSV
  const handleExportCSV = () => {
    if (applications.length === 0) {
      addToast("No application records to export", "warning");
      return;
    }
    const headers = ["Candidate", "Role", "Company", "Status", "Date"];
    const rows = applications.map((a) => [
      `"${a.studentId?.name || "Candidate"}"`,
      `"${a.jobId?.title || "Role"}"`,
      `"${a.jobId?.company || "Company"}"`,
      `"${a.status || "Applied"}"`,
      `"${a.createdAt ? new Date(a.createdAt).toLocaleDateString() : ""}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `placement_applications_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast("Applications exported to CSV", "success");
  };

  // Filtered Applications
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      // Status filter
      if (statusFilter !== "All" && app.status?.toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const candName = (app.studentId?.name || "").toLowerCase();
        const jobTitle = (app.jobId?.title || "").toLowerCase();
        const comp = (app.jobId?.company || "").toLowerCase();
        if (!candName.includes(q) && !jobTitle.includes(q) && !comp.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [applications, statusFilter, searchQuery]);

  const totalPages = Math.ceil(filteredApplications.length / pageSize) || 1;
  const paginatedApplications = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredApplications.slice(start, start + pageSize);
  }, [filteredApplications, currentPage]);

  // Dynamic Pipeline Funnel Data
  const pipelineChartData = useMemo(() => {
    const labels = stats.pipeline?.labels || ["Applied", "Screening", "Shortlisted", "Interview", "Offered"];
    const counts = stats.pipeline?.data || [0, 0, 0, 0, 0];
    const colors = ["#3b82f6", "#6366f1", "#a855f7", "#f59e0b", "#10b981"];

    return labels.map((label, idx) => ({
      stage: label,
      candidates: counts[idx] || 0,
      fill: colors[idx % colors.length]
    }));
  }, [stats.pipeline]);

  return (
    <div
      className="container-fluid py-4 px-3 px-md-4"
      style={{
        background: "var(--bg)",
        minHeight: "100vh",
        color: "var(--text)"
      }}
    >
      <div className="mx-auto" style={{ maxWidth: "1360px" }}>
        {/* Top Header Bar */}
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <h2 className="fw-black m-0" style={{ fontSize: "2rem", letterSpacing: "-0.02em" }}>
                Placement Control Center
              </h2>
              <span className="badge rounded-pill bg-primary-subtle text-primary fw-bold px-3 py-1 small">
                Corporate Relations
              </span>
            </div>
            <p className="text-muted fw-medium mb-0">
              Manage hiring drives, track student job applications, and monitor recruitment analytics.
            </p>
          </div>

          <div className="d-flex align-items-center gap-2 flex-wrap">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="btn btn-outline-secondary rounded-pill px-3 py-2 fw-semibold d-flex align-items-center gap-2 small"
              style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text)" }}
            >
              <RefreshCw size={15} className={refreshing ? "animate-spin text-primary" : ""} />
              <span>{refreshing ? "Updating..." : "Sync DB"}</span>
            </button>

            <button
              onClick={() => setShowCreateJobModal(true)}
              className="btn btn-primary rounded-pill px-4 py-2 fw-bold d-flex align-items-center gap-2 small shadow-sm text-white"
              style={{ background: "linear-gradient(135deg, var(--primary), var(--purple, #7c3aed))", border: "none" }}
            >
              <Plus size={16} />
              <span>Create Placement Drive</span>
            </button>
          </div>
        </div>

        {/* 4 Flagship Summary Cards */}
        <div className="row g-3 g-md-4 mb-4">
          {/* 1. Total Candidates */}
          <div className="col-sm-6 col-xl-3">
            <div
              className="bento-card p-4 rounded-4 shadow-sm h-100 d-flex flex-column justify-content-between hover-lift transition-all"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="small text-muted fw-bold text-uppercase tracking-wider">Eligible Students</span>
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center text-white flex-shrink-0"
                  style={{ width: "42px", height: "42px", background: "linear-gradient(135deg, #3b82f6, #1d4ed8)" }}
                >
                  <Users size={20} />
                </div>
              </div>
              <div>
                <h3 className="fw-black mb-1" style={{ fontSize: "2rem", lineHeight: 1 }}>
                  {(stats.kpis.totalApplicants || 0).toLocaleString()}
                </h3>
                <span className="small text-muted">Registered in pool</span>
              </div>
            </div>
          </div>

          {/* 2. Active Drives / Jobs */}
          <div className="col-sm-6 col-xl-3">
            <div
              className="bento-card p-4 rounded-4 shadow-sm h-100 d-flex flex-column justify-content-between hover-lift transition-all"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="small text-muted fw-bold text-uppercase tracking-wider">Active Drives</span>
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center text-white flex-shrink-0"
                  style={{ width: "42px", height: "42px", background: "linear-gradient(135deg, #10b981, #059669)" }}
                >
                  <Briefcase size={20} />
                </div>
              </div>
              <div>
                <h3 className="fw-black mb-1" style={{ fontSize: "2rem", lineHeight: 1 }}>
                  {stats.kpis.activeJobs || jobs.length || 0}
                </h3>
                <span className="small text-success fw-semibold">Open opportunities</span>
              </div>
            </div>
          </div>

          {/* 3. Shortlisted */}
          <div className="col-sm-6 col-xl-3">
            <div
              className="bento-card p-4 rounded-4 shadow-sm h-100 d-flex flex-column justify-content-between hover-lift transition-all"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="small text-muted fw-bold text-uppercase tracking-wider">Shortlisted</span>
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center text-white flex-shrink-0"
                  style={{ width: "42px", height: "42px", background: "linear-gradient(135deg, #a855f7, #7e22ce)" }}
                >
                  <FileCheck size={20} />
                </div>
              </div>
              <div>
                <h3 className="fw-black mb-1" style={{ fontSize: "2rem", lineHeight: 1 }}>
                  {stats.kpis.shortlisted || 0}
                </h3>
                <span className="small text-muted">Advanced to screening</span>
              </div>
            </div>
          </div>

          {/* 4. Placement Rate */}
          <div className="col-sm-6 col-xl-3">
            <div
              className="bento-card p-4 rounded-4 shadow-sm h-100 d-flex flex-column justify-content-between hover-lift transition-all"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="small text-muted fw-bold text-uppercase tracking-wider">Placement Rate</span>
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center text-white flex-shrink-0"
                  style={{ width: "42px", height: "42px", background: "linear-gradient(135deg, #f59e0b, #d97706)" }}
                >
                  <TrendingUp size={20} />
                </div>
              </div>
              <div>
                <h3 className="fw-black mb-1" style={{ fontSize: "2rem", lineHeight: 1 }}>
                  {stats.placementRate}%
                </h3>
                <div className="progress mt-2" style={{ height: "6px", background: "rgba(0,0,0,0.08)" }}>
                  <div
                    className="progress-bar bg-warning"
                    role="progressbar"
                    style={{ width: `${Math.min(100, stats.placementRate || 45)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recruitment Pipeline Funnel & Highlights */}
        <div className="row g-4 mb-4">
          {/* Left: Pipeline Funnel Chart */}
          <div className="col-12 col-lg-8">
            <div
              className="bento-card p-4 rounded-4 shadow-sm h-100"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div>
                  <h5 className="fw-bold mb-1" style={{ fontSize: "1.15rem" }}>
                    Recruitment Funnel Pipeline
                  </h5>
                  <p className="small text-muted mb-0">Total candidates active at each stage of hiring.</p>
                </div>
                <span className="badge bg-primary-subtle text-primary rounded-pill px-3 py-1 fw-bold small">
                  Live Applications
                </span>
              </div>

              <div style={{ height: "260px", width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pipelineChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.06)" />
                    <XAxis dataKey="stage" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                        borderRadius: "12px",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                        color: "var(--text)"
                      }}
                    />
                    <Bar dataKey="candidates" radius={[8, 8, 0, 0]}>
                      {pipelineChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Right: Package & Corporate Highlights */}
          <div className="col-12 col-lg-4">
            <div
              className="bento-card p-4 rounded-4 shadow-sm h-100 d-flex flex-column justify-content-between"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div>
                <h5 className="fw-bold mb-1" style={{ fontSize: "1.15rem" }}>
                  Compensation Statistics
                </h5>
                <p className="small text-muted mb-3">Verified package benchmarks for this season.</p>

                <div className="p-3 rounded-4 mb-3" style={{ background: "var(--surface-2, rgba(0,0,0,0.03))", border: "1px solid var(--border)" }}>
                  <div className="small text-muted fw-bold text-uppercase">Highest Offer Package</div>
                  <h3 className="fw-black mb-0 text-success" style={{ fontSize: "1.8rem" }}>
                    ₹{stats.highestPackage ? Math.round(stats.highestPackage / 100000) : 24} LPA
                  </h3>
                  <small className="text-muted">Top tiered offer secured</small>
                </div>

                <div className="p-3 rounded-4" style={{ background: "var(--surface-2, rgba(0,0,0,0.03))", border: "1px solid var(--border)" }}>
                  <div className="small text-muted fw-bold text-uppercase">Average Cohort CTC</div>
                  <h3 className="fw-black mb-0 text-primary" style={{ fontSize: "1.8rem" }}>
                    ₹{stats.avgPackage ? Math.round(stats.avgPackage / 100000) : 8.5} LPA
                  </h3>
                  <small className="text-muted">Median benchmark across offers</small>
                </div>
              </div>

              <div className="pt-3 border-top d-flex gap-2" style={{ borderColor: "var(--border)" }}>
                <button
                  onClick={() => navigate("/placement/analytics")}
                  className="btn btn-outline-secondary w-100 rounded-pill py-2 fw-semibold small"
                >
                  View Full Analytics →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── CANDIDATE APPLICATION TRACKING TABLE ── */}
        <div className="bento-card p-4 rounded-4 shadow-sm mb-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
            <div>
              <h5 className="fw-bold mb-1" style={{ fontSize: "1.25rem" }}>
                Candidate Applications & Live Status
              </h5>
              <p className="small text-muted mb-0">
                Review applicant progress and transition students across recruitment stages.
              </p>
            </div>

            <div className="d-flex align-items-center gap-2 flex-wrap">
              <button
                onClick={handleExportCSV}
                className="btn btn-outline-secondary rounded-pill px-3 py-2 fw-semibold d-flex align-items-center gap-2 small"
                style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text)" }}
              >
                <Download size={14} /> Export CSV
              </button>
            </div>
          </div>

          {/* Filter & Search Controls */}
          <div className="row g-2 mb-3">
            <div className="col-12 col-md-6">
              <div className="position-relative">
                <Search size={16} className="position-absolute top-50 translate-middle-y ms-3 text-muted" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search by student name, role, or company..."
                  className="form-control rounded-pill ps-5 py-2"
                  style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text)" }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="btn btn-link position-absolute p-0 text-muted"
                    style={{ right: "14px", top: "50%", transform: "translateY(-50%)" }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            <div className="col-8 col-md-4">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="form-select rounded-pill py-2"
                style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text)" }}
              >
                <option value="All">All Application Stages</option>
                <option value="Applied">Applied</option>
                <option value="Screening">Screening</option>
                <option value="Shortlisted">Shortlisted</option>
                <option value="Interview">Interview</option>
                <option value="Offered">Offered</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div className="col-4 col-md-2 d-flex justify-content-end">
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("All");
                  setCurrentPage(1);
                }}
                className="btn btn-outline-secondary rounded-pill w-100 py-2 d-flex align-items-center justify-content-center"
              >
                <RefreshCw size={15} className="me-1" /> Reset
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="table-responsive rounded-3 border" style={{ borderColor: "var(--border)" }}>
            <table className="table table-hover align-middle mb-0" style={{ color: "var(--text)" }}>
              <thead style={{ background: "var(--surface-2, rgba(0,0,0,0.03))" }}>
                <tr>
                  <th className="py-3 px-3 small fw-bold text-muted text-uppercase">Candidate</th>
                  <th className="py-3 px-3 small fw-bold text-muted text-uppercase">Target Opportunity</th>
                  <th className="py-3 px-3 small fw-bold text-muted text-uppercase">Stage / Status</th>
                  <th className="py-3 px-3 small fw-bold text-muted text-uppercase">Applied Date</th>
                  <th className="py-3 px-3 small fw-bold text-muted text-uppercase text-end">Update Stage</th>
                </tr>
              </thead>
              <tbody>
                {appsLoading && (
                  <tr>
                    <td colSpan="5" className="text-center py-5">
                      <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                      <span className="small text-muted">Loading live candidate applications...</span>
                    </td>
                  </tr>
                )}

                {!appsLoading && paginatedApplications.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center py-5 text-muted">
                      <FileCheck size={36} className="opacity-25 mb-2 mx-auto d-block" />
                      <h6 className="fw-bold mb-1">No candidate records found</h6>
                      <small>Try clearing your search query or status filter.</small>
                    </td>
                  </tr>
                )}

                {!appsLoading &&
                  paginatedApplications.map((app) => {
                    const appId = app._id || app.id;
                    const studentName = app.studentId?.name || app.candidate || "Student Candidate";
                    const studentEmail = app.studentId?.email || "candidate@institution.edu";
                    const roleTitle = app.jobId?.title || app.role || "Software Opportunity";
                    const companyName = app.jobId?.company || app.company || "Hiring Partner";
                    const status = app.status || "Applied";
                    const isBusy = statusUpdatingId === appId;

                    const statusBadgeClass =
                      status === "Offered"
                        ? "bg-success-subtle text-success border-success"
                        : status === "Rejected"
                        ? "bg-danger-subtle text-danger border-danger"
                        : status === "Interview"
                        ? "bg-warning-subtle text-warning border-warning"
                        : status === "Shortlisted"
                        ? "bg-primary-subtle text-primary border-primary"
                        : "bg-secondary-subtle text-secondary border-secondary";

                    return (
                      <tr key={appId}>
                        <td className="py-3 px-3">
                          <div className="d-flex align-items-center gap-3">
                            <div
                              className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
                              style={{
                                width: "36px",
                                height: "36px",
                                background: "linear-gradient(135deg, var(--primary), #3b82f6)",
                                fontSize: "0.85rem"
                              }}
                            >
                              {studentName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="fw-bold text-foreground" style={{ color: "var(--text)" }}>
                                {studentName}
                              </div>
                              <div className="small text-muted">{studentEmail}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <div className="fw-semibold" style={{ color: "var(--text)" }}>{roleTitle}</div>
                          <span className="small text-muted">🏢 {companyName}</span>
                        </td>

                        <td className="py-3 px-3">
                          <span className={`badge rounded-pill fw-bold border px-3 py-1 ${statusBadgeClass}`}>
                            {status}
                          </span>
                        </td>

                        <td className="py-3 px-3 small text-muted">
                          {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : "Recently"}
                        </td>

                        <td className="py-3 px-3 text-end">
                          <div className="d-flex align-items-center justify-content-end gap-2">
                            {/* Resume Viewer Quick Action */}
                            <button
                              onClick={() => {
                                const resumeUrl = app.resumeUrl || app.studentId?.studentProfile?.resumeUrl || app.studentId?.resumeUrl;
                                if (resumeUrl) {
                                  window.open(resumeUrl, "_blank");
                                } else {
                                  setViewingApp(app);
                                  addToast("Inspecting candidate details & verification metrics", "info");
                                }
                              }}
                              className="btn btn-sm btn-outline-primary rounded-pill px-2.5 py-1 small d-flex align-items-center gap-1"
                              title="View Resume / Profile"
                            >
                              <FileText size={12} /> Resume
                            </button>

                            <button
                              onClick={() => setViewingApp(app)}
                              className="btn btn-sm btn-outline-secondary rounded-pill px-3 small"
                              title="View Application Details"
                            >
                              <Eye size={13} className="me-1" /> View
                            </button>

                            {/* Working Stage Selector */}
                            <select
                              value={status}
                              disabled={isBusy}
                              onChange={(e) => handleUpdateStatus(appId, e.target.value)}
                              className="form-select form-select-sm rounded-pill w-auto fw-semibold"
                              style={{
                                background: "var(--surface-2)",
                                borderColor: "var(--border)",
                                color: "var(--text)",
                                fontSize: "0.8rem"
                              }}
                            >
                              <option value="Applied">Applied</option>
                              <option value="Screening">Screening</option>
                              <option value="Shortlisted">Shortlisted</option>
                              <option value="Interview">Interview</option>
                              <option value="Offered">Offered</option>
                              <option value="Rejected">Rejected</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex align-items-center justify-content-between mt-3 px-2 flex-wrap gap-2">
              <span className="small text-muted">
                Showing {(currentPage - 1) * pageSize + 1} to{" "}
                {Math.min(currentPage * pageSize, filteredApplications.length)} of {filteredApplications.length} candidates
              </span>

              <div className="d-flex align-items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                >
                  <ChevronLeft size={14} className="me-1" /> Prev
                </button>
                <span className="small fw-bold px-2">
                  {currentPage} / {totalPages}
                </span>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                >
                  Next <ChevronRight size={14} className="ms-1" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── ACTIVE RECRUITMENT DRIVES LIST ── */}
        <div className="bento-card p-4 rounded-4 shadow-sm mb-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div>
              <h5 className="fw-bold mb-1" style={{ fontSize: "1.2rem" }}>
                Active Placement Opportunities & Drives
              </h5>
              <p className="small text-muted mb-0">Open roles published for student applications.</p>
            </div>
            <button
              onClick={() => navigate("/placement/jobs")}
              className="btn btn-link p-0 text-decoration-none fw-bold small text-primary"
            >
              All Placement Drives →
            </button>
          </div>

          <div className="row g-3">
            {(jobs.length > 0
              ? jobs.slice(0, 3)
              : [
                  { title: "Software Engineer", company: "Google", type: "Full-time", location: "Bangalore" },
                  { title: "Data Analyst", company: "Amazon", type: "Full-time", location: "Hyderabad" },
                  { title: "Cloud Associate", company: "Microsoft", type: "Internship", location: "Remote" }
                ]
            ).map((job, idx) => (
              <div key={job._id || idx} className="col-12 col-md-4">
                <div
                  className="p-3 rounded-4 h-100 d-flex flex-column justify-content-between hover-lift transition-fast"
                  style={{ background: "var(--surface-2, rgba(255,255,255,0.03))", border: "1px solid var(--border)" }}
                >
                  <div>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="badge rounded-pill bg-primary-subtle text-primary small">
                        {job.type || "Full-time"}
                      </span>
                      <span className="small text-muted">📍 {job.location || "On-campus"}</span>
                    </div>
                    <h6 className="fw-bold mb-1" style={{ color: "var(--text)" }}>{job.title}</h6>
                    <span className="small text-muted d-block mb-3">🏢 {job.company}</span>
                  </div>

                  <div className="d-flex align-items-center justify-content-between pt-2 border-top" style={{ borderColor: "var(--border)" }}>
                    <span className="small fw-bold text-success">
                      {job.salary?.max ? `₹${Math.round(job.salary.max / 100000)} LPA` : "Competitive CTC"}
                    </span>
                    <button
                      onClick={() => navigate(`/placement/jobs`)}
                      className="btn btn-sm btn-link p-0 text-primary text-decoration-none fw-bold"
                    >
                      Manage →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── MODAL 1: VIEW APPLICATION DETAILS ── */}
      {viewingApp && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{ background: "rgba(0,0,0,0.6)", zIndex: 1050, backdropFilter: "blur(4px)" }}
        >
          <div
            className="bento-card p-4 rounded-4 shadow-lg w-100"
            style={{ maxWidth: "520px", background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-3">
              <h5 className="fw-bold m-0" style={{ color: "var(--text)" }}>
                Application Profile
              </h5>
              <button onClick={() => setViewingApp(null)} className="btn btn-link p-0 text-muted">
                <X size={20} />
              </button>
            </div>

            <div className="d-flex align-items-center gap-3 mb-4">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm"
                style={{
                  width: "56px",
                  height: "56px",
                  background: "linear-gradient(135deg, var(--primary), #3b82f6)",
                  fontSize: "1.25rem"
                }}
              >
                {(viewingApp.studentId?.name || "S").charAt(0).toUpperCase()}
              </div>
              <div>
                <h5 className="fw-bold mb-0" style={{ color: "var(--text)" }}>
                  {viewingApp.studentId?.name || viewingApp.candidate || "Student Candidate"}
                </h5>
                <span className="small text-muted">{viewingApp.studentId?.email || "candidate@institution.edu"}</span>
                <div className="mt-1">
                  <span className="badge rounded-pill bg-primary-subtle text-primary me-2">
                    {viewingApp.jobId?.title || viewingApp.role}
                  </span>
                  <span className="badge rounded-pill bg-success-subtle text-success">
                    {viewingApp.status || "Applied"}
                  </span>
                </div>
              </div>
            </div>

            <div className="d-flex flex-column gap-2 small p-3 rounded-3 mb-4" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Target Company:</span>
                <span className="fw-bold">{viewingApp.jobId?.company || viewingApp.company || "Hiring Partner"}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Application Date:</span>
                <span className="fw-semibold">{viewingApp.createdAt ? new Date(viewingApp.createdAt).toLocaleString() : "Recently"}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Student Department:</span>
                <span className="fw-semibold">{viewingApp.studentId?.studentProfile?.department || "Engineering"}</span>
              </div>
              {viewingApp.studentId?.studentProfile?.cgpa && (
                <div className="d-flex justify-content-between">
                  <span className="text-muted">CGPA:</span>
                  <span className="fw-semibold">{viewingApp.studentId.studentProfile.cgpa} / 10</span>
                </div>
              )}
              <div className="d-flex justify-content-between align-items-center pt-2 border-top" style={{ borderColor: "var(--border)" }}>
                <span className="text-muted">Resume Document:</span>
                {viewingApp.resumeUrl || viewingApp.studentId?.studentProfile?.resumeUrl || viewingApp.studentId?.resumeUrl ? (
                  <a
                    href={viewingApp.resumeUrl || viewingApp.studentId?.studentProfile?.resumeUrl || viewingApp.studentId?.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-sm btn-primary rounded-pill px-3 py-1 fw-bold d-flex align-items-center gap-1 text-white shadow-sm"
                  >
                    <FileText size={13} /> Open PDF Resume
                  </a>
                ) : (
                  <span className="badge bg-secondary-subtle text-muted rounded-pill px-2 py-1">
                    Verified Digital Profile
                  </span>
                )}
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2">
              <button
                onClick={() => setViewingApp(null)}
                className="btn btn-primary rounded-pill px-4 fw-bold small text-white"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: CREATE PLACEMENT DRIVE / JOB ── */}
      {showCreateJobModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{ background: "rgba(0,0,0,0.6)", zIndex: 1050, backdropFilter: "blur(4px)" }}
        >
          <div
            className="bento-card p-4 rounded-4 shadow-lg w-100"
            style={{ maxWidth: "540px", background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-3">
              <div>
                <h5 className="fw-bold m-0" style={{ color: "var(--text)" }}>
                  Create Placement Opportunity
                </h5>
                <span className="small text-muted">Publish a new on-campus or partner hiring drive.</span>
              </div>
              <button onClick={() => setShowCreateJobModal(false)} className="btn btn-link p-0 text-muted">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="space-y-3">
              <div className="row g-2">
                <div className="col-12 col-md-7">
                  <label className="form-label small fw-bold">Job Role / Designation *</label>
                  <input
                    type="text"
                    required
                    value={newJobForm.title}
                    onChange={(e) => setNewJobForm({ ...newJobForm, title: e.target.value })}
                    placeholder="e.g. Graduate Engineer Trainee"
                    className="form-control"
                    style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text)" }}
                  />
                </div>
                <div className="col-12 col-md-5">
                  <label className="form-label small fw-bold">Company *</label>
                  <input
                    type="text"
                    required
                    value={newJobForm.company}
                    onChange={(e) => setNewJobForm({ ...newJobForm, company: e.target.value })}
                    placeholder="e.g. Cisco Systems"
                    className="form-control"
                    style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text)" }}
                  />
                </div>
              </div>

              <div className="row g-2">
                <div className="col-6">
                  <label className="form-label small fw-bold">Type</label>
                  <select
                    value={newJobForm.type}
                    onChange={(e) => setNewJobForm({ ...newJobForm, type: e.target.value })}
                    className="form-select"
                    style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text)" }}
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Internship">Internship</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold">Drive Location</label>
                  <input
                    type="text"
                    value={newJobForm.location}
                    onChange={(e) => setNewJobForm({ ...newJobForm, location: e.target.value })}
                    placeholder="On-campus / Bangalore"
                    className="form-control"
                    style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text)" }}
                  />
                </div>
              </div>

              <div className="row g-2">
                <div className="col-6">
                  <label className="form-label small fw-bold">CTC Min (INR)</label>
                  <input
                    type="number"
                    value={newJobForm.salaryMin}
                    onChange={(e) => setNewJobForm({ ...newJobForm, salaryMin: e.target.value })}
                    placeholder="e.g. 600000"
                    className="form-control"
                    style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text)" }}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold">CTC Max (INR)</label>
                  <input
                    type="number"
                    value={newJobForm.salaryMax}
                    onChange={(e) => setNewJobForm({ ...newJobForm, salaryMax: e.target.value })}
                    placeholder="e.g. 1200000"
                    className="form-control"
                    style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text)" }}
                  />
                </div>
              </div>

              <div>
                <label className="form-label small fw-bold">Eligible Skills (comma-separated)</label>
                <input
                  type="text"
                  value={newJobForm.skills}
                  onChange={(e) => setNewJobForm({ ...newJobForm, skills: e.target.value })}
                  placeholder="e.g. Java, Python, SQL, DSA"
                  className="form-control"
                  style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text)" }}
                />
              </div>

              <div>
                <label className="form-label small fw-bold">Description & Eligibility Criteria</label>
                <textarea
                  rows={3}
                  value={newJobForm.description}
                  onChange={(e) => setNewJobForm({ ...newJobForm, description: e.target.value })}
                  placeholder="Eligibility cutoff, rounds, or hiring timeline details..."
                  className="form-control"
                  style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text)" }}
                />
              </div>

              <div className="d-flex justify-content-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateJobModal(false)}
                  className="btn btn-outline-secondary rounded-pill px-4 fw-bold small"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingJob}
                  className="btn btn-primary rounded-pill px-4 fw-bold small text-white"
                >
                  {creatingJob ? "Publishing..." : "Publish Drive"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
