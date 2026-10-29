import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  MoreVertical,
  Download,
  CheckCircle,
  XCircle,
  Mail,
  MapPin,
  GraduationCap,
} from "lucide-react";
import { motion } from "framer-motion";
import { recruiterService } from "../../services/api";
import { useToast } from "../../context/ToastContext";
export default function Candidates() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const { addToast } = useToast();
  useEffect(() => {
    fetchCandidates();
  }, []);
  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const res = await recruiterService.getCandidates();
      setCandidates(res.data.data || []);
    } catch (err) {
      console.error("Failed to load candidates:", err);
      addToast("Failed to load candidate pool", "error");
    } finally {
      setLoading(false);
    }
  };
  const filteredCandidates = candidates.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.college?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.appliedRole?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  const getStatusBadge = (status) => {
    const map = {
      Applied: "bg-secondary text-foreground",
      Screening: "bg-info text-white",
      Shortlisted: "bg-primary text-white",
      Interview: "bg-warning text-foreground",
      Offered: "bg-success text-white",
      Rejected: "bg-danger text-white",
    };
    return `badge ${map[status] || "bg-secondary"} rounded-pill`;
  };
  if (loading)
    return (
      <div className="p-4 d-flex justify-content-center">
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
            Candidate Pool
          </h1>{" "}
          <p
            className="fw-medium m-0"
            style={{ color: "var(--text-secondary)", fontSize: "1rem" }}
          >
            Manage all applicants across your active job postings.
          </p>{" "}
        </div>{" "}
        <div className="d-flex gap-2">
          {" "}
          <button
            onClick={() => {
              const csv = [
                "Name,College,Role,Score,Status",
                ...candidates.map(
                  (c) =>
                    `${c.name},${c.college},${c.appliedRole},${c.score},${c.status}`,
                ),
              ].join("\n");
              const blob = new Blob([csv], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "candidates.csv";
              a.click();
              addToast("CSV exported!", "success");
            }}
            className="btn fw-semibold rounded-2 d-flex align-items-center gap-2"
            style={{ background: "var(--text)", color: "var(--bg)" }}
          >
            {" "}
            <Download size={16} /> Export CSV{" "}
          </button>{" "}
        </div>{" "}
      </div>{" "}
      <div className="bento-card mb-4 p-3 d-flex flex-wrap gap-3 align-items-center justify-content-between">
        {" "}
        <div
          className="position-relative flex-grow-1"
          style={{ maxWidth: "400px" }}
        >
          {" "}
          <Search
            size={18}
            className="position-absolute top-50 translate-middle-y ms-3 text-muted"
          />{" "}
          <input
            type="text"
            className="form-control rounded-pill ps-5 bg-transparent border text-body"
            placeholder="Search name, college, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />{" "}
        </div>{" "}
        <div className="d-flex gap-2 align-items-center">
          {" "}
          <Filter size={18} className="text-muted" />{" "}
          <select
            className="form-select rounded-pill bg-transparent border text-body w-auto"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {" "}
            <option value="All">All Statuses</option>{" "}
            <option value="Applied">Applied</option>{" "}
            <option value="Screening">Screening</option>{" "}
            <option value="Shortlisted">Shortlisted</option>{" "}
            <option value="Interview">Interview</option>{" "}
            <option value="Offered">Offered</option>{" "}
            <option value="Rejected">Rejected</option>{" "}
          </select>{" "}
        </div>{" "}
      </div>{" "}
      <div className="bento-card overflow-hidden p-0">
        {" "}
        <div className="table-responsive">
          <table
            className="table table-hover mb-0"
            style={{
              "--bs-table-bg": "transparent",
              "--bs-table-color": "var(--text)",
              "--bs-table-hover-bg": "rgba(var(--primary-rgb), 0.05)",
            }}
          >
            <thead style={{ background: "var(--surface-2)" }}>
              <tr>
                <th className="py-3 px-4 fw-semibold border-bottom border text-muted">
                  Candidate
                </th><th className="py-3 px-4 fw-semibold border-bottom border text-muted">
                  Applied Role
                </th><th className="py-3 px-4 fw-semibold border-bottom border text-muted">
                  Applied Date
                </th><th className="py-3 px-4 fw-semibold border-bottom border text-muted text-center">
                  ATS Score
                </th><th className="py-3 px-4 fw-semibold border-bottom border text-muted text-center">
                  Status
                </th><th className="py-3 px-4 fw-semibold border-bottom border text-muted text-end">
                  Actions
                </th></tr></thead>
            <tbody>
              {filteredCandidates.map((candidate) => (
                <tr key={candidate._id} className="border-bottom border">
                  <td className="py-3 px-4 align-middle">
                    
                    <div className="d-flex align-items-center gap-3">
                      {" "}
                      <div
                        className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
                        style={{ width: 40, height: 40 }}
                      >
                        {" "}
                        {candidate.name.charAt(0)}{" "}
                      </div>{" "}
                      <div>
                        {" "}
                        <div className="fw-bold">{candidate.name}</div>{" "}
                        <div className="text-muted small d-flex align-items-center gap-1">
                          <GraduationCap size={12} /> {candidate.college}
                        </div>{" "}
                      </div>{" "}
                    </div>
                  </td><td className="py-3 px-4 align-middle fw-medium">
                    {candidate.appliedRole}
                  </td><td className="py-3 px-4 align-middle text-muted small">
                    {candidate.appliedDate}
                  </td><td className="py-3 px-4 align-middle text-center">
                    
                    <span className="badge bg-success-subtle text-success border border-success fw-bold p-2">
                      {candidate.score}%
                    </span>
                  </td><td className="py-3 px-4 align-middle text-center">
                    
                    <span className={getStatusBadge(candidate.status)}>
                      {candidate.status}
                    </span>
                  </td><td className="py-3 px-4 align-middle text-end">
                    
                    <button
                      onClick={() =>
                        window.open(
                          `mailto:${candidate.email || ""}?subject=Regarding Your Application&body=Hello ${candidate.name},%0D%0A`,
                          "_blank",
                        )
                      }
                      className="btn btn-sm btn-icon text-muted hover-glow"
                      title="Email candidate"
                    >
                      <Mail size={16} />
                    </button>{" "}
                    <button
                      onClick={() =>
                        addToast(
                          `Opening actions for ${candidate.name}`,
                          "info",
                        )
                      }
                      className="btn btn-sm btn-icon text-muted hover-glow"
                      title="More actions"
                    >
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredCandidates.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    No candidates found matching your criteria.
                  </td></tr>
              )}</tbody></table>
        </div>{" "}
      </div>{" "}
    </div>
  );
}
