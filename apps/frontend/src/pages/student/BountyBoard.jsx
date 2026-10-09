import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target,
  Search,
  Filter,
  Briefcase,
  IndianRupee,
  Clock,
  Zap,
  ArrowRight,
  Code,
  Plus,
  X,
} from "lucide-react";
import { bountyService } from "../../services/api";
import { useToast } from "../../context/ToastContext";
export default function BountyBoard() {
  const { addToast } = useToast();
  const [filter, setFilter] = useState("all");
  const [bounties, setBounties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [claiming, setClaiming] = useState(null);
  const [claimUrl, setClaimUrl] = useState("");
  const [postForm, setPostForm] = useState({
    title: "",
    description: "",
    rewardAmount: "",
    tags: "",
    deadline: "",
  });
  const [posting, setPosting] = useState(false);
  const [activeTab, setActiveTab] = useState("explore"); // explore or mine
  const [myBounties, setMyBounties] = useState([]);
  const [loadingMine, setLoadingMine] = useState(false);
  useEffect(() => {
    const fetchBounties = async () => {
      try {
        const res = await bountyService.getOpenBounties();
        setBounties(res.data.data || []);
      } catch (err) {
        addToast("Failed to load bounties", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchBounties();
  }, []);
  const handlePostBounty = async (e) => {
    e.preventDefault();
    try {
      setPosting(true);
      const payload = {
        ...postForm,
        tags: postForm.tags.split(",").map((t) => t.trim()),
        rewardAmount: Number(postForm.rewardAmount),
      };
      await bountyService.createBounty(payload);
      addToast("Bounty posted successfully!", "success");
      setShowModal(false);
      setPostForm({
        title: "",
        description: "",
        rewardAmount: "",
        tags: "",
        deadline: "",
      });
      const res = await bountyService.getOpenBounties();
      setBounties(res.data.data || []);
    } catch (err) {
      addToast(err.message || "Failed to post bounty", "error");
    } finally {
      setPosting(false);
    }
  };
  const handleClaim = async (bountyId) => {
    if (!claimUrl.trim()) {
      addToast("Please enter your solution URL", "error");
      return;
    }
    try {
      await bountyService.submitSolution(bountyId, {
        solutionUrl: claimUrl,
        message: "Submitting solution",
      });
      addToast("Solution submitted! The poster will review it.", "success");
      setClaiming(null);
      setClaimUrl("");
      const res = await bountyService.getOpenBounties();
      setBounties(res.data.data || []);
    } catch (err) {
      addToast(err.message || "Failed to submit solution", "error");
    }
  };
  const fetchMyBounties = async () => {
    try {
      setLoadingMine(true);
      const res = await bountyService.getMyBounties();
      setMyBounties(res.data.data || []);
    } catch (err) {
      addToast("Failed to load your bounties", "error");
    } finally {
      setLoadingMine(false);
    }
  };
  useEffect(() => {
    if (activeTab === "mine") {
      fetchMyBounties();
    }
  }, [activeTab]);
  const handleAward = async (bountyId, submissionId) => {
    try {
      await bountyService.awardBounty(bountyId, submissionId);
      addToast("Bounty awarded and payout transferred!", "success");
      fetchMyBounties();
      const res = await bountyService.getOpenBounties();
      setBounties(res.data.data || []);
    } catch (err) {
      addToast("Failed to award bounty", "error");
    }
  };
  const filteredBounties =
    filter === "all"
      ? bounties
      : bounties.filter((b) => b.status?.toLowerCase() === filter);
  return (
    <div>
      {" "}
      <div className="container-fluid space-y-4" style={{ maxWidth: "1400px" }}>
        {" "}
        {/* Header Info */}{" "}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-4 bento-card p-4 mb-4 position-relative overflow-hidden">
          {" "}
          <div
            className="position-absolute rounded-circle pe-none"
            style={{
              top: 0,
              right: 0,
              width: "250px",
              height: "250px",
              background: "rgba(236,72,153,0.2)",
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
              <Target className="text-pink" size={32} /> Hackathon Bounty
              Board{" "}
            </h2>{" "}
            <p
              className="fw-medium mb-0"
              style={{ color: "var(--text-secondary)" }}
            >
              Claim micro-freelance gigs from startups and university
              departments to earn real money and Karma.
            </p>{" "}
          </div>{" "}
          <div className="position-relative z-1 d-flex gap-3">
            {" "}
            <button
              onClick={() => setActiveTab("explore")}
              className={`btn rounded-pill px-4 py-2 fw-bold transition-fast ${activeTab === "explore" ? "shadow" : ""}`}
              style={{
                background:
                  activeTab === "explore" ? "var(--surface-2)" : "transparent",
                color: "var(--text)",
                border: "1px solid var(--border)",
              }}
            >
              Explore
            </button>{" "}
            <button
              onClick={() => setActiveTab("mine")}
              className={`btn rounded-pill px-4 py-2 fw-bold transition-fast ${activeTab === "mine" ? "shadow" : ""}`}
              style={{
                background:
                  activeTab === "mine" ? "var(--surface-2)" : "transparent",
                color: "var(--text)",
                border: "1px solid var(--border)",
              }}
            >
              My Postings
            </button>{" "}
            <button
              onClick={() => setShowModal(true)}
              className="btn rounded-pill px-4 py-2 fw-bold shadow-sm hover-lift d-flex align-items-center gap-2"
              style={{
                background: "var(--pink)",
                color: "#fff",
                border: "none",
              }}
            >
              {" "}
              <Zap size={18} /> Post a Bounty{" "}
            </button>{" "}
          </div>{" "}
        </div>{" "}
        {activeTab === "explore" ? (
          <>
            {" "}
            {/* Filters & Search */}{" "}
            <div className="d-flex flex-column flex-md-row justify-content-between gap-3 mb-4">
              {" "}
              <div
                className="d-flex gap-2 p-1 rounded-pill"
                style={{
                  background: "rgba(0,0,0,0.05)",
                  border: "1px solid rgba(0,0,0,0.05)",
                  width: "fit-content",
                }}
              >
                {" "}
                <button
                  onClick={() => setFilter("all")}
                  className={`btn btn-sm rounded-pill px-3 fw-bold transition-fast ${filter === "all" ? "shadow-sm" : ""}`}
                  style={{
                    background:
                      filter === "all"
                        ? "rgba(var(--primary-rgb), 0.2)"
                        : "transparent",
                    color:
                      filter === "all"
                        ? "var(--text)"
                        : "var(--text-secondary)",
                    border: "none",
                  }}
                >
                  All Bounties
                </button>{" "}
                <button
                  onClick={() => setFilter("open")}
                  className={`btn btn-sm rounded-pill px-3 fw-bold transition-fast ${filter === "open" ? "shadow-sm" : ""}`}
                  style={{
                    background:
                      filter === "open"
                        ? "rgba(var(--success-rgb), 0.2)"
                        : "transparent",
                    color:
                      filter === "open"
                        ? "var(--success)"
                        : "var(--text-secondary)",
                    border: "none",
                  }}
                >
                  Open
                </button>{" "}
                <button
                  onClick={() => setFilter("in_progress")}
                  className={`btn btn-sm rounded-pill px-3 fw-bold transition-fast ${filter === "in_progress" ? "shadow-sm" : ""}`}
                  style={{
                    background:
                      filter === "in_progress"
                        ? "rgba(var(--warning-rgb), 0.2)"
                        : "transparent",
                    color:
                      filter === "in_progress"
                        ? "var(--warning)"
                        : "var(--text-secondary)",
                    border: "none",
                  }}
                >
                  In Progress
                </button>{" "}
                <button
                  onClick={() => setFilter("completed")}
                  className={`btn btn-sm rounded-pill px-3 fw-bold transition-fast ${filter === "completed" ? "shadow-sm" : ""}`}
                  style={{
                    background:
                      filter === "completed"
                        ? "rgba(0,0,0,0.05)"
                        : "transparent",
                    color:
                      filter === "completed"
                        ? "var(--text)"
                        : "var(--text-secondary)",
                    border: "none",
                  }}
                >
                  Completed
                </button>{" "}
              </div>{" "}
              <div
                className="position-relative"
                style={{ width: "100%", maxWidth: "300px" }}
              >
                {" "}
                <Search
                  className="position-absolute text-muted"
                  size={16}
                  style={{
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                />{" "}
                <input
                  type="text"
                  placeholder="Search bounties..."
                  className="form-control bg-transparent rounded-pill ps-5"
                  style={{ color: "var(--text)", borderColor: "var(--border)" }}
                />{" "}
              </div>{" "}
            </div>{" "}
            {/* Grid */}{" "}
            <div className="row g-4">
              {" "}
              <AnimatePresence mode="popLayout">
                {" "}
                {filteredBounties.map((bounty) => (
                  <div
                    className="col-12 col-md-6 col-xl-4"
                    key={bounty._id || bounty.id}
                  >
                    {" "}
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                      className="bento-card p-4 d-flex flex-column h-100 hover-lift hover-glow cursor-pointer"
                    >
                      {" "}
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        {" "}
                        <div
                          className={`badge rounded-pill px-3 py-2 fw-bold text-uppercase border ${bounty.status === "open" ? "border-success text-success" : bounty.status === "in_progress" ? "border-warning text-warning" : "border text-secondary"}`}
                          style={{ background: "rgba(0,0,0,0.05)" }}
                        >
                          {" "}
                          {bounty.status.replace("_", " ")}{" "}
                        </div>{" "}
                        <div className="h4 fw-black text-success d-flex align-items-center m-0">
                          {" "}
                          <IndianRupee size={20} />
                          {bounty.reward}{" "}
                        </div>{" "}
                      </div>{" "}
                      <h4
                        className="fw-bold mb-2"
                        style={{ color: "var(--text)" }}
                      >
                        {bounty.title}
                      </h4>{" "}
                      <div
                        className="d-flex align-items-center gap-2 small fw-medium mb-4"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {" "}
                        <Briefcase size={16} /> {bounty.poster}{" "}
                      </div>{" "}
                      <div className="d-flex flex-wrap gap-2 mt-auto">
                        {" "}
                        {(bounty.tags || []).map((tag, i) => (
                          <span
                            key={i}
                            className="badge rounded-pill d-flex align-items-center gap-1 fw-medium"
                            style={{
                              background: "rgba(0,0,0,0.05)",
                              color: "var(--text-secondary)",
                              border: "1px solid var(--border)",
                            }}
                          >
                            {" "}
                            {tag === "React" ||
                            tag === "Python" ||
                            tag === "Figma" ? (
                              <Code size={12} className="text-muted" />
                            ) : null}{" "}
                            {tag}{" "}
                          </span>
                        ))}{" "}
                      </div>{" "}
                      <div
                        className="pt-3 mt-4 d-flex justify-content-between align-items-center"
                        style={{ borderTop: "1px solid var(--border)" }}
                      >
                        {" "}
                        <div
                          className="d-flex gap-3 small fw-medium"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {" "}
                          <span className="d-flex align-items-center gap-1 text-warning">
                            <Zap size={12} /> {bounty.difficulty}
                          </span>{" "}
                          <span className="d-flex align-items-center gap-1">
                            <Clock size={12} /> {bounty.deadline}
                          </span>{" "}
                        </div>{" "}
                        {bounty.status?.toLowerCase() === "open" && (
                          <button
                            onClick={() => setClaiming(bounty._id)}
                            className="btn btn-sm rounded-pill fw-bold hover-lift d-flex align-items-center gap-1"
                            style={{
                              background: "var(--surface-2)",
                              color: "var(--text)",
                              border: "1px solid var(--border)",
                            }}
                          >
                            {" "}
                            Claim <ArrowRight size={14} />{" "}
                          </button>
                        )}{" "}
                      </div>{" "}
                    </motion.div>{" "}
                  </div>
                ))}{" "}
              </AnimatePresence>{" "}
            </div>{" "}
          </>
        ) : (
          <div className="row g-4">
            {" "}
            {loadingMine ? (
              <div className="text-center w-100 py-5 text-muted">
                Loading your postings...
              </div>
            ) : null}{" "}
            {myBounties.map((bounty) => (
              <div className="col-12" key={bounty._id}>
                {" "}
                <div className="bento-card p-4 mb-3 border border-pink border-opacity-25">
                  {" "}
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    {" "}
                    <h4 className="fw-bold m-0 text-foreground">
                      {bounty.title}
                    </h4>{" "}
                    <div className="badge bg-light border text-foreground">
                      {bounty.status}
                    </div>{" "}
                  </div>{" "}
                  <p className="text-muted">{bounty.description}</p>{" "}
                  <hr className="border" />{" "}
                  <h5 className="fw-bold text-foreground mb-3">
                    Submissions ({bounty.submissions?.length || 0})
                  </h5>{" "}
                  {bounty.submissions?.length === 0 && (
                    <div className="text-muted small">
                      No solutions submitted yet.
                    </div>
                  )}{" "}
                  <div className="d-flex flex-column gap-3">
                    {" "}
                    {bounty.submissions?.map((sub) => (
                      <div
                        key={sub._id}
                        className="bg-light p-3 rounded-3 border d-flex justify-content-between align-items-center"
                      >
                        {" "}
                        <div>
                          {" "}
                          <div className="fw-bold text-foreground">
                            {sub.student?.name}
                          </div>{" "}
                          <a
                            href={sub.solutionUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="small text-pink text-decoration-none"
                          >
                            {sub.solutionUrl}
                          </a>{" "}
                          <div className="small text-success mt-1">
                            Status: {sub.status}
                          </div>{" "}
                        </div>{" "}
                        {sub.status === "Pending" &&
                          bounty.status !== "Completed" && (
                            <button
                              onClick={() => handleAward(bounty._id, sub._id)}
                              className="btn btn-sm btn-success rounded-pill fw-bold px-3"
                            >
                              Award Solution
                            </button>
                          )}{" "}
                      </div>
                    ))}{" "}
                  </div>{" "}
                </div>{" "}
              </div>
            ))}{" "}
            {!loadingMine && myBounties.length === 0 && (
              <div className="text-center w-100 py-5 text-muted">
                You haven't posted any bounties.
              </div>
            )}{" "}
          </div>
        )}{" "}
      </div>{" "}
      {/* Post Bounty Modal */}{" "}
      {showModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ background: "rgba(0,0,0,0.02)", zIndex: 9999 }}
        >
          {" "}
          <div
            className="bento-card p-4"
            style={{ maxWidth: 500, width: "90%" }}
          >
            {" "}
            <div className="d-flex justify-content-between align-items-center mb-4">
              {" "}
              <h4 className="fw-black m-0" style={{ color: "var(--text)" }}>
                Post a Bounty
              </h4>{" "}
              <button
                className="btn btn-sm"
                style={{ color: "var(--text-secondary)" }}
                onClick={() => setShowModal(false)}
              >
                <X size={20} />
              </button>{" "}
            </div>{" "}
            <form onSubmit={handlePostBounty}>
              {" "}
              <div className="mb-3">
                {" "}
                <label
                  className="form-label small fw-bold"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Title
                </label>{" "}
                <input
                  required
                  className="form-control bg-transparent"
                  style={{ color: "var(--text)", borderColor: "var(--border)" }}
                  value={postForm.title}
                  onChange={(e) =>
                    setPostForm((p) => ({ ...p, title: e.target.value }))
                  }
                  placeholder="e.g., Build a React Dashboard"
                />{" "}
              </div>{" "}
              <div className="mb-3">
                {" "}
                <label
                  className="form-label small fw-bold"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Description
                </label>{" "}
                <textarea
                  required
                  className="form-control bg-transparent"
                  style={{ color: "var(--text)", borderColor: "var(--border)" }}
                  rows={3}
                  value={postForm.description}
                  onChange={(e) =>
                    setPostForm((p) => ({ ...p, description: e.target.value }))
                  }
                  placeholder="Describe the task in detail..."
                />{" "}
              </div>{" "}
              <div className="row g-3 mb-3">
                {" "}
                <div className="col-6">
                  {" "}
                  <label
                    className="form-label small fw-bold"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Reward (₹)
                  </label>{" "}
                  <input
                    required
                    type="number"
                    className="form-control bg-transparent"
                    style={{
                      color: "var(--text)",
                      borderColor: "var(--border)",
                    }}
                    value={postForm.rewardAmount}
                    onChange={(e) =>
                      setPostForm((p) => ({
                        ...p,
                        rewardAmount: e.target.value,
                      }))
                    }
                    placeholder="5000"
                  />{" "}
                </div>{" "}
                <div className="col-6">
                  {" "}
                  <label
                    className="form-label small fw-bold"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Deadline
                  </label>{" "}
                  <input
                    required
                    type="date"
                    className="form-control bg-transparent"
                    style={{
                      color: "var(--text)",
                      borderColor: "var(--border)",
                    }}
                    value={postForm.deadline}
                    onChange={(e) =>
                      setPostForm((p) => ({ ...p, deadline: e.target.value }))
                    }
                  />{" "}
                </div>{" "}
              </div>{" "}
              <div className="mb-4">
                {" "}
                <label
                  className="form-label small fw-bold"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Tags (comma-separated)
                </label>{" "}
                <input
                  className="form-control bg-transparent"
                  style={{ color: "var(--text)", borderColor: "var(--border)" }}
                  value={postForm.tags}
                  onChange={(e) =>
                    setPostForm((p) => ({ ...p, tags: e.target.value }))
                  }
                  placeholder="React, Python, Figma"
                />{" "}
              </div>{" "}
              <button
                type="submit"
                disabled={posting}
                className="btn w-100 rounded-pill fw-bold py-2"
                style={{
                  background: "var(--pink)",
                  color: "#fff",
                  border: "none",
                }}
              >
                {" "}
                {posting ? "Posting..." : "Post Bounty"}{" "}
              </button>{" "}
            </form>{" "}
          </div>{" "}
        </div>
      )}{" "}
      {/* Claim Solution Modal */}{" "}
      {claiming && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ background: "rgba(0,0,0,0.02)", zIndex: 9999 }}
        >
          {" "}
          <div
            className="bento-card p-4"
            style={{ maxWidth: 480, width: "90%" }}
          >
            {" "}
            <div className="d-flex justify-content-between align-items-center mb-4">
              {" "}
              <h4 className="fw-black m-0" style={{ color: "var(--text)" }}>
                Submit Solution
              </h4>{" "}
              <button
                className="btn btn-sm"
                style={{ color: "var(--text-secondary)" }}
                onClick={() => setClaiming(null)}
              >
                <X size={20} />
              </button>{" "}
            </div>{" "}
            <p
              className="small mb-3"
              style={{ color: "var(--text-secondary)" }}
            >
              Paste a link to your GitHub repo, deployed project, or any hosted
              solution.
            </p>{" "}
            <input
              className="form-control bg-transparent mb-4"
              style={{ color: "var(--text)", borderColor: "var(--border)" }}
              placeholder="https://github.com/your-repo"
              value={claimUrl}
              onChange={(e) => setClaimUrl(e.target.value)}
            />{" "}
            <button
              onClick={() => handleClaim(claiming)}
              className="btn w-100 rounded-pill fw-bold py-2"
              style={{
                background: "var(--success)",
                color: "#fff",
                border: "none",
              }}
            >
              Submit Solution
            </button>{" "}
          </div>{" "}
        </div>
      )}{" "}
    </div>
  );
}
