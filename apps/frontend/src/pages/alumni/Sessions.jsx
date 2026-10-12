import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { alumniService, mentorshipService } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import {
  Calendar,
  Clock,
  Video,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight,
  User,
  Sliders
} from "lucide-react";
import { format } from "date-fns";

export default function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("upcoming"); // 'upcoming', 'pending', 'history'
  const { addToast } = useToast();

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      // Fetch from mentorship service first (new system), fallback to alumni service
      let res;
      try {
        res = await mentorshipService.getSessions();
      } catch (e) {
        res = await alumniService.getMentorshipSessions();
      }
      setSessions(res.data?.data || []);
    } catch (err) {
      addToast("Failed to load mentorship sessions", "error");
      console.error(err);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, action) => {
    try {
      if (action === "accept") {
        try {
          await mentorshipService.acceptRequest(id);
        } catch {
          await alumniService.acceptSession(id);
        }
        addToast("Session accepted successfully!", "success");
      } else {
        try {
          await mentorshipService.rejectRequest(id, "Declined by mentor");
        } catch {
          await alumniService.declineSession(id);
        }
        addToast("Session declined.", "info");
      }
      fetchSessions();
    } catch (err) {
      addToast(`Failed to ${action} session`, "error");
    }
  };

  const filteredSessions = sessions.filter((session) => {
    if (filter === "upcoming") return session.status === "Scheduled" || session.status === "In Progress";
    if (filter === "pending") return session.status === "Pending";
    if (filter === "history")
      return ["Completed", "Declined", "Cancelled", "Rejected"].includes(session.status);
    return true;
  });

  const getSafeDate = (session) => {
    const raw = session.scheduledStart || session.scheduledDate || session.createdAt;
    if (!raw) return new Date();
    const d = new Date(raw);
    return isNaN(d.getTime()) ? new Date() : d;
  };

  if (loading)
    return (
      <div className="p-5 d-flex flex-column align-items-center justify-content-center">
        <div className="spinner-border text-primary mb-3"></div>
        <p className="text-muted fw-medium">Loading mentorship sessions...</p>
      </div>
    );

  return (
    <div className="p-4" style={{ maxWidth: "1280px", margin: "0 auto" }}>
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
        <div>
          <h1
            className="fw-bold mb-2"
            style={{
              fontSize: "2rem",
              color: "var(--text)",
              letterSpacing: "-0.03em",
            }}
          >
            Mentorship Sessions
          </h1>
          <p
            className="fw-medium m-0"
            style={{ color: "var(--text-secondary)", fontSize: "1rem" }}
          >
            Manage your upcoming 1:1 sessions, pending requests, and session history.
          </p>
        </div>

        <div className="d-flex gap-2">
          <Link
            to="/alumni/availability"
            className="btn btn-outline-secondary rounded-pill px-3 py-2 fw-bold d-flex align-items-center gap-2"
          >
            <Sliders size={16} /> Configure Availability
          </Link>
          <Link
            to="/alumni/mentorship"
            className="btn btn-primary rounded-pill px-3 py-2 fw-bold d-flex align-items-center gap-2"
          >
            Mentorship Hub <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      <div className="bento-card p-0 overflow-hidden mb-4" style={{ background: "var(--surface)" }}>
        <div
          className="d-flex border-bottom"
          style={{ background: "var(--surface-2, rgba(255,255,255,0.02))", borderColor: "var(--border)" }}
        >
          <button
            className={`btn rounded-0 px-4 py-3 fw-bold border-0 ${
              filter === "upcoming" ? "text-primary border-bottom border-primary border-3" : "text-muted"
            }`}
            style={{ backgroundColor: "transparent" }}
            onClick={() => setFilter("upcoming")}
          >
            Upcoming ({sessions.filter((s) => s.status === "Scheduled" || s.status === "In Progress").length})
          </button>
          <button
            className={`btn rounded-0 px-4 py-3 fw-bold border-0 ${
              filter === "pending" ? "text-warning border-bottom border-warning border-3" : "text-muted"
            }`}
            style={{ backgroundColor: "transparent" }}
            onClick={() => setFilter("pending")}
          >
            Pending Requests ({sessions.filter((s) => s.status === "Pending").length})
          </button>
          <button
            className={`btn rounded-0 px-4 py-3 fw-bold border-0 ${
              filter === "history" ? "text-info border-bottom border-info border-3" : "text-muted"
            }`}
            style={{ backgroundColor: "transparent" }}
            onClick={() => setFilter("history")}
          >
            History ({sessions.filter((s) => ["Completed", "Declined", "Cancelled", "Rejected"].includes(s.status)).length})
          </button>
        </div>

        <div className="p-4">
          {filteredSessions.length === 0 ? (
            <div className="text-center py-5">
              <AlertCircle size={48} className="text-muted mb-3 opacity-50" />
              <h5 className="fw-bold text-muted mb-1">
                No {filter} sessions found.
              </h5>
              <p className="small text-muted mb-0">
                {filter === "upcoming"
                  ? "When students book a session with you, they will appear right here."
                  : "All caught up on requests."}
              </p>
            </div>
          ) : (
            <div className="row g-4">
              {filteredSessions.map((session) => {
                const sessionDate = getSafeDate(session);
                const menteeName =
                  session.mentee?.name || session.studentId?.name || "Student Mentee";
                const menteeCollege =
                  session.mentee?.studentProfile?.college || session.mentee?.email || "Student";
                const duration = session.durationMinutes || session.duration || 30;

                const isUpcoming = session.status === "Scheduled" || session.status === "In Progress";
                const isPending = session.status === "Pending";
                const isCompleted = session.status === "Completed";

                return (
                  <div key={session._id} className="col-md-6 col-lg-4">
                    <div
                      className="bento-card p-4 h-100 d-flex flex-column hover-glow rounded-4"
                      style={{
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div className="d-flex align-items-center gap-2">
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center text-primary fw-bold"
                            style={{
                              width: 36,
                              height: 36,
                              background: "rgba(var(--primary-rgb), 0.1)",
                              fontSize: "0.85rem",
                            }}
                          >
                            <User size={18} />
                          </div>
                          <div>
                            <h6 className="fw-bold mb-0 text-truncate" style={{ color: "var(--text)", maxWidth: "160px" }}>
                              {menteeName}
                            </h6>
                            <span className="text-muted small" style={{ fontSize: "0.75rem" }}>
                              {menteeCollege}
                            </span>
                          </div>
                        </div>

                        <span
                          className={`badge rounded-pill ${
                            isUpcoming
                              ? "bg-primary-subtle text-primary border border-primary"
                              : isPending
                              ? "bg-warning-subtle text-warning border border-warning"
                              : isCompleted
                              ? "bg-success-subtle text-success border border-success"
                              : "bg-danger-subtle text-danger border border-danger"
                          }`}
                        >
                          {session.status}
                        </span>
                      </div>

                      <div className="mb-3">
                        <h6 className="fw-bold mb-1" style={{ color: "var(--text)" }}>
                          {session.topic || "Career Mentorship"}
                        </h6>
                        {session.agenda && (
                          <p className="small text-muted mb-0 fst-italic text-truncate">
                            "{session.agenda}"
                          </p>
                        )}
                      </div>

                      <div className="mb-4 flex-grow-1 p-3 rounded-3" style={{ background: "var(--surface-2, rgba(255,255,255,0.02))", border: "1px solid var(--border)" }}>
                        <div
                          className="d-flex align-items-center gap-2 mb-2 small fw-medium"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          <Calendar size={16} className="text-primary" />
                          {format(sessionDate, "MMM dd, yyyy")}
                        </div>
                        <div
                          className="d-flex align-items-center gap-2 small fw-medium"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          <Clock size={16} className="text-primary" />
                          {format(sessionDate, "hh:mm a")} ({duration} mins)
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-auto">
                        {isUpcoming && (
                          <div className="d-flex flex-column gap-2">
                            <Link
                              to={`/mentorship/session/${session._id}`}
                              className="btn btn-primary w-100 rounded-pill fw-bold d-flex align-items-center justify-content-center gap-2"
                            >
                              <Video size={16} /> Enter 1-on-1 Session Room
                            </Link>
                            {session.meetingLink && (
                              <a
                                href={session.meetingLink}
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-sm btn-outline-secondary w-100 rounded-pill small"
                              >
                                External Link
                              </a>
                            )}
                          </div>
                        )}

                        {isPending && (
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-success flex-grow-1 rounded-pill fw-bold d-flex align-items-center justify-content-center gap-1 btn-sm"
                              onClick={() => handleStatusChange(session._id, "accept")}
                            >
                              <CheckCircle size={16} /> Accept
                            </button>
                            <button
                              className="btn btn-outline-danger flex-grow-1 rounded-pill fw-bold d-flex align-items-center justify-content-center gap-1 btn-sm"
                              onClick={() => handleStatusChange(session._id, "decline")}
                            >
                              <XCircle size={16} /> Decline
                            </button>
                          </div>
                        )}

                        {isCompleted && (
                          <Link
                            to={`/mentorship/session/${session._id}`}
                            className="btn btn-outline-secondary w-100 rounded-pill fw-medium d-flex align-items-center justify-content-center gap-1 small"
                          >
                            View Notes & Action Items
                          </Link>
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
    </div>
  );
}
