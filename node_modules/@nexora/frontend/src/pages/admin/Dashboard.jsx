import React, { useState, useEffect } from "react";
import { useToast } from "../../context/ToastContext";
import { 
  Users, Briefcase, TrendingUp, Search, Activity, 
  UserPlus, Server, CheckCircle, Clock, Award, 
  AlertCircle, ChevronRight, UserCheck, GraduationCap, Building,
  FileText, LayoutDashboard, Database, ShieldAlert, Cpu
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, Area, AreaChart, PieChart, Pie, Cell,
  BarChart, Bar
} from "recharts";
import { adminService } from "../../services/api";

const COLORS = ["#818cf8", "#22d3ee", "#34d399", "#f472b6", "#fbbf24", "#c084fc"];

export default function AdminDashboard() {
  const { addToast } = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({ users: [], jobs: [] });
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminService.getStats();
        setStats(res.data);
      } catch (error) {
        console.error("Failed to fetch admin stats:", error);
        addToast("Failed to fetch dashboard intelligence", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 180000); 
    return () => clearInterval(interval);
  }, [addToast]);

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
    Total: (stats.traffic.studentData[i] || 0) + (stats.traffic.alumniData?.[i] || 0),
  })) || [];

  const pipeline = stats?.pipeline || { Applied: 0, Review: 0, Shortlisted: 0, Interview: 0, Selected: 0 };
  const maxPipeline = Math.max(pipeline.Applied, pipeline.Review, pipeline.Shortlisted, pipeline.Interview, pipeline.Selected, 1);
  const placementRate = pipeline.Applied > 0 ? ((pipeline.Selected / pipeline.Applied) * 100).toFixed(1) : 0;

  const careerTargetsData = stats?.careerTargets?.map(item => ({
    name: item._id,
    count: item.count
  })) || [];

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
            style={{ background: 'rgba(0,0,0,0.6)', zIndex: 9999, paddingTop: '10vh', backdropFilter: 'blur(4px)' }}
            onClick={() => setIsSearchOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: -20 }}
              className="premium-glass-panel overflow-hidden w-100"
              style={{ maxWidth: '600px' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="p-3 border-bottom border-secondary d-flex align-items-center gap-2">
                <Search size={20} className="text-muted" />
                <input 
                  type="text" 
                  className="form-control border-0 bg-transparent shadow-none text-white fs-5"
                  placeholder="Search students, jobs, applications..."
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="small text-muted border px-2 py-1 rounded">ESC</div>
              </div>
              <div className="p-2" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                {isSearching ? (
                  <div className="p-4 text-center text-muted">Searching...</div>
                ) : (
                  <>
                    {searchResults.users.length > 0 && (
                      <div className="mb-3">
                        <div className="small text-muted text-uppercase px-3 py-1 fw-bold">Students & Alumni</div>
                        {searchResults.users.map(u => (
                          <div key={u._id} className="d-flex align-items-center gap-3 p-2 mx-2 rounded hover-bg-subtle cursor-pointer transition-all" onClick={() => { window.location.href='/admin/users'; }}>
                            <div className="avatar rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                              {u.name.charAt(0)}
                            </div>
                            <div>
                              <div className="fw-semibold text-white">{u.name}</div>
                              <div className="small text-muted">{u.role}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {searchResults.jobs.length > 0 && (
                      <div className="mb-3">
                        <div className="small text-muted text-uppercase px-3 py-1 fw-bold">Opportunities</div>
                        {searchResults.jobs.map(j => (
                          <div key={j._id} className="d-flex align-items-center gap-3 p-2 mx-2 rounded hover-bg-subtle cursor-pointer transition-all">
                            <div className="avatar rounded bg-info text-white d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                              <Briefcase size={16} />
                            </div>
                            <div>
                              <div className="fw-semibold text-white">{j.title}</div>
                              <div className="small text-muted">{j.company}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {searchQuery.length > 1 && searchResults.users.length === 0 && searchResults.jobs.length === 0 && (
                      <div className="p-4 text-center text-muted">No results found for "{searchQuery}"</div>
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
            <h3 className="fw-bold mb-1" style={{ color: 'var(--premium-text-main)' }}>Good morning, Admin</h3>
            <p className="text-muted mb-0 small">Monitor student success, recruitment activity and career intelligence from one place.</p>
          </div>
          <div className="d-flex gap-2 mt-3 mt-md-0">
            <button className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-2" onClick={() => window.location.reload()}>
              <Activity size={14} /> Refresh
            </button>
            <button className="btn btn-sm btn-primary d-flex align-items-center gap-2">
              <FileText size={14} /> Export Report
            </button>
          </div>
        </div>

        {/* QUICK ACTIONS ROW */}
        <div className="d-flex gap-2 overflow-auto pb-2" style={{ scrollbarWidth: 'none' }}>
          {[
            { label: 'Add Student', icon: UserPlus, action: () => window.location.href = '/admin/users' },
            { label: 'Invite Alumni', icon: GraduationCap, action: () => window.location.href = '/admin/alumni' },
            { label: 'Create Opportunity', icon: Briefcase, action: () => {} },
            { label: 'Create Assessment', icon: Award, action: () => window.location.href = '/admin/assessments' },
            { label: 'View Applications', icon: FileText, action: () => {} },
          ].map((action, i) => (
            <button key={i} className="btn btn-sm px-3 py-2 d-flex align-items-center gap-2" 
                    style={{ background: 'var(--premium-surface)', border: '1px solid var(--premium-border)', color: 'var(--premium-text-main)', whiteSpace: 'nowrap', borderRadius: '8px' }}
                    onClick={action.action}>
              <action.icon size={14} className="text-primary" /> {action.label}
            </button>
          ))}
        </div>

        {/* KPI INTELLIGENCE GRID */}
        <div className="row g-3">
          {[
            { label: 'TOTAL STUDENTS', value: stats?.kpis?.totalStudents, icon: Users, color: 'var(--premium-neon-blue)' },
            { label: 'ACTIVE ALUMNI', value: stats?.kpis?.totalAlumni, icon: GraduationCap, color: 'var(--premium-neon-purple)' },
            { label: 'LIVE OPPORTUNITIES', value: stats?.kpis?.totalJobs, icon: Briefcase, color: 'var(--premium-warning)' },
            { label: 'TOTAL APPLICATIONS', value: stats?.kpis?.totalApplications, icon: TrendingUp, color: 'var(--premium-success)' },
            { label: 'ACTIVE ASSESSMENTS', value: stats?.kpis?.totalAssessments || 0, icon: Award, color: 'var(--premium-info)' },
            { label: 'PLACEMENT RATE', value: `${placementRate}%`, icon: CheckCircle, color: 'var(--premium-success)' },
            { label: 'SKILL READINESS', value: `${stats?.kpis?.skillReadiness || 0}%`, icon: Activity, color: 'var(--premium-primary)' },
            { label: 'PENDING ACTIONS', value: stats?.pendingActions?.reduce((acc, curr) => acc + curr.count, 0) || 0, icon: AlertCircle, color: 'var(--premium-danger)' }
          ].map((kpi, index) => (
            <div key={index} className="col-6 col-md-4 col-xl-3">
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
                className="premium-glass-panel p-3 h-100 position-relative overflow-hidden cursor-pointer d-flex flex-column"
                style={{ borderRadius: '12px' }}
              >
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <span className="fw-semibold text-muted text-uppercase" style={{ fontSize: '0.65rem', letterSpacing: '0.5px' }}>{kpi.label}</span>
                  <kpi.icon size={14} style={{ color: kpi.color }} />
                </div>
                <h3 className="fw-bold m-0 mt-auto" style={{ fontSize: '1.75rem', color: 'var(--premium-text-main)' }}>
                  {loading ? <StatSkeleton /> : kpi.value?.toLocaleString()}
                </h3>
              </motion.div>
            </div>
          ))}
        </div>

        {/* MIDDLE SECTION - CHARTS */}
        <div className="row g-4">
          
          {/* PLACEMENT INTELLIGENCE */}
          <div className="col-xl-8">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="premium-glass-panel p-4 h-100 d-flex flex-column">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h6 className="mb-0 fw-bold d-flex align-items-center gap-2" style={{ color: 'var(--premium-text-main)' }}>
                  <TrendingUp size={16} className="text-primary" /> PLACEMENT INTELLIGENCE
                </h6>
                <select className="form-select form-select-sm w-auto bg-transparent text-muted border-secondary shadow-none">
                  <option>14 Days</option>
                  <option>30 Days</option>
                </select>
              </div>

              {/* Area Chart */}
              <div style={{ height: '220px', marginBottom: '2rem' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trafficData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--premium-primary)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--premium-primary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="name" stroke="var(--premium-text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--premium-text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                    <RechartsTooltip contentStyle={{ backgroundColor: 'var(--premium-surface-solid)', border: '1px solid var(--premium-border)', borderRadius: '8px' }} />
                    <Area type="monotone" dataKey="Total" stroke="var(--premium-primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Pipeline Visual */}
              <div className="row g-2 align-items-center mt-auto">
                {[
                  { label: 'Applied', val: pipeline.Applied, color: 'var(--premium-text-muted)' },
                  { label: 'Under Review', val: pipeline.Review, color: 'var(--premium-info)' },
                  { label: 'Shortlisted', val: pipeline.Shortlisted, color: 'var(--premium-neon-purple)' },
                  { label: 'Interview', val: pipeline.Interview, color: 'var(--premium-warning)' },
                  { label: 'Selected', val: pipeline.Selected, color: 'var(--premium-success)' }
                ].map((step, idx, arr) => (
                  <React.Fragment key={idx}>
                    <div className="col">
                      <div className="p-2 rounded-3 text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div className="small text-muted text-uppercase mb-1" style={{ fontSize: '0.65rem' }}>{step.label}</div>
                        <div className="fw-bold fs-5" style={{ color: step.val > 0 ? step.color : 'var(--premium-text-muted)' }}>
                          {loading ? '...' : step.val.toLocaleString()}
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="premium-glass-panel p-4 h-100">
              <h6 className="mb-4 fw-bold d-flex align-items-center gap-2" style={{ color: 'var(--premium-text-main)' }}>
                <Award size={16} className="text-warning" /> TOP CAREER TARGETS
              </h6>
              
              <div className="d-flex flex-column gap-3 mt-2">
                {careerTargetsData.length > 0 ? (
                  careerTargetsData.map((ct, idx) => (
                    <div key={idx}>
                      <div className="d-flex justify-content-between mb-1">
                        <span className="small text-white" style={{ color: 'var(--premium-text-main)' }}>{ct.name}</span>
                        <span className="small text-muted">{ct.count}</span>
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
                  <div className="text-center text-muted small py-4">No career target data available</div>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* BOTTOM SECTION */}
        <div className="row g-4">
          
          {/* SYSTEM HEALTH */}
          <div className="col-md-4">
            <div className="premium-glass-panel p-4 h-100">
              <h6 className="mb-4 fw-bold text-uppercase" style={{ fontSize: '0.75rem', color: 'var(--premium-text-main)' }}>System Health</h6>
              <div className="d-flex flex-column gap-3">
                {[
                  { name: 'Backend API', status: stats?.systemHealth?.backend || 'Checking...', icon: Server },
                  { name: 'MongoDB', status: stats?.systemHealth?.database || 'Checking...', icon: Database },
                  { name: 'Authentication', status: stats?.systemHealth?.auth || 'Checking...', icon: ShieldAlert },
                  { name: 'AI Service', status: 'Configured', icon: Cpu },
                ].map((sys, idx) => (
                  <div key={idx} className="d-flex justify-content-between align-items-center p-2 rounded" style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <div className="d-flex align-items-center gap-2">
                      <sys.icon size={14} className="text-muted" />
                      <span className="small" style={{ color: 'var(--premium-text-main)' }}>{sys.name}</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <div className={`rounded-circle ${sys.status === 'Operational' || sys.status === 'Configured' ? 'bg-success' : 'bg-danger'}`} style={{ width: '6px', height: '6px' }}></div>
                      <span className="small text-muted" style={{ fontSize: '0.7rem' }}>{sys.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ACTION CENTER */}
          <div className="col-md-4">
            <div className="premium-glass-panel p-4 h-100">
              <h6 className="mb-4 fw-bold text-uppercase" style={{ fontSize: '0.75rem', color: 'var(--premium-text-main)' }}>Action Center</h6>
              <div className="d-flex flex-column gap-2">
                {stats?.pendingActions?.length > 0 ? (
                  stats.pendingActions.map((action, idx) => (
                    <div key={idx} className="p-3 rounded border border-warning border-opacity-25" style={{ background: 'rgba(245, 158, 11, 0.05)' }}>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div className="d-flex gap-2">
                          <AlertCircle size={16} className="text-warning mt-1" />
                          <div>
                            <div className="small fw-semibold" style={{ color: 'var(--premium-text-main)' }}>{action.title}</div>
                            <div className="text-warning fw-bold fs-4 lh-1 mt-1">{action.count}</div>
                          </div>
                        </div>
                        <button className="btn btn-sm btn-outline-warning" style={{ fontSize: '0.7rem' }}>Review</button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted small py-4">All caught up. No pending actions.</div>
                )}
              </div>
            </div>
          </div>

          {/* NEXORA INTELLIGENCE */}
          <div className="col-md-4">
            <div className="premium-glass-panel p-4 h-100" style={{ borderTop: '2px solid var(--premium-neon-purple)' }}>
              <h6 className="mb-4 fw-bold text-uppercase d-flex align-items-center gap-2" style={{ fontSize: '0.75rem', color: 'var(--premium-text-main)' }}>
                 NEXORA Intelligence
              </h6>
              <div className="d-flex flex-column gap-3">
                <div className="p-3 rounded" style={{ background: 'rgba(192, 132, 252, 0.1)' }}>
                  <p className="small m-0 lh-lg" style={{ color: 'var(--premium-text-main)' }}>
                    <strong style={{ color: 'var(--premium-neon-purple)' }}>Insight:</strong> Currently, <span className="fw-bold">{stats?.careerTargets?.[0]?.count || 0} students</span> are targeting <span className="fw-bold">{stats?.careerTargets?.[0]?.name || 'a top role'}</span>. 
                    Ensure sufficient opportunities are posted to meet demand.
                  </p>
                </div>
                <div className="p-3 rounded" style={{ background: 'rgba(52, 211, 153, 0.1)' }}>
                  <p className="small m-0 lh-lg" style={{ color: 'var(--premium-text-main)' }}>
                    <strong className="text-success">System:</strong> Ecosystem engagement is stable. Placement pipeline conversion from Interview to Selected is currently <span className="fw-bold">{placementRate}%</span>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM TABLES */}
        <div className="row g-4 mb-4">
          <div className="col-lg-6">
            <div className="premium-glass-panel p-4 h-100">
              <h6 className="mb-4 fw-bold text-uppercase" style={{ fontSize: '0.75rem', color: 'var(--premium-text-main)' }}>Recent Registrations</h6>
              <div className="table-responsive">
                <table className="table table-borderless align-middle m-0">
                  <tbody>
                    {stats?.recentRegistrations?.map((user, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td className="ps-0 py-3">
                          <div className="d-flex align-items-center gap-3">
                            <div className="avatar rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                              {user.name.charAt(0)}
                            </div>
                            <div>
                              <div className="fw-semibold" style={{ color: 'var(--premium-text-main)', fontSize: '0.85rem' }}>{user.name}</div>
                              <div className="small text-muted" style={{ fontSize: '0.7rem' }}>{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 text-end pe-0">
                          <span className="badge rounded-pill bg-dark-subtle text-muted fw-medium" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                            {user.role}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {!stats?.recentRegistrations?.length && (
                      <tr><td colSpan="2" className="text-center text-muted py-4 small">No recent registrations</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="premium-glass-panel p-4 h-100">
              <h6 className="mb-4 fw-bold text-uppercase" style={{ fontSize: '0.75rem', color: 'var(--premium-text-main)' }}>Recent Opportunities</h6>
              <div className="table-responsive">
                <table className="table table-borderless align-middle m-0">
                  <tbody>
                    {stats?.recentOpportunities?.map((job, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td className="ps-0 py-3">
                          <div className="d-flex align-items-center gap-3">
                            <div className="avatar rounded bg-info text-white d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                              <Briefcase size={16} />
                            </div>
                            <div>
                              <div className="fw-semibold" style={{ color: 'var(--premium-text-main)', fontSize: '0.85rem' }}>{job.title}</div>
                              <div className="small text-muted" style={{ fontSize: '0.7rem' }}>{job.company}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 text-end pe-0">
                          <span className={`badge rounded-pill fw-medium ${job.status === 'Active' || job.status === 'Published' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'}`} style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                            {job.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {!stats?.recentOpportunities?.length && (
                      <tr><td colSpan="2" className="text-center text-muted py-4 small">No recent opportunities</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
