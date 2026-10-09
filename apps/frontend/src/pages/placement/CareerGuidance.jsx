import React, { useState, useEffect } from "react";
import {
  Target,
  Users,
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Search,
  Mail,
} from "lucide-react";
import { placementService } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { motion } from "framer-motion";
export default function CareerGuidance() {
  const [data, setData] = useState({ attentionRequired: [], allStudents: [] });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { addToast } = useToast();
  useEffect(() => {
    fetchGuidance();
  }, []);
  const fetchGuidance = async () => {
    try {
      setLoading(true);
      const res = await placementService.getGuidance();
      setData(res.data.data || { attentionRequired: [], allStudents: [] });
    } catch (err) {
      addToast("Failed to load guidance data", "error");
    } finally {
      setLoading(false);
    }
  };
  const filteredAttention = data.attentionRequired.filter((s) =>
    s.name?.toLowerCase().includes(search.toLowerCase()),
  );
  const filteredAll = data.allStudents.filter(
    (s) =>
      s.name?.toLowerCase().includes(search.toLowerCase()) && !s.needsAttention,
  );
  return (
    <div className="container-fluid py-4 px-xl-5">
      {" "}
      <div className="d-flex align-items-center justify-content-between mb-5 flex-wrap gap-3">
        {" "}
        <div>
          {" "}
          <h2 className="fw-black mb-1 text-gradient-primary">
            Career Guidance 🧭
          </h2>{" "}
          <p className="fw-medium m-0 text-muted">
            Identify skill gaps, map mentorships, and track students needing
            attention.
          </p>{" "}
        </div>{" "}
      </div>{" "}
      <div className="bento-card mb-4 p-4">
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
            placeholder="Search students..."
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
      {loading ? (
        <div className="d-flex justify-content-center p-5">
          <div className="spinner-border text-primary"></div>
        </div>
      ) : (
        <div className="row g-4">
          {" "}
          <div className="col-lg-12">
            {" "}
            <h5 className="fw-bold mb-3 text-danger d-flex align-items-center gap-2">
              {" "}
              <AlertTriangle size={20} /> Requires Immediate Attention{" "}
            </h5>{" "}
            <div className="row g-3">
              {" "}
              {filteredAttention.map((student, idx) => (
                <div className="col-md-6 col-lg-4" key={student._id}>
                  {" "}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bento-card h-100 p-4 border border-danger border-opacity-25"
                    style={{ background: "var(--surface-2)" }}
                  >
                    {" "}
                    <div className="d-flex align-items-center gap-3 mb-3">
                      {" "}
                      <div
                        className="rounded-circle overflow-hidden bg-danger-subtle d-flex align-items-center justify-content-center"
                        style={{ width: "48px", height: "48px" }}
                      >
                        {" "}
                        {student.avatar ? (
                          <img
                            src={student.avatar}
                            alt="avatar"
                            className="w-100 h-100 object-fit-cover"
                          />
                        ) : (
                          <Users size={20} className="text-danger" />
                        )}{" "}
                      </div>{" "}
                      <div>
                        {" "}
                        <h6 className="fw-bold m-0">{student.name}</h6>{" "}
                        <small className="text-danger fw-semibold">
                          0 Applications
                        </small>{" "}
                      </div>{" "}
                    </div>{" "}
                    <div className="mb-3">
                      {" "}
                      <small
                        className="text-muted text-uppercase fw-bold d-block mb-2"
                        style={{ fontSize: "0.7rem" }}
                      >
                        Identified Skill Gaps
                      </small>{" "}
                      <div className="d-flex flex-wrap gap-1">
                        {" "}
                        {(student.skillGap || []).map((gap, i) => (
                          <span
                            key={i}
                            className="badge bg-danger-subtle text-danger"
                          >
                            {gap}
                          </span>
                        ))}{" "}
                        {(!student.skillGap ||
                          student.skillGap.length === 0) && (
                          <span className="text-muted small">
                            No specific gap identified
                          </span>
                        )}{" "}
                      </div>{" "}
                    </div>{" "}
                    <button className="btn btn-outline-danger btn-sm w-100 rounded-pill fw-bold d-flex align-items-center justify-content-center gap-2">
                      {" "}
                      <Mail size={14} /> Schedule Mentorship{" "}
                    </button>{" "}
                  </motion.div>{" "}
                </div>
              ))}{" "}
              {filteredAttention.length === 0 && (
                <div className="col-12">
                  <div className="text-center p-4 text-muted bento-card border-dashed">
                    No students currently flagged for immediate attention.
                  </div>
                </div>
              )}{" "}
            </div>{" "}
          </div>{" "}
          <div className="col-lg-12 mt-5">
            {" "}
            <h5 className="fw-bold mb-3 text-success d-flex align-items-center gap-2">
              {" "}
              <CheckCircle size={20} /> On Track{" "}
            </h5>{" "}
            <div className="row g-3">
              {" "}
              {filteredAll.map((student, idx) => (
                <div className="col-md-6 col-lg-3" key={student._id}>
                  {" "}
                  <div
                    className="bento-card p-3 d-flex align-items-center justify-content-between border border-success border-opacity-10"
                    style={{ background: "var(--surface-2)" }}
                  >
                    {" "}
                    <div className="d-flex align-items-center gap-2">
                      {" "}
                      <div
                        className="rounded-circle bg-success-subtle d-flex align-items-center justify-content-center"
                        style={{ width: "32px", height: "32px" }}
                      >
                        {" "}
                        <span className="text-success fw-bold small">
                          {student.name.charAt(0)}
                        </span>{" "}
                      </div>{" "}
                      <div>
                        {" "}
                        <h6
                          className="m-0 fw-bold fs-6 text-truncate"
                          style={{ maxWidth: "120px" }}
                        >
                          {student.name}
                        </h6>{" "}
                        <small
                          className="text-success"
                          style={{ fontSize: "0.7rem" }}
                        >
                          {student.applications} Applications
                        </small>{" "}
                      </div>{" "}
                    </div>{" "}
                    <button className="btn btn-sm btn-light rounded-circle p-2">
                      <ArrowRight size={14} />
                    </button>{" "}
                  </div>{" "}
                </div>
              ))}{" "}
              {filteredAll.length === 0 && (
                <div className="col-12">
                  <div className="text-center p-4 text-muted bento-card border-dashed">
                    No other students found.
                  </div>
                </div>
              )}{" "}
            </div>{" "}
          </div>{" "}
        </div>
      )}{" "}
    </div>
  );
}
