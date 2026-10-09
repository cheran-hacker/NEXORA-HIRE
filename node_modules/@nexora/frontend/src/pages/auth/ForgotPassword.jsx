import React, { useState } from "react";
import { Link } from "react-router-dom";
import { KeyRound, ArrowLeft, Sun, Moon } from "lucide-react";
import { useToast } from "../../context/ToastContext";
import { useTheme } from "../../context/ThemeContext";
import { authService } from "../../services/api";
export default function ForgotPassword() {
  const { addToast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authService.forgotPassword({ email });
      if (response.data.success || response.status === 200) {
        setSubmitted(true);
        addToast("Password reset instructions sent to your email.", "success");
      } else {
        addToast(
          response.data.message || "Failed to send reset instructions.",
          "error",
        );
      }
    } catch (error) {
      addToast(
        error.message || "Network error. Please try again later.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <div
      className="d-flex align-items-center justify-content-center p-4 position-relative overflow-hidden"
      style={{ background: "var(--bg)", minHeight: "100dvh" }}
    >
      {" "}
      {/* Background decorations */}{" "}
      <div
        className="position-absolute rounded-circle pe-none"
        style={{
          top: "25%",
          left: "25%",
          width: "400px",
          height: "400px",
          background: "rgba(var(--primary-rgb), 0.2)",
          filter: "blur(120px)",
        }}
      ></div>{" "}
      <div
        className="position-absolute rounded-circle pe-none"
        style={{
          bottom: "25%",
          right: "25%",
          width: "400px",
          height: "400px",
          background: "rgba(var(--secondary-rgb), 0.2)",
          filter: "blur(120px)",
        }}
      ></div>{" "}
      <div className="position-absolute top-0 end-0 p-4">
        {" "}
        <button
          onClick={toggleTheme}
          className="btn btn-link p-2 rounded-circle"
          style={{ color: "var(--text-muted)", background: "var(--surface-2)" }}
        >
          {" "}
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}{" "}
        </button>{" "}
      </div>{" "}
      <div
        className="bento-card w-100 p-4 p-md-5 position-relative z-1 hover-glow"
        style={{ maxWidth: "450px" }}
      >
        {" "}
        <div className="text-center mb-4">
          {" "}
          <div
            className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 shadow-sm"
            style={{
              width: "64px",
              height: "64px",
              background: "rgba(var(--primary-rgb), 0.15)",
              color: "var(--primary)",
            }}
          >
            {" "}
            <KeyRound size={32} />{" "}
          </div>{" "}
          <h2 className="fw-black mb-2" style={{ color: "var(--text)" }}>
            Forgot Password?
          </h2>{" "}
          <p className="small mb-0" style={{ color: "var(--text-secondary)" }}>
            {" "}
            {submitted
              ? "Check your email for the reset link."
              : "No worries, we'll send you reset instructions."}{" "}
          </p>{" "}
        </div>{" "}
        {!submitted ? (
          <form onSubmit={handleSubmit}>
            {" "}
            <div className="mb-4">
              {" "}
              <label
                className="form-label small fw-bold"
                style={{ color: "var(--text-secondary)" }}
              >
                Email address
              </label>{" "}
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-control bg-transparent"
                style={{ color: "var(--text)", borderColor: "var(--border)" }}
                placeholder="Enter your email"
              />{" "}
            </div>{" "}
            <button
              type="submit"
              disabled={loading}
              className="btn rounded-pill w-100 py-3 fw-bold shadow-sm hover-lift d-flex align-items-center justify-content-center gap-2"
              style={{
                background: "var(--primary)",
                color: "#fff",
                border: "none",
              }}
            >
              {" "}
              {loading ? (
                <span className="spinner-border spinner-border-sm"></span>
              ) : (
                "Reset Password"
              )}{" "}
            </button>{" "}
          </form>
        ) : (
          <div>
            {" "}
            <button
              onClick={() => {
                setSubmitted(false);
                setEmail("");
              }}
              className="btn rounded-pill w-100 py-3 fw-bold hover-lift"
              style={{
                background: "var(--surface-2)",
                color: "var(--text)",
                border: "1px solid var(--border)",
              }}
            >
              {" "}
              Didn't receive the email? Try again{" "}
            </button>{" "}
          </div>
        )}{" "}
        <div className="mt-4 text-center">
          {" "}
          <Link
            to="/login"
            className="text-decoration-none small fw-bold d-inline-flex align-items-center gap-2"
            style={{ color: "var(--text-secondary)" }}
          >
            {" "}
            <ArrowLeft size={16} /> Back to log in{" "}
          </Link>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}
