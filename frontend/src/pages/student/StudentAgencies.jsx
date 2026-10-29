import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { agencyService } from "../../services/api.js";
import {
  Briefcase,
  Users,
  Star,
  DollarSign,
  TrendingUp,
  UserPlus,
  Plus,
  CheckCircle,
} from "lucide-react";
import { useToast } from "../../context/ToastContext";
const StudentAgencies = () => {
  const { addToast } = useToast();
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    agencyName: "",
    tagline: "",
    specialties: "",
  });
  const [activeAgencyForInvite, setActiveAgencyForInvite] = useState(null);
  const [inviteId, setInviteId] = useState("");
  useEffect(() => {
    fetchAgencies();
  }, []);
  const fetchAgencies = async () => {
    try {
      setLoading(true);
      const res = await agencyService.getAgencies();
      setAgencies(res.data.data || []);
    } catch (err) {
      addToast("Failed to load agencies", "error");
    } finally {
      setLoading(false);
    }
  };
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        specialties: formData.specialties.split(",").map((s) => s.trim()),
      };
      await agencyService.createAgency(data);
      addToast("Agency Incorporated! 🎉", "success");
      setShowAdd(false);
      setFormData({ agencyName: "", tagline: "", specialties: "" });
      fetchAgencies();
    } catch (err) {
      addToast(
        err.response?.data?.message || "Failed to create agency",
        "error",
      );
    }
  };
  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteId) return;
    try {
      // In MVP, backend expects an actual ObjectId. If testing UI, might fail gracefully.
      await agencyService.addFounder(activeAgencyForInvite, {
        userId: inviteId,
      });
      addToast("Co-Founder added! 🤝", "success");
      setActiveAgencyForInvite(null);
      setInviteId("");
      fetchAgencies();
    } catch (err) {
      addToast(
        err.response?.data?.message || "Failed to add co-founder (Invalid ID)",
        "error",
      );
    }
  };
  if (loading)
    return (
      <div className="container-fluid py-4 d-flex justify-content-center">
        <div className="spinner-border text-primary"></div>
      </div>
    );
  return (
    <div className="container-fluid py-4 px-xl-5">
      {" "}
      <div className="d-flex justify-content-between align-items-center mb-5 flex-wrap gap-3">
        {" "}
        <div>
          {" "}
          <h2 className="fw-black mb-1 text-gradient-primary d-flex align-items-center gap-2">
            {" "}
            Student Agencies <Briefcase size={28} />{" "}
          </h2>{" "}
          <p className="text-muted mb-0">
            Form verified freelance agencies with up to 5 co-founders to bid on
            massive client contracts.
          </p>{" "}
        </div>{" "}
        <button
          className="btn btn-dark rounded-pill px-4 shadow-sm fw-bold d-flex align-items-center gap-2"
          onClick={() => setShowAdd(true)}
        >
          {" "}
          <Plus size={20} /> Form an Agency{" "}
        </button>{" "}
      </div>{" "}
      <div className="row g-4">
        {" "}
        {agencies.map((agency, i) => (
          <div className="col-lg-6" key={agency._id}>
            {" "}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bento-card p-0 h-100 overflow-hidden border-2 border border-primary-subtle d-flex flex-column"
            >
              {" "}
              <div className="bg-card text-foreground p-4 d-flex justify-content-between align-items-center">
                {" "}
                <div>
                  {" "}
                  <h4 className="fw-black mb-1 d-flex align-items-center gap-2">
                    <Star size={20} className="text-warning fill-warning" />{" "}
                    {agency.agencyName}
                  </h4>{" "}
                  <div className="small text-foreground-50 fst-italic">
                    {agency.tagline}
                  </div>{" "}
                </div>{" "}
                <div className="badge bg-success rounded-pill px-3 shadow-sm d-flex align-items-center gap-1">
                  {" "}
                  <CheckCircle size={14} /> Verified{" "}
                </div>{" "}
              </div>{" "}
              <div className="p-4 bg-card flex-grow-1">
                {" "}
                <div className="row g-3 mb-4">
                  {" "}
                  <div className="col-6">
                    {" "}
                    <div className="bg-light p-3 rounded-3 border">
                      {" "}
                      <div className="small text-muted fw-bold text-uppercase d-flex align-items-center gap-1 mb-1">
                        <DollarSign size={14} /> Total Revenue
                      </div>{" "}
                      <h4 className="fw-black text-success mb-0">
                        ${agency.totalRevenue.toLocaleString()}
                      </h4>{" "}
                    </div>{" "}
                  </div>{" "}
                  <div className="col-6">
                    {" "}
                    <div className="bg-light p-3 rounded-3 border">
                      {" "}
                      <div className="small text-muted fw-bold text-uppercase d-flex align-items-center gap-1 mb-1">
                        <TrendingUp size={14} /> Contracts
                      </div>{" "}
                      <h4 className="fw-black text-primary mb-0">
                        {(agency.totalRevenue / 2500).toFixed(0)} Delivered
                      </h4>{" "}
                    </div>{" "}
                  </div>{" "}
                </div>{" "}
                <h6 className="fw-bold text-muted small text-uppercase mb-2">
                  Agency Specialties
                </h6>{" "}
                <div className="d-flex flex-wrap gap-2 mb-4">
                  {" "}
                  {agency.specialties?.map((spec) => (
                    <span
                      key={spec}
                      className="badge bg-primary bg-opacity-10 text-primary border border-primary-subtle"
                    >
                      {spec}
                    </span>
                  ))}{" "}
                </div>{" "}
                <div className="d-flex justify-content-between align-items-center mb-2">
                  {" "}
                  <h6 className="fw-bold text-muted small text-uppercase mb-0">
                    Co-Founders ({agency.founders?.length}/5)
                  </h6>{" "}
                  {agency.founders?.length < 5 && (
                    <button
                      className="btn btn-sm btn-link text-decoration-none fw-bold p-0 d-flex align-items-center gap-1"
                      onClick={() => setActiveAgencyForInvite(agency._id)}
                    >
                      {" "}
                      <UserPlus size={14} /> Add{" "}
                    </button>
                  )}{" "}
                </div>{" "}
                <div className="d-flex flex-column gap-2">
                  {" "}
                  {agency.founders?.map((f, index) => (
                    <div
                      key={index}
                      className="bg-light px-3 py-2 rounded-3 border d-flex align-items-center gap-2"
                    >
                      {" "}
                      <div
                        className="bg-card text-foreground rounded-circle d-flex align-items-center justify-content-center fw-bold"
                        style={{ width: 30, height: 30 }}
                      >
                        {" "}
                        {f.name?.charAt(0) || "?"}{" "}
                      </div>{" "}
                      <span className="fw-bold text-foreground">{f.name}</span>{" "}
                      {index === 0 && (
                        <span className="badge bg-warning text-foreground ms-auto">
                          Creator
                        </span>
                      )}{" "}
                    </div>
                  ))}{" "}
                </div>{" "}
              </div>{" "}
            </motion.div>{" "}
          </div>
        ))}{" "}
        {agencies.length === 0 && (
          <div className="col-12 text-center p-5 bento-card ">
            {" "}
            <Briefcase
              size={48}
              className="text-muted mb-3 opacity-25 mx-auto"
            />{" "}
            <h5 className="fw-bold text-muted">No Agencies Found.</h5>{" "}
            <p className="text-muted small">
              Be the first to incorporate a digital agency on campus.
            </p>{" "}
          </div>
        )}{" "}
      </div>{" "}
      {/* Form Agency Modal */}{" "}
      <AnimatePresence>
        {" "}
        {showAdd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-backdrop-blur"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "rgba(0,0,0,0.02)",
              zIndex: 1050,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {" "}
            <div
              className="bento-card bg-card p-4"
              style={{ width: "90%", maxWidth: "400px" }}
            >
              {" "}
              <div className="text-center mb-4">
                {" "}
                <div className="bg-card text-foreground rounded-circle d-inline-flex p-3 mb-3 shadow-sm">
                  {" "}
                  <Briefcase size={32} />{" "}
                </div>{" "}
                <h4 className="fw-bold">Form Agency</h4>{" "}
              </div>{" "}
              <form onSubmit={handleCreate}>
                {" "}
                <div className="mb-3">
                  {" "}
                  <label className="form-label fw-bold small">
                    Agency Name
                  </label>{" "}
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={formData.agencyName}
                    onChange={(e) =>
                      setFormData({ ...formData, agencyName: e.target.value })
                    }
                    placeholder="e.g. PixelForge Studios"
                  />{" "}
                </div>{" "}
                <div className="mb-3">
                  {" "}
                  <label className="form-label fw-bold small">
                    Tagline
                  </label>{" "}
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={formData.tagline}
                    onChange={(e) =>
                      setFormData({ ...formData, tagline: e.target.value })
                    }
                    placeholder="e.g. Crafting Next-Gen Web Experiences"
                  />{" "}
                </div>{" "}
                <div className="mb-4">
                  {" "}
                  <label className="form-label fw-bold small">
                    Specialties (Comma Separated)
                  </label>{" "}
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={formData.specialties}
                    onChange={(e) =>
                      setFormData({ ...formData, specialties: e.target.value })
                    }
                    placeholder="e.g. React, Node, Design"
                  />{" "}
                </div>{" "}
                <div className="d-flex justify-content-end gap-2">
                  {" "}
                  <button
                    type="button"
                    className="btn btn-light rounded-pill px-4"
                    onClick={() => setShowAdd(false)}
                  >
                    Cancel
                  </button>{" "}
                  <button
                    type="submit"
                    className="btn btn-dark rounded-pill px-4 fw-bold"
                  >
                    Incorporate
                  </button>{" "}
                </div>{" "}
              </form>{" "}
            </div>{" "}
          </motion.div>
        )}{" "}
      </AnimatePresence>{" "}
      {/* Invite CoFounder Modal */}{" "}
      <AnimatePresence>
        {" "}
        {activeAgencyForInvite && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-backdrop-blur"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "rgba(0,0,0,0.02)",
              zIndex: 1050,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {" "}
            <div
              className="bento-card bg-card p-4"
              style={{ width: "90%", maxWidth: "400px" }}
            >
              {" "}
              <div className="text-center mb-4">
                {" "}
                <div className="bg-primary text-white rounded-circle d-inline-flex p-3 mb-3 shadow-sm">
                  {" "}
                  <Users size={32} />{" "}
                </div>{" "}
                <h4 className="fw-bold">Invite Co-Founder</h4>{" "}
              </div>{" "}
              <form onSubmit={handleInvite}>
                {" "}
                <div className="mb-4">
                  {" "}
                  <label className="form-label fw-bold small">
                    User ID to Invite
                  </label>{" "}
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={inviteId}
                    onChange={(e) => setInviteId(e.target.value)}
                    placeholder="Paste User ID here..."
                  />{" "}
                </div>{" "}
                <div className="d-flex justify-content-end gap-2">
                  {" "}
                  <button
                    type="button"
                    className="btn btn-light rounded-pill px-4"
                    onClick={() => setActiveAgencyForInvite(null)}
                  >
                    Cancel
                  </button>{" "}
                  <button
                    type="submit"
                    className="btn btn-primary rounded-pill px-4 fw-bold"
                  >
                    Send Invite
                  </button>{" "}
                </div>{" "}
              </form>{" "}
            </div>{" "}
          </motion.div>
        )}{" "}
      </AnimatePresence>{" "}
    </div>
  );
};
export default StudentAgencies;
