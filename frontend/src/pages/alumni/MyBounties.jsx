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
  Users,
  Clock,
  Calendar,
  AlertCircle,
  Edit3,
  Trash2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileText,
  Check,
  RefreshCw,
  Send,
  Zap,
  Tag,
  ShieldAlert,
  ArrowRight,
  X
} from "lucide-react";
import { useToast } from "../../context/ToastContext";

const MyBounties = () => {
  const { addToast } = useToast();
  const [bounties, setBounties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  // Create & Edit Modal States
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    taskInstructions: "",
    rewardAmount: 100,
    rewardCurrency: "USD",
    tags: "",
    difficulty: "Intermediate",
    eligibilityCriteria: "Open to all enrolled students with relevant skills",
    deadline: "",
    status: "Open"
  });
  const [submitting, setSubmitting] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  // Expanded Bounty Card (for reviewing applicants/submissions)
  const [expandedId, setExpandedId] = useState(null);

  // Revision Modal State
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [revisionData, setRevisionData] = useState({ bountyId: null, submissionId: null, feedback: "" });
  const [revisionSubmitting, setRevisionSubmitting] = useState(false);

  // Student Profile Preview Modal
  const [previewStudent, setPreviewStudent] = useState(null);

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

  const handleOpenCreate = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      title: "",
      description: "",
      taskInstructions: "",
      rewardAmount: 100,
      rewardCurrency: "USD",
      tags: "",
      difficulty: "Intermediate",
      eligibilityCriteria: "Open to all enrolled students with relevant skills",
      deadline: "",
      status: "Open"
    });
    setShowModal(true);
  };

  const handleOpenEdit = (bounty) => {
    setIsEditing(true);
    setEditingId(bounty._id);
    setFormData({
      title: bounty.title || "",
      description: bounty.description || "",
      taskInstructions: bounty.taskInstructions || "",
      rewardAmount: bounty.rewardAmount || 100,
      rewardCurrency: bounty.rewardCurrency || "USD",
      tags: Array.isArray(bounty.tags) ? bounty.tags.join(", ") : "",
      difficulty: bounty.difficulty || "Intermediate",
      eligibilityCriteria: bounty.eligibilityCriteria || "",
      deadline: bounty.deadline ? new Date(bounty.deadline).toISOString().split("T")[0] : "",
      status: bounty.status || "Open"
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      addToast("Please provide both title and description", "warning");
      return;
    }

    try {
      setSubmitting(true);
      const tagsArray = formData.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = {
        ...formData,
        tags: tagsArray,
        requiredSkills: tagsArray,
        rewardAmount: Number(formData.rewardAmount)
      };

      if (isEditing) {
        await bountyService.updateBounty(editingId, payload);
        addToast("Bounty updated successfully! 🎯", "success");
      } else {
        await bountyService.createBounty(payload);
        addToast("Bounty posted successfully! 🚀", "success");
      }

      setShowModal(false);
      fetchMyBounties();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to save bounty", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (bountyId, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this bounty? This action cannot be undone.")) {
      return;
    }
    try {
      await bountyService.deleteBounty(bountyId);
      addToast("Bounty deleted successfully", "success");
      fetchMyBounties();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to delete bounty", "error");
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
        setFormData((prev) => ({
          ...prev,
          title: data.enhancedTitle || prev.title,
          description: data.enhancedDescription || prev.description,
          tags: data.suggestedTags ? data.suggestedTags.join(", ") : prev.tags
        }));
        addToast("Bounty enhanced with AI! ✨", "success");
      }
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to enhance bounty with AI", "error");
    } finally {
      setAiLoading(false);
    }
  };

  // Application Actions: Approve & Assign or Reject
  const handleApplicationStatus = async (bountyId, appId, newStatus) => {
    try {
      await bountyService.updateApplicationStatus(bountyId, appId, newStatus);
      addToast(
        newStatus === "Approved"
          ? "Application approved! Bounty assigned to student 🎓"
          : "Application rejected",
        "success"
      );
      fetchMyBounties();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to update application", "error");
    }
  };

  // Reopen Bounty: Unassign student and reopen for other students
  const handleReopenBounty = async (bountyId) => {
    if (!window.confirm("Are you sure you want to reopen this bounty? This will unassign the current student and make the bounty available to all other students again.")) {
      return;
    }
    try {
      await bountyService.reopenBounty(bountyId);
      addToast("Bounty reopened! It is now available to other students. 🔄", "success");
      fetchMyBounties();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to reopen bounty", "error");
    }
  };

  // Submission Review Actions: Approve (Completed + Award) or Revision or Reject
  const handleApproveSubmission = async (bountyId, submissionId) => {
    if (
      !window.confirm(
        "Are you sure you want to approve this work? This will award the bounty reward to the student and mark the task Completed."
      )
    )
      return;

    try {
      await bountyService.reviewSubmission(bountyId, submissionId, { action: "approve" });
      addToast("Bounty approved and awarded successfully! 🏆", "success");
      fetchMyBounties();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to approve submission", "error");
    }
  };

  const handleOpenRevisionModal = (bountyId, submissionId) => {
    setRevisionData({ bountyId, submissionId, feedback: "" });
    setShowRevisionModal(true);
  };

  const handleSendRevision = async (e) => {
    e.preventDefault();
    if (!revisionData.feedback.trim()) {
      addToast("Please describe the revisions requested", "warning");
      return;
    }
    try {
      setRevisionSubmitting(true);
      await bountyService.reviewSubmission(revisionData.bountyId, revisionData.submissionId, {
        action: "revision",
        feedback: revisionData.feedback
      });
      addToast("Revision requested. Student has been notified. 🔄", "success");
      setShowRevisionModal(false);
      fetchMyBounties();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to request revision", "error");
    } finally {
      setRevisionSubmitting(false);
    }
  };

  // Status badge styling helper
  const getStatusBadge = (status) => {
    switch (status) {
      case "Draft":
        return "bg-secondary text-light";
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
        return "bg-secondary text-light";
    }
  };

  // Filter bounties based on active tab
  const filteredBounties = bounties.filter((b) => {
    if (activeTab === "all") return true;
    if (activeTab === "draft") return b.status === "Draft";
    if (activeTab === "open") return b.status === "Open";
    if (activeTab === "in_progress") return ["Assigned", "In Progress"].includes(b.status);
    if (activeTab === "submitted") return ["Submitted", "Under Review"].includes(b.status);
    if (activeTab === "completed") return b.status === "Completed";
    return true;
  });

  const totalRewards = bounties.reduce((sum, b) => sum + (Number(b.rewardAmount) || 0), 0);
  const openCount = bounties.filter((b) => b.status === "Open").length;
  const inProgressCount = bounties.filter((b) => ["Assigned", "In Progress"].includes(b.status)).length;
  const pendingReviewsCount = bounties.filter((b) => ["Submitted", "Under Review"].includes(b.status)).length;

  if (loading) {
    return (
      <div className="container-fluid py-5 d-flex flex-column align-items-center justify-content-center" style={{ minHeight: "60vh" }}>
        <div className="spinner-border text-primary mb-3" style={{ width: "3rem", height: "3rem" }}></div>
        <p className="text-muted fw-semibold">Loading your bounties & applications...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4 px-xl-5">
      {/* ── Header ── */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-black mb-1 d-flex align-items-center gap-2" style={{ color: "var(--text)" }}>
            <Target className="text-primary" size={32} />
            Alumni Bounty Management
          </h2>
          <p className="text-muted mb-0">
            Create real micro-tasks, review interested student applicants, assign tasks, and review delivered work.
          </p>
        </div>
        <button
          className="btn btn-primary rounded-pill px-4 py-2 d-flex align-items-center gap-2 fw-bold shadow-sm hover-lift"
          onClick={handleOpenCreate}
        >
          <Plus size={20} /> Post New Bounty
        </button>
      </div>

      {/* ── Summary Metrics ── */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <div className="bento-card p-3 rounded-4 shadow-sm border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="d-flex align-items-center gap-3">
              <div className="p-3 rounded-circle bg-primary-subtle text-primary">
                <Target size={24} />
              </div>
              <div>
                <span className="small text-muted fw-semibold d-block">Total Bounties</span>
                <h4 className="fw-black m-0" style={{ color: "var(--text)" }}>{bounties.length}</h4>
              </div>
            </div>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="bento-card p-3 rounded-4 shadow-sm border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="d-flex align-items-center gap-3">
              <div className="p-3 rounded-circle bg-success-subtle text-success">
                <Zap size={24} />
              </div>
              <div>
                <span className="small text-muted fw-semibold d-block">Open & Active</span>
                <h4 className="fw-black m-0 text-success">{openCount}</h4>
              </div>
            </div>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="bento-card p-3 rounded-4 shadow-sm border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="d-flex align-items-center gap-3">
              <div className="p-3 rounded-circle bg-warning-subtle text-warning">
                <Clock size={24} />
              </div>
              <div>
                <span className="small text-muted fw-semibold d-block">In Progress</span>
                <h4 className="fw-black m-0 text-warning">{inProgressCount}</h4>
              </div>
            </div>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="bento-card p-3 rounded-4 shadow-sm border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="d-flex align-items-center gap-3">
              <div className="p-3 rounded-circle bg-info-subtle text-info">
                <DollarSign size={24} />
              </div>
              <div>
                <span className="small text-muted fw-semibold d-block">Committed Rewards</span>
                <h4 className="fw-black m-0" style={{ color: "var(--text)" }}>${totalRewards}</h4>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Filter Tabs ── */}
      <div className="d-flex flex-wrap gap-2 mb-4 pb-2 border-bottom" style={{ borderColor: "var(--border)" }}>
        {[
          { key: "all", label: `All (${bounties.length})` },
          { key: "open", label: `Open (${openCount})` },
          { key: "in_progress", label: `Assigned / In Progress (${inProgressCount})` },
          { key: "submitted", label: `Submitted Reviews (${pendingReviewsCount})` },
          { key: "completed", label: `Completed (${bounties.filter((b) => b.status === "Completed").length})` },
          { key: "draft", label: `Drafts (${bounties.filter((b) => b.status === "Draft").length})` }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`btn btn-sm rounded-pill px-3 py-2 fw-bold transition-fast ${
              activeTab === tab.key ? "btn-primary shadow-sm" : "btn-light text-muted"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Bounties List ── */}
      <div className="row g-4">
        {filteredBounties.length > 0 ? (
          filteredBounties.map((bounty, i) => {
            const isExpanded = expandedId === bounty._id;
            const applications = bounty.applications || [];
            const submissions = bounty.submissions || [];
            const pendingApps = applications.filter((a) => a.status === "Pending");
            const pendingSubs = submissions.filter((s) => s.status === "Pending");

            return (
              <div className="col-12" key={bounty._id}>
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bento-card p-4 rounded-4 shadow-sm border position-relative"
                  style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                >
                  {/* Top Row: Title, Status, Reward, Actions */}
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3 mb-3">
                    <div>
                      <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                        <span className={`badge rounded-pill px-3 py-2 fw-bold text-uppercase ${getStatusBadge(bounty.status)}`}>
                          {bounty.status}
                        </span>
                        <span className="badge rounded-pill bg-light border text-muted px-3 py-2">
                          {bounty.difficulty || "Intermediate"}
                        </span>
                        {bounty.category && (
                          <span className="badge rounded-pill bg-light border text-muted px-3 py-2">
                            {bounty.category}
                          </span>
                        )}
                        {bounty.deadline && (
                          <span className="small text-muted d-flex align-items-center gap-1 ms-2">
                            <Calendar size={14} /> Deadline: {new Date(bounty.deadline).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <h4 className="fw-bold mb-1" style={{ color: "var(--text)" }}>{bounty.title}</h4>
                      <p className="text-muted small mb-2">{bounty.description}</p>
                    </div>

                    <div className="d-flex align-items-center gap-3 align-self-end align-self-md-start">
                      <div className="text-end">
                        <span className="small text-muted d-block">Reward</span>
                        <div className="fw-black fs-4 text-success d-flex align-items-center justify-content-end">
                          <DollarSign size={20} />
                          {bounty.rewardAmount} {bounty.rewardCurrency || "USD"}
                        </div>
                      </div>

                      {/* Edit & Delete Action Buttons */}
                      <div className="d-flex gap-1 ms-2">
                        <button
                          className="btn btn-sm btn-outline-secondary rounded-circle p-2 hover-lift"
                          title="Edit Bounty"
                          onClick={() => handleOpenEdit(bounty)}
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger rounded-circle p-2 hover-lift"
                          title="Delete Bounty"
                          onClick={(e) => handleDelete(bounty._id, e)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Skills / Tags */}
                  {(bounty.tags || bounty.requiredSkills) && (
                    <div className="d-flex flex-wrap gap-2 mb-3">
                      {(bounty.tags || bounty.requiredSkills).map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="badge rounded-pill fw-medium d-flex align-items-center gap-1 px-3 py-1"
                          style={{ background: "rgba(99, 102, 241, 0.1)", color: "var(--primary)", border: "1px solid rgba(99,102,241,0.2)" }}
                        >
                          <Tag size={12} /> {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Task Instructions & Eligibility (if present) */}
                  {(bounty.taskInstructions || bounty.eligibilityCriteria) && (
                    <div className="p-3 rounded-3 mb-3" style={{ background: "var(--surface-2, rgba(0,0,0,0.02))", border: "1px solid var(--border)" }}>
                      {bounty.taskInstructions && (
                        <div className="small mb-2">
                          <strong className="text-foreground">Task Instructions: </strong>
                          <span className="text-muted">{bounty.taskInstructions}</span>
                        </div>
                      )}
                      {bounty.eligibilityCriteria && (
                        <div className="small">
                          <strong className="text-foreground">Eligibility: </strong>
                          <span className="text-muted">{bounty.eligibilityCriteria}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Assigned Student Summary (if assigned) */}
                  {bounty.assignedTo && (
                    <div className="alert alert-info py-2 px-3 d-flex flex-wrap align-items-center justify-content-between rounded-3 mb-3 gap-2">
                      <div className="d-flex align-items-center gap-2">
                        <Users size={18} className="text-info flex-shrink-0" />
                        <span className="small">
                          <strong>Assigned Student: </strong>
                          {bounty.assignedTo.name} ({bounty.assignedTo.email})
                          <span className="text-muted ms-2">(Reserved: removed from other students' feeds)</span>
                        </span>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <span className="badge bg-primary rounded-pill px-3 py-1">Claimed & Assigned</span>
                        {bounty.status !== "Completed" && (
                          <button
                            className="btn btn-sm btn-outline-danger rounded-pill px-3 py-1 d-flex align-items-center gap-1"
                            style={{ fontSize: "0.75rem" }}
                            onClick={() => handleReopenBounty(bounty._id)}
                            title="Unassign current student and reopen for others"
                          >
                            <RefreshCw size={12} /> Reopen for Others
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Accordion Toggle Bar: Applicants & Submissions */}
                  <div className="d-flex flex-wrap align-items-center justify-content-between pt-3 border-top" style={{ borderColor: "var(--border)" }}>
                    <div className="d-flex gap-3">
                      <span className="small fw-bold text-muted d-flex align-items-center gap-1">
                        <Users size={16} /> Applications: <strong>{applications.length}</strong>
                        {pendingApps.length > 0 && (
                          <span className="badge bg-warning text-dark ms-1">{pendingApps.length} pending</span>
                        )}
                      </span>
                      <span className="small fw-bold text-muted d-flex align-items-center gap-1">
                        <Award size={16} /> Submissions: <strong>{submissions.length}</strong>
                        {pendingSubs.length > 0 && (
                          <span className="badge bg-primary text-white ms-1">{pendingSubs.length} to review</span>
                        )}
                      </span>
                    </div>

                    <button
                      className="btn btn-sm btn-link text-decoration-none fw-bold d-flex align-items-center gap-1"
                      onClick={() => setExpandedId(isExpanded ? null : bounty._id)}
                    >
                      {isExpanded ? (
                        <>Hide Details <ChevronUp size={16} /></>
                      ) : (
                        <>Manage Applicants & Work <ChevronDown size={16} /></>
                      )}
                    </button>
                  </div>

                  {/* Expanded Section: Applicants Review & Submissions Review */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-3 border-top overflow-hidden"
                        style={{ borderColor: "var(--border)" }}
                      >
                        {/* 1. Student Applications Table */}
                        <div className="mb-4">
                          <h6 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: "var(--text)" }}>
                            <Users size={18} className="text-primary" />
                            Student Applications & Interest ({applications.length})
                          </h6>

                          {applications.length > 0 ? (
                            <div className="table-responsive rounded-3 border" style={{ borderColor: "var(--border)" }}>
                              <table className="table table-hover align-middle mb-0">
                                <thead className="table-light">
                                  <tr>
                                    <th>Student</th>
                                    <th>Skills & Background</th>
                                    <th>Pitch / Note</th>
                                    <th>Status</th>
                                    <th className="text-end">Action</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {applications.map((app) => (
                                    <tr key={app._id}>
                                      <td>
                                        <div className="d-flex align-items-center gap-2">
                                          <div
                                            className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
                                            style={{ width: 34, height: 34, fontSize: "0.85rem" }}
                                          >
                                            {app.student?.name?.[0] || "S"}
                                          </div>
                                          <div>
                                            <div className="fw-bold text-foreground">{app.student?.name || "Student"}</div>
                                            <div className="small text-muted">{app.student?.email}</div>
                                          </div>
                                        </div>
                                      </td>
                                      <td>
                                        <div className="small text-muted mb-1">
                                          Branch: {app.student?.studentProfile?.branch || "Engineering"}
                                          {app.student?.studentProfile?.cgpa ? ` • CGPA: ${app.student?.studentProfile?.cgpa}` : ""}
                                        </div>
                                        <div className="d-flex flex-wrap gap-1">
                                          {(app.relevantSkills?.length > 0
                                            ? app.relevantSkills
                                            : app.student?.studentProfile?.skills || []
                                          )
                                            .slice(0, 3)
                                            .map((sk, skIdx) => (
                                              <span key={skIdx} className="badge bg-light text-dark border small" style={{ fontSize: "0.7rem" }}>
                                                {sk}
                                              </span>
                                            ))}
                                        </div>
                                      </td>
                                      <td>
                                        <p className="small text-muted mb-1" style={{ maxWidth: 280 }}>
                                          {app.pitch || "Expressed interest in working on this task."}
                                        </p>
                                        {app.portfolioUrl && (
                                          <a
                                            href={app.portfolioUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="small text-primary text-decoration-none d-flex align-items-center gap-1"
                                          >
                                            <ExternalLink size={12} /> Portfolio / Repo
                                          </a>
                                        )}
                                      </td>
                                      <td>
                                        <span
                                          className={`badge rounded-pill ${
                                            app.status === "Approved"
                                              ? "bg-success"
                                              : app.status === "Rejected"
                                              ? "bg-danger"
                                              : "bg-warning text-dark"
                                          }`}
                                        >
                                          {app.status}
                                        </span>
                                      </td>
                                      <td className="text-end">
                                        {app.status === "Pending" ? (
                                          <div className="d-flex justify-content-end gap-1">
                                            <button
                                              className="btn btn-sm btn-success rounded-pill px-3 fw-bold d-flex align-items-center gap-1 hover-lift"
                                              onClick={() => handleApplicationStatus(bounty._id, app._id, "Approved")}
                                              title="Approve and assign bounty to this student"
                                            >
                                              <Check size={14} /> Approve & Assign
                                            </button>
                                            <button
                                              className="btn btn-sm btn-outline-danger rounded-pill px-2 hover-lift"
                                              onClick={() => handleApplicationStatus(bounty._id, app._id, "Rejected")}
                                              title="Reject application"
                                            >
                                              <XCircle size={14} />
                                            </button>
                                          </div>
                                        ) : app.status === "Approved" ? (
                                          <span className="text-success fw-bold small d-flex align-items-center justify-content-end gap-1">
                                            <CheckCircle2 size={16} /> Assigned
                                          </span>
                                        ) : (
                                          <span className="text-muted small">Rejected</span>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className="p-3 text-center text-muted rounded-3 border border-dashed small" style={{ borderColor: "var(--border)" }}>
                              No student applications received yet. Students will appear here as soon as they express interest.
                            </div>
                          )}
                        </div>

                        {/* 2. Submissions / Work Deliverables Table */}
                        <div>
                          <h6 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: "var(--text)" }}>
                            <Award size={18} className="text-success" />
                            Submitted Work Deliverables ({submissions.length})
                          </h6>

                          {submissions.length > 0 ? (
                            <div className="table-responsive rounded-3 border" style={{ borderColor: "var(--border)" }}>
                              <table className="table table-hover align-middle mb-0">
                                <thead className="table-light">
                                  <tr>
                                    <th>Student</th>
                                    <th>Solution Link</th>
                                    <th>Notes & Deliverable</th>
                                    <th>Status & Feedback</th>
                                    <th className="text-end">Review Actions</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {submissions.map((sub) => (
                                    <tr key={sub._id}>
                                      <td>
                                        <div className="fw-bold text-foreground">{sub.student?.name || "Student"}</div>
                                        <div className="small text-muted">{sub.student?.email}</div>
                                      </td>
                                      <td>
                                        <a
                                          href={sub.solutionUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="btn btn-sm btn-outline-primary rounded-pill d-inline-flex align-items-center gap-1 fw-semibold"
                                        >
                                          <ExternalLink size={14} /> View Work ↗
                                        </a>
                                      </td>
                                      <td>
                                        <div className="small text-muted" style={{ maxWidth: 300 }}>
                                          {sub.message || "Submitted solution for review."}
                                        </div>
                                        <span className="text-muted" style={{ fontSize: "0.75rem" }}>
                                          Submitted on {new Date(sub.submittedAt).toLocaleDateString()}
                                        </span>
                                      </td>
                                      <td>
                                        <span
                                          className={`badge rounded-pill ${
                                            sub.status === "Accepted"
                                              ? "bg-success"
                                              : sub.status === "Revision Requested"
                                              ? "bg-warning text-dark"
                                              : sub.status === "Rejected"
                                              ? "bg-danger"
                                              : "bg-primary"
                                          }`}
                                        >
                                          {sub.status}
                                        </span>
                                        {sub.feedback && (
                                          <div className="mt-1 small text-warning" style={{ fontSize: "0.75rem" }}>
                                            <strong>Note: </strong> {sub.feedback}
                                          </div>
                                        )}
                                      </td>
                                      <td className="text-end">
                                        {sub.status === "Pending" || sub.status === "Revision Requested" ? (
                                          <div className="d-flex justify-content-end gap-1">
                                            <button
                                              className="btn btn-sm btn-success rounded-pill px-3 fw-bold d-flex align-items-center gap-1 hover-lift"
                                              onClick={() => handleApproveSubmission(bounty._id, sub._id)}
                                              title="Approve completed work & payout reward"
                                            >
                                              <CheckCircle2 size={14} /> Approve & Award
                                            </button>
                                            <button
                                              className="btn btn-sm btn-outline-warning rounded-pill px-2 hover-lift"
                                              onClick={() => handleOpenRevisionModal(bounty._id, sub._id)}
                                              title="Request revision"
                                            >
                                              <RefreshCw size={14} /> Revision
                                            </button>
                                          </div>
                                        ) : sub.status === "Accepted" ? (
                                          <span className="text-success fw-bold d-flex align-items-center justify-content-end gap-1">
                                            <CheckCircle2 size={16} /> Completed & Awarded
                                          </span>
                                        ) : (
                                          <span className="text-muted small">Rejected</span>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className="p-3 text-center text-muted rounded-3 border border-dashed small" style={{ borderColor: "var(--border)" }}>
                              No deliverables submitted yet. Once the assigned student finishes the task and uploads their solution, it will appear here for your review.
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
            );
          })
        ) : (
          <div className="col-12 text-center py-5">
            <Target size={64} className="text-muted mb-3 opacity-25" />
            <h4 className="fw-bold text-muted">No bounties found in this filter</h4>
            <p className="text-muted mb-4">Post a micro-task or bounty to hire talented student contributors.</p>
            <button className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm" onClick={handleOpenCreate}>
              <Plus size={18} className="me-1" /> Post a Bounty
            </button>
          </div>
        )}
      </div>

      {/* ── Create / Edit Bounty Modal ── */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="nexora-modal-backdrop"
            onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="nexora-modal-container size-md"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="nexora-modal-header">
                <div className="nexora-modal-header-left">
                  <div className="nexora-modal-icon-badge">
                    <Award size={22} strokeWidth={2.2} />
                  </div>
                  <div>
                    <h4 className="nexora-modal-title">
                      {isEditing ? "Edit Bounty Opportunity" : "Create Student Bounty"}
                    </h4>
                    <p className="nexora-modal-subtitle">
                      Sponsor real-world engineering challenges for verified students
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="nexora-modal-close-btn"
                  onClick={() => setShowModal(false)}
                  title="Close modal"
                >
                  <X size={18} strokeWidth={2.2} />
                </button>
              </div>

              {/* Form & Body */}
              <form onSubmit={handleSubmit} className="d-flex flex-column" style={{ minHeight: 0, flex: 1 }}>
                <div className="nexora-modal-body">
                  {/* Title & AI Enhance */}
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <label className="nexora-form-label mb-0">
                        Bounty Title <span className="nexora-form-req">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleAIEnhance}
                        disabled={aiLoading || !formData.title.trim()}
                        className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1 rounded-pill px-3 py-1 fw-bold"
                        style={{ fontSize: "0.75rem" }}
                      >
                        <Sparkles size={13} />
                        {aiLoading ? "Enhancing..." : "Enhance with AI"}
                      </button>
                    </div>
                    <input
                      type="text"
                      className="nexora-form-input"
                      placeholder="e.g. Implement Microservices Redis Rate Limiter"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="mb-3">
                    <label className="nexora-form-label">
                      Overview Description <span className="nexora-form-req">*</span>
                    </label>
                    <textarea
                      className="nexora-form-textarea"
                      rows={3}
                      placeholder="Explain the background problem, goals, and desired end results..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                    />
                  </div>

                  {/* Task Instructions */}
                  <div className="mb-3">
                    <label className="nexora-form-label">
                      Task Deliverables & Instructions
                    </label>
                    <textarea
                      className="nexora-form-textarea"
                      rows={3}
                      placeholder="Specify exact deliverables, links to repos, acceptance criteria, or testing commands..."
                      value={formData.taskInstructions}
                      onChange={(e) => setFormData({ ...formData, taskInstructions: e.target.value })}
                    />
                  </div>

                  {/* Reward & Currency */}
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="nexora-form-label">
                        Reward Amount ($) <span className="nexora-form-req">*</span>
                      </label>
                      <input
                        type="number"
                        className="nexora-form-input"
                        min={1}
                        placeholder="100"
                        value={formData.rewardAmount}
                        onChange={(e) => setFormData({ ...formData, rewardAmount: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="nexora-form-label">
                        Difficulty Level
                      </label>
                      <select
                        className="nexora-form-select"
                        value={formData.difficulty}
                        onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                      >
                        <option value="Beginner">Beginner (1-2 days)</option>
                        <option value="Intermediate">Intermediate (3-5 days)</option>
                        <option value="Advanced">Advanced (1-2 weeks)</option>
                      </select>
                    </div>
                  </div>

                  {/* Required Skills / Tags */}
                  <div className="mb-3">
                    <label className="nexora-form-label">
                      Required Skills (comma-separated)
                    </label>
                    <input
                      type="text"
                      className="nexora-form-input"
                      placeholder="Node.js, Express, Redis, Docker, React"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    />
                  </div>

                  {/* Eligibility Criteria & Deadline */}
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="nexora-form-label">
                        Eligibility Criteria
                      </label>
                      <input
                        type="text"
                        className="nexora-form-input"
                        placeholder="e.g. CSE/IT students with backend knowledge"
                        value={formData.eligibilityCriteria}
                        onChange={(e) => setFormData({ ...formData, eligibilityCriteria: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="nexora-form-label">
                        Submission Deadline
                      </label>
                      <input
                        type="date"
                        className="nexora-form-input"
                        value={formData.deadline}
                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Status */}
                  <div className="mb-2">
                    <label className="nexora-form-label">
                      Publishing Status
                    </label>
                    <select
                      className="nexora-form-select"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="Open">Published & Open for Applications</option>
                      <option value="Draft">Save as Draft (Private)</option>
                    </select>
                  </div>
                </div>

                {/* Footer */}
                <div className="nexora-modal-footer">
                  <span className="nexora-modal-footer-hint d-none d-sm-inline">
                    * Required fields must be completed
                  </span>
                  <div className="nexora-modal-footer-actions">
                    <button
                      type="button"
                      className="nexora-modal-btn-cancel"
                      onClick={() => setShowModal(false)}
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="nexora-modal-btn-primary"
                    >
                      {submitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm" /> Saving...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={18} />
                          {isEditing ? "Update Bounty" : formData.status === "Draft" ? "Save Draft" : "Publish Bounty"}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Request Revision Modal ── */}
      <AnimatePresence>
        {showRevisionModal && (
          <div
            className="modal-backdrop-blur position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
            style={{ zIndex: 1060, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
            onClick={() => setShowRevisionModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bento-card p-4 rounded-4 shadow-lg border"
              style={{ width: "100%", maxWidth: 500, background: "var(--surface)", borderColor: "var(--border)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <h5 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: "var(--text)" }}>
                <RefreshCw size={20} className="text-warning" /> Request Task Revision
              </h5>
              <p className="small text-muted mb-3">
                Specify what changes or corrections the student needs to implement before you can approve the bounty.
              </p>
              <form onSubmit={handleSendRevision}>
                <div className="mb-3">
                  <textarea
                    required
                    rows={4}
                    className="form-control"
                    placeholder="e.g. Please add unit tests for edge cases and update the README with installation instructions..."
                    value={revisionData.feedback}
                    onChange={(e) => setRevisionData({ ...revisionData, feedback: e.target.value })}
                  />
                </div>
                <div className="d-flex justify-content-end gap-2">
                  <button type="button" className="btn btn-light rounded-pill px-3" onClick={() => setShowRevisionModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" disabled={revisionSubmitting} className="btn btn-warning rounded-pill px-4 fw-bold">
                    {revisionSubmitting ? "Sending..." : "Send Revision Request"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyBounties;
