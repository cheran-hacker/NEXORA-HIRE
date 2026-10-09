import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { studentService } from "../../services/api";
import {
  User,
  Briefcase,
  Award,
  Code,
  Monitor,
  GraduationCap,
  MapPin,
  Mail,
  ExternalLink,
  Star,
} from "lucide-react";
import { motion } from "framer-motion";
export default function PublicProfile() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const company = searchParams.get("company");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    fetchProfile();
  }, [id, company]);
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await studentService.getPublicProfile(id, company);
      setProfile(res.data.data);
    } catch (err) {
      setError("Profile not found or you do not have permission to view it.");
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return (
      <div
        className="min-vh-100 d-flex align-items-center justify-content-center"
        style={{ background: "var(--bg-main)" }}
      >
        {" "}
        <div
          className="spinner-border text-primary"
          style={{ width: "3rem", height: "3rem" }}
        ></div>{" "}
      </div>
    );
  }
  if (error || !profile) {
    return (
      <div
        className="min-vh-100 d-flex align-items-center justify-content-center"
        style={{ background: "var(--bg-main)", color: "var(--text)" }}
      >
        {" "}
        <div className="text-center">
          {" "}
          <Monitor size={48} className="text-danger mb-3" />{" "}
          <h2 className="fw-bold">404 - Profile Not Found</h2>{" "}
          <p className="text-secondary">{error}</p>{" "}
        </div>{" "}
      </div>
    );
  }
  return (
    <div className="min-vh-100 py-5" style={{ background: "var(--bg-main)" }}>
      {" "}
      <div className="container" style={{ maxWidth: "1000px" }}>
        {" "}
        {company && (
          <div className="alert bg-primary-subtle text-primary border-primary border d-flex align-items-center gap-2 mb-4 rounded-3 shadow-sm">
            {" "}
            <Award size={20} />{" "}
            <div>
              {" "}
              <strong>Smart Resume Active:</strong> This portfolio has been
              dynamically tailored for {company.toUpperCase()}.{" "}
            </div>{" "}
          </div>
        )}{" "}
        <div className="row g-4">
          {" "}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="col-lg-4"
          >
            {" "}
            <div
              className="bento-card text-center p-4 h-100 position-relative overflow-hidden"
              style={{
                background:
                  "linear-gradient(145deg, var(--surface), var(--surface))",
              }}
            >
              {" "}
              <div
                className="position-absolute rounded-circle"
                style={{
                  top: "-10%",
                  left: "-10%",
                  width: "150px",
                  height: "150px",
                  background:
                    "radial-gradient(circle, rgba(var(--primary-rgb),0.1) 0%, transparent 70%)",
                  filter: "blur(20px)",
                  zIndex: 0,
                }}
              ></div>{" "}
              <div className="position-relative z-1">
                {" "}
                <div
                  className="rounded-circle bg-light text-primary d-inline-flex align-items-center justify-content-center mb-3 border shadow-lg"
                  style={{
                    width: 120,
                    height: 120,
                    fontSize: "3rem",
                    fontWeight: "bold",
                  }}
                >
                  {" "}
                  {profile.name.charAt(0)}{" "}
                </div>{" "}
                <h3
                  className="fw-bold mb-1"
                  style={{ color: "var(--text)", letterSpacing: "-0.02em" }}
                >
                  {profile.name}
                </h3>{" "}
                <p
                  className="mb-3 fw-medium"
                  style={{ color: "var(--primary)" }}
                >
                  Software Engineering Student
                </p>{" "}
                <div className="d-flex flex-column gap-3 text-start mt-4 pt-4 border-top border">
                  {" "}
                  <div className="d-flex align-items-center gap-3 text-secondary small fw-medium hover-text-primary transition-fast">
                    {" "}
                    <Mail size={18} className="text-primary" />{" "}
                    {profile.email}{" "}
                  </div>{" "}
                  <div className="d-flex align-items-center gap-3 text-secondary small fw-medium hover-text-primary transition-fast">
                    {" "}
                    <MapPin size={18} className="text-danger" /> Digital
                    Campus{" "}
                  </div>{" "}
                  <div className="d-flex align-items-center gap-3 text-secondary small fw-medium hover-text-primary transition-fast">
                    {" "}
                    <ExternalLink size={18} className="text-info" />{" "}
                    <span
                      className="text-decoration-none"
                      style={{ color: "inherit" }}
                    >
                      github.com/{profile.name.toLowerCase().replace(" ", "")}
                    </span>{" "}
                  </div>{" "}
                </div>{" "}
              </div>{" "}
            </div>{" "}
          </motion.div>{" "}
          <div className="col-lg-8">
            {" "}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, staggerChildren: 0.1 }}
              className="d-flex flex-column gap-4"
            >
              {" "}
              {/* Skills Section */}{" "}
              <motion.div className="bento-card p-4 hover-lift">
                {" "}
                <h5
                  className="fw-bold mb-4 d-flex align-items-center gap-2"
                  style={{ color: "var(--text)" }}
                >
                  {" "}
                  <Code size={22} className="text-primary" /> Core
                  Competencies{" "}
                </h5>{" "}
                <div className="d-flex flex-wrap gap-2">
                  {" "}
                  {profile.skills.map((skill, index) => (
                    <motion.span
                      whileHover={{ scale: 1.05 }}
                      key={index}
                      className={`badge rounded-pill px-3 py-2 ${company && index < 2 ? "bg-primary text-white border border-primary shadow-lg" : "bg-card text-muted border hover-glow"}`}
                      style={{ fontSize: "0.9rem", cursor: "pointer" }}
                    >
                      {" "}
                      {skill}{" "}
                      {company && index < 2 && (
                        <Star size={14} className="ms-2 text-warning" />
                      )}{" "}
                    </motion.span>
                  ))}{" "}
                </div>{" "}
              </motion.div>{" "}
              {/* Dynamic Sections */}{" "}
              {Object.entries(profile.sections).map(
                ([sectionName, items], idx) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + idx * 0.1 }}
                    key={sectionName}
                    className="bento-card p-4 hover-lift"
                  >
                    {" "}
                    <h5
                      className="fw-bold mb-4 d-flex align-items-center gap-2"
                      style={{ color: "var(--text)" }}
                    >
                      {" "}
                      {sectionName === "Experience" && (
                        <Briefcase size={22} className="text-success" />
                      )}{" "}
                      {sectionName === "Projects" && (
                        <Monitor size={22} className="text-info" />
                      )}{" "}
                      {sectionName === "Education" && (
                        <GraduationCap size={22} className="text-warning" />
                      )}{" "}
                      {sectionName}{" "}
                    </h5>{" "}
                    <div className="d-flex flex-column gap-3">
                      {" "}
                      {items.map((item, i) => (
                        <div
                          key={i}
                          className="p-4 rounded-4 transition-fast"
                          style={{
                            background: "var(--surface-2)",
                            border: "1px solid var(--border)",
                          }}
                        >
                          {" "}
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            {" "}
                            <h6
                              className="fw-bold mb-0"
                              style={{
                                color: "var(--text)",
                                fontSize: "1.1rem",
                              }}
                            >
                              {item.title}
                            </h6>{" "}
                            <div className="d-flex gap-2">
                              {" "}
                              {item.company && (
                                <span className="badge bg-light border text-muted rounded-pill px-3 py-1">
                                  {item.company}
                                </span>
                              )}{" "}
                              {item.school && (
                                <span className="badge bg-light border text-muted rounded-pill px-3 py-1">
                                  {item.school}
                                </span>
                              )}{" "}
                            </div>{" "}
                          </div>{" "}
                          {item.desc && (
                            <p
                              className="text-secondary small mb-0 mt-3"
                              style={{ lineHeight: "1.6" }}
                            >
                              {item.desc}
                            </p>
                          )}{" "}
                        </div>
                      ))}{" "}
                    </div>{" "}
                  </motion.div>
                ),
              )}{" "}
            </motion.div>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}
