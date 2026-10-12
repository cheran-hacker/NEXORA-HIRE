import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  Video,
  Star,
  Search,
  CheckCircle2,
  X,
  Filter,
  Sparkles,
  UserCheck,
  ShieldCheck,
  ArrowRight,
  History,
  AlertCircle,
  MessageSquare,
  Building,
  GraduationCap
} from "lucide-react";
import { mentorshipService } from "../../services/api.js";
import { useToast } from "../../context/ToastContext.jsx";

export default function MentorshipBooking() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState("discover"); // discover, pending, upcoming, history
  const [overview, setOverview] = useState(null);
  const [recommendedMentors, setRecommendedMentors] = useState([]);
  const [requests, setRequests] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [historySessions, setHistorySessions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState("All");

  // Booking Modal State
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [bookingDate, setBookingDate] = useState("");
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [topic, setTopic] = useState("");
  const [careerGoal, setCareerGoal] = useState("");
  const [message, setMessage] = useState("");
  const [submittingRequest, setSubmittingRequest] = useState(false);

  useEffect(() => {
    fetchHubData();
  }, []);

  const fetchHubData = async () => {
    try {
      setLoading(true);
      const [overviewRes, recRes, reqRes, sessRes, histRes] = await Promise.all([
        mentorshipService.getOverview().catch(() => ({ data: { data: {} } })),
        mentorshipService.getRecommended().catch(() => ({ data: { data: [] } })),
        mentorshipService.getRequests().catch(() => ({ data: { data: [] } })),
        mentorshipService.getSessions({ status: "upcoming" }).catch(() => ({ data: { data: [] } })),
        mentorshipService.getSessions({ status: "completed" }).catch(() => ({ data: { data: [] } }))
      ]);

      setOverview(overviewRes.data.data || {});
      setRecommendedMentors(recRes.data.data || []);
      setRequests(reqRes.data.data || []);
      setSessions(sessRes.data.data || []);
      setHistorySessions(histRes.data.data || []);
    } catch (err) {
      addToast("Failed to load Student Mentorship Hub data", "error");
    } finally {
      setLoading(false);
    }
  };

  // When date is selected in booking modal, fetch dynamic slots
  const handleDateChange = async (dateStr) => {
    setBookingDate(dateStr);
    setSelectedSlot(null);
    if (!selectedMentor || !dateStr) return;

    try {
      setSlotsLoading(true);
      const res = await mentorshipService.getAvailability(selectedMentor._id || selectedMentor.id, dateStr);
      if (res.data?.success) {
        setAvailableSlots(res.data.data?.slots || []);
        if (res.data.data?.isBlocked) {
          addToast(`Mentor is unavailable on this date: ${res.data.data.blockedReason}`, "info");
        }
      }
    } catch (err) {
      addToast("Failed to load slots for selected date", "error");
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleOpenBooking = (mentor) => {
    setSelectedMentor(mentor);
    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split("T")[0];
    setTopic(mentor.topics?.[0] || "General Career Guidance");
    handleDateChange(dateStr);
  };

  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!selectedSlot) {
      addToast("Please select an available time slot", "error");
      return;
    }

    try {
      setSubmittingRequest(true);
      await mentorshipService.createRequest({
        mentorId: selectedMentor._id || selectedMentor.id,
        topic,
        careerGoal,
        requestedDate: bookingDate,
        requestedStartTime: selectedSlot.startTime,
        requestedEndTime: selectedSlot.endTime,
        durationMinutes: selectedSlot.durationMinutes || 30,
        message
      });

      addToast(`Mentorship request sent to ${selectedMentor.name}!`, "success");
      setSelectedMentor(null);
      setSelectedSlot(null);
      setMessage("");
      fetchHubData();
      setActiveTab("pending");
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to submit mentorship request", "error");
    } finally {
      setSubmittingRequest(false);
    }
  };

  const handleCancelRequest = async (requestId) => {
    try {
      await mentorshipService.cancelRequest(requestId);
      addToast("Mentorship request cancelled", "info");
      fetchHubData();
    } catch (err) {
      addToast("Failed to cancel request", "error");
    }
  };

  // Filtered mentors list
  const filteredMentors = recommendedMentors.filter((m) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      m.name?.toLowerCase().includes(q) ||
      m.company?.toLowerCase().includes(q) ||
      m.role?.toLowerCase().includes(q) ||
      (m.skills || []).some((s) => s.toLowerCase().includes(q));

    const matchesRole =
      selectedRoleFilter === "All" ||
      m.role?.toLowerCase().includes(selectedRoleFilter.toLowerCase());

    return matchesSearch && matchesRole;
  });

  const kpis = overview?.kpis || {
    activeMentors: 0,
    activeMentorships: sessions.length,
    pendingRequests: requests.filter((r) => r.status === "Pending").length,
    upcomingSessions: sessions.length,
    completedSessions: historySessions.length
  };

  return (
    <div className="container-fluid space-y-4 py-4" style={{ maxWidth: "1350px" }}>
      {/* Top Banner & Header */}
      <div
        className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-4 p-4 rounded-4 shadow-sm mb-4"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)"
        }}
      >
        <div>
          <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-2 text-primary fw-semibold small bg-surface-2 border">
            <Sparkles size={14} /> 1-on-1 Alumni Career Mentorship
          </div>
          <h2 className="fw-black mb-1 text-foreground" style={{ fontSize: "2.25rem", letterSpacing: "-0.02em" }}>
            Mentorship Hub
          </h2>
          <p className="fw-medium mb-0 text-muted">
            Build meaningful 1-on-1 career connections with alumni leaders who have cracked top tech companies.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            onClick={() => setActiveTab("discover")}
            className="btn btn-primary rounded-pill px-4 py-2 fw-bold shadow-sm hover-lift d-flex align-items-center gap-2"
          >
            <Search size={16} /> Discover Mentors
          </button>
        </div>
      </div>

      {/* Database KPI Metrics Row */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="bento-card p-3 text-center h-100">
            <span className="small fw-bold text-muted text-uppercase d-block mb-1">Active</span>
            <h3 className="fw-black m-0 text-primary">{kpis.activeMentors}</h3>
            <span className="text-secondary small">Mentors Connected</span>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="bento-card p-3 text-center h-100">
            <span className="small fw-bold text-muted text-uppercase d-block mb-1">Pending</span>
            <h3 className="fw-black m-0 text-warning">{kpis.pendingRequests}</h3>
            <span className="text-secondary small">Requests Awaiting Approval</span>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="bento-card p-3 text-center h-100">
            <span className="small fw-bold text-muted text-uppercase d-block mb-1">Upcoming</span>
            <h3 className="fw-black m-0 text-info">{kpis.upcomingSessions}</h3>
            <span className="text-secondary small">Scheduled 1-on-1 Sessions</span>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="bento-card p-3 text-center h-100">
            <span className="small fw-bold text-muted text-uppercase d-block mb-1">Completed</span>
            <h3 className="fw-black m-0 text-success">{kpis.completedSessions}</h3>
            <span className="text-secondary small">Sessions Completed</span>
          </div>
        </div>
      </div>

      {/* Main Tabs Container */}
      <div className="bento-card p-0 overflow-hidden shadow-sm">
        <div className="d-flex border-bottom bg-surface-2" style={{ borderColor: "var(--border)" }}>
          <button
            onClick={() => setActiveTab("discover")}
            className={`flex-grow-1 py-3 text-center fw-bold transition-fast d-flex align-items-center justify-content-center gap-2 ${
              activeTab === "discover" ? "border-bottom border-2 border-primary bg-card" : "bg-transparent text-muted"
            }`}
            style={{ border: "none", color: activeTab === "discover" ? "var(--text)" : "var(--text-secondary)" }}
          >
            <UserCheck size={16} /> Recommended Mentors ({filteredMentors.length})
          </button>

          <button
            onClick={() => setActiveTab("pending")}
            className={`flex-grow-1 py-3 text-center fw-bold transition-fast d-flex align-items-center justify-content-center gap-2 ${
              activeTab === "pending" ? "border-bottom border-2 border-primary bg-card" : "bg-transparent text-muted"
            }`}
            style={{ border: "none", color: activeTab === "pending" ? "var(--text)" : "var(--text-secondary)" }}
          >
            Pending Requests
            {kpis.pendingRequests > 0 && (
              <span className="badge rounded-pill bg-warning text-dark px-2 py-0 small">
                {kpis.pendingRequests}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("upcoming")}
            className={`flex-grow-1 py-3 text-center fw-bold transition-fast d-flex align-items-center justify-content-center gap-2 ${
              activeTab === "upcoming" ? "border-bottom border-2 border-primary bg-card" : "bg-transparent text-muted"
            }`}
            style={{ border: "none", color: activeTab === "upcoming" ? "var(--text)" : "var(--text-secondary)" }}
          >
            Upcoming Sessions
            {sessions.length > 0 && (
              <span className="badge rounded-pill bg-primary text-white px-2 py-0 small">
                {sessions.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`flex-grow-1 py-3 text-center fw-bold transition-fast d-flex align-items-center justify-content-center gap-2 ${
              activeTab === "history" ? "border-bottom border-2 border-primary bg-card" : "bg-transparent text-muted"
            }`}
            style={{ border: "none", color: activeTab === "history" ? "var(--text)" : "var(--text-secondary)" }}
          >
            Mentorship History ({historySessions.length})
          </button>
        </div>

        <div className="p-4 p-md-5">
          {/* TAB 1: DISCOVER MENTORS */}
          {activeTab === "discover" && (
            <div className="space-y-4">
              {/* Search & Filter Controls */}
              <div className="d-flex flex-column flex-md-row gap-3 mb-4">
                <div className="position-relative flex-grow-1">
                  <Search className="position-absolute text-muted" size={18} style={{ left: "14px", top: "50%", transform: "translateY(-50%)" }} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search mentors by name, company, technical skills, or target role..."
                    className="form-control rounded-pill ps-5 py-2 shadow-none"
                    style={{ background: "var(--surface)", color: "var(--text)", borderColor: "var(--border)" }}
                  />
                </div>

                <div className="d-flex gap-2 align-items-center">
                  <span className="small text-muted fw-bold text-nowrap">Filter Role:</span>
                  <select
                    value={selectedRoleFilter}
                    onChange={(e) => setSelectedRoleFilter(e.target.value)}
                    className="form-select rounded-pill shadow-none"
                    style={{ background: "var(--surface)", color: "var(--text)", borderColor: "var(--border)", width: "180px" }}
                  >
                    <option value="All">All Roles</option>
                    <option value="Engineer">Software Engineer</option>
                    <option value="Frontend">Frontend</option>
                    <option value="Backend">Backend</option>
                    <option value="Full Stack">Full Stack</option>
                    <option value="AI">AI / Machine Learning</option>
                    <option value="Cloud">Cloud / DevOps</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status" />
                  <p className="mt-3 text-muted">Calculating real career matches and mentor availability...</p>
                </div>
              ) : filteredMentors.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <UserCheck size={48} className="mx-auto mb-3 opacity-30 text-primary" />
                  <h5 className="fw-bold" style={{ color: "var(--text)" }}>No mentors matching your filters</h5>
                  <p className="small text-secondary">Try searching for other skills or select "All Roles".</p>
                </div>
              ) : (
                <div className="row g-4">
                  {filteredMentors.map((mentor) => (
                    <div key={mentor._id || mentor.id} className="col-12 col-lg-6">
                      <div
                        className="bento-card p-4 h-100 d-flex flex-column justify-content-between border hover-lift transition-fast"
                        style={{ borderColor: "var(--border)" }}
                      >
                        <div>
                          {/* Top Row: Avatar, Name, Company, Match Badge */}
                          <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                            <div className="d-flex align-items-center gap-3">
                              <div
                                className="rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm text-white fs-5 overflow-hidden flex-shrink-0"
                                style={{
                                  width: "56px",
                                  height: "56px",
                                  background: "linear-gradient(135deg, var(--primary), var(--purple, #8b5cf6))"
                                }}
                              >
                                {mentor.avatar ? (
                                  <img src={mentor.avatar} alt="" className="w-100 h-100 object-fit-cover" />
                                ) : (
                                  mentor.name?.charAt(0) || "M"
                                )}
                              </div>
                              <div>
                                <h5 className="fw-bold m-0 d-flex align-items-center gap-2" style={{ color: "var(--text)" }}>
                                  {mentor.name}
                                  <ShieldCheck size={16} className="text-primary" />
                                </h5>
                                <div className="small fw-semibold text-primary mt-1">
                                  {mentor.role}
                                </div>
                                <div className="small text-muted d-flex align-items-center gap-2 mt-1">
                                  <span className="d-flex align-items-center gap-1">
                                    <Building size={12} /> {mentor.company}
                                  </span>
                                  {mentor.graduationYear && (
                                    <span className="d-flex align-items-center gap-1">
                                      <GraduationCap size={12} /> Class of {mentor.graduationYear}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Match Score Badge */}
                            {mentor.matchScore && (
                              <div className="text-end">
                                <span
                                  className="badge rounded-pill px-3 py-1 fw-bold"
                                  style={{
                                    background: "rgba(var(--primary-rgb, 59,130,246), 0.12)",
                                    color: "var(--primary)",
                                    border: "1px solid rgba(var(--primary-rgb), 0.2)"
                                  }}
                                >
                                  {mentor.matchScore}% Match
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Data-backed Match Reasons */}
                          {mentor.matchReasons?.length > 0 && (
                            <div className="p-2 px-3 rounded-3 bg-surface-2 border mb-3 small" style={{ borderColor: "var(--border)" }}>
                              <span className="fw-bold text-muted small d-block mb-1">Why Recommended:</span>
                              {mentor.matchReasons.map((reason, i) => (
                                <div key={i} className="text-secondary small d-flex align-items-center gap-1">
                                  <CheckCircle2 size={12} className="text-success flex-shrink-0" />
                                  <span>{reason}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Skills Badges */}
                          <div className="d-flex flex-wrap gap-1 mb-3">
                            {(mentor.skills || []).slice(0, 5).map((skill, i) => (
                              <span
                                key={i}
                                className="badge rounded-pill bg-surface-2 text-secondary border small"
                                style={{ borderColor: "var(--border)" }}
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Card Bottom CTA */}
                        <div className="pt-3 border-top d-flex align-items-center justify-content-between" style={{ borderColor: "var(--border)" }}>
                          <div className="small text-muted">
                            {mentor.isAvailable ? (
                              <span className="text-success fw-bold d-flex align-items-center gap-1">
                                ● Accepting Mentees
                              </span>
                            ) : (
                              <span className="text-secondary">○ Currently Paused</span>
                            )}
                          </div>

                          {mentor.hasPendingRequest ? (
                            <span className="badge rounded-pill bg-warning text-dark px-3 py-2 fw-bold">
                              Request Pending
                            </span>
                          ) : mentor.hasActiveSession ? (
                            <button
                              onClick={() => navigate(`/mentorship/session/${mentor.activeSessionId}`)}
                              className="btn btn-sm btn-success rounded-pill px-3 fw-bold d-flex align-items-center gap-1"
                            >
                              <Video size={14} /> Open Session Room
                            </button>
                          ) : (
                            <button
                              onClick={() => handleOpenBooking(mentor)}
                              disabled={!mentor.isAvailable}
                              className="btn btn-sm btn-primary rounded-pill px-4 fw-bold hover-lift shadow-sm d-flex align-items-center gap-1"
                            >
                              <Calendar size={14} /> View Availability & Book
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PENDING REQUESTS */}
          {activeTab === "pending" && (
            <div className="space-y-4">
              {requests.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <Clock size={48} className="mx-auto mb-3 opacity-30 text-warning" />
                  <h5 className="fw-bold" style={{ color: "var(--text)" }}>No pending mentorship requests</h5>
                  <p className="small text-secondary">
                    When you request a 1-on-1 session with an alumni mentor, track their approval status here.
                  </p>
                </div>
              ) : (
                requests.map((req) => (
                  <div
                    key={req._id}
                    className="bento-card p-4 d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-4 mb-3 border"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <div>
                      <div className="d-flex align-items-center gap-2">
                        <h5 className="fw-bold m-0" style={{ color: "var(--text)" }}>
                          Mentor: {req.alumni?.name}
                        </h5>
                        <span
                          className={`badge rounded-pill px-3 py-1 small fw-bold ${
                            req.status === "Pending"
                              ? "bg-warning text-dark"
                              : req.status === "Accepted"
                              ? "bg-success text-white"
                              : "bg-danger text-white"
                          }`}
                        >
                          {req.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="small m-0 text-primary fw-semibold mt-1">Topic: {req.topic}</p>
                      <p className="small m-0 text-muted mt-1" style={{ maxWidth: "550px" }}>
                        "{req.message || "Requesting 1-on-1 mentorship session."}"
                      </p>
                    </div>

                    <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center gap-3">
                      <div className="text-md-end small">
                        <div className="fw-bold" style={{ color: "var(--text)" }}>
                          {new Date(req.requestedDate).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                        </div>
                        <div className="text-muted mt-1">
                          {req.requestedStartTime} - {req.requestedEndTime}
                        </div>
                      </div>

                      {req.status === "Pending" && (
                        <button
                          onClick={() => handleCancelRequest(req._id)}
                          className="btn btn-outline-danger btn-sm rounded-pill px-3 fw-bold"
                        >
                          Cancel Request
                        </button>
                      )}

                      {req.status === "Accepted" && req.sessionId && (
                        <button
                          onClick={() => navigate(`/mentorship/session/${req.sessionId}`)}
                          className="btn btn-primary btn-sm rounded-pill px-3 fw-bold d-flex align-items-center gap-1"
                        >
                          <Video size={14} /> Enter Room
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: UPCOMING SESSIONS */}
          {activeTab === "upcoming" && (
            <div className="space-y-4">
              {sessions.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <Calendar size={48} className="mx-auto mb-3 opacity-30 text-primary" />
                  <h5 className="fw-bold" style={{ color: "var(--text)" }}>No upcoming 1-on-1 sessions</h5>
                  <p className="small text-secondary">
                    Once an alumni accepts your mentorship request, your scheduled session will be confirmed here.
                  </p>
                </div>
              ) : (
                sessions.map((sess) => (
                  <div
                    key={sess._id}
                    className="bento-card p-4 d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-4 mb-3 border hover-lift transition-fast"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <div
                        className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{
                          width: "52px",
                          height: "52px",
                          background: "rgba(var(--primary-rgb), 0.12)",
                          color: "var(--primary)"
                        }}
                      >
                        <Calendar size={26} />
                      </div>
                      <div>
                        <div className="d-flex align-items-center gap-2">
                          <h5 className="fw-bold m-0" style={{ color: "var(--text)" }}>
                            1-on-1 with {sess.mentorName || sess.mentor?.name}
                          </h5>
                          <span className="badge rounded-pill bg-info text-white small">
                            {sess.status}
                          </span>
                        </div>
                        <p className="small m-0 text-muted mt-1">
                          Topic: <strong style={{ color: "var(--text)" }}>{sess.topic}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center gap-4">
                      <div className="text-md-end small">
                        <div className="fw-bold" style={{ color: "var(--text)" }}>
                          {sess.dateFormatted || new Date(sess.scheduledStart || sess.scheduledDate).toLocaleDateString()}
                        </div>
                        <div className="text-muted mt-1 d-flex align-items-center gap-1 justify-content-md-end">
                          <Clock size={13} />
                          {sess.timeFormatted || new Date(sess.scheduledStart || sess.scheduledDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          {" "}({sess.durationMinutes}m)
                        </div>
                      </div>

                      <button
                        onClick={() => navigate(`/mentorship/session/${sess._id}`)}
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

          {/* TAB 4: MENTORSHIP HISTORY */}
          {activeTab === "history" && (
            <div className="space-y-4">
              {historySessions.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <History size={48} className="mx-auto mb-3 opacity-30 text-secondary" />
                  <h5 className="fw-bold" style={{ color: "var(--text)" }}>No completed sessions yet</h5>
                  <p className="small text-secondary">
                    Your completed 1-on-1 mentorship sessions and action items will be archived here.
                  </p>
                </div>
              ) : (
                historySessions.map((sess) => (
                  <div
                    key={sess._id}
                    className="bento-card p-4 d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-4 mb-3 border"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <div>
                      <h5 className="fw-bold m-0" style={{ color: "var(--text)" }}>
                        1-on-1 with {sess.mentorName || sess.mentor?.name}
                      </h5>
                      <p className="small m-0 text-muted mt-1">Topic: {sess.topic}</p>
                      {sess.rating && (
                        <div className="d-flex align-items-center gap-1 mt-2">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              size={14}
                              className={s <= sess.rating ? "text-warning fill-warning" : "text-muted"}
                            />
                          ))}
                          <span className="small text-muted ms-2 fst-italic">"{sess.review}"</span>
                        </div>
                      )}
                    </div>

                    <div className="d-flex align-items-center gap-3">
                      <div className="text-md-end small text-muted">
                        <div>{new Date(sess.completedAt || sess.scheduledDate).toLocaleDateString()}</div>
                      </div>
                      <button
                        onClick={() => navigate(`/mentorship/session/${sess._id}`)}
                        className="btn btn-outline-secondary rounded-pill px-3 py-1 btn-sm fw-bold"
                      >
                        Review Notes & Action Items
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Real Availability Booking Modal */}
      {selectedMentor && (
        <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.6)" }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border shadow-lg" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <form onSubmit={handleSendRequest}>
                <div className="modal-header border-bottom" style={{ borderColor: "var(--border)" }}>
                  <div>
                    <h5 className="modal-title fw-bold" style={{ color: "var(--text)" }}>
                      Request 1-on-1 Session with {selectedMentor.name}
                    </h5>
                    <span className="small text-muted">
                      {selectedMentor.role} at {selectedMentor.company}
                    </span>
                  </div>
                  <button type="button" className="btn-close" onClick={() => setSelectedMentor(null)} />
                </div>

                <div className="modal-body space-y-4">
                  {/* Select Date */}
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="small fw-bold mb-1" style={{ color: "var(--text)" }}>
                        Select Session Date
                      </label>
                      <input
                        type="date"
                        min={new Date().toISOString().split("T")[0]}
                        value={bookingDate}
                        onChange={(e) => handleDateChange(e.target.value)}
                        className="form-control rounded-3"
                        style={{ background: "var(--surface-2)", color: "var(--text)", borderColor: "var(--border)" }}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="small fw-bold mb-1" style={{ color: "var(--text)" }}>
                        Mentoring Focus Topic
                      </label>
                      <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="e.g. System Design, Resume Review, Mock Interview"
                        className="form-control rounded-3"
                        style={{ background: "var(--surface-2)", color: "var(--text)", borderColor: "var(--border)" }}
                        required
                      />
                    </div>
                  </div>

                  {/* Available Time Slots Loaded from Database */}
                  <div>
                    <label className="small fw-bold mb-2 d-flex align-items-center justify-content-between" style={{ color: "var(--text)" }}>
                      <span>Select Available Time Slot</span>
                      {selectedSlot && (
                        <span className="text-primary fw-bold">
                          Selected: {selectedSlot.startTime} - {selectedSlot.endTime}
                        </span>
                      )}
                    </label>

                    {slotsLoading ? (
                      <div className="text-center py-3 text-muted">
                        <span className="spinner-border spinner-border-sm me-2" />
                        Fetching mentor's verified availability...
                      </div>
                    ) : availableSlots.length === 0 ? (
                      <div className="p-3 rounded-3 bg-surface-2 border text-center text-muted small">
                        No time slots available on this date. Please pick another date based on the mentor's schedule.
                      </div>
                    ) : (
                      <div className="d-flex flex-wrap gap-2">
                        {availableSlots.map((slot, i) => (
                          <button
                            key={i}
                            type="button"
                            disabled={!slot.isAvailable}
                            onClick={() => setSelectedSlot(slot)}
                            className={`btn btn-sm rounded-pill px-3 py-2 fw-bold transition-fast ${
                              selectedSlot?.startTime === slot.startTime
                                ? "btn-primary shadow-sm"
                                : slot.isAvailable
                                ? "btn-outline-primary"
                                : "btn-light text-muted border text-decoration-line-through"
                            }`}
                          >
                            <Clock size={12} className="me-1" />
                            {slot.startTime} - {slot.endTime}
                            {!slot.isAvailable && slot.isBooked && " (Booked)"}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Personal Message & Goals */}
                  <div className="space-y-3">
                    <div>
                      <label className="small fw-bold mb-1" style={{ color: "var(--text)" }}>
                        Career Objective / Goal
                      </label>
                      <input
                        type="text"
                        value={careerGoal}
                        onChange={(e) => setCareerGoal(e.target.value)}
                        placeholder="e.g. Cracking Frontend Engineer internship at a Tier-1 product company"
                        className="form-control rounded-3"
                        style={{ background: "var(--surface-2)", color: "var(--text)", borderColor: "var(--border)" }}
                      />
                    </div>

                    <div>
                      <label className="small fw-bold mb-1" style={{ color: "var(--text)" }}>
                        Personalized Introduction Note
                      </label>
                      <textarea
                        rows={3}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Briefly introduce your current preparation status and what you'd like guidance on..."
                        className="form-control rounded-3"
                        style={{ background: "var(--surface-2)", color: "var(--text)", borderColor: "var(--border)" }}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-top" style={{ borderColor: "var(--border)" }}>
                  <button type="button" className="btn btn-light rounded-pill px-3" onClick={() => setSelectedMentor(null)}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!selectedSlot || submittingRequest}
                    className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm hover-lift"
                  >
                    {submittingRequest ? "Sending Request..." : "Confirm & Send Request"}
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
