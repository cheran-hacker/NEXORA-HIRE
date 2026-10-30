import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { hiringDriveService } from "../../services/api";
import { useToast } from '../../context/ToastContext';
import {
  Target,
  Users,
  MapPin,
  Building,
  ChevronRight,
  Activity,
  Plus,
  X,
  CheckCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ChartWidget from "../../widgets/ChartWidget";
import KPIWidget from "../../widgets/KPIWidget";
import "../../shared/components/modal.css";

export default function HiringDrives() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState("active");
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    company: "",
    status: "Upcoming",
    locations: "",
    description: "",
  });

  const fetchDrives = async () => {
    try {
      const res = await hiringDriveService.getAll();
      setDrives(res.data.data || []);
    } catch (err) {
      addToast("Failed to fetch hiring drives", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrives();
  }, [addToast]);

  const handleCreateDrive = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.company.trim()) {
      addToast("Please fill in drive name and partner company", "warning");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        company: form.company.trim(),
        status: form.status,
        locations: form.locations
          ? form.locations.split(",").map((l) => l.trim()).filter(Boolean)
          : [],
        description: form.description.trim(),
      };
      await hiringDriveService.create(payload);
      addToast("Campus hiring drive created successfully!", "success");
      setShowModal(false);
      setForm({
        name: "",
        company: "",
        status: "Upcoming",
        locations: "",
        description: "",
      });
      fetchDrives();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to create hiring drive", "error");
    } finally {
      setSubmitting(false);
    }
  };
  const funnelData = [
    { name: "Applied", value: 2130 },
    { name: "Assessed", value: 1450 },
    { name: "Interviewed", value: 210 },
    { name: "Offered", value: 12 },
  ];
  return (
    <div className="container-fluid space-y-4" style={{ maxWidth: "1200px" }}>
      {" "}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
        {" "}
        <div>
          {" "}
          <h2
            className="fw-black mb-1 d-flex align-items-center gap-2"
            style={{ color: "var(--text)" }}
          >
            {" "}
            <Target size={32} className="text-primary" /> Hiring Drives{" "}
          </h2>{" "}
          <p
            className="fw-medium mb-0"
            style={{ color: "var(--text-secondary)" }}
          >
            Manage large-scale campus recruitment and off-campus drives.
          </p>{" "}
        </div>{" "}
        <button
          onClick={() => setShowModal(true)}
          className="btn rounded-pill px-4 py-2 fw-bold shadow-sm d-flex align-items-center gap-2 hover-lift"
          style={{
            background:
              "linear-gradient(135deg, var(--primary), var(--purple))",
            color: "#fff",
            border: "none",
          }}
        >
          <Plus size={18} /> Create New Drive
        </button>{" "}
      </div>{" "}
      <div className="row g-4 mb-4">
        {" "}
        <div className="col-md-3">
          {" "}
          <KPIWidget
            title="Total Applicants"
            value="2,580"
            change="+12% this week"
            trend="up"
            icon={Users}
            colorClass="text-primary"
          />{" "}
        </div>{" "}
        <div className="col-md-3">
          {" "}
          <KPIWidget
            title="Assessments Taken"
            value="1,450"
            change="56% conversion"
            trend="up"
            icon={Activity}
            colorClass="text-warning"
          />{" "}
        </div>{" "}
        <div className="col-md-3">
          {" "}
          <KPIWidget
            title="Active Drives"
            value="2"
            change="1 Upcoming"
            trend="up"
            icon={Target}
            colorClass="text-success"
          />{" "}
        </div>{" "}
        <div className="col-md-3">
          {" "}
          <KPIWidget
            title="Offers Rolled Out"
            value="12"
            change="+3 today"
            trend="up"
            icon={Building}
            colorClass="text-info"
          />{" "}
        </div>{" "}
      </div>{" "}
      <div className="row g-4">
        {" "}
        <div className="col-xl-8">
          {" "}
          <div className="bento-card p-0 overflow-hidden h-100 d-flex flex-column">
            {" "}
            <div
              className="d-flex border-bottom"
              style={{
                borderColor: "var(--border) !important",
                background: "var(--surface-2)",
              }}
            >
              {" "}
              <button
                className={`flex-grow-1 py-3 text-center fw-bold transition-fast ${activeTab === "active" ? "border-bottom border-2 border-primary" : ""}`}
                style={{
                  background: "transparent",
                  color:
                    activeTab === "active"
                      ? "var(--text)"
                      : "var(--text-secondary)",
                  border: "none",
                }}
                onClick={() => setActiveTab("active")}
              >
                {" "}
                Active Drives{" "}
              </button>{" "}
              <button
                className={`flex-grow-1 py-3 text-center fw-bold transition-fast ${activeTab === "upcoming" ? "border-bottom border-2 border-primary" : ""}`}
                style={{
                  background: "transparent",
                  color:
                    activeTab === "upcoming"
                      ? "var(--text)"
                      : "var(--text-secondary)",
                  border: "none",
                }}
                onClick={() => setActiveTab("upcoming")}
              >
                {" "}
                Upcoming{" "}
              </button>{" "}
              <button
                className={`flex-grow-1 py-3 text-center fw-bold transition-fast ${activeTab === "completed" ? "border-bottom border-2 border-primary" : ""}`}
                style={{
                  background: "transparent",
                  color:
                    activeTab === "completed"
                      ? "var(--text)"
                      : "var(--text-secondary)",
                  border: "none",
                }}
                onClick={() => setActiveTab("completed")}
              >
                {" "}
                Completed{" "}
              </button>{" "}
            </div>{" "}
            <div className="flex-grow-1 p-4 d-flex flex-column gap-3 overflow-auto">
              {" "}
              {drives
                .filter(
                  (d) =>
                    activeTab === "all" || d.status.toLowerCase() === activeTab,
                )
                .map((drive, i) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={drive._id}
                    className="p-4 rounded-4 position-relative overflow-hidden hover-scale cursor-pointer"
                    style={{
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {" "}
                    <div
                      className="position-absolute top-0 bottom-0 start-0"
                      style={{
                        width: "4px",
                        background:
                          drive.status === "Active"
                            ? "var(--success)"
                            : "var(--warning)",
                      }}
                    />{" "}
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      {" "}
                      <div>
                        {" "}
                        <h5
                          className="fw-bold mb-1"
                          style={{ color: "var(--text)" }}
                        >
                          {drive.name}
                        </h5>{" "}
                        <p className="text-muted fw-medium small m-0 d-flex align-items-center gap-2">
                          {" "}
                          <Building size={14} /> {drive.company}{" "}
                          <span className="text-muted mx-1">•</span>{" "}
                          <MapPin size={14} /> {drive.locations.join(", ")}{" "}
                        </p>{" "}
                      </div>{" "}
                      <span
                        className={`badge rounded-pill px-3 py-2 fw-bold ${drive.status === "Active" ? "bg-success-subtle text-success" : "bg-warning-subtle text-warning"}`}
                      >
                        {" "}
                        {drive.status}{" "}
                      </span>{" "}
                    </div>{" "}
                    <div
                      className="row g-2 text-center mt-2 pt-3 border-top"
                      style={{ borderColor: "var(--border) !important" }}
                    >
                      {" "}
                      <div className="col-3">
                        {" "}
                        <span
                          className="d-block fw-black fs-5"
                          style={{ color: "var(--text)" }}
                        >
                          {drive.applied}
                        </span>{" "}
                        <span
                          className="text-muted small fw-bold text-uppercase"
                          style={{ fontSize: "0.7rem" }}
                        >
                          Applied
                        </span>{" "}
                      </div>{" "}
                      <div
                        className="col-3"
                        style={{ borderLeft: "1px solid var(--border)" }}
                      >
                        {" "}
                        <span
                          className="d-block fw-black fs-5"
                          style={{ color: "var(--text)" }}
                        >
                          {drive.assessed}
                        </span>{" "}
                        <span
                          className="text-muted small fw-bold text-uppercase"
                          style={{ fontSize: "0.7rem" }}
                        >
                          Assessed
                        </span>{" "}
                      </div>{" "}
                      <div
                        className="col-3"
                        style={{ borderLeft: "1px solid var(--border)" }}
                      >
                        {" "}
                        <span
                          className="d-block fw-black fs-5"
                          style={{ color: "var(--text)" }}
                        >
                          {drive.interviewed}
                        </span>{" "}
                        <span
                          className="text-muted small fw-bold text-uppercase"
                          style={{ fontSize: "0.7rem" }}
                        >
                          Interviewed
                        </span>{" "}
                      </div>{" "}
                      <div
                        className="col-3"
                        style={{ borderLeft: "1px solid var(--border)" }}
                      >
                        {" "}
                        <span className="d-block fw-black fs-5 text-primary">
                          {drive.offered}
                        </span>{" "}
                        <span
                          className="text-muted small fw-bold text-uppercase"
                          style={{ fontSize: "0.7rem" }}
                        >
                          Offered
                        </span>{" "}
                      </div>{" "}
                    </div>{" "}
                  </motion.div>
                ))}{" "}
              {drives.filter((d) => d.status.toLowerCase() === activeTab)
                .length === 0 && (
                <div className="text-center p-5">
                  {" "}
                  <p className="text-muted fw-bold">
                    {loading ? "Loading drives..." : `No ${activeTab} drives found.`}
                  </p>{" "}
                </div>
              )}{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
        <div className="col-xl-4">
          {" "}
          <div className="bento-card p-4 h-100 d-flex flex-column">
            {" "}
            <h5
              className="fw-bold mb-4 d-flex align-items-center gap-2"
              style={{ color: "var(--text)" }}
            >
              {" "}
              <Activity size={20} className="text-primary" /> Overall
              Funnel{" "}
            </h5>{" "}
            <div className="flex-grow-1 d-flex flex-column justify-content-center">
              {" "}
              <ChartWidget
                data={funnelData}
                xKey="name"
                yKey="value"
                height={250}
                color="#10b981"
              />{" "}
            </div>{" "}
            <div className="mt-4">
              <button
                onClick={() => navigate("/placement/analytics")}
                className="btn btn-outline-secondary w-100 rounded-pill fw-bold d-flex align-items-center justify-content-between p-3 hover-lift"
              >
                <span>View Detailed Reports</span>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Master Standard: Create Placement Drive Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="nexora-modal-backdrop"
            onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="nexora-modal-container size-md"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="nexora-modal-header">
                <div className="nexora-modal-header-left">
                  <div className="nexora-modal-icon-badge">
                    <Target size={22} strokeWidth={2.2} />
                  </div>
                  <div>
                    <h4 className="nexora-modal-title">Create Placement Drive</h4>
                    <p className="nexora-modal-subtitle">
                      Schedule a campus recruitment drive with target company & locations
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="nexora-modal-close-btn"
                  onClick={() => setShowModal(false)}
                  title="Close modal"
                >
                  <X size={18} strokeWidth={2.2} />
                </button>
              </div>

              {/* Form & Body */}
              <form onSubmit={handleCreateDrive} className="d-flex flex-column" style={{ minHeight: 0, flex: 1 }}>
                <div className="nexora-modal-body">
                  <div className="row g-3">
                    <div className="col-12 col-md-8">
                      <label className="nexora-form-label">
                        Drive Name <span className="nexora-form-req">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        className="nexora-form-input"
                        placeholder="e.g. Google Campus Hiring Sprint 2026"
                        value={form.name}
                        onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="nexora-form-label">Status</label>
                      <select
                        className="nexora-form-select"
                        value={form.status}
                        onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                      >
                        <option value="Upcoming">Upcoming</option>
                        <option value="Active">Active / Live</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="nexora-form-label">
                        Partner Company <span className="nexora-form-req">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        className="nexora-form-input"
                        placeholder="e.g. Google India"
                        value={form.company}
                        onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))}
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="nexora-form-label">Locations (comma-separated)</label>
                      <input
                        type="text"
                        className="nexora-form-input"
                        placeholder="e.g. Bangalore, Hyderabad, Remote"
                        value={form.locations}
                        onChange={(e) => setForm((p) => ({ ...p, locations: e.target.value }))}
                      />
                    </div>

                    <div className="col-12">
                      <label className="nexora-form-label">Drive Description & Instructions</label>
                      <textarea
                        rows={4}
                        className="nexora-form-textarea"
                        placeholder="Detail the recruitment schedule, pre-placement talk, and assessment criteria..."
                        value={form.description}
                        onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="nexora-modal-footer">
                  <span className="nexora-modal-footer-hint d-none d-sm-inline">
                    * Required fields must be completed
                  </span>
                  <div className="nexora-modal-footer-actions">
                    <button
                      type="button"
                      className="nexora-modal-btn-cancel"
                      onClick={() => setShowModal(false)}
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="nexora-modal-btn-primary"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm" /> Creating...
                        </>
                      ) : (
                        <>
                          <CheckCircle size={18} />
                          Create Drive
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
