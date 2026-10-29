import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api, { adminService } from "../../services/api.js";
import { getAvatarUrl } from "../../utils/avatar.js";
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
  GraduationCap,
  Edit3,
  Eye,
  Building,
  Calendar,
  Lock,
  Phone,
  CheckSquare
} from "lucide-react";
import { useToast } from "../../context/ToastContext";

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

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedInvitation, setSelectedInvitation] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'alumni' | 'invitation', item }

  const [saving, setSaving] = useState(false);
  const [resendingId, setResendingId] = useState(null);
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

  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    department: "",
    graduationYear: "",
    company: "",
    designation: "",
    status: "Active"
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Fetch users from admin API and extract Alumni
      try {
        const usersRes = await adminService.getUsers();
        const allUsers = usersRes.data?.data || usersRes.data || [];
        const alumniOnly = allUsers.filter(u => u.role === "Alumni");
        setAlumniList(alumniOnly);
      } catch (err) {
        // Fallback to directory if needed
        try {
          const dirRes = await api.get('/alumni/directory');
          setAlumniList(dirRes.data?.data || dirRes.data || []);
        } catch {
          setAlumniList([]);
        }
      }

      const { data: invData } = await fetchInvitations();
      setInvitations(invData.data || []);
    } catch (error) {
      console.error(error);
      addToast("Failed to fetch alumni records", "danger");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await adminService.updateUser(id, { status: newStatus });
      addToast(`Alumni account marked as ${newStatus}`, "success");
      setAlumniList(prev => prev.map(u => u._id === id ? { ...u, status: newStatus } : u));
    } catch (err) {
      console.error(err);
      addToast("Failed to update status", "danger");
    }
  };

  const handleOpenEdit = (alumni) => {
    setEditTarget(alumni);
    setEditForm({
      name: alumni.name || "",
      email: alumni.email || "",
      department: alumni.alumniProfile?.department || "",
      graduationYear: alumni.alumniProfile?.graduationYear || alumni.alumniProfile?.year || "",
      company: alumni.alumniProfile?.company || "",
      designation: alumni.alumniProfile?.designation || alumni.alumniProfile?.role || "",
      status: alumni.status || "Active"
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editTarget) return;
    setSaving(true);
    try {
      await adminService.updateUser(editTarget._id, {
        name: editForm.name,
        email: editForm.email,
        status: editForm.status,
        company: editForm.company,
        designation: editForm.designation,
        department: editForm.department,
        year: editForm.graduationYear
      });
      addToast("Alumni profile updated successfully", "success");
      setEditTarget(null);
      loadData();
    } catch (err) {
      console.error(err);
      addToast(err?.response?.data?.message || "Failed to update alumni record", "danger");
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      if (deleteTarget.type === "alumni") {
        await adminService.deleteUser(deleteTarget.item._id);
        addToast("Alumni account removed from database", "success");
      } else {
        await adminService.deleteAlumniInvitation(deleteTarget.item._id);
        addToast("Invitation deleted successfully", "success");
      }
      setDeleteTarget(null);
      loadData();
    } catch (err) {
      console.error(err);
      addToast(err?.response?.data?.message || "Failed to delete item", "danger");
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await approveRegistration(id);
      addToast("Registration approved. Activation email dispatched.", "success");
      setShowReviewModal(false);
      setSelectedInvitation(null);
      loadData();
    } catch (error) {
      addToast(error?.response?.data?.message || "Failed to approve registration", "danger");
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
      addToast(data.message || "Invitation dispatched successfully", "success");
      loadData();
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to send invitation", "danger");
    } finally {
      setSaving(false);
    }
  };

  const handleResendInvite = async (id) => {
    if (!id) return;
    setResendingId(id);
    try {
      const { data } = await resendAlumniInvite(id);
      addToast(data.message || "Invitation resent successfully", "success");
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
      (u.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.alumniProfile?.company || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.alumniProfile?.designation || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "All" || u.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredInvitations = invitations.filter((inv) => {
    const matchesSearch =
      (inv.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (inv.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (inv.company || "").toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="container-fluid py-4 px-xl-5" style={{ position: 'relative' }}>
      
      {/* HEADER */}
      <div className="d-flex flex-wrap align-items-start justify-content-between gap-3 mb-4">
        <div>
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="fw-black mb-1 d-flex align-items-center gap-3"
            style={{ fontSize: "2.2rem", letterSpacing: "-0.02em", color: "var(--text)" }}
          >
            <GraduationCap size={36} className="text-primary" strokeWidth={2.5} /> 
            Alumni Management & Mentorship Center
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-muted fw-medium mb-0 ms-1 small"
          >
            Manage alumni network, review onboarding applications, edit mentor credentials, and verify company affiliations.
          </motion.p>
        </div>
        <div className="d-flex gap-2">
          <button
            onClick={loadData}
            className="btn btn-outline-secondary rounded-pill px-3 fw-bold d-flex align-items-center gap-2 hover-scale"
          >
            <RefreshCw size={15} className={loading ? "spin" : ""} /> Refresh
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary rounded-pill px-4 fw-bold d-flex align-items-center gap-2 shadow-sm hover-lift"
            style={{
              background: "linear-gradient(135deg, var(--primary), #8b5cf6)",
              border: "none",
            }}
          >
            <Plus size={18} /> Invite Alumni
          </button>
        </div>
      </div>

      {/* SEARCH AND FILTERS */}
      <motion.div
        className="bento-card mb-4 p-3"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="row g-3 align-items-center">
          <div className="col-md-7">
            <div className="input-group">
              <span className="input-group-text border-end-0 bg-transparent" style={{ border: "1px solid var(--border)" }}>
                <Search size={18} className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search alumni by name, email, company, or designation..."
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
            {["All", "Active", "Pending", "Suspended"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`btn btn-sm rounded-pill fw-bold px-3 ${filterStatus === status ? "btn-primary" : "btn-outline-secondary"}`}
                style={filterStatus === status ? { background: "linear-gradient(135deg, var(--primary), #8b5cf6)", border: "none" } : {}}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* MAIN DATA TABLE */}
      <motion.div
        className="bento-card p-0 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        {loading ? (
          <div className="p-5 text-center">
            <div className="spinner-border text-primary" role="status" />
            <p className="text-muted mt-3 fw-medium">Loading verified alumni and pending invites...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 text-foreground">
              <thead style={{ background: "rgba(255, 255, 255, 0.03)", borderBottom: "1px solid var(--border)" }}>
                <tr className="text-muted small fw-bold text-uppercase">
                  <th className="ps-4 py-3">Alumni Mentor</th>
                  <th className="py-3">Role & Affiliation</th>
                  <th className="py-3">Status</th>
                  <th className="py-3">Graduation</th>
                  <th className="pe-4 py-3 text-end">Actions (CRUD)</th>
                </tr>
              </thead>
              <tbody>
                
                {/* VERIFIED ALUMNI USERS */}
                {filteredAlumni.map((user, idx) => (
                  <motion.tr
                    key={user._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.03 }}
                    style={{ borderTop: "1px solid var(--border)" }}
                  >
                    <td className="ps-4 py-3">
                      <div className="d-flex align-items-center gap-3">
                        <img
                          src={getAvatarUrl(user.name, user.avatar)}
                          className="rounded-circle shadow-sm object-fit-cover"
                          width={40}
                          height={40}
                          alt={user.name}
                        />
                        <div>
                          <span className="fw-bold d-block text-white" style={{ fontSize: '0.9rem' }}>
                            {user.name}
                          </span>
                          <span className="text-muted small">
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="fw-medium text-white" style={{ fontSize: '0.85rem' }}>
                        {user.alumniProfile?.designation || user.alumniProfile?.role || "Mentor"}
                      </div>
                      <div className="small text-muted d-flex align-items-center gap-1">
                        <Building size={12} className="text-primary" />
                        {user.alumniProfile?.company || "Affiliation Unspecified"}
                      </div>
                    </td>
                    <td>
                      {user.status === "Active" && (
                        <span className="badge bg-success-subtle text-success border border-success border-opacity-25 px-2 py-1 fw-bold d-inline-flex align-items-center gap-1">
                          <CheckCircle size={12} /> Active
                        </span>
                      )}
                      {user.status === "Pending" && (
                        <span className="badge bg-warning-subtle text-warning border border-warning border-opacity-25 px-2 py-1 fw-bold d-inline-flex align-items-center gap-1">
                          <Clock size={12} /> Pending
                        </span>
                      )}
                      {user.status === "Suspended" && (
                        <span className="badge bg-danger-subtle text-danger border border-danger border-opacity-25 px-2 py-1 fw-bold d-inline-flex align-items-center gap-1">
                          <AlertTriangle size={12} /> Suspended
                        </span>
                      )}
                    </td>
                    <td className="text-muted fw-semibold small">
                      {user.alumniProfile?.graduationYear || user.alumniProfile?.year || user.alumniProfile?.batch || "Alumnus"}
                    </td>
                    <td className="pe-4 py-3 text-end">
                      <div className="d-flex gap-2 justify-content-end align-items-center flex-wrap">
                        
                        {/* EDIT BUTTON */}
                        <button
                          onClick={() => handleOpenEdit(user)}
                          className="btn btn-sm btn-outline-info rounded-pill fw-bold px-3 d-flex align-items-center gap-1 hover-scale"
                          title="Edit Alumni Credentials"
                        >
                          <Edit3 size={13} /> Edit
                        </button>

                        {/* VIEW PROFILE BUTTON */}
                        <button
                          onClick={() => setViewTarget(user)}
                          className="btn btn-sm btn-outline-secondary rounded-pill fw-bold px-3 d-flex align-items-center gap-1 hover-scale"
                          title="View Profile Details"
                        >
                          <Eye size={13} /> View
                        </button>

                        {/* STATUS TOGGLE */}
                        {user.status === "Active" ? (
                          <button
                            onClick={() => handleStatusChange(user._id, "Suspended")}
                            className="btn btn-sm btn-outline-warning rounded-pill fw-bold px-2 hover-scale"
                            title="Suspend Access"
                          >
                            Suspend
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusChange(user._id, "Active")}
                            className="btn btn-sm btn-outline-success rounded-pill fw-bold px-2 hover-scale"
                            title="Activate Account"
                          >
                            Activate
                          </button>
                        )}

                        {/* DELETE BUTTON */}
                        <button
                          onClick={() => setDeleteTarget({ type: 'alumni', item: user })}
                          className="btn btn-sm btn-outline-danger rounded-circle p-2 hover-scale"
                          title="Delete Alumni"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}

                {/* INVITATION RECORDS */}
                {filteredInvitations.map((inv, idx) => (
                  <motion.tr
                    key={inv._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: (filteredAlumni.length + idx) * 0.03 }}
                    style={{ borderTop: "1px solid var(--border)", backgroundColor: "rgba(99, 102, 241, 0.04)" }}
                  >
                    <td className="ps-4 py-3">
                      <div className="d-flex align-items-center gap-3">
                        <img
                          src={getAvatarUrl(inv.name)}
                          className="rounded-circle shadow-sm object-fit-cover"
                          width={40}
                          height={40}
                          alt={inv.name}
                        />
                        <div>
                          <span className="fw-bold d-block text-white" style={{ fontSize: '0.9rem' }}>
                            {inv.name}
                          </span>
                          <span className="text-muted small">
                            {inv.email} &bull; <span className="text-indigo">Invite Record</span>
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="fw-medium text-white" style={{ fontSize: '0.85rem' }}>
                        {inv.role || inv.registrationData?.careerDomain || "Alumni"}
                      </div>
                      <div className="small text-muted d-flex align-items-center gap-1">
                        <Building size={12} className="text-primary" />
                        {inv.company || inv.registrationData?.currentCompany || "Company Unspecified"}
                      </div>
                    </td>
                    <td>
                      {inv.status === "REGISTRATION_SUBMITTED" ? (
                        <span className="badge bg-warning-subtle text-warning border border-warning border-opacity-25 px-2 py-1 fw-bold d-inline-flex align-items-center gap-1">
                          <CheckCircle size={12} /> Pending Approval
                        </span>
                      ) : (
                        <span className="badge bg-info-subtle text-info border border-info border-opacity-25 px-2 py-1 fw-bold d-inline-flex align-items-center gap-1">
                          <Clock size={12} /> {(inv.status || 'INVITED').replace(/_/g, ' ')}
                        </span>
                      )}
                    </td>
                    <td className="text-muted fw-semibold small">
                      {new Date(inv.createdAt).toLocaleDateString()}
                    </td>
                    <td className="pe-4 py-3 text-end">
                      <div className="d-flex gap-2 justify-content-end align-items-center flex-wrap">
                        {inv.status === "REGISTRATION_SUBMITTED" && (
                          <button
                            onClick={() => {
                              setSelectedInvitation(inv);
                              setShowReviewModal(true);
                            }}
                            className="btn btn-sm btn-primary rounded-pill fw-bold px-3 hover-scale"
                          >
                            Review & Approve
                          </button>
                        )}
                        {(inv.status === "INVITATION_SENT" || inv.status === "OPENED" || inv.status === "EXPIRED" || inv.status === "CANCELLED") && (
                          <button
                            onClick={() => handleResendInvite(inv._id)}
                            className="btn btn-sm btn-outline-info rounded-pill fw-bold px-3 hover-scale"
                            disabled={resendingId === inv._id}
                          >
                            <Mail size={13} className="me-1" /> {resendingId === inv._id ? "Sending..." : "Resend"}
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteTarget({ type: 'invitation', item: inv })}
                          className="btn btn-sm btn-outline-danger rounded-circle p-2 hover-scale"
                          title="Cancel & Delete Invitation"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}

                {(filteredAlumni.length === 0 && filteredInvitations.length === 0) && (
                  <tr>
                    <td colSpan="5" className="text-center p-5 text-muted fw-bold">
                      <Search size={36} className="mb-2 opacity-25" />
                      <br /> No alumni records match the specified filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* CREATE / INVITE MODAL */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ background: "rgba(0,0,0,0.75)", zIndex: 1050, backdropFilter: 'blur(5px)' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bento-card p-4 shadow-2xl w-100"
              style={{ maxWidth: 600, maxHeight: "90vh", overflowY: "auto", border: "1px solid var(--primary)" }}
            >
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-black mb-0 d-flex align-items-center gap-2 text-white">
                  <Plus size={22} className="text-primary" /> Invite New Alumni Mentor
                </h4>
                <button className="btn btn-sm btn-outline-secondary rounded-circle p-1" onClick={() => setShowCreateModal(false)}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleInviteAlumni}>
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold small text-muted text-uppercase">Full Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Priya Sharma"
                      value={newAlumni.name}
                      onChange={(e) => setNewAlumni((p) => ({ ...p, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold small text-muted text-uppercase">Email Address *</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="priya@google.com"
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
                      placeholder="Computer Science & Eng"
                      value={newAlumni.department}
                      onChange={(e) => setNewAlumni((p) => ({ ...p, department: e.target.value }))}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold small text-muted text-uppercase">Graduation Year</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. 2021"
                      value={newAlumni.graduationYear}
                      onChange={(e) => setNewAlumni((p) => ({ ...p, graduationYear: e.target.value }))}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold small text-muted text-uppercase">Company / Org</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Microsoft / Amazon"
                      value={newAlumni.company}
                      onChange={(e) => setNewAlumni((p) => ({ ...p, company: e.target.value }))}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold small text-muted text-uppercase">Job Title / Role</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Senior Software Engineer"
                      value={newAlumni.role}
                      onChange={(e) => setNewAlumni((p) => ({ ...p, role: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="alert alert-info small d-flex gap-2">
                  <Shield size={16} className="mt-1 flex-shrink-0" />
                  <div>
                    <strong>Secure Token Invitation:</strong> The mentor will receive an email containing a secure single-use registration URL to onboard and setup credentials.
                  </div>
                </div>

                <div className="d-flex gap-2 justify-content-end">
                  <button type="button" className="btn btn-outline-secondary rounded-pill px-4 fw-bold" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary rounded-pill px-4 fw-bold d-flex align-items-center gap-2"
                    style={{ background: "linear-gradient(135deg, var(--primary), #8b5cf6)", border: "none" }}
                    disabled={saving}
                  >
                    {saving ? <span className="spinner-border spinner-border-sm" /> : <Mail size={16} />}
                    {saving ? "Sending..." : "Dispatch Invitation"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT ALUMNI MODAL */}
      <AnimatePresence>
        {editTarget && (
          <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ background: "rgba(0,0,0,0.75)", zIndex: 1050, backdropFilter: 'blur(5px)' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bento-card p-4 shadow-2xl w-100"
              style={{ maxWidth: 620, maxHeight: "90vh", overflowY: "auto", border: "1px solid var(--info)" }}
            >
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-black mb-0 d-flex align-items-center gap-2 text-white">
                  <Edit3 size={20} className="text-info" /> Edit Alumni Profile
                </h4>
                <button className="btn btn-sm btn-outline-secondary rounded-circle p-1" onClick={() => setEditTarget(null)}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveEdit}>
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold small text-muted text-uppercase">Full Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editForm.name}
                      onChange={(e) => setEditForm(p => ({ ...p, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold small text-muted text-uppercase">Email *</label>
                    <input
                      type="email"
                      className="form-control"
                      value={editForm.email}
                      onChange={(e) => setEditForm(p => ({ ...p, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold small text-muted text-uppercase">Company / Organization</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Google"
                      value={editForm.company}
                      onChange={(e) => setEditForm(p => ({ ...p, company: e.target.value }))}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold small text-muted text-uppercase">Job Title / Designation</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Staff Software Engineer"
                      value={editForm.designation}
                      onChange={(e) => setEditForm(p => ({ ...p, designation: e.target.value }))}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold small text-muted text-uppercase">Department</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Information Technology"
                      value={editForm.department}
                      onChange={(e) => setEditForm(p => ({ ...p, department: e.target.value }))}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold small text-muted text-uppercase">Graduation Year</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. 2020"
                      value={editForm.graduationYear}
                      onChange={(e) => setEditForm(p => ({ ...p, graduationYear: e.target.value }))}
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-bold small text-muted text-uppercase">Account Status</label>
                    <select
                      className="form-select"
                      value={editForm.status}
                      onChange={(e) => setEditForm(p => ({ ...p, status: e.target.value }))}
                    >
                      <option value="Active">Active (Full Mentor Access)</option>
                      <option value="Pending">Pending (Awaiting Verification)</option>
                      <option value="Suspended">Suspended (Login Blocked)</option>
                    </select>
                  </div>
                </div>

                <div className="d-flex gap-2 justify-content-end mt-4">
                  <button type="button" className="btn btn-outline-secondary rounded-pill px-4 fw-bold" onClick={() => setEditTarget(null)}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-info rounded-pill px-4 fw-bold text-white d-flex align-items-center gap-2"
                    disabled={saving}
                  >
                    {saving ? <span className="spinner-border spinner-border-sm" /> : <CheckCircle size={16} />}
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* VIEW ALUMNI MODAL */}
      <AnimatePresence>
        {viewTarget && (
          <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ background: "rgba(0,0,0,0.75)", zIndex: 1050, backdropFilter: 'blur(5px)' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bento-card p-4 shadow-2xl w-100"
              style={{ maxWidth: 580, maxHeight: "90vh", overflowY: "auto" }}
            >
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center gap-3">
                  <img
                    src={getAvatarUrl(viewTarget.name, viewTarget.avatar)}
                    className="rounded-circle object-fit-cover"
                    width={50}
                    height={50}
                    alt={viewTarget.name}
                  />
                  <div>
                    <h5 className="fw-bold text-white mb-0">{viewTarget.name}</h5>
                    <span className="small text-muted">{viewTarget.email}</span>
                  </div>
                </div>
                <button className="btn btn-sm btn-outline-secondary rounded-circle p-1" onClick={() => setViewTarget(null)}>
                  <X size={18} />
                </button>
              </div>

              <div className="d-flex flex-column gap-3">
                <div className="p-3 rounded bg-dark-subtle border border-secondary border-opacity-25">
                  <h6 className="fw-bold small text-muted text-uppercase mb-2">Professional Profile</h6>
                  <div className="row g-2 small">
                    <div className="col-6"><span className="text-muted">Company:</span> <strong className="text-white d-block">{viewTarget.alumniProfile?.company || "N/A"}</strong></div>
                    <div className="col-6"><span className="text-muted">Designation:</span> <strong className="text-white d-block">{viewTarget.alumniProfile?.designation || viewTarget.alumniProfile?.role || "Mentor"}</strong></div>
                    <div className="col-6"><span className="text-muted">Department:</span> <strong className="text-white d-block">{viewTarget.alumniProfile?.department || "N/A"}</strong></div>
                    <div className="col-6"><span className="text-muted">Graduation:</span> <strong className="text-white d-block">{viewTarget.alumniProfile?.graduationYear || viewTarget.alumniProfile?.year || "N/A"}</strong></div>
                  </div>
                </div>

                <div className="p-3 rounded bg-dark-subtle border border-secondary border-opacity-25">
                  <h6 className="fw-bold small text-muted text-uppercase mb-2">System Telemetry</h6>
                  <div className="row g-2 small">
                    <div className="col-6"><span className="text-muted">Status:</span> <span className="badge bg-success-subtle text-success ms-1">{viewTarget.status}</span></div>
                    <div className="col-6"><span className="text-muted">Role:</span> <span className="badge bg-primary-subtle text-primary ms-1">{viewTarget.role}</span></div>
                    <div className="col-6"><span className="text-muted">Created:</span> <span className="text-white ms-1">{new Date(viewTarget.createdAt).toLocaleDateString()}</span></div>
                    <div className="col-6"><span className="text-muted">ID:</span> <code className="text-secondary ms-1 small">{viewTarget._id}</code></div>
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2 mt-4">
                <button
                  className="btn btn-sm btn-outline-info rounded-pill px-4 fw-bold"
                  onClick={() => {
                    const t = viewTarget;
                    setViewTarget(null);
                    handleOpenEdit(t);
                  }}
                >
                  <Edit3 size={14} className="me-1" /> Edit Profile
                </button>
                <button className="btn btn-sm btn-secondary rounded-pill px-4 fw-bold" onClick={() => setViewTarget(null)}>
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ background: "rgba(0,0,0,0.75)", zIndex: 1060, backdropFilter: 'blur(5px)' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bento-card p-4 shadow-2xl w-100 border border-danger"
              style={{ maxWidth: 460 }}
            >
              <div className="text-center mb-3">
                <div className="avatar rounded-circle bg-danger bg-opacity-25 text-danger d-inline-flex p-3 mb-3">
                  <AlertTriangle size={32} />
                </div>
                <h5 className="fw-bold text-white mb-1">
                  Confirm Permanent Deletion
                </h5>
                <p className="small text-muted mb-0">
                  Are you sure you want to delete {deleteTarget.type === 'alumni' ? 'alumni record' : 'invitation'} for{" "}
                  <strong className="text-white">{deleteTarget.item?.name}</strong>?
                </p>
              </div>

              <div className="alert alert-danger small py-2 mb-4">
                This action cannot be undone. All linked authentication sessions will be terminated immediately.
              </div>

              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary rounded-pill flex-grow-1 fw-bold"
                  onClick={() => setDeleteTarget(null)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger rounded-pill flex-grow-1 fw-bold d-flex align-items-center justify-content-center gap-2"
                  onClick={handleConfirmDelete}
                  disabled={saving}
                >
                  {saving ? <span className="spinner-border spinner-border-sm" /> : <Trash2 size={16} />}
                  {saving ? "Deleting..." : "Permanently Delete"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* REVIEW REGISTRATION MODAL */}
      <AnimatePresence>
        {showReviewModal && selectedInvitation && (
          <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ background: "rgba(0,0,0,0.75)", zIndex: 1050, backdropFilter: 'blur(5px)' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bento-card p-4 p-md-5 shadow-2xl w-100"
              style={{ maxWidth: 600, maxHeight: "90vh", overflowY: "auto", border: "1px solid var(--primary)" }}
            >
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h4 className="fw-bold text-white mb-1">Review Registration</h4>
                  <p className="text-muted small mb-0">Verify alumni credentials before granting ecosystem access.</p>
                </div>
                <button onClick={() => setShowReviewModal(false)} className="btn btn-outline-secondary rounded-circle p-2">
                  <X size={18} />
                </button>
              </div>

              <div className="d-flex flex-column gap-3 mb-4">
                <div className="p-3 bg-dark-subtle rounded-3 border border-secondary border-opacity-25">
                  <h6 className="fw-bold text-uppercase small text-muted mb-2">Basic Information</h6>
                  <div className="d-flex flex-column gap-2 small">
                    <div className="d-flex justify-content-between border-bottom border-secondary border-opacity-25 pb-1">
                      <span className="text-muted">Name</span>
                      <span className="fw-bold text-white">{selectedInvitation.name}</span>
                    </div>
                    <div className="d-flex justify-content-between border-bottom border-secondary border-opacity-25 pb-1">
                      <span className="text-muted">Email</span>
                      <span className="fw-bold text-white">{selectedInvitation.email}</span>
                    </div>
                    <div className="d-flex justify-content-between border-bottom border-secondary border-opacity-25 pb-1">
                      <span className="text-muted">Phone</span>
                      <span className="fw-bold text-white">{selectedInvitation.registrationData?.phone || "N/A"}</span>
                    </div>
                    <div className="d-flex justify-content-between pb-1">
                      <span className="text-muted">Reg Number</span>
                      <span className="fw-bold text-white">{selectedInvitation.registrationData?.registerNumber || "N/A"}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-dark-subtle rounded-3 border border-secondary border-opacity-25">
                  <h6 className="fw-bold text-uppercase small text-muted mb-2">Professional Summary</h6>
                  <div className="d-flex flex-column gap-2 small">
                    <div className="d-flex justify-content-between border-bottom border-secondary border-opacity-25 pb-1">
                      <span className="text-muted">Company</span>
                      <span className="fw-bold text-white">{selectedInvitation.registrationData?.currentCompany || "N/A"}</span>
                    </div>
                    <div className="d-flex justify-content-between border-bottom border-secondary border-opacity-25 pb-1">
                      <span className="text-muted">Job Title</span>
                      <span className="fw-bold text-white">{selectedInvitation.registrationData?.currentJobTitle || "N/A"}</span>
                    </div>
                    <div className="d-flex justify-content-between border-bottom border-secondary border-opacity-25 pb-1">
                      <span className="text-muted">LinkedIn</span>
                      <span className="fw-bold text-info">{selectedInvitation.registrationData?.linkedinUrl || "N/A"}</span>
                    </div>
                    <div className="d-flex justify-content-between pb-1">
                      <span className="text-muted">Skills</span>
                      <span className="fw-bold text-white text-end" style={{ maxWidth: '60%' }}>
                        {(selectedInvitation.registrationData?.skills || []).join(', ') || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="d-flex gap-3">
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
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AlumniManagement;
