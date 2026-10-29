import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Shield, User, Bell, Monitor, Save, CheckCircle2, ChevronRight,
  Moon, Sun, Smartphone, FileText, Upload, X, Plus, Trash2, Sparkles,
  AlertCircle, CheckCircle, GraduationCap, Award, ExternalLink, RotateCcw,
  BadgeCheck, Check, AlertTriangle, Briefcase, MapPin, Phone, ShieldCheck,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import { authService, studentService } from "../../services/api.js";

const ResumeReviewModal = ({ analysis, user, onClose, onApply, applying }) => {
  const [profile, setProfile] = useState({
    name: analysis.profile?.name || user?.name || "",
    phone: analysis.profile?.phone || user?.phone || user?.studentProfile?.phone || "",
    location: analysis.profile?.location || user?.studentProfile?.location || "",
    bio: analysis.profile?.bio || user?.studentProfile?.bio || "",
    college: analysis.profile?.college || user?.studentProfile?.college || "",
    branch: analysis.profile?.branch || user?.studentProfile?.branch || user?.studentProfile?.department || "",
    batchYear: analysis.profile?.batchYear || user?.studentProfile?.batchYear || "",
    cgpa: analysis.profile?.cgpa || user?.studentProfile?.cgpa || "",
    githubUrl: analysis.profile?.githubUrl || user?.studentProfile?.githubUrl || "",
    linkedinUrl: analysis.profile?.linkedinUrl || user?.studentProfile?.linkedinUrl || "",
    websiteUrl: analysis.profile?.websiteUrl || user?.studentProfile?.websiteUrl || "",
  });

  const [skills, setSkills] = useState(analysis.extractedSkills || []);
  const [newSkill, setNewSkill] = useState("");
  const [projects, setProjects] = useState(analysis.projects || []);
  const [certificates, setCertificates] = useState(analysis.certificates || []);

  const existingSkillsList = analysis.existingSkills || user?.studentProfile?.skills || [];
  const existingSkillsSet = new Set(existingSkillsList.map((s) => s.toLowerCase().trim()));
  const newSkills = skills.filter((s) => !existingSkillsSet.has(s.toLowerCase().trim()));
  const score = Number(analysis.atsScore) || 0;
  const scoreColor = score >= 80 ? "success" : score >= 60 ? "warning" : "danger";

  const handleAddSkill = (skillToAdd) => {
    const trimmed = (skillToAdd || newSkill).trim();
    if (!trimmed) return;
    const exists = skills.some((s) => s.toLowerCase().trim() === trimmed.toLowerCase());
    if (!exists) {
      setSkills((prev) => [...prev, trimmed]);
    }
    setNewSkill("");
  };

  const handleRemoveSkill = (skillIndex) => {
    setSkills((prev) => prev.filter((_, idx) => idx !== skillIndex));
  };

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (applying) return;

    const finalName = (profile.name || user?.name || "").trim();

    let numBatchYear = undefined;
    if (profile.batchYear !== undefined && profile.batchYear !== null && String(profile.batchYear).trim() !== "") {
      const y = Number(profile.batchYear);
      if (!isNaN(y)) numBatchYear = y;
    }

    let numCgpa = undefined;
    if (profile.cgpa !== undefined && profile.cgpa !== null && String(profile.cgpa).trim() !== "") {
      const c = Number(profile.cgpa);
      if (!isNaN(c)) numCgpa = c;
    }

    onApply({
      analysisId: analysis.analysisId,
      profile: {
        ...profile,
        name: finalName || undefined,
        batchYear: numBatchYear,
        cgpa: numCgpa,
      },
      skills,
      projects,
      certificates,
    });
  };

  return (
    <div
      className="modal show d-block"
      style={{
        background: "rgba(15, 23, 42, 0.65)",
        zIndex: 9999,
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      <div
        className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable"
        style={{ maxWidth: "980px", width: "95%" }}
      >
        <div
          className="modal-content border-0 rounded-4 shadow-2xl overflow-hidden"
          style={{
            background: "var(--surface)",
            color: "var(--text)",
            border: "1px solid var(--border)",
            maxHeight: "92vh",
          }}
        >
          {/* Header */}
          <div
            className="modal-header border-bottom px-4 px-md-5 py-3.5 d-flex align-items-center justify-content-between"
            style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}
          >
            <div className="d-flex align-items-center gap-3">
              <div
                className="p-2.5 rounded-3 d-flex align-items-center justify-content-center text-white shadow-sm flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                  width: "42px",
                  height: "42px",
                }}
              >
                <FileText size={22} />
              </div>
              <div>
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <h5 className="fw-black mb-0" style={{ color: "var(--text)", letterSpacing: "-0.01em" }}>
                    Resume Profile Review
                  </h5>
                  {analysis.fileName && (
                    <span
                      className="badge rounded-pill fw-semibold text-truncate"
                      style={{
                        background: "rgba(99, 102, 241, 0.12)",
                        color: "var(--primary, #4f46e5)",
                        fontSize: "0.72rem",
                        maxWidth: "240px",
                      }}
                      title={analysis.fileName}
                    >
                      {analysis.fileName}
                    </span>
                  )}
                </div>
                <p className="text-muted small mb-0 mt-0.5">
                  Review and customize your AI-extracted information before syncing to your profile.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={applying}
              className="btn btn-sm rounded-circle p-1.5 text-muted hover-bg border-0 ms-auto"
              aria-label="Close"
              title="Close modal"
            >
              <X size={20} />
            </button>
          </div>

          {/* Modal Scrollable Body */}
          <div className="modal-body px-4 px-md-5 py-4" style={{ overflowY: "auto", maxHeight: "calc(88vh - 150px)" }}>
            {/* ATS Scorecard Banner */}
            <div
              className="p-4 rounded-4 mb-4 position-relative overflow-hidden"
              style={{
                background: "var(--surface-2)",
                border: `1px solid ${
                  scoreColor === "success"
                    ? "rgba(16, 185, 129, 0.3)"
                    : scoreColor === "warning"
                    ? "rgba(245, 158, 11, 0.3)"
                    : "rgba(239, 68, 68, 0.3)"
                }`,
                boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
              }}
            >
              <div className="row align-items-center g-3">
                <div className="col-auto">
                  <div
                    className="d-flex flex-column align-items-center justify-content-center rounded-4 p-3 text-center"
                    style={{
                      minWidth: "92px",
                      height: "92px",
                      background:
                        scoreColor === "success"
                          ? "linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.08))"
                          : scoreColor === "warning"
                          ? "linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(217, 119, 6, 0.08))"
                          : "linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.08))",
                      border: `1px solid ${
                        scoreColor === "success"
                          ? "rgba(16, 185, 129, 0.35)"
                          : scoreColor === "warning"
                          ? "rgba(245, 158, 11, 0.35)"
                          : "rgba(239, 68, 68, 0.35)"
                      }`,
                    }}
                  >
                    <div
                      className={`fw-black lh-1 text-${scoreColor}`}
                      style={{ fontSize: "2.1rem", letterSpacing: "-0.03em" }}
                    >
                      {analysis.atsScore}
                    </div>
                    <div className="text-muted fw-bold mt-1" style={{ fontSize: "0.68rem", textTransform: "uppercase" }}>
                      ATS Score
                    </div>
                  </div>
                </div>

                <div className="col">
                  <div className="d-flex flex-wrap align-items-center gap-2 mb-1.5">
                    <span className="fw-bold" style={{ color: "var(--text)", fontSize: "1.05rem" }}>
                      ATS Resume Readiness
                    </span>
                    <span
                      className="badge rounded-pill fw-semibold"
                      style={{
                        background: "rgba(99, 102, 241, 0.12)",
                        color: "var(--primary, #4f46e5)",
                        fontSize: "0.75rem",
                      }}
                    >
                      {analysis.experienceLevel || "Professional"} Level
                    </span>
                    {analysis.targetRole && (
                      <span
                        className="badge rounded-pill fw-semibold"
                        style={{
                          background: "var(--surface)",
                          border: "1px solid var(--border)",
                          color: "var(--text-secondary)",
                          fontSize: "0.75rem",
                        }}
                      >
                        Target: {analysis.targetRole}
                      </span>
                    )}
                    {analysis.fallback && (
                      <span
                        className="badge rounded-pill fw-bold text-uppercase d-inline-flex align-items-center gap-1"
                        style={{
                          background: "rgba(245, 158, 11, 0.15)",
                          color: "#d97706",
                          border: "1px solid rgba(245, 158, 11, 0.3)",
                          fontSize: "0.68rem",
                        }}
                      >
                        <AlertTriangle size={11} /> Pattern-matching fallback
                      </span>
                    )}
                  </div>

                  <p className="text-muted small mb-2" style={{ lineHeight: "1.5" }}>
                    {analysis.summary || "Resume analyzed against enterprise ATS hiring criteria and role requirements."}
                  </p>

                  <div className="d-flex flex-wrap gap-2 small">
                    <span className="badge rounded-pill bg-light-subtle text-body border px-2.5 py-1">
                      <strong>{skills.length}</strong> Skills Extracted
                    </span>
                    <span className="badge rounded-pill bg-success-subtle text-success border border-success-subtle px-2.5 py-1">
                      <strong>{newSkills.length}</strong> New to Profile
                    </span>
                    {(projects || []).length > 0 && (
                      <span className="badge rounded-pill bg-info-subtle text-info border border-info-subtle px-2.5 py-1">
                        <strong>{projects.length}</strong> Projects
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Form Fields: Two Columns */}
            <div className="row g-4">
              {/* Left Column: Personal Information & Education */}
              <div className="col-12 col-lg-6">
                <div className="p-3.5 rounded-4 mb-4" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                  <h6 className="fw-bold text-muted text-uppercase mb-3 d-flex align-items-center gap-2" style={{ fontSize: "0.78rem", letterSpacing: "0.05em" }}>
                    <User size={15} className="text-primary" /> Personal Identity
                  </h6>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-muted mb-1 d-flex justify-content-between">
                      <span>Full Name</span>
                      {(profile.name || user?.name) && (
                        <span className="text-success small d-flex align-items-center gap-1">
                          <Check size={12} /> Auto-filled
                        </span>
                      )}
                    </label>
                    <input
                      className="form-control bg-transparent text-body rounded-3"
                      style={{ borderColor: "var(--border)" }}
                      value={profile.name || ""}
                      placeholder="e.g. John Doe"
                      onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-muted mb-1 d-flex justify-content-between">
                        <span>Phone</span>
                        {analysis.profile?.phone && <span className="text-success small"><Check size={12} /></span>}
                      </label>
                      <input
                        className="form-control bg-transparent text-body rounded-3"
                        style={{ borderColor: "var(--border)" }}
                        value={profile.phone || ""}
                        placeholder="e.g. +1 555-0199"
                        onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-muted mb-1 d-flex justify-content-between">
                        <span>Location</span>
                        {analysis.profile?.location && <span className="text-success small"><Check size={12} /></span>}
                      </label>
                      <input
                        className="form-control bg-transparent text-body rounded-3"
                        style={{ borderColor: "var(--border)" }}
                        value={profile.location || ""}
                        placeholder="e.g. San Francisco, CA"
                        onChange={(e) => setProfile((p) => ({ ...p, location: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="mb-0">
                    <label className="form-label small fw-semibold text-muted mb-1 d-flex justify-content-between">
                      <span>Professional Bio / Summary</span>
                      {analysis.profile?.bio && <span className="text-success small"><Check size={12} /></span>}
                    </label>
                    <textarea
                      className="form-control bg-transparent text-body rounded-3"
                      style={{ borderColor: "var(--border)", resize: "vertical", minHeight: "75px" }}
                      value={profile.bio || ""}
                      placeholder="Summary of your technical expertise and career goals..."
                      onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="p-3.5 rounded-4 mb-4" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                  <h6 className="fw-bold text-muted text-uppercase mb-3 d-flex align-items-center gap-2" style={{ fontSize: "0.78rem", letterSpacing: "0.05em" }}>
                    <GraduationCap size={15} className="text-info" /> Education & Academics
                  </h6>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-muted mb-1 d-flex justify-content-between">
                      <span>College / University</span>
                      {analysis.profile?.college && <span className="text-success small"><Check size={12} /></span>}
                    </label>
                    <input
                      className="form-control bg-transparent text-body rounded-3"
                      style={{ borderColor: "var(--border)" }}
                      value={profile.college || ""}
                      placeholder="e.g. Stanford University"
                      onChange={(e) => setProfile((p) => ({ ...p, college: e.target.value }))}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-muted mb-1 d-flex justify-content-between">
                      <span>Department / Branch</span>
                      {analysis.profile?.branch && <span className="text-success small"><Check size={12} /></span>}
                    </label>
                    <input
                      className="form-control bg-transparent text-body rounded-3"
                      style={{ borderColor: "var(--border)" }}
                      value={profile.branch || ""}
                      placeholder="e.g. Computer Science & Engineering"
                      onChange={(e) => setProfile((p) => ({ ...p, branch: e.target.value }))}
                    />
                  </div>

                  <div className="row g-2 mb-0">
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-muted mb-1 d-flex justify-content-between">
                        <span>Batch Year</span>
                        {(profile.batchYear || analysis.profile?.batchYear) && <span className="text-success small"><Check size={12} /></span>}
                      </label>
                      <input
                        type="number"
                        className="form-control bg-transparent text-body rounded-3"
                        style={{ borderColor: "var(--border)" }}
                        value={profile.batchYear || ""}
                        placeholder="e.g. 2026"
                        onChange={(e) => setProfile((p) => ({ ...p, batchYear: e.target.value }))}
                      />
                    </div>

                    <div className="col-6">
                      <label className="form-label small fw-semibold text-muted mb-1 d-flex justify-content-between">
                        <span>CGPA</span>
                        {(profile.cgpa || analysis.profile?.cgpa) && <span className="text-success small"><Check size={12} /></span>}
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="10"
                        className="form-control bg-transparent text-body rounded-3"
                        style={{ borderColor: "var(--border)" }}
                        value={profile.cgpa || ""}
                        placeholder="e.g. 8.75"
                        onChange={(e) => setProfile((p) => ({ ...p, cgpa: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-4" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                  <h6 className="fw-bold text-muted text-uppercase mb-3 d-flex align-items-center gap-2" style={{ fontSize: "0.78rem", letterSpacing: "0.05em" }}>
                    <ExternalLink size={15} className="text-success" /> Web Profiles & Portfolios
                  </h6>

                  {[
                    ["githubUrl", "GitHub Profile URL", "https://github.com/username"],
                    ["linkedinUrl", "LinkedIn Profile URL", "https://linkedin.com/in/username"],
                    ["websiteUrl", "Portfolio Website URL", "https://portfolio.dev"],
                  ].map(([key, label, placeholder]) => (
                    <div key={key} className="mb-2.5">
                      <label className="form-label small fw-semibold text-muted mb-1 d-flex justify-content-between">
                        <span>{label}</span>
                        {analysis.profile?.[key] && <span className="text-success small"><Check size={12} /></span>}
                      </label>
                      <input
                        className="form-control bg-transparent text-body rounded-3"
                        style={{ borderColor: "var(--border)" }}
                        value={profile[key] || ""}
                        placeholder={placeholder}
                        onChange={(e) => setProfile((p) => ({ ...p, [key]: e.target.value }))}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Skills, Projects & Certifications */}
              <div className="col-12 col-lg-6">
                {/* Skills Container */}
                <div className="p-3.5 rounded-4 mb-4" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <h6 className="fw-bold text-muted text-uppercase mb-0 d-flex align-items-center gap-2" style={{ fontSize: "0.78rem", letterSpacing: "0.05em" }}>
                      <BadgeCheck size={16} className="text-primary" /> Technical Skills
                    </h6>
                    <span className="badge rounded-pill bg-primary-subtle text-primary fw-semibold" style={{ fontSize: "0.72rem" }}>
                      {skills.length} Selected
                    </span>
                  </div>

                  {/* Existing skills section */}
                  {analysis.existingSkills && analysis.existingSkills.length > 0 && (
                    <div className="mb-3">
                      <div className="d-flex align-items-center justify-content-between mb-1.5">
                        <small className="text-muted fw-semibold">Already in your profile:</small>
                        <span className="badge bg-secondary-subtle text-secondary small" style={{ fontSize: "0.68rem" }}>
                          {analysis.existingSkills.length} skills
                        </span>
                      </div>
                      <div className="d-flex flex-wrap gap-1.5 p-2.5 rounded-3" style={{ background: "var(--surface)", border: "1px solid var(--border)", maxHeight: "110px", overflowY: "auto" }}>
                        {analysis.existingSkills.map((s, i) => (
                          <span
                            key={i}
                            className="badge rounded-pill fw-medium d-inline-flex align-items-center gap-1"
                            style={{
                              background: "rgba(100, 116, 139, 0.12)",
                              color: "var(--text-secondary)",
                              border: "1px solid var(--border)",
                              fontSize: "0.74rem",
                              padding: "4px 8px",
                            }}
                          >
                            <Check size={11} className="text-muted" /> {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Extracted Skills Section */}
                  <div className="mb-3">
                    <div className="d-flex align-items-center justify-content-between mb-1.5">
                      <small className="text-success fw-bold d-flex align-items-center gap-1">
                        <Sparkles size={12} /> Extracted from Resume (Click &times; to remove):
                      </small>
                      <span className="badge bg-success-subtle text-success small" style={{ fontSize: "0.68rem" }}>
                        {newSkills.length} new
                      </span>
                    </div>

                    <div
                      className="d-flex flex-wrap gap-1.5 p-2.5 rounded-3"
                      style={{
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                        maxHeight: "150px",
                        overflowY: "auto",
                      }}
                    >
                      {skills.length === 0 ? (
                        <span className="text-muted small fst-italic p-2">
                          No skills selected. You can add skills manually below.
                        </span>
                      ) : (
                        skills.map((s, i) => {
                          const isAlreadyInProfile = existingSkillsSet.has(s.toLowerCase().trim());
                          return (
                            <span
                              key={i}
                              className="badge rounded-pill d-inline-flex align-items-center gap-1.5"
                              style={{
                                background: isAlreadyInProfile
                                  ? "rgba(100, 116, 139, 0.12)"
                                  : "rgba(16, 185, 129, 0.12)",
                                color: isAlreadyInProfile
                                  ? "var(--text-secondary)"
                                  : "var(--success, #10b981)",
                                border: `1px solid ${
                                  isAlreadyInProfile
                                    ? "var(--border)"
                                    : "rgba(16, 185, 129, 0.3)"
                                }`,
                                fontSize: "0.78rem",
                                padding: "4px 10px",
                              }}
                            >
                              <span>{s}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveSkill(i)}
                                aria-label={`Remove skill ${s}`}
                                title={`Remove ${s}`}
                                className="btn p-0 d-flex align-items-center justify-content-center text-muted border-0"
                                style={{
                                  width: "16px",
                                  height: "16px",
                                  borderRadius: "50%",
                                  background: "transparent",
                                  transition: "all 0.15s ease",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.color = "var(--danger)";
                                  e.currentTarget.style.background = "rgba(239, 68, 68, 0.15)";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.color = "var(--text-muted)";
                                  e.currentTarget.style.background = "transparent";
                                }}
                              >
                                <X size={12} strokeWidth={2.5} />
                              </button>
                            </span>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Manual Skill Addition Input */}
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control rounded-start-pill py-2 small"
                      style={{
                        background: "var(--surface)",
                        borderColor: "var(--border)",
                        color: "var(--text)",
                        fontSize: "0.85rem",
                      }}
                      placeholder="Add another skill manually..."
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddSkill();
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-primary rounded-end-pill px-3.5 d-flex align-items-center gap-1.5 fw-semibold"
                      onClick={() => handleAddSkill()}
                    >
                      <Plus size={16} />
                      <span className="small">Add</span>
                    </button>
                  </div>

                  {/* Missing skills for target role */}
                  {analysis.missingSkills && analysis.missingSkills.length > 0 && (
                    <div
                      className="mt-3 p-2.5 rounded-3 d-flex flex-column gap-1.5"
                      style={{
                        background: "rgba(239, 68, 68, 0.05)",
                        border: "1px dashed rgba(239, 68, 68, 0.25)",
                      }}
                    >
                      <div className="d-flex align-items-center gap-1.5 small text-danger fw-bold">
                        <AlertCircle size={14} /> Missing for {analysis.targetRole || "Target Role"}:
                      </div>
                      <div className="d-flex flex-wrap gap-1 mt-1">
                        {analysis.missingSkills.map((s, i) => (
                          <button
                            type="button"
                            key={i}
                            onClick={() => handleAddSkill(s)}
                            className="badge rounded-pill btn btn-sm py-1 px-2 d-inline-flex align-items-center gap-1 text-danger border border-danger-subtle"
                            style={{
                              background: "rgba(239, 68, 68, 0.08)",
                              fontSize: "0.72rem",
                            }}
                            title="Click to add to your skills"
                          >
                            + {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Extracted Projects */}
                {projects && projects.length > 0 && (
                  <div className="p-3.5 rounded-4 mb-4" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                    <h6 className="fw-bold text-muted text-uppercase mb-3 d-flex align-items-center justify-content-between" style={{ fontSize: "0.78rem", letterSpacing: "0.05em" }}>
                      <span>Projects ({projects.length})</span>
                      <small className="text-muted fw-normal">Edit details or remove</small>
                    </h6>

                    {projects.map((proj, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-3 mb-2.5 position-relative"
                        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                      >
                        <div className="d-flex justify-content-between align-items-start mb-1.5">
                          <input
                            className="form-control form-control-sm bg-transparent text-body border-0 fw-bold p-0"
                            style={{ fontSize: "0.95rem" }}
                            value={proj.name || ""}
                            placeholder="Project title..."
                            onChange={(e) =>
                              setProjects((prev) =>
                                prev.map((p, idx) => (idx === i ? { ...p, name: e.target.value } : p))
                              )
                            }
                          />
                          <button
                            type="button"
                            className="btn btn-sm text-danger p-1 rounded hover-bg border-0 ms-2"
                            onClick={() => setProjects((prev) => prev.filter((_, idx) => idx !== i))}
                            title="Remove project"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <input
                          className="form-control form-control-sm bg-transparent text-primary border-0 p-0 small mb-1"
                          style={{ fontSize: "0.8rem" }}
                          value={proj.stack || ""}
                          placeholder="Technologies used (e.g. React, Node.js, PostgreSQL)..."
                          onChange={(e) =>
                            setProjects((prev) =>
                              prev.map((p, idx) => (idx === i ? { ...p, stack: e.target.value } : p))
                            )
                          }
                        />
                        <textarea
                          className="form-control form-control-sm bg-transparent text-muted border-0 p-0 small"
                          style={{ fontSize: "0.78rem", resize: "none", minHeight: "40px" }}
                          value={proj.desc || ""}
                          placeholder="Description of accomplishments and scope..."
                          onChange={(e) =>
                            setProjects((prev) =>
                              prev.map((p, idx) => (idx === i ? { ...p, desc: e.target.value } : p))
                            )
                          }
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Extracted Certifications */}
                {certificates && certificates.length > 0 && (
                  <div className="p-3.5 rounded-4" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                    <h6 className="fw-bold text-muted text-uppercase mb-3 d-flex align-items-center gap-1.5" style={{ fontSize: "0.78rem", letterSpacing: "0.05em" }}>
                      <Award size={15} className="text-info" /> Certifications ({certificates.length})
                    </h6>

                    {certificates.map((cert, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-3 mb-2 d-flex justify-content-between align-items-center"
                        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                      >
                        <div>
                          <div className="fw-semibold small" style={{ color: "var(--text)" }}>{cert.name}</div>
                          <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                            {cert.issuer} {cert.date && `• ${cert.date}`}
                          </div>
                        </div>
                        <button
                          type="button"
                          className="btn btn-sm text-danger p-1 rounded hover-bg border-0"
                          onClick={() => setCertificates((prev) => prev.filter((_, idx) => idx !== i))}
                          title="Remove certificate"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div
            className="modal-footer border-top px-4 px-md-5 py-3.5 d-flex flex-column flex-sm-row justify-content-between align-items-stretch align-items-sm-center gap-3"
            style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}
          >
            <div className="d-flex align-items-center gap-2 text-muted small">
              <ShieldCheck size={16} className="text-success flex-shrink-0" />
              <span>Skills will be merged into your profile. Existing details are preserved.</span>
            </div>

            <div className="d-flex align-items-center gap-2.5 justify-content-end">
              <button
                type="button"
                onClick={onClose}
                disabled={applying}
                className="btn btn-outline-secondary rounded-pill px-4 py-2 fw-semibold"
                style={{ fontSize: "0.875rem" }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={applying}
                className="btn rounded-pill px-4 py-2 fw-bold text-white shadow-sm d-flex align-items-center justify-content-center gap-2"
                style={{
                  background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                  border: "none",
                  cursor: applying ? "not-allowed" : "pointer",
                  opacity: applying ? 0.85 : 1,
                  fontSize: "0.875rem",
                  minWidth: "180px",
                  transition: "all 0.2s ease",
                }}
              >
                {applying ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                    <span>Updating Profile...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={17} />
                    <span>Update My Profile</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Settings = () => {
  const { user, setUser } = useAuth();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState("account");
  const [saving, setSaving] = useState(false);
  const { theme, setTheme } = useTheme();
  const [preferredRoles, setPreferredRoles] = useState(user?.studentProfile?.preferredRoles || "");
  const [notifications, setNotifications] = useState(user?.notificationSettings || { email:true, push:true, jobAlerts:true, assessmentReminders:true, newsletter:false });
  const [analyzing, setAnalyzing] = useState(false);
  const [applying, setApplying] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [resumeStatus, setResumeStatus] = useState(null);
  const fileInputRef = useRef(null);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await authService.updateMe({ themePreference:theme, notificationSettings:notifications, studentProfile:{preferredRoles} });
      if (data?.user && typeof setUser==="function") setUser(data.user);
      addToast("Settings saved successfully","success");
    } catch(err) { addToast(err?.message||"Failed to save settings","error"); }
    finally { setSaving(false); }
  };

  const handleResumeFile = async (file) => {
    if (!file) return;
    if (file.type !== "application/pdf") { addToast("Please upload a PDF file.","error"); return; }
    if (file.size > 5*1024*1024) { addToast("File must be under 5MB.","error"); return; }
    setAnalyzing(true);
    setResumeStatus({ type:"analyzing", msg:"Extracting text and running AI analysis..." });
    try {
      const formData = new FormData();
      formData.append("resume", file);
      const { data } = await studentService.analyzeResumeForProfile(formData);
      if (data.success) {
        setAnalysisResult(data.data);
        setResumeStatus({ type:"ready", msg:`Analysis complete — ${data.data.extractedSkills?.length||0} skills found, ATS: ${data.data.atsScore}/100` });
        setShowModal(true);
      } else {
        setResumeStatus({ type:"error", msg:data.message||"Analysis failed" });
        addToast(data.message||"Analysis failed","error");
      }
    } catch(err) {
      const msg = err?.response?.data?.message || err?.message || "Failed to analyze resume";
      setResumeStatus({ type:"error", msg });
      addToast(msg,"error");
    } finally {
      setAnalyzing(false);
      if (fileInputRef.current) fileInputRef.current.value = null;
    }
  };

  const handleApplyProfile = async (confirmedData) => {
    setApplying(true);
    try {
      const res = await studentService.applyResumeProfile(confirmedData);
      const data = res.data;
      if (data.success) {
        if (typeof setUser === "function" && data.data?.user) {
          setUser(data.data.user);
          localStorage.setItem("nexora_user", JSON.stringify(data.data.user));
        }
        addToast(data.message || "Profile successfully updated from resume!", "success");
        setShowModal(false);
        const sp = data.data?.user?.studentProfile;
        setResumeStatus({
          type: "done",
          msg: `Profile updated! ${(sp?.skills || []).length} skills, ATS: ${sp?.resumeScore || 0}/100`,
        });
      } else {
        addToast(data.message || "Failed to update profile", "error");
      }
    } catch (err) {
      console.error("Apply resume profile error:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        (typeof err === "string" ? err : "Failed to apply profile changes");
      addToast(msg, "error");
    } finally {
      setApplying(false);
    }
  };

  const tabs = [
    { id:"account", label:"Account", icon:User },
    { id:"resume", label:"Resume", icon:FileText },
    { id:"security", label:"Security", icon:Shield },
    { id:"appearance", label:"Appearance", icon:Monitor },
    { id:"notifications", label:"Notifications", icon:Bell },
  ];

  return (
    <div className="container-fluid py-5 px-xl-5" style={{ background:"var(--bg)", minHeight:"100dvh", color:"var(--text)" }}>
      {showModal && analysisResult && (
        <ResumeReviewModal
          analysis={analysisResult}
          user={user}
          onClose={() => setShowModal(false)}
          onApply={handleApplyProfile}
          applying={applying}
        />
      )}
      <div className="d-flex justify-content-between align-items-center mb-5">
        <div>
          <h2 className="fw-black mb-1" style={{ fontSize:"2.5rem", letterSpacing:"-0.02em", color:"var(--text)" }}>Settings</h2>
          <p className="text-muted fw-medium">Manage your preferences, security, and notifications.</p>
        </div>
        {activeTab !== "resume" && (
          <button className="btn btn-primary rounded-pill px-4 fw-bold d-flex align-items-center gap-2 shadow-sm hover-lift"
            style={{ background:"linear-gradient(135deg,var(--primary),var(--purple))", border:"none" }} onClick={handleSave} disabled={saving}>
            {saving?<span className="spinner-border spinner-border-sm"/>:<Save size={16}/>}
            {saving?"Saving...":"Save Changes"}
          </button>
        )}
      </div>
      <div className="row g-4">
        <div className="col-lg-3">
          <div className="bento-card p-3">
            {tabs.map(tab=>(
              <button key={tab.id} onClick={()=>setActiveTab(tab.id)}
                className={`w-100 text-start d-flex align-items-center justify-content-between p-3 rounded-3 mb-2 border-0 transition-fast ${activeTab===tab.id?"bg-primary text-white shadow-sm":"bg-transparent text-muted hover-bg-subtle"}`}>
                <div className="d-flex align-items-center gap-3 fw-semibold"><tab.icon size={18}/> {tab.label}</div>
                {activeTab===tab.id&&<ChevronRight size={16}/>}
              </button>
            ))}
          </div>
        </div>
        <div className="col-lg-9">
          <motion.div key={activeTab} initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} transition={{duration:0.2}} className="bento-card p-5 h-100">

            {activeTab==="account"&&(
              <div>
                <h4 className="fw-bold mb-4">Account Information</h4>
                <div className="row g-4">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold text-muted">Full Name</label>
                    <input type="text" className="form-control" defaultValue={user?.name||"Student"} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold text-muted">Email Address</label>
                    <input type="email" className="form-control" defaultValue={user?.email||""} disabled />
                    <small className="text-muted mt-1 d-block">Contact admin to change university email.</small>
                  </div>
                  <div className="col-md-12">
                    <label className="form-label fw-semibold text-muted">Target Career Role</label>
                    <input type="text" className="form-control" placeholder="e.g. Backend Engineer, Data Scientist"
                      value={preferredRoles} onChange={e=>setPreferredRoles(e.target.value)} />
                    <small className="text-muted mt-1 d-block">Used for alumni matching and job recommendations.</small>
                  </div>
                </div>
              </div>
            )}

            {activeTab==="resume"&&(
              <div>
                <div className="d-flex align-items-center gap-3 mb-4">
                  <div className="p-2 rounded-3" style={{ background:"linear-gradient(135deg,var(--primary),var(--purple))", color:"#fff" }}>
                    <FileText size={22}/>
                  </div>
                  <div>
                    <h4 className="fw-bold mb-0">Resume Intelligence</h4>
                    <p className="text-muted small mb-0">Upload your resume to auto-fill your profile with real extracted data</p>
                  </div>
                </div>
                {(user?.studentProfile?.resumeUrl||user?.studentProfile?.resumeScore>0)&&(
                  <div className="p-4 rounded-3 border mb-4 d-flex align-items-center gap-4" style={{ borderColor:"var(--border)", background:"var(--surface)" }}>
                    <div className="p-3 rounded-3" style={{ background:"rgba(var(--primary-rgb),0.1)" }}>
                      <FileText size={32} className="text-primary"/>
                    </div>
                    <div className="flex-grow-1">
                      <div className="fw-bold">{user?.studentProfile?.resumeUrl||"Uploaded Resume"}</div>
                      <div className="d-flex gap-3 mt-1 flex-wrap">
                        {user?.studentProfile?.resumeScore>0&&(
                          <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 fw-semibold">
                            ATS Score: {user.studentProfile.resumeScore}/100
                          </span>
                        )}
                        {user?.studentProfile?.skills?.length>0&&(
                          <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 fw-semibold">
                            {user.studentProfile.skills.length} skills in profile
                          </span>
                        )}
                      </div>
                    </div>
                    <button className="btn btn-outline-primary rounded-pill px-3 fw-semibold d-flex align-items-center gap-2 flex-shrink-0"
                      onClick={()=>fileInputRef.current?.click()} disabled={analyzing}>
                      <RotateCcw size={16}/> Re-analyze
                    </button>
                  </div>
                )}
                {resumeStatus&&(
                  <div className={`alert alert-${resumeStatus.type==="error"?"danger":resumeStatus.type==="done"?"success":"info"} d-flex align-items-center gap-2 rounded-3 border-0 mb-4`}>
                    {resumeStatus.type==="analyzing"?<span className="spinner-border spinner-border-sm"/>:
                     resumeStatus.type==="error"?<AlertCircle size={18}/>:<CheckCircle size={18}/>}
                    {resumeStatus.msg}
                  </div>
                )}
                <div className="border border-2 rounded-4 p-5 text-center d-flex flex-column align-items-center justify-content-center hover-glow"
                  style={{ borderColor:"var(--primary)", borderStyle:"dashed", background:"rgba(var(--primary-rgb),0.03)", minHeight:"200px", cursor:analyzing?"not-allowed":"pointer" }}
                  onClick={()=>!analyzing&&fileInputRef.current?.click()}
                  onDragOver={e=>e.preventDefault()}
                  onDrop={e=>{e.preventDefault();handleResumeFile(e.dataTransfer.files[0]);}}>
                  <input ref={fileInputRef} type="file" accept="application/pdf" style={{display:"none"}} onChange={e=>handleResumeFile(e.target.files[0])} />
                  {analyzing?(
                    <>
                      <div className="position-relative mb-3">
                        <span className="spinner-grow text-primary" style={{width:"3rem",height:"3rem",opacity:0.3}}/>
                        <Sparkles size={24} className="text-primary position-absolute top-50 start-50 translate-middle"/>
                      </div>
                      <h6 className="fw-bold text-primary mb-1">AI is analyzing your resume...</h6>
                      <small className="text-muted">Extracting name, education, skills, projects, and more</small>
                    </>
                  ):(
                    <>
                      <div className="mb-3 p-3 rounded-circle" style={{background:"rgba(var(--primary-rgb),0.1)"}}>
                        <Upload size={36} className="text-primary"/>
                      </div>
                      <h6 className="fw-bold mb-1">Drop your PDF resume here</h6>
                      <p className="text-muted small mb-3">or click to browse — Max 5MB, PDF only</p>
                      <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 fw-semibold">
                        AI will extract name, education, skills, projects and more
                      </span>
                    </>
                  )}
                </div>
                <div className="mt-4 p-4 rounded-3" style={{background:"var(--surface)",border:"1px solid var(--border)"}}>
                  <h6 className="fw-bold mb-3">What gets extracted:</h6>
                  <div className="row g-2">
                    {["Full Name","Phone","Location","College & Branch","Batch Year & CGPA","Professional Bio","GitHub & LinkedIn","Technical Skills","Projects","Certifications","ATS Score","Missing Skills"].map(item=>(
                      <div key={item} className="col-md-4">
                        <div className="d-flex align-items-center gap-2 small text-muted">
                          <CheckCircle2 size={14} className="text-success flex-shrink-0"/>{item}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 p-3 rounded-3 bg-warning-subtle border border-warning-subtle">
                    <small className="text-warning-emphasis fw-semibold">
                      You will review all extracted data before anything is saved. Nothing updates without your confirmation.
                    </small>
                  </div>
                </div>
              </div>
            )}

            {activeTab==="appearance"&&(
              <div>
                <h4 className="fw-bold mb-4">Theme Preferences</h4>
                <div className="row g-3">
                  {[{id:"light",label:"Light",icon:Sun},{id:"dark",label:"Dark",icon:Moon},{id:"system",label:"System",icon:Smartphone}].map(t=>(
                    <div className="col-md-4" key={t.id}>
                      <div onClick={()=>setTheme(t.id)}
                        className={`p-4 rounded-3 border d-flex flex-column align-items-center gap-3 cursor-pointer transition-fast ${theme===t.id?"border-primary bg-primary-subtle text-primary shadow-sm":"border hover-bg-subtle text-muted"}`}>
                        <t.icon size={32}/><span className="fw-bold">{t.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab==="notifications"&&(
              <div>
                <h4 className="fw-bold mb-4">Notification Preferences</h4>
                <div className="d-flex flex-column gap-3">
                  {[
                    {key:"email",label:"Email Notifications",desc:"Receive summaries and major alerts via email."},
                    {key:"push",label:"Push Notifications",desc:"Real-time alerts in your browser."},
                    {key:"jobAlerts",label:"Job Alerts",desc:"Notify me when matching jobs are posted."},
                    {key:"assessmentReminders",label:"Assessment Reminders",desc:"24h and 1h reminders before tests."},
                  ].map(setting=>(
                    <div key={setting.key} className="p-4 rounded-3 border d-flex justify-content-between align-items-center hover-glow" style={{borderColor:"var(--border)"}}>
                      <div><h6 className="fw-bold mb-1">{setting.label}</h6><p className="text-muted small mb-0">{setting.desc}</p></div>
                      <div className="form-check form-switch fs-4 m-0 p-0">
                        <input className="form-check-input ms-0" type="checkbox" role="switch"
                          checked={notifications[setting.key]||false}
                          onChange={e=>setNotifications({...notifications,[setting.key]:e.target.checked})}
                          style={{cursor:"pointer"}} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="text-center py-5">
                <Shield size={64} className="text-muted mb-3 opacity-50"/>
                <h4 className="fw-bold mb-2">Secure &amp; Encrypted</h4>
                <p className="text-muted">Your security settings are managed through the central SSO provider.</p>
              </div>
            )}

          </motion.div>
        </div>
      </div>
    </div>
  );
};
export default Settings;