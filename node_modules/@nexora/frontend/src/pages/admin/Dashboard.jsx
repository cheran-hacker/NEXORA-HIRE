import React, { useState, useEffect } from "react";
import {
  Users,
  GraduationCap,
  Briefcase,
  ShieldCheck,
  TrendingUp,
  PieChart as PieIcon,
  Search,
  ArrowUpRight
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
} from "recharts";
import { adminService } from "../../services/api";
import { useToast } from "../../context/ToastContext";

const USER_GROWTH_DATA = [
  { month: "Jan", users: 200 },
  { month: "Feb", users: 310 },
  { month: "Mar", users: 380 },
  { month: "Apr", users: 510 },
  { month: "May", users: 480 },
  { month: "Jun", users: 580 },
  { month: "Jul", users: 710 },
];

const USER_DISTRIBUTION_DATA = [
  { name: "Students", value: 66, color: "#0d6efd" },
  { name: "Alumni", value: 25, color: "#06b6d4" },
  { name: "Placement", value: 7.2, color: "#f59e0b" },
  { name: "Admins", value: 2, color: "#ea580c" },
];

export default function AdminDashboard() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);

  // Screen 14 Master KPIs
  const [kpis, setKpis] = useState({
    totalUsers: "12,458",
    students: "8,236",
    alumni: "3,102",
    placementOfficers: "120",
  });

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        setLoading(true);
        const res = await adminService.getStats();
        if (res.data?.kpis) {
          const k = res.data.kpis;
          setKpis({
            totalUsers: (k.totalUsers || 12458).toLocaleString(),
            students: (k.totalStudents || 8236).toLocaleString(),
            alumni: (k.totalAlumni || 3102).toLocaleString(),
            placementOfficers: (k.totalPlacement || 120).toLocaleString(),
          });
        }
      } catch (err) {
        console.warn("Using Master UI defaults for Admin Dashboard", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  return (
    <div
      className="container-fluid py-4 px-3 px-md-4"
      style={{
        background: "var(--bg)",
        minHeight: "100vh",
        color: "var(--text)",
      }}
    >
      <div className="mx-auto" style={{ maxWidth: "1140px" }}>
        {/* Master Screen 14 Header matching Image 5 */}
        <div className="mb-4">
          <h2 className="fw-bold mb-1" style={{ fontSize: "1.85rem", letterSpacing: "-0.02em" }}>
            Admin Dashboard
          </h2>
          <p className="text-muted mb-0" style={{ fontSize: "1rem" }}>
            Manage the entire NEXORA platform.
          </p>
        </div>

        {/* 4 Flagship KPI Cards matching Image 5 */}
        <div className="row g-3 g-md-4 mb-4">
          {/* 1. Total Users */}
          <div className="col-6 col-lg-3">
            <div
              className="card border-0 rounded-4 shadow-sm p-3 p-md-4 h-100 d-flex flex-row align-items-center gap-3"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div
                className="rounded-3 d-flex align-items-center justify-content-center text-white flex-shrink-0"
                style={{ width: "48px", height: "48px", background: "#c026d3" }}
              >
                <Users size={22} />
              </div>
              <div>
                <small className="text-muted fw-semibold d-block">Total Users</small>
                <h3 className="fw-bold mb-0 mt-1" style={{ fontSize: "1.75rem", lineHeight: 1 }}>
                  {kpis.totalUsers}
                </h3>
              </div>
            </div>
          </div>

          {/* 2. Students */}
          <div className="col-6 col-lg-3">
            <div
              className="card border-0 rounded-4 shadow-sm p-3 p-md-4 h-100 d-flex flex-row align-items-center gap-3"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div
                className="rounded-3 d-flex align-items-center justify-content-center text-white flex-shrink-0"
                style={{ width: "48px", height: "48px", background: "#0d6efd" }}
              >
                <GraduationCap size={22} />
              </div>
              <div>
                <small className="text-muted fw-semibold d-block">Students</small>
                <h3 className="fw-bold mb-0 mt-1" style={{ fontSize: "1.75rem", lineHeight: 1 }}>
                  {kpis.students}
                </h3>
              </div>
            </div>
          </div>

          {/* 3. Alumni */}
          <div className="col-6 col-lg-3">
            <div
              className="card border-0 rounded-4 shadow-sm p-3 p-md-4 h-100 d-flex flex-row align-items-center gap-3"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div
                className="rounded-3 d-flex align-items-center justify-content-center text-white flex-shrink-0"
                style={{ width: "48px", height: "48px", background: "#0d9488" }}
              >
                <Briefcase size={22} />
              </div>
              <div>
                <small className="text-muted fw-semibold d-block">Alumni</small>
                <h3 className="fw-bold mb-0 mt-1" style={{ fontSize: "1.75rem", lineHeight: 1 }}>
                  {kpis.alumni}
                </h3>
              </div>
            </div>
          </div>

          {/* 4. Placement Officers */}
          <div className="col-6 col-lg-3">
            <div
              className="card border-0 rounded-4 shadow-sm p-3 p-md-4 h-100 d-flex flex-row align-items-center gap-3"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div
                className="rounded-3 d-flex align-items-center justify-content-center text-white flex-shrink-0"
                style={{ width: "48px", height: "48px", background: "#6366f1" }}
              >
                <ShieldCheck size={22} />
              </div>
              <div>
                <small className="text-muted fw-semibold d-block">Placement Officers</small>
                <h3 className="fw-bold mb-0 mt-1" style={{ fontSize: "1.75rem", lineHeight: 1 }}>
                  {kpis.placementOfficers}
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Split: User Growth (Left) + User Distribution Donut (Right) matching Image 5 */}
        <div className="row g-4">
          {/* Left Column: User Growth Line Chart */}
          <div className="col-12 col-lg-7">
            <div
              className="card border-0 rounded-4 shadow-sm p-4 h-100"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold mb-0" style={{ fontSize: "1.15rem" }}>
                  User Growth
                </h5>
                <span className="badge bg-success-subtle text-success rounded-pill px-3 py-1 fw-bold small">
                  +34% this quarter
                </span>
              </div>

              <div style={{ height: "300px", width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={USER_GROWTH_DATA} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.06)" />
                    <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                        borderRadius: "12px",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                        color: "var(--text)",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="users"
                      stroke="#0d6efd"
                      strokeWidth={3}
                      dot={{ r: 4, fill: "#0d6efd" }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Right Column: User Distribution Donut Chart matching Image 5 */}
          <div className="col-12 col-lg-5">
            <div
              className="card border-0 rounded-4 shadow-sm p-4 h-100"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <h5 className="fw-bold mb-4" style={{ fontSize: "1.15rem" }}>
                User Distribution
              </h5>

              <div className="row align-items-center">
                {/* Donut Chart */}
                <div className="col-7">
                  <div style={{ height: "230px", width: "100%" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={USER_DISTRIBUTION_DATA}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={85}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {USER_DISTRIBUTION_DATA.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Legend List */}
                <div className="col-5">
                  <div className="d-flex flex-column gap-3">
                    {USER_DISTRIBUTION_DATA.map((item) => (
                      <div key={item.name} className="d-flex align-items-center justify-content-between small">
                        <div className="d-flex align-items-center gap-2">
                          <span
                            className="rounded-circle"
                            style={{ width: "10px", height: "10px", background: item.color }}
                          />
                          <span className="fw-semibold text-muted">{item.name}</span>
                        </div>
                        <span className="fw-bold" style={{ color: "var(--text)" }}>
                          {item.value}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
