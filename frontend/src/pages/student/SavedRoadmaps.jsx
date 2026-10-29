import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Map,
  Clock,
  Plus,
  ArrowLeft,
  CheckCircle2,
  BookmarkCheck,
  Eye,
  MoreVertical,
  Calendar,
  Sparkles,
  Shield,
  Code,
  Database,
  Cpu,
  Layers,
  Check,
  Circle,
  AlertCircle,
  FileText,
  Sliders,
  StickyNote,
  Trash2,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Activity,
  X
} from "lucide-react";
import { studentService, roadmapService } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";

// Helper icon resolver for role cards
const getRoleIcon = (roleName = "") => {
  const lower = roleName.toLowerCase();
  if (lower.includes("security") || lower.includes("cyber")) {
    return <Shield size={24} className="text-primary" />;
  }
  if (lower.includes("full") || lower.includes("web") || lower.includes("front") || lower.includes("developer")) {
    return <Code size={24} className="text-info" />;
  }
  if (lower.includes("data") || lower.includes("backend") || lower.includes("database")) {
    return <Database size={24} className="text-warning" />;
  }
  if (lower.includes("ai") || lower.includes("machine") || lower.includes("ml")) {
    return <Cpu size={24} className="text-success" />;
  }
  return <Layers size={24} className="text-primary" />;
};

// Helper badge background resolver
const getIconBg = (roleName = "") => {
  const lower = roleName.toLowerCase();
  if (lower.includes("security") || lower.includes("cyber")) {
    return "rgba(99, 102, 241, 0.12)";
  }
  if (lower.includes("full") || lower.includes("web") || lower.includes("front") || lower.includes("developer")) {
    return "rgba(6, 182, 212, 0.12)";
  }
  if (lower.includes("data") || lower.includes("backend")) {
    return "rgba(245, 158, 11, 0.12)";
  }
  if (lower.includes("ai") || lower.includes("machine")) {
    return "rgba(16, 185, 129, 0.12)";
  }
  return "rgba(147, 51, 234, 0.12)";
};

