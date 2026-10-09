import React, { useState, useEffect } from "react";
import { useToast } from '../../context/ToastContext';
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  MoreVertical,
  MapPin,
  Briefcase,
  GraduationCap,
  GripVertical,
} from "lucide-react";
import axios from "axios";
import { jobService } from "../../services/api"; // The valid statuses matching the backend Application model
const COLUMNS = [
  "Applied",
  "Screening",
  "Shortlisted",
  "Interview",
  "Offered",
  "Rejected",
];
const ATSDashboard = () => {
  const { addToast } = useToast();
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draggedCardId, setDraggedCardId] = useState(null);
  useEffect(() => {
    fetchJobs();
  }, []);
  useEffect(() => {
    if (selectedJob) {
      fetchCandidates(selectedJob);
    }
  }, [selectedJob]);
  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await jobService.getMyJobs();
      setJobs(res.data.data);
      if (res.data.data.length > 0) {
        setSelectedJob(res.data.data[0]._id);
      }
    } catch (err) {
      console.error("Failed to fetch jobs", err);
    } finally {
      setLoading(false);
    }
  };
  const fetchCandidates = async (jobId) => {
    try {
      const res = await jobService.getApplications(jobId); // Map API data to UI structure
      const mapped = res.data.data.map((app) => ({
        _id: app._id,
        name: app.studentId?.name || "Unknown",
        college: app.studentId?.studentProfile?.college || "Unknown College",
        skills: app.studentId?.studentProfile?.skills || [],
        status: app.status,
        score: app.aiMatchScore || 0,
        resumeUrl: app.resumeUrl,
      }));
      setCandidates(mapped);
    } catch (err) {
      console.error("Failed to fetch candidates", err);
    }
  };
  const handleDragStart = (e, cardId) => {
    setDraggedCardId(cardId); // Setting data is required for Firefox to allow dragging e.dataTransfer.setData('text/plain', cardId); e.dataTransfer.effectAllowed = 'move'; // Slight delay to allow the drag ghost image to generate before hiding the original
    setTimeout(() => {
      e.target.style.opacity = "0.5";
    }, 0);
  };
  const handleDragEnd = (e) => {
    e.target.style.opacity = "1";
    setDraggedCardId(null);
  };
  const handleDragOver = (e) => {
    e.preventDefault(); // Necessary to allow dropping e.dataTransfer.dropEffect = 'move';
  };
  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    if (!draggedCardId) return; // Optimistic UI update
    setCandidates((prev) =>
      prev.map((c) =>
        c._id === draggedCardId ? { ...c, status: newStatus } : c,
      ),
    );
    try {
      await jobService.updateStatus(selectedJob, draggedCardId, newStatus);
    } catch (err) {
      console.error("Failed to update status", err); // Revert on failure by refetching fetchCandidates(selectedJob);
    }
  };
  if (loading) {
    return (
      <div
        className="min-vh-100 d-flex align-items-center justify-content-center"
        style={{ background: "var(--bg)" }}
      >
        {" "}
        <div className="spinner-border text-primary" />{" "}
      </div>
    );
  }
  return (
    <div
      className="d-flex flex-column h-100"
      style={{
        background: "var(--bg)",
        minHeight: "100dvh",
        color: "var(--text)",
      }}
    >
      {" "}
      {/* Header */}{" "}
      <header
        className="p-4 border-bottom sticky-top z-3"
        style={{ borderColor: "var(--border) !important" }}
      >
        {" "}
        <div className="d-flex flex-wrap gap-3 justify-content-between align-items-center">
          {" "}
          <div>
            {" "}
            <h4 className="fw-bold mb-1">Applicant Tracking System</h4>{" "}
            <p className="text-muted mb-0 small fw-semibold">
              Drag and drop candidates across hiring stages
            </p>{" "}
          </div>{" "}
          <div className="d-flex gap-3 align-items-center">
            {" "}
            <select
              className="form-select rounded-pill fw-bold bg-transparent text-body"
              style={{ width: 250, border: "1px solid var(--border)" }}
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
            >
              {" "}
              {jobs.length === 0 ? (
                <option value="">No Active Jobs</option>
              ) : null}{" "}
              {jobs.map((job) => (
                <option key={job._id} value={job._id}>
                  {job.title}
                </option>
              ))}{" "}
            </select>{" "}
            <div className="position-relative">
              {" "}
              <Search
                size={16}
                className="position-absolute top-50 translate-middle-y ms-3 text-muted"
              />{" "}
              <input
                type="text"
                className="form-control rounded-pill ps-5 bg-transparent text-body border"
                placeholder="Search candidates..."
                style={{ width: 200 }}
              />{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
      </header>{" "}
      {/* Kanban Board Container */}{" "}
      <div className="flex-grow-1 overflow-auto p-4">
        {" "}
        <div
          className="d-flex gap-4 h-100 align-items-start"
          style={{ minWidth: "max-content" }}
        >
          {" "}
          {COLUMNS.map((columnStatus) => (
            <div
              key={columnStatus}
              className="d-flex flex-column hover-glow"
              style={{
                width: 320,
                borderRadius: 12,
                border: "1px solid var(--border)",
              }}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, columnStatus)}
            >
              {" "}
              {/* Column Header */}{" "}
              <div
                className="p-3 border-bottom d-flex justify-content-between align-items-center"
                style={{ borderColor: "var(--border) !important" }}
              >
                {" "}
                <h6
                  className="fw-bold m-0 text-uppercase"
                  style={{
                    fontSize: "0.8rem",
                    letterSpacing: "0.05em",
                    color: "var(--text-secondary)",
                  }}
                >
                  {" "}
                  {columnStatus}{" "}
                </h6>{" "}
                <span className="badge bg-secondary-subtle text-secondary rounded-pill">
                  {" "}
                  {
                    candidates.filter((c) => c.status === columnStatus).length
                  }{" "}
                </span>{" "}
              </div>{" "}
              {/* Column Body (Drop Zone) */}{" "}
              <div
                className="p-2 d-flex flex-column gap-2"
                style={{ minHeight: 150 }}
              >
                {" "}
                <AnimatePresence>
                  {" "}
                  {candidates
                    .filter((c) => c.status === columnStatus)
                    .map((candidate) => (
                      <motion.div
                        key={candidate._id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        draggable
                        onDragStart={(e) => handleDragStart(e, candidate._id)}
                        onDragEnd={handleDragEnd}
                        className="p-3 rounded-3 shadow-sm hover-scale cursor-pointer position-relative hover-glow"
                      >
                        {" "}
                        <div
                          className="position-absolute top-0 start-0 h-100 d-flex align-items-center p-1 text-muted"
                          style={{ cursor: "grab" }}
                        >
                          {" "}
                          <GripVertical size={14} opacity={0.3} />{" "}
                        </div>{" "}
                        <div className="ps-3">
                          {" "}
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            {" "}
                            <h6
                              className="fw-bold m-0 text-truncate me-2"
                              style={{ color: "var(--text)" }}
                            >
                              {candidate.name}
                            </h6>{" "}
                            <button
                              onClick={() => addToast("View candidate details", 'info')}
                              className="btn btn-link p-0 text-muted hover-glow"
                            >
                              <MoreVertical size={16} />
                            </button>{" "}
                          </div>{" "}
                          <div
                            className="d-flex align-items-center gap-2 mb-2 text-muted fw-semibold text-truncate"
                            style={{ fontSize: "0.75rem" }}
                          >
                            {" "}
                            <GraduationCap size={12} /> {candidate.college}{" "}
                          </div>{" "}
                          <div className="d-flex flex-wrap gap-1 mb-3">
                            {" "}
                            {candidate.skills.slice(0, 3).map((skill, idx) => (
                              <span
                                key={idx}
                                className="badge bg-secondary-subtle text-secondary rounded-pill"
                                style={{ fontSize: "0.65rem" }}
                              >
                                {skill}
                              </span>
                            ))}{" "}
                          </div>{" "}
                          <div
                            className="d-flex justify-content-between align-items-center pt-2 border-top"
                            style={{ borderColor: "var(--border) !important" }}
                          >
                            {" "}
                            <span className="neon-badge bg-primary-subtle text-primary">
                              {" "}
                              ATS Score: {candidate.score}%{" "}
                            </span>{" "}
                            <a
                              href={candidate.resumeUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-muted d-flex align-items-center gap-1 hover-glow text-decoration-none"
                              style={{ fontSize: "0.7rem" }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {" "}
                              <Briefcase size={10} /> View Resume{" "}
                            </a>{" "}
                          </div>{" "}
                        </div>{" "}
                      </motion.div>
                    ))}{" "}
                </AnimatePresence>{" "}
                {/* Empty Drop Zone Indicator */}{" "}
                {candidates.filter((c) => c.status === columnStatus).length ===
                  0 && (
                  <div
                    className="h-100 d-flex align-items-center justify-content-center text-muted"
                    style={{
                      minHeight: 100,
                      border: "2px dashed var(--border)",
                      borderRadius: 8,
                    }}
                  >
                    {" "}
                    <span className="small fw-medium">
                      Drop candidates here
                    </span>{" "}
                  </div>
                )}{" "}
              </div>{" "}
            </div>
          ))}{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
};
export default ATSDashboard;
