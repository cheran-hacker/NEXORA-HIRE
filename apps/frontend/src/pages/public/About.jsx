import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
const TEAM = [
  {
    name: "Aarav Kapoor",
    role: "CEO & Co-Founder",
    avatar: "AK",
    bg: "#6366f1",
  },
  { name: "Meera Nair", role: "CTO & Co-Founder", avatar: "MN", bg: "#10b981" },
  { name: "Rohan Singh", role: "Head of AI/ML", avatar: "RS", bg: "#a855f7" },
  { name: "Priya Verma", role: "Head of Product", avatar: "PV", bg: "#f59e0b" },
  { name: "Kiran Joshi", role: "Lead Engineer", avatar: "KJ", bg: "#3b82f6" },
  { name: "Ananya Das", role: "Design Lead", avatar: "AD", bg: "#ec4899" },
];
const VALUES = [
  {
    icon: "bi-lightbulb-fill",
    color: "#f59e0b",
    title: "Innovation First",
    desc: "We constantly push boundaries to bring the latest AI technology into the hands of students and educators.",
  },
  {
    icon: "bi-heart-fill",
    color: "#ef4444",
    title: "Student-Centric",
    desc: "Every feature is designed with student outcomes at the center. Your success is our mission.",
  },
  {
    icon: "bi-shield-check",
    color: "#10b981",
    title: "Trust & Transparency",
    desc: "We operate with complete transparency in our AI systems and data practices.",
  },
  {
    icon: "bi-globe",
    color: "#6366f1",
    title: "Inclusive Access",
    desc: "We believe quality career guidance should be accessible to every student regardless of background.",
  },
];
const About = () => {
  return (
    <div>
      {" "}
      {/* Hero */}{" "}
      <section
        className="hero-section d-flex align-items-center"
        style={{ minHeight: "55vh" }}
      >
        {" "}
        <div className="mesh-gradient" /> <div className="grid-overlay" />{" "}
        <div
          className="container text-center position-relative py-5"
          style={{ zIndex: 2 }}
        >
          {" "}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            {" "}
            <div className="glass-badge mx-auto mb-4">
              <i className="bi bi-info-circle-fill" /> Our Story
            </div>{" "}
            <h1
              className="text-foreground fw-black mb-4"
              style={{ fontSize: "3rem", letterSpacing: "-0.04em" }}
            >
              {" "}
              Building the Future of{" "}
              <span className="display-gradient">Career Intelligence</span>{" "}
            </h1>{" "}
            <p
              className="text-foreground-50 mx-auto lead"
              style={{ maxWidth: 600, lineHeight: 1.7 }}
            >
              {" "}
              NEXORA was founded with one mission: to democratize access to
              world-class career development tools and bridge the gap between
              education and employment.{" "}
            </p>{" "}
          </motion.div>{" "}
        </div>{" "}
      </section>{" "}
      {/* Mission */}{" "}
      <section
        style={{ paddingTop: 80, paddingBottom: 80, background: "var(--bg)" }}
      >
        {" "}
        <div className="container">
          {" "}
          <div className="row g-5 align-items-center">
            {" "}
            <div className="col-lg-6">
              {" "}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                {" "}
                <div className="glass-badge mb-3">
                  <i className="bi bi-flag-fill" /> Our Mission
                </div>{" "}
                <h2
                  className="fw-black mb-4"
                  style={{
                    fontSize: "2.2rem",
                    letterSpacing: "-0.04em",
                    color: "var(--text)",
                  }}
                >
                  {" "}
                  Empowering Students with{" "}
                  <span className="display-gradient">AI-Powered</span> Career
                  Tools{" "}
                </h2>{" "}
                <p
                  style={{
                    color: "var(--text-secondary)",
                    lineHeight: 1.8,
                    marginBottom: 20,
                  }}
                >
                  {" "}
                  We saw a fragmented ecosystem where students used 10+
                  different platforms for resume building, skill assessment, job
                  applications, interview prep, and placement tracking — none of
                  which talked to each other.{" "}
                </p>{" "}
                <p
                  style={{
                    color: "var(--text-secondary)",
                    lineHeight: 1.8,
                    marginBottom: 28,
                  }}
                >
                  {" "}
                  NEXORA was built to unify all of that into a single,
                  intelligent platform — powered by AI, designed for scale, and
                  built for real outcomes.{" "}
                </p>{" "}
                <div className="row g-3">
                  {" "}
                  {[
                    { value: "50K+", label: "Students Served" },
                    { value: "500+", label: "Colleges" },
                    { value: "2K+", label: "Companies" },
                    { value: "₹8L", label: "Avg Package" },
                  ].map((s) => (
                    <div className="col-6" key={s.label}>
                      {" "}
                      <div className="kpi-card">
                        {" "}
                        <div
                          className="metric-value"
                          style={{ color: "var(--primary)" }}
                        >
                          {s.value}
                        </div>{" "}
                        <div
                          style={{
                            fontSize: "0.82rem",
                            color: "var(--text-muted)",
                          }}
                        >
                          {s.label}
                        </div>{" "}
                      </div>{" "}
                    </div>
                  ))}{" "}
                </div>{" "}
              </motion.div>{" "}
            </div>{" "}
            <div className="col-lg-6">
              {" "}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="glass-panel p-4"
              >
                {" "}
                <div className="timeline">
                  {" "}
                  {[
                    {
                      year: "2022",
                      event:
                        "Founded by IIT alumni with vision to unify career tools",
                      color: "#6366f1",
                    },
                    {
                      year: "2023",
                      event: "Launched beta with 5 colleges and 2,000 students",
                      color: "#10b981",
                    },
                    {
                      year: "2024",
                      event:
                        "Integrated Google Gemini AI, reached 50K students",
                      color: "#f59e0b",
                    },
                    {
                      year: "2025",
                      event:
                        "Expanded to 500+ colleges, 2,000+ company partnerships",
                      color: "#a855f7",
                    },
                  ].map((t, i) => (
                    <div key={i} className="timeline-item">
                      {" "}
                      <div
                        className="timeline-dot"
                        style={{
                          background: t.color,
                          boxShadow: `0 0 0 2px ${t.color}`,
                        }}
                      />{" "}
                      <div className="d-flex gap-3 align-items-start ps-1">
                        {" "}
                        <span
                          className="fw-black"
                          style={{
                            color: t.color,
                            minWidth: 42,
                            fontSize: "0.9rem",
                          }}
                        >
                          {t.year}
                        </span>{" "}
                        <p
                          style={{
                            color: "var(--text-secondary)",
                            fontSize: "0.9rem",
                            lineHeight: 1.5,
                            margin: 0,
                          }}
                        >
                          {t.event}
                        </p>{" "}
                      </div>{" "}
                    </div>
                  ))}{" "}
                </div>{" "}
              </motion.div>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
      </section>{" "}
      {/* Values */}{" "}
      <section
        style={{
          paddingTop: 80,
          paddingBottom: 80,
          background: "var(--bg-secondary)",
        }}
      >
        {" "}
        <div className="container">
          {" "}
          <motion.div
            className="text-center mb-5"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {" "}
            <div className="glass-badge mx-auto mb-3">
              <i className="bi bi-gem" /> Our Values
            </div>{" "}
            <h2
              className="fw-black"
              style={{
                fontSize: "2.2rem",
                letterSpacing: "-0.04em",
                color: "var(--text)",
              }}
            >
              What Drives Us
            </h2>{" "}
          </motion.div>{" "}
          <div className="row g-4">
            {" "}
            {VALUES.map((v, i) => (
              <div className="col-md-6 col-lg-3" key={i}>
                {" "}
                <motion.div
                  className="feature-card h-100 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  {" "}
                  <div
                    className="icon-circle-lg mx-auto mb-3"
                    style={{ background: `${v.color}18`, color: v.color }}
                  >
                    {" "}
                    <i className={`bi ${v.icon} fs-4`} />{" "}
                  </div>{" "}
                  <h5 className="fw-bold mb-2">{v.title}</h5>{" "}
                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: "var(--text-secondary)",
                      lineHeight: 1.6,
                      margin: 0,
                    }}
                  >
                    {v.desc}
                  </p>{" "}
                </motion.div>{" "}
              </div>
            ))}{" "}
          </div>{" "}
        </div>{" "}
      </section>{" "}
      {/* Team */}{" "}
      <section
        style={{ paddingTop: 80, paddingBottom: 80, background: "var(--bg)" }}
      >
        {" "}
        <div className="container">
          {" "}
          <motion.div
            className="text-center mb-5"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {" "}
            <div className="glass-badge mx-auto mb-3">
              <i className="bi bi-people-fill" /> The Team
            </div>{" "}
            <h2
              className="fw-black"
              style={{
                fontSize: "2.2rem",
                letterSpacing: "-0.04em",
                color: "var(--text)",
              }}
            >
              {" "}
              Meet the <span className="display-gradient">Builders</span>{" "}
            </h2>{" "}
          </motion.div>{" "}
          <div className="row g-4 justify-content-center">
            {" "}
            {TEAM.map((m, i) => (
              <div className="col-md-4 col-lg-2" key={i}>
                {" "}
                <motion.div
                  className="rounded-4 shadow-sm text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -6 }}
                >
                  {" "}
                  <div
                    className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center fw-black"
                    style={{
                      width: 72,
                      height: 72,
                      background: m.bg,
                      color: "white",
                      fontSize: "1.2rem",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {" "}
                    {m.avatar}{" "}
                  </div>{" "}
                  <h6 className="fw-bold mb-1" style={{ fontSize: "0.9rem" }}>
                    {m.name}
                  </h6>{" "}
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-muted)",
                      margin: 0,
                    }}
                  >
                    {m.role}
                  </p>{" "}
                </motion.div>{" "}
              </div>
            ))}{" "}
          </div>{" "}
        </div>{" "}
      </section>{" "}
      {/* CTA */}{" "}
      <section
        style={{
          paddingTop: 60,
          paddingBottom: 80,
          background: "var(--bg-secondary)",
        }}
      >
        {" "}
        <div className="container text-center">
          {" "}
          <h2
            className="fw-black mb-3"
            style={{
              fontSize: "2rem",
              letterSpacing: "-0.04em",
              color: "var(--text)",
            }}
          >
            Join Our Mission
          </h2>{" "}
          <p style={{ color: "var(--text-secondary)", marginBottom: 28 }}>
            Become part of the movement changing how careers are built.
          </p>{" "}
          <div className="d-flex gap-3 justify-content-center flex-wrap">
            {" "}
            <Link
              to="/login"
              className="btn btn-primary btn-lg rounded-pill px-5 fw-bold"
            >
              Get Started Free
            </Link>{" "}
            <Link
              to="/contact"
              className="btn btn-outline-secondary btn-lg rounded-pill px-5 fw-semibold"
            >
              Contact Us
            </Link>{" "}
          </div>{" "}
        </div>{" "}
      </section>{" "}
    </div>
  );
};
export default About;
