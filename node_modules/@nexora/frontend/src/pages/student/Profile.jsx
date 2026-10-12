import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Mic,
  FileCheck,
  Award,
  Code,
  Sparkles,
  Cloud,
  Smartphone,
  BarChart,
  Pencil,
  Download,
  Star,
  CheckCircle,
  TrendingUp,
  Briefcase,
  Plus,
  MapPin,
  Calendar,
  Mail,
  ExternalLink,
  Save,
  X,
  Trash2,
  GitBranch,
  Globe,
  Link,
  AlertTriangle,
  CheckCircle2,
  Upload,
  BadgeCheck,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { authService } from "../../services/api.js";
import { getAvatarUrl, handleImageError } from "../../utils/avatar.js";
const BADGES = [
  { name: "DSA Champion", icon: Trophy, color: "warning" },
  { name: "Mock Maestro", icon: Mic, color: "info" },
  { name: "Resume Pro", icon: FileCheck, color: "success" },
  { name: "Top Applicant", icon: Award, color: "primary" },
  { name: "Code Ninja", icon: Code, color: "danger" },
  { name: "Community Star", icon: Sparkles, color: "warning" },
];
const StudentProfile = () => {
  const { user, setUser } = useAuth(); // ── Editable Profile State ──
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({
    name: "",
    bio: "",
    registerNumber: "",
    college: "",
    branch: "",
    batchYear: "",
    cgpa: "",
    skills: [],
    githubUrl: "",
    linkedinUrl: "",
    websiteUrl: "",
    availableFrom: "",
    preferredRoles: "",
    targetCareerRole: "",
    softSkills: [],
    languages: [],
    interests: [],
    badges: [],
  });
  const [newSkill, setNewSkill] = useState("");
  const [newSoftSkill, setNewSoftSkill] = useState("");
  const [newLanguage, setNewLanguage] = useState("");
  const [newInterest, setNewInterest] = useState(""); // ── Projects & Certificates (local state) ──
  const [projects, setProjects] = useState([]);
  const [addingProject, setAddingProject] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    stack: "",
    desc: "",
    github: "",
  });
  const [certificates, setCertificates] = useState([]);
  const [addingCert, setAddingCert] = useState(false);
  const [newCert, setNewCert] = useState({ name: "", issuer: "", date: "" }); // Load user data into form
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        bio: user.studentProfile?.bio || "",
        registerNumber: user.studentProfile?.registerNumber || "",
        college: user.studentProfile?.college || "",
        branch: user.studentProfile?.branch || "",
        batchYear: user.studentProfile?.batchYear || "",
        cgpa: user.studentProfile?.cgpa || "",
        skills: user.studentProfile?.skills || [],
        githubUrl: user.studentProfile?.githubUrl || "",
        linkedinUrl: user.studentProfile?.linkedinUrl || "",
        websiteUrl: user.studentProfile?.websiteUrl || "",
        availableFrom: user.studentProfile?.availableFrom || "",
        preferredRoles: user.studentProfile?.preferredRoles || "",
        targetCareerRole: user.studentProfile?.targetCareerRole || "",
        softSkills: user.studentProfile?.softSkills || [],
        languages: user.studentProfile?.languages || [],
        interests: user.studentProfile?.interests || [],
        resumeUrl: user.studentProfile?.resumeUrl || "",
        badges: user.studentProfile?.badges || [],
      });
      setProjects(user.studentProfile?.projects || []);
      setCertificates(user.studentProfile?.certificates || []);
    }
  }, [user]);

  const [resumeAnalysis, setResumeAnalysis] = useState(null);
  const [uploadingResume, setUploadingResume] = useState(false);

  useEffect(() => {
    // Fetch latest resume analysis if available
    import("../../services/api.js").then(({ studentService }) => {
      studentService.getResumeAnalysis()
        .then(res => {
          if (res.data?.data) {
            setResumeAnalysis(res.data.data);
          }
        }).catch(err => console.error("Could not fetch resume analysis", err));
    });
  }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.type !== 'application/pdf') {
      showToast('Please upload a PDF file for ATS analysis.', 'danger');
      return;
    }

    setUploadingResume(true);
    showToast('Uploading and running ATS Analysis...', 'info');
    
    try {
      const formData = new FormData();
      formData.append('resume', file);
      
      const { studentService } = await import("../../services/api.js");
      const { data } = await studentService.uploadResume(formData);
      
      if (data.success) {
        const updatedUser = data.data?.user;
        const updatedSkills = updatedUser?.studentProfile?.skills || [];
        const updatedResumeUrl = updatedUser?.studentProfile?.resumeUrl || '';
        const updatedAtsScore = updatedUser?.studentProfile?.resumeScore;

        console.log('[Resume Upload] Success. Skills from server:', updatedSkills);

        setResumeAnalysis(data.data.analysis);

        // Always update the local form state with extracted skills
        setForm(prev => ({
          ...prev,
          skills: updatedSkills.length > 0 ? updatedSkills : prev.skills,
          resumeUrl: updatedResumeUrl || prev.resumeUrl
        }));

        // Also update the global auth user state so context/navbar/dashboard reflect changes
        if (typeof setUser === 'function' && updatedUser) {
          setUser(updatedUser);
          localStorage.setItem('nexora_user', JSON.stringify(updatedUser));
        }

        const skillCount = updatedSkills.length;
        const scoreMsg = updatedAtsScore != null ? ` | ATS Score: ${updatedAtsScore}/100` : '';
        showToast(`✅ Resume analyzed! ${skillCount} skills extracted${scoreMsg}`, 'success');
      }
    } catch (err) {
      console.error(err);
      showToast(err?.response?.data?.message || 'Failed to process resume.', 'danger');
    } finally {
      setUploadingResume(false);
      e.target.value = null;
    }
  };
  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        studentProfile: {
          bio: form.bio,
          registerNumber: form.registerNumber,
          college: form.college,
          branch: form.branch,
          batchYear: Number(form.batchYear) || undefined,
          cgpa: Number(form.cgpa) || undefined,
          skills: form.skills,
          githubUrl: form.githubUrl,
          linkedinUrl: form.linkedinUrl,
          websiteUrl: form.websiteUrl,
          availableFrom: form.availableFrom,
          preferredRoles: form.preferredRoles,
          targetCareerRole: form.targetCareerRole,
          resumeUrl: form.resumeUrl,
          projects: projects,
          certificates: certificates,
          badges: form.badges,
        },
      };
      const { data } = await authService.updateMe(payload);
      if (setUser) setUser(data.user); // Update localStorage
      localStorage.setItem("nexora_user", JSON.stringify(data.user));
      setEditMode(false);
      showToast("Profile saved successfully!");
    } catch (err) {
      showToast(err?.message || "Failed to save profile", "danger");
    } finally {
      setSaving(false);
    }
  };
  const handleAddSkill = () => {
    if (newSkill.trim() && !form.skills.includes(newSkill.trim())) {
      setForm((p) => ({ ...p, skills: [...p.skills, newSkill.trim()] }));
      setNewSkill("");
    }
  };
  const handleRemoveSkill = (skill) => {
    setForm((p) => ({ ...p, skills: p.skills.filter((s) => s !== skill) }));
  };
  const handleAddProject = () => {
    if (newProject.name.trim()) {
      setProjects((p) => [...p, newProject]);
      setNewProject({ name: "", stack: "", desc: "", github: "" });
      setAddingProject(false);
      showToast("Project added!");
    }
  };
  const handleDeleteProject = (idx) => {
    setProjects((p) => p.filter((_, i) => i !== idx));
  };
  const handleAddCert = () => {
    if (newCert.name.trim()) {
      setCertificates((p) => [...p, newCert]);
      setNewCert({ name: "", issuer: "", date: "" });
      setAddingCert(false);
      showToast("Certificate added!");
    }
  };
  const handleDeleteCert = (idx) => {
    setCertificates((p) => p.filter((_, i) => i !== idx));
  };
  return (
    <div
      className="container-fluid py-0 px-0"
      style={{
        background: "var(--bg)",
        minHeight: "100dvh",
        color: "var(--text)",
        position: "relative",
      }}
    >
      {" "}
      {/* Toast */}{" "}
      <AnimatePresence>
        {" "}
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`alert alert-${toast.type} d-flex align-items-center gap-2 fw-bold shadow-lg`}
            style={{
              position: "fixed",
              top: 24,
              right: 24,
              zIndex: 9999,
              borderRadius: 16,
              minWidth: 280,
              border: "none",
            }}
          >
            {" "}
            {toast.type === "success" ? (
              <CheckCircle2 size={18} />
            ) : (
              <AlertTriangle size={18} />
            )}{" "}
            {toast.msg}{" "}
          </motion.div>
        )}{" "}
      </AnimatePresence>{" "}
      {/* ── Cover Banner ── */}{" "}
      <div
        className="w-100 position-relative shadow-sm"
        style={{
          height: "240px",
          background: "linear-gradient(135deg, var(--primary), var(--purple))",
        }}
      >
        {" "}
        <div
          className="position-absolute w-100 h-100"
          style={{
            background:
              'url("https://www.transparenttextures.com/patterns/cubes.png")',
            opacity: 0.2,
          }}
        ></div>{" "}
      </div>{" "}
      <div
        className="container-fluid px-xl-5 pb-5 position-relative"
        style={{ marginTop: "-80px" }}
      >
        {" "}
        {/* ── Header Profile Area ── */}{" "}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-4 mb-5">
          {" "}
          <div className="d-flex flex-column flex-md-row align-items-md-end gap-4">
            {" "}
            <div className="position-relative">
              {" "}
              <img
                src={getAvatarUrl(user?.name, user?.avatar)}
                alt={user?.name || "Profile"}
                onError={(e) => handleImageError(e, user?.name)}
                className="rounded-circle shadow-lg border border-4"
                style={{
                  width: "160px",
                  height: "160px",
                  objectFit: "cover",
                  borderColor: "var(--bg)",
                  background: "transparent",
                }}
              />{" "}
            </div>{" "}
            <div className="pb-2">
              {" "}
              {editMode ? (
                <div className="d-flex flex-column gap-2">
                  {" "}
                  <input
                    type="text"
                    className="form-control fw-black fs-4 "
                    value={form.name}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, name: e.target.value }))
                    }
                    style={{
                      border: "1px solid var(--primary)",
                      color: "var(--text)",
                      background: "transparent",
                    }}
                  />{" "}
                  <div className="d-flex gap-2">
                    {" "}
                    <input
                      type="text"
                      className="form-control form-control-sm "
                      placeholder="College"
                      value={form.college}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, college: e.target.value }))
                      }
                      style={{
                        border: "1px solid var(--border)",
                        color: "var(--text)",
                        background: "transparent",
                      }}
                    />{" "}
                    <input
                      type="number"
                      className="form-control form-control-sm "
                      placeholder="Batch Year"
                      value={form.batchYear}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, batchYear: e.target.value }))
                      }
                      style={{
                        border: "1px solid var(--border)",
                        color: "var(--text)",
                        background: "transparent",
                      }}
                    />{" "}
                  </div>{" "}
                </div>
              ) : (
                <>
                  {" "}
                  <h2
                    className="fw-black mb-1"
                    style={{
                      fontSize: "2.5rem",
                      letterSpacing: "-0.02em",
                      color: "var(--text)",
                    }}
                  >
                    {" "}
                    {user?.name || "Student Name"}{" "}
                  </h2>{" "}
                  <p className="fw-medium text-muted mb-0 d-flex align-items-center gap-2">
                    {" "}
                    <MapPin size={16} /> {form.college || "Your College"}{" "}
                    {form.batchYear && `· ${form.batchYear}`}{" "}
                  </p>{" "}
                </>
              )}{" "}
            </div>{" "}
          </div>{" "}
          <div className="d-flex gap-2 pb-2">
            {" "}
            {editMode ? (
              <>
                {" "}
                <button
                  className="btn btn-outline-secondary rounded-pill px-4 fw-bold"
                  onClick={() => setEditMode(false)}
                >
                  {" "}
                  <X size={16} className="me-1" /> Cancel{" "}
                </button>{" "}
                <button
                  className="btn btn-success rounded-pill px-4 fw-bold d-flex align-items-center gap-2 shadow-sm hover-lift"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {" "}
                  {saving ? (
                    <span className="spinner-border spinner-border-sm" />
                  ) : (
                    <Save size={16} />
                  )}{" "}
                  {saving ? "Saving..." : "Save Changes"}{" "}
                </button>{" "}
              </>
            ) : (
              <button
                className="btn btn-primary rounded-pill px-4 fw-bold d-flex align-items-center gap-2 shadow-sm hover-lift"
                style={{
                  background:
                    "linear-gradient(135deg, var(--primary), var(--purple))",
                  border: "none",
                }}
                onClick={() => setEditMode(true)}
              >
                {" "}
                <Pencil size={16} /> Edit Profile{" "}
              </button>
            )}{" "}
          </div>{" "}
        </div>{" "}
        <div className="row g-4">
          {" "}
          {/* ── Left Column ── */}{" "}
          <div className="col-lg-4">
            {" "}
            <motion.div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
              }}
              className="rounded-4 shadow-sm hover-glow mb-4 p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {" "}
              {/* Social Links */}{" "}
              {editMode ? (
                <div className="d-flex flex-column gap-2 mt-3 text-start">
                  {" "}
                  <div className="input-group input-group-sm">
                    {" "}
                    <span
                      className="input-group-text "
                      style={{ border: "1px solid var(--border)" }}
                    >
                      <GitBranch size={14} />
                    </span>{" "}
                    <input
                      type="url"
                      className="form-control "
                      placeholder="GitHub URL"
                      value={form.githubUrl}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, githubUrl: e.target.value }))
                      }
                      style={{
                        border: "1px solid var(--border)",
                        color: "var(--text)",
                        background: "transparent",
                      }}
                    />{" "}
                  </div>{" "}
                  <div className="input-group input-group-sm">
                    {" "}
                    <span
                      className="input-group-text "
                      style={{ border: "1px solid var(--border)" }}
                    >
                      <Link size={14} />
                    </span>{" "}
                    <input
                      type="url"
                      className="form-control "
                      placeholder="LinkedIn URL"
                      value={form.linkedinUrl}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, linkedinUrl: e.target.value }))
                      }
                      style={{
                        border: "1px solid var(--border)",
                        color: "var(--text)",
                        background: "transparent",
                      }}
                    />{" "}
                  </div>{" "}
                  <div className="input-group input-group-sm">
                    {" "}
                    <span
                      className="input-group-text "
                      style={{ border: "1px solid var(--border)" }}
                    >
                      <Globe size={14} />
                    </span>{" "}
                    <input
                      type="url"
                      className="form-control "
                      placeholder="Portfolio URL"
                      value={form.websiteUrl}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, websiteUrl: e.target.value }))
                      }
                      style={{
                        border: "1px solid var(--border)",
                        color: "var(--text)",
                        background: "transparent",
                      }}
                    />{" "}
                  </div>{" "}
                </div>
              ) : (
                <div className="d-flex justify-content-center gap-3 mb-4 mt-3">
                  {" "}
                  {form.linkedinUrl && (
                    <a
                      href={form.linkedinUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-light rounded-circle p-2 d-flex align-items-center justify-content-center text-primary shadow-sm hover-scale"
                      style={{ width: 40, height: 40 }}
                    >
                      <Link size={18} />
                    </a>
                  )}{" "}
                  {form.githubUrl && (
                    <a
                      href={form.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-light rounded-circle p-2 d-flex align-items-center justify-content-center text-foreground shadow-sm hover-scale"
                      style={{ width: 40, height: 40 }}
                    >
                      <GitBranch size={18} />
                    </a>
                  )}{" "}
                  {form.websiteUrl && (
                    <a
                      href={form.websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-light rounded-circle p-2 d-flex align-items-center justify-content-center text-info shadow-sm hover-scale"
                      style={{ width: 40, height: 40 }}
                    >
                      <Globe size={18} />
                    </a>
                  )}{" "}
                  {!form.linkedinUrl && !form.githubUrl && !form.websiteUrl && (
                    <p className="text-muted small">
                      Click "Edit Profile" to add social links
                    </p>
                  )}{" "}
                </div>
              )}{" "}
              {editMode ? (
                <div className="mt-3">
                  <div className="d-flex flex-column align-items-center justify-content-center p-4 border border-dashed rounded-3 bg-secondary-subtle hover-glow mb-2" style={{ position: 'relative' }}>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handleResumeUpload}
                      disabled={uploadingResume}
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                    />
                    {uploadingResume ? (
                      <>
                        <span className="spinner-border text-primary mb-2" />
                        <h6 className="fw-bold m-0 text-primary">Running AI Analysis...</h6>
                        <small className="text-muted">Extracting skills & computing ATS score</small>
                      </>
                    ) : (
                      <>
                        <Upload size={32} className="text-primary mb-2" />
                        <h6 className="fw-bold m-0">Upload Real Resume (PDF)</h6>
                        <small className="text-muted">Will automatically update profile skills</small>
                      </>
                    )}
                  </div>
                  {form.resumeUrl && !uploadingResume && (
                    <small className="text-success d-block text-center mt-2 fw-semibold">
                      Current file: {form.resumeUrl}
                    </small>
                  )}
                </div>
              ) : (
                <>
                  <button
                    className="btn btn-primary rounded-pill px-4 py-2 fw-bold w-100 d-flex align-items-center justify-content-center gap-2 shadow-sm hover-lift mt-3"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--primary), var(--purple))",
                      border: "none",
                    }}
                    onClick={() => {
                      if (form.resumeUrl) {
                        window.open(form.resumeUrl, "_blank");
                      } else {
                        showToast("No resume uploaded yet.", "danger");
                      }
                    }}
                  >
                    {" "}
                    <Download size={18} /> Download Resume{" "}
                  </button>
                  {resumeAnalysis && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-3 p-3 rounded-4 border" style={{ borderColor: 'var(--primary)' }}>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 className="fw-bold m-0 text-primary d-flex align-items-center gap-1">
                          <CheckCircle2 size={16} /> ATS Score
                        </h6>
                        <span className={`badge rounded-pill fw-bold fs-6 ${resumeAnalysis.atsScore >= 75 ? 'bg-success' : 'bg-warning text-dark'}`}>
                          {resumeAnalysis.atsScore}/100
                        </span>
                      </div>
                      <p className="text-muted small mb-0" style={{ lineHeight: '1.4' }}>
                        {resumeAnalysis.summary}
                      </p>
                    </motion.div>
                  )}
                </>
              )}{" "}
            </motion.div>{" "}
            {/* Quick Stats */}{" "}
            <motion.div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
              }}
              className="rounded-4 shadow-sm hover-glow mb-4 p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {" "}
              <h6 className="fw-bold mb-4 d-flex align-items-center gap-2">
                <BarChart size={18} className="text-primary" /> Academic Info
              </h6>{" "}
              <div className="row g-3">
                {" "}
                {[
                  {
                    label: "Register No",
                    icon: FileCheck,
                    color: "success",
                    field: "registerNumber",
                    type: "text",
                    suffix: "",
                  },
                  {
                    label: "CGPA",
                    icon: Star,
                    color: "warning",
                    field: "cgpa",
                    type: "number",
                    suffix: "/10",
                  },
                  {
                    label: "Branch",
                    icon: Code,
                    color: "primary",
                    field: "branch",
                    type: "text",
                    suffix: "",
                  },
                ].map((item) => {
                  const IconComp = item.icon;
                  return (
                    <div key={item.label} className="col-4">
                      {" "}
                      <div
                        className="p-3 rounded-4 text-center hover-bg"
                        style={{
                          background: `var(--${item.color}-subtle, rgba(99,102,241,0.08))`,
                          border: `1px solid var(--border)`,
                        }}
                      >
                        {" "}
                        <IconComp
                          size={24}
                          className={`text-${item.color} mb-2`}
                          strokeWidth={2.5}
                        />{" "}
                        {editMode ? (
                          <input
                            type={item.type}
                            className="form-control form-control-sm text-center fw-black mt-1"
                            value={form[item.field]}
                            onChange={(e) =>
                              setForm((p) => ({
                                ...p,
                                [item.field]: e.target.value,
                              }))
                            }
                            style={{
                              border: "1px solid var(--border)",
                              color: "var(--text)",
                              background: "transparent",
                              fontSize: "0.85rem",
                            }}
                            placeholder={item.label}
                          />
                        ) : (
                          <p
                            className="fw-black mb-0 fs-5"
                            style={{ color: `var(--${item.color})` }}
                          >
                            {" "}
                            {form[item.field] || "—"}
                            {form[item.field] && item.suffix}{" "}
                          </p>
                        )}{" "}
                        <small
                          className="text-muted fw-semibold"
                          style={{ fontSize: "0.75rem" }}
                        >
                          {item.label}
                        </small>{" "}
                      </div>{" "}
                    </div>
                  );
                })}{" "}
              </div>{" "}
            </motion.div>{" "}
            {/* Badges */}{" "}
            <motion.div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
              }}
              className="rounded-4 shadow-sm hover-glow p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              {" "}
              <h6 className="fw-bold mb-4 d-flex align-items-center gap-2">
                <Award size={18} className="text-warning" /> Achievement Badges
              </h6>{" "}
              <div className="row g-3">
                {" "}
                {BADGES.map((badge) => {
                  const BadgeIcon = badge.icon;
                  const userBadges = form.badges || [];
                  const earned = userBadges.includes(badge.name);
                  return (
                    <div key={badge.name} className="col-4 text-center">
                      {" "}
                      <div
                        className={`p-3 rounded-4 d-flex flex-column align-items-center justify-content-center ${earned ? "hover-scale shadow-sm" : "opacity-40"}`}
                        style={{
                          background: earned
                            ? `var(--${badge.color}-subtle, rgba(99,102,241,0.08))`
                            : "var(--bg-secondary)",
                          border: `1px solid var(--border)`,
                          aspectRatio: "1/1",
                        }}
                      >
                        {" "}
                        <BadgeIcon
                          size={24}
                          className={`text-${badge.color} mb-1`}
                        />{" "}
                        <p
                          className="mb-0 fw-bold lh-sm text-center"
                          style={{ fontSize: "0.6rem" }}
                        >
                          {badge.name}
                        </p>{" "}
                      </div>{" "}
                    </div>
                  );
                })}{" "}
              </div>{" "}
            </motion.div>{" "}
          </div>{" "}
          {/* ── Right Column ── */}{" "}
          <div className="col-lg-8">
            {" "}
            {/* Skills */}
            <motion.div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
              }}
              className="rounded-4 shadow-sm hover-glow mb-4 p-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
                  <BadgeCheck size={20} className="text-primary" /> Skills
                </h5>
              </div>
              <div className="d-flex flex-wrap gap-2 mb-3">
                {form.skills.map((skill) => (
                  <span
                    key={skill}
                    className="badge rounded-pill px-3 py-2 fw-semibold d-inline-flex align-items-center gap-2"
                    style={{
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      color: "var(--text)",
                      fontSize: "0.85rem",
                      transition: "all 0.2s ease"
                    }}
                  >
                    {skill}
                    {editMode && (
                      <button
                        onClick={() => handleRemoveSkill(skill)}
                        aria-label={`Remove ${skill}`}
                        title="Remove skill"
                        className="btn p-0 d-flex align-items-center justify-content-center text-muted hover-scale"
                        style={{
                          width: "18px",
                          height: "18px",
                          border: "none",
                          background: "transparent",
                          borderRadius: "50%",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = "var(--danger)";
                          e.currentTarget.style.background = "var(--danger-subtle)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = "var(--text-muted)";
                          e.currentTarget.style.background = "transparent";
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.outline = "2px solid var(--primary)";
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.outline = "none";
                        }}
                      >
                        <X size={14} strokeWidth={2.5} />
                      </button>
                    )}
                  </span>
                ))}
                {form.skills.length === 0 && !editMode && (
                  <p className="text-muted small">
                    No skills added yet. Click "Edit Profile" to add skills.
                  </p>
                )}{" "}
              </div>{" "}
              {editMode && (
                <div className="input-group">
                  {" "}
                  <input
                    type="text"
                    className="form-control "
                    placeholder="Add a skill (e.g. React.js)"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
                    style={{
                      border: "1px solid var(--border)",
                      color: "var(--text)",
                      background: "transparent",
                    }}
                  />{" "}
                  <button
                    className="btn btn-primary fw-bold rounded-end-pill px-4"
                    onClick={handleAddSkill}
                  >
                    {" "}
                    <Plus size={16} /> Add{" "}
                  </button>{" "}
                </div>
              )}{" "}
            </motion.div>{" "}
            {/* Bio / Info */}{" "}
            <motion.div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
              }}
              className="rounded-4 shadow-sm hover-glow mb-4 p-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              {" "}
              <div className="d-flex justify-content-between align-items-center mb-3">
                {" "}
                <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
                  <FileCheck size={20} className="text-primary" /> About & Info
                </h5>{" "}
              </div>{" "}
              {editMode ? (
                <textarea
                  className="form-control mb-4"
                  rows={4}
                  placeholder="Write your bio..."
                  value={form.bio}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, bio: e.target.value }))
                  }
                  style={{
                    border: "1px solid var(--border)",
                    color: "var(--text)",
                    background: "transparent",
                    resize: "vertical",
                  }}
                />
              ) : (
                <p className="text-muted lh-lg mb-4">{form.bio}</p>
              )}{" "}
              <div className="row g-3">
                {" "}
                {[
                  {
                    label: "Email",
                    value: user?.email || "",
                    icon: Mail,
                    readOnly: true,
                  },
                  {
                    label: "Available From",
                    icon: Calendar,
                    field: "availableFrom",
                  },
                  {
                    label: "Preferred Roles",
                    icon: Briefcase,
                    field: "preferredRoles",
                  },
                  {
                    label: "Target Career Role (For Matches)",
                    icon: Award,
                    field: "targetCareerRole",
                  },
                  { label: "Location", icon: MapPin, field: "college" },
                ].map((info) => {
                  const InfoIcon = info.icon;
                  return (
                    <div key={info.label} className="col-md-6">
                      {" "}
                      <div
                        className="d-flex align-items-center gap-3 p-3 rounded-3 "
                        style={{ border: "1px solid var(--border)" }}
                      >
                        {" "}
                        <div
                          className="icon-circle bg-primary-subtle text-primary flex-shrink-0"
                          style={{ width: 40, height: 40 }}
                        >
                          {" "}
                          <InfoIcon size={18} />{" "}
                        </div>{" "}
                        <div className="flex-grow-1 min-w-0">
                          {" "}
                          <small
                            className="text-muted d-block fw-semibold"
                            style={{ fontSize: "0.75rem" }}
                          >
                            {info.label}
                          </small>{" "}
                          {editMode && !info.readOnly && info.field ? (
                            <input
                              type="text"
                              className="form-control form-control-sm p-0 border-0 fw-bold"
                              value={form[info.field]}
                              onChange={(e) =>
                                setForm((p) => ({
                                  ...p,
                                  [info.field]: e.target.value,
                                }))
                              }
                              style={{
                                color: "var(--text)",
                                background: "transparent",
                                boxShadow: "none",
                              }}
                              placeholder={`Enter ${info.label.toLowerCase()}`}
                            />
                          ) : (
                            <span className="fw-bold small text-truncate d-block">
                              {info.value ?? form[info.field] ?? "—"}
                            </span>
                          )}{" "}
                        </div>{" "}
                      </div>{" "}
                    </div>
                  );
                })}{" "}
              </div>{" "}
            </motion.div>{" "}
            {/* Projects */}{" "}
            <motion.div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
              }}
              className="rounded-4 shadow-sm hover-glow mb-4 p-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {" "}
              <div className="d-flex justify-content-between align-items-center mb-4">
                {" "}
                <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
                  <Code size={20} className="text-primary" /> Projects
                </h5>{" "}
                <button
                  onClick={() => setAddingProject(true)}
                  className="btn btn-sm btn-outline-primary rounded-pill fw-bold d-flex align-items-center gap-1"
                >
                  {" "}
                  <Plus size={14} /> Add{" "}
                </button>{" "}
              </div>{" "}
              <AnimatePresence>
                {" "}
                {addingProject && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 rounded-4 mb-3 "
                    style={{ border: "1px solid var(--primary)" }}
                  >
                    {" "}
                    <div className="row g-2 mb-2">
                      {" "}
                      <div className="col-md-6">
                        {" "}
                        <input
                          type="text"
                          className="form-control "
                          placeholder="Project Name"
                          value={newProject.name}
                          onChange={(e) =>
                            setNewProject((p) => ({
                              ...p,
                              name: e.target.value,
                            }))
                          }
                          style={{
                            border: "1px solid var(--border)",
                            color: "var(--text)",
                            background: "transparent",
                          }}
                        />{" "}
                      </div>{" "}
                      <div className="col-md-6">
                        {" "}
                        <input
                          type="text"
                          className="form-control "
                          placeholder="Tech Stack"
                          value={newProject.stack}
                          onChange={(e) =>
                            setNewProject((p) => ({
                              ...p,
                              stack: e.target.value,
                            }))
                          }
                          style={{
                            border: "1px solid var(--border)",
                            color: "var(--text)",
                            background: "transparent",
                          }}
                        />{" "}
                      </div>{" "}
                      <div className="col-12">
                        {" "}
                        <textarea
                          rows={2}
                          className="form-control "
                          placeholder="Project description"
                          value={newProject.desc}
                          onChange={(e) =>
                            setNewProject((p) => ({
                              ...p,
                              desc: e.target.value,
                            }))
                          }
                          style={{
                            border: "1px solid var(--border)",
                            color: "var(--text)",
                            background: "transparent",
                          }}
                        />{" "}
                      </div>{" "}
                      <div className="col-12">
                        {" "}
                        <input
                          type="url"
                          className="form-control "
                          placeholder="GitHub URL (optional)"
                          value={newProject.github}
                          onChange={(e) =>
                            setNewProject((p) => ({
                              ...p,
                              github: e.target.value,
                            }))
                          }
                          style={{
                            border: "1px solid var(--border)",
                            color: "var(--text)",
                            background: "transparent",
                          }}
                        />{" "}
                      </div>{" "}
                    </div>{" "}
                    <div className="d-flex gap-2">
                      {" "}
                      <button
                        className="btn btn-outline-secondary rounded-pill btn-sm fw-bold px-3"
                        onClick={() => setAddingProject(false)}
                      >
                        Cancel
                      </button>{" "}
                      <button
                        className="btn btn-primary rounded-pill btn-sm fw-bold px-3"
                        onClick={handleAddProject}
                      >
                        {" "}
                        <Save size={14} className="me-1" /> Save Project{" "}
                      </button>{" "}
                    </div>{" "}
                  </motion.div>
                )}{" "}
              </AnimatePresence>{" "}
              <div className="d-flex flex-column gap-3">
                {" "}
                {projects.map((project, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-4 border hover-glow "
                    style={{ borderColor: "var(--border)" }}
                  >
                    {" "}
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      {" "}
                      <h6 className="fw-bold mb-0 fs-6">{project.name}</h6>{" "}
                      <div className="d-flex gap-2">
                        {" "}
                        {project.github && (
                          <a
                            href={project.github}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-sm btn-dark rounded-pill px-3 d-flex align-items-center gap-1"
                          >
                            {" "}
                            <GitBranch size={14} /> Code{" "}
                          </a>
                        )}{" "}
                        <button
                          onClick={() => handleDeleteProject(i)}
                          className="btn btn-sm btn-outline-danger rounded-pill px-2"
                        >
                          {" "}
                          <Trash2 size={14} />{" "}
                        </button>{" "}
                      </div>{" "}
                    </div>{" "}
                    <small className="badge bg-primary-subtle text-primary rounded-pill px-3 py-1 fw-bold mb-2 d-inline-block">
                      {project.stack}
                    </small>{" "}
                    <p className="text-muted small mb-0 lh-base">
                      {project.desc}
                    </p>{" "}
                  </div>
                ))}{" "}
              </div>{" "}
            </motion.div>{" "}
            {/* Certificates */}{" "}
            <motion.div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
              }}
              className="rounded-4 shadow-sm hover-glow p-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              {" "}
              <div className="d-flex justify-content-between align-items-center mb-4">
                {" "}
                <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
                  <Award size={20} className="text-primary" /> Certificates
                </h5>{" "}
                <button
                  onClick={() => setAddingCert(true)}
                  className="btn btn-sm btn-outline-primary rounded-pill fw-bold d-flex align-items-center gap-1"
                >
                  {" "}
                  <Plus size={14} /> Add{" "}
                </button>{" "}
              </div>{" "}
              <AnimatePresence>
                {" "}
                {addingCert && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 rounded-4 mb-3 "
                    style={{ border: "1px solid var(--primary)" }}
                  >
                    {" "}
                    <div className="row g-2 mb-2">
                      {" "}
                      <div className="col-md-6">
                        {" "}
                        <input
                          type="text"
                          className="form-control "
                          placeholder="Certificate Name"
                          value={newCert.name}
                          onChange={(e) =>
                            setNewCert((p) => ({ ...p, name: e.target.value }))
                          }
                          style={{
                            border: "1px solid var(--border)",
                            color: "var(--text)",
                            background: "transparent",
                          }}
                        />{" "}
                      </div>{" "}
                      <div className="col-md-4">
                        {" "}
                        <input
                          type="text"
                          className="form-control "
                          placeholder="Issuer (e.g. Google)"
                          value={newCert.issuer}
                          onChange={(e) =>
                            setNewCert((p) => ({
                              ...p,
                              issuer: e.target.value,
                            }))
                          }
                          style={{
                            border: "1px solid var(--border)",
                            color: "var(--text)",
                            background: "transparent",
                          }}
                        />{" "}
                      </div>{" "}
                      <div className="col-md-2">
                        {" "}
                        <input
                          type="text"
                          className="form-control "
                          placeholder="Date"
                          value={newCert.date}
                          onChange={(e) =>
                            setNewCert((p) => ({ ...p, date: e.target.value }))
                          }
                          style={{
                            border: "1px solid var(--border)",
                            color: "var(--text)",
                            background: "transparent",
                          }}
                        />{" "}
                      </div>{" "}
                    </div>{" "}
                    <div className="d-flex gap-2">
                      {" "}
                      <button
                        className="btn btn-outline-secondary rounded-pill btn-sm fw-bold px-3"
                        onClick={() => setAddingCert(false)}
                      >
                        Cancel
                      </button>{" "}
                      <button
                        className="btn btn-primary rounded-pill btn-sm fw-bold px-3"
                        onClick={handleAddCert}
                      >
                        {" "}
                        <Save size={14} className="me-1" /> Save
                        Certificate{" "}
                      </button>{" "}
                    </div>{" "}
                  </motion.div>
                )}{" "}
              </AnimatePresence>{" "}
              <div className="d-flex flex-column gap-3">
                {" "}
                {certificates.map((cert, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-4 border d-flex align-items-center gap-4 hover-glow "
                    style={{ borderColor: "var(--border)" }}
                  >
                    {" "}
                    <div
                      className="icon-circle bg-primary text-white shadow-sm flex-shrink-0"
                      style={{ width: 48, height: 48 }}
                    >
                      {" "}
                      <Award size={22} />{" "}
                    </div>{" "}
                    <div className="flex-grow-1">
                      {" "}
                      <h6 className="fw-bold mb-0 fs-6">{cert.name}</h6>{" "}
                      <small className="text-muted fw-semibold">
                        {cert.issuer} · Issued {cert.date}
                      </small>{" "}
                    </div>{" "}
                    <button
                      onClick={() => handleDeleteCert(i)}
                      className="btn btn-sm btn-outline-danger rounded-circle p-2 hover-scale flex-shrink-0"
                    >
                      {" "}
                      <Trash2 size={14} />{" "}
                    </button>{" "}
                  </div>
                ))}{" "}
              </div>{" "}
            </motion.div>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
};
export default StudentProfile;
