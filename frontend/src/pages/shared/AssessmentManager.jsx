import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  Save,
  X,
  FileText,
  CheckCircle,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Edit3,
  RefreshCw,
  Zap,
  BookOpen,
  BarChart2,
  Eye,
  EyeOff,
  AlertTriangle,
  Upload,
  Check,
  Hash,
  Layers,
} from "lucide-react";
import { assessmentService, aiService } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";

const DIFFICULTY_COLOR = { Easy: "success", Medium: "warning", Hard: "danger" };
const DIFFICULTY_MARKS = { Easy: 2, Medium: 3, Hard: 4 };

const AssessmentManager = () => {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [aiForm, setAiForm] = useState({
    title: "",
    topic: "",
    difficulty: "Medium",
    count: 10,
    type: "Technical",
    durationMinutes: 30,
    status: "Published",
  });
  const [pdfFile, setPdfFile] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [lastRequestedCount, setLastRequestedCount] = useState(null);
  const [expandedQ, setExpandedQ] = useState(null);
  const [showAnswers, setShowAnswers] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const res = await assessmentService.getMyAssessments();
      setAssessments(res.data.data || []);
    } catch (err) {
      setAssessments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setAiForm({
      title: "",
      topic: "",
      difficulty: "Medium",
      count: 10,
      type: "Technical",
      durationMinutes: 30,
      status: "Published",
    });
    setPdfFile(null);
    setGeneratedQuestions([]);
    setLastRequestedCount(null);
    setAiError(null);
    setSaveSuccess(false);
    setShowModal(true);
  };

  const handleGenerate = async () => {
    if (!aiForm.title.trim() || !aiForm.topic.trim()) {
      setAiError("Please fill in both the Assessment Title and Topic fields.");
      return;
    }
    setAiLoading(true);
    setAiError(null);
    setLastRequestedCount(aiForm.count);
    setGeneratedQuestions([]);
    try {
      let payload;
      if (pdfFile) {
        payload = new FormData();
        payload.append("title", aiForm.title);
        payload.append("topic", aiForm.topic);
        payload.append("difficulty", aiForm.difficulty);
        payload.append("count", aiForm.count);
        payload.append("pdf", pdfFile);
      } else {
        payload = {
          title: aiForm.title,
          topic: aiForm.topic,
          difficulty: aiForm.difficulty,
          count: aiForm.count,
        };
      }

      const res = await aiService.generateAssessment(payload);
      setGeneratedQuestions(res.data.data?.questions || []);
    } catch (err) {
      setAiError(
        err?.response?.data?.message ||
          err?.message ||
          "AI generation failed. Please try again.",
      );
    } finally {
      setAiLoading(false);
    }
  };

  const handleDeleteQuestion = (idx) => {
    setGeneratedQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleEditQuestionText = (idx, val) => {
    setGeneratedQuestions((prev) =>
      prev.map((q, i) => (i === idx ? { ...q, text: val } : q)),
    );
  };

  const handleEditOption = (qIdx, oIdx, val) => {
    setGeneratedQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIdx) return q;
        return {
          ...q,
          options: q.options.map((o, j) =>
            j === oIdx ? { ...o, text: val } : o,
          ),
        };
      }),
    );
  };

  const handleSetCorrect = (qIdx, oIdx) => {
    setGeneratedQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIdx) return q;
        return {
          ...q,
          options: q.options.map((o, j) => ({ ...o, isCorrect: j === oIdx })),
        };
      }),
    );
  };

  const handleSave = async () => {
    if (generatedQuestions.length === 0) {
      setAiError("Generate at least 1 question before saving.");
      return;
    }
    setSaving(true);
    try {
      const totalMarks = generatedQuestions.reduce(
        (sum, q) => sum + (q.marks || DIFFICULTY_MARKS[aiForm.difficulty]),
        0,
      );
      const payload = {
        title: aiForm.title,
        type: aiForm.type,
        difficulty: aiForm.difficulty,
        durationMinutes: aiForm.durationMinutes,
        status: aiForm.status,
        totalMarks,
        passingPercentage: 60,
        description: `AI-generated ${aiForm.difficulty} assessment on: ${aiForm.topic}.`,
        questions: generatedQuestions.map((q) => ({
          content: q.text,
          type: "MCQ",
          marks: q.marks || DIFFICULTY_MARKS[aiForm.difficulty],
          options: q.options,
        })),
      };
      await assessmentService.create(payload);
      setSaveSuccess(true);
      fetchAssessments();
      setTimeout(() => {
        setShowModal(false);
        setSaveSuccess(false);
      }, 1500);
    } catch (err) {
      setAiError("Failed to save assessment. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this assessment?")) {
      await assessmentService.delete(id);
      fetchAssessments();
    }
  };

  return (
    <div className="container-fluid py-4 px-xl-5">
      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-4 mb-5">
        <div>
          <div className="d-flex align-items-center gap-3 mb-2">
            <div
              className="d-flex align-items-center justify-content-center rounded-4 shadow-sm"
              style={{
                width: "52px",
                height: "52px",
                background: "linear-gradient(135deg, rgba(79, 70, 229, 0.15) 0%, rgba(124, 58, 237, 0.1) 100%)",
                border: "1.5px solid rgba(124, 58, 237, 0.2)",
                color: "#6366f1",
              }}
            >
              <BookOpen size={28} strokeWidth={2.3} />
            </div>
            <motion.h1
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="fw-black mb-0"
              style={{
                fontSize: "2.35rem",
                letterSpacing: "-0.02em",
                color: "var(--text, #0f172a)",
              }}
            >
              Assessment <span style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Manager</span>
            </motion.h1>
          </div>
          <p className="text-muted fw-medium mb-0 ms-1" style={{ fontSize: "1rem" }}>
            Use AI to instantly generate complete, proctored assessments.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleOpenModal}
          className="btn rounded-pill px-4 py-2.5 d-flex align-items-center gap-2 fw-bold text-white shadow-sm"
          style={{
            background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
            border: "none",
            fontSize: "0.95rem",
            boxShadow: "0 4px 14px rgba(99, 102, 241, 0.35)",
          }}
        >
          <Sparkles size={18} />
          <span>Generate AI Assessment</span>
        </motion.button>
      </div>

      {/* Assessment Grid */}
      {loading ? (
        <div className="row g-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div className="col-md-6 col-xl-4" key={i}>
              <div
                className="card border-0 rounded-4 p-4 shadow-xs"
                style={{
                  background: "#ffffff",
                  border: "1.5px solid #edf2f7",
                  borderRadius: "22px",
                  minHeight: "220px",
                }}
              >
                <div className="d-flex justify-content-between mb-3">
                  <span className="placeholder col-3 py-2 rounded-pill" />
                  <span className="placeholder col-2 py-2 rounded-pill" />
                </div>
                <div className="placeholder col-9 mb-2 py-2 rounded" />
                <div className="placeholder col-11 mb-4 rounded" />
                <div className="placeholder col-12 pt-3 border-top mt-auto rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="row g-4">
          {assessments.map((a, idx) => {
            const diffStyle = {
              Easy: { bg: "#ecfdf5", color: "#059669", border: "#a7f3d0" },
              Medium: { bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
              Hard: { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
            }[a.difficulty || "Medium"] || { bg: "#f1f5f9", color: "#64748b", border: "#cbd5e1" };

            const isPub = a.status === "Published";

            return (
              <div className="col-md-6 col-xl-4" key={a._id || idx}>
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.25 }}
                  className="card border-0 h-100 p-4 d-flex flex-column transition-all hover-lift"
                  style={{
                    background: "var(--card, #ffffff)",
                    borderRadius: "22px",
                    border: "1.5px solid #edf2f6",
                    boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.04), 0 2px 6px -1px rgba(0, 0, 0, 0.02)",
                  }}
                >
                  {/* Card Header: Difficulty, Status, Delete */}
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span
                      className="badge rounded-pill fw-bold"
                      style={{
                        background: diffStyle.bg,
                        color: diffStyle.color,
                        border: `1px solid ${diffStyle.border}`,
                        fontSize: "0.78rem",
                        padding: "5px 12px",
                      }}
                    >
                      {a.difficulty || "Medium"}
                    </span>
                    <div className="d-flex gap-2 align-items-center">
                      <span
                        className="badge rounded-pill fw-semibold"
                        style={{
                          background: isPub ? "#f0fdf4" : "#f8fafc",
                          color: isPub ? "#16a34a" : "#64748b",
                          border: `1px solid ${isPub ? "#bbf7d0" : "#e2e8f0"}`,
                          fontSize: "0.76rem",
                          padding: "4px 10px",
                        }}
                      >
                        {a.status || "Draft"}
                      </span>
                      <button
                        onClick={() => handleDelete(a._id)}
                        className="btn btn-sm btn-link text-danger p-1 rounded-circle hover-bg opacity-75 hover-opacity-100"
                        title="Delete assessment"
                        style={{ textDecoration: "none" }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h5
                    className="fw-bold mb-2"
                    style={{
                      color: "var(--text, #0f172a)",
                      fontSize: "1.12rem",
                      letterSpacing: "-0.01em",
                      lineHeight: "1.4",
                    }}
                  >
                    {a.title}
                  </h5>
                  <p
                    className="text-muted small mb-4 flex-grow-1"
                    style={{
                      fontSize: "0.86rem",
                      lineHeight: "1.5",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {a.description || a.topic || "AI-generated assessment covering core concepts and problem solving."}
                  </p>

                  {/* Divider & Metadata Footer */}
                  <div
                    className="d-flex align-items-center justify-content-between pt-3 mt-auto"
                    style={{ borderTop: "1px solid #f1f5f9" }}
                  >
                    <span className="d-flex align-items-center gap-1.5 text-muted small fw-semibold">
                      <FileText size={15} className="text-primary" />
                      <span>{a.questions?.length || a.totalQuestions || 0} Questions</span>
                    </span>
                    <span className="d-flex align-items-center gap-1.5 text-muted small fw-semibold">
                      <Clock size={15} className="text-secondary" />
                      <span>{a.durationMinutes || a.duration || 30} mins</span>
                    </span>
                    <span className="d-flex align-items-center gap-1.5 text-muted small fw-semibold">
                      <BarChart2 size={15} className="text-success" />
                      <span>{a.totalMarks || (a.questions?.length ? a.questions.length * 2 : 100)} Marks</span>
                    </span>
                  </div>
                </motion.div>
              </div>
            );
          })}

          {assessments.length === 0 && (
            <div className="col-12 py-5 text-center">
              <div
                className="card border-0 rounded-4 p-5 mx-auto text-center"
                style={{
                  maxWidth: "520px",
                  background: "#ffffff",
                  border: "1.5px dashed #cbd5e1",
                  borderRadius: "24px",
                }}
              >
                <Sparkles size={56} className="text-primary opacity-30 mx-auto mb-3" />
                <h4 className="fw-bold mb-1">No Assessments Yet</h4>
                <p className="text-muted small mb-4">
                  Create proctored quizzes and technical challenges with our AI generator.
                </p>
                <button
                  type="button"
                  onClick={handleOpenModal}
                  className="btn btn-primary rounded-pill px-4 py-2.5 fw-bold mx-auto d-inline-flex align-items-center gap-2 shadow-sm"
                  style={{
                    background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                    border: "none",
                  }}
                >
                  <Sparkles size={16} />
                  <span>Generate Your First Assessment</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* AI Generate Assessment Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            {/* Modal Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.65 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(15, 23, 42, 0.75)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                zIndex: 1040,
              }}
            />

            {/* Modal Dialog Window */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 1050,
                overflowY: "auto",
                padding: "2rem 1rem",
              }}
            >
              <div
                className="mx-auto"
                style={{
                  maxWidth: "960px",
                  width: "100%",
                }}
              >
                <div
                  className="rounded-4 overflow-hidden shadow-2xl border"
                  style={{
                    background: "var(--surface)",
                    borderColor: "var(--border)",
                    color: "var(--text)",
                  }}
                >
                  {/* Modal Header */}
                  <div
                    className="p-4 px-md-5 border-bottom d-flex justify-content-between align-items-center"
                    style={{
                      background: "var(--surface-2, var(--surface))",
                      borderColor: "var(--border)",
                    }}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <div
                        className="p-2.5 rounded-3 d-flex align-items-center justify-content-center text-white shadow-sm flex-shrink-0"
                        style={{
                          background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                          width: "44px",
                          height: "44px",
                        }}
                      >
                        <Sparkles size={22} />
                      </div>
                      <div>
                        <h4
                          className="fw-black mb-0 text-body"
                          style={{ letterSpacing: "-0.01em" }}
                        >
                          AI Assessment Generator
                        </h4>
                        <p className="text-muted small mb-0 mt-0.5">
                          Powered by Gemma 4 — Generate complete, proctored MCQ tests in seconds
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="btn btn-sm rounded-circle p-1.5 text-muted hover-bg border-0 ms-auto"
                      aria-label="Close modal"
                      title="Close modal"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="p-4 px-md-5">
                    {/* A. Assessment Configuration Form */}
                    <div
                      className="p-4 rounded-4 mb-4"
                      style={{
                        background: "var(--surface-2, var(--bg-secondary))",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <h6
                        className="fw-bold mb-3 d-flex align-items-center gap-2 text-muted text-uppercase"
                        style={{ fontSize: "0.75rem", letterSpacing: "0.06em" }}
                      >
                        <Zap size={14} className="text-primary" /> Assessment Configuration
                      </h6>

                      <div className="row g-3">
                        {/* Assessment Title (Full Width) */}
                        <div className="col-12">
                          <label className="form-label fw-bold small mb-1.5" style={{ color: "#0f172a" }}>
                            Assessment Title <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control rounded-3"
                            style={{
                              borderColor: "#cbd5e1",
                              height: "42px",
                              backgroundColor: "#ffffff",
                              color: "#0f172a",
                              fontWeight: "500",
                              boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                            }}
                            placeholder="e.g. React & Modern Frontend Engineering Core Test"
                            value={aiForm.title}
                            onChange={(e) =>
                              setAiForm((p) => ({
                                ...p,
                                title: e.target.value,
                              }))
                            }
                          />
                        </div>

                        {/* Topic / Subject (Full Width) */}
                        <div className="col-12">
                          <label className="form-label fw-bold small mb-1.5" style={{ color: "#0f172a" }}>
                            Topic / Subject <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control rounded-3"
                            style={{
                              borderColor: "#cbd5e1",
                              height: "42px",
                              backgroundColor: "#ffffff",
                              color: "#0f172a",
                              fontWeight: "500",
                              boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                            }}
                            placeholder="e.g. React Hooks, Virtual DOM, Closures, REST API Integration"
                            value={aiForm.topic}
                            onChange={(e) =>
                              setAiForm((p) => ({
                                ...p,
                                topic: e.target.value,
                              }))
                            }
                          />
                        </div>

                        {/* Reference Material (Full Width PDF) */}
                        <div className="col-12">
                          <label className="form-label fw-bold small mb-1.5 d-flex align-items-center justify-content-between" style={{ color: "#0f172a" }}>
                            <span className="d-flex align-items-center gap-1.5">
                              <FileText size={15} className="text-primary" />
                              <span>Reference Material (Optional PDF)</span>
                            </span>
                            {pdfFile && (
                              <span className="badge bg-success-subtle text-success small d-flex align-items-center gap-1">
                                <Check size={12} /> {pdfFile.name} ({(pdfFile.size / 1024).toFixed(0)} KB)
                              </span>
                            )}
                          </label>
                          <div className="d-flex align-items-center gap-2">
                            <input
                              type="file"
                              accept=".pdf"
                              id="assessment-pdf-input"
                              className="form-control rounded-3"
                              style={{
                                borderColor: "#cbd5e1",
                                height: "42px",
                                backgroundColor: "#ffffff",
                                color: "#0f172a",
                                fontWeight: "500",
                                boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                              }}
                              onChange={(e) => setPdfFile(e.target.files[0] || null)}
                            />
                            {pdfFile && (
                              <button
                                type="button"
                                onClick={() => {
                                  setPdfFile(null);
                                  const input = document.getElementById("assessment-pdf-input");
                                  if (input) input.value = "";
                                }}
                                className="btn btn-outline-danger rounded-3 px-3 d-flex align-items-center gap-1 flex-shrink-0"
                                style={{ height: "42px" }}
                                title="Remove PDF file"
                              >
                                <X size={15} />
                                <span className="small d-none d-sm-inline">Remove</span>
                              </button>
                            )}
                          </div>
                          <small className="text-muted d-block mt-1" style={{ fontSize: "0.78rem" }}>
                            Upload syllabus, course slides, or hiring rubric PDF to generate questions specifically from source text.
                          </small>
                        </div>

                        {/* Difficulty Buttons */}
                        <div className="col-12 col-lg-5 col-md-6">
                          <label className="form-label fw-bold small mb-1.5 d-flex align-items-center gap-1.5" style={{ color: "#0f172a" }}>
                            <Layers size={15} className="text-warning" />
                            <span>Difficulty Level</span>
                          </label>
                          <div className="d-flex gap-2 w-100">
                            {[
                              {
                                level: "Easy",
                                color: "#059669",
                                bg: "rgba(16, 185, 129, 0.12)",
                                border: "#10b981",
                              },
                              {
                                level: "Medium",
                                color: "#d97706",
                                bg: "rgba(245, 158, 11, 0.12)",
                                border: "#f59e0b",
                              },
                              {
                                level: "Hard",
                                color: "#dc2626",
                                bg: "rgba(239, 68, 68, 0.12)",
                                border: "#ef4444",
                              },
                            ].map(({ level, color, bg, border }) => {
                              const isSelected = aiForm.difficulty === level;
                              return (
                                <button
                                  key={level}
                                  type="button"
                                  onClick={() => setAiForm((p) => ({ ...p, difficulty: level }))}
                                  className="btn flex-fill py-2 px-2 rounded-3 fw-bold small transition-fast d-flex align-items-center justify-content-center gap-1.5"
                                  style={{
                                    height: "42px",
                                    background: isSelected ? bg : "#ffffff",
                                    color: isSelected ? color : "#334155",
                                    border: `1.5px solid ${isSelected ? border : "#cbd5e1"}`,
                                    boxShadow: isSelected ? `0 2px 8px ${bg}` : "0 1px 2px rgba(0,0,0,0.04)",
                                    fontSize: "0.85rem",
                                  }}
                                >
                                  {isSelected && (
                                    <span
                                      style={{
                                        width: 6,
                                        height: 6,
                                        borderRadius: "50%",
                                        background: color,
                                      }}
                                    />
                                  )}
                                  <span>{level}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Number of Questions */}
                        <div className="col-6 col-lg-3 col-md-6">
                          <label className="form-label fw-bold small mb-1.5 d-flex align-items-center gap-1.5" style={{ color: "#0f172a" }}>
                            <Hash size={15} className="text-primary" />
                            <span>Number of Questions</span>
                          </label>
                          <select
                            className="form-select rounded-3"
                            style={{
                              borderColor: "#cbd5e1",
                              height: "42px",
                              backgroundColor: "#ffffff",
                              color: "#0f172a",
                              WebkitTextFillColor: "#0f172a",
                              colorScheme: "light",
                              fontWeight: "600",
                              boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                            }}
                            value={aiForm.count}
                            onChange={(e) =>
                              setAiForm((p) => ({
                                ...p,
                                count: +e.target.value,
                              }))
                            }
                          >
                            {[5, 10, 15, 20, 25, 30].map((n) => (
                              <option
                                key={n}
                                value={n}
                                style={{
                                  backgroundColor: "#ffffff",
                                  color: "#0f172a",
                                  WebkitTextFillColor: "#0f172a",
                                  colorScheme: "light",
                                  fontWeight: "600"
                                }}
                              >
                                {n} Questions
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Duration with Minutes Label */}
                        <div className="col-6 col-lg-4 col-md-12">
                          <label className="form-label fw-bold small mb-1.5 d-flex align-items-center gap-1.5" style={{ color: "#0f172a" }}>
                            <Clock size={15} className="text-info" />
                            <span>Duration</span>
                          </label>
                          <div className="input-group">
                            <input
                              type="number"
                              min={5}
                              max={180}
                              step={5}
                              className="form-control rounded-start-3"
                              style={{
                                borderColor: "#cbd5e1",
                                height: "42px",
                                backgroundColor: "#ffffff",
                                color: "#0f172a",
                                fontWeight: "600",
                                boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                              }}
                              value={aiForm.durationMinutes}
                              onChange={(e) =>
                                setAiForm((p) => ({
                                  ...p,
                                  durationMinutes: +e.target.value,
                                }))
                              }
                            />
                            <span
                              className="input-group-text small fw-bold rounded-end-3"
                              style={{
                                borderColor: "#cbd5e1",
                                backgroundColor: "#f1f5f9",
                                color: "#1e293b"
                              }}
                            >
                              minutes
                            </span>
                          </div>
                        </div>

                        {/* Assessment Type & Publish Status */}
                        <div className="col-12 col-md-6">
                          <label className="form-label fw-bold small mb-1.5 d-flex align-items-center gap-1.5" style={{ color: "#0f172a" }}>
                            <BookOpen size={15} className="text-primary" />
                            <span>Assessment Type</span>
                          </label>
                          <select
                            className="form-select rounded-3"
                            style={{
                              borderColor: "#cbd5e1",
                              height: "42px",
                              backgroundColor: "#ffffff",
                              color: "#0f172a",
                              WebkitTextFillColor: "#0f172a",
                              colorScheme: "light",
                              fontWeight: "600",
                              boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                            }}
                            value={aiForm.type}
                            onChange={(e) => setAiForm((p) => ({ ...p, type: e.target.value }))}
                          >
                            <option value="Technical" style={{ backgroundColor: "#ffffff", color: "#0f172a", WebkitTextFillColor: "#0f172a", colorScheme: "light", fontWeight: "600" }}>Technical</option>
                            <option value="Aptitude" style={{ backgroundColor: "#ffffff", color: "#0f172a", WebkitTextFillColor: "#0f172a", colorScheme: "light", fontWeight: "600" }}>Aptitude</option>
                            <option value="Coding" style={{ backgroundColor: "#ffffff", color: "#0f172a", WebkitTextFillColor: "#0f172a", colorScheme: "light", fontWeight: "600" }}>Coding</option>
                            <option value="Domain Specific" style={{ backgroundColor: "#ffffff", color: "#0f172a", WebkitTextFillColor: "#0f172a", colorScheme: "light", fontWeight: "600" }}>Domain Specific</option>
                          </select>
                        </div>

                        <div className="col-12 col-md-6">
                          <label className="form-label fw-bold small mb-1.5 d-flex align-items-center gap-1.5" style={{ color: "#0f172a" }}>
                            <CheckCircle size={15} className="text-success" />
                            <span>Publish Status</span>
                          </label>
                          <select
                            className="form-select rounded-3"
                            style={{
                              borderColor: "#cbd5e1",
                              height: "42px",
                              backgroundColor: "#ffffff",
                              color: "#0f172a",
                              WebkitTextFillColor: "#0f172a",
                              colorScheme: "light",
                              fontWeight: "600",
                              boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                            }}
                            value={aiForm.status}
                            onChange={(e) =>
                              setAiForm((p) => ({
                                ...p,
                                status: e.target.value,
                              }))
                            }
                          >
                            <option value="Published" style={{ backgroundColor: "#ffffff", color: "#0f172a", WebkitTextFillColor: "#0f172a", colorScheme: "light", fontWeight: "600" }}>Published (Live for Candidates)</option>
                            <option value="Draft" style={{ backgroundColor: "#ffffff", color: "#0f172a", WebkitTextFillColor: "#0f172a", colorScheme: "light", fontWeight: "600" }}>Draft (Private)</option>
                          </select>
                        </div>

                        {/* Error Alert */}
                        {aiError && (
                          <div className="col-12">
                            <div className="alert alert-danger mb-0 py-2.5 px-3 rounded-3 small fw-semibold d-flex align-items-center gap-2 border-0 bg-danger-subtle text-danger">
                              <X size={16} className="flex-shrink-0" />
                              <span>{aiError}</span>
                            </div>
                          </div>
                        )}

                        {/* Generate Questions Button (Properly sized & aligned beneath) */}
                        <div className="col-12 pt-2">
                          <button
                            type="button"
                            onClick={handleGenerate}
                            disabled={aiLoading}
                            className="btn btn-primary w-100 py-3 rounded-pill fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2 hover-lift"
                            style={{
                              background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                              border: "none",
                              fontSize: "0.95rem",
                              letterSpacing: "0.01em",
                            }}
                          >
                            {aiLoading ? (
                              <>
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                                <span>Generating {aiForm.count} Questions with Gemma AI...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles size={18} />
                                <span>Generate {aiForm.count} Questions with AI</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* B. Generated Questions Preview Section */}
                    <AnimatePresence>
                      {generatedQuestions.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -15 }}
                          className="pt-2"
                        >
                          {/* Heading & Regenerate Action */}
                          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-3">
                            <div>
                              <h5 className="fw-black mb-1 d-flex align-items-center gap-2 text-body" style={{ letterSpacing: "-0.01em" }}>
                                <CheckCircle size={20} className="text-success flex-shrink-0" />
                                <span>{generatedQuestions.length} Questions Generated — Review & Edit Below</span>
                              </h5>
                              <p className="text-muted small mb-0">
                                Review questions, toggle answer visibility, customize options, or set correct answer keys.
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={handleGenerate}
                              disabled={aiLoading}
                              className="btn btn-sm btn-outline-secondary rounded-pill fw-bold d-flex align-items-center gap-1.5 px-3 py-1.5 flex-shrink-0 hover-lift"
                            >
                              <RefreshCw size={14} className={aiLoading ? "spin" : ""} />
                              <span>Regenerate</span>
                            </button>
                          </div>

                          {/* Count Notice Banner (Section D) */}
                          {lastRequestedCount && lastRequestedCount !== generatedQuestions.length && (
                            <div
                              className="p-3 rounded-3 mb-3 d-flex align-items-center justify-content-between flex-wrap gap-2"
                              style={{
                                background: "rgba(245, 158, 11, 0.1)",
                                border: "1px solid rgba(245, 158, 11, 0.3)",
                                color: "#d97706",
                              }}
                            >
                              <div className="d-flex align-items-center gap-2 small fw-semibold">
                                <AlertTriangle size={17} className="flex-shrink-0" />
                                <span>
                                  Requested <strong>{lastRequestedCount}</strong> questions; <strong>{generatedQuestions.length}</strong> were generated.
                                </span>
                              </div>
                              <span
                                className="badge rounded-pill fw-bold text-uppercase"
                                style={{
                                  background: "rgba(245, 158, 11, 0.2)",
                                  color: "#b45309",
                                  fontSize: "0.68rem",
                                }}
                              >
                                Actual Count Displayed
                              </span>
                            </div>
                          )}

                          {/* Questions List (No nested scrollbar, natural page flow) */}
                          <div className="d-flex flex-column gap-3 mb-4">
                            {generatedQuestions.map((q, idx) => {
                              const isExpanded = expandedQ === idx;
                              const isAnswersVisible = !!showAnswers[idx];

                              return (
                                <motion.div
                                  key={idx}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: idx * 0.03 }}
                                  className="p-3.5 p-md-4 rounded-4 position-relative hover-glow"
                                  style={{
                                    background: "var(--surface)",
                                    border: isExpanded ? "1.5px solid var(--primary, #6366f1)" : "1px solid var(--border)",
                                    boxShadow: isExpanded ? "0 4px 20px rgba(99, 102, 241, 0.08)" : "0 2px 8px rgba(0,0,0,0.02)",
                                    transition: "all 0.2s ease",
                                  }}
                                >
                                  {/* Card Header: Meta Badges & Actions */}
                                  <div className="d-flex justify-content-between align-items-center gap-2 mb-2.5 flex-wrap">
                                    <div className="d-flex align-items-center gap-2 flex-wrap">
                                      <span
                                        className="badge rounded-pill fw-bold"
                                        style={{
                                          background: "rgba(99, 102, 241, 0.12)",
                                          color: "var(--primary, #4f46e5)",
                                          fontSize: "0.74rem",
                                          padding: "5px 10px",
                                        }}
                                      >
                                        Question {idx + 1}
                                      </span>
                                      <span
                                        className="badge rounded-pill fw-semibold bg-secondary-subtle text-secondary"
                                        style={{ fontSize: "0.7rem", padding: "4px 8px" }}
                                      >
                                        {q.type || "MCQ"}
                                      </span>
                                      <span
                                        className="badge rounded-pill fw-medium border bg-light-subtle text-body-secondary"
                                        style={{ fontSize: "0.7rem", padding: "4px 8px" }}
                                      >
                                        {q.marks || DIFFICULTY_MARKS[aiForm.difficulty]} marks
                                      </span>
                                    </div>

                                    {/* Action Buttons: View, Edit, Delete */}
                                    <div className="d-flex align-items-center gap-1.5 flex-shrink-0 ms-auto">
                                      <button
                                        type="button"
                                        onClick={() => setShowAnswers((p) => ({ ...p, [idx]: !p[idx] }))}
                                        className={`btn btn-sm rounded-pill px-2.5 py-1 d-flex align-items-center gap-1.5 small fw-semibold border-0 ${
                                          isAnswersVisible ? "bg-success-subtle text-success" : "text-muted hover-bg"
                                        }`}
                                        title={isAnswersVisible ? "Hide Answer Key" : "View Answer Key"}
                                      >
                                        {isAnswersVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                                        <span className="small d-none d-sm-inline">
                                          {isAnswersVisible ? "Hide Answer" : "View Answer"}
                                        </span>
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => setExpandedQ(isExpanded ? null : idx)}
                                        className={`btn btn-sm rounded-pill px-2.5 py-1 d-flex align-items-center gap-1.5 small fw-semibold border-0 ${
                                          isExpanded ? "bg-primary-subtle text-primary" : "text-muted hover-bg"
                                        }`}
                                        title={isExpanded ? "Done Editing" : "Edit Question"}
                                      >
                                        <Edit3 size={14} />
                                        <span className="small d-none d-sm-inline">
                                          {isExpanded ? "Done" : "Edit"}
                                        </span>
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => handleDeleteQuestion(idx)}
                                        className="btn btn-sm rounded-pill px-2 py-1 text-danger hover-bg border-0"
                                        title="Delete Question"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Complete Question Text Without Clipping */}
                                  <div className="mb-3">
                                    {isExpanded ? (
                                      <div>
                                        <label className="form-label small fw-bold text-dark mb-1">
                                          Question Prompt:
                                        </label>
                                        <textarea
                                          className="form-control rounded-3 fw-semibold"
                                          style={{
                                            borderColor: "#cbd5e1",
                                            backgroundColor: "#ffffff",
                                            color: "#0f172a",
                                            fontSize: "0.92rem",
                                            lineHeight: "1.55",
                                            minHeight: "75px",
                                            resize: "vertical",
                                          }}
                                          value={q.text}
                                          onChange={(e) => handleEditQuestionText(idx, e.target.value)}
                                          placeholder="Enter question prompt..."
                                        />
                                      </div>
                                    ) : (
                                      <div
                                        className="fw-bold"
                                        style={{
                                          color: "#0f172a",
                                          fontSize: "0.95rem",
                                          lineHeight: "1.55",
                                          wordBreak: "break-word",
                                          whiteSpace: "pre-wrap",
                                        }}
                                      >
                                        {q.text}
                                      </div>
                                    )}
                                  </div>

                                  {/* Answer Options */}
                                  <div className="d-flex flex-column gap-2 ps-1 ps-md-2">
                                    {q.options?.map((opt, oIdx) => {
                                      const letter = String.fromCharCode(65 + oIdx);
                                      const isCorrect = !!opt.isCorrect;
                                      const shouldHighlight = isCorrect && isAnswersVisible;

                                      return (
                                        <div
                                          key={oIdx}
                                          className="d-flex align-items-center gap-2.5"
                                          style={{ width: "100%" }}
                                        >
                                          {/* Correct Option Radio Button */}
                                          <button
                                            type="button"
                                            onClick={() => handleSetCorrect(idx, oIdx)}
                                            className={`btn btn-sm rounded-circle p-0 flex-shrink-0 d-flex align-items-center justify-content-center transition-fast ${
                                              isCorrect ? "btn-success" : "btn-outline-secondary"
                                            }`}
                                            style={{
                                              width: 24,
                                              height: 24,
                                              borderWidth: isCorrect ? "0" : "1.5px",
                                            }}
                                            title="Click to mark as correct answer"
                                          >
                                            {isCorrect ? (
                                              <CheckCircle size={14} strokeWidth={2.5} />
                                            ) : (
                                              <span style={{ fontSize: "0.7rem", fontWeight: "700" }}>{letter}</span>
                                            )}
                                          </button>

                                          {/* Option Content: Edit or View */}
                                          {isExpanded ? (
                                            <div className="input-group input-group-sm flex-grow-1">
                                              <span
                                                className="input-group-text fw-bold"
                                                style={{ minWidth: 34, backgroundColor: "#f1f5f9", color: "#334155" }}
                                              >
                                                {letter}
                                              </span>
                                              <input
                                                type="text"
                                                className="form-control"
                                                style={{ backgroundColor: "#ffffff", color: "#0f172a", borderColor: "#cbd5e1" }}
                                                value={opt.text}
                                                onChange={(e) => handleEditOption(idx, oIdx, e.target.value)}
                                                placeholder={`Option ${letter}...`}
                                              />
                                            </div>
                                          ) : (
                                            <div
                                              onClick={() => handleSetCorrect(idx, oIdx)}
                                              className="p-2.5 rounded-3 d-flex align-items-center gap-2.5 flex-grow-1 transition-fast cursor-pointer"
                                              style={{
                                                wordBreak: "break-word",
                                                lineHeight: "1.45",
                                                fontSize: "0.875rem",
                                                backgroundColor: shouldHighlight ? "rgba(16, 185, 129, 0.12)" : "#f8fafc",
                                                color: shouldHighlight ? "#065f46" : "#0f172a",
                                                border: shouldHighlight ? "1px solid #10b981" : "1px solid #e2e8f0",
                                                fontWeight: shouldHighlight ? "600" : "500"
                                              }}
                                            >
                                              <span className="fw-bold opacity-75">{letter}.</span>
                                              <span className="flex-grow-1">{opt.text}</span>
                                              {shouldHighlight && (
                                                <span
                                                  className="badge bg-success text-white rounded-pill px-2 py-0.5 fw-bold"
                                                  style={{ fontSize: "0.68rem" }}
                                                >
                                                  Correct Answer
                                                </span>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>

                          {/* Save Bar */}
                          <div
                            className="d-flex flex-column flex-sm-row justify-content-between align-items-stretch align-items-sm-center p-3.5 rounded-4 gap-3 mt-4"
                            style={{
                              background: "var(--surface-2, var(--surface))",
                              border: "1px solid var(--border)",
                              boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
                            }}
                          >
                            <div>
                              <div className="fw-black text-body" style={{ fontSize: "1.05rem" }}>
                                {generatedQuestions.length} Questions Ready
                              </div>
                              <div className="text-muted small mt-0.5">
                                • {generatedQuestions.reduce((s, q) => s + (q.marks || DIFFICULTY_MARKS[aiForm.difficulty]), 0)} total marks
                                • {aiForm.durationMinutes} minutes duration
                                • Passing mark: 60%
                              </div>
                            </div>

                            {saveSuccess ? (
                              <span className="badge bg-success rounded-pill px-4 py-2.5 fw-bold fs-6 d-flex align-items-center justify-content-center gap-1.5 shadow-sm">
                                <CheckCircle size={18} />
                                <span>Assessment Saved Successfully!</span>
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={handleSave}
                                disabled={saving}
                                className="btn btn-success fw-bold rounded-pill px-5 py-2.5 d-flex align-items-center justify-content-center gap-2 shadow-sm hover-lift"
                                style={{ minWidth: "200px" }}
                              >
                                {saving ? (
                                  <>
                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                                    <span>Saving Assessment...</span>
                                  </>
                                ) : (
                                  <>
                                    <Save size={17} />
                                    <span>Save Assessment</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AssessmentManager;
