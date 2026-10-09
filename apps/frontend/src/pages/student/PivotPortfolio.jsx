import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { pivotService } from "../../services/api.js";
import {
  AlertCircle,
  Plus,
  BookOpen,
  Lightbulb,
  TrendingUp,
} from "lucide-react";
import { useToast } from "../../context/ToastContext";
const PivotPortfolio = () => {
  const { addToast } = useToast();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    failureTitle: "",
    context: "",
    whatWentWrong: "",
    keyTakeaway: "",
  });
  useEffect(() => {
    fetchRecords();
  }, []);
  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await pivotService.getPivotRecords();
      setRecords(res.data.data || []);
    } catch (err) {
      addToast("Failed to load pivot portfolio", "error");
    } finally {
      setLoading(false);
    }
  };
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await pivotService.createPivotRecord(formData);
      addToast("Failure logged as a learning experience! 🌱", "success");
      setShowAdd(false);
      setFormData({
        failureTitle: "",
        context: "",
        whatWentWrong: "",
        keyTakeaway: "",
      });
      fetchRecords();
    } catch (err) {
      addToast("Failed to log record", "error");
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
            The Pivot Portfolio{" "}
            <TrendingUp size={28} className="text-primary" />{" "}
          </h2>{" "}
          <p
            className="mb-0 fw-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            Destigmatize failure. Showcase your resilience and what you learned
            when things didn't go to plan.
          </p>{" "}
        </div>{" "}
        <button
          className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm hover-lift d-flex align-items-center gap-2"
          onClick={() => setShowAdd(true)}
          style={{
            background:
              "linear-gradient(135deg, var(--primary), var(--purple))",
            border: "none",
          }}
        >
          {" "}
          <Plus size={20} /> Log an Experience{" "}
        </button>{" "}
      </div>{" "}
      <div className="row">
        {" "}
        <div className="col-lg-10 mx-auto">
          {" "}
          {records.length > 0 ? (
            <div className="position-relative">
              {" "}
              {/* Timeline Line */}{" "}
              <div
                className="position-absolute"
                style={{
                  left: "24px",
                  top: 0,
                  bottom: 0,
                  width: "4px",
                  background: "var(--border)",
                }}
              ></div>{" "}
              {records.map((record, i) => (
                <motion.div
                  key={record._id}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="position-relative mb-5 ps-5"
                >
                  {" "}
                  <div
                    className="position-absolute rounded-circle shadow-sm d-flex align-items-center justify-content-center"
                    style={{
                      left: "6px",
                      top: "16px",
                      width: "40px",
                      height: "40px",
                      zIndex: 1,
                      background: "var(--surface)",
                      border: "3px solid var(--primary)",
                    }}
                  >
                    {" "}
                    <AlertCircle size={20} className="text-primary" />{" "}
                  </div>{" "}
                  <div
                    className="glass-panel p-4 hover-scale"
                  >
                    {" "}
                    <div className="d-flex justify-content-between align-items-start mb-4">
                      {" "}
                      <div>
                        {" "}
                        <h4
                          className="fw-black mb-1"
                          style={{ color: "var(--text)" }}
                        >
                          {record.failureTitle}
                        </h4>{" "}
                        <span
                          className="small fw-semibold"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {new Date(record.dateOfFailure).toLocaleDateString()}
                        </span>{" "}
                      </div>{" "}
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center fw-bold fs-5 shadow-sm"
                        style={{
                          width: 48,
                          height: 48,
                          background: "rgba(var(--primary-rgb), 0.2)",
                          color: "var(--primary)",
                          border: "1px solid var(--primary)",
                        }}
                      >
                        {" "}
                        {record.student?.name?.charAt(0) || "U"}{" "}
                      </div>{" "}
                    </div>{" "}
                    <div className="row g-4">
                      {" "}
                      <div className="col-md-6">
                        {" "}
                        <div className="d-flex align-items-center gap-2 mb-2">
                          {" "}
                          <BookOpen size={16} className="text-muted" />{" "}
                          <h6 className="fw-bold mb-0 text-muted">
                            The Context
                          </h6>{" "}
                        </div>{" "}
                        <p className="small mb-0 p-3 bg-light rounded-3">
                          {record.context}
                        </p>{" "}
                      </div>{" "}
                      <div className="col-md-6">
                        {" "}
                        <div className="d-flex align-items-center gap-2 mb-2">
                          {" "}
                          <AlertCircle size={16} className="text-danger" />{" "}
                          <h6 className="fw-bold mb-0 text-danger">
                            What Went Wrong
                          </h6>{" "}
                        </div>{" "}
                        <p className="small mb-0 p-3 bg-danger-subtle text-danger-emphasis rounded-3">
                          {record.whatWentWrong}
                        </p>{" "}
                      </div>{" "}
                      <div className="col-12 mt-4">
                        {" "}
                        <div className="rounded-4 bg-success-subtle border-0 p-4">
                          {" "}
                          <div className="d-flex align-items-center gap-2 mb-2">
                            {" "}
                            <Lightbulb
                              size={20}
                              className="text-success"
                            />{" "}
                            <h5 className="fw-bold mb-0 text-success">
                              Key Takeaway
                            </h5>{" "}
                          </div>{" "}
                          <p className="mb-0 fw-semibold text-success-emphasis">
                            {record.keyTakeaway}
                          </p>{" "}
                        </div>{" "}
                      </div>{" "}
                    </div>{" "}
                  </div>{" "}
                </motion.div>
              ))}{" "}
            </div>
          ) : (
            <div
              className="text-center p-5 rounded-4 shadow-sm"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
              }}
            >
              {" "}
              <TrendingUp
                size={48}
                className="text-muted mb-3 opacity-50"
              />{" "}
              <h5 className="fw-bold">No records yet.</h5>{" "}
              <p className="text-muted">
                Start building your resilience portfolio by logging your first
                learning experience.
              </p>{" "}
            </div>
          )}{" "}
        </div>{" "}
      </div>{" "}
      {/* Add Record Modal */}{" "}
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
              className="rounded-4 p-4 my-4 shadow-lg border"
              style={{
                width: "90%",
                maxWidth: "600px",
                background: "var(--surface)",
                borderColor: "var(--border)",
              }}
            >
              {" "}
              <h4 className="fw-bold mb-4" style={{ color: "var(--text)" }}>
                Log a Learning Experience
              </h4>{" "}
              <form onSubmit={handleCreate}>
                {" "}
                <div className="mb-3">
                  {" "}
                  <label className="form-label fw-bold">Title</label>{" "}
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={formData.failureTitle}
                    onChange={(e) =>
                      setFormData({ ...formData, failureTitle: e.target.value })
                    }
                    placeholder="e.g. Rejected from Y Combinator, Failed DB Exam"
                  />{" "}
                </div>{" "}
                <div className="mb-3">
                  {" "}
                  <label className="form-label fw-bold text-muted">
                    <BookOpen size={14} className="me-1" /> The Context
                  </label>{" "}
                  <textarea
                    className="form-control bg-light"
                    rows="2"
                    required
                    value={formData.context}
                    onChange={(e) =>
                      setFormData({ ...formData, context: e.target.value })
                    }
                    placeholder="What were you trying to achieve?"
                  ></textarea>{" "}
                </div>{" "}
                <div className="mb-3">
                  {" "}
                  <label className="form-label fw-bold text-danger">
                    <AlertCircle size={14} className="me-1" /> What Went Wrong
                  </label>{" "}
                  <textarea
                    className="form-control border-danger-subtle bg-danger-subtle bg-opacity-25 text-danger-emphasis"
                    rows="3"
                    required
                    value={formData.whatWentWrong}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        whatWentWrong: e.target.value,
                      })
                    }
                    placeholder="Be honest. Did you procrastinate? Did the code break? Did the team split?"
                  ></textarea>{" "}
                </div>{" "}
                <div className="mb-4">
                  {" "}
                  <label className="form-label fw-bold text-success">
                    <Lightbulb size={14} className="me-1" /> Key Takeaway
                  </label>{" "}
                  <textarea
                    className="form-control border-success-subtle bg-success-subtle bg-opacity-25 fw-semibold text-success-emphasis"
                    rows="3"
                    required
                    value={formData.keyTakeaway}
                    onChange={(e) =>
                      setFormData({ ...formData, keyTakeaway: e.target.value })
                    }
                    placeholder="What did you learn? How has this made you a better professional?"
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
                    className="btn btn-primary rounded-pill px-4"
                  >
                    Publish Pivot
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
export default PivotPortfolio;
