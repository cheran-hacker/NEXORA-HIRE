import React, { useState, useEffect } from "react";
import {
  Search,
  Building2,
  Briefcase,
  Users,
  Star,
  ArrowRight,
  Activity,
  Plus,
} from "lucide-react";
import { placementService } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { motion } from "framer-motion";
export default function CompaniesDatabase() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { addToast } = useToast();
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await placementService.getCompanies();
        setCompanies(res.data.data || []);
      } catch (err) {
        addToast("Failed to load companies", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, [addToast]);
  const filteredCompanies = companies.filter(
    (c) =>
      c.recruiterProfile?.companyName
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <div className="container-fluid py-4 px-xl-5">
      {" "}
      <div className="d-flex align-items-center justify-content-between mb-5 flex-wrap gap-3">
        {" "}
        <div>
          {" "}
          <h2 className="fw-black mb-1 text-gradient-primary">
            Partner Companies 🏢
          </h2>{" "}
          <p className="fw-medium m-0 text-muted">
            Manage active recruiters, active drives, and hiring pipeline.
          </p>{" "}
        </div>{" "}
        <div className="d-flex gap-2">
          {" "}
          <button className="btn btn-primary rounded-pill fw-bold d-flex align-items-center gap-2">
            {" "}
            <Plus size={16} /> Add Partner{" "}
          </button>{" "}
        </div>{" "}
      </div>{" "}
      <div className="bento-card mb-4 p-4">
        {" "}
        <div className="position-relative">
          {" "}
          <Search
            className="position-absolute top-50 translate-middle-y ms-3 text-muted"
            size={18}
          />{" "}
          <input
            type="text"
            className="form-control ps-5 rounded-pill"
            placeholder="Search by company name or recruiter..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              height: "48px",
              background: "var(--surface-2)",
              color: "var(--text)",
              border: "1px solid var(--border)",
            }}
          />{" "}
        </div>{" "}
      </div>{" "}
      {loading ? (
        <div className="d-flex justify-content-center p-5">
          <div className="spinner-border text-primary"></div>
        </div>
      ) : filteredCompanies.length === 0 ? (
        <div className="text-center p-5 text-muted bento-card border-dashed">
          No partner companies found.
        </div>
      ) : (
        <div className="row g-4">
          {" "}
          {filteredCompanies.map((company, idx) => (
            <div className="col-md-6 col-lg-4" key={company._id}>
              {" "}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="bento-card h-100 d-flex flex-column hover-scale position-relative"
              >
                {" "}
                {company.recruiterProfile?.verified && (
                  <div className="position-absolute top-0 end-0 m-3">
                    {" "}
                    <span className="badge bg-success-subtle text-success border border-success">
                      <Star size={12} className="me-1" /> Verified
                    </span>{" "}
                  </div>
                )}{" "}
                <div className="d-flex align-items-center gap-3 mb-4 mt-2">
                  {" "}
                  <div
                    className="rounded-4 overflow-hidden d-flex justify-content-center align-items-center shadow-sm"
                    style={{
                      width: "60px",
                      height: "60px",
                      background: "rgba(var(--primary-rgb), 0.1)",
                      color: "var(--primary)",
                    }}
                  >
                    {" "}
                    {company.avatar ? (
                      <img
                        src={company.avatar}
                        alt="logo"
                        className="w-100 h-100 object-fit-cover"
                      />
                    ) : (
                      <Building2 size={28} />
                    )}{" "}
                  </div>{" "}
                  <div>
                    {" "}
                    <h5
                      className="fw-bold mb-1 text-truncate"
                      style={{ maxWidth: "180px" }}
                    >
                      {company.recruiterProfile?.companyName ||
                        "Unknown Company"}
                    </h5>{" "}
                    <a
                      href={company.recruiterProfile?.companyWebsite || "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary small text-decoration-none"
                    >
                      Visit Website ↗
                    </a>{" "}
                  </div>{" "}
                </div>{" "}
                <div
                  className="mb-4 bg-light p-3 rounded-3"
                  style={{ background: "var(--surface-2) !important" }}
                >
                  {" "}
                  <small
                    className="text-muted text-uppercase fw-bold mb-2 d-block"
                    style={{ fontSize: "0.7rem", letterSpacing: "1px" }}
                  >
                    Company Contact
                  </small>{" "}
                  <div className="d-flex align-items-center gap-2">
                    {" "}
                    <div
                      className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                      style={{ width: "28px", height: "28px" }}
                    >
                      {" "}
                      <Users size={14} />{" "}
                    </div>{" "}
                    <div>
                      {" "}
                      <h6 className="m-0 fw-bold fs-6">{company.name}</h6>{" "}
                      <small
                        className="text-muted d-block text-truncate"
                        style={{ maxWidth: "180px" }}
                      >
                        {company.email}
                      </small>{" "}
                    </div>{" "}
                  </div>{" "}
                </div>{" "}
                <div className="mt-auto pt-3 border-top d-flex align-items-center justify-content-between">
                  {" "}
                  <div className="d-flex gap-4">
                    {" "}
                    <div className="d-flex flex-column align-items-center">
                      {" "}
                      <span className="fw-black h5 m-0 text-primary">
                        {company.jobsCount || 0}
                      </span>{" "}
                      <small
                        className="text-muted fw-semibold"
                        style={{ fontSize: "0.75rem" }}
                      >
                        Drives
                      </small>{" "}
                    </div>{" "}
                    <div className="d-flex flex-column align-items-center">
                      {" "}
                      <span className="fw-black h5 m-0 text-success">
                        {company.hiredCount || 0}
                      </span>{" "}
                      <small
                        className="text-muted fw-semibold"
                        style={{ fontSize: "0.75rem" }}
                      >
                        Hired
                      </small>{" "}
                    </div>{" "}
                  </div>{" "}
                  <button
                    className="btn btn-sm btn-outline-primary rounded-circle d-flex align-items-center justify-content-center p-2"
                    title="View details"
                  >
                    {" "}
                    <ArrowRight size={16} />{" "}
                  </button>{" "}
                </div>{" "}
              </motion.div>{" "}
            </div>
          ))}{" "}
        </div>
      )}{" "}
    </div>
  );
}
