import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { bountyService, aiService } from "../../services/api.js";
import {
  Plus,
  DollarSign,
  Target,
  CheckCircle2,
  XCircle,
  Award,
  Sparkles,
} from "lucide-react";
import { useToast } from "../../context/ToastContext";
const MyBounties = () => {
  const { addToast } = useToast();
  const [bounties, setBounties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    rewardAmount: 50,
    tags: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetchMyBounties();
  }, []);
  const fetchMyBounties = async () => {
    try {
      setLoading(true);
      const res = await bountyService.getMyBounties();
      setBounties(res.data.data || []);
    } catch (err) {
      addToast("Failed to load your bounties", "error");
    } finally {
      setLoading(false);
    }
  };
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const tagsArray = formData.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      await bountyService.createBounty({ ...formData, tags: tagsArray });
      addToast("Bounty created successfully!", "success");
      setShowCreate(false);
      setFormData({ title: "", description: "", rewardAmount: 50, tags: "" });
      fetchMyBounties();
    } catch (err) {
      addToast(
        err.response?.data?.message || "Failed to create bounty",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleAIEnhance = async () => {
    if (!formData.title) {
      addToast("Please provide a title first", "warning");
      return;
    }
    try {
      setAiLoading(true);
      const res = await aiService.enhanceBounty({ 
        title: formData.title, 
        description: formData.description 
      });
      const data = res.data.data;
      if (data) {
        setFormData({
          ...formData,
          title: data.enhancedTitle || formData.title,
          description: data.enhancedDescription || formData.description,
          tags: data.suggestedTags ? data.suggestedTags.join(", ") : formData.tags
        });
        addToast("Bounty enhanced by AI! ✨", "success");
      }
    } catch (err) {
      addToast("Failed to enhance bounty with AI", "error");
    } finally {
      setAiLoading(false);
    }
  };

  const handleAward = async (bountyId, submissionId) => {
    if (
      !window.confirm(
        "Are you sure you want to award the bounty to this student? This will reject all other submissions.",
      )
    )
      return;
    try {
      await bountyService.awardBounty(bountyId, submissionId);
      addToast("Bounty awarded successfully! 🏆", "success");
      fetchMyBounties();
    } catch (err) {
      addToast("Failed to award bounty", "error");
    }
  };
  if (loading) {
    return (
      <div className="container-fluid py-4 d-flex justify-content-center">
        {" "}
        <div className="spinner-border text-primary"></div>{" "}
      </div>
    );
  }
  return (
    <div className="container-fluid py-4 px-xl-5">
      {" "}
      <div className="d-flex justify-content-between align-items-center mb-5">
        {" "}
        <div>
          {" "}
          <h2 className="fw-black mb-1 text-gradient-primary">
            My Bounties 🎯
          </h2>{" "}
          <p className="text-muted mb-0">
            Manage the micro-tasks you've posted for students.
          </p>{" "}
        </div>{" "}
        <button
          className="btn btn-primary rounded-pill px-4 py-2 d-flex align-items-center gap-2 fw-bold shadow-sm"
          onClick={() => setShowCreate(true)}
        >
          {" "}
          <Plus size={20} /> Create Bounty{" "}
        </button>{" "}
      </div>{" "}
      <div className="row g-4">
        {" "}
        {bounties.length > 0 ? (
          bounties.map((bounty, i) => (
            <div className="col-12" key={bounty._id}>
              {" "}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bento-card p-4"
              >
                {" "}
                <div className="d-flex justify-content-between align-items-start mb-3">
                  {" "}
                  <div>
                    {" "}
                    <div className="d-flex align-items-center gap-3 mb-2">
                      {" "}
                      <h4 className="fw-bold mb-0">{bounty.title}</h4>{" "}
                      <span
                        className={`badge ${bounty.status === "Completed" ? "bg-success" : bounty.status === "In Progress" ? "bg-primary" : "bg-warning text-foreground"} rounded-pill`}
                      >
                        {" "}
                        {bounty.status}{" "}
                      </span>{" "}
                    </div>{" "}
                    <div className="fw-bold text-success fs-5 d-flex align-items-center gap-1">
                      {" "}
                      <DollarSign size={18} />
                      {bounty.rewardAmount}{" "}
                    </div>{" "}
                  </div>{" "}
                </div>{" "}
                <p className="text-muted small mb-4">{bounty.description}</p>{" "}
                <h6 className="fw-bold mb-3">
                  Submissions ({bounty.submissions?.length || 0})
                </h6>{" "}
                {bounty.submissions?.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle">
                      <thead>
                        <tr>
                          <th>Student</th> <th>Solution Link</th><th>Message</th> <th>Status</th> <th>Action</th></tr></thead>
                      <tbody>
                        {bounty.submissions.map((sub) => (
                          <tr key={sub._id}>
                            <td>
                              
                              <div className="fw-semibold">
                                {sub.student?.name || "Unknown User"}
                              </div>{" "}
                              <div
                                className="text-muted"
                                style={{ fontSize: "0.75rem" }}
                              >
                                {" "}
                                {sub.student?.studentProfile?.skills
                                  ?.slice(0, 2)
                                  .join(", ")}{" "}
                              </div>
                            </td><td>
                              
                              <a
                                href={sub.solutionUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary text-decoration-none"
                              >
                                {" "}
                                View Work ↗{" "}
                              </a>
                            </td><td>
                              
                              <span
                                className="text-muted small"
                                title={sub.message}
                              >
                                {" "}
                                {sub.message?.substring(0, 30)}
                                {sub.message?.length > 30 ? "..." : ""}{" "}
                              </span>
                            </td><td>
                              
                              <span
                                className={`badge ${sub.status === "Accepted" ? "bg-success-subtle text-success" : sub.status === "Rejected" ? "bg-danger-subtle text-danger" : "bg-secondary-subtle text-secondary"}`}
                              >
                                {" "}
                                {sub.status}{" "}
                              </span>
                            </td><td>
                              
                              {bounty.status !== "Completed" &&
                              sub.status === "Pending" ? (
                                <button
                                  className="btn btn-sm btn-success rounded-pill d-flex align-items-center gap-1 px-3 hover-scale"
                                  onClick={() =>
                                    handleAward(bounty._id, sub._id)
                                  }
                                >
                                  {" "}
                                  <Award size={14} /> Award{" "}
                                </button>
                              ) : sub.status === "Accepted" ? (
                                <span className="text-success fw-bold d-flex align-items-center gap-1">
                                  <CheckCircle2 size={16} /> Winner
                                </span>
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </td></tr>
                        ))}</tbody></table>
                  </div>
                ) : (
                  <div className="text-muted small p-3 bg-light rounded-3 text-center border border-dashed">
                    {" "}
                    No submissions yet.{" "}
                  </div>
                )}{" "}
              </motion.div>{" "}
            </div>
          ))
        ) : (
          <div className="col-12 text-center py-5">
            {" "}
            <Target size={64} className="text-muted mb-3 opacity-50" />{" "}
            <h4 className="fw-bold text-muted">
              You haven't posted any bounties.
            </h4>{" "}
            <p className="text-muted">
              Create your first bounty to get help from talented students.
            </p>{" "}
          </div>
        )}{" "}
      </div>{" "}
      {/* Create Bounty Modal */}{" "}
      <AnimatePresence>
        {" "}
        {showCreate && (
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
            onClick={() => setShowCreate(false)}
          >
            {" "}
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bento-card p-0 overflow-hidden"
              style={{
                width: "90%",
                maxWidth: "600px",
                maxHeight: "90vh",
                display: "flex",
                flexDirection: "column",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {" "}
              <div
                className="p-4 border-bottom d-flex justify-content-between align-items-center"
                style={{
                  borderColor: "var(--border) !important",
                  background: "var(--surface-2)",
                }}
              >
                {" "}
                <h4 className="fw-bold mb-0">Post a Bounty</h4>{" "}
                <button
                  className="btn-close"
                  onClick={() => setShowCreate(false)}
                ></button>{" "}
              </div>{" "}
              <div className="p-4 overflow-auto">
                {" "}
                <form onSubmit={handleCreate}>
                  {" "}
                  <div className="mb-3">
                    {" "}
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <label className="form-label fw-semibold mb-0">
                        Bounty Title <span className="text-danger">*</span>
                      </label>
                      <button 
                        type="button" 
                        onClick={handleAIEnhance}
                        disabled={aiLoading || !formData.title}
                        className="btn btn-sm text-purple d-flex align-items-center gap-1 fw-bold"
                        style={{ background: 'rgba(147,51,234,0.1)' }}
                      >
                        <Sparkles size={14} /> 
                        {aiLoading ? "Enhancing..." : "Enhance with AI"}
                      </button>
                    </div>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Optimize React rendering performance"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      required
                    />{" "}
                  </div>{" "}
                  <div className="mb-3">
                    {" "}
                    <label className="form-label fw-semibold">
                      Task Description <span className="text-danger">*</span>
                    </label>{" "}
                    <textarea
                      className="form-control"
                      rows="4"
                      placeholder="Describe the problem, expected output, and any context..."
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      required
                    ></textarea>{" "}
                  </div>{" "}
                  <div className="row">
                    {" "}
                    <div className="col-md-6 mb-3">
                      {" "}
                      <label className="form-label fw-semibold">
                        Reward Amount ($) <span className="text-danger">*</span>
                      </label>{" "}
                      <input
                        type="number"
                        className="form-control"
                        min="1"
                        value={formData.rewardAmount}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            rewardAmount: Number(e.target.value),
                          })
                        }
                        required
                      />{" "}
                    </div>{" "}
                    <div className="col-md-6 mb-4">
                      {" "}
                      <label className="form-label fw-semibold">
                        Tags (comma separated)
                      </label>{" "}
                      <input
                        type="text"
                        className="form-control"
                        placeholder="React, CSS, MongoDB"
                        value={formData.tags}
                        onChange={(e) =>
                          setFormData({ ...formData, tags: e.target.value })
                        }
                      />{" "}
                    </div>{" "}
                  </div>{" "}
                  <div
                    className="d-flex justify-content-end gap-2 pt-3 border-top"
                    style={{ borderColor: "var(--border) !important" }}
                  >
                    {" "}
                    <button
                      type="button"
                      className="btn btn-light rounded-pill px-4"
                      onClick={() => setShowCreate(false)}
                    >
                      Cancel
                    </button>{" "}
                    <button
                      type="submit"
                      className="btn btn-primary rounded-pill px-4 fw-bold"
                      disabled={submitting}
                    >
                      {" "}
                      {submitting ? "Posting..." : "Post Bounty"}{" "}
                    </button>{" "}
                  </div>{" "}
                </form>{" "}
              </div>{" "}
            </motion.div>{" "}
          </motion.div>
        )}{" "}
      </AnimatePresence>{" "}
    </div>
  );
};
export default MyBounties;
