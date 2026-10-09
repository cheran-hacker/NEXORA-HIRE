import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { adminService } from "../../services/api.js";
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
} from "lucide-react";
const ROLES = ["Student", "Alumni", "Placement", "Admin"];
const ROLE_COLORS = {
  Student: "primary",
  Alumni: "info",
  Placement: "purple",
  Admin: "danger",
};
const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("All");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewProfileTarget, setViewProfileTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "Student",
  });
  useEffect(() => {
    fetchUsers();
  }, []);
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await adminService.getUsers();
      setUsers(data);
    } catch (error) {
      showToast("Failed to fetch users", "danger");
    } finally {
      setLoading(false);
    }
  };
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
  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.password) {
      showToast("All fields are required", "danger");
      return;
    }
    setSaving(true);
    try {
      const { data } = await adminService.createUser(newUser);
      setUsers((prev) => [data.user, ...prev]);
      setShowCreateModal(false);
      setNewUser({ name: "", email: "", password: "", role: "Student" });
      showToast("User created successfully");
    } catch (err) {
      showToast(err?.message || "Failed to create user", "danger");
    } finally {
      setSaving(false);
    }
  };
  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    try {
      await adminService.deleteUser(deleteTarget._id);
      setUsers((prev) => prev.filter((u) => u._id !== deleteTarget._id));
      setDeleteTarget(null);
      showToast("User deleted successfully");
    } catch (err) {
      showToast(err?.message || "Failed to delete user", "danger");
    }
  };
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      (u.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(search.toLowerCase());
    const matchesRole = filterRole === "All" || u.role === filterRole;
    return matchesSearch && matchesRole;
  });
  return (
    <div
      className="container-fluid py-4 px-xl-5"
      style={{ position: 'relative' }}
    >
      {" "}
      {/* Toast Notification */}{" "}
      <AnimatePresence>
        {" "}
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`alert alert-${toast.type} d-flex align-items-center gap-2 fw-bold shadow-lg`}
            style={{
              position: 'fixed',
              top: 24,
              right: 24,
              zIndex: 9999,
              borderRadius: 16,
              minWidth: 280,
              border: "none",
            }}
          >
            {" "}
            {toast.type === "success" ? (
              <CheckCircle size={18} />
            ) : (
              <AlertTriangle size={18} />
            )}{" "}
            {toast.msg}{" "}
          </motion.div>
        )}{" "}
      </AnimatePresence>{" "}
      {/* Header */}{" "}
      <div className="d-flex flex-wrap align-items-start justify-content-between gap-3 mb-5">
        {" "}
        <div>
          {" "}
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
            {" "}
            <Users size={36} className="text-primary" strokeWidth={2.5} /> User
            Management{" "}
          </motion.h2>{" "}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-muted fw-medium mb-0 ms-1"
          >
            {" "}
            Create, verify, suspend and delete platform accounts.{" "}
          </motion.p>{" "}
        </div>{" "}
        <div className="d-flex gap-2">
          {" "}
          <button
            onClick={fetchUsers}
            className="btn btn-outline-secondary rounded-pill px-4 fw-bold d-flex align-items-center gap-2 hover-scale"
          >
            {" "}
            <RefreshCw size={16} /> Refresh{" "}
          </button>{" "}
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary rounded-pill px-4 fw-bold d-flex align-items-center gap-2 shadow-sm hover-lift"
            style={{
              background:
                "linear-gradient(135deg, var(--primary), var(--purple))",
              border: "none",
            }}
          >
            {" "}
            <UserPlus size={18} /> Create User{" "}
          </button>{" "}
        </div>{" "}
      </div>{" "}
      {/* Filters */}{" "}
      <motion.div
        className="bento-card mb-4 p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {" "}
        <div className="row g-3 align-items-center">
          {" "}
          <div className="col-md-7">
            {" "}
            <div className="input-group">
              {" "}
              <span
                className="input-group-text border-end-0"
                style={{ border: "1px solid var(--border)" }}
              >
                {" "}
                <Search size={18} className="text-muted" />{" "}
              </span>{" "}
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  border: "1px solid var(--border)",
                  color: "var(--text)",
                  background: "transparent",
                }}
              />{" "}
            </div>{" "}
          </div>{" "}
          <div className="col-md-5 d-flex gap-2 justify-content-md-end flex-wrap">
            {" "}
            {["All", ...ROLES].map((role) => (
              <button
                key={role}
                onClick={() => setFilterRole(role)}
                className={`btn btn-sm rounded-pill fw-bold px-3 ${filterRole === role ? "btn-primary" : "btn-outline-secondary"}`}
                style={
                  filterRole === role
                    ? {
                        background:
                          "linear-gradient(135deg, var(--primary), var(--purple))",
                        border: "none",
                      }
                    : {}
                }
              >
                {" "}
                {role}{" "}
              </button>
            ))}{" "}
          </div>{" "}
        </div>{" "}
      </motion.div>{" "}
      {/* Stats Row */}{" "}
      <div className="row g-3 mb-4">
        {" "}
        {[
          {
            label: "Total Users",
            value: users.length,
            color: "primary",
            icon: Users,
          },
          {
            label: "Active",
            value: users.filter((u) => u.status === "Active").length,
            color: "success",
            icon: CheckCircle,
          },
          {
            label: "Pending",
            value: users.filter((u) => u.status === "Pending").length,
            color: "warning",
            icon: Clock,
          },
          {
            label: "Suspended",
            value: users.filter((u) => u.status === "Suspended").length,
            color: "danger",
            icon: Ban,
          },
        ].map((stat, i) => {
          const StatIcon = stat.icon;
          return (
            <div key={stat.label} className="col-6 col-md-3">
              {" "}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bento-card p-4 text-center hover-glow"
              >
                {" "}
                <StatIcon
                  size={28}
                  className={`text-${stat.color} mb-2`}
                  strokeWidth={2}
                />{" "}
                <p className={`fw-black mb-0 fs-3 text-${stat.color}`}>
                  {stat.value}
                </p>{" "}
                <small className="text-muted fw-semibold">
                  {stat.label}
                </small>{" "}
              </motion.div>{" "}
            </div>
          );
        })}{" "}
      </div>{" "}
      {/* Users Table */}{" "}
      <motion.div
        className="bento-card p-0 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {" "}
        {loading ? (
          <div className="p-5 text-center">
            {" "}
            <div className="spinner-border text-primary" role="status" />{" "}
            <p className="text-muted mt-3 fw-medium">Loading users...</p>{" "}
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
                  <th className="ps-4 py-3">User</th><th className="py-3">Role</th><th className="py-3">Status</th><th className="py-3">Joined</th><th className="pe-4 py-3 text-end">Actions</th></tr></thead>
              <tbody>
                {filteredUsers.map((user, idx) => (
                  <motion.tr
                    key={user._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.04 }}
                    style={{ borderTop: "1px solid var(--border)" }}
                  >
                    <td className="ps-4 py-3">
                      
                      <div className="d-flex align-items-center gap-3">
                        {" "}
                        <img
                          src={`https://ui-avatars.com/api/?name=${user.name}&size=40&background=6366f1&color=fff&bold=true`}
                          className="rounded-circle shadow-sm"
                          width={40}
                          height={40}
                          alt={user.name}
                        />{" "}
                        <div>
                          {" "}
                          <span
                            className="fw-bold d-block"
                            style={{ color: "var(--text)" }}
                          >
                            {user.name}
                          </span>{" "}
                          <span className="text-muted small">
                            {user.email}
                          </span>{" "}
                        </div>{" "}
                      </div>
                    </td><td>
                      
                      <span
                        className={`badge rounded-pill px-3 py-2 fw-bold bg-${ROLE_COLORS[user.role] || "secondary"}-subtle text-${ROLE_COLORS[user.role] || "secondary"}`}
                      >
                        {" "}
                        {user.role}{" "}
                      </span>
                    </td><td>
                      
                      {user.status === "Active" && (
                        <span className="neon-badge bg-success-subtle text-success px-3 py-1 fw-bold d-inline-flex align-items-center gap-1">
                          <CheckCircle size={12} /> Active
                        </span>
                      )}{" "}
                      {user.status === "Pending" && (
                        <span className="neon-badge bg-warning-subtle text-warning px-3 py-1 fw-bold d-inline-flex align-items-center gap-1">
                          <Clock size={12} /> Pending
                        </span>
                      )}{" "}
                      {user.status === "Suspended" && (
                        <span className="neon-badge bg-danger-subtle text-danger px-3 py-1 fw-bold d-inline-flex align-items-center gap-1">
                          <Ban size={12} /> Suspended
                        </span>
                      )}
                    </td><td className="text-muted fw-semibold small">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td><td className="pe-4 py-3">
                      
                      <div className="d-flex gap-2 justify-content-end flex-wrap">
                        {" "}
                        {user.status === "Pending" && (
                          <button
                            onClick={() =>
                              handleStatusChange(user._id, "Active")
                            }
                            className="btn btn-sm btn-success rounded-pill fw-bold px-3 hover-scale"
                          >
                            {" "}
                            <ShieldCheck size={14} className="me-1" />{" "}
                            Verify{" "}
                          </button>
                        )}{" "}
                        {user.status === "Active" && user.role !== "Admin" && (
                          <button
                            onClick={() =>
                              handleStatusChange(user._id, "Suspended")
                            }
                            className="btn btn-sm btn-outline-warning rounded-pill fw-bold px-3 hover-scale"
                          >
                            {" "}
                            <Ban size={14} className="me-1" /> Suspend{" "}
                          </button>
                        )}{" "}
                        {user.status === "Suspended" && (
                          <button
                            onClick={() =>
                              handleStatusChange(user._id, "Active")
                            }
                            className="btn btn-sm btn-outline-success rounded-pill fw-bold px-3 hover-scale"
                          >
                            {" "}
                            <CheckCircle size={14} className="me-1" />{" "}
                            Reactivate{" "}
                          </button>
                        )}{" "}
                        {(user.role === "Student" || user.role === "Alumni") && (
                          <button
                            onClick={() => setViewProfileTarget(user)}
                            className="btn btn-sm btn-outline-info rounded-pill fw-bold px-3 hover-scale"
                          >
                            {" "}
                            <Search size={14} className="me-1" /> View Profile{" "}
                          </button>
                        )}{" "}
                        {user.role !== "Admin" && (
                          <button
                            onClick={() => setDeleteTarget(user)}
                            className="btn btn-sm btn-outline-danger rounded-pill fw-bold px-3 hover-scale"
                          >
                            {" "}
                            <Trash2 size={14} />{" "}
                          </button>
                        )}{" "}
                      </div>
                    </td>
                  </motion.tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="text-center p-5 text-muted fw-bold"
                    >
                      
                      <Search size={40} className="mb-3 opacity-25" />
                      <br /> No users found matching your filters.
                    </td></tr>
                )}</tbody></table>
          </div>
        )}{" "}
      </motion.div>{" "}
      {/* ── Create User Modal ── */}{" "}
      <AnimatePresence>
        {" "}
        {showCreateModal && (
          <>
            {" "}
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
            />{" "}
            <motion.div
              className="d-flex align-items-center justify-content-center"
              style={{ position: 'fixed', inset: 0, zIndex: 1050 }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              {" "}
              <div
                className="bento-card p-5 shadow-lg"
                style={{
                  maxWidth: 520,
                  width: "100%",
                  border: "1px solid var(--primary)",
                }}
              >
                {" "}
                <div className="d-flex justify-content-between align-items-center mb-4">
                  {" "}
                  <h4
                    className="fw-black mb-0 d-flex align-items-center gap-2"
                    style={{ color: "var(--text)" }}
                  >
                    {" "}
                    <UserPlus size={24} className="text-primary" /> Create New
                    User{" "}
                  </h4>{" "}
                  <button
                    className="btn btn-outline-secondary rounded-circle p-1"
                    onClick={() => setShowCreateModal(false)}
                  >
                    {" "}
                    <X size={20} />{" "}
                  </button>{" "}
                </div>{" "}
                <form onSubmit={handleCreateUser}>
                  {" "}
                  <div className="mb-3">
                    {" "}
                    <label className="form-label fw-bold small text-muted text-uppercase">
                      Full Name
                    </label>{" "}
                    <input
                      type="text"
                      className="form-control "
                      placeholder="e.g. Rahul Sharma"
                      value={newUser.name}
                      onChange={(e) =>
                        setNewUser((p) => ({ ...p, name: e.target.value }))
                      }
                      style={{
                        border: "1px solid var(--border)",
                        color: "var(--text)",
                        background: "transparent",
                      }}
                      required
                    />{" "}
                  </div>{" "}
                  <div className="mb-3">
                    {" "}
                    <label className="form-label fw-bold small text-muted text-uppercase">
                      Email Address
                    </label>{" "}
                    <div className="input-group">
                      {" "}
                      <span
                        className="input-group-text "
                        style={{ border: "1px solid var(--border)" }}
                      >
                        <Mail size={16} />
                      </span>{" "}
                      <input
                        type="email"
                        className="form-control "
                        placeholder="user@bitsathy.ac.in"
                        value={newUser.email}
                        onChange={(e) =>
                          setNewUser((p) => ({ ...p, email: e.target.value }))
                        }
                        style={{
                          border: "1px solid var(--border)",
                          color: "var(--text)",
                          background: "transparent",
                        }}
                        required
                      />{" "}
                    </div>{" "}
                  </div>{" "}
                  <div className="mb-3">
                    {" "}
                    <label className="form-label fw-bold small text-muted text-uppercase">
                      Password
                    </label>{" "}
                    <div className="input-group">
                      {" "}
                      <span
                        className="input-group-text "
                        style={{ border: "1px solid var(--border)" }}
                      >
                        <Lock size={16} />
                      </span>{" "}
                      <input
                        type="password"
                        className="form-control "
                        placeholder="Minimum 8 characters"
                        value={newUser.password}
                        onChange={(e) =>
                          setNewUser((p) => ({
                            ...p,
                            password: e.target.value,
                          }))
                        }
                        style={{
                          border: "1px solid var(--border)",
                          color: "var(--text)",
                          background: "transparent",
                        }}
                        required
                      />{" "}
                    </div>{" "}
                  </div>{" "}
                  <div className="mb-4">
                    {" "}
                    <label className="form-label fw-bold small text-muted text-uppercase">
                      Role
                    </label>{" "}
                    <div className="d-flex flex-wrap gap-2">
                      {" "}
                      {ROLES.map((role) => (
                        <button
                          key={role}
                          type="button"
                          onClick={() => setNewUser((p) => ({ ...p, role }))}
                          className={`btn btn-sm rounded-pill fw-bold px-3 ${newUser.role === role ? "btn-primary" : "btn-outline-secondary"}`}
                          style={
                            newUser.role === role
                              ? {
                                  background:
                                    "linear-gradient(135deg, var(--primary), var(--purple))",
                                  border: "none",
                                }
                              : {}
                          }
                        >
                          {" "}
                          {role}{" "}
                        </button>
                      ))}{" "}
                    </div>{" "}
                  </div>{" "}
                  <div className="d-flex gap-3">
                    {" "}
                    <button
                      type="button"
                      className="btn btn-outline-secondary rounded-pill flex-grow-1 fw-bold py-2"
                      onClick={() => setShowCreateModal(false)}
                    >
                      {" "}
                      Cancel{" "}
                    </button>{" "}
                    <button
                      type="submit"
                      className="btn btn-primary rounded-pill flex-grow-1 fw-bold py-2 d-flex align-items-center justify-content-center gap-2"
                      style={{
                        background:
                          "linear-gradient(135deg, var(--primary), var(--purple))",
                        border: "none",
                      }}
                      disabled={saving}
                    >
                      {" "}
                      {saving ? (
                        <span className="spinner-border spinner-border-sm" />
                      ) : (
                        <UserPlus size={16} />
                      )}{" "}
                      {saving ? "Creating..." : "Create User"}{" "}
                    </button>{" "}
                  </div>{" "}
                </form>{" "}
              </div>{" "}
            </motion.div>{" "}
          </>
        )}{" "}
      </AnimatePresence>{" "}
      {/* ── Delete Confirmation Modal ── */}{" "}
      <AnimatePresence>
        {" "}
        {deleteTarget && (
          <>
            {" "}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteTarget(null)}
              style={{
                position: 'fixed',
                inset: 0,
                background: "#000",
                zIndex: 1040,
              }}
            />{" "}
            <motion.div
              className="d-flex align-items-center justify-content-center"
              style={{ position: 'fixed', inset: 0, zIndex: 1050 }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              {" "}
              <div
                className="bento-card p-5 shadow-lg text-center"
                style={{
                  maxWidth: 420,
                  width: "100%",
                  border: "1px solid var(--danger, #ef4444)",
                }}
              >
                {" "}
                <div
                  className="icon-circle bg-danger-subtle text-danger mb-4 mx-auto shadow-sm"
                  style={{ width: 72, height: 72 }}
                >
                  {" "}
                  <Trash2 size={32} strokeWidth={2.5} />{" "}
                </div>{" "}
                <h4 className="fw-black mb-2" style={{ color: "var(--text)" }}>
                  Delete User?
                </h4>{" "}
                <p className="text-muted fw-medium mb-4">
                  {" "}
                  You are about to permanently delete{" "}
                  <strong>{deleteTarget.name}</strong>. This action cannot be
                  undone.{" "}
                </p>{" "}
                <div className="d-flex gap-3">
                  {" "}
                  <button
                    className="btn btn-outline-secondary rounded-pill flex-grow-1 fw-bold py-2"
                    onClick={() => setDeleteTarget(null)}
                  >
                    {" "}
                    Cancel{" "}
                  </button>{" "}
                  <button
                    className="btn btn-danger rounded-pill flex-grow-1 fw-bold py-2 d-flex align-items-center justify-content-center gap-2"
                    onClick={handleDeleteUser}
                  >
                    {" "}
                    <Trash2 size={16} /> Delete{" "}
                  </button>{" "}
                </div>{" "}
              </div>{" "}
            </motion.div>{" "}
          </>
        )}{" "}
      </AnimatePresence>{" "}

      {/* ── View Profile Modal ── */}
      <AnimatePresence>
        {viewProfileTarget && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewProfileTarget(null)}
              style={{ position: 'fixed', inset: 0, background: "#000", zIndex: 1040 }}
            />
            <motion.div
              className="d-flex align-items-center justify-content-center"
              style={{ position: 'fixed', inset: 0, zIndex: 1050, padding: '1rem' }}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
            >
              <div className="bento-card p-0 overflow-hidden shadow-lg w-100" style={{ maxWidth: 600, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                <div className="p-4 border-bottom bg-light d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center gap-3">
                    <img
                      src={viewProfileTarget.avatar || `https://ui-avatars.com/api/?name=${viewProfileTarget.name}&background=random`}
                      alt=""
                      className="rounded-circle shadow-sm"
                      style={{ width: 48, height: 48, objectFit: 'cover' }}
                    />
                    <div>
                      <h4 className="fw-black mb-0 text-foreground">{viewProfileTarget.name}</h4>
                      <span className={`badge bg-${ROLE_COLORS[viewProfileTarget.role]}-subtle text-${ROLE_COLORS[viewProfileTarget.role]} rounded-pill mt-1`}>
                        {viewProfileTarget.role}
                      </span>
                    </div>
                  </div>
                  <button className="btn btn-light rounded-circle p-2 text-muted hover-scale" onClick={() => setViewProfileTarget(null)}>
                    <X size={20} />
                  </button>
                </div>
                
                <div className="p-4 overflow-auto" style={{ flex: 1 }}>
                  <div className="mb-4">
                    <h6 className="fw-bold text-muted text-uppercase mb-3" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>Basic Information</h6>
                    <div className="row g-3">
                      <div className="col-sm-6">
                        <div className="text-muted small">Email</div>
                        <div className="fw-bold text-foreground">{viewProfileTarget.email}</div>
                      </div>
                      <div className="col-sm-6">
                        <div className="text-muted small">Status</div>
                        <div className="fw-bold text-foreground">{viewProfileTarget.status}</div>
                      </div>
                    </div>
                  </div>

                  {viewProfileTarget.role === "Student" && viewProfileTarget.studentProfile && (
                    <div className="mb-4">
                      <h6 className="fw-bold text-muted text-uppercase mb-3" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>Student Profile</h6>
                      <div className="row g-3 bg-light p-3 rounded-4">
                        <div className="col-sm-4">
                          <div className="text-muted small">Register Number</div>
                          <div className="fw-bold text-foreground">{viewProfileTarget.studentProfile.registerNumber || 'N/A'}</div>
                        </div>
                        <div className="col-sm-4">
                          <div className="text-muted small">College</div>
                          <div className="fw-bold text-foreground">{viewProfileTarget.studentProfile.college || 'N/A'}</div>
                        </div>
                        <div className="col-sm-4">
                          <div className="text-muted small">Target Role</div>
                          <div className="fw-bold text-primary">{viewProfileTarget.studentProfile.preferredRoles || 'N/A'}</div>
                        </div>
                        <div className="col-12">
                          <div className="text-muted small mb-2">Skills</div>
                          <div className="d-flex flex-wrap gap-2">
                            {viewProfileTarget.studentProfile.skills?.length > 0 ? (
                              viewProfileTarget.studentProfile.skills.map((s, i) => (
                                <span key={i} className="badge bg-card text-foreground border px-2 py-1">{s}</span>
                              ))
                            ) : (
                              <span className="text-muted small">No skills added</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {viewProfileTarget.role === "Alumni" && viewProfileTarget.alumniProfile && (
                    <div className="mb-4">
                      <h6 className="fw-bold text-muted text-uppercase mb-3" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>Alumni Profile</h6>
                      <div className="row g-3 bg-light p-3 rounded-4">
                        <div className="col-sm-6">
                          <div className="text-muted small">Company</div>
                          <div className="fw-bold text-foreground">{viewProfileTarget.alumniProfile.company || 'N/A'}</div>
                        </div>
                        <div className="col-sm-6">
                          <div className="text-muted small">Designation</div>
                          <div className="fw-bold text-foreground">{viewProfileTarget.alumniProfile.designation || 'N/A'}</div>
                        </div>
                        <div className="col-12">
                          <div className="text-muted small mb-2">Expertise</div>
                          <div className="d-flex flex-wrap gap-2">
                            {viewProfileTarget.alumniProfile.expertise?.length > 0 ? (
                              viewProfileTarget.alumniProfile.expertise.map((s, i) => (
                                <span key={i} className="badge bg-card text-foreground border px-2 py-1">{s}</span>
                              ))
                            ) : (
                              <span className="text-muted small">No expertise added</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
export default UserManagement;
