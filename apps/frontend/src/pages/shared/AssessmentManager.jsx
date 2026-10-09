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
} from "lucide-react";
import { assessmentService, aiService } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
const DIFFICULTY_COLOR = { Easy: "success", Medium: "warning", Hard: "danger" };
const DIFFICULTY_MARKS = { Easy: 2, Medium: 3, Hard: 4 };
const AssessmentManager = () => {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false); // AI generation state
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
          count: aiForm.count
        };
      }
      
      const res = await aiService.generateAssessment(payload);
      setGeneratedQuestions(res.data.data.questions);
    } catch (err) {
      setAiError(err?.response?.data?.message || err?.message || "AI generation failed. Please try again.");
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
          content: q.text, // model uses 'content' not 'text' type: 'MCQ', marks: q.marks || DIFFICULTY_MARKS[aiForm.difficulty], options: q.options
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
      {" "}
      {/* Header */}{" "}
      <div className="d-flex justify-content-between align-items-center mb-5">
        {" "}
        <div>
          {" "}
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="fw-black mb-1 d-flex align-items-center gap-3"
            style={{
              fontSize: "2.2rem",
              letterSpacing: "-0.02em",
              color: "var(--text)",
            }}
          >
            {" "}
            <BookOpen
              size={34}
              className="text-primary"
              strokeWidth={2.5}
            />{" "}
            Assessment Manager{" "}
          </motion.h2>{" "}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-muted fw-medium mb-0"
          >
            {" "}
            Use AI to instantly generate complete, proctored assessments.{" "}
          </motion.p>{" "}
        </div>{" "}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleOpenModal}
          className="btn btn-primary fw-bold rounded-pill px-4 py-2 d-flex align-items-center gap-2 shadow-sm"
          style={{
            background:
              "linear-gradient(135deg, var(--primary), var(--purple))",
            border: "none",
          }}
        >
          {" "}
          <Sparkles size={18} /> Generate AI Assessment{" "}
        </motion.button>{" "}
      </div>{" "}
      {/* Assessment Grid */}{" "}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" />
        </div>
      ) : (
        <div className="row g-4">
          {" "}
          {assessments.map((a, idx) => (
            <div className="col-md-6 col-xl-4" key={a._id}>
              {" "}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="bento-card h-100 p-4 hover-glow d-flex flex-column"
              >
                {" "}
                <div className="d-flex justify-content-between align-items-start mb-3">
                  {" "}
                  <span
                    className={`badge bg-${DIFFICULTY_COLOR[a.difficulty] || "secondary"}-subtle text-${DIFFICULTY_COLOR[a.difficulty] || "secondary"} rounded-pill px-3 py-2 fw-bold`}
                  >
                    {" "}
                    {a.difficulty || "N/A"}{" "}
                  </span>{" "}
                  <div className="d-flex gap-2 align-items-center">
                    {" "}
                    <span
                      className={`badge bg-${a.status === "Published" ? "success" : "warning"}-subtle text-${a.status === "Published" ? "success" : "warning"} rounded-pill px-3 py-1 fw-bold`}
                    >
                      {" "}
                      {a.status}{" "}
                    </span>{" "}
                    <button
                      onClick={() => handleDelete(a._id)}
                      className="btn btn-sm btn-link text-danger p-1"
                    >
                      <Trash2 size={15} />
                    </button>{" "}
                  </div>{" "}
                </div>{" "}
                <h5
                  className="fw-black mb-2 flex-grow-1"
                  style={{ color: "var(--text)" }}
                >
                  {a.title}
                </h5>{" "}
                <p className="text-muted small mb-3">{a.description}</p>{" "}
                <div className="d-flex gap-3 mt-auto pt-3 border-top border">
                  {" "}
                  <span className="d-flex align-items-center gap-1 text-muted small fw-semibold">
                    <FileText size={14} className="text-primary" />{" "}
                    {a.questions?.length || 0} Qs
                  </span>{" "}
                  <span className="d-flex align-items-center gap-1 text-muted small fw-semibold">
                    <Clock size={14} className="text-info" />{" "}
                    {a.durationMinutes} min
                  </span>{" "}
                  <span className="d-flex align-items-center gap-1 text-muted small fw-semibold">
                    <BarChart2 size={14} className="text-success" />{" "}
                    {a.totalMarks} marks
                  </span>{" "}
                </div>{" "}
              </motion.div>{" "}
            </div>
          ))}{" "}
          {assessments.length === 0 && (
            <div className="col-12">
              {" "}
              <div
                className="bento-card d-flex flex-column align-items-center justify-content-center py-5 text-center hover-glow"
                style={{
                  minHeight: "300px",
                  border: "2px dashed var(--border)",
                }}
              >
                {" "}
                <Sparkles
                  size={64}
                  className="text-primary opacity-25 mb-4"
                  strokeWidth={1}
                />{" "}
                <h5 className="text-muted fw-bold">No Assessments Yet</h5>{" "}
                <p className="text-muted small fw-semibold mb-4">
                  Click "Generate AI Assessment" to create your first one!
                </p>{" "}
                <button
                  onClick={handleOpenModal}
                  className="btn btn-outline-primary rounded-pill px-4 fw-bold hover-scale"
                >
                  {" "}
                  <Sparkles size={16} className="me-2" /> Generate Now{" "}
                </button>{" "}
              </div>{" "}
            </div>
          )}{" "}
        </div>
      )}{" "}
      {/* AI Generate Modal */}{" "}
      <AnimatePresence>
        {" "}
        {showModal && (
          <>
            {" "}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: "#000",
                zIndex: 1040,
              }}
            />{" "}
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 30 }}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 1050,
                overflowY: "auto",
                padding: "2rem 1rem",
              }}
            >
              {" "}
              <div className="mx-auto" style={{ maxWidth: 820 }}>
                {" "}
                <div
                  className="bento-card shadow-lg"
                  style={{ border: "1px solid var(--primary)" }}
                >
                  {" "}
                  {/* Modal Header */}{" "}
                  <div className="p-4 border-bottom border d-flex justify-content-between align-items-center">
                    {" "}
                    <div className="d-flex align-items-center gap-3">
                      {" "}
                      <div
                        className="rounded-3 p-2 d-flex"
                        style={{ background: "rgba(99,102,241,0.15)" }}
                      >
                        {" "}
                        <Sparkles size={24} className="text-primary" />{" "}
                      </div>{" "}
                      <div>
                        {" "}
                        <h4
                          className="fw-black mb-0"
                          style={{ color: "var(--text)" }}
                        >
                          AI Assessment Generator
                        </h4>{" "}
                        <small className="text-muted fw-semibold">
                          Powered by Gemma 4 — Generate complete MCQ tests in
                          seconds
                        </small>{" "}
                      </div>{" "}
                    </div>{" "}
                    <button
                      onClick={() => setShowModal(false)}
                      className="btn btn-link text-muted p-1"
                    >
                      <X size={22} />
                    </button>{" "}
                  </div>{" "}
                  <div className="p-4">
                    {" "}
                    {/* Configuration Form */}{" "}
                    <div
                      className="bento-card p-4 mb-4"
                      style={{
                        background: "var(--bg-secondary)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      {" "}
                      <h6
                        className="fw-bold mb-3 d-flex align-items-center gap-2 text-muted text-uppercase"
                        style={{ fontSize: "0.75rem", letterSpacing: "0.05em" }}
                      >
                        {" "}
                        <Zap size={14} /> Assessment Configuration{" "}
                      </h6>{" "}
                      <div className="row g-3">
                        {" "}
                        <div className="col-12">
                          {" "}
                          <label className="form-label fw-semibold small">
                            Assessment Title *
                          </label>{" "}
                          <input
                            className="form-control bg-transparent text-body border rounded-3"
                            placeholder="e.g. React & Frontend Fundamentals Test"
                            value={aiForm.title}
                            onChange={(e) =>
                              setAiForm((p) => ({
                                ...p,
                                title: e.target.value,
                              }))
                            }
                          />{" "}
                        </div>{" "}
                        <div className="col-12">
                          {" "}
                          <label className="form-label fw-semibold small">
                            Topic / Subject *
                          </label>{" "}
                          <input
                            className="form-control bg-transparent text-body border rounded-3"
                            placeholder="e.g. React Hooks, JavaScript Closures, REST APIs"
                            value={aiForm.topic}
                            onChange={(e) =>
                              setAiForm((p) => ({
                                ...p,
                                topic: e.target.value,
                              }))
                            }
                          />{" "}
                        </div>{" "}
                        <div className="col-12">
                          {" "}
                          <label className="form-label fw-semibold small">
                            Reference Material (Optional PDF)
                          </label>{" "}
                          <input
                            type="file"
                            accept=".pdf"
                            className="form-control bg-transparent text-body border rounded-3"
                            onChange={(e) => setPdfFile(e.target.files[0])}
                          />{" "}
                          <small className="text-muted d-block mt-1" style={{ fontSize: "0.7rem" }}>
                            Upload syllabus or lecture notes to generate questions specifically from the material.
                          </small>
                        </div>{" "}
                        <div className="col-md-4">
                          {" "}
                          <label className="form-label fw-semibold small">
                            Difficulty
                          </label>{" "}
                          <div className="d-flex gap-2">
                            {" "}
                            {["Easy", "Medium", "Hard"].map((d) => (
                              <button
                                key={d}
                                type="button"
                                className={`btn btn-sm rounded-pill fw-bold px-3 ${aiForm.difficulty === d ? `btn-${DIFFICULTY_COLOR[d]}` : `btn-outline-${DIFFICULTY_COLOR[d]}`}`}
                                onClick={() =>
                                  setAiForm((p) => ({ ...p, difficulty: d }))
                                }
                              >
                                {" "}
                                {d}{" "}
                              </button>
                            ))}{" "}
                          </div>{" "}
                        </div>{" "}
                        <div className="col-md-4">
                          {" "}
                          <label className="form-label fw-semibold small">
                            No. of Questions
                          </label>{" "}
                          <select
                            className="form-select bg-transparent text-body border"
                            value={aiForm.count}
                            onChange={(e) =>
                              setAiForm((p) => ({
                                ...p,
                                count: +e.target.value,
                              }))
                            }
                          >
                            {" "}
                            {[5, 10, 15, 20].map((n) => (
                              <option key={n} value={n}>
                                {n} Questions
                              </option>
                            ))}{" "}
                          </select>{" "}
                        </div>{" "}
                        <div className="col-md-4">
                          {" "}
                          <label className="form-label fw-semibold small">
                            Duration (minutes)
                          </label>{" "}
                          <input
                            type="number"
                            min={5}
                            max={180}
                            className="form-control bg-transparent text-body border"
                            value={aiForm.durationMinutes}
                            onChange={(e) =>
                              setAiForm((p) => ({
                                ...p,
                                durationMinutes: +e.target.value,
                              }))
                            }
                          />{" "}
                        </div>{" "}
                        <div className="col-md-6">
                          {" "}
                          <label className="form-label fw-semibold small">
                            Assessment Type
                          </label>{" "}
                          <select
                            className="form-select bg-transparent text-body border"
                            value={aiForm.type}
                            onChange={(e) =>
                              setAiForm((p) => ({ ...p, type: e.target.value }))
                            }
                          >
                            {" "}
                            <option>Technical</option> <option>Aptitude</option>{" "}
                            <option>Coding</option>{" "}
                          </select>{" "}
                        </div>{" "}
                        <div className="col-md-6">
                          {" "}
                          <label className="form-label fw-semibold small">
                            Publish Status
                          </label>{" "}
                          <select
                            className="form-select bg-transparent text-body border"
                            value={aiForm.status}
                            onChange={(e) =>
                              setAiForm((p) => ({
                                ...p,
                                status: e.target.value,
                              }))
                            }
                          >
                            {" "}
                            <option>Published</option>{" "}
                            <option>Draft</option>{" "}
                          </select>{" "}
                        </div>{" "}
                      </div>{" "}
                      {aiError && (
                        <div className="alert alert-danger mt-3 mb-0 py-2 small fw-semibold d-flex align-items-center gap-2">
                          {" "}
                          <X size={16} /> {aiError}{" "}
                        </div>
                      )}{" "}
                      <button
                        onClick={handleGenerate}
                        disabled={aiLoading}
                        className="btn btn-primary fw-bold rounded-pill px-5 py-2 mt-3 d-flex align-items-center gap-2"
                        style={{
                          background:
                            "linear-gradient(135deg, var(--primary), var(--purple))",
                          border: "none",
                        }}
                      >
                        {" "}
                        {aiLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm" />{" "}
                            Generating with AI...
                          </>
                        ) : (
                          <>
                            <Sparkles size={18} /> Generate {aiForm.count}{" "}
                            Questions
                          </>
                        )}{" "}
                      </button>{" "}
                    </div>{" "}
                    {/* Generated Questions Preview */}{" "}
                    <AnimatePresence>
                      {" "}
                      {generatedQuestions.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          {" "}
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            {" "}
                            <h6 className="fw-bold mb-0 d-flex align-items-center gap-2">
                              {" "}
                              <CheckCircle
                                size={18}
                                className="text-success"
                              />{" "}
                              {generatedQuestions.length} Questions Generated —
                              Review & Edit Below{" "}
                            </h6>{" "}
                            <button
                              onClick={handleGenerate}
                              disabled={aiLoading}
                              className="btn btn-sm btn-outline-secondary rounded-pill fw-bold d-flex align-items-center gap-1 px-3"
                            >
                              {" "}
                              <RefreshCw size={14} /> Regenerate{" "}
                            </button>{" "}
                          </div>{" "}
                          <div
                            className="d-flex flex-column gap-3 mb-4"
                            style={{
                              maxHeight: "50vh",
                              overflowY: "auto",
                              paddingRight: 4,
                            }}
                          >
                            {" "}
                            {generatedQuestions.map((q, idx) => (
                              <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.04 }}
                                className="bento-card p-3 hover-glow"
                                style={{
                                  border: "1px solid var(--border)",
                                  borderRadius: 12,
                                }}
                              >
                                {" "}
                                <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                                  {" "}
                                  <div className="d-flex align-items-center gap-2 flex-grow-1">
                                    {" "}
                                    <span
                                      className="badge bg-primary-subtle text-primary fw-bold rounded-pill"
                                      style={{
                                        minWidth: 28,
                                        fontSize: "0.7rem",
                                      }}
                                    >
                                      Q{idx + 1}
                                    </span>{" "}
                                    <textarea
                                      className="form-control form-control-sm bg-transparent text-body border-0 fw-semibold p-0"
                                      value={q.text}
                                      onChange={(e) =>
                                        handleEditQuestionText(
                                          idx,
                                          e.target.value,
                                        )
                                      }
                                      rows={2}
                                      style={{
                                        resize: "none",
                                        fontSize: "0.9rem",
                                      }}
                                    />{" "}
                                  </div>{" "}
                                  <div className="d-flex gap-1 flex-shrink-0">
                                    {" "}
                                    <button
                                      onClick={() =>
                                        setShowAnswers((p) => ({
                                          ...p,
                                          [idx]: !p[idx],
                                        }))
                                      }
                                      className="btn btn-sm btn-link text-muted p-1"
                                      title="Toggle Answers"
                                    >
                                      {" "}
                                      {showAnswers[idx] ? (
                                        <EyeOff size={15} />
                                      ) : (
                                        <Eye size={15} />
                                      )}{" "}
                                    </button>{" "}
                                    <button
                                      onClick={() =>
                                        setExpandedQ(
                                          expandedQ === idx ? null : idx,
                                        )
                                      }
                                      className="btn btn-sm btn-link text-primary p-1"
                                      title="Edit Options"
                                    >
                                      {" "}
                                      <Edit3 size={15} />{" "}
                                    </button>{" "}
                                    <button
                                      onClick={() => handleDeleteQuestion(idx)}
                                      className="btn btn-sm btn-link text-danger p-1"
                                    >
                                      <Trash2 size={15} />
                                    </button>{" "}
                                  </div>{" "}
                                </div>{" "}
                                {/* Options */}{" "}
                                <div className="d-flex flex-column gap-1 ps-3">
                                  {" "}
                                  {q.options?.map((opt, oIdx) => (
                                    <div
                                      key={oIdx}
                                      className="d-flex align-items-center gap-2"
                                    >
                                      {" "}
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleSetCorrect(idx, oIdx)
                                        }
                                        className={`btn btn-sm rounded-circle p-0 flex-shrink-0 d-flex align-items-center justify-content-center ${opt.isCorrect ? "btn-success" : "btn-outline-secondary"}`}
                                        style={{ width: 20, height: 20 }}
                                        title="Set as correct answer"
                                      >
                                        {" "}
                                        {opt.isCorrect && (
                                          <CheckCircle size={12} />
                                        )}{" "}
                                      </button>{" "}
                                      {expandedQ === idx ? (
                                        <input
                                          className="form-control form-control-sm bg-transparent text-body border"
                                          value={opt.text}
                                          onChange={(e) =>
                                            handleEditOption(
                                              idx,
                                              oIdx,
                                              e.target.value,
                                            )
                                          }
                                        />
                                      ) : (
                                        <span
                                          className={`small fw-semibold ${opt.isCorrect && showAnswers[idx] ? "text-success" : "text-muted"}`}
                                        >
                                          {" "}
                                          {String.fromCharCode(65 + oIdx)}.{" "}
                                          {opt.text}{" "}
                                          {opt.isCorrect &&
                                            showAnswers[idx] && (
                                              <span
                                                className="ms-1 badge bg-success-subtle text-success"
                                                style={{ fontSize: "0.6rem" }}
                                              >
                                                Correct
                                              </span>
                                            )}{" "}
                                        </span>
                                      )}{" "}
                                    </div>
                                  ))}{" "}
                                </div>{" "}
                                <div className="mt-2 d-flex align-items-center gap-2">
                                  {" "}
                                  <span
                                    className="badge bg-secondary-subtle text-muted"
                                    style={{ fontSize: "0.65rem" }}
                                  >
                                    {" "}
                                    {q.marks ||
                                      DIFFICULTY_MARKS[aiForm.difficulty]}{" "}
                                    marks{" "}
                                  </span>{" "}
                                  <span
                                    className={`badge bg-${DIFFICULTY_COLOR[aiForm.difficulty]}-subtle text-${DIFFICULTY_COLOR[aiForm.difficulty]}`}
                                    style={{ fontSize: "0.65rem" }}
                                  >
                                    {" "}
                                    MCQ{" "}
                                  </span>{" "}
                                </div>{" "}
                              </motion.div>
                            ))}{" "}
                          </div>{" "}
                          {/* Save Bar */}{" "}
                          <div
                            className="d-flex justify-content-between align-items-center p-3 rounded-3"
                            style={{
                              background: "var(--bg-secondary)",
                              border: "1px solid var(--border)",
                            }}
                          >
                            {" "}
                            <div>
                              {" "}
                              <span
                                className="fw-bold"
                                style={{ color: "var(--text)" }}
                              >
                                {generatedQuestions.length} Questions
                              </span>{" "}
                              <span className="text-muted small ms-2">
                                {" "}
                                •{" "}
                                {generatedQuestions.reduce(
                                  (s, q) =>
                                    s +
                                    (q.marks ||
                                      DIFFICULTY_MARKS[aiForm.difficulty]),
                                  0,
                                )}{" "}
                                total marks • {aiForm.durationMinutes} min{" "}
                              </span>{" "}
                            </div>{" "}
                            {saveSuccess ? (
                              <span className="badge bg-success rounded-pill px-4 py-2 fw-bold fs-6">
                                {" "}
                                <CheckCircle size={16} className="me-1" />{" "}
                                Saved!{" "}
                              </span>
                            ) : (
                              <button
                                onClick={handleSave}
                                disabled={saving}
                                className="btn btn-success fw-bold rounded-pill px-4 py-2 d-flex align-items-center gap-2"
                              >
                                {" "}
                                {saving ? (
                                  <>
                                    <span className="spinner-border spinner-border-sm" />{" "}
                                    Saving...
                                  </>
                                ) : (
                                  <>
                                    <Save size={16} /> Save Assessment
                                  </>
                                )}{" "}
                              </button>
                            )}{" "}
                          </div>{" "}
                        </motion.div>
                      )}{" "}
                    </AnimatePresence>{" "}
                  </div>{" "}
                </div>{" "}
              </div>{" "}
            </motion.div>{" "}
          </>
        )}{" "}
      </AnimatePresence>{" "}
    </div>
  );
};
export default AssessmentManager;
