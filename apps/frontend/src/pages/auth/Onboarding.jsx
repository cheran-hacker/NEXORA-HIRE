import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext";
import {
  GraduationCap,
  Briefcase,
  Users,
  Building,
  UserCheck,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
const ROLES = [
  { id: "Placement", label: "Placement", icon: Building },
  { id: "Alumni", label: "Alumni", icon: UserCheck },
];
export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    role: "",
    phone: "",
    department: "",
    course: "",
    year: "",
    college: "",
    skills: "",
    linkedinUrl: "",
    githubUrl: "",
    portfolioUrl: "",
    resumeUrl: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { completeProfile, user } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const handleNext = () => {
    if (step === 1 && !formData.role) {
      addToast("Please select a role to continue", "error");
      return;
    }
    setStep((prev) => prev + 1);
  };
  const handleBack = () => {
    setStep((prev) => prev - 1);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const res = await completeProfile(formData);
    setIsLoading(false);
    if (res.success) {
      addToast("Profile completed successfully!", "success");
      const roleId = res.user.role.toLowerCase();
      if (roleId === "admin") navigate("/admin/dashboard");
      else if (roleId === "placement") navigate("/placement/dashboard");
      else if (roleId === "alumni") navigate("/alumni/dashboard");
      else navigate("/student/dashboard");
    } else {
      addToast(res.message || "Failed to complete profile", "error");
    }
  };
  const updateForm = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };
  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center py-5 bg-aurora"
      style={{ background: "var(--bg)" }}
    >
      {" "}
      <div className="container" style={{ maxWidth: "600px" }}>
        {" "}
        <div
          className="card border-0 shadow-lg"
          style={{ background: "var(--surface)", borderRadius: "24px" }}
        >
          {" "}
          <div className="card-body p-5">
            {" "}
            <div className="text-center mb-5">
              {" "}
              <h2 className="fw-black mb-2" style={{ color: "var(--text)" }}>
                Complete Your Profile
              </h2>{" "}
              <p style={{ color: "var(--text-muted)" }}>
                We need a few more details to set up your workspace.
              </p>{" "}
              <div className="d-flex justify-content-center gap-2 mt-4">
                {" "}
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`rounded-pill ${step >= i ? "bg-primary" : ""}`}
                    style={{
                      width: "30px",
                      height: "6px",
                      background: "var(--border)",
                    }}
                  ></div>
                ))}{" "}
              </div>{" "}
            </div>{" "}
            <form
              onSubmit={
                step === 3
                  ? handleSubmit
                  : (e) => {
                      e.preventDefault();
                      handleNext();
                    }
              }
            >
              {" "}
              <AnimatePresence mode="wait">
                {" "}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    {" "}
                    <h5
                      className="fw-bold mb-4"
                      style={{ color: "var(--text)" }}
                    >
                      Select your role
                    </h5>{" "}
                    <div className="d-flex flex-column gap-3">
                      {" "}
                      {ROLES.map((role) => (
                        <div
                          key={role.id}
                          onClick={() => updateForm("role", role.id)}
                          className={`p-4 rounded-4 cursor-pointer d-flex align-items-center gap-3 transition-fast ${formData.role === role.id ? "border-primary" : ""}`}
                          style={{
                            border: `2px solid ${formData.role === role.id ? "var(--primary)" : "var(--border)"}`,
                            background:
                              formData.role === role.id
                                ? "rgba(var(--primary-rgb), 0.05)"
                                : "var(--surface-2)",
                            cursor: "pointer",
                          }}
                        >
                          {" "}
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center"
                            style={{
                              width: "48px",
                              height: "48px",
                              background:
                                formData.role === role.id
                                  ? "var(--primary)"
                                  : "var(--border)",
                              color:
                                formData.role === role.id
                                  ? "white"
                                  : "var(--text-muted)",
                            }}
                          >
                            {" "}
                            <role.icon size={24} />{" "}
                          </div>{" "}
                          <div>
                            {" "}
                            <h6
                              className="m-0 fw-bold"
                              style={{ color: "var(--text)" }}
                            >
                              {role.label}
                            </h6>{" "}
                            <small style={{ color: "var(--text-muted)" }}>
                              Join as a {role.label.toLowerCase()}
                            </small>{" "}
                          </div>{" "}
                        </div>
                      ))}{" "}
                    </div>{" "}
                  </motion.div>
                )}{" "}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    {" "}
                    <h5
                      className="fw-bold mb-4"
                      style={{ color: "var(--text)" }}
                    >
                      Basic Details
                    </h5>{" "}
                    <div className="mb-4">
                      {" "}
                      <label
                        className="form-label fw-semibold"
                        style={{ color: "var(--text)" }}
                      >
                        Phone Number
                      </label>{" "}
                      <input
                        type="tel"
                        className="form-control"
                        style={{
                          background: "var(--surface-2)",
                          border: "1px solid var(--border)",
                          color: "var(--text)",
                        }}
                        value={formData.phone}
                        onChange={(e) => updateForm("phone", e.target.value)}
                        required
                      />{" "}
                    </div>{" "}
                    <div className="mb-4">
                      {" "}
                      <label
                        className="form-label fw-semibold"
                        style={{ color: "var(--text)" }}
                      >
                        College/Institution
                      </label>{" "}
                      <input
                        type="text"
                        className="form-control"
                        style={{
                          background: "var(--surface-2)",
                          border: "1px solid var(--border)",
                          color: "var(--text)",
                        }}
                        value={formData.college}
                        onChange={(e) => updateForm("college", e.target.value)}
                        required
                      />{" "}
                    </div>{" "}
                    {(formData.role === "Student" ||
                      formData.role === "Alumni") && (
                      <div className="mb-4">
                        {" "}
                        <label
                          className="form-label fw-semibold"
                          style={{ color: "var(--text)" }}
                        >
                          Department / Branch
                        </label>{" "}
                        <input
                          type="text"
                          className="form-control"
                          style={{
                            background: "var(--surface-2)",
                            border: "1px solid var(--border)",
                            color: "var(--text)",
                          }}
                          value={formData.department}
                          onChange={(e) =>
                            updateForm("department", e.target.value)
                          }
                          required
                        />{" "}
                      </div>
                    )}{" "}
                  </motion.div>
                )}{" "}
                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    {" "}
                    <h5
                      className="fw-bold mb-4"
                      style={{ color: "var(--text)" }}
                    >
                      Professional Details
                    </h5>{" "}
                    {(formData.role === "Student" ||
                      formData.role === "Alumni") && (
                      <>
                        {" "}
                        <div className="mb-4">
                          {" "}
                          <label
                            className="form-label fw-semibold"
                            style={{ color: "var(--text)" }}
                          >
                            Top Skills (comma separated)
                          </label>{" "}
                          <input
                            type="text"
                            className="form-control"
                            placeholder="React, Node.js, Design"
                            style={{
                              background: "var(--surface-2)",
                              border: "1px solid var(--border)",
                              color: "var(--text)",
                            }}
                            value={formData.skills}
                            onChange={(e) =>
                              updateForm("skills", e.target.value)
                            }
                          />{" "}
                        </div>{" "}
                        <div className="mb-4">
                          {" "}
                          <label
                            className="form-label fw-semibold"
                            style={{ color: "var(--text)" }}
                          >
                            LinkedIn URL
                          </label>{" "}
                          <input
                            type="url"
                            className="form-control"
                            style={{
                              background: "var(--surface-2)",
                              border: "1px solid var(--border)",
                              color: "var(--text)",
                            }}
                            value={formData.linkedinUrl}
                            onChange={(e) =>
                              updateForm("linkedinUrl", e.target.value)
                            }
                          />{" "}
                        </div>{" "}
                        <div className="mb-4">
                          {" "}
                          <label
                            className="form-label fw-semibold"
                            style={{ color: "var(--text)" }}
                          >
                            GitHub / Portfolio URL
                          </label>{" "}
                          <input
                            type="url"
                            className="form-control"
                            style={{
                              background: "var(--surface-2)",
                              border: "1px solid var(--border)",
                              color: "var(--text)",
                            }}
                            value={formData.githubUrl}
                            onChange={(e) =>
                              updateForm("githubUrl", e.target.value)
                            }
                          />{" "}
                        </div>{" "}
                      </>
                    )}{" "}
                    {formData.role === "Placement" && (
                      <div
                        className="alert alert-info border-0 rounded-4"
                        style={{
                          background: "rgba(var(--primary-rgb), 0.1)",
                          color: "var(--text)",
                        }}
                      >
                        {" "}
                        You can add your company and placement details later
                        from the dashboard settings.{" "}
                      </div>
                    )}{" "}
                  </motion.div>
                )}{" "}
              </AnimatePresence>{" "}
              <div className="d-flex justify-content-between mt-5">
                {" "}
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="btn d-flex align-items-center gap-2 fw-semibold"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {" "}
                    <ArrowLeft size={18} /> Back{" "}
                  </button>
                ) : (
                  <div></div>
                )}{" "}
                {step < 3 ? (
                  <button
                    type="submit"
                    className="btn btn-primary px-4 d-flex align-items-center gap-2 fw-bold"
                    style={{ borderRadius: "12px" }}
                  >
                    {" "}
                    Continue <ArrowRight size={18} />{" "}
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn btn-primary px-4 d-flex align-items-center gap-2 fw-bold"
                    style={{ borderRadius: "12px" }}
                  >
                    {" "}
                    {isLoading ? (
                      <span className="spinner-border spinner-border-sm" />
                    ) : (
                      "Complete Setup"
                    )}{" "}
                    <ArrowRight size={18} />{" "}
                  </button>
                )}{" "}
              </div>{" "}
            </form>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}
