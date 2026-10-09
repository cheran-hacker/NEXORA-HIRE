import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { hackathonService } from "../../services/api";
import { useToast } from "../../context/ToastContext";
const Hackathons = () => {
  const { addToast } = useToast();
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchHackathons = async () => {
      try {
        const res = await hackathonService.getHackathons();
        setHackathons(res.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHackathons();
  }, []);
  return (
    <div>
      {" "}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        {" "}
        <div>
          {" "}
          <h2 className="page-title mb-1">Hackathons</h2>{" "}
          <p className="page-subtitle">
            Build innovative projects, win prizes, and get hired.
          </p>{" "}
        </div>{" "}
        <button
          onClick={() =>
            addToast(
              "Looking for team members... Connect with others in the Forum!",
              "info",
            )
          }
          className="btn btn-primary rounded-pill px-4 fw-semibold"
        >
          {" "}
          <i className="bi bi-people-fill me-2" />
          Find a Team{" "}
        </button>{" "}
      </div>{" "}
      {/* Featured Hackathon Hero */}{" "}
      <motion.div
        className="rounded-4 shadow-sm mb-5 overflow-hidden position-relative"
        style={{ padding: 0, minHeight: 300 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {" "}
        <div className="row g-0 h-100">
          {" "}
          <div className="col-md-7 p-5 d-flex flex-column justify-content-center">
            {" "}
            <span className="badge bg-primary-subtle text-primary mb-3 align-self-start fw-bold px-3 py-2 rounded-pill">
              FEATURED
            </span>{" "}
            <h2 className="fw-black mb-3">Google Build with AI Hackathon</h2>{" "}
            <p
              className="text-secondary mb-4"
              style={{ fontSize: "1.1rem", maxWidth: 500 }}
            >
              {" "}
              Build the next generation of AI-powered applications using Gemini.
              Open to all university students globally.{" "}
            </p>{" "}
            <div className="d-flex flex-wrap gap-4 mb-4">
              {" "}
              <div>
                {" "}
                <p
                  className="mb-0 text-muted"
                  style={{
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Prize Pool
                </p>{" "}
                <h5 className="fw-bold mb-0 text-success">$50,000 USD</h5>{" "}
              </div>{" "}
              <div>
                {" "}
                <p
                  className="mb-0 text-muted"
                  style={{
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Deadline
                </p>{" "}
                <h5 className="fw-bold mb-0">Oct 25, 2026</h5>{" "}
              </div>{" "}
            </div>{" "}
            <div>
              {" "}
              <button
                onClick={async () => {
                  try {
                    const featured = hackathons[0];
                    if (featured) {
                      await hackathonService.register(featured._id);
                    }
                    addToast(
                      "Registered for the hackathon! Check your email for details. 🚀",
                      "success",
                    );
                  } catch (err) {
                    addToast(err.message || "Registration failed", "error");
                  }
                }}
                className="btn btn-primary rounded-pill px-5 py-2 fw-bold me-3"
              >
                Register Now
              </button>{" "}
              <button
                onClick={() =>
                  addToast(
                    "Scroll down to browse all hackathons and their details.",
                    "info",
                  )
                }
                className="btn btn-outline-secondary rounded-pill px-4 py-2 fw-semibold"
              >
                View Details
              </button>{" "}
            </div>{" "}
          </div>{" "}
          <div
            className="col-md-5 d-none d-md-block position-relative"
            style={{
              background:
                "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.1))",
            }}
          >
            {" "}
            <div className="mesh-gradient" />{" "}
            <i
              className="bi bi-rocket-takeoff-fill position-absolute text-primary"
              style={{
                fontSize: "12rem",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                opacity: 0.2,
              }}
            />{" "}
          </div>{" "}
        </div>{" "}
      </motion.div>{" "}
      {/* Filters */}{" "}
      <div className="d-flex flex-wrap gap-3 mb-4">
        {" "}
        <div className="global-search flex-grow-1" style={{ maxWidth: 300 }}>
          {" "}
          <i className="bi bi-search search-icon" />{" "}
          <input
            className="form-control"
            placeholder="Search hackathons..."
          />{" "}
        </div>{" "}
        <select className="form-select w-auto">
          {" "}
          <option>All Statuses</option> <option>Registering</option>{" "}
          <option>In Progress</option> <option>Upcoming</option>{" "}
        </select>{" "}
        <select className="form-select w-auto">
          {" "}
          <option>All Modes</option> <option>Online</option>{" "}
          <option>In-Person</option> <option>Hybrid</option>{" "}
        </select>{" "}
      </div>{" "}
      {/* Grid */}{" "}
      <div className="row g-4">
        {" "}
        {hackathons.map((hack, i) => (
          <div className="col-md-6 col-xl-4" key={hack._id || hack.id}>
            {" "}
            <motion.div
              className="rounded-4 shadow-sm h-100 d-flex flex-column"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5 }}
            >
              {" "}
              <div className="d-flex justify-content-between align-items-start mb-3">
                {" "}
                <div
                  className="d-flex align-items-center justify-content-center rounded-3"
                  style={{
                    width: 64,
                    height: 64,
                    background: `${hack.color}15`,
                    color: hack.color,
                  }}
                >
                  {" "}
                  <i className={`bi ${hack.image} fs-1`} />{" "}
                </div>{" "}
                <span
                  className={`badge ${hack.status === "Registering" ? "bg-success-subtle text-success" : hack.status === "In Progress" ? "bg-primary-subtle text-primary" : "bg-secondary-subtle text-secondary"}`}
                >
                  {" "}
                  {hack.status}{" "}
                </span>{" "}
              </div>{" "}
              <h5 className="fw-bold mb-1">{hack.title}</h5>{" "}
              <p className="text-muted mb-3" style={{ fontSize: "0.85rem" }}>
                by{" "}
                <span className="fw-semibold text-body">{hack.organizer}</span>
              </p>{" "}
              <div className="row g-2 mb-4">
                {" "}
                <div className="col-6">
                  {" "}
                  <div className="p-2 rounded bg-secondary-subtle">
                    {" "}
                    <p
                      className="mb-0 text-muted"
                      style={{ fontSize: "0.7rem", textTransform: "uppercase" }}
                    >
                      Prize
                    </p>{" "}
                    <p className="mb-0 fw-bold fs-6">{hack.prize}</p>{" "}
                  </div>{" "}
                </div>{" "}
                <div className="col-6">
                  {" "}
                  <div className="p-2 rounded bg-secondary-subtle">
                    {" "}
                    <p
                      className="mb-0 text-muted"
                      style={{ fontSize: "0.7rem", textTransform: "uppercase" }}
                    >
                      Team
                    </p>{" "}
                    <p className="mb-0 fw-bold fs-6">{hack.teamSize}</p>{" "}
                  </div>{" "}
                </div>{" "}
                <div className="col-12">
                  {" "}
                  <div className="d-flex gap-2">
                    {" "}
                    <span className="badge bg-body border text-muted">
                      <i className="bi bi-geo-alt me-1" />
                      {hack.mode}
                    </span>{" "}
                    <span className="badge bg-body border text-muted">
                      <i className="bi bi-clock me-1" />
                      {hack.deadline}
                    </span>{" "}
                  </div>{" "}
                </div>{" "}
              </div>{" "}
              <div className="mt-auto">
                {" "}
                <button
                  onClick={async () => {
                    try {
                      await hackathonService.register(hack._id);
                      addToast(
                        hack.status === "Registering"
                          ? "Registered! 🎉"
                          : "Opening details...",
                        "success",
                      );
                    } catch (err) {
                      addToast(err.message || "Action failed", "error");
                    }
                  }}
                  className="btn btn-outline-primary w-100 rounded-pill fw-semibold"
                >
                  {" "}
                  {hack.status === "Registering"
                    ? "Register"
                    : "View Details"}{" "}
                </button>{" "}
              </div>{" "}
            </motion.div>{" "}
          </div>
        ))}{" "}
      </div>{" "}
    </div>
  );
};
export default Hackathons;
