import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Briefcase,
  MapPin,
  Building,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  Clock3,
} from "lucide-react";
import { jobService } from "../../services/api.js";

const resolveResumeUrl = (url) => {
  if (!url) return "#";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/uploads/")) return url;
  return `/api/student/resume/file/${encodeURIComponent(url.replace(/^\/+/, ""))}`;
};

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await jobService.getMyApplications();
        setApplications(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch applications", err);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);
  const getStatusIcon = (status) => {
    switch (status) {
      case "Hired":
        return <CheckCircle2 size={16} />;
      case "Rejected":
        return <XCircle size={16} />;
      case "Shortlisted":
        return <CheckCircle2 size={16} />;
      default:
        return <Clock3 size={16} />;
    }
  };
  const getStatusColor = (status) => {
    switch (status) {
      case "Hired":
        return "success";
      case "Rejected":
        return "danger";
      case "Shortlisted":
        return "primary";
      default:
        return "secondary";
    }
  };
  return (
    <div className="container-fluid py-4 px-xl-5">
      {" "}
      <div className="d-flex justify-content-between align-items-end mb-5">
        {" "}
        <div>
          {" "}
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="fw-black mb-1 d-flex align-items-center gap-3"
            style={{
              fontSize: "2.5rem",
              letterSpacing: "-0.02em",
              color: "var(--text)",
            }}
          >
            {" "}
            My Applications{" "}
          </motion.h2>{" "}
          <p className="text-muted fw-medium">
            Track your applied jobs and interview statuses.
          </p>{" "}
        </div>{" "}
      </div>{" "}
      <div className="row g-4">
        {" "}
        {loading ? (
          <div className="col-12 text-center py-5">
            <div className="spinner-border text-primary" />
          </div>
        ) : applications.length === 0 ? (
          <div className="col-12 text-center py-5 bento-card w-100">
            {" "}
            <Briefcase size={48} className="text-muted mb-3 mx-auto" />{" "}
            <h5 className="fw-bold">No applications yet</h5>{" "}
            <p className="text-muted">
              Go to the Job Board to find and apply for roles.
            </p>{" "}
          </div>
        ) : (
          applications.map((app) => {
            const job = app.jobId;
            const statusColor = getStatusColor(app.status);
            return (
              <motion.div
                key={app._id}
                className="col-md-6 col-lg-4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                {" "}
                <div
                  className="bento-card p-4 h-100 hover-glow d-flex flex-column"
                  style={{ borderTop: `4px solid var(--${statusColor})` }}
                >
                  {" "}
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    {" "}
                    <div>
                      {" "}
                      <h5 className="fw-bold mb-1">
                        {job?.title || "Unknown Job"}
                      </h5>{" "}
                      <p className="text-primary fw-semibold mb-0 small">
                        <Building size={14} className="me-1" />{" "}
                        {job?.company ||
                          job?.recruiterId?.recruiterProfile?.companyName ||
                          "Company"}
                      </p>{" "}
                    </div>{" "}
                    <span
                      className={`badge bg-${statusColor}-subtle text-${statusColor} rounded-pill d-flex align-items-center gap-1 border border-${statusColor}`}
                    >
                      {" "}
                      {getStatusIcon(app.status)} {app.status}{" "}
                    </span>{" "}
                  </div>{" "}
                  <div className="text-muted small fw-semibold d-flex flex-column gap-2 mb-4 flex-grow-1">
                    {" "}
                    <span className="d-flex align-items-center gap-2">
                      <MapPin size={14} /> {job?.location || "Location"}
                    </span>{" "}
                    <span className="d-flex align-items-center gap-2">
                      <Briefcase size={14} /> {job?.type || "Full-Time"}
                    </span>{" "}
                    {job?.salary && (
                      <span className="d-flex align-items-center gap-2">
                        <DollarSign size={14} /> {job.salary.min / 100000}L -{" "}
                        {job.salary.max / 100000}L
                      </span>
                    )}{" "}
                  </div>{" "}
                  <div
                    className="pt-3 border-top d-flex justify-content-between align-items-center text-muted small"
                    style={{ borderColor: "var(--border)" }}
                  >
                    {" "}
                    <span>
                      Applied on {new Date(app.createdAt).toLocaleDateString()}
                    </span>{" "}
                    <a
                      href={resolveResumeUrl(app.resumeUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary fw-bold text-decoration-none"
                    >
                      View Sent Resume
                    </a>{" "}
                  </div>{" "}
                </div>{" "}
              </motion.div>
            );
          })
        )}{" "}
      </div>{" "}
    </div>
  );
};
export default MyApplications;
