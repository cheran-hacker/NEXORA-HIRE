import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { adminService } from "../../services/api.js";
import { getAvatarUrl } from "../../utils/avatar.js";
import {
  Search,
  ShieldCheck,
  Ban,
  CheckCircle,
  Clock,
  Plus,
  Trash2,
  X,
  UserPlus,
  Mail,
  Lock,
  Shield,
  Users,
  AlertTriangle,
  Edit3,
  RefreshCw,
  Download,
  CheckSquare,
  Square,
  GraduationCap,
  Briefcase,
  Eye,
  FileText,
  Calendar,
  Building,
  Key
} from "lucide-react";

const ROLES = ["Student", "Alumni", "Placement", "Admin"];
const STATUSES = ["All", "Active", "Pending", "Suspended"];
const ROLE_COLORS = {
  Student: "primary",
  Alumni: "info",
  Placement: "purple",
  Admin: "danger",
};

export default function UserManagement() {
  const urlParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(urlParams.get("search") || "");
  const [filterRole, setFilterRole] = useState(urlParams.get("role") || "All");
  const [filterStatus, setFilterStatus] = useState(urlParams.get("status") || "All");
  
  // Selection & Bulk
  const [selectedIds, setSelectedIds] = useState(new Set());
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewProfileTarget, setViewProfileTarget] = useState(null);
  
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // Forms
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "Student",
    status: "Active",
    regNo: "",
    department: "",
    course: "B.E / B.Tech",
    batchYear: new Date().getFullYear(),
    company: "",
    designation: ""
  });

  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Student",
    status: "Active",
    regNo: "",
    department: "",
    course: "",
    batchYear: "",
    graduationYear: "",
    company: "",
    designation: "",
    phone: ""
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await adminService.getUsers();
      setUsers(Array.isArray(data) ? data : (data.users || []));
      setSelectedIds(new Set());
    } catch (error) {
      showToast("Failed to fetch users", "danger");
    } finally {
      setLoading(false);
    }
  };

  // Start Editing
  const handleStartEdit = (user) => {
    setEditTarget(user);
    setEditForm({
      name: user.name || "",
      email: user.email || "",
      password: "", // Leave blank unless changing
      role: user.role || "Student",
      status: user.status || "Active",
      regNo: user.studentProfile?.regNo || user.regNo || "",
      department: user.studentProfile?.branch || user.department || "",
      course: user.studentProfile?.course || "B.E / B.Tech",
      batchYear: user.studentProfile?.batchYear || user.year || "",
      graduationYear: user.year || "",
      company: user.alumniProfile?.company || "",
      designation: user.alumniProfile?.designation || "",
      phone: user.phone || ""
    });
  };

  // Save Edit
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editForm.name || !editForm.email) {
      showToast("Name and Email are required", "danger");
      return;
    }
    setSaving(true);
    try {
      const payload = { ...editForm };
      if (!payload.password) delete payload.password; // Don't overwrite if empty
      
      const { data } = await adminService.updateUser(editTarget._id, payload);
      const updatedUser = data.user || data;
      
      setUsers((prev) => prev.map((u) => (u._id === editTarget._id ? { ...u, ...updatedUser } : u)));
      setEditTarget(null);
      showToast("User updated successfully in database!");
    } catch (err) {
      showToast(err?.response?.data?.message || err?.message || "Failed to update user", "danger");
    } finally {
      setSaving(false);
    }
  };

  // Create User
  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.password) {
      showToast("Name, Email, and Password are required", "danger");
      return;
    }
    setSaving(true);
    try {
      const { data } = await adminService.createUser(newUser);
      const created = data.user || data;
      setUsers((prev) => [created, ...prev]);
      setShowCreateModal(false);
      setNewUser({
        name: "",
        email: "",
        password: "",
        role: "Student",
        status: "Active",
        regNo: "",
        department: "",
        course: "B.E / B.Tech",
        batchYear: new Date().getFullYear(),
        company: "",
        designation: ""
      });
      showToast("User created successfully!");
    } catch (err) {
      showToast(err?.response?.data?.message || err?.message || "Failed to create user", "danger");
    } finally {
      setSaving(false);
    }
  };

  // Status Change
  const handleStatusChange = async (id, newStatus) => {
    try {
      await adminService.verifyUser(id, newStatus);
      setUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, status: newStatus } : u)),
      );
      showToast(`User status updated to ${newStatus}`);
    } catch (error) {
      showToast("Failed to update status", "danger");
    }
  };

  // Delete User
  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    try {
      await adminService.deleteUser(deleteTarget._id);
      setUsers((prev) => prev.filter((u) => u._id !== deleteTarget._id));
      setDeleteTarget(null);
      showToast("User deleted successfully");
    } catch (err) {
      showToast(err?.response?.data?.message || err?.message || "Failed to delete user", "danger");
    }
  };

  // Selection Logic
  const toggleSelectAll = () => {
    if (selectedIds.size === filteredUsers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredUsers.map((u) => u._id)));
    }
  };

  const toggleSelectOne = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  // Bulk Actions
  const handleBulkStatusChange = async (newStatus) => {
    if (selectedIds.size === 0) return;
    try {
      await Promise.all(
        Array.from(selectedIds).map((id) => adminService.verifyUser(id, newStatus))
      );
      setUsers((prev) =>
        prev.map((u) => (selectedIds.has(u._id) ? { ...u, status: newStatus } : u))
      );
      showToast(`Updated ${selectedIds.size} users to ${newStatus}`);
      setSelectedIds(new Set());
    } catch (err) {
      showToast("Bulk status change failed", "danger");
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const records = filteredUsers.map((u) => ({
      ID: u._id,
      Name: u.name,
      Email: u.email,
      Role: u.role,
      Status: u.status,
      Department: u.studentProfile?.branch || u.department || "N/A",
      RegNo: u.studentProfile?.regNo || u.regNo || "N/A",
      Company: u.alumniProfile?.company || "N/A",
      Created: new Date(u.createdAt).toISOString()
    }));

    if (records.length === 0) {
      showToast("No records to export", "warning");
      return;
    }

    const headers = Object.keys(records[0]).join(",");
    const rows = records.map((r) =>
      Object.values(r)
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `nexora_users_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Exported users successfully!");
  };

  // Filtering
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      (u.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.studentProfile?.regNo || u.regNo || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.studentProfile?.branch || u.department || "").toLowerCase().includes(search.toLowerCase());
    const matchesRole = filterRole === "All" || u.role === filterRole;
    const matchesStatus = filterStatus === "All" || u.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="container-fluid py-4 px-xl-5 position-relative">
      {/* Toast Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`alert alert-${toast.type} d-flex align-items-center gap-2 fw-bold shadow-lg`}
            style={{
              position: "fixed",
              top: 24,
              right: 24,
              zIndex: 9999,
              borderRadius: 16,
              minWidth: 280,
              border: "none",
            }}
          >
            {toast.type === "success" ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="d-flex flex-wrap align-items-start justify-content-between gap-3 mb-4">
        <div>
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="fw-black mb-1 d-flex align-items-center gap-3"
            style={{
              fontSize: "2.3rem",
              letterSpacing: "-0.02em",
              color: "var(--text)",
            }}
          >
            <Users size={34} className="text-primary" strokeWidth={2.5} /> User Management Center
          </motion.h2>
          <p className="text-muted fw-medium mb-0 ms-1">
            Create, search, inspect, edit profile fields, and manage platform permissions in real-time.
          </p>
        </div>

        <div className="d-flex gap-2 flex-wrap">
          <button
            onClick={fetchUsers}
            className="btn btn-outline-secondary rounded-pill px-3 fw-bold d-flex align-items-center gap-2 hover-scale"
          >
            <RefreshCw size={15} /> Refresh
          </button>
          <button
            onClick={handleExportCSV}
            className="btn btn-outline-primary rounded-pill px-3 fw-bold d-flex align-items-center gap-2 hover-scale"
          >
            <Download size={15} /> Export CSV
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary rounded-pill px-4 fw-bold d-flex align-items-center gap-2 shadow-sm hover-lift"
            style={{
              background: "linear-gradient(135deg, var(--primary), var(--purple))",
              border: "none",
            }}
          >
            <UserPlus size={18} /> Add User
          </button>
        </div>
      </div>

      {/* Filters & Search Bento */}
      <motion.div
        className="bento-card mb-4 p-4"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="row g-3 align-items-center">
          <div className="col-md-5">
            <div className="input-group">
              <span
                className="input-group-text border-end-0"
                style={{ border: "1px solid var(--border)", background: "transparent" }}
              >
                <Search size={18} className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search by name, email, roll no, department..."
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

          <div className="col-md-4 d-flex gap-1 flex-wrap">
            {["All", ...ROLES].map((role) => (
              <button
                key={role}
                onClick={() => setFilterRole(role)}
                className={`btn btn-sm rounded-pill fw-bold px-3 ${filterRole === role ? "btn-primary" : "btn-outline-secondary"}`}
                style={
                  filterRole === role
                    ? {
                        background: "linear-gradient(135deg, var(--primary), var(--purple))",
                        border: "none",
                      }
                    : {}
                }
              >
                {role}
              </button>
            ))}
          </div>

          <div className="col-md-3 d-flex gap-2 justify-content-md-end">
            <select
              className="form-select form-select-sm rounded-pill"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                background: "var(--surface-2)",
                color: "var(--text)",
                border: "1px solid var(--border)",
                maxWidth: "140px"
              }}
            >
              {STATUSES.map((st) => (
                <option key={st} value={st}>
                  Status: {st}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Bulk Action Bar (Visible when items selected) */}
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-3 pt-3 border-top d-flex align-items-center justify-content-between flex-wrap gap-2"
          >
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-primary rounded-pill px-3 py-2 fw-bold">
                {selectedIds.size} users selected
              </span>
              <button
                className="btn btn-sm btn-link text-muted"
                onClick={() => setSelectedIds(new Set())}
              >
                Deselect All
              </button>
            </div>
            <div className="d-flex gap-2">
              <button
                className="btn btn-sm btn-outline-success rounded-pill fw-bold"
                onClick={() => handleBulkStatusChange("Active")}
              >
                <CheckCircle size={14} className="me-1" /> Bulk Activate
              </button>
              <button
                className="btn btn-sm btn-outline-warning rounded-pill fw-bold"
                onClick={() => handleBulkStatusChange("Suspended")}
              >
                <Ban size={14} className="me-1" /> Bulk Suspend
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* KPI Stats Row */}
      <div className="row g-3 mb-4">
        {[
          { label: "Total Users", value: users.length, color: "primary", icon: Users },
          { label: "Students", value: users.filter((u) => u.role === "Student").length, color: "info", icon: GraduationCap },
          { label: "Active", value: users.filter((u) => u.status === "Active").length, color: "success", icon: CheckCircle },
          { label: "Pending", value: users.filter((u) => u.status === "Pending").length, color: "warning", icon: Clock },
        ].map((stat, i) => {
          const StatIcon = stat.icon;
          return (
            <div key={stat.label} className="col-6 col-md-3">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bento-card p-3 text-center hover-glow"
              >
                <StatIcon size={24} className={`text-${stat.color} mb-1`} strokeWidth={2.2} />
                <p className={`fw-black mb-0 fs-3 text-${stat.color}`}>{stat.value}</p>
                <small className="text-muted fw-semibold">{stat.label}</small>
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* Main Users Table */}
      <motion.div
        className="bento-card p-0 overflow-hidden"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {loading ? (
          <div className="p-5 text-center">
            <div className="spinner-border text-primary" role="status" />
            <p className="text-muted mt-3 fw-medium">Loading user records from MongoDB...</p>
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
                  <th className="ps-3 py-3" style={{ width: 40 }}>
                    <button
                      className="btn btn-sm p-0 border-0 text-muted"
                      onClick={toggleSelectAll}
                    >
                      {selectedIds.size === filteredUsers.length && filteredUsers.length > 0 ? (
                        <CheckSquare size={16} className="text-primary" />
                      ) : (
                        <Square size={16} />
                      )}
                    </button>
                  </th>
                  <th className="py-3">User Profile</th>
                  <th className="py-3">Role</th>
                  <th className="py-3">Academic / Pro Info</th>
                  <th className="py-3">Status</th>
                  <th className="py-3">Created</th>
                  <th className="pe-4 py-3 text-end">Operations</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, idx) => {
                  const isSelected = selectedIds.has(user._id);
                  const isStudent = user.role === "Student";
                  const isAlumni = user.role === "Alumni";

                  return (
                    <motion.tr
                      key={user._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: Math.min(idx * 0.02, 0.4) }}
                      style={{
                        borderTop: "1px solid var(--border)",
                        backgroundColor: isSelected ? "rgba(99, 102, 241, 0.06)" : "transparent",
                      }}
                    >
                      <td className="ps-3 py-3">
                        <button
                          className="btn btn-sm p-0 border-0 text-muted"
                          onClick={() => toggleSelectOne(user._id)}
                        >
                          {isSelected ? (
                            <CheckSquare size={16} className="text-primary" />
                          ) : (
                            <Square size={16} />
                          )}
                        </button>
                      </td>

                      <td className="py-3">
                        <div className="d-flex align-items-center gap-3">
                          <img
                            src={getAvatarUrl(user.name, user.avatarUrl)}
                            className="rounded-circle shadow-sm"
                            width={40}
                            height={40}
                            alt={user.name}
                            onError={(e) => {
                              e.currentTarget.src = getAvatarUrl(user.name);
                            }}
                          />
                          <div>
                            <span className="fw-bold d-block" style={{ color: "var(--text)" }}>
                              {user.name}
                            </span>
                            <span className="text-muted small">{user.email}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`badge rounded-pill px-3 py-2 fw-bold bg-${ROLE_COLORS[user.role] || "secondary"}-subtle text-${ROLE_COLORS[user.role] || "secondary"}`}
                        >
                          {user.role}
                        </span>
                      </td>

                      <td className="small">
                        {isStudent && (
                          <div>
                            <div className="fw-semibold text-foreground">
                              {user.studentProfile?.branch || user.department || "No Dept Set"}
                            </div>
                            <div className="text-muted">
                              Roll: {user.studentProfile?.regNo || user.regNo || "N/A"}
                            </div>
                          </div>
                        )}
                        {isAlumni && (
                          <div>
                            <div className="fw-semibold text-foreground">
                              {user.alumniProfile?.designation || "Alumni"}
                            </div>
                            <div className="text-muted">
                              {user.alumniProfile?.company || "Company Not Set"}
                            </div>
                          </div>
                        )}
                        {!isStudent && !isAlumni && (
                          <span className="text-muted">{user.department || "Administration"}</span>
                        )}
                      </td>

                      <td>
                        {user.status === "Active" && (
                          <span className="neon-badge bg-success-subtle text-success px-3 py-1 fw-bold d-inline-flex align-items-center gap-1">
                            <CheckCircle size={12} /> Active
                          </span>
                        )}
                        {user.status === "Pending" && (
                          <span className="neon-badge bg-warning-subtle text-warning px-3 py-1 fw-bold d-inline-flex align-items-center gap-1">
                            <Clock size={12} /> Pending
                          </span>
                        )}
                        {user.status === "Suspended" && (
                          <span className="neon-badge bg-danger-subtle text-danger px-3 py-1 fw-bold d-inline-flex align-items-center gap-1">
                            <Ban size={12} /> Suspended
                          </span>
                        )}
                      </td>

                      <td className="text-muted fw-semibold small">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>

                      <td className="pe-4 py-3">
                        <div className="d-flex gap-2 justify-content-end flex-wrap align-items-center">
                          {/* EDIT BUTTON (PROMINENT) */}
                          <button
                            onClick={() => handleStartEdit(user)}
                            className="btn btn-sm btn-outline-primary rounded-pill fw-bold px-3 hover-scale d-inline-flex align-items-center gap-1 shadow-sm"
                            title="Edit User Information"
                          >
                            <Edit3 size={13} /> Edit
                          </button>

                          {/* Quick Status Toggles */}
                          {user.status === "Pending" && (
                            <button
                              onClick={() => handleStatusChange(user._id, "Active")}
                              className="btn btn-sm btn-success rounded-pill fw-bold px-3 hover-scale"
                            >
                              <ShieldCheck size={13} className="me-1" /> Verify
                            </button>
                          )}
                          {user.status === "Active" && user.role !== "Admin" && (
                            <button
                              onClick={() => handleStatusChange(user._id, "Suspended")}
                              className="btn btn-sm btn-outline-warning rounded-pill fw-bold px-2 hover-scale"
                              title="Suspend User"
                            >
                              <Ban size={13} />
                            </button>
                          )}
                          {user.status === "Suspended" && (
                            <button
                              onClick={() => handleStatusChange(user._id, "Active")}
                              className="btn btn-sm btn-outline-success rounded-pill fw-bold px-2 hover-scale"
                              title="Reactivate User"
                            >
                              <CheckCircle size={13} />
                            </button>
                          )}

                          {/* View Profile */}
                          <button
                            onClick={() => setViewProfileTarget(user)}
                            className="btn btn-sm btn-outline-info rounded-pill fw-bold px-2 hover-scale"
                            title="View Full Details"
                          >
                            <Eye size={13} />
                          </button>

                          {/* Delete */}
                          {user.role !== "Admin" && (
                            <button
                              onClick={() => setDeleteTarget(user)}
                              className="btn btn-sm btn-outline-danger rounded-pill fw-bold px-2 hover-scale"
                              title="Delete User"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}

                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center p-5 text-muted fw-bold">
                      <Search size={40} className="mb-3 opacity-25" />
                      <br /> No users found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════
          EDIT USER MODAL
      ══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {editTarget && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditTarget(null)}
              style={{ position: "fixed", inset: 0, background: "#000", zIndex: 1040 }}
            />
            <motion.div
              className="d-flex align-items-center justify-content-center"
              style={{ position: "fixed", inset: 0, zIndex: 1050, padding: 16 }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div
                className="bento-card p-4 p-md-5 shadow-lg overflow-auto"
                style={{
                  maxWidth: 680,
                  width: "100%",
                  maxHeight: "90vh",
                  border: "1px solid var(--primary)",
                }}
              >
                <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
                  <h4 className="fw-black mb-0 d-flex align-items-center gap-2" style={{ color: "var(--text)" }}>
                    <Edit3 size={22} className="text-primary" /> Edit User: {editTarget.name}
                  </h4>
                  <button
                    className="btn btn-outline-secondary rounded-circle p-1"
                    onClick={() => setEditTarget(null)}
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleSaveEdit}>
                  <div className="row g-3">
                    {/* Basic Info */}
                    <div className="col-md-6">
                      <label className="form-label fw-bold small text-muted text-uppercase">Full Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editForm.name}
                        onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                        required
                        style={{ border: "1px solid var(--border)", background: "transparent", color: "var(--text)" }}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-bold small text-muted text-uppercase">Email Address</label>
                      <input
                        type="email"
                        className="form-control"
                        value={editForm.email}
                        onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))}
                        required
                        style={{ border: "1px solid var(--border)", background: "transparent", color: "var(--text)" }}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-bold small text-muted text-uppercase">Role</label>
                      <select
                        className="form-select"
                        value={editForm.role}
                        onChange={(e) => setEditForm((p) => ({ ...p, role: e.target.value }))}
                        style={{ border: "1px solid var(--border)", background: "var(--surface-2)", color: "var(--text)" }}
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-bold small text-muted text-uppercase">Account Status</label>
                      <select
                        className="form-select"
                        value={editForm.status}
                        onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value }))}
                        style={{ border: "1px solid var(--border)", background: "var(--surface-2)", color: "var(--text)" }}
                      >
                        <option value="Active">Active</option>
                        <option value="Pending">Pending</option>
                        <option value="Suspended">Suspended</option>
                      </select>
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-bold small text-muted text-uppercase d-flex align-items-center gap-1">
                        <Key size={14} /> Reset Password (Optional - leave blank to keep current)
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        placeholder="Enter new password (min 6 chars)"
                        value={editForm.password}
                        onChange={(e) => setEditForm((p) => ({ ...p, password: e.target.value }))}
                        style={{ border: "1px solid var(--border)", background: "transparent", color: "var(--text)" }}
                      />
                    </div>

                    {/* Role-Specific Fields */}
                    {editForm.role === "Student" && (
                      <>
                        <div className="col-12 mt-3 pt-2 border-top">
                          <h6 className="fw-bold text-primary mb-2 d-flex align-items-center gap-1">
                            <GraduationCap size={16} /> Student Academic Profile
                          </h6>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-bold small text-muted text-uppercase">Register / Roll Number</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="e.g. 7376221CS101"
                            value={editForm.regNo}
                            onChange={(e) => setEditForm((p) => ({ ...p, regNo: e.target.value }))}
                            style={{ border: "1px solid var(--border)", background: "transparent", color: "var(--text)" }}
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-bold small text-muted text-uppercase">Department / Branch</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="e.g. Computer Science and Engineering"
                            value={editForm.department}
                            onChange={(e) => setEditForm((p) => ({ ...p, department: e.target.value }))}
                            style={{ border: "1px solid var(--border)", background: "transparent", color: "var(--text)" }}
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-bold small text-muted text-uppercase">Course / Degree</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="e.g. B.E. / B.Tech"
                            value={editForm.course}
                            onChange={(e) => setEditForm((p) => ({ ...p, course: e.target.value }))}
                            style={{ border: "1px solid var(--border)", background: "transparent", color: "var(--text)" }}
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-bold small text-muted text-uppercase">Batch / Passing Year</label>
                          <input
                            type="number"
                            className="form-control"
                            placeholder="e.g. 2026"
                            value={editForm.batchYear}
                            onChange={(e) => setEditForm((p) => ({ ...p, batchYear: e.target.value }))}
                            style={{ border: "1px solid var(--border)", background: "transparent", color: "var(--text)" }}
                          />
                        </div>
                      </>
                    )}

                    {editForm.role === "Alumni" && (
                      <>
                        <div className="col-12 mt-3 pt-2 border-top">
                          <h6 className="fw-bold text-info mb-2 d-flex align-items-center gap-1">
                            <Briefcase size={16} /> Alumni Professional Profile
                          </h6>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-bold small text-muted text-uppercase">Current Company / Organization</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="e.g. Google, Microsoft, Zoho"
                            value={editForm.company}
                            onChange={(e) => setEditForm((p) => ({ ...p, company: e.target.value }))}
                            style={{ border: "1px solid var(--border)", background: "transparent", color: "var(--text)" }}
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-bold small text-muted text-uppercase">Designation / Role</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="e.g. Senior Software Engineer"
                            value={editForm.designation}
                            onChange={(e) => setEditForm((p) => ({ ...p, designation: e.target.value }))}
                            style={{ border: "1px solid var(--border)", background: "transparent", color: "var(--text)" }}
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-bold small text-muted text-uppercase">Graduation Year</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="e.g. 2021"
                            value={editForm.graduationYear}
                            onChange={(e) => setEditForm((p) => ({ ...p, graduationYear: e.target.value }))}
                            style={{ border: "1px solid var(--border)", background: "transparent", color: "var(--text)" }}
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-bold small text-muted text-uppercase">Department Graduated</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="e.g. Information Technology"
                            value={editForm.department}
                            onChange={(e) => setEditForm((p) => ({ ...p, department: e.target.value }))}
                            style={{ border: "1px solid var(--border)", background: "transparent", color: "var(--text)" }}
                          />
                        </div>
                      </>
                    )}
                  </div>

                  <div className="d-flex gap-3 mt-4 pt-3 border-top">
                    <button
                      type="button"
                      className="btn btn-outline-secondary rounded-pill flex-grow-1 fw-bold py-2"
                      onClick={() => setEditTarget(null)}
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
                      {saving ? <span className="spinner-border spinner-border-sm" /> : <Edit3 size={16} />}
                      {saving ? "Saving Changes..." : "Save User"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════
          CREATE USER MODAL
      ══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showCreateModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              style={{ position: "fixed", inset: 0, background: "#000", zIndex: 1040 }}
            />
            <motion.div
              className="d-flex align-items-center justify-content-center"
              style={{ position: "fixed", inset: 0, zIndex: 1050, padding: 16 }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div
                className="bento-card p-4 p-md-5 shadow-lg overflow-auto"
                style={{
                  maxWidth: 620,
                  width: "100%",
                  maxHeight: "90vh",
                  border: "1px solid var(--primary)",
                }}
              >
                <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
                  <h4 className="fw-black mb-0 d-flex align-items-center gap-2" style={{ color: "var(--text)" }}>
                    <UserPlus size={22} className="text-primary" /> Create New User
                  </h4>
                  <button
                    className="btn btn-outline-secondary rounded-circle p-1"
                    onClick={() => setShowCreateModal(false)}
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleCreateUser}>
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label fw-bold small text-muted text-uppercase">Role Type</label>
                      <div className="d-flex flex-wrap gap-2">
                        {ROLES.map((role) => (
                          <button
                            key={role}
                            type="button"
                            onClick={() => setNewUser((p) => ({ ...p, role }))}
                            className={`btn btn-sm rounded-pill fw-bold px-3 ${newUser.role === role ? "btn-primary" : "btn-outline-secondary"}`}
                            style={
                              newUser.role === role
                                ? {
                                    background: "linear-gradient(135deg, var(--primary), var(--purple))",
                                    border: "none",
                                  }
                                : {}
                            }
                          >
                            {role}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-bold small text-muted text-uppercase">Full Name</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Sneha Reddy"
                        value={newUser.name}
                        onChange={(e) => setNewUser((p) => ({ ...p, name: e.target.value }))}
                        required
                        style={{ border: "1px solid var(--border)", background: "transparent", color: "var(--text)" }}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-bold small text-muted text-uppercase">Email Address</label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder={newUser.role === "Student" ? "student@bitsathy.ac.in" : "user@example.com"}
                        value={newUser.email}
                        onChange={(e) => setNewUser((p) => ({ ...p, email: e.target.value }))}
                        required
                        style={{ border: "1px solid var(--border)", background: "transparent", color: "var(--text)" }}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-bold small text-muted text-uppercase">Password</label>
                      <input
                        type="password"
                        className="form-control"
                        placeholder="Min 6 characters"
                        value={newUser.password}
                        onChange={(e) => setNewUser((p) => ({ ...p, password: e.target.value }))}
                        required
                        style={{ border: "1px solid var(--border)", background: "transparent", color: "var(--text)" }}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-bold small text-muted text-uppercase">Initial Status</label>
                      <select
                        className="form-select"
                        value={newUser.status}
                        onChange={(e) => setNewUser((p) => ({ ...p, status: e.target.value }))}
                        style={{ border: "1px solid var(--border)", background: "var(--surface-2)", color: "var(--text)" }}
                      >
                        <option value="Active">Active</option>
                        <option value="Pending">Pending</option>
                      </select>
                    </div>

                    {/* Student specifics */}
                    {newUser.role === "Student" && (
                      <>
                        <div className="col-md-6">
                          <label className="form-label fw-bold small text-muted text-uppercase">Register Number</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="7376221CS102"
                            value={newUser.regNo}
                            onChange={(e) => setNewUser((p) => ({ ...p, regNo: e.target.value }))}
                            style={{ border: "1px solid var(--border)", background: "transparent", color: "var(--text)" }}
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-bold small text-muted text-uppercase">Department</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Computer Science"
                            value={newUser.department}
                            onChange={(e) => setNewUser((p) => ({ ...p, department: e.target.value }))}
                            style={{ border: "1px solid var(--border)", background: "transparent", color: "var(--text)" }}
                          />
                        </div>
                      </>
                    )}

                    {/* Alumni specifics */}
                    {newUser.role === "Alumni" && (
                      <>
                        <div className="col-md-6">
                          <label className="form-label fw-bold small text-muted text-uppercase">Company</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Microsoft"
                            value={newUser.company}
                            onChange={(e) => setNewUser((p) => ({ ...p, company: e.target.value }))}
                            style={{ border: "1px solid var(--border)", background: "transparent", color: "var(--text)" }}
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-bold small text-muted text-uppercase">Designation</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Software Engineer"
                            value={newUser.designation}
                            onChange={(e) => setNewUser((p) => ({ ...p, designation: e.target.value }))}
                            style={{ border: "1px solid var(--border)", background: "transparent", color: "var(--text)" }}
                          />
                        </div>
                      </>
                    )}
                  </div>

                  <div className="d-flex gap-3 mt-4 pt-3 border-top">
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
                      {saving ? <span className="spinner-border spinner-border-sm" /> : <UserPlus size={16} />}
                      {saving ? "Creating..." : "Create User"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════
          DELETE USER CONFIRMATION MODAL
      ══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {deleteTarget && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteTarget(null)}
              style={{ position: "fixed", inset: 0, background: "#000", zIndex: 1040 }}
            />
            <motion.div
              className="d-flex align-items-center justify-content-center"
              style={{ position: "fixed", inset: 0, zIndex: 1050, padding: 16 }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div
                className="bento-card p-4 p-md-5 shadow-lg text-center"
                style={{
                  maxWidth: 440,
                  width: "100%",
                  border: "1px solid var(--danger, #ef4444)",
                }}
              >
                <div
                  className="icon-circle bg-danger-subtle text-danger mb-4 mx-auto shadow-sm rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: 64, height: 64 }}
                >
                  <Trash2 size={28} strokeWidth={2.5} />
                </div>
                <h4 className="fw-black mb-2" style={{ color: "var(--text)" }}>
                  Permanently Delete User?
                </h4>
                <p className="text-muted fw-medium mb-4">
                  You are about to delete <strong>{deleteTarget.name}</strong> ({deleteTarget.email}).
                  All associated profile documents will be purged from MongoDB.
                </p>
                <div className="d-flex gap-3">
                  <button
                    className="btn btn-outline-secondary rounded-pill flex-grow-1 fw-bold py-2"
                    onClick={() => setDeleteTarget(null)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-danger rounded-pill flex-grow-1 fw-bold py-2 d-flex align-items-center justify-content-center gap-2"
                    onClick={handleDeleteUser}
                  >
                    <Trash2 size={16} /> Delete Permanently
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════
          VIEW PROFILE DETAILS MODAL
      ══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {viewProfileTarget && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewProfileTarget(null)}
              style={{ position: "fixed", inset: 0, background: "#000", zIndex: 1040 }}
            />
            <motion.div
              className="d-flex align-items-center justify-content-center"
              style={{ position: "fixed", inset: 0, zIndex: 1050, padding: 16 }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div
                className="bento-card p-4 p-md-5 shadow-lg overflow-auto"
                style={{
                  maxWidth: 650,
                  width: "100%",
                  maxHeight: "85vh",
                  border: "1px solid var(--border)",
                }}
              >
                <div className="d-flex justify-content-between align-items-start mb-4 pb-3 border-bottom">
                  <div className="d-flex align-items-center gap-3">
                    <img
                      src={getAvatarUrl(viewProfileTarget.name, viewProfileTarget.avatarUrl)}
                      className="rounded-circle shadow-sm"
                      width={52}
                      height={52}
                      alt={viewProfileTarget.name}
                    />
                    <div>
                      <h4 className="fw-black mb-1" style={{ color: "var(--text)" }}>
                        {viewProfileTarget.name}
                      </h4>
                      <div className="d-flex gap-2 align-items-center">
                        <span className="badge bg-primary-subtle text-primary rounded-pill">
                          {viewProfileTarget.role}
                        </span>
                        <span className="badge bg-success-subtle text-success rounded-pill">
                          {viewProfileTarget.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    className="btn btn-outline-secondary rounded-circle p-1"
                    onClick={() => setViewProfileTarget(null)}
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="row g-3">
                  <div className="col-sm-6">
                    <label className="text-muted small text-uppercase fw-bold">Email Address</label>
                    <div className="fw-semibold">{viewProfileTarget.email}</div>
                  </div>
                  <div className="col-sm-6">
                    <label className="text-muted small text-uppercase fw-bold">Member Since</label>
                    <div className="fw-semibold">{new Date(viewProfileTarget.createdAt).toLocaleDateString()}</div>
                  </div>

                  {viewProfileTarget.role === "Student" && (
                    <>
                      <div className="col-sm-6">
                        <label className="text-muted small text-uppercase fw-bold">Register Number</label>
                        <div className="fw-semibold">
                          {viewProfileTarget.studentProfile?.regNo || viewProfileTarget.regNo || "Not Specified"}
                        </div>
                      </div>
                      <div className="col-sm-6">
                        <label className="text-muted small text-uppercase fw-bold">Department / Branch</label>
                        <div className="fw-semibold">
                          {viewProfileTarget.studentProfile?.branch || viewProfileTarget.department || "Not Specified"}
                        </div>
                      </div>
                      <div className="col-sm-6">
                        <label className="text-muted small text-uppercase fw-bold">Batch Year</label>
                        <div className="fw-semibold">
                          {viewProfileTarget.studentProfile?.batchYear || viewProfileTarget.year || "Not Specified"}
                        </div>
                      </div>
                      <div className="col-sm-6">
                        <label className="text-muted small text-uppercase fw-bold">ATS Resume Score</label>
                        <div className="fw-bold text-primary">
                          {viewProfileTarget.studentProfile?.resumeScore || viewProfileTarget.studentProfile?.atsScore || 0}%
                        </div>
                      </div>
                      <div className="col-12">
                        <label className="text-muted small text-uppercase fw-bold">Skills</label>
                        <div className="d-flex flex-wrap gap-1 mt-1">
                          {(viewProfileTarget.studentProfile?.skills || []).length > 0 ? (
                            viewProfileTarget.studentProfile.skills.map((s, idx) => (
                              <span key={idx} className="badge bg-secondary-subtle text-secondary rounded-pill">
                                {s}
                              </span>
                            ))
                          ) : (
                            <span className="text-muted small">No skills added yet</span>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {viewProfileTarget.role === "Alumni" && (
                    <>
                      <div className="col-sm-6">
                        <label className="text-muted small text-uppercase fw-bold">Current Company</label>
                        <div className="fw-semibold">{viewProfileTarget.alumniProfile?.company || "Not Specified"}</div>
                      </div>
                      <div className="col-sm-6">
                        <label className="text-muted small text-uppercase fw-bold">Current Designation</label>
                        <div className="fw-semibold">{viewProfileTarget.alumniProfile?.designation || "Not Specified"}</div>
                      </div>
                      <div className="col-sm-6">
                        <label className="text-muted small text-uppercase fw-bold">Graduation Year</label>
                        <div className="fw-semibold">{viewProfileTarget.year || "Not Specified"}</div>
                      </div>
                      <div className="col-sm-6">
                        <label className="text-muted small text-uppercase fw-bold">College / Institution</label>
                        <div className="fw-semibold">{viewProfileTarget.alumniProfile?.college || "BITSathy"}</div>
                      </div>
                    </>
                  )}
                </div>

                <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                  <button
                    className="btn btn-outline-primary rounded-pill px-4 fw-bold"
                    onClick={() => {
                      const u = viewProfileTarget;
                      setViewProfileTarget(null);
                      handleStartEdit(u);
                    }}
                  >
                    <Edit3 size={14} className="me-1" /> Edit This User
                  </button>
                  <button
                    className="btn btn-secondary rounded-pill px-4"
                    onClick={() => setViewProfileTarget(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
