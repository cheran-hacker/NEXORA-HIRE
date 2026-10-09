import React, { useState, useEffect } from "react";
import { alumniService } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import {
  Calendar,
  Clock,
  Video,
  CheckCircle,
  XCircle,
  AlertCircle,
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
      const res = await alumniService.getMentorshipSessions();
      setSessions(res.data.data || []);
    } catch (err) {
      addToast("Failed to load mentorship sessions", "error");
      console.error(err); // Empty state will be shown if no data is available
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };
  const handleStatusChange = async (id, action) => {
    try {
      if (action === "accept") {
        await alumniService.acceptSession(id);
        addToast("Session accepted successfully!", "success");
      } else {
        await alumniService.declineSession(id);
        addToast("Session declined.", "info");
      }
      fetchSessions();
    } catch (err) {
      addToast(`Failed to ${action} session`, "error");
    }
  };
  const filteredSessions = sessions.filter((session) => {
    if (filter === "upcoming") return session.status === "Scheduled";
    if (filter === "pending") return session.status === "Pending";
    if (filter === "history")
      return ["Completed", "Declined", "Cancelled"].includes(session.status);
    return true;
  });
  if (loading)
    return (
      <div className="p-4 d-flex justify-content-center">
        <div className="spinner-border text-primary"></div>
      </div>
    );
  return (
    <div className="p-4" style={{ maxWidth: "1200px", margin: "0 auto" }}>
      {" "}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
        {" "}
        <div>
          {" "}
          <h1
            className="fw-bold mb-2"
            style={{
              fontSize: "2rem",
              color: "var(--text)",
              letterSpacing: "-0.03em",
            }}
          >
            Mentorship Sessions
          </h1>{" "}
          <p
            className="fw-medium m-0"
            style={{ color: "var(--text-secondary)", fontSize: "1rem" }}
          >
            Manage your upcoming 1:1 sessions, pending requests, and history.
          </p>{" "}
        </div>{" "}
      </div>{" "}
      <div className="bento-card p-0 overflow-hidden mb-4">
        {" "}
        <div
          className="d-flex border-bottom border"
          style={{ background: "var(--surface-2)" }}
        >
          {" "}
          <button
            className={`btn rounded-0 px-4 py-3 fw-bold border-0 ${filter === "upcoming" ? "text-primary border-bottom border-primary border-3" : "text-muted"}`}
            style={{ backgroundColor: "transparent" }}
            onClick={() => setFilter("upcoming")}
          >
            Upcoming ({sessions.filter((s) => s.status === "Scheduled").length})
          </button>{" "}
          <button
            className={`btn rounded-0 px-4 py-3 fw-bold border-0 ${filter === "pending" ? "text-warning border-bottom border-warning border-3" : "text-muted"}`}
            style={{ backgroundColor: "transparent" }}
            onClick={() => setFilter("pending")}
          >
            Pending Requests (
            {sessions.filter((s) => s.status === "Pending").length})
          </button>{" "}
          <button
            className={`btn rounded-0 px-4 py-3 fw-bold border-0 ${filter === "history" ? "text-info border-bottom border-info border-3" : "text-muted"}`}
            style={{ backgroundColor: "transparent" }}
            onClick={() => setFilter("history")}
          >
            History
          </button>{" "}
        </div>{" "}
        <div className="p-4">
          {" "}
          {filteredSessions.length === 0 ? (
            <div className="text-center py-5">
              {" "}
              <AlertCircle
                size={48}
                className="text-muted mb-3 opacity-50"
              />{" "}
              <h5 className="fw-bold text-muted mb-0">
                No {filter} sessions found.
              </h5>{" "}
            </div>
          ) : (
            <div className="row g-4">
              {" "}
              {filteredSessions.map((session) => (
                <div key={session._id} className="col-md-6 col-lg-4">
                  {" "}
                  <div
                    className="bento-card p-4 h-100 d-flex flex-column hover-glow"
                    style={{ background: "var(--surface)" }}
                  >
                    {" "}
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      {" "}
                      <div>
                        {" "}
                        <h5
                          className="fw-bold mb-1"
                          style={{ color: "var(--text)" }}
                        >
                          {session.topic}
                        </h5>{" "}
                        <p
                          className="small mb-0"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          with {session.studentId?.name || "Unknown Student"}
                        </p>{" "}
                      </div>{" "}
                      <span
                        className={`badge rounded-pill ${session.status === "Scheduled" ? "bg-primary-subtle text-primary border border-primary" : session.status === "Pending" ? "bg-warning-subtle text-warning border border-warning" : session.status === "Completed" ? "bg-success-subtle text-success border border-success" : "bg-danger-subtle text-danger border border-danger"}`}
                      >
                        {" "}
                        {session.status}{" "}
                      </span>{" "}
                    </div>{" "}
                    <div className="mb-4 flex-grow-1">
                      {" "}
                      <div
                        className="d-flex align-items-center gap-2 mb-2 small fw-medium"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {" "}
                        <Calendar size={16} />{" "}
                        {format(
                          new Date(session.scheduledDate),
                          "MMM dd, yyyy",
                        )}{" "}
                      </div>{" "}
                      <div
                        className="d-flex align-items-center gap-2 mb-2 small fw-medium"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {" "}
                        <Clock size={16} />{" "}
                        {format(new Date(session.scheduledDate), "hh:mm a")} (
                        {session.duration} mins){" "}
                      </div>{" "}
                      {session.meetingLink &&
                        session.status === "Scheduled" && (
                          <div className="d-flex align-items-center gap-2 small fw-medium text-info">
                            {" "}
                            <Video size={16} />{" "}
                            <a
                              href={session.meetingLink}
                              target="_blank"
                              rel="noreferrer"
                              className="text-info text-decoration-none"
                            >
                              Join Meeting
                            </a>{" "}
                          </div>
                        )}{" "}
                    </div>{" "}
                    {session.status === "Pending" && (
                      <div className="d-flex gap-2 mt-auto">
                        {" "}
                        <button
                          className="btn btn-success flex-grow-1 rounded-pill fw-bold d-flex align-items-center justify-content-center gap-2"
                          onClick={() =>
                            handleStatusChange(session._id, "accept")
                          }
                        >
                          {" "}
                          <CheckCircle size={18} /> Accept{" "}
                        </button>{" "}
                        <button
                          className="btn btn-outline-danger flex-grow-1 rounded-pill fw-bold d-flex align-items-center justify-content-center gap-2"
                          onClick={() =>
                            handleStatusChange(session._id, "decline")
                          }
                        >
                          {" "}
                          <XCircle size={18} /> Decline{" "}
                        </button>{" "}
                      </div>
                    )}{" "}
                  </div>{" "}
                </div>
              ))}{" "}
            </div>
          )}{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}
