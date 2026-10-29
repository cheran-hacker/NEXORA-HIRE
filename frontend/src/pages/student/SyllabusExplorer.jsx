import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { skillTreeService } from "../../services/api.js";
import {
  BookOpen,
  AlertCircle,
  ChevronRight,
  CheckCircle2,
  Lock,
  Unlock,
  Zap,
} from "lucide-react";
import { useToast } from "../../context/ToastContext";
const SyllabusExplorer = () => {
  const { addToast } = useToast();
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeNode, setActiveNode] = useState(null); // Simulated unlocked courses for the user
  const unlockedCourses = ["CS101", "CS102"];
  useEffect(() => {
    fetchNodes();
  }, []);
  const fetchNodes = async () => {
    try {
      setLoading(true);
      const res = await skillTreeService.getSkillTree();
      setNodes(res.data.data || []);
    } catch (err) {
      addToast("Failed to load Skill Tree", "error");
    } finally {
      setLoading(false);
    }
  };
  if (loading)
    return (
      <div className="container-fluid py-4 d-flex justify-content-center">
        <div className="spinner-border text-primary"></div>
      </div>
    );
  return (
    <div className="container-fluid py-4 px-xl-5">
      {" "}
      <div className="d-flex justify-content-between align-items-center mb-5 flex-wrap gap-3">
        {" "}
        <div>
          {" "}
          <h2 className="fw-black mb-1 text-gradient-primary d-flex align-items-center gap-2">
            {" "}
            Syllabus Skill Tree <BookOpen size={28} />{" "}
          </h2>{" "}
          <p className="text-muted mb-0">
            Visualize your computer science degree as an RPG skill tree. Unlock
            the path to graduation.
          </p>{" "}
        </div>{" "}
      </div>{" "}
      <div className="row g-4">
        {" "}
        {/* Graph Area */}{" "}
        <div className="col-lg-8">
          {" "}
          <div
            className="bento-card bg-card position-relative overflow-hidden p-5"
            style={{
              minHeight: "600px",
              backgroundImage:
                "radial-gradient(circle at 50% 50%, #1a1a2e 0%, #0f0f1a 100%)",
            }}
          >
            {" "}
            {/* Background Grid Pattern */}{" "}
            <div
              className="position-absolute w-100 h-100 opacity-25"
              style={{
                backgroundImage:
                  "linear-gradient(#ffffff11 1px, transparent 1px), linear-gradient(90deg, #ffffff11 1px, transparent 1px)",
                backgroundSize: "40px 40px",
                top: 0,
                left: 0,
              }}
            ></div>{" "}
            <div className="position-relative z-1 h-100 d-flex flex-column">
              {" "}
              <h5 className="text-foreground opacity-75 mb-4 text-uppercase tracking-wider fw-bold">
                Skill Tree Progression
              </h5>{" "}
              <div
                className="d-flex justify-content-between align-items-stretch flex-grow-1 position-relative overflow-auto pb-4"
                style={{ gap: "4rem" }}
              >
                {" "}
                {/* SVG connection lines logic (static visual flair) */}{" "}
                <svg
                  className="position-absolute w-100 h-100"
                  style={{ zIndex: -1, pointerEvents: "none" }}
                >
                  {" "}
                  <path
                    d="M 150 200 C 250 200, 250 150, 350 150"
                    stroke="#4f46e5"
                    strokeWidth="3"
                    strokeDasharray="5,5"
                    fill="none"
                    opacity="0.5"
                  />{" "}
                  <path
                    d="M 150 200 C 250 200, 250 250, 350 250"
                    stroke="#4f46e5"
                    strokeWidth="3"
                    strokeDasharray="5,5"
                    fill="none"
                    opacity="0.5"
                  />{" "}
                  <path
                    d="M 450 150 C 550 150, 550 200, 650 200"
                    stroke="#eab308"
                    strokeWidth="3"
                    fill="none"
                    opacity="0.5"
                  />{" "}
                  <path
                    d="M 450 250 C 550 250, 550 200, 650 200"
                    stroke="#eab308"
                    strokeWidth="3"
                    fill="none"
                    opacity="0.5"
                  />{" "}
                  <path
                    d="M 750 200 C 850 200, 850 200, 950 200"
                    stroke="#ef4444"
                    strokeWidth="3"
                    fill="none"
                    opacity="0.5"
                  />{" "}
                </svg>{" "}
                {["Beginner", "Intermediate", "Advanced", "Boss"].map(
                  (tier, tierIdx) => {
                    const tierNodes = nodes.filter(
                      (n) => n.difficulty === tier,
                    );
                    if (tierNodes.length === 0) return null;
                    return (
                      <div
                        key={tier}
                        className="d-flex flex-column justify-content-center"
                        style={{ gap: "2rem", minWidth: "220px" }}
                      >
                        {" "}
                        <div className="text-center mb-3">
                          {" "}
                          <span
                            className={`badge rounded-pill px-3 py-2 ${tier === "Boss" ? "bg-danger" : tier === "Advanced" ? "bg-warning text-foreground" : tier === "Intermediate" ? "bg-info" : "bg-secondary"}`}
                          >
                            {" "}
                            Tier {tierIdx + 1}: {tier}{" "}
                          </span>{" "}
                        </div>{" "}
                        {tierNodes.map((node, i) => {
                          const isUnlocked = unlockedCourses.includes(
                            node.courseCode,
                          );
                          const isNext = node.prerequisites.every((p) =>
                            unlockedCourses.includes(p),
                          );
                          const statusColor = isUnlocked
                            ? "bg-success border-success"
                            : isNext
                              ? "bg-warning border-warning text-foreground"
                              : "bg-secondary border";
                          const glow = isNext ? "shadow-lg shadow-warning" : "";
                          const textColor =
                            isNext && tier !== "Boss"
                              ? "text-foreground"
                              : "text-foreground";
                          return (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: tierIdx * 0.2 + i * 0.1 }}
                              key={node._id}
                              className={`bento-card border border-2 p-3 cursor-pointer text-center d-flex flex-column align-items-center gap-2 ${statusColor} ${glow} ${textColor}`}
                              style={{
                                cursor: "pointer",
                                transition: "all 0.3s ease",
                              }}
                              onClick={() => setActiveNode(node)}
                              whileHover={{ scale: 1.05, y: -5 }}
                            >
                              {" "}
                              <div
                                className="bg-black bg-opacity-25 rounded-circle p-3 mb-2 d-flex align-items-center justify-content-center"
                                style={{ width: "60px", height: "60px" }}
                              >
                                {" "}
                                {isUnlocked ? (
                                  <Unlock size={24} className="text-foreground" />
                                ) : isNext ? (
                                  <Zap
                                    size={24}
                                    className="text-foreground animate-pulse"
                                  />
                                ) : (
                                  <Lock
                                    size={24}
                                    className="text-foreground opacity-50"
                                  />
                                )}{" "}
                              </div>{" "}
                              <div className="fw-black fs-5 lh-1">
                                {node.courseCode}
                              </div>{" "}
                              <div className="small fw-semibold opacity-75">
                                {node.courseName}
                              </div>{" "}
                            </motion.div>
                          );
                        })}{" "}
                      </div>
                    );
                  },
                )}{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
        {/* Sidebar Info Panel */}{" "}
        <div className="col-lg-4">
          {" "}
          <AnimatePresence mode="wait">
            {" "}
            {activeNode ? (
              <motion.div
                key={activeNode._id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bento-card p-4 h-100 border border-primary border-2"
              >
                {" "}
                <div className="d-flex justify-content-between align-items-start mb-4">
                  {" "}
                  <div>
                    {" "}
                    <h3 className="fw-black text-foreground mb-1">
                      {activeNode.courseCode}
                    </h3>{" "}
                    <h6 className="text-muted fw-bold">
                      {activeNode.courseName}
                    </h6>{" "}
                  </div>{" "}
                  <div className="badge bg-primary text-white p-2 rounded-3 fs-6">
                    {" "}
                    {activeNode.credits} Credits{" "}
                  </div>{" "}
                </div>{" "}
                <div className="mb-4">
                  {" "}
                  <div className="small text-muted text-uppercase fw-black mb-2 d-flex align-items-center gap-1">
                    <AlertCircle size={14} /> Difficulty Tier
                  </div>{" "}
                  <div
                    className={`badge fs-6 ${activeNode.difficulty === "Boss" ? "bg-danger text-white" : activeNode.difficulty === "Advanced" ? "bg-warning text-foreground" : "bg-success text-white"}`}
                  >
                    {" "}
                    {activeNode.difficulty} Level{" "}
                  </div>{" "}
                </div>{" "}
                <div className="mb-4">
                  {" "}
                  <div className="small text-muted text-uppercase fw-black mb-2 d-flex align-items-center gap-1">
                    <ChevronRight size={14} /> Prerequisites Required
                  </div>{" "}
                  {activeNode.prerequisites.length > 0 ? (
                    <div className="d-flex flex-wrap gap-2">
                      {" "}
                      {activeNode.prerequisites.map((prereq) => (
                        <span
                          key={prereq}
                          className="badge border text-secondary d-flex align-items-center gap-1"
                        >
                          {" "}
                          {unlockedCourses.includes(prereq) ? (
                            <CheckCircle2 size={12} className="text-success" />
                          ) : (
                            <Lock size={12} />
                          )}{" "}
                          {prereq}{" "}
                        </span>
                      ))}{" "}
                    </div>
                  ) : (
                    <span className="text-success fw-bold small">
                      None. Starter Course.
                    </span>
                  )}{" "}
                </div>{" "}
                <hr className="my-4" />{" "}
                <button
                  onClick={() =>
                    window.open(
                      `https://www.youtube.com/results?search_query=${encodeURIComponent(activeNode.courseCode + " " + activeNode.courseName + " lecture")}`,
                      "_blank",
                    )
                  }
                  className="btn btn-primary w-100 rounded-pill fw-bold py-3 shadow-sm d-flex justify-content-center align-items-center gap-2"
                >
                  {" "}
                  <BookOpen size={18} /> View Course Materials{" "}
                </button>{" "}
              </motion.div>
            ) : (
              <div className="bento-card p-5 h-100 d-flex flex-column align-items-center justify-content-center text-center">
                {" "}
                <BookOpen
                  size={48}
                  className="text-muted opacity-25 mb-3"
                />{" "}
                <h5 className="fw-bold text-muted">Select a Node</h5>{" "}
                <p className="small text-muted mb-0">
                  Click on a course in the skill tree to view its prerequisites
                  and syllabus.
                </p>{" "}
              </div>
            )}{" "}
          </AnimatePresence>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
};
export default SyllabusExplorer;
