import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api.js";
import {
  Search,
  CheckCircle,
  Clock,
  Plus,
  Trash2,
  X,
  Mail,
  Shield,
  Users,
  AlertTriangle,
  RefreshCw,
  Briefcase,
  GraduationCap
} from "lucide-react";
import { useToast } from "../../context/ToastContext";

const fetchAlumni = () => api.get('/alumni/directory');
const fetchInvitations = () => api.get('/alumni-invitations');
const inviteAlumni = (data) => api.post('/alumni-invitations/invite', data);
const resendAlumniInvite = (id) => api.post(`/alumni-invitations/resend/${id}`);
const approveRegistration = (id) => api.post(`/alumni-invitations/approve/${id}`);

const AlumniManagement = () => {
  const [alumniList, setAlumniList] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedInvitation, setSelectedInvitation] = useState(null);
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  const [newAlumni, setNewAlumni] = useState({
    name: "",
    email: "",
    department: "",
    graduationYear: "",
    batch: "",
    company: "",
    role: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Try to fetch existing alumni users, if the endpoint exists. It's fine if it doesn't, we just want invitations.
      try {
        const { data } = await fetchAlumni();
        setAlumniList(data.data || data);
      } catch(e) {
        setAlumniList([]);
      }
      
      const { data: invData } = await fetchInvitations();
      setInvitations(invData.data);
    } catch (error) {
      addToast("Failed to fetch data", "danger");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    // Legacy support for user suspension
  };

  const handleApprove = async (id) => {
    try {
      await approveRegistration(id);
      addToast("Registration approved. Activation email sent.", "success");
      setShowReviewModal(false);
      setSelectedInvitation(null);
      loadData();
    } catch (error) {
      addToast(error?.response?.data?.message || "Failed to approve", "danger");
    }
  };

  const handleInviteAlumni = async (e) => {
    e.preventDefault();
    if (!newAlumni.name || !newAlumni.email) {
      addToast("Name and Email are required", "danger");
      return;
    }
    setSaving(true);
    try {
      const { data } = await inviteAlumni(newAlumni);
      setShowCreateModal(false);
      setNewAlumni({ name: "", email: "", department: "", graduationYear: "", batch: "", company: "", role: "" });
      addToast(data.message || "Invitation sent successfully");
      loadData();
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to send invitation", "danger");
    } finally {
      setSaving(false);
    }
  };

  const [resendingId, setResendingId] = useState(null);

  const handleResendInvite = async (id) => {
    if (!id) return;
    setResendingId(id);
    try {
      const { data } = await resendAlumniInvite(id);
      addToast(data.message || "Invitation resent successfully");
      loadData();
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to resend invitation", "danger");
    } finally {
      setResendingId(null);
    }
  };

  const filteredAlumni = alumniList.filter((u) => {
    const matchesSearch =
      (u.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "All" || u.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredInvitations = invitations.filter((inv) => {
    const matchesSearch =
      (inv.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (inv.email || "").toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  return (
    <div
      className="container-fluid py-4 px-xl-5"
      style={{ position: 'relative' }}
    >
      <div className="d-flex flex-wrap align-items-start justify-content-between gap-3 mb-5">
        <div>
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="fw-black mb-1 d-flex align-items-center gap-3"
            style={{
              fontSize: "2.5rem",
              letterSpacing: "-0.02em",
              color: "var(--text)",
            }}
          >
            <GraduationCap size={36} className="text-primary" strokeWidth={2.5} /> Alumni
            Management
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-muted fw-medium mb-0 ms-1"
          >
            Create alumni accounts, manage onboarding, and send secure credentials.
          </motion.p>
        </div>
        <div className="d-flex gap-2">
          <button
            onClick={loadData}
            className="btn btn-outline-secondary rounded-pill px-4 fw-bold d-flex align-items-center gap-2 hover-scale"
          >
            <RefreshCw size={16} /> Refresh
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary rounded-pill px-4 fw-bold d-flex align-items-center gap-2 shadow-sm hover-lift"
            style={{
              background: "linear-gradient(135deg, var(--primary), var(--purple))",
              border: "none",
            }}
          >
            <Plus size={18} /> Add Alumni
          </button>
        </div>
      </div>

      <motion.div
        className="bento-card mb-4 p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="row g-3 align-items-center">
          <div className="col-md-7">
            <div className="input-group">
              <span
                className="input-group-text border-end-0"
                style={{ border: "1px solid var(--border)" }}
              >
                <Search size={18} className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search by name, email, company, or role..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  border: "1px solid var(--border)",
                  color: "var(--text)",
                  background: "transparent",
                }}
              />
            </div>
          </div>
          <div className="col-md-5 d-flex gap-2 justify-content-md-end flex-wrap">
            {["All", "Active", "Invited", "Suspended"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`btn btn-sm rounded-pill fw-bold px-3 ${filterStatus === status ? "btn-primary" : "btn-outline-secondary"}`}
                style={
                  filterStatus === status
                    ? {
                        background:
                          "linear-gradient(135deg, var(--primary), var(--purple))",
                        border: "none",
                      }
                    : {}
                }
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div
        className="bento-card p-0 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {loading ? (
          <div className="p-5 text-center">
            <div className="spinner-border text-primary" role="status" />
            <p className="text-muted mt-3 fw-medium">Loading alumni records...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 text-foreground">
              <thead
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <tr className="text-muted small fw-bold text-uppercase">
                  <th className="ps-4 py-3">Alumni</th>
                  <th className="py-3">Professional</th>
                  <th className="py-3">Status</th>
                  <th className="py-3">Joined</th>
                  <th className="pe-4 py-3 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAlumni.map((user, idx) => (
                  <motion.tr
                    key={user._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.04 }}
                    style={{ borderTop: "1px solid var(--border)" }}
                  >
                    <td className="ps-4 py-3">
                      <div className="d-flex align-items-center gap-3">
                        <img
                          src={`https://ui-avatars.com/api/?name=${user.name}&size=40&background=8b5cf6&color=fff&bold=true`}
                          className="rounded-circle shadow-sm"
                          width={40}
                          height={40}
                          alt={user.name}
                        />
                        <div>
                          <span
                            className="fw-bold d-block"
                            style={{ color: "var(--text)" }}
                          >
                            {user.name}
                          </span>
                          <span className="text-muted small">
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="fw-medium text-foreground">{user.alumniProfile?.designation || "Not Set"}</div>
                      <div className="small text-muted">{user.alumniProfile?.company || "Company Not Set"}</div>
                    </td>
                    <td>
                      {user.status === "Active" && (
                        <span className="neon-badge bg-success-subtle text-success px-3 py-1 fw-bold d-inline-flex align-items-center gap-1">
                          <CheckCircle size={12} /> Active
                        </span>
                      )}
                      {user.status === "Invited" && (
                        <span className="neon-badge bg-info-subtle text-info px-3 py-1 fw-bold d-inline-flex align-items-center gap-1">
                          <Mail size={12} /> Invited
                        </span>
                      )}
                      {user.status === "Pending" && (
                        <span className="neon-badge bg-warning-subtle text-warning px-3 py-1 fw-bold d-inline-flex align-items-center gap-1">
                          <Clock size={12} /> Pending
                        </span>
                      )}
                      {user.status === "Suspended" && (
                        <span className="neon-badge bg-danger-subtle text-danger px-3 py-1 fw-bold d-inline-flex align-items-center gap-1">
                          <AlertTriangle size={12} /> Suspended
                        </span>
                      )}
                    </td>
                    <td className="text-muted fw-semibold small">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="pe-4 py-3">
                      <div className="d-flex gap-2 justify-content-end flex-wrap">
                        {user.status === "Active" && (
                          <button
                            onClick={() => handleStatusChange(user._id, "Suspended")}
                            className="btn btn-sm btn-outline-warning rounded-pill fw-bold px-3 hover-scale"
                          >
                            Suspend
                          </button>
                        )}
                        {user.status === "Suspended" && (
                          <button
                            onClick={() => handleStatusChange(user._id, "Active")}
                            className="btn btn-sm btn-outline-success rounded-pill fw-bold px-3 hover-scale"
                          >
                            Activate
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}

                {filteredInvitations.map((inv, idx) => (
                  <motion.tr
                    key={inv._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: (filteredAlumni.length + idx) * 0.04 }}
                    style={{ borderTop: "1px solid var(--border)", backgroundColor: "rgba(99, 102, 241, 0.05)" }}
                  >
                    <td className="ps-4 py-3">
                      <div className="d-flex align-items-center gap-3">
                        <img
                          src={`https://ui-avatars.com/api/?name=${inv.name}&size=40&background=10b981&color=fff&bold=true`}
                          className="rounded-circle shadow-sm"
                          width={40}
                          height={40}
                          alt={inv.name}
                        />
                        <div>
                          <span
                            className="fw-bold d-block"
                            style={{ color: "var(--text)" }}
                          >
                            {inv.name}
                          </span>
                          <span className="text-muted small">
                            {inv.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="fw-medium text-foreground">{inv.role || inv.registrationData?.careerDomain || "Not Set"}</div>
                      <div className="small text-muted">{inv.company || "Company Not Set"}</div>
                    </td>
                    <td>
                      {inv.status === "REGISTRATION_SUBMITTED" ? (
                        <span className="neon-badge bg-warning-subtle text-warning px-3 py-1 fw-bold d-inline-flex align-items-center gap-1">
                          <CheckCircle size={12} /> Pending Approval
                        </span>
                      ) : (
                        <span className="neon-badge bg-info-subtle text-info px-3 py-1 fw-bold d-inline-flex align-items-center gap-1">
                          <Clock size={12} /> {inv.status.replace('_', ' ')}
                        </span>
                      )}
                    </td>
                    <td className="text-muted fw-semibold small">
                      {new Date(inv.createdAt).toLocaleDateString()}
                    </td>
                    <td className="pe-4 py-3">
                      <div className="d-flex gap-2 justify-content-end flex-wrap">
                        {inv.status === "REGISTRATION_SUBMITTED" && (
                          <button
                            onClick={() => {
                              setSelectedInvitation(inv);
                              setShowReviewModal(true);
                            }}
                            className="btn btn-sm btn-primary rounded-pill fw-bold px-3 hover-scale"
                          >
                            Review
                          </button>
                        )}
                        {(inv.status === "INVITATION_SENT" || inv.status === "OPENED" || inv.status === "EXPIRED" || inv.status === "CANCELLED") && (
                          <button
                            onClick={() => handleResendInvite(inv._id)}
                            className="btn btn-sm btn-outline-info rounded-pill fw-bold px-3 hover-scale"
                            disabled={resendingId === inv._id}
                          >
                            <Mail size={14} className="me-1" /> {resendingId === inv._id ? "Sending..." : "Resend"}
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}

                {(filteredAlumni.length === 0 && filteredInvitations.length === 0) && (
                  <tr>
                    <td
                      colSpan="5"
                      className="text-center p-5 text-muted fw-bold"
                    >
                      <Search size={40} className="mb-3 opacity-25" />
                      <br /> No alumni records or invitations found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {showCreateModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: "#000",
                zIndex: 1040,
              }}
            />
            <motion.div
              className="d-flex align-items-center justify-content-center"
              style={{ position: 'fixed', inset: 0, zIndex: 1050 }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div
                className="bento-card p-5 shadow-lg"
                style={{
                  maxWidth: 600, width: "100%", border: "1px solid var(--primary)", maxHeight: "90vh", overflowY: "auto",
                }}
              >
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4
                    className="fw-black mb-0 d-flex align-items-center gap-2"
                    style={{ color: "var(--text)" }}
                  >
                    <Plus size={24} className="text-primary" /> Invite Alumni
                  </h4>
                  <button
                    className="btn btn-outline-secondary rounded-circle p-1"
                    onClick={() => setShowCreateModal(false)}
                  >
                    <X size={20} />
                  </button>
                </div>
                <form onSubmit={handleInviteAlumni}>
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-bold small text-muted text-uppercase">Full Name</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="John Doe"
                        value={newAlumni.name}
                        onChange={(e) => setNewAlumni((p) => ({ ...p, name: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold small text-muted text-uppercase">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="john@company.com"
                        value={newAlumni.email}
                        onChange={(e) => setNewAlumni((p) => ({ ...p, email: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold small text-muted text-uppercase">Department</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Computer Science"
                        value={newAlumni.department}
                        onChange={(e) => setNewAlumni((p) => ({ ...p, department: e.target.value }))}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold small text-muted text-uppercase">Graduation Year</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="2020"
                        value={newAlumni.graduationYear}
                        onChange={(e) => setNewAlumni((p) => ({ ...p, graduationYear: e.target.value }))}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold small text-muted text-uppercase">Company</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Google"
                        value={newAlumni.company}
                        onChange={(e) => setNewAlumni((p) => ({ ...p, company: e.target.value }))}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold small text-muted text-uppercase">Role</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Backend Engineer"
                        value={newAlumni.role}
                        onChange={(e) => setNewAlumni((p) => ({ ...p, role: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div className="alert alert-info small d-flex gap-2">
                    <Shield size={16} className="mt-1" />
                    <div>
                      <strong>Secure Onboarding:</strong> An email with a secure, one-time setup token will be dispatched. No plaintext passwords will be stored or transmitted.
                    </div>
                  </div>

                  <div className="d-flex gap-3">
                    <button
                      type="button"
                      className="btn btn-outline-secondary rounded-pill flex-grow-1 fw-bold py-2"
                      onClick={() => setShowCreateModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary rounded-pill flex-grow-1 fw-bold py-2 d-flex align-items-center justify-content-center gap-2"
                      style={{
                        background: "linear-gradient(135deg, var(--primary), var(--purple))",
                        border: "none",
                      }}
                      disabled={saving}
                    >
                      {saving ? <span className="spinner-border spinner-border-sm" /> : <Mail size={16} />}
                      {saving ? "Sending Invite..." : "Send Invitation"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showReviewModal && selectedInvitation && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowReviewModal(false)}
              style={{ position: 'fixed', inset: 0, background: "#000", zIndex: 1040 }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="position-fixed d-flex align-items-center justify-content-center" style={{
                inset: 0, padding: "1rem", zIndex: 1050
              }}
            >
              <div className="bg-white rounded-4 shadow-lg p-4 p-md-5 w-100" style={{ maxWidth: "600px", maxHeight: "90vh", overflowY: "auto" }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <h3 className="fw-bold mb-1">Review Registration</h3>
                    <p className="text-muted small mb-0">Verify alumni details before granting access.</p>
                  </div>
                  <button onClick={() => setShowReviewModal(false)} className="btn btn-light rounded-circle p-2">
                    <X size={20} />
                  </button>
                </div>

                <div className="d-flex flex-column gap-3 mb-4">
                  <div className="p-3 bg-light rounded-3 border">
                    <h6 className="fw-bold text-uppercase small text-muted mb-3">Basic Information</h6>
                    <div className="d-flex flex-column gap-2">
                      <div className="d-flex justify-content-between border-bottom pb-2">
                        <span className="text-muted fw-semibold">Name</span>
                        <span className="fw-bold">{selectedInvitation.name}</span>
                      </div>
                      <div className="d-flex justify-content-between border-bottom pb-2">
                        <span className="text-muted fw-semibold">Email</span>
                        <span className="fw-bold">{selectedInvitation.email}</span>
                      </div>
                      <div className="d-flex justify-content-between border-bottom pb-2">
                        <span className="text-muted fw-semibold">Phone</span>
                        <span className="fw-bold">{selectedInvitation.registrationData?.phone || "N/A"}</span>
                      </div>
                      <div className="d-flex justify-content-between pb-1">
                        <span className="text-muted fw-semibold">Reg Number</span>
                        <span className="fw-bold">{selectedInvitation.registrationData?.registerNumber || "N/A"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-light rounded-3 border">
                    <h6 className="fw-bold text-uppercase small text-muted mb-3">Professional Summary</h6>
                    <div className="d-flex flex-column gap-2">
                      <div className="d-flex justify-content-between border-bottom pb-2">
                        <span className="text-muted fw-semibold">Company</span>
                        <span className="fw-bold">{selectedInvitation.registrationData?.currentCompany || "N/A"}</span>
                      </div>
                      <div className="d-flex justify-content-between border-bottom pb-2">
                        <span className="text-muted fw-semibold">Job Title</span>
                        <span className="fw-bold">{selectedInvitation.registrationData?.currentJobTitle || "N/A"}</span>
                      </div>
                      <div className="d-flex justify-content-between border-bottom pb-2">
                        <span className="text-muted fw-semibold">LinkedIn</span>
                        <span className="fw-bold">{selectedInvitation.registrationData?.linkedinUrl || "N/A"}</span>
                      </div>
                      <div className="d-flex justify-content-between pb-1">
                        <span className="text-muted fw-semibold">Skills</span>
                        <span className="fw-bold text-end" style={{ maxWidth: '60%' }}>
                          {(selectedInvitation.registrationData?.skills || []).join(', ') || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="d-flex gap-3 mt-4">
                  <button
                    type="button"
                    className="btn btn-outline-secondary rounded-pill flex-grow-1 fw-bold py-2"
                    onClick={() => setShowReviewModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-success rounded-pill flex-grow-1 fw-bold py-2 d-flex align-items-center justify-content-center gap-2 shadow-sm"
                    onClick={() => handleApprove(selectedInvitation._id)}
                  >
                    <CheckCircle size={16} />
                    Approve Account
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
export default AlumniManagement;





