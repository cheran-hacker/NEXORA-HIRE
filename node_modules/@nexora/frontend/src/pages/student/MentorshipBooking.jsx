import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Video,
  Star,
  Clock,
  ChevronRight,
  UserCheck,
  ShieldCheck,
} from "lucide-react";
import { mentorshipService } from "../../services/api";
import { useToast } from "../../context/ToastContext";
export default function MentorshipBooking() {
  const { addToast } = useToast();
  const [selectedAlumni, setSelectedAlumni] = useState(null);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [booking, setBooking] = useState(false);
  React.useEffect(() => {
    const fetchMentors = async () => {
      try {
        const res = await mentorshipService.getMentors();
        setMentors(res.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMentors();
  }, []);
  const handleBookSession = async () => {
    if (!selectedAlumni) {
      addToast("Select a mentor first", "error");
      return;
    }
    if (!selectedSlot) {
      addToast("Please select a time slot", "error");
      return;
    }
    try {
      setBooking(true);
      await mentorshipService.bookSession({
        mentorId: selectedAlumni._id,
        scheduledDate: selectedSlot,
        topic: "General Career Advice", // Default topic
        durationMinutes: 30
      });
      addToast(
        "Session booked! A WebRTC link will be sent to your email. 🎉",
        "success",
      );
      setSelectedSlot(null);
      setSelectedAlumni(null);
    } catch (err) {
      addToast(err.message || "Booking failed. Please try again.", "error");
    } finally {
      setBooking(false);
    }
  };
  return (
    <div className="container-fluid space-y-4" style={{ maxWidth: "1400px" }}>
      {" "}
      {/* Header Info */}{" "}
      <div
        className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-4 rounded-4 shadow-sm p-4 mb-4 position-relative overflow-hidden"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
        }}
      >
        {" "}
        <div
          className="position-absolute rounded-circle pe-none"
          style={{
            top: 0,
            right: 0,
            width: "250px",
            height: "250px",
            background: "rgba(59,130,246,0.2)",
            filter: "blur(100px)",
          }}
        ></div>{" "}
        <div className="position-relative z-1">
          {" "}
          <h2
            className="fw-black mb-2 d-flex align-items-center gap-3"
            style={{ fontSize: "2.5rem", color: "var(--text)" }}
          >
            {" "}
            <UserCheck className="text-primary" size={32} /> Alumni
            Mentorship{" "}
          </h2>{" "}
          <p
            className="fw-medium mb-0"
            style={{ color: "var(--text-secondary)" }}
          >
            Book 1:1 WebRTC video sessions with verified alumni who have cracked
            top companies.
          </p>{" "}
        </div>{" "}
        <div className="position-relative z-1">
          {" "}
          <div
            className="badge rounded-pill px-3 py-2 fw-bold text-uppercase d-inline-flex align-items-center gap-2"
            style={{
              background: "rgba(59,130,246,0.2)",
              color: "var(--primary)",
            }}
          >
            {" "}
            <ShieldCheck size={16} /> Verified Alumni Only{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
      <div className="row g-4">
        {" "}
        {/* Mentors List */}{" "}
        <div className="col-lg-8 space-y-4">
          {" "}
          <h4 className="fw-bold mb-4" style={{ color: "var(--text)" }}>
            Available Mentors
          </h4>{" "}
          {mentors.map((mentor) => (
            <motion.div
              key={mentor._id || mentor.id}
              whileHover={{ scale: 1.01 }}
              onClick={() => setSelectedAlumni(mentor)}
              className={`rounded-4 shadow-sm p-4 mb-3 cursor-pointer transition-fast ${selectedAlumni?.id === mentor.id ? "hover-glow" : ""}`}
              style={{
                background: "var(--surface)",
                border: "1px solid",
                borderColor:
                  selectedAlumni?.id === mentor.id
                    ? "var(--primary)"
                    : "var(--border)",
              }}
            >
              {" "}
              <div className="d-flex flex-column flex-md-row gap-4">
                {" "}
                <img
                  src={mentor.image}
                  alt={mentor.name}
                  className="rounded-3 object-fit-cover shadow-sm"
                  style={{
                    width: "100px",
                    height: "100px",
                    border: "2px solid var(--border)",
                  }}
                />{" "}
                <div className="flex-grow-1">
                  {" "}
                  <div className="d-flex justify-content-between align-items-start mb-1">
                    {" "}
                    <h4
                      className="fw-bold m-0 d-flex align-items-center gap-2"
                      style={{ color: "var(--text)" }}
                    >
                      {" "}
                      {mentor.name}{" "}
                      <ShieldCheck size={18} className="text-primary" />{" "}
                    </h4>{" "}
                    <div
                      className="badge rounded-pill d-flex align-items-center gap-1 px-2 py-1"
                      style={{
                        background: "rgba(var(--warning-rgb), 0.2)",
                        color: "var(--warning)",
                      }}
                    >
                      {" "}
                      <Star size={14} className="fill-warning" />{" "}
                      {mentor.rating}{" "}
                    </div>{" "}
                  </div>{" "}
                  <div
                    className="fw-bold small mb-2"
                    style={{ color: "var(--primary)" }}
                  >
                    {mentor.role}
                  </div>{" "}
                  <p
                    className="small fw-medium mb-3"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {mentor.bio}
                  </p>{" "}
                  <div className="d-flex flex-wrap gap-2">
                    {" "}
                    {(mentor.skills || []).map((skill, i) => (
                      <span
                        key={i}
                        className="badge rounded-pill fw-medium"
                        style={{
                          background: "var(--surface-2)",
                          color: "var(--text-secondary)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        {" "}
                        {skill}{" "}
                      </span>
                    ))}{" "}
                  </div>{" "}
                </div>{" "}
              </div>{" "}
            </motion.div>
          ))}{" "}
        </div>{" "}
        {/* Booking Panel */}{" "}
        <div className="col-lg-4">
          {" "}
          <div
            className="rounded-4 shadow-sm p-4 sticky-top"
            style={{
              top: "24px",
              background: "var(--surface)",
              border: "1px solid var(--border)",
            }}
          >
            {" "}
            {selectedAlumni ? (
              <>
                {" "}
                <h3 className="fw-bold mb-4" style={{ color: "var(--text)" }}>
                  Book Session
                </h3>{" "}
                <div className="space-y-6">
                  {" "}
                  {/* Calendar Widget Fake */}{" "}
                  <div>
                    {" "}
                    <label
                      className="small fw-bold text-uppercase tracking-wider mb-3 d-block"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Select Date
                    </label>{" "}
                    <div className="row g-2 text-center">
                      {" "}
                      <div className="col-12 text-center py-4 text-secondary">
                        {" "}
                        <small>No dates available this week.</small>{" "}
                      </div>{" "}
                    </div>{" "}
                  </div>{" "}
                  {/* Time Slots */}{" "}
                  <div>
                    {" "}
                    <label
                      className="small fw-bold text-uppercase tracking-wider mb-3 d-block"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Available Slots
                    </label>{" "}
                    <div className="row g-3">
                      {" "}
                      <div className="col-12 text-center py-3 text-secondary">
                        {" "}
                        <small>
                          No time slots available for selected date.
                        </small>{" "}
                      </div>{" "}
                    </div>{" "}
                  </div>{" "}
                  <div
                    className="pt-4"
                    style={{ borderTop: "1px solid var(--border)" }}
                  >
                    {" "}
                    <button
                      onClick={handleBookSession}
                      disabled={!selectedSlot || booking}
                      className="btn rounded-4 w-100 py-3 fw-bold hover-lift shadow-sm d-flex align-items-center justify-content-center gap-2"
                      style={{
                        background: !selectedSlot
                          ? "var(--surface-2)"
                          : "var(--primary)",
                        color: "#fff",
                        border: "none",
                        opacity: !selectedSlot ? 0.6 : 1,
                      }}
                    >
                      {" "}
                      <Video size={18} />{" "}
                      {booking ? "Booking..." : "Confirm Booking"}{" "}
                    </button>{" "}
                    <p
                      className="text-center small mt-3 m-0"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      A WebRTC link will be sent to your email.
                    </p>{" "}
                  </div>{" "}
                </div>{" "}
              </>
            ) : (
              <div className="text-center py-5 opacity-50">
                {" "}
                <Calendar size={48} className="mx-auto mb-4 text-muted" />{" "}
                <p className="fw-medium text-muted">
                  Select a mentor from the list to view their availability and
                  book a session.
                </p>{" "}
              </div>
            )}{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}
