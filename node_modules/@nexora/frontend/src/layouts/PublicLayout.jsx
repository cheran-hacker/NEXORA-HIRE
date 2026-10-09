import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Menu, X } from "lucide-react";
const NAV_LINKS = [
  { label: "Features", href: "/#features", isHash: true },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
  { label: "FAQ", to: "/faq" },
];
import { useTheme } from "../context/ThemeContext.jsx";
const PublicLayout = () => {
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  
  useEffect(() => setMobileOpen(false), [location]);

  // Handle smooth scrolling for hash links
  const handleNavClick = (e, link) => {
    if (link.isHash) {
      e.preventDefault();
      setMobileOpen(false);
      
      const hash = link.href.split('#')[1];
      
      if (location.pathname !== '/') {
        // If not on landing page, navigate to landing page first then scroll
        navigate('/', { state: { scrollTo: hash } });
      } else {
        // Already on landing page, just scroll
        const element = document.getElementById(hash);
        if (element) {
          const y = element.getBoundingClientRect().top + window.scrollY - 100;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }
    }
  };

  // Listen for navigation state to scroll after page load
  useEffect(() => {
    if (location.pathname === '/' && location.state?.scrollTo) {
      setTimeout(() => {
        const element = document.getElementById(location.state.scrollTo);
        if (element) {
          const y = element.getBoundingClientRect().top + window.scrollY - 100;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
        // Clear the state so it doesn't re-scroll on refresh
        navigate('/', { replace: true, state: {} });
      }, 100);
    }
  }, [location, navigate]);

  return (
    <div
      style={{
        background: "var(--bg)",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        color: "var(--text)",
      }}
    >
      {/* ── Navbar ─────────────────────────────── */}
      <nav className="public-navbar fixed-top" style={{
          background: scrolled ? "var(--surface)" : "var(--bg)",
          backdropFilter: scrolled ? "blur(10px)" : "none",
          borderBottom: scrolled ? "1px solid var(--border)" : "1px solid transparent",
          transition: "all 0.3s ease",
          zIndex: 1030,
        }}>
        <div className="container d-flex align-items-center h-100" style={{ height: "68px" }}>
          <Link
            to="/"
            className="fw-black"
            style={{
              fontSize: "1.6rem",
              textDecoration: "none",
              letterSpacing: "-0.05em",
              color: "var(--text)",
            }}
          >
            Nexora Campus
          </Link>

          {/* Desktop links */}
          <div className="d-none d-md-flex align-items-center gap-2 mx-auto">
            {NAV_LINKS.map((link) =>
              link.to ? (
                <Link
                  key={link.label}
                  to={link.to}
                  className="nav-link-nexora fw-semibold"
                  style={{
                    padding: "8px 16px",
                    borderRadius: 99,
                    color: location.pathname === link.to ? "var(--primary)" : "var(--text-secondary)",
                    textDecoration: "none"
                  }}
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link)}
                  className="nav-link-nexora fw-semibold"
                  style={{
                    padding: "8px 16px",
                    borderRadius: 99,
                    color: "var(--text-secondary)",
                    textDecoration: "none",
                    cursor: "pointer"
                  }}
                >
                  {link.label}
                </a>
              )
            )}
          </div>

          <div className="d-flex align-items-center gap-3 ms-auto">
            <button
              className="btn btn-link p-0 d-none d-md-flex align-items-center justify-content-center hover-scale"
              onClick={toggleTheme}
              style={{
                transition: "color 0.2s",
                color: "var(--text-secondary)",
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "var(--bg-secondary)",
                border: "1px solid var(--border)",
              }}
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Link
              to="/login"
              className="btn btn-link text-decoration-none fw-bold d-none d-md-block"
              style={{ fontSize: "0.9rem", color: "var(--text)" }}
            >
              Sign In
            </Link>
            <Link
              to="/login"
              className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm hover-scale"
              style={{ fontSize: "0.9rem" }}
            >
              Get Started
            </Link>
            <button
              className="btn d-md-none p-1 border-0 bg-transparent"
              style={{ color: "var(--text)" }}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="d-md-none position-fixed w-100"
            style={{
              top: 68,
              left: 0,
              right: 0,
              background: "var(--surface)",
              zIndex: 999,
              padding: "24px",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <div className="d-flex flex-column gap-3">
              {NAV_LINKS.map((link) =>
                link.to ? (
                  <Link
                    key={link.label}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className="nav-link-nexora fw-bold py-2 text-decoration-none"
                    style={{
                      color: location.pathname === link.to ? "var(--primary)" : "var(--text)",
                      borderBottom: "1px solid var(--border)"
                    }}
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link)}
                    className="nav-link-nexora fw-bold py-2 text-decoration-none"
                    style={{ color: "var(--text)", borderBottom: "1px solid var(--border)", cursor: "pointer" }}
                  >
                    {link.label}
                  </a>
                )
              )}
            </div>
            
            <div className="mt-4 pt-4 border-top" style={{ borderColor: "var(--border) !important" }}>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <span className="fw-semibold text-muted">Theme</span>
                <button
                  className="btn btn-outline-secondary rounded-circle p-2 d-flex align-items-center justify-content-center"
                  onClick={toggleTheme}
                  style={{ width: 40, height: 40, borderColor: "var(--border)" }}
                >
                  {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
                </button>
              </div>
              <Link to="/login" onClick={() => setMobileOpen(false)} className="btn btn-outline-primary w-100 mb-3 rounded-pill fw-bold py-2">
                Sign In
              </Link>{" "}
              <Link
                to="/login"
                className="btn btn-primary rounded-pill py-3 fw-bold shadow-sm hover-scale"
              >
                Get Started
              </Link>{" "}
            </div>{" "}
          </motion.div>
        )}{" "}
      </AnimatePresence>{" "}
      {/* Page Content */}{" "}
      <div style={{ flex: 1 }}>
        {" "}
        <Outlet />{" "}
      </div>{" "}
      {/* ── Footer ─────────────────────────────── */}{" "}
      <footer
        className="nexora-footer py-6"
        style={{
          background: "var(--surface-2)",
          borderTop: "1px solid var(--border)",
        }}
      >
        {" "}
        <div className="container">
          {" "}
          <div className="row g-5 mb-5">
            {" "}
            <div className="col-lg-4">
              {" "}
              <div
                className="fw-black mb-3 text-gradient-primary"
                style={{ fontSize: "1.8rem", letterSpacing: "-0.05em" }}
              >
                Nexora Campus
              </div>{" "}
              <p
                style={{
                  color: "var(--text-secondary)",
                  maxWidth: 300,
                  lineHeight: 1.7,
                  fontSize: "0.95rem",
                }}
              >
                {" "}
                The OS for Next-Gen Careers. Unifying AI assessments, skills,
                and placements into one platform.{" "}
              </p>{" "}
              <div className="d-flex gap-3 mt-4">
                {" "}
                {[
                  "bi-twitter-x",
                  "bi-linkedin",
                  "bi-github",
                  "bi-instagram",
                ].map((iconClass, i) => (
                  <a
                    key={i}
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="d-flex align-items-center justify-content-center rounded-circle hover-scale"
                    style={{
                      width: 42,
                      height: 42,
                      background: "var(--bg)",
                      color: "var(--text-secondary)",
                      border: "1px solid var(--border)",
                      transition: "all 0.2s",
                      textDecoration: "none",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "var(--primary)";
                      e.currentTarget.style.color = "white";
                      e.currentTarget.style.borderColor = "var(--primary)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "var(--bg)";
                      e.currentTarget.style.color = "var(--text-secondary)";
                      e.currentTarget.style.borderColor = "var(--border)";
                    }}
                  >
                    {" "}
                    <i className={`bi ${iconClass} fs-5`} />{" "}
                  </a>
                ))}{" "}
              </div>{" "}
            </div>{" "}
            {[
              {
                title: "Platform",
                links: [
                  { label: "Student Dashboard", to: "/student/dashboard" },
                  { label: "Recruiter Hub", to: "/placement/recruiter-jobs" },
                  { label: "Placement Center", to: "/placement/dashboard" },
                  { label: "Alumni Network", to: "/alumni/dashboard" },
                ],
              },
              {
                title: "Features",
                links: [
                  { label: "AI Resume Analyzer", to: "/student/resume" },
                  { label: "Voice Copilot", to: "/student/interviews" },
                  { label: "Live Sandbox", to: "/student/code-roast" },
                  { label: "Career Analytics", to: "/student/learning-paths" },
                  { label: "Skill Graph", to: "/student/learning-paths" },
                ],
              },
              {
                title: "Company",
                links: [
                  { label: "About Us", to: "/about" },
                  { label: "Contact", to: "/contact" },
                  { label: "FAQ", to: "/faq" },
                  { label: "Privacy", to: "/privacy" },
                  { label: "Terms", to: "/terms" },
                ],
              },
            ].map((col) => (
              <div className="col-lg-2 col-md-4 col-6" key={col.title}>
                <h6 className="fw-bold mb-4" style={{ fontSize: "0.95rem", color: "var(--text)" }}>
                  {col.title}
                </h6>
                <ul className="list-unstyled d-flex flex-column gap-3">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link
                        to={l.to}
                        className="text-decoration-none fw-medium"
                        style={{ fontSize: "0.9rem", color: "var(--text-secondary)", transition: "color 0.2s" }}
                        onMouseEnter={(e) => (e.target.style.color = "var(--primary)")}
                        onMouseLeave={(e) => (e.target.style.color = "var(--text-secondary)")}
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-top pt-4 mt-5" style={{ borderColor: "var(--border) !important" }}>
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 fw-medium" style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              <p className="mb-0">© 2026 NEXORA Technologies. All rights reserved.</p>
              <div className="d-flex gap-4">
                <Link to="/about" className="text-decoration-none" style={{ color: "inherit" }}>Status</Link>
                <Link to="/privacy" className="text-decoration-none" style={{ color: "inherit" }}>Security</Link>
                <Link to="/terms" className="text-decoration-none" style={{ color: "inherit" }}>Terms</Link>
              </div>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
      </footer>{" "}
    </div>
  );
};
export default PublicLayout;
