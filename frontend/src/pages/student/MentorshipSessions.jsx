import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  Calendar,
  Clock,
  Video,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight,
  User,
  Search,
  Filter,
  RefreshCw,
  MessageSquare,
  Star,
  Sparkles,
  ExternalLink,
  ChevronRight,
  X,
  Briefcase,
  GraduationCap
} from "lucide-react";
import { mentorshipService } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";

export default function MentorshipSessions() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();

  // 4 Tabs: Pending requests, Accepted and upcoming sessions, Completed sessions, Declined or cancelled requests
  const [activeTab, setActiveTab] = useState("upcoming"); // 'upcoming' | 'pending' | 'completed' | 'cancelled'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Data from MongoDB
  const [sessions, setSessions] = useState([]);
  const [requests, setRequests] = useState([]);

  // Action states
  const [actionInProgress, setActionInProgress] = useState({});

  // Modals
  const [reviewModal, setReviewModal] = useState({ open: false, session: null, rating: 5, review: "" });
  const [cancelModal, setCancelModal] = useState({ open: false, item: null, reason: "", isSession: false });

  const fetchMyData = async () => {
    try {
      setLoading(true);
      const [sessRes, reqRes] = await Promise.all([
        mentorshipService.getSessions().catch((e) => {
          console.warn("Could not fetch sessions:", e);
          return { data: { data: [] } };
        }),
        mentorshipService.getMyRequests().catch((e) => {
          console.warn("Could not fetch requests:", e);
          return { data: { data: [] } };
        })
      ]);

      setSessions(Array.isArray(sessRes.data?.data) ? sessRes.data.data : []);
      setRequests(Array.isArray(reqRes.data?.data) ? reqRes.data.data : []);
    } catch (err) {
      console.error("Failed to load student mentorship data:", err);
      addToast("Failed to load mentorship sessions", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMyData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMyData();
    addToast("Sessions refreshed from MongoDB", "info");
  };

  // ── Date and Time Normalization Helpers ─────────────────────────────────────
  const formatSessionTime = (item) => {
    if (item.startTime && item.endTime) {
      return { start: item.startTime, end: item.endTime };
    }
    if (item.requestedStartTime) {
      return {
        start: item.requestedStartTime,
        end: item.requestedEndTime || `${item.requestedStartTime} (${item.durationMinutes || 30} mins)`
      };
    }
    const raw = item.scheduledStart || item.scheduledDate;
    if (raw) {
      const d = new Date(raw);
      if (!isNaN(d.getTime())) {
        const startStr = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
        const endD = item.scheduledEnd ? new Date(item.scheduledEnd) : new Date(d.getTime() + (item.durationMinutes || 30) * 60000);
        const endStr = !isNaN(endD.getTime())
          ? endD.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })
          : "";
        return { start: startStr, end: endStr || `${item.durationMinutes || 30} mins` };
      }
    }
    return { start: "18:00", end: "18:30" };
  };

  const getSafeDate = (item) => {
    const raw = item.scheduledStart || item.scheduledDate || item.requestedDate || item.createdAt;
    if (!raw) return new Date();
    const d = new Date(raw);
    return isNaN(d.getTime()) ? new Date() : d;
  };

  // ── Tab Categorization ──────────────────────────────────────────────────────
  const categorized = useMemo(() => {
    // 1. Accepted and upcoming sessions
    const upcoming = sessions.filter((s) =>
      ["Scheduled", "Confirmed", "Approved", "Active", "InProgress", "Rescheduled"].includes(s.status)
    );

    // 2. Pending requests
    const pending = requests.filter((r) => r.status === "Pending");

    // 3. Completed sessions
    const completed = sessions.filter((s) => s.status === "Completed");

    // 4. Declined or cancelled requests / sessions
    const cancelledSessions = sessions.filter((s) => ["Cancelled", "Rejected"].includes(s.status));
    const rejectedOrCancelledRequests = requests.filter((r) => ["Rejected", "Cancelled"].includes(r.status));

    const cancelledMap = new Map();
    cancelledSessions.forEach((s) => cancelledMap.set(s._id.toString(), { ...s, isSession: true }));
    rejectedOrCancelledRequests.forEach((r) => {
      const key = (r.sessionId || r._id).toString();
      if (!cancelledMap.has(key)) {
        cancelledMap.set(key, { ...r, isRequest: true });
      }
    });
    const cancelled = Array.from(cancelledMap.values());

    return { upcoming, pending, completed, cancelled };
  }, [sessions, requests]);

  // Current items
  const currentItems = useMemo(() => {
    let items = [];
    if (activeTab === "upcoming") items = categorized.upcoming;
    else if (activeTab === "pending") items = categorized.pending;
    else if (activeTab === "completed") items = categorized.completed;
    else if (activeTab === "cancelled") items = categorized.cancelled;

    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase().trim();
    return items.filter((item) => {
      const mentorName = item.alumni?.name || item.mentor?.name || item.mentorName || "";
      const topic = item.topic || "";
      const msg = item.message || item.careerGoal || "";
      return mentorName.toLowerCase().includes(q) || topic.toLowerCase().includes(q) || msg.toLowerCase().includes(q);
    });
  }, [activeTab, categorized, searchQuery]);

  // ── Actions ─────────────────────────────────────────────────────────────────

  // Cancel Request or Session
  const handleConfirmCancel = async () => {
    const { item, reason, isSession } = cancelModal;
    if (!item) return;
    const id = item._id;
    try {
      setActionInProgress((prev) => ({ ...prev, [id]: true }));
      if (isSession) {
        await mentorshipService.cancelSession(id, { cancellationReason: reason || "Cancelled by student" });
      } else {
        await mentorshipService.cancelRequest(id);
      }
      addToast("Mentorship booking cancelled.", "info");
      setCancelModal({ open: false, item: null, reason: "", isSession: false });
      await fetchMyData();
    } catch (err) {
      console.error("Cancel error:", err);
      const msg = err.response?.data?.message || "Failed to cancel mentorship";
      addToast(msg, "error");
    } finally {
      setActionInProgress((prev) => ({ ...prev, [id]: false }));
    }
  };

  // Submit Feedback / Rating for Completed Session
  const handleConfirmReview = async () => {
    const { session, rating, review } = reviewModal;
    if (!session) return;
    const id = session._id;
    try {
      setActionInProgress((prev) => ({ ...prev, [id]: true }));
      await mentorshipService.submitFeedback(id, {
        rating: Number(rating) || 5,
        review: review.trim() || "Great 1-on-1 mentorship session."
      });
      addToast("Feedback & rating submitted successfully! Thank you. ⭐", "success");
      setReviewModal({ open: false, session: null, rating: 5, review: "" });
      await fetchMyData();
    } catch (err) {
      console.error("Review submit error:", err);
      const msg = err.response?.data?.message || "Failed to submit rating";
      addToast(msg, "error");
    } finally {
      setActionInProgress((prev) => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div className="container-fluid py-4 px-3 px-md-4" style={{ maxWidth: "1320px", margin: "0 auto" }}>
      {/* ── Top Header ── */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <h1
              className="fw-black mb-0"
              style={{
                fontSize: "2.1rem",
                color: "var(--text)",
                letterSpacing: "-0.03em"
              }}
            >
              My Mentorship Sessions
            </h1>
            <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-3 py-1 fw-bold small">
              Verified MongoDB Sync
            </span>
          </div>
          <p className="text-muted m-0" style={{ fontSize: "1rem" }}>
            Track pending requests, join upcoming 1-on-1 rooms, review completed sessions, and coordinate with alumni.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn btn-outline-secondary rounded-pill px-3 py-2 fw-semibold d-flex align-items-center gap-2"
            title="Refresh from MongoDB"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin text-primary" : ""} />
            <span>{refreshing ? "Syncing..." : "Refresh"}</span>
          </button>
          <Link
            to="/student/mentorship"
            className="btn btn-primary rounded-pill px-4 py-2 fw-semibold d-flex align-items-center gap-2 shadow-sm text-white"
            style={{ background: "#0d6efd", border: "none" }}
          >
            <Sparkles size={16} /> Book New Session
          </Link>
        </div>
      </div>

      {/* ── 4 Tabs Matching User Requirements ── */}
      <div
        className="bento-card p-0 overflow-hidden mb-4 shadow-sm"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "16px"
        }}
      >
        <div
          className="d-flex border-bottom flex-wrap"
          style={{
            background: "var(--surface-2, rgba(255,255,255,0.02))",
            borderColor: "var(--border)"
          }}
        >
          {/* Tab 1: Accepted and upcoming sessions */}
          <button
            className={`btn rounded-0 px-4 py-3 fw-bold border-0 d-flex align-items-center gap-2 transition-all ${
              activeTab === "upcoming"
                ? "text-primary border-bottom border-primary border-3 bg-primary-subtle"
                : "text-muted hover-bg"
            }`}
            style={{ backgroundColor: activeTab === "upcoming" ? "rgba(13, 110, 253, 0.08)" : "transparent" }}
            onClick={() => setActiveTab("upcoming")}
          >
            <Calendar size={18} />
            <span>Upcoming Sessions</span>
            <span
              className={`badge rounded-pill small ms-1 ${
                activeTab === "upcoming" ? "bg-primary text-white" : "bg-secondary-subtle text-muted"
              }`}
            >
              {categorized.upcoming.length}
            </span>
          </button>

          {/* Tab 2: Pending requests */}
          <button
            className={`btn rounded-0 px-4 py-3 fw-bold border-0 d-flex align-items-center gap-2 transition-all ${
              activeTab === "pending"
                ? "text-warning border-bottom border-warning border-3 bg-warning-subtle"
                : "text-muted hover-bg"
            }`}
            style={{ backgroundColor: activeTab === "pending" ? "rgba(245, 158, 11, 0.08)" : "transparent" }}
            onClick={() => setActiveTab("pending")}
          >
            <Clock size={18} />
            <span>Pending Requests</span>
            <span
              className={`badge rounded-pill small ms-1 ${
                activeTab === "pending" ? "bg-warning text-dark" : "bg-secondary-subtle text-muted"
              }`}
            >
              {categorized.pending.length}
            </span>
          </button>

          {/* Tab 3: Completed sessions */}
          <button
            className={`btn rounded-0 px-4 py-3 fw-bold border-0 d-flex align-items-center gap-2 transition-all ${
              activeTab === "completed"
                ? "text-success border-bottom border-success border-3 bg-success-subtle"
                : "text-muted hover-bg"
            }`}
            style={{ backgroundColor: activeTab === "completed" ? "rgba(16, 185, 129, 0.08)" : "transparent" }}
            onClick={() => setActiveTab("completed")}
          >
            <CheckCircle size={18} />
            <span>Completed Sessions</span>
            <span
              className={`badge rounded-pill small ms-1 ${
                activeTab === "completed" ? "bg-success text-white" : "bg-secondary-subtle text-muted"
              }`}
            >
              {categorized.completed.length}
            </span>
          </button>

          {/* Tab 4: Declined or cancelled requests */}
          <button
            className={`btn rounded-0 px-4 py-3 fw-bold border-0 d-flex align-items-center gap-2 transition-all ${
              activeTab === "cancelled"
                ? "text-danger border-bottom border-danger border-3 bg-danger-subtle"
                : "text-muted hover-bg"
            }`}
            style={{ backgroundColor: activeTab === "cancelled" ? "rgba(239, 68, 68, 0.08)" : "transparent" }}
            onClick={() => setActiveTab("cancelled")}
          >
            <XCircle size={18} />
            <span>Declined & Cancelled</span>
            <span
              className={`badge rounded-pill small ms-1 ${
                activeTab === "cancelled" ? "bg-danger text-white" : "bg-secondary-subtle text-muted"
              }`}
            >
              {categorized.cancelled.length}
            </span>
          </button>
        </div>

        {/* ── Subheader with Search ── */}
        <div
          className="p-3 border-bottom d-flex align-items-center justify-content-between flex-wrap gap-3"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <div className="position-relative flex-grow-1" style={{ maxWidth: "380px" }}>
            <Search size={16} className="position-absolute top-50 translate-middle-y ms-3 text-muted" />
            <input
              type="text"
              placeholder="Search by alumnus name, topic, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-control form-control-sm rounded-pill ps-5 py-2"
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                color: "var(--text)"
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="btn btn-sm btn-link position-absolute end-0 top-50 translate-middle-y me-2 text-muted p-0"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="text-muted small">
            Showing <strong>{currentItems.length}</strong> {activeTab} {currentItems.length === 1 ? "session" : "sessions"}
          </div>
        </div>

        {/* ── Main Content Grid ── */}
        <div className="p-4">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary mb-3" style={{ width: "2.5rem", height: "2.5rem" }}></div>
              <p className="text-muted fw-semibold">Loading your mentorship sessions...</p>
            </div>
          ) : currentItems.length === 0 ? (
            <div className="text-center py-5">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                style={{
                  width: "64px",
                  height: "64px",
                  background: "rgba(var(--primary-rgb, 13, 110, 253), 0.08)",
                  color: "var(--primary)"
                }}
              >
                {activeTab === "upcoming" ? (
                  <Calendar size={32} />
                ) : activeTab === "pending" ? (
                  <Clock size={32} />
                ) : activeTab === "completed" ? (
                  <CheckCircle size={32} />
                ) : (
                  <XCircle size={32} />
                )}
              </div>
              <h5 className="fw-bold mb-1" style={{ color: "var(--text)" }}>
                No {activeTab} sessions
              </h5>
              <p className="text-muted small mb-3 mx-auto" style={{ maxWidth: "420px" }}>
                {activeTab === "upcoming"
                  ? "You don't have any accepted sessions coming up. Connect with an alumni mentor to get career roadmapping and mock interview guidance."
                  : activeTab === "pending"
                  ? "No pending mentorship requests. When you request 1-on-1 sessions, they will be listed here while awaiting alumni confirmation."
                  : activeTab === "completed"
                  ? "No completed sessions yet. Once an alumnus finishes your 1-on-1 call, you can review discussion notes and leave feedback."
                  : "No declined or cancelled requests found."}
              </p>
              <Link to="/student/mentorship" className="btn btn-sm btn-primary rounded-pill px-4 fw-semibold text-white shadow-sm" style={{ background: "#0d6efd", border: "none" }}>
                Explore Mentors
              </Link>
            </div>
          ) : (
            <div className="row g-4">
              {currentItems.map((item) => {
                const itemId = item._id;
                const mentorName = item.alumni?.name || item.mentor?.name || item.mentorName || "Alumni Mentor";
                const mentorAvatar = item.alumni?.avatar || item.mentor?.avatar;
                const mentorRole =
                  item.alumni?.alumniProfile?.designation ||
                  item.alumni?.alumniProfile?.currentRole ||
                  item.mentor?.alumniProfile?.designation ||
                  item.mentor?.alumniProfile?.currentRole ||
                  "Software Engineer";
                const mentorCompany =
                  item.alumni?.alumniProfile?.company ||
                  item.mentor?.alumniProfile?.company ||
                  "Tech Firm";

                const topic = item.topic || "1-on-1 Mentorship & Career Guidance";
                const message = item.message || item.careerGoal || "";

                const dateObj = getSafeDate(item);
                const timeInfo = formatSessionTime(item);
                const duration = item.durationMinutes || item.duration || 30;

                const isUpcoming = ["Scheduled", "Confirmed", "Approved", "Active", "InProgress", "Rescheduled"].includes(item.status);
                const isPending = item.status === "Pending";
                const isCompleted = item.status === "Completed";
                const isCancelled = ["Cancelled", "Rejected"].includes(item.status);

                return (
                  <div key={itemId} className="col-12 col-md-6 col-xl-4">
                    <div
                      className="bento-card p-4 h-100 d-flex flex-column rounded-4 shadow-sm transition-all hover-lift"
                      style={{
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                        position: "relative"
                      }}
                    >
                      {/* Top Mentor Header */}
                      <div className="d-flex justify-content-between align-items-start mb-3 gap-2">
                        <div className="d-flex align-items-center gap-3">
                          {mentorAvatar ? (
                            <img
                              src={mentorAvatar}
                              alt={mentorName}
                              className="rounded-circle shadow-sm"
                              style={{ width: "42px", height: "42px", objectFit: "cover" }}
                            />
                          ) : (
                            <div
                              className="rounded-circle d-flex align-items-center justify-content-center text-primary fw-bold"
                              style={{
                                width: "42px",
                                height: "42px",
                                background: "rgba(13, 110, 253, 0.1)",
                                fontSize: "1rem"
                              }}
                            >
                              {mentorName.charAt(0)}
                            </div>
                          )}
                          <div>
                            <h6 className="fw-bold mb-0 text-truncate" style={{ maxWidth: "160px", color: "var(--text)" }}>
                              {mentorName}
                            </h6>
                            <span className="text-muted small text-truncate d-block" style={{ fontSize: "0.78rem", maxWidth: "160px" }}>
                              {mentorRole} • {mentorCompany}
                            </span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <span
                          className={`badge rounded-pill px-3 py-1 fw-bold text-uppercase ${
                            isUpcoming
                              ? "bg-primary-subtle text-primary border border-primary-subtle"
                              : isPending
                              ? "bg-warning-subtle text-warning border border-warning-subtle"
                              : isCompleted
                              ? "bg-success-subtle text-success border border-success-subtle"
                              : "bg-danger-subtle text-danger border border-danger-subtle"
                          }`}
                          style={{ fontSize: "0.72rem", letterSpacing: "0.05em" }}
                        >
                          {item.status}
                        </span>
                      </div>

                      {/* Mentoring Topic & Details */}
                      <div className="mb-3">
                        <div className="small text-uppercase text-muted fw-bold mb-1" style={{ fontSize: "0.7rem", letterSpacing: "0.04em" }}>
                          Topic
                        </div>
                        <h6 className="fw-bold mb-1" style={{ color: "var(--text)", lineHeight: 1.35 }}>
                          {topic}
                        </h6>
                        {message && (
                          <p className="text-muted small mb-0 fst-italic text-truncate-2" style={{ fontSize: "0.82rem" }}>
                            "{message}"
                          </p>
                        )}
                      </div>

                      {/* Date & Time Info Card */}
                      <div
                        className="p-3 rounded-3 mb-3"
                        style={{
                          background: "var(--surface-2, rgba(255,255,255,0.03))",
                          border: "1px solid var(--border)"
                        }}
                      >
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <div className="d-flex align-items-center gap-2 small fw-semibold" style={{ color: "var(--text)" }}>
                            <Calendar size={16} className="text-primary" />
                            <span>{format(dateObj, "EEE, MMM dd, yyyy")}</span>
                          </div>
                          <span className="badge bg-secondary-subtle text-muted rounded-pill small">
                            {duration} min
                          </span>
                        </div>

                        <div className="d-flex align-items-center gap-2 small" style={{ color: "var(--text-secondary)" }}>
                          <Clock size={16} className="text-primary" />
                          <span>
                            <strong>Start:</strong> {timeInfo.start} &nbsp;|&nbsp; <strong>End:</strong> {timeInfo.end}
                          </span>
                        </div>

                        {/* Extra Status Timestamps & Reasons */}
                        {item.completedAt && (
                          <div className="mt-2 pt-2 border-top small text-success fw-medium d-flex align-items-center gap-1" style={{ borderColor: "var(--border)" }}>
                            <CheckCircle size={14} /> Completed: {format(new Date(item.completedAt), "MMM dd, hh:mm a")}
                          </div>
                        )}
                        {item.cancellationReason && (
                          <div className="mt-2 pt-2 border-top small text-danger fw-medium" style={{ borderColor: "var(--border)" }}>
                            <strong>Reason:</strong> {item.cancellationReason}
                          </div>
                        )}
                        {item.rejectionReason && (
                          <div className="mt-2 pt-2 border-top small text-danger fw-medium" style={{ borderColor: "var(--border)" }}>
                            <strong>Declined:</strong> {item.rejectionReason}
                          </div>
                        )}
                        {item.rating && (
                          <div className="mt-2 pt-2 border-top small text-warning fw-medium" style={{ borderColor: "var(--border)" }}>
                            <Star size={13} className="fill-current text-warning me-1" />
                            Your Rating: {item.rating}/5 {item.review ? `— "${item.review}"` : ""}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="mt-auto pt-2">
                        {/* 1. Upcoming Actions */}
                        {isUpcoming && (
                          <div className="d-flex flex-column gap-2">
                            <Link
                              to={`/mentorship/session/${item._id}`}
                              className="btn btn-primary w-100 rounded-pill fw-bold d-flex align-items-center justify-content-center gap-2 py-2 text-white shadow-sm"
                              style={{ background: "#0d6efd", border: "none" }}
                            >
                              <Video size={16} /> Join 1-on-1 Session Room
                            </Link>
                            <button
                              type="button"
                              className="btn btn-outline-danger w-100 rounded-pill fw-semibold py-1 small"
                              onClick={() => setCancelModal({ open: true, item, reason: "", isSession: true })}
                            >
                              Cancel Booking
                            </button>
                          </div>
                        )}

                        {/* 2. Pending Actions */}
                        {isPending && (
                          <div className="d-flex flex-column gap-2">
                            <div className="p-2 rounded-3 text-center small text-warning bg-warning-subtle border border-warning-subtle fw-semibold">
                              Awaiting Alumnus Confirmation
                            </div>
                            <button
                              type="button"
                              className="btn btn-outline-danger w-100 rounded-pill fw-semibold py-1 small"
                              onClick={() => setCancelModal({ open: true, item, reason: "", isSession: false })}
                            >
                              Cancel Request
                            </button>
                          </div>
                        )}

                        {/* 3. Completed Actions */}
                        {isCompleted && (
                          <div className="d-flex gap-2">
                            <Link
                              to={`/mentorship/session/${item._id}`}
                              className="btn btn-outline-primary flex-grow-1 rounded-pill fw-semibold py-2 btn-sm text-center"
                            >
                              View Notes
                            </Link>
                            {!item.rating && (
                              <button
                                type="button"
                                className="btn btn-warning rounded-pill fw-bold px-3 py-2 btn-sm text-dark d-flex align-items-center gap-1"
                                onClick={() => setReviewModal({ open: true, session: item, rating: 5, review: "" })}
                              >
                                <Star size={14} className="fill-current" /> Rate
                              </button>
                            )}
                          </div>
                        )}

                        {/* 4. Cancelled or Declined Actions */}
                        {isCancelled && (
                          <div className="text-center">
                            <Link
                              to="/student/mentorship"
                              className="btn btn-sm btn-outline-primary rounded-pill px-3 fw-semibold w-100"
                            >
                              Book with Another Mentor
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Modal: Rate & Review Completed Session ── */}
      {reviewModal.open && (
        <div
          className="modal fade show d-block"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", zIndex: 1050 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 p-4" style={{ background: "var(--surface)", color: "var(--text)" }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
                  <Star size={20} className="text-warning fill-current" /> Rate Your Mentorship Session
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setReviewModal({ open: false, session: null, rating: 5, review: "" })}
                ></button>
              </div>
              <p className="text-muted small mb-3">
                How was your session with <strong>{reviewModal.session?.mentor?.name || "your mentor"}</strong>? Your feedback helps improve mentorship matching.
              </p>

              <div className="mb-3 text-center">
                <label className="form-label small fw-bold text-muted d-block mb-2">Rating</label>
                <div className="d-flex justify-content-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="btn p-1 border-0"
                      onClick={() => setReviewModal((p) => ({ ...p, rating: star }))}
                    >
                      <Star
                        size={28}
                        className={star <= reviewModal.rating ? "text-warning fill-current" : "text-muted opacity-25"}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold text-muted">Review / Feedback</label>
                <textarea
                  rows="3"
                  className="form-control rounded-3"
                  placeholder="Share what insights were most helpful during this session..."
                  value={reviewModal.review}
                  onChange={(e) => setReviewModal((p) => ({ ...p, review: e.target.value }))}
                  style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}
                ></textarea>
              </div>

              <div className="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary rounded-pill px-4"
                  onClick={() => setReviewModal({ open: false, session: null, rating: 5, review: "" })}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-warning rounded-pill px-4 fw-bold text-dark"
                  onClick={handleConfirmReview}
                >
                  Submit Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Cancel Booking ── */}
      {cancelModal.open && (
        <div
          className="modal fade show d-block"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", zIndex: 1050 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 p-4" style={{ background: "var(--surface)", color: "var(--text)" }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0 text-danger d-flex align-items-center gap-2">
                  <AlertCircle size={20} /> Cancel Mentorship Request
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setCancelModal({ open: false, item: null, reason: "", isSession: false })}
                ></button>
              </div>
              <p className="text-muted small mb-3">
                Are you sure you want to cancel this mentorship session?
              </p>
              <div className="mb-3">
                <label className="form-label small fw-bold text-muted">Reason (Optional)</label>
                <textarea
                  rows="3"
                  className="form-control rounded-3"
                  placeholder="e.g. Class timetable conflict, need to reschedule later."
                  value={cancelModal.reason}
                  onChange={(e) => setCancelModal((p) => ({ ...p, reason: e.target.value }))}
                  style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}
                ></textarea>
              </div>
              <div className="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary rounded-pill px-4"
                  onClick={() => setCancelModal({ open: false, item: null, reason: "", isSession: false })}
                >
                  Keep Request
                </button>
                <button
                  type="button"
                  className="btn btn-danger rounded-pill px-4 fw-bold"
                  onClick={handleConfirmCancel}
                >
                  Confirm Cancellation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

