import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { smartResumeService } from "../../services/api.js";
import {
  FileCode,
  Settings,
  Plus,
  Link as LinkIcon,
  Trash2,
  Eye,
  EyeOff,
  Layout,
} from "lucide-react";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
const SmartResume = () => {
  const { addToast } = useToast();
  const { user } = useAuth();
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    ruleName: "",
    urlParameter: "",
    highlightedSkills: "",
    hiddenSections: "",
  });
  useEffect(() => {
    fetchRules();
  }, []);
  const fetchRules = async () => {
    try {
      setLoading(true);
      const res = await smartResumeService.getRules();
      setRules(res.data.data || []);
    } catch (err) {
      addToast("Failed to load routing rules", "error");
    } finally {
      setLoading(false);
    }
  };
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const formattedData = {
        ruleName: formData.ruleName,
        urlParameter: formData.urlParameter,
        highlightedSkills: formData.highlightedSkills
          .split(",")
          .map((s) => s.trim()),
        hiddenSections: formData.hiddenSections.split(",").map((s) => s.trim()),
      };
      await smartResumeService.createRule(formattedData);
      addToast("Dynamic route created!", "success");
      setShowAdd(false);
      setFormData({
        ruleName: "",
        urlParameter: "",
        highlightedSkills: "",
        hiddenSections: "",
      });
      fetchRules();
    } catch (err) {
      addToast("Failed to create rule", "error");
    }
  };
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this routing rule?")) return;
    try {
      await smartResumeService.deleteRule(id);
      addToast("Rule deleted", "success");
      fetchRules();
    } catch (err) {
      addToast("Failed to delete rule", "error");
    }
  };
  if (loading)
    return (
      <div className="container-fluid py-4 d-flex justify-content-center">
        <div className="spinner-border text-primary"></div>
      </div>
    );
  return (
    <div className="container-fluid py-4">
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
              <FileCode size={28} className="text-primary" />{" "}
            </div>{" "}
            Smart Resumes{" "}
          </h2>{" "}
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "1.1rem",
              maxWidth: "600px",
            }}
          >
            One profile, infinite variations. Set rules to dynamically alter
            your public portfolio based on the URL parameter.
          </p>{" "}
        </motion.div>{" "}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="btn btn-primary d-flex align-items-center gap-2 fw-bold hover-glow"
          style={{
            padding: "12px 24px",
            borderRadius: "12px",
            transition: "all 0.3s ease",
          }}
          onClick={() => setShowAdd(true)}
        >
          {" "}
          <Plus size={20} /> Create New Rule{" "}
        </motion.button>{" "}
      </div>{" "}
      {/* Info Card */}{" "}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 mb-5 position-relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(var(--primary-rgb), 0.05), rgba(var(--secondary-rgb), 0.05))",
          borderRadius: "16px",
          border: "1px solid rgba(var(--primary-rgb), 0.1)",
        }}
      >
        {" "}
        <div
          className="position-absolute rounded-circle"
          style={{
            top: "-50%",
            right: "-5%",
            width: "300px",
            height: "300px",
            background:
              "radial-gradient(circle, rgba(var(--primary-rgb),0.1) 0%, transparent 70%)",
            filter: "blur(40px)",
            zIndex: 0,
          }}
        ></div>{" "}
        <div className="position-relative z-1">
          {" "}
          <h5
            className="fw-bold d-flex align-items-center gap-2 mb-3"
            style={{ color: "var(--primary)" }}
          >
            <Layout size={20} /> How it works
          </h5>{" "}
          <p className="mb-2" style={{ color: "var(--text)" }}>
            Your public portfolio URL is:{" "}
            <code
              className="px-2 py-1 rounded"
              style={{
                background: "rgba(var(--text-rgb), 0.1)",
                color: "var(--text)",
              }}
            >
              http://localhost:3000/p/{user?._id || "your-id"}
            </code>
          </p>{" "}
          <p className="mb-0 small" style={{ color: "var(--text-secondary)" }}>
            If you create a rule with parameter{" "}
            <strong style={{ color: "var(--text)" }}>company=google</strong>,
            and send a recruiter the link{" "}
            <code
              className="px-2 py-1 rounded mx-1"
              style={{
                background: "rgba(var(--text-rgb), 0.1)",
                color: "var(--text)",
              }}
            >
              http://localhost:3000/p/{user?._id || "your-id"}?company=google
            </code>
            , the page will dynamically re-render itself based on your settings
            below (e.g., hiding design projects, bumping Python to the top).
          </p>{" "}
        </div>{" "}
      </motion.div>{" "}
      <div className="row g-4">
        {" "}
        {rules.map((rule, i) => (
          <div className="col-lg-6" key={rule._id}>
            {" "}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{
                scale: 1.02,
                y: -5,
                boxShadow: "0 20px 40px rgba(0,0,0,0.02)",
              }}
              className="h-100 overflow-hidden rounded-4 shadow-sm cursor-pointer transition-fast hover-glow"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
              }}
            >
              {" "}
              <div
                className="p-4 d-flex justify-content-between align-items-center"
                style={{ borderBottom: "1px solid var(--border)" }}
              >
                {" "}
                <div>
                  {" "}
                  <div
                    className="fw-bold fs-5 mb-1"
                    style={{ color: "var(--text)" }}
                  >
                    {rule.ruleName}
                  </div>{" "}
                  <div
                    className="d-flex align-items-center gap-2 font-monospace small px-2 py-1 rounded"
                    style={{
                      background: "var(--surface-2)",
                      color: "var(--text-secondary)",
                      display: "inline-flex",
                    }}
                  >
                    {" "}
                    <LinkIcon size={14} /> ?{rule.urlParameter}{" "}
                  </div>{" "}
                </div>{" "}
                <button
                  className="btn btn-icon d-flex align-items-center justify-content-center rounded-circle"
                  style={{
                    width: "40px",
                    height: "40px",
                    background: "rgba(var(--danger-rgb), 0.1)",
                    color: "var(--danger)",
                    border: "none",
                    transition: "all 0.2s",
                  }}
                  onClick={() => handleDelete(rule._id)}
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
                  <Trash2 size={18} />{" "}
                </button>{" "}
              </div>{" "}
              <div className="p-4 row g-4">
                {" "}
                <div
                  className="col-sm-6"
                  style={{ borderRight: "1px solid var(--border)" }}
                >
                  {" "}
                  <h6
                    className="fw-bold d-flex align-items-center gap-2 mb-3"
                    style={{ color: "var(--success)" }}
                  >
                    <Eye size={16} /> Highlight Skills
                  </h6>{" "}
                  <div className="d-flex flex-wrap gap-2">
                    {" "}
                    {rule.highlightedSkills?.map((skill, j) => (
                      <span
                        key={j}
                        className="badge rounded-pill fw-semibold"
                        style={{
                          background: "rgba(var(--success-rgb), 0.1)",
                          color: "var(--success)",
                          padding: "6px 12px",
                        }}
                      >
                        {skill}
                      </span>
                    ))}{" "}
                    {(!rule.highlightedSkills ||
                      rule.highlightedSkills.length === 0) && (
                      <span
                        style={{
                          color: "var(--text-muted)",
                          fontSize: "0.9rem",
                        }}
                      >
                        None
                      </span>
                    )}{" "}
                  </div>{" "}
                </div>{" "}
                <div className="col-sm-6">
                  {" "}
                  <h6
                    className="fw-bold d-flex align-items-center gap-2 mb-3"
                    style={{ color: "var(--danger)" }}
                  >
                    <EyeOff size={16} /> Hide Sections
                  </h6>{" "}
                  <div className="d-flex flex-wrap gap-2">
                    {" "}
                    {rule.hiddenSections?.map((section, j) => (
                      <span
                        key={j}
                        className="badge rounded-pill fw-semibold"
                        style={{
                          background: "rgba(var(--danger-rgb), 0.1)",
                          color: "var(--danger)",
                          padding: "6px 12px",
                        }}
                      >
                        {section}
                      </span>
                    ))}{" "}
                    {(!rule.hiddenSections ||
                      rule.hiddenSections.length === 0) && (
                      <span
                        style={{
                          color: "var(--text-muted)",
                          fontSize: "0.9rem",
                        }}
                      >
                        None
                      </span>
                    )}{" "}
                  </div>{" "}
                </div>{" "}
              </div>{" "}
            </motion.div>{" "}
          </div>
        ))}{" "}
        {rules.length === 0 && (
          <div
            className="col-12 text-center p-5"
            style={{
              background: "var(--surface)",
              borderRadius: "16px",
              border: "1px dashed var(--border)",
            }}
          >
            {" "}
            <div
              className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
              style={{
                width: "80px",
                height: "80px",
                background: "var(--surface-2)",
              }}
            >
              {" "}
              <Settings size={40} style={{ color: "var(--text-muted)" }} />{" "}
            </div>{" "}
            <h5 className="fw-bold" style={{ color: "var(--text)" }}>
              No dynamic rules configured
            </h5>{" "}
            <p style={{ color: "var(--text-secondary)" }}>
              Your portfolio currently looks the same to everyone.
            </p>{" "}
            <button
              className="btn btn-outline-primary fw-bold mt-2 hover-glow"
              style={{ borderRadius: "12px" }}
              onClick={() => setShowAdd(true)}
            >
              {" "}
              Create Your First Rule{" "}
            </button>{" "}
          </div>
        )}{" "}
      </div>{" "}
      {/* Add Rule Modal */}{" "}
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
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="p-4 rounded-4 shadow-lg"
              style={{
                width: "90%",
                maxWidth: "550px",
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
              }}
            >
              {" "}
              <h4 className="fw-bold mb-4" style={{ color: "var(--text)" }}>
                Create Routing Rule
              </h4>{" "}
              <form onSubmit={handleCreate}>
                {" "}
                <div className="mb-4">
                  {" "}
                  <label
                    className="form-label fw-bold"
                    style={{ color: "var(--text)" }}
                  >
                    Rule Name
                  </label>{" "}
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={formData.ruleName}
                    onChange={(e) =>
                      setFormData({ ...formData, ruleName: e.target.value })
                    }
                    placeholder="e.g. Google SWE Application"
                    style={{
                      background: "var(--surface-2)",
                      border: "1px solid var(--border)",
                      color: "var(--text)",
                      padding: "12px 16px",
                      borderRadius: "12px",
                    }}
                  />{" "}
                </div>{" "}
                <div className="mb-4">
                  {" "}
                  <label
                    className="form-label fw-bold"
                    style={{ color: "var(--text)" }}
                  >
                    URL Parameter trigger
                  </label>{" "}
                  <div className="input-group">
                    {" "}
                    <span
                      className="input-group-text border-end-0"
                      style={{
                        background: "var(--surface-2)",
                        border: "1px solid var(--border)",
                        color: "var(--text-secondary)",
                      }}
                    >
                      ?
                    </span>{" "}
                    <input
                      type="text"
                      className="form-control border-start-0 ps-0"
                      required
                      value={formData.urlParameter}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          urlParameter: e.target.value,
                        })
                      }
                      placeholder="company=google"
                      style={{
                        background: "var(--surface-2)",
                        border: "1px solid var(--border)",
                        borderLeft: "none",
                        color: "var(--text)",
                        padding: "12px 16px",
                        borderRadius: "0 12px 12px 0",
                      }}
                    />{" "}
                  </div>{" "}
                </div>{" "}
                <div
                  className="p-4 mb-4"
                  style={{
                    background: "var(--surface-2)",
                    borderRadius: "16px",
                    border: "1px solid var(--border)",
                  }}
                >
                  {" "}
                  <h6
                    className="fw-bold mb-3 d-flex align-items-center gap-2"
                    style={{ color: "var(--text)" }}
                  >
                    <Settings size={16} /> Dynamic Actions
                  </h6>{" "}
                  <div className="mb-4">
                    {" "}
                    <label
                      className="form-label small fw-bold"
                      style={{ color: "var(--success)" }}
                    >
                      Skills to move to top (comma separated)
                    </label>{" "}
                    <input
                      type="text"
                      className="form-control"
                      value={formData.highlightedSkills}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          highlightedSkills: e.target.value,
                        })
                      }
                      placeholder="e.g. Python, C++, Algorithms"
                      style={{
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                        color: "var(--text)",
                        padding: "10px 16px",
                        borderRadius: "12px",
                      }}
                    />{" "}
                  </div>{" "}
                  <div>
                    {" "}
                    <label
                      className="form-label small fw-bold"
                      style={{ color: "var(--danger)" }}
                    >
                      Sections to hide completely (comma separated)
                    </label>{" "}
                    <input
                      type="text"
                      className="form-control"
                      value={formData.hiddenSections}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          hiddenSections: e.target.value,
                        })
                      }
                      placeholder="e.g. Graphic Design Portfolio, Volunteer Work"
                      style={{
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                        color: "var(--text)",
                        padding: "10px 16px",
                        borderRadius: "12px",
                      }}
                    />{" "}
                  </div>{" "}
                </div>{" "}
                <div className="d-flex justify-content-end gap-3 mt-5">
                  {" "}
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn fw-bold"
                    onClick={() => setShowAdd(false)}
                    style={{
                      background: "transparent",
                      color: "var(--text)",
                      border: "1px solid var(--border)",
                      padding: "12px 24px",
                      borderRadius: "12px",
                    }}
                  >
                    Cancel
                  </motion.button>{" "}
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn btn-primary fw-bold hover-glow shadow-lg"
                    style={{ padding: "12px 24px", borderRadius: "12px" }}
                  >
                    Save Rule
                  </motion.button>{" "}
                </div>{" "}
              </form>{" "}
            </motion.div>{" "}
          </motion.div>
        )}{" "}
      </AnimatePresence>{" "}
    </div>
  );
};
export default SmartResume;
