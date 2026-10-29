import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Filter,
  BookOpen,
  Star,
  Building2,
  Briefcase,
  ChevronRight,
  Sparkles,
  MapPin,
  Calendar,
  Clock,
  X,
  ExternalLink,
  User,
  CheckCircle2,
  SlidersHorizontal,
  Users,
  Target,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api.js";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";

export default function AlumniDirectory() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all"); // 'all' | 'mentors' | 'recent' | companyName
  const [selectedCompany, setSelectedCompany] = useState("all");
  const [selectedGradYear, setSelectedGradYear] = useState("all");
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [isMatchedMode, setIsMatchedMode] = useState(false);

  // Modals state
  const [selectedAlum, setSelectedAlum] = useState(null); // For booking
  const [profileAlum, setProfileAlum] = useState(null);   // For rich profile drawer
  const [bookingTopic, setBookingTopic] = useState("General Career Guidance");
  const [bookingDate, setBookingDate] = useState(() => {
    const tomorrow = new Date(Date.now() + 86400000);
    return tomorrow.toISOString().split("T")[0];
  });
  const [bookingDuration, setBookingDuration] = useState(30);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);

  useEffect(() => {
    fetchDirectory();
  }, [user]);

  const fetchDirectory = async () => {
    try {
      setLoading(true);
      if (user?.role === "Student") {
        const res = await api.get("/student/matched-alumni");
        const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        setAlumni(list);
        setIsMatchedMode(true);
      } else {
        const res = await api.get("/alumni/directory");
        const list = res.data?.data || (Array.isArray(res.data) ? res.data : []);
        setAlumni(list);
      }
    } catch (err) {
      addToast("Failed to load alumni directory", "error");
    } finally {
      setLoading(false);
    }
  };

  // Helper to normalize data across directory & matched-alumni endpoints
  const normalizeAlum = (item) => {
    const id = item._id || item.id;
    const name = item.name || item.user?.name || "Alumni Member";
    const avatar = item.avatar || item.avatarUrl || item.user?.avatar || null;
    const company =
      item.company ||
      item.companyName ||
      item.alumniProfile?.company ||
      "Tech Innovator";
    const title =
      item.title ||
      item.currentRole ||
      item.alumniProfile?.designation ||
      "Software Specialist";
    const graduationYear =
      item.graduationYear ||
      item.alumniProfile?.graduationYear ||
      "Alumni";
    const location =
      item.location ||
      item.alumniProfile?.location ||
      "Remote";
    const expertise =
      item.expertise && item.expertise.length > 0
        ? item.expertise
        : item.alumniProfile?.expertise || item.skills || [];
    const isMentor =
      item.mentorshipAvailable !== false &&
      item.availableForMentorship !== false &&
      item.alumniProfile?.available !== false;
    const karma =
      item.karma ||
      item.alumniProfile?.rating ||
      item.rating ||
      5.0;
    const recommendationLabel = item.recommendationLabel || null;
    const bio = item.bio || item.alumniProfile?.bio || "";
    const linkedIn = item.linkedIn || item.alumniProfile?.linkedinUrl || "";

    return {
      raw: item,
      id,
      name,
      avatar,
      company,
      title,
      graduationYear,
      location,
      expertise,
      isMentor,
      karma,
      recommendationLabel,
      bio,
      linkedIn,
    };
  };

  // Dynamic Metrics computed directly from loaded MongoDB records (no hardcoding)
  const metrics = useMemo(() => {
    const total = alumni.length;
    let mentors = 0;
    const companySet = new Set();
    const gradYearsSet = new Set();

    alumni.forEach((item) => {
      const norm = normalizeAlum(item);
      if (norm.isMentor) mentors++;
      if (norm.company && norm.company !== "Tech Innovator") {
        companySet.add(norm.company);
      }
      if (norm.graduationYear && norm.graduationYear !== "Alumni") {
        gradYearsSet.add(norm.graduationYear);
      }
    });

    const companies = Array.from(companySet);
    const gradYears = Array.from(gradYearsSet).sort((a, b) => b - a);

    return {
      total,
      mentors,
      companiesCount: companies.length,
      companies,
      gradYears,
    };
  }, [alumni]);

  // Multi-field search and multi-dimensional filtering
  const filteredAlumni = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();

    return alumni.map(normalizeAlum).filter((alum) => {
      // 1. Search Query Match
      const matchesSearch =
        !query ||
        alum.name.toLowerCase().includes(query) ||
        alum.company.toLowerCase().includes(query) ||
        alum.title.toLowerCase().includes(query) ||
        alum.expertise.some((skill) => skill.toLowerCase().includes(query)) ||
        String(alum.graduationYear).includes(query) ||
        alum.location.toLowerCase().includes(query);

      // 2. Category Pill Filter
      let matchesPill = true;
      if (activeFilter === "mentors") {
        matchesPill = alum.isMentor;
      } else if (activeFilter === "recent") {
        const year = parseInt(alum.graduationYear, 10);
        matchesPill = !isNaN(year) && year >= 2023;
      } else if (activeFilter !== "all") {
        matchesPill =
          alum.company.toLowerCase() === activeFilter.toLowerCase();
      }

      // 3. Dropdown Company Filter
      let matchesCompany = true;
      if (selectedCompany !== "all") {
        matchesCompany =
          alum.company.toLowerCase() === selectedCompany.toLowerCase();
      }

      // 4. Dropdown Graduation Year Filter
      let matchesGradYear = true;
      if (selectedGradYear !== "all") {
        matchesGradYear =
          String(alum.graduationYear) === String(selectedGradYear);
      }

      return matchesSearch && matchesPill && matchesCompany && matchesGradYear;
    });
  }, [alumni, searchTerm, activeFilter, selectedCompany, selectedGradYear]);

  // Active filter count for badge
  const activeFiltersCount =
    (selectedCompany !== "all" ? 1 : 0) +
    (selectedGradYear !== "all" ? 1 : 0) +
    (activeFilter !== "all" ? 1 : 0);

  const resetAllFilters = () => {
    setSearchTerm("");
    setActiveFilter("all");
    setSelectedCompany("all");
    setSelectedGradYear("all");
    setShowFilterDrawer(false);
  };

  // Submit Mentorship Booking
  const handleBook = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!selectedAlum) return;

    try {
      setBookingSubmitting(true);
      const targetId = selectedAlum.id || selectedAlum._id;

      await api.post("/alumni/mentorship/book", {
        mentorId: targetId,
        scheduledDate: bookingDate
          ? new Date(bookingDate).toISOString()
          : new Date(Date.now() + 86400000).toISOString(),
        topic: bookingTopic || "General Career Guidance",
        durationMinutes: Number(bookingDuration) || 30,
      });

      addToast(
        `Mentorship session requested with ${selectedAlum.name}!`,
        "success"
      );
      setSelectedAlum(null);
    } catch (err) {
      addToast(
        err.response?.data?.message || "Failed to request mentorship",
        "error"
      );
    } finally {
      setBookingSubmitting(false);
    }
  };

  return (
    <div className="alumni-page-container container-fluid px-3 px-md-4 py-3">
      {/* Ambient Radial Gradient Lights */}
      <div className="alumni-ambient-orb-1" />
      <div className="alumni-ambient-orb-2" />

      {/* Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="alumni-hero-card mb-4"
      >
        <div className="row align-items-center g-4">
          <div className="col-12 col-xl-7">
            <div
              className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-3 text-primary fw-semibold small"
              style={{
                background: "rgba(99, 102, 241, 0.1)",
                border: "1px solid rgba(99, 102, 241, 0.2)",
              }}
            >
              <Sparkles size={14} className="text-primary" />
              <span>NEXORA TALENT GRAPH • GLOBAL ALUMNI NETWORK</span>
            </div>

            <h1
              className="fw-black mb-2 tracking-tight"
              style={{ fontSize: "2.35rem", letterSpacing: "-0.03em" }}
            >
              Alumni <span className="alumni-hero-gradient-text">Network</span>
            </h1>

            <p
              className="mb-0 text-muted"
              style={{ fontSize: "1rem", lineHeight: "1.6", maxWidth: "620px" }}
            >
              Connect with graduates, verified industry mentors, and engineering
              leaders across top global companies for 1-on-1 guidance, resume
              reviews, and career insights.
            </p>
          </div>

          {/* Dynamic Metrics Row */}
          <div className="col-12 col-xl-5">
            <div className="d-flex flex-wrap gap-2.5 justify-content-start justify-content-xl-end">
              <div className="alumni-kpi-card">
                <div
                  className="alumni-kpi-icon-box"
                  style={{
                    background: "rgba(99, 102, 241, 0.12)",
                    color: "var(--primary, #4f46e5)",
                  }}
                >
                  <Users size={20} />
                </div>
                <div>
                  <div
                    className="fw-black lh-1"
                    style={{ fontSize: "1.4rem", color: "var(--text)" }}
                  >
                    {metrics.total}
                  </div>
                  <div
                    className="text-muted fw-semibold mt-1"
                    style={{ fontSize: "0.72rem", textTransform: "uppercase" }}
                  >
                    Total Alumni
                  </div>
                </div>
              </div>

              <div className="alumni-kpi-card">
                <div
                  className="alumni-kpi-icon-box"
                  style={{
                    background: "rgba(16, 185, 129, 0.12)",
                    color: "var(--success, #10b981)",
                  }}
                >
                  <Star size={20} />
                </div>
                <div>
                  <div
                    className="fw-black lh-1"
                    style={{ fontSize: "1.4rem", color: "var(--text)" }}
                  >
                    {metrics.mentors}
                  </div>
                  <div
                    className="text-muted fw-semibold mt-1"
                    style={{ fontSize: "0.72rem", textTransform: "uppercase" }}
                  >
                    Active Mentors
                  </div>
                </div>
              </div>

              <div className="alumni-kpi-card">
                <div
                  className="alumni-kpi-icon-box"
                  style={{
                    background: "rgba(14, 165, 233, 0.12)",
                    color: "#0ea5e9",
                  }}
                >
                  <Building2 size={20} />
                </div>
                <div>
                  <div
                    className="fw-black lh-1"
                    style={{ fontSize: "1.4rem", color: "var(--text)" }}
                  >
                    {metrics.companiesCount}
                  </div>
                  <div
                    className="text-muted fw-semibold mt-1"
                    style={{ fontSize: "0.72rem", textTransform: "uppercase" }}
                  >
                    Companies
                  </div>
                </div>
              </div>

              {isMatchedMode && (
                <div className="alumni-kpi-card">
                  <div
                    className="alumni-kpi-icon-box"
                    style={{
                      background: "rgba(168, 85, 247, 0.12)",
                      color: "#a855f7",
                    }}
                  >
                    <Target size={20} />
                  </div>
                  <div>
                    <div
                      className="fw-black lh-1"
                      style={{ fontSize: "1.4rem", color: "var(--text)" }}
                    >
                      {metrics.total}
                    </div>
                    <div
                      className="text-muted fw-semibold mt-1"
                      style={{ fontSize: "0.72rem", textTransform: "uppercase" }}
                    >
                      Target Role Matches
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Matched Mode Notification */}
      {isMatchedMode && alumni.length > 0 && (
        <div
          className="alert d-flex align-items-center gap-3 mb-4 rounded-4 py-2.5 px-3.5 shadow-sm"
          style={{
            background: "rgba(99, 102, 241, 0.08)",
            color: "var(--primary, #4f46e5)",
            border: "1px solid rgba(99, 102, 241, 0.25)",
          }}
        >
          <div
            className="rounded-circle d-flex align-items-center justify-content-center p-1.5"
            style={{ background: "rgba(99, 102, 241, 0.15)" }}
          >
            <Star size={16} className="text-primary" />
          </div>
          <div className="fw-medium small flex-grow-1">
            Showing alumni mentors curated to match your target career roles,
            technical competencies, and skill gaps.
          </div>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="alumni-toolbar-card mb-4">
        <div className="d-flex flex-column flex-lg-row align-items-stretch align-items-lg-center justify-content-between gap-3">
          {/* Search Input */}
          <div className="alumni-search-input-group">
            <Search size={18} className="alumni-search-icon" />
            <input
              type="text"
              placeholder="Search by name, company, job title, skills, or grad year..."
              className="alumni-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                className="alumni-search-clear"
                onClick={() => setSearchTerm("")}
                title="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Action Buttons: Filter drawer toggle */}
          <div className="d-flex align-items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setShowFilterDrawer(!showFilterDrawer)}
              className={`btn rounded-pill d-inline-flex align-items-center gap-2 px-3 py-2 fw-semibold ${
                showFilterDrawer || activeFiltersCount > 0
                  ? "btn-primary text-white"
                  : "btn-outline-custom"
              }`}
              style={{
                fontSize: "0.85rem",
                border: "1px solid var(--border)",
                background:
                  showFilterDrawer || activeFiltersCount > 0
                    ? "var(--primary)"
                    : "var(--surface-2)",
                color:
                  showFilterDrawer || activeFiltersCount > 0
                    ? "#ffffff"
                    : "var(--text)",
              }}
            >
              <SlidersHorizontal size={16} />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span
                  className="badge rounded-circle bg-white text-primary fw-bold"
                  style={{ fontSize: "0.7rem", width: "18px", height: "18px", padding: 0, display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                >
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {activeFiltersCount > 0 && (
              <button
                onClick={resetAllFilters}
                className="btn btn-sm rounded-pill text-muted hover-bg d-inline-flex align-items-center gap-1.5 px-3 py-2"
                style={{ fontSize: "0.8rem", border: "1px solid var(--border)" }}
                title="Reset all filters"
              >
                <RotateCcw size={14} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="d-flex flex-wrap align-items-center gap-2 mt-3 pt-3 border-top" style={{ borderColor: "var(--border)" }}>
          <span className="small text-muted fw-semibold me-1">Quick Filters:</span>

          <button
            onClick={() => setActiveFilter("all")}
            className={`alumni-filter-pill ${activeFilter === "all" ? "active" : ""}`}
          >
            All Alumni ({metrics.total})
          </button>

          <button
            onClick={() => setActiveFilter("mentors")}
            className={`alumni-filter-pill ${activeFilter === "mentors" ? "active" : ""}`}
          >
            <Star size={13} className={activeFilter === "mentors" ? "fill-white" : "text-warning fill-warning"} />
            Open for Mentorship ({metrics.mentors})
          </button>

          <button
            onClick={() => setActiveFilter("recent")}
            className={`alumni-filter-pill ${activeFilter === "recent" ? "active" : ""}`}
          >
            Recent Grads (2023–2025)
          </button>

          {/* Top company pills from real data */}
          {metrics.companies.slice(0, 4).map((comp) => (
            <button
              key={comp}
              onClick={() => setActiveFilter(activeFilter === comp ? "all" : comp)}
              className={`alumni-filter-pill ${activeFilter === comp ? "active" : ""}`}
            >
              <Building2 size={13} />
              {comp}
            </button>
          ))}
        </div>

        {/* Expandable Filter Drawer */}
        <AnimatePresence>
          {showFilterDrawer && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden mt-3 pt-3 border-top"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="row g-3">
                <div className="col-12 col-md-4">
                  <label className="form-label small fw-bold text-muted mb-1">
                    Filter by Company
                  </label>
                  <select
                    className="form-select rounded-3 py-2 small"
                    style={{
                      background: "var(--surface-2)",
                      borderColor: "var(--border)",
                      color: "var(--text)",
                    }}
                    value={selectedCompany}
                    onChange={(e) => setSelectedCompany(e.target.value)}
                  >
                    <option value="all">All Companies</option>
                    {metrics.companies.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-12 col-md-4">
                  <label className="form-label small fw-bold text-muted mb-1">
                    Filter by Graduation Year
                  </label>
                  <select
                    className="form-select rounded-3 py-2 small"
                    style={{
                      background: "var(--surface-2)",
                      borderColor: "var(--border)",
                      color: "var(--text)",
                    }}
                    value={selectedGradYear}
                    onChange={(e) => setSelectedGradYear(e.target.value)}
                  >
                    <option value="all">All Graduation Years</option>
                    {metrics.gradYears.map((yr) => (
                      <option key={yr} value={yr}>
                        Class of {yr}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-12 col-md-4 d-flex align-items-end">
                  <button
                    onClick={resetAllFilters}
                    className="btn btn-outline-danger w-100 rounded-3 py-2 small fw-semibold d-flex align-items-center justify-content-center gap-2"
                  >
                    <RotateCcw size={15} /> Clear All Filters
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Grid Section */}
      {loading ? (
        <div className="row g-4 mt-1">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div className="col-12 col-md-6 col-xl-4" key={idx}>
              <div className="alumni-card p-4">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div
                    className="rounded-circle"
                    style={{
                      width: "56px",
                      height: "56px",
                      background: "var(--surface-2)",
                      animation: "pulse 1.5s infinite",
                    }}
                  />
                  <div className="flex-grow-1">
                    <div
                      className="rounded mb-2"
                      style={{
                        width: "60%",
                        height: "16px",
                        background: "var(--surface-2)",
                      }}
                    />
                    <div
                      className="rounded"
                      style={{
                        width: "40%",
                        height: "12px",
                        background: "var(--surface-2)",
                      }}
                    />
                  </div>
                </div>
                <div
                  className="rounded mb-2"
                  style={{
                    width: "80%",
                    height: "14px",
                    background: "var(--surface-2)",
                  }}
                />
                <div
                  className="rounded mb-4"
                  style={{
                    width: "50%",
                    height: "14px",
                    background: "var(--surface-2)",
                  }}
                />
                <div
                  className="rounded mt-auto"
                  style={{
                    width: "100%",
                    height: "38px",
                    background: "var(--surface-2)",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : filteredAlumni.length === 0 ? (
        <div
          className="alumni-hero-card text-center p-5 mt-3 d-flex flex-column align-items-center justify-content-center"
          style={{ minHeight: "360px" }}
        >
          <div
            className="rounded-circle p-3 mb-3"
            style={{
              background: "rgba(99, 102, 241, 0.1)",
              color: "var(--primary, #4f46e5)",
            }}
          >
            <Users size={40} />
          </div>
          <h4 className="fw-bold mb-2" style={{ color: "var(--text)" }}>
            No Alumni Found
          </h4>
          <p className="text-muted mb-4" style={{ maxWidth: "420px" }}>
            No alumni match your current search or filter criteria. Try
            adjusting your query or clear the active filters.
          </p>
          <button
            onClick={resetAllFilters}
            className="btn btn-primary rounded-pill px-4 py-2 fw-semibold d-inline-flex align-items-center gap-2 shadow-sm"
          >
            <RotateCcw size={16} /> Reset All Filters
          </button>
        </div>
      ) : (
        <div className="row g-4 mt-1">
          {filteredAlumni.map((alum, idx) => (
            <div className="col-12 col-md-6 col-xl-4" key={alum.id}>
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: Math.min(idx * 0.03, 0.3) }}
                className="alumni-card"
              >
                {/* Top Badges Header */}
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <span
                    className="badge rounded-pill fw-semibold"
                    style={{
                      background: "rgba(99, 102, 241, 0.1)",
                      color: "var(--primary, #4f46e5)",
                      fontSize: "0.72rem",
                      padding: "5px 10px",
                    }}
                  >
                    Class of {alum.graduationYear}
                  </span>

                  <div className="d-flex align-items-center gap-1.5">
                    {alum.recommendationLabel && (
                      <span
                        className="badge rounded-pill fw-bold text-uppercase d-flex align-items-center gap-1"
                        style={{
                          background: "rgba(168, 85, 247, 0.15)",
                          color: "#9333ea",
                          fontSize: "0.68rem",
                          padding: "5px 8px",
                        }}
                      >
                        <Sparkles size={11} /> {alum.recommendationLabel}
                      </span>
                    )}

                    {alum.isMentor && (
                      <span
                        className="badge rounded-pill fw-bold text-uppercase d-flex align-items-center gap-1"
                        style={{
                          background: "rgba(16, 185, 129, 0.15)",
                          color: "var(--success, #10b981)",
                          fontSize: "0.68rem",
                          padding: "5px 9px",
                        }}
                      >
                        <Star size={11} className="fill-success" /> Mentor
                      </span>
                    )}
                  </div>
                </div>

                {/* Profile Identity Row */}
                <div className="d-flex align-items-start gap-3 mb-3">
                  {/* Avatar with Gradient Ring */}
                  <div className="alumni-avatar-ring">
                    <div className="alumni-avatar-inner">
                      {alum.avatar ? (
                        <img
                          src={alum.avatar}
                          alt={alum.name}
                          className="alumni-avatar-img"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      ) : (
                        alum.name?.charAt(0).toUpperCase()
                      )}
                    </div>
                    {alum.isMentor && (
                      <div
                        className="alumni-status-indicator"
                        title="Available for Mentorship"
                      />
                    )}
                  </div>

                  <div className="flex-grow-1 overflow-hidden">
                    <h5
                      className="fw-bold mb-1 text-truncate"
                      style={{ color: "var(--text)", fontSize: "1.1rem" }}
                      title={alum.name}
                    >
                      {alum.name}
                    </h5>
                    <div
                      className="d-flex align-items-center gap-1.5 text-muted small text-truncate"
                      title={`${alum.title} at ${alum.company}`}
                    >
                      <Briefcase size={13} className="flex-shrink-0" />
                      <span className="text-truncate">{alum.title}</span>
                    </div>
                    <div
                      className="d-flex align-items-center gap-1.5 fw-semibold text-truncate mt-0.5"
                      style={{ color: "var(--primary, #4f46e5)", fontSize: "0.825rem" }}
                    >
                      <Building2 size={13} className="flex-shrink-0" />
                      <span className="text-truncate">{alum.company}</span>
                    </div>
                  </div>
                </div>

                {/* Metadata & Location */}
                <div className="d-flex align-items-center gap-3 mb-3 small text-muted">
                  <div className="d-flex align-items-center gap-1">
                    <MapPin size={13} />
                    <span>{alum.location}</span>
                  </div>

                  {alum.karma && (
                    <div className="d-flex align-items-center gap-1">
                      <Star size={13} className="text-warning fill-warning" />
                      <span className="fw-semibold" style={{ color: "var(--text)" }}>
                        {typeof alum.karma === "number" ? alum.karma.toFixed(1) : alum.karma}
                      </span>
                    </div>
                  )}
                </div>

                {/* Skills & Expertise Pills */}
                <div className="mb-4 flex-grow-1">
                  {alum.expertise && alum.expertise.length > 0 ? (
                    <div className="d-flex flex-wrap gap-1.5">
                      {alum.expertise.slice(0, 3).map((skill, sIdx) => (
                        <span key={sIdx} className="alumni-skill-pill">
                          {skill}
                        </span>
                      ))}
                      {alum.expertise.length > 3 && (
                        <span
                          className="alumni-skill-pill"
                          style={{
                            background: "var(--surface-2)",
                            color: "var(--text-muted)",
                            borderColor: "var(--border)",
                          }}
                          title={alum.expertise.slice(3).join(", ")}
                        >
                          +{alum.expertise.length - 3} more
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="text-muted small fst-italic">
                      Engineering & Product Specialist
                    </div>
                  )}
                </div>

                {/* Action Buttons Aligned at Bottom */}
                <div
                  className="d-flex align-items-center gap-2 mt-auto pt-3 border-top"
                  style={{ borderColor: "var(--border)" }}
                >
                  <button
                    onClick={() => setProfileAlum(alum)}
                    className="alumni-btn-view flex-grow-1"
                  >
                    <User size={15} />
                    <span>View Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedAlum(alum);
                      setBookingTopic(`Mentorship with ${alum.name}`);
                    }}
                    className="alumni-btn-book flex-grow-1"
                  >
                    <Calendar size={15} />
                    <span>Book 1:1</span>
                  </button>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      )}

      {/* =========================================================================
          MODAL 1: RICH ALUMNI PROFILE DETAILS MODAL
         ========================================================================= */}
      <AnimatePresence>
        {profileAlum && (
          <div
            className="alumni-modal-backdrop"
            onClick={() => setProfileAlum(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="alumni-modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div className="d-flex align-items-center gap-2">
                  <span
                    className="badge rounded-pill fw-semibold"
                    style={{
                      background: "rgba(99, 102, 241, 0.12)",
                      color: "var(--primary, #4f46e5)",
                    }}
                  >
                    Class of {profileAlum.graduationYear}
                  </span>
                  {profileAlum.isMentor && (
                    <span
                      className="badge rounded-pill fw-bold text-uppercase d-flex align-items-center gap-1"
                      style={{
                        background: "rgba(16, 185, 129, 0.15)",
                        color: "var(--success, #10b981)",
                      }}
                    >
                      <Star size={12} className="fill-success" /> Active Mentor
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setProfileAlum(null)}
                  className="btn btn-sm text-muted rounded-circle p-1 hover-bg border-0"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Profile Card Header */}
              <div
                className="d-flex align-items-center gap-3 p-3 rounded-4 mb-3"
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                }}
              >
                <div
                  className="alumni-avatar-ring"
                  style={{ width: "68px", height: "68px" }}
                >
                  <div className="alumni-avatar-inner">
                    {profileAlum.avatar ? (
                      <img
                        src={profileAlum.avatar}
                        alt={profileAlum.name}
                        className="alumni-avatar-img"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    ) : (
                      profileAlum.name?.charAt(0).toUpperCase()
                    )}
                  </div>
                </div>

                <div className="flex-grow-1 overflow-hidden">
                  <h4
                    className="fw-bold mb-1"
                    style={{ color: "var(--text)" }}
                  >
                    {profileAlum.name}
                  </h4>
                  <div className="text-muted small mb-0.5">
                    {profileAlum.title}
                  </div>
                  <div
                    className="fw-semibold small"
                    style={{ color: "var(--primary, #4f46e5)" }}
                  >
                    {profileAlum.company}
                  </div>
                </div>
              </div>

              {/* Location & Rating row */}
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <div
                    className="p-2.5 rounded-3 d-flex align-items-center gap-2 small"
                    style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
                  >
                    <MapPin size={16} className="text-muted" />
                    <span className="text-truncate">{profileAlum.location}</span>
                  </div>
                </div>
                <div className="col-6">
                  <div
                    className="p-2.5 rounded-3 d-flex align-items-center gap-2 small"
                    style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
                  >
                    <Star size={16} className="text-warning fill-warning" />
                    <span>Rating: {profileAlum.karma || "5.0"} / 5.0</span>
                  </div>
                </div>
              </div>

              {/* Bio if available */}
              {profileAlum.bio && (
                <div className="mb-3">
                  <div className="small fw-bold text-muted mb-1">About</div>
                  <p
                    className="small mb-0 p-3 rounded-3"
                    style={{
                      background: "var(--surface-2)",
                      border: "1px solid var(--border)",
                      color: "var(--text)",
                    }}
                  >
                    {profileAlum.bio}
                  </p>
                </div>
              )}

              {/* Expertise Tags */}
              <div className="mb-4">
                <div className="small fw-bold text-muted mb-2">
                  Skills & Technical Domains
                </div>
                <div className="d-flex flex-wrap gap-1.5">
                  {profileAlum.expertise && profileAlum.expertise.length > 0 ? (
                    profileAlum.expertise.map((skill, i) => (
                      <span key={i} className="alumni-skill-pill">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="small text-muted">
                      General Software Engineering & Mentorship
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="d-flex align-items-center gap-2 pt-2 border-top" style={{ borderColor: "var(--border)" }}>
                <button
                  onClick={() => {
                    setSelectedAlum(profileAlum);
                    setBookingTopic(`Mentorship with ${profileAlum.name}`);
                    setProfileAlum(null);
                  }}
                  className="alumni-btn-book flex-grow-1 py-2.5"
                >
                  <Calendar size={16} />
                  <span>Request 1-on-1 Session</span>
                </button>

                <button
                  onClick={() => {
                    const targetId = profileAlum.id || profileAlum._id;
                    addToast(`Opening ${profileAlum.name}'s profile...`, "info");
                    window.open(`/p/${targetId}`, "_blank");
                  }}
                  className="alumni-btn-view py-2.5 px-3"
                  title="View Public Profile in new tab"
                >
                  <ExternalLink size={16} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          MODAL 2: 1-ON-1 MENTORSHIP BOOKING MODAL
         ========================================================================= */}
      <AnimatePresence>
        {selectedAlum && (
          <div
            className="alumni-modal-backdrop"
            onClick={() => setSelectedAlum(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="alumni-modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h4 className="fw-bold mb-1" style={{ color: "var(--text)" }}>
                    Book Mentorship Session
                  </h4>
                  <p className="text-muted small mb-0">
                    Schedule a 1-on-1 career consultation
                  </p>
                </div>
                <button
                  onClick={() => setSelectedAlum(null)}
                  className="btn btn-sm text-muted rounded-circle p-1 hover-bg border-0"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Mentor Summary Strip */}
              <div
                className="d-flex align-items-center gap-3 p-3 rounded-4 mb-3"
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                }}
              >
                <div
                  className="alumni-avatar-ring"
                  style={{ width: "48px", height: "48px" }}
                >
                  <div
                    className="alumni-avatar-inner"
                    style={{ fontSize: "1.1rem" }}
                  >
                    {selectedAlum.avatar ? (
                      <img
                        src={selectedAlum.avatar}
                        alt={selectedAlum.name}
                        className="alumni-avatar-img"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    ) : (
                      selectedAlum.name?.charAt(0).toUpperCase()
                    )}
                  </div>
                </div>

                <div className="overflow-hidden">
                  <div
                    className="fw-bold text-truncate"
                    style={{ color: "var(--text)" }}
                  >
                    {selectedAlum.name}
                  </div>
                  <div className="text-muted small text-truncate">
                    {selectedAlum.title} @ {selectedAlum.company}
                  </div>
                </div>
              </div>

              {/* Booking Form */}
              <form onSubmit={handleBook} className="d-flex flex-column gap-3">
                {/* Topic Field */}
                <div>
                  <label className="form-label small fw-bold text-muted mb-1">
                    Discussion Topic
                  </label>
                  <input
                    type="text"
                    className="form-control rounded-3 py-2"
                    style={{
                      background: "var(--surface-2)",
                      borderColor: "var(--border)",
                      color: "var(--text)",
                    }}
                    value={bookingTopic}
                    onChange={(e) => setBookingTopic(e.target.value)}
                    placeholder="e.g. System Design Mock, Resume Review..."
                    required
                  />

                  {/* Suggested Topic Chips */}
                  <div className="d-flex flex-wrap gap-1.5 mt-2">
                    {[
                      "Career Roadmap",
                      "Resume Review",
                      "System Design Mock",
                      "Hiring Advice",
                    ].map((chip) => (
                      <button
                        type="button"
                        key={chip}
                        onClick={() => setBookingTopic(chip)}
                        className="btn btn-sm rounded-pill py-0.5 px-2 text-muted hover-bg"
                        style={{
                          fontSize: "0.72rem",
                          border: "1px solid var(--border)",
                        }}
                      >
                        + {chip}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date & Duration Row */}
                <div className="row g-2">
                  <div className="col-7">
                    <label className="form-label small fw-bold text-muted mb-1">
                      Target Date
                    </label>
                    <input
                      type="date"
                      className="form-control rounded-3 py-2"
                      style={{
                        background: "var(--surface-2)",
                        borderColor: "var(--border)",
                        color: "var(--text)",
                      }}
                      value={bookingDate}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setBookingDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-5">
                    <label className="form-label small fw-bold text-muted mb-1">
                      Duration
                    </label>
                    <select
                      className="form-select rounded-3 py-2"
                      style={{
                        background: "var(--surface-2)",
                        borderColor: "var(--border)",
                        color: "var(--text)",
                      }}
                      value={bookingDuration}
                      onChange={(e) => setBookingDuration(e.target.value)}
                    >
                      <option value="15">15 mins</option>
                      <option value="30">30 mins</option>
                      <option value="45">45 mins</option>
                      <option value="60">60 mins</option>
                    </select>
                  </div>
                </div>

                {/* Session confirmation notice */}
                <div
                  className="p-2.5 rounded-3 d-flex align-items-center gap-2 small text-muted"
                  style={{
                    background: "rgba(99, 102, 241, 0.05)",
                    border: "1px dashed rgba(99, 102, 241, 0.2)",
                  }}
                >
                  <Clock size={16} className="text-primary flex-shrink-0" />
                  <span>
                    The session will be confirmed against the mentor's saved schedule.
                  </span>
                </div>

                {/* Form Buttons */}
                <div className="d-flex align-items-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedAlum(null)}
                    className="btn btn-outline-custom rounded-pill w-50 py-2.5 fw-semibold"
                    style={{
                      border: "1px solid var(--border)",
                      color: "var(--text)",
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={bookingSubmitting}
                    className="alumni-btn-book w-50 py-2.5"
                  >
                    {bookingSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm" />
                        <span>Requesting...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={16} />
                        <span>Confirm Request</span>
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
