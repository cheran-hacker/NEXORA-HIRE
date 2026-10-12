import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import { 
  Users, Briefcase, TrendingUp, Search, Activity, 
  UserPlus, Server, CheckCircle, Clock, Award, 
  AlertCircle, ChevronRight, GraduationCap, Building,
  FileText, LayoutDashboard, Database, ShieldAlert, Cpu,
  Download, ExternalLink, Edit3, Eye, ShieldCheck, RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, Area, AreaChart
} from "recharts";
import { adminService } from "../../services/api";
import { getAvatarUrl } from "../../utils/avatar";

const COLORS = ["#818cf8", "#22d3ee", "#34d399", "#f472b6", "#fbbf24", "#c084fc"];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({ users: [], jobs: [] });
  const [isSearching, setIsSearching] = useState(false);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await adminService.getStats();
      setStats(res.data);
    } catch (error) {
      console.error("Failed to fetch admin stats:", error);
      addToast("Failed to fetch dashboard intelligence", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 180000); 
    return () => clearInterval(interval);
  }, []);

  // Global Search logic
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') setIsSearchOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults({ users: [], jobs: [] });
      return;
    }
    const doSearch = async () => {
      setIsSearching(true);
      try {
        const res = await adminService.globalSearch(searchQuery);
        if (res.data.success) {
          setSearchResults(res.data.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsSearching(false);
      }
    };
    const timeout = setTimeout(doSearch, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  // Derived Data
  const trafficData = stats?.traffic?.labels?.map((label, i) => ({
    name: label,
    Total: (stats.traffic.studentData?.[i] || 0) + (stats.traffic.alumniData?.[i] || 0),
  })) || [];

  const pipeline = stats?.pipeline || { Applied: 0, Review: 0, Shortlisted: 0, Interview: 0, Selected: 0 };
  const placementRate = pipeline.Applied > 0 ? ((pipeline.Selected / pipeline.Applied) * 100).toFixed(1) : 0;

  const careerTargetsData = stats?.careerTargets?.map(item => ({
    name: item._id || item.name || 'General Engineering',
    count: item.count || 0
  })) || [];

  // Export Comprehensive Report
  const handleExportReport = () => {
    if (!stats) {
      addToast("No data available to export", "error");
      return;
    }

    const reportDate = new Date().toISOString().split("T")[0];
    const csvRows = [
      ["NEXORA COMMAND CENTER 2.0 - EXECUTIVE REPORT"],
      ["Generated At", new Date().toLocaleString()],
      [""],
      ["METRIC", "VALUE"],
      ["Total Students", stats?.kpis?.totalStudents || 0],
      ["Active Alumni", stats?.kpis?.totalAlumni || 0],
      ["Live Opportunities", stats?.kpis?.totalJobs || 0],
      ["Total Applications", stats?.kpis?.totalApplications || 0],
      ["Placement Rate", `${placementRate}%`],
      ["Skill Readiness", `${stats?.kpis?.skillReadiness || 0}%`],
      ["Active Assessments", stats?.kpis?.totalAssessments || 0],
      [""],
      ["PIPELINE STATUS", "COUNT"],
      ["Applied", pipeline.Applied],
      ["Under Review", pipeline.Review],
      ["Shortlisted", pipeline.Shortlisted],
      ["Interview", pipeline.Interview],
      ["Selected", pipeline.Selected],
      [""],
      ["SUBSYSTEM", "STATUS"],
      ["Backend API", stats?.systemHealth?.backend || "Operational"],
      ["MongoDB Database", stats?.systemHealth?.database || "Operational"],
      ["Authentication", stats?.systemHealth?.auth || "Operational"],
      ["AI Service", "Operational / Resilient Fallback Enabled"]
    ];

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `NEXORA_Command_Center_Report_${reportDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast("Command Center report downloaded successfully", "success");
  };

  const StatSkeleton = () => (
    <div className="placeholder-glow w-100">
      <div className="placeholder w-50 placeholder-lg rounded"></div>
    </div>
  );

  return (
    <div className="container-fluid py-4 px-xl-5 premium-theme-wrapper" style={{ minHeight: "100vh" }}>
      
      {/* GLOBAL SEARCH MODAL */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-start"
            style={{ background: 'rgba(0,0,0,0.65)', zIndex: 9999, paddingTop: '10vh', backdropFilter: 'blur(6px)' }}
            onClick={() => setIsSearchOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: -20 }}
              className="premium-glass-panel overflow-hidden w-100 shadow-2xl"
              style={{ maxWidth: '640px', background: 'var(--premium-surface-solid, #131722)', border: '1px solid var(--premium-border, rgba(255,255,255,0.1))' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="p-3 border-bottom border-secondary border-opacity-25 d-flex align-items-center gap-2">
                <Search size={20} className="text-muted" />
                <input 
                  type="text" 
                  className="form-control border-0 bg-transparent shadow-none text-white fs-5"
                  placeholder="Search students, alumni, jobs, logs..."
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="small text-muted border border-secondary border-opacity-25 px-2 py-1 rounded">ESC</div>
              </div>
              <div className="p-2" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                {isSearching ? (
                  <div className="p-4 text-center text-muted">Searching Command Center...</div>
                ) : (
                  <>
                    {searchResults.users.length > 0 && (
                      <div className="mb-3">
                        <div className="small text-muted text-uppercase px-3 py-1 fw-bold">Students & Alumni</div>
                        {searchResults.users.map(u => (
                          <div 
                            key={u._id} 
                            className="d-flex align-items-center justify-content-between p-2 mx-2 rounded hover-bg-subtle cursor-pointer transition-all"
                            onClick={() => {
                              setIsSearchOpen(false);
                              navigate(`/admin/users?search=${encodeURIComponent(u.email || u.name)}`);
                            }}
                          >
                            <div className="d-flex align-items-center gap-3">
                              <img 
                                src={getAvatarUrl(u.name, u.avatar)} 
                                alt={u.name} 
                                className="rounded-circle object-fit-cover" 
                                style={{ width: '32px', height: '32px' }} 
                              />
                              <div>
                                <div className="fw-semibold text-white">{u.name}</div>
                                <div className="small text-muted">{u.email} &bull; <span className="text-primary">{u.role}</span></div>
                              </div>
                            </div>
                            <span className="badge bg-primary-subtle text-primary border border-primary border-opacity-25 small">Manage</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {searchResults.jobs.length > 0 && (
                      <div className="mb-3">
                        <div className="small text-muted text-uppercase px-3 py-1 fw-bold">Opportunities</div>
                        {searchResults.jobs.map(j => (
                          <div 
                            key={j._id} 
                            className="d-flex align-items-center justify-content-between p-2 mx-2 rounded hover-bg-subtle cursor-pointer transition-all"
                            onClick={() => {
                              setIsSearchOpen(false);
                              navigate('/admin/db');
                            }}
                          >
                            <div className="d-flex align-items-center gap-3">
                              <div className="avatar rounded bg-info bg-opacity-25 text-info d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                                <Briefcase size={16} />
                              </div>
                              <div>
                                <div className="fw-semibold text-white">{j.title}</div>
                                <div className="small text-muted">{j.company} &bull; {j.type}</div>
                              </div>
                            </div>
                            <span className="badge bg-info-subtle text-info border border-info border-opacity-25 small">View in DB</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {searchQuery.length > 1 && searchResults.users.length === 0 && searchResults.jobs.length === 0 && (
                      <div className="p-4 text-center text-muted">No records match "{searchQuery}"</div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="d-flex flex-column gap-4 mx-auto" style={{ maxWidth: "1600px" }}>
        
        {/* COMMAND CENTER HERO */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-2">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <h3 className="fw-bold mb-0" style={{ color: 'var(--premium-text-main, #ffffff)' }}>NEXORA Command Center 2.0</h3>
              <span className="badge bg-success-subtle text-success border border-success border-opacity-25 px-2 py-1 small">
                LIVE PRODUCTION
              </span>
            </div>
            <p className="text-muted mb-0 small">
              Centralized administrative telemetry, real-time MongoDB aggregations, and ecosystem control.
            </p>
          </div>
          <div className="d-flex gap-2 mt-3 mt-md-0">
            <button 
              className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-2" 
              onClick={fetchStats}
              title="Refresh live metrics"
            >
              <RefreshCw size={14} className={loading ? "spin" : ""} /> Refresh
            </button>
            <button 
              className="btn btn-sm btn-primary d-flex align-items-center gap-2"
              onClick={handleExportReport}
              title="Download executive CSV report"
            >
              <Download size={14} /> Export Report
            </button>
          </div>
        </div>

        {/* QUICK ACTIONS ROW */}
        <div className="d-flex gap-2 overflow-auto pb-2" style={{ scrollbarWidth: 'none' }}>
          {[
            { label: 'Manage Users & Students', icon: Users, route: '/admin/users' },
            { label: 'Manage Alumni & Mentors', icon: GraduationCap, route: '/admin/alumni' },
            { label: 'Domain Database Tools', icon: Database, route: '/admin/db' },
            { label: 'Assessments & Tests', icon: Award, route: '/admin/assessments' },
            { label: 'Security & Audit Logs', icon: ShieldAlert, route: '/admin/logs' },
            { label: 'System Health & Engine', icon: Server, route: '/admin/health' },
          ].map((action, i) => (
            <button 
              key={i} 
              className="btn btn-sm px-3 py-2 d-flex align-items-center gap-2 hover-elevate transition-all" 
              style={{ 
                background: 'var(--premium-surface, rgba(255,255,255,0.03))', 
                border: '1px solid var(--premium-border, rgba(255,255,255,0.08))', 
                color: 'var(--premium-text-main, #fff)', 
                whiteSpace: 'nowrap', 
                borderRadius: '8px' 
              }}
              onClick={() => navigate(action.route)}
            >
              <action.icon size={14} className="text-primary" /> {action.label}
            </button>
          ))}
        </div>

        {/* KPI INTELLIGENCE GRID */}
        <div className="row g-3">
          {[
            { label: 'TOTAL STUDENTS', value: stats?.kpis?.totalStudents, icon: Users, color: '#38bdf8', route: '/admin/users?role=Student' },
            { label: 'ACTIVE ALUMNI', value: stats?.kpis?.totalAlumni, icon: GraduationCap, color: '#c084fc', route: '/admin/alumni' },
            { label: 'LIVE OPPORTUNITIES', value: stats?.kpis?.totalJobs, icon: Briefcase, color: '#f59e0b', route: '/admin/db' },
            { label: 'TOTAL APPLICATIONS', value: stats?.kpis?.totalApplications, icon: TrendingUp, color: '#10b981', route: '/admin/db' },
            { label: 'ACTIVE ASSESSMENTS', value: stats?.kpis?.totalAssessments || 0, icon: Award, color: '#06b6d4', route: '/admin/assessments' },
            { label: 'PLACEMENT RATE', value: `${placementRate}%`, icon: CheckCircle, color: '#10b981', route: '/admin/pulse' },
            { label: 'SKILL READINESS', value: `${stats?.kpis?.skillReadiness || 0}%`, icon: Activity, color: '#6366f1', route: '/admin/pulse' },
            { label: 'PENDING ACTIONS', value: stats?.pendingActions?.reduce((acc, curr) => acc + curr.count, 0) || 0, icon: AlertCircle, color: '#ef4444', route: '/admin/users?status=Pending' }
          ].map((kpi, index) => (
            <div key={index} className="col-6 col-md-4 col-xl-3">
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: index * 0.04 }}
                className="premium-glass-panel p-3 h-100 position-relative overflow-hidden cursor-pointer d-flex flex-column hover-elevate transition-all"
                style={{ borderRadius: '12px', border: '1px solid var(--premium-border, rgba(255,255,255,0.08))' }}
                onClick={() => kpi.route && navigate(kpi.route)}
                title={`Click to view ${kpi.label}`}
              >
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <span className="fw-semibold text-muted text-uppercase" style={{ fontSize: '0.65rem', letterSpacing: '0.5px' }}>{kpi.label}</span>
                  <kpi.icon size={15} style={{ color: kpi.color }} />
                </div>
                <h3 className="fw-bold m-0 mt-auto" style={{ fontSize: '1.75rem', color: 'var(--premium-text-main, #ffffff)' }}>
                  {loading ? <StatSkeleton /> : (typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value || 0)}
                </h3>
              </motion.div>
            </div>
          ))}
        </div>

        {/* MIDDLE SECTION - CHARTS */}
        <div className="row g-4">
          
          {/* PLACEMENT INTELLIGENCE */}
          <div className="col-xl-8">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="premium-glass-panel p-4 h-100 d-flex flex-column" style={{ border: '1px solid var(--premium-border, rgba(255,255,255,0.08))' }}>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h6 className="mb-0 fw-bold d-flex align-items-center gap-2" style={{ color: 'var(--premium-text-main, #fff)' }}>
                  <TrendingUp size={16} className="text-primary" /> PLACEMENT INTELLIGENCE & TRAFFIC
                </h6>
                <span className="badge bg-secondary-subtle text-muted small">Real DB Aggregations</span>
              </div>

              {/* Area Chart */}
              <div style={{ height: '220px', marginBottom: '2rem' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trafficData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                    <Area type="monotone" dataKey="Total" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTotal)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Pipeline Visual */}
              <div className="row g-2 align-items-center mt-auto">
                {[
                  { label: 'Applied', val: pipeline.Applied, color: '#94a3b8' },
                  { label: 'Under Review', val: pipeline.Review, color: '#38bdf8' },
                  { label: 'Shortlisted', val: pipeline.Shortlisted, color: '#c084fc' },
                  { label: 'Interview', val: pipeline.Interview, color: '#f59e0b' },
                  { label: 'Selected', val: pipeline.Selected, color: '#10b981' }
                ].map((step, idx, arr) => (
                  <React.Fragment key={idx}>
                    <div className="col">
                      <div className="p-2 rounded-3 text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div className="small text-muted text-uppercase mb-1" style={{ fontSize: '0.65rem' }}>{step.label}</div>
                        <div className="fw-bold fs-5" style={{ color: step.val > 0 ? step.color : '#64748b' }}>
                          {loading ? '...' : (step.val || 0).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    {idx < arr.length - 1 && (
                      <div className="col-auto px-0 text-muted opacity-50"><ChevronRight size={14} /></div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </motion.div>
          </div>

          {/* CAREER TARGET ANALYTICS */}
          <div className="col-xl-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="premium-glass-panel p-4 h-100" style={{ border: '1px solid var(--premium-border, rgba(255,255,255,0.08))' }}>
              <h6 className="mb-4 fw-bold d-flex align-items-center gap-2" style={{ color: 'var(--premium-text-main, #fff)' }}>
                <Award size={16} className="text-warning" /> TOP CAREER TARGETS
              </h6>
              
              <div className="d-flex flex-column gap-3 mt-2">
                {careerTargetsData.length > 0 ? (
                  careerTargetsData.map((ct, idx) => (
                    <div key={idx}>
                      <div className="d-flex justify-content-between mb-1">
                        <span className="small text-white" style={{ color: 'var(--premium-text-main, #fff)' }}>{ct.name}</span>
                        <span className="small text-muted">{ct.count} students</span>
                      </div>
                      <div className="progress bg-dark" style={{ height: '6px' }}>
                        <div className="progress-bar rounded-pill" 
                             style={{ 
                               width: `${Math.min((ct.count / (stats?.kpis?.totalStudents || 1)) * 100, 100)}%`, 
                               background: COLORS[idx % COLORS.length] 
                             }}>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted small py-4">No student career target trends recorded yet</div>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* BOTTOM SECTION */}
        <div className="row g-4">
          
          {/* SYSTEM HEALTH */}
          <div className="col-md-4">
            <div className="premium-glass-panel p-4 h-100" style={{ border: '1px solid var(--premium-border, rgba(255,255,255,0.08))' }}>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h6 className="mb-0 fw-bold text-uppercase" style={{ fontSize: '0.75rem', color: 'var(--premium-text-main, #fff)' }}>System Engine Health</h6>
                <button className="btn btn-sm btn-link text-primary p-0 text-decoration-none small" onClick={() => navigate('/admin/health')}>
                  Details &rarr;
                </button>
              </div>
              <div className="d-flex flex-column gap-3">
                {[
                  { name: 'Backend API', status: stats?.systemHealth?.backend || 'Operational', icon: Server },
                  { name: 'MongoDB Database', status: stats?.systemHealth?.database || 'Operational', icon: Database },
                  { name: 'Authentication Engine', status: stats?.systemHealth?.auth || 'Operational', icon: ShieldAlert },
                  { name: 'AI Career Architect', status: 'Operational (Resilient)', icon: Cpu },
                ].map((sys, idx) => (
                  <div key={idx} className="d-flex justify-content-between align-items-center p-2 rounded" style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <div className="d-flex align-items-center gap-2">
                      <sys.icon size={14} className="text-muted" />
                      <span className="small" style={{ color: 'var(--premium-text-main, #fff)' }}>{sys.name}</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <div className="rounded-circle bg-success" style={{ width: '7px', height: '7px' }}></div>
                      <span className="small text-muted" style={{ fontSize: '0.75rem' }}>{sys.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ACTION CENTER */}
          <div className="col-md-4">
            <div className="premium-glass-panel p-4 h-100" style={{ border: '1px solid var(--premium-border, rgba(255,255,255,0.08))' }}>
              <h6 className="mb-4 fw-bold text-uppercase" style={{ fontSize: '0.75rem', color: 'var(--premium-text-main, #fff)' }}>Action Center</h6>
              <div className="d-flex flex-column gap-2">
                {stats?.pendingActions?.length > 0 ? (
                  stats.pendingActions.map((action, idx) => (
                    <div key={idx} className="p-3 rounded border border-warning border-opacity-25" style={{ background: 'rgba(245, 158, 11, 0.05)' }}>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div className="d-flex gap-2">
                          <AlertCircle size={16} className="text-warning mt-1" />
                          <div>
                            <div className="small fw-semibold" style={{ color: 'var(--premium-text-main, #fff)' }}>{action.title}</div>
                            <div className="text-warning fw-bold fs-4 lh-1 mt-1">{action.count}</div>
                          </div>
                        </div>
                        <button 
                          className="btn btn-sm btn-outline-warning" 
                          style={{ fontSize: '0.7rem' }}
                          onClick={() => navigate('/admin/users?status=Pending')}
                        >
                          Review
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted small py-4">All caught up. Zero pending approvals.</div>
                )}
              </div>
            </div>
          </div>

          {/* NEXORA INTELLIGENCE & ADVICE */}
          <div className="col-md-4">
            <div className="premium-glass-panel p-4 h-100" style={{ borderTop: '2px solid #a855f7', borderLeft: '1px solid var(--premium-border, rgba(255,255,255,0.08))', borderRight: '1px solid var(--premium-border, rgba(255,255,255,0.08))', borderBottom: '1px solid var(--premium-border, rgba(255,255,255,0.08))' }}>
              <h6 className="mb-4 fw-bold text-uppercase d-flex align-items-center gap-2" style={{ fontSize: '0.75rem', color: 'var(--premium-text-main, #fff)' }}>
                 NEXORA Strategic Telemetry
              </h6>
              <div className="d-flex flex-column gap-3">
                <div className="p-3 rounded" style={{ background: 'rgba(192, 132, 252, 0.1)' }}>
                  <p className="small m-0 lh-lg" style={{ color: 'var(--premium-text-main, #fff)' }}>
                    <strong style={{ color: '#c084fc' }}>Placement Demand:</strong> Currently, <span className="fw-bold">{stats?.careerTargets?.[0]?.count || 0} students</span> are targeting <span className="fw-bold">{stats?.careerTargets?.[0]?.name || stats?.careerTargets?.[0]?._id || 'Software Engineering'}</span>. 
                    Ensure verified job openings are synced.
                  </p>
                </div>
                <div className="p-3 rounded" style={{ background: 'rgba(52, 211, 153, 0.1)' }}>
                  <p className="small m-0 lh-lg" style={{ color: 'var(--premium-text-main, #fff)' }}>
                    <strong className="text-success">Pipeline Health:</strong> Conversion rate from application submission to verified selection stands at <span className="fw-bold">{placementRate}%</span>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM TABLES & AUDIT STREAM */}
        <div className="row g-4 mb-4">
          
          {/* RECENT REGISTRATIONS WITH DIRECT EDIT & VIEW */}
          <div className="col-lg-6">
            <div className="premium-glass-panel p-4 h-100" style={{ border: '1px solid var(--premium-border, rgba(255,255,255,0.08))' }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0 fw-bold text-uppercase" style={{ fontSize: '0.75rem', color: 'var(--premium-text-main, #fff)' }}>
                  Recent Registrations & Actions
                </h6>
                <button 
                  className="btn btn-sm btn-outline-primary py-0 px-2 small"
                  style={{ fontSize: '0.75rem' }}
                  onClick={() => navigate('/admin/users')}
                >
                  View All &rarr;
                </button>
              </div>

              <div className="table-responsive">
                <table className="table table-borderless align-middle m-0">
                  <tbody>
                    {stats?.recentRegistrations?.map((user, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td className="ps-0 py-2">
                          <div className="d-flex align-items-center gap-3">
                            <img 
                              src={getAvatarUrl(user.name, user.avatar)} 
                              alt={user.name} 
                              className="rounded-circle object-fit-cover" 
                              style={{ width: '34px', height: '34px', border: '1px solid rgba(255,255,255,0.1)' }} 
                            />
                            <div>
                              <div className="fw-semibold text-truncate" style={{ color: 'var(--premium-text-main, #fff)', fontSize: '0.85rem', maxWidth: '180px' }}>
                                {user.name}
                              </div>
                              <div className="small text-muted text-truncate" style={{ fontSize: '0.72rem', maxWidth: '180px' }}>
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-2 text-center">
                          <span className={`badge rounded-pill fw-medium ${
                            user.role === 'Student' ? 'bg-primary-subtle text-primary' :
                            user.role === 'Alumni' ? 'bg-info-subtle text-info' :
                            user.role === 'Admin' ? 'bg-danger-subtle text-danger' :
                            'bg-secondary-subtle text-light'
                          }`} style={{ fontSize: '0.68rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-2 text-end pe-0">
                          <div className="d-flex align-items-center justify-content-end gap-1">
                            <button 
                              className="btn btn-sm btn-outline-info py-1 px-2 d-flex align-items-center gap-1"
                              style={{ fontSize: '0.7rem' }}
                              title="Edit user profile in User Management"
                              onClick={() => navigate(`/admin/users?search=${encodeURIComponent(user.email || user.name)}`)}
                            >
                              <Edit3 size={12} /> Edit
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-secondary py-1 px-2 d-flex align-items-center gap-1"
                              style={{ fontSize: '0.7rem' }}
                              title="View full record"
                              onClick={() => navigate(`/admin/users?search=${encodeURIComponent(user.email || user.name)}`)}
                            >
                              <Eye size={12} /> View
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!stats?.recentRegistrations?.length && (
                      <tr><td colSpan="3" className="text-center text-muted py-4 small">No recent user registrations</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* LIVE AUDIT STREAM & LOGS */}
          <div className="col-lg-6">
            <div className="premium-glass-panel p-4 h-100" style={{ border: '1px solid var(--premium-border, rgba(255,255,255,0.08))' }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0 fw-bold text-uppercase d-flex align-items-center gap-2" style={{ fontSize: '0.75rem', color: 'var(--premium-text-main, #fff)' }}>
                  <ShieldCheck size={15} className="text-success" /> Live Audit Trail Stream
                </h6>
                <button 
                  className="btn btn-sm btn-outline-primary py-0 px-2 small"
                  style={{ fontSize: '0.75rem' }}
                  onClick={() => navigate('/admin/logs')}
                >
                  All Logs &rarr;
                </button>
              </div>

              <div className="d-flex flex-column gap-2" style={{ maxHeight: '360px', overflowY: 'auto' }}>
                {stats?.recentAuditActivity?.length > 0 ? (
                  stats.recentAuditActivity.map((log, idx) => (
                    <div 
                      key={idx} 
                      className="p-2 px-3 rounded d-flex justify-content-between align-items-center"
                      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
                    >
                      <div className="d-flex align-items-center gap-2">
                        <span className={`badge ${
                          log.status === 'SUCCESS' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'
                        } small px-2 py-0`} style={{ fontSize: '0.65rem' }}>
                          {log.status || 'LOG'}
                        </span>
                        <div>
                          <div className="fw-semibold text-white" style={{ fontSize: '0.8rem' }}>
                            {log.action}
                          </div>
                          <div className="text-muted text-truncate" style={{ fontSize: '0.7rem', maxWidth: '260px' }}>
                            {log.details || 'System event recorded'}
                          </div>
                        </div>
                      </div>
                      <div className="text-end">
                        <div className="small text-muted" style={{ fontSize: '0.68rem' }}>
                          {log.user || 'Admin'}
                        </div>
                        <div className="small text-secondary" style={{ fontSize: '0.65rem' }}>
                          {log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted small py-4">
                    Audit logger active. New operations will appear here in real time.
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
