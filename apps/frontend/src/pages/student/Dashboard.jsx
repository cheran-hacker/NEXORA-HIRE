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
  ClipboardCheck,
  ArrowRight,
  BookOpen,
  Star,
  AlertCircle,
  MapPin,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import ChartWidget from "../../widgets/ChartWidget.jsx";
import { studentService } from "../../services/api.js";
import TrajectoryVisualizer from "../../components/student/TrajectoryVisualizer.jsx";
import { useAuth } from "../../context/AuthContext";
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
  return (
    <div
      className="container-fluid py-4 px-xl-5"
      style={{ background: "transparent" }}
    >
      {" "}
      {/* ── Hero Section ── */}{" "}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="row g-0 mb-4 rounded-4 overflow-hidden shadow-sm premium-glass-panel"
      >
        {" "}
        <div className="col-lg-8 p-4 p-md-5 d-flex flex-column justify-content-center">
          {" "}
          <div className="d-flex align-items-center gap-2 mb-2">
            {" "}
            <span className="badge border text-body px-3 py-1 rounded-pill d-flex align-items-center gap-2" style={{ background: "rgba(128,128,128,0.1)", borderColor: "var(--premium-border)" }}>
              {" "}
              {profileSummary?.branch && profileSummary.branch !== "Not Set"
                ? `${profileSummary.branch} • ${profileSummary.batchYear || "Present"}`
                : "Student Portal"}{" "}
            </span>{" "}
            <span className="badge border text-body px-3 py-1 rounded-pill d-flex align-items-center gap-2" style={{ background: "rgba(128,128,128,0.1)", borderColor: "var(--premium-border)" }}>
              {" "}
              Reg No: {user?.registerNumber || "Not Set"}{" "}
            </span>{" "}
            <span className="badge border text-body px-3 py-1 rounded-pill d-flex align-items-center gap-2" style={{ background: "rgba(128,128,128,0.1)", borderColor: "var(--premium-border)" }}>
              {" "}
              {digitalTwin?.targetRole && digitalTwin.targetRole !== 'Not Set' 
                ? `Target Role: ${digitalTwin.targetRole}`
                : "Target Role: Not Set"}{" "}
            </span>
          </div>{" "}
          <h1
            className="fw-black mb-3 mt-2"
            style={{
              fontSize: "2.5rem",
              letterSpacing: "-0.02em",
              color: 'var(--premium-text-main)',
            }}
          >
            {" "}
            Welcome back, {realName}!{" "}
          </h1>{" "}
          <p
            className="fs-6 text-muted mb-4"
            style={{ maxWidth: "600px", lineHeight: "1.6" }}
          >
            {" "}
            {profileCompletion > 80
              ? "Your profile is looking great! You're ready to apply for top tier jobs and internships."
              : "Complete your profile to receive personalized career insights and job matches."}{" "}
          </p>{" "}
          <div className="d-flex flex-wrap gap-3">
            {" "}
            <button
              onClick={() => navigate("/student/profile")}
              className="btn btn-primary rounded-pill fw-semibold px-4 py-2 d-flex align-items-center gap-2 shadow-sm"
            >
              {" "}
              <User size={18} />{" "}
              {profileCompletion === 0
                ? "Complete Profile"
                : "Edit Profile"}{" "}
            </button>{" "}
            <button
              onClick={() => navigate("/student/resume")}
              className="btn btn-outline-secondary rounded-pill fw-semibold px-4 py-2 d-flex align-items-center gap-2 bg-surface text-muted border-border"
            >
              {" "}
              <FileCheck size={18} /> Analyze Resume{" "}
            </button>{" "}
            <button
              onClick={() => navigate("/student/jobs")}
              className="btn btn-outline-secondary rounded-pill fw-semibold px-4 py-2 d-flex align-items-center gap-2 bg-surface text-muted border-border"
            >
              {" "}
              <Briefcase size={18} /> Explore Jobs{" "}
            </button>{" "}
            <button
              onClick={() => navigate("/student/pulse")}
              className="btn btn-outline-primary rounded-pill fw-semibold px-4 py-2 d-flex align-items-center gap-2 bg-surface border-border"
            >
              {" "}
              <Activity size={18} /> Campus Pulse{" "}
            </button>{" "}
          </div>{" "}
        </div>{" "}
        <div
          className="col-lg-4 d-none d-lg-flex align-items-center justify-content-center p-4 position-relative"
          style={{
            background:
              "linear-gradient(135deg, rgba(var(--primary-rgb), 0.05) 0%, rgba(var(--primary-rgb), 0.1) 100%)",
          }}
        >
          {" "}
          <img
            src="/illustrations/career-hero.svg"
            alt="Career Journey"
            className="img-fluid drop-shadow-md z-1"
            style={{ maxHeight: "220px" }}
            onError={(e) => {
              e.target.src =
                "https://ui-avatars.com/api/?name=Career+Journey&size=300&background=6366f1&color=fff&font-size=0.15";
            }}
          />{" "}
          <div
            className="position-absolute w-100 h-100 top-0 start-0 opacity-25"
            style={{
              backgroundImage:
                "radial-gradient(rgba(var(--text-rgb), 0.1) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          ></div>{" "}
        </div>{" "}
      </motion.div>{" "}
      {/* ── KPI Cards ── */}{" "}
      <div className="row g-4 mb-4">
        {" "}
        {[
          {
            title: "Placement Readiness",
            value:
              profileSummary?.readiness != null
                ? `${profileSummary.readiness}%`
                : "N/A",
            sub:
              profileSummary?.readiness != null
                ? "Based on assessments"
                : "Take an assessment",
            icon: Target,
            trend: profileSummary?.readiness != null ? "Active" : "-",
            color: "#6366F1",
            bg: "rgba(99, 102, 241, 0.1)",
          },
          {
            title: "AI Resume Score",
            value:
              profileSummary?.resumeScore != null
                ? `${profileSummary.resumeScore}/100`
                : "N/A",
            sub:
              profileSummary?.resumeScore != null
                ? "Resume Analyzer"
                : "Not analyzed yet",
            icon: FileCheck,
            trend: profileSummary?.resumeScore != null ? "Analyzed" : "-",
            color: "#10B981",
            bg: "rgba(16, 185, 129, 0.1)",
          },
          {
            title: "Profile Score",
            value: `${profileCompletion}%`,
            sub:
              profileCompletion > 0 ? "Profile Completion" : "Profile pending",
            icon: User,
            trend: "-",
            color: "#F59E0B",
            bg: "rgba(245, 158, 11, 0.1)",
          },
          {
            title: "Active Applications",
            value: kpis?.applicationsSent?.toString() || "0",
            sub: "Total applications",
            icon: Briefcase,
            trend: kpis?.applicationsSent > 0 ? "Active" : "-",
            color: "#8B5CF6",
            bg: "rgba(139, 92, 246, 0.1)",
          },
          {
            title: "Interviews",
            value: upcomingInterviews?.length?.toString() || "0",
            sub: "Scheduled",
            icon: Calendar,
            trend: upcomingInterviews?.length > 0 ? "Upcoming" : "-",
            color: "#0EA5E9",
            bg: "rgba(14, 165, 233, 0.1)",
          },
          {
            title: "Skill Score",
            value:
              profileSummary?.skillMatch != null
                ? `${profileSummary.skillMatch}%`
                : "N/A",
            sub:
              profileSummary?.skillMatch != null
                ? "Market Match"
                : "Not available",
            icon: Star,
            trend: profileSummary?.skillMatch != null ? "Active" : "-",
            color: "#EC4899",
            bg: "rgba(236, 72, 153, 0.1)",
          },
        ].map((kpi, idx) => (
          <div className="col-sm-6 col-lg-4 col-xl-2" key={idx}>
            {" "}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="rounded-4 p-4 h-100 d-flex flex-column justify-content-between shadow-sm premium-glass-panel"
            >
              {" "}
              <div className="d-flex justify-content-between align-items-start mb-3">
                {" "}
                <div
                  className="p-2 rounded-3"
                  style={{ background: "rgba(128,128,128,0.1)", color: kpi.color }}
                >
                  {" "}
                  <kpi.icon size={22} />{" "}
                </div>{" "}
              </div>{" "}
              <div>
                {" "}
                <div
                  className="text-muted fw-semibold mb-1"
                  style={{
                    fontSize: "0.8rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {kpi.title}
                </div>{" "}
                <div
                  className="fw-black mb-1"
                  style={{
                    fontSize: "1.8rem",
                    color: 'var(--premium-text-main)',
                    lineHeight: "1",
                  }}
                >
                  {kpi.value}
                </div>{" "}
                <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                  {kpi.sub}
                </div>{" "}
              </div>{" "}
            </motion.div>{" "}
          </div>
        ))}{" "}
      </div>{" "}
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
      <div className="row g-4 mb-4">
        {" "}
        {/* ── Recommended Jobs ── */}{" "}
        <div className="col-lg-6">
          {" "}
          <div
            className="rounded-4 p-4 shadow-sm h-100 flex-column d-flex premium-glass-panel"
          >
            {" "}
            <div className="d-flex justify-content-between align-items-center mb-4">
              {" "}
              <h5 className="fw-bold m-0" style={{ color: 'var(--premium-text-main)' }}>
                Recommended Jobs
              </h5>{" "}
              <button
                onClick={() => navigate("/student/jobs")}
                className="btn btn-sm btn-link text-decoration-none fw-semibold"
              >
                View All
              </button>{" "}
            </div>{" "}
            {recommendedJobs && recommendedJobs.length > 0 ? (
              <div className="table-responsive flex-grow-1">
                <table
                  className="table table-borderless align-middle m-0"
                  style={{ color: 'var(--premium-text-main)' }}
                >
                  <thead
                    className="text-muted small fw-semibold"
                    style={{ borderBottom: "1px solid var(--premium-border)" }}
                  >
                    <tr>
                      <th className="pb-2 fw-semibold">Role</th><th className="pb-2 fw-semibold">Company</th><th className="pb-2 fw-semibold">Match</th><th className="pb-2 text-end fw-semibold">Action</th></tr></thead>
                  <tbody>
                    {recommendedJobs.slice(0, 4).map((job) => (
                      <tr
                        key={job.id}
                        style={{ borderBottom: "1px solid var(--premium-border)" }}
                      >
                        <td className="py-3">
                          
                          <div
                            className="fw-bold"
                            style={{ color: 'var(--premium-text-main)' }}
                          >
                            {job.title}
                          </div>{" "}
                          <div className="small text-muted d-flex align-items-center gap-1">
                            <MapPin size={12} /> {job.location || "Remote"}
                          </div>
                        </td><td
                          className="py-3 fw-medium"
                          style={{ color: 'var(--premium-text-main)' }}
                        >
                          {job.company}
                        </td><td className="py-3">
                          
                          <span className="badge bg-success-subtle text-success rounded-pill px-2 py-1">
                            {job.match}% Match
                          </span>
                        </td><td className="py-3 text-end">
                          
                          <button
                            onClick={() => navigate(`/student/jobs/${job.id}`)}
                            className="btn btn-sm btn-primary rounded-pill px-3"
                          >
                            Apply
                          </button>
                        </td></tr>
                    ))}</tbody></table>
              </div>
            ) : (
              <div className="d-flex flex-column align-items-center justify-content-center flex-grow-1 text-center text-muted p-4">
                {" "}
                <Briefcase size={40} className="mb-3 opacity-25" />{" "}
                <p className="fw-medium small mb-3">
                  No job recommendations available yet.
                </p>{" "}
                <button
                  onClick={() => navigate("/student/jobs")}
                  className="btn btn-outline-primary btn-sm rounded-pill px-4 fw-semibold bg-surface border-border"
                >
                  Explore Job Board
                </button>{" "}
              </div>
            )}{" "}
          </div>{" "}
        </div>{" "}
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
