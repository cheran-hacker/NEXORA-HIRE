import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "../../shared/components/Button.jsx";
import { Compass, Sparkles, Map, CheckCircle2 } from "lucide-react";
import { aiService } from "../../services/api.js";
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
const CareerRoadmap = () => {
  const [targetRole, setTargetRole] = useState("");
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [timeFrame, setTimeFrame] = useState("6 months");
  const [isGenerating, setIsGenerating] = useState(false);
  const [roadmap, setRoadmap] = useState(null);
  const toggleSkill = (skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill],
    );
  };
  const handleGenerate = async () => {
    if (!targetRole) return;
    setIsGenerating(true);
    setRoadmap(null);
    try {
      const response = await aiService.generateRoadmap(
        targetRole,
        selectedSkills,
        timeFrame,
      );
      setRoadmap(response.data.data);
    } catch (error) {
      console.error("Failed to generate roadmap:", error); // Fallback or error state can be handled here
    } finally {
      setIsGenerating(false);
    }
  };
  return (
    <div className="container-fluid py-4 px-xl-5">
      {" "}
      <div className="mb-5 text-center">
        {" "}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="icon-circle shadow-sm mx-auto mb-3"
          style={{
            background: "var(--primary-subtle)",
            color: "var(--primary)",
          }}
        >
          {" "}
          <Compass size={28} strokeWidth={2} />{" "}
        </motion.div>{" "}
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
          AI Career Roadmap
        </motion.h2>{" "}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-muted fw-medium mx-auto"
          style={{ maxWidth: 600 }}
        >
          Get a personalized, month-by-month learning and career roadmap powered
          by Gemini AI.
        </motion.p>{" "}
      </div>{" "}
      <div className="row g-4">
        {" "}
        <div className="col-lg-4">
          {" "}
          <div className="bento-card h-100 p-4 hover-glow">
            {" "}
            <h5
              className="fw-bold mb-4 d-flex align-items-center gap-2"
              style={{ color: "var(--text)" }}
            >
              <Sparkles size={18} /> Configure Your Path
            </h5>{" "}
            <div className="mb-3">
              {" "}
              <label className="form-label text-muted small fw-semibold">
                Dream Job Role
              </label>{" "}
              <input
                type="text"
                className="form-control bg-transparent text-foreground"
                placeholder="e.g. Staff Software Engineer @ Google"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
              />{" "}
            </div>{" "}
            <div className="mb-3">
              {" "}
              <label className="form-label text-muted small fw-semibold">
                Current Skills
              </label>{" "}
              <div className="d-flex flex-wrap gap-2 mt-1">
                {" "}
                {SKILLS.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    className={`btn btn-sm rounded-pill fw-semibold ${selectedSkills.includes(skill) ? "btn-primary" : "btn-outline-secondary text-foreground-50"}`}
                    onClick={() => toggleSkill(skill)}
                  >
                    {" "}
                    {skill}{" "}
                  </button>
                ))}{" "}
              </div>{" "}
            </div>{" "}
            <div className="mb-4">
              {" "}
              <label className="form-label text-muted small fw-semibold">
                Time Frame
              </label>{" "}
              <select
                className="form-select bg-transparent text-foreground"
                value={timeFrame}
                onChange={(e) => setTimeFrame(e.target.value)}
                style={{ background: "var(--bg-secondary)" }}
              >
                {" "}
                {["3 months", "6 months", "1 year", "2 years"].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}{" "}
              </select>{" "}
            </div>{" "}
            <button
              className="btn btn-primary w-100 rounded-3 py-3 fw-bold d-flex justify-content-center align-items-center gap-2 shadow-sm hover-lift"
              onClick={handleGenerate}
              disabled={!targetRole || isGenerating}
              style={{
                background:
                  "linear-gradient(135deg, var(--primary), var(--purple))",
                border: "none",
              }}
            >
              {" "}
              {isGenerating ? (
                <span className="spinner-border spinner-border-sm" />
              ) : (
                <Sparkles size={18} />
              )}{" "}
              {isGenerating ? "Generating..." : "Generate My Roadmap"}{" "}
            </button>{" "}
          </div>{" "}
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
                      {" "}
                      <p className="text-muted small fw-semibold text-uppercase mb-2">
                        Skills to Learn
                      </p>{" "}
                      <div className="d-flex flex-wrap gap-2">
                        {" "}
                        {milestone.skillsToLearn.map((skill) => (
                          <span
                            key={skill}
                            className="neon-badge rounded-pill bg-success-subtle text-success px-3 py-2"
                          >
                            {skill}
                          </span>
                        ))}{" "}
                      </div>{" "}
                    </div>{" "}
                    <div>
                      {" "}
                      <p className="text-muted small fw-semibold text-uppercase mb-2">
                        Action Items
                      </p>{" "}
                      <ul className="list-unstyled mb-0 d-flex flex-column gap-2">
                        {" "}
                        {milestone.actionItems.map((item, i) => (
                          <li
                            key={i}
                            className="d-flex align-items-start gap-2 rounded-3 p-2 hover-scale"
                            style={{ border: "1px solid var(--border)" }}
                          >
                            {" "}
                            <CheckCircle2
                              size={16}
                              className="text-primary mt-1 flex-shrink-0"
                            />{" "}
                            <span className="small text-foreground-50 fw-medium">
                              {item}
                            </span>{" "}
                          </li>
                        ))}{" "}
                      </ul>{" "}
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
