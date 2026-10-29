import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { syllabusService } from "../../services/api.js";
import { BookOpen, ThumbsUp, ThumbsDown, CheckCircle } from "lucide-react";
import { useToast } from "../../context/ToastContext";
const CurriculumVoting = () => {
  const { addToast } = useToast();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchTopics();
  }, []);
  const fetchTopics = async () => {
    try {
      setLoading(true);
      const res = await syllabusService.getTopics();
      setTopics(res.data.data || []);
    } catch (err) {
      addToast("Failed to load topics", "error");
    } finally {
      setLoading(false);
    }
  };
  const handleVote = async (topicId, type) => {
    try {
      await syllabusService.voteTopic(topicId, type);
      addToast("Vote recorded!", "success");
      fetchTopics();
    } catch (err) {
      addToast(err.response?.data?.message || "Vote failed", "error");
    }
  };
  if (loading)
    return (
      <div className="container-fluid py-4 d-flex justify-content-center">
        <div className="spinner-border text-primary"></div>
      </div>
    );
  return (
    <div
      className="container-fluid py-5 px-xl-5"
      style={{
        background: "var(--bg)",
        minHeight: "100dvh",
        color: "var(--text)",
      }}
    >
      {" "}
      <div className="d-flex justify-content-between align-items-center mb-5 flex-wrap gap-4">
        {" "}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {" "}
          <h2
            className="fw-black mb-2 d-flex align-items-center gap-3"
            style={{ fontSize: "2.5rem", letterSpacing: "-0.03em" }}
          >
            {" "}
            <div
              className="d-flex align-items-center justify-content-center rounded-circle"
              style={{
                width: "56px",
                height: "56px",
                background:
                  "linear-gradient(135deg, rgba(var(--primary-rgb), 0.1), rgba(var(--primary-rgb), 0.2))",
                border: "1px solid rgba(var(--primary-rgb), 0.2)",
              }}
            >
              {" "}
              <BookOpen size={28} className="text-primary" />{" "}
            </div>{" "}
            Curriculum Tuner{" "}
          </h2>{" "}
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "1.1rem",
              maxWidth: "600px",
            }}
          >
            Help the university align its syllabus with what the industry
            actually needs. Vote on modules to keep or deprecate.
          </p>{" "}
        </motion.div>{" "}
      </div>{" "}
      <div className="row g-4">
        {" "}
        {topics.map((topic, i) => (
          <div className="col-md-6 col-lg-4" key={topic._id}>
            {" "}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-4 h-100 d-flex flex-column hover-glow"
              style={{
                background: "var(--surface)",
                borderRadius: "16px",
                border: "1px solid var(--border)",
              }}
            >
              {" "}
              <div
                className="mb-3 pb-3 border-bottom"
                style={{ borderColor: "var(--border) !important" }}
              >
                {" "}
                <h5 className="fw-bold mb-1" style={{ color: "var(--text)" }}>
                  {topic.topicName}
                </h5>{" "}
                <p
                  className="small mb-0 fw-semibold"
                  style={{ color: "var(--primary)" }}
                >
                  {topic.department}
                </p>{" "}
              </div>{" "}
              <div className="mt-auto d-flex gap-2">
                {" "}
                <button
                  className="btn flex-fill rounded-pill d-flex align-items-center justify-content-center gap-2 fw-bold transition-fast"
                  style={{
                    background: "rgba(var(--success-rgb), 0.1)",
                    color: "var(--success)",
                    border: "1px solid rgba(var(--success-rgb), 0.2)",
                  }}
                  onClick={() => handleVote(topic._id, "up")}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.background =
                      "rgba(var(--success-rgb), 0.2)")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.background =
                      "rgba(var(--success-rgb), 0.1)")
                  }
                >
                  {" "}
                  <ThumbsUp size={16} /> Keep / Add{" "}
                </button>{" "}
                <button
                  className="btn flex-fill rounded-pill d-flex align-items-center justify-content-center gap-2 fw-bold transition-fast"
                  style={{
                    background: "rgba(var(--danger-rgb), 0.1)",
                    color: "var(--danger)",
                    border: "1px solid rgba(var(--danger-rgb), 0.2)",
                  }}
                  onClick={() => handleVote(topic._id, "down")}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.background =
                      "rgba(var(--danger-rgb), 0.2)")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.background =
                      "rgba(var(--danger-rgb), 0.1)")
                  }
                >
                  {" "}
                  <ThumbsDown size={16} /> Deprecate{" "}
                </button>{" "}
              </div>{" "}
            </motion.div>{" "}
          </div>
        ))}{" "}
      </div>{" "}
    </div>
  );
};
export default CurriculumVoting;
