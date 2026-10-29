import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Shield, Key, Eye, EyeOff, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

const ActivateAccount = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const { addToast } = useToast();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      addToast("Passwords do not match", "danger");
      return;
    }
    if (password.length < 8) {
      addToast("Password must be at least 8 characters", "danger");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post(`/auth/activate/${token}`, { password });
      
      // We automatically log the user in
      authLogin(response.data.user, response.data.token);
      setSuccess(true);
      addToast("Account activated successfully!", "success");

      // Redirect after brief delay
      setTimeout(() => {
        navigate("/alumni/dashboard");
      }, 2000);
    } catch (error) {
      addToast(error?.response?.data?.message || "Activation failed or token expired", "danger");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="onboarding-wrapper">
        <motion.div 
          className="onboarding-card text-center p-5"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className="mb-4 d-inline-block p-4 rounded-circle bg-success-subtle">
            <CheckCircle size={64} className="text-success" />
          </div>
          <h2 className="fw-black mb-3">Account Activated!</h2>
          <p className="text-muted mb-4">Your Alumni account is now active. Redirecting to your dashboard...</p>
          <div className="spinner-border text-primary" role="status"></div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="onboarding-wrapper">
      <div className="onboarding-content d-flex align-items-center justify-content-center min-vh-100">
        <motion.div
          className="onboarding-card shadow-lg p-5"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          style={{ maxWidth: "480px", width: "100%", background: "var(--card-bg)" }}
        >
          <div className="text-center mb-5">
            <div className="mb-3 d-inline-flex align-items-center justify-content-center p-3 rounded-circle" style={{ background: "rgba(139, 92, 246, 0.1)" }}>
              <Shield size={32} className="text-primary" />
            </div>
            <h2 className="fw-black mb-2" style={{ letterSpacing: "-1px" }}>Secure Activation</h2>
            <p className="text-muted">Set your password to activate your Alumni account and join the ecosystem.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="form-label fw-bold small text-muted text-uppercase">New Password</label>
              <div className="input-group">
                <span className="input-group-text bg-transparent border-end-0 border-secondary">
                  <Key size={18} className="text-muted" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control border-start-0 border-secondary bg-transparent text-white"
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="input-group-text bg-transparent border-start-0 border-secondary text-muted"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="mb-5">
              <label className="form-label fw-bold small text-muted text-uppercase">Confirm Password</label>
              <div className="input-group">
                <span className="input-group-text bg-transparent border-end-0 border-secondary">
                  <Key size={18} className="text-muted" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control border-start-0 border-secondary bg-transparent text-white"
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 rounded-pill py-3 fw-bold shadow hover-lift mb-3"
              disabled={loading}
              style={{ background: "linear-gradient(135deg, var(--primary), var(--purple))", border: "none" }}
            >
              {loading ? (
                <span className="spinner-border spinner-border-sm me-2" />
              ) : (
                "Activate Account"
              )}
            </button>
            <div className="text-center text-muted small">
              By activating, you agree to the <Link to="/terms" className="text-primary text-decoration-none">Terms of Service</Link>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default ActivateAccount;
