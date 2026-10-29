import React, { useState, useEffect } from "react";
import {
  Search,
  Building2,
  Briefcase,
  Users,
  Star,
  ArrowRight,
  Plus,
  ExternalLink,
  Mail,
  Edit2,
  X,
  CheckCircle,
  Globe,
  UserCheck,
} from "lucide-react";
import { placementService } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { motion, AnimatePresence } from "framer-motion";

export default function CompaniesDatabase() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // 'add' | 'edit'
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Details Modal
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Form fields
  const [formData, setFormData] = useState({
    companyName: "",
    companyWebsite: "",
    name: "",
    email: "",
    designation: "Lead Technical Recruiter",
    verified: true,
  });

  const { addToast } = useToast();

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const res = await placementService.getCompanies();
      setCompanies(res.data?.data || []);
    } catch (err) {
      addToast("Failed to load partner companies", "error");
    } finally {
      setLoading(false);
    }
  };

  // Helper to extract true company name
  const getCompanyName = (c) => {
    const name = (
      c.companyName ||
      c.placementProfile?.companyName ||
      c.recruiterProfile?.companyName ||
      c.recruiterProfile?.company ||
      c.company
    )?.trim();

    return name || "Company name not provided";
  };

  // Helper to extract clean company website
  const getCompanyWebsite = (c) => {
    const raw = (
      c.companyWebsite ||
      c.placementProfile?.companyWebsite ||
      c.recruiterProfile?.companyWebsite
    )?.trim();

    if (!raw) return null;
    return raw.startsWith("http://") || raw.startsWith("https://")
      ? raw
      : `https://${raw}`;
  };

  // Filter companies based on search
  const filteredCompanies = companies.filter((c) => {
    const compName = getCompanyName(c).toLowerCase();
    const contactName = (c.name || "").toLowerCase();
    const email = (c.email || "").toLowerCase();
    const term = search.toLowerCase();

    return (
      !search ||
      compName.includes(term) ||
      contactName.includes(term) ||
      email.includes(term)
    );
  });

  // Open Add Modal
  const handleOpenAdd = () => {
    setModalMode("add");
    setEditingId(null);
    setFormData({
      companyName: "",
      companyWebsite: "",
      name: "",
      email: "",
      designation: "Lead Technical Recruiter",
      verified: true,
    });
    setModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (partner) => {
    setModalMode("edit");
    setEditingId(partner._id);
    setFormData({
      companyName: getCompanyName(partner) === "Company name not provided" ? "" : getCompanyName(partner),
      companyWebsite: partner.companyWebsite || partner.placementProfile?.companyWebsite || "",
      name: partner.name || "",
      email: partner.email || "",
      designation: partner.designation || partner.placementProfile?.designation || partner.recruiterProfile?.designation || "Lead Technical Recruiter",
      verified: Boolean(partner.verified),
    });
    setModalOpen(true);
  };

  // Open Partner Details Modal
  const handleOpenDetails = async (partner) => {
    setSelectedPartner(partner);
    setDetailsModalOpen(true);
    setDetailsLoading(true);

    try {
      const res = await placementService.getCompanyById(partner._id);
      if (res.data?.data) {
        setSelectedPartner(res.data.data);
      }
    } catch (err) {
      console.warn("Could not fetch full partner details, using card data:", err);
    } finally {
      setDetailsLoading(false);
    }
  };

  // Form submit handler
  const handleSubmitForm = async (e) => {
    e.preventDefault();

    if (!formData.companyName.trim()) {
      addToast("Please enter a valid company name", "warning");
      return;
    }
    if (!formData.name.trim()) {
      addToast("Please enter contact person's name", "warning");
      return;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      addToast("Please provide a valid contact email", "warning");
      return;
    }

    try {
      setSubmitting(true);
      if (modalMode === "add") {
        const res = await placementService.createCompany(formData);
        addToast(res.data?.message || "Partner added successfully!", "success");
        await fetchCompanies();
      } else {
        const res = await placementService.updateCompany(editingId, formData);
        addToast(res.data?.message || "Partner updated successfully!", "success");
        await fetchCompanies();
        if (selectedPartner && selectedPartner._id === editingId) {
          setSelectedPartner((prev) => ({ ...prev, ...formData }));
        }
      }
      setModalOpen(false);
    } catch (err) {
      addToast(err.response?.data?.message || err.message || "Operation failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-fluid py-4 px-xl-5">
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-5 flex-wrap gap-3">
        <div>
          <h2 className="fw-black mb-1 text-gradient-primary">
            Partner Companies 🏢
          </h2>
          <p className="fw-medium m-0 text-muted">
            Manage corporate recruiters, campus recruitment partners, and placement drives.
          </p>
        </div>
        <div className="d-flex gap-2">
          <button
            onClick={handleOpenAdd}
            className="btn btn-primary rounded-pill fw-bold d-flex align-items-center gap-2 shadow-sm"
          >
            <Plus size={16} /> Add Partner
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bento-card mb-4 p-4">
        <div className="position-relative">
          <Search
            className="position-absolute top-50 translate-middle-y ms-3 text-muted"
            size={18}
          />
          <input
            type="text"
            className="form-control ps-5 rounded-pill"
            placeholder="Search by company name, recruiter, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              height: "48px",
              background: "var(--surface-2)",
              color: "var(--text)",
              border: "1px solid var(--border)",
            }}
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="d-flex justify-content-center p-5">
          <div className="spinner-border text-primary"></div>
        </div>
      ) : filteredCompanies.length === 0 ? (
        <div className="text-center p-5 text-muted bento-card border-dashed">
          <Building2 size={40} className="text-muted opacity-50 mb-2 d-inline-block" />
          <h6 className="fw-bold mb-1">No partner companies found</h6>
          <p className="small text-muted mb-3">
            {search
              ? "No companies match your current search query."
              : "No corporate partner records found in the database."}
          </p>
          {search && (
            <button
              onClick={() => setSearch("")}
              className="btn btn-sm btn-outline-primary rounded-pill px-4"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className="row g-4">
          {filteredCompanies.map((company, idx) => {
            const companyName = getCompanyName(company);
            const websiteUrl = getCompanyWebsite(company);

            return (
              <div className="col-md-6 col-lg-4" key={company._id}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bento-card h-100 d-flex flex-column hover-scale position-relative"
                >
                  {/* Verified Badge */}
                  {company.verified && (
                    <div className="position-absolute top-0 end-0 m-3">
                      <span className="badge bg-success-subtle text-success border border-success">
                        <Star size={12} className="me-1" /> Verified
                      </span>
                    </div>
                  )}

                  {/* Company Logo & Name Header */}
                  <div className="d-flex align-items-start gap-3 mb-4 mt-2 pe-4">
                    <div
                      className="rounded-4 overflow-hidden d-flex justify-content-center align-items-center shadow-sm flex-shrink-0"
                      style={{
                        width: "60px",
                        height: "60px",
                        background: "rgba(var(--primary-rgb), 0.1)",
                        color: "var(--primary)",
                      }}
                    >
                      {company.avatar ? (
                        <img
                          src={company.avatar}
                          alt="logo"
                          className="w-100 h-100 object-fit-cover"
                        />
                      ) : (
                        <Building2 size={28} />
                      )}
                    </div>
                    <div className="flex-grow-1 min-w-0">
                      <h5 className="fw-bold mb-1 text-wrap text-break" title={companyName}>
                        {companyName}
                      </h5>
                      {websiteUrl ? (
                        <a
                          href={websiteUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary small text-decoration-none d-inline-flex align-items-center gap-1"
                        >
                          Visit Website <ExternalLink size={12} />
                        </a>
                      ) : (
                        <span className="text-muted small">Website not specified</span>
                      )}
                    </div>
                  </div>

                  {/* Recruiter / Contact Person */}
                  <div
                    className="mb-4 p-3 rounded-3"
                    style={{ background: "var(--surface-2)" }}
                  >
                    <small
                      className="text-muted text-uppercase fw-bold mb-2 d-block"
                      style={{ fontSize: "0.7rem", letterSpacing: "1px" }}
                    >
                      Recruiter Contact
                    </small>
                    <div className="d-flex align-items-center gap-2">
                      <div
                        className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{ width: "32px", height: "32px" }}
                      >
                        <Users size={16} />
                      </div>
                      <div className="min-w-0 flex-grow-1">
                        <h6 className="m-0 fw-bold fs-6 text-truncate">{company.name}</h6>
                        <small
                          className="text-muted d-block text-truncate"
                          title={company.email}
                        >
                          {company.email}
                        </small>
                      </div>
                    </div>
                  </div>

                  {/* Placement Statistics & Arrow Button */}
                  <div className="mt-auto pt-3 border-top d-flex align-items-center justify-content-between" style={{ borderColor: "var(--border)" }}>
                    <div className="d-flex gap-4">
                      <div className="d-flex flex-column align-items-center">
                        <span className="fw-black h5 m-0 text-primary">
                          {company.jobsCount || 0}
                        </span>
                        <small className="text-muted fw-semibold" style={{ fontSize: "0.75rem" }}>
                          Drives
                        </small>
                      </div>
                      <div className="d-flex flex-column align-items-center">
                        <span className="fw-black h5 m-0 text-success">
                          {company.hiredCount || 0}
                        </span>
                        <small className="text-muted fw-semibold" style={{ fontSize: "0.75rem" }}>
                          Hired
                        </small>
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(company)}
                        className="btn btn-sm btn-icon rounded-circle border text-muted p-2"
                        title="Edit partner"
                        style={{ width: "36px", height: "36px", background: "var(--surface-2)" }}
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleOpenDetails(company)}
                        className="btn btn-sm btn-outline-primary rounded-circle d-flex align-items-center justify-content-center p-2"
                        title="View details"
                        style={{ width: "36px", height: "36px" }}
                      >
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Partner Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div
            className="modal show d-block"
            tabIndex="-1"
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.65)",
              backdropFilter: "blur(6px)",
              zIndex: 1060,
            }}
            onClick={() => setModalOpen(false)}
          >
            <div
              className="modal-dialog modal-dialog-centered"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="modal-content border-0 shadow-lg"
                style={{
                  background: "var(--surface-1)",
                  color: "var(--text)",
                  borderRadius: "1.25rem",
                  overflow: "hidden",
                }}
              >
                <div
                  className="modal-header border-bottom py-3 px-4 d-flex align-items-center justify-content-between"
                  style={{ borderColor: "var(--border)" }}
                >
                  <h5 className="modal-title fw-bold m-0">
                    {modalMode === "add" ? "Add Corporate Partner" : "Edit Partner Company"}
                  </h5>
                  <button
                    type="button"
                    className="btn btn-sm btn-icon rounded-circle border-0 text-muted"
                    onClick={() => setModalOpen(false)}
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleSubmitForm}>
                  <div className="modal-body p-4">
                    <div className="mb-3">
                      <label className="form-label small fw-bold">Company Name *</label>
                      <input
                        type="text"
                        className="form-control rounded-pill px-3"
                        placeholder="e.g. Google India, Amazon AWS, Stripe"
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        required
                        style={{
                          background: "var(--surface-2)",
                          borderColor: "var(--border)",
                          color: "var(--text)",
                          height: "44px",
                        }}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-bold">Company Website</label>
                      <input
                        type="text"
                        className="form-control rounded-pill px-3"
                        placeholder="e.g. https://careers.google.com"
                        value={formData.companyWebsite}
                        onChange={(e) => setFormData({ ...formData, companyWebsite: e.target.value })}
                        style={{
                          background: "var(--surface-2)",
                          borderColor: "var(--border)",
                          color: "var(--text)",
                          height: "44px",
                        }}
                      />
                    </div>

                    <div className="row g-3 mb-3">
                      <div className="col-12 col-md-6">
                        <label className="form-label small fw-bold">Recruiter Name *</label>
                        <input
                          type="text"
                          className="form-control rounded-pill px-3"
                          placeholder="e.g. Marcus Vance"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                          style={{
                            background: "var(--surface-2)",
                            borderColor: "var(--border)",
                            color: "var(--text)",
                            height: "44px",
                          }}
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label small fw-bold">Contact Email *</label>
                        <input
                          type="email"
                          className="form-control rounded-pill px-3"
                          placeholder="recruiter@company.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                          style={{
                            background: "var(--surface-2)",
                            borderColor: "var(--border)",
                            color: "var(--text)",
                            height: "44px",
                          }}
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-bold">Designation</label>
                      <input
                        type="text"
                        className="form-control rounded-pill px-3"
                        placeholder="e.g. Lead Campus Recruiter"
                        value={formData.designation}
                        onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                        style={{
                          background: "var(--surface-2)",
                          borderColor: "var(--border)",
                          color: "var(--text)",
                          height: "44px",
                        }}
                      />
                    </div>

                    <div className="form-check form-switch mt-3">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        id="verifiedSwitch"
                        checked={formData.verified}
                        onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
                      />
                      <label className="form-check-label small fw-semibold" htmlFor="verifiedSwitch">
                        Mark as Verified Partner
                      </label>
                    </div>
                  </div>

                  <div
                    className="modal-footer py-2 px-4 border-top d-flex justify-content-end gap-2"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <button
                      type="button"
                      className="btn btn-secondary rounded-pill px-4"
                      onClick={() => setModalOpen(false)}
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary rounded-pill px-4 fw-bold"
                      disabled={submitting}
                    >
                      {submitting ? "Saving..." : modalMode === "add" ? "Add Partner" : "Save Changes"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Partner Details Modal */}
      <AnimatePresence>
        {detailsModalOpen && selectedPartner && (
          <div
            className="modal show d-block"
            tabIndex="-1"
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.65)",
              backdropFilter: "blur(6px)",
              zIndex: 1050,
            }}
            onClick={() => setDetailsModalOpen(false)}
          >
            <div
              className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="modal-content border-0 shadow-lg"
                style={{
                  background: "var(--surface-1)",
                  color: "var(--text)",
                  borderRadius: "1.25rem",
                  overflow: "hidden",
                }}
              >
                <div
                  className="modal-header border-bottom py-3 px-4 d-flex align-items-center justify-content-between"
                  style={{ borderColor: "var(--border)" }}
                >
                  <div className="d-flex align-items-center gap-2">
                    <Building2 className="text-primary" size={20} />
                    <h5 className="modal-title fw-bold m-0">Corporate Partner Details</h5>
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm btn-icon rounded-circle border-0 text-muted"
                    onClick={() => setDetailsModalOpen(false)}
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="modal-body p-4">
                  {detailsLoading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary mb-2"></div>
                      <p className="text-muted small">Loading partner details...</p>
                    </div>
                  ) : (
                    <div>
                      {/* Top banner */}
                      <div
                        className="p-4 rounded-4 mb-4 d-flex flex-wrap align-items-center justify-content-between gap-3"
                        style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
                      >
                        <div className="d-flex align-items-center gap-3">
                          <div
                            className="rounded-4 overflow-hidden d-flex justify-content-center align-items-center shadow-sm"
                            style={{
                              width: "64px",
                              height: "64px",
                              background: "rgba(var(--primary-rgb), 0.12)",
                              color: "var(--primary)",
                            }}
                          >
                            {selectedPartner.avatar ? (
                              <img
                                src={selectedPartner.avatar}
                                alt="logo"
                                className="w-100 h-100 object-fit-cover"
                              />
                            ) : (
                              <Building2 size={32} />
                            )}
                          </div>
                          <div>
                            <div className="d-flex align-items-center gap-2">
                              <h4 className="fw-black mb-0">{getCompanyName(selectedPartner)}</h4>
                              {selectedPartner.verified && (
                                <span className="badge bg-success-subtle text-success border border-success">
                                  <Star size={12} className="me-1" /> Verified
                                </span>
                              )}
                            </div>
                            {getCompanyWebsite(selectedPartner) ? (
                              <a
                                href={getCompanyWebsite(selectedPartner)}
                                target="_blank"
                                rel="noreferrer"
                                className="text-primary small text-decoration-none d-inline-flex align-items-center gap-1 mt-1"
                              >
                                {getCompanyWebsite(selectedPartner)} <ExternalLink size={12} />
                              </a>
                            ) : (
                              <span className="text-muted small">Website not specified</span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setDetailsModalOpen(false);
                            handleOpenEdit(selectedPartner);
                          }}
                          className="btn btn-sm btn-outline-primary rounded-pill px-3 py-2 d-inline-flex align-items-center gap-1 fw-bold"
                        >
                          <Edit2 size={14} /> Edit Partner
                        </button>
                      </div>

                      {/* Info Cards */}
                      <div className="row g-3 mb-4">
                        <div className="col-12 col-md-4">
                          <div
                            className="p-3 rounded-3 text-center h-100"
                            style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
                          >
                            <small className="text-muted d-block fw-semibold mb-1">Contact Recruiter</small>
                            <span className="fw-bold d-block">{selectedPartner.name}</span>
                            <small className="text-muted d-block text-truncate">{selectedPartner.email}</small>
                          </div>
                        </div>
                        <div className="col-6 col-md-4">
                          <div
                            className="p-3 rounded-3 text-center h-100"
                            style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
                          >
                            <small className="text-muted d-block fw-semibold mb-1">Placement Drives</small>
                            <span className="fw-black text-primary fs-4">{selectedPartner.jobsCount || 0}</span>
                          </div>
                        </div>
                        <div className="col-6 col-md-4">
                          <div
                            className="p-3 rounded-3 text-center h-100"
                            style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
                          >
                            <small className="text-muted d-block fw-semibold mb-1">Candidates Hired</small>
                            <span className="fw-black text-success fs-4">{selectedPartner.hiredCount || 0}</span>
                          </div>
                        </div>
                      </div>

                      {/* Active Job Roles / Drives */}
                      <div className="mb-2">
                        <h6 className="fw-bold mb-3">Campus Drives & Roles ({selectedPartner.jobs?.length || 0})</h6>
                        {!selectedPartner.jobs || selectedPartner.jobs.length === 0 ? (
                          <p
                            className="text-muted small p-3 rounded-3 text-center"
                            style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
                          >
                            No placement drives posted by this partner yet.
                          </p>
                        ) : (
                          <div className="table-responsive rounded-3 border" style={{ borderColor: "var(--border)" }}>
                            <table className="table table-sm align-middle mb-0">
                              <thead style={{ background: "var(--surface-2)" }}>
                                <tr>
                                  <th className="py-2 px-3 small fw-semibold">Role Title</th>
                                  <th className="py-2 px-3 small fw-semibold">Location</th>
                                  <th className="py-2 px-3 small fw-semibold text-end">Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {selectedPartner.jobs.map((job) => (
                                  <tr key={job._id}>
                                    <td className="py-2 px-3 fw-semibold small">{job.title}</td>
                                    <td className="py-2 px-3 small text-muted">{job.location || "On-site"}</td>
                                    <td className="py-2 px-3 text-end">
                                      <span className="badge bg-success-subtle text-success border border-success">
                                        Active
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div
                  className="modal-footer py-2 px-4 border-top"
                  style={{ borderColor: "var(--border)" }}
                >
                  <button
                    type="button"
                    className="btn btn-secondary rounded-pill px-4"
                    onClick={() => setDetailsModalOpen(false)}
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
