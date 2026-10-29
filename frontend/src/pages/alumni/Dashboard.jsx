import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Clock,
  Calendar,
  CheckCircle2,
  Video,
  ExternalLink,
  ChevronRight,
  Sparkles,
  ArrowRight,
  UserCheck,
  Briefcase,
  Share2,
  Plus,
  X,
  Send,
  MessageSquare,
  Award,
  BookOpen,
  MapPin,
  RefreshCw,
  Search,
  Filter,
  Check,
  AlertCircle
} from "lucide-react";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import { alumniService, mentorshipService, jobService, studentService, postService } from "../../services/api";

export default function AlumniDashboard() {
  const { addToast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Stats from backend
  const [kpis, setKpis] = useState({
    activeMentees: 0,
    mentees: 0,
    pendingInquiries: 0,
    pendingRequests: 0,
    scheduledSessions: 0,
    upcomingSessions: 0,
    completedSessions: 0,
    sessionsCompleted: 0,
    referralsShared: 0,
    forumDiscussions: 0
  });

  // Requests state
  const [requestFilter, setRequestFilter] = useState("all"); // 'all' | 'mentorship' | 'connection'
  const [pendingRequests, setPendingRequests] = useState([]);
  const [actionInProgress, setActionInProgress] = useState({});

  // Sessions state
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  // Community Forum Discussions state
  const [forumDiscussions, setForumDiscussions] = useState([]);
  const [showForumModal, setShowForumModal] = useState(false);
  const [forumTitle, setForumTitle] = useState("");
  const [forumTags, setForumTags] = useState("");
  const [forumContent, setForumContent] = useState("");
  const [postingForum, setPostingForum] = useState(false);

  // Student discovery & Mentor recommendations state
  const [studentsList, setStudentsList] = useState([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [discoveryTab, setDiscoveryTab] = useState("students"); // 'students' | 'mentors'
  const [recommendedMentors, setRecommendedMentors] = useState([]);
  const [mentorsLoading, setMentorsLoading] = useState(false);

  // Share Opportunity / Referral Modal
  const [showShareModal, setShowShareModal] = useState(false);
  const [postingOpportunity, setPostingOpportunity] = useState(false);
  const [opportunityForm, setOpportunityForm] = useState({
    title: "",
    company: user?.alumniProfile?.company || "",
    type: "Full-time",
    location: "Remote",
    salaryMin: "",
    salaryMax: "",
    description: "",
    skills: "",
    applyUrl: ""
  });

  // Mentorship Availability Toggle
  const [isAvailable, setIsAvailable] = useState(true);

  const handleCreateForumDiscussion = async (e) => {
    e.preventDefault();
    if (!forumTitle.trim() || !forumContent.trim()) {
      addToast("Please provide both title and content for your discussion", "warning");
      return;
    }
    try {
      setPostingForum(true);
      const tagsArray = forumTags
        .split(",")
        .map((t) => t.trim().replace(/^#/, ""))
        .filter(Boolean);

      const res = await postService.createPost({
        title: forumTitle.trim(),
        content: forumContent.trim(),
        tags: tagsArray.length > 0 ? tagsArray : ["AlumniInsights", "Career"]
      });

      const newPost = res.data?.data;
      if (newPost) {
        setForumDiscussions((prev) => [newPost, ...prev]);
        setKpis((prev) => ({ ...prev, forumDiscussions: (prev.forumDiscussions || 0) + 1 }));
      }
      setShowForumModal(false);
      setForumTitle("");
      setForumTags("");
      setForumContent("");
      addToast("Discussion published to Campus Forum and stored in database! 🚀", "success");
    } catch (err) {
      console.error("Failed to create forum discussion:", err);
      addToast(err.response?.data?.message || "Failed to post discussion", "error");
    } finally {
      setPostingForum(false);
    }
  };

  // Load Dashboard Data
  useEffect(() => {
    fetchDashboardData();
    fetchSessions();
    fetchRecommendedMentors();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await alumniService.getStats();
      if (res.data) {
        const d = res.data;
        // Dynamic Overview KPIs from real MongoDB
        setKpis({
          activeMentees: d.kpis?.activeMentees ?? (d.kpis?.connections || d.kpis?.activeMentorships || 0),
          mentees: d.kpis?.activeMentees ?? (d.kpis?.connections || d.kpis?.activeMentorships || 0),
          pendingInquiries: d.kpis?.pendingInquiries ?? (d.kpis?.studentRequests || d.pendingRequests?.length || 0),
          pendingRequests: d.kpis?.pendingInquiries ?? (d.kpis?.studentRequests || d.pendingRequests?.length || 0),
          scheduledSessions: d.kpis?.scheduledSessions ?? (d.kpis?.upcomingSessions || 0),
          upcomingSessions: d.kpis?.scheduledSessions ?? (d.kpis?.upcomingSessions || 0),
          completedSessions: d.kpis?.completedSessions ?? (d.kpis?.sessionsCompleted || 0),
          sessionsCompleted: d.kpis?.completedSessions ?? (d.kpis?.sessionsCompleted || 0),
          referralsShared: d.kpis?.referrals || 0
        });

        // Pending Requests
        if (Array.isArray(d.pendingRequests)) {
          setPendingRequests(d.pendingRequests);
        } else if (Array.isArray(d.pendingRequestsFormatted)) {
          setPendingRequests(d.pendingRequestsFormatted);
        }

        // Students / Mentees
        if (Array.isArray(d.mentees) && d.mentees.length > 0) {
          setStudentsList(d.mentees);
        }

        // Availability status from backend
        if (typeof d.kpis?.availability === "boolean") {
          setIsAvailable(d.kpis.availability);
        }

        // Forum Discussions from backend MongoDB
        if (Array.isArray(d.forumDiscussions) && d.forumDiscussions.length > 0) {
          setForumDiscussions(d.forumDiscussions);
        } else {
          try {
            const pRes = await postService.getPosts();
            if (Array.isArray(pRes.data?.data)) {
              setForumDiscussions(pRes.data.data.slice(0, 4));
            }
          } catch (pe) {
            console.warn("Could not fetch extra posts for alumni dashboard", pe);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load alumni stats:", err);
      // Fallback clean defaults
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async () => {
    try {
      setSessionsLoading(true);
      const res = await mentorshipService.getMySessions();
      if (Array.isArray(res.data?.data)) {
        const sessList = res.data.data;
        setSessions(sessList);
        const scheduledCount = sessList.filter((s) =>
          ["Scheduled", "Confirmed", "Approved", "Active", "InProgress", "Rescheduled"].includes(s.status)
        ).length;
        const completedCount = sessList.filter((s) => s.status === "Completed").length;
        setKpis((prev) => ({
          ...prev,
          scheduledSessions: scheduledCount,
          upcomingSessions: scheduledCount,
          completedSessions: completedCount,
          sessionsCompleted: completedCount
        }));
      } else if (Array.isArray(res.data)) {
        setSessions(res.data);
      }
    } catch (err) {
      console.warn("Could not load sessions directly:", err);
    } finally {
      setSessionsLoading(false);
    }
  };

  const fetchRecommendedMentors = async () => {
    try {
      setMentorsLoading(true);
      const res = await mentorshipService.getRecommended();
      if (Array.isArray(res.data?.data)) {
        setRecommendedMentors(res.data.data);
      } else if (Array.isArray(res.data)) {
        setRecommendedMentors(res.data);
      }
    } catch (err) {
      console.warn("Could not load recommended mentors:", err);
    } finally {
      setMentorsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchDashboardData(), fetchSessions(), fetchRecommendedMentors()]);
    setRefreshing(false);
    addToast("Alumni dashboard refreshed", "success");
  };

  // Profile Completion Calculation
  const profileCompletion = useMemo(() => {
    const prof = user?.alumniProfile || {};
    const fields = [
      user?.name,
      prof.company,
      prof.currentRole || prof.designation,
      prof.graduationYear,
      prof.skills && prof.skills.length > 0,
      prof.bio,
      prof.phone || user?.phone,
      prof.linkedinUrl
    ];
    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100) || 65;
  }, [user]);

  // Handle Accept Request
  const handleAcceptRequest = async (item) => {
    const id = item._id || item.id;
    try {
      setActionInProgress((prev) => ({ ...prev, [id]: true }));
      if (item.type === "mentorship") {
        await mentorshipService.acceptRequest(id);
      } else {
        await alumniService.updateConnectionRequest(id, "Accepted");
      }
      setPendingRequests((prev) => prev.filter((r) => (r._id || r.id) !== id));
      setKpis((p) => ({
        ...p,
        mentees: (p.mentees || 0) + 1,
        activeMentees: (p.activeMentees || 0) + 1,
        pendingRequests: Math.max(0, (p.pendingRequests || 1) - 1),
        pendingInquiries: Math.max(0, (p.pendingInquiries || 1) - 1),
        scheduledSessions: (p.scheduledSessions || 0) + 1,
        upcomingSessions: (p.upcomingSessions || 0) + 1
      }));
      await fetchSessions();
      addToast(`Accepted request from ${item.student?.name || "Student"}! 🤝`, "success");
    } catch (err) {
      console.error("Accept error:", err);
      addToast("Failed to accept request", "error");
    } finally {
      setActionInProgress((prev) => ({ ...prev, [id]: false }));
    }
  };

  // Handle Reject Request
  const handleRejectRequest = async (item) => {
    const id = item._id || item.id;
    try {
      setActionInProgress((prev) => ({ ...prev, [id]: true }));
      if (item.type === "mentorship") {
        await mentorshipService.rejectRequest(id, "Schedule conflicts");
      } else {
        await alumniService.updateConnectionRequest(id, "Rejected");
      }
      setPendingRequests((prev) => prev.filter((r) => (r._id || r.id) !== id));
      setKpis((p) => ({ ...p, pendingRequests: Math.max(0, p.pendingRequests - 1) }));
      addToast(`Declined request from ${item.student?.name || "Student"}.`, "info");
    } catch (err) {
      console.error("Reject error:", err);
      addToast("Failed to decline request", "error");
    } finally {
      setActionInProgress((prev) => ({ ...prev, [id]: false }));
    }
  };

  // Handle Complete Session
  const handleCompleteSession = async (sessionId) => {
    try {
      await mentorshipService.completeSession(sessionId, { mentorFeedback: "Session completed." });
      setSessions((prev) =>
        prev.map((s) => (s._id === sessionId ? { ...s, status: "Completed", completedAt: new Date() } : s))
      );
      setKpis((prev) => ({
        ...prev,
        upcomingSessions: Math.max(0, (prev.upcomingSessions || 1) - 1),
        scheduledSessions: Math.max(0, (prev.scheduledSessions || 1) - 1),
        completedSessions: (prev.completedSessions || 0) + 1,
        sessionsCompleted: (prev.sessionsCompleted || 0) + 1
      }));
      addToast("Session marked as completed! Timestamp saved to MongoDB. 🎉", "success");
    } catch (err) {
      addToast("Failed to update session status", "error");
    }
  };

  // Handle Share Opportunity
  const handleShareOpportunity = async (e) => {
    e.preventDefault();
    if (!opportunityForm.title.trim() || !opportunityForm.company.trim()) {
      addToast("Please provide job title and company name", "warning");
      return;
    }

    try {
      setPostingOpportunity(true);
      const skillsArray = opportunityForm.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        title: opportunityForm.title.trim(),
        company: opportunityForm.company.trim(),
        type: opportunityForm.type,
        location: opportunityForm.location,
        description: opportunityForm.description || "Alumni-shared career opportunity.",
        skills: skillsArray.length > 0 ? skillsArray : ["General"],
        source: "Alumni",
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      };

      await jobService.create(payload);
      addToast("Career opportunity shared with the campus network! 🚀", "success");
      setShowShareModal(false);
      setOpportunityForm({
        title: "",
        company: user?.alumniProfile?.company || "",
        type: "Full-time",
        location: "Remote",
        salaryMin: "",
        salaryMax: "",
        description: "",
        skills: "",
        applyUrl: ""
      });
      setKpis((p) => ({ ...p, referralsShared: p.referralsShared + 1 }));
    } catch (err) {
      console.error("Failed to share opportunity:", err);
      addToast(err.response?.data?.message || "Failed to post opportunity", "error");
    } finally {
      setPostingOpportunity(false);
    }
  };

  // Filtered requests
  const filteredRequests = useMemo(() => {
    if (requestFilter === "all") return pendingRequests;
    return pendingRequests.filter((r) => r.type === requestFilter);
  }, [pendingRequests, requestFilter]);

  // Filtered students for discovery
  const filteredStudents = useMemo(() => {
    if (!studentSearch.trim()) return studentsList;
    const q = studentSearch.toLowerCase();
    return studentsList.filter(
      (s) =>
        s.name?.toLowerCase().includes(q) ||
        (s.studentProfile?.department || "").toLowerCase().includes(q) ||
        (s.studentProfile?.skills || []).some((sk) => sk.toLowerCase().includes(q))
    );
  }, [studentsList, studentSearch]);

  const displayName = user?.name || "Alumni Leader";
  const alumniRole = user?.alumniProfile?.currentRole || user?.alumniProfile?.designation || "Senior Engineer";
  const alumniCompany = user?.alumniProfile?.company || "Tech Industry";
  const gradYear = user?.alumniProfile?.graduationYear || "Class of 2021";

  return (
    <div
      className="container-fluid py-4 px-3 px-md-4"
      style={{
        background: "var(--bg)",
        minHeight: "100vh",
        color: "var(--text)"
      }}
    >
      <div className="mx-auto" style={{ maxWidth: "1320px" }}>
        {/* Top Header Bar */}
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <h2 className="fw-black m-0" style={{ fontSize: "2rem", letterSpacing: "-0.02em" }}>
                Welcome back, {displayName} 👋
              </h2>
              <span className="badge rounded-pill bg-success-subtle text-success fw-bold px-3 py-1 small">
                Verified Mentor
              </span>
            </div>
            <p className="text-muted fw-medium mb-0">
              {alumniRole} at <strong>{alumniCompany}</strong> • {gradYear}
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
              <span>{refreshing ? "Syncing..." : "Sync"}</span>
            </button>

            <button
              onClick={() => navigate("/alumni/sessions")}
              className="btn btn-primary rounded-pill px-3 py-2 fw-bold d-flex align-items-center gap-2 small shadow-sm text-white"
              style={{ background: "#0d6efd", border: "none" }}
            >
              <Video size={16} />
              <span>1-on-1 Sessions</span>
            </button>

            <button
              onClick={() => navigate("/alumni/forum")}
              className="btn btn-outline-primary rounded-pill px-3 py-2 fw-bold d-flex align-items-center gap-2 small shadow-sm"
              style={{ background: "rgba(var(--primary-rgb), 0.1)", border: "1px solid rgba(var(--primary-rgb), 0.3)" }}
            >
              <MessageSquare size={16} />
              <span>Community Forum</span>
            </button>

            <button
              onClick={() => setShowShareModal(true)}
              className="btn btn-outline-secondary rounded-pill px-4 py-2 fw-bold d-flex align-items-center gap-2 small shadow-sm"
            >
              <Share2 size={16} />
              <span>Share Opportunity</span>
            </button>
          </div>
        </div>

        {/* 4 Flagship Summary Cards: Dynamic MongoDB Metrics */}
        <div className="row g-3 g-md-4 mb-4">
          {/* 1. Active Mentees */}
          <div className="col-sm-6 col-xl-3">
            <div
              className="bento-card p-4 rounded-4 shadow-sm h-100 d-flex flex-column justify-content-between hover-lift transition-all"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="small text-muted fw-bold text-uppercase tracking-wider">Active Mentees</span>
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center text-white flex-shrink-0"
                  style={{ width: "42px", height: "42px", background: "linear-gradient(135deg, #10b981, #059669)" }}
                >
                  <Users size={20} />
                </div>
              </div>
              <div>
                <h3 className="fw-black mb-1" style={{ fontSize: "2rem", lineHeight: 1 }}>
                  {kpis.activeMentees ?? kpis.mentees ?? 0}
                </h3>
                <span className="small text-muted">Guided students</span>
              </div>
            </div>
          </div>

          {/* 2. Pending Inquiries */}
          <div className="col-sm-6 col-xl-3">
            <div
              className="bento-card p-4 rounded-4 shadow-sm h-100 d-flex flex-column justify-content-between hover-lift transition-all"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="small text-muted fw-bold text-uppercase tracking-wider">Pending Inquiries</span>
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center text-white flex-shrink-0"
                  style={{ width: "42px", height: "42px", background: "linear-gradient(135deg, #3b82f6, #1d4ed8)" }}
                >
                  <Clock size={20} />
                </div>
              </div>
              <div>
                <h3 className="fw-black mb-1" style={{ fontSize: "2rem", lineHeight: 1 }}>
                  {pendingRequests.length || kpis.pendingInquiries || kpis.pendingRequests || 0}
                </h3>
                <span className="small text-primary fw-semibold">Awaiting your response</span>
              </div>
            </div>
          </div>

          {/* 3. Scheduled 1:1s */}
          <div className="col-sm-6 col-xl-3">
            <div
              className="bento-card p-4 rounded-4 shadow-sm h-100 d-flex flex-column justify-content-between hover-lift transition-all"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="small text-muted fw-bold text-uppercase tracking-wider">Scheduled 1:1s</span>
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center text-white flex-shrink-0"
                  style={{ width: "42px", height: "42px", background: "linear-gradient(135deg, #6366f1, #4338ca)" }}
                >
                  <Calendar size={20} />
                </div>
              </div>
              <div>
                <h3 className="fw-black mb-1" style={{ fontSize: "2rem", lineHeight: 1 }}>
                  {kpis.scheduledSessions ?? kpis.upcomingSessions ?? 0}
                </h3>
                <span className="small text-muted">Sessions booked</span>
              </div>
            </div>
          </div>

          {/* 4. Completed Sessions */}
          <div className="col-sm-6 col-xl-3">
            <div
              className="bento-card p-4 rounded-4 shadow-sm h-100 d-flex flex-column justify-content-between hover-lift transition-all"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="small text-muted fw-bold text-uppercase tracking-wider">Completed Sessions</span>
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center text-white flex-shrink-0"
                  style={{ width: "42px", height: "42px", background: "linear-gradient(135deg, #8b5cf6, #7c3aed)" }}
                >
                  <CheckCircle2 size={20} />
                </div>
              </div>
              <div>
                <h3 className="fw-black mb-1" style={{ fontSize: "2rem", lineHeight: 1 }}>
                  {kpis.completedSessions ?? kpis.sessionsCompleted ?? 0}
                </h3>
                <span className="small text-muted">Sessions completed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Completion & Mentorship Availability Banner */}
        <div className="row g-4 mb-4">
          {/* Profile Status */}
          <div className="col-lg-8">
            <div
              className="bento-card p-4 rounded-4 shadow-sm d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-4"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div className="d-flex align-items-center gap-4">
                {/* Circular Gauge */}
                <div className="position-relative flex-shrink-0" style={{ width: "72px", height: "72px" }}>
                  <svg viewBox="0 0 36 36" className="w-100 h-100">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="var(--border)"
                      strokeWidth="3.5"
                    />
                    <path
                      strokeDasharray={`${profileCompletion}, 100`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="var(--primary)"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span
                    className="position-absolute top-50 start-50 translate-middle fw-bold"
                    style={{ fontSize: "0.95rem", color: "var(--text)" }}
                  >
                    {profileCompletion}%
                  </span>
                </div>

                <div>
                  <h6 className="fw-bold mb-1" style={{ color: "var(--text)" }}>
                    Alumni Profile Readiness
                  </h6>
                  <p className="small text-muted mb-2">
                    {profileCompletion >= 80
                      ? "Your profile is fully verified and optimized for student discovery."
                      : "Add your expertise tags and career history to help students connect with you."}
                  </p>
                  <div className="d-flex gap-2 flex-wrap">
                    <span className="badge bg-secondary bg-opacity-10 text-muted small py-1 px-2 rounded-pill">
                      🏢 {alumniCompany}
                    </span>
                    <span className="badge bg-secondary bg-opacity-10 text-muted small py-1 px-2 rounded-pill">
                      🎓 {gradYear}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate("/alumni/profile")}
                className="btn btn-outline-primary rounded-pill px-4 py-2 fw-semibold small flex-shrink-0"
              >
                Edit Profile →
              </button>
            </div>
          </div>

          {/* Mentorship Availability Quick Control */}
          <div className="col-lg-4">
            <div
              className="bento-card p-4 rounded-4 shadow-sm h-100 d-flex flex-column justify-content-between"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <h6 className="fw-bold m-0" style={{ color: "var(--text)" }}>
                    Mentorship Status
                  </h6>
                  <span className={`badge rounded-pill ${isAvailable ? "bg-success-subtle text-success" : "bg-secondary-subtle text-muted"}`}>
                    {isAvailable ? "● Accepting Mentees" : "● Paused"}
                  </span>
                </div>
                <p className="small text-muted mb-3">
                  Control whether current engineering students can send you mentorship requests.
                </p>
              </div>

              <div className="d-flex align-items-center justify-content-between pt-2 border-top" style={{ borderColor: "var(--border)" }}>
                <span className="small fw-semibold text-muted">Availability Toggle</span>
                <div className="form-check form-switch m-0">
                  <input
                    className="form-check-input cursor-pointer"
                    type="checkbox"
                    checked={isAvailable}
                    onChange={async () => {
                      const next = !isAvailable;
                      try {
                        setIsAvailable(next);
                        await mentorshipService.updateMyAvailability({ isAvailable: next });
                        addToast(next ? "You are now accepting mentees!" : "Mentorship requests paused.", "success");
                      } catch (err) {
                        setIsAvailable(!next);
                        addToast(err.response?.data?.message || "Failed to update availability on server.", "error");
                      }
                    }}
                    style={{ width: "2.5rem", height: "1.3rem" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid: Left (Requests & Sessions) + Right (Student Discovery) */}
        <div className="row g-4">
          {/* Left Column: Connection & Mentorship Requests + Scheduled Sessions */}
          <div className="col-lg-8">
            {/* Requests Center */}
            <div
              className="bento-card p-4 rounded-4 shadow-sm mb-4"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
                <div>
                  <h5 className="fw-bold mb-1" style={{ fontSize: "1.2rem" }}>
                    Student Requests & Inquiries
                  </h5>
                  <p className="small text-muted mb-0">
                    Review incoming requests from students seeking your guidance.
                  </p>
                </div>

                <div className="d-flex gap-1 p-1 rounded-pill bg-light" style={{ background: "var(--surface-2, rgba(0,0,0,0.05))" }}>
                  {[
                    { id: "all", label: "All" },
                    { id: "mentorship", label: "Mentorship" },
                    { id: "connection", label: "Network" }
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setRequestFilter(f.id)}
                      className={`btn btn-sm rounded-pill px-3 py-1 fw-bold border-0 ${
                        requestFilter === f.id ? "bg-primary text-white shadow-sm" : "text-muted"
                      }`}
                      style={{ fontSize: "0.78rem" }}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {loading && (
                <div className="text-center py-5">
                  <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                  <span className="small text-muted">Checking for new student requests...</span>
                </div>
              )}

              {!loading && filteredRequests.length === 0 && (
                <div className="text-center py-5 text-muted">
                  <UserCheck size={36} className="opacity-25 mb-2 mx-auto d-block" />
                  <h6 className="fw-bold mb-1">Inbox Zero!</h6>
                  <small>No pending connection or mentorship requests right now.</small>
                </div>
              )}

              {!loading && filteredRequests.length > 0 && (
                <div className="d-flex flex-column gap-3">
                  {filteredRequests.map((req, idx) => {
                    const reqId = req._id || req.id || `req-${idx}`;
                    const studentName = req.student?.name || req.name || "Student";
                    const dept = req.student?.department || req.department || "Computer Science";
                    const target = req.student?.targetRole || req.topic || "Career Guidance";
                    const msg = req.message || req.topic || "Would love to connect and learn from your industry experience!";
                    const isBusy = actionInProgress[reqId];

                    return (
                      <div
                        key={reqId}
                        className="p-3 rounded-4 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 transition-fast hover-lift"
                        style={{ background: "var(--surface-2, rgba(255,255,255,0.03))", border: "1px solid var(--border)" }}
                      >
                        <div className="d-flex align-items-start gap-3">
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0 shadow-sm"
                            style={{
                              width: "44px",
                              height: "44px",
                              background: "linear-gradient(135deg, var(--primary), #06b6d4)",
                              fontSize: "1rem"
                            }}
                          >
                            {studentName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="d-flex align-items-center gap-2">
                              <h6 className="fw-bold mb-0 text-foreground" style={{ color: "var(--text)" }}>
                                {studentName}
                              </h6>
                              <span className="badge rounded-pill bg-primary-subtle text-primary small py-0.5 px-2">
                                {dept}
                              </span>
                            </div>
                            <div className="small text-muted mt-1">
                              Target: <strong className="text-foreground">{target}</strong>
                            </div>
                            <p className="small text-muted mb-0 mt-1 fst-italic">
                              "{msg}"
                            </p>
                          </div>
                        </div>

                        <div className="d-flex align-items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleRejectRequest(req)}
                            disabled={isBusy}
                            className="btn btn-outline-secondary btn-sm rounded-pill px-3 fw-bold"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => handleAcceptRequest(req)}
                            disabled={isBusy}
                            className="btn btn-primary btn-sm rounded-pill px-4 fw-bold text-white shadow-sm"
                          >
                            {isBusy ? "Accepting..." : "Accept"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Scheduled 1:1 Sessions */}
            <div
              className="bento-card p-4 rounded-4 shadow-sm"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div>
                  <h5 className="fw-bold mb-1" style={{ fontSize: "1.2rem" }}>
                    Your Mentorship Sessions
                  </h5>
                  <p className="small text-muted mb-0">Upcoming confirmed sessions and video room links.</p>
                </div>
                <button
                  onClick={() => navigate("/alumni/sessions")}
                  className="btn btn-primary btn-sm rounded-pill px-3 fw-bold text-white shadow-sm"
                  style={{ background: "#0d6efd", border: "none" }}
                >
                  Manage 1-on-1 Sessions →
                </button>
              </div>

              {sessionsLoading && (
                <div className="text-center py-4">
                  <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                  <span className="small text-muted">Loading your sessions calendar...</span>
                </div>
              )}

              {!sessionsLoading && sessions.length === 0 && (
                <div className="text-center py-4 text-muted">
                  <Calendar size={32} className="opacity-25 mb-2 mx-auto d-block" />
                  <p className="small mb-0">No active sessions booked. Accepted requests will appear here.</p>
                </div>
              )}

              {!sessionsLoading && sessions.length > 0 && (
                <div className="d-flex flex-column gap-3">
                  {sessions.slice(0, 3).map((sess, idx) => {
                    const sessId = sess._id || `sess-${idx}`;
                    const student = sess.mentee?.name || sess.studentName || "Student";
                    const isUpcoming = sess.status === "Scheduled" || sess.status === "Confirmed";

                    return (
                      <div
                        key={sessId}
                        className="p-3 rounded-4 d-flex align-items-center justify-content-between gap-3"
                        style={{ background: "var(--surface-2, rgba(255,255,255,0.03))", border: "1px solid var(--border)" }}
                      >
                        <div className="d-flex align-items-center gap-3">
                          <div className="p-3 rounded-3 bg-primary-subtle text-primary">
                            <Video size={20} />
                          </div>
                          <div>
                            <h6 className="fw-bold mb-0 small" style={{ color: "var(--text)" }}>
                              1:1 Mentorship with {student}
                            </h6>
                            <span className="small text-muted">
                              {sess.date ? new Date(sess.date).toLocaleDateString() : "This week"} • {sess.time || "Scheduled"}
                            </span>
                          </div>
                        </div>

                        <div className="d-flex align-items-center gap-2">
                          {isUpcoming && (
                            <>
                              <button
                                onClick={() => navigate(`/alumni/session/${sessId}`)}
                                className="btn btn-primary btn-sm rounded-pill px-3 fw-bold d-flex align-items-center gap-1 text-white shadow-sm"
                              >
                                <Video size={14} /> Join Room
                              </button>
                              <button
                                onClick={() => handleCompleteSession(sessId)}
                                className="btn btn-outline-secondary btn-sm rounded-pill px-2 fw-medium"
                                title="Mark Completed"
                              >
                                <Check size={14} />
                              </button>
                            </>
                          )}
                          {!isUpcoming && (
                            <span className="badge bg-success-subtle text-success rounded-pill px-3 py-1">
                              Completed
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Campus Community Forum Discussions Section */}
            <div
              className="bento-card p-4 rounded-4 shadow-sm mb-4"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
                <div>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <MessageSquare className="text-primary" size={22} />
                    <h5 className="fw-bold mb-0" style={{ fontSize: "1.2rem", color: "var(--text)" }}>
                      Campus Community Forum
                    </h5>
                    <span className="badge rounded-pill bg-primary-subtle text-primary fw-bold px-2.5 py-0.5 small">
                      Shared with Students & Alumni
                    </span>
                  </div>
                  <p className="small text-muted mb-0">
                    Collaborate directly with students and fellow alumni on career strategies, mock interviews, and tech discussions.
                  </p>
                </div>

                <div className="d-flex align-items-center gap-2">
                  <button
                    onClick={() => setShowForumModal(true)}
                    className="btn btn-primary btn-sm rounded-pill px-3 py-1.5 fw-bold d-flex align-items-center gap-1.5 shadow-sm text-white"
                    style={{ background: "var(--primary)" }}
                  >
                    <Plus size={15} /> Start Discussion
                  </button>
                  <button
                    onClick={() => navigate("/alumni/forum")}
                    className="btn btn-outline-secondary btn-sm rounded-pill px-3 py-1.5 fw-semibold d-flex align-items-center gap-1.5"
                    style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text)" }}
                  >
                    <span>View All Discussions</span> <ArrowRight size={14} />
                  </button>
                </div>
              </div>

              {/* Discussions List */}
              {forumDiscussions.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <MessageSquare size={32} className="opacity-25 mb-2 mx-auto d-block" />
                  <p className="small mb-2">No active discussions found.</p>
                  <button
                    onClick={() => setShowForumModal(true)}
                    className="btn btn-outline-primary btn-sm rounded-pill px-3 py-1 fw-bold"
                  >
                    Be the first alumnus to start a discussion
                  </button>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {forumDiscussions.slice(0, 4).map((post) => {
                    const authorName = post.author?.name || "Community Member";
                    const authorRole = post.author?.role || "Student";
                    const likesCount = post.likesCount ?? (Array.isArray(post.likes) ? post.likes.length : 0);
                    const commentsCount = post.commentsCount ?? (Array.isArray(post.comments) ? post.comments.length : 0);
                    const postTags = Array.isArray(post.tags) ? post.tags : [];

                    return (
                      <div
                        key={post._id}
                        className="p-3 rounded-4 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 hover-lift transition-fast"
                        style={{
                          background: "var(--surface-2, rgba(255,255,255,0.03))",
                          border: "1px solid var(--border)",
                          cursor: "pointer"
                        }}
                        onClick={() => navigate("/alumni/forum")}
                      >
                        <div className="d-flex align-items-start gap-3">
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0 shadow-sm"
                            style={{
                              width: 36,
                              height: 36,
                              background: authorRole === "Alumni" ? "linear-gradient(135deg, #10b981, #059669)" : "linear-gradient(135deg, var(--primary), #7c3aed)",
                              fontSize: "0.85rem"
                            }}
                          >
                            {authorName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                              <span className="fw-bold small" style={{ color: "var(--text)" }}>
                                {authorName}
                              </span>
                              <span
                                className={`badge rounded-pill small py-0.5 px-2 ${
                                  authorRole === "Alumni"
                                    ? "bg-success-subtle text-success"
                                    : "bg-primary-subtle text-primary"
                                }`}
                                style={{ fontSize: "0.68rem" }}
                              >
                                {authorRole}
                              </span>
                              <span className="text-muted" style={{ fontSize: "0.72rem" }}>
                                {post.createdAt ? new Date(post.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "Recently"}
                              </span>
                            </div>
                            <h6 className="fw-bold mb-1" style={{ color: "var(--text)", fontSize: "0.95rem" }}>
                              {post.title}
                            </h6>
                            <p className="text-muted small mb-2 line-clamp-2" style={{ lineHeight: 1.4 }}>
                              {post.content}
                            </p>
                            <div className="d-flex gap-1.5 flex-wrap">
                              {postTags.slice(0, 3).map((tag, tIdx) => (
                                <span
                                  key={tIdx}
                                  className="badge rounded-pill fw-medium"
                                  style={{
                                    background: "var(--surface)",
                                    border: "1px solid var(--border)",
                                    color: "var(--text-secondary)",
                                    fontSize: "0.7rem",
                                    padding: "3px 8px"
                                  }}
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="d-flex align-items-center gap-3 flex-shrink-0 pt-2 pt-md-0 border-top border-md-top-0" style={{ borderColor: "var(--border)" }}>
                          <span className="small text-muted d-flex align-items-center gap-1">
                            👍 {likesCount}
                          </span>
                          <span className="small text-muted d-flex align-items-center gap-1">
                            💬 {commentsCount} {commentsCount === 1 ? "reply" : "replies"}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate("/alumni/forum");
                            }}
                            className="btn btn-sm btn-outline-primary rounded-pill px-3 py-1 fw-bold"
                            style={{ fontSize: "0.75rem" }}
                          >
                            Join Thread →
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Student Discovery & Quick Networking */}
          <div className="col-lg-4">
            {/* Student Discovery & Mentor Recommendations Widget */}
            <div
              className="bento-card p-4 rounded-4 shadow-sm mb-4"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div className="d-flex align-items-center justify-content-between mb-2">
                <div className="d-flex align-items-center gap-2">
                  <Sparkles size={18} className="text-warning" />
                  <h6 className="fw-bold m-0" style={{ color: "var(--text)" }}>
                    Campus Network
                  </h6>
                </div>
                {/* Switcher */}
                <div className="d-flex p-1 rounded-pill" style={{ background: "var(--surface-2, rgba(0,0,0,0.05))" }}>
                  <button
                    onClick={() => setDiscoveryTab("students")}
                    className={`btn btn-sm rounded-pill px-3 py-1 fw-bold border-0 ${
                      discoveryTab === "students" ? "bg-primary text-white shadow-sm" : "text-muted"
                    }`}
                    style={{ fontSize: "0.74rem" }}
                  >
                    Students
                  </button>
                  <button
                    onClick={() => setDiscoveryTab("mentors")}
                    className={`btn btn-sm rounded-pill px-3 py-1 fw-bold border-0 ${
                      discoveryTab === "mentors" ? "bg-primary text-white shadow-sm" : "text-muted"
                    }`}
                    style={{ fontSize: "0.74rem" }}
                  >
                    Mentors
                  </button>
                </div>
              </div>

              {discoveryTab === "students" ? (
                <>
                  <p className="small text-muted mb-3">
                    Students targeting roles in <strong>{alumniCompany}</strong> or your engineering domain.
                  </p>

                  <div className="position-relative mb-3">
                    <Search size={14} className="position-absolute top-50 translate-middle-y ms-3 text-muted" />
                    <input
                      type="text"
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      placeholder="Filter by skill or department..."
                      className="form-control form-control-sm rounded-pill ps-5"
                      style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text)" }}
                    />
                  </div>

                  <div className="d-flex flex-column gap-3">
                    {(filteredStudents.length > 0
                      ? filteredStudents.slice(0, 4)
                      : [
                          { name: "Aditya Verma", role: "Software Engineer", dept: "CSE '26", skills: ["React", "Node.js"] },
                          { name: "Kavya Nair", role: "Cloud Architect", dept: "IT '25", skills: ["AWS", "Docker"] },
                          { name: "Rohan Patel", role: "Data Scientist", dept: "AI & DS '26", skills: ["Python", "PyTorch"] }
                        ]
                    ).map((st, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-3 d-flex align-items-center justify-content-between"
                        style={{ background: "var(--surface-2, rgba(255,255,255,0.02))", border: "1px solid var(--border)" }}
                      >
                        <div>
                          <div className="fw-bold small" style={{ color: "var(--text)" }}>
                            {st.name}
                          </div>
                          <span className="small text-muted d-block" style={{ fontSize: "0.75rem" }}>
                            {st.dept || st.studentProfile?.department || "Student"} • Target: {st.role || st.studentProfile?.targetCareerRole || "SWE"}
                          </span>
                        </div>

                        <button
                          onClick={() => {
                            addToast(`Connection invitation sent to ${st.name}!`, "success");
                          }}
                          className="btn btn-outline-primary btn-sm rounded-pill px-3 py-1 fw-bold"
                          style={{ fontSize: "0.75rem" }}
                        >
                          Connect
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => navigate("/alumni/network")}
                    className="btn btn-outline-secondary w-100 rounded-pill mt-3 py-2 fw-semibold small"
                  >
                    Browse Campus Directory →
                  </button>
                </>
              ) : (
                <>
                  <p className="small text-muted mb-3">
                    Recommended alumni mentors and industry leaders for peer collaboration.
                  </p>

                  <div className="d-flex flex-column gap-3">
                    {(recommendedMentors.length > 0
                      ? recommendedMentors.slice(0, 4)
                      : [
                          { name: "Siddharth Rao", company: "Google", role: "Staff Engineer" },
                          { name: "Ananya Deshmukh", company: "Microsoft", role: "Principal PM" },
                          { name: "Vikram Singhania", company: "Amazon", role: "Engineering Lead" }
                        ]
                    ).map((mentor, i) => {
                      const mName = mentor.name || mentor.user?.name || "Alumni Mentor";
                      const mCompany = mentor.company || mentor.alumniProfile?.company || "Tech Leader";
                      const mRole = mentor.role || mentor.alumniProfile?.designation || mentor.alumniProfile?.currentRole || "Specialist";
                      return (
                        <div
                          key={i}
                          className="p-3 rounded-3 d-flex align-items-center justify-content-between"
                          style={{ background: "var(--surface-2, rgba(255,255,255,0.02))", border: "1px solid var(--border)" }}
                        >
                          <div className="d-flex align-items-center gap-2">
                            <div
                              className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
                              style={{ width: "32px", height: "32px", background: "linear-gradient(135deg, var(--primary), var(--purple, #7c3aed))", fontSize: "0.8rem" }}
                            >
                              {mName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="fw-bold small" style={{ color: "var(--text)" }}>
                                {mName}
                              </div>
                              <span className="small text-muted d-block" style={{ fontSize: "0.72rem" }}>
                                {mCompany} • {mRole}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              addToast(`Colleague invitation sent to ${mName}! 🤝`, "success");
                            }}
                            className="btn btn-outline-primary btn-sm rounded-pill px-3 py-1 fw-bold"
                            style={{ fontSize: "0.75rem" }}
                          >
                            Connect
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => navigate("/alumni/network")}
                    className="btn btn-outline-secondary w-100 rounded-pill mt-3 py-2 fw-semibold small"
                  >
                    View All Alumni Mentors →
                  </button>
                </>
              )}
            </div>

            {/* Quick Actions Hub */}
            <div
              className="bento-card p-4 rounded-4 shadow-sm"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <h6 className="fw-bold mb-3" style={{ color: "var(--text)" }}>
                Alumni Resources
              </h6>

              <div className="d-flex flex-column gap-2">
                <button
                  onClick={() => navigate("/alumni/availability")}
                  className="btn btn-light rounded-3 text-start p-3 d-flex align-items-center justify-content-between border"
                  style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text)" }}
                >
                  <div className="d-flex align-items-center gap-2">
                    <Clock size={16} className="text-primary" />
                    <span className="small fw-semibold">Manage Weekly Availability</span>
                  </div>
                  <ChevronRight size={14} className="text-muted" />
                </button>

                <button
                  onClick={() => navigate("/alumni/bounties")}
                  className="btn btn-light rounded-3 text-start p-3 d-flex align-items-center justify-content-between border"
                  style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text)" }}
                >
                  <div className="d-flex align-items-center gap-2">
                    <Award size={16} className="text-warning" />
                    <span className="small fw-semibold">Post Student Project Bounties</span>
                  </div>
                  <ChevronRight size={14} className="text-muted" />
                </button>

                <button
                  onClick={() => navigate("/alumni/forum")}
                  className="btn btn-light rounded-3 text-start p-3 d-flex align-items-center justify-content-between border"
                  style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text)" }}
                >
                  <div className="d-flex align-items-center gap-2">
                    <MessageSquare size={16} className="text-info" />
                    <span className="small fw-semibold">Campus Discussion Forum</span>
                  </div>
                  <ChevronRight size={14} className="text-muted" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MODAL: SHARE OPPORTUNITY / REFERRAL ── */}
      {showShareModal && (
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
                  Share Career Opportunity
                </h5>
                <span className="small text-muted">Post a vacancy or referral directly for campus students.</span>
              </div>
              <button onClick={() => setShowShareModal(false)} className="btn btn-link p-0 text-muted">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleShareOpportunity} className="space-y-3">
              <div className="row g-2">
                <div className="col-12 col-md-7">
                  <label className="form-label small fw-bold">Job Role / Title *</label>
                  <input
                    type="text"
                    required
                    value={opportunityForm.title}
                    onChange={(e) => setOpportunityForm({ ...opportunityForm, title: e.target.value })}
                    placeholder="e.g. Associate Software Engineer"
                    className="form-control"
                    style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text)" }}
                  />
                </div>
                <div className="col-12 col-md-5">
                  <label className="form-label small fw-bold">Company *</label>
                  <input
                    type="text"
                    required
                    value={opportunityForm.company}
                    onChange={(e) => setOpportunityForm({ ...opportunityForm, company: e.target.value })}
                    placeholder="e.g. Google"
                    className="form-control"
                    style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text)" }}
                  />
                </div>
              </div>

              <div className="row g-2">
                <div className="col-6">
                  <label className="form-label small fw-bold">Opportunity Type</label>
                  <select
                    value={opportunityForm.type}
                    onChange={(e) => setOpportunityForm({ ...opportunityForm, type: e.target.value })}
                    className="form-select"
                    style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text)" }}
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Internship">Internship</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold">Location</label>
                  <input
                    type="text"
                    value={opportunityForm.location}
                    onChange={(e) => setOpportunityForm({ ...opportunityForm, location: e.target.value })}
                    placeholder="e.g. Bangalore / Remote"
                    className="form-control"
                    style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text)" }}
                  />
                </div>
              </div>

              <div>
                <label className="form-label small fw-bold">Target Skills (comma-separated)</label>
                <input
                  type="text"
                  value={opportunityForm.skills}
                  onChange={(e) => setOpportunityForm({ ...opportunityForm, skills: e.target.value })}
                  placeholder="e.g. React, Java, Spring Boot, AWS"
                  className="form-control"
                  style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text)" }}
                />
              </div>

              <div>
                <label className="form-label small fw-bold">Short Description / Referral Notes</label>
                <textarea
                  rows={3}
                  value={opportunityForm.description}
                  onChange={(e) => setOpportunityForm({ ...opportunityForm, description: e.target.value })}
                  placeholder="Share details on the team, criteria, or how students can prepare..."
                  className="form-control"
                  style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text)" }}
                />
              </div>

              <div className="d-flex justify-content-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowShareModal(false)}
                  className="btn btn-outline-secondary rounded-pill px-4 fw-bold small"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={postingOpportunity}
                  className="btn btn-primary rounded-pill px-4 fw-bold small text-white"
                >
                  {postingOpportunity ? "Posting..." : "Share with Students"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: START FORUM DISCUSSION ── */}
      {showForumModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{ background: "rgba(0,0,0,0.6)", zIndex: 1050, backdropFilter: "blur(4px)" }}
        >
          <div
            className="bento-card p-4 rounded-4 shadow-lg w-100"
            style={{ maxWidth: "560px", background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-3">
              <div>
                <h5 className="fw-bold m-0" style={{ color: "var(--text)" }}>
                  Start a Campus Discussion
                </h5>
                <span className="small text-muted">
                  Share insights, tips, or questions with all students and alumni
                </span>
              </div>
              <button
                onClick={() => setShowForumModal(false)}
                className="btn btn-sm btn-link p-1 text-muted border-0"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateForumDiscussion} className="space-y-3">
              <div>
                <label className="form-label small fw-bold" style={{ color: "var(--text)" }}>
                  Discussion Title *
                </label>
                <input
                  type="text"
                  required
                  value={forumTitle}
                  onChange={(e) => setForumTitle(e.target.value)}
                  placeholder="e.g. Tips for System Design & Behavioral Interview Rounds"
                  className="form-control"
                  style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text)" }}
                />
              </div>

              <div>
                <label className="form-label small fw-bold" style={{ color: "var(--text)" }}>
                  Topic Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={forumTags}
                  onChange={(e) => setForumTags(e.target.value)}
                  placeholder="e.g. Career, Interviews, Google, SystemDesign"
                  className="form-control"
                  style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text)" }}
                />
              </div>

              <div>
                <label className="form-label small fw-bold" style={{ color: "var(--text)" }}>
                  Discussion Details & Advice *
                </label>
                <textarea
                  required
                  rows={5}
                  value={forumContent}
                  onChange={(e) => setForumContent(e.target.value)}
                  placeholder="Share recommendations, interview insights, or prompt students with thoughtful advice..."
                  className="form-control resize-none"
                  style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text)" }}
                />
              </div>

              <div className="d-flex justify-content-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowForumModal(false)}
                  className="btn btn-outline-secondary rounded-pill px-4 fw-bold small"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={postingForum}
                  className="btn btn-primary rounded-pill px-4 fw-bold small text-white d-flex align-items-center gap-2"
                >
                  {postingForum ? (
                    <>
                      <span className="spinner-border spinner-border-sm"></span> Publishing...
                    </>
                  ) : (
                    <>
                      <Send size={15} /> Publish to Forum
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
