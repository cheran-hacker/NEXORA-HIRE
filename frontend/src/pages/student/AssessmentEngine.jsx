import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  ShieldAlert,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Send,
  Trophy,
  RotateCcw,
  Maximize2,
  Minimize2,
  AlertTriangle,
  HelpCircle,
  FileText,
  X,
  ArrowRight,
  RefreshCw,
  LogOut,
  Check,
  ShieldCheck
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { assessmentService } from "../../services/api";
import "./assessments.css";

const AssessmentEngine = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Assessment & Questions Data
  const [assessment, setAssessment] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { [questionId]: "selected option text" }

  // Status & Timing States
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Submission States
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [results, setResults] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  // Proctoring tab blur
  const [blurCount, setBlurCount] = useState(0);
  const [proctorWarning, setProctorWarning] = useState("");

  // Refs for bulletproof timers and race-condition guards
  const timerRef = useRef(null);
  const hasSubmittedRef = useRef(false);
  const containerRef = useRef(null);

  // ── 1. Fullscreen sync & listeners ──
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);

    // Initial check
    setIsFullscreen(Boolean(document.fullscreenElement));

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
          await elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) {
          await elem.webkitRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen();
        }
      }
    } catch (err) {
      console.warn("Fullscreen toggle rejected by browser:", err.message);
    }
  };

  const safeExitFullscreen = () => {
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    } catch {
      // Ignored
    }
  };

  // ── 2. Proctoring Tab-Switch Detection ──
  useEffect(() => {
    const handleVisibilityOrBlur = () => {
      if (submitted) return;
      setBlurCount((prev) => {
        const next = prev + 1;
        setProctorWarning(
          `Tab switch detected (${next} warning${next > 1 ? "s" : ""}). Please remain focused on the exam.`
        );
        return next;
      });
    };

    window.addEventListener("blur", handleVisibilityOrBlur);
    return () => {
      window.removeEventListener("blur", handleVisibilityOrBlur);
    };
  }, [submitted]);

  // ── 3. Load Assessment from Backend ──
  useEffect(() => {
    let isMounted = true;

    const loadAssessment = async () => {
      try {
        setLoading(true);
        setLoadError("");

        // Trigger start assessment session on backend
        await assessmentService.start(id).catch((err) => {
          console.warn("Session start logged with note:", err.message);
        });

        // Retrieve assessment details
        const res = await assessmentService.getById(id);
        const data = res.data?.data;

        if (!data) {
          throw new Error("Assessment data not found or empty.");
        }

        if (!isMounted) return;

        setAssessment(data);
        const qList = Array.isArray(data.questions) ? data.questions : [];
        setQuestions(qList);

        // Calculate duration in seconds (default 30 mins)
        const durationSec = Math.max(1, (data.durationMinutes || 30) * 60);
        setTimeLeft(durationSec);
        setTimerActive(true);
      } catch (err) {
        console.error("Failed to load assessment:", err);
        if (isMounted) {
          setLoadError(
            err.response?.data?.message ||
              "Could not load assessment details from server. It may have been archived or removed."
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (id) {
      loadAssessment();
    }

    return () => {
      isMounted = false;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [id]);

  // ── 4. Dedicated Countdown Timer ──
  useEffect(() => {
    if (!timerActive || submitted) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          if (!hasSubmittedRef.current) {
            hasSubmittedRef.current = true;
            handleAutoSubmitOnTimeout();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerActive, submitted]);

  // ── 5. Answer Selection ──
  const handleAnswerSelect = (questionId, optionText) => {
    if (submitted || submitting) return;
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionText,
    }));
  };

  const handleClearAnswer = (questionId) => {
    if (submitted || submitting) return;
    setAnswers((prev) => {
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
  };

  // ── 6. Submission Handlers ──
  const handleAutoSubmitOnTimeout = async () => {
    console.warn("Time expired. Auto-submitting answers...");
    await executeSubmission(true);
  };

  const handleManualSubmit = async () => {
    setShowSubmitModal(false);
    await executeSubmission(false);
  };

  const executeSubmission = async (isAuto = false) => {
    if (submitting) return;

    try {
      setSubmitting(true);
      setSubmitError("");

      // Submit to real backend endpoint
      const res = await assessmentService.submit(id, answers);
      const resData = res.data?.data || res.data;

      safeExitFullscreen();
      setResults(resData);
      setSubmitted(true);
      setTimerActive(false);
    } catch (err) {
      console.error("Assessment submission error:", err);
      // Reset ref so student can retry
      hasSubmittedRef.current = false;
      const msg =
        err.response?.data?.message ||
        "Failed to submit assessment to server. Your selected answers have been preserved. Please check your network and click Retry Submission.";
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleExitAssessment = () => {
    safeExitFullscreen();
    navigate("/student/assessments");
  };

  // ── Helper formatters ──
  const formatTime = (totalSec) => {
    const sec = Math.max(0, totalSec);
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const currentQ = questions[currentIdx] || null;
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = Math.max(0, questions.length - answeredCount);
  const progressPct = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;

  // ── A. Loading View ──
  if (loading) {
    return (
      <div className="nexora-fullscreen-engine d-flex align-items-center justify-content-center flex-column gap-3">
        <div className="spinner-border text-primary" style={{ width: 50, height: 50 }} role="status" />
        <h5 className="fw-bold mb-1" style={{ color: "var(--text, #0f172a)" }}>
          Preparing Assessment Environment...
        </h5>
        <p className="text-muted small">Loading questions and initializing proctored session timer.</p>
      </div>
    );
  }

  // ── B. Error View ──
  if (loadError) {
    return (
      <div className="nexora-fullscreen-engine d-flex align-items-center justify-content-center p-4">
        <div
          className="p-5 text-center shadow-lg rounded-4"
          style={{ maxWidth: 520, background: "#ffffff", border: "1px solid #fee2e2" }}
        >
          <div
            className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
            style={{ width: 68, height: 68, background: "#fef2f2", color: "#dc2626" }}
          >
            <ShieldAlert size={36} />
          </div>
          <h4 className="fw-black mb-2" style={{ color: "#0f172a" }}>
            Unable to Load Assessment
          </h4>
          <p className="text-muted small mb-4">{loadError}</p>
          <div className="d-flex justify-content-center gap-3">
            <button
              className="btn btn-outline-secondary rounded-pill px-4 fw-bold"
              onClick={handleExitAssessment}
            >
              Back to Assessments
            </button>
            <button
              className="btn btn-primary rounded-pill px-4 fw-bold"
              onClick={() => window.location.reload()}
            >
              <RefreshCw size={15} className="me-2" /> Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── C. Dedicated Results Screen ──
  if (submitted && results) {
    const totalPossibleMarks =
      results.totalMarks ??
      assessment?.totalMarks ??
      questions.reduce((sum, q) => sum + (q.marks || 1), 0);
    const scoreAchieved = results.score ?? 0;
    const percentage = results.percentage ?? (totalPossibleMarks > 0 ? Math.round((scoreAchieved / totalPossibleMarks) * 100) : 0);
    const passThreshold = assessment?.passingPercentage ?? 60;
    const isPassed = results.status === "Passed" || percentage >= passThreshold;

    return (
      <div className="nexora-fullscreen-engine d-flex align-items-center justify-content-center p-4 overflow-auto">
        <motion.div
          initial={{ scale: 0.94, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="p-4 p-md-5 text-center shadow-2xl rounded-4"
          style={{
            maxWidth: 620,
            width: "100%",
            background: "#ffffff",
            border: `2px solid ${isPassed ? "#a7f3d0" : "#fecaca"}`,
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
          }}
        >
          {/* Trophy / Status Icon */}
          <div
            className="rounded-circle mx-auto mb-4 d-flex align-items-center justify-content-center"
            style={{
              width: 88,
              height: 88,
              background: isPassed ? "rgba(16, 185, 129, 0.12)" : "rgba(239, 68, 68, 0.12)",
              color: isPassed ? "#059669" : "#dc2626",
            }}
          >
            {isPassed ? <Trophy size={46} strokeWidth={2.4} /> : <RotateCcw size={46} strokeWidth={2.4} />}
          </div>

          <span
            className={`badge rounded-pill px-3 py-1.5 fw-bold mb-2 ${
              isPassed ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"
            }`}
            style={{ fontSize: "0.82rem" }}
          >
            {isPassed ? "PASSED ASSESSMENT" : "FAILED ASSESSMENT"}
          </span>

          <h2 className="fw-black mb-1" style={{ color: "#0f172a", fontSize: "1.85rem" }}>
            {isPassed ? "Outstanding Performance!" : "Assessment Concluded"}
          </h2>
          <p className="text-muted small mb-4">{assessment?.title}</p>

          {/* Metric Cards Grid */}
          <div className="row g-3 mb-4">
            <div className="col-6 col-sm-3">
              <div className="p-3 rounded-3" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                <div className="text-muted small fw-semibold mb-1" style={{ fontSize: "0.72rem" }}>
                  SCORE
                </div>
                <div className="fw-black fs-4" style={{ color: "#4f46e5" }}>
                  {scoreAchieved}
                </div>
                <small className="text-muted" style={{ fontSize: "0.7rem" }}>
                  out of {totalPossibleMarks}
                </small>
              </div>
            </div>

            <div className="col-6 col-sm-3">
              <div className="p-3 rounded-3" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                <div className="text-muted small fw-semibold mb-1" style={{ fontSize: "0.72rem" }}>
                  PERCENTAGE
                </div>
                <div className={`fw-black fs-4 text-${isPassed ? "success" : "danger"}`}>
                  {percentage}%
                </div>
                <small className="text-muted" style={{ fontSize: "0.7rem" }}>
                  Cutoff: {passThreshold}%
                </small>
              </div>
            </div>

            <div className="col-6 col-sm-3">
              <div className="p-3 rounded-3" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                <div className="text-muted small fw-semibold mb-1" style={{ fontSize: "0.72rem" }}>
                  ANSWERED
                </div>
                <div className="fw-black fs-4" style={{ color: "#0f172a" }}>
                  {answeredCount}
                </div>
                <small className="text-muted" style={{ fontSize: "0.7rem" }}>
                  of {questions.length} questions
                </small>
              </div>
            </div>

            <div className="col-6 col-sm-3">
              <div className="p-3 rounded-3" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                <div className="text-muted small fw-semibold mb-1" style={{ fontSize: "0.72rem" }}>
                  STATUS
                </div>
                <div className={`fw-black fs-5 text-${isPassed ? "success" : "danger"}`}>
                  {isPassed ? "PASSED" : "FAILED"}
                </div>
                <small className="text-muted" style={{ fontSize: "0.7rem" }}>
                  {isPassed ? "Verified" : "Try Again"}
                </small>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-4 text-start">
            <div className="d-flex justify-content-between small fw-bold mb-1">
              <span className="text-muted">Final Accuracy</span>
              <span className={isPassed ? "text-success" : "text-danger"}>{percentage}%</span>
            </div>
            <div className="progress" style={{ height: 10, borderRadius: 9999, background: "#e2e8f0" }}>
              <div
                className={`progress-bar bg-${isPassed ? "success" : "danger"} rounded-pill`}
                style={{ width: `${Math.min(percentage, 100)}%`, transition: "width 0.8s ease" }}
              />
            </div>
          </div>

          {/* Action Navigation */}
          <div className="d-flex flex-column flex-sm-row justify-content-center gap-3">
            <button
              className="btn btn-outline-secondary rounded-pill px-4 py-2.5 fw-bold"
              onClick={() => {
                safeExitFullscreen();
                navigate("/student/assessments?tab=history");
              }}
            >
              View in Performance History
            </button>
            <button
              className="btn btn-primary rounded-pill px-5 py-2.5 fw-bold d-inline-flex align-items-center justify-content-center gap-2"
              style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)", border: "none" }}
              onClick={handleExitAssessment}
            >
              <span>Back to Assessments</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── D. Active Fullscreen Exam UI ──
  return (
    <div ref={containerRef} className="nexora-fullscreen-engine">
      {/* ── Top Exam Header ── */}
      <header className="nexora-engine-header">
        <div className="d-flex align-items-center gap-3">
          <div
            className="d-flex align-items-center justify-content-center rounded-3"
            style={{ width: 38, height: 38, background: "rgba(99, 102, 241, 0.12)", color: "#6366f1" }}
          >
            <ShieldCheck size={20} />
          </div>
          <div>
            <h6
              className="fw-bold mb-0 text-truncate"
              style={{ color: "var(--text, #0f172a)", maxWidth: 340, fontSize: "0.95rem" }}
              title={assessment?.title}
            >
              {assessment?.title || "Assessment"}
            </h6>
            <div className="d-flex align-items-center gap-2 mt-0.5">
              <span className="badge bg-danger-subtle text-danger rounded-pill px-2.5 py-0.5 fw-semibold" style={{ fontSize: "0.68rem" }}>
                Proctored Exam
              </span>
              <span className="text-muted small" style={{ fontSize: "0.74rem" }}>
                Question {currentIdx + 1} of {questions.length}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Real-Time Countdown Timer */}
        <div
          className={`nexora-engine-timer ${
            timeLeft < 60 ? "danger" : timeLeft < 300 ? "warning" : ""
          }`}
        >
          <Clock size={18} />
          <span>{formatTime(timeLeft)}</span>
        </div>

        {/* Right Action Controls */}
        <div className="d-flex align-items-center gap-2.5">
          {/* Fullscreen Toggle */}
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary rounded-pill px-3 py-1.5 d-flex align-items-center gap-1.5"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen" : "Enter Browser Fullscreen"}
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            <span className="d-none d-md-inline" style={{ fontSize: "0.8rem" }}>
              {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            </span>
          </button>

          {/* Early Exit Button */}
          <button
            type="button"
            className="btn btn-sm btn-outline-danger rounded-pill px-3 py-1.5 d-flex align-items-center gap-1"
            onClick={() => setShowExitModal(true)}
            title="Leave Assessment Early"
          >
            <LogOut size={14} />
            <span className="d-none d-md-inline" style={{ fontSize: "0.8rem" }}>Exit</span>
          </button>

          {/* Submit Test Button */}
          <button
            type="button"
            disabled={submitting}
            onClick={() => setShowSubmitModal(true)}
            className="btn btn-sm btn-primary rounded-pill px-4 py-1.5 fw-bold d-flex align-items-center gap-2 shadow-sm"
            style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)", border: "none" }}
          >
            {submitting ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <Send size={14} />
                <span>Submit Assessment</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Proctoring Warning Banner if triggered */}
      {proctorWarning && (
        <div
          className="bg-warning-subtle text-warning border-bottom border-warning px-4 py-1.5 small fw-semibold d-flex align-items-center justify-content-between"
          style={{ zIndex: 9 }}
        >
          <div className="d-flex align-items-center gap-2">
            <AlertTriangle size={15} />
            <span>{proctorWarning}</span>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-link text-warning p-0 text-decoration-none fw-bold"
            onClick={() => setProctorWarning("")}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Error Banner during submit */}
      {submitError && (
        <div
          className="bg-danger-subtle text-danger border-bottom border-danger px-4 py-2 small fw-semibold d-flex align-items-center justify-content-between"
          style={{ zIndex: 9 }}
        >
          <div className="d-flex align-items-center gap-2">
            <AlertTriangle size={16} />
            <span>{submitError}</span>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-danger rounded-pill px-3 py-1 fw-bold"
            onClick={() => executeSubmission(false)}
          >
            Retry Submission
          </button>
        </div>
      )}

      {/* ── Main Split View ── */}
      <div className="nexora-engine-body">
        {/* Left: Active Question Card Area */}
        <main className="nexora-engine-content">
          {currentQ ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIdx}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.16 }}
              >
                {/* Question Info Bar */}
                <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
                  <div className="d-flex align-items-center gap-2">
                    <span
                      className="badge rounded-pill px-3 py-1.5 fw-bold"
                      style={{ background: "#4f46e5", color: "#ffffff", fontSize: "0.78rem" }}
                    >
                      Question {currentIdx + 1}
                    </span>
                    <span className="badge bg-secondary-subtle text-body rounded-pill px-3 py-1.5 fw-semibold" style={{ fontSize: "0.75rem" }}>
                      +{currentQ.marks || 1} {currentQ.marks === 1 ? "Mark" : "Marks"}
                    </span>
                    <span className="badge bg-primary-subtle text-primary rounded-pill px-2.5 py-1 fw-semibold" style={{ fontSize: "0.72rem" }}>
                      {currentQ.difficulty || "Medium"}
                    </span>
                  </div>

                  {answers[currentQ._id] && (
                    <button
                      type="button"
                      className="btn btn-sm btn-link text-muted p-0 text-decoration-none"
                      style={{ fontSize: "0.8rem" }}
                      onClick={() => handleClearAnswer(currentQ._id)}
                    >
                      Clear Selection
                    </button>
                  )}
                </div>

                {/* Question Prompt */}
                <h4
                  className="fw-bold mb-4"
                  style={{
                    color: "var(--text, #0f172a)",
                    fontSize: "1.22rem",
                    lineHeight: "1.55",
                    whiteSpace: "pre-line",
                  }}
                >
                  {currentQ.content || currentQ.text || currentQ.questionPrompt || `Question ${currentIdx + 1}`}
                </h4>

                {/* MCQ Options List */}
                <div className="d-flex flex-column gap-2 mb-4">
                  {(Array.isArray(currentQ.options) ? currentQ.options : []).map((opt, oIdx) => {
                    const optText = typeof opt === "string" ? opt : opt.text || "";
                    const isSelected = answers[currentQ._id] === optText;
                    const letter = String.fromCharCode(65 + oIdx);

                    return (
                      <div
                        key={opt._id || oIdx}
                        className={`nexora-mcq-option ${isSelected ? "selected" : ""}`}
                        onClick={() => handleAnswerSelect(currentQ._id, optText)}
                        role="radio"
                        aria-checked={isSelected}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === " " || e.key === "Enter") {
                            e.preventDefault();
                            handleAnswerSelect(currentQ._id, optText);
                          }
                        }}
                      >
                        <div className="nexora-mcq-letter">
                          {isSelected ? <Check size={16} strokeWidth={3} /> : letter}
                        </div>
                        <div className="nexora-mcq-text">{optText}</div>
                        {isSelected && (
                          <CheckCircle2 size={18} className="text-primary flex-shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="text-center py-5">
              <p className="text-muted">No question data found for index {currentIdx}.</p>
            </div>
          )}
        </main>

        {/* Right: Question Palette / Map Sidebar */}
        <aside className="nexora-engine-palette">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h6 className="fw-bold mb-0 text-uppercase small text-muted" style={{ letterSpacing: "0.04em" }}>
              Question Map
            </h6>
            <span className="small text-muted fw-semibold">
              {answeredCount}/{questions.length} Answered
            </span>
          </div>

          {/* Progress Indicator */}
          <div className="mb-4">
            <div className="progress rounded-pill mb-1.5" style={{ height: 6, background: "#e2e8f0" }}>
              <div
                className="progress-bar rounded-pill"
                style={{
                  width: `${progressPct}%`,
                  background: "linear-gradient(90deg, #4f46e5, #7c3aed)",
                  transition: "width 0.3s ease",
                }}
              />
            </div>
            <div className="d-flex justify-content-between text-muted" style={{ fontSize: "0.74rem" }}>
              <span>Progress: {progressPct}%</span>
              <span>{unansweredCount} remaining</span>
            </div>
          </div>

          {/* Palette Grid */}
          <div className="nexora-palette-grid mb-4">
            {questions.map((q, idx) => {
              const isAnswered = Boolean(answers[q._id]);
              const isCurrent = idx === currentIdx;

              let btnClass = "nexora-palette-btn ";
              if (isAnswered) btnClass += "answered ";
              else btnClass += "unanswered ";
              if (isCurrent) btnClass += "current ";

              return (
                <button
                  key={q._id || idx}
                  type="button"
                  className={btnClass}
                  onClick={() => setCurrentIdx(idx)}
                  title={`Go to Question ${idx + 1} (${isAnswered ? "Answered" : "Unanswered"})`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="p-3 rounded-3 mt-auto" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
            <div className="small fw-bold text-muted text-uppercase mb-2" style={{ fontSize: "0.7rem" }}>
              Legend
            </div>
            <div className="d-flex flex-column gap-2" style={{ fontSize: "0.76rem" }}>
              <div className="d-flex align-items-center gap-2">
                <div style={{ width: 14, height: 14, borderRadius: 4, border: "2px solid #6366f1" }} />
                <span className="text-body">Current Question</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <div style={{ width: 14, height: 14, borderRadius: 4, background: "#10b981" }} />
                <span className="text-body">Answered</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <div style={{ width: 14, height: 14, borderRadius: 4, background: "#f1f5f9", border: "1px solid #cbd5e1" }} />
                <span className="text-body">Unanswered</span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* ── Footer Navigation Controls ── */}
      <footer className="nexora-engine-footer">
        <button
          type="button"
          onClick={() => setCurrentIdx((p) => Math.max(0, p - 1))}
          disabled={currentIdx === 0}
          className="btn btn-outline-secondary rounded-pill px-4 fw-semibold d-flex align-items-center gap-2"
        >
          <ChevronLeft size={18} />
          <span>Previous</span>
        </button>

        <div className="d-flex align-items-center gap-3">
          <span className="text-muted small fw-bold">
            Question {currentIdx + 1} of {questions.length}
          </span>
        </div>

        {currentIdx < questions.length - 1 ? (
          <button
            type="button"
            onClick={() => setCurrentIdx((p) => Math.min(questions.length - 1, p + 1))}
            className="btn btn-primary rounded-pill px-4 fw-semibold d-flex align-items-center gap-2"
            style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)", border: "none" }}
          >
            <span>Next Question</span>
            <ChevronRight size={18} />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setShowSubmitModal(true)}
            className="btn btn-success rounded-pill px-4 fw-bold d-flex align-items-center gap-2 shadow-sm"
          >
            <Send size={15} />
            <span>Finish & Submit</span>
          </button>
        )}
      </footer>

      {/* ── Submit Confirmation Dialog ── */}
      <AnimatePresence>
        {showSubmitModal && (
          <div
            className="nexora-modal-backdrop"
            onClick={() => !submitting && setShowSubmitModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="nexora-modal-container size-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="nexora-modal-header">
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="nexora-modal-icon-badge"
                    style={{ background: unansweredCount > 0 ? "#fef3c7" : "#eff6ff", color: unansweredCount > 0 ? "#d97706" : "#2563eb" }}
                  >
                    {unansweredCount > 0 ? <AlertTriangle size={20} /> : <CheckCircle2 size={20} />}
                  </div>
                  <div>
                    <h4 className="nexora-modal-title">
                      {unansweredCount > 0 ? "Unanswered Questions" : "Submit Assessment?"}
                    </h4>
                    <p className="nexora-modal-subtitle">
                      {unansweredCount > 0
                        ? `${unansweredCount} question${unansweredCount > 1 ? "s" : ""} left unanswered`
                        : "Ready for final grading"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="nexora-modal-close-btn"
                  onClick={() => setShowSubmitModal(false)}
                  disabled={submitting}
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <div className="nexora-modal-body">
                {unansweredCount > 0 ? (
                  <div className="p-3 rounded-3 mb-3" style={{ background: "#fffbeb", border: "1px solid #fde68a", color: "#92400e" }}>
                    <p className="small mb-1 fw-bold">
                      You have answered {answeredCount} of {questions.length} questions.
                    </p>
                    <p className="small mb-0">
                      There are <strong>{unansweredCount} unanswered questions</strong>. Any unanswered questions will receive 0 marks. Are you sure you want to finalize your submission?
                    </p>
                  </div>
                ) : (
                  <p className="small text-muted mb-3" style={{ lineHeight: "1.5" }}>
                    You have answered all <strong>{questions.length} questions</strong>. Once submitted, your answers will be automatically evaluated and recorded.
                  </p>
                )}
              </div>

              <div className="nexora-modal-footer">
                <span className="nexora-modal-footer-hint">
                  {formatTime(timeLeft)} remaining
                </span>
                <div className="nexora-modal-footer-actions">
                  <button
                    type="button"
                    className="nexora-modal-btn-cancel"
                    onClick={() => setShowSubmitModal(false)}
                    disabled={submitting}
                  >
                    Continue Test
                  </button>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={handleManualSubmit}
                    className="nexora-modal-btn-primary"
                  >
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" />
                        <span>Grading...</span>
                      </>
                    ) : (
                      <>
                        <Send size={15} />
                        <span>Confirm & Submit</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Early Exit Modal ── */}
      <AnimatePresence>
        {showExitModal && (
          <div
            className="nexora-modal-backdrop"
            onClick={() => setShowExitModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="nexora-modal-container size-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="nexora-modal-header">
                <div className="d-flex align-items-center gap-3">
                  <div className="nexora-modal-icon-badge" style={{ background: "#fee2e2", color: "#dc2626" }}>
                    <LogOut size={20} />
                  </div>
                  <div>
                    <h4 className="nexora-modal-title">Leave Assessment?</h4>
                    <p className="nexora-modal-subtitle">Your progress will not be saved</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="nexora-modal-close-btn"
                  onClick={() => setShowExitModal(false)}
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <div className="nexora-modal-body">
                <p className="small text-muted mb-0" style={{ lineHeight: "1.5" }}>
                  Leaving this assessment now will discard your in-progress answers and return you to the dashboard.
                </p>
              </div>

              <div className="nexora-modal-footer">
                <span className="nexora-modal-footer-hint">
                  {answeredCount} answers recorded in session
                </span>
                <div className="nexora-modal-footer-actions">
                  <button
                    type="button"
                    className="nexora-modal-btn-cancel"
                    onClick={() => setShowExitModal(false)}
                  >
                    Stay on Exam
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger rounded-pill px-4 fw-bold"
                    onClick={handleExitAssessment}
                  >
                    Exit Exam
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AssessmentEngine;
