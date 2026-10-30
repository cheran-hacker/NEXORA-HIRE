import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
  Briefcase,
  GraduationCap,
  ChevronDown,
  Building2,
  Send,
  MessageSquare,
  Award
} from "lucide-react";
import { mentorshipService } from "../../services/api.js";
import { useToast } from "../../context/ToastContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

const DOMAIN_PILLS = [
  "All",
  "Technology",
  "Data Science",
  "Product",
  "Design",
  "Management",
];

const DEFAULT_MENTORS = [
  {
    _id: "mentor-arjun-01",
    name: "Arjun Mehta",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    role: "Senior Software Engineer",
    company: "Google",
    matchScore: 87,
    domain: "Technology",
    education: "VIT Chennai • 2018",
    experienceYears: "5+ years experience",
    skills: ["Expert Mentorship", "Cloud", "System Design"],
    allSkills: ["Cloud", "System Design", "Distributed Systems", "Go", "Kubernetes", "React"],
    nextAvailable: "Oct 15, 4:00 PM",
    bio: "Senior Software Engineer at Google with deep experience in distributed systems, high throughput microservices, and large-scale cloud infrastructure. Passionate about helping passionate engineering students navigate system design, coding rounds, and career decisions.",
    availableSlots: [
      { id: "s1", date: "Tue, Oct 15", time: "4:00 PM - 4:30 PM" },
      { id: "s2", date: "Thu, Oct 17", time: "10:00 AM - 10:30 AM" },
      { id: "s3", date: "Fri, Oct 18", time: "4:00 PM - 4:30 PM" },
    ],
  },
  {
    _id: "mentor-neha-02",
    name: "Neha Kapoor",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
    role: "Product Manager",
    company: "Microsoft",
    matchScore: 78,
    domain: "Product",
    education: "IIT Madras • 2019",
    experienceYears: "4+ years experience",
    skills: ["Product Management", "Strategy", "Leadership"],
    allSkills: ["Product Strategy", "User Research", "Agile", "Roadmapping", "A/B Testing"],
    nextAvailable: "Oct 16, 11:00 AM",
    bio: "Product Manager at Microsoft Teams specializing in developer platform strategy and collaboration tooling. Experienced in transitioning from engineering to product leadership.",
    availableSlots: [
      { id: "sn1", date: "Wed, Oct 16", time: "11:00 AM - 11:30 AM" },
      { id: "sn2", date: "Fri, Oct 18", time: "03:00 PM - 03:30 PM" },
    ],
  },
  {
    _id: "mentor-karthik-03",
    name: "Karthik Rao",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    role: "Staff AI Engineer",
    company: "Amazon",
    matchScore: 82,
    domain: "Data Science",
    education: "BITS Pilani • 2017",
    experienceYears: "6+ years experience",
    skills: ["LLMs", "PyTorch", "Algorithms"],
    allSkills: ["PyTorch", "Deep Learning", "Generative AI", "NLP", "Python", "MLOps"],
    nextAvailable: "Oct 17, 2:00 PM",
    bio: "Staff AI Engineer at Amazon AWS AI Labs working on foundation model evaluation and inference optimization. Eager to mentor students on machine learning research.",
    availableSlots: [
      { id: "sk1", date: "Thu, Oct 17", time: "02:00 PM - 02:30 PM" },
      { id: "sk2", date: "Sat, Oct 19", time: "11:00 AM - 11:30 AM" },
    ],
  },
];

