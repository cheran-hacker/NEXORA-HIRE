import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  Video,
  User,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Send,
  FileText,
  ListTodo,
  Star,
  Lock,
  Share2,
  ArrowLeft,
  AlertCircle,
  Play,
  Check,
  ExternalLink
} from "lucide-react";
import { io } from "socket.io-client";
import { mentorshipService } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";

export default function MentorshipSessionRoom() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [session, setSession] = useState(null);
  const [roleInSession, setRoleInSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("discussion"); // discussion, notes, actionItems

  // Messaging state
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  // Notes state
  const [sharedNotes, setSharedNotes] = useState("");
  const [privateNotes, setPrivateNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  // Action Items state
  const [actionItems, setActionItems] = useState([]);
  const [newActionTitle, setNewActionTitle] = useState("");
  const [newActionDueDate, setNewActionDueDate] = useState("");
  const [newActionAssignee, setNewActionAssignee] = useState("Student");

  // Feedback state
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // Cancel Modal
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  useEffect(() => {
    fetchSessionDetails();

    // Socket.io initialization
    const socketUrl = window.location.origin.includes(":3000")
      ? window.location.origin.replace(":3000", ":5000")
      : window.location.origin;

    const socket = io(socketUrl, { transports: ["websocket", "polling"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join_session", sessionId);
    });

    socket.on("receive_message", (incomingMsg) => {
      setMessages((prev) => [...prev, incomingMsg]);
    });

    return () => {
      if (socket) socket.disconnect();
    };
  }, [sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchSessionDetails = async () => {
    try {
      setLoading(true);
      const res = await mentorshipService.getSessionById(sessionId);
      if (res.data.success) {
        const sess = res.data.data;
        setSession(sess);
        setRoleInSession(res.data.roleInSession);
        setSharedNotes(sess.sharedNotes || sess.notes || "");
        setPrivateNotes(sess.privateMentorNotes || "");
        setActionItems(sess.actionItems || []);
        if (sess.rating) setRating(sess.rating);
        if (sess.review) setReview(sess.review);
      }
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to load mentorship session", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    const newMsg = {
      sessionId,
      senderId: user?.id || user?._id,
      senderName: user?.name || "Participant",
      senderRole: roleInSession,
      text: messageText.trim(),
      createdAt: new Date().toISOString()
    };

    if (socketRef.current) {
      socketRef.current.emit("send_message", newMsg);
    }
    // Optimistic append
    setMessages((prev) => [...prev, newMsg]);
    setMessageText("");
  };

  const handleSaveNotes = async () => {
    try {
      setSavingNotes(true);
      await mentorshipService.updateNotes(sessionId, {
        sharedNotes,
        privateMentorNotes: roleInSession === "Mentor" ? privateNotes : undefined
      });
      addToast("Notes saved to database successfully", "success");
    } catch (err) {
      addToast("Failed to save notes", "error");
    } finally {
      setSavingNotes(false);
    }
  };

  const handleAddActionItem = async (e) => {
    e.preventDefault();
    if (!newActionTitle.trim()) return;

    try {
      const res = await mentorshipService.addActionItem(sessionId, {
        title: newActionTitle.trim(),
        assignedTo: newActionAssignee,
        dueDate: newActionDueDate || undefined
      });
      setActionItems(res.data.data);
      setNewActionTitle("");
      setNewActionDueDate("");
      addToast("Action item assigned", "success");
    } catch (err) {
      addToast("Failed to add action item", "error");
    }
  };

  const handleToggleActionItem = async (itemId, currentStatus) => {
    const nextStatus = currentStatus === "COMPLETED" ? "TODO" : "COMPLETED";
    try {
      const res = await mentorshipService.updateActionItem(sessionId, itemId, { status: nextStatus });
      setActionItems(res.data.data);
    } catch (err) {
      addToast("Failed to update action item", "error");
    }
  };

  const handleStartSession = async () => {
    try {
      await mentorshipService.updateSessionStatus(sessionId, { status: "InProgress" });
      setSession((prev) => ({ ...prev, status: "InProgress" }));
      addToast("Session marked as In Progress", "success");
    } catch (err) {
      addToast("Failed to start session", "error");
    }
  };

  const handleCompleteSession = async () => {
    try {
      await mentorshipService.updateSessionStatus(sessionId, { status: "Completed" });
      setSession((prev) => ({ ...prev, status: "Completed" }));
      addToast("Session marked as Completed! Great mentorship work.", "success");
      if (roleInSession === "Mentee") {
        setShowFeedbackModal(true);
      }
    } catch (err) {
      addToast("Failed to complete session", "error");
    }
  };

  const handleCancelSession = async () => {
    try {
      await mentorshipService.updateSessionStatus(sessionId, {
        status: "Cancelled",
        cancellationReason: cancelReason || "Cancelled by participant"
      });
      setSession((prev) => ({ ...prev, status: "Cancelled" }));
      setShowCancelModal(false);
      addToast("Session cancelled", "info");
    } catch (err) {
      addToast("Failed to cancel session", "error");
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    try {
      setSubmittingFeedback(true);
      await mentorshipService.submitFeedback(sessionId, { rating, review });
      setShowFeedbackModal(false);
      addToast("Feedback & rating submitted! Thank you.", "success");
      fetchSessionDetails();
    } catch (err) {
      addToast("Failed to submit feedback", "error");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (loading) {
    return (
      <div className="container-fluid py-5 text-center">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-3 text-muted fw-medium">Connecting to 1-on-1 Mentorship Room...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container-fluid py-5 text-center">
        <AlertCircle size={48} className="text-danger mb-3 mx-auto" />
        <h4 className="fw-bold" style={{ color: "var(--text)" }}>Session Not Found</h4>
        <p className="text-muted">The requested mentorship session does not exist or you do not have permission.</p>
        <button onClick={() => navigate(-1)} className="btn btn-primary rounded-pill px-4 mt-2">
          Go Back
        </button>
      </div>
    );
  }

  const isMentor = roleInSession === "Mentor";
  const partner = isMentor ? session.mentee : session.mentor;
  const partnerProfile = isMentor ? partner?.studentProfile : partner?.alumniProfile;

  return (
    <div className="container-fluid py-4" style={{ maxWidth: "1400px" }}>
      {/* Top Navigation & Status Bar */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 pb-3 border-bottom" style={{ borderColor: "var(--border)" }}>
        <div className="d-flex align-items-center gap-3">
          <button
            onClick={() => navigate(user?.role === "Alumni" ? "/alumni/mentorship" : "/student/mentorship")}
            className="btn btn-sm btn-outline-secondary rounded-circle p-2 d-flex align-items-center justify-content-center"
            title="Back to Mentorship Hub"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="d-flex align-items-center gap-2">
              <span className="badge rounded-pill bg-primary px-3 py-1 text-white fw-bold small">
                NEXORA 1-ON-1 ROOM
              </span>
              <span className={`badge rounded-pill px-3 py-1 fw-bold small ${
                session.status === "Completed"
                  ? "bg-success text-white"
                  : session.status === "InProgress"
                  ? "bg-warning text-dark"
                  : session.status === "Cancelled"
                  ? "bg-danger text-white"
                  : "bg-info text-white"
              }`}>
                {session.status.toUpperCase()}
              </span>
            </div>
            <h3 className="fw-black m-0 mt-1" style={{ color: "var(--text)" }}>
              {session.topic}
            </h3>
          </div>
        </div>

        {/* Action Controls */}
        <div className="d-flex flex-wrap align-items-center gap-2">
          {session.status === "Confirmed" && (
            <button
              onClick={handleStartSession}
              className="btn btn-warning rounded-pill px-4 fw-bold d-flex align-items-center gap-2 shadow-sm"
            >
              <Play size={16} /> Start Session
            </button>
          )}

          {["Confirmed", "InProgress"].includes(session.status) && (
            <button
              onClick={handleCompleteSession}
              className="btn btn-success rounded-pill px-4 fw-bold d-flex align-items-center gap-2 shadow-sm"
            >
              <CheckCircle2 size={16} /> Mark Completed
            </button>
          )}

          {["Confirmed", "Scheduled"].includes(session.status) && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="btn btn-outline-danger rounded-pill px-3 fw-bold d-flex align-items-center gap-2"
            >
              <XCircle size={16} /> Cancel Session
            </button>
          )}

          {session.status === "Completed" && !isMentor && (
            <button
              onClick={() => setShowFeedbackModal(true)}
              className="btn btn-primary rounded-pill px-4 fw-bold d-flex align-items-center gap-2 shadow-sm"
            >
              <Star size={16} /> {session.rating ? "Edit Feedback" : "Leave Review"}
            </button>
          )}
        </div>
      </div>

      <div className="row g-4">
        {/* Left Column: Participant Profiles & Metadata */}
        <div className="col-lg-3">
          <div className="bento-card p-4 space-y-4 mb-4">
            <h6 className="fw-bold text-uppercase tracking-wider small mb-3" style={{ color: "var(--text-secondary)" }}>
              {isMentor ? "Mentee Profile" : "Mentor Profile"}
            </h6>

            <div className="d-flex align-items-center gap-3">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm text-white fs-5 overflow-hidden flex-shrink-0"
                style={{
                  width: "56px",
                  height: "56px",
                  background: "linear-gradient(135deg, var(--primary), var(--purple, #8b5cf6))"
                }}
              >
                {partner?.avatar || partner?.avatarUrl ? (
                  <img src={partner.avatar || partner.avatarUrl} alt="" className="w-100 h-100 object-fit-cover" />
                ) : (
                  partner?.name?.charAt(0) || "U"
                )}
              </div>
              <div className="overflow-hidden">
                <h5 className="fw-bold m-0 text-truncate" style={{ color: "var(--text)" }}>
                  {partner?.name}
                </h5>
                <p className="small m-0 text-muted text-truncate">
                  {isMentor
                    ? partnerProfile?.department || "Student"
                    : partnerProfile?.designation || partnerProfile?.currentRole || "Alumni Leader"}
                </p>
                <div className="badge rounded-pill bg-surface-2 text-primary small px-2 py-0 mt-1">
                  {isMentor ? "STUDENT" : "VERIFIED ALUMNI"}
                </div>
              </div>
            </div>

            <hr style={{ borderColor: "var(--border)" }} />

            <div className="space-y-3 small">
              <div>
                <span className="text-muted d-block">Organization / College:</span>
                <strong style={{ color: "var(--text)" }}>
                  {isMentor ? partnerProfile?.college || "NEXORA Campus" : partnerProfile?.company || "Leading Tech Firm"}
                </strong>
              </div>

              {session.targetRole && (
                <div>
                  <span className="text-muted d-block">Career Target:</span>
                  <strong style={{ color: "var(--text)" }}>{session.targetRole}</strong>
                </div>
              )}

              {session.careerGoal && (
                <div>
                  <span className="text-muted d-block">Mentorship Objective:</span>
                  <p className="m-0 text-secondary">{session.careerGoal}</p>
                </div>
              )}

              {session.skillGaps?.length > 0 && (
                <div>
                  <span className="text-muted d-block mb-1">Target Skill Gaps:</span>
                  <div className="d-flex flex-wrap gap-1">
                    {session.skillGaps.map((sg, i) => (
                      <span key={i} className="badge rounded-pill bg-surface-2 text-danger border" style={{ borderColor: "var(--border)" }}>
                        {sg}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <hr style={{ borderColor: "var(--border)" }} />

            {/* Session Schedule info */}
            <div className="space-y-2 small">
              <div className="d-flex align-items-center gap-2" style={{ color: "var(--text)" }}>
                <Calendar size={15} className="text-primary" />
                <span>{new Date(session.scheduledStart || session.scheduledDate).toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
              </div>
              <div className="d-flex align-items-center gap-2" style={{ color: "var(--text)" }}>
                <Clock size={15} className="text-primary" />
                <span>
                  {new Date(session.scheduledStart || session.scheduledDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  {" "}({session.durationMinutes} mins)
                </span>
              </div>
              <div className="text-muted small ps-4">
                Timezone: {session.timezone || "Asia/Kolkata"}
              </div>
            </div>
          </div>
        </div>

        {/* Center Column: Interactive Session Hub (Chat & Action Items) */}
        <div className="col-lg-6">
          <div className="bento-card p-0 overflow-hidden d-flex flex-column" style={{ height: "700px" }}>
            {/* Tabs */}
            <div className="d-flex border-bottom bg-surface-2" style={{ borderColor: "var(--border)" }}>
              <button
                onClick={() => setActiveTab("discussion")}
                className={`flex-grow-1 py-3 text-center fw-bold transition-fast d-flex align-items-center justify-content-center gap-2 ${
                  activeTab === "discussion" ? "border-bottom border-2 border-primary bg-card" : "bg-transparent text-muted"
                }`}
                style={{ border: "none", color: activeTab === "discussion" ? "var(--text)" : "var(--text-secondary)" }}
              >
                <MessageSquare size={16} /> 1-on-1 Discussion
              </button>
              <button
                onClick={() => setActiveTab("actionItems")}
                className={`flex-grow-1 py-3 text-center fw-bold transition-fast d-flex align-items-center justify-content-center gap-2 ${
                  activeTab === "actionItems" ? "border-bottom border-2 border-primary bg-card" : "bg-transparent text-muted"
                }`}
                style={{ border: "none", color: activeTab === "actionItems" ? "var(--text)" : "var(--text-secondary)" }}
              >
                <ListTodo size={16} /> Action Items ({actionItems.length})
              </button>
            </div>

            {/* Tab 1: Discussion Chat */}
            {activeTab === "discussion" && (
              <div className="d-flex flex-column flex-grow-1 overflow-hidden">
                {/* Messages stream */}
                <div className="flex-grow-1 p-3 overflow-y-auto space-y-3" style={{ background: "var(--surface)" }}>
                  <div className="text-center py-2">
                    <span className="badge rounded-pill bg-surface-2 text-muted px-3 py-1 small border">
                      Session room initialized. Realtime messaging active.
                    </span>
                  </div>

                  {messages.length === 0 && (
                    <div className="text-center py-5 text-muted">
                      <MessageSquare size={36} className="mx-auto mb-2 opacity-30" />
                      <p className="small mb-0">No messages yet. Send a greeting or discussion question to begin!</p>
                    </div>
                  )}

                  {messages.map((msg, index) => {
                    const isSelf = msg.senderId === (user?.id || user?._id);
                    return (
                      <div key={index} className={`d-flex flex-column ${isSelf ? "align-items-end" : "align-items-start"}`}>
                        <div className="d-flex align-items-center gap-1 mb-1">
                          <span className="small fw-bold" style={{ color: "var(--text-secondary)", fontSize: "0.75rem" }}>
                            {msg.senderName} ({msg.senderRole || "Member"})
                          </span>
                        </div>
                        <div
                          className={`p-3 rounded-4 shadow-sm text-break`}
                          style={{
                            maxWidth: "75%",
                            background: isSelf ? "var(--primary)" : "var(--surface-2)",
                            color: isSelf ? "#ffffff" : "var(--text)",
                            border: isSelf ? "none" : "1px solid var(--border)"
                          }}
                        >
                          <p className="m-0 small">{msg.text}</p>
                        </div>
                        <span className="text-muted mt-1" style={{ fontSize: "0.65rem" }}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input bar */}
                <form onSubmit={handleSendMessage} className="p-3 border-top d-flex gap-2 bg-card" style={{ borderColor: "var(--border)" }}>
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type a message or session question..."
                    className="form-control rounded-pill px-4"
                    style={{ background: "var(--surface)", color: "var(--text)", borderColor: "var(--border)" }}
                  />
                  <button
                    type="submit"
                    disabled={!messageText.trim()}
                    className="btn btn-primary rounded-circle p-2 d-flex align-items-center justify-content-center shadow-sm"
                    style={{ width: "42px", height: "42px" }}
                  >
                    <Send size={18} />
                  </button>
                </form>
              </div>
            )}

            {/* Tab 2: Action Items */}
            {activeTab === "actionItems" && (
              <div className="p-4 flex-grow-1 overflow-y-auto space-y-4">
                <form onSubmit={handleAddActionItem} className="p-3 rounded-4 bg-surface-2 border" style={{ borderColor: "var(--border)" }}>
                  <h6 className="fw-bold mb-2" style={{ color: "var(--text)" }}>Add Mentorship Action Item</h6>
                  <div className="row g-2">
                    <div className="col-md-7">
                      <input
                        type="text"
                        value={newActionTitle}
                        onChange={(e) => setNewActionTitle(e.target.value)}
                        placeholder="e.g. Build REST API project or revise resume"
                        className="form-control form-control-sm rounded-pill"
                        style={{ background: "var(--surface)", color: "var(--text)", borderColor: "var(--border)" }}
                        required
                      />
                    </div>
                    <div className="col-md-3">
                      <input
                        type="date"
                        value={newActionDueDate}
                        onChange={(e) => setNewActionDueDate(e.target.value)}
                        className="form-control form-control-sm rounded-pill"
                        style={{ background: "var(--surface)", color: "var(--text)", borderColor: "var(--border)" }}
                      />
                    </div>
                    <div className="col-md-2">
                      <button type="submit" className="btn btn-sm btn-primary rounded-pill w-100 fw-bold">
                        Assign
                      </button>
                    </div>
                  </div>
                </form>

                <div className="space-y-2">
                  {actionItems.length === 0 ? (
                    <div className="text-center py-4 text-muted">
                      <ListTodo size={32} className="mx-auto mb-2 opacity-30" />
                      <p className="small">No action items assigned yet.</p>
                    </div>
                  ) : (
                    actionItems.map((item) => (
                      <div
                        key={item._id}
                        onClick={() => handleToggleActionItem(item._id, item.status)}
                        className="p-3 rounded-3 border d-flex align-items-center justify-content-between cursor-pointer hover-lift transition-fast"
                        style={{
                          background: item.status === "COMPLETED" ? "rgba(16,185,129,0.06)" : "var(--surface)",
                          borderColor: item.status === "COMPLETED" ? "var(--success)" : "var(--border)"
                        }}
                      >
                        <div className="d-flex align-items-center gap-3">
                          <div
                            className={`rounded-circle d-flex align-items-center justify-content-center ${
                              item.status === "COMPLETED" ? "bg-success text-white" : "border"
                            }`}
                            style={{ width: "22px", height: "22px" }}
                          >
                            {item.status === "COMPLETED" && <Check size={14} />}
                          </div>
                          <div>
                            <span
                              className={`fw-medium d-block small ${
                                item.status === "COMPLETED" ? "text-decoration-line-through text-muted" : ""
                              }`}
                              style={{ color: item.status === "COMPLETED" ? "inherit" : "var(--text)" }}
                            >
                              {item.title}
                            </span>
                            {item.dueDate && (
                              <span className="text-muted small" style={{ fontSize: "0.75rem" }}>
                                Due: {new Date(item.dueDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="badge rounded-pill bg-surface-2 text-muted small">
                          {item.assignedTo}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Shared Notes & Private Mentor Notes */}
        <div className="col-lg-3">
          <div className="bento-card p-4 space-y-4">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <h6 className="fw-bold text-uppercase tracking-wider small m-0" style={{ color: "var(--text-secondary)" }}>
                Session Documentation
              </h6>
              <button
                onClick={handleSaveNotes}
                disabled={savingNotes}
                className="btn btn-sm btn-primary rounded-pill px-3 fw-bold shadow-sm"
              >
                {savingNotes ? "Saving..." : "Save Notes"}
              </button>
            </div>

            {/* Shared Notes (Visible to both) */}
            <div>
              <label className="small fw-bold d-flex align-items-center gap-1 mb-2" style={{ color: "var(--text)" }}>
                <Share2 size={14} className="text-primary" /> Shared Discussion Notes
              </label>
              <textarea
                rows={7}
                value={sharedNotes}
                onChange={(e) => setSharedNotes(e.target.value)}
                placeholder="Key takeaways, advice, recommended tools, and roadmap items discussed in this session..."
                className="form-control rounded-3 small"
                style={{
                  background: "var(--surface)",
                  color: "var(--text)",
                  borderColor: "var(--border)",
                  resize: "vertical"
                }}
              />
              <small className="text-muted mt-1 d-block" style={{ fontSize: "0.75rem" }}>
                Both student and mentor can read these notes.
              </small>
            </div>

            {/* Private Notes (STRICTLY mentor only) */}
            {isMentor && (
              <div className="pt-2 border-top" style={{ borderColor: "var(--border)" }}>
                <label className="small fw-bold d-flex align-items-center gap-1 mb-2 text-warning">
                  <Lock size={14} /> Private Mentor Notes
                </label>
                <textarea
                  rows={6}
                  value={privateNotes}
                  onChange={(e) => setPrivateNotes(e.target.value)}
                  placeholder="Private observations, areas of improvement, readiness evaluation... (Hidden from student)"
                  className="form-control rounded-3 small"
                  style={{
                    background: "rgba(245,158,11,0.03)",
                    color: "var(--text)",
                    borderColor: "rgba(245,158,11,0.25)",
                    resize: "vertical"
                  }}
                />
                <small className="text-muted mt-1 d-block" style={{ fontSize: "0.75rem" }}>
                  🔒 Strictly private. Stored in MongoDB, never sent to student.
                </small>
              </div>
            )}

            {/* Feedback Summary if already rated */}
            {session.rating && (
              <div className="p-3 rounded-3 bg-surface-2 border" style={{ borderColor: "var(--border)" }}>
                <span className="small text-muted d-block mb-1">Student Review</span>
                <div className="d-flex align-items-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={16}
                      className={star <= session.rating ? "text-warning fill-warning" : "text-muted"}
                    />
                  ))}
                  <strong className="ms-2 small" style={{ color: "var(--text)" }}>{session.rating}.0 / 5.0</strong>
                </div>
                {session.review && (
                  <p className="small m-0 text-secondary fst-italic">"{session.review}"</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Session Modal */}
      {showCancelModal && (
        <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.6)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border shadow-lg" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <div className="modal-header border-bottom" style={{ borderColor: "var(--border)" }}>
                <h5 className="modal-title fw-bold" style={{ color: "var(--text)" }}>Cancel Mentorship Session</h5>
                <button type="button" className="btn-close" onClick={() => setShowCancelModal(false)} />
              </div>
              <div className="modal-body space-y-3">
                <p className="text-muted small">
                  Are you sure you want to cancel this scheduled session? The other participant will receive a real notification.
                </p>
                <div>
                  <label className="small fw-bold mb-1" style={{ color: "var(--text)" }}>Reason for Cancellation</label>
                  <textarea
                    rows={3}
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="e.g. Unforeseen schedule conflict, academic obligation..."
                    className="form-control rounded-3"
                    style={{ background: "var(--surface-2)", color: "var(--text)", borderColor: "var(--border)" }}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer border-top" style={{ borderColor: "var(--border)" }}>
                <button className="btn btn-light rounded-pill px-3" onClick={() => setShowCancelModal(false)}>
                  Keep Session
                </button>
                <button className="btn btn-danger rounded-pill px-4 fw-bold" onClick={handleCancelSession}>
                  Confirm Cancellation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Student Feedback & Rating Modal */}
      {showFeedbackModal && (
        <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.6)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border shadow-lg" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <form onSubmit={handleSubmitFeedback}>
                <div className="modal-header border-bottom" style={{ borderColor: "var(--border)" }}>
                  <h5 className="modal-title fw-bold" style={{ color: "var(--text)" }}>Rate Mentorship Experience</h5>
                  <button type="button" className="btn-close" onClick={() => setShowFeedbackModal(false)} />
                </div>
                <div className="modal-body space-y-4">
                  <div className="text-center py-2">
                    <label className="small fw-bold d-block mb-2" style={{ color: "var(--text)" }}>Overall Mentorship Quality</label>
                    <div className="d-flex justify-content-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="btn btn-link p-0 hover-scale"
                        >
                          <Star
                            size={28}
                            className={star <= rating ? "text-warning fill-warning" : "text-muted"}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="small fw-bold mb-1" style={{ color: "var(--text)" }}>Review & Career Impact</label>
                    <textarea
                      rows={4}
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                      placeholder="Share how this mentorship session helped your career preparation..."
                      className="form-control rounded-3"
                      style={{ background: "var(--surface-2)", color: "var(--text)", borderColor: "var(--border)" }}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer border-top" style={{ borderColor: "var(--border)" }}>
                  <button type="button" className="btn btn-light rounded-pill px-3" onClick={() => setShowFeedbackModal(false)}>
                    Close
                  </button>
                  <button type="submit" disabled={submittingFeedback} className="btn btn-primary rounded-pill px-4 fw-bold">
                    {submittingFeedback ? "Submitting..." : "Submit Review"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
