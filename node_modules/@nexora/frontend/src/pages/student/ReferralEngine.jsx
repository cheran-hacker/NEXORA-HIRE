import React, { useState } from "react";
import { motion } from "framer-motion";
import { networkService } from "../../services/api.js";
import {
  Search,
  Network,
  ArrowRight,
  UserCheck,
  Briefcase,
} from "lucide-react";
import { useToast } from "../../context/ToastContext";
const ReferralEngine = () => {
  const { addToast } = useToast();
  const [company, setCompany] = useState("");
  const [path, setPath] = useState(null);
  const [loading, setLoading] = useState(false);
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!company.trim()) return;
    try {
      setLoading(true);
      const res = await networkService.getPath(company);
      setPath(res.data.data.path);
    } catch (err) {
      setPath(null);
      addToast(
        err.response?.data?.message || "Failed to map connection",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="container-fluid py-4 px-xl-5">
      {" "}
      <div className="mb-5">
        {" "}
        <h2 className="fw-black mb-1 text-gradient-primary d-flex align-items-center gap-2">
          {" "}
          Referral Engine <Network size={28} />{" "}
        </h2>{" "}
        <p className="text-muted mb-0">
          Discover the shortest path of warm introductions to reach alumni at
          top companies.
        </p>{" "}
      </div>{" "}
      <div className="row mb-5">
        {" "}
        <div className="col-lg-8 col-xl-6">
          {" "}
          <form onSubmit={handleSearch} className="d-flex gap-3">
            {" "}
            <div className="position-relative flex-fill">
              {" "}
              <Search
                className="position-absolute text-muted"
                style={{ left: 15, top: 12 }}
                size={20}
              />{" "}
              <input
                type="text"
                className="form-control rounded-pill ps-5 py-2"
                placeholder="Search for a company (e.g., Google, Amazon)..."
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />{" "}
            </div>{" "}
            <button
              type="submit"
              className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm"
              disabled={loading}
            >
              {" "}
              {loading ? "Mapping..." : "Map Connection"}{" "}
            </button>{" "}
          </form>{" "}
        </div>{" "}
      </div>{" "}
      {path && (
        <div className="bento-card p-5 mt-4">
          {" "}
          <h4 className="fw-bold mb-5 text-center">
            Your path to <span className="text-primary">{company}</span>
          </h4>{" "}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-4 position-relative">
            {" "}
            {/* Draw connecting line on desktop */}{" "}
            <div
              className="d-none d-md-block position-absolute"
              style={{
                height: "4px",
                background: "var(--border)",
                top: "40px",
                left: "10%",
                right: "10%",
                zIndex: 0,
              }}
            ></div>{" "}
            {path.map((node, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                className="d-flex flex-column align-items-center position-relative z-1"
                style={{ width: "200px" }}
              >
                {" "}
                <div
                  className={`rounded-circle d-flex align-items-center justify-content-center shadow-lg mb-3 ${node.role === "Student" ? "bg-primary text-white" : node.role === "Alumni" ? "bg-warning text-foreground" : "bg-success text-white"}`}
                  style={{
                    width: 80,
                    height: 80,
                    border: "4px solid var(--surface-1)",
                  }}
                >
                  {" "}
                  {node.role === "Student" ? (
                    <UserCheck size={32} />
                  ) : node.role === "Alumni" ? (
                    <Briefcase size={32} />
                  ) : (
                    <Network size={32} />
                  )}{" "}
                </div>{" "}
                <div className="text-center">
                  {" "}
                  <h5 className="fw-bold mb-1">{node.name}</h5>{" "}
                  <span className="badge bg-secondary-subtle text-secondary rounded-pill mb-2">
                    {node.role}
                  </span>{" "}
                  {node.company && (
                    <div className="small fw-bold text-primary mb-1">
                      <Briefcase size={12} className="me-1" />
                      {node.company}
                    </div>
                  )}{" "}
                  {node.connectionType && (
                    <div className="small text-muted fst-italic mt-2">
                      ({node.connectionType})
                    </div>
                  )}{" "}
                </div>{" "}
                {/* Arrow for mobile view */}{" "}
                {i < path.length - 1 && (
                  <div className="d-md-none my-3 text-muted">
                    {" "}
                    <ArrowRight
                      size={24}
                      style={{ transform: "rotate(90deg)" }}
                    />{" "}
                  </div>
                )}{" "}
              </motion.div>
            ))}{" "}
          </div>{" "}
          <div className="text-center mt-5">
            {" "}
            <button
              onClick={async () => {
                try {
                  await networkService.requestIntroduction({
                    company,
                    via: path[1]?._id,
                  });
                  addToast(
                    `Introduction request sent via ${path.length > 1 ? path[1].name : "System"}! 🤝`,
                    "success",
                  );
                } catch (err) {
                  addToast(
                    err.message || "Failed to send introduction request",
                    "error",
                  );
                }
              }}
              className="btn btn-outline-primary rounded-pill px-5 fw-bold"
            >
              Request Introduction via{" "}
              {path.length > 1 ? path[1].name : "System"}
            </button>{" "}
          </div>{" "}
        </div>
      )}{" "}
    </div>
  );
};
export default ReferralEngine;
