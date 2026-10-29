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
  Sliders,
  Search,
  Filter,
  RefreshCw,
  MessageSquare,
  Check,
  X,
  ExternalLink,
  ChevronRight,
  Sparkles,
  CalendarDays,
  ShieldCheck,
  Star,
  CornerDownRight
} from "lucide-react";
import { mentorshipService } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";

export default function Sessions() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();

  // 4 Core Required Tabs: Upcoming Sessions, Pending Requests, Completed Sessions, Cancelled Sessions
  const [activeTab, setActiveTab] = useState("upcoming"); // 'upcoming' | 'pending' | 'completed' | 'cancelled'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Raw data from MongoDB
  const [sessions, setSessions] = useState([]);
  const [requests, setRequests] = useState([]);

  // Action states
  const [actionInProgress, setActionInProgress] = useState({});

  // Modals state
  const [declineModal, setDeclineModal] = useState({ open: false, request: null, reason: "" });
  const [cancelModal, setCancelModal] = useState({ open: false, session: null, reason: "" });
  const [rescheduleModal, setRescheduleModal] = useState({
    open: false,
    session: null,
    newDate: "",
    newStartTime: "18:00",
    newEndTime: "18:30",
    duration: 30,
    reason: ""
  });
  const [completeModal, setCompleteModal] = useState({ open: false, session: null, feedback: "" });

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [sessRes, reqRes] = await Promise.all([
        mentorshipService.getSessions().catch((e) => {
          console.warn("Could not fetch sessions:", e);
          return { data: { data: [] } };
        }),
        mentorshipService.getRequests().catch((e) => {
          console.warn("Could not fetch requests:", e);
          return { data: { data: [] } };
        })
      ]);

      setSessions(Array.isArray(sessRes.data?.data) ? sessRes.data.data : []);
      setRequests(Array.isArray(reqRes.data?.data) ? reqRes.data.data : []);
    } catch (err) {
      console.error("Failed to load mentorship sessions data:", err);
      addToast("Failed to load mentorship sessions", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
    addToast("Sessions refreshed from MongoDB", "info");
  };

  // ── Date and Time Normalization Helpers ─────────────────────────────────────
  const formatSessionTime = (item) => {
    // 1. If start time and end time strings are present
    if (item.startTime && item.endTime) {
      return { start: item.startTime, end: item.endTime };
    }
    // 2. Check requestedStartTime / requestedEndTime
    if (item.requestedStartTime) {
      return {
        start: item.requestedStartTime,
        end: item.requestedEndTime || `${item.requestedStartTime} (${item.durationMinutes || 30} mins)`
      };
    }
    // 3. Fallback from scheduledStart Date object
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
    // 1. Upcoming Sessions: Confirmed, Scheduled, InProgress, Rescheduled, Active
    const upcoming = sessions.filter((s) =>
      ["Scheduled", "Confirmed", "Approved", "Active", "InProgress", "Rescheduled"].includes(s.status)
    );

    // 2. Pending Requests: MentorshipRequest where status === 'Pending'
    const pending = requests.filter((r) => r.status === "Pending");

    // 3. Completed Sessions: MentorshipSession where status === 'Completed'
    const completed = sessions.filter((s) => s.status === "Completed");

    // 4. Cancelled Sessions: Cancelled or Rejected sessions/requests
    const cancelledSessions = sessions.filter((s) => ["Cancelled", "Rejected"].includes(s.status));
    const rejectedOrCancelledRequests = requests.filter((r) => ["Rejected", "Cancelled"].includes(r.status));
    
    // Deduplicate cancelled items if request and session share IDs
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

  // Current items to display based on activeTab and search
  const currentItems = useMemo(() => {
    let items = [];
    if (activeTab === "upcoming") items = categorized.upcoming;
    else if (activeTab === "pending") items = categorized.pending;
    else if (activeTab === "completed") items = categorized.completed;
    else if (activeTab === "cancelled") items = categorized.cancelled;

    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase().trim();
    return items.filter((item) => {
      const studentName = item.student?.name || item.mentee?.name || item.studentName || "";
      const topic = item.topic || "";
      const goal = item.careerGoal || item.message || "";
      return (
        studentName.toLowerCase().includes(q) ||
        topic.toLowerCase().includes(q) ||
        goal.toLowerCase().includes(q)
      );
    });
  }, [activeTab, categorized, searchQuery]);

  // ── Action Handlers ─────────────────────────────────────────────────────────

  // 1. Accept Request
  const handleAcceptRequest = async (request) => {
    const id = request._id;
    try {
      setActionInProgress((prev) => ({ ...prev, [id]: true }));
      const res = await mentorshipService.acceptRequest(id);
      addToast(`Accepted mentorship request from ${request.student?.name || "Student"}! 🚀`, "success");
      // Refresh to reflect in MongoDB and move to Upcoming
      await fetchAllData();
      setActiveTab("upcoming");
    } catch (err) {
      console.error("Accept error:", err);
      const msg = err.response?.data?.message || err.message || "Failed to accept request";
      addToast(msg, "error");
    } finally {
      setActionInProgress((prev) => ({ ...prev, [id]: false }));
    }
  };

  // 2. Decline Request (Modal Submit)
  const handleConfirmDecline = async () => {
    const { request, reason } = declineModal;
    if (!request) return;
    const id = request._id;
    try {
      setActionInProgress((prev) => ({ ...prev, [id]: true }));
      await mentorshipService.rejectRequest(id, reason || "Mentor capacity reached or schedule conflict");
      addToast(`Declined request from ${request.student?.name || "Student"}.`, "info");
      setDeclineModal({ open: false, request: null, reason: "" });
      await fetchAllData();
    } catch (err) {
      console.error("Decline error:", err);
      const msg = err.response?.data?.message || "Failed to decline request";
      addToast(msg, "error");
    } finally {
      setActionInProgress((prev) => ({ ...prev, [id]: false }));
    }
  };

  // 3. Mark as Completed
  const handleConfirmComplete = async () => {
    const { session, feedback } = completeModal;
    if (!session) return;
    const id = session._id;
    try {
      setActionInProgress((prev) => ({ ...prev, [id]: true }));
      await mentorshipService.completeSession(id, {
        mentorFeedback: feedback || "Session successfully completed."
      });
      addToast("Session marked as Completed! Completion timestamp saved to MongoDB. 🎉", "success");
      setCompleteModal({ open: false, session: null, feedback: "" });
      await fetchAllData();
      setActiveTab("completed");
    } catch (err) {
      console.error("Complete session error:", err);
      const msg = err.response?.data?.message || "Failed to mark session completed";
      addToast(msg, "error");
    } finally {
      setActionInProgress((prev) => ({ ...prev, [id]: false }));
    }
  };

  // 4. Cancel Session
  const handleConfirmCancel = async () => {
    const { session, reason } = cancelModal;
    if (!session) return;
    const id = session._id;
    try {
      setActionInProgress((prev) => ({ ...prev, [id]: true }));
      await mentorshipService.cancelSession(id, {
        cancellationReason: reason || "Cancelled by alumni mentor"
      });
      addToast("Session has been cancelled.", "warning");
      setCancelModal({ open: false, session: null, reason: "" });
      await fetchAllData();
    } catch (err) {
      console.error("Cancel session error:", err);
      const msg = err.response?.data?.message || "Failed to cancel session";
      addToast(msg, "error");
    } finally {
      setActionInProgress((prev) => ({ ...prev, [id]: false }));
    }
  };

  // 5. Reschedule Session
  const handleConfirmReschedule = async () => {
    const { session, newDate, newStartTime, newEndTime, duration, reason } = rescheduleModal;
    if (!session || !newDate || !newStartTime) {
      addToast("Please choose a valid date and start time", "warning");
      return;
    }
    const id = session._id;
    try {
      setActionInProgress((prev) => ({ ...prev, [id]: true }));
      await mentorshipService.rescheduleSession(id, {
        newDate,
        newStartTime,
        newEndTime,
        durationMinutes: duration,
        reason
      });
      addToast("Session rescheduled successfully! Confirmed in MongoDB.", "success");
      setRescheduleModal({ open: false, session: null, newDate: "", newStartTime: "18:00", newEndTime: "18:30", duration: 30, reason: "" });
      await fetchAllData();
    } catch (err) {
      console.error("Reschedule error:", err);
      const msg = err.response?.data?.message || "Failed to reschedule session. Please check for conflicting bookings.";
      addToast(msg, "error");
    } finally {
      setActionInProgress((prev) => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div className="container-fluid py-4 px-3 px-md-4" style={{ maxWidth: "1320px", margin: "0 auto" }}>
      {/* ── Top Header Section ── */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <h1
              className="fw-black mb-0"
              style={{
                fontSize: "2.1rem",
                color: "var(--text)",
                letterSpacing: "-0.03em",
              }}
            >
              1-on-1 Sessions
            </h1>
            <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-3 py-1 fw-bold small">
              Real-Time Mentorship
            </span>
          </div>
          <p className="text-muted m-0" style={{ fontSize: "1rem" }}>
            Accept student requests, manage upcoming 1-on-1 calls, mark completed sessions, and coordinate schedules.
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
            to="/alumni/availability"
            className="btn btn-outline-primary rounded-pill px-3 py-2 fw-semibold d-flex align-items-center gap-2"
          >
            <CalendarDays size={16} /> Manage Availability
          </Link>
          <Link
            to="/alumni/dashboard"
            className="btn btn-secondary rounded-pill px-3 py-2 fw-semibold d-flex align-items-center gap-2"
          >
            Overview Dashboard
          </Link>
        </div>
      </div>

      {/* ── 4 Flagship Tabs (Upcoming, Pending, Completed, Cancelled) ── */}
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
          {/* 1. Upcoming Sessions */}
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

          {/* 2. Pending Requests */}
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

          {/* 3. Completed Sessions */}
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

          {/* 4. Cancelled Sessions */}
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
            <span>Cancelled Sessions</span>
            <span
              className={`badge rounded-pill small ms-1 ${
                activeTab === "cancelled" ? "bg-danger text-white" : "bg-secondary-subtle text-muted"
              }`}
            >
              {categorized.cancelled.length}
            </span>
          </button>
        </div>

        {/* ── Subheader with Search & Filter ── */}
        <div
          className="p-3 border-bottom d-flex align-items-center justify-content-between flex-wrap gap-3"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <div className="position-relative flex-grow-1" style={{ maxWidth: "380px" }}>
            <Search
              size={16}
              className="position-absolute top-50 translate-middle-y ms-3 text-muted"
            />
            <input
              type="text"
              placeholder="Search by student name, topic, or career goal..."
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
            Showing <strong>{currentItems.length}</strong> {activeTab} {currentItems.length === 1 ? "record" : "records"}
          </div>
        </div>

        {/* ── Content Grid ── */}
        <div className="p-4">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary mb-3" style={{ width: "2.5rem", height: "2.5rem" }}></div>
              <p className="text-muted fw-semibold">Loading sessions from MongoDB Atlas...</p>
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
                No {activeTab} sessions found
              </h5>
              <p className="text-muted small mb-3 mx-auto" style={{ maxWidth: "420px" }}>
                {activeTab === "upcoming"
                  ? "You have no confirmed upcoming 1-on-1 sessions. Once you accept pending student requests, they will appear here with deep links to the session room."
                  : activeTab === "pending"
                  ? "All caught up! There are no pending mentorship requests from students right now."
                  : activeTab === "completed"
                  ? "No completed sessions recorded yet. Completed 1-on-1 mentorship sessions and student reviews will be archived here."
                  : "No cancelled or declined sessions on record."}
              </p>
              {activeTab === "pending" && (
                <Link to="/alumni/availability" className="btn btn-sm btn-outline-primary rounded-pill px-3 fw-semibold">
                  Update Availability Schedule
                </Link>
              )}
            </div>
          ) : (
            <div className="row g-4">
              {currentItems.map((item) => {
                const isRequest = !item.scheduledStart && item.requestedStartTime;
                const itemId = item._id;
                const studentName = item.student?.name || item.mentee?.name || item.studentName || "Student Mentee";
                const studentAvatar = item.student?.avatar || item.mentee?.avatar;
                const studentCollege =
                  item.student?.studentProfile?.department ||
                  item.mentee?.studentProfile?.department ||
                  item.student?.studentProfile?.college ||
                  item.student?.email ||
                  "Engineering Student";
                const topic = item.topic || "1-on-1 Mentorship & Career Guidance";
                const message = item.message || item.careerGoal || "";
                const targetRole = item.targetRole || item.student?.studentProfile?.targetCareerRole;

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
                      {/* Top Header: Student Info & Status Badge */}
                      <div className="d-flex justify-content-between align-items-start mb-3 gap-2">
                        <div className="d-flex align-items-center gap-3">
                          {studentAvatar ? (
                            <img
                              src={studentAvatar}
                              alt={studentName}
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
                              {studentName.charAt(0)}
                            </div>
                          )}
                          <div>
                            <h6 className="fw-bold mb-0 text-truncate" style={{ maxWidth: "160px", color: "var(--text)" }}>
                              {studentName}
                            </h6>
                            <span className="text-muted small text-truncate d-block" style={{ fontSize: "0.78rem", maxWidth: "160px" }}>
                              {studentCollege}
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

                      {/* Mentoring Topic & Career Focus */}
                      <div className="mb-3">
                        <div className="small text-uppercase text-muted fw-bold mb-1" style={{ fontSize: "0.7rem", letterSpacing: "0.04em" }}>
                          Mentoring Topic
                        </div>
                        <h6 className="fw-bold mb-1" style={{ color: "var(--text)", lineHeight: 1.35 }}>
                          {topic}
                        </h6>
                        {targetRole && (
                          <div className="d-flex align-items-center gap-1 small text-primary fw-medium mb-1">
                            <Sparkles size={13} /> Target Role: {targetRole}
                          </div>
                        )}
                        {message && (
                          <p className="text-muted small mb-0 fst-italic text-truncate-2" style={{ fontSize: "0.82rem" }}>
                            "{message}"
                          </p>
                        )}
                      </div>

                      {/* Scheduled Date, Start Time & End Time */}
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

                        {/* Completion / Cancellation Timestamp Display */}
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
                        {item.review && (
                          <div className="mt-2 pt-2 border-top small text-warning fw-medium" style={{ borderColor: "var(--border)" }}>
                            <Star size={13} className="fill-current text-warning me-1" />
                            Rating: {item.rating || 5}/5 — "{item.review}"
                          </div>
                        )}
                      </div>

                      {/* Action Buttons Section */}
                      <div className="mt-auto pt-2">
                        {/* 1. Pending Request Actions: Accept or Decline */}
                        {isPending && (
                          <div className="d-flex gap-2">
                            <button
                              type="button"
                              className="btn btn-success flex-grow-1 rounded-pill fw-bold d-flex align-items-center justify-content-center gap-1 py-2 btn-sm shadow-sm"
                              disabled={actionInProgress[itemId]}
                              onClick={() => handleAcceptRequest(item)}
                            >
                              {actionInProgress[itemId] ? (
                                <span className="spinner-border spinner-border-sm me-1"></span>
                              ) : (
                                <Check size={16} />
                              )}
                              Accept Request
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline-danger rounded-pill fw-bold d-flex align-items-center justify-content-center gap-1 px-3 py-2 btn-sm"
                              disabled={actionInProgress[itemId]}
                              onClick={() => setDeclineModal({ open: true, request: item, reason: "" })}
                            >
                              <X size={16} /> Decline
                            </button>
                          </div>
                        )}

                        {/* 2. Upcoming Session Actions: Enter Room, Mark Completed, Reschedule, Cancel */}
                        {isUpcoming && (
                          <div className="d-flex flex-column gap-2">
                            <Link
                              to={`/mentorship/session/${item._id}`}
                              className="btn btn-primary w-100 rounded-pill fw-bold d-flex align-items-center justify-content-center gap-2 py-2 text-white shadow-sm"
                              style={{ background: "#0d6efd", border: "none" }}
                            >
                              <Video size={16} /> Enter 1-on-1 Session Room
                            </Link>

                            <div className="d-flex gap-2">
                              <button
                                type="button"
                                className="btn btn-outline-success flex-grow-1 rounded-pill fw-semibold d-flex align-items-center justify-content-center gap-1 py-2 btn-sm"
                                disabled={actionInProgress[itemId]}
                                onClick={() => setCompleteModal({ open: true, session: item, feedback: "" })}
                                title="Mark session as successfully completed"
                              >
                                <CheckCircle size={15} /> Mark as Completed
                              </button>
                              <button
                                type="button"
                                className="btn btn-outline-secondary rounded-pill fw-semibold px-3 py-2 btn-sm"
                                onClick={() =>
                                  setRescheduleModal({
                                    open: true,
                                    session: item,
                                    newDate: format(dateObj, "yyyy-MM-dd"),
                                    newStartTime: timeInfo.start?.includes(":") ? timeInfo.start : "18:00",
                                    newEndTime: timeInfo.end?.includes(":") ? timeInfo.end : "18:30",
                                    duration,
                                    reason: ""
                                  })
                                }
                                title="Reschedule session slot"
                              >
                                Reschedule
                              </button>
                              <button
                                type="button"
                                className="btn btn-outline-danger rounded-pill px-2 py-2 btn-sm"
                                onClick={() => setCancelModal({ open: true, session: item, reason: "" })}
                                title="Cancel session"
                              >
                                <X size={15} />
                              </button>
                            </div>
                          </div>
                        )}

                        {/* 3. Completed Session Actions */}
                        {isCompleted && (
                          <div className="d-flex flex-column gap-2">
                            <Link
                              to={`/mentorship/session/${item._id}`}
                              className="btn btn-outline-primary w-100 rounded-pill fw-semibold d-flex align-items-center justify-content-center gap-2 py-2 btn-sm"
                            >
                              <Video size={15} /> View Notes & Action Items
                            </Link>
                          </div>
                        )}

                        {/* 4. Cancelled Session Details */}
                        {isCancelled && (
                          <div className="text-center py-1">
                            <span className="small text-muted fst-italic">
                              Session record archived in MongoDB.
                            </span>
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

      {/* ── Modal: Decline Request ── */}
      {declineModal.open && (
        <div
          className="modal fade show d-block"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", zIndex: 1050 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 p-4" style={{ background: "var(--surface)", color: "var(--text)" }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">Decline Mentorship Request</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setDeclineModal({ open: false, request: null, reason: "" })}
                ></button>
              </div>
              <p className="text-muted small mb-3">
                Provide a reason to help <strong>{declineModal.request?.student?.name}</strong> understand why this slot cannot be accommodated.
              </p>
              <div className="mb-3">
                <label className="form-label small fw-bold text-muted">Reason for declining</label>
                <textarea
                  rows="3"
                  className="form-control rounded-3"
                  placeholder="e.g. Current capacity reached, or conflict with travel schedule. Please check back next week."
                  value={declineModal.reason}
                  onChange={(e) => setDeclineModal((p) => ({ ...p, reason: e.target.value }))}
                  style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}
                ></textarea>
              </div>
              <div className="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary rounded-pill px-4"
                  onClick={() => setDeclineModal({ open: false, request: null, reason: "" })}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger rounded-pill px-4 fw-bold"
                  onClick={handleConfirmDecline}
                >
                  Confirm Decline
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Cancel Session ── */}
      {cancelModal.open && (
        <div
          className="modal fade show d-block"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", zIndex: 1050 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 p-4" style={{ background: "var(--surface)", color: "var(--text)" }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0 text-danger d-flex align-items-center gap-2">
                  <AlertCircle size={20} /> Cancel Mentorship Session
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setCancelModal({ open: false, session: null, reason: "" })}
                ></button>
              </div>
              <p className="text-muted small mb-3">
                Are you sure you want to cancel the session with <strong>{cancelModal.session?.mentee?.name || "the student"}</strong>? This will notify them immediately.
              </p>
              <div className="mb-3">
                <label className="form-label small fw-bold text-muted">Cancellation Reason</label>
                <textarea
                  rows="3"
                  className="form-control rounded-3"
                  placeholder="e.g. Urgent work deadline arose. Proposing to reschedule soon."
                  value={cancelModal.reason}
                  onChange={(e) => setCancelModal((p) => ({ ...p, reason: e.target.value }))}
                  style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}
                ></textarea>
              </div>
              <div className="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary rounded-pill px-4"
                  onClick={() => setCancelModal({ open: false, session: null, reason: "" })}
                >
                  Keep Session
                </button>
                <button
                  type="button"
                  className="btn btn-danger rounded-pill px-4 fw-bold"
                  onClick={handleConfirmCancel}
                >
                  Cancel Session
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Mark as Completed ── */}
      {completeModal.open && (
        <div
          className="modal fade show d-block"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", zIndex: 1050 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 p-4" style={{ background: "var(--surface)", color: "var(--text)" }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0 text-success d-flex align-items-center gap-2">
                  <CheckCircle size={20} /> Mark Session as Completed
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setCompleteModal({ open: false, session: null, feedback: "" })}
                ></button>
              </div>
              <p className="text-muted small mb-3">
                Did your 1-on-1 session with <strong>{completeModal.session?.mentee?.name || "the student"}</strong> conclude? This will record the completion timestamp in MongoDB and prompt the student to leave a review.
              </p>
              <div className="mb-3">
                <label className="form-label small fw-bold text-muted">Mentor Feedback / Closing Note (Optional)</label>
                <textarea
                  rows="3"
                  className="form-control rounded-3"
                  placeholder="e.g. Great session covering system design and resume refinement. Recommended reading distributed systems papers."
                  value={completeModal.feedback}
                  onChange={(e) => setCompleteModal((p) => ({ ...p, feedback: e.target.value }))}
                  style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}
                ></textarea>
              </div>
              <div className="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary rounded-pill px-4"
                  onClick={() => setCompleteModal({ open: false, session: null, feedback: "" })}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-success rounded-pill px-4 fw-bold"
                  onClick={handleConfirmComplete}
                >
                  Confirm Completed
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Reschedule Session ── */}
      {rescheduleModal.open && (
        <div
          className="modal fade show d-block"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", zIndex: 1050 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 p-4" style={{ background: "var(--surface)", color: "var(--text)" }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
                  <Calendar size={20} className="text-primary" /> Reschedule Session
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() =>
                    setRescheduleModal({
                      open: false,
                      session: null,
                      newDate: "",
                      newStartTime: "18:00",
                      newEndTime: "18:30",
                      duration: 30,
                      reason: ""
                    })
                  }
                ></button>
              </div>
              <p className="text-muted small mb-3">
                Pick a new date and time for your session with <strong>{rescheduleModal.session?.mentee?.name || "the student"}</strong>. System validates conflicts against existing bookings automatically.
              </p>

              <div className="mb-3">
                <label className="form-label small fw-bold text-muted">New Date</label>
                <input
                  type="date"
                  className="form-control rounded-3"
                  value={rescheduleModal.newDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setRescheduleModal((p) => ({ ...p, newDate: e.target.value }))}
                  style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}
                />
              </div>

              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-bold text-muted">Start Time</label>
                  <input
                    type="time"
                    className="form-control rounded-3"
                    value={rescheduleModal.newStartTime}
                    onChange={(e) => setRescheduleModal((p) => ({ ...p, newStartTime: e.target.value }))}
                    style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold text-muted">End Time</label>
                  <input
                    type="time"
                    className="form-control rounded-3"
                    value={rescheduleModal.newEndTime}
                    onChange={(e) => setRescheduleModal((p) => ({ ...p, newEndTime: e.target.value }))}
                    style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold text-muted">Reason for Rescheduling (Optional)</label>
                <input
                  type="text"
                  className="form-control rounded-3"
                  placeholder="e.g. Schedule conflict with meeting"
                  value={rescheduleModal.reason}
                  onChange={(e) => setRescheduleModal((p) => ({ ...p, reason: e.target.value }))}
                  style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}
                />
              </div>

              <div className="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary rounded-pill px-4"
                  onClick={() =>
                    setRescheduleModal({
                      open: false,
                      session: null,
                      newDate: "",
                      newStartTime: "18:00",
                      newEndTime: "18:30",
                      duration: 30,
                      reason: ""
                    })
                  }
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm"
                  onClick={handleConfirmReschedule}
                >
                  Save Reschedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
