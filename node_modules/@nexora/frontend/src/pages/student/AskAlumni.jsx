import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Building, Award, Calendar, CheckCircle2, MessageSquare, Clock, GraduationCap } from "lucide-react";
import { alumniService, mentorshipService } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";

export default function AskAlumni() {
  const { addToast } = useToast();
  const { user } = useAuth();
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [bookingFor, setBookingFor] = useState(null);
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

  const handleBookSession = async () => {
    if (!bookingMessage.trim()) {
      addToast("Please provide a reason for the session.", "warning");
      return;
    }
    try {
      setIsBooking(true);
      await mentorshipService.bookSession({
        alumniId: bookingFor._id,
        notes: bookingMessage,
        scheduledAt: new Date(Date.now() + 86400000).toISOString() // schedule for tomorrow as default
      });
      addToast("Mentorship request sent successfully!", "success");
      setBookingFor(null);
      setBookingMessage("");
    } catch (error) {
      console.error("Booking error:", error);
      addToast(error.response?.data?.message || "Failed to send request.", "error");
    } finally {
      setIsBooking(false);
    }
  };

  const filteredAlumni = alumni.filter(
    (a) =>
      a.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.currentRole?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            filteredAlumni.map((alum) => (
              <motion.div key={alum._id} className="col-md-6 col-lg-4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <div className="bento-card p-4 h-100 hover-glow d-flex flex-column" style={{ borderColor: "var(--border)" }}>
                  <div className="d-flex align-items-center gap-3 mb-4">
                    <img
                      src={`https://ui-avatars.com/api/?name=${alum.user?.name}&background=random&color=fff`}
                      alt="Avatar"
                      className="rounded-circle border"
                      style={{ width: 56, height: 56, borderColor: "var(--border)" }}
                    />
                    <div>
                      <h6 className="fw-bold mb-0">{alum.user?.name}</h6>
                      <p className="text-primary small fw-semibold mb-0 d-flex align-items-center gap-1">
                        <Building size={12} /> {alum.currentRole} @ {alum.companyName}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4 flex-grow-1">
                    <p className="small text-muted mb-2 d-flex align-items-center gap-2">
                      <MapPin size={14} /> {alum.location || "Remote"}
                    </p>
                    <p className="small text-muted mb-2 d-flex align-items-center gap-2">
                      <GraduationCap size={14} /> Class of {alum.graduationYear}
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
                    onClick={() => setBookingFor(alum)}
                    disabled={!alum.availableForMentorship}
                    className={`btn w-100 rounded-pill fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm ${alum.availableForMentorship ? "btn-primary hover-scale" : "btn-light text-muted"}`}
                  >
                    {alum.availableForMentorship ? (
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
            ))
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
          <div className="modal-backdrop fade show d-flex align-items-center justify-content-center" style={{ zIndex: 1050, background: "rgba(0,0,0,0.5)" }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="bento-card p-4 mx-3 shadow-lg position-relative" style={{ width: "100%", maxWidth: "500px", zIndex: 1051 }}>
              <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                <Calendar className="text-primary" size={20} /> Request Session with {bookingFor.user?.name}
              </h5>
              <p className="text-muted small mb-4">
                Send a brief message explaining what you'd like to discuss (e.g., career guidance, resume review, referral request).
              </p>
              <textarea
                className="form-control mb-4 bg-transparent text-body"
                rows={4}
                placeholder="Hi! I am currently a junior and would love to get your advice on breaking into..."
                value={bookingMessage}
                onChange={(e) => setBookingMessage(e.target.value)}
                style={{ borderColor: "var(--border)", resize: "none" }}
              />
              <div className="d-flex gap-3 justify-content-end">
                <button className="btn btn-outline-secondary rounded-pill px-4 fw-bold" onClick={() => setBookingFor(null)} disabled={isBooking}>
                  Cancel
                </button>
                <button className="btn btn-primary rounded-pill px-4 fw-bold d-flex align-items-center gap-2" onClick={handleBookSession} disabled={isBooking}>
                  {isBooking ? (
                    <span className="spinner-border spinner-border-sm" />
                  ) : (
                    <>
                      <CheckCircle2 size={16} /> Send Request
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
