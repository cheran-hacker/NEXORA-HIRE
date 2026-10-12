import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Briefcase,
  FileCheck,
  Target,
  TrendingUp,
  Calendar,
  ChevronRight,
  Shield,
  Activity,
  User,
  Users,
  ClipboardCheck,
  ArrowRight,
  BookOpen,
  Star,
  AlertCircle,
  MapPin,
  BrainCircuit,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import ChartWidget from "../../widgets/ChartWidget.jsx";
import { studentService } from "../../services/api.js";
import TrajectoryVisualizer from "../../components/student/TrajectoryVisualizer.jsx";
import { useAuth } from "../../context/AuthContext";
import CompanyLogo from "../../components/common/CompanyLogo.jsx";
const StudentDashboard = () => {
  const [stats, setStats] = useState(null);
  const [digitalTwin, setDigitalTwin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statsRes, twinRes] = await Promise.all([
          studentService.getStats(),
          studentService.getDigitalTwin()
        ]);
        setStats(statsRes.data);
        setDigitalTwin(twinRes.data?.data);
      } catch (err) {
        console.error("Error fetching student stats:", err);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);
  if (loading) {
    return (
      <div
        className="container-fluid py-4 px-xl-5"
        style={{ background: "#F8FAFC", minHeight: "100dvh" }}
      >
        {" "}
        <div className="row g-4">
          {" "}
          <div className="col-12">
            <div
              className="bg-card rounded-4 p-5 placeholder-glow shadow-sm border"
              style={{ borderColor: "#E2E8F0" }}
            >
              <span className="placeholder col-6"></span>
            </div>
          </div>{" "}
          {[1, 2, 3, 4].map((i) => (
            <div className="col-sm-6 col-xl-3" key={i}>
              {" "}
              <div
                className="bg-card rounded-4 p-4 shadow-sm placeholder-glow border"
                style={{ borderColor: "#E2E8F0" }}
              >
                <span className="placeholder col-4"></span>
              </div>{" "}
            </div>
          ))}{" "}
        </div>{" "}
      </div>
    );
  }
  if (error || !stats) {
    return (
      <div
        className="d-flex flex-column justify-content-center align-items-center"
        style={{ height: "70vh", background: "#F8FAFC" }}
      >
        {" "}
        <AlertCircle size={48} className="text-danger mb-3" />{" "}
        <h4 className="fw-bold" style={{ color: "#1E293B" }}>
          Something went wrong
        </h4>{" "}
        <p className="text-muted">{error}</p>{" "}
        <button
          className="btn btn-primary rounded-pill mt-2 px-4"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>{" "}
      </div>
    );
  }
  const {
    profileSummary,
    upcomingAssessments,
    upcomingInterviews,
    recentActivityTimeline,
    skillsProgress,
    weeklyPerformance,
    kpis,
    recentApplications,
    recommendedJobs,
  } = stats;
  const realName =
    profileSummary?.name?.split(" ")[0] ||
    user?.name?.split(" ")[0] ||
    "Student";
  const profileCompletion = profileSummary?.readiness || 0;

  const formatSalary = (salary) => {
    if (!salary) return "Competitive";
    if (typeof salary === "string") return salary;
    if (typeof salary === "object") {
      if (salary.hidden) return "Competitive";
      if (salary.min && salary.max) {
        return `₹${Math.round(salary.min / 100000)}-${Math.round(salary.max / 100000)} LPA`;
      }
      if (salary.min) return `₹${Math.round(salary.min / 100000)} LPA+`;
      if (salary.max) return `Up to ₹${Math.round(salary.max / 100000)} LPA`;
      return "Competitive";
    }
    return String(salary);
  };

  const formatLocation = (loc) => {
    if (!loc) return "Remote";
    if (typeof loc === "string") return loc;
    if (typeof loc === "object") {
      return loc.city || loc.type || loc.country || "Remote";
    }
    return String(loc);
  };

  const formatCompany = (comp) => {
    if (!comp) return "Hiring Partner";
    if (typeof comp === "string") return comp;
    if (typeof comp === "object") return comp.name || "Hiring Partner";
    return String(comp);
  };
  return (
    <div
      className="container-fluid py-4 px-xl-5"
      style={{ background: "transparent" }}
    >
      {" "}
      {/* ── Master UI Hero Greeting (Screen 2) ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4 p-4 rounded-4 shadow-sm"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)"
        }}
      >
        <div>
          <h1
            className="fw-black mb-1 d-flex align-items-center gap-2"
            style={{
              fontSize: "2.2rem",
              letterSpacing: "-0.025em",
              color: "var(--text)",
            }}
          >
            Hi, {realName} <span role="img" aria-label="wave">👋</span>
          </h1>
          <p className="fs-6 text-muted mb-0">
            Let's build your bright future today.
          </p>
        </div>

        <div className="d-flex flex-wrap gap-2">
          <button
            onClick={() => navigate("/student/profile")}
            className="btn btn-outline-secondary rounded-pill fw-semibold px-3 py-2 d-flex align-items-center gap-2 small"
            style={{ background: "transparent", color: "var(--text)", borderColor: "var(--border)" }}
          >
            <User size={16} /> My Profile
          </button>
          <button
            onClick={() => navigate("/student/resume")}
            className="btn btn-outline-secondary rounded-pill fw-semibold px-3 py-2 d-flex align-items-center gap-2 small"
            style={{ background: "transparent", color: "var(--text)", borderColor: "var(--border)" }}
          >
            <FileCheck size={16} /> Smart Resume
          </button>
          <button
            onClick={() => navigate("/student/jobs")}
            className="btn btn-primary rounded-pill fw-semibold px-4 py-2 d-flex align-items-center gap-2 small shadow-sm text-white"
          >
            <Briefcase size={16} /> Explore Jobs
          </button>
        </div>
      </motion.div>

      {/* ── 4 Flagship KPI Cards (Matches Screen 2 & Screen 16 Master UI) ── */}
      <div className="row g-3 g-lg-4 mb-4">
        {/* 1. Career Readiness */}
        <div className="col-6 col-lg-3">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="p-3 p-md-4 rounded-4 shadow-sm h-100 d-flex align-items-center gap-3 hover-lift"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
            }}
          >
            <div
              className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
              style={{
                width: 48,
                height: 48,
                background: "rgba(236, 72, 153, 0.15)",
                color: "#ec4899",
              }}
            >
              <Target size={24} />
            </div>
            <div>
              <span className="small text-muted fw-bold text-uppercase tracking-wider" style={{ fontSize: "0.75rem" }}>
                Career Readiness
              </span>
              <div className="d-flex align-items-baseline gap-2 mt-0.5">
                <span className="fw-black mb-0" style={{ fontSize: "1.75rem", color: "var(--text)", lineHeight: 1 }}>
                  {profileSummary?.readiness || 78}%
                </span>
                <span className="small fw-bold text-success d-flex align-items-center" style={{ fontSize: "0.8rem" }}>
                  <TrendingUp size={12} className="me-0.5" /> +5%
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 2. Skill Gap */}
        <div className="col-6 col-lg-3">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-3 p-md-4 rounded-4 shadow-sm h-100 d-flex align-items-center gap-3 hover-lift"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
            }}
          >
            <div
              className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
              style={{
                width: 48,
                height: 48,
                background: "rgba(16, 185, 129, 0.15)",
                color: "#10b981",
              }}
            >
              <AlertCircle size={24} />
            </div>
            <div>
              <span className="small text-muted fw-bold text-uppercase tracking-wider" style={{ fontSize: "0.75rem" }}>
                Skill Gap
              </span>
              <div className="d-flex align-items-baseline gap-2 mt-0.5">
                <span className="fw-black mb-0" style={{ fontSize: "1.75rem", color: "var(--text)", lineHeight: 1 }}>
                  5 skills
                </span>
                <span className="small text-muted" style={{ fontSize: "0.75rem" }}>
                  gap
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 3. Applications */}
        <div className="col-6 col-lg-3">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="p-3 p-md-4 rounded-4 shadow-sm h-100 d-flex align-items-center gap-3 hover-lift"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
            }}
          >
            <div
              className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
              style={{
                width: 48,
                height: 48,
                background: "rgba(245, 158, 11, 0.15)",
                color: "#f59e0b",
              }}
            >
              <Briefcase size={24} />
            </div>
            <div>
              <span className="small text-muted fw-bold text-uppercase tracking-wider" style={{ fontSize: "0.75rem" }}>
                Applications
              </span>
              <div className="d-flex align-items-baseline gap-2 mt-0.5">
                <span className="fw-black mb-0" style={{ fontSize: "1.75rem", color: "var(--text)", lineHeight: 1 }}>
                  8
                </span>
                <span className="small text-muted" style={{ fontSize: "0.75rem" }}>
                  3 in progress
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 4. Alumni Matches */}
        <div className="col-6 col-lg-3">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-3 p-md-4 rounded-4 shadow-sm h-100 d-flex align-items-center gap-3 hover-lift"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
            }}
          >
            <div
              className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
              style={{
                width: 48,
                height: 48,
                background: "rgba(59, 130, 246, 0.15)",
                color: "#3b82f6",
              }}
            >
              <User size={24} />
            </div>
            <div>
              <span className="small text-muted fw-bold text-uppercase tracking-wider" style={{ fontSize: "0.75rem" }}>
                Alumni Matches
              </span>
              <div className="d-flex align-items-baseline gap-2 mt-0.5">
                <span className="fw-black mb-0" style={{ fontSize: "1.75rem", color: "var(--text)", lineHeight: 1 }}>
                  12
                </span>
                <span className="small text-primary fw-semibold" style={{ fontSize: "0.75rem" }}>
                  Recommended
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Recommended Jobs (Matches Screen 2 & Screen 16 Master UI) ── */}
      <div className="mb-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h5 className="fw-bold m-0" style={{ color: "var(--text)" }}>
            Recommended Jobs
          </h5>
          <button
            onClick={() => navigate("/student/jobs")}
            className="btn btn-sm btn-link text-decoration-none fw-semibold p-0"
            style={{ color: "#3b82f6" }}
          >
            View All →
          </button>
        </div>

        <div className="row g-3">
          {(recommendedJobs && recommendedJobs.length > 0
            ? recommendedJobs.slice(0, 3)
            : [
                {
                  id: "rec-1",
                  title: "Software Engineer",
                  company: "Google",
                  salary: "₹12-18 LPA",
                  location: "Remote",
                  type: "Full-time",
                },
                {
                  id: "rec-2",
                  title: "Data Analyst",
                  company: "Amazon",
                  salary: "₹8-12 LPA",
                  location: "Bangalore",
                  type: "Full-time",
                },
                {
                  id: "rec-3",
                  title: "Frontend Developer",
                  company: "Microsoft",
                  salary: "₹10-15 LPA",
                  location: "Hyderabad",
                  type: "Full-time",
                },
              ]
          ).map((job, idx) => {
            const companyName = formatCompany(job.company);
            const displaySalary = formatSalary(job.salary);
            const displayLocation = formatLocation(job.location);

            return (
              <div key={job.id || job._id || idx} className="col-md-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  className="p-3 p-md-4 rounded-4 shadow-sm h-100 d-flex flex-column justify-content-between hover-lift"
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    cursor: "pointer",
                  }}
                  onClick={() => navigate(`/student/jobs/${job.id || job._id || ""}`)}
                >
                  <div className="d-flex align-items-start gap-3 mb-3">
                    <div
                      className="rounded-3 p-2 d-flex align-items-center justify-content-center shadow-sm flex-shrink-0"
                      style={{
                        width: 48,
                        height: 48,
                        background: "var(--surface-2, #ffffff)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <CompanyLogo company={companyName} size={28} />
                    </div>
                    <div>
                      <h6 className="fw-bold mb-0 text-truncate" style={{ color: "var(--text)", maxWidth: "160px" }}>
                        {job.title}
                      </h6>
                      <span className="small text-muted">{companyName}</span>
                    </div>
                  </div>

                  <div>
                    <div className="fw-bold mb-2" style={{ color: "var(--text)", fontSize: "0.95rem" }}>
                      {displaySalary}
                    </div>
                    <div className="d-flex gap-2 flex-wrap">
                      <span
                        className="badge rounded-pill fw-medium"
                        style={{
                          background: "rgba(59, 130, 246, 0.1)",
                          color: "#3b82f6",
                          fontSize: "0.75rem",
                        }}
                      >
                        {displayLocation}
                      </span>
                      <span
                        className="badge rounded-pill fw-medium"
                        style={{
                          background: "rgba(16, 185, 129, 0.1)",
                          color: "#10b981",
                          fontSize: "0.75rem",
                        }}
                      >
                        {job.type || "Full-time"}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
{" "}
      <div className="row g-4 mb-4">
        {" "}
        {/* ── Weekly Performance Chart ── */}{" "}
        <div className="col-xl-8">
          {" "}
          <div
            className="rounded-4 p-4 shadow-sm h-100 premium-glass-panel"
          >
            {" "}
            <div className="d-flex justify-content-between align-items-center mb-4">
              {" "}
              <h5 className="fw-bold m-0" style={{ color: 'var(--premium-text-main)' }}>
                Weekly Performance
              </h5>{" "}
              <select
                className="form-select form-select-sm w-auto border-0 fw-semibold text-muted"
                style={{ background: "transparent" }}
              >
                {" "}
                <option>Last 7 Days</option>{" "}
              </select>{" "}
            </div>{" "}
            {(!weeklyPerformance?.assessments ||
              weeklyPerformance.assessments.length === 0 ||
              weeklyPerformance.assessments.every((v) => v === 0)) &&
            (!weeklyPerformance?.applications ||
              weeklyPerformance.applications.length === 0 ||
              weeklyPerformance.applications.every((v) => v === 0)) ? (
              <div
                className="d-flex flex-column align-items-center justify-content-center h-75 p-5 rounded-3"
                style={{
                  border: "1px dashed var(--premium-border)",
                  background: "transparent",
                }}
              >
                {" "}
                <TrendingUp
                  size={48}
                  className="text-muted opacity-25 mb-3"
                />{" "}
                <h6 className="fw-bold" style={{ color: 'var(--premium-text-main)' }}>
                  No performance data yet
                </h6>{" "}
                <p className="text-muted small text-center mb-3">
                  Complete an assessment or apply for an opportunity to start
                  tracking your progress.
                </p>{" "}
                <button
                  onClick={() => navigate("/student/assessments")}
                  className="btn btn-outline-primary btn-sm rounded-pill px-4 fw-semibold"
                >
                  Take Assessment
                </button>{" "}
              </div>
            ) : (
              <div style={{ height: "300px" }}>
                {" "}
                <ChartWidget
                  type="line"
                  labels={weeklyPerformance?.labels || []}
                  datasets={[
                    {
                      label: "Assessments",
                      data: weeklyPerformance?.assessments || [],
                      color: "#6366F1",
                    },
                    {
                      label: "Applications",
                      data: weeklyPerformance?.applications || [],
                      color: "#10B981",
                    },
                    {
                      label: "Interviews",
                      data: weeklyPerformance?.interviews || [],
                      color: "#F59E0B",
                    },
                    {
                      label: "Learning",
                      data: weeklyPerformance?.learning || [],
                      color: "#8B5CF6",
                    },
                  ]}
                  height={300}
                />{" "}
              </div>
            )}{" "}
          </div>{" "}
        </div>{" "}
        {/* ── Profile Completion & AI Coach ── */}{" "}
        <div className="col-xl-4 d-flex flex-column gap-4">
          {" "}
          <div
            className="rounded-4 p-4 shadow-sm d-flex align-items-center gap-4 premium-glass-panel"
          >
            {" "}
            <div
              className="position-relative d-flex align-items-center justify-content-center flex-shrink-0"
              style={{ width: 80, height: 80 }}
            >
              {" "}
              <svg viewBox="0 0 36 36" className="w-100 h-100">
                {" "}
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="var(--premium-border)"
                  strokeWidth="3"
                />{" "}
                <path
                  strokeDasharray={`${profileCompletion}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  style={{ transition: "stroke-dasharray 1s ease-out" }}
                />{" "}
              </svg>{" "}
              <div className="position-absolute d-flex flex-column align-items-center justify-content-center">
                {" "}
                <span
                  className="fw-bold"
                  style={{
                    fontSize: "1.2rem",
                    lineHeight: 1,
                    color: 'var(--premium-text-main)',
                  }}
                >
                  {profileCompletion}%
                </span>{" "}
              </div>{" "}
            </div>{" "}
            <div>
              {" "}
              <h6 className="fw-bold m-0 mb-1" style={{ color: 'var(--premium-text-main)' }}>
                Profile Completion
              </h6>{" "}
              <p className="small text-muted m-0 mb-2">
                {profileCompletion === 0
                  ? "Profile is empty."
                  : "Keep updating your profile."}
              </p>{" "}
              <button
                onClick={() => navigate("/student/profile")}
                className="btn btn-link p-0 text-decoration-none fw-semibold"
                style={{ fontSize: "0.85rem" }}
              >
                Complete Profile <ArrowRight size={14} />
              </button>{" "}
            </div>{" "}
          </div>{" "}
          <div
            className="rounded-4 p-4 shadow-sm flex-grow-1 d-flex flex-column premium-glass-panel"
          >
            {" "}
            <div className="d-flex align-items-center gap-2 mb-3">
              {" "}
              <div className="p-2 rounded-3 bg-primary-subtle text-primary">
                <Activity size={20} />
              </div>{" "}
              <h6 className="fw-bold m-0" style={{ color: 'var(--premium-text-main)' }}>
                AI Career Coach
              </h6>{" "}
            </div>{" "}
            {profileSummary?.readiness > 0 ? (
              <>
                {" "}
                <p className="small text-muted mb-4 flex-grow-1">
                  Your AI Coach has analyzed your readiness and skills. Review
                  your roadmap to stay on track.
                </p>{" "}
                <button
                  onClick={() => navigate("/student/pulse")}
                  className="btn btn-primary w-100 rounded-pill fw-semibold"
                >
                  View Career Roadmap
                </button>{" "}
              </>
            ) : (
              <>
                {" "}
                <div className="text-center py-3 flex-grow-1 d-flex flex-column justify-content-center">
                  {" "}
                  <p className="text-muted small fw-medium">
                    AI Career Coach is not configured yet.
                  </p>{" "}
                </div>{" "}
                <button
                  onClick={() => navigate("/student/pulse")}
                  className="btn btn-outline-primary w-100 rounded-pill fw-semibold bg-surface border-border"
                >
                  Setup AI Coach
                </button>{" "}
              </>
            )}{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
      <div className="row g-4 mb-4">
        {" "}
        {/* ── Career Digital Twin Gap Analysis ── */}{" "}
        <div className="col-lg-6">
          {" "}
          <div
            className="rounded-4 p-4 shadow-sm h-100 premium-glass-panel"
          >
            {" "}
            <div className="d-flex justify-content-between align-items-center mb-4">
              {" "}
              <h5 className="fw-bold m-0" style={{ color: 'var(--premium-text-main)' }}>
                Career Digital Twin Map
              </h5>{" "}
              <button
                onClick={() => navigate("/student/resume")}
                className="btn btn-sm btn-outline-secondary rounded-pill px-3 bg-surface border-border fw-medium"
              >
                Analyze Target Role
              </button>{" "}
            </div>{" "}
            
            {digitalTwin ? (
              <div className="d-flex flex-column gap-3">
                <div className="d-flex justify-content-between align-items-center mb-2 pb-3 border-bottom border-subtle">
                   <div className="text-muted fw-semibold">Target Role</div>
                   <div className="fw-bold text-primary">{digitalTwin.targetRole}</div>
                </div>
                
                <div className="d-flex justify-content-between align-items-center mb-2">
                   <div className="text-muted fw-semibold">Overall Match</div>
                   <div className="fw-bold text-success" style={{ fontSize: '1.2rem' }}>{digitalTwin.matchPercentage}%</div>
                </div>

                <div className="mb-2">
                  <div className="text-muted fw-semibold mb-2">Existing Required Skills</div>
                  <div className="d-flex flex-wrap gap-2">
                    {digitalTwin.existingSkills?.map(s => (
                       <span key={s} className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">{s}</span>
                    ))}
                    {(!digitalTwin.existingSkills || digitalTwin.existingSkills.length === 0) && (
                      <span className="small text-muted">No matched skills</span>
                    )}
                  </div>
                </div>

                <div className="mb-2">
                  <div className="text-muted fw-semibold mb-2">Missing Skills to Acquire</div>
                  <div className="d-flex flex-wrap gap-2">
                    {digitalTwin.missingSkills?.map(s => (
                       <span key={s} className="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1">{s}</span>
                    ))}
                    {(!digitalTwin.missingSkills || digitalTwin.missingSkills.length === 0) && (
                      <span className="small text-muted">No missing skills!</span>
                    )}
                  </div>
                </div>
                
                {digitalTwin.recommendations?.length > 0 && (
                  <div className="mt-3 p-3 bg-light rounded-3">
                    <div className="text-muted small fw-bold mb-2">RECOMMENDATIONS</div>
                    {digitalTwin.recommendations.map((rec, i) => (
                      <div key={i} className="small text-foreground mb-1 d-flex gap-2">
                        <AlertCircle size={14} className="text-warning flex-shrink-0 mt-1" />
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="d-flex flex-column align-items-center justify-content-center h-100 text-center text-muted p-4">
                {" "}
                <Target size={40} className="mb-3 opacity-25" />{" "}
                <p className="fw-medium small">
                  No Digital Twin analysis available yet.
                </p>{" "}
                <button
                  className="btn btn-sm btn-outline-primary rounded-pill mt-2 fw-medium"
                  onClick={() => navigate("/student/settings")}
                >
                  Set Target Role
                </button>{" "}
              </div>
            )}{" "}
          </div>{" "}
        </div>{" "}
        {/* ── Skill Gap Analysis ── */}{" "}
        <div className="col-lg-6">
          {" "}
          <div
            className="rounded-4 p-4 shadow-sm h-100 premium-glass-panel"
          >
            {" "}
            <div className="d-flex justify-content-between align-items-center mb-4">
              {" "}
              <h5 className="fw-bold m-0" style={{ color: 'var(--premium-text-main)' }}>
                Skill Gap Analysis
              </h5>{" "}
              <button
                onClick={() => navigate("/student/resume")}
                className="btn btn-sm btn-outline-secondary rounded-pill px-3 bg-surface border-border fw-medium"
              >
                Analyze Skills
              </button>{" "}
            </div>{" "}
            {stats.aiSkillGap && stats.aiSkillGap.length > 0 ? (
              <div className="d-flex flex-column gap-3">
                {" "}
                {stats.aiSkillGap.map((gap, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-3 border"
                    style={{
                      borderColor: "var(--premium-border)",
                      background: "transparent",
                    }}
                  >
                    {" "}
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      {" "}
                      <span
                        className="fw-bold"
                        style={{ color: 'var(--premium-text-main)' }}
                      >
                        {gap.skill}
                      </span>{" "}
                      <span
                        className="badge text-foreground border-subtle"
                        style={{
                          background: "var(--surface)",
                          color: "var(--text) !important",
                        }}
                      >
                        Match:{" "}
                        {Math.round((gap.yourLevel / gap.requiredLevel) * 100)}%
                      </span>{" "}
                    </div>{" "}
                    <div className="d-flex align-items-center gap-3 small text-muted">
                      {" "}
                      <span>
                        Your Level:{" "}
                        <strong
                          className={
                            gap.yourLevel >= gap.requiredLevel
                              ? "text-success"
                              : "text-danger"
                          }
                        >
                          {gap.yourLevel}
                        </strong>
                      </span>{" "}
                      <span>
                        Required: <strong>{gap.requiredLevel}</strong>
                      </span>{" "}
                    </div>{" "}
                    {gap.yourLevel < gap.requiredLevel && (
                      <div className="mt-2 text-danger small fw-medium">
                        <AlertCircle
                          size={14}
                          className="me-1"
                          style={{ marginTop: "-2px" }}
                        />{" "}
                        {gap.recommendation}
                      </div>
                    )}{" "}
                  </div>
                ))}{" "}
              </div>
            ) : (
              <div className="d-flex flex-column align-items-center justify-content-center h-100 text-center text-muted p-4">
                {" "}
                <Target size={40} className="mb-3 opacity-25" />{" "}
                <p className="fw-medium small">
                  No skill analysis available yet.
                </p>{" "}
              </div>
            )}{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}

      {/* ── Upcoming Activities & Career Roadmap (Screen 2) ── */}
      <div className="row g-4 mb-4">
        {/* Upcoming Activities */}
        <div className="col-lg-6">
          <div className="bento-card p-4 rounded-4 shadow-sm h-100" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <h5 className="fw-bold mb-3" style={{ color: "var(--text)" }}>Upcoming Activities</h5>
            <div className="d-flex flex-column gap-3">
              {[
                { title: "Resume Analysis", sub: "ATS Optimization & Feedback", time: "In 2 hrs", icon: FileCheck, color: "#10b981", link: "/student/resume" },
                { title: "AI Mock Interview", sub: "Technical SWE Practice", time: "Tomorrow", icon: BrainCircuit, color: "#6366f1", link: "/student/mock-interview" },
                { title: "Alumni Consultation", sub: "1:1 Session with Arjun Mehta", time: "Oct 15", icon: Users, color: "#0ea5e9", link: "/student/mentorship" }
              ].map((act, i) => (
                <div key={i} className="d-flex align-items-center justify-content-between p-3 rounded-3" style={{ background: "var(--surface-2, rgba(255,255,255,0.02))", border: "1px solid var(--border)" }}>
                  <div className="d-flex align-items-center gap-3">
                    <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 40, height: 40, background: `${act.color}20`, color: act.color }}>
                      <act.icon size={20} />
                    </div>
                    <div>
                      <h6 className="fw-bold mb-0 small" style={{ color: "var(--text)" }}>{act.title}</h6>
                      <span className="text-muted" style={{ fontSize: "0.78rem" }}>{act.sub}</span>
                    </div>
                  </div>
                  <span className="badge rounded-pill bg-secondary bg-opacity-25 text-muted small">{act.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Career Roadmap Stepper */}
        <div className="col-lg-6">
          <div className="bento-card p-4 rounded-4 shadow-sm h-100" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold m-0" style={{ color: "var(--text)" }}>Career Roadmap</h5>
              <span className="badge bg-primary-subtle text-primary rounded-pill small">Target: Software Engineer</span>
            </div>
            <p className="small text-muted mb-4">Milestone track to land your target offer at top companies.</p>

            <div className="d-flex align-items-center justify-content-between position-relative px-2 my-4">
              <div className="position-absolute start-0 end-0 top-50 translate-middle-y" style={{ height: "3px", background: "var(--border)", zIndex: 0 }} />
              {[
                { label: "Learn", active: true, done: true },
                { label: "Practice", active: true, done: true },
                { label: "Network", active: true, done: false },
                { label: "Apply", active: false, done: false },
                { label: "Get Hired", active: false, done: false },
              ].map((step, idx) => (
                <div key={idx} className="d-flex flex-column align-items-center z-1 text-center" style={{ width: 60 }}>
                  <div
                    className={`rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm mb-2 ${
                      step.done ? "bg-success text-white" : step.active ? "bg-primary text-white" : "text-muted"
                    }`}
                    style={{
                      width: 32,
                      height: 32,
                      background: step.done ? "#10b981" : step.active ? "var(--primary)" : "var(--surface-2)",
                      border: "2px solid var(--border)",
                      fontSize: "0.8rem",
                    }}
                  >
                    {step.done ? "✓" : idx + 1}
                  </div>
                  <span className="small fw-bold" style={{ fontSize: "0.75rem", color: step.active ? "var(--text)" : "var(--text-muted)" }}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>{" "}
      <div className="row g-4">
        {" "}
        {/* ── Recent Applications ── */}{" "}
        <div className="col-lg-6">
          {" "}
          <div
            className="rounded-4 p-4 shadow-sm h-100 premium-glass-panel"
          >
            {" "}
            <h5 className="fw-bold m-0 mb-4" style={{ color: 'var(--premium-text-main)' }}>
              Recent Applications
            </h5>{" "}
            {recentApplications && recentApplications.length > 0 ? (
              <div className="d-flex flex-column gap-2">
                {" "}
                {recentApplications.map((app) => (
                  <div
                    key={app.id}
                    className="d-flex align-items-center justify-content-between p-3 rounded-3 border"
                    style={{ borderColor: "var(--premium-border)" }}
                  >
                    {" "}
                    <div>
                      {" "}
                      <div className="fw-bold" style={{ color: 'var(--premium-text-main)' }}>
                        {app.role}
                      </div>{" "}
                      <div className="small text-muted">
                        {app.company} •{" "}
                        {new Date(app.date).toLocaleDateString()}
                      </div>{" "}
                    </div>{" "}
                    <div>
                      {" "}
                      <span
                        className={`badge rounded-pill px-3 py-2 fw-semibold ${app.status === "Applied" ? "bg-secondary text-foreground" : app.status === "Under Review" ? "bg-warning text-foreground" : app.status === "Interview" ? "bg-info text-white" : app.status === "Selected" ? "bg-success text-white" : "bg-danger text-white"}`}
                      >
                        {" "}
                        {app.status}{" "}
                      </span>{" "}
                    </div>{" "}
                  </div>
                ))}{" "}
              </div>
            ) : (
              <div
                className="d-flex flex-column align-items-center justify-content-center text-center text-muted p-5 rounded-3"
                style={{
                  border: "1px dashed var(--premium-border)",
                  background: "transparent",
                }}
              >
                {" "}
                <BookOpen size={40} className="mb-3 opacity-25" />{" "}
                <p className="fw-medium small mb-3">No applications yet.</p>{" "}
                <button
                  onClick={() => navigate("/student/jobs")}
                  className="btn btn-outline-primary btn-sm rounded-pill px-4 fw-semibold bg-surface border-border"
                >
                  Explore Jobs
                </button>{" "}
              </div>
            )}{" "}
          </div>{" "}
        </div>{" "}
        {/* ── Upcoming Assessments & Events ── */}{" "}
        <div className="col-lg-6">
          {" "}
          <div
            className="rounded-4 p-4 shadow-sm h-100 premium-glass-panel"
          >
            {" "}
            <h5 className="fw-bold m-0 mb-4" style={{ color: 'var(--premium-text-main)' }}>
              Upcoming Schedule
            </h5>{" "}
            <div className="mb-4">
              {" "}
              <h6
                className="fw-semibold text-muted text-uppercase small mb-3"
                style={{ letterSpacing: "1px" }}
              >
                Assessments
              </h6>{" "}
              {upcomingAssessments && upcomingAssessments.length > 0 ? (
                <div className="d-flex flex-column gap-2">
                  {" "}
                  {upcomingAssessments.map((a, i) => (
                    <div
                      key={i}
                      className="d-flex justify-content-between align-items-center p-3 rounded-3 border border-primary-subtle bg-primary-subtle"
                      style={{ "--bs-bg-opacity": 0.1 }}
                    >
                      {" "}
                      <div>
                        {" "}
                        <div className="fw-bold text-primary">
                          {a.title}
                        </div>{" "}
                        <div className="small text-muted">
                          {a.duration} mins
                        </div>{" "}
                      </div>{" "}
                      <button
                        onClick={() => navigate("/student/assessments")}
                        className="btn btn-sm btn-primary rounded-pill px-3 fw-semibold"
                      >
                        Start
                      </button>{" "}
                    </div>
                  ))}{" "}
                </div>
              ) : (
                <div
                  className="p-3 text-center text-muted rounded-3 border small"
                  style={{
                    background: "transparent",
                    borderColor: "var(--premium-border)",
                  }}
                >
                  {" "}
                  No upcoming assessments.{" "}
                </div>
              )}{" "}
            </div>{" "}
            <div>
              {" "}
              <h6
                className="fw-semibold text-muted text-uppercase small mb-3"
                style={{ letterSpacing: "1px" }}
              >
                Events
              </h6>{" "}
              {stats.events && stats.events.length > 0 ? (
                <div className="d-flex flex-column gap-2">
                  {" "}
                  {stats.events.map((e, i) => (
                    <div
                      key={i}
                      className="d-flex justify-content-between align-items-center p-3 rounded-3 border"
                      style={{
                        borderColor: "var(--purple)",
                        background: "rgba(var(--purple-rgb), 0.1)",
                      }}
                    >
                      {" "}
                      <div>
                        {" "}
                        <div
                          className="fw-bold"
                          style={{ color: "var(--purple)" }}
                        >
                          {e.title}
                        </div>{" "}
                        <div className="small text-muted">
                          {new Date(e.date).toLocaleDateString()}
                        </div>{" "}
                      </div>{" "}
                      <button
                        onClick={() => navigate("/student/event-dao")}
                        className="btn btn-sm text-foreground rounded-pill px-3 fw-semibold"
                        style={{ background: "var(--purple)" }}
                      >
                        Register
                      </button>{" "}
                    </div>
                  ))}{" "}
                </div>
              ) : (
                <div
                  className="p-3 text-center text-muted rounded-3 border small"
                  style={{
                    background: "transparent",
                    borderColor: "var(--premium-border)",
                  }}
                >
                  {" "}
                  No upcoming events.{" "}
                </div>
              )}{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}

      {/* ── Trajectory Visualizer ── */}
      <div className="row g-4 mb-4">
        <div className="col-12">
          <TrajectoryVisualizer />
        </div>
      </div>
    </div>
  );
};
export default StudentDashboard;
