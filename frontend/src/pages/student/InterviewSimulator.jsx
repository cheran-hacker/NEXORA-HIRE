import { useToast } from "../../context/ToastContext";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "../../shared/components/Button.jsx";
import { aiService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const InterviewSimulator = () => {
  const { addToast } = useToast();
  const { user } = useAuth();
  const [step, setStep] = useState("setup"); // 'setup' | 'questions' | 'results'
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [evaluations, setEvaluations] = useState([]);
  const [config, setConfig] = useState({
    jobRole: "",
    skills: "",
    mode: "Technical",
  });
  const [questions, setQuestions] = useState([]);

  // Auto-fill configuration with student profile
  useEffect(() => {
    if (user?.studentProfile) {
      const p = user.studentProfile;
      setConfig(prev => ({
        ...prev,
        jobRole: p.preferredRoles || prev.jobRole,
        skills: p.skills?.join(', ') || prev.skills
      }));
    }
  }, [user]);

  const handleStart = async () => {
    if (!config.jobRole || !config.skills)
      return addToast("Please provide role and skills", "info");
    setIsGenerating(true);
    try {
      const res = await aiService.generateQuestions(
        config.jobRole,
        config.skills,
        config.mode,
        3,
      );
      setQuestions(res.data.data);
      setStep("questions");
    } catch (err) {
      console.error(err);
      addToast("Failed to generate questions. Check API key.", "info");
    } finally {
      setIsGenerating(false);
    }
  };
  const handleEvaluate = async () => {
    if (!userAnswer.trim()) return;
    setIsEvaluating(true);
    try {
      const res = await aiService.evaluateAnswer(
        questions[currentIdx].question,
        userAnswer,
      );
      const evaluation = res.data.data; // Map API response to UI shape if necessary
      const formattedEval = {
        question: questions[currentIdx].question,
        answer: userAnswer,
        score: evaluation.score || 0,
        confidenceScore: evaluation.confidenceScore || 0,
        feedback: evaluation.feedback || "No feedback provided.",
        idealAnswerSnippet: evaluation.idealAnswerSnippet || "N/A",
      };
      setEvaluations((prev) => [...prev, formattedEval]);
      setUserAnswer("");
      if (currentIdx < questions.length - 1) {
        setCurrentIdx((prev) => prev + 1);
      } else {
        setStep("results");
      }
    } catch (err) {
      console.error(err);
      addToast("Failed to evaluate answer. Try again.", "info");
    } finally {
      setIsEvaluating(false);
    }
  };
  const avgScore = evaluations.length
    ? Math.round(
        evaluations.reduce((acc, e) => acc + e.score, 0) / evaluations.length,
      )
    : 0;
  return (
    <div className="container-fluid py-2">
      {" "}
      <div className="mb-4">
        {" "}
        <h2 className="fw-bold mb-1">
          <i className="bi bi-mic text-primary me-2"></i>AI Interview Simulator
        </h2>{" "}
        <p className="text-muted">
          Practice your interview skills with dynamic AI-generated questions and
          get instant Gemini-powered feedback.
        </p>{" "}
      </div>{" "}
      <AnimatePresence mode="wait">
        {" "}
        {/* ── Setup ── */}{" "}
        {step === "setup" && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {" "}
            <div
              className="rounded-4 shadow-sm"
              style={{ maxWidth: "600px", margin: "0 auto" }}
            >
              {" "}
              <h5 className="fw-bold mb-4">
                Configure Your Interview Session
              </h5>{" "}
              <div className="mb-3">
                {" "}
                <label className="form-label text-muted small fw-semibold">
                  Target Job Role
                </label>{" "}
                <input
                  type="text"
                  className="form-control bg-transparent text-body"
                  placeholder="e.g. Frontend Engineer, Data Scientist"
                  value={config.jobRole}
                  onChange={(e) =>
                    setConfig({ ...config, jobRole: e.target.value })
                  }
                />{" "}
              </div>{" "}
              <div className="mb-3">
                {" "}
                <label className="form-label text-muted small fw-semibold">
                  Your Core Skills (comma-separated)
                </label>{" "}
                <input
                  type="text"
                  className="form-control bg-transparent text-body"
                  placeholder="e.g. React, Node.js, MongoDB"
                  value={config.skills}
                  onChange={(e) =>
                    setConfig({ ...config, skills: e.target.value })
                  }
                />{" "}
              </div>{" "}
              <div className="mb-4">
                {" "}
                <label className="form-label text-muted small fw-semibold">
                  Interview Mode
                </label>{" "}
                <div className="d-flex gap-2 flex-wrap">
                  {" "}
                  {["Technical", "HR", "Behavioral", "System Design"].map(
                    (mode) => (
                      <div key={mode}>
                        {" "}
                        <input
                          type="radio"
                          className="btn-check"
                          id={`mode-${mode}`}
                          value={mode}
                          checked={config.mode === mode}
                          onChange={(e) =>
                            setConfig({ ...config, mode: e.target.value })
                          }
                        />{" "}
                        <label
                          className="btn btn-outline-secondary rounded-pill btn-sm fw-semibold"
                          htmlFor={`mode-${mode}`}
                        >
                          {mode}
                        </label>{" "}
                      </div>
                    ),
                  )}{" "}
                </div>{" "}
              </div>{" "}
              <Button
                variant="primary"
                className="w-100"
                onClick={handleStart}
                isLoading={isGenerating}
                disabled={isGenerating || !config.jobRole}
              >
                {" "}
                {isGenerating ? (
                  "Generating..."
                ) : (
                  <>
                    <i className="bi bi-play-fill me-2"></i>Start Interview
                    Session
                  </>
                )}{" "}
              </Button>{" "}
            </div>{" "}
          </motion.div>
        )}{" "}
        {/* ── Questions ── */}{" "}
        {step === "questions" && (
          <motion.div
            key="questions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {" "}
            {/* Progress Bar */}{" "}
            <div className="d-flex align-items-center gap-3 mb-4">
              {" "}
              <div className="progress flex-grow-1" style={{ height: "8px" }}>
                {" "}
                <div
                  className="progress-bar bg-primary"
                  style={{
                    width: `${(currentIdx / questions.length) * 100}%`,
                    transition: "width 0.5s ease",
                  }}
                />{" "}
              </div>{" "}
              <small className="text-muted fw-semibold">
                {currentIdx + 1} / {questions.length}
              </small>{" "}
            </div>{" "}
            <div className="row g-4">
              {" "}
              <div className="col-lg-7">
                {" "}
                <motion.div
                  key={currentIdx}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="rounded-4 shadow-sm h-100"
                >
                  {" "}
                  <div className="d-flex gap-2 mb-3">
                    {" "}
                    <span
                      className={`badge bg-${questions[currentIdx].difficulty === "Hard" ? "danger" : "warning"} text-foreground`}
                    >
                      {" "}
                      {questions[currentIdx].difficulty}{" "}
                    </span>{" "}
                    <span className="badge bg-primary bg-opacity-25 text-primary">
                      {" "}
                      <i className="bi bi-mic me-1"></i>
                      {config.mode}{" "}
                    </span>{" "}
                  </div>{" "}
                  <h5 className="fw-bold mb-4">
                    {questions[currentIdx].question}
                  </h5>{" "}
                  <div className="mb-3">
                    {" "}
                    <p className="text-muted small fw-semibold mb-2">
                      EXPECTED TOPICS:
                    </p>{" "}
                    <div className="d-flex flex-wrap gap-2">
                      {" "}
                      {questions[currentIdx].expectedTopics.map((t) => (
                        <span
                          key={t}
                          className="badge rounded-pill bg-secondary bg-opacity-25 text-secondary"
                        >
                          {t}
                        </span>
                      ))}{" "}
                    </div>{" "}
                  </div>{" "}
                  <textarea
                    className="form-control bg-transparent text-body mt-4"
                    rows={7}
                    placeholder="Type your answer here… take your time, articulate clearly."
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                  />{" "}
                  <div className="d-flex gap-3 mt-3">
                    {" "}
                    <Button
                      variant="primary"
                      className="flex-grow-1"
                      onClick={handleEvaluate}
                      isLoading={isEvaluating}
                      disabled={!userAnswer.trim()}
                    >
                      {" "}
                      <i className="bi bi-send me-2"></i>Submit Answer{" "}
                    </Button>{" "}
                    <Button
                      variant="outline"
                      onClick={() =>
                        setCurrentIdx((prev) =>
                          Math.min(prev + 1, questions.length - 1),
                        )
                      }
                    >
                      {" "}
                      Skip{" "}
                    </Button>{" "}
                  </div>{" "}
                </motion.div>{" "}
              </div>{" "}
              <div className="col-lg-5">
                {" "}
                <div className="rounded-4 shadow-sm h-100">
                  {" "}
                  <h6 className="fw-bold mb-3">Answer History</h6>{" "}
                  {evaluations.length === 0 ? (
                    <p className="text-muted small">
                      Your evaluated answers will appear here.
                    </p>
                  ) : (
                    <div className="list-unstyled">
                      {" "}
                      {evaluations.map((ev, i) => (
                        <div key={i} className=" p-3 rounded-3 mb-3">
                          {" "}
                          <div className="d-flex justify-content-between mb-1">
                            {" "}
                            <small className="fw-bold">Q{i + 1}</small>{" "}
                            <span
                              className={`badge bg-${ev.score >= 80 ? "success" : ev.score >= 60 ? "warning" : "danger"}`}
                            >
                              {ev.score}/100
                            </span>{" "}
                          </div>{" "}
                          <p className="text-muted small mb-0 text-truncate">
                            {ev.feedback}
                          </p>{" "}
                        </div>
                      ))}{" "}
                    </div>
                  )}{" "}
                </div>{" "}
              </div>{" "}
            </div>{" "}
          </motion.div>
        )}{" "}
        {/* ── Results ── */}{" "}
        {step === "results" && (
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {" "}
            <div
              className="rounded-4 shadow-sm text-center mb-4"
              style={{ maxWidth: "500px", margin: "0 auto 1.5rem" }}
            >
              {" "}
              <i className="bi bi-trophy-fill display-1 text-warning mb-3"></i>{" "}
              <h3 className="fw-bold">Interview Complete!</h3>{" "}
              <p className="text-muted">
                Here's your overall performance summary
              </p>{" "}
              <div className="display-3 fw-bolder text-primary">
                {avgScore}
                <span className="fs-3 text-muted">/100</span>
              </div>{" "}
              <Button
                onClick={handleStart}
                isLoading={isGenerating}
                disabled={isGenerating}
                className="w-100 mt-4 rounded-pill"
              >
                {" "}
                {isGenerating ? "Generating..." : "Start New Session"}{" "}
              </Button>{" "}
            </div>{" "}
            <div className="row g-3">
              {" "}
              {evaluations.map((ev, i) => (
                <div className="col-md-6" key={i}>
                  {" "}
                  <motion.div
                    className="rounded-4 shadow-sm h-100"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    {" "}
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      {" "}
                      <h6 className="fw-bold mb-0">Question {i + 1}</h6>{" "}
                      <div className="d-flex gap-2">
                        {" "}
                        <span
                          className={`badge bg-${ev.score >= 80 ? "success" : "warning"} text-foreground`}
                        >
                          Score: {ev.score}
                        </span>{" "}
                        <span className="badge bg-info text-foreground">
                          Confidence: {ev.confidenceScore}%
                        </span>{" "}
                      </div>{" "}
                    </div>{" "}
                    <p className="small text-muted mb-2">{ev.question}</p>{" "}
                    <hr />{" "}
                    <p className="small">
                      <strong className="text-warning">Feedback: </strong>
                      {ev.feedback}
                    </p>{" "}
                    <p className="small text-muted">
                      <strong>Ideal Answer: </strong>
                      {ev.idealAnswerSnippet}
                    </p>{" "}
                  </motion.div>{" "}
                </div>
              ))}{" "}
            </div>{" "}
          </motion.div>
        )}{" "}
      </AnimatePresence>{" "}
    </div>
  );
};
export default InterviewSimulator;
