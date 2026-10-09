import React, { useState, useEffect } from "react";
import { alumniService } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import {
  Link2,
  Users,
  CheckCircle,
  Clock,
  Star,
  Share2,
  Copy,
  Plus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
export default function Referrals() {
  const [referralsData, setReferralsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({ role: "", company: "" });
  const { addToast } = useToast();
  useEffect(() => {
    fetchReferrals();
  }, []);
  const fetchReferrals = async () => {
    try {
      setLoading(true);
      const res = await alumniService.getReferrals();
      setReferralsData(res.data.data);
    } catch (err) {
      addToast("Failed to load referral data", "error");
    } finally {
      setLoading(false);
    }
  };
  const handleCreateLink = async (e) => {
    e.preventDefault();
    try {
      await alumniService.generateReferralLink(formData);
      addToast("Referral link generated!", "success");
      setShowAdd(false);
      setFormData({ role: "", company: "" });
      fetchReferrals();
    } catch (err) {
      addToast("Failed to generate link", "error");
    }
  };
  const copyLink = (link) => {
    navigator.clipboard.writeText(link);
    addToast("Referral link copied to clipboard!", "success");
  };
  if (loading || !referralsData)
    return (
      <div className="p-4 d-flex justify-content-center">
        <div className="spinner-border text-primary"></div>
      </div>
    );
  return (
    <div className="p-4" style={{ maxWidth: "1400px", margin: "0 auto" }}>
      {" "}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
        {" "}
        <div>
          {" "}
          <h1
            className="fw-bold mb-2"
            style={{
              fontSize: "2rem",
              color: "var(--text)",
              letterSpacing: "-0.03em",
            }}
          >
            Job Referrals
          </h1>{" "}
          <p
            className="fw-medium m-0"
            style={{ color: "var(--text-secondary)", fontSize: "1rem" }}
          >
            Generate referral links for your company and track applicant
            statuses.
          </p>{" "}
        </div>{" "}
        <button
          className="btn btn-primary fw-semibold rounded-pill px-4 d-flex align-items-center gap-2 shadow-sm"
          onClick={() => setShowAdd(true)}
        >
          {" "}
          <Plus size={18} /> Generate New Link{" "}
        </button>{" "}
      </div>{" "}
      {/* KPI Row */}{" "}
      <div className="row g-4 mb-4">
        {" "}
        {[
          {
            label: "Active Links",
            value: referralsData.kpis.activeLinks,
            icon: Share2,
            color: "var(--primary)",
          },
          {
            label: "Total Applicants",
            value: referralsData.kpis.totalApplicants,
            icon: Users,
            color: "var(--info)",
          },
          {
            label: "Hired Candidates",
            value: referralsData.kpis.hired,
            icon: CheckCircle,
            color: "var(--success)",
          },
          {
            label: "Pending Review",
            value: referralsData.kpis.pending,
            icon: Clock,
            color: "var(--warning)",
          },
        ].map((kpi, i) => (
          <div key={i} className="col-md-6 col-xl-3">
            {" "}
            <div className="bento-card p-4 d-flex align-items-center gap-3 h-100">
              {" "}
              <div
                className="rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  width: 56,
                  height: 56,
                  background: `rgba(0,0,0,0.05)`,
                  color: kpi.color,
                  border: `1px solid ${kpi.color}22`,
                }}
              >
                {" "}
                <kpi.icon size={28} />{" "}
              </div>{" "}
              <div>
                {" "}
                <p
                  className="mb-1 fw-semibold small"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {kpi.label}
                </p>{" "}
                <h3
                  className="fw-black mb-0"
                  style={{ color: "var(--text)", letterSpacing: "-0.02em" }}
                >
                  {kpi.value}
                </h3>{" "}
              </div>{" "}
            </div>{" "}
          </div>
        ))}{" "}
      </div>{" "}
      <div className="row g-4">
        {" "}
        <div className="col-xl-8">
          {" "}
          <div className="bento-card p-0 h-100 overflow-hidden">
            {" "}
            <div className="p-4 border-bottom border d-flex justify-content-between align-items-center">
              {" "}
              <h5 className="fw-bold mb-0" style={{ color: "var(--text)" }}>
                Active Referral Links
              </h5>{" "}
            </div>{" "}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.1 }}
              className="list-group list-group-flush rounded-0 bg-transparent"
            >
              {" "}
              {referralsData.links.map((link, idx) => (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={link.id}
                  className="list-group-item bg-transparent p-4 border hover-bg transition-fast"
                >
                  {" "}
                  <div className="row align-items-center">
                    {" "}
                    <div className="col-md-6 mb-3 mb-md-0">
                      {" "}
                      <h6
                        className="fw-bold mb-1"
                        style={{ color: "var(--text)" }}
                      >
                        {link.role}
                      </h6>{" "}
                      <p
                        className="small mb-2"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {link.company} • Created on {link.createdAt}
                      </p>{" "}
                      <div className="d-flex align-items-center gap-2">
                        {" "}
                        <code className="bg-light px-3 py-2 rounded-pill text-info small">
                          {link.url}
                        </code>{" "}
                        <button
                          className="btn btn-sm btn-outline-light rounded-circle p-2 border"
                          onClick={() => copyLink(link.url)}
                          title="Copy Link"
                        >
                          {" "}
                          <Copy size={14} />{" "}
                        </button>{" "}
                      </div>{" "}
                    </div>{" "}
                    <div className="col-md-3">
                      {" "}
                      <div
                        className="d-flex flex-column gap-1 small fw-semibold"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {" "}
                        <span>
                          <Users size={14} className="me-1 text-primary" />{" "}
                          {link.clicks} Clicks
                        </span>{" "}
                        <span>
                          <CheckCircle
                            size={14}
                            className="me-1 text-success"
                          />{" "}
                          {link.conversions} Applied
                        </span>{" "}
                      </div>{" "}
                    </div>{" "}
                    <div className="col-md-3 text-md-end">
                      {" "}
                      <span className="badge bg-success-subtle text-success rounded-pill px-3 py-2">
                        Active
                      </span>{" "}
                    </div>{" "}
                  </div>{" "}
                </motion.div>
              ))}{" "}
            </motion.div>{" "}
          </div>{" "}
        </div>{" "}
        <div className="col-xl-4">
          {" "}
          <div className="bento-card p-4 h-100">
            {" "}
            <h5 className="fw-bold mb-4" style={{ color: "var(--text)" }}>
              Recent Applicants
            </h5>{" "}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.1 }}
              className="d-flex flex-column gap-3"
            >
              {" "}
              {referralsData.recentApplicants.map((app, i) => (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  key={i}
                  className="p-3 rounded-3 hover-lift"
                  style={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                  }}
                >
                  {" "}
                  <div className="d-flex align-items-center gap-3 mb-3">
                    {" "}
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center bg-light fw-bold text-primary"
                      style={{
                        width: 40,
                        height: 40,
                        border: "1px solid var(--border)",
                      }}
                    >
                      {" "}
                      {app.name.charAt(0)}{" "}
                    </div>{" "}
                    <div>
                      {" "}
                      <h6
                        className="fw-bold mb-0"
                        style={{ color: "var(--text)" }}
                      >
                        {app.name}
                      </h6>{" "}
                      <span className="small text-muted">
                        {app.roleApplied}
                      </span>{" "}
                    </div>{" "}
                  </div>{" "}
                  <div className="d-flex justify-content-between align-items-center">
                    {" "}
                    <div
                      className="d-flex align-items-center gap-1 small fw-bold"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {" "}
                      <Star size={14} className="text-warning" /> Match:{" "}
                      {app.matchScore}%{" "}
                    </div>{" "}
                    <span
                      className={`badge rounded-pill ${app.status === "Interviewing" ? "bg-info-subtle text-info" : app.status === "Hired" ? "bg-success-subtle text-success" : "bg-warning-subtle text-warning"}`}
                    >
                      {" "}
                      {app.status}{" "}
                    </span>{" "}
                  </div>{" "}
                </motion.div>
              ))}{" "}
            </motion.div>{" "}
          </div>{" "}
        </div>{" "}
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
              className="p-4"
              style={{
                width: "90%",
                maxWidth: "500px",
                background: "var(--surface)",
                borderRadius: "24px",
                border: "1px solid rgba(0,0,0,0.05)",
                boxShadow: "0 30px 60px rgba(0,0,0,0.02)",
              }}
            >
              {" "}
              <h4 className="fw-bold mb-4" style={{ color: "var(--text)" }}>
                Generate Referral Link
              </h4>{" "}
              <form onSubmit={handleCreateLink}>
                {" "}
                <div className="mb-4">
                  {" "}
                  <label
                    className="form-label fw-bold"
                    style={{ color: "var(--text)" }}
                  >
                    Job Role
                  </label>{" "}
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    placeholder="e.g. Software Engineer Intern"
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
                    Company
                  </label>{" "}
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={formData.company}
                    onChange={(e) =>
                      setFormData({ ...formData, company: e.target.value })
                    }
                    placeholder="e.g. Google"
                    style={{
                      background: "var(--surface-2)",
                      border: "1px solid var(--border)",
                      color: "var(--text)",
                      padding: "12px 16px",
                      borderRadius: "12px",
                    }}
                  />{" "}
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
                      border: "1px solid rgba(0,0,0,0.05)",
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
                    Generate Link
                  </motion.button>{" "}
                </div>{" "}
              </form>{" "}
            </motion.div>{" "}
          </motion.div>
        )}{" "}
      </AnimatePresence>{" "}
    </div>
  );
}
