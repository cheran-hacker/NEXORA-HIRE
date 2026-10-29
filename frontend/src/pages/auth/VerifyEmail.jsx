import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import { authService } from "../../services/api";

const VerifyEmail = () => {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const inputs = useRef([]);

  const handleChange = (val, idx) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...code];
    next[idx] = val;
    setCode(next);
    if (val && idx < 5) inputs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === "Backspace" && !code[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (pasted.length === 6) {
      setCode(pasted.split(""));
      inputs.current[5]?.focus();
    }
  };

  const handleVerify = async () => {
    if (!email) {
      addToast("Please enter your email address", "warning");
      return;
    }
    if (code.join("").length < 6) return;
    
    setStatus("loading");
    try {
      await authService.verifyEmail({ email, code: code.join("") });
      setStatus("success");
      addToast("Email verified successfully!", "success");
    } catch (err) {
      setStatus("error");
      addToast(err?.response?.data?.message || "Invalid or expired code", "error");
    }
  };

  const handleResend = async () => {
    if (!email) {
      addToast("Please enter your email to resend the code", "warning");
      return;
    }
    try {
      await authService.resendVerification({ email });
      addToast("Verification code resent to your email.", "success");
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to resend code", "error");
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center py-5"
      style={{ background: "var(--bg)" }}
    >
      <div className="mesh-gradient" style={{ position: 'fixed' }} />
      <motion.div
        className="rounded-4 shadow-sm w-100 text-center position-relative z-1"
        style={{ maxWidth: 460, background: "var(--surface)", border: "1px solid var(--border)", padding: "2rem" }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {status === "success" ? (
          <motion.div
            className="py-3"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div
              className="icon-circle-lg mx-auto mb-4 d-flex align-items-center justify-content-center"
              style={{ background: "rgba(16,185,129,0.15)", color: "var(--secondary)", width: 80, height: 80, borderRadius: "50%" }}
            >
              <i className="bi bi-patch-check-fill fs-2" />
            </div>
            <h3 className="fw-bold mb-2">Email Verified!</h3>
            <p style={{ color: "var(--text-secondary)", marginBottom: 28 }}>
              Your account is now active. Welcome to NEXORA!
            </p>
            <Link to="/login" className="btn btn-primary w-100 rounded-pill fw-bold btn-lg">
              Go to Login <i className="bi bi-arrow-right ms-2" />
            </Link>
          </motion.div>
        ) : (
          <>
            <div
              className="icon-circle-lg mx-auto mb-4 d-flex align-items-center justify-content-center"
              style={{ background: "rgba(99,102,241,0.12)", color: "var(--primary)", width: 70, height: 70, borderRadius: "50%" }}
            >
              <i className="bi bi-envelope-open-fill fs-3" />
            </div>
            <h2 className="fw-black mb-2" style={{ letterSpacing: "-0.03em" }}>
              Verify Your Email
            </h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: 32, lineHeight: 1.6 }}>
              We've sent a 6-digit verification code to your email address. Enter it below to activate your account.
            </p>

            <div className="mb-4 text-start">
              <label className="form-label fw-bold small text-muted text-uppercase">Email Address</label>
              <input 
                type="email" 
                className="form-control bg-transparent text-white" 
                placeholder="Enter your email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ border: "1px solid var(--border-strong)", borderRadius: "var(--radius-md)" }}
              />
            </div>

            {/* OTP Inputs */}
            <div className="d-flex justify-content-between gap-2 mb-4" onPaste={handlePaste}>
              {code.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (inputs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(e.target.value, i)}
                  onKeyDown={(e) => handleKeyDown(e, i)}
                  className="form-control text-center fw-black"
                  style={{
                    width: 48,
                    height: 56,
                    fontSize: "1.5rem",
                    border: digit ? "2px solid var(--primary)" : "2px solid var(--border-strong)",
                    borderRadius: "var(--radius-md)",
                    background: "transparent",
                    color: "var(--text)",
                    transition: "all 0.2s",
                    boxShadow: digit ? "var(--shadow-glow)" : "none",
                  }}
                />
              ))}
            </div>

            <button
              className="btn btn-primary w-100 btn-lg rounded-pill fw-bold mb-4"
              onClick={handleVerify}
              disabled={code.join("").length < 6 || !email || status === "loading"}
            >
              {status === "loading" ? (
                <><span className="spinner-border spinner-border-sm me-2" />Verifying...</>
              ) : (
                <><i className="bi bi-shield-check me-2" />Verify Email</>
              )}
            </button>

            <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
              Didn't receive the code?{" "}
              <button className="btn btn-link p-0 fw-semibold" style={{ color: "var(--primary)", fontSize: "0.875rem" }} onClick={handleResend}>
                Resend Code
              </button>
            </p>{" "}
            <div className="mt-3">
              {" "}
              <Link
                to="/login"
                style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}
              >
                {" "}
                <i className="bi bi-arrow-left me-1" />
                Back to Login{" "}
              </Link>{" "}
            </div>{" "}
          </>
        )}{" "}
      </motion.div>{" "}
    </div>
  );
};
export default VerifyEmail;
