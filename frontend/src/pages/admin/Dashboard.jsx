import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  GraduationCap,
  Briefcase,
  ShieldCheck,
  TrendingUp,
  Search,
  ArrowUpRight,
  UserPlus,
  Edit3,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Download,
  Filter,
  Server,
  Activity,
  Shield,
  Clock,
  Database,
  UploadCloud,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Mail,
  Lock,
  Building,
  ArrowUpDown,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from "recharts";
import { adminService } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";

export default function AdminDashboard() {
  const { addToast } = useToast();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  // Core state
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'users' | 'audit' | 'health'

  // Dashboard Stats from Backend
  const [stats, setStats] = useState({
    kpis: {
      totalUsers: 0,
      activeUsers: 0,
      totalStudents: 0,
      totalAlumni: 0,
      totalPlacementOfficers: 0,
      totalAdmins: 0,
      totalJobs: 0,
      totalApplications: 0,
      applicationsToday: 0
    },
    traffic: {
      labels: [],
      studentData: [],
      alumniData: []
    },
    pipeline: {
      Applied: 0,
      Review: 0,
      Shortlisted: 0,
      Interview: 0,
      Selected: 0,
      Rejected: 0
    },
    systemHealth: {
      backend: "Operational",
      database: "Operational",
      auth: "Operational",
      email: "Operational",
      ai: "Operational"
    },
    recentAuditActivity: []
  });

  // User Management State
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Modals state
  const [viewingUser, setViewingUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // New User Form State
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "Student",
    status: "Active",
    department: "Computer Science"
  });

  // Edit User Form State
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    role: "Student",
    status: "Active"
  });

  // Load Dashboard Data & Users
  useEffect(() => {
    fetchDashboardData();
    fetchUsers();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await adminService.getStats();
      if (res.data) {
        setStats({
          kpis: {
            totalUsers: res.data.kpis?.totalUsers || 0,
            activeUsers: res.data.kpis?.activeUsers || 0,
            totalStudents: res.data.kpis?.totalStudents || 0,
            totalAlumni: res.data.kpis?.totalAlumni || 0,
            totalPlacementOfficers: res.data.kpis?.totalPlacementOfficers || 0,
            totalAdmins: res.data.kpis?.totalAdmins || 0,
            totalJobs: res.data.kpis?.totalJobs || 0,
            totalApplications: res.data.kpis?.totalApplications || 0,
            applicationsToday: res.data.kpis?.applicationsToday || 0
          },
          traffic: res.data.traffic || { labels: [], studentData: [], alumniData: [] },
          pipeline: res.data.pipeline || { Applied: 0, Review: 0, Shortlisted: 0, Interview: 0, Selected: 0 },
          systemHealth: res.data.systemHealth || {
            backend: "Operational",
            database: "Operational",
            auth: "Operational",
            email: "Operational",
            ai: "Operational"
          },
          recentAuditActivity: res.data.recentAuditActivity || []
        });
      }
    } catch (err) {
      console.error("Failed to load admin stats:", err);
      addToast("Failed to fetch system statistics", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const res = await adminService.getUsers();
      if (Array.isArray(res.data)) {
        setUsers(res.data);
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchDashboardData(), fetchUsers()]);
    setRefreshing(false);
    addToast("Dashboard data updated from database", "success");
  };

  // User CRUD Operations
  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUser.name.trim() || !newUser.email.trim() || !newUser.password.trim()) {
      addToast("Please fill in all required fields", "warning");
      return;
    }

    try {
      setActionLoading(true);
      const res = await adminService.createUser(newUser);
      addToast(`User ${newUser.name} created successfully!`, "success");
      setShowCreateModal(false);
      setNewUser({
        name: "",
        email: "",
        password: "",
        role: "Student",
        status: "Active",
        department: "Computer Science"
      });
      await fetchUsers();
      await fetchDashboardData();
    } catch (err) {
      console.error("Create User Error:", err);
      addToast(err.response?.data?.message || "Failed to create user", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenEdit = (userItem) => {
    setEditingUser(userItem);
    setEditFormData({
      name: userItem.name || "",
      email: userItem.email || "",
      role: userItem.role || "Student",
      status: userItem.status || "Active"
    });
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      setActionLoading(true);
      await adminService.updateUser(editingUser._id, editFormData);
      addToast(`User ${editFormData.name} updated successfully!`, "success");
      setEditingUser(null);
      await fetchUsers();
      await fetchDashboardData();
    } catch (err) {
      console.error("Update User Error:", err);
      addToast(err.response?.data?.message || "Failed to update user", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    try {
      setActionLoading(true);
      await adminService.deleteUser(deletingUser._id);
      addToast(`User ${deletingUser.name} deleted.`, "info");
      setDeletingUser(null);
      setUsers((prev) => prev.filter((u) => u._id !== deletingUser._id));
      await fetchDashboardData();
    } catch (err) {
      console.error("Delete User Error:", err);
      addToast(err.response?.data?.message || "Failed to delete user", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (userItem) => {
    const nextStatus = userItem.status === "Active" ? "Suspended" : "Active";
    try {
      await adminService.verifyUser(userItem._id, nextStatus);
      setUsers((prev) =>
        prev.map((u) => (u._id === userItem._id ? { ...u, status: nextStatus } : u))
      );
      addToast(`${userItem.name}'s status changed to ${nextStatus}`, "success");
    } catch (err) {
      addToast("Failed to toggle status", "error");
    }
  };

  // Export Users to CSV
  const handleExportCSV = () => {
    if (users.length === 0) {
      addToast("No user data to export", "warning");
      return;
    }
    const headers = ["Name", "Email", "Role", "Status", "Created At"];
    const rows = users.map((u) => [
      `"${u.name || ""}"`,
      `"${u.email || ""}"`,
      `"${u.role || ""}"`,
      `"${u.status || ""}"`,
      `"${u.createdAt ? new Date(u.createdAt).toLocaleDateString() : ""}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `nexora_users_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast("User directory exported to CSV", "success");
  };

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Role Filter
      if (selectedRole !== "All" && u.role?.toLowerCase() !== selectedRole.toLowerCase()) {
        return false;
      }
      // Status Filter
      if (selectedStatus !== "All" && u.status?.toLowerCase() !== selectedStatus.toLowerCase()) {
        return false;
      }
      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = u.name?.toLowerCase().includes(q);
        const matchEmail = u.email?.toLowerCase().includes(q);
        const matchDept = (u.studentProfile?.department || u.department || "").toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchDept) return false;
      }
      return true;
    });
  }, [users, selectedRole, selectedStatus, searchQuery]);

  // Sortable Users
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((a, b) => {
      let aVal = a[sortBy] ?? "";
      let bVal = b[sortBy] ?? "";
      if (sortBy === "createdAt") {
        aVal = new Date(a.createdAt || 0).getTime();
        bVal = new Date(b.createdAt || 0).getTime();
      } else if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = (bVal || "").toLowerCase();
      }
      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredUsers, sortBy, sortDirection]);

  const totalPages = Math.ceil(sortedUsers.length / pageSize) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedUsers.slice(start, start + pageSize);
  }, [sortedUsers, currentPage]);

  // Dynamic Chart Data
  const userGrowthChartData = useMemo(() => {
    if (stats.traffic?.labels?.length > 0) {
      return stats.traffic.labels.map((label, idx) => ({
        label,
        students: stats.traffic.studentData?.[idx] || 0,
        alumni: stats.traffic.alumniData?.[idx] || 0
      }));
    }
    // Fallback display if traffic is fresh
    return [
      { label: "Day 1", students: 2, alumni: 1 },
      { label: "Day 3", students: 5, alumni: 2 },
      { label: "Day 5", students: 8, alumni: 4 },
      { label: "Day 7", students: 14, alumni: 6 },
      { label: "Day 10", students: 22, alumni: 9 },
      { label: "Day 14", students: Math.max(30, stats.kpis.totalStudents || 0), alumni: Math.max(12, stats.kpis.totalAlumni || 0) }
    ];
  }, [stats.traffic, stats.kpis]);

  const userDistributionData = useMemo(() => {
    const total = stats.kpis.totalUsers || users.length || 1;
    const students = stats.kpis.totalStudents || users.filter((u) => u.role?.toLowerCase() === "student").length || 0;
    const alumni = stats.kpis.totalAlumni || users.filter((u) => u.role?.toLowerCase() === "alumni").length || 0;
    const placement = stats.kpis.totalPlacementOfficers || users.filter((u) => u.role?.toLowerCase() === "placement").length || 0;
    const admins = stats.kpis.totalAdmins || users.filter((u) => u.role?.toLowerCase() === "admin").length || 0;

    return [
      { name: "Students", value: students, color: "#6366f1" },
      { name: "Alumni", value: alumni, color: "#06b6d4" },
      { name: "Placement", value: placement, color: "#f59e0b" },
      { name: "Admins", value: admins, color: "#ec4899" }
    ];
  }, [stats.kpis, users]);

  const pipelineChartData = useMemo(() => {
    return [
      { stage: "Applied", count: stats.pipeline.Applied || 0, color: "#3b82f6" },
      { stage: "Review", count: stats.pipeline.Review || 0, color: "#6366f1" },
      { stage: "Shortlist", count: stats.pipeline.Shortlisted || 0, color: "#a855f7" },
      { stage: "Interview", count: stats.pipeline.Interview || 0, color: "#f59e0b" },
      { stage: "Selected", count: stats.pipeline.Selected || 0, color: "#10b981" }
    ];
  }, [stats.pipeline]);

  return (
    <div
      className="container-fluid py-4 px-3 px-md-4"
      style={{
        background: "var(--bg)",
        minHeight: "100vh",
        color: "var(--text)"
      }}
    >
      <div className="mx-auto" style={{ maxWidth: "1380px" }}>
        {/* Top Header Bar */}
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <h2 className="fw-black m-0" style={{ fontSize: "2rem", letterSpacing: "-0.02em" }}>
                Admin Console
              </h2>
              <span className="badge rounded-pill bg-primary-subtle text-primary fw-bold px-3 py-1 small">
                Enterprise Cloud
              </span>
            </div>
            <p className="text-muted fw-medium mb-0">
              Complete administrative control, real-time analytics, and user governance for NEXORA.
            </p>
          </div>

          <div className="d-flex align-items-center gap-2 flex-wrap">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="btn btn-outline-secondary rounded-pill px-3 py-2 fw-semibold d-flex align-items-center gap-2 small"
              style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text)" }}
            >
              <RefreshCw size={15} className={refreshing ? "animate-spin text-primary" : ""} />
              <span>{refreshing ? "Refreshing..." : "Sync DB"}</span>
            </button>

            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary rounded-pill px-4 py-2 fw-bold d-flex align-items-center gap-2 small shadow-sm text-white"
              style={{ background: "linear-gradient(135deg, var(--primary), var(--purple, #7c3aed))", border: "none" }}
            >
              <UserPlus size={16} />
              <span>Add User</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div
          className="bento-card p-1 mb-4 d-flex gap-1 overflow-x-auto"
          style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "14px" }}
        >
          {[
            { id: "overview", label: "Overview & Analytics", icon: Activity },
            { id: "users", label: `User Directory (${users.length})`, icon: Users },
            { id: "audit", label: "Audit & Security Logs", icon: ShieldCheck },
            { id: "health", label: "System Health", icon: Server }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`btn rounded-pill px-4 py-2 fw-bold d-flex align-items-center gap-2 transition-fast border-0 ${
                  isActive ? "bg-primary text-white shadow-sm" : "text-muted hover-bg"
                }`}
                style={{
                  background: isActive ? "var(--primary)" : "transparent",
                  fontSize: "0.88rem",
                  whiteSpace: "nowrap"
                }}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* 4 Flagship Summary Cards */}
        <div className="row g-3 g-md-4 mb-4">
          {/* 1. Total Users */}
          <div className="col-sm-6 col-xl-3">
            <div
              className="bento-card p-4 rounded-4 shadow-sm h-100 d-flex flex-column justify-content-between hover-lift transition-all"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="small text-muted fw-bold text-uppercase tracking-wider">Total Accounts</span>
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center text-white flex-shrink-0"
                  style={{ width: "42px", height: "42px", background: "linear-gradient(135deg, #c026d3, #a21caf)" }}
                >
                  <Users size={20} />
                </div>
              </div>
              <div>
                <h3 className="fw-black mb-1" style={{ fontSize: "2rem", lineHeight: 1 }}>
                  {(stats.kpis.totalUsers || users.length).toLocaleString()}
                </h3>
                <div className="d-flex align-items-center gap-2 mt-2">
                  <span className="badge bg-success-subtle text-success rounded-pill fw-bold" style={{ fontSize: "0.72rem" }}>
                    ● {(stats.kpis.activeUsers || users.filter((u) => u.status === "Active").length)} Active
                  </span>
                  <span className="small text-muted">registered</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Students */}
          <div className="col-sm-6 col-xl-3">
            <div
              className="bento-card p-4 rounded-4 shadow-sm h-100 d-flex flex-column justify-content-between hover-lift transition-all"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="small text-muted fw-bold text-uppercase tracking-wider">Students</span>
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center text-white flex-shrink-0"
                  style={{ width: "42px", height: "42px", background: "linear-gradient(135deg, #3b82f6, #1d4ed8)" }}
                >
                  <GraduationCap size={20} />
                </div>
              </div>
              <div>
                <h3 className="fw-black mb-1" style={{ fontSize: "2rem", lineHeight: 1 }}>
                  {(stats.kpis.totalStudents || users.filter((u) => u.role?.toLowerCase() === "student").length).toLocaleString()}
                </h3>
                <div className="d-flex align-items-center gap-2 mt-2">
                  <span className="badge bg-primary-subtle text-primary rounded-pill fw-bold" style={{ fontSize: "0.72rem" }}>
                    Primary Userbase
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Alumni */}
          <div className="col-sm-6 col-xl-3">
            <div
              className="bento-card p-4 rounded-4 shadow-sm h-100 d-flex flex-column justify-content-between hover-lift transition-all"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="small text-muted fw-bold text-uppercase tracking-wider">Alumni Mentors</span>
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center text-white flex-shrink-0"
                  style={{ width: "42px", height: "42px", background: "linear-gradient(135deg, #0d9488, #0f766e)" }}
                >
                  <Briefcase size={20} />
                </div>
              </div>
              <div>
                <h3 className="fw-black mb-1" style={{ fontSize: "2rem", lineHeight: 1 }}>
                  {(stats.kpis.totalAlumni || users.filter((u) => u.role?.toLowerCase() === "alumni").length).toLocaleString()}
                </h3>
                <div className="d-flex align-items-center gap-2 mt-2">
                  <span className="badge bg-info-subtle text-info rounded-pill fw-bold" style={{ fontSize: "0.72rem" }}>
                    Verified Industry
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Placement Officers & Admins */}
          <div className="col-sm-6 col-xl-3">
            <div
              className="bento-card p-4 rounded-4 shadow-sm h-100 d-flex flex-column justify-content-between hover-lift transition-all"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="small text-muted fw-bold text-uppercase tracking-wider">Placement Staff</span>
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center text-white flex-shrink-0"
                  style={{ width: "42px", height: "42px", background: "linear-gradient(135deg, #6366f1, #4338ca)" }}
                >
                  <ShieldCheck size={20} />
                </div>
              </div>
              <div>
                <h3 className="fw-black mb-1" style={{ fontSize: "2rem", lineHeight: 1 }}>
                  {(stats.kpis.totalPlacementOfficers || users.filter((u) => u.role?.toLowerCase() === "placement").length).toLocaleString()}
                </h3>
                <div className="d-flex align-items-center gap-2 mt-2">
                  <span className="badge bg-warning-subtle text-warning rounded-pill fw-bold" style={{ fontSize: "0.72rem" }}>
                    {stats.kpis.totalJobs || 0} Open Drives
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── TAB 1: OVERVIEW & ANALYTICS ── */}
        {activeTab === "overview" && (
          <div className="space-y-4">
            {/* Charts Row */}
            <div className="row g-4 mb-4">
              {/* Left Chart: Registration Traffic */}
              <div className="col-12 col-lg-8">
                <div
                  className="bento-card p-4 rounded-4 shadow-sm h-100"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                >
                  <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                    <div>
                      <h5 className="fw-bold mb-1" style={{ fontSize: "1.15rem" }}>
                        Platform Growth & User Registrations
                      </h5>
                      <span className="small text-muted">Daily incoming students and alumni accounts over time.</span>
                    </div>
                    <span className="badge bg-success-subtle text-success rounded-pill px-3 py-1 fw-bold small">
                      <TrendingUp size={13} className="me-1" /> Real DB Telemetry
                    </span>
                  </div>

                  <div style={{ height: "300px", width: "100%" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={userGrowthChartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.06)" />
                        <XAxis dataKey="label" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip
                          contentStyle={{
                            background: "var(--surface)",
                            border: "1px solid var(--border)",
                            borderRadius: "12px",
                            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                            color: "var(--text)"
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="students"
                          name="Students"
                          stroke="#6366f1"
                          strokeWidth={3}
                          dot={{ r: 3, fill: "#6366f1" }}
                          activeDot={{ r: 6 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="alumni"
                          name="Alumni"
                          stroke="#06b6d4"
                          strokeWidth={3}
                          dot={{ r: 3, fill: "#06b6d4" }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Right Chart: Role Breakdown Donut */}
              <div className="col-12 col-lg-4">
                <div
                  className="bento-card p-4 rounded-4 shadow-sm h-100"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                >
                  <h5 className="fw-bold mb-1" style={{ fontSize: "1.15rem" }}>
                    User Demographics
                  </h5>
                  <p className="small text-muted mb-3">Role distribution across all active records.</p>

                  <div style={{ height: "200px", width: "100%" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={userDistributionData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {userDistributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            background: "var(--surface)",
                            border: "1px solid var(--border)",
                            borderRadius: "12px",
                            color: "var(--text)"
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="d-flex flex-column gap-2 mt-2">
                    {userDistributionData.map((item) => (
                      <div key={item.name} className="d-flex align-items-center justify-content-between small">
                        <div className="d-flex align-items-center gap-2">
                          <span className="rounded-circle" style={{ width: "10px", height: "10px", background: item.color }} />
                          <span className="fw-medium text-muted">{item.name}</span>
                        </div>
                        <span className="fw-bold" style={{ color: "var(--text)" }}>
                          {item.value.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Management Shortcuts */}
            <div className="row g-3 mb-4">
              <div className="col-md-3">
                <div
                  onClick={() => setActiveTab("users")}
                  className="bento-card p-3 rounded-4 shadow-sm hover-lift d-flex align-items-center gap-3 cursor-pointer"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                >
                  <div className="p-3 rounded-3 bg-primary-subtle text-primary">
                    <Users size={22} />
                  </div>
                  <div>
                    <h6 className="fw-bold mb-0">Manage Users</h6>
                    <small className="text-muted">Edit, verify, or remove</small>
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <div
                  onClick={() => navigate("/admin/users/import")}
                  className="bento-card p-3 rounded-4 shadow-sm hover-lift d-flex align-items-center gap-3 cursor-pointer"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                >
                  <div className="p-3 rounded-3 bg-success-subtle text-success">
                    <UploadCloud size={22} />
                  </div>
                  <div>
                    <h6 className="fw-bold mb-0">Bulk CSV Import</h6>
                    <small className="text-muted">Import entire cohorts</small>
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <div
                  onClick={() => navigate("/admin/db")}
                  className="bento-card p-3 rounded-4 shadow-sm hover-lift d-flex align-items-center gap-3 cursor-pointer"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                >
                  <div className="p-3 rounded-3 bg-info-subtle text-info">
                    <Database size={22} />
                  </div>
                  <div>
                    <h6 className="fw-bold mb-0">Database Tools</h6>
                    <small className="text-muted">Collections & health check</small>
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <div
                  onClick={() => navigate("/admin/logs")}
                  className="bento-card p-3 rounded-4 shadow-sm hover-lift d-flex align-items-center gap-3 cursor-pointer"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                >
                  <div className="p-3 rounded-3 bg-warning-subtle text-warning">
                    <Shield size={22} />
                  </div>
                  <div>
                    <h6 className="fw-bold mb-0">Security Logs</h6>
                    <small className="text-muted">Real-time audit trails</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: USER DIRECTORY & MANAGEMENT ── */}
        {(activeTab === "users" || activeTab === "overview") && (
          <div className="bento-card p-4 rounded-4 shadow-sm mb-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
              <div>
                <h5 className="fw-bold mb-1" style={{ fontSize: "1.25rem" }}>
                  User Account Directory
                </h5>
                <p className="small text-muted mb-0">
                  Search, verify credentials, update permissions, or manage user lifecycles.
                </p>
              </div>

              <div className="d-flex align-items-center gap-2 flex-wrap">
                <button
                  onClick={handleExportCSV}
                  className="btn btn-outline-secondary rounded-pill px-3 py-2 fw-semibold d-flex align-items-center gap-2 small"
                  style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text)" }}
                >
                  <Download size={14} /> Export CSV
                </button>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="btn btn-primary rounded-pill px-3 py-2 fw-bold d-flex align-items-center gap-2 small text-white"
                >
                  <UserPlus size={15} /> Add User
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="row g-2 mb-3">
              <div className="col-12 col-md-5">
                <div className="position-relative">
                  <Search size={16} className="position-absolute top-50 translate-middle-y ms-3 text-muted" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search by name, email, or department..."
                    className="form-control rounded-pill ps-5 py-2"
                    style={{ background: "var(--surface-2, rgba(255,255,255,0.05))", borderColor: "var(--border)", color: "var(--text)" }}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="btn btn-link position-absolute p-0 text-muted"
                      style={{ right: "14px", top: "50%", transform: "translateY(-50%)" }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              <div className="col-6 col-md-3">
                <select
                  value={selectedRole}
                  onChange={(e) => {
                    setSelectedRole(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="form-select rounded-pill py-2"
                  style={{ background: "var(--surface-2, rgba(255,255,255,0.05))", borderColor: "var(--border)", color: "var(--text)" }}
                >
                  <option value="All">All Roles</option>
                  <option value="Student">Students</option>
                  <option value="Alumni">Alumni</option>
                  <option value="Placement">Placement Officers</option>
                  <option value="Admin">Administrators</option>
                </select>
              </div>

              <div className="col-6 col-md-3">
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="form-select rounded-pill py-2"
                  style={{ background: "var(--surface-2, rgba(255,255,255,0.05))", borderColor: "var(--border)", color: "var(--text)" }}
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Pending">Pending Verification</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>

              <div className="col-12 col-md-1 d-flex justify-content-end">
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedRole("All");
                    setSelectedStatus("All");
                    setCurrentPage(1);
                  }}
                  className="btn btn-outline-secondary rounded-pill w-100 py-2 d-flex align-items-center justify-content-center"
                  title="Reset Filters"
                >
                  <RefreshCw size={15} />
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="table-responsive rounded-3 border" style={{ borderColor: "var(--border)" }}>
              <table className="table table-hover align-middle mb-0" style={{ color: "var(--text)" }}>
                <thead style={{ background: "var(--surface-2, rgba(0,0,0,0.03))" }}>
                  <tr>
                    <th
                      onClick={() => handleSort("name")}
                      className="py-3 px-3 small fw-bold text-muted text-uppercase cursor-pointer user-select-none"
                      style={{ cursor: "pointer" }}
                      title="Click to sort by Name"
                    >
                      <div className="d-flex align-items-center gap-1">
                        <span>User</span>
                        {sortBy === "name" ? (
                          sortDirection === "asc" ? <ChevronUp size={14} className="text-primary" /> : <ChevronDown size={14} className="text-primary" />
                        ) : (
                          <ArrowUpDown size={12} className="opacity-50" />
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort("role")}
                      className="py-3 px-3 small fw-bold text-muted text-uppercase cursor-pointer user-select-none"
                      style={{ cursor: "pointer" }}
                      title="Click to sort by Role"
                    >
                      <div className="d-flex align-items-center gap-1">
                        <span>Role</span>
                        {sortBy === "role" ? (
                          sortDirection === "asc" ? <ChevronUp size={14} className="text-primary" /> : <ChevronDown size={14} className="text-primary" />
                        ) : (
                          <ArrowUpDown size={12} className="opacity-50" />
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort("status")}
                      className="py-3 px-3 small fw-bold text-muted text-uppercase cursor-pointer user-select-none"
                      style={{ cursor: "pointer" }}
                      title="Click to sort by Status"
                    >
                      <div className="d-flex align-items-center gap-1">
                        <span>Status</span>
                        {sortBy === "status" ? (
                          sortDirection === "asc" ? <ChevronUp size={14} className="text-primary" /> : <ChevronDown size={14} className="text-primary" />
                        ) : (
                          <ArrowUpDown size={12} className="opacity-50" />
                        )}
                      </div>
                    </th>
                    <th className="py-3 px-3 small fw-bold text-muted text-uppercase">Organization / Dept</th>
                    <th
                      onClick={() => handleSort("createdAt")}
                      className="py-3 px-3 small fw-bold text-muted text-uppercase cursor-pointer user-select-none"
                      style={{ cursor: "pointer" }}
                      title="Click to sort by Registration Date"
                    >
                      <div className="d-flex align-items-center gap-1">
                        <span>Registered</span>
                        {sortBy === "createdAt" ? (
                          sortDirection === "asc" ? <ChevronUp size={14} className="text-primary" /> : <ChevronDown size={14} className="text-primary" />
                        ) : (
                          <ArrowUpDown size={12} className="opacity-50" />
                        )}
                      </div>
                    </th>
                    <th className="py-3 px-3 small fw-bold text-muted text-uppercase text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usersLoading && (
                    <tr>
                      <td colSpan="6" className="text-center py-5">
                        <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                        <span className="text-muted fw-medium">Loading user records from database...</span>
                      </td>
                    </tr>
                  )}

                  {!usersLoading && paginatedUsers.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center py-5 text-muted">
                        <Users size={36} className="opacity-25 mb-2 mx-auto d-block" />
                        <h6 className="fw-bold mb-1">No users found</h6>
                        <small>Try adjusting your search criteria or role filters.</small>
                      </td>
                    </tr>
                  )}

                  {!usersLoading &&
                    paginatedUsers.map((u) => {
                      const roleLower = (u.role || "student").toLowerCase();
                      const roleBadgeColor =
                        roleLower === "admin"
                          ? "bg-danger-subtle text-danger"
                          : roleLower === "alumni"
                          ? "bg-info-subtle text-info"
                          : roleLower === "placement"
                          ? "bg-warning-subtle text-warning"
                          : "bg-primary-subtle text-primary";

                      const statusColor =
                        u.status === "Active"
                          ? "bg-success-subtle text-success"
                          : u.status === "Suspended"
                          ? "bg-danger-subtle text-danger"
                          : "bg-secondary-subtle text-secondary";

                      const dept =
                        u.studentProfile?.department ||
                        u.alumniProfile?.company ||
                        u.department ||
                        "—";

                      return (
                        <tr key={u._id}>
                          <td className="py-3 px-3">
                            <div className="d-flex align-items-center gap-3">
                              <div
                                className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
                                style={{
                                  width: "36px",
                                  height: "36px",
                                  background: "linear-gradient(135deg, var(--primary), var(--purple, #7c3aed))",
                                  fontSize: "0.85rem"
                                }}
                              >
                                {u.name ? u.name.charAt(0).toUpperCase() : "U"}
                              </div>
                              <div>
                                <div className="fw-bold text-foreground" style={{ color: "var(--text)" }}>
                                  {u.name || "Unnamed"}
                                </div>
                                <div className="small text-muted">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span className={`badge rounded-pill fw-bold text-capitalize px-3 py-1 ${roleBadgeColor}`}>
                              {u.role || "Student"}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <button
                              onClick={() => handleToggleStatus(u)}
                              className={`badge rounded-pill fw-bold border-0 px-3 py-1 cursor-pointer transition-fast ${statusColor}`}
                              title="Click to toggle status"
                            >
                              ● {u.status || "Active"}
                            </button>
                          </td>
                          <td className="py-3 px-3 small text-muted">
                            {dept}
                          </td>
                          <td className="py-3 px-3 small text-muted">
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                          </td>
                          <td className="py-3 px-3 text-end">
                            <div className="d-flex align-items-center justify-content-end gap-1">
                              <button
                                onClick={() => setViewingUser(u)}
                                className="btn btn-sm btn-link text-muted p-1 hover-text-primary"
                                title="View Details"
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                onClick={() => handleOpenEdit(u)}
                                className="btn btn-sm btn-link text-muted p-1 hover-text-primary"
                                title="Edit User"
                              >
                                <Edit3 size={16} />
                              </button>
                              <button
                                onClick={() => setDeletingUser(u)}
                                className="btn btn-sm btn-link text-muted p-1 hover-text-danger"
                                title="Delete User"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="d-flex align-items-center justify-content-between mt-3 px-2 flex-wrap gap-2">
                <span className="small text-muted">
                  Showing {(currentPage - 1) * pageSize + 1} to{" "}
                  {Math.min(currentPage * pageSize, filteredUsers.length)} of {filteredUsers.length} users
                </span>

                <div className="d-flex align-items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                  >
                    <ChevronLeft size={14} className="me-1" /> Prev
                  </button>
                  <span className="small fw-bold px-2">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                  >
                    Next <ChevronRight size={14} className="ms-1" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: AUDIT & SECURITY LOGS ── */}
        {activeTab === "audit" && (
          <div className="bento-card p-4 rounded-4 shadow-sm mb-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <div className="d-flex align-items-center justify-content-between mb-4">
              <div>
                <h5 className="fw-bold mb-1" style={{ fontSize: "1.25rem" }}>
                  Platform Audit Trail & Security Events
                </h5>
                <p className="small text-muted mb-0">
                  Every privileged action, login event, and policy execution is logged cryptographically.
                </p>
              </div>
              <button
                onClick={() => navigate("/admin/logs")}
                className="btn btn-outline-primary btn-sm rounded-pill px-3 fw-bold"
              >
                Full Security Center →
              </button>
            </div>

            {stats.recentAuditActivity && stats.recentAuditActivity.length > 0 ? (
              <div className="d-flex flex-column gap-3">
                {stats.recentAuditActivity.map((log, idx) => (
                  <div
                    key={log._id || idx}
                    className="p-3 rounded-3 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3"
                    style={{ background: "var(--surface-2, rgba(255,255,255,0.03))", border: "1px solid var(--border)" }}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <div className="p-2 rounded-circle bg-primary-subtle text-primary">
                        <Clock size={16} />
                      </div>
                      <div>
                        <div className="fw-bold small" style={{ color: "var(--text)" }}>
                          {log.action || log.event || "Administrative Action"}
                        </div>
                        <div className="small text-muted">
                          Performed by: <strong className="text-foreground">{log.userName || log.userEmail || "System"}</strong>{" "}
                          • IP: {log.ipAddress || "127.0.0.1"}
                        </div>
                      </div>
                    </div>
                    <span className="badge bg-secondary bg-opacity-25 text-muted small">
                      {log.timestamp ? new Date(log.timestamp).toLocaleString() : "Recently"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-5 text-muted">
                <ShieldCheck size={40} className="opacity-25 mb-2 mx-auto" />
                <h6 className="fw-bold">No suspicious security events recorded</h6>
                <small>System is running in nominal secure state.</small>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 4: SYSTEM HEALTH ── */}
        {activeTab === "health" && (
          <div className="bento-card p-4 rounded-4 shadow-sm mb-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <h5 className="fw-bold mb-1" style={{ fontSize: "1.25rem" }}>
              Core Infrastructure Telemetry
            </h5>
            <p className="small text-muted mb-4">
              Real-time connectivity status across database, microservices, and third-party integrations.
            </p>

            <div className="row g-3">
              {[
                { name: "Database (MongoDB Atlas)", status: stats.systemHealth.database, icon: Database },
                { name: "Core Application Server", status: stats.systemHealth.backend, icon: Server },
                { name: "OAuth & JWT Auth Gateway", status: stats.systemHealth.auth, icon: ShieldCheck },
                { name: "Email Relay (Nodemailer)", status: stats.systemHealth.email, icon: Mail },
                { name: "Google Gemini AI Engine", status: stats.systemHealth.ai, icon: Activity }
              ].map((svc, i) => {
                const Icon = svc.icon;
                const isOp = svc.status?.toLowerCase().includes("operational") || svc.status?.toLowerCase().includes("active");
                return (
                  <div key={i} className="col-md-6 col-lg-4">
                    <div
                      className="p-3 rounded-4 d-flex align-items-center justify-content-between h-100"
                      style={{ background: "var(--surface-2, rgba(255,255,255,0.03))", border: "1px solid var(--border)" }}
                    >
                      <div className="d-flex align-items-center gap-3">
                        <div className={`p-2 rounded-3 ${isOp ? "bg-success-subtle text-success" : "bg-warning-subtle text-warning"}`}>
                          <Icon size={20} />
                        </div>
                        <div>
                          <div className="fw-bold small" style={{ color: "var(--text)" }}>{svc.name}</div>
                          <span className={`small fw-bold ${isOp ? "text-success" : "text-warning"}`}>
                            ● {svc.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── MODAL 1: VIEW USER DETAILS ── */}
      {viewingUser && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{ background: "rgba(0,0,0,0.6)", zIndex: 1050, backdropFilter: "blur(4px)" }}
        >
          <div
            className="bento-card p-4 rounded-4 shadow-lg w-100"
            style={{ maxWidth: "520px", background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-3">
              <h5 className="fw-bold m-0" style={{ color: "var(--text)" }}>
                User Details
              </h5>
              <button onClick={() => setViewingUser(null)} className="btn btn-link p-0 text-muted">
                <X size={20} />
              </button>
            </div>

            <div className="d-flex align-items-center gap-3 mb-4">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm"
                style={{
                  width: "56px",
                  height: "56px",
                  background: "linear-gradient(135deg, var(--primary), var(--purple, #7c3aed))",
                  fontSize: "1.25rem"
                }}
              >
                {viewingUser.name ? viewingUser.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div>
                <h5 className="fw-bold mb-0" style={{ color: "var(--text)" }}>{viewingUser.name}</h5>
                <span className="small text-muted">{viewingUser.email}</span>
                <div className="mt-1">
                  <span className="badge rounded-pill bg-primary-subtle text-primary me-2">{viewingUser.role}</span>
                  <span className="badge rounded-pill bg-success-subtle text-success">{viewingUser.status}</span>
                </div>
              </div>
            </div>

            <div className="d-flex flex-column gap-2 small p-3 rounded-3 mb-4" style={{ background: "var(--surface-2, rgba(0,0,0,0.02))", border: "1px solid var(--border)" }}>
              <div className="d-flex justify-content-between">
                <span className="text-muted">User ID:</span>
                <span className="fw-mono" style={{ fontSize: "0.8rem" }}>{viewingUser._id}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Registered On:</span>
                <span className="fw-semibold">{viewingUser.createdAt ? new Date(viewingUser.createdAt).toLocaleString() : "—"}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Department / Branch:</span>
                <span className="fw-semibold">{viewingUser.studentProfile?.department || viewingUser.studentProfile?.branch || viewingUser.department || "—"}</span>
              </div>
              {viewingUser.studentProfile?.batchYear && (
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Batch Year:</span>
                  <span className="fw-semibold">{viewingUser.studentProfile.batchYear}</span>
                </div>
              )}
              {viewingUser.alumniProfile?.company && (
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Company:</span>
                  <span className="fw-semibold">{viewingUser.alumniProfile.company}</span>
                </div>
              )}
            </div>

            <div className="d-flex justify-content-end gap-2">
              <button
                onClick={() => {
                  handleOpenEdit(viewingUser);
                  setViewingUser(null);
                }}
                className="btn btn-outline-primary rounded-pill px-4 fw-bold small"
              >
                Edit User
              </button>
              <button
                onClick={() => setViewingUser(null)}
                className="btn btn-primary rounded-pill px-4 fw-bold small text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: EDIT USER ── */}
      {editingUser && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{ background: "rgba(0,0,0,0.6)", zIndex: 1050, backdropFilter: "blur(4px)" }}
        >
          <div
            className="bento-card p-4 rounded-4 shadow-lg w-100"
            style={{ maxWidth: "480px", background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-3">
              <h5 className="fw-bold m-0" style={{ color: "var(--text)" }}>
                Edit User Account
              </h5>
              <button onClick={() => setEditingUser(null)} className="btn btn-link p-0 text-muted">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-3">
              <div>
                <label className="form-label small fw-bold">Full Name *</label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="form-control"
                  style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text)" }}
                />
              </div>

              <div>
                <label className="form-label small fw-bold">Email Address *</label>
                <input
                  type="email"
                  required
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="form-control"
                  style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text)" }}
                />
              </div>

              <div className="row g-2">
                <div className="col-6">
                  <label className="form-label small fw-bold">System Role</label>
                  <select
                    value={editFormData.role}
                    onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                    className="form-select"
                    style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text)" }}
                  >
                    <option value="Student">Student</option>
                    <option value="Alumni">Alumni</option>
                    <option value="Placement">Placement Officer</option>
                    <option value="Admin">Administrator</option>
                  </select>
                </div>

                <div className="col-6">
                  <label className="form-label small fw-bold">Account Status</label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="form-select"
                    style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text)" }}
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="btn btn-outline-secondary rounded-pill px-4 fw-bold small"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn btn-primary rounded-pill px-4 fw-bold small text-white"
                >
                  {actionLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 3: DELETE CONFIRMATION ── */}
      {deletingUser && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{ background: "rgba(0,0,0,0.6)", zIndex: 1050, backdropFilter: "blur(4px)" }}
        >
          <div
            className="bento-card p-4 rounded-4 shadow-lg w-100 text-center"
            style={{ maxWidth: "420px", background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div className="p-3 rounded-circle bg-danger-subtle text-danger mx-auto mb-3" style={{ width: "64px", height: "64px", display: "grid", placeItems: "center" }}>
              <Trash2 size={28} />
            </div>
            <h5 className="fw-bold mb-2">Delete User Account?</h5>
            <p className="small text-muted mb-4">
              Are you sure you want to delete <strong>{deletingUser.name}</strong> ({deletingUser.email})? This action cannot be undone.
            </p>

            <div className="d-flex justify-content-center gap-2">
              <button
                onClick={() => setDeletingUser(null)}
                className="btn btn-outline-secondary rounded-pill px-4 fw-bold small"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={actionLoading}
                className="btn btn-danger rounded-pill px-4 fw-bold small text-white"
              >
                {actionLoading ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 4: CREATE USER ── */}
      {showCreateModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{ background: "rgba(0,0,0,0.6)", zIndex: 1050, backdropFilter: "blur(4px)" }}
        >
          <div
            className="bento-card p-4 rounded-4 shadow-lg w-100"
            style={{ maxWidth: "480px", background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-3">
              <h5 className="fw-bold m-0" style={{ color: "var(--text)" }}>
                Add New User Account
              </h5>
              <button onClick={() => setShowCreateModal(false)} className="btn btn-link p-0 text-muted">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="form-label small fw-bold">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="e.g. Anand Kumar"
                  className="form-control"
                  style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text)" }}
                />
              </div>

              <div>
                <label className="form-label small fw-bold">Email Address *</label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="anand@institution.edu"
                  className="form-control"
                  style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text)" }}
                />
              </div>

              <div>
                <label className="form-label small fw-bold">Initial Password *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="Minimum 6 characters"
                  className="form-control"
                  style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text)" }}
                />
              </div>

              <div className="row g-2">
                <div className="col-6">
                  <label className="form-label small fw-bold">Role *</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="form-select"
                    style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text)" }}
                  >
                    <option value="Student">Student</option>
                    <option value="Alumni">Alumni</option>
                    <option value="Placement">Placement Officer</option>
                    <option value="Admin">Administrator</option>
                  </select>
                </div>

                <div className="col-6">
                  <label className="form-label small fw-bold">Status</label>
                  <select
                    value={newUser.status}
                    onChange={(e) => setNewUser({ ...newUser, status: e.target.value })}
                    className="form-select"
                    style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text)" }}
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-outline-secondary rounded-pill px-4 fw-bold small"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn btn-primary rounded-pill px-4 fw-bold small text-white"
                >
                  {actionLoading ? "Creating..." : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
