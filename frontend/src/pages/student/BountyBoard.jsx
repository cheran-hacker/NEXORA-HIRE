import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target,
  Search,
  Filter,
  Briefcase,
  DollarSign,
  Clock,
  Zap,
  ArrowRight,
  Code,
  Plus,
  X,
  CheckCircle2,
  Calendar,
  ExternalLink,
  Send,
  AlertCircle,
  RefreshCw,
  Award,
  Tag,
  User,
  ShieldCheck,
  ChevronRight
} from "lucide-react";
import { bountyService } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";

export default function BountyBoard() {
  const { addToast } = useToast();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("explore"); // "explore" | "my_bounties"
  const [bounties, setBounties] = useState([]);
  const [myBounties, setMyBounties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMine, setLoadingMine] = useState(false);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [sortBy, setSortBy] = useState("latest");

  // Modals
  const [selectedBounty, setSelectedBounty] = useState(null); // for details modal
  const [applyingBounty, setApplyingBounty] = useState(null); // for apply modal
  const [submittingBounty, setSubmittingBounty] = useState(null); // for submit solution modal

  // Application Form
  const [applyForm, setApplyForm] = useState({
    pitch: "",
    relevantSkills: "",
    portfolioUrl: ""
  });
  const [applying, setApplying] = useState(false);

  // Submission Form
  const [solutionForm, setSolutionForm] = useState({
    solutionUrl: "",
    message: ""
  });
  const [submittingWork, setSubmittingWork] = useState(false);

  // Fetch Open Bounties
  const fetchOpenBounties = async () => {
    try {
      setLoading(true);
      const params = {
        search: searchTerm || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        difficulty: difficultyFilter !== "all" ? difficultyFilter : undefined,
        sort: sortBy
      };
      const res = await bountyService.getOpenBounties(params);
      setBounties(res.data?.data || []);
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to load open bounties", "error");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Student's Applied & Assigned Bounties
  const fetchMyBounties = async () => {
    try {
      setLoadingMine(true);
      const res = await bountyService.getMyApplications();
      setMyBounties(res.data?.data || []);
    } catch (err) {
      addToast("Failed to load your bounty applications", "error");
    } finally {
      setLoadingMine(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOpenBounties();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, difficultyFilter, sortBy]);

  useEffect(() => {
    if (activeTab === "my_bounties") {
      fetchMyBounties();
    }
  }, [activeTab]);

  // Handle Apply
  const handleOpenApply = (bounty, e) => {
    if (e) e.stopPropagation();
    setApplyingBounty(bounty);
    setApplyForm({
      pitch: "",
      relevantSkills: (bounty.requiredSkills || bounty.tags || []).join(", "),
      portfolioUrl: user?.studentProfile?.portfolioUrl || user?.studentProfile?.githubUrl || ""
    });
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    if (!applyForm.pitch.trim()) {
      addToast("Please provide a brief pitch explaining your interest or approach", "warning");
      return;
    }
    try {
      setApplying(true);
      const skillsArray = applyForm.relevantSkills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      await bountyService.applyBounty(applyingBounty._id, {
        pitch: applyForm.pitch,
        relevantSkills: skillsArray,
        portfolioUrl: applyForm.portfolioUrl
      });

      addToast("Bounty claimed successfully! This task is now reserved for you and removed from other students' boards. 🚀", "success");
      const claimedId = applyingBounty._id;
      setApplyingBounty(null);
      
      // Immediately remove the claimed bounty from Explore listing for all users
      setBounties((prev) => prev.filter((b) => b._id !== claimedId));
      fetchOpenBounties();

      // Auto-switch to My Applications & Tasks so student can immediately view instructions and work
      setActiveTab("my_bounties");
      fetchMyBounties();
    } catch (err) {
      addToast(err.response?.data?.message || err.message || "Failed to apply for bounty", "error");
    } finally {
      setApplying(false);
    }
  };

  // Handle Submit Deliverables / Solution
  const handleOpenSubmitSolution = (bounty, e) => {
    if (e) e.stopPropagation();
    setSubmittingBounty(bounty);
    // Pre-fill existing submission if available
    const mySub = (bounty.submissions || []).find(
      (s) => String(s.student?._id || s.student) === String(user?._id)
    );
    setSolutionForm({
      solutionUrl: mySub?.solutionUrl || "",
      message: mySub?.message || ""
    });
  };

  const handleSubmitSolution = async (e) => {
    e.preventDefault();
    if (!solutionForm.solutionUrl.trim()) {
      addToast("Please provide your solution URL (GitHub, deployed app, Figma, etc.)", "warning");
      return;
    }
    try {
      setSubmittingWork(true);
      await bountyService.submitSolution(submittingBounty._id, {
        solutionUrl: solutionForm.solutionUrl,
        message: solutionForm.message
      });
      addToast("Deliverables submitted! Alumni mentor has been notified for review. 🎉", "success");
      setSubmittingBounty(null);
      fetchOpenBounties();
      fetchMyBounties();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to submit deliverables", "error");
    } finally {
      setSubmittingWork(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Open":
        return "bg-success text-white";
      case "Assigned":
      case "In Progress":
        return "bg-primary text-white";
      case "Submitted":
      case "Under Review":
        return "bg-warning text-dark";
      case "Completed":
        return "bg-info text-white";
      case "Rejected":
      case "Cancelled":
        return "bg-danger text-white";
      default:
        return "bg-secondary text-white";
    }
  };

  return (
    <div className="container-fluid py-4 px-xl-5" style={{ maxWidth: "1400px" }}>
      {/* ── Header ── */}
      <div className="bento-card p-4 p-md-5 mb-4 position-relative overflow-hidden rounded-4 border shadow-sm" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <div
          className="position-absolute rounded-circle pe-none"
          style={{
            top: -40,
            right: -40,
            width: "300px",
            height: "300px",
            background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(236,72,153,0.05) 70%, transparent 100%)",
            filter: "blur(40px)"
          }}
        />
        <div className="position-relative z-1 d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-4">
          <div>
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="badge rounded-pill bg-primary-subtle text-primary fw-bold px-3 py-1 text-uppercase" style={{ fontSize: "0.75rem" }}>
                Verified Alumni Opportunities
              </span>
            </div>
            <h2 className="fw-black mb-2 d-flex align-items-center gap-2" style={{ fontSize: "2.3rem", color: "var(--text)" }}>
              <Target className="text-primary" size={36} />
              Alumni Bounty Board
            </h2>
            <p className="fw-medium text-muted mb-0" style={{ maxWidth: 650 }}>
              Apply for paid micro-tasks and freelance engineering gigs posted directly by verified Alumni mentors. Earn real rewards and Karma credits for your portfolio.
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="d-flex gap-2 p-1 rounded-pill border" style={{ background: "var(--surface-2, rgba(0,0,0,0.02))", borderColor: "var(--border)" }}>
            <button
              onClick={() => setActiveTab("explore")}
              className={`btn rounded-pill px-4 py-2 fw-bold transition-fast ${
                activeTab === "explore" ? "btn-primary shadow-sm" : "btn-light text-muted"
              }`}
            >
              Explore Bounties
            </button>
            <button
              onClick={() => setActiveTab("my_bounties")}
              className={`btn rounded-pill px-4 py-2 fw-bold transition-fast ${
                activeTab === "my_bounties" ? "btn-primary shadow-sm" : "btn-light text-muted"
              }`}
            >
              My Applications & Tasks
              {myBounties.length > 0 && (
                <span className="badge bg-white text-dark ms-2 rounded-circle" style={{ fontSize: "0.7rem" }}>
                  {myBounties.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {activeTab === "explore" ? (
        <>
          {/* ── Filters & Search Bar ── */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center gap-3 mb-4">
            <div className="d-flex flex-wrap gap-2">
              {/* Status Filter */}
              <div className="d-flex p-1 rounded-pill border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                {[
                  { key: "all", label: "All Active" },
                  { key: "Open", label: "Open Now" },
                  { key: "In Progress", label: "In Progress" },
                  { key: "Completed", label: "Completed" }
                ].map((st) => (
                  <button
                    key={st.key}
                    onClick={() => setStatusFilter(st.key)}
                    className={`btn btn-sm rounded-pill px-3 fw-bold transition-fast ${
                      statusFilter === st.key ? "btn-primary shadow-sm" : "btn-light text-muted"
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              {/* Difficulty Dropdown */}
              <select
                className="form-select form-select-sm rounded-pill border px-3"
                style={{ width: "auto", background: "var(--surface)", borderColor: "var(--border)", color: "var(--text)" }}
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
              >
                <option value="all">All Difficulties</option>
                <option value="Beginner">Beginner (1-2 days)</option>
                <option value="Intermediate">Intermediate (3-5 days)</option>
                <option value="Advanced">Advanced (1-2 weeks)</option>
              </select>

              {/* Sort Dropdown */}
              <select
                className="form-select form-select-sm rounded-pill border px-3"
                style={{ width: "auto", background: "var(--surface)", borderColor: "var(--border)", color: "var(--text)" }}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="latest">Newest First</option>
                <option value="reward_high">Highest Reward ($$)</option>
                <option value="reward_low">Lowest Reward ($)</option>
                <option value="deadline_soon">Deadline (Soonest)</option>
              </select>
            </div>

            {/* Search Input */}
            <div className="position-relative" style={{ minWidth: 260 }}>
              <Search
                className="position-absolute text-muted"
                size={16}
                style={{ left: "14px", top: "50%", transform: "translateY(-50%)" }}
              />
              <input
                type="text"
                placeholder="Search by title, skill, or keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-control rounded-pill ps-5 border"
                style={{ background: "var(--surface)", color: "var(--text)", borderColor: "var(--border)" }}
              />
            </div>
          </div>

          {/* ── Bounties Grid ── */}
          {loading ? (
            <div className="py-5 text-center">
              <div className="spinner-border text-primary mb-3"></div>
              <p className="text-muted fw-semibold">Loading live alumni bounties...</p>
            </div>
          ) : bounties.length > 0 ? (
            <div className="row g-4">
              <AnimatePresence mode="popLayout">
                {bounties.map((bounty) => {
                  const posterName = bounty.poster?.name || "Alumni Mentor";
                  const posterCompany = bounty.poster?.alumniProfile?.company || "Tech Industry";
                  const reward = bounty.rewardAmount || bounty.reward || 0;
                  const skills = bounty.requiredSkills || bounty.tags || [];

                  // Check if current student has applied or is assigned
                  const isAssignedToMe = bounty.isAssignedToMe;
                  const hasApplied = bounty.hasApplied;

                  return (
                    <div className="col-12 col-md-6 col-xl-4" key={bounty._id}>
                      <motion.div
                        layout
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="bento-card p-4 rounded-4 d-flex flex-column h-100 hover-lift shadow-sm border position-relative"
                        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                      >
                        {/* Header: Status & Reward */}
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div className="d-flex align-items-center gap-2">
                            <span className={`badge rounded-pill px-3 py-1 fw-bold text-uppercase ${getStatusBadge(bounty.status)}`}>
                              {bounty.status}
                            </span>
                            <span className="badge rounded-pill bg-light border text-muted px-2 py-1 small">
                              {bounty.difficulty || "Intermediate"}
                            </span>
                          </div>

                          <div className="h4 fw-black text-success d-flex align-items-center m-0">
                            <DollarSign size={20} />
                            {reward}
                          </div>
                        </div>

                        {/* Title & Description */}
                        <h5 className="fw-bold mb-2 line-clamp-2" style={{ color: "var(--text)", minHeight: "2.8rem" }}>
                          {bounty.title}
                        </h5>

                        {/* Poster Info (Fixed React Object Bug) */}
                        <div className="d-flex align-items-center gap-2 small fw-medium mb-3 text-muted">
                          <Briefcase size={16} className="text-primary flex-shrink-0" />
                          <span className="text-truncate">
                            <strong>{posterName}</strong> • {posterCompany}
                          </span>
                        </div>

                        <p className="text-muted small mb-3 line-clamp-3" style={{ minHeight: "3.6rem" }}>
                          {bounty.description}
                        </p>

                        {/* Required Skills Badges */}
                        <div className="d-flex flex-wrap gap-1 mb-4 mt-auto">
                          {skills.slice(0, 4).map((tag, sIdx) => (
                            <span
                              key={sIdx}
                              className="badge rounded-pill fw-medium d-flex align-items-center gap-1"
                              style={{
                                background: "rgba(99,102,241,0.08)",
                                color: "var(--primary)",
                                border: "1px solid rgba(99,102,241,0.15)",
                                fontSize: "0.72rem"
                              }}
                            >
                              <Tag size={10} /> {tag}
                            </span>
                          ))}
                          {skills.length > 4 && (
                            <span className="badge rounded-pill bg-light text-muted border small" style={{ fontSize: "0.7rem" }}>
                              +{skills.length - 4} more
                            </span>
                          )}
                        </div>

                        {/* Footer: Deadline & Action */}
                        <div className="pt-3 border-top d-flex justify-content-between align-items-center" style={{ borderColor: "var(--border)" }}>
                          <div className="small text-muted d-flex align-items-center gap-1">
                            <Clock size={14} />
                            {bounty.deadline
                              ? new Date(bounty.deadline).toLocaleDateString()
                              : "Flexible"}
                          </div>

                          <div className="d-flex align-items-center gap-2">
                            <button
                              onClick={() => setSelectedBounty(bounty)}
                              className="btn btn-sm btn-link text-decoration-none text-muted p-0"
                            >
                              Details
                            </button>

                            {isAssignedToMe ? (
                              <button
                                onClick={(e) => handleOpenSubmitSolution(bounty, e)}
                                className="btn btn-sm btn-success rounded-pill fw-bold px-3 d-flex align-items-center gap-1 shadow-sm"
                              >
                                Submit Work <ArrowRight size={14} />
                              </button>
                            ) : hasApplied ? (
                              <span className="badge bg-warning-subtle text-warning border border-warning rounded-pill px-3 py-1 fw-bold">
                                Applied (Under Review)
                              </span>
                            ) : bounty.status === "Open" ? (
                              <button
                                onClick={(e) => handleOpenApply(bounty, e)}
                                className="btn btn-sm btn-primary rounded-pill fw-bold px-3 d-flex align-items-center gap-1 shadow-sm hover-lift"
                              >
                                Apply <ArrowRight size={14} />
                              </button>
                            ) : (
                              <span className="badge bg-secondary rounded-pill px-3 py-1">
                                {bounty.status}
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  );
                })}
              </AnimatePresence>
            </div>
          ) : (
            <div className="bento-card p-5 text-center rounded-4 border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <Target size={56} className="text-muted mb-3 opacity-25" />
              <h4 className="fw-bold text-muted">No open bounties match your criteria</h4>
              <p className="text-muted mb-3">Try adjusting your search terms or filters to view other opportunities.</p>
              <button
                className="btn btn-outline-primary rounded-pill px-4 fw-bold"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setDifficultyFilter("all");
                }}
              >
                Clear Filters
              </button>
            </div>
          )}
        </>
      ) : (
        /* ── My Applications & Tasks Tab ── */
        <div className="row g-4">
          {loadingMine ? (
            <div className="py-5 text-center w-100">
              <div className="spinner-border text-primary mb-3"></div>
              <p className="text-muted fw-semibold">Loading your applications & assignments...</p>
            </div>
          ) : myBounties.length > 0 ? (
            myBounties.map((bounty) => {
              const currentUserId = String(user?._id || user?.id);
              const isAssigned = String(bounty.assignedTo?._id || bounty.assignedTo) === currentUserId;
              const myApp = (bounty.applications || []).find(
                (a) => String(a.student?._id || a.student) === currentUserId
              );
              const mySub = (bounty.submissions || []).find(
                (s) => String(s.student?._id || s.student) === currentUserId
              );

              return (
                <div className="col-12" key={bounty._id}>
                  <div className="bento-card p-4 rounded-4 shadow-sm border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3 mb-3">
                      <div>
                        <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                          <span className={`badge rounded-pill px-3 py-1 fw-bold ${getStatusBadge(bounty.status)}`}>
                            Bounty: {bounty.status}
                          </span>
                          {myApp && (
                            <span className={`badge rounded-pill px-3 py-1 fw-bold ${
                              myApp.status === "Approved"
                                ? "bg-success"
                                : myApp.status === "Rejected"
                                ? "bg-danger"
                                : "bg-warning text-dark"
                            }`}>
                              Application: {myApp.status}
                            </span>
                          )}
                          {isAssigned && (
                            <span className="badge rounded-pill bg-primary text-white fw-bold px-3 py-1">
                              Assigned to You
                            </span>
                          )}
                        </div>
                        <h4 className="fw-bold mb-1" style={{ color: "var(--text)" }}>{bounty.title}</h4>
                        <p className="text-muted small mb-0">
                          Posted by <strong>{bounty.poster?.name}</strong> • {bounty.poster?.alumniProfile?.company || "Alumni Mentor"}
                        </p>
                      </div>

                      <div className="text-end">
                        <span className="small text-muted d-block">Reward</span>
                        <div className="fw-black fs-4 text-success d-flex align-items-center justify-content-end">
                          <DollarSign size={20} />
                          {bounty.rewardAmount}
                        </div>
                      </div>
                    </div>

                    <p className="text-muted small mb-3">{bounty.description}</p>

                    {/* Task Instructions (Important for Assigned Student) */}
                    {bounty.taskInstructions && (
                      <div className="p-3 rounded-3 mb-3 bg-light border">
                        <h6 className="fw-bold small text-primary mb-1">Task Deliverables & Instructions:</h6>
                        <p className="small text-muted mb-0">{bounty.taskInstructions}</p>
                      </div>
                    )}

                    {/* Revision Feedback Alert (if revision requested) */}
                    {mySub?.status === "Revision Requested" && (
                      <div className="alert alert-warning py-3 px-3 rounded-3 mb-3 d-flex align-items-start gap-3">
                        <AlertCircle size={20} className="text-warning flex-shrink-0 mt-1" />
                        <div>
                          <strong className="d-block mb-1">Mentor Requested Revisions:</strong>
                          <span className="small">{mySub.feedback || "Please review the task and update your deliverable."}</span>
                        </div>
                      </div>
                    )}

                    {/* Current Submission Deliverable */}
                    {mySub && (
                      <div className="p-3 rounded-3 mb-3 border bg-light d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2">
                        <div>
                          <div className="small fw-bold text-foreground">Your Submitted Deliverable:</div>
                          <a
                            href={mySub.solutionUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="small text-primary text-decoration-none d-flex align-items-center gap-1"
                          >
                            <ExternalLink size={12} /> {mySub.solutionUrl}
                          </a>
                          {mySub.message && <div className="small text-muted mt-1">{mySub.message}</div>}
                        </div>
                        <span className={`badge rounded-pill ${
                          mySub.status === "Accepted"
                            ? "bg-success"
                            : mySub.status === "Revision Requested"
                            ? "bg-warning text-dark"
                            : "bg-primary"
                        }`}>
                          Status: {mySub.status}
                        </span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="d-flex justify-content-end gap-2 pt-3 border-top" style={{ borderColor: "var(--border)" }}>
                      {isAssigned && bounty.status !== "Completed" && (
                        <button
                          onClick={() => handleOpenSubmitSolution(bounty)}
                          className="btn btn-sm btn-success rounded-pill px-4 fw-bold d-flex align-items-center gap-1 shadow-sm"
                        >
                          <Send size={14} />
                          {mySub ? "Update / Resubmit Solution" : "Submit Deliverables"}
                        </button>
                      )}
                      {bounty.status === "Completed" && mySub?.status === "Accepted" && (
                        <span className="text-success fw-bold small d-flex align-items-center gap-1">
                          <CheckCircle2 size={16} /> Bounty Won & Karma Credited!
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-12 text-center py-5">
              <Target size={56} className="text-muted mb-3 opacity-25" />
              <h4 className="fw-bold text-muted">You haven't applied for any bounties yet</h4>
              <p className="text-muted mb-3">Browse open opportunities and apply to gain hands-on experience and earn cash rewards.</p>
              <button className="btn btn-primary rounded-pill px-4 fw-bold" onClick={() => setActiveTab("explore")}>
                Explore Bounties
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Modal: Bounty Details ── */}
      <AnimatePresence>
        {selectedBounty && (
          <div
            className="modal-backdrop-blur position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
            style={{ zIndex: 1050, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)" }}
            onClick={() => setSelectedBounty(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bento-card p-4 rounded-4 shadow-lg border overflow-auto"
              style={{ width: "100%", maxWidth: 600, maxHeight: "85vh", background: "var(--surface)", borderColor: "var(--border)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <span className={`badge rounded-pill px-3 py-1 mb-2 fw-bold text-uppercase ${getStatusBadge(selectedBounty.status)}`}>
                    {selectedBounty.status}
                  </span>
                  <h4 className="fw-bold mb-1" style={{ color: "var(--text)" }}>{selectedBounty.title}</h4>
                  <div className="small text-muted">
                    Posted by <strong>{selectedBounty.poster?.name}</strong> • {selectedBounty.poster?.alumniProfile?.company || "Alumni"}
                  </div>
                </div>
                <button className="btn-close" onClick={() => setSelectedBounty(null)}></button>
              </div>

              <div className="p-3 rounded-3 bg-light mb-3 d-flex justify-content-between align-items-center">
                <div>
                  <span className="small text-muted d-block">Reward</span>
                  <div className="fw-black fs-4 text-success d-flex align-items-center">
                    <DollarSign size={20} />
                    {selectedBounty.rewardAmount} {selectedBounty.rewardCurrency || "USD"}
                  </div>
                </div>
                <div className="text-end">
                  <span className="small text-muted d-block">Difficulty</span>
                  <span className="fw-bold">{selectedBounty.difficulty || "Intermediate"}</span>
                </div>
                <div className="text-end">
                  <span className="small text-muted d-block">Deadline</span>
                  <span className="fw-bold">
                    {selectedBounty.deadline ? new Date(selectedBounty.deadline).toLocaleDateString() : "Flexible"}
                  </span>
                </div>
              </div>

              <h6 className="fw-bold text-foreground mb-2">Overview</h6>
              <p className="small text-muted mb-3">{selectedBounty.description}</p>

              {selectedBounty.taskInstructions && (
                <>
                  <h6 className="fw-bold text-foreground mb-2">Task Instructions & Deliverables</h6>
                  <p className="small text-muted mb-3 p-3 rounded-3 bg-light border">{selectedBounty.taskInstructions}</p>
                </>
              )}

              {selectedBounty.eligibilityCriteria && (
                <>
                  <h6 className="fw-bold text-foreground mb-2">Eligibility Criteria</h6>
                  <p className="small text-muted mb-3">{selectedBounty.eligibilityCriteria}</p>
                </>
              )}

              <h6 className="fw-bold text-foreground mb-2">Required Skills</h6>
              <div className="d-flex flex-wrap gap-1 mb-4">
                {(selectedBounty.requiredSkills || selectedBounty.tags || []).map((sk, i) => (
                  <span key={i} className="badge bg-primary-subtle text-primary border rounded-pill px-3 py-1">
                    {sk}
                  </span>
                ))}
              </div>

              <div className="d-flex justify-content-end gap-2 pt-3 border-top">
                <button className="btn btn-light rounded-pill px-4" onClick={() => setSelectedBounty(null)}>
                  Close
                </button>
                {selectedBounty.status === "Open" && !selectedBounty.hasApplied && (
                  <button
                    className="btn btn-primary rounded-pill px-4 fw-bold"
                    onClick={() => {
                      const b = selectedBounty;
                      setSelectedBounty(null);
                      handleOpenApply(b);
                    }}
                  >
                    Apply Now
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Modal: Apply for Bounty ── */}
      <AnimatePresence>
        {applyingBounty && (
          <div
            className="modal-backdrop-blur position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
            style={{ zIndex: 1050, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)" }}
            onClick={() => setApplyingBounty(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bento-card p-4 rounded-4 shadow-lg border"
              style={{ width: "100%", maxWidth: 540, background: "var(--surface)", borderColor: "var(--border)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="fw-bold m-0" style={{ color: "var(--text)" }}>Apply for Bounty</h4>
                <button className="btn-close" onClick={() => setApplyingBounty(null)}></button>
              </div>

              <p className="small text-muted mb-3">
                Applying to: <strong>{applyingBounty.title}</strong> (${applyingBounty.rewardAmount})
              </p>

              <form onSubmit={handleSubmitApplication}>
                <div className="mb-3">
                  <label className="form-label fw-bold small text-muted">
                    Pitch / Statement of Interest <span className="text-danger">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    className="form-control"
                    placeholder="Describe why you are interested, your approach to solving this task, and relevant coursework or projects..."
                    value={applyForm.pitch}
                    onChange={(e) => setApplyForm({ ...applyForm, pitch: e.target.value })}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold small text-muted">
                    Relevant Skills (comma-separated)
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="React, Node.js, Express, Redis"
                    value={applyForm.relevantSkills}
                    onChange={(e) => setApplyForm({ ...applyForm, relevantSkills: e.target.value })}
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold small text-muted">
                    Portfolio / GitHub Profile Link
                  </label>
                  <input
                    type="url"
                    className="form-control"
                    placeholder="https://github.com/your-username"
                    value={applyForm.portfolioUrl}
                    onChange={(e) => setApplyForm({ ...applyForm, portfolioUrl: e.target.value })}
                  />
                </div>

                <div className="d-flex justify-content-end gap-2 pt-2 border-top">
                  <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setApplyingBounty(null)}>
                    Cancel
                  </button>
                  <button type="submit" disabled={applying} className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm">
                    {applying ? "Submitting..." : "Submit Application"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Modal: Submit Work Deliverables ── */}
      <AnimatePresence>
        {submittingBounty && (
          <div
            className="modal-backdrop-blur position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
            style={{ zIndex: 1050, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)" }}
            onClick={() => setSubmittingBounty(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bento-card p-4 rounded-4 shadow-lg border"
              style={{ width: "100%", maxWidth: 520, background: "var(--surface)", borderColor: "var(--border)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="fw-bold m-0" style={{ color: "var(--text)" }}>Submit Deliverables</h4>
                <button className="btn-close" onClick={() => setSubmittingBounty(null)}></button>
              </div>

              <p className="small text-muted mb-3">
                Task: <strong>{submittingBounty.title}</strong>
              </p>

              <form onSubmit={handleSubmitSolution}>
                <div className="mb-3">
                  <label className="form-label fw-bold small text-muted">
                    Solution / Deliverable URL <span className="text-danger">*</span>
                  </label>
                  <input
                    required
                    type="url"
                    className="form-control"
                    placeholder="https://github.com/org/repo/pull/1 or https://my-deployed-app.vercel.app"
                    value={solutionForm.solutionUrl}
                    onChange={(e) => setSolutionForm({ ...solutionForm, solutionUrl: e.target.value })}
                  />
                  <div className="form-text small">GitHub PR link, hosted demo URL, or Figma document.</div>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold small text-muted">
                    Notes & Deliverable Description
                  </label>
                  <textarea
                    rows={3}
                    className="form-control"
                    placeholder="Summarize the changes implemented, setup instructions, or test results..."
                    value={solutionForm.message}
                    onChange={(e) => setSolutionForm({ ...solutionForm, message: e.target.value })}
                  />
                </div>

                <div className="d-flex justify-content-end gap-2 pt-2 border-top">
                  <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setSubmittingBounty(null)}>
                    Cancel
                  </button>
                  <button type="submit" disabled={submittingWork} className="btn btn-success rounded-pill px-4 fw-bold shadow-sm">
                    {submittingWork ? "Submitting..." : "Submit Deliverables"}
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
