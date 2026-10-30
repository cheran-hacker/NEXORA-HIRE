import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  MapPin,
  Users,
  Filter,
  Plus,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { geoService } from "../../services/api";
import Modal from "../../shared/components/Modal";

const Events = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [events, setEvents] = useState([]);
  const [showProposeModal, setShowProposeModal] = useState(false);
  const [proposalForm, setProposalForm] = useState({
    title: "",
    type: "Tech",
    location: "",
    date: "",
    attendees: 50,
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
  });

  const handleProposeEvent = (e) => {
    e.preventDefault();
    if (!proposalForm.title.trim()) {
      addToast("Please provide an event title", "error");
      return;
    }
    const newEvt = {
      id: "evt_" + Date.now(),
      _id: "evt_" + Date.now(),
      title: proposalForm.title,
      type: proposalForm.type,
      location: proposalForm.location || "Campus Auditorium",
      date: proposalForm.date ? new Date(proposalForm.date).toISOString() : new Date().toISOString(),
      attendees: 1,
      registered: true,
      image: proposalForm.image,
    };
    setEvents([newEvt, ...events]);
    setShowProposeModal(false);
    setProposalForm({
      title: "",
      type: "Tech",
      location: "",
      date: "",
      attendees: 50,
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
    });
    addToast("Campus event proposed successfully!", "success");
  };
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await geoService.getActiveEvents();
        setEvents(res.data.data || []);
      } catch (err) {
        addToast("Failed to load events", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [addToast]);
  const handleRegister = (id) => {
    setEvents(
      events.map((e) =>
        e.id === id
          ? {
              ...e,
              registered: !e.registered,
              attendees: e.registered ? e.attendees - 1 : e.attendees + 1,
            }
          : e,
      ),
    );
    const isRegistering = !events.find((e) => e.id === id).registered;
    if (isRegistering) {
      addToast("Successfully registered for event!", "success");
    } else {
      addToast("Unregistered from event.", "info");
    }
  };
  const filteredEvents = events.filter(
    (e) => filter === "All" || e.type === filter,
  );
  if (loading)
    return (
      <div className="p-5 text-center">
        <span className="spinner-border text-primary" />
      </div>
    );
  return (
    <div className="container-fluid py-4 px-xl-5">
      {" "}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5 d-flex justify-content-between align-items-end flex-wrap gap-3"
      >
        {" "}
        <div>
          {" "}
          <h2
            className="fw-black mb-1 d-flex align-items-center gap-3"
            style={{ color: "var(--text)" }}
          >
            {" "}
            <Calendar size={32} className="text-primary" /> Campus Events{" "}
          </h2>{" "}
          <p className="text-muted fw-medium m-0">
            Discover, register, and attend events happening across the campus.
          </p>{" "}
        </div>{" "}
        <button
          className="btn btn-primary rounded-pill fw-bold px-4 d-flex align-items-center gap-2"
          onClick={() => setShowProposeModal(true)}
        >
          {" "}
          <Plus size={18} /> Propose Event{" "}
        </button>{" "}
      </motion.div>{" "}
      <div className="d-flex flex-wrap gap-2 mb-4">
        {" "}
        {["All", "Tech", "Seminar", "Sports", "Cultural"].map((cat) => (
          <button
            key={cat}
            className={`btn fw-bold rounded-pill px-4 ${filter === cat ? "btn-primary shadow" : "btn-outline-secondary border-0 text-muted hover-bg"}`}
            onClick={() => setFilter(cat)}
          >
            {" "}
            {cat}{" "}
          </button>
        ))}{" "}
      </div>{" "}
      <div className="row g-4">
        {" "}
        {filteredEvents.map((event, idx) => (
          <div className="col-md-6 col-lg-4" key={event._id || event.id}>
            {" "}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bento-card h-100 d-flex flex-column overflow-hidden"
              style={{ padding: 0 }}
            >
              {" "}
              <div
                style={{
                  height: "160px",
                  backgroundImage: `url(${event.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  position: 'relative',
                }}
              >
                {" "}
                <div className="position-absolute top-0 start-0 w-100 h-100 bg-light opacity-50"></div>{" "}
                <span className="badge bg-primary position-absolute top-0 end-0 m-3 px-3 py-2 rounded-pill fw-bold">
                  {event.type}
                </span>{" "}
              </div>{" "}
              <div className="p-4 d-flex flex-column flex-grow-1">
                {" "}
                <h5 className="fw-bold mb-3">{event.title}</h5>{" "}
                <div className="d-flex flex-column gap-2 mb-4">
                  {" "}
                  <div className="d-flex align-items-center gap-2 text-muted small fw-semibold">
                    {" "}
                    <Calendar size={16} className="text-primary" />{" "}
                    {new Date(event.date).toLocaleString([], {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}{" "}
                  </div>{" "}
                  <div className="d-flex align-items-center gap-2 text-muted small fw-semibold">
                    {" "}
                    <MapPin size={16} className="text-danger" />{" "}
                    {event.location}{" "}
                  </div>{" "}
                  <div className="d-flex align-items-center gap-2 text-muted small fw-semibold">
                    {" "}
                    <Users size={16} className="text-info" /> {event.attendees}{" "}
                    Attendees{" "}
                  </div>{" "}
                </div>{" "}
                <button
                  onClick={() => handleRegister(event.id)}
                  className={`btn mt-auto w-100 rounded-pill fw-bold ${event.registered ? "btn-outline-secondary" : "btn-primary"}`}
                >
                  {" "}
                  {event.registered
                    ? "Cancel Registration"
                    : "Register Now"}{" "}
                </button>{" "}
              </div>{" "}
            </motion.div>{" "}
          </div>
        ))}{" "}
        {filteredEvents.length === 0 && (
          <div className="col-12 text-center p-5 text-muted fw-bold">
            {" "}
            <Filter size={48} className="mb-3 opacity-50" />{" "}
            <p>No events found for this category.</p>{" "}
          </div>
        )}{" "}
      </div>{" "}

      <Modal
        isOpen={showProposeModal}
        onClose={() => setShowProposeModal(false)}
        title="Propose Campus Event"
        actions={
          <>
            <button
              className="btn btn-secondary rounded-pill px-4"
              onClick={() => setShowProposeModal(false)}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary rounded-pill px-4 fw-bold"
              onClick={handleProposeEvent}
            >
              Submit Proposal
            </button>
          </>
        }
      >
        <form onSubmit={handleProposeEvent} className="d-flex flex-column gap-3">
          <div>
            <label className="form-label small fw-bold">Event Title *</label>
            <input
              type="text"
              required
              className="form-control"
              placeholder="e.g. AI & Robotics Hack Showcase"
              value={proposalForm.title}
              onChange={(e) => setProposalForm({ ...proposalForm, title: e.target.value })}
            />
          </div>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label small fw-bold">Category</label>
              <select
                className="form-select"
                value={proposalForm.type}
                onChange={(e) => setProposalForm({ ...proposalForm, type: e.target.value })}
              >
                <option value="Tech">Tech</option>
                <option value="Seminar">Seminar</option>
                <option value="Sports">Sports</option>
                <option value="Cultural">Cultural</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-bold">Date & Time</label>
              <input
                type="datetime-local"
                className="form-control"
                value={proposalForm.date}
                onChange={(e) => setProposalForm({ ...proposalForm, date: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="form-label small fw-bold">Location / Venue</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Main Auditorium / Innovation Lab 4"
              value={proposalForm.location}
              onChange={(e) => setProposalForm({ ...proposalForm, location: e.target.value })}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default Events;
