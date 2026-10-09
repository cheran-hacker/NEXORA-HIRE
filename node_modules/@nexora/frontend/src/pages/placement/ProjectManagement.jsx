import React, { useState, useEffect } from "react";
import {
  Search,
  FileSignature,
  CheckCircle,
  XCircle,
  Clock,
  Link2,
  BookOpen,
} from "lucide-react";
import { placementService } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { motion } from "framer-motion";
export default function ProjectManagement() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { addToast } = useToast();
  useEffect(() => {
    fetchProjects();
  }, []);
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await placementService.getProjects();
      setProjects(res.data.data || []);
    } catch (err) {
      addToast("Failed to load projects", "error");
    } finally {
      setLoading(false);
    }
  };
  const handleEvaluate = async (id, status, grade = "A") => {
    try {
      await placementService.evaluateProject(id, { status, grade });
      addToast(`Project marked as ${status}`, "success");
      fetchProjects();
    } catch (err) {
      addToast("Failed to evaluate project", "error");
    }
  };
  const filteredProjects = projects.filter(
    (p) =>
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <div className="container-fluid py-4 px-xl-5">
      {" "}
      <div className="d-flex align-items-center justify-content-between mb-5 flex-wrap gap-3">
        {" "}
        <div>
          {" "}
          <h2 className="fw-black mb-1 text-gradient-primary">
            Project Management 📂
          </h2>{" "}
          <p className="fw-medium m-0 text-muted">
            Review, evaluate, and grade student capstones and projects.
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
            placeholder="Search projects by title or description..."
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
      ) : filteredProjects.length === 0 ? (
        <div className="text-center p-5 text-muted bento-card border-dashed">
          No projects found.
        </div>
      ) : (
        <div className="row g-4">
          {" "}
          {filteredProjects.map((project, idx) => (
            <div className="col-lg-6" key={project._id}>
              {" "}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bento-card h-100 p-4"
              >
                {" "}
                <div className="d-flex justify-content-between align-items-start mb-3">
                  {" "}
                  <div>
                    {" "}
                    <h5 className="fw-bold mb-1 text-primary">
                      {project.title}
                    </h5>{" "}
                    <div className="d-flex align-items-center gap-2 small text-muted">
                      {" "}
                      <span className="badge bg-secondary-subtle text-secondary">
                        {project.domain || "General"}
                      </span>{" "}
                    </div>{" "}
                  </div>{" "}
                  <span
                    className={`badge ${project.status === "Approved" ? "bg-success-subtle text-success border border-success" : project.status === "Rejected" ? "bg-danger-subtle text-danger border border-danger" : "bg-warning-subtle text-warning border border-warning"}`}
                  >
                    {" "}
                    {project.status === "Approved" ? (
                      <CheckCircle size={12} className="me-1" />
                    ) : project.status === "Rejected" ? (
                      <XCircle size={12} className="me-1" />
                    ) : (
                      <Clock size={12} className="me-1" />
                    )}{" "}
                    {project.status || "Pending"}{" "}
                  </span>{" "}
                </div>{" "}
                <p
                  className="small text-muted mb-4"
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {" "}
                  {project.description}{" "}
                </p>{" "}
                <div className="mb-4">
                  {" "}
                  <h6 className="fw-bold small text-uppercase text-muted mb-2">
                    Team Members
                  </h6>{" "}
                  <div className="d-flex flex-wrap gap-2">
                    {" "}
                    {(project.members || []).map((m, i) => (
                      <span key={i} className="badge bg-light text-foreground border">
                        <Users size={12} className="me-1" /> {m.name}
                      </span>
                    ))}{" "}
                  </div>{" "}
                </div>{" "}
                <div className="d-flex align-items-center justify-content-between mt-auto pt-3 border-top">
                  {" "}
                  <div className="d-flex gap-2">
                    {" "}
                    <a
                      href={project.repoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-sm btn-light border rounded-pill d-flex align-items-center gap-1"
                    >
                      {" "}
                      <Link2 size={14} /> Repository{" "}
                    </a>{" "}
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-sm btn-light border rounded-pill d-flex align-items-center gap-1"
                    >
                      {" "}
                      <BookOpen size={14} /> Live Demo{" "}
                    </a>{" "}
                  </div>{" "}
                  {project.status !== "Approved" && (
                    <div className="d-flex gap-2">
                      {" "}
                      <button
                        onClick={() =>
                          handleEvaluate(project._id, "Rejected", "F")
                        }
                        className="btn btn-sm btn-outline-danger rounded-pill"
                      >
                        Reject
                      </button>{" "}
                      <button
                        onClick={() =>
                          handleEvaluate(project._id, "Approved", "A")
                        }
                        className="btn btn-sm btn-success rounded-pill fw-bold"
                      >
                        Approve
                      </button>{" "}
                    </div>
                  )}{" "}
                </div>{" "}
              </motion.div>{" "}
            </div>
          ))}{" "}
        </div>
      )}{" "}
    </div>
  );
}
