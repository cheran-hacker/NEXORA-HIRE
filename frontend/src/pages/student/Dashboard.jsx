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
import { studentService, bountyService, mentorshipService } from "../../services/api.js";
import { DollarSign, Zap, Video, CheckCircle2, Clock, Check, RotateCcw, Sparkles } from "lucide-react";
import TrajectoryVisualizer from "../../components/student/TrajectoryVisualizer.jsx";
import { useAuth } from "../../context/AuthContext";
import CompanyLogo from "../../components/common/CompanyLogo.jsx";

const POPULAR_TARGET_ROLES = [
  "Full Stack Developer",
  "Frontend Engineer",
  "Backend Developer",
  "AI / Machine Learning Engineer",
  "Data Scientist",
  "DevOps & Cloud Engineer",
  "Product Designer",
  "Cybersecurity Specialist"
];

const StudentDashboard = () => {
  const [stats, setStats] = useState(null);
  const [digitalTwin, setDigitalTwin] = useState(null);
  const [openBounties, setOpenBounties] = useState([]);
  const [mentorshipData, setMentorshipData] = useState({ sessions: [], requests: [] });
  const [careerTarget, setCareerTarget] = useState({
    targetRole: "",
    history: [],
    updatedAt: null,
    isConfigured: false
  });
  const [loadingCareerTarget, setLoadingCareerTarget] = useState(true);
  const [targetRoleInput, setTargetRoleInput] = useState("");
  const [isSavingTarget, setIsSavingTarget] = useState(false);
  const [targetMessage, setTargetMessage] = useState(null);
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  const fetchCareerTarget = async () => {
    setLoadingCareerTarget(true);
    try {
      const res = await studentService.getCareerTarget();
      if (res?.data?.data) {
        const data = res.data.data;
        setCareerTarget({
          targetRole: data.targetRole || "",
          history: data.history || [],
          updatedAt: data.updatedAt,
          isConfigured: data.isConfigured
        });
        setTargetRoleInput(data.targetRole || "");
      }
    } catch (err) {
      console.error("Failed to load career target & history:", err);
    } finally {
      setLoadingCareerTarget(false);
    }
  };

  const handleSaveTarget = async (roleToSave) => {
    const chosenRole = (roleToSave || targetRoleInput || "").trim();
    if (!chosenRole) {
      setTargetMessage({ type: 'error', text: 'Please enter or select a target role name.' });
      return;
    }
    setIsSavingTarget(true);
    setTargetMessage(null);
    try {
      const res = await studentService.updateCareerTarget({ targetRole: chosenRole });
      if (res?.data?.success) {
        const data = res.data.data;
        setCareerTarget({
          targetRole: data.targetRole,
          history: data.history || [],
          updatedAt: data.updatedAt,
          isConfigured: true
        });
        setTargetRoleInput(data.targetRole);
        setIsEditingTarget(false);
        setTargetMessage({
          type: 'success',
          text: `Target saved as "${data.targetRole}" and recorded in MongoDB history!`
        });
        if (setUser && user) {
          setUser({
            ...user,
            studentProfile: {
              ...(user.studentProfile || {}),
              targetCareerRole: data.targetRole,
              careerTarget: data.targetRole,
              preferredRoles: data.targetRole
            }
          });
        }
        setTimeout(() => setTargetMessage(null), 4000);
      }
    } catch (err) {
      console.error("Error updating career target:", err);
      setTargetMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to save career target.'
      });
    } finally {
      setIsSavingTarget(false);
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statsRes, twinRes, bountyRes, sessionsRes, requestsRes, targetRes] = await Promise.all([
          studentService.getStats(),
          studentService.getDigitalTwin(),
          bountyService.getOpenBounties({ status: 'Open' }).catch(() => ({ data: { data: [] } })),
          mentorshipService.getSessions().catch(() => ({ data: { data: [] } })),
          mentorshipService.getMyRequests().catch(() => ({ data: { data: [] } })),
          studentService.getCareerTarget().catch(() => ({ data: { data: null } }))
        ]);
        setStats(statsRes.data);
        setDigitalTwin(twinRes.data?.data);
        setOpenBounties(bountyRes.data?.data?.slice(0, 3) || []);
        setMentorshipData({
          sessions: sessionsRes.data?.data || [],
          requests: requestsRes.data?.data || []
        });
        if (targetRes.data?.data) {
          const tData = targetRes.data.data;
          setCareerTarget({
            targetRole: tData.targetRole || "",
            history: tData.history || [],
            updatedAt: tData.updatedAt,
            isConfigured: tData.isConfigured
          });
          setTargetRoleInput(tData.targetRole || "");
        }
        setLoadingCareerTarget(false);
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

      {/* ── Career Target & Persistent Role History Section ── */}
      <div className="row g-4 mb-4">
        {/* Left: Active Target Role & Role Selector */}
        <div className="col-lg-5">
          <div
            className="rounded-4 p-4 shadow-sm h-100 premium-glass-panel d-flex flex-column justify-content-between"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
            }}
          >
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="d-flex align-items-center gap-2">
                  <div
                    className="rounded-3 p-2 d-flex align-items-center justify-content-center text-primary"
                    style={{ background: "rgba(59, 130, 246, 0.12)" }}
                  >
                    <Target size={20} />
                  </div>
                  <div>
                    <h5 className="fw-bold m-0" style={{ color: "var(--text)" }}>
                      Career Target Role
                    </h5>
                    <span className="small text-muted" style={{ fontSize: "0.75rem" }}>
                      Stored persistently in MongoDB
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const inp = document.getElementById('input-career-target-role');
                    if (inp) {
                      inp.focus();
                      inp.select();
                    }
                  }}
                  className="btn btn-sm btn-outline-primary rounded-pill px-3 fw-medium"
                  style={{ fontSize: "0.8rem" }}
                  id="btn-toggle-change-target"
                >
                  Change Target
                </button>
              </div>

              {/* Current Active Target Display */}
              {loadingCareerTarget ? (
                <div className="py-4 text-center">
                  <div className="spinner-border spinner-border-sm text-primary mb-2" />
                  <div className="small text-muted">Loading target from DB...</div>
                </div>
              ) : careerTarget.targetRole ? (
                <div
                  className="p-3 rounded-4 mb-3"
                  style={{
                    background: "linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(139, 92, 246, 0.08))",
                    border: "1px solid rgba(59, 130, 246, 0.25)"
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 small d-inline-flex align-items-center gap-1">
                      <span
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          backgroundColor: "#10b981",
                          display: "inline-block"
                        }}
                      />
                      Active Target
                    </span>
                    {careerTarget.updatedAt && (
                      <span className="small text-muted" style={{ fontSize: "0.75rem" }}>
                        Updated {new Date(careerTarget.updatedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <h4 className="fw-black mb-1 mt-2 text-primary" id="current-target-role-name" style={{ letterSpacing: "-0.01em" }}>
                    {careerTarget.targetRole}
                  </h4>
                  <p className="small text-muted mb-0" style={{ fontSize: "0.82rem" }}>
                    All skill-gap models, recommendations, and roadmap milestones are aligned with this role.
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-4 mb-3 bg-light border text-center text-muted">
                  <Target size={28} className="opacity-25 mb-2" />
                  <div className="fw-semibold small">No career target configured yet</div>
                  <div className="small text-muted" style={{ fontSize: "0.78rem" }}>
                    Select your dream role below to record your target and begin tracking history.
                  </div>
                </div>
              )}

              {/* Success or Error Alert */}
              {targetMessage && (
                <div
                  id="target-save-alert"
                  className={`alert alert-${targetMessage.type === "success" ? "success" : "danger"} py-2 px-3 small rounded-3 mb-3 d-flex align-items-center gap-2`}
                >
                  {targetMessage.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  <span>{targetMessage.text}</span>
                </div>
              )}

              {/* Quick Target Switcher Input & Chips */}
              <div className="mb-3">
                <label className="form-label text-muted small fw-semibold d-flex justify-content-between align-items-center">
                  <span>Switch or Select Target Role</span>
                  <span className="text-muted" style={{ fontSize: "0.72rem" }}>
                    Records to MongoDB History
                  </span>
                </label>
                <div className="input-group mb-2">
                  <input
                    id="input-career-target-role"
                    type="text"
                    className="form-control"
                    placeholder="e.g. DevOps & Cloud Engineer"
                    value={targetRoleInput}
                    onChange={(e) => setTargetRoleInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveTarget(targetRoleInput);
                    }}
                  />
                  <button
                    id="btn-save-career-target"
                    className="btn btn-primary px-3 fw-semibold d-flex align-items-center gap-1"
                    type="button"
                    onClick={() => handleSaveTarget(targetRoleInput)}
                    disabled={isSavingTarget || !targetRoleInput.trim() || targetRoleInput.trim().toLowerCase() === (careerTarget.targetRole || '').toLowerCase()}
                  >
                    {isSavingTarget ? (
                      <span className="spinner-border spinner-border-sm" />
                    ) : (
                      <Check size={16} />
                    )}
                    <span>{isSavingTarget ? "Saving..." : "Save Role"}</span>
                  </button>
                </div>

                {/* Popular quick-select chips */}
                <div className="mt-2">
                  <span className="small text-muted fw-semibold" style={{ fontSize: "0.75rem" }}>
                    Popular Targets:
                  </span>
                  <div className="d-flex flex-wrap gap-1 mt-1">
                    {POPULAR_TARGET_ROLES.map((role) => {
                      const isCurrent = (careerTarget.targetRole || "").toLowerCase() === role.toLowerCase();
                      return (
                        <button
                          key={role}
                          type="button"
                          className={`btn btn-sm py-0.5 px-2 rounded-pill small ${
                            isCurrent
                              ? "btn-success text-white"
                              : "btn-outline-secondary"
                          }`}
                          style={{ fontSize: "0.75rem" }}
                          onClick={() => {
                            setTargetRoleInput(role);
                            if (!isCurrent) handleSaveTarget(role);
                          }}
                          disabled={isSavingTarget}
                        >
                          {role} {isCurrent && "✓"}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 border-top border-subtle d-flex justify-content-between align-items-center mt-3">
              <button
                onClick={() => navigate("/student/learning")}
                className="btn btn-link p-0 text-decoration-none fw-semibold small d-flex align-items-center gap-1 text-primary"
              >
                Open AI Career Roadmap <ChevronRight size={14} />
              </button>
              <button
                onClick={fetchCareerTarget}
                className="btn btn-sm btn-link text-muted p-0 text-decoration-none small d-flex align-items-center gap-1"
                title="Reload from MongoDB"
              >
                <RotateCcw size={12} /> Sync DB
              </button>
            </div>
          </div>
        </div>

        {/* Right: Career Target History Timeline */}
        <div className="col-lg-7">
          <div
            className="rounded-4 p-4 shadow-sm h-100 premium-glass-panel d-flex flex-column"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
            }}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex align-items-center gap-2">
                <div
                  className="rounded-3 p-2 d-flex align-items-center justify-content-center"
                  style={{ background: "rgba(139, 92, 246, 0.12)" }}
                >
                  <Clock size={20} className="text-primary" />
                </div>
                <div>
                  <h5 className="fw-bold m-0" style={{ color: "var(--text)" }}>
                    Career Target History
                  </h5>
                  <span className="small text-muted" style={{ fontSize: "0.75rem" }}>
                    {careerTarget.history.length}{" "}
                    {careerTarget.history.length === 1 ? "role selection" : "role selections"} recorded in MongoDB
                  </span>
                </div>
              </div>
              <span className="badge rounded-pill bg-primary-subtle text-primary border border-primary-subtle px-3 py-1 small fw-semibold">
                Persistent Database Log
              </span>
            </div>

            {/* History Timeline Content */}
            <div className="flex-grow-1 overflow-auto pe-1" style={{ maxHeight: "280px" }}>
              {loadingCareerTarget ? (
                <div className="py-4 text-center">
                  <div className="spinner-border spinner-border-sm text-primary mb-2" />
                  <div className="small text-muted">Loading role history...</div>
                </div>
              ) : careerTarget.history && careerTarget.history.length > 0 ? (
                <div className="position-relative ps-3 ms-2 mt-2">
                  {/* Vertical timeline connector line */}
                  <div
                    className="position-absolute"
                    style={{
                      left: 9,
                      top: 12,
                      bottom: 12,
                      width: 2,
                      background: "var(--border)",
                      zIndex: 0
                    }}
                  />

                  <div className="d-flex flex-column gap-3" id="career-target-history-list">
                    {careerTarget.history.map((item, idx) => {
                      const isActive = item.status === "active" || (idx === 0 && item.roleName.toLowerCase() === (careerTarget.targetRole || "").toLowerCase());
                      const formattedDate = item.setAt
                        ? new Date(item.setAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric"
                          })
                        : "Recorded";
                      const formattedTime = item.setAt
                        ? new Date(item.setAt).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit"
                          })
                        : "";

                      return (
                        <div
                          key={item._id || idx}
                          className="position-relative d-flex align-items-start gap-3 ps-3 history-timeline-item"
                        >
                          {/* Node Dot */}
                          <div
                            className="position-absolute d-flex align-items-center justify-content-center"
                            style={{
                              left: -4,
                              top: 6,
                              width: 18,
                              height: 18,
                              borderRadius: "50%",
                              background: isActive ? "#10b981" : "var(--surface)",
                              border: isActive ? "2px solid #ffffff" : "2px solid var(--border)",
                              boxShadow: isActive ? "0 0 8px rgba(16, 185, 129, 0.4)" : "none",
                              zIndex: 1
                            }}
                          >
                            {isActive ? (
                              <Check size={10} className="text-white" strokeWidth={3} />
                            ) : (
                              <div
                                style={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: "50%",
                                  background: "#94a3b8"
                                }}
                              />
                            )}
                          </div>

                          {/* Timeline Item Card */}
                          <div
                            className="p-3 rounded-3 flex-grow-1 border"
                            style={{
                              background: isActive
                                ? "rgba(16, 185, 129, 0.05)"
                                : "var(--surface-2, rgba(248, 250, 252, 0.5))",
                              borderColor: isActive
                                ? "rgba(16, 185, 129, 0.3)"
                                : "var(--border)"
                            }}
                          >
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <span className="fw-bold role-name-text" style={{ color: "var(--text)", fontSize: "0.95rem" }}>
                                {item.roleName}
                              </span>
                              <span
                                className={`badge rounded-pill px-2.5 py-1 small fw-semibold ${
                                  isActive
                                    ? "bg-success text-white"
                                    : "bg-secondary-subtle text-muted border border-subtle"
                                }`}
                                style={{ fontSize: "0.72rem" }}
                              >
                                {isActive ? "Active Target" : "Previous Target"}
                              </span>
                            </div>
                            <div className="d-flex align-items-center gap-2 small text-muted" style={{ fontSize: "0.76rem" }}>
                              <Calendar size={12} />
                              <span>Selected on {formattedDate}</span>
                              {formattedTime && <span>• {formattedTime}</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="d-flex flex-column align-items-center justify-content-center h-100 text-center text-muted p-4">
                  <Clock size={36} className="opacity-25 mb-2" />
                  <p className="fw-semibold small mb-1">No career target history yet</p>
                  <p className="text-muted small mb-0" style={{ fontSize: "0.78rem" }}>
                    When you select and update your career target, each role name and timestamp will be saved permanently here.
                  </p>
                </div>
              )}
            </div>
          </div>
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
                  onClick={() => navigate("/student/learning")}
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
                  onClick={() => navigate("/student/learning")}
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
      </div>

      {/* ── Featured Alumni Bounties & Micro-tasks Section ── */}
      <div className="row g-4 mb-4">
        <div className="col-12">
          <div className="bento-card p-4 rounded-4 shadow-sm border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h5 className="fw-bold mb-1 d-flex align-items-center gap-2" style={{ color: "var(--text)" }}>
                  <Target size={20} className="text-primary" />
                  Alumni Bounties & Paid Micro-Tasks
                </h5>
                <p className="small text-muted mb-0">
                  Earn real rewards and build your verified portfolio by solving engineering challenges posted by alumni.
                </p>
              </div>
              <Link to="/student/bounties" className="btn btn-sm btn-outline-primary rounded-pill px-3 fw-bold d-flex align-items-center gap-1">
                View All Bounties <ChevronRight size={14} />
              </Link>
            </div>

            {openBounties && openBounties.length > 0 ? (
              <div className="row g-3">
                {openBounties.map((bounty) => (
                  <div className="col-md-4" key={bounty._id}>
                    <div
                      className="p-3 rounded-3 border h-100 d-flex flex-column justify-content-between hover-lift cursor-pointer"
                      style={{ background: "var(--surface-2, rgba(0,0,0,0.02))", borderColor: "var(--border)" }}
                      onClick={() => navigate("/student/bounties")}
                    >
                      <div>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <span className="badge rounded-pill bg-success-subtle text-success border border-success fw-bold px-2 py-1" style={{ fontSize: "0.7rem" }}>
                            {bounty.status || "Open"}
                          </span>
                          <span className="fw-black text-success d-flex align-items-center" style={{ fontSize: "1.1rem" }}>
                            <DollarSign size={16} />
                            {bounty.rewardAmount || 0}
                          </span>
                        </div>
                        <h6 className="fw-bold mb-1 line-clamp-2" style={{ color: "var(--text)" }}>
                          {bounty.title}
                        </h6>
                        <div className="small text-muted mb-2 text-truncate">
                          By <strong>{bounty.poster?.name || "Alumni"}</strong> • {bounty.poster?.alumniProfile?.company || "Tech Innovator"}
                        </div>
                        <p className="small text-muted mb-3 line-clamp-2" style={{ fontSize: "0.8rem" }}>
                          {bounty.description}
                        </p>
                      </div>

                      <div className="pt-2 border-top d-flex justify-content-between align-items-center" style={{ borderColor: "var(--border)" }}>
                        <div className="d-flex flex-wrap gap-1">
                          {(bounty.requiredSkills || bounty.tags || []).slice(0, 2).map((sk, idx) => (
                            <span key={idx} className="badge bg-light text-muted border" style={{ fontSize: "0.68rem" }}>
                              {sk}
                            </span>
                          ))}
                        </div>
                        <span className="small text-primary fw-bold d-flex align-items-center gap-1" style={{ fontSize: "0.78rem" }}>
                          Apply <ArrowRight size={12} />
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-muted rounded-3 border border-dashed" style={{ borderColor: "var(--border)" }}>
                <p className="small mb-2">No open bounties at the moment.</p>
                <Link to="/student/bounties" className="btn btn-sm btn-light rounded-pill px-3">
                  Check Bounty Board
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Alumni Mentorship & Live 1-on-1 Sessions ── */}
      <div className="row g-4 mb-4">
        <div className="col-12">
          <div className="bento-card p-4 rounded-4 shadow-sm border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h5 className="fw-bold mb-1 d-flex align-items-center gap-2" style={{ color: "var(--text)" }}>
                  <Users size={20} className="text-primary" />
                  Alumni Mentorship & Live 1-on-1 Sessions
                </h5>
                <p className="small text-muted mb-0">
                  Book sessions with verified industry alumni, get resume reviews, and practice mock technical interviews.
                </p>
              </div>
              <div className="d-flex align-items-center gap-2">
                <Link to="/student/mentorship-sessions" className="btn btn-sm btn-primary rounded-pill px-3 fw-bold d-flex align-items-center gap-1 text-white shadow-sm" style={{ background: "#0d6efd", border: "none" }}>
                  My 1:1 Sessions <ChevronRight size={14} />
                </Link>
                <Link to="/student/mentorship" className="btn btn-sm btn-outline-secondary rounded-pill px-3 fw-bold d-flex align-items-center gap-1">
                  Find Mentors
                </Link>
              </div>
            </div>

            {mentorshipData.sessions && mentorshipData.sessions.length > 0 ? (
              <div className="row g-3">
                {mentorshipData.sessions.slice(0, 3).map((sess) => {
                  const sessDate = sess.scheduledStart || sess.scheduledDate;
                  const dateFormatted = sessDate ? new Date(sessDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) : "Upcoming";
                  const timeFormatted = sessDate ? new Date(sessDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";
                  const mentorName = sess.mentor?.name || sess.mentorName || "Alumni Mentor";

                  return (
                    <div className="col-md-4" key={sess._id}>
                      <div
                        className="p-3 rounded-3 border h-100 d-flex flex-column justify-content-between hover-lift"
                        style={{ background: "var(--surface-2, rgba(0,0,0,0.02))", borderColor: "rgba(16, 185, 129, 0.3)" }}
                      >
                        <div>
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <span className="badge rounded-pill bg-success-subtle text-success border border-success fw-bold px-2 py-1" style={{ fontSize: "0.7rem" }}>
                              Confirmed Session
                            </span>
                            <span className="small text-muted fw-semibold">
                              {sess.durationMinutes || 30} mins
                            </span>
                          </div>
                          <h6 className="fw-bold mb-1 line-clamp-1" style={{ color: "var(--text)" }}>
                            {sess.topic || "1-on-1 Mentorship"}
                          </h6>
                          <div className="small text-muted mb-2 text-truncate">
                            With <strong>{mentorName}</strong> • {sess.mentor?.alumniProfile?.company || "Tech Mentor"}
                          </div>
                          <div className="small text-muted d-flex align-items-center gap-1 mb-3">
                            <Clock size={13} /> {dateFormatted} at {timeFormatted}
                          </div>
                        </div>

                        <button
                          type="button"
                          className="btn btn-sm btn-primary rounded-pill w-100 fw-bold d-flex align-items-center justify-content-center gap-1"
                          onClick={() => navigate(`/student/session/${sess._id}`)}
                          style={{ background: "#0d6efd", border: "none" }}
                        >
                          <Video size={14} /> Join Session Room
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : mentorshipData.requests && mentorshipData.requests.length > 0 ? (
              <div className="row g-3">
                {mentorshipData.requests.slice(0, 3).map((req) => {
                  const reqDate = req.requestedDate ? new Date(req.requestedDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) : "Upcoming";
                  const mentorName = req.alumni?.name || "Alumni Mentor";

                  return (
                    <div className="col-md-4" key={req._id}>
                      <div
                        className="p-3 rounded-3 border h-100 d-flex flex-column justify-content-between hover-lift"
                        style={{ background: "var(--surface-2, rgba(0,0,0,0.02))", borderColor: "var(--border)" }}
                      >
                        <div>
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <span className="badge rounded-pill bg-warning-subtle text-warning border border-warning fw-bold px-2 py-1" style={{ fontSize: "0.7rem" }}>
                              {req.status === "Pending" ? "Awaiting Mentor Approval" : req.status}
                            </span>
                          </div>
                          <h6 className="fw-bold mb-1 line-clamp-1" style={{ color: "var(--text)" }}>
                            {req.topic || "1-on-1 Mentorship"}
                          </h6>
                          <div className="small text-muted mb-2 text-truncate">
                            Requested to <strong>{mentorName}</strong>
                          </div>
                          <div className="small text-muted d-flex align-items-center gap-1 mb-2">
                            <Clock size={13} /> {reqDate} ({req.requestedStartTime})
                          </div>
                        </div>

                        <Link to="/student/mentorship-sessions" className="btn btn-sm btn-outline-secondary rounded-pill w-100 small fw-semibold">
                          View in My Sessions
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 text-center text-muted rounded-3 border border-dashed" style={{ borderColor: "var(--border)" }}>
                <p className="small mb-2">You haven't scheduled any 1-on-1 sessions with alumni yet.</p>
                <Link to="/student/mentorship" className="btn btn-sm btn-primary rounded-pill px-4 fw-semibold" style={{ background: "#0d6efd", border: "none" }}>
                  Book 1-on-1 Mentorship Session
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

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
