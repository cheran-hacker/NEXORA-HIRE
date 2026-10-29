import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ArrowLeft, Home } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function NotFound() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleReturn = () => {
    if (user) {
      if (user.role?.toLowerCase() === "student") return navigate("/student/dashboard");
      if (user.role?.toLowerCase() === "alumni") return navigate("/alumni/dashboard");
      if (user.role?.toLowerCase() === "placement") return navigate("/placement/dashboard");
      if (user.role?.toLowerCase() === "admin") return navigate("/admin/dashboard");
    }
    navigate("/");
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100" style={{ background: "var(--bg)", color: "var(--text)" }}>
      <div className="text-center px-4" style={{ maxWidth: "600px" }}>
        <div className="d-flex justify-content-center mb-4">
          <div className="rounded-circle d-flex align-items-center justify-content-center shadow" style={{ width: 100, height: 100, background: "var(--surface)", border: "1px solid var(--border)" }}>
            <Search size={48} className="text-muted" />
          </div>
        </div>
        <h1 className="fw-black mb-3" style={{ fontSize: "5rem", letterSpacing: "-0.05em", color: "var(--primary)" }}>404</h1>
        <h3 className="fw-bold mb-3" style={{ color: "var(--text)" }}>Page Not Found</h3>
        <p className="text-muted mb-5 fs-5">
          Oops! It looks like the page you are looking for doesn't exist, has been moved, or you don't have permission to access it.
        </p>
        <div className="d-flex justify-content-center gap-3 flex-wrap">
          <button onClick={() => navigate(-1)} className="btn btn-outline-secondary px-4 py-2 rounded-pill fw-bold d-flex align-items-center gap-2 hover-scale">
            <ArrowLeft size={18} /> Go Back
          </button>
          <button onClick={handleReturn} className="btn btn-primary px-4 py-2 rounded-pill fw-bold d-flex align-items-center gap-2 hover-scale">
            <Home size={18} /> {user ? "Return to Dashboard" : "Return to Home"}
          </button>
        </div>
      </div>
    </div>
  );
}
