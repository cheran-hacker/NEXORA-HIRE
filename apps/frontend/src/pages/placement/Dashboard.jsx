import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Briefcase,
  Users,
  CheckCircle2,
  Clock,
  Search,
  ChevronRight,
  TrendingUp,
  FileCheck,
  Building2
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { placementService } from "../../services/api";
import { useToast } from "../../context/ToastContext";

const MONTHLY_APPLICATIONS = [
  { month: "Jan", count: 45 },
  { month: "Feb", count: 85 },
  { month: "Mar", count: 120 },
  { month: "Apr", count: 165 },
  { month: "May", count: 140 },
  { month: "Jun", count: 130 },
  { month: "Jul", count: 210 },
];

export default function PlacementDashboard() {
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeJobs: 25,
    applications: 312,
    shortlisted: 48,
    interviews: 15,
  });

  const [recentApplications, setRecentApplications] = useState([
    {
      id: "app-1",
      name: "Priya Sharma",
      avatar: "/hero-student.jpg",
      role: "Software Engineer",
      company: "Google",
      status: "New",
      statusBadgeClass: "bg-danger-subtle text-danger",
    },
    {
      id: "app-2",
      name: "Rahul Verma",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      role: "Data Analyst",
      company: "Amazon",
      status: "Under Review",
      statusBadgeClass: "bg-primary-subtle text-primary",
    },
    {
      id: "app-3",
      name: "Sneha Iyer",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80",
      role: "Product Intern",
      company: "Microsoft",
      status: "Shortlisted",
      statusBadgeClass: "bg-success-subtle text-success",
    },
  ]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await placementService.getStats();
        if (res.data?.kpis) {
          setStats((prev) => ({
            activeJobs: res.data.kpis.activeJobs || prev.activeJobs,
            applications: res.data.kpis.totalApplicants || prev.applications,
            shortlisted: res.data.kpis.shortlisted || prev.shortlisted,
            interviews: res.data.kpis.interviewsToday || prev.interviews,
          }));
        }
      } catch (err) {
        console.warn("Using Master UI defaults for Placement Dashboard", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
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
        {/* Master Screen 13 Header matching Image 5 */}
        <div className="mb-4">
          <h2 className="fw-bold mb-1" style={{ fontSize: "1.85rem", letterSpacing: "-0.02em" }}>
            Placement Dashboard
          </h2>
          <p className="text-muted mb-0" style={{ fontSize: "1rem" }}>
            Manage opportunities and track student placements.
          </p>
        </div>

        {/* 4 Flagship KPIs matching Image 5 */}
        <div className="row g-3 g-md-4 mb-4">
          {/* 1. Active Jobs */}
          <div className="col-6 col-lg-3">
            <div
              className="card border-0 rounded-4 shadow-sm p-3 p-md-4 h-100 d-flex flex-row align-items-center gap-3"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div
                className="rounded-3 d-flex align-items-center justify-content-center text-white flex-shrink-0"
                style={{ width: "48px", height: "48px", background: "#0d6efd" }}
              >
                <Briefcase size={22} />
              </div>
              <div>
                <h3 className="fw-bold mb-0" style={{ fontSize: "1.75rem", lineHeight: 1 }}>
                  {stats.activeJobs}
                </h3>
                <small className="text-muted fw-semibold">Active Jobs</small>
              </div>
            </div>
          </div>

          {/* 2. Applications */}
          <div className="col-6 col-lg-3">
            <div
              className="card border-0 rounded-4 shadow-sm p-3 p-md-4 h-100 d-flex flex-row align-items-center gap-3"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div
                className="rounded-3 d-flex align-items-center justify-content-center text-white flex-shrink-0"
                style={{ width: "48px", height: "48px", background: "#06b6d4" }}
              >
                <Users size={22} />
              </div>
              <div>
                <h3 className="fw-bold mb-0" style={{ fontSize: "1.75rem", lineHeight: 1 }}>
                  {stats.applications}
                </h3>
                <small className="text-muted fw-semibold">Applications</small>
              </div>
            </div>
          </div>

          {/* 3. Shortlisted */}
          <div className="col-6 col-lg-3">
            <div
              className="card border-0 rounded-4 shadow-sm p-3 p-md-4 h-100 d-flex flex-row align-items-center gap-3"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div
                className="rounded-3 d-flex align-items-center justify-content-center text-white flex-shrink-0"
                style={{ width: "48px", height: "48px", background: "#10b981" }}
              >
                <CheckCircle2 size={22} />
              </div>
              <div>
                <h3 className="fw-bold mb-0" style={{ fontSize: "1.75rem", lineHeight: 1 }}>
                  {stats.shortlisted}
                </h3>
                <small className="text-muted fw-semibold">Shortlisted</small>
              </div>
            </div>
          </div>

          {/* 4. Interviews */}
          <div className="col-6 col-lg-3">
            <div
              className="card border-0 rounded-4 shadow-sm p-3 p-md-4 h-100 d-flex flex-row align-items-center gap-3"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div
                className="rounded-3 d-flex align-items-center justify-content-center text-white flex-shrink-0"
                style={{ width: "48px", height: "48px", background: "#f59e0b" }}
              >
                <Clock size={22} />
              </div>
              <div>
                <h3 className="fw-bold mb-0" style={{ fontSize: "1.75rem", lineHeight: 1 }}>
                  {stats.interviews}
                </h3>
                <small className="text-muted fw-semibold">Interviews</small>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Split: Applications Overview Bar Chart (Left) + Recent Applications (Right) */}
        <div className="row g-4">
          {/* Left Column: Applications Overview Bar Chart matching Image 5 */}
          <div className="col-12 col-lg-7">
            <div
              className="card border-0 rounded-4 shadow-sm p-4 h-100"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold mb-0" style={{ fontSize: "1.15rem" }}>
                  Applications Overview
                </h5>
                <span className="badge bg-primary-subtle text-primary rounded-pill px-3 py-1 fw-bold small">
                  Monthly Growth +28%
                </span>
              </div>

              <div style={{ height: "300px", width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={MONTHLY_APPLICATIONS} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                    <Bar dataKey="count" fill="#0d6efd" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Right Column: Recent Applications matching Image 5 */}
          <div className="col-12 col-lg-5">
            <div
              className="card border-0 rounded-4 shadow-sm p-4 h-100"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold mb-0" style={{ fontSize: "1.15rem" }}>
                  Recent Applications
                </h5>
                <Link
                  to="/placement/applications"
                  className="btn btn-link text-primary p-0 fw-semibold text-decoration-none small"
                >
                  View All &rarr;
                </Link>
              </div>

              <div className="d-flex flex-column gap-3">
                {recentApplications.map((app) => (
                  <div
                    key={app.id}
                    className="p-3 rounded-4 border d-flex align-items-center justify-content-between"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <img
                        src={app.avatar}
                        alt={app.name}
                        className="rounded-circle shadow-sm"
                        style={{ width: "46px", height: "46px", objectFit: "cover" }}
                        onError={(e) => {
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${app.name[0]}&background=0d6efd&color=fff`;
                        }}
                      />
                      <div>
                        <h6 className="fw-bold mb-0" style={{ color: "var(--text)" }}>
                          {app.name}
                        </h6>
                        <small className="text-muted fw-semibold d-block">
                          {app.role} • {app.company}
                        </small>
                      </div>
                    </div>

                    <span className={`badge rounded-pill px-3 py-1 fw-bold small ${app.statusBadgeClass}`}>
                      {app.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
