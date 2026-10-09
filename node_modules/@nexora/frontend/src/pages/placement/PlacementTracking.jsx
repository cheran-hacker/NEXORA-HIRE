import React, { useState, useEffect } from "react";
import {
  Search,
  Briefcase,
  User,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  Filter,
} from "lucide-react";
import { placementService } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { motion } from "framer-motion";
export default function PlacementTracking() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const { addToast } = useToast();
  useEffect(() => {
    fetchTracking();
  }, []);
  const fetchTracking = async () => {
    try {
      setLoading(true);
      const res = await placementService.getTracking();
      setApplications(res.data.data || []);
    } catch (err) {
      addToast("Failed to load tracking data", "error");
    } finally {
      setLoading(false);
    }
  };
  const updateStatus = async (id, newStatus) => {
    try {
      await placementService.updateApplicationStatus(id, newStatus);
      addToast(`Status updated to ${newStatus}`, "success");
      fetchTracking();
    } catch (err) {
      addToast("Failed to update status", "error");
    }
  };
  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      app.studentId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      app.jobId?.company?.toLowerCase().includes(search.toLowerCase()) ||
      app.jobId?.title?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "All" || app.status === filterStatus;
    return matchesSearch && matchesStatus;
  });
  const statuses = [
    "Applied",
    "Screening",
    "Shortlisted",
    "Interview",
    "Offered",
    "Rejected",
  ];
  const getStatusBadge = (status) => {
    switch (status) {
      case "Offered":
        return (
          <span className="badge bg-success-subtle text-success border border-success px-3 py-2 rounded-pill">
            <CheckCircle size={14} className="me-1" /> Offered
          </span>
        );
      case "Rejected":
        return (
          <span className="badge bg-danger-subtle text-danger border border-danger px-3 py-2 rounded-pill">
            <XCircle size={14} className="me-1" /> Rejected
          </span>
        );
      case "Interview":
        return (
          <span className="badge bg-primary-subtle text-primary border border-primary px-3 py-2 rounded-pill">
            <Calendar size={14} className="me-1" /> Interview
          </span>
        );
      case "Shortlisted":
        return (
          <span className="badge bg-info-subtle text-info border border-info px-3 py-2 rounded-pill">
            <CheckCircle size={14} className="me-1" /> Shortlisted
          </span>
        );
      default:
        return (
          <span className="badge bg-secondary-subtle text-secondary border px-3 py-2 rounded-pill">
            <Clock size={14} className="me-1" /> {status}
          </span>
        );
    }
  };
  return (
    <div className="container-fluid py-4 px-xl-5">
      {" "}
      <div className="d-flex align-items-center justify-content-between mb-5 flex-wrap gap-3">
        {" "}
        <div>
          {" "}
          <h2 className="fw-black mb-1 text-gradient-primary">
            Placement Tracking 🛤️
          </h2>{" "}
          <p className="fw-medium m-0 text-muted">
            Master pipeline for candidate shortlisting, interviews, and offers.
          </p>{" "}
        </div>{" "}
      </div>{" "}
      <div className="bento-card mb-4 p-4">
        {" "}
        <div className="row g-3">
          {" "}
          <div className="col-md-6 col-lg-8">
            {" "}
            <div className="position-relative">
              {" "}
              <Search
                className="position-absolute top-50 translate-middle-y ms-3 text-muted"
                size={18}
              />{" "}
              <input
                type="text"
                className="form-control ps-5 rounded-pill"
                placeholder="Search by student, company, or role..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  height: "48px",
                  background: "var(--surface-2)",
                  color: "var(--text)",
                  border: "1px solid var(--border)",
                }}
              />{" "}
            </div>{" "}
          </div>{" "}
          <div className="col-md-6 col-lg-4 d-flex gap-2">
            {" "}
            <select
              className="form-select rounded-pill ps-4"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                height: "48px",
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                color: "var(--text)",
              }}
            >
              {" "}
              <option value="All">All Statuses</option>{" "}
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}{" "}
            </select>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
      <div className="bento-card p-0 overflow-hidden">
        {" "}
        <div className="table-responsive" style={{ minHeight: "400px" }}>
          <table className="table table-hover align-middle mb-0">
            <thead style={{ background: "var(--surface-2)" }}>
              <tr>
                <th className="py-3 px-4 fw-semibold border-bottom">
                  Candidate
                </th><th className="py-3 px-4 fw-semibold border-bottom">
                  Company & Role
                </th><th className="py-3 px-4 fw-semibold border-bottom">
                  Applied On
                </th><th className="py-3 px-4 fw-semibold border-bottom">
                  Current Status
                </th><th className="py-3 px-4 fw-semibold border-bottom text-end">
                  Update Pipeline
                </th></tr></thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-5">
                    <div className="spinner-border text-primary"></div>
                  </td>
                </tr>
              ) : filteredApps.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center py-5 text-muted border border-dashed"
                  >
                    No applications found in pipeline.
                  </td>
                </tr>
              ) : (
                filteredApps.map((app, idx) => (
                  <motion.tr
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={app._id}
                  >
                    <td className="py-3 px-4 border-bottom">
                      
                      <div className="d-flex align-items-center gap-3">
                        {" "}
                        <div
                          className="rounded-circle overflow-hidden bg-primary-subtle d-flex align-items-center justify-content-center"
                          style={{ width: "40px", height: "40px" }}
                        >
                          {" "}
                          {app.studentId?.avatar ? (
                            <img
                              src={app.studentId.avatar}
                              alt="avatar"
                              className="w-100 h-100 object-fit-cover"
                            />
                          ) : (
                            <User size={20} className="text-primary" />
                          )}{" "}
                        </div>{" "}
                        <div>
                          {" "}
                          <h6 className="m-0 fw-bold">
                            {app.studentId?.name || "Unknown Candidate"}
                          </h6>{" "}
                          <small className="text-muted">
                            {app.studentId?.email || "N/A"}
                          </small>{" "}
                        </div>{" "}
                      </div>
                    </td><td className="py-3 px-4 border-bottom">
                      
                      <div className="d-flex align-items-center gap-2 mb-1">
                        {" "}
                        <Briefcase size={14} className="text-primary" />{" "}
                        <span className="fw-bold">
                          {app.jobId?.company || "Unknown Company"}
                        </span>{" "}
                      </div>{" "}
                      <small
                        className="text-muted text-truncate d-block"
                        style={{ maxWidth: "200px" }}
                      >
                        {app.jobId?.title || "Unknown Role"}
                      </small>
                    </td><td className="py-3 px-4 border-bottom text-muted fw-medium">
                      
                      {new Date(app.createdAt).toLocaleDateString()}
                    </td><td className="py-3 px-4 border-bottom">
                      
                      {getStatusBadge(app.status)}
                    </td><td className="py-3 px-4 text-end border-bottom">
                      
                      <div className="dropdown">
                        {" "}
                        <button
                          className="btn btn-sm btn-light border rounded-pill d-inline-flex align-items-center gap-2 px-3 fw-bold"
                          type="button"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                          style={{ background: "var(--surface-2)" }}
                        >
                          {" "}
                          Action <ChevronDown size={14} />{" "}
                        </button>{" "}
                        <ul
                          className="dropdown-menu dropdown-menu-end shadow border-0"
                          style={{ background: "var(--surface-1)" }}
                        >
                          {" "}
                          {statuses.map((s) => (
                            <li key={s}>
                              {" "}
                              <button
                                className={`dropdown-item ${app.status === s ? "active bg-primary" : ""}`}
                                onClick={() => updateStatus(app._id, s)}
                              >
                                {" "}
                                Move to {s}{" "}
                              </button>{" "}
                            </li>
                          ))}{" "}
                        </ul>{" "}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}</tbody></table>
        </div>{" "}
      </div>{" "}
    </div>
  );
}
