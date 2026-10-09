import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { researchmatchService } from "../../services/api.js";
import {
  FlaskConical,
  ThumbsUp,
  ThumbsDown,
  GraduationCap,
  Tag,
} from "lucide-react";
import { useToast } from "../../context/ToastContext";
const ResearchMatch = () => {
  const { addToast } = useToast();
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  useEffect(() => {
    fetchPapers();
  }, []);
  const fetchPapers = async () => {
    try {
      setLoading(true);
      const res = await researchmatchService.getPapers();
      setPapers(res.data.data || []);
    } catch (err) {
      addToast("Failed to load research papers", "error");
    } finally {
      setLoading(false);
    }
  };
  const handleSwipe = async (action) => {
    const paper = papers[currentIndex];
    if (!paper) return;
    try {
      await researchmatchService.swipePaper(paper._id, action);
      if (action === "right")
        addToast("Application Sent to Professor! 🎓", "success");
      setCurrentIndex((prev) => prev + 1);
    } catch (err) {
      addToast("Swipe action failed", "error");
    }
  };
  if (loading)
    return (
      <div className="container-fluid py-4 d-flex justify-content-center">
        <div className="spinner-border text-primary"></div>
      </div>
    );
  const currentPaper = papers[currentIndex];
  return (
    <div className="container-fluid py-4 px-xl-5" style={{ minHeight: "80vh" }}>
      {" "}
      <div className="d-flex justify-content-between align-items-center mb-5 flex-wrap gap-3">
        {" "}
        <div>
          {" "}
          <h2 className="fw-black mb-1 text-info d-flex align-items-center gap-2">
            {" "}
            Research Matchmaking <FlaskConical size={28} />{" "}
          </h2>{" "}
          <p className="text-muted mb-0">
            Swipe right on professor research projects to instantly apply as an
            RA.
          </p>{" "}
        </div>{" "}
      </div>{" "}
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "60vh" }}
      >
        {" "}
        <AnimatePresence mode="wait">
          {" "}
          {currentPaper ? (
            <motion.div
              key={currentPaper._id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0, x: 200 }}
              className="bento-card border border-info border-2 shadow-lg d-flex flex-column"
              style={{ width: "100%", maxWidth: "450px", height: "500px" }}
            >
              {" "}
              <div className="bg-info bg-opacity-10 p-4 border-bottom border-info text-center position-relative">
                {" "}
                {currentPaper.matchScore !== undefined && (
                  <div className="position-absolute top-0 end-0 m-3 badge bg-success fs-6 rounded-pill shadow-sm">
                    {" "}
                    {currentPaper.matchScore}% Match{" "}
                  </div>
                )}{" "}
                <GraduationCap size={48} className="text-info mb-2" />{" "}
                <h5 className="fw-bold text-foreground mb-0">
                  {currentPaper.professorName}
                </h5>{" "}
              </div>{" "}
              <div className="p-4 flex-grow-1 d-flex flex-column justify-content-center">
                {" "}
                <h3 className="fw-black text-foreground text-center mb-4">
                  {currentPaper.title}
                </h3>{" "}
                <p className="text-muted text-center fs-5 mb-4">
                  {currentPaper.abstract}
                </p>{" "}
                <div className="d-flex flex-wrap justify-content-center gap-2 mt-auto">
                  {" "}
                  {currentPaper.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="badge bg-light text-foreground border d-flex align-items-center gap-1"
                    >
                      <Tag size={12} /> {tag}
                    </span>
                  ))}{" "}
                </div>{" "}
              </div>{" "}
              <div className="bg-light p-4 border-top d-flex justify-content-around">
                {" "}
                <button
                  className="btn btn-outline-danger rounded-circle shadow-sm"
                  style={{ width: "60px", height: "60px" }}
                  onClick={() => handleSwipe("left")}
                >
                  {" "}
                  <ThumbsDown size={28} />{" "}
                </button>{" "}
                <button
                  className="btn btn-info text-foreground rounded-circle shadow-lg"
                  style={{ width: "60px", height: "60px" }}
                  onClick={() => handleSwipe("right")}
                >
                  {" "}
                  <ThumbsUp size={28} />{" "}
                </button>{" "}
              </div>{" "}
            </motion.div>
          ) : (
            <div className="text-center text-muted">
              {" "}
              <FlaskConical size={64} className="mb-3 opacity-25" />{" "}
              <h4>No more research papers available.</h4>{" "}
              <p>Check back later for new professor projects.</p>{" "}
            </div>
          )}{" "}
        </AnimatePresence>{" "}
      </div>{" "}
    </div>
  );
};
export default ResearchMatch;
