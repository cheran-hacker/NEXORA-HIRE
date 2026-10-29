import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Button from "../../shared/components/Button.jsx";
import { Compass, Sparkles, Map, CheckCircle2, BookmarkCheck, Save, Target, Check, AlertCircle, Clock, Calendar } from "lucide-react";
import { aiService, studentService } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";

const SKILLS = [
  "React",
  "Node.js",
  "Python",
  "Machine Learning",
  "Data Structures",
  "System Design",
  "DevOps",
  "Cloud",
];

const POPULAR_ROLES = [
  "Full Stack Developer",
  "AI / Machine Learning Engineer",
  "Cloud & DevOps Architect",
  "Frontend Engineer",
  "Backend Platform Engineer",
  "Data Scientist",
  "Cybersecurity Analyst",
  "Mobile App Engineer"
];

const CareerRoadmap = () => {
  const { user, setUser } = useAuth();
  const { addToast } = useToast();

  const [targetRole, setTargetRole] = useState("");
  const [savedTargetRole, setSavedTargetRole] = useState("");
  const [targetHistory, setTargetHistory] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [timeFrame, setTimeFrame] = useState("6 months");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSavingTarget, setIsSavingTarget] = useState(false);
  const [isLoadingTarget, setIsLoadingTarget] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [roadmap, setRoadmap] = useState(null);

  // Load saved Career Target directly from MongoDB on mount
  useEffect(() => {
    let isMounted = true;
    const loadCareerTarget = async () => {
      setIsLoadingTarget(true);
      try {
        const response = await studentService.getCareerTarget();
        if (isMounted && response?.data?.data) {
          const loadedTarget = response.data.data.targetRole || "";
          if (loadedTarget) {
            setTargetRole(loadedTarget);
            setSavedTargetRole(loadedTarget);
          } else if (user?.studentProfile?.targetCareerRole) {
            setTargetRole(user.studentProfile.targetCareerRole);
            setSavedTargetRole(user.studentProfile.targetCareerRole);
          }
          if (response.data.data.history) {
            setTargetHistory(response.data.data.history);
          }
        }
      } catch (err) {
        console.error("Failed to load career target from database:", err);
        // Fallback to local user session if API fails
        if (isMounted && user?.studentProfile?.targetCareerRole) {
          setTargetRole(user.studentProfile.targetCareerRole);
          setSavedTargetRole(user.studentProfile.targetCareerRole);
        }
      } finally {
        if (isMounted) setIsLoadingTarget(false);
      }
    };

    loadCareerTarget();
    return () => { isMounted = false; };
  }, [user?.studentProfile?.targetCareerRole]);

  const toggleSkill = (skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill],
    );
  };

  // Permanently save career target to MongoDB
  const handleSaveTarget = async (roleToSave = targetRole) => {
    const cleanRole = (roleToSave || "").trim();
    if (!cleanRole) {
      addToast("Please specify your dream career target role first.", "warning");
      return false;
    }

    setIsSavingTarget(true);
    setSaveSuccess(false);

    try {
      const response = await studentService.updateCareerTarget({
        targetRole: cleanRole
      });

      if (response?.data?.success) {
        const confirmedRole = response.data.data.targetRole;
        setSavedTargetRole(confirmedRole);
        setTargetRole(confirmedRole);
        if (response.data.data.history) {
          setTargetHistory(response.data.data.history);
        }
        setSaveSuccess(true);
        addToast("Career target permanently saved to your profile and database!", "success");

        // Sync local auth context so Dashboard and other views update immediately
        if (setUser && user) {
          setUser({
            ...user,
            studentProfile: {
              ...(user.studentProfile || {}),
              targetCareerRole: confirmedRole,
              careerTarget: confirmedRole,
              preferredRoles: confirmedRole
            }
          });
        }
        return true;
      }
    } catch (error) {
      console.error("Error saving career target:", error);
      const errMsg = error.response?.data?.message || "Failed to save career target to database.";
      addToast(errMsg, "danger");
      return false;
    } finally {
      setIsSavingTarget(false);
    }
  };

  const handleGenerate = async (explicitTimeFrame) => {
    const activeTimeFrame = explicitTimeFrame || timeFrame;
    if (!targetRole.trim()) {
      addToast("Please configure your dream job role first.", "warning");
      return;
    }

    // Auto-save target role to MongoDB if it changed
    if (targetRole.trim() !== savedTargetRole) {
      await handleSaveTarget(targetRole);
    }

    setIsGenerating(true);
    setRoadmap(null);
    try {
      const response = await aiService.generateRoadmap(
        targetRole,
        selectedSkills,
        activeTimeFrame,
      );
      const rawData = response.data?.data;
      const list = Array.isArray(rawData) ? rawData : (rawData?.roadmap || []);
      const normalized = list.map((m, idx) => {
        if (typeof m === "string") {
          const parts = m.split(":");
          const month = parts.length > 1 ? parts[0].trim() : `Month ${idx + 1}`;
          const focusArea = parts.length > 1 ? parts.slice(1).join(":").trim() : m;
          return {
            month,
            focusArea,
            skillsToLearn: [targetRole, "Core Foundations", "Hands-on Practice"],
            actionItems: [
              `Master key principles of ${focusArea}`,
              `Build a hands-on project applying ${focusArea}`,
              "Complete milestone assessment review"
            ]
          };
        }
        return {
          month: m.month || m.phase || `Month ${idx + 1}`,
          focusArea: m.focusArea || m.title || m.name || `Focus Area ${idx + 1}`,
          skillsToLearn: Array.isArray(m.skillsToLearn)
            ? m.skillsToLearn
            : (Array.isArray(m.skills) ? m.skills : [m.focusArea || targetRole]),
          actionItems: Array.isArray(m.actionItems)
            ? m.actionItems
            : (Array.isArray(m.tasks) ? m.tasks : [m.description || "Complete milestone goals"])
        };
      });
      setRoadmap(normalized);

      // Persist newly generated roadmap to MongoDB so it is preserved in My Saved Roadmaps
      try {
        await studentService.saveRoadmap({
          roleName: targetRole,
          duration: activeTimeFrame,
          description: `Comprehensive personalized roadmap to become a ${targetRole}, covering core concepts, frameworks, practical projects, and interview mastery.`,
          milestones: normalized,
          currentSkills: selectedSkills,
          status: "In Progress"
        });
        addToast("Career roadmap generated & saved to your Saved Roadmaps!", "success");
      } catch (saveErr) {
        console.warn("Could not auto-persist roadmap to MongoDB:", saveErr.message);
      }
    } catch (error) {
      console.error("Failed to generate roadmap:", error);
      addToast("Failed to generate AI roadmap. Please try again.", "danger");
    } finally {
      setIsGenerating(false);
    }
  };

  const isRoleModified = targetRole.trim() !== savedTargetRole && targetRole.trim().length > 0;

  return (
    <div className="container-fluid py-4 px-xl-5">
      <div className="mb-5 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="icon-circle shadow-sm mx-auto mb-3"
          style={{
            background: "var(--primary-subtle)",
            color: "var(--primary)",
          }}
        >
          <Compass size={28} strokeWidth={2} />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="fw-black mb-2 text-ultra"
          style={{
            fontSize: "2.5rem",
            letterSpacing: "-0.02em",
            color: "var(--text)",
          }}
        >
          Career Target & AI Roadmap
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-muted fw-medium mx-auto"
          style={{ maxWidth: 650 }}
        >
          Define your target career role, persist it to your official student profile in MongoDB,
          and generate a personalized month-by-month learning roadmap.
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-3 d-flex justify-content-center"
        >
          <Link
            to="/student/roadmap"
            className="btn btn-outline-primary btn-sm px-3.5 py-1.5 rounded-pill fw-bold d-inline-flex align-items-center gap-2 shadow-sm"
          >
            <Map size={15} />
            <span>Go to My Saved Roadmaps Dashboard →</span>
          </Link>
        </motion.div>
      </div>

      <div className="row g-4 align-items-start">
        <div className="col-lg-4" style={{ position: "sticky", top: "1rem" }}>
          <div className="bento-card p-4 hover-glow mb-4 shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5
                className="fw-bold mb-0 d-flex align-items-center gap-2"
                style={{ color: "var(--text)" }}
              >
                <Target size={20} className="text-primary" /> Target Role
              </h5>
              {savedTargetRole && (
                <span className="badge bg-success-subtle text-success border border-success-subtle d-flex align-items-center gap-1 px-2 py-1 small">
                  <BookmarkCheck size={13} /> Stored in DB
                </span>
              )}
            </div>

            {/* Status Banner */}
            {savedTargetRole ? (
              <div className="p-3 rounded-3 mb-3 bg-primary-subtle border border-primary-subtle d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-2">
                  <CheckCircle2 size={16} className="text-primary flex-shrink-0" />
                  <span className="small fw-semibold text-primary">
                    Current Target: <strong className="text-foreground">{savedTargetRole}</strong>
                  </span>
                </div>
                {isRoleModified && (
                  <span className="badge bg-warning text-dark small">Unsaved changes</span>
                )}
              </div>
            ) : (
              <div className="p-3 rounded-3 mb-3 bg-light border text-muted small d-flex align-items-center gap-2">
                <AlertCircle size={16} className="text-muted flex-shrink-0" />
                <span>No career target saved yet. Choose or enter your dream role below.</span>
              </div>
            )}

            {/* Dream Job Input */}
            <div className="mb-3">
              <label className="form-label text-muted small fw-semibold d-flex justify-content-between">
                <span>Dream Job Role</span>
                {isLoadingTarget && <span className="spinner-border spinner-border-sm text-primary" />}
              </label>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control bg-transparent text-foreground"
                  placeholder="e.g. Full Stack Developer"
                  value={targetRole}
                  onChange={(e) => {
                    setTargetRole(e.target.value);
                    setSaveSuccess(false);
                  }}
                />
                <button
                  className={`btn ${isRoleModified ? 'btn-primary' : 'btn-outline-primary'} fw-bold px-3 d-flex align-items-center gap-1`}
                  type="button"
                  onClick={() => handleSaveTarget(targetRole)}
                  disabled={isSavingTarget || !targetRole.trim() || targetRole.trim() === savedTargetRole}
                  title="Save target permanently to MongoDB"
                >
                  {isSavingTarget ? (
                    <span className="spinner-border spinner-border-sm" />
                  ) : (
                    <Save size={15} />
                  )}
                  <span>{isSavingTarget ? 'Saving...' : 'Save'}</span>
                </button>
              </div>
              {saveSuccess && (
                <div className="text-success small fw-medium mt-1 d-flex align-items-center gap-1">
                  <Check size={14} /> Saved permanently to database!
                </div>
              )}
            </div>

            {/* Popular Target Role Quick-Select Chips */}
            <div className="mb-4">
              <label className="form-label text-muted small fw-semibold">
                Popular Career Targets
              </label>
              <div className="d-flex flex-wrap gap-1 mt-1">
                {POPULAR_ROLES.map((role) => {
                  const isSelected = targetRole.toLowerCase() === role.toLowerCase();
                  return (
                    <button
                      key={role}
                      type="button"
                      className={`btn btn-sm py-1 px-2 rounded-pill small fw-medium ${
                        isSelected
                          ? "btn-primary"
                          : "btn-outline-secondary text-foreground-50"
                      }`}
                      style={{ fontSize: "0.78rem" }}
                      onClick={() => {
                        setTargetRole(role);
                        setSaveSuccess(false);
                      }}
                    >
                      {role}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Current Skills Selection */}
            <div className="mb-3">
              <label className="form-label text-muted small fw-semibold">
                Current Skills
              </label>
              <div className="d-flex flex-wrap gap-2 mt-1">
                {SKILLS.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    className={`btn btn-sm rounded-pill fw-semibold ${
                      selectedSkills.includes(skill)
                        ? "btn-primary"
                        : "btn-outline-secondary text-foreground-50"
                    }`}
                    onClick={() => toggleSkill(skill)}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>

            {/* Timeframe Select */}
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label className="form-label text-muted small fw-semibold mb-0">
                  Preparation Timeline
                </label>
                <span className="badge bg-primary-subtle text-primary small">
                  {timeFrame}
                </span>
              </div>
              <select
                className="form-select bg-transparent text-foreground"
                value={timeFrame}
                onChange={(e) => {
                  const selected = e.target.value;
                  setTimeFrame(selected);
                  if (roadmap && roadmap.length > 0) {
                    handleGenerate(selected);
                  }
                }}
                style={{ background: "var(--bg-secondary)" }}
              >
                {[
                  { value: "3 months", label: "3 months (Fast Track — 3 Months)" },
                  { value: "6 months", label: "6 months (Standard — 6 Months)" },
                  { value: "9 months", label: "9 months (In-Depth — 9 Months)" },
                  { value: "1 year", label: "1 year (Mastery — 12 Months)" },
                  { value: "2 years", label: "2 years (Comprehensive — 24 Months)" }
                ].map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Buttons: placed immediately below without empty gap */}
            <div className="d-flex flex-column gap-2 pt-1">
              <button
                className="btn btn-primary w-100 rounded-3 py-3 fw-bold d-flex justify-content-center align-items-center gap-2 shadow-sm hover-lift"
                onClick={() => handleGenerate(timeFrame)}
                disabled={!targetRole.trim() || isGenerating}
                style={{
                  background:
                    "linear-gradient(135deg, var(--primary), var(--purple))",
                  border: "none",
                }}
              >
                {isGenerating ? (
                  <span className="spinner-border spinner-border-sm" />
                ) : (
                  <Sparkles size={18} />
                )}
                {isGenerating ? "Gemini is Planning Roadmap..." : `Generate AI Career Roadmap (${timeFrame})`}
              </button>

              <button
                className="btn btn-outline-secondary w-100 rounded-3 py-2 fw-semibold d-flex justify-content-center align-items-center gap-2"
                onClick={() => handleSaveTarget(targetRole)}
                disabled={isSavingTarget || !targetRole.trim()}
              >
                <BookmarkCheck size={16} />
                {isSavingTarget ? "Saving to Database..." : "Save Target Role to Profile"}
              </button>
            </div>
          </div>

          {/* Career Target History Log Card */}
          <div className="bento-card p-4 hover-glow">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ color: "var(--text)" }}>
                <Clock size={16} className="text-primary" /> Target Role History
              </h6>
              <span className="badge bg-secondary-subtle text-muted small">
                {targetHistory.length} recorded
              </span>
            </div>

            {isLoadingTarget ? (
              <div className="py-3 text-center small text-muted">
                <div className="spinner-border spinner-border-sm text-primary mb-1" />
                <div>Loading history...</div>
              </div>
            ) : targetHistory && targetHistory.length > 0 ? (
              <div className="d-flex flex-column gap-2" style={{ maxHeight: "240px", overflowY: "auto" }}>
                {targetHistory.map((item, idx) => {
                  const isActive = item.status === "active" || idx === 0;
                  const dateStr = item.setAt
                    ? new Date(item.setAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                    : "Recorded";
                  const timeStr = item.setAt
                    ? new Date(item.setAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
                    : "";

                  return (
                    <div
                      key={item._id || idx}
                      className="p-2.5 rounded-3 border d-flex justify-content-between align-items-center"
                      style={{
                        background: isActive ? "rgba(16, 185, 129, 0.05)" : "var(--surface)",
                        borderColor: isActive ? "rgba(16, 185, 129, 0.3)" : "var(--border)"
                      }}
                    >
                      <div>
                        <div className="fw-bold small text-foreground">{item.roleName}</div>
                        <div className="small text-muted" style={{ fontSize: "0.72rem" }}>
                          {dateStr} {timeStr && `• ${timeStr}`}
                        </div>
                      </div>
                      <span
                        className={`badge rounded-pill ${isActive ? "bg-success text-white" : "bg-light text-muted border"} small`}
                        style={{ fontSize: "0.7rem" }}
                      >
                        {isActive ? "Active" : "Previous"}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-3 text-muted small">
                No history recorded yet. Saving your career target will record your role history here.
              </div>
            )}
          </div>
        </div>{" "}
        <div className="col-lg-8">
          {" "}
          {isGenerating && (
            <div
              className="bento-card d-flex flex-column align-items-center justify-content-center py-5 h-100"
              style={{ minHeight: "500px" }}
            >
              {" "}
              <div className="position-relative d-flex justify-content-center align-items-center mb-4">
                {" "}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  style={{
                    width: 80,
                    height: 80,
                    border: "3px dashed var(--primary)",
                    borderRadius: "50%",
                    opacity: 0.5,
                  }}
                />{" "}
                <Sparkles
                  size={32}
                  className="text-primary position-absolute"
                />{" "}
              </div>{" "}
              <h5 className="fw-bold text-gradient-primary">
                Gemini is planning your future...
              </h5>{" "}
            </div>
          )}{" "}
          {!roadmap && !isGenerating && (
            <div
              className="bento-card d-flex flex-column align-items-center justify-content-center py-5 text-center h-100 hover-glow"
              style={{ minHeight: "500px", border: "2px dashed var(--border)" }}
            >
              {" "}
              <Map
                size={64}
                className="text-muted opacity-25 mb-4"
                strokeWidth={1}
              />{" "}
              <h5 className="text-muted">
                Your personalized roadmap will appear here
              </h5>{" "}
            </div>
          )}{" "}
          {roadmap && !isGenerating && (
            <div className="position-relative ps-4">
              {" "}
              {/* Vertical timeline line */}{" "}
              <div
                style={{
                  position: 'absolute',
                  left: "20px",
                  top: "30px",
                  bottom: "30px",
                  width: "2px",
                  background: "var(--primary-color)",
                  opacity: 0.3,
                }}
              />{" "}
              {roadmap.map((milestone, idx) => (
                <motion.div
                  key={idx}
                  className="d-flex gap-4 mb-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.2 }}
                >
                  {" "}
                  {/* Timeline dot */}{" "}
                  <div className="d-flex flex-column align-items-center">
                    {" "}
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        background: "var(--primary-color)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {" "}
                      {idx + 1}{" "}
                    </div>{" "}
                  </div>{" "}
                  <div className="bento-card flex-grow-1 p-4 hover-scale hover-glow">
                    {" "}
                    <div className="d-flex justify-content-between align-items-start mb-3 flex-wrap gap-2">
                      {" "}
                      <div>
                        {" "}
                        <span className="neon-badge bg-primary-subtle text-primary rounded-pill px-3 py-2 mb-1">
                          {milestone.month}
                        </span>{" "}
                        <h5 className="fw-bold mb-0 mt-2 text-foreground">
                          {milestone.focusArea}
                        </h5>{" "}
                      </div>{" "}
                    </div>{" "}
                    <div className="mb-3">
                      <p className="text-muted small fw-semibold text-uppercase mb-2">
                        Skills to Learn
                      </p>
                      <div className="d-flex flex-wrap gap-2">
                        {(milestone.skillsToLearn || []).map((skill, sIdx) => (
                          <span
                            key={sIdx}
                            className="neon-badge rounded-pill bg-success-subtle text-success px-3 py-2"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-muted small fw-semibold text-uppercase mb-2">
                        Action Items
                      </p>
                      <ul className="list-unstyled mb-0 d-flex flex-column gap-2">
                        {(milestone.actionItems || []).map((item, i) => (
                          <li
                            key={i}
                            className="d-flex align-items-start gap-2 rounded-3 p-2 hover-scale"
                            style={{ border: "1px solid var(--border)" }}
                          >
                            <CheckCircle2
                              size={16}
                              className="text-primary mt-1 flex-shrink-0"
                            />
                            <span className="small text-foreground-50 fw-medium">
                              {item}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>{" "}
                  </div>{" "}
                </motion.div>
              ))}{" "}
            </div>
          )}{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
};
export default CareerRoadmap;
