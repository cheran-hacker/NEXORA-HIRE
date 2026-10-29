import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MapPin,
  Building,
  Award,
  Calendar,
  CheckCircle2,
  MessageSquare,
  Clock,
  GraduationCap,
  X,
  Send
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
        requestedEndTime: endTime
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

  const filteredAlumni = alumni.filter((a) => {
    const name = a.name || a.user?.name || "";
    const company = a.company || a.companyName || "";
    const role = a.title || a.currentRole || "";
    const q = searchTerm.toLowerCase();
    return (
      name.toLowerCase().includes(q) ||
      company.toLowerCase().includes(q) ||
      role.toLowerCase().includes(q) ||
      (a.expertise || []).some((s) => String(s).toLowerCase().includes(q))
    );
  });

  return (
    <div className="container-fluid py-4 px-xl-5" style={{ background: "var(--bg)", minHeight: "100dvh", color: "var(--text)" }}>
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-4 mb-5">
        <div>
          <motion.h2 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="fw-black mb-1 d-flex align-items-center gap-3 text-ultra" style={{ fontSize: "2.5rem", letterSpacing: "-0.02em" }}>
            <GraduationCap size={36} className="text-primary" strokeWidth={2.5} />
            Ask Alumni
          </motion.h2>
          <p className="text-muted fw-medium mb-0 ms-1">Connect with graduates, seek mentorship, and get referral guidance.</p>
        </div>
        <div className="d-flex gap-2">
          <div className="input-group" style={{ maxWidth: "300px" }}>
            <span className="input-group-text bg-transparent border-end-0 text-muted" style={{ borderColor: "var(--border)" }}>
              <Search size={18} />
            </span>
            <input
              type="text"
              className="form-control border-start-0 bg-transparent text-body shadow-none"
              placeholder="Search by name or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ borderColor: "var(--border)" }}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center align-items-center py-5">
          <span className="spinner-border text-primary" role="status" />
        </div>
      ) : (
        <div className="row g-4">
          {filteredAlumni.length > 0 ? (
            filteredAlumni.map((alum) => {
              const alumName = alum.name || alum.user?.name || "Alumni Mentor";
              const alumCompany = alum.company || alum.companyName || "Tech Industry";
              const alumRole = alum.title || alum.currentRole || "Engineer";
              const isMentorshipAvail = alum.mentorshipAvailable ?? alum.availableForMentorship ?? true;
              const avatarSrc = alum.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(alumName)}&background=random&color=fff`;

              return (
                <motion.div key={alum._id || alum.id} className="col-md-6 col-lg-4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                  <div className="bento-card p-4 h-100 hover-glow d-flex flex-column" style={{ borderColor: "var(--border)" }}>
                    <div className="d-flex align-items-center gap-3 mb-4">
                      <img
                        src={avatarSrc}
                        alt="Avatar"
                        className="rounded-circle border"
                        style={{ width: 56, height: 56, borderColor: "var(--border)", objectFit: "cover" }}
                      />
                      <div>
                        <h6 className="fw-bold mb-0">{alumName}</h6>
                        <p className="text-primary small fw-semibold mb-0 d-flex align-items-center gap-1">
                          <Building size={12} /> {alumRole} @ {alumCompany}
                        </p>
                      </div>
                    </div>

                    <div className="mb-4 flex-grow-1">
                      <p className="small text-muted mb-2 d-flex align-items-center gap-2">
                        <MapPin size={14} /> {alum.location || "Remote"}
                      </p>
                      <p className="small text-muted mb-2 d-flex align-items-center gap-2">
                        <GraduationCap size={14} /> Class of {alum.graduationYear || "Alumni"}
                      </p>
                      {alum.expertise?.length > 0 && (
                        <div className="d-flex flex-wrap gap-1 mt-3">
                          {alum.expertise.map((skill, idx) => (
                            <span key={idx} className="badge bg-secondary-subtle text-secondary border border-secondary-subtle fw-semibold px-2 py-1">
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleOpenBooking(alum)}
                      disabled={!isMentorshipAvail}
                      className={`btn w-100 rounded-pill fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm ${isMentorshipAvail ? "btn-primary hover-scale" : "btn-light text-muted"}`}
                    >
                      {isMentorshipAvail ? (
                        <>
                          <MessageSquare size={16} /> Request Mentorship
                        </>
                      ) : (
                        <>
                          <Clock size={16} /> Currently Unavailable
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="col-12 text-center py-5">
              <GraduationCap size={48} className="text-muted mb-3 opacity-50" />
              <h5 className="fw-bold">No alumni found</h5>
              <p className="text-muted">Try adjusting your search criteria.</p>
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
              WebkitBackdropFilter: "blur(8px)"
            }}
            onClick={handleCloseBooking}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ duration: 0.2 }}
              className="p-4 p-md-5 position-relative shadow-2xl w-100"
              style={{
                maxWidth: "540px",
                background: "var(--card, #ffffff)",
                color: "var(--text)",
                borderRadius: "1.25rem",
                border: "1px solid var(--border)",
                boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.55)",
                maxHeight: "92vh",
                overflowY: "auto"
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
                      background: "rgba(var(--primary-rgb), 0.12)",
                      border: "1px solid rgba(var(--primary-rgb), 0.25)"
                    }}
                  >
                    <Calendar size={22} />
                  </div>
                  <div>
                    <h5 className="fw-bold mb-0" style={{ color: "var(--text)" }}>
                      Request Mentorship Session
                    </h5>
                    <p className="small text-muted mb-0">
                      With <strong style={{ color: "var(--text)" }}>{bookingFor.name || bookingFor.user?.name || "Alumni Mentor"}</strong>
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
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border)"
                }}
              >
                <img
                  src={
                    bookingFor.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(bookingFor.name || bookingFor.user?.name || "Alumni")}&background=random&color=fff`
                  }
                  alt="Mentor"
                  className="rounded-circle border"
                  style={{ width: 44, height: 44, objectFit: "cover", borderColor: "var(--border)" }}
                />
                <div className="small">
                  <div className="fw-bold" style={{ color: "var(--text)" }}>
                    {bookingFor.name || bookingFor.user?.name || "Alumni Mentor"}
                  </div>
                  <div className="text-muted">
                    {bookingFor.title || bookingFor.currentRole || "Engineer"} @{" "}
                    <span className="text-primary fw-semibold">{bookingFor.company || bookingFor.companyName || "Tech"}</span>
                    {bookingFor.location && ` • ${bookingFor.location}`}
                  </div>
                </div>
              </div>

              <form onSubmit={handleBookSession}>
                {/* Topic Selection */}
                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted text-uppercase mb-1">
                    Mentorship Topic
                  </label>
                  <select
                    className="form-select rounded-3"
                    value={bookingTopic}
                    onChange={(e) => setBookingTopic(e.target.value)}
                    style={{
                      background: "var(--bg-secondary)",
                      borderColor: "var(--border)",
                      color: "var(--text)"
                    }}
                  >
                    <option value="General Career Guidance">General Career Guidance</option>
                    <option value="Mock Technical Interview">Mock Technical Interview</option>
                    <option value="Resume & ATS Review">Resume & ATS Review</option>
                    <option value="System Design Preparation">System Design Preparation</option>
                    <option value="Referral & Job Strategy">Referral & Job Search Strategy</option>
                  </select>
                </div>

                {/* Date & Time Row */}
                <div className="row g-2 mb-3">
                  <div className="col-7">
                    <label className="form-label small fw-bold text-muted text-uppercase mb-1">
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      className="form-control rounded-3"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      style={{
                        background: "var(--bg-secondary)",
                        borderColor: "var(--border)",
                        color: "var(--text)"
                      }}
                      required
                    />
                  </div>
                  <div className="col-5">
                    <label className="form-label small fw-bold text-muted text-uppercase mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      className="form-control rounded-3"
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      style={{
                        background: "var(--bg-secondary)",
                        borderColor: "var(--border)",
                        color: "var(--text)"
                      }}
                      required
                    />
                  </div>
                </div>

                {/* Note / Message */}
                <div className="mb-4">
                  <label className="form-label small fw-bold text-muted text-uppercase mb-1">
                    Your Message / Questions *
                  </label>
                  <textarea
                    className="form-control rounded-3"
                    rows={4}
                    placeholder="Briefly describe what you'd like guidance on (e.g., preparing for Google SWE interviews, resume feedback, behavioral questions)..."
                    value={bookingMessage}
                    onChange={(e) => setBookingMessage(e.target.value)}
                    required
                    style={{
                      background: "var(--bg-secondary)",
                      borderColor: "var(--border)",
                      color: "var(--text)",
                      resize: "none"
                    }}
                  />
                  <div className="form-text small text-muted">
                    Your message helps the alumni review and accept your 1-on-1 session request.
                  </div>
                </div>

                {/* Actions */}
                <div className="d-flex gap-3 justify-content-end pt-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary rounded-pill px-4 fw-semibold"
                    onClick={handleCloseBooking}
                    disabled={isBooking}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary rounded-pill px-4 fw-bold d-flex align-items-center gap-2 shadow-sm"
                    disabled={isBooking || !bookingMessage.trim()}
                  >
                    {isBooking ? (
                      <>
                        <span className="spinner-border spinner-border-sm" />
                        <span>Sending Request...</span>
                      </>
                    ) : (
                      <>
                        <Send size={15} /> Send Request
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
