import React, { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ShieldCheck, ArrowRight, CheckCircle, Sun, Moon } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import axios from "axios";
import { authService } from "../../services/api.js";
const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [success, setSuccess] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();
  const password = watch("password");
  const onSubmit = async (data) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      // Direct axios call or use authService // Assuming we have an endpoint for this in our backend running on localhost:5000/api
      const res = await axios.post(
        "http://localhost:5000/api/auth/reset-password",
        { resetToken: token, newPassword: data.password },
      );
      if (res.data.success) {
        setSuccess(true);
      } else {
        setErrorMsg(res.data.message);
      }
    } catch (err) {
      setErrorMsg(
        err?.response?.data?.message ||
          "Failed to reset password. Token might be invalid or expired.",
      );
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center p-4"
      style={{
        background: "var(--bg)",
        position: 'relative',
        overflow: "hidden",
      }}
    >
      {" "}
      {/* Background decorations */}{" "}
      <div
        className="position-absolute rounded-circle"
        style={{
          top: "-10%",
          left: "-10%",
          width: "400px",
          height: "400px",
          background:
            "radial-gradient(circle, rgba(var(--primary-rgb),0.15) 0%, transparent 70%)",
          filter: "blur(40px)",
          zIndex: 0,
        }}
      ></div>{" "}
      <div
        className="position-absolute rounded-circle"
        style={{
          bottom: "-10%",
          right: "-10%",
          width: "500px",
          height: "500px",
          background:
            "radial-gradient(circle, rgba(var(--purple-rgb),0.1) 0%, transparent 70%)",
          filter: "blur(60px)",
          zIndex: 0,
        }}
      ></div>{" "}
      <div className="position-absolute top-0 end-0 p-4 z-2">
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
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-100 position-relative z-1"
        style={{ maxWidth: "440px" }}
      >
        {" "}
        <div
          className="card border-0 shadow-lg"
          style={{ background: "var(--surface)", borderRadius: "24px" }}
        >
          {" "}
          <div className="card-body p-4 p-sm-5">
            {" "}
            <div className="text-center mb-4">
              {" "}
              <div
                className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3 shadow"
                style={{
                  width: "64px",
                  height: "64px",
                  background:
                    "linear-gradient(135deg, var(--primary), var(--secondary))",
                }}
              >
                {" "}
                {success ? (
                  <CheckCircle color="white" size={32} />
                ) : (
                  <ShieldCheck color="white" size={32} />
                )}{" "}
              </div>{" "}
              <h2 className="fw-black mb-2" style={{ color: "var(--text)" }}>
                {" "}
                {success ? "Password Reset!" : "New Password"}{" "}
              </h2>{" "}
              <p style={{ color: "var(--text-muted)" }}>
                {" "}
                {success
                  ? "Your password has been successfully updated."
                  : "Enter your new password below."}{" "}
              </p>{" "}
            </div>{" "}
            {success ? (
              <div className="text-center mt-4">
                {" "}
                <Link
                  to="/login"
                  className="btn btn-primary w-100 fw-bold p-3 rounded-4"
                >
                  {" "}
                  Go to Login <ArrowRight size={18} className="ms-2" />{" "}
                </Link>{" "}
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)}>
                {" "}
                <div className="mb-3">
                  {" "}
                  <label
                    className="form-label small fw-bold text-uppercase"
                    style={{
                      letterSpacing: "0.05em",
                      color: "var(--text-muted)",
                    }}
                  >
                    New Password
                  </label>{" "}
                  <input
                    type="password"
                    className={`form-control bg-transparent ${errors.password ? "is-invalid border-danger" : ""}`}
                    style={{
                      padding: "12px 16px",
                      borderRadius: 12,
                      borderColor: "var(--border)",
                      color: "var(--text)",
                    }}
                    placeholder="••••••••"
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters",
                      },
                    })}
                  />{" "}
                  {errors.password && (
                    <div className="invalid-feedback">
                      {errors.password.message}
                    </div>
                  )}{" "}
                </div>{" "}
                <div className="mb-4">
                  {" "}
                  <label
                    className="form-label small fw-bold text-uppercase"
                    style={{
                      letterSpacing: "0.05em",
                      color: "var(--text-muted)",
                    }}
                  >
                    Confirm Password
                  </label>{" "}
                  <input
                    type="password"
                    className={`form-control bg-transparent ${errors.confirmPassword ? "is-invalid border-danger" : ""}`}
                    style={{
                      padding: "12px 16px",
                      borderRadius: 12,
                      borderColor: "var(--border)",
                      color: "var(--text)",
                    }}
                    placeholder="••••••••"
                    {...register("confirmPassword", {
                      required: "Confirm password is required",
                      validate: (value) =>
                        value === password || "The passwords do not match",
                    })}
                  />{" "}
                  {errors.confirmPassword && (
                    <div className="invalid-feedback">
                      {errors.confirmPassword.message}
                    </div>
                  )}{" "}
                </div>{" "}
                {errorMsg && (
                  <div className="alert alert-danger p-2 small text-center mb-4">
                    {errorMsg}
                  </div>
                )}{" "}
                <button
                  type="submit"
                  className="btn btn-primary w-100 fw-bold d-flex align-items-center justify-content-center gap-2 mb-3"
                  style={{ padding: "14px", borderRadius: 12 }}
                  disabled={isLoading}
                >
                  {" "}
                  {isLoading ? (
                    <span className="spinner-border spinner-border-sm" />
                  ) : (
                    <>
                      Update Password <ArrowRight size={18} />
                    </>
                  )}{" "}
                </button>{" "}
                <div className="text-center mt-3">
                  {" "}
                  <Link
                    to="/login"
                    className="text-decoration-none small fw-semibold"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Back to Login
                  </Link>{" "}
                </div>{" "}
              </form>
            )}{" "}
          </div>{" "}
        </div>{" "}
      </motion.div>{" "}
    </div>
  );
};
export default ResetPassword;
