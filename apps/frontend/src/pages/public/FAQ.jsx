import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
const CATEGORIES = [
  "All",
  "Students",
  "Placement Officers",
  "Institutions",
  "Technical",
  "Billing",
];
const FAQS = [
  {
    cat: "Students",
    q: "Is NEXORA free for students?",
    a: "Yes! Students get free access to core features including the resume analyzer, job board, skill assessments, career roadmap, and the community forum. Premium AI features like unlimited interview simulations are available on paid plans.",
  },
  {
    cat: "Students",
    q: "How does the AI Resume Analyzer work?",
    a: "Our AI (powered by Google Gemini) parses your resume, extracts skills, calculates ATS compatibility scores, detects keyword gaps, identifies missing skills, and provides actionable improvement suggestions in under 30 seconds.",
  },
  {
    cat: "Students",
    q: "Can I practice company-specific interviews?",
    a: "Yes! The Interview Simulator includes company-specific modes for Google, Microsoft, Amazon, TCS, Infosys, Wipro, and 50+ other companies. Each mode uses real interview patterns and questions from those companies.",
  },
  {
    cat: "Students",
    q: "How does the Career Readiness Score work?",
    a: "Your Career Readiness Score is calculated by our AI based on your skills, CGPA, projects, internships, certifications, assessment scores, and activity on the platform. It updates in real-time as you improve.",
  },
  {
    cat: "Students",
    q: "Can I track my internships on NEXORA?",
    a: "Absolutely! You can log internship details, tasks, outcomes and upload certificates. All internship history becomes part of your verified academic profile visible to Placement Officers.",
  },
  {
    cat: "Placement Officers",
    q: "How do Placement Officers find candidates?",
    a: "Placement Officers can search candidates by skills, CGPA, college, branch, assessment scores, and more. Our AI ranking system automatically surfaces the best candidates for each job role.",
  },
  {
    cat: "Placement Officers",
    q: "Can I create hiring drives on NEXORA?",
    a: "Yes! Create complete hiring drives with eligibility criteria, test rounds, interview rounds, and offer management. The platform handles everything from job posting to offer letter generation.",
  },
  {
    cat: "Placement Officers",
    q: "Is company data secure?",
    a: "Absolutely. All company data and candidate information is encrypted, and you control exactly what's visible to candidates. We are SOC 2 Type II compliant and follow strict data privacy practices.",
  },
  {
    cat: "Institutions",
    q: "How do institutions get onboarded?",
    a: "Write to institutions@nexora.ai for a custom onboarding. Our team will set up your institution, configure departments, import student data, and train your placement team — all within 48 hours.",
  },
  {
    cat: "Institutions",
    q: "What analytics does the placement officer dashboard provide?",
    a: "The placement command center includes placement statistics, salary analytics (by department, branch, company type), hiring funnel analytics, year-over-year comparisons, and exportable PDF/Excel reports.",
  },
  {
    cat: "Technical",
    q: "What browsers does NEXORA support?",
    a: "NEXORA works on all modern browsers including Chrome, Firefox, Edge, and Safari. The platform is fully mobile-responsive and works on iOS and Android browsers.",
  },
  {
    cat: "Technical",
    q: "Is there an API available?",
    a: "Yes! NEXORA provides a REST API for institutions to integrate with existing ERP/LMS systems. Documentation is available at docs.nexora.ai. Contact us for API credentials.",
  },
  {
    cat: "Billing",
    q: "What are the pricing plans?",
    a: "Students: Free tier + Pro at ₹199/month. Institutions: Contact sales for custom pricing based on student count. Placement Officers: Free posting + premium candidate access plans available.",
  },
];
const FAQ = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [openIndex, setOpenIndex] = useState(null);
  const [search, setSearch] = useState("");
  const filtered = FAQS.filter(
    (f) =>
      (activeCategory === "All" || f.cat === activeCategory) &&
      (search === "" ||
        f.q.toLowerCase().includes(search.toLowerCase()) ||
        f.a.toLowerCase().includes(search.toLowerCase())),
  );
  return (
    <div>
      {" "}
      {/* Hero */}{" "}
      <section
        className="hero-section d-flex align-items-center"
        style={{ minHeight: "40vh" }}
      >
        {" "}
        <div className="mesh-gradient" />{" "}
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
              <i className="bi bi-question-circle-fill" /> FAQ
            </div>{" "}
            <h1
              className="text-foreground fw-black mb-4"
              style={{ fontSize: "3rem", letterSpacing: "-0.04em" }}
            >
              {" "}
              Frequently Asked{" "}
              <span className="display-gradient">Questions</span>{" "}
            </h1>{" "}
            <p className="text-foreground-50 mb-5 lead">
              Everything you need to know about NEXORA
            </p>{" "}
            {/* Search */}{" "}
            <div className="mx-auto" style={{ maxWidth: 500 }}>
              {" "}
              <div className="position-relative">
                {" "}
                <i
                  className="bi bi-search position-absolute"
                  style={{
                    left: 18,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "rgba(0,0,0,0.05)",
                    zIndex: 2,
                  }}
                />{" "}
                <input
                  className="form-control form-control-lg rounded-pill glass-input text-foreground"
                  style={{ paddingLeft: 48, fontSize: "1rem" }}
                  placeholder="Search questions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />{" "}
              </div>{" "}
            </div>{" "}
          </motion.div>{" "}
        </div>{" "}
      </section>{" "}
      <section
        style={{ paddingTop: 60, paddingBottom: 80, background: "var(--bg)" }}
      >
        {" "}
        <div className="container">
          {" "}
          {/* Category Pills */}{" "}
          <div className="d-flex flex-wrap gap-2 justify-content-center mb-5">
            {" "}
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="btn rounded-pill px-4 fw-semibold"
                style={{
                  fontSize: "0.875rem",
                  background:
                    activeCategory === cat
                      ? "var(--primary)"
                      : "var(--bg-secondary)",
                  color:
                    activeCategory === cat ? "white" : "var(--text-secondary)",
                  border:
                    activeCategory === cat ? "none" : "1px solid var(--border)",
                  transition: "all 0.2s",
                }}
              >
                {" "}
                {cat}{" "}
              </button>
            ))}{" "}
          </div>{" "}
          <div className="row justify-content-center">
            {" "}
            <div className="col-lg-9">
              {" "}
              {filtered.length === 0 ? (
                <div className="text-center py-5">
                  {" "}
                  <i
                    className="bi bi-search d-block mb-3"
                    style={{
                      fontSize: "2.5rem",
                      color: "var(--text-muted)",
                      opacity: 0.4,
                    }}
                  />{" "}
                  <p style={{ color: "var(--text-muted)" }}>
                    No questions match your search.
                  </p>{" "}
                </div>
              ) : (
                filtered.map((faq, i) => (
                  <motion.div
                    key={`${activeCategory}-${i}`}
                    className="glass-panel mb-3 overflow-hidden"
                    style={{ padding: 0, cursor: "pointer" }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  >
                    {" "}
                    <div
                      className="d-flex align-items-center justify-content-between"
                      style={{ padding: "20px 24px" }}
                    >
                      {" "}
                      <div className="d-flex align-items-start gap-3">
                        {" "}
                        <div
                          className="icon-circle flex-shrink-0"
                          style={{
                            background: "rgba(99,102,241,0.1)",
                            color: "var(--primary)",
                            width: 32,
                            height: 32,
                          }}
                        >
                          {" "}
                          <i
                            className="bi bi-question-lg"
                            style={{ fontSize: "0.85rem" }}
                          />{" "}
                        </div>{" "}
                        <h6
                          className="mb-0 fw-semibold"
                          style={{ color: "var(--text)", lineHeight: 1.4 }}
                        >
                          {faq.q}
                        </h6>{" "}
                      </div>{" "}
                      <i
                        className={`bi ${openIndex === i ? "bi-chevron-up" : "bi-chevron-down"} flex-shrink-0 ms-3`}
                        style={{
                          color: "var(--text-muted)",
                          transition: "transform 0.2s",
                          fontSize: "0.85rem",
                        }}
                      />{" "}
                    </div>{" "}
                    <AnimatePresence>
                      {" "}
                      {openIndex === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          style={{ overflow: "hidden" }}
                        >
                          {" "}
                          <div
                            style={{
                              padding: "0 24px 20px 68px",
                              color: "var(--text-secondary)",
                              fontSize: "0.9rem",
                              lineHeight: 1.75,
                            }}
                          >
                            {" "}
                            {faq.a}{" "}
                          </div>{" "}
                        </motion.div>
                      )}{" "}
                    </AnimatePresence>{" "}
                  </motion.div>
                ))
              )}{" "}
            </div>{" "}
          </div>{" "}
          {/* Still have questions */}{" "}
          <motion.div
            className="text-center mt-5 p-5 rounded-4 shadow-sm mx-auto"
            style={{ maxWidth: 560 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {" "}
            <div
              className="icon-circle-lg mx-auto mb-3"
              style={{
                background: "rgba(99,102,241,0.12)",
                color: "var(--primary)",
              }}
            >
              {" "}
              <i className="bi bi-chat-dots-fill fs-3" />{" "}
            </div>{" "}
            <h4 className="fw-bold mb-2">Still have questions?</h4>{" "}
            <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>
              {" "}
              Our support team is ready to help. Reach us at{" "}
              <strong>hello@nexora.ai</strong>{" "}
            </p>{" "}
            <a
              href="/contact"
              className="btn btn-primary rounded-pill px-5 fw-bold"
            >
              {" "}
              <i className="bi bi-envelope me-2" />
              Contact Support{" "}
            </a>{" "}
          </motion.div>{" "}
        </div>{" "}
      </section>{" "}
    </div>
  );
};
export default FAQ;
