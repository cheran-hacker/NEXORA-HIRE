import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { hackathonService } from "../../services/api.js";
import {
  Box,
  Play,
  Users,
  Code,
  Calendar,
  Terminal,
  CheckCircle,
  Clock,
} from "lucide-react";
import { useToast } from "../../context/ToastContext";
const Countdown = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState("");
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = new Date(targetDate).getTime() - now;
      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft("Event Ended");
        return;
      }
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeft(`${days}d ${hours}h ${minutes}m`);
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);
  return (
    <span className="fw-black font-monospace text-primary">{timeLeft}</span>
  );
};
const HackathonBox = () => {
  const { addToast } = useToast();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGenerate, setShowGenerate] = useState(false);
  const [formData, setFormData] = useState({
    eventName: "",
    theme: "",
    startDate: "",
    endDate: "",
  });
  useEffect(() => {
    fetchEvents();
  }, []);
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await hackathonService.getHackathons();
      setEvents(res.data.data || []);
    } catch (err) {
      addToast("Failed to load Hackathons", "error");
    } finally {
      setLoading(false);
    }
  };
  const handleGenerate = async (e) => {
    e.preventDefault();
    try {
      await hackathonService.generateHackathonBox(formData);
      addToast("Hackathon-in-a-Box Deployed! 📦🚀", "success");
      setShowGenerate(false);
      setFormData({ eventName: "", theme: "", startDate: "", endDate: "" });
      fetchEvents();
    } catch (err) {
      addToast("Failed to deploy hackathon", "error");
    }
  };
  const handleJoin = async (id) => {
    try {
      await hackathonService.joinHackathon(id);
      addToast("Successfully registered for Hackathon!", "success");
      fetchEvents();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to join", "error");
    }
  };
  const handleFormTeams = async (id) => {
    try {
      await hackathonService.formTeams(id);
      addToast("Teams randomly generated!", "success");
      fetchEvents();
    } catch (err) {
      addToast("Failed to form teams", "error");
    }
  };
  if (loading)
    return (
      <div className="container-fluid py-4 d-flex justify-content-center">
        <div className="spinner-border text-primary"></div>
      </div>
    );
  return (
    <div
      className="container-fluid py-4 px-xl-5"
      style={{
        background: "var(--bg)",
        minHeight: "100dvh",
        color: "var(--text)",
      }}
    >
      {" "}
      <div className="d-flex justify-content-between align-items-center mb-5 flex-wrap gap-3">
        {" "}
        <div>
          {" "}
          <h2
            className="fw-black mb-1 d-flex align-items-center gap-2"
            style={{
              fontSize: "2.5rem",
              letterSpacing: "-0.02em",
              color: "var(--text)",
            }}
          >
            {" "}
            Hackathon-in-a-Box <Box size={28} className="text-primary" />{" "}
          </h2>{" "}
          <p
            className="mb-0 fw-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            One click to instantly spin up a full hackathon: registration, team
            lobbies, and rubrics.
          </p>{" "}
        </div>{" "}
        <button
          className="btn rounded-pill px-4 shadow-sm fw-bold hover-lift d-flex align-items-center gap-2"
          onClick={() => setShowGenerate(true)}
          style={{
            background:
              "linear-gradient(135deg, var(--primary), var(--purple))",
            color: "#fff",
            border: "none",
          }}
        >
          {" "}
          <Terminal size={20} /> Deploy New Event{" "}
        </button>{" "}
      </div>{" "}
      <div className="row g-4">
        {" "}
        {events.map((evt, i) => (
          <div className="col-lg-6" key={evt._id}>
            {" "}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bento-card p-0 h-100 overflow-hidden d-flex flex-column hover-glow"
              style={{
                borderLeft: "6px solid var(--primary)",
                background: "var(--surface)",
              }}
            >
              {" "}
              <div
                className="p-4 d-flex justify-content-between align-items-start border-bottom"
                style={{
                  background: "var(--surface-2)",
                  borderColor: "var(--border) !important",
                }}
              >
                {" "}
                <div>
                  {" "}
                  <div
                    className="badge rounded-pill mb-2 d-inline-flex align-items-center gap-1 shadow-sm px-3 py-1"
                    style={{ background: "var(--primary)", color: "#fff" }}
                  >
                    {" "}
                    <CheckCircle size={14} /> Instantly Generated{" "}
                  </div>{" "}
                  <h4
                    className="fw-black mb-1"
                    style={{ color: "var(--text)" }}
                  >
                    {evt.eventName}
                  </h4>{" "}
                  <div
                    className="small fw-bold"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Theme:{" "}
                    <span style={{ color: "var(--text)" }}>{evt.theme}</span>
                  </div>{" "}
                </div>{" "}
                <div
                  className={`badge ${evt.status === "Upcoming" ? "bg-warning-subtle text-warning border border-warning-subtle" : "bg-success-subtle text-success border border-success-subtle"} rounded-pill shadow-sm fs-6 px-3 py-2`}
                >
                  {" "}
                  {evt.status}{" "}
                </div>{" "}
              </div>{" "}
              <div className="p-4 flex-grow-1 row g-3">
                {" "}
                <div className="col-6 d-flex flex-column justify-content-center">
                  {" "}
                  <div
                    className="small fw-bold mb-1 d-flex align-items-center gap-1"
                    style={{ color: "var(--text-muted)" }}
                  >
                    <Calendar size={14} /> Starts
                  </div>{" "}
                  <div className="fw-semibold" style={{ color: "var(--text)" }}>
                    {new Date(evt.startDate).toLocaleString()}
                  </div>{" "}
                </div>{" "}
                <div className="col-6 d-flex flex-column justify-content-center">
                  {" "}
                  <div
                    className="small fw-bold mb-1 d-flex align-items-center gap-1"
                    style={{ color: "var(--text-muted)" }}
                  >
                    <Calendar size={14} /> Ends
                  </div>{" "}
                  <div className="fw-semibold" style={{ color: "var(--text)" }}>
                    {new Date(evt.endDate).toLocaleString()}
                  </div>{" "}
                </div>{" "}
                <div
                  className="col-12 text-center mt-3 p-3 rounded-3"
                  style={{
                    background: "var(--surface-3)",
                    border: "1px dashed var(--primary)",
                  }}
                >
                  {" "}
                  <div className="small text-muted fw-bold text-uppercase mb-1">
                    <Clock size={14} className="me-1" /> Time Remaining
                  </div>{" "}
                  <div className="fs-4">
                    <Countdown targetDate={evt.endDate} />
                  </div>{" "}
                </div>{" "}
                <div className="col-12 mt-4">
                  {" "}
                  <div className="d-flex align-items-center gap-3 mb-3">
                    {" "}
                    <div
                      className="rounded-circle p-3 shadow-sm"
                      style={{
                        background: "rgba(var(--primary-rgb), 0.1)",
                        color: "var(--primary)",
                      }}
                    >
                      {" "}
                      <Code size={24} />{" "}
                    </div>{" "}
                    <div>
                      {" "}
                      <h6
                        className="fw-bold mb-0"
                        style={{ color: "var(--text)" }}
                      >
                        Auto-Generated Assets Active:
                      </h6>{" "}
                      <span
                        className="small fw-semibold"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        Registration Portal • Team Matchmaking • Judging Rubrics
                      </span>{" "}
                    </div>{" "}
                  </div>{" "}
                </div>{" "}
              </div>{" "}
              <div
                className="p-4 border-top d-flex justify-content-between align-items-center"
                style={{
                  background: "var(--surface-2)",
                  borderColor: "var(--border) !important",
                }}
              >
                {" "}
                <div
                  className="small fw-bold d-flex align-items-center gap-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {" "}
                  <Users size={16} /> {evt.participants?.length || 0} Hackers
                  Registered{" "}
                </div>{" "}
                <div className="d-flex gap-2">
                  {" "}
                  <button
                    className="btn rounded-pill px-3 fw-bold hover-lift btn-outline-primary"
                    onClick={() => handleFormTeams(evt._id)}
                  >
                    {" "}
                    Form Teams{" "}
                  </button>{" "}
                  <button
                    className="btn rounded-pill px-4 fw-bold hover-lift"
                    onClick={() => handleJoin(evt._id)}
                    style={{ background: "var(--primary)", color: "#fff" }}
                  >
                    {" "}
                    Join{" "}
                  </button>{" "}
                </div>{" "}
              </div>{" "}
              {evt.teams?.length > 0 && (
                <div className="p-4" style={{ background: "var(--surface)" }}>
                  {" "}
                  <h6 className="fw-bold mb-3">Generated Teams:</h6>{" "}
                  <div className="d-flex flex-wrap gap-2">
                    {" "}
                    {evt.teams.map((t, idx) => (
                      <span
                        key={idx}
                        className="badge bg-secondary rounded-pill px-3 py-2"
                      >
                        {t.name} ({t.members?.length} members)
                      </span>
                    ))}{" "}
                  </div>{" "}
                </div>
              )}{" "}
            </motion.div>{" "}
          </div>
        ))}{" "}
        {events.length === 0 && (
          <div className="col-12 text-center p-5 bento-card ">
            {" "}
            <Box
              size={48}
              className="text-muted mb-3 opacity-25 mx-auto"
            />{" "}
            <h5 className="fw-bold text-muted">No hackathons deployed.</h5>{" "}
            <p className="text-muted small">
              Be the first to spin one up.
            </p>{" "}
          </div>
        )}{" "}
      </div>{" "}
      {/* Deploy Modal */}{" "}
      <AnimatePresence>
        {" "}
        {showGenerate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-backdrop-blur"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "rgba(0,0,0,0.02)",
              zIndex: 1050,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {" "}
            <div
              className="bento-card p-4 border shadow-lg"
              style={{ width: "90%", maxWidth: "500px" }}
            >
              {" "}
              <div className="d-flex align-items-center gap-3 mb-4">
                {" "}
                <div
                  className="p-3 rounded-4 shadow-sm"
                  style={{
                    background: "var(--surface-2)",
                    color: "var(--text)",
                    border: "1px solid var(--border)",
                  }}
                >
                  {" "}
                  <Terminal size={32} className="text-primary" />{" "}
                </div>{" "}
                <div>
                  {" "}
                  <h4 className="fw-bold mb-0" style={{ color: "var(--text)" }}>
                    Deploy Hackathon
                  </h4>{" "}
                  <p
                    className="small mb-0"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Instantly generate all infrastructure
                  </p>{" "}
                </div>{" "}
              </div>{" "}
              <form onSubmit={handleGenerate}>
                {" "}
                <div className="mb-3">
                  {" "}
                  <label className="form-label fw-bold">Event Name</label>{" "}
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={formData.eventName}
                    onChange={(e) =>
                      setFormData({ ...formData, eventName: e.target.value })
                    }
                    placeholder="e.g. CodeRed 2026"
                  />{" "}
                </div>{" "}
                <div className="mb-3">
                  {" "}
                  <label className="form-label fw-bold">Theme</label>{" "}
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={formData.theme}
                    onChange={(e) =>
                      setFormData({ ...formData, theme: e.target.value })
                    }
                    placeholder="e.g. AI for Climate Change"
                  />{" "}
                </div>{" "}
                <div className="row g-3 mb-4">
                  {" "}
                  <div className="col-6">
                    {" "}
                    <label className="form-label fw-bold">
                      Start Date & Time
                    </label>{" "}
                    <input
                      type="datetime-local"
                      className="form-control"
                      required
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData({ ...formData, startDate: e.target.value })
                      }
                    />{" "}
                  </div>{" "}
                  <div className="col-6">
                    {" "}
                    <label className="form-label fw-bold">
                      End Date & Time
                    </label>{" "}
                    <input
                      type="datetime-local"
                      className="form-control"
                      required
                      value={formData.endDate}
                      onChange={(e) =>
                        setFormData({ ...formData, endDate: e.target.value })
                      }
                    />{" "}
                  </div>{" "}
                </div>{" "}
                <div className="d-flex justify-content-end gap-2">
                  {" "}
                  <button
                    type="button"
                    className="btn btn-light rounded-pill px-4"
                    onClick={() => setShowGenerate(false)}
                  >
                    Cancel
                  </button>{" "}
                  <button
                    type="submit"
                    className="btn btn-dark rounded-pill px-4 d-flex align-items-center gap-2"
                  >
                    <Play size={16} /> Deploy Now
                  </button>{" "}
                </div>{" "}
              </form>{" "}
            </div>{" "}
          </motion.div>
        )}{" "}
      </AnimatePresence>{" "}
    </div>
  );
};
export default HackathonBox;
