import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { challengeService } from "../../services/api.js";
import { Target, Trophy, Building2, Terminal, Play, X } from "lucide-react";
import { useToast } from "../../context/ToastContext";
const InnovationChallenges = () => {
  const { addToast } = useToast();
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChallenge, setActiveChallenge] = useState(null);
  const [codeContent, setCodeContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    fetchChallenges();
  }, []);
  const fetchChallenges = async () => {
    try {
      const res = await challengeService.getChallenges();
      setChallenges(res.data.data || []);
    } catch (err) {
      addToast("Failed to load challenges", "error");
    } finally {
      setLoading(false);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!codeContent.trim()) return addToast("Code cannot be empty", "error");
    try {
      setSubmitting(true);
      const res = await challengeService.submitChallenge(activeChallenge, {
        code: codeContent,
      });
      addToast(res.data.message || "Solution accepted!", "success");
      setCodeContent("");
      setActiveChallenge(null);
      fetchChallenges();
    } catch (err) {
      addToast(err.response?.data?.message || "Submission failed", "error");
    } finally {
      setSubmitting(false);
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
      <div className="mb-5">
        {" "}
        <h2 className="fw-black mb-1 text-danger d-flex align-items-center gap-2">
          {" "}
          Open Innovation <Target size={28} />{" "}
        </h2>{" "}
        <p className="text-muted mb-0">
          Solve real-world corporate problem statements to win cash bounties and
          internships.
        </p>{" "}
      </div>{" "}
      <div className="row g-4">
        {" "}
        {challenges.map((chal) => (
          <div className="col-lg-6" key={chal._id}>
            {" "}
            <div className="bento-card bg-card text-foreground p-4 h-100 shadow-lg border border-danger border-2 position-relative overflow-hidden">
              {" "}
              <div className="position-absolute top-0 end-0 p-4 opacity-10">
                {" "}
                <Building2 size={100} />{" "}
              </div>{" "}
              <div className="badge bg-danger mb-3 px-3 py-2 fs-6 rounded-pill d-inline-flex align-items-center gap-2 shadow-sm">
                {" "}
                <Trophy size={16} /> Bounty: {chal.bounty}{" "}
              </div>{" "}
              <h3 className="fw-black text-foreground mb-2">
                {chal.company} Challenge
              </h3>{" "}
              <p className="text-foreground-50 fs-5 mb-4 position-relative z-1">
                {chal.problemStatement}
              </p>{" "}
              <div className="d-flex justify-content-between align-items-end mt-auto position-relative z-1">
                {" "}
                <div className="text-foreground-50 small fw-bold">
                  {chal.submissions?.length || 0} Solutions Submitted
                </div>{" "}
                <button
                  className="btn btn-danger fw-bold rounded-pill px-4"
                  onClick={() => setActiveChallenge(chal._id)}
                >
                  {" "}
                  Solve Challenge{" "}
                </button>{" "}
              </div>{" "}
            </div>{" "}
          </div>
        ))}{" "}
      </div>{" "}
      <AnimatePresence>
        {" "}
        {activeChallenge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-backdrop-blur"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "rgba(0,0,0,0.02)",
              zIndex: 1050,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {" "}
            <div
              className="bento-card bg-card border shadow-lg"
              style={{ width: "90%", maxWidth: "800px" }}
            >
              {" "}
              <div className="p-3 border-bottom border d-flex justify-content-between align-items-center">
                {" "}
                <h5 className="fw-bold text-foreground mb-0 d-flex align-items-center gap-2">
                  <Terminal size={20} className="text-danger" /> Submit Solution
                </h5>{" "}
                <button
                  className="btn btn-sm text-secondary"
                  onClick={() => setActiveChallenge(null)}
                >
                  <X size={20} />
                </button>{" "}
              </div>{" "}
              <form onSubmit={handleSubmit} className="p-4">
                {" "}
                <div className="mb-4">
                  {" "}
                  <label className="form-label small fw-bold text-secondary">
                    Write or Paste your Code
                  </label>{" "}
                  <textarea
                    className="form-control bg-card text-foreground font-monospace"
                    rows="15"
                    placeholder="// Write your logic here..."
                    style={{ borderColor: "var(--border)" }}
                    value={codeContent}
                    onChange={(e) => setCodeContent(e.target.value)}
                    required
                  ></textarea>{" "}
                  <div className="small text-muted mt-2">
                    Your code will be automatically executed against hidden test
                    cases.
                  </div>{" "}
                </div>{" "}
                <div className="d-flex justify-content-end gap-2">
                  {" "}
                  <button
                    type="button"
                    className="btn btn-outline-secondary rounded-pill px-4"
                    onClick={() => setActiveChallenge(null)}
                  >
                    Cancel
                  </button>{" "}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn btn-danger rounded-pill px-4 fw-bold d-flex align-items-center gap-2"
                  >
                    {" "}
                    <Play size={16} />{" "}
                    {submitting ? "Running Tests..." : "Run & Submit"}{" "}
                  </button>{" "}
                </div>{" "}
              </form>{" "}
            </div>{" "}
          </motion.div>
        )}{" "}
      </AnimatePresence>{" "}
    </div>
  );
};
export default InnovationChallenges;
