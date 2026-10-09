import React from "react";
import { motion } from "framer-motion";
import { Wrench, Sparkles, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
const ComingSoon = ({
  title = "Under Construction",
  description = "We are working hard to bring this feature to you soon.",
}) => {
  const navigate = useNavigate();
  return (
    <div
      className="container-fluid py-5 px-xl-5 d-flex flex-column align-items-center justify-content-center min-vh-100"
      style={{ background: "var(--bg)" }}
    >
      {" "}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="text-center p-5 rounded-4 shadow-lg"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          maxWidth: "500px",
          width: "100%",
        }}
      >
        {" "}
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className="mb-4 d-inline-block p-4 rounded-circle"
          style={{
            background: "rgba(99, 102, 241, 0.1)",
            color: "var(--primary)",
          }}
        >
          {" "}
          <Wrench size={48} strokeWidth={1.5} />{" "}
        </motion.div>{" "}
        <h2 className="fw-black mb-3" style={{ color: "var(--text)" }}>
          {" "}
          {title}{" "}
          <Sparkles className="text-warning d-inline pb-1" size={24} />{" "}
        </h2>{" "}
        <p className="text-muted mb-4 fs-5"> {description} </p>{" "}
        <div
          className="progress mb-4"
          style={{
            height: "8px",
            background: "var(--bg)",
            borderRadius: "10px",
          }}
        >
          {" "}
          <div
            className="progress-bar progress-bar-striped progress-bar-animated bg-primary"
            role="progressbar"
            style={{ width: "65%", borderRadius: "10px" }}
          ></div>{" "}
        </div>{" "}
        <button
          onClick={() => navigate(-1)}
          className="btn btn-outline-primary fw-bold rounded-pill px-4 py-2 d-inline-flex align-items-center gap-2"
        >
          {" "}
          <ArrowLeft size={18} /> Go Back{" "}
        </button>{" "}
      </motion.div>{" "}
    </div>
  );
};
export default ComingSoon;
