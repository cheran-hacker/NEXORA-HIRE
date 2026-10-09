import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { snippetService } from "../../services/api.js";
import {
  Flame,
  MessageSquare,
  Plus,
  ArrowUp,
  Code2,
  Terminal,
  ShieldAlert,
} from "lucide-react";
import { useToast } from "../../context/ToastContext";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
const CodeRoast = () => {
  const { addToast } = useToast();
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    language: "javascript",
    code: "",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [activeCommentId, setActiveCommentId] = useState(null);
  const [commentText, setCommentText] = useState("");
  useEffect(() => {
    fetchSnippets();
  }, []);
  const fetchSnippets = async () => {
    try {
      setLoading(true);
      const res = await snippetService.getSnippets();
      setSnippets(res.data.data || []);
    } catch (err) {
      addToast("Failed to load code roasts", "error");
    } finally {
      setLoading(false);
    }
  };
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.code.trim()) return addToast("Code cannot be empty", "error");
    try {
      setSubmitting(true);
      await snippetService.createSnippet(formData);
      addToast("Snippet submitted for roasting! 🔥", "success");
      setShowCreate(false);
      setFormData({
        title: "",
        language: "javascript",
        code: "",
        description: "",
      });
      fetchSnippets();
    } catch (err) {
      addToast("Failed to submit snippet", "error");
    } finally {
      setSubmitting(false);
    }
  };
  const handleRoast = async (snippetId) => {
    if (!commentText.trim()) return;
    try {
      await snippetService.roastSnippet(snippetId, commentText);
      addToast("Roast served! 🍖", "success");
      setCommentText("");
      setActiveCommentId(null);
      fetchSnippets();
    } catch (err) {
      addToast("Failed to post roast", "error");
    }
  };
  const handleUpvote = async (snippetId, roastId) => {
    try {
      await snippetService.upvoteRoast(snippetId, roastId); // Optimistically update
      setSnippets((prev) =>
        prev.map((s) => {
          if (s._id === snippetId) {
            return {
              ...s,
              roasts: s.roasts.map((r) =>
                r._id === roastId ? { ...r, upvotes: r.upvotes + 1 } : r,
              ),
            };
          }
          return s;
        }),
      );
    } catch (err) {
      addToast(err.response?.data?.message || "Already upvoted", "error");
    }
  };
  if (loading) {
    return (
      <div className="container-fluid py-4 d-flex justify-content-center">
        {" "}
        <div className="spinner-border text-danger"></div>{" "}
      </div>
    );
  }
  return (
    <div
      className="container-fluid py-4 px-xl-5"
      style={{
        background: "var(--bg)",
        minHeight: "100dvh",
        color: "var(--text)",
      }}
    >
      {" "}
      <div className="d-flex justify-content-between align-items-center mb-5 flex-wrap gap-3">
        {" "}
        <div>
          {" "}
          <h2
            className="fw-black mb-1 d-flex align-items-center gap-2"
            style={{
              fontSize: "2.5rem",
              letterSpacing: "-0.02em",
              color: "var(--text)",
            }}
          >
            {" "}
            Brutal Code Reviews <Flame className="text-danger" size={28} />{" "}
          </h2>{" "}
          <p
            className="mb-0 fw-medium d-flex align-items-center gap-2"
            style={{ color: "var(--text-secondary)" }}
          >
            {" "}
            <ShieldAlert size={16} className="text-warning" /> 100% Anonymous.
            Submit bad code, get roasted, learn to write better code.{" "}
          </p>{" "}
        </div>{" "}
        <button
          className="btn rounded-pill px-4 py-2 d-flex align-items-center gap-2 fw-bold shadow-sm hover-lift"
          onClick={() => setShowCreate(true)}
          style={{
            background: "linear-gradient(135deg, var(--danger), #ff7875)",
            color: "#fff",
            border: "none",
          }}
        >
          {" "}
          <Plus size={18} /> Submit Snippet{" "}
        </button>{" "}
      </div>{" "}
      <div className="row justify-content-center">
        {" "}
        <div className="col-lg-9 col-xl-8">
          {" "}
          {snippets.length > 0 ? (
            snippets.map((snippet, i) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bento-card p-4 mb-4"
                key={snippet._id}
              >
                {" "}
                <div className="d-flex align-items-start justify-content-between mb-3">
                  {" "}
                  <div>
                    {" "}
                    <h4 className="fw-bold mb-1">{snippet.title}</h4>{" "}
                    <p className="text-muted small mb-0">
                      {snippet.description}
                    </p>{" "}
                  </div>{" "}
                  <span className="badge bg-light border text-foreground rounded-pill px-3 py-1">
                    {" "}
                    {snippet.language}{" "}
                  </span>{" "}
                </div>{" "}
                <div
                  className="rounded-3 overflow-hidden mb-4 shadow-sm"
                  style={{ border: "1px solid var(--border)" }}
                >
                  {" "}
                  <SyntaxHighlighter
                    language={snippet.language}
                    style={vscDarkPlus}
                    customStyle={{
                      margin: 0,
                      padding: "1.5rem",
                      fontSize: "0.9rem",
                      borderRadius: 0,
                    }}
                  >
                    {" "}
                    {snippet.code}{" "}
                  </SyntaxHighlighter>{" "}
                </div>{" "}
                <div
                  className="border-top pt-4"
                  style={{ borderColor: "var(--border) !important" }}
                >
                  {" "}
                  <h6 className="fw-bold d-flex align-items-center gap-2 mb-3">
                    {" "}
                    <MessageSquare size={18} className="text-danger" /> Roasts (
                    {snippet.roasts?.length || 0}){" "}
                  </h6>{" "}
                  {snippet.roasts?.length > 0 ? (
                    <div className="d-flex flex-column gap-3 mb-4">
                      {" "}
                      {snippet.roasts
                        .sort((a, b) => b.upvotes - a.upvotes)
                        .map((roast) => (
                          <div
                            key={roast._id}
                            className="d-flex gap-3 p-3 rounded-3"
                            style={{
                              background: "var(--bg)",
                              border: "1px solid var(--border)",
                            }}
                          >
                            {" "}
                            <div className="d-flex flex-column align-items-center gap-1">
                              {" "}
                              <button
                                className="btn btn-sm btn-light rounded-circle p-1 hover-scale"
                                onClick={() =>
                                  handleUpvote(snippet._id, roast._id)
                                }
                              >
                                {" "}
                                <ArrowUp
                                  size={16}
                                  className="text-muted"
                                />{" "}
                              </button>{" "}
                              <span className="fw-bold small">
                                {roast.upvotes}
                              </span>{" "}
                            </div>{" "}
                            <div>
                              {" "}
                              <div className="fw-bold text-muted small mb-1">
                                Anonymous Reviewer
                              </div>{" "}
                              <p className="mb-0 fs-6">{roast.comment}</p>{" "}
                            </div>{" "}
                          </div>
                        ))}{" "}
                    </div>
                  ) : (
                    <p className="text-muted small fst-italic mb-4">
                      No roasts yet. Be the first to destroy this code.
                    </p>
                  )}{" "}
                  {activeCommentId === snippet._id ? (
                    <div className="d-flex gap-2">
                      {" "}
                      <textarea
                        className="form-control"
                        rows="2"
                        placeholder="Write your brutal (but constructive) review..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        autoFocus
                      ></textarea>{" "}
                      <div className="d-flex flex-column gap-2">
                        {" "}
                        <button
                          className="btn btn-danger px-3 h-50 rounded-3"
                          onClick={() => handleRoast(snippet._id)}
                        >
                          Post
                        </button>{" "}
                        <button
                          className="btn btn-light px-3 h-50 rounded-3"
                          onClick={() => {
                            setActiveCommentId(null);
                            setCommentText("");
                          }}
                        >
                          Cancel
                        </button>{" "}
                      </div>{" "}
                    </div>
                  ) : (
                    <button
                      className="btn btn-outline-danger rounded-pill px-4"
                      onClick={() => setActiveCommentId(snippet._id)}
                    >
                      {" "}
                      Add a Roast{" "}
                    </button>
                  )}{" "}
                </div>{" "}
              </motion.div>
            ))
          ) : (
            <div className="text-center py-5">
              {" "}
              <Terminal size={64} className="text-muted mb-3 opacity-50" />{" "}
              <h4 className="fw-bold text-muted">No snippets found</h4>{" "}
              <p className="text-muted">
                Submit your code to get roasted by the community.
              </p>{" "}
            </div>
          )}{" "}
        </div>{" "}
      </div>{" "}
      {/* Create Snippet Modal */}{" "}
      <AnimatePresence>
        {" "}
        {showCreate && (
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
            onClick={() => setShowCreate(false)}
          >
            {" "}
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bento-card p-0 overflow-hidden"
              style={{
                width: "90%",
                maxWidth: "700px",
                maxHeight: "90vh",
                display: "flex",
                flexDirection: "column",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {" "}
              <div
                className="p-4 border-bottom d-flex justify-content-between align-items-center"
                style={{
                  borderColor: "var(--border) !important",
                  background: "var(--surface-2)",
                }}
              >
                {" "}
                <h4 className="fw-bold mb-0 d-flex align-items-center gap-2">
                  {" "}
                  <Code2 className="text-danger" /> Submit Code for Review{" "}
                </h4>{" "}
                <button
                  className="btn-close"
                  onClick={() => setShowCreate(false)}
                ></button>{" "}
              </div>{" "}
              <div className="p-4 overflow-auto">
                {" "}
                <form onSubmit={handleCreate}>
                  {" "}
                  <div className="row mb-3">
                    {" "}
                    <div className="col-md-8">
                      {" "}
                      <label className="form-label fw-semibold">
                        Title <span className="text-danger">*</span>
                      </label>{" "}
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Why is this React component so slow?"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        required
                      />{" "}
                    </div>{" "}
                    <div className="col-md-4">
                      {" "}
                      <label className="form-label fw-semibold">
                        Language <span className="text-danger">*</span>
                      </label>{" "}
                      <select
                        className="form-select"
                        value={formData.language}
                        onChange={(e) =>
                          setFormData({ ...formData, language: e.target.value })
                        }
                      >
                        {" "}
                        <option value="javascript">
                          JavaScript / JSX
                        </option>{" "}
                        <option value="python">Python</option>{" "}
                        <option value="java">Java</option>{" "}
                        <option value="cpp">C++</option>{" "}
                        <option value="sql">SQL</option>{" "}
                        <option value="html">HTML/CSS</option>{" "}
                      </select>{" "}
                    </div>{" "}
                  </div>{" "}
                  <div className="mb-3">
                    {" "}
                    <label className="form-label fw-semibold">
                      Description (Context)
                    </label>{" "}
                    <input
                      type="text"
                      className="form-control"
                      placeholder="I wrote this for a hackathon at 3 AM. It works but..."
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                    />{" "}
                  </div>{" "}
                  <div className="mb-4">
                    {" "}
                    <label className="form-label fw-semibold d-flex justify-content-between">
                      {" "}
                      <span>
                        Code <span className="text-danger">*</span>
                      </span>{" "}
                      <span className="text-muted small fw-normal">
                        Will be syntax highlighted
                      </span>{" "}
                    </label>{" "}
                    <textarea
                      className="form-control font-monospace"
                      rows="10"
                      placeholder="Paste your horrible code here..."
                      style={{
                        fontSize: "0.85rem",
                        background: "var(--surface-2)",
                      }}
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({ ...formData, code: e.target.value })
                      }
                      required
                    ></textarea>{" "}
                  </div>{" "}
                  <div
                    className="d-flex justify-content-between align-items-center pt-3 border-top"
                    style={{ borderColor: "var(--border) !important" }}
                  >
                    {" "}
                    <span className="text-muted small d-flex align-items-center gap-1">
                      <ShieldAlert size={14} /> Posted anonymously
                    </span>{" "}
                    <div className="d-flex gap-2">
                      {" "}
                      <button
                        type="button"
                        className="btn btn-light rounded-pill px-4"
                        onClick={() => setShowCreate(false)}
                      >
                        Cancel
                      </button>{" "}
                      <button
                        type="submit"
                        className="btn btn-danger rounded-pill px-4 fw-bold"
                        disabled={submitting}
                      >
                        {" "}
                        {submitting ? "Submitting..." : "Submit Code"}{" "}
                      </button>{" "}
                    </div>{" "}
                  </div>{" "}
                </form>{" "}
              </div>{" "}
            </motion.div>{" "}
          </motion.div>
        )}{" "}
      </AnimatePresence>{" "}
    </div>
  );
};
export default CodeRoast;
