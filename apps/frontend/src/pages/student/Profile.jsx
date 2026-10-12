import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Mic,
  FileCheck,
  Award,
  Code,
  Sparkles,
  Pencil,
  Save,
  X,
  Trash2,
  GitBranch,
  Globe,
  Link as LinkIcon,
  Upload,
  BadgeCheck,
  Camera,
  GraduationCap,
  Sparkle,
  Briefcase,
  Plus,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { authService, studentService } from "../../services/api.js";
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
  const { user, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState("about");
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    registerNumber: "",
    college: "",
    degree: "",
    branch: "",
    year: "",
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
  const [newCert, setNewCert] = useState({ name: "", issuer: "", date: "" });

  const [resumeAnalysis, setResumeAnalysis] = useState(null);
  const [uploadingResume, setUploadingResume] = useState(false);

  useEffect(() => {
    if (user) {
      const sp = user.studentProfile || {};
      setForm({
        name: user.name || "Priya Sharma",
        email: user.email || "priya@example.com",
        phone: sp.phone || "+91 98765 43210",
        location: sp.location || "Chennai, Tamil Nadu",
        bio: sp.bio || "Passionate about AI and web development with experience building scalable full-stack applications. Eager to solve real-world problems.",
        registerNumber: sp.registerNumber || "21BCE1024",
        college: sp.college || "VIT Chennai",
        degree: sp.degree || "B.Tech",
        branch: sp.branch || "Computer Science",
        year: sp.year || "3rd Year",
        batchYear: sp.batchYear || "2025",
        cgpa: sp.cgpa || "8.7",
        skills: sp.skills?.length ? sp.skills : ["React.js", "Node.js", "Python", "TypeScript", "MongoDB", "Data Structures", "System Design"],
        githubUrl: sp.githubUrl || "https://github.com",
        linkedinUrl: sp.linkedinUrl || "https://linkedin.com",
        websiteUrl: sp.websiteUrl || "",
        availableFrom: sp.availableFrom || "Immediately",
        preferredRoles: sp.preferredRoles || "Software Engineer, Full Stack Developer",
        targetCareerRole: sp.targetCareerRole || "Full Stack Engineer",
        softSkills: sp.softSkills?.length ? sp.softSkills : ["Problem Solving", "Team Leadership", "Agile Collaboration"],
        languages: sp.languages?.length ? sp.languages : ["English", "Hindi", "Tamil"],
        interests: sp.interests || ["Distributed Systems", "Cloud Architecture", "Open Source"],
        badges: sp.badges || ["DSA Champion", "Resume Pro", "Top Applicant"],
      });
      setProjects(sp.projects?.length ? sp.projects : [
        { name: "Nexora AI Career Platform", stack: "React, Node.js, Socket.IO", desc: "Built end-to-end AI placement and mentorship ecosystem with WebRTC session rooms.", github: "https://github.com/nexora" },
        { name: "Smart ATS Resume Analyzer", stack: "Python, FastAPI, SpaCy", desc: "Automated keyword and skill extraction pipeline achieving 94% parsing accuracy.", github: "https://github.com/nexora-ats" }
      ]);
      setCertificates(sp.certificates?.length ? sp.certificates : [
        { name: "AWS Certified Cloud Practitioner", issuer: "Amazon Web Services", date: "2024" },
        { name: "Meta Front-End Developer Professional", issuer: "Meta / Coursera", date: "2023" }
      ]);
    }
  }, [user]);

  useEffect(() => {
    studentService.getResumeAnalysis()
      .then((res) => {
        if (res.data?.data) {
          setResumeAnalysis(res.data.data);
        }
      })
      .catch((err) => console.warn("Could not fetch resume analysis", err));
  }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      showToast("Please upload a PDF file for ATS analysis.", "danger");
      return;
    }

    setUploadingResume(true);
    showToast("Analyzing resume with AI ATS parser...", "info");

    try {
      const formData = new FormData();
      formData.append("resume", file);
      const res = await studentService.uploadResume(formData);
      if (res.data?.analysis) {
        setResumeAnalysis(res.data.analysis);
        if (res.data.analysis.extractedSkills?.length) {
          setForm((p) => ({
            ...p,
            skills: Array.from(new Set([...p.skills, ...res.data.analysis.extractedSkills])),
          }));
        }
      }
      showToast("Resume parsed and skills synced successfully!");
    } catch (err) {
      showToast(err?.message || "Failed to analyze resume", "danger");
    } finally {
      setUploadingResume(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        studentProfile: {
          phone: form.phone,
          location: form.location,
          bio: form.bio,
          college: form.college,
          degree: form.degree,
          branch: form.branch,
          year: form.year,
          batchYear: form.batchYear,
          cgpa: form.cgpa,
          registerNumber: form.registerNumber,
          skills: form.skills,
          githubUrl: form.githubUrl,
          linkedinUrl: form.linkedinUrl,
          websiteUrl: form.websiteUrl,
          availableFrom: form.availableFrom,
          preferredRoles: form.preferredRoles,
          targetCareerRole: form.targetCareerRole,
          projects: projects,
          certificates: certificates,
          badges: form.badges,
          softSkills: form.softSkills,
          languages: form.languages,
          interests: form.interests,
        },
      };

      const { data } = await authService.updateMe(payload);
      if (setUser) setUser(data.user);
      localStorage.setItem("nexora_user", JSON.stringify(data.user));
      setEditMode(false);
      showToast("Profile updated successfully!");
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

  const tabs = [
    { id: "about", label: "About" },
    { id: "academic", label: "Academic" },
    { id: "skills", label: "Skills" },
    { id: "projects", label: "Projects" },
    { id: "certifications", label: "Certifications" },
  ];

  return (
    <div
      className="container-fluid py-4 px-3 px-md-4"
      style={{
        background: "var(--bg)",
        minHeight: "100vh",
        color: "var(--text)",
      }}
    >
      {/* Toast Notification */}
      <AnimatePresence>
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
            {toast.type === "success" ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mx-auto" style={{ maxWidth: "1140px" }}>
        {/* Title */}
        <h2 className="fw-bold mb-4" style={{ fontSize: "1.85rem", letterSpacing: "-0.02em" }}>
          My Profile
        </h2>

        {/* Master Screen 3: Personal Information Card */}
        <div
          className="card border-0 rounded-4 shadow-sm mb-4 p-4 p-md-5"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
          }}
        >
          {/* Card Top Row: Title & Action */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="fw-bold mb-0" style={{ fontSize: "1.2rem" }}>
              Personal Information
            </h5>

            {editMode ? (
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary rounded-pill px-3 py-1 fw-semibold btn-sm"
                  onClick={() => setEditMode(false)}
                >
                  <X size={14} className="me-1" /> Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary rounded-pill px-4 py-1 fw-bold btn-sm shadow-sm"
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    background: "#0d6efd",
                    border: "none",
                  }}
                >
                  {saving ? <span className="spinner-border spinner-border-sm me-1" /> : <Save size={14} className="me-1" />}
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="btn btn-primary rounded-pill px-4 py-2 fw-semibold d-flex align-items-center gap-2 shadow-sm"
                onClick={() => setEditMode(true)}
                style={{
                  background: "#0d6efd",
                  border: "none",
                  fontSize: "0.92rem",
                }}
              >
                <Pencil size={15} /> Edit Profile
              </button>
            )}
          </div>

          {/* Profile Header Block: Avatar & Core Identity */}
          <div className="d-flex flex-column flex-sm-row align-items-center align-items-sm-start gap-4 mb-4 pb-3">
            <div className="position-relative">
              <img
                src={getAvatarUrl(form.name, user?.avatar)}
                alt={form.name}
                onError={(e) => handleImageError(e, form.name)}
                className="rounded-circle shadow-sm"
                style={{
                  width: "128px",
                  height: "128px",
                  objectFit: "cover",
                  border: "3px solid #e2e8f0",
                }}
              />
              <label
                className="position-absolute bottom-0 end-0 bg-white shadow rounded-circle p-2 d-flex align-items-center justify-content-center text-primary"
                style={{
                  cursor: "pointer",
                  width: "36px",
                  height: "36px",
                  border: "1px solid var(--border)",
                }}
                title="Change Photo"
              >
                <Camera size={16} />
              </label>
            </div>

            <div className="text-center text-sm-start pt-2">
              {editMode ? (
                <div className="d-flex flex-column gap-2" style={{ maxWidth: "340px" }}>
                  <input
                    type="text"
                    className="form-control fw-bold fs-5"
                    value={form.name}
                    placeholder="Full Name"
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  />
                  <div className="d-flex gap-2">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={form.degree}
                      placeholder="Degree (e.g. B.Tech)"
                      onChange={(e) => setForm((p) => ({ ...p, degree: e.target.value }))}
                    />
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={form.branch}
                      placeholder="Branch (e.g. Computer Science)"
                      onChange={(e) => setForm((p) => ({ ...p, branch: e.target.value }))}
                    />
                  </div>
                  <div className="d-flex gap-2">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={form.year}
                      placeholder="Year (e.g. 3rd Year)"
                      onChange={(e) => setForm((p) => ({ ...p, year: e.target.value }))}
                    />
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={form.college}
                      placeholder="College (e.g. VIT Chennai)"
                      onChange={(e) => setForm((p) => ({ ...p, college: e.target.value }))}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="fw-bold mb-1" style={{ fontSize: "1.65rem", color: "var(--text)" }}>
                    {form.name}
                  </h3>
                  <div className="fw-semibold text-muted mb-1" style={{ fontSize: "1rem" }}>
                    {form.degree} {form.branch}
                  </div>
                  <div className="text-muted small fw-medium">
                    {form.year} • {form.college}
                  </div>
                </>
              )}
            </div>
          </div>

          <hr style={{ borderColor: "var(--border)", opacity: 0.6 }} className="my-3" />

          {/* Details Row: Full Name, Email, Phone, Location, Bio (matching Image 3) */}
          <div className="row g-4 pt-2">
            <div className="col-12 col-md-3">
              <span className="text-muted small d-block fw-semibold mb-1">Full Name</span>
              {editMode ? (
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                />
              ) : (
                <span className="fw-semibold" style={{ color: "var(--text)" }}>
                  {form.name}
                </span>
              )}
            </div>

            <div className="col-12 col-md-3">
              <span className="text-muted small d-block fw-semibold mb-1">Email</span>
              <a
                href={`mailto:${form.email}`}
                className="fw-semibold text-decoration-none"
                style={{ color: "#0d6efd" }}
              >
                {form.email}
              </a>
            </div>

            <div className="col-12 col-md-3">
              <span className="text-muted small d-block fw-semibold mb-1">Phone</span>
              {editMode ? (
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                />
              ) : (
                <span className="fw-semibold" style={{ color: "var(--text)" }}>
                  {form.phone}
                </span>
              )}
            </div>

            <div className="col-12 col-md-3">
              <span className="text-muted small d-block fw-semibold mb-1">Location</span>
              {editMode ? (
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={form.location}
                  onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                />
              ) : (
                <span className="fw-semibold" style={{ color: "var(--text)" }}>
                  {form.location}
                </span>
              )}
            </div>

            <div className="col-12 mt-3">
              <span className="text-muted small d-block fw-semibold mb-1">Bio</span>
              {editMode ? (
                <textarea
                  className="form-control"
                  rows={2}
                  value={form.bio}
                  onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                />
              ) : (
                <p className="text-muted mb-0" style={{ lineHeight: "1.6", fontSize: "0.95rem" }}>
                  {form.bio}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Master Navigation Tabs */}
        <div className="border-bottom mb-4 d-flex gap-4" style={{ borderColor: "var(--border)" }}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                className={`btn btn-link text-decoration-none px-2 py-2 fw-semibold position-relative ${
                  isActive ? "text-primary" : "text-muted"
                }`}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  color: isActive ? "#0d6efd" : "var(--text-muted)",
                  fontSize: "1rem",
                  border: "none",
                  background: "transparent",
                }}
              >
                {tab.label}
                {isActive && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="position-absolute bottom-0 start-0 w-100"
                    style={{
                      height: "3px",
                      background: "#0d6efd",
                      borderRadius: "3px 3px 0 0",
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content 1: About */}
        {activeTab === "about" && (
          <div className="row g-4">
            <div className="col-lg-8">
              <div
                className="card border-0 rounded-4 shadow-sm p-4 mb-4"
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
              >
                <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                  <Briefcase size={18} className="text-primary" /> Career Aspirations & Target
                </h6>
                <div className="row g-3">
                  <div className="col-md-6">
                    <small className="text-muted d-block fw-semibold">Target Career Role</small>
                    {editMode ? (
                      <input
                        type="text"
                        className="form-control form-control-sm mt-1"
                        value={form.targetCareerRole}
                        onChange={(e) => setForm((p) => ({ ...p, targetCareerRole: e.target.value }))}
                      />
                    ) : (
                      <span className="fw-bold">{form.targetCareerRole || "Full Stack Engineer"}</span>
                    )}
                  </div>
                  <div className="col-md-6">
                    <small className="text-muted d-block fw-semibold">Preferred Roles</small>
                    {editMode ? (
                      <input
                        type="text"
                        className="form-control form-control-sm mt-1"
                        value={form.preferredRoles}
                        onChange={(e) => setForm((p) => ({ ...p, preferredRoles: e.target.value }))}
                      />
                    ) : (
                      <span className="fw-bold">{form.preferredRoles || "Frontend, Backend, AI"}</span>
                    )}
                  </div>
                  <div className="col-md-6">
                    <small className="text-muted d-block fw-semibold">Availability</small>
                    <span className="fw-semibold text-success">{form.availableFrom}</span>
                  </div>
                  <div className="col-md-6">
                    <small className="text-muted d-block fw-semibold">Spoken Languages</small>
                    <span className="fw-semibold">{form.languages.join(", ")}</span>
                  </div>
                </div>
              </div>

              <div
                className="card border-0 rounded-4 shadow-sm p-4 mb-4"
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
              >
                <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                  <Sparkle size={18} className="text-warning" /> Soft Skills & Core Strengths
                </h6>
                <div className="d-flex flex-wrap gap-2">
                  {form.softSkills.map((sk) => (
                    <span
                      key={sk}
                      className="badge rounded-pill px-3 py-2 fw-semibold"
                      style={{
                        background: "rgba(13, 110, 253, 0.08)",
                        color: "#0d6efd",
                        border: "1px solid rgba(13, 110, 253, 0.2)",
                        fontSize: "0.85rem",
                      }}
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div
                className="card border-0 rounded-4 shadow-sm p-4 mb-4"
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
              >
                <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                  <Globe size={18} className="text-primary" /> Social Profiles
                </h6>
                <div className="d-flex flex-column gap-2">
                  {form.linkedinUrl && (
                    <a
                      href={form.linkedinUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-outline-primary rounded-pill btn-sm d-flex align-items-center gap-2 py-2"
                    >
                      <LinkIcon size={15} /> LinkedIn Profile
                    </a>
                  )}
                  {form.githubUrl && (
                    <a
                      href={form.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-outline-dark rounded-pill btn-sm d-flex align-items-center gap-2 py-2"
                    >
                      <GitBranch size={15} /> GitHub Portfolio
                    </a>
                  )}
                  {form.websiteUrl && (
                    <a
                      href={form.websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-outline-info rounded-pill btn-sm d-flex align-items-center gap-2 py-2"
                    >
                      <Globe size={15} /> Personal Portfolio
                    </a>
                  )}
                </div>
              </div>

              <div
                className="card border-0 rounded-4 shadow-sm p-4"
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
              >
                <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                  <Award size={18} className="text-warning" /> Earned Badges
                </h6>
                <div className="row g-2">
                  {BADGES.map((b) => {
                    const BIcon = b.icon;
                    const earned = form.badges.includes(b.name);
                    return (
                      <div key={b.name} className="col-4 text-center">
                        <div
                          className={`p-2 rounded-3 text-center ${earned ? "border border-warning-subtle" : "opacity-40"}`}
                          style={{ background: earned ? "rgba(255, 193, 7, 0.1)" : "var(--bg-secondary)" }}
                        >
                          <BIcon size={20} className={earned ? "text-warning" : "text-muted"} />
                          <small className="d-block fw-semibold mt-1" style={{ fontSize: "0.65rem" }}>
                            {b.name}
                          </small>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content 2: Academic (Matches Screen 3 & Image 3 closeup) */}
        {activeTab === "academic" && (
          <div className="row g-4">
            <div className="col-lg-8">
              <div
                className="card border-0 rounded-4 shadow-sm p-4 mb-4"
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
              >
                <h6 className="fw-bold mb-4 d-flex align-items-center gap-2">
                  <GraduationCap size={20} className="text-primary" /> Academic Qualifications
                </h6>

                <div className="row g-4">
                  <div className="col-md-6">
                    <span className="text-muted small d-block fw-semibold mb-1">Institution</span>
                    {editMode ? (
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={form.college}
                        onChange={(e) => setForm((p) => ({ ...p, college: e.target.value }))}
                      />
                    ) : (
                      <span className="fw-bold fs-6">{form.college}</span>
                    )}
                  </div>

                  <div className="col-md-6">
                    <span className="text-muted small d-block fw-semibold mb-1">Degree</span>
                    {editMode ? (
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={form.degree}
                        onChange={(e) => setForm((p) => ({ ...p, degree: e.target.value }))}
                      />
                    ) : (
                      <span className="fw-bold fs-6">{form.degree}</span>
                    )}
                  </div>

                  <div className="col-md-6">
                    <span className="text-muted small d-block fw-semibold mb-1">Branch</span>
                    {editMode ? (
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={form.branch}
                        onChange={(e) => setForm((p) => ({ ...p, branch: e.target.value }))}
                      />
                    ) : (
                      <span className="fw-bold fs-6">{form.branch}</span>
                    )}
                  </div>

                  <div className="col-md-6">
                    <span className="text-muted small d-block fw-semibold mb-1">Current Year</span>
                    {editMode ? (
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={form.year}
                        onChange={(e) => setForm((p) => ({ ...p, year: e.target.value }))}
                      />
                    ) : (
                      <span className="fw-bold fs-6">{form.year}</span>
                    )}
                  </div>

                  <div className="col-md-6">
                    <span className="text-muted small d-block fw-semibold mb-1">Graduation Batch</span>
                    {editMode ? (
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={form.batchYear}
                        onChange={(e) => setForm((p) => ({ ...p, batchYear: e.target.value }))}
                      />
                    ) : (
                      <span className="fw-bold fs-6">Class of {form.batchYear}</span>
                    )}
                  </div>

                  <div className="col-md-6">
                    <span className="text-muted small d-block fw-semibold mb-1">Register Number</span>
                    {editMode ? (
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={form.registerNumber}
                        onChange={(e) => setForm((p) => ({ ...p, registerNumber: e.target.value }))}
                      />
                    ) : (
                      <span className="fw-bold fs-6">{form.registerNumber}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* CGPA Box (Matching Image 3 & 4) */}
            <div className="col-lg-4">
              <div
                className="card border-0 rounded-4 shadow-sm p-4 text-center"
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
              >
                <span className="text-muted fw-semibold small d-block mb-2">Cumulative Grade Point Average</span>
                <div
                  className="rounded-4 py-4 px-3 mb-3"
                  style={{
                    background: "rgba(13, 110, 253, 0.06)",
                    border: "1px dashed rgba(13, 110, 253, 0.3)",
                  }}
                >
                  <div className="text-muted small fw-bold">CGPA</div>
                  <div
                    className="fw-bold text-primary mt-1"
                    style={{ fontSize: "2.75rem", lineHeight: 1 }}
                  >
                    {form.cgpa}
                  </div>
                  <span className="badge bg-success-subtle text-success rounded-pill fw-bold px-3 py-1 mt-2">
                    Top 10% Percentile
                  </span>
                </div>
                <p className="text-muted small mb-0">
                  Verified by {form.college} Examination Department
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content 3: Skills & ATS Resume */}
        {activeTab === "skills" && (
          <div className="row g-4">
            <div className="col-lg-7">
              <div
                className="card border-0 rounded-4 shadow-sm p-4 mb-4"
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
              >
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold mb-0 d-flex align-items-center gap-2">
                    <BadgeCheck size={18} className="text-primary" /> Technical Skills
                  </h6>
                </div>

                <div className="d-flex flex-wrap gap-2 mb-4">
                  {form.skills.map((skill) => (
                    <span
                      key={skill}
                      className="badge rounded-pill px-3 py-2 fw-semibold d-inline-flex align-items-center gap-2"
                      style={{
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                        color: "var(--text)",
                        fontSize: "0.85rem",
                      }}
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="btn p-0 text-muted hover-scale"
                        style={{ border: "none", background: "transparent" }}
                        title="Remove skill"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Add a new skill (e.g. Next.js, Docker, PyTorch)..."
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
                  />
                  <button className="btn btn-primary fw-semibold px-4" onClick={handleAddSkill}>
                    <Plus size={16} className="me-1" /> Add
                  </button>
                </div>
              </div>
            </div>

            <div className="col-lg-5">
              <div
                className="card border-0 rounded-4 shadow-sm p-4"
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
              >
                <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                  <Upload size={18} className="text-primary" /> AI Resume ATS Sync
                </h6>
                <div
                  className="p-4 rounded-4 text-center border border-dashed mb-3 position-relative"
                  style={{ borderColor: "#0d6efd", background: "rgba(13, 110, 253, 0.03)" }}
                >
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleResumeUpload}
                    disabled={uploadingResume}
                    style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer" }}
                  />
                  <Upload size={28} className="text-primary mb-2" />
                  <div className="fw-bold small">{uploadingResume ? "Parsing with AI..." : "Upload PDF Resume"}</div>
                  <small className="text-muted d-block">Automatically extracts skills & benchmarks ATS score</small>
                </div>

                {resumeAnalysis && (
                  <div className="p-3 rounded-3 border" style={{ borderColor: "var(--border)" }}>
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="fw-semibold small">ATS Score</span>
                      <span className="badge bg-success rounded-pill">{resumeAnalysis.atsScore}/100</span>
                    </div>
                    <p className="text-muted small mb-0">{resumeAnalysis.summary}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab Content 4: Projects */}
        {activeTab === "projects" && (
          <div
            className="card border-0 rounded-4 shadow-sm p-4"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h6 className="fw-bold mb-0 d-flex align-items-center gap-2">
                <Code size={18} className="text-primary" /> Featured Projects
              </h6>
              <button
                type="button"
                onClick={() => setAddingProject(true)}
                className="btn btn-outline-primary rounded-pill btn-sm fw-semibold d-flex align-items-center gap-1"
              >
                <Plus size={14} /> Add Project
              </button>
            </div>

            <AnimatePresence>
              {addingProject && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 rounded-4 mb-4 border"
                  style={{ borderColor: "#0d6efd" }}
                >
                  <div className="row g-2 mb-3">
                    <div className="col-md-6">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Project Name"
                        value={newProject.name}
                        onChange={(e) => setNewProject((p) => ({ ...p, name: e.target.value }))}
                      />
                    </div>
                    <div className="col-md-6">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Tech Stack (e.g. React, Node.js)"
                        value={newProject.stack}
                        onChange={(e) => setNewProject((p) => ({ ...p, stack: e.target.value }))}
                      />
                    </div>
                    <div className="col-12">
                      <textarea
                        rows={2}
                        className="form-control"
                        placeholder="Description of the project"
                        value={newProject.desc}
                        onChange={(e) => setNewProject((p) => ({ ...p, desc: e.target.value }))}
                      />
                    </div>
                    <div className="col-12">
                      <input
                        type="url"
                        className="form-control"
                        placeholder="GitHub URL (optional)"
                        value={newProject.github}
                        onChange={(e) => setNewProject((p) => ({ ...p, github: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="btn btn-secondary rounded-pill btn-sm"
                      onClick={() => setAddingProject(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary rounded-pill btn-sm fw-semibold"
                      onClick={handleAddProject}
                    >
                      Save Project
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="d-flex flex-column gap-3">
              {projects.map((prj, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-4 border d-flex justify-content-between align-items-start"
                  style={{ borderColor: "var(--border)" }}
                >
                  <div>
                    <h6 className="fw-bold mb-1">{prj.name}</h6>
                    <span className="badge bg-primary-subtle text-primary rounded-pill px-3 py-1 fw-semibold small mb-2 d-inline-block">
                      {prj.stack}
                    </span>
                    <p className="text-muted small mb-0">{prj.desc}</p>
                  </div>
                  <div className="d-flex gap-2">
                    {prj.github && (
                      <a
                        href={prj.github}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-sm btn-outline-dark rounded-pill px-3 d-flex align-items-center gap-1"
                      >
                        <GitBranch size={13} /> Code
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteProject(idx)}
                      className="btn btn-sm btn-outline-danger rounded-circle p-2"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Content 5: Certifications */}
        {activeTab === "certifications" && (
          <div
            className="card border-0 rounded-4 shadow-sm p-4"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h6 className="fw-bold mb-0 d-flex align-items-center gap-2">
                <Award size={18} className="text-primary" /> Verified Certifications
              </h6>
              <button
                type="button"
                onClick={() => setAddingCert(true)}
                className="btn btn-outline-primary rounded-pill btn-sm fw-semibold d-flex align-items-center gap-1"
              >
                <Plus size={14} /> Add Certificate
              </button>
            </div>

            <AnimatePresence>
              {addingCert && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 rounded-4 mb-4 border"
                  style={{ borderColor: "#0d6efd" }}
                >
                  <div className="row g-2 mb-3">
                    <div className="col-md-6">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Certificate Title"
                        value={newCert.name}
                        onChange={(e) => setNewCert((p) => ({ ...p, name: e.target.value }))}
                      />
                    </div>
                    <div className="col-md-4">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Issuer (e.g. AWS, Meta)"
                        value={newCert.issuer}
                        onChange={(e) => setNewCert((p) => ({ ...p, issuer: e.target.value }))}
                      />
                    </div>
                    <div className="col-md-2">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Year (e.g. 2024)"
                        value={newCert.date}
                        onChange={(e) => setNewCert((p) => ({ ...p, date: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="btn btn-secondary rounded-pill btn-sm"
                      onClick={() => setAddingCert(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary rounded-pill btn-sm fw-semibold"
                      onClick={handleAddCert}
                    >
                      Save Certificate
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="d-flex flex-column gap-3">
              {certificates.map((cert, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-4 border d-flex justify-content-between align-items-center"
                  style={{ borderColor: "var(--border)" }}
                >
                  <div className="d-flex align-items-center gap-3">
                    <div
                      className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center"
                      style={{ width: "42px", height: "42px" }}
                    >
                      <Award size={20} />
                    </div>
                    <div>
                      <h6 className="fw-bold mb-0">{cert.name}</h6>
                      <small className="text-muted fw-semibold">
                        {cert.issuer} • Issued {cert.date}
                      </small>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteCert(idx)}
                    className="btn btn-sm btn-outline-danger rounded-circle p-2"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentProfile;
