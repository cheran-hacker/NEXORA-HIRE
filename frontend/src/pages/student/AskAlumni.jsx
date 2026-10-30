import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MapPin,
  Briefcase,
  GraduationCap,
  Users,
  MessageSquare,
  TrendingUp,
  Filter,
  MoreHorizontal,
  Clock,
  Calendar,
  X,
  Send,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { alumniService, mentorshipService } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";

export default function AskAlumni() {
  const { addToast } = useToast();
  const { user } = useAuth();
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState("All");

  // Booking modal state
  const [bookingFor, setBookingFor] = useState(null);
  const [bookingTopic, setBookingTopic] = useState("General Career Guidance");
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  const [bookingDate, setBookingDate] = useState(tomorrowStr);
  const [bookingTime, setBookingTime] = useState("18:00");
  const [bookingMessage, setBookingMessage] = useState("");
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    fetchAlumni();
  }, []);

  const fetchAlumni = async () => {
    try {
      setLoading(true);
      const res = await alumniService.getDirectory();
      setAlumni(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch alumni directory:", err);
      addToast("Failed to load alumni directory.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenBooking = (alum) => {
    setBookingFor(alum);
    setBookingTopic("General Career Guidance");
    setBookingDate(new Date(Date.now() + 86400000).toISOString().split("T")[0]);
    setBookingTime("18:00");
    setBookingMessage("");
  };

  const handleCloseBooking = () => {
    if (isBooking) return;
    setBookingFor(null);
    setBookingMessage("");
  };

  const handleBookSession = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!bookingFor) return;

    if (!bookingMessage.trim()) {
      addToast("Please provide a note explaining what you'd like guidance on.", "warning");
      return;
    }

    try {
      setIsBooking(true);
      const mentorTargetId = bookingFor._id || bookingFor.id;

      // Calculate 30-min end time from start time
      const [h, m] = (bookingTime || "18:00").split(":").map(Number);
      const endTotal = h * 60 + m + 30;
      const endTime = `${String(Math.floor(endTotal / 60)).padStart(2, "0")}:${String(endTotal % 60).padStart(2, "0")}`;

      await mentorshipService.createRequest({
        mentorId: mentorTargetId,
        alumniId: mentorTargetId,
        topic: bookingTopic || "General Career Guidance",
        message: bookingMessage.trim(),
        requestedDate: bookingDate || tomorrowStr,
        requestedStartTime: bookingTime || "18:00",
        requestedEndTime: endTime,
      });

      const mentorName = bookingFor.name || bookingFor.user?.name || "Alumni Mentor";
      addToast(`Mentorship request successfully sent to ${mentorName}!`, "success");
      setBookingFor(null);
      setBookingMessage("");
    } catch (error) {
      console.error("Booking error:", error);
      addToast(error.response?.data?.message || "Failed to send mentorship request.", "error");
    } finally {
      setIsBooking(false);
    }
  };

  // Helper to extract clean initials (e.g. "Cheran Suresh" -> "CS")
  const getInitials = (name) => {
    if (!name) return "AL";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Extract unique companies for filtering
  const companiesList = ["All", ...new Set(
    alumni
      .map((a) => a.alumniProfile?.company || a.company || a.companyName)
      .filter(Boolean)
  )];

  const filteredAlumni = alumni.filter((a) => {
    const name = a.name || a.user?.name || "";
    const company = a.alumniProfile?.company || a.company || a.companyName || "";
    const role = a.alumniProfile?.designation || a.title || a.currentRole || "";
    const skills = a.alumniProfile?.expertise || a.expertise || a.skills || [];
    const q = searchTerm.toLowerCase();

    const matchesSearch =
      name.toLowerCase().includes(q) ||
      company.toLowerCase().includes(q) ||
      role.toLowerCase().includes(q) ||
      skills.some((s) => String(s).toLowerCase().includes(q));

    const matchesCompany =
      selectedCompanyFilter === "All" ||
      company.toLowerCase() === selectedCompanyFilter.toLowerCase();

    return matchesSearch && matchesCompany;
  });

  return (
    <div
      className="container-fluid py-4 px-3 px-md-5"
      style={{
        background: "radial-gradient(ellipse at top left, rgba(124, 58, 237, 0.04) 0%, rgba(248, 250, 252, 0.8) 100%)",
        minHeight: "100dvh",
        color: "var(--text)",
      }}
    >
      {/* Header Container */}
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-4 mb-4 pb-2">
        <div>
          <div className="d-flex align-items-center gap-3 mb-2">
            <div
              className="d-flex align-items-center justify-content-center rounded-4 shadow-sm"
              style={{
                width: "56px",
                height: "56px",
                background: "linear-gradient(135deg, rgba(124, 58, 237, 0.15) 0%, rgba(79, 70, 229, 0.1) 100%)",
                border: "1.5px solid rgba(124, 58, 237, 0.2)",
                color: "#7c3aed",
              }}
            >
              <GraduationCap size={30} strokeWidth={2.2} />
            </div>
            <motion.h1
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="fw-black mb-0"
              style={{
                fontSize: "2.5rem",
                letterSpacing: "-0.025em",
                color: "var(--text, #0f172a)",
              }}
            >
              Ask <span style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Alumni</span>
            </motion.h1>
          </div>
          <p className="text-muted fw-medium mb-3 ms-1" style={{ fontSize: "1rem" }}>
            Connect with graduates, seek mentorship, and get referral guidance.
          </p>

          {/* Benefit Badges Row */}
          <div className="d-flex flex-wrap align-items-center gap-2 pt-1">
            <div
              className="d-inline-flex align-items-center gap-2 px-3 py-1.5 rounded-pill shadow-xs"
              style={{
                background: "rgba(124, 58, 237, 0.07)",
                color: "#6d28d9",
                border: "1px solid rgba(124, 58, 237, 0.18)",
                fontSize: "0.82rem",
                fontWeight: "600",
              }}
            >
              <Users size={14} className="text-primary" />
              <span>Learn from real experiences</span>
            </div>
            <span className="text-muted opacity-40 d-none d-sm-inline">|</span>
            <div
              className="d-inline-flex align-items-center gap-2 px-3 py-1.5 rounded-pill shadow-xs"
              style={{
                background: "rgba(59, 130, 246, 0.07)",
                color: "#1d4ed8",
                border: "1px solid rgba(59, 130, 246, 0.18)",
                fontSize: "0.82rem",
                fontWeight: "600",
              }}
            >
              <MessageSquare size={14} className="text-info" />
              <span>Get career guidance</span>
            </div>
            <span className="text-muted opacity-40 d-none d-sm-inline">|</span>
            <div
              className="d-inline-flex align-items-center gap-2 px-3 py-1.5 rounded-pill shadow-xs"
              style={{
                background: "rgba(16, 185, 129, 0.07)",
                color: "#047857",
                border: "1px solid rgba(16, 185, 129, 0.18)",
                fontSize: "0.82rem",
                fontWeight: "600",
              }}
            >
              <TrendingUp size={14} className="text-success" />
              <span>Build your professional network</span>
            </div>
          </div>
        </div>

        {/* Search & Filter Pill Controls */}
        <div className="d-flex align-items-center gap-2.5">
          <div className="position-relative" style={{ width: "320px", maxWidth: "100%" }}>
            <Search
              size={17}
              className="position-absolute top-50 start-0 translate-middle-y ms-3.5 text-muted pointer-events-none"
            />
            <input
              type="text"
              className="form-control rounded-pill ps-5 pe-3 py-2 bg-white"
              placeholder="Search by name or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                border: "1.5px solid #e2e8f0",
                fontSize: "0.88rem",
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.03)",
                color: "#1e293b",
              }}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="btn btn-link position-absolute top-50 end-0 translate-middle-y me-2 p-1 text-muted"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="position-relative">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="btn btn-light rounded-circle d-flex align-items-center justify-content-center shadow-xs"
              style={{
                width: "42px",
                height: "42px",
                border: showFilters ? "1.5px solid #7c3aed" : "1.5px solid #e2e8f0",
                background: showFilters ? "rgba(124, 58, 237, 0.08)" : "#ffffff",
                color: showFilters ? "#7c3aed" : "#64748b",
              }}
              title="Filter by Company"
            >
              <Filter size={18} />
            </button>

            {/* Filter Dropdown */}
            {showFilters && (
              <div
                className="position-absolute end-0 mt-2 p-3 bg-white rounded-4 shadow-lg border"
                style={{
                  width: "250px",
                  zIndex: 100,
                  borderColor: "#e2e8f0",
                }}
              >
                <h6 className="fw-bold small mb-2 text-uppercase tracking-wider text-muted">
                  Filter by Company
                </h6>
                <div className="d-flex flex-column gap-1 max-h-48 overflow-auto">
                  {companiesList.map((comp) => (
                    <button
                      key={comp}
                      type="button"
                      onClick={() => {
                        setSelectedCompanyFilter(comp);
                        setShowFilters(false);
                      }}
                      className={`btn btn-sm text-start rounded-pill px-3 py-1.5 fw-semibold ${
                        selectedCompanyFilter === comp
                          ? "btn-primary"
                          : "btn-light text-muted hover-bg"
                      }`}
                      style={{ fontSize: "0.82rem" }}
                    >
                      {comp}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid of Alumni Cards */}
      {loading ? (
        <div className="row g-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="col-12 col-md-6 col-lg-4">
              <div
                className="card border-0 rounded-4 p-4 shadow-xs"
                style={{
                  background: "#ffffff",
                  border: "1px solid #edf2f7",
                  borderRadius: "22px",
                  minHeight: "260px",
                }}
              >
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="rounded-circle bg-secondary bg-opacity-10 placeholder" style={{ width: 50, height: 50 }} />
                  <div className="flex-grow-1">
                    <div className="placeholder col-7 mb-2 rounded" />
                    <div className="placeholder col-10 rounded" />
                  </div>
                </div>
                <div className="placeholder col-6 mb-2 rounded" />
                <div className="placeholder col-5 mb-4 rounded" />
                <div className="d-flex gap-2 mb-4">
                  <span className="placeholder col-3 py-2 rounded-pill" />
                  <span className="placeholder col-4 py-2 rounded-pill" />
                </div>
                <div className="placeholder col-12 py-3 rounded-pill mt-auto" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="row g-4">
          {filteredAlumni.length > 0 ? (
            filteredAlumni.map((alum, idx) => {
              const alumName = alum.name || alum.user?.name || "Alumni Mentor";
              const alumCompany = alum.alumniProfile?.company || alum.company || alum.companyName || "Tech Industry";
              const alumRole = alum.alumniProfile?.designation || alum.title || alum.currentRole || "Software Engineer";
              const alumLocation = alum.location || alum.alumniProfile?.location || "Remote";
              const alumBatch = alum.alumniProfile?.batchYear || alum.graduationYear || alum.batchYear || "Alumni";
              const alumSkills = (alum.alumniProfile?.expertise && alum.alumniProfile.expertise.length > 0)
                ? alum.alumniProfile.expertise
                : (alum.expertise && alum.expertise.length > 0)
                ? alum.expertise
                : (alum.skills && alum.skills.length > 0)
                ? alum.skills
                : ["System Design", "React", "Cloud Architecture"];
              const isAvailable = alum.available ?? alum.alumniProfile?.available ?? true;
              const hasPhoto = alum.avatar && alum.avatar.startsWith("http");

              // Deterministic avatar gradient
              const bgGradients = [
                "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
                "linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)",
                "linear-gradient(135deg, #059669 0%, #0284c7 100%)",
                "linear-gradient(135deg, #dc2626 0%, #f97316 100%)",
                "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
              ];
              const avatarBg = bgGradients[idx % bgGradients.length];

              return (
                <motion.div
                  key={alum._id || alum.id || idx}
                  className="col-12 col-md-6 col-lg-4"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.25 }}
                >
                  <div
                    className="card border-0 h-100 p-4 d-flex flex-column transition-all hover-lift"
                    style={{
                      background: "var(--card, #ffffff)",
                      borderRadius: "22px",
                      border: "1.5px solid #eef2f6",
                      boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.04), 0 2px 6px -1px rgba(0, 0, 0, 0.02)",
                    }}
                  >
                    {/* Top Row: Avatar, Identity, Overflow Action */}
                    <div className="d-flex align-items-start justify-content-between gap-2 mb-3">
                      <div className="d-flex align-items-center gap-3">
                        {hasPhoto ? (
                          <img
                            src={alum.avatar}
                            alt={alumName}
                            className="rounded-circle shadow-xs"
                            style={{
                              width: "50px",
                              height: "50px",
                              objectFit: "cover",
                              border: "2px solid #ffffff",
                              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                            }}
                          />
                        ) : (
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-xs flex-shrink-0"
                            style={{
                              width: "50px",
                              height: "50px",
                              background: avatarBg,
                              fontSize: "1rem",
                              letterSpacing: "0.5px",
                            }}
                          >
                            {getInitials(alumName)}
                          </div>
                        )}

                        <div className="text-truncate">
                          <div className="d-flex align-items-center gap-1.5">
                            <h5
                              className="fw-bold mb-0 text-truncate"
                              style={{
                                color: "var(--text, #0f172a)",
                                fontSize: "1.05rem",
                                letterSpacing: "-0.01em",
                              }}
                            >
                              {alumName}
                            </h5>
                            {/* Online Status Green Dot Indicator */}
                            <span
                              className="rounded-circle d-inline-block flex-shrink-0"
                              title={isAvailable ? "Online / Open for Mentorship" : "Busy"}
                              style={{
                                width: "8px",
                                height: "8px",
                                background: isAvailable ? "#10b981" : "#94a3b8",
                                boxShadow: isAvailable ? "0 0 0 2px rgba(16, 185, 129, 0.2)" : "none",
                              }}
                            />
                          </div>

                          <p
                            className="text-muted small fw-medium mb-0 text-truncate d-flex align-items-center gap-1.5 mt-0.5"
                            style={{ fontSize: "0.82rem" }}
                          >
                            <Briefcase size={13} className="text-muted flex-shrink-0" />
                            <span className="text-truncate">
                              {alumRole} @ <strong className="text-dark-emphasis">{alumCompany}</strong>
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Card Overflow Action */}
                      <button
                        type="button"
                        onClick={() => handleOpenBooking(alum)}
                        className="btn btn-link text-muted p-1 hover-text-foreground rounded-circle"
                        title="More options"
                        style={{ textDecoration: "none" }}
                      >
                        <MoreHorizontal size={18} />
                      </button>
                    </div>

                    {/* Metadata Items */}
                    <div className="d-flex flex-column gap-1.5 mb-3 text-muted" style={{ fontSize: "0.84rem" }}>
                      <div className="d-flex align-items-center gap-2">
                        <MapPin size={14} className="text-muted flex-shrink-0" />
                        <span>{alumLocation}</span>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <GraduationCap size={14} className="text-muted flex-shrink-0" />
                        <span>Class of {alumBatch}</span>
                      </div>
                    </div>

                    {/* Skill Badges */}
                    <div className="d-flex flex-wrap gap-1.5 mb-4 flex-grow-1 align-content-start">
                      {alumSkills.slice(0, 5).map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="badge rounded-pill fw-medium"
                          style={{
                            background: "#eef2ff",
                            color: "#4338ca",
                            border: "1px solid #e0e7ff",
                            fontSize: "0.78rem",
                            padding: "5px 11px",
                            letterSpacing: "0.01em",
                          }}
                        >
                          {skill}
                        </span>
                      ))}
                      {alumSkills.length > 5 && (
                        <span
                          className="badge rounded-pill fw-medium text-muted"
                          style={{
                            background: "#f8fafc",
                            border: "1px solid #e2e8f0",
                            fontSize: "0.75rem",
                            padding: "5px 9px",
                          }}
                        >
                          +{alumSkills.length - 5}
                        </span>
                      )}
                    </div>

                    {/* Full-Width Gradient Action Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenBooking(alum)}
                      disabled={!isAvailable}
                      className="btn w-100 rounded-pill fw-bold d-flex align-items-center justify-content-center gap-2 py-2.5 transition-all shadow-sm"
                      style={{
                        background: isAvailable
                          ? "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)"
                          : "#f1f5f9",
                        color: isAvailable ? "#ffffff" : "#94a3b8",
                        border: "none",
                        fontSize: "0.92rem",
                        boxShadow: isAvailable ? "0 4px 14px rgba(99, 102, 241, 0.28)" : "none",
                        marginTop: "auto",
                      }}
                    >
                      <MessageSquare size={16} />
                      <span>Request Mentorship</span>
                      <ArrowRight size={15} className="ms-0.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="col-12 py-5 text-center">
              <div
                className="card border-0 rounded-4 p-5 mx-auto text-center"
                style={{
                  maxWidth: "500px",
                  background: "#ffffff",
                  border: "1.5px dashed #cbd5e1",
                  borderRadius: "24px",
                }}
              >
                <GraduationCap size={56} className="text-primary opacity-30 mx-auto mb-3" />
                <h4 className="fw-bold mb-1">No alumni found</h4>
                <p className="text-muted small mb-4">
                  We couldn't find any alumni matching your search & filter criteria.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCompanyFilter("All");
                  }}
                  className="btn btn-outline-primary rounded-pill px-4 fw-bold mx-auto"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Booking Modal Overlay */}
      <AnimatePresence>
        {bookingFor && (
          <div
            className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
            style={{
              zIndex: 1060,
              background: "rgba(10, 15, 30, 0.72)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
            onClick={handleCloseBooking}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ duration: 0.2 }}
              className="p-4 p-md-5 position-relative w-100 shadow-2xl"
              style={{
                maxWidth: "540px",
                background: "#ffffff",
                color: "#0f172a",
                borderRadius: "24px",
                border: "1px solid #e2e8f0",
                maxHeight: "92vh",
                overflowY: "auto",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="d-flex justify-content-between align-items-start mb-4">
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="rounded-3 d-flex align-items-center justify-content-center text-primary"
                    style={{
                      width: 44,
                      height: 44,
                      background: "rgba(124, 58, 237, 0.12)",
                      border: "1px solid rgba(124, 58, 237, 0.25)",
                    }}
                  >
                    <Calendar size={22} className="text-primary" />
                  </div>
                  <div>
                    <h5 className="fw-bold mb-0 text-dark">
                      Request Mentorship Session
                    </h5>
                    <p className="small text-muted mb-0">
                      With <strong>{bookingFor.name || bookingFor.user?.name || "Alumni Mentor"}</strong>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary rounded-circle p-1"
                  onClick={handleCloseBooking}
                  disabled={isBooking}
                  aria-label="Close"
                  style={{ width: 32, height: 32 }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Mentor Snapshot Card */}
              <div
                className="p-3 rounded-4 mb-4 d-flex align-items-center gap-3"
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-xs flex-shrink-0"
                  style={{
                    width: "44px",
                    height: "44px",
                    background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                    fontSize: "0.95rem",
                  }}
                >
                  {getInitials(bookingFor.name || bookingFor.user?.name)}
                </div>
                <div className="text-truncate">
                  <h6 className="fw-bold mb-0 text-truncate text-dark">
                    {bookingFor.name || bookingFor.user?.name || "Alumni Mentor"}
                  </h6>
                  <p className="small text-muted mb-0 text-truncate">
                    {bookingFor.alumniProfile?.designation || bookingFor.title || "Engineer"} @ {bookingFor.alumniProfile?.company || bookingFor.company || "Tech Industry"}
                  </p>
                </div>
              </div>

              {/* Booking Form */}
              <form onSubmit={handleBookSession} className="d-flex flex-column gap-3">
                <div>
                  <label className="form-label small fw-bold text-muted mb-1">
                    Discussion Topic
                  </label>
                  <select
                    className="form-select rounded-3 py-2"
                    style={{ borderColor: "#cbd5e1", fontSize: "0.9rem" }}
                    value={bookingTopic}
                    onChange={(e) => setBookingTopic(e.target.value)}
                    disabled={isBooking}
                  >
                    <option value="General Career Guidance">General Career Guidance</option>
                    <option value="Resume & Portfolio Review">Resume & Portfolio Review</option>
                    <option value="Mock Technical Interview">Mock Technical Interview</option>
                    <option value="Company Referral Inquiry">Company Referral Inquiry</option>
                    <option value="Industry & System Design Deep-Dive">Industry & System Design Deep-Dive</option>
                  </select>
                </div>

                <div className="row g-3">
                  <div className="col-7">
                    <label className="form-label small fw-bold text-muted mb-1">
                      Proposed Date
                    </label>
                    <input
                      type="date"
                      className="form-control rounded-3 py-2"
                      style={{ borderColor: "#cbd5e1", fontSize: "0.9rem" }}
                      min={tomorrowStr}
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      disabled={isBooking}
                      required
                    />
                  </div>
                  <div className="col-5">
                    <label className="form-label small fw-bold text-muted mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      className="form-control rounded-3 py-2"
                      style={{ borderColor: "#cbd5e1", fontSize: "0.9rem" }}
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      disabled={isBooking}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label small fw-bold text-muted mb-1">
                    Personalized Note / Questions *
                  </label>
                  <textarea
                    className="form-control rounded-3"
                    style={{ borderColor: "#cbd5e1", fontSize: "0.9rem" }}
                    rows={4}
                    placeholder="Briefly describe what you're working on and what specific guidance you're seeking from this alumni mentor..."
                    value={bookingMessage}
                    onChange={(e) => setBookingMessage(e.target.value)}
                    disabled={isBooking}
                    required
                  />
                  <small className="text-muted d-block mt-1">
                    Include your current focus, relevant links, or specific questions.
                  </small>
                </div>

                <div className="d-flex justify-content-end gap-2 pt-2">
                  <button
                    type="button"
                    className="btn btn-light rounded-pill px-4 fw-semibold"
                    onClick={handleCloseBooking}
                    disabled={isBooking}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary rounded-pill px-4 fw-bold d-flex align-items-center gap-2 shadow-sm"
                    style={{
                      background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                      border: "none",
                    }}
                    disabled={isBooking}
                  >
                    {isBooking ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send size={15} />
                        <span>Send Request</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
