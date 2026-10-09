import React, { useState, useEffect } from "react";
import { useToast } from "../../context/ToastContext";
import { Briefcase, Users, Zap, Clock, Search, Activity, UserPlus, Server, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { placementService } from "../../services/api";
import { useNavigate } from "react-router-dom";

export default function PlacementDashboard() {
  const { addToast } = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await placementService.getStats();
        setStats(res.data);
      } catch (error) {
        addToast("Failed to load dashboard data", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, [addToast]);

  const pipelineData = stats?.pipeline?.labels?.map((label, i) => ({
    name: label,
    value: stats.pipeline.data[i] || 0,
  })) || [];

  const recentApplications = stats?.recentApplications || [];

  const getStatusColor = (status) => {
    switch (status) {
      case "Offered": return "var(--premium-success)";
      case "Rejected": return "var(--premium-danger)";
      case "Shortlisted": return "var(--premium-neon-blue)";
      case "Interviewing": return "var(--premium-neon-purple)";
      default: return "var(--premium-text-muted)";
    }
  };

  return (
    <div className="container-fluid py-4 px-xl-5" style={{ background: "transparent" }}>
      <div className="d-flex flex-column gap-4 mx-auto" style={{ maxWidth: "1500px" }}>
        
        {/* Top Header & Search */}
        <div className="d-flex justify-content-between align-items-center mb-2">
          <div>
            <h3 className="fw-bold mb-1" style={{ color: 'var(--premium-text-main)' }}>
              Welcome back, {stats?.adminProfile?.name || 'Placement Officer'}!
            </h3>
            <span className="text-muted">Placement Command Center</span>
          </div>

          <div className="position-relative d-none d-md-block" style={{ width: '300px' }}>
            <Search className="premium-search-icon" size={18} />
            <input 
              type="text" 
              className="form-control premium-search-bar shadow-sm" 
              placeholder="Search talent..." 
            />
          </div>
        </div>

        {/* Top Row KPIs */}
        <div className="row g-4">
          <div className="col-md-6 col-xl-3">
            <motion.div whileHover={{ y: -5 }} className="premium-glass-panel kpi-card" style={{ borderLeft: '3px solid var(--premium-neon-purple)' }}>
              <div className="kpi-header">
                <span className="kpi-title">Total Candidates</span>
                <div className="kpi-icon-container kpi-icon-purple">
                  <Users size={18} />
                </div>
              </div>
              <div className="kpi-value-row">
                <span className="kpi-value">{loading ? "..." : (stats?.kpis?.totalApplicants || 0)}</span>
                <span className="kpi-change neutral">Overall</span>
              </div>
            </motion.div>
          </div>

          <div className="col-md-6 col-xl-3">
            <motion.div whileHover={{ y: -5 }} className="premium-glass-panel kpi-card" style={{ borderLeft: '3px solid var(--premium-neon-blue)' }}>
              <div className="kpi-header">
                <span className="kpi-title">Active Jobs</span>
                <div className="kpi-icon-container kpi-icon-blue">
                  <Briefcase size={18} />
                </div>
              </div>
              <div className="kpi-value-row">
                <span className="kpi-value">{loading ? "..." : (stats?.kpis?.activeJobs || 0)}</span>
                <span className="kpi-change neutral">Current</span>
              </div>
            </motion.div>
          </div>

          <div className="col-md-6 col-xl-3">
            <motion.div whileHover={{ y: -5 }} className="premium-glass-panel kpi-card" style={{ borderLeft: '3px solid var(--premium-border)' }}>
              <div className="kpi-header">
                <span className="kpi-title">AI Top Matches</span>
                <div className="kpi-icon-container text-success">
                  <Zap size={18} />
                </div>
              </div>
              <div className="kpi-value-row">
                <span className="kpi-value">{loading ? "..." : (stats?.kpis?.aiTopMatches || 0)}</span>
                <span className="kpi-change neutral">80%+ Match</span>
              </div>
            </motion.div>
          </div>

          <div className="col-md-6 col-xl-3">
            <motion.div whileHover={{ y: -5 }} className="premium-glass-panel kpi-card" style={{ borderLeft: '3px solid var(--premium-border)' }}>
              <div className="kpi-header">
                <span className="kpi-title">Interviews Today</span>
                <div className="kpi-icon-container text-success">
                  <Clock size={18} />
                </div>
              </div>
              <div className="kpi-value-row">
                <span className="kpi-value">{loading ? "..." : (stats?.kpis?.interviewsToday || 0)}</span>
                <span className="kpi-change positive" style={{ color: 'var(--premium-success)' }}>Scheduled</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="row g-4">
          {/* Spline Chart */}
          <div className="col-xl-8">
            <div className="premium-glass-panel p-4 h-100">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="mb-0 fw-bold">Talent Pipeline Breakdown</h5>
                <span className="badge border text-body px-3 py-1 rounded-pill d-flex align-items-center gap-2" style={{ background: 'rgba(128,128,128,0.1)', borderColor: 'var(--premium-border)' }}>
                  <Activity size={14} className="text-info" /> Pipeline Activity
                </span>
              </div>
              {pipelineData.length > 0 ? (
                <div style={{ height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={pipelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--premium-neon-blue)" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="var(--premium-neon-blue)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.1)" vertical={false} />
                      <XAxis dataKey="name" stroke="var(--premium-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="var(--premium-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip />
                      <Area type="monotone" dataKey="value" stroke="var(--premium-neon-blue)" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="d-flex align-items-center justify-content-center text-muted" style={{ height: '300px' }}>
                  No pipeline data available. Post a job to get started.
                </div>
              )}
            </div>
          </div>

          {/* Swipe to Hire CTA */}
          <div className="col-xl-4">
            <div className="premium-glass-panel p-4 h-100 d-flex flex-column justify-content-center align-items-center text-center">
              <div className="rounded-circle d-flex align-items-center justify-content-center mb-4" style={{ width: 64, height: 64, background: 'rgba(34, 211, 238, 0.1)' }}>
                <Zap size={32} color="var(--premium-neon-blue)" />
              </div>
              <h4 className="fw-bold mb-2">Swipe to Hire</h4>
              <p className="text-muted mb-4 px-3">
                Discover top talent rapidly through our AI-curated matching interface. Find your perfect fit in seconds.
              </p>
              <button
                className="btn w-100 fw-bold rounded-pill py-3 d-flex align-items-center justify-content-center gap-2"
                style={{
                  background: 'linear-gradient(90deg, var(--premium-neon-blue), var(--premium-neon-purple))',
                  color: '#fff',
                  border: 'none',
                }}
                onClick={() => navigate("/placement/match")}
              >
                Start Swiping <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Tables Row */}
        <div className="row g-4">
          {/* Recent Applications */}
          <div className="col-12">
            <div className="premium-glass-panel p-4 h-100">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
                  <UserPlus size={18} className="text-info" /> Recent Applications
                </h5>
                <button className="btn btn-sm btn-outline-secondary rounded-pill px-3">View All</button>
              </div>
              <div className="table-responsive">
                {recentApplications.length > 0 ? (
                  <table className="table align-middle">
                    <thead>
                      <tr>
                        <th>Candidate</th>
                        <th>Applied Role</th>
                        <th>Status</th>
                        <th className="text-end">AI Match</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentApplications.map((app, i) => (
                        <tr key={i}>
                          <td>
                            <div className="d-flex align-items-center gap-3">
                              <img src={`https://ui-avatars.com/api/?name=${app.name}&background=random&color=fff`} className="rounded-circle" width={32} height={32} alt={app.name} />
                              <span className="fw-semibold ">{app.name}</span>
                            </div>
                          </td>
                          <td className="text-muted">{app.role}</td>
                          <td>
                            <span style={{ color: getStatusColor(app.status), fontWeight: '600' }}>
                              {app.status}
                            </span>
                          </td>
                          <td className="text-end">
                            <span className="fw-bold" style={{ color: 'var(--premium-text-main)' }}>
                              {app.matchScore}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-muted p-3 text-center">No recent applications found.</div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
