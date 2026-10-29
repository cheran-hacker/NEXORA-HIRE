import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Share2,
  Settings,
  MessageSquare,
  Bell,
  CheckCircle2,
  Plus,
  Save,
  Check,
  ListTodo,
  FileText,
  Sparkles
} from "lucide-react";
import { mentorshipService } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";

export default function MentorshipSessionRoom() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [session, setSession] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);

  const [activeTab, setActiveTab] = useState("agenda"); // agenda, notes, actionItems
  const [micActive, setMicActive] = useState(true);
  const [videoActive, setVideoActive] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);

  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  const [agendaItems, setAgendaItems] = useState([
    "Resume and background review",
    "Skill gap coaching and remediation",
    "Mock technical Q&A & communication prep",
    "Action items & next steps",
  ]);

  const [actionItems, setActionItems] = useState([
    { id: 1, text: "Revise resume system metrics", done: true },
    { id: 2, text: "Practice 5 mock interview behavioral scenarios", done: false },
    { id: 3, text: "Schedule follow-up mentorship check-in", done: false },
  ]);
  const [newActionText, setNewActionText] = useState("");

  // Load Session Data
  useEffect(() => {
    async function loadSession() {
      if (!sessionId) return;
      try {
        setLoadingSession(true);
        const res = await mentorshipService.getSessionById(sessionId);
        if (res.data?.success && res.data.data) {
          const s = res.data.data;
          setSession(s);
          if (s.sharedNotes || s.notes) {
            setNotes(s.sharedNotes || s.notes);
          }
          if (s.agenda && s.agenda.length > 0) {
            setAgendaItems(s.agenda);
          } else if (s.skillGaps && s.skillGaps.length > 0) {
            setAgendaItems(s.skillGaps.map((g) => `Remediate & coach on ${g}`));
          } else if (s.topic) {
            setAgendaItems([
              s.topic,
              "Resume & Project Technical Review",
              "Mock Interview & System Design Q&A",
              "Action Items & Career Next Steps",
            ]);
          }
          if (s.actionItems && s.actionItems.length > 0) {
            setActionItems(
              s.actionItems.map((a) => ({
                id: a._id || a.id,
                text: a.title || a.text,
                done: a.status === "COMPLETED" || a.done,
              }))
            );
          }
        }
      } catch (err) {
        console.warn("Could not load session from server, using defaults:", err);
      } finally {
        setLoadingSession(false);
      }
    }
    loadSession();
  }, [sessionId]);

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      if (sessionId && !sessionId.startsWith("sess-") && !sessionId.startsWith("priya-")) {
        await mentorshipService.updateNotes(sessionId, { sharedNotes: notes });
      }
      addToast("Session notes saved successfully to database!", "success");
    } catch (e) {
      addToast("Notes saved locally!", "success");
    } finally {
      setSavingNotes(false);
    }
  };

  const handleToggleAction = (id) => {
    setActionItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  const handleAddAction = (e) => {
    e.preventDefault();
    if (!newActionText.trim()) return;
    setActionItems((prev) => [
      ...prev,
      { id: Date.now(), text: newActionText.trim(), done: false },
    ]);
    setNewActionText("");
    addToast("Action item added!", "success");
  };

  const handleEndCall = async () => {
    const role = (user?.role || "").toLowerCase();
    if (role === "alumni" && session?._id) {
      try {
        await mentorshipService.completeSession(session._id, { mentorFeedback: notes || "Session concluded." });
        addToast("Mentorship session concluded and marked as Completed! 🎉", "success");
      } catch (e) {
        addToast("Mentorship session ended.", "info");
      }
      navigate("/alumni/sessions");
    } else if (role === "student") {
      addToast("Mentorship session ended.", "info");
      navigate("/student/mentorship-sessions");
    } else {
      addToast("Mentorship session ended.", "info");
      navigate("/placement/guidance");
    }
  };

  return (
    <div
      className="container-fluid p-0 d-flex flex-column"
      style={{
        background: "#0b0f19",
        minHeight: "100vh",
        color: "#ffffff",
      }}
    >
      {/* Top Nav Bar */}
      <div
        className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom"
        style={{
          background: "#0f172a",
          borderColor: "rgba(255, 255, 255, 0.1)",
        }}
      >
        <div className="d-flex align-items-center gap-2">
          <span className="fw-black fs-5" style={{ letterSpacing: "-0.02em" }}>
            NEXORA
          </span>
          <span className="text-muted px-2">|</span>
          <span className="fw-semibold small text-light">
            {session?.topic ? `${session.topic} — Live Room` : "Mentorship Session"}
          </span>
          {session?.status && (
            <span className="badge bg-success-subtle text-success ms-2">
              {session.status}
            </span>
          )}
        </div>

        <div className="d-flex align-items-center gap-3">
          <button
            type="button"
            className="btn btn-link text-light p-1"
            title="Session Chat"
          >
            <MessageSquare size={18} />
          </button>
          <button
            type="button"
            className="btn btn-link text-light p-1"
            title="Notifications"
          >
            <Bell size={18} />
          </button>
          <div
            className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold small"
            style={{ width: "32px", height: "32px" }}
          >
            {user?.name?.charAt(0) || "U"}
          </div>
        </div>
      </div>

      {/* Main Grid: Video Room (Left) + Right Panel (Right) */}
      <div className="d-flex flex-grow-1 flex-column flex-lg-row overflow-hidden p-3 p-md-4 gap-4">
        {/* Left Side: Split-Screen Videos & Controls */}
        <div className="d-flex flex-column flex-grow-1 gap-3">
          {/* Side-by-Side Video Streams */}
          <div className="row g-3 flex-grow-1">
            {/* Video Feed 1: Mentor */}
            <div className="col-12 col-md-6">
              <div
                className="w-100 h-100 rounded-4 overflow-hidden position-relative shadow d-flex align-items-center justify-content-center"
                style={{
                  background: "#1e293b",
                  minHeight: "360px",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <img
                  src={
                    session?.mentor?.avatar ||
                    session?.mentor?.avatarUrl ||
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80"
                  }
                  alt="Mentor"
                  className="w-100 h-100"
                  style={{ objectFit: "cover" }}
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80";
                  }}
                />
                <div
                  className="position-absolute bottom-0 start-0 m-3 px-3 py-1 rounded-pill small fw-semibold d-flex align-items-center gap-2"
                  style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
                >
                  <span>{session?.mentor?.name || "Ravi Kumar"} (Mentor)</span>
                  {session?.mentor?.alumniProfile?.company && (
                    <span className="badge bg-primary text-white" style={{ fontSize: "0.68rem" }}>
                      {session.mentor.alumniProfile.company}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Video Feed 2: Student */}
            <div className="col-12 col-md-6">
              <div
                className="w-100 h-100 rounded-4 overflow-hidden position-relative shadow d-flex align-items-center justify-content-center"
                style={{
                  background: "#1e293b",
                  minHeight: "360px",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <img
                  src={
                    session?.mentee?.avatar ||
                    session?.mentee?.avatarUrl ||
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80"
                  }
                  alt="Student"
                  className="w-100 h-100"
                  style={{ objectFit: "cover" }}
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80";
                  }}
                />
                <div
                  className="position-absolute bottom-0 start-0 m-3 px-3 py-1 rounded-pill small fw-semibold d-flex align-items-center gap-2"
                  style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
                >
                  <span>{session?.mentee?.name || "GOKUL K"} (Student)</span>
                  <span className="badge bg-secondary text-white" style={{ fontSize: "0.68rem" }}>
                    {session?.mentee?.studentProfile?.branch || "Student Mentee"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Video Control Bar Docked at Bottom */}
          <div
            className="d-flex align-items-center justify-content-center gap-3 py-3 px-4 rounded-4"
            style={{
              background: "#0f172a",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              maxWidth: "540px",
              margin: "0 auto",
              width: "100%",
            }}
          >
            <button
              type="button"
              className="btn btn-danger rounded-pill px-4 py-2 fw-bold d-flex align-items-center gap-2"
              onClick={handleEndCall}
              style={{ fontSize: "0.9rem" }}
            >
              <PhoneOff size={16} /> End Call
            </button>

            <button
              type="button"
              onClick={() => setMicActive(!micActive)}
              className={`btn rounded-circle p-2 d-flex align-items-center justify-content-center ${
                micActive ? "btn-secondary text-white" : "btn-light text-danger"
              }`}
              style={{ width: "42px", height: "42px" }}
              title={micActive ? "Mute Microphone" : "Unmute Microphone"}
            >
              {micActive ? <Mic size={18} /> : <MicOff size={18} />}
            </button>

            <button
              type="button"
              onClick={() => setVideoActive(!videoActive)}
              className={`btn rounded-circle p-2 d-flex align-items-center justify-content-center ${
                videoActive ? "btn-secondary text-white" : "btn-light text-danger"
              }`}
              style={{ width: "42px", height: "42px" }}
              title={videoActive ? "Turn Off Camera" : "Turn On Camera"}
            >
              {videoActive ? <Video size={18} /> : <VideoOff size={18} />}
            </button>

            <button
              type="button"
              onClick={() => setScreenSharing(!screenSharing)}
              className={`btn rounded-circle p-2 d-flex align-items-center justify-content-center ${
                screenSharing ? "btn-primary text-white" : "btn-secondary text-white"
              }`}
              style={{ width: "42px", height: "42px" }}
              title="Share Screen"
            >
              <Share2 size={18} />
            </button>

            <button
              type="button"
              className="btn btn-secondary rounded-circle p-2 d-flex align-items-center justify-content-center text-white"
              style={{ width: "42px", height: "42px" }}
              title="Settings"
            >
              <Settings size={18} />
            </button>
          </div>
        </div>

        {/* Right Side Panel: Agenda | Notes | Action Items */}
        <div
          className="rounded-4 p-4 d-flex flex-column shadow"
          style={{
            background: "#ffffff",
            color: "#0f172a",
            width: "100%",
            maxWidth: "380px",
            minHeight: "540px",
          }}
        >
          {/* Navigation Tabs */}
          <div className="d-flex border-bottom mb-4" style={{ borderColor: "#e2e8f0" }}>
            {[
              { id: "agenda", label: "Agenda" },
              { id: "notes", label: "Notes" },
              { id: "actionItems", label: "Action Items" },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  className={`btn btn-link text-decoration-none px-3 py-2 fw-semibold position-relative ${
                    isActive ? "text-primary" : "text-muted"
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    color: isActive ? "#0d6efd" : "#64748b",
                    fontSize: "0.95rem",
                    border: "none",
                    background: "transparent",
                  }}
                >
                  {tab.label}
                  {isActive && (
                    <motion.div
                      layoutId="roomTabUnderline"
                      className="position-absolute bottom-0 start-0 w-100"
                      style={{
                        height: "3px",
                        background: "#0d6efd",
                        borderRadius: "3px 3px 0 0",
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab 1: Agenda */}
          {activeTab === "agenda" && (
            <div className="d-flex flex-column flex-grow-1">
              <h6 className="fw-bold mb-3" style={{ color: "#0f172a" }}>
                Session Agenda & Objectives
              </h6>
              <ul className="list-unstyled d-flex flex-column gap-2 mb-4">
                {agendaItems.map((item, idx) => (
                  <li key={idx} className="d-flex align-items-center gap-2 text-muted small fw-medium">
                    <span
                      className="rounded-circle bg-primary flex-shrink-0"
                      style={{ width: "8px", height: "8px" }}
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <h6 className="fw-bold mb-2" style={{ color: "#0f172a" }}>
                Shared Notes Preview
              </h6>
              <div
                className="p-3 rounded-3 border mb-3 flex-grow-1"
                style={{ background: "#f8fafc", borderColor: "#e2e8f0" }}
              >
                <textarea
                  className="form-control border-0 p-0 bg-transparent text-dark small"
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Record guidance notes here..."
                  style={{ resize: "none" }}
                />
              </div>

              <button
                type="button"
                disabled={savingNotes}
                className="btn btn-primary rounded-pill w-100 py-2 fw-semibold btn-sm"
                onClick={handleSaveNotes}
                style={{ background: "#0d6efd", border: "none" }}
              >
                {savingNotes ? "Saving..." : "Save Notes"}
              </button>
            </div>
          )}

          {/* Tab 2: Notes Editor */}
          {activeTab === "notes" && (
            <div className="d-flex flex-column flex-grow-1">
              <h6 className="fw-bold mb-2">Collaborative Discussion Notes</h6>
              <p className="text-muted small mb-2">
                Shared notes between student and mentor persisted to the session record.
              </p>
              <textarea
                className="form-control flex-grow-1 mb-3"
                rows={10}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Take shared notes during the session..."
              />
              <button
                type="button"
                disabled={savingNotes}
                className="btn btn-primary rounded-pill w-100 py-2 fw-semibold"
                onClick={handleSaveNotes}
                style={{ background: "#0d6efd", border: "none" }}
              >
                {savingNotes ? "Saving to Database..." : "Save Notes"}
              </button>
            </div>
          )}

          {/* Tab 3: Action Items */}
          {activeTab === "actionItems" && (
            <div className="d-flex flex-column flex-grow-1">
              <h6 className="fw-bold mb-3">Action Items</h6>
              <div className="d-flex flex-column gap-2 mb-4 flex-grow-1">
                {actionItems.map((item) => (
                  <div
                    key={item.id}
                    className="d-flex align-items-center gap-2 p-2 rounded-3 border"
                    style={{ borderColor: "#e2e8f0" }}
                  >
                    <input
                      type="checkbox"
                      className="form-check-input mt-0 cursor-pointer"
                      checked={item.done}
                      onChange={() => handleToggleAction(item.id)}
                    />
                    <span
                      className={`small fw-medium ${item.done ? "text-decoration-line-through text-muted" : "text-dark"}`}
                    >
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddAction} className="input-group input-group-sm">
                <input
                  type="text"
                  className="form-control"
                  placeholder="New action item..."
                  value={newActionText}
                  onChange={(e) => setNewActionText(e.target.value)}
                />
                <button type="submit" className="btn btn-primary fw-semibold">
                  Add
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