export default function SavedRoadmaps() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();

  // Primary State
  const { id: routeRoadmapId } = useParams();
  const [activeTab, setActiveTab] = useState("roadmaps"); // "roadmaps" | "history"
  const [roadmaps, setRoadmaps] = useState([]);
  const [selectedRoadmap, setSelectedRoadmap] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeDetailTab, setActiveDetailTab] = useState("roadmap"); // "roadmap" | "skills" | "resources" | "notes"

  // Route-specific detailed roadmap state (for /student/roadmap/:id)
  const [detailedRoadmap, setDetailedRoadmap] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState(null);

  // Target Role History State
  const [targetHistory, setTargetHistory] = useState([]);
  const [activeTargetRole, setActiveTargetRole] = useState("");
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Notes state
  const [newNoteContent, setNewNoteContent] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);

  // Delete Roadmap Modal & State
  const [roadmapToDelete, setRoadmapToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Select roadmap and scroll smoothly to detail view if on mobile/smaller screens
  const handleSelectRoadmap = (r) => {
    if (!r) return;
    setSelectedRoadmap(r);
    setTimeout(() => {
      const detailEl = document.getElementById("roadmap-detail-panel");
      if (detailEl && window.innerWidth < 992) {
        detailEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 50);
  };

  // Fetch individual roadmap by MongoDB ID when URL has :id parameter
  useEffect(() => {
    if (routeRoadmapId) {
      let isMounted = true;
      const fetchDetail = async () => {
        setIsLoadingDetail(true);
        setDetailError(null);
        try {
          const res = await roadmapService.getRoadmapById(routeRoadmapId);
          if (isMounted && res?.data?.data) {
            setDetailedRoadmap(res.data.data);
            setSelectedRoadmap(res.data.data);
          } else if (isMounted) {
            setDetailError("Career roadmap not found in MongoDB database.");
          }
        } catch (err) {
          console.error("Failed to load roadmap by MongoDB ID:", err);
          if (isMounted) {
            setDetailError(err?.response?.data?.message || "Failed to load career roadmap from database.");
          }
        } finally {
          if (isMounted) setIsLoadingDetail(false);
        }
      };

      fetchDetail();
      return () => { isMounted = false; };
    } else {
      setDetailedRoadmap(null);
      setDetailError(null);
    }
  }, [routeRoadmapId]);

  // Load saved roadmaps from MongoDB on mount
  useEffect(() => {
    let isMounted = true;
    const fetchRoadmaps = async () => {
      setIsLoading(true);
      try {
        const response = await roadmapService.getRoadmaps();
        if (isMounted && response?.data?.data) {
          const list = response.data.data;
          setRoadmaps(list);
          if (list.length > 0) {
            setSelectedRoadmap(list[0]);
          }
        }
      } catch (err) {
        console.error("Failed to load saved roadmaps from MongoDB:", err);
        addToast("Failed to fetch saved career roadmaps from database", "danger");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchRoadmaps();
    return () => { isMounted = false; };
  }, []);

  // Load Target Role History when switching to history tab
  useEffect(() => {
    if (activeTab === "history" && targetHistory.length === 0) {
      const fetchHistory = async () => {
        setIsLoadingHistory(true);
        try {
          const res = await studentService.getCareerTargetHistory();
          if (res?.data?.data) {
            setTargetHistory(res.data.data.history || []);
            setActiveTargetRole(res.data.data.targetRole || "");
          }
        } catch (err) {
          console.error("Failed to load career target history:", err);
        } finally {
          setIsLoadingHistory(false);
        }
      };
      fetchHistory();
    }
  }, [activeTab, targetHistory.length]);

  // Handle milestone status toggle
  const handleToggleMilestone = async (roadmapId, milestoneIndex, currentStatus) => {
    const nextStatus =
      currentStatus === "Completed"
        ? "Not Started"
        : currentStatus === "In Progress"
        ? "Completed"
        : "In Progress";

    try {
      const res = await roadmapService.updateMilestoneProgress(roadmapId, {
        milestoneIndex,
        status: nextStatus
      });

      if (res?.data?.success && res.data.data) {
        const updatedRoadmap = res.data.data;
        // Update local state
        setRoadmaps((prev) =>
          prev.map((r) => (r._id === updatedRoadmap._id ? updatedRoadmap : r))
        );
        if (selectedRoadmap?._id === updatedRoadmap._id) {
          setSelectedRoadmap(updatedRoadmap);
        }
        if (detailedRoadmap?._id === updatedRoadmap._id) {
          setDetailedRoadmap(updatedRoadmap);
        }
        addToast(`Milestone marked as "${nextStatus}"`, "success");
      }
    } catch (err) {
      console.error("Failed to update milestone progress:", err);
      addToast("Failed to update milestone status", "danger");
    }
  };

  // Handle add note to selected roadmap
  const handleAddNote = async (e) => {
    e.preventDefault();
    const activeTargetId = detailedRoadmap?._id || selectedRoadmap?._id;
    if (!newNoteContent.trim() || !activeTargetId) return;

    setIsSavingNote(true);
    try {
      const res = await roadmapService.addRoadmapNote(activeTargetId, {
        content: newNoteContent.trim(),
        title: `Note - ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
      });

      if (res?.data?.success && res.data.data) {
        const updated = res.data.data;
        setSelectedRoadmap(updated);
        if (detailedRoadmap?._id === updated._id) {
          setDetailedRoadmap(updated);
        }
        setRoadmaps((prev) =>
          prev.map((r) => (r._id === updated._id ? updated : r))
        );
        setNewNoteContent("");
        addToast("Study note saved to MongoDB roadmap!", "success");
      }
    } catch (err) {
      console.error("Failed to add note:", err);
      addToast("Could not save note to database", "danger");
    } finally {
      setIsSavingNote(false);
    }
  };

  // Handle permanent delete roadmap from MongoDB
  const confirmDeleteRoadmap = async (roadmapId) => {
    if (!roadmapId) return;
    setIsDeleting(true);

    try {
      const res = await roadmapService.deleteRoadmap(roadmapId);
      if (res?.data?.success) {
        const remaining = roadmaps.filter((r) => r._id !== roadmapId);
        setRoadmaps(remaining);
        if (selectedRoadmap?._id === roadmapId) {
          setSelectedRoadmap(remaining.length > 0 ? remaining[0] : null);
        }
        if (detailedRoadmap?._id === roadmapId) {
          setDetailedRoadmap(null);
        }
        addToast("Career roadmap deleted successfully", "info");
        if (routeRoadmapId) {
          navigate("/student/roadmap");
        }
      }
    } catch (err) {
      console.error("Failed to delete roadmap:", err);
      addToast(err?.response?.data?.message || "Failed to delete roadmap", "danger");
    } finally {
      setIsDeleting(false);
      setRoadmapToDelete(null);
    }
  };

  // Helper to render full roadmap detail card (used in both preview and dedicated view)
  const renderRoadmapDetail = (targetRoadmap, isStandalone = false) => {
    if (!targetRoadmap) return null;
    return (
      <div className="bento-card p-4 shadow-sm" style={{ borderRadius: "18px" }}>
        {/* Header of Selected Roadmap */}
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-3">
          <div className="d-flex align-items-center gap-3">
            <div
              className="d-flex align-items-center justify-content-center flex-shrink-0"
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "16px",
                background: getIconBg(targetRoadmap.roleName)
              }}
            >
              {getRoleIcon(targetRoadmap.roleName)}
            </div>
            <div>
              <div className="d-flex align-items-center gap-2">
                <h4 className="fw-black mb-0 text-foreground" style={{ fontSize: "1.45rem" }}>
                  {targetRoadmap.roleName}
                </h4>
              </div>
              <div className="text-muted small fw-medium mt-0.5">
                Your {targetRoadmap.duration || `${targetRoadmap.durationMonths || 6}-month`} personalized learning roadmap
              </div>
              <div
                className="d-flex align-items-center gap-3 text-muted small mt-1"
                style={{ fontSize: "0.78rem" }}
              >
                <span className="d-flex align-items-center gap-1">
                  <Calendar size={13} /> Created on{" "}
                  {targetRoadmap.createdAt
                    ? new Date(targetRoadmap.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })
                    : "Oct 27, 2026"}
                </span>
                <span>•</span>
                <span className="d-flex align-items-center gap-1">
                  <Clock size={13} /> {targetRoadmap.duration || "6 months"}
                </span>
              </div>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2 flex-wrap">
            <span
              className={`badge rounded-pill small px-3 py-1.5 d-flex align-items-center gap-1 ${
                targetRoadmap.status === "In Progress"
                  ? "bg-primary-subtle text-primary border border-primary-subtle"
                  : targetRoadmap.status === "Completed"
                  ? "bg-success-subtle text-success border border-success-subtle"
                  : "bg-light text-muted border"
              }`}
            >
              {targetRoadmap.status === "In Progress" && <Activity size={13} />}
              {targetRoadmap.status === "Completed" && <Check size={13} />}
              {targetRoadmap.status}
            </span>

            {!isStandalone && (
              <button
                type="button"
                onClick={() => navigate(`/student/roadmap/${targetRoadmap._id}`)}
                className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1.5 px-3 py-1.5 rounded-pill fw-semibold"
                style={{ fontSize: "0.75rem" }}
                title="Open full dedicated roadmap view"
              >
                <Eye size={13} />
                <span>Open Full View</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setRoadmapToDelete(targetRoadmap)}
              className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1.5 px-3 py-1.5 rounded-pill fw-semibold"
              style={{ fontSize: "0.75rem" }}
              title="Delete this saved roadmap"
            >
              <Trash2 size={13} />
              <span>Delete</span>
            </button>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-1.5">
            <span className="small fw-bold text-muted text-uppercase" style={{ fontSize: "0.72rem", letterSpacing: "0.04em" }}>
              Overall Progress
            </span>
            <span className="small fw-black text-primary" style={{ fontSize: "0.95rem" }}>
              {targetRoadmap.progress || 0}%
            </span>
          </div>
          <div
            className="progress"
            style={{
              height: "8px",
              borderRadius: "10px",
              background: "var(--bg-secondary)"
            }}
          >
            <div
              className="progress-bar progress-bar-striped progress-bar-animated"
              role="progressbar"
              style={{
                width: `${targetRoadmap.progress || 0}%`,
                background: "linear-gradient(90deg, #6366f1, #3b82f6)",
                borderRadius: "10px"
              }}
            />
          </div>
        </div>

        {/* Segmented Inner Tabs: Roadmap | Skills | Resources | Notes */}
        <div
          className="d-flex gap-2 p-1.5 rounded-3 mb-4"
          style={{ background: "var(--bg-secondary)" }}
        >
          {[
            { id: "roadmap", label: "Roadmap", icon: Map },
            { id: "skills", label: "Skills", icon: Sliders },
            { id: "resources", label: "Resources", icon: FileText },
            { id: "notes", label: "Notes", icon: StickyNote }
          ].map((tab) => {
            const Icon = tab.icon;
            const isTabActive = activeDetailTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveDetailTab(tab.id)}
                className={`btn btn-sm flex-grow-1 d-flex align-items-center justify-content-center gap-1.5 py-1.5 rounded-2 fw-bold transition-all ${
                  isTabActive ? "shadow-sm" : "text-muted"
                }`}
                style={
                  isTabActive
                    ? {
                        background: "var(--surface)",
                        color: "var(--primary, #6366f1)",
                        border: "1px solid rgba(99, 102, 241, 0.25)"
                      }
                    : { background: "transparent", border: "none" }
                }
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ─── Detail Sub-Tab 1: Learning Milestones Timeline ─── */}
        {activeDetailTab === "roadmap" && (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold mb-0 text-foreground">Learning Milestones</h6>
              <span
                className="badge rounded-pill small px-2.5 py-1"
                style={{
                  background: "rgba(99, 102, 241, 0.1)",
                  color: "var(--primary, #6366f1)"
                }}
              >
                {targetRoadmap.milestones?.length || targetRoadmap.durationMonths || 6} Months
              </span>
            </div>

            {/* Interactive Timeline */}
            <div className="position-relative ps-3">
              {/* Vertical Connector Line */}
              <div
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "16px",
                  bottom: "24px",
                  width: "2px",
                  background: "var(--primary, #6366f1)",
                  opacity: 0.25,
                  zIndex: 0
                }}
              />

              <div className="d-flex flex-column gap-3">
                {(targetRoadmap.milestones || []).map((m, idx) => {
                  const isCompleted = m.status === "Completed";
                  const isInProgress = m.status === "In Progress";

                  return (
                    <div key={m._id || idx} className="d-flex gap-3 position-relative" style={{ zIndex: 1 }}>
                      {/* Timeline Indicator Dot */}
                      <div
                        onClick={() => handleToggleMilestone(targetRoadmap._id, idx, m.status)}
                        title={`Click to toggle status (Currently: ${m.status})`}
                        className="d-flex align-items-center justify-content-center cursor-pointer flex-shrink-0 mt-1 transition-all hover-scale"
                        style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "50%",
                          background: isCompleted
                            ? "var(--primary, #6366f1)"
                            : "var(--surface)",
                          border: isCompleted
                            ? "none"
                            : isInProgress
                            ? "2px solid var(--primary, #6366f1)"
                            : "2px solid var(--border)",
                          color: isCompleted ? "white" : "var(--primary, #6366f1)",
                          boxShadow: isInProgress ? "0 0 0 4px rgba(99, 102, 241, 0.15)" : "none"
                        }}
                      >
                        {isCompleted ? (
                          <Check size={16} strokeWidth={3} />
                        ) : isInProgress ? (
                          <div
                            style={{
                              width: "8px",
                              height: "8px",
                              borderRadius: "50%",
                              background: "var(--primary, #6366f1)"
                            }}
                          />
                        ) : (
                          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--border)" }} />
                        )}
                      </div>

                      {/* Milestone Card */}
                      <div
                        className="p-3 rounded-3 flex-grow-1 border transition-all"
                        style={{
                          background: isInProgress ? "rgba(99, 102, 241, 0.03)" : "var(--surface)",
                          borderColor: isInProgress ? "rgba(99, 102, 241, 0.25)" : "var(--border)"
                        }}
                      >
                        <div className="d-flex justify-content-between align-items-start gap-2 mb-1">
                          <div>
                            <span
                              className="fw-bold small me-2"
                              style={{
                                color: isInProgress ? "var(--primary, #6366f1)" : "var(--text-muted)",
                                fontSize: "0.8rem"
                              }}
                            >
                              {m.month || `Month ${idx + 1}`}
                            </span>
                            <span className="fw-bold text-foreground" style={{ fontSize: "0.95rem" }}>
                              {m.focusArea}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleToggleMilestone(targetRoadmap._id, idx, m.status)}
                            className={`badge rounded-pill border py-1 px-2.5 small fw-semibold cursor-pointer transition-all ${
                              isCompleted
                                ? "bg-success-subtle text-success border-success-subtle"
                                : isInProgress
                                ? "bg-primary-subtle text-primary border-primary-subtle"
                                : "bg-light text-muted"
                            }`}
                            style={{ fontSize: "0.72rem" }}
                          >
                            {isInProgress && <Activity size={10} className="me-1" />}
                            {m.status}
                          </button>
                        </div>

                        {m.description && (
                          <p className="text-muted small mb-2" style={{ fontSize: "0.8rem", lineHeight: "1.4" }}>
                            {m.description}
                          </p>
                        )}

                        {/* Action items / tasks */}
                        {m.actionItems && m.actionItems.length > 0 && (
                          <div className="mb-2.5 mt-2 ps-2 border-start border-2 border-primary-subtle">
                            <div className="small fw-semibold text-muted text-uppercase mb-1" style={{ fontSize: "0.68rem" }}>
                              Action Tasks:
                            </div>
                            <ul className="list-unstyled mb-0 d-flex flex-column gap-1">
                              {m.actionItems.map((act, actIdx) => (
                                <li key={actIdx} className="small text-foreground-50 d-flex align-items-center gap-1.5" style={{ fontSize: "0.78rem" }}>
                                  <Circle size={8} className="text-primary opacity-50 flex-shrink-0" />
                                  <span>{act}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Action tags */}
                        <div className="d-flex flex-wrap gap-1.5 mt-2">
                          {(m.tags && m.tags.length > 0
                            ? m.tags
                            : (m.skillsToLearn || []).slice(0, 3)
                          ).map((tag, tagIdx) => (
                            <span
                              key={tagIdx}
                              className="badge rounded-pill small"
                              style={{
                                background: "var(--bg-secondary)",
                                color: "var(--text-secondary)",
                                fontSize: "0.72rem",
                                padding: "3px 8px"
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ─── Detail Sub-Tab 2: Skills ─── */}
        {activeDetailTab === "skills" && (
          <div>
            <h6 className="fw-bold mb-3 text-foreground">Target Competencies & Skill Tree</h6>
            <div className="mb-4">
              <label className="small text-muted fw-semibold text-uppercase mb-2 d-block" style={{ fontSize: "0.72rem" }}>
                Core Skills Covered in this Roadmap
              </label>
              <div className="d-flex flex-wrap gap-2">
                {(targetRoadmap.targetSkills && targetRoadmap.targetSkills.length > 0
                  ? targetRoadmap.targetSkills
                  : ["Core Fundamentals", "Tools & Frameworks", "Hands-on Practice", "System Architecture", "Interview Prep"]
                ).map((s, idx) => (
                  <span
                    key={idx}
                    className="badge rounded-pill px-3 py-2 fw-semibold"
                    style={{
                      background: "rgba(16, 185, 129, 0.12)",
                      color: "var(--success, #10b981)",
                      border: "1px solid rgba(16, 185, 129, 0.25)",
                      fontSize: "0.8rem"
                    }}
                  >
                    <CheckCircle2 size={13} className="me-1.5 d-inline" /> {s}
                  </span>
                ))}
              </div>
            </div>

            {targetRoadmap.currentSkills && targetRoadmap.currentSkills.length > 0 && (
              <div>
                <label className="small text-muted fw-semibold text-uppercase mb-2 d-block" style={{ fontSize: "0.72rem" }}>
                  Current Baseline Skills
                </label>
                <div className="d-flex flex-wrap gap-2">
                  {targetRoadmap.currentSkills.map((cs, idx) => (
                    <span
                      key={idx}
                      className="badge rounded-pill px-3 py-1.5 bg-light text-muted border small"
                      style={{ fontSize: "0.78rem" }}
                    >
                      {cs}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── Detail Sub-Tab 3: Resources ─── */}
        {activeDetailTab === "resources" && (
          <div>
            <h6 className="fw-bold mb-3 text-foreground">Recommended Learning Resources</h6>
            <div className="d-flex flex-column gap-2.5">
              {(targetRoadmap.resources && targetRoadmap.resources.length > 0
                ? targetRoadmap.resources
                : [
                    { title: "Comprehensive Official Syllabus & Exam Guide", category: "Documentation", type: "Guide", url: "#" },
                    { title: "Interactive Hands-on Practice Labs", category: "Practice Labs", type: "Lab", url: "#" },
                    { title: "Technical Mock Interview Simulator", category: "Interview", type: "Tool", url: "/student/interviews" }
                  ]
              ).map((res, rIdx) => (
                <div
                  key={rIdx}
                  className="p-3 rounded-3 border d-flex justify-content-between align-items-center"
                  style={{ background: "var(--surface)" }}
                >
                  <div>
                    <div className="fw-bold small text-foreground">{res.title}</div>
                    <div className="text-muted small" style={{ fontSize: "0.74rem" }}>
                      Category: {res.category || "Guide"} • Type: {res.type || "Resource"}
                    </div>
                  </div>
                  <a
                    href={res.url || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1 py-1 px-2.5 rounded-2 small"
                  >
                    <span>Open</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── Detail Sub-Tab 4: Notes ─── */}
        {activeDetailTab === "notes" && (
          <div>
            <h6 className="fw-bold mb-2 text-foreground">Personal Study Notes</h6>
            <p className="text-muted small mb-3">
              Keep track of key concepts, bookmarks, and milestone deliverables for this roadmap.
            </p>

            <form onSubmit={handleAddNote} className="mb-4">
              <textarea
                className="form-control bg-transparent text-foreground mb-2"
                rows={3}
                placeholder="Add a new note or milestone reminder..."
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
              />
              <div className="d-flex justify-content-end">
                <button
                  type="submit"
                  disabled={isSavingNote || !newNoteContent.trim()}
                  className="btn btn-primary btn-sm px-3 py-1.5 fw-bold rounded-2 d-flex align-items-center gap-1.5"
                >
                  {isSavingNote ? <span className="spinner-border spinner-border-sm" /> : <StickyNote size={14} />}
                  <span>Save Note</span>
                </button>
              </div>
            </form>

            <div className="d-flex flex-column gap-2">
              {(targetRoadmap.notes || []).length === 0 ? (
                <div className="text-center py-4 text-muted small border rounded-3 border-dashed">
                  No notes recorded yet. Write down your first study note above!
                </div>
              ) : (
                targetRoadmap.notes.map((n, nIdx) => (
                  <div
                    key={n._id || nIdx}
                    className="p-3 rounded-3 border"
                    style={{ background: "var(--surface)" }}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="fw-bold small text-primary">{n.title || "Study Note"}</span>
                      <span className="text-muted small" style={{ fontSize: "0.72rem" }}>
                        {n.createdAt
                          ? new Date(n.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric"
                            })
                          : "Saved"}
                      </span>
                    </div>
                    <p className="small text-muted mb-0" style={{ whiteSpace: "pre-wrap" }}>
                      {n.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderDeleteModal = () => (
    <AnimatePresence>
      {roadmapToDelete && (
        <div
          className="d-flex align-items-center justify-content-center position-fixed top-0 start-0 w-100 h-100"
          style={{
            background: "rgba(0, 0, 0, 0.6)",
            zIndex: 1050,
            backdropFilter: "blur(4px)"
          }}
          onClick={() => !isDeleting && setRoadmapToDelete(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 10 }}
            transition={{ duration: 0.18 }}
            className="bento-card p-4 shadow-lg text-start"
            style={{
              maxWidth: "460px",
              width: "92%",
              borderRadius: "20px",
              background: "var(--surface)",
              border: "1px solid var(--border)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="d-flex align-items-center justify-content-center text-danger flex-shrink-0"
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "14px",
                    background: "rgba(239, 68, 68, 0.12)"
                  }}
                >
                  <Trash2 size={24} />
                </div>
                <div>
                  <h5 className="fw-black mb-0 text-foreground">Delete Roadmap</h5>
                  <div className="text-muted small fw-semibold">{roadmapToDelete.roleName}</div>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-sm btn-link text-muted p-1"
                onClick={() => !isDeleting && setRoadmapToDelete(null)}
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-muted small mb-4" style={{ lineHeight: 1.55 }}>
              Are you sure you want to permanently delete your <strong>{roadmapToDelete.roleName}</strong> roadmap?
              All tracked milestones, progress percentages, and personal study notes for this career plan will be deleted from MongoDB.
            </p>

            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-secondary btn-sm px-3.5 py-2 rounded-2 fw-semibold"
                onClick={() => setRoadmapToDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm px-4 py-2 rounded-2 fw-bold d-inline-flex align-items-center gap-2 shadow-sm"
                onClick={() => confirmDeleteRoadmap(roadmapToDelete._id)}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={15} />
                    <span>Yes, Delete Roadmap</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  // If routeRoadmapId is present in URL (/student/roadmap/:id), render dedicated standalone view
  if (routeRoadmapId) {
    return (
      <div className="container-fluid py-4 px-xl-5">
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-4">
          <button
            onClick={() => navigate("/student/roadmap")}
            className="btn btn-outline-secondary px-3.5 py-2 rounded-3 fw-semibold d-inline-flex align-items-center gap-2"
            style={{ border: "1px solid var(--border)" }}
          >
            <ArrowLeft size={18} />
            <span>Back to Saved Roadmaps</span>
          </button>

          <button
            onClick={() => navigate("/student/learning")}
            className="btn btn-primary px-3.5 py-2 rounded-3 fw-bold d-flex align-items-center gap-2 shadow-sm"
            style={{
              background: "linear-gradient(135deg, var(--primary, #6366f1), var(--purple, #a855f7))",
              border: "none",
              color: "white"
            }}
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Generate New Roadmap</span>
          </button>
        </div>

        {isLoadingDetail ? (
          <div className="bento-card p-5 text-center my-3" style={{ borderRadius: "18px" }}>
            <div className="spinner-border text-primary mb-3" role="status" />
            <h5 className="fw-bold mb-1 text-foreground">Loading Career Roadmap...</h5>
            <p className="text-muted small mb-0">Fetching your saved milestones and learning resources from MongoDB</p>
          </div>
        ) : detailError ? (
          <div className="bento-card p-5 text-center my-3" style={{ borderRadius: "18px" }}>
            <AlertCircle size={44} className="text-danger mb-2" />
            <h5 className="fw-bold text-foreground">Roadmap Unavailable</h5>
            <p className="text-muted small mb-3">{detailError}</p>
            <button
              onClick={() => navigate("/student/roadmap")}
              className="btn btn-primary btn-sm px-3.5 py-2 rounded-2 fw-semibold"
            >
              Back to Saved Roadmaps
            </button>
          </div>
        ) : detailedRoadmap ? (
          renderRoadmapDetail(detailedRoadmap, true)
        ) : null}

        {renderDeleteModal()}
      </div>
    );
  }

  return (
    <div className="container-fluid py-4 px-xl-5">
      {/* ─── Top Header Banner ─── */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div className="d-flex align-items-center gap-3">
          <div
            className="d-flex align-items-center justify-content-center flex-shrink-0 shadow-sm"
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "14px",
              background: "rgba(99, 102, 241, 0.15)",
              color: "var(--primary, #6366f1)"
            }}
          >
            <Map size={28} strokeWidth={2.2} />
          </div>
          <div>
            <h2
              className="fw-black mb-1 text-ultra"
              style={{
                fontSize: "1.9rem",
                letterSpacing: "-0.02em",
                color: "var(--text)"
              }}
            >
              Career Roadmap
            </h2>
            <div className="fw-bold small text-muted mb-0">
              Your saved personalized career plans
            </div>
            <p className="text-muted small mb-0 mt-0.5" style={{ maxWidth: 640 }}>
              View and continue your AI-generated roadmaps for different career roles. Each roadmap
              includes learning milestones, skills, and actionable steps.
            </p>
          </div>
        </div>

        {/* Generate New Roadmap Action Button */}
        <button
          onClick={() => navigate("/student/learning")}
          className="btn btn-primary px-4 py-2.5 rounded-3 fw-bold d-flex align-items-center gap-2 shadow-sm hover-lift flex-shrink-0"
          style={{
            background: "linear-gradient(135deg, var(--primary, #6366f1), var(--purple, #a855f7))",
            border: "none",
            color: "white"
          }}
        >
          <Plus size={18} strokeWidth={2.5} />
          <span>Generate New Roadmap</span>
        </button>
      </div>

      {/* ─── Tabs: My Saved Roadmaps vs Target Role History ─── */}
      <div className="d-flex gap-2 mb-3">
        <button
          onClick={() => setActiveTab("roadmaps")}
          className={`btn d-flex align-items-center gap-2 px-3.5 py-2 rounded-3 fw-bold small transition-all ${
            activeTab === "roadmaps"
              ? "btn-primary shadow-sm"
              : "btn-outline-secondary text-foreground-50 bg-transparent"
          }`}
          style={
            activeTab === "roadmaps"
              ? {
                  background: "var(--surface)",
                  color: "var(--primary, #6366f1)",
                  border: "2px solid var(--primary, #6366f1)"
                }
              : { border: "1px solid var(--border)" }
          }
        >
          <Map size={16} />
          <span>My Saved Roadmaps</span>
          {roadmaps.length > 0 && (
            <span
              className="badge rounded-pill ms-1"
              style={{
                background: activeTab === "roadmaps" ? "rgba(99, 102, 241, 0.15)" : "var(--bg-secondary)",
                color: activeTab === "roadmaps" ? "var(--primary, #6366f1)" : "inherit"
              }}
            >
              {roadmaps.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`btn d-flex align-items-center gap-2 px-3.5 py-2 rounded-3 fw-bold small transition-all ${
            activeTab === "history"
              ? "btn-primary shadow-sm"
              : "btn-outline-secondary text-foreground-50 bg-transparent"
          }`}
          style={
            activeTab === "history"
              ? {
                  background: "var(--surface)",
                  color: "var(--primary, #6366f1)",
                  border: "2px solid var(--primary, #6366f1)"
                }
              : { border: "1px solid var(--border)" }
          }
        >
          <Clock size={16} />
          <span>Target Role History</span>
        </button>
      </div>

      {/* ─── Informational Banner ─── */}
      <div
        className="p-3 rounded-3 mb-4 d-flex align-items-center gap-2.5 border"
        style={{
          background: "rgba(99, 102, 241, 0.05)",
          borderColor: "rgba(99, 102, 241, 0.2)",
          color: "var(--text)"
        }}
      >
        <AlertCircle size={18} className="text-primary flex-shrink-0" />
        <div className="small">
          Your generated roadmaps are saved here. You can view, continue, or generate a new roadmap
          anytime. This is <strong>separate from your target role history</strong>.
        </div>
      </div>

      {/* ─── TAB 1: MY SAVED ROADMAPS ─── */}
      {activeTab === "roadmaps" && (
        <>
          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary mb-3" role="status" />
              <div className="fw-semibold text-muted">Loading saved roadmaps from MongoDB...</div>
            </div>
          ) : roadmaps.length === 0 ? (
            /* Empty State */
            <div
              className="bento-card text-center py-5 px-4 my-3 d-flex flex-column align-items-center justify-content-center"
              style={{ minHeight: "420px", border: "2px dashed var(--border)" }}
            >
              <div
                className="d-flex align-items-center justify-content-center mb-3"
                style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "20px",
                  background: "rgba(99, 102, 241, 0.1)",
                  color: "var(--primary, #6366f1)"
                }}
              >
                <Map size={36} />
              </div>
              <h4 className="fw-bold mb-2 text-foreground">No Saved Roadmaps Yet</h4>
              <p className="text-muted small mb-4" style={{ maxWidth: 460 }}>
                You have not generated any career learning roadmaps yet. Choose your dream job role,
                customize your preparation duration, and generate your first step-by-step roadmap.
              </p>
              <button
                onClick={() => navigate("/student/learning")}
                className="btn btn-primary px-4 py-2.5 rounded-3 fw-bold d-flex align-items-center gap-2 shadow-sm hover-lift"
                style={{
                  background: "linear-gradient(135deg, var(--primary, #6366f1), var(--purple, #a855f7))",
                  border: "none"
                }}
              >
                <Sparkles size={18} />
                <span>Generate Your First Roadmap</span>
              </button>
            </div>
          ) : (
            /* Two Column Dashboard Grid */
            <div className="row g-4 align-items-start">
              {/* ─── Left Column: Saved Career Roadmaps Cards ─── */}
              <div className="col-lg-5">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-bold mb-0 text-foreground">Saved Career Roadmaps</h5>
                  <span
                    className="badge rounded-pill px-2.5 py-1 small fw-semibold"
                    style={{
                      background: "rgba(99, 102, 241, 0.12)",
                      color: "var(--primary, #6366f1)"
                    }}
                  >
                    {roadmaps.length} {roadmaps.length === 1 ? "roadmap" : "roadmaps"}
                  </span>
                </div>

                <div className="d-flex flex-column gap-3">
                  {roadmaps.map((r) => {
                    const isSelected = selectedRoadmap?._id === r._id;
                    const dateFormatted = r.createdAt
                      ? new Date(r.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric"
                        })
                      : "Recently saved";

                    const focusTags = (r.milestones || [])
                      .map((m) => m.focusArea)
                      .filter(Boolean)
                      .slice(0, 3);
                    const remainingTagsCount = Math.max(0, (r.milestones || []).length - 3);

                    return (
                      <motion.div
                        key={r._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => handleSelectRoadmap(r)}
                        className={`bento-card p-3.5 transition-all cursor-pointer ${
                          isSelected ? "shadow-md" : "hover-glow shadow-sm"
                        }`}
                        style={{
                          border: isSelected
                            ? "2px solid var(--primary, #6366f1)"
                            : "1px solid var(--border)",
                          background: isSelected
                            ? "rgba(99, 102, 241, 0.03)"
                            : "var(--surface)",
                          borderRadius: "16px",
                          position: "relative"
                        }}
                      >
                        {/* Top Card Row */}
                        <div className="d-flex justify-content-between align-items-start mb-2.5">
                          <div className="d-flex align-items-center gap-3">
                            <div
                              className="d-flex align-items-center justify-content-center flex-shrink-0"
                              style={{
                                width: "44px",
                                height: "44px",
                                borderRadius: "12px",
                                background: getIconBg(r.roleName)
                              }}
                            >
                              {getRoleIcon(r.roleName)}
                            </div>
                            <div>
                              <h6 className="fw-bold mb-1 text-foreground" style={{ fontSize: "1.05rem" }}>
                                {r.roleName}
                              </h6>
                              <div
                                className="d-flex align-items-center gap-2.5 text-muted small"
                                style={{ fontSize: "0.78rem" }}
                              >
                                <span className="d-flex align-items-center gap-1">
                                  <Calendar size={13} /> {dateFormatted}
                                </span>
                                <span>•</span>
                                <span className="d-flex align-items-center gap-1">
                                  <Clock size={13} /> {r.duration || `${r.durationMonths || 6} months`}
                                </span>
                                <span>•</span>
                                <span className="d-flex align-items-center gap-1 text-primary fw-semibold">
                                  <TrendingUp size={13} /> {r.progress || 0}% complete
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="d-flex align-items-center gap-1.5">
                            <span
                              className={`badge rounded-pill small px-2.5 py-1 d-flex align-items-center gap-1 ${
                                r.status === "In Progress"
                                  ? "bg-primary-subtle text-primary border border-primary-subtle"
                                  : r.status === "Completed"
                                  ? "bg-success-subtle text-success border border-success-subtle"
                                  : "bg-light text-muted border"
                              }`}
                              style={{ fontSize: "0.72rem" }}
                            >
                              {r.status === "In Progress" && <Activity size={12} />}
                              {r.status === "Completed" && <Check size={12} />}
                              {r.status}
                            </span>

                            {/* Direct Delete Button */}
                            <button
                              type="button"
                              className="btn btn-sm p-1.5 rounded-2 d-flex align-items-center justify-content-center border"
                              style={{
                                background: "var(--surface)",
                                borderColor: "var(--border)",
                                minWidth: "30px",
                                height: "28px"
                              }}
                              title="Delete this roadmap"
                              onClick={(e) => {
                                e.stopPropagation();
                                setRoadmapToDelete(r);
                              }}
                            >
                              <Trash2 size={13} className="text-danger" />
                            </button>
                          </div>
                        </div>

                        {/* Description */}
                        <p
                          className="text-muted small mb-2.5 text-truncate-2"
                          style={{
                            fontSize: "0.82rem",
                            lineHeight: "1.4",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden"
                          }}
                        >
                          {r.description ||
                            `Comprehensive roadmap to become a ${r.roleName}, covering core concepts, tools, certifications, and hands-on projects.`}
                        </p>

                        {/* Milestone Tag Chips */}
                        <div className="d-flex flex-wrap gap-1.5 mb-3">
                          {focusTags.map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className="badge rounded-pill small fw-medium"
                              style={{
                                background: "var(--bg-secondary)",
                                color: "var(--text-secondary)",
                                fontSize: "0.74rem",
                                padding: "4px 8px"
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                          {remainingTagsCount > 0 && (
                            <span
                              className="badge rounded-pill small fw-bold"
                              style={{
                                background: "rgba(99, 102, 241, 0.1)",
                                color: "var(--primary, #6366f1)",
                                fontSize: "0.74rem",
                                padding: "4px 8px"
                              }}
                            >
                              +{remainingTagsCount}
                            </span>
                          )}
                        </div>

                        {/* Action View Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/student/roadmap/${r._id}`);
                          }}
                          className="btn btn-outline-primary w-100 py-2 rounded-3 fw-bold d-flex align-items-center justify-content-center gap-2 transition-all hover-lift"
                          style={{
                            borderColor: "rgba(99, 102, 241, 0.35)",
                            color: "var(--primary, #6366f1)",
                            background: "rgba(99, 102, 241, 0.04)"
                          }}
                        >
                          <Eye size={16} />
                          <span>View Roadmap</span>
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* ─── Right Column: Selected Roadmap Detail View ─── */}
              <div className="col-lg-7" id="roadmap-detail-panel">
                {selectedRoadmap ? (
                  <div className="bento-card p-4 shadow-sm" style={{ borderRadius: "18px" }}>
                    {/* Header of Selected Roadmap */}
                    <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-3">
                      <div className="d-flex align-items-center gap-3">
                        <div
                          className="d-flex align-items-center justify-content-center flex-shrink-0"
                          style={{
                            width: "56px",
                            height: "56px",
                            borderRadius: "16px",
                            background: getIconBg(selectedRoadmap.roleName)
                          }}
                        >
                          {getRoleIcon(selectedRoadmap.roleName)}
                        </div>
                        <div>
                          <div className="d-flex align-items-center gap-2">
                            <h4 className="fw-black mb-0 text-foreground" style={{ fontSize: "1.45rem" }}>
                              {selectedRoadmap.roleName}
                            </h4>
                          </div>
                          <div className="text-muted small fw-medium mt-0.5">
                            Your {selectedRoadmap.duration || `${selectedRoadmap.durationMonths || 6}-month`} personalized learning roadmap
                          </div>
                          <div
                            className="d-flex align-items-center gap-3 text-muted small mt-1"
                            style={{ fontSize: "0.78rem" }}
                          >
                            <span className="d-flex align-items-center gap-1">
                              <Calendar size={13} /> Created on{" "}
                              {selectedRoadmap.createdAt
                                ? new Date(selectedRoadmap.createdAt).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric"
                                  })
                                : "Oct 27, 2026"}
                            </span>
                            <span>•</span>
                            <span className="d-flex align-items-center gap-1">
                              <Clock size={13} /> {selectedRoadmap.duration || "6 months"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="d-flex align-items-center gap-2 flex-wrap">
                        <span
                          className={`badge rounded-pill small px-3 py-1.5 d-flex align-items-center gap-1 ${
                            selectedRoadmap.status === "In Progress"
                              ? "bg-primary-subtle text-primary border border-primary-subtle"
                              : selectedRoadmap.status === "Completed"
                              ? "bg-success-subtle text-success border border-success-subtle"
                              : "bg-light text-muted border"
                          }`}
                        >
                          {selectedRoadmap.status === "In Progress" && <Activity size={13} />}
                          {selectedRoadmap.status === "Completed" && <Check size={13} />}
                          {selectedRoadmap.status}
                        </span>

                        <button
                          type="button"
                          onClick={() => setRoadmapToDelete(selectedRoadmap)}
                          className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1.5 px-3 py-1.5 rounded-pill fw-semibold"
                          style={{ fontSize: "0.75rem" }}
                          title="Delete this saved roadmap"
                        >
                          <Trash2 size={13} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>

                    {/* Overall Progress Bar */}
                    <div className="mb-4">
                      <div className="d-flex justify-content-between align-items-center mb-1.5">
                        <span className="small fw-bold text-muted text-uppercase" style={{ fontSize: "0.72rem", letterSpacing: "0.04em" }}>
                          Overall Progress
                        </span>
                        <span className="small fw-black text-primary" style={{ fontSize: "0.95rem" }}>
                          {selectedRoadmap.progress || 0}%
                        </span>
                      </div>
                      <div
                        className="progress"
                        style={{
                          height: "8px",
                          borderRadius: "10px",
                          background: "var(--bg-secondary)"
                        }}
                      >
                        <div
                          className="progress-bar progress-bar-striped progress-bar-animated"
                          role="progressbar"
                          style={{
                            width: `${selectedRoadmap.progress || 0}%`,
                            background: "linear-gradient(90deg, #6366f1, #3b82f6)",
                            borderRadius: "10px"
                          }}
                        />
                      </div>
                    </div>

                    {/* Segmented Inner Tabs: Roadmap | Skills | Resources | Notes */}
                    <div
                      className="d-flex gap-2 p-1.5 rounded-3 mb-4"
                      style={{ background: "var(--bg-secondary)" }}
                    >
                      {[
                        { id: "roadmap", label: "Roadmap", icon: Map },
                        { id: "skills", label: "Skills", icon: Sliders },
                        { id: "resources", label: "Resources", icon: FileText },
                        { id: "notes", label: "Notes", icon: StickyNote }
                      ].map((tab) => {
                        const Icon = tab.icon;
                        const isTabActive = activeDetailTab === tab.id;
                        return (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveDetailTab(tab.id)}
                            className={`btn btn-sm flex-grow-1 d-flex align-items-center justify-content-center gap-1.5 py-1.5 rounded-2 fw-bold transition-all ${
                              isTabActive ? "shadow-sm" : "text-muted"
                            }`}
                            style={
                              isTabActive
                                ? {
                                    background: "var(--surface)",
                                    color: "var(--primary, #6366f1)",
                                    border: "1px solid rgba(99, 102, 241, 0.25)"
                                  }
                                : { background: "transparent", border: "none" }
                            }
                          >
                            <Icon size={14} />
                            <span>{tab.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* ─── Detail Sub-Tab 1: Learning Milestones Timeline ─── */}
                    {activeDetailTab === "roadmap" && (
                      <div>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <h6 className="fw-bold mb-0 text-foreground">Learning Milestones</h6>
                          <span
                            className="badge rounded-pill small px-2.5 py-1"
                            style={{
                              background: "rgba(99, 102, 241, 0.1)",
                              color: "var(--primary, #6366f1)"
                            }}
                          >
                            {selectedRoadmap.milestones?.length || selectedRoadmap.durationMonths || 6} Months
                          </span>
                        </div>

                        {/* Interactive Timeline */}
                        <div className="position-relative ps-3">
                          {/* Vertical Connector Line */}
                          <div
                            style={{
                              position: "absolute",
                              left: "14px",
                              top: "16px",
                              bottom: "24px",
                              width: "2px",
                              background: "var(--primary, #6366f1)",
                              opacity: 0.25,
                              zIndex: 0
                            }}
                          />

                          <div className="d-flex flex-column gap-3">
                            {(selectedRoadmap.milestones || []).map((m, idx) => {
                              const isCompleted = m.status === "Completed";
                              const isInProgress = m.status === "In Progress";

                              return (
                                <div key={m._id || idx} className="d-flex gap-3 position-relative" style={{ zIndex: 1 }}>
                                  {/* Timeline Indicator Dot */}
                                  <div
                                    onClick={() => handleToggleMilestone(selectedRoadmap._id, idx, m.status)}
                                    title={`Click to toggle status (Currently: ${m.status})`}
                                    className="d-flex align-items-center justify-content-center cursor-pointer flex-shrink-0 mt-1 transition-all hover-scale"
                                    style={{
                                      width: "28px",
                                      height: "28px",
                                      borderRadius: "50%",
                                      background: isCompleted
                                        ? "var(--primary, #6366f1)"
                                        : isInProgress
                                        ? "var(--surface)"
                                        : "var(--surface)",
                                      border: isCompleted
                                        ? "none"
                                        : isInProgress
                                        ? "2px solid var(--primary, #6366f1)"
                                        : "2px solid var(--border)",
                                      color: isCompleted ? "white" : "var(--primary, #6366f1)",
                                      boxShadow: isInProgress ? "0 0 0 4px rgba(99, 102, 241, 0.15)" : "none"
                                    }}
                                  >
                                    {isCompleted ? (
                                      <Check size={16} strokeWidth={3} />
                                    ) : isInProgress ? (
                                      <div
                                        style={{
                                          width: "8px",
                                          height: "8px",
                                          borderRadius: "50%",
                                          background: "var(--primary, #6366f1)"
                                        }}
                                      />
                                    ) : (
                                      <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--border)" }} />
                                    )}
                                  </div>

                                  {/* Milestone Card */}
                                  <div
                                    className="p-3 rounded-3 flex-grow-1 border transition-all"
                                    style={{
                                      background: isInProgress ? "rgba(99, 102, 241, 0.03)" : "var(--surface)",
                                      borderColor: isInProgress ? "rgba(99, 102, 241, 0.25)" : "var(--border)"
                                    }}
                                  >
                                    <div className="d-flex justify-content-between align-items-start gap-2 mb-1">
                                      <div>
                                        <span
                                          className="fw-bold small me-2"
                                          style={{
                                            color: isInProgress ? "var(--primary, #6366f1)" : "var(--text-muted)",
                                            fontSize: "0.8rem"
                                          }}
                                        >
                                          {m.month || `Month ${idx + 1}`}
                                        </span>
                                        <span className="fw-bold text-foreground" style={{ fontSize: "0.95rem" }}>
                                          {m.focusArea}
                                        </span>
                                      </div>

                                      <button
                                        type="button"
                                        onClick={() => handleToggleMilestone(selectedRoadmap._id, idx, m.status)}
                                        className={`badge rounded-pill border py-1 px-2.5 small fw-semibold cursor-pointer transition-all ${
                                          isCompleted
                                            ? "bg-success-subtle text-success border-success-subtle"
                                            : isInProgress
                                            ? "bg-primary-subtle text-primary border-primary-subtle"
                                            : "bg-light text-muted"
                                        }`}
                                        style={{ fontSize: "0.72rem" }}
                                      >
                                        {isInProgress && <Activity size={10} className="me-1" />}
                                        {m.status}
                                      </button>
                                    </div>

                                    {m.description && (
                                      <p className="text-muted small mb-2" style={{ fontSize: "0.8rem", lineHeight: "1.4" }}>
                                        {m.description}
                                      </p>
                                    )}

                                    {/* Action tags */}
                                    <div className="d-flex flex-wrap gap-1.5">
                                      {(m.tags && m.tags.length > 0
                                        ? m.tags
                                        : (m.actionItems || []).slice(0, 3)
                                      ).map((tag, tagIdx) => (
                                        <span
                                          key={tagIdx}
                                          className="badge rounded-pill small"
                                          style={{
                                            background: "var(--bg-secondary)",
                                            color: "var(--text-secondary)",
                                            fontSize: "0.72rem",
                                            padding: "3px 8px"
                                          }}
                                        >
                                          {tag}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ─── Detail Sub-Tab 2: Skills ─── */}
                    {activeDetailTab === "skills" && (
                      <div>
                        <h6 className="fw-bold mb-3 text-foreground">Target Competencies & Skill Tree</h6>
                        <div className="mb-4">
                          <label className="small text-muted fw-semibold text-uppercase mb-2 d-block" style={{ fontSize: "0.72rem" }}>
                            Core Skills Covered in this Roadmap
                          </label>
                          <div className="d-flex flex-wrap gap-2">
                            {(selectedRoadmap.targetSkills && selectedRoadmap.targetSkills.length > 0
                              ? selectedRoadmap.targetSkills
                              : ["Core Fundamentals", "Tools & Frameworks", "Hands-on Practice", "System Architecture", "Interview Prep"]
                            ).map((s, idx) => (
                              <span
                                key={idx}
                                className="badge rounded-pill px-3 py-2 fw-semibold"
                                style={{
                                  background: "rgba(16, 185, 129, 0.12)",
                                  color: "var(--success, #10b981)",
                                  border: "1px solid rgba(16, 185, 129, 0.25)",
                                  fontSize: "0.8rem"
                                }}
                              >
                                <CheckCircle2 size={13} className="me-1.5 d-inline" /> {s}
                              </span>
                            ))}
                          </div>
                        </div>

                        {selectedRoadmap.currentSkills && selectedRoadmap.currentSkills.length > 0 && (
                          <div>
                            <label className="small text-muted fw-semibold text-uppercase mb-2 d-block" style={{ fontSize: "0.72rem" }}>
                              Current Baseline Skills
                            </label>
                            <div className="d-flex flex-wrap gap-2">
                              {selectedRoadmap.currentSkills.map((cs, idx) => (
                                <span
                                  key={idx}
                                  className="badge rounded-pill px-3 py-1.5 bg-light text-muted border small"
                                  style={{ fontSize: "0.78rem" }}
                                >
                                  {cs}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ─── Detail Sub-Tab 3: Resources ─── */}
                    {activeDetailTab === "resources" && (
                      <div>
                        <h6 className="fw-bold mb-3 text-foreground">Recommended Learning Resources</h6>
                        <div className="d-flex flex-column gap-2.5">
                          {(selectedRoadmap.resources && selectedRoadmap.resources.length > 0
                            ? selectedRoadmap.resources
                            : [
                                { title: "Comprehensive Official Syllabus & Exam Guide", category: "Documentation", type: "Guide", url: "#" },
                                { title: "Interactive Hands-on Practice Labs", category: "Practice Labs", type: "Lab", url: "#" },
                                { title: "Technical Mock Interview Simulator", category: "Interview", type: "Tool", url: "/student/interviews" }
                              ]
                          ).map((res, rIdx) => (
                            <div
                              key={rIdx}
                              className="p-3 rounded-3 border d-flex justify-content-between align-items-center"
                              style={{ background: "var(--surface)" }}
                            >
                              <div>
                                <div className="fw-bold small text-foreground">{res.title}</div>
                                <div className="text-muted small" style={{ fontSize: "0.74rem" }}>
                                  Category: {res.category || "Guide"} • Type: {res.type || "Resource"}
                                </div>
                              </div>
                              <a
                                href={res.url || "#"}
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1 py-1 px-2.5 rounded-2 small"
                              >
                                <span>Open</span>
                                <ExternalLink size={12} />
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ─── Detail Sub-Tab 4: Notes ─── */}
                    {activeDetailTab === "notes" && (
                      <div>
                        <h6 className="fw-bold mb-2 text-foreground">Personal Study Notes</h6>
                        <p className="text-muted small mb-3">
                          Keep track of key concepts, bookmarks, and milestone deliverables for this roadmap.
                        </p>

                        <form onSubmit={handleAddNote} className="mb-4">
                          <textarea
                            className="form-control bg-transparent text-foreground mb-2"
                            rows={3}
                            placeholder="Add a new note or milestone reminder..."
                            value={newNoteContent}
                            onChange={(e) => setNewNoteContent(e.target.value)}
                          />
                          <div className="d-flex justify-content-end">
                            <button
                              type="submit"
                              disabled={isSavingNote || !newNoteContent.trim()}
                              className="btn btn-primary btn-sm px-3 py-1.5 fw-bold rounded-2 d-flex align-items-center gap-1.5"
                            >
                              {isSavingNote ? <span className="spinner-border spinner-border-sm" /> : <StickyNote size={14} />}
                              <span>Save Note</span>
                            </button>
                          </div>
                        </form>

                        <div className="d-flex flex-column gap-2">
                          {(selectedRoadmap.notes || []).length === 0 ? (
                            <div className="text-center py-4 text-muted small border rounded-3 border-dashed">
                              No notes recorded yet. Write down your first study note above!
                            </div>
                          ) : (
                            selectedRoadmap.notes.map((n, nIdx) => (
                              <div
                                key={n._id || nIdx}
                                className="p-3 rounded-3 border"
                                style={{ background: "var(--surface)" }}
                              >
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                  <span className="fw-bold small text-primary">{n.title || "Study Note"}</span>
                                  <span className="text-muted small" style={{ fontSize: "0.72rem" }}>
                                    {n.createdAt
                                      ? new Date(n.createdAt).toLocaleDateString("en-US", {
                                          month: "short",
                                          day: "numeric",
                                          year: "numeric"
                                        })
                                      : "Saved"}
                                  </span>
                                </div>
                                <p className="small text-muted mb-0" style={{ whiteSpace: "pre-wrap" }}>
                                  {n.content}
                                </p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bento-card p-5 text-center text-muted">
                    <Map size={48} className="opacity-25 mb-3" />
                    <h5>Select a roadmap from the left to view complete details</h5>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* ─── TAB 2: TARGET ROLE HISTORY ─── */}
      {activeTab === "history" && (
        <div className="bento-card p-4 shadow-sm" style={{ borderRadius: "18px" }}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h5 className="fw-bold mb-1 text-foreground d-flex align-items-center gap-2">
                <Clock size={20} className="text-primary" /> Target Role Selection History
              </h5>
              <p className="text-muted small mb-0">
                Official career roles selected and stored in your Student Profile in MongoDB.
              </p>
            </div>
            {activeTargetRole && (
              <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-1.5 small fw-semibold">
                Current Role: {activeTargetRole}
              </span>
            )}
          </div>

          {isLoadingHistory ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary mb-2" />
              <div className="text-muted small">Loading career role history...</div>
            </div>
          ) : targetHistory.length === 0 ? (
            <div className="text-center py-5 border rounded-3 border-dashed">
              <Clock size={36} className="text-muted opacity-50 mb-2" />
              <h6 className="fw-bold text-foreground">No target role history recorded yet</h6>
              <p className="text-muted small mb-3">
                Save your dream career role on the Career Target page to start recording your history.
              </p>
              <button
                onClick={() => navigate("/student/learning")}
                className="btn btn-primary btn-sm px-3 py-1.5 rounded-2 fw-semibold"
              >
                Go to Career Target
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr className="text-muted small text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "0.05em" }}>
                    <th scope="col" className="ps-3">Target Role</th>
                    <th scope="col">Status</th>
                    <th scope="col">Selection Date & Time</th>
                    <th scope="col" className="text-end pe-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {targetHistory.map((item, idx) => {
                    const isActive = item.status === "active" || idx === 0;
                    const dateStr = item.setAt
                      ? new Date(item.setAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric"
                        })
                      : "Recorded";
                    const timeStr = item.setAt
                      ? new Date(item.setAt).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit"
                        })
                      : "";

                    return (
                      <tr key={item._id || idx}>
                        <td className="ps-3">
                          <div className="fw-bold text-foreground">{item.roleName}</div>
                          <div className="text-muted small" style={{ fontSize: "0.75rem" }}>
                            Student Dream Goal
                          </div>
                        </td>
                        <td>
                          <span
                            className={`badge rounded-pill small px-2.5 py-1 ${
                              isActive
                                ? "bg-success text-white"
                                : "bg-light text-muted border"
                            }`}
                            style={{ fontSize: "0.72rem" }}
                          >
                            {isActive ? "Active Target" : "Previous Target"}
                          </span>
                        </td>
                        <td className="text-muted small">
                          {dateStr} {timeStr && `at ${timeStr}`}
                        </td>
                        <td className="text-end pe-3">
                          <button
                            onClick={() => navigate("/student/learning")}
                            className="btn btn-sm btn-outline-primary py-1 px-2.5 rounded-2 small d-inline-flex align-items-center gap-1"
                          >
                            <span>Open in Target</span>
                            <ChevronRight size={12} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ─── Delete Roadmap Confirmation Modal ─── */}
      <AnimatePresence>
        {roadmapToDelete && (
          <div
            className="d-flex align-items-center justify-content-center position-fixed top-0 start-0 w-100 h-100"
            style={{
              background: "rgba(0, 0, 0, 0.6)",
              zIndex: 1050,
              backdropFilter: "blur(4px)"
            }}
            onClick={() => !isDeleting && setRoadmapToDelete(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 10 }}
              transition={{ duration: 0.18 }}
              className="bento-card p-4 shadow-lg text-start"
              style={{
                maxWidth: "460px",
                width: "92%",
                borderRadius: "20px",
                background: "var(--surface)",
                border: "1px solid var(--border)"
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="d-flex align-items-center justify-content-center text-danger flex-shrink-0"
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "14px",
                      background: "rgba(239, 68, 68, 0.12)"
                    }}
                  >
                    <Trash2 size={24} />
                  </div>
                  <div>
                    <h5 className="fw-black mb-0 text-foreground">Delete Roadmap</h5>
                    <div className="text-muted small fw-semibold">{roadmapToDelete.roleName}</div>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-sm btn-link text-muted p-1"
                  onClick={() => !isDeleting && setRoadmapToDelete(null)}
                >
                  <X size={18} />
                </button>
              </div>

              <p className="text-muted small mb-4" style={{ lineHeight: 1.55 }}>
                Are you sure you want to permanently delete your <strong>{roadmapToDelete.roleName}</strong> roadmap?
                All tracked milestones, progress percentages, and personal study notes for this career plan will be deleted from MongoDB.
              </p>

              <div className="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm px-3.5 py-2 rounded-2 fw-semibold"
                  onClick={() => setRoadmapToDelete(null)}
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger btn-sm px-4 py-2 rounded-2 fw-bold d-inline-flex align-items-center gap-2 shadow-sm"
                  onClick={() => confirmDeleteRoadmap(roadmapToDelete._id)}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 size={15} />
                      <span>Yes, Delete Roadmap</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
