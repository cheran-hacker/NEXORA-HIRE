import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Clock,
  Calendar,
  Check,
  X,
  Search,
  Video,
  ShieldCheck,
  Star,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Sliders,
  History,
  UserCheck
} from "lucide-react";
import { mentorshipService } from "../../services/api.js";
import { useToast } from "../../context/ToastContext.jsx";

export default function MentorshipBooking() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState("requests"); // requests, upcoming, history, availability
  const [overview, setOverview] = useState(null);
  const [requests, setRequests] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [historySessions, setHistorySessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [accepting, setAccepting] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejecting, setRejecting] = useState(false);

  useEffect(() => {
    fetchHubData();
  }, []);

  const fetchHubData = async () => {
    try {
      setLoading(true);
      const [overviewRes, requestsRes, sessionsRes, historyRes] = await Promise.all([
        mentorshipService.getOverview().catch(() => ({ data: { data: {} } })),
        mentorshipService.getRequests().catch(() => ({ data: { data: [] } })),
        mentorshipService.getSessions({ status: "upcoming" }).catch(() => ({ data: { data: [] } })),
        mentorshipService.getSessions({ status: "completed" }).catch(() => ({ data: { data: [] } }))
      ]);

      setOverview(overviewRes.data.data || {});
      setRequests(requestsRes.data.data || []);
      setSessions(sessionsRes.data.data || []);
      setHistorySessions(historyRes.data.data || []);
    } catch (err) {
      addToast("Failed to load Mentorship Hub data", "error");
    } finally {
      setLoading(false);
    }
  };

  const pendingRequests = requests.filter((r) => r.status === "Pending");

  const filteredRequests = pendingRequests.filter((r) => {
    const q = searchQuery.toLowerCase();
    return (
      r.student?.name?.toLowerCase().includes(q) ||
      r.topic?.toLowerCase().includes(q) ||
      r.targetRole?.toLowerCase().includes(q) ||
      r.student?.studentProfile?.department?.toLowerCase().includes(q)
    );
  });

  const handleConfirmAccept = async () => {
    if (!selectedRequest) return;
    try {
      setAccepting(true);
      const res = await mentorshipService.acceptRequest(selectedRequest._id);
      addToast(`1-on-1 session confirmed with ${selectedRequest.student?.name}!`, "success");
      setSelectedRequest(null);
      fetchHubData();
      if (res.data.data?.session?._id) {
        navigate(`/mentorship/session/${res.data.data.session._id}`);
      }
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to accept request", "error");
    } finally {
      setAccepting(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!selectedRequest) return;
    try {
      setRejecting(true);
      await mentorshipService.rejectRequest(selectedRequest._id, rejectReason);
      addToast("Mentorship request declined", "info");
      setShowRejectModal(false);
      setSelectedRequest(null);
      setRejectReason("");
      fetchHubData();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to decline request", "error");
    } finally {
      setRejecting(false);
    }
  };

  const kpis = overview?.kpis || {
    activeMentorships: 0,
    pendingRequests: pendingRequests.length,
    upcomingSessions: sessions.length,
    completedSessions: historySessions.length,
    availableHours: "0.0",
    studentsMentored: 0
  };

  return (
    <div className="container-fluid space-y-4 py-4" style={{ maxWidth: "1280px" }}>
      {/* Top Section / Header */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-4 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <h2 className="fw-black mb-0" style={{ color: "var(--text)", fontSize: "2.25rem" }}>
              Mentorship Hub
            </h2>
            <span
              className={`badge rounded-pill px-3 py-1 fw-bold ${
                overview?.availability?.isAvailable !== false
                  ? "bg-success text-white"
                  : "bg-secondary text-white"
              }`}
            >
              {overview?.availability?.isAvailable !== false ? "● Accepting Mentorship" : "Paused"}
            </span>
          </div>
          <p className="fw-medium mb-0" style={{ color: "var(--text-secondary)" }}>
            Build meaningful 1-on-1 career connections.
          </p>
        </div>

        <div className="d-flex align-items-center gap-3">
          <button
            onClick={() => navigate("/alumni/availability")}
            className="btn rounded-pill px-4 py-2 fw-bold shadow-sm hover-lift d-flex align-items-center gap-2"
            style={{ background: "var(--primary)", color: "#fff", border: "none" }}
          >
            <Sliders size={16} /> Manage Availability
          </button>
        </div>
      </div>

      {/* REAL Database Metrics Row */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-4 col-lg-2">
          <div className="bento-card p-3 text-center h-100">
            <span className="small fw-bold text-muted text-uppercase d-block mb-1">Active</span>
            <h3 className="fw-black m-0" style={{ color: "var(--primary)" }}>
              {kpis.activeMentorships}
            </h3>
            <span className="text-secondary small">Mentorships</span>
          </div>
        </div>

        <div className="col-6 col-md-4 col-lg-2">
          <div className="bento-card p-3 text-center h-100">
            <span className="small fw-bold text-muted text-uppercase d-block mb-1">Pending</span>
            <h3 className="fw-black m-0" style={{ color: "var(--warning)" }}>
              {kpis.pendingRequests}
            </h3>
            <span className="text-secondary small">Requests</span>
          </div>
        </div>

        <div className="col-6 col-md-4 col-lg-2">
          <div className="bento-card p-3 text-center h-100">
            <span className="small fw-bold text-muted text-uppercase d-block mb-1">Upcoming</span>
            <h3 className="fw-black m-0" style={{ color: "var(--info, #06b6d4)" }}>
              {kpis.upcomingSessions}
            </h3>
            <span className="text-secondary small">Sessions</span>
          </div>
        </div>

        <div className="col-6 col-md-4 col-lg-2">
          <div className="bento-card p-3 text-center h-100">
            <span className="small fw-bold text-muted text-uppercase d-block mb-1">Completed</span>
            <h3 className="fw-black m-0" style={{ color: "var(--success)" }}>
              {kpis.completedSessions}
            </h3>
            <span className="text-secondary small">Sessions</span>
          </div>
        </div>

        <div className="col-6 col-md-4 col-lg-2">
          <div className="bento-card p-3 text-center h-100">
            <span className="small fw-bold text-muted text-uppercase d-block mb-1">Available</span>
            <h3 className="fw-black m-0" style={{ color: "var(--purple, #8b5cf6)" }}>
              {kpis.availableHours}h
            </h3>
            <span className="text-secondary small">Weekly</span>
          </div>
        </div>

        <div className="col-6 col-md-4 col-lg-2">
          <div className="bento-card p-3 text-center h-100">
            <span className="small fw-bold text-muted text-uppercase d-block mb-1">Mentored</span>
            <h3 className="fw-black m-0" style={{ color: "var(--text)" }}>
              {kpis.studentsMentored}
            </h3>
            <span className="text-secondary small">Students</span>
          </div>
        </div>
      </div>

      {/* Main Tabbed Container */}
      <div className="bento-card overflow-hidden p-0">
        <div className="d-flex border-bottom bg-surface-2" style={{ borderColor: "var(--border)" }}>
          <button
            className={`flex-grow-1 py-3 text-center fw-bold transition-fast d-flex align-items-center justify-content-center gap-2 ${
              activeTab === "requests" ? "border-bottom border-2 border-primary bg-card" : "bg-transparent text-muted"
            }`}
            style={{
              border: "none",
              color: activeTab === "requests" ? "var(--text)" : "var(--text-secondary)"
            }}
            onClick={() => setActiveTab("requests")}
          >
            Pending Requests
            {pendingRequests.length > 0 && (
              <span className="badge rounded-pill bg-warning text-dark px-2 py-1 small">
                {pendingRequests.length}
              </span>
            )}
          </button>

          <button
            className={`flex-grow-1 py-3 text-center fw-bold transition-fast d-flex align-items-center justify-content-center gap-2 ${
              activeTab === "upcoming" ? "border-bottom border-2 border-primary bg-card" : "bg-transparent text-muted"
            }`}
            style={{
              border: "none",
              color: activeTab === "upcoming" ? "var(--text)" : "var(--text-secondary)"
            }}
            onClick={() => setActiveTab("upcoming")}
          >
            Upcoming Sessions
            {sessions.length > 0 && (
              <span className="badge rounded-pill bg-primary text-white px-2 py-1 small">
                {sessions.length}
              </span>
            )}
          </button>

          <button
            className={`flex-grow-1 py-3 text-center fw-bold transition-fast d-flex align-items-center justify-content-center gap-2 ${
              activeTab === "history" ? "border-bottom border-2 border-primary bg-card" : "bg-transparent text-muted"
            }`}
            style={{
              border: "none",
              color: activeTab === "history" ? "var(--text)" : "var(--text-secondary)"
            }}
            onClick={() => setActiveTab("history")}
          >
            Mentorship History ({historySessions.length})
          </button>
        </div>

        <div className="p-4 p-md-5">
          {/* TAB 1: PENDING REQUESTS */}
          {activeTab === "requests" && (
            <div className="space-y-4">
              <div className="position-relative mb-4">
                <Search
                  className="position-absolute text-muted"
                  size={18}
                  style={{ left: "14px", top: "50%", transform: "translateY(-50%)" }}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search requests by student name, topic, or target role..."
                  className="form-control rounded-pill ps-5 py-2"
                  style={{ background: "var(--surface)", color: "var(--text)", borderColor: "var(--border)" }}
                />
              </div>

              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status" />
                  <p className="mt-3 text-muted">Loading pending requests...</p>
                </div>
              ) : filteredRequests.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <UserCheck size={48} className="mx-auto mb-3 opacity-30 text-primary" />
                  <h5 className="fw-bold" style={{ color: "var(--text)" }}>No mentorship requests yet</h5>
                  <p className="small text-secondary">
                    When students request 1-on-1 guidance based on your availability schedule, they will appear here.
                  </p>
                </div>
              ) : (
                filteredRequests.map((req) => (
                  <div
                    key={req._id}
                    className="bento-card p-4 d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-4 mb-3 border hover-lift transition-fast"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <div className="d-flex align-items-start gap-3">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm text-white fs-5 overflow-hidden flex-shrink-0"
                        style={{
                          width: "52px",
                          height: "52px",
                          background: "linear-gradient(135deg, var(--primary), var(--purple, #8b5cf6))"
                        }}
                      >
                        {req.student?.avatar || req.student?.avatarUrl ? (
                          <img src={req.student.avatar || req.student.avatarUrl} alt="" className="w-100 h-100 object-fit-cover" />
                        ) : (
                          req.student?.name?.charAt(0) || "S"
                        )}
                      </div>
                      <div>
                        <div className="d-flex align-items-center gap-2">
                          <h5 className="fw-bold m-0" style={{ color: "var(--text)" }}>
                            {req.student?.name}
                          </h5>
                          <span className="badge rounded-pill bg-surface-2 text-primary small">
                            {req.student?.studentProfile?.department || "Student"}
                          </span>
                        </div>
                        <h6 className="fw-bold text-primary small mt-1 mb-1">
                          Topic: {req.topic}
                        </h6>
                        <p className="small m-0 text-secondary" style={{ maxWidth: "550px" }}>
                          "{req.message || "Requesting 1-on-1 career mentorship."}"
                        </p>

                        {req.targetRole && (
                          <span className="badge rounded-pill bg-surface-2 text-secondary small mt-2">
                            Target: {req.targetRole}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center gap-3">
                      <div className="text-md-end small">
                        <div className="fw-bold d-flex align-items-center gap-1 justify-content-md-end" style={{ color: "var(--text)" }}>
                          <Calendar size={14} className="text-primary" />
                          {new Date(req.requestedDate).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                        </div>
                        <div className="text-muted d-flex align-items-center gap-1 justify-content-md-end mt-1">
                          <Clock size={14} />
                          {req.requestedStartTime} - {req.requestedEndTime} ({req.durationMinutes || 30}m)
                        </div>
                      </div>

                      <div className="d-flex gap-2">
                        <button
                          onClick={() => setSelectedRequest(req)}
                          className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm hover-lift d-flex align-items-center gap-1"
                        >
                          <Check size={16} /> Accept
                        </button>
                        <button
                          onClick={() => {
                            setSelectedRequest(req);
                            setShowRejectModal(true);
                          }}
                          className="btn btn-outline-danger rounded-pill px-3 fw-bold d-flex align-items-center gap-1"
                        >
                          <X size={16} /> Decline
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: UPCOMING SESSIONS */}
          {activeTab === "upcoming" && (
            <div className="space-y-4">
              {sessions.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <Calendar size={48} className="mx-auto mb-3 opacity-30 text-primary" />
                  <h5 className="fw-bold" style={{ color: "var(--text)" }}>No upcoming 1-on-1 sessions</h5>
                  <p className="small text-secondary">
                    Accepted mentorship requests will automatically show up here with direct access to the 1-on-1 room.
                  </p>
                </div>
              ) : (
                sessions.map((session) => (
                  <div
                    key={session._id}
                    className="bento-card p-4 d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-4 mb-3 border hover-lift transition-fast"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <div
                        className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{
                          width: "52px",
                          height: "52px",
                          background: "rgba(var(--primary-rgb, 59,130,246), 0.12)",
                          color: "var(--primary)"
                        }}
                      >
                        <Calendar size={26} />
                      </div>
                      <div>
                        <div className="d-flex align-items-center gap-2">
                          <h5 className="fw-bold m-0" style={{ color: "var(--text)" }}>
                            1-on-1 with {session.studentName || session.mentee?.name}
                          </h5>
                          <span className="badge rounded-pill bg-info text-white small">
                            {session.status}
                          </span>
                        </div>
                        <p className="small m-0 text-muted mt-1">
                          Topic: <strong style={{ color: "var(--text)" }}>{session.topic}</strong>
                        </p>
                        {session.targetRole && (
                          <span className="small text-secondary d-block mt-1">
                            Target Role: {session.targetRole}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center gap-4">
                      <div className="text-md-end small">
                        <div className="fw-bold" style={{ color: "var(--text)" }}>
                          {session.dateFormatted || new Date(session.scheduledStart || session.scheduledDate).toLocaleDateString()}
                        </div>
                        <div className="text-muted mt-1 d-flex align-items-center gap-1 justify-content-md-end">
                          <Clock size={13} />
                          {session.timeFormatted || new Date(session.scheduledStart || session.scheduledDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          {" "}({session.durationMinutes}m)
                        </div>
                      </div>

                      <button
                        onClick={() => navigate(`/mentorship/session/${session._id}`)}
                        className="btn btn-primary rounded-pill px-4 py-2 fw-bold d-flex align-items-center gap-2 shadow-sm hover-lift"
                      >
                        <Video size={16} /> Enter Mentorship Room
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: MENTORSHIP HISTORY */}
          {activeTab === "history" && (
            <div className="space-y-4">
              {historySessions.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <History size={48} className="mx-auto mb-3 opacity-30 text-secondary" />
                  <h5 className="fw-bold" style={{ color: "var(--text)" }}>No completed sessions yet</h5>
                  <p className="small text-secondary">
                    Completed 1-on-1 mentorship sessions and student reviews will be archived here.
                  </p>
                </div>
              ) : (
                historySessions.map((session) => (
                  <div
                    key={session._id}
                    className="bento-card p-4 d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-4 mb-3 border"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <div>
                      <div className="d-flex align-items-center gap-2">
                        <h5 className="fw-bold m-0" style={{ color: "var(--text)" }}>
                          Mentored {session.studentName || session.mentee?.name}
                        </h5>
                        <span className="badge rounded-pill bg-success text-white small">
                          Completed
                        </span>
                      </div>
                      <p className="small m-0 text-muted mt-1">
                        Topic: {session.topic}
                      </p>
                      {session.rating && (
                        <div className="d-flex align-items-center gap-1 mt-2">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              size={14}
                              className={s <= session.rating ? "text-warning fill-warning" : "text-muted"}
                            />
                          ))}
                          <span className="small fw-bold ms-1" style={{ color: "var(--text)" }}>
                            {session.rating}.0
                          </span>
                          {session.review && (
                            <span className="small text-muted ms-2 fst-italic">
                              "{session.review}"
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="d-flex align-items-center gap-3">
                      <div className="text-md-end small text-muted">
                        <div>{new Date(session.completedAt || session.scheduledDate).toLocaleDateString()}</div>
                      </div>
                      <button
                        onClick={() => navigate(`/mentorship/session/${session._id}`)}
                        className="btn btn-outline-secondary rounded-pill px-3 py-1 btn-sm fw-bold"
                      >
                        View Notes & Action Items
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Accept Confirmation Modal */}
      {selectedRequest && !showRejectModal && (
        <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.6)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border shadow-lg" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <div className="modal-header border-bottom" style={{ borderColor: "var(--border)" }}>
                <h5 className="modal-title fw-bold" style={{ color: "var(--text)" }}>
                  Confirm 1-on-1 Mentorship Session
                </h5>
                <button type="button" className="btn-close" onClick={() => setSelectedRequest(null)} />
              </div>
              <div className="modal-body space-y-3">
                <p className="text-muted small">
                  You are about to accept a 1-on-1 mentorship session with{" "}
                  <strong style={{ color: "var(--text)" }}>{selectedRequest.student?.name}</strong>.
                </p>

                <div className="p-3 rounded-3 bg-surface-2 border space-y-2 small" style={{ borderColor: "var(--border)" }}>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Topic:</span>
                    <strong style={{ color: "var(--text)" }}>{selectedRequest.topic}</strong>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Date:</span>
                    <strong style={{ color: "var(--text)" }}>
                      {new Date(selectedRequest.requestedDate).toLocaleDateString()}
                    </strong>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Time Slot:</span>
                    <strong style={{ color: "var(--text)" }}>
                      {selectedRequest.requestedStartTime} - {selectedRequest.requestedEndTime}
                    </strong>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Duration:</span>
                    <strong style={{ color: "var(--text)" }}>{selectedRequest.durationMinutes || 30} mins</strong>
                  </div>
                </div>

                <p className="small text-muted">
                  A private NEXORA 1-on-1 room will be automatically scheduled, and the student will receive a notification.
                </p>
              </div>
              <div className="modal-footer border-top" style={{ borderColor: "var(--border)" }}>
                <button className="btn btn-light rounded-pill px-3" onClick={() => setSelectedRequest(null)}>
                  Cancel
                </button>
                <button
                  className="btn btn-primary rounded-pill px-4 fw-bold"
                  disabled={accepting}
                  onClick={handleConfirmAccept}
                >
                  {accepting ? "Confirming..." : "Confirm & Schedule"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Decline Reason Modal */}
      {showRejectModal && selectedRequest && (
        <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.6)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border shadow-lg" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <div className="modal-header border-bottom" style={{ borderColor: "var(--border)" }}>
                <h5 className="modal-title fw-bold" style={{ color: "var(--text)" }}>Decline Mentorship Request</h5>
                <button type="button" className="btn-close" onClick={() => setShowRejectModal(false)} />
              </div>
              <div className="modal-body space-y-3">
                <p className="text-muted small">
                  Please provide a reason so the student understands your schedule constraint.
                </p>
                <div>
                  <label className="small fw-bold mb-1" style={{ color: "var(--text)" }}>Reason</label>
                  <textarea
                    rows={3}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="e.g. Schedule conflict, capacity reached for this week..."
                    className="form-control rounded-3"
                    style={{ background: "var(--surface-2)", color: "var(--text)", borderColor: "var(--border)" }}
                  />
                </div>
              </div>
              <div className="modal-footer border-top" style={{ borderColor: "var(--border)" }}>
                <button className="btn btn-light rounded-pill px-3" onClick={() => setShowRejectModal(false)}>
                  Back
                </button>
                <button
                  className="btn btn-danger rounded-pill px-4 fw-bold"
                  disabled={rejecting}
                  onClick={handleConfirmReject}
                >
                  {rejecting ? "Declining..." : "Decline Request"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