export default function StudentMentorshipHub() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeDomain, setActiveDomain] = useState("All");
  const [showFilters, setShowFilters] = useState(true);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);

  const [hubTab, setHubTab] = useState("explore"); // 'explore' | 'my-sessions'
  const [mySessions, setMySessions] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loadingMyMentorship, setLoadingMyMentorship] = useState(false);

  // Screen 11: Active Mentor Profile View State
  const [viewingMentor, setViewingMentor] = useState(null);
  const [activeProfileTab, setActiveProfileTab] = useState("about");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [requestMessage, setRequestMessage] = useState("");
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const fetchMyMentorship = async () => {
    try {
      setLoadingMyMentorship(true);
      const [sessRes, reqRes] = await Promise.all([
        mentorshipService.getSessions().catch(() => ({ data: { data: [] } })),
        mentorshipService.getMyRequests().catch(() => ({ data: { data: [] } }))
      ]);
      setMySessions(sessRes.data?.data || []);
      setMyRequests(reqRes.data?.data || []);
    } catch (e) {
      console.warn("Could not load my mentorship data:", e);
    } finally {
      setLoadingMyMentorship(false);
    }
  };

  useEffect(() => {
    fetchMyMentorship();
  }, []);

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        setLoading(true);
        const res = await mentorshipService.getRecommended();
        const apiMentors = res.data?.data || [];

        const normalized = apiMentors.map((m) => ({
          _id: m._id,
          name: m.name || m.user?.name || "Alumni Mentor",
          avatar: m.avatar || m.user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
          role: m.alumniProfile?.role || m.role || "Software Engineer",
          company: m.alumniProfile?.company || m.company || "Google",
          matchScore: m.matchScore || 85,
          domain: "Technology",
          education: `${m.alumniProfile?.college || "VIT Chennai"} • ${m.alumniProfile?.graduationYear || "2019"}`,
          experienceYears: "5+ years experience",
          skills: m.alumniProfile?.skills?.slice(0, 3) || ["Expert Mentorship", "Cloud", "System Design"],
          allSkills: m.alumniProfile?.skills || ["Cloud", "System Design", "Go", "Docker", "React"],
          nextAvailable: "Upcoming Slots Available",
          bio: m.alumniProfile?.bio || "Experienced alumni mentor ready to assist students with tech careers.",
          availableSlots: [
            { id: "s1", date: "Upcoming Window", time: "18:00 - 18:30" }
          ],
        }));

        const combined = [...normalized];
        DEFAULT_MENTORS.forEach((dm) => {
          if (!combined.some((c) => c.name.toLowerCase() === dm.name.toLowerCase())) {
            combined.push(dm);
          }
        });

        setMentors(combined);
      } catch (err) {
        setMentors(DEFAULT_MENTORS);
      } finally {
        setLoading(false);
      }
    };

    fetchMentors();
  }, []);

  const filteredMentors = mentors.filter((m) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      m.name.toLowerCase().includes(q) ||
      m.company.toLowerCase().includes(q) ||
      m.role.toLowerCase().includes(q) ||
      m.skills.some((s) => s.toLowerCase().includes(q));

    const matchesDomain =
      activeDomain === "All" ||
      m.domain?.toLowerCase() === activeDomain.toLowerCase();

    return matchesSearch && matchesDomain;
  });

  const handleOpenMentorProfile = async (mentor) => {
    setViewingMentor(mentor);
    setSelectedSlot(null);
    setActiveProfileTab("about");

    // Dynamically fetch live available slots from backend
    if (mentor._id && !mentor._id.startsWith("mentor-")) {
      setLoadingSlots(true);
      try {
        const res = await mentorshipService.getAvailability(mentor._id);
        if (res.data?.success && res.data.data) {
          const { upcomingSlots, slots, sessionDuration } = res.data.data;
          const liveSlots = (upcomingSlots && upcomingSlots.length > 0) ? upcomingSlots : (slots || []);
          if (liveSlots && liveSlots.length > 0) {
            const mappedSlots = liveSlots.map((s) => ({
              id: s.id || `${s.date}_${s.startTime}`,
              date: s.dateFormatted || s.date,
              rawDate: s.date,
              time: s.time || `${s.startTime} - ${s.endTime}`,
              startTime: s.startTime,
              endTime: s.endTime,
              duration: s.durationMinutes || sessionDuration || 30,
            }));
            setViewingMentor((prev) => ({
              ...prev,
              availableSlots: mappedSlots,
            }));
            setSelectedSlot(mappedSlots[0]);
          }
        }
      } catch (err) {
        console.warn("Could not load real-time availability slots:", err);
      } finally {
        setLoadingSlots(false);
      }
    }
  };

  const handleSendMentorshipRequest = async () => {
    if (!viewingMentor) return;
    setSubmittingRequest(true);
    try {
      if (!viewingMentor._id.startsWith("mentor-")) {
        const payload = {
          alumniId: viewingMentor._id,
          mentorId: viewingMentor._id,
          topic: requestMessage.trim() || "1-on-1 Career Mentorship & Technical Guidance",
          message: requestMessage.trim() || `Hi ${viewingMentor.name}, I would love 1-on-1 guidance on career paths and interview preparation.`,
          requestedDate: selectedSlot?.rawDate || selectedSlot?.date || new Date().toISOString().split("T")[0],
          requestedStartTime: selectedSlot?.startTime || "18:00",
          requestedEndTime: selectedSlot?.endTime || "18:30",
          durationMinutes: selectedSlot?.duration || 30,
          preferredDate: selectedSlot?.date,
          preferredSlot: selectedSlot?.time,
        };

        const res = await mentorshipService.requestMentorship(payload);
        if (!res.data?.success) {
          throw new Error(res.data?.message || "Failed to submit request");
        }
      }
      addToast(`Mentorship request successfully sent to ${viewingMentor.name}! 🚀`, "success");
      setShowBookingModal(false);
      setRequestMessage("");
      // Refresh my requests and sessions
      await fetchMyMentorship();
      setHubTab("my-sessions");
      setViewingMentor(null);
    } catch (err) {
      console.error("Booking error:", err);
      const msg = err.response?.data?.message || err.message || "Failed to submit request.";
      addToast(msg, "error");
    } finally {
      setSubmittingRequest(false);
    }
  };

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
        {/* If viewing a single mentor profile (Screen 11: Mentor Profile View) */}
        {viewingMentor ? (
          <div>
            {/* Back Button */}
            <button
              type="button"
              className="btn btn-link text-muted p-0 mb-4 fw-semibold d-flex align-items-center gap-1 text-decoration-none"
              onClick={() => setViewingMentor(null)}
            >
              &larr; Back to Mentor Discovery
            </button>

            {/* Master Screen 11 Header Card matching Image 4 */}
            <div
              className="card border-0 rounded-4 shadow-sm p-4 p-md-5 mb-4"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start gap-4 mb-4">
                <div className="d-flex align-items-center gap-4">
                  <img
                    src={viewingMentor.avatar}
                    alt={viewingMentor.name}
                    className="rounded-circle shadow-sm"
                    style={{ width: "96px", height: "96px", objectFit: "cover" }}
                  />
                  <div>
                    <h3 className="fw-bold mb-1" style={{ fontSize: "1.75rem" }}>
                      {viewingMentor.name}
                    </h3>
                    <div className="text-muted fw-semibold mb-1" style={{ fontSize: "1rem" }}>
                      {viewingMentor.role} at {viewingMentor.company}
                    </div>
                    <div className="text-muted small fw-medium">
                      {viewingMentor.education} • {viewingMentor.experienceYears}
                    </div>
                  </div>
                </div>

                <div className="d-flex gap-3 align-items-center">
                  <button
                    type="button"
                    className="btn btn-primary rounded-pill px-4 py-2 fw-semibold shadow-sm"
                    onClick={() => setShowBookingModal(true)}
                    style={{ background: "#0d6efd", border: "none", fontSize: "0.95rem" }}
                  >
                    Request Mentorship
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-primary rounded-pill px-4 py-2 fw-semibold"
                    onClick={() => addToast(`Connected with ${viewingMentor.name}!`, "success")}
                    style={{ fontSize: "0.95rem" }}
                  >
                    Connect
                  </button>
                </div>
              </div>

              {/* Master Screen 11 Tabs matching Image 4 */}
              <div className="border-bottom d-flex gap-4 mb-4" style={{ borderColor: "var(--border)" }}>
                {["about", "experience", "skills", "mentoring topics", "availability", "reviews"].map((t) => {
                  const isActive = activeProfileTab === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      className={`btn btn-link text-decoration-none px-2 py-2 fw-semibold text-capitalize ${
                        isActive ? "text-primary" : "text-muted"
                      }`}
                      onClick={() => setActiveProfileTab(t)}
                      style={{
                        color: isActive ? "#0d6efd" : "var(--text-muted)",
                        fontSize: "0.95rem",
                        border: "none",
                        background: "transparent",
                      }}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>

              {/* Content Grid matching Screen 11 */}
              <div className="row g-4">
                {/* Left Column: About & Skills */}
                <div className="col-12 col-lg-7">
                  <div className="mb-4">
                    <h5 className="fw-bold mb-2">About</h5>
                    <p className="text-muted" style={{ lineHeight: "1.7", fontSize: "0.95rem" }}>
                      {viewingMentor.bio}
                    </p>
                  </div>

                  <div>
                    <h5 className="fw-bold mb-3">Skills</h5>
                    <div className="d-flex flex-wrap gap-2">
                      {viewingMentor.allSkills.map((sk) => (
                        <span
                          key={sk}
                          className="badge rounded-pill px-3 py-2 fw-semibold"
                          style={{
                            background: "rgba(13, 110, 253, 0.08)",
                            color: "#0d6efd",
                            border: "1px solid rgba(13, 110, 253, 0.2)",
                            fontSize: "0.85rem",
                          }}
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column: Next Available Slots matching Screen 11 */}
                <div className="col-12 col-lg-5">
                  <div
                    className="p-4 rounded-4 border"
                    style={{ borderColor: "var(--border)", background: "rgba(0,0,0,0.02)" }}
                  >
                    <h6 className="fw-bold mb-1">Availability</h6>
                    <small className="text-muted fw-semibold d-block mb-3">
                      Next Available Slots
                    </small>

                    <div className="d-flex flex-column gap-2 mb-4">
                      {loadingSlots ? (
                        <div className="text-center py-4 text-muted small">
                          <span className="spinner-border spinner-border-sm text-primary me-2" role="status"></span>
                          Loading real-time availability slots...
                        </div>
                      ) : viewingMentor.availableSlots && viewingMentor.availableSlots.length > 0 ? (
                        viewingMentor.availableSlots.map((slot) => {
                          const isSelected = selectedSlot?.id === slot.id;
                          return (
                            <div
                              key={slot.id}
                              className={`p-3 rounded-3 border d-flex align-items-center justify-content-between cursor-pointer ${
                                isSelected ? "border-primary bg-primary-subtle" : ""
                              }`}
                              style={{ borderColor: isSelected ? "#0d6efd" : "var(--border)" }}
                              onClick={() => setSelectedSlot(slot)}
                            >
                              <div className="d-flex align-items-center gap-2">
                                <span
                                  className="rounded-circle bg-success"
                                  style={{ width: "10px", height: "10px" }}
                                />
                                <span className="fw-bold small">{slot.date}</span>
                              </div>
                              <span className="small text-muted fw-semibold">{slot.time}</span>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-3 rounded-3 text-center text-muted small border">
                          No active slots scheduled by mentor this week.
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      className="btn btn-primary rounded-pill w-100 py-2 fw-bold"
                      onClick={() => setShowBookingModal(true)}
                      style={{ background: "#0d6efd", border: "none" }}
                    >
                      Book 1-on-1 Session
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Mentorship Request Modal */}
            <AnimatePresence>
              {showBookingModal && (
                <div
                  className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
                  style={{
                    background: "rgba(0, 0, 0, 0.5)",
                    zIndex: 9999,
                    backdropFilter: "blur(4px)",
                  }}
                  onClick={() => setShowBookingModal(false)}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="card border-0 rounded-4 shadow-lg p-4 p-md-5"
                    style={{
                      maxWidth: "520px",
                      width: "100%",
                      background: "var(--surface)",
                      color: "var(--text)",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="fw-bold mb-0">Request Mentorship</h5>
                      <button
                        type="button"
                        className="btn btn-link text-muted p-0"
                        onClick={() => setShowBookingModal(false)}
                      >
                        <X size={20} />
                      </button>
                    </div>

                    <div className="p-3 rounded-3 bg-primary-subtle text-primary mb-3 small fw-semibold">
                      Session with {viewingMentor.name} • {selectedSlot?.date || "Selected Day"} ({selectedSlot?.time || "18:00 - 18:30"})
                    </div>

                    <div className="mb-3">
                      <label className="fw-semibold small d-block mb-1">
                        Topic or Discussion Goals
                      </label>
                      <textarea
                        rows={3}
                        className="form-control"
                        placeholder="Tell the mentor what you'd like to focus on (e.g., System design, resume feedback, career guidance)..."
                        value={requestMessage}
                        onChange={(e) => setRequestMessage(e.target.value)}
                      />
                    </div>

                    <div className="d-flex gap-2 justify-content-end mt-4">
                      <button
                        type="button"
                        className="btn btn-outline-secondary rounded-pill px-4 fw-semibold"
                        onClick={() => setShowBookingModal(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={submittingRequest}
                        className="btn btn-primary rounded-pill px-4 fw-bold"
                        onClick={handleSendMentorshipRequest}
                        style={{ background: "#0d6efd", border: "none" }}
                      >
                        {submittingRequest ? "Sending..." : "Confirm Request"}
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div>
            {/* Top Navigation & Tab Bar */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
              <div>
                <h2 className="fw-bold mb-1" style={{ fontSize: "1.85rem", letterSpacing: "-0.02em" }}>
                  1-on-1 Alumni Mentorship Hub
                </h2>
                <p className="text-muted small mb-0">
                  Connect with industry leaders, schedule real-time coaching, and track your active mentorship sessions.
                </p>
              </div>

              <div
                className="d-flex p-1 rounded-pill shadow-sm align-self-start align-self-md-auto"
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
              >
                <button
                  type="button"
                  className={`btn rounded-pill px-4 py-2 fw-semibold small ${
                    hubTab === "explore" ? "btn-primary text-white shadow-sm" : "btn-link text-muted text-decoration-none"
                  }`}
                  onClick={() => setHubTab("explore")}
                  style={hubTab === "explore" ? { background: "#0d6efd", border: "none" } : {}}
                >
                  Find a Mentor
                </button>
                <button
                  type="button"
                  className={`btn rounded-pill px-4 py-2 fw-semibold small d-flex align-items-center gap-2 ${
                    hubTab === "my-sessions" ? "btn-primary text-white shadow-sm" : "btn-link text-muted text-decoration-none"
                  }`}
                  onClick={() => {
                    setHubTab("my-sessions");
                    fetchMyMentorship();
                  }}
                  style={hubTab === "my-sessions" ? { background: "#0d6efd", border: "none" } : {}}
                >
                  My Sessions & Requests
                  {mySessions.length + myRequests.length > 0 && (
                    <span
                      className={`badge rounded-pill fw-bold ${
                        hubTab === "my-sessions" ? "bg-white text-primary" : "bg-primary text-white"
                      }`}
                      style={{ fontSize: "0.75rem" }}
                    >
                      {mySessions.length + myRequests.length}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary rounded-pill px-3 py-2 fw-semibold small d-flex align-items-center gap-1 ms-1"
                  onClick={() => navigate("/student/mentorship-sessions")}
                >
                  <Calendar size={14} /> Sessions Manager →
                </button>
              </div>
            </div>

            {/* TAB 1: EXPLORE MENTORS */}
            {hubTab === "explore" ? (
              <div>
                {/* Search and Filters Bar */}
                <div className="d-flex flex-column flex-md-row gap-3 mb-4">
                  <div
                    className="card border-0 rounded-4 shadow-sm p-2 px-3 d-flex flex-row align-items-center flex-grow-1"
                    style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                  >
                    <Search size={20} className="text-muted me-2" />
                    <input
                      type="text"
                      className="form-control border-0 shadow-none py-2"
                      placeholder="Search by name, skills, role, or company..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        background: "transparent",
                        color: "var(--text)",
                        fontSize: "0.95rem",
                      }}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowFilters(p => !p)}
                    className="btn btn-outline-secondary rounded-4 px-4 py-2 fw-semibold d-flex align-items-center gap-2"
                    style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)" }}
                  >
                    <Filter size={16} /> Filters <ChevronDown size={14} style={{ transform: showFilters ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
                  </button>
                </div>

                {/* Domain Filter Pills */}
                {showFilters && (
                  <div className="d-flex gap-2 flex-wrap mb-4">
                    {DOMAIN_PILLS.map((pill) => {
                      const isActive = activeDomain === pill;
                      return (
                        <button
                          key={pill}
                          type="button"
                          className="btn rounded-pill px-4 py-2 fw-semibold"
                          onClick={() => setActiveDomain(pill)}
                          style={{
                            background: isActive ? "#0d6efd" : "var(--surface)",
                            color: isActive ? "#ffffff" : "var(--text)",
                            border: isActive ? "none" : "1px solid var(--border)",
                            fontSize: "0.9rem",
                          }}
                        >
                          {pill}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Mentor Cards 2-Column Grid */}
                <div className="row g-4">
                  {filteredMentors.map((mentor) => (
                    <div key={mentor._id} className="col-12 col-md-6">
                      <motion.div
                        whileHover={{ y: -3 }}
                        transition={{ duration: 0.2 }}
                        className="card border-0 rounded-4 shadow-sm p-4 cursor-pointer h-100"
                        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                        onClick={() => handleOpenMentorProfile(mentor)}
                      >
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div className="d-flex align-items-center gap-3">
                            <img
                              src={mentor.avatar}
                              alt={mentor.name}
                              className="rounded-circle shadow-sm"
                              style={{ width: "56px", height: "56px", objectFit: "cover" }}
                            />
                            <div>
                              <h5 className="fw-bold mb-1" style={{ fontSize: "1.15rem" }}>
                                {mentor.name}
                              </h5>
                              <div className="text-muted fw-semibold small">
                                {mentor.role}
                              </div>
                              <small className="text-primary fw-bold">
                                {mentor.company}
                              </small>
                            </div>
                          </div>

                          <span
                            className="badge rounded-pill px-3 py-2 fw-bold"
                            style={{
                              background: "rgba(16, 185, 129, 0.12)",
                              color: "#10b981",
                              border: "1px solid rgba(16, 185, 129, 0.25)",
                            }}
                          >
                            {mentor.matchScore}% Match
                          </span>
                        </div>

                        {/* Skills Pills */}
                        <div className="d-flex flex-wrap gap-2 mb-3">
                          {mentor.skills.map((sk) => (
                            <span
                              key={sk}
                              className="badge rounded-pill px-3 py-1 fw-semibold"
                              style={{
                                background: "rgba(13, 110, 253, 0.08)",
                                color: "#0d6efd",
                                fontSize: "0.8rem",
                              }}
                            >
                              {sk}
                            </span>
                          ))}
                        </div>

                        {/* Next Available Date */}
                        <div
                          className="mt-auto pt-2 border-top d-flex justify-content-between align-items-center"
                          style={{ borderColor: "var(--border)" }}
                        >
                          <span className="small text-muted">
                            Next available: <strong>{mentor.nextAvailable}</strong>
                          </span>
                          <button
                            type="button"
                            className="btn btn-link text-primary p-0 small fw-bold text-decoration-none"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenMentorProfile(mentor);
                            }}
                          >
                            View Availability &rarr;
                          </button>
                        </div>
                      </motion.div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* TAB 2: MY SESSIONS & REQUESTS */
              <div>
                {loadingMyMentorship ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                    <p className="text-muted mt-3 small">Loading your mentorship sessions...</p>
                  </div>
                ) : mySessions.length === 0 && myRequests.length === 0 ? (
                  <div
                    className="card border-0 rounded-4 shadow-sm p-5 text-center"
                    style={{ background: "var(--surface)", border: "1px dashed var(--border)" }}
                  >
                    <Calendar size={48} className="text-muted mx-auto mb-3 opacity-50" />
                    <h5 className="fw-bold mb-2">No Mentorship Sessions Yet</h5>
                    <p className="text-muted small mx-auto mb-4" style={{ maxWidth: "440px" }}>
                      You haven't booked any sessions with alumni mentors yet. Explore available mentors and select a convenient time slot to get started!
                    </p>
                    <button
                      type="button"
                      className="btn btn-primary rounded-pill px-4 py-2 fw-semibold mx-auto"
                      onClick={() => setHubTab("explore")}
                      style={{ background: "#0d6efd", border: "none" }}
                    >
                      Find a Mentor Now
                    </button>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-4">
                    {/* CONFIRMED SESSIONS */}
                    {mySessions.length > 0 && (
                      <div>
                        <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                          <CheckCircle2 size={20} className="text-success" />
                          Confirmed 1-on-1 Sessions ({mySessions.length})
                        </h5>
                        <div className="row g-3">
                          {mySessions.map((sess) => {
                            const sessDate = sess.scheduledStart || sess.scheduledDate;
                            const dateFormatted = sessDate ? new Date(sessDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) : "Upcoming";
                            const timeFormatted = sessDate ? new Date(sessDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";
                            const mentorName = sess.mentor?.name || sess.mentorName || "Alumni Mentor";

                            return (
                              <div key={sess._id} className="col-12 col-lg-6">
                                <div
                                  className="card border-0 rounded-4 shadow-sm p-4 h-100 d-flex flex-column justify-content-between"
                                  style={{
                                    background: "var(--surface)",
                                    border: "1px solid rgba(16, 185, 129, 0.3)",
                                  }}
                                >
                                  <div>
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                      <div className="d-flex align-items-center gap-3">
                                        <img
                                          src={sess.mentor?.avatar || sess.mentor?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"}
                                          alt={mentorName}
                                          className="rounded-circle shadow-sm"
                                          style={{ width: "48px", height: "48px", objectFit: "cover" }}
                                        />
                                        <div>
                                          <h6 className="fw-bold mb-0">{mentorName}</h6>
                                          <small className="text-muted fw-semibold">{sess.mentor?.alumniProfile?.company || "Tech Leader"}</small>
                                        </div>
                                      </div>
                                      <span className="badge rounded-pill bg-success-subtle text-success px-3 py-1 fw-bold">
                                        Confirmed
                                      </span>
                                    </div>

                                    <div className="p-3 rounded-3 mb-3" style={{ background: "rgba(0,0,0,0.02)", border: "1px solid var(--border)" }}>
                                      <div className="fw-bold text-primary small mb-1">{sess.topic || "1-on-1 Mentorship"}</div>
                                      <div className="small text-muted d-flex align-items-center gap-2">
                                        <Clock size={14} /> {dateFormatted} at {timeFormatted} ({sess.durationMinutes || 30} mins)
                                      </div>
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    className="btn btn-primary rounded-pill w-100 py-2 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm"
                                    onClick={() => navigate(`/student/session/${sess._id}`)}
                                    style={{ background: "#0d6efd", border: "none" }}
                                  >
                                    <Video size={16} /> Join Virtual Session Room
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* PENDING REQUESTS */}
                    {myRequests.length > 0 && (
                      <div>
                        <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                          <Clock size={20} className="text-warning" />
                          Pending Mentorship Requests ({myRequests.length})
                        </h5>
                        <div className="row g-3">
                          {myRequests.map((req) => {
                            const reqDate = req.requestedDate ? new Date(req.requestedDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) : "Upcoming";
                            const mentorName = req.alumni?.name || "Alumni Mentor";

                            return (
                              <div key={req._id} className="col-12 col-lg-6">
                                <div
                                  className="card border-0 rounded-4 shadow-sm p-4 h-100 d-flex flex-column justify-content-between"
                                  style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                                >
                                  <div>
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                      <div className="d-flex align-items-center gap-3">
                                        <img
                                          src={req.alumni?.avatar || req.alumni?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"}
                                          alt={mentorName}
                                          className="rounded-circle shadow-sm"
                                          style={{ width: "48px", height: "48px", objectFit: "cover" }}
                                        />
                                        <div>
                                          <h6 className="fw-bold mb-0">{mentorName}</h6>
                                          <small className="text-muted fw-semibold">{req.alumni?.alumniProfile?.company || "Alumni Mentor"}</small>
                                        </div>
                                      </div>
                                      <span className={`badge rounded-pill px-3 py-1 fw-bold ${req.status === 'Accepted' ? 'bg-success-subtle text-success' : req.status === 'Rejected' ? 'bg-danger-subtle text-danger' : 'bg-warning-subtle text-warning'}`}>
                                        {req.status === 'Pending' ? 'Awaiting Mentor' : req.status}
                                      </span>
                                    </div>

                                    <div className="p-3 rounded-3 mb-2" style={{ background: "rgba(0,0,0,0.02)", border: "1px solid var(--border)" }}>
                                      <div className="fw-semibold small text-foreground mb-1">
                                        Topic: <strong>{req.topic}</strong>
                                      </div>
                                      <div className="small text-muted d-flex align-items-center gap-2">
                                        <Calendar size={14} /> Requested: {reqDate} ({req.requestedStartTime} - {req.requestedEndTime || 'Slot'})
                                      </div>
                                    </div>

                                    {req.message && (
                                      <p className="text-muted small mb-0 fst-italic">
                                        "{req.message}"
                                      </p>
                                    )}
                                  </div>

                                  <div className="mt-3 pt-2 border-top d-flex justify-content-between align-items-center">
                                    <small className="text-muted">
                                      Submitted: {new Date(req.createdAt).toLocaleDateString()}
                                    </small>
                                    {req.sessionId && (
                                      <button
                                        type="button"
                                        className="btn btn-sm btn-outline-primary rounded-pill px-3"
                                        onClick={() => navigate(`/student/session/${req.sessionId}`)}
                                      >
                                        View Session &rarr;
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
