import React, { useState, useEffect } from "react";
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
  UserCheck
} from "lucide-react";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import { alumniService, mentorshipService } from "../../services/api";
import { getAvatarUrl, handleImageError } from "../../utils/avatar";

export default function AlumniDashboard() {
  const { addToast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Screen 7 Master KPIs
  const [kpis, setKpis] = useState({
    mentees: 12,
    pendingRequests: 3,
    upcomingSessions: 5,
    totalSessions: 48,
  });

  const [recentRequests, setRecentRequests] = useState([
    {
      id: "req-1",
      name: "Rahul Verma",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      topic: "Career guidance for frontend development",
      date: "Today, 11:30 AM",
    },
    {
      id: "req-2",
      name: "Sneha Iyer",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80",
      topic: "System design & microservices architecture",
      date: "Yesterday",
    },
    {
      id: "req-3",
      name: "Aditya Roy",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
      topic: "Resume review and mock interview for Google SWE",
      date: "Oct 10",
    },
  ]);

  const [selectedDay, setSelectedDay] = useState(12);

  const daysOfWeek = [
    { day: "Sun", date: 10 },
    { day: "Mon", date: 11 },
    { day: "Tue", date: 12, active: true },
    { day: "Wed", date: 13 },
    { day: "Thu", date: 14 },
    { day: "Fri", date: 15 },
    { day: "Sat", date: 16 },
  ];

  const upcomingSessions = [
    {
      id: "sess-1",
      studentName: "Priya Sharma",
      title: "Mentorship with Priya",
      time: "02:00 PM - 03:00 PM",
      status: "Upcoming",
      color: "#0d6efd",
      sessionId: "sess-priya-01",
    },
    {
      id: "sess-2",
      studentName: "Karthik Rao",
      title: "Career Discussion with Karthik",
      time: "04:00 PM - 05:00 PM",
      status: "Confirmed",
      color: "#f59e0b",
      sessionId: "sess-karthik-02",
    },
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const res = await alumniService.getStats();
        if (res.data) {
          setStats(res.data);
          if (res.data.kpis) {
            setKpis((prev) => ({
              ...prev,
              mentees: res.data.kpis.connections || 12,
              pendingRequests: res.data.kpis.studentRequests || 3,
            }));
          }
          if (res.data.pendingRequests?.length > 0) {
            setRecentRequests(
              res.data.pendingRequests.map((r) => ({
                id: r._id,
                name: r.studentId?.name || "Student",
                avatar: r.studentId?.avatar || "https://ui-avatars.com/api/?name=S&background=0d6efd&color=fff",
                topic: r.message || "Mentorship request",
                date: "Recent",
              }))
            );
          }
        }
      } catch (err) {
        console.warn("Could not fetch real alumni stats, using Master preview defaults", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const handleAccept = async (id, name) => {
    try {
      if (!id.startsWith("req-")) {
        await alumniService.updateConnectionRequest(id, "Accepted");
      }
      setRecentRequests((prev) => prev.filter((r) => r.id !== id));
      setKpis((p) => ({
        ...p,
        mentees: p.mentees + 1,
        pendingRequests: Math.max(0, p.pendingRequests - 1),
      }));
      addToast(`Accepted mentorship request from ${name}! 🤝`, "success");
    } catch (e) {
      setRecentRequests((prev) => prev.filter((r) => r.id !== id));
      addToast(`Accepted mentorship request from ${name}!`, "success");
    }
  };

  const handleReject = async (id, name) => {
    try {
      if (!id.startsWith("req-")) {
        await alumniService.updateConnectionRequest(id, "Rejected");
      }
      setRecentRequests((prev) => prev.filter((r) => r.id !== id));
      setKpis((p) => ({ ...p, pendingRequests: Math.max(0, p.pendingRequests - 1) }));
      addToast(`Declined request from ${name}.`, "info");
    } catch (e) {
      setRecentRequests((prev) => prev.filter((r) => r.id !== id));
      addToast(`Declined request from ${name}.`, "info");
    }
  };

  const displayName = user?.name || "Arjun";

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
        {/* Master Screen 7 Header matching Image 3 */}
        <div className="mb-4">
          <h2 className="fw-bold mb-1" style={{ fontSize: "1.85rem", letterSpacing: "-0.02em" }}>
            Welcome back, {displayName} 👋
          </h2>
          <p className="text-muted mb-0" style={{ fontSize: "1rem" }}>
            Make an impact by mentoring the next generation.
          </p>
        </div>

        {/* 4 Flagship KPI Cards matching Image 3 */}
        <div className="row g-3 g-md-4 mb-4">
          {/* 1. Mentees */}
          <div className="col-6 col-lg-3">
            <div
              className="card border-0 rounded-4 shadow-sm p-3 p-md-4 h-100 d-flex flex-row align-items-center gap-3"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div
                className="rounded-3 d-flex align-items-center justify-content-center text-white flex-shrink-0"
                style={{ width: "48px", height: "48px", background: "#10b981" }}
              >
                <Users size={22} />
              </div>
              <div>
                <h3 className="fw-bold mb-0" style={{ fontSize: "1.75rem", lineHeight: 1 }}>
                  {kpis.mentees}
                </h3>
                <small className="text-muted fw-semibold">Mentees</small>
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
                style={{ width: "48px", height: "48px", background: "#0d6efd" }}
              >
                <Clock size={22} />
              </div>
              <div>
                <h3 className="fw-bold mb-0" style={{ fontSize: "1.75rem", lineHeight: 1 }}>
                  {recentRequests.length}
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
                style={{ width: "48px", height: "48px", background: "#6366f1" }}
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

          {/* 4. Total Sessions */}
          <div className="col-6 col-lg-3">
            <div
              className="card border-0 rounded-4 shadow-sm p-3 p-md-4 h-100 d-flex flex-row align-items-center gap-3"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div
                className="rounded-3 d-flex align-items-center justify-content-center text-white flex-shrink-0"
                style={{ width: "48px", height: "48px", background: "#06b6d4" }}
              >
                <CheckCircle2 size={22} />
              </div>
              <div>
                <h3 className="fw-bold mb-0" style={{ fontSize: "1.75rem", lineHeight: 1 }}>
                  {kpis.totalSessions}
                </h3>
                <small className="text-muted fw-semibold">Total Sessions</small>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Split: Recent Requests (Left) + Upcoming Sessions Calendar (Right) */}
        <div className="row g-4">
          {/* Left Column: Recent Requests matching Image 3 */}
          <div className="col-12 col-lg-6">
            <div
              className="card border-0 rounded-4 shadow-sm p-4 h-100"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold mb-0" style={{ fontSize: "1.15rem" }}>
                  Recent Requests
                </h5>
                <span className="badge bg-primary-subtle text-primary rounded-pill px-3 py-1 fw-bold">
                  {recentRequests.length} Pending
                </span>
              </div>

              {recentRequests.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <UserCheck size={36} className="mb-2 opacity-50" />
                  <p className="small mb-0">No pending student mentorship requests.</p>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {recentRequests.map((req) => (
                    <div
                      key={req.id}
                      className="p-3 rounded-4 border d-flex flex-column gap-3"
                      style={{ borderColor: "var(--border)" }}
                    >
                      <div className="d-flex align-items-center gap-3">
                        <img
                          src={req.avatar}
                          alt={req.name}
                          className="rounded-circle shadow-sm"
                          style={{ width: "46px", height: "46px", objectFit: "cover" }}
                          onError={(e) => {
                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${req.name[0]}&background=0d6efd&color=fff`;
                          }}
                        />
                        <div className="flex-grow-1">
                          <h6 className="fw-bold mb-0" style={{ color: "var(--text)" }}>
                            {req.name}
                          </h6>
                          <small className="text-muted fw-medium d-block">
                            {req.topic}
                          </small>
                        </div>
                      </div>

                      {/* Accept & Reject Buttons matching Image 3 */}
                      <div className="d-flex gap-2">
                        <button
                          type="button"
                          className="btn btn-success rounded-pill px-4 py-1 fw-semibold btn-sm shadow-sm"
                          onClick={() => handleAccept(req.id, req.name)}
                          style={{ minWidth: "90px" }}
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-danger rounded-pill px-4 py-1 fw-semibold btn-sm"
                          onClick={() => handleReject(req.id, req.name)}
                          style={{
                            background: "rgba(239, 68, 68, 0.08)",
                            borderColor: "transparent",
                            color: "#ef4444",
                            minWidth: "90px",
                          }}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Upcoming Sessions & Mini Calendar matching Image 3 */}
          <div className="col-12 col-lg-6">
            <div
              className="card border-0 rounded-4 shadow-sm p-4 h-100"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0" style={{ fontSize: "1.15rem" }}>
                  Upcoming Sessions
                </h5>
                <Link
                  to="/alumni/mentorship"
                  className="btn btn-link text-primary p-0 fw-semibold text-decoration-none small"
                >
                  View All &rarr;
                </Link>
              </div>

              {/* 7-Day Mini Calendar Selector matching Image 3 */}
              <div className="d-flex justify-content-between p-2 rounded-4 mb-4" style={{ background: "rgba(0,0,0,0.03)" }}>
                {daysOfWeek.map((d) => {
                  const isSelected = selectedDay === d.date;
                  return (
                    <button
                      key={d.date}
                      type="button"
                      onClick={() => setSelectedDay(d.date)}
                      className={`btn d-flex flex-column align-items-center justify-content-center p-2 rounded-3 border-0 ${
                        isSelected ? "shadow-sm text-white" : "text-muted"
                      }`}
                      style={{
                        background: isSelected ? "#0d6efd" : "transparent",
                        minWidth: "44px",
                      }}
                    >
                      <small style={{ fontSize: "0.7rem", fontWeight: "600" }}>{d.day}</small>
                      <span className="fw-bold" style={{ fontSize: "1rem" }}>{d.date}</span>
                    </button>
                  );
                })}
              </div>

              {/* Scheduled Session Cards matching Image 3 */}
              <div className="d-flex flex-column gap-3">
                {upcomingSessions.map((sess) => (
                  <div
                    key={sess.id}
                    className="p-3 rounded-4 border d-flex align-items-center justify-content-between"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <div
                        className="rounded-3 d-flex align-items-center justify-content-center text-white"
                        style={{ width: "42px", height: "42px", background: sess.color }}
                      >
                        <Video size={18} />
                      </div>
                      <div>
                        <h6 className="fw-bold mb-0" style={{ color: "var(--text)" }}>
                          {sess.title}
                        </h6>
                        <small className="text-muted fw-semibold">
                          {sess.time}
                        </small>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn btn-primary rounded-pill px-3 py-1 fw-semibold btn-sm"
                      onClick={() => navigate(`/alumni/session/${sess.sessionId}`)}
                      style={{ background: "#0d6efd", border: "none", fontSize: "0.85rem" }}
                    >
                      Join
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
