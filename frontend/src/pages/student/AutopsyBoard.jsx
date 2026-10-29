import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { autopsyService } from "../../services/api.js";
import {
  Stethoscope,
  AlertOctagon,
  ArrowUp,
  Plus,
  Frown,
  BookOpen,
  Search,
} from "lucide-react";
import { useToast } from "../../context/ToastContext";
const AutopsyBoard = () => {
  const { addToast } = useToast();
  const [autopsies, setAutopsies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    projectName: "",
    whatWentWrong: "",
    rootCause: "",
    lessonsLearned: "",
  });
  useEffect(() => {
    fetchAutopsies();
  }, []);
  const fetchAutopsies = async () => {
    try {
      setLoading(true);
      const res = await autopsyService.getAutopsies();
      setAutopsies(res.data.data || []);
    } catch (err) {
      addToast("Failed to load autopsies", "error");
    } finally {
      setLoading(false);
    }
  };
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await autopsyService.createAutopsy(formData);
      addToast("Post-Mortem published! 📉", "success");
      setShowAdd(false);
      setFormData({
        projectName: "",
        whatWentWrong: "",
        rootCause: "",
        lessonsLearned: "",
      });
      fetchAutopsies();
    } catch (err) {
      addToast("Failed to publish autopsy", "error");
    }
  };
  const handleUpvote = async (id) => {
    try {
      await autopsyService.upvoteAutopsy(id);
      fetchAutopsies(); // Refresh to get new count
    } catch (err) {
      addToast("Failed to upvote", "error");
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
            Project Autopsy Board <Stethoscope size={28} />{" "}
          </h2>{" "}
          <p className="text-muted mb-0">
            Share your biggest failures, crashed databases, and spaghetti code.
            True engineers learn from mistakes.
          </p>{" "}
        </div>{" "}
        <button
          className="btn btn-primary rounded-pill px-4 shadow-sm"
          onClick={() => setShowAdd(true)}
        >
          {" "}
          <Plus size={20} className="me-2" /> Write a Post-Mortem{" "}
        </button>{" "}
      </div>{" "}
      <div className="row g-4">
        {" "}
        {autopsies.map((autopsy, i) => (
          <div className="col-12" key={autopsy._id}>
            {" "}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bento-card p-4 d-flex gap-4"
            >
              {" "}
              <div className="d-flex flex-column align-items-center">
                {" "}
                <button
                  className="btn btn-light rounded-circle shadow-sm d-flex align-items-center justify-content-center mb-2 text-muted hover-primary"
                  style={{ width: 48, height: 48 }}
                  onClick={() => handleUpvote(autopsy._id)}
                >
                  {" "}
                  <ArrowUp size={24} />{" "}
                </button>{" "}
                <span className="fw-black fs-5 text-foreground">
                  {autopsy.upvotes}
                </span>{" "}
              </div>{" "}
              <div className="flex-grow-1">
                {" "}
                <div className="d-flex justify-content-between align-items-start mb-3">
                  {" "}
                  <div>
                    {" "}
                    <h4 className="fw-bold mb-1 text-danger d-flex align-items-center gap-2">
                      {" "}
                      <AlertOctagon size={20} /> Project:{" "}
                      {autopsy.projectName}{" "}
                    </h4>{" "}
                    <div className="text-muted small fw-bold">
                      Autopsy by {autopsy.author?.name} •{" "}
                      {new Date(autopsy.createdAt).toLocaleDateString()}
                    </div>{" "}
                  </div>{" "}
                </div>{" "}
                <div className="row g-4">
                  {" "}
                  <div className="col-md-4">
                    {" "}
                    <h6 className="fw-bold text-foreground d-flex align-items-center gap-2">
                      <Frown size={16} className="text-muted" /> What went
                      wrong?
                    </h6>{" "}
                    <p className="small text-muted mb-0 bg-light p-3 rounded-3 h-100">
                      {autopsy.whatWentWrong}
                    </p>{" "}
                  </div>{" "}
                  <div className="col-md-4">
                    {" "}
                    <h6 className="fw-bold text-foreground d-flex align-items-center gap-2">
                      <Search size={16} className="text-muted" /> Root Cause
                    </h6>{" "}
                    <p className="small text-muted mb-0 bg-light p-3 rounded-3 h-100">
                      {autopsy.rootCause}
                    </p>{" "}
                  </div>{" "}
                  <div className="col-md-4">
                    {" "}
                    <h6 className="fw-bold text-foreground d-flex align-items-center gap-2">
                      <BookOpen size={16} className="text-success" /> Lessons
                      Learned
                    </h6>{" "}
                    <p className="small text-muted mb-0 bg-success-subtle text-success-emphasis p-3 rounded-3 h-100 fw-bold">
                      {autopsy.lessonsLearned}
                    </p>{" "}
                  </div>{" "}
                </div>{" "}
              </div>{" "}
            </motion.div>{" "}
          </div>
        ))}{" "}
        {autopsies.length === 0 && (
          <div className="col-12 text-center p-5 bento-card ">
            {" "}
            <Stethoscope
              size={48}
              className="text-muted mb-3 opacity-25 mx-auto"
            />{" "}
            <h5 className="fw-bold text-muted">No autopsies yet.</h5>{" "}
            <p className="text-muted small">
              Everyone is writing perfect code? Highly doubtful.
            </p>{" "}
          </div>
        )}{" "}
      </div>{" "}
      {/* Write Autopsy Modal */}{" "}
      <AnimatePresence>
        {" "}
        {showAdd && (
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
              overflowY: "auto",
            }}
          >
            {" "}
            <div
              className="bento-card bg-card p-4 my-4"
              style={{ width: "90%", maxWidth: "600px" }}
            >
              {" "}
              <h4 className="fw-bold mb-4 d-flex align-items-center gap-2">
                {" "}
                <AlertOctagon className="text-danger" /> Write Post-Mortem{" "}
              </h4>{" "}
              <form onSubmit={handleCreate}>
                {" "}
                <div className="mb-3">
                  {" "}
                  <label className="form-label fw-bold">
                    Project / Feature Name
                  </label>{" "}
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={formData.projectName}
                    onChange={(e) =>
                      setFormData({ ...formData, projectName: e.target.value })
                    }
                    placeholder="e.g. Campus Social Network DB"
                  />{" "}
                </div>{" "}
                <div className="mb-3">
                  {" "}
                  <label className="form-label fw-bold">
                    What went wrong?
                  </label>{" "}
                  <textarea
                    className="form-control"
                    rows="2"
                    required
                    value={formData.whatWentWrong}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        whatWentWrong: e.target.value,
                      })
                    }
                    placeholder="e.g. The database crashed completely 5 minutes after launch."
                  ></textarea>{" "}
                </div>{" "}
                <div className="mb-3">
                  {" "}
                  <label className="form-label fw-bold">
                    Root Cause (The 'Why')
                  </label>{" "}
                  <textarea
                    className="form-control"
                    rows="3"
                    required
                    value={formData.rootCause}
                    onChange={(e) =>
                      setFormData({ ...formData, rootCause: e.target.value })
                    }
                    placeholder="e.g. I used an O(n^2) query inside a loop, causing a massive memory leak under load."
                  ></textarea>{" "}
                </div>{" "}
                <div className="mb-4">
                  {" "}
                  <label className="form-label fw-bold text-success">
                    Lessons Learned
                  </label>{" "}
                  <textarea
                    className="form-control bg-success-subtle border-success"
                    rows="3"
                    required
                    value={formData.lessonsLearned}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        lessonsLearned: e.target.value,
                      })
                    }
                    placeholder="e.g. I need to index my database tables and use .populate() efficiently."
                  ></textarea>{" "}
                </div>{" "}
                <div className="d-flex justify-content-end gap-2">
                  {" "}
                  <button
                    type="button"
                    className="btn btn-light rounded-pill px-4"
                    onClick={() => setShowAdd(false)}
                  >
                    Cancel
                  </button>{" "}
                  <button
                    type="submit"
                    className="btn btn-danger rounded-pill px-4"
                  >
                    Publish Failure
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
export default AutopsyBoard;
