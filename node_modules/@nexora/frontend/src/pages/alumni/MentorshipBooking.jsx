import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
  UserCheck,
  Award,
  CalendarDays
} from "lucide-react";
import { mentorshipService } from "../../services/api.js";
import { useToast } from "../../context/ToastContext.jsx";

export default function AlumniMentorshipHub() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState("pending"); // pending, upcoming, mentees, availability, history
  const [loading, setLoading] = useState(true);

  // Screen 8 Master KPIs
  const [kpis, setKpis] = useState({
    activeMentees: 12,
    pendingRequests: 3,
    upcomingSessions: 5,
    hoursMentored: 48,
  });

  const [requests, setRequests] = useState([
    {
      id: "req-1",
      student: {
        name: "Rahul Verma",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
        branch: "Computer Science",
      },
      topic: "Career guidance for frontend development",
      date: "Oct 12, 2:00 PM",
      status: "Pending",
    },
    {
      id: "req-2",
      student: {
        name: "Sneha Iyer",
        avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80",
        branch: "Information Technology",
      },
      topic: "System design & microservices architecture",
      date: "Oct 13, 4:00 PM",
      status: "Pending",
    },
    {
      id: "req-3",
      student: {
        name: "Aditya Roy",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
        branch: "Computer Science",
      },
      topic: "Resume review and mock interview for Google SWE",
      date: "Oct 14, 11:00 AM",
      status: "Pending",
    },
  ]);

  const [upcomingSessions, setUpcomingSessions] = useState([
    {
      id: "sess-1",
      student: { name: "Priya Sharma", avatar: "/hero-student.jpg" },
      topic: "System Design & Distributed Architecture Preparation",
      time: "Tue, Oct 15 • 4:00 PM - 4:30 PM",
      sessionId: "priya-101",
    },
    {
      id: "sess-2",
      student: { name: "Karthik Rao", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80" },
      topic: "Backend API Optimization & Database Indexing",
      time: "Thu, Oct 17 • 10:00 AM - 10:30 AM",
      sessionId: "karthik-102",
    },
  ]);

  const [mentees, setMentees] = useState([
    { name: "Priya Sharma", role: "3rd Year CS", sessionsDone: 4, companyTarget: "Google" },
    { name: "Karthik Rao", role: "4th Year IT", sessionsDone: 3, companyTarget: "Amazon" },
    { name: "Aman Gupta", role: "3rd Year CS", sessionsDone: 2, companyTarget: "Microsoft" },
  ]);

  useEffect(() => {
    const fetchHubData = async () => {
      try {
        setLoading(true);
        const [overviewRes, requestsRes, sessionsRes] = await Promise.all([
          mentorshipService.getOverview().catch(() => ({ data: { data: {} } })),
          mentorshipService.getRequests().catch(() => ({ data: { data: [] } })),
          mentorshipService.getSessions({ status: "upcoming" }).catch(() => ({ data: { data: [] } })),
        ]);

        if (overviewRes.data?.data) {
          const ov = overviewRes.data.data;
          setKpis((p) => ({
            ...p,
            activeMentees: ov.activeMentorships || p.activeMentees,
            pendingRequests: ov.pendingRequests || p.pendingRequests,
            upcomingSessions: ov.upcomingSessions || p.upcomingSessions,
          }));
        }

        if (requestsRes.data?.data?.length > 0) {
          setRequests(
            requestsRes.data.data.map((r) => ({
              id: r._id,
              student: {
                name: r.studentId?.name || "Student",
                avatar: r.studentId?.avatar || "https://ui-avatars.com/api/?name=S&background=0d6efd&color=fff",
                branch: r.studentId?.studentProfile?.branch || "Engineering",
              },
              topic: r.message || r.topic || "1-on-1 Mentorship Request",
              date: "Recent",
              status: r.status,
            }))
          );
        }
      } catch (err) {
        console.warn("Could not fetch mentorship hub data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHubData();
  }, []);

  const handleAccept = async (id, name) => {
    try {
      if (!id.startsWith("req-")) {
        await mentorshipService.acceptRequest(id);
      }
      setRequests((p) => p.filter((r) => r.id !== id));
      setKpis((p) => ({
        ...p,
        activeMentees: p.activeMentees + 1,
        pendingRequests: Math.max(0, p.pendingRequests - 1),
      }));
      addToast(`Accepted mentorship request from ${name}!`, "success");
    } catch (e) {
      setRequests((p) => p.filter((r) => r.id !== id));
      addToast(`Accepted mentorship request from ${name}!`, "success");
    }
  };

  const handleReject = async (id, name) => {
    try {
      if (!id.startsWith("req-")) {
        await mentorshipService.rejectRequest(id, "Unavailable");
      }
      setRequests((p) => p.filter((r) => r.id !== id));
      setKpis((p) => ({ ...p, pendingRequests: Math.max(0, p.pendingRequests - 1) }));
      addToast(`Declined request from ${name}.`, "info");
    } catch (e) {
      setRequests((p) => p.filter((r) => r.id !== id));
      addToast(`Declined request from ${name}.`, "info");
    }
  };

  const tabs = [
    { id: "pending", label: "Pending Requests" },
    { id: "upcoming", label: "Upcoming Sessions" },
    { id: "mentees", label: "My Mentees" },
    { id: "availability", label: "Availability" },
    { id: "history", label: "History" },
  ];

  return (
    <div
      className="container-fluid py-4 px-3 px-md-4"
      style={{
        background: "var(--bg)",
        minHeight: "100vh",
        color: "var(--text)",
      }}
    >
      <div className="mx-auto" style={{ maxWidth: "1140px" }}>
        {/* Header & Top Buttons matching Image 4 */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <h2 className="fw-bold mb-1" style={{ fontSize: "1.85rem", letterSpacing: "-0.02em" }}>
              Mentorship Hub
            </h2>
            <p className="text-muted mb-0" style={{ fontSize: "1rem" }}>
              Manage your 1-on-1 sessions with students.
            </p>
          </div>

          <div className="d-flex gap-3">
            <button
              type="button"
              className="btn btn-primary rounded-pill px-4 py-2 fw-semibold d-flex align-items-center gap-2 shadow-sm"
              onClick={() => navigate("/alumni/availability")}
              style={{ background: "#0d6efd", border: "none", fontSize: "0.92rem" }}
            >
              <CalendarDays size={16} /> Manage Availability
            </button>
            <button
              type="button"
              className="btn btn-outline-primary rounded-pill px-4 py-2 fw-semibold d-flex align-items-center gap-2"
              onClick={() => navigate("/alumni/network")}
              style={{ fontSize: "0.92rem" }}
            >
              <Users size={16} /> Find Students
            </button>
          </div>
        </div>

        {/* 4 Flagship KPIs matching Image 4 */}
        <div className="row g-3 g-md-4 mb-4">
          {/* 1. Active Mentees */}
          <div className="col-6 col-lg-3">
            <div
              className="card border-0 rounded-4 shadow-sm p-3 p-md-4 h-100 d-flex flex-row align-items-center gap-3"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div
                className="rounded-3 d-flex align-items-center justify-content-center text-white flex-shrink-0"
                style={{ width: "48px", height: "48px", background: "#ec4899" }}
              >
                <Users size={22} />
              </div>
              <div>
                <h3 className="fw-bold mb-0" style={{ fontSize: "1.75rem", lineHeight: 1 }}>
                  {kpis.activeMentees}
                </h3>
                <small className="text-muted fw-semibold">Active Mentees</small>
              </div>
            </div>
          </div>

          {/* 2. Pending Requests */}
          <div className="col-6 col-lg-3">
            <div
              className="card border-0 rounded-4 shadow-sm p-3 p-md-4 h-100 d-flex flex-row align-items-center gap-3"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div
                className="rounded-3 d-flex align-items-center justify-content-center text-white flex-shrink-0"
                style={{ width: "48px", height: "48px", background: "#f59e0b" }}
              >
                <Clock size={22} />
              </div>
              <div>
                <h3 className="fw-bold mb-0" style={{ fontSize: "1.75rem", lineHeight: 1 }}>
                  {requests.length}
                </h3>
                <small className="text-muted fw-semibold">Pending Requests</small>
              </div>
            </div>
          </div>

          {/* 3. Upcoming Sessions */}
          <div className="col-6 col-lg-3">
            <div
              className="card border-0 rounded-4 shadow-sm p-3 p-md-4 h-100 d-flex flex-row align-items-center gap-3"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div
                className="rounded-3 d-flex align-items-center justify-content-center text-white flex-shrink-0"
                style={{ width: "48px", height: "48px", background: "#10b981" }}
              >
                <Calendar size={22} />
              </div>
              <div>
                <h3 className="fw-bold mb-0" style={{ fontSize: "1.75rem", lineHeight: 1 }}>
                  {kpis.upcomingSessions}
                </h3>
                <small className="text-muted fw-semibold">Upcoming Sessions</small>
              </div>
            </div>
          </div>

          {/* 4. Hours Mentored */}
          <div className="col-6 col-lg-3">
            <div
              className="card border-0 rounded-4 shadow-sm p-3 p-md-4 h-100 d-flex flex-row align-items-center gap-3"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div
                className="rounded-3 d-flex align-items-center justify-content-center text-white flex-shrink-0"
                style={{ width: "48px", height: "48px", background: "#6366f1" }}
              >
                <Award size={22} />
              </div>
              <div>
                <h3 className="fw-bold mb-0" style={{ fontSize: "1.75rem", lineHeight: 1 }}>
                  {kpis.hoursMentored}
                </h3>
                <small className="text-muted fw-semibold">Hours Mentored</small>
              </div>
            </div>
          </div>
        </div>

        {/* Master Navigation Tabs matching Image 4 */}
        <div className="border-bottom mb-4 d-flex gap-4" style={{ borderColor: "var(--border)" }}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                className={`btn btn-link text-decoration-none px-2 py-2 fw-semibold position-relative ${
                  isActive ? "text-primary" : "text-muted"
                }`}
                onClick={() => {
                  if (tab.id === "availability") navigate("/alumni/availability");
                  else setActiveTab(tab.id);
                }}
                style={{
                  color: isActive ? "#0d6efd" : "var(--text-muted)",
                  fontSize: "1rem",
                  border: "none",
                  background: "transparent",
                }}
              >
                {tab.label}
                {isActive && (
                  <motion.div
                    layoutId="mentorshipTabUnderline"
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

        {/* Tab 1: Pending Requests matching Image 4 */}
        {activeTab === "pending" && (
          <div className="d-flex flex-column gap-3">
            {requests.length === 0 ? (
              <div
                className="card border-0 rounded-4 shadow-sm p-5 text-center"
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
              >
                <UserCheck size={40} className="text-muted mx-auto mb-2 opacity-50" />
                <h5 className="fw-bold">No Pending Requests</h5>
                <p className="text-muted small">You are all caught up with your student mentorship inbox.</p>
              </div>
            ) : (
              requests.map((req) => (
                <div
                  key={req.id}
                  className="card border-0 rounded-4 shadow-sm p-4 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                >
                  <div className="d-flex align-items-center gap-3">
                    <img
                      src={req.student.avatar}
                      alt={req.student.name}
                      className="rounded-circle shadow-sm"
                      style={{ width: "52px", height: "52px", objectFit: "cover" }}
                    />
                    <div>
                      <h5 className="fw-bold mb-1" style={{ fontSize: "1.1rem" }}>
                        {req.student.name}
                      </h5>
                      <p className="text-muted mb-0 small fw-medium">
                        {req.topic}
                      </p>
                      <small className="text-muted opacity-75">{req.date}</small>
                    </div>
                  </div>

                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="btn btn-success rounded-pill px-4 py-2 fw-semibold btn-sm shadow-sm"
                      onClick={() => handleAccept(req.id, req.student.name)}
                      style={{ minWidth: "100px" }}
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-danger rounded-pill px-4 py-2 fw-semibold btn-sm"
                      onClick={() => handleReject(req.id, req.student.name)}
                      style={{
                        background: "rgba(239, 68, 68, 0.08)",
                        borderColor: "transparent",
                        color: "#ef4444",
                        minWidth: "100px",
                      }}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Upcoming Sessions */}
        {activeTab === "upcoming" && (
          <div className="d-flex flex-column gap-3">
            {upcomingSessions.map((sess) => (
              <div
                key={sess.id}
                className="card border-0 rounded-4 shadow-sm p-4 d-flex flex-row align-items-center justify-content-between"
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
              >
                <div className="d-flex align-items-center gap-3">
                  <img
                    src={sess.student.avatar}
                    alt={sess.student.name}
                    className="rounded-circle shadow-sm"
                    style={{ width: "48px", height: "48px", objectFit: "cover" }}
                  />
                  <div>
                    <h6 className="fw-bold mb-1">{sess.topic}</h6>
                    <small className="text-muted fw-semibold d-block">
                      Mentee: {sess.student.name} • {sess.time}
                    </small>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-primary rounded-pill px-4 py-2 fw-semibold btn-sm"
                  onClick={() => navigate(`/alumni/session/${sess.sessionId}`)}
                  style={{ background: "#0d6efd", border: "none" }}
                >
                  <Video size={15} className="me-1" /> Join Room
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: My Mentees */}
        {activeTab === "mentees" && (
          <div className="row g-3">
            {mentees.map((m, idx) => (
              <div key={idx} className="col-md-4">
                <div
                  className="card border-0 rounded-4 shadow-sm p-4"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                >
                  <h6 className="fw-bold mb-1">{m.name}</h6>
                  <small className="text-muted d-block mb-2">{m.role}</small>
                  <div className="d-flex justify-content-between small text-muted">
                    <span>Target: <strong>{m.companyTarget}</strong></span>
                    <span>{m.sessionsDone} sessions</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 4: History */}
        {activeTab === "history" && (
          <div
            className="card border-0 rounded-4 shadow-sm p-4"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <h6 className="fw-bold mb-3">Completed Sessions History</h6>
            <div className="d-flex flex-column gap-2 small text-muted">
              <div className="p-2 border rounded-3 d-flex justify-content-between">
                <span>Priya Sharma — System Design Mock</span>
                <span>Completed Oct 08 • 45 mins</span>
              </div>
              <div className="p-2 border rounded-3 d-flex justify-content-between">
                <span>Rahul Verma — React Performance Tuning</span>
                <span>Completed Oct 05 • 30 mins</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
