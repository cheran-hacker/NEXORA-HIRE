import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  X,
  FileCode,
  FolderGit2,
  Award,
  Link as LinkIcon,
  User,
  Building2,
  Send,
  AlertCircle,
  CheckCircle2,
  Search
} from "lucide-react";
import { studentService } from "../../services/api";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";

export default function EvidenceValidationModal({ isOpen, onClose, onSuccess, initialType = "skill", initialTitle = "" }) {
  const { addToast } = useToast();
  const { user } = useAuth();

  const [type, setType] = useState(initialType);
  const [title, setTitle] = useState(initialTitle);
  const [alumniId, setAlumniId] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [evidenceDescription, setEvidenceDescription] = useState("");

  const [alumniList, setAlumniList] = useState([]);
  const [loadingAlumni, setLoadingAlumni] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Suggested skills & projects from user profile
  const profileSkills = user?.studentProfile?.skills || [];
  const profileProjects = user?.studentProfile?.projects || [];

  useEffect(() => {
    if (isOpen) {
      setType(initialType);
      setTitle(initialTitle || "");
      setErrorMsg(null);
      fetchAlumniDirectory();
    }
  }, [isOpen, initialType, initialTitle]);

  const fetchAlumniDirectory = async () => {
    setLoadingAlumni(true);
    try {
      const res = await api.get("/alumni/directory");
      const list = res.data?.data || (Array.isArray(res.data) ? res.data : []);
      setAlumniList(list);
      if (list.length > 0 && !alumniId) {
        setAlumniId(list[0]._id || list[0].id);
      }
    } catch (err) {
      console.error("Failed to load alumni directory:", err);
    } finally {
      setLoadingAlumni(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!title.trim()) {
      setErrorMsg("Please enter a skill or project title.");
      return;
    }
    if (!alumniId) {
      setErrorMsg("Please select an alumni member to verify your work.");
      return;
    }
    if (!evidenceUrl.trim()) {
      setErrorMsg("Please provide a valid evidence link (GitHub, live demo, document).");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        alumniId,
        type,
        title: title.trim(),
        evidenceUrl: evidenceUrl.trim(),
        evidenceDescription: evidenceDescription.trim()
      };

      const res = await studentService.submitValidation(payload);
      addToast("Evidence validation request sent to alumni successfully!", "success");

      // Reset and notify parent
      setTitle("");
      setEvidenceUrl("");
      setEvidenceDescription("");
      if (onSuccess) onSuccess(res.data?.data);
      onClose();
    } catch (err) {
      console.error("Submit validation request error:", err);
      setErrorMsg(err.response?.data?.message || "Failed to submit validation request.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="nexora-modal-backdrop"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.18 }}
          className="nexora-modal-container size-md"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="nexora-modal-header">
            <div className="d-flex align-items-center gap-3">
              <div className="nexora-modal-icon-badge">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h4 className="nexora-modal-title">Request Evidence Validation</h4>
                <p className="nexora-modal-subtitle">Submit your work to an industry alumni for verification</p>
              </div>
            </div>

            <button
              type="button"
              className="nexora-modal-close-btn"
              onClick={onClose}
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="d-flex flex-column" style={{ minHeight: 0, flex: 1 }}>
            <div className="nexora-modal-body">
              {errorMsg && (
                <div className="alert alert-danger py-2 px-3 small d-flex align-items-center gap-2 rounded-3 mb-3">
                  <AlertCircle size={16} className="flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* 1. Validation Type: Skill vs Project */}
              <div className="mb-3">
                <label className="nexora-form-label">
                  Validation Category
                </label>
                <div className="d-flex gap-2">
                  {[
                    { id: "skill", label: "Technical Skill", icon: FileCode },
                    { id: "project", label: "Project Evidence", icon: FolderGit2 },
                    { id: "certification", label: "Certification", icon: Award }
                  ].map((item) => {
                    const Icon = item.icon;
                    const isSelected = type === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setType(item.id)}
                        className={`btn btn-sm flex-grow-1 d-flex align-items-center justify-content-center gap-2 py-2 rounded-3 fw-bold transition-all ${
                          isSelected ? "btn-primary shadow-sm" : "btn-outline-secondary"
                        }`}
                        style={
                          isSelected
                            ? { background: "var(--primary, #6366f1)", border: "none", color: "white" }
                            : { border: "1px solid var(--border)", background: "#ffffff", color: "#1e293b" }
                        }
                      >
                        <Icon size={15} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Title & Suggestions */}
              <div className="mb-3">
                <label className="nexora-form-label">
                  {type === "project" ? "Project Title" : type === "certification" ? "Certification Name" : "Skill Name"} <span className="nexora-form-req">*</span>
                </label>
                <input
                  type="text"
                  className="nexora-form-input"
                  placeholder={
                    type === "project"
                      ? "e.g., AI Diagnostic Radiograph Classifier"
                      : type === "certification"
                      ? "e.g., AWS Certified Solutions Architect"
                      : "e.g., React.js, Docker, FastAPI"
                  }
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />

                {/* Quick suggestions from profile */}
                {type === "skill" && profileSkills.length > 0 && (
                  <div className="d-flex flex-wrap gap-1.5 mt-2">
                    <span className="text-muted small me-1 align-self-center" style={{ fontSize: "0.72rem" }}>Quick select:</span>
                    {profileSkills.slice(0, 5).map((sk, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setTitle(sk)}
                        className="badge rounded-pill border small bg-white text-primary hover-lift"
                        style={{ padding: "4px 8px", cursor: "pointer", borderColor: "#cbd5e1" }}
                      >
                        + {sk}
                      </button>
                    ))}
                  </div>
                )}

                {type === "project" && profileProjects.length > 0 && (
                  <div className="d-flex flex-wrap gap-1.5 mt-2">
                    <span className="text-muted small me-1 align-self-center" style={{ fontSize: "0.72rem" }}>From your profile:</span>
                    {profileProjects.slice(0, 3).map((proj, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setTitle(proj.name || "");
                          if (proj.github) setEvidenceUrl(proj.github);
                          if (proj.desc) setEvidenceDescription(proj.desc);
                        }}
                        className="badge rounded-pill border small bg-white text-primary hover-lift"
                        style={{ padding: "4px 8px", cursor: "pointer", borderColor: "#cbd5e1" }}
                      >
                        + {proj.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. Alumni Member Selection */}
              <div className="mb-3">
                <label className="nexora-form-label">
                  Select Alumni Reviewer <span className="nexora-form-req">*</span>
                </label>
                {loadingAlumni ? (
                  <div className="form-control text-muted small d-flex align-items-center gap-2">
                    <span className="spinner-border spinner-border-sm" role="status" />
                    <span>Loading alumni directory...</span>
                  </div>
                ) : alumniList.length === 0 ? (
                  <div className="alert alert-warning py-2 small mb-0">
                    No registered alumni found. You can submit when alumni register.
                  </div>
                ) : (
                  <select
                    className="nexora-form-select"
                    value={alumniId}
                    onChange={(e) => setAlumniId(e.target.value)}
                    required
                  >
                    <option value="" disabled>-- Select an Alumni Reviewer --</option>
                    {alumniList.map((alumnus) => {
                      const id = alumnus._id || alumnus.id;
                      const company = alumnus.company || alumnus.companyName || alumnus.alumniProfile?.company || "";
                      const designation = alumnus.title || alumnus.currentRole || alumnus.alumniProfile?.designation || "";
                      const details = [designation, company].filter(Boolean).join(" @ ");
                      return (
                        <option key={id} value={id}>
                          {alumnus.name} {details ? `(${details})` : ""}
                        </option>
                      );
                    })}
                  </select>
                )}
              </div>

              {/* 4. Evidence Link (URL) */}
              <div className="mb-3">
                <label className="nexora-form-label">
                  Supporting Evidence Link (GitHub, Demo, or Document) <span className="nexora-form-req">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0" style={{ borderColor: "#cbd5e1" }}>
                    <LinkIcon size={16} className="text-muted" />
                  </span>
                  <input
                    type="url"
                    className="nexora-form-input border-start-0 ps-1 rounded-end-3"
                    placeholder="https://github.com/your-username/repo-name or https://demo-app.com"
                    value={evidenceUrl}
                    onChange={(e) => setEvidenceUrl(e.target.value)}
                    required
                  />
                </div>
                <small className="text-muted mt-1 d-block" style={{ fontSize: "0.74rem" }}>
                  Provide a public GitHub repo, pull request, live hosted project, or portfolio documentation link.
                </small>
              </div>

              {/* 5. Evidence Description */}
              <div className="mb-2">
                <label className="nexora-form-label">
                  Evidence Description & Implementation Highlights
                </label>
                <textarea
                  className="nexora-form-textarea"
                  rows={3}
                  placeholder="Briefly describe what you built, key architectural patterns used, test coverage, and problems solved..."
                  value={evidenceDescription}
                  onChange={(e) => setEvidenceDescription(e.target.value)}
                />
              </div>
            </div>

            {/* Actions / Footer */}
            <div className="nexora-modal-footer">
              <span className="nexora-modal-footer-hint">
                * Required fields must be completed
              </span>
              <div className="nexora-modal-footer-actions">
                <button
                  type="button"
                  className="nexora-modal-btn-cancel"
                  onClick={onClose}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !title.trim() || !evidenceUrl.trim() || !alumniId}
                  className="nexora-modal-btn-primary"
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" />
                      <span>Submitting Request...</span>
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      <span>Submit for Alumni Review</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
