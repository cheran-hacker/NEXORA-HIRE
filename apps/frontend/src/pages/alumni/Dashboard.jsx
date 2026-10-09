import React, { useState, useEffect } from "react";
import { useToast } from "../../context/ToastContext";
import {
  Award,
  Users,
  HeartHandshake,
  TrendingUp,
  Briefcase,
  Search,
  Calendar,
  Sparkles,
  ArrowRight,
  Zap
} from "lucide-react";
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
import { alumniService } from "../../services/api";
import QuickContributionWidget from "../../components/alumni/QuickContributionWidget.jsx";
import ShareOpportunityWidget from "../../components/alumni/ShareOpportunityWidget.jsx";
import RecommendedStudentsWidget from "../../components/alumni/RecommendedStudentsWidget.jsx";

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 12 } }
};

export default function AlumniDashboard() {
  const { addToast } = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await alumniService.getStats();
        setStats(res.data);
      } catch (error) {
        console.error("Failed to fetch alumni stats:", error);
        addToast("Failed to fetch dashboard data", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [addToast]);

  const chartData = stats?.impactMetrics?.labels?.length > 0
    ? stats.impactMetrics.labels.map((label, i) => ({
        name: label,
        value: stats.impactMetrics.data[i] || 0,
      }))
    : [];

  return (
    <div className="container-fluid py-4 px-xl-5 position-relative overflow-hidden" style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>
      {/* Ambient Background Orbs */}
      <div className="position-absolute rounded-circle blur-3xl" style={{ width: '40vw', height: '40vw', top: '-10%', left: '-10%', background: 'radial-gradient(circle, rgba(147,51,234,0.15) 0%, rgba(0,0,0,0) 70%)', zIndex: 0 }} />
      <div className="position-absolute rounded-circle blur-3xl" style={{ width: '30vw', height: '30vw', bottom: '-5%', right: '-5%', background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, rgba(0,0,0,0) 70%)', zIndex: 0 }} />

      <motion.div 
        className="d-flex flex-column gap-4 mx-auto position-relative z-1" 
        style={{ maxWidth: "1500px" }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Top Header & Search */}
        <motion.div variants={itemVariants} className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-2 p-4 rounded-4 premium-glass-panel" style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
          <div>
            <h2 className="fw-bold mb-1 d-flex align-items-center gap-2" style={{ color: 'var(--text)', letterSpacing: '-0.02em' }}>
              Welcome back, <span className="text-gradient-purple">{stats?.profileSummary?.name || 'Alumni'}</span> <Sparkles size={24} className="text-warning" />
            </h2>
            <p className="mb-0 text-muted" style={{ fontSize: '1.05rem' }}>Your Alumni Network Hub. See your impact and connect.</p>
          </div>

          <div className="position-relative w-100" style={{ maxWidth: '350px' }}>
            <div className="position-absolute top-50 translate-middle-y ms-3" style={{ color: 'var(--text-muted)' }}>
              <Search size={18} />
            </div>
            <input 
              type="text" 
              className="form-control premium-input shadow-none ps-5 py-2 rounded-pill" 
              placeholder="Search alumni, jobs, or bounties..." 
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text)' }}
            />
          </div>
        </motion.div>

        {/* Action Widgets */}
        <motion.div variants={itemVariants} className="row mb-2 g-4">
          <div className="col-lg-6">
            <motion.div whileHover={{ scale: 1.01 }} className="h-100">
              <QuickContributionWidget />
            </motion.div>
          </div>
          <div className="col-lg-6">
            <motion.div whileHover={{ scale: 1.01 }} className="h-100">
              <ShareOpportunityWidget />
            </motion.div>
          </div>
        </motion.div>

        {/* Metric Row */}
        <motion.div variants={itemVariants} className="row g-4">
          {[
            { title: "Student Requests", value: stats?.kpis?.studentRequests || 0, subtitle: "Pending", icon: Users, color: "147, 51, 234" },
            { title: "Active Mentorships", value: stats?.kpis?.activeMentorships || 0, subtitle: "Current", icon: Briefcase, color: "234, 179, 8" },
            { title: "Connections", value: stats?.kpis?.connections || 0, subtitle: "Total Network", icon: HeartHandshake, color: "59, 130, 246" },
            { title: "Referrals", value: stats?.kpis?.referrals || 0, subtitle: "Opportunities Given", icon: Award, color: "34, 197, 94" },
          ].map((metric, idx) => (
            <div className="col-md-6 col-xl-3" key={idx}>
              <motion.div 
                whileHover={{ y: -8, boxShadow: `0 20px 40px -15px rgba(${metric.color}, 0.2)` }} 
                className="premium-glass-panel h-100 p-4 rounded-4 position-relative overflow-hidden"
                style={{ border: `1px solid rgba(${metric.color}, 0.2)` }}
              >
                <div className="position-absolute top-0 end-0 p-3 opacity-25">
                  <metric.icon size={80} style={{ color: `rgb(${metric.color})`, transform: 'rotate(-15deg) translate(20px, -20px)' }} />
                </div>
                
                <div className="d-flex flex-column h-100 position-relative z-1">
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 44, height: 44, background: `rgba(${metric.color}, 0.1)`, color: `rgb(${metric.color})` }}>
                      <metric.icon size={22} />
                    </div>
                    <span className="fw-semibold text-muted text-uppercase" style={{ fontSize: '0.8rem', letterSpacing: '0.05em' }}>{metric.title}</span>
                  </div>
                  
                  <div className="mt-auto">
                    <div className="d-flex align-items-baseline gap-2">
                      <h2 className="fw-bolder mb-0" style={{ fontSize: '2.5rem', color: 'var(--text)' }}>
                        {loading ? "..." : metric.value}
                      </h2>
                    </div>
                    <span className="badge rounded-pill mt-2 fw-medium" style={{ background: `rgba(${metric.color}, 0.1)`, color: `rgb(${metric.color})`, padding: '0.35em 0.8em' }}>
                      <TrendingUp size={12} className="me-1" /> {metric.subtitle}
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          ))}
        </motion.div>

        <motion.div variants={itemVariants} className="row g-4 mt-1">
          {/* Main Chart */}
          <div className="col-lg-8">
            <div className="premium-glass-panel p-4 h-100 rounded-4">
              <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom" style={{ borderColor: 'rgba(255,255,255,0.05) !important' }}>
                <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
                  <TrendingUp className="text-primary" /> Network Engagement
                </h5>
                <select className="form-select form-select-sm w-auto fw-semibold rounded-pill px-3 cursor-pointer" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <option>This Week</option> 
                  <option>This Month</option>
                  <option>This Year</option>
                </select>
              </div>

              <motion.div 
                whileHover={{ scale: 1.01 }}
                className="p-5 mb-4 rounded-4 position-relative overflow-hidden cursor-pointer shadow-sm d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-4" 
                style={{ background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.2) 0%, rgba(59, 130, 246, 0.1) 100%)', border: '1px solid rgba(147, 51, 234, 0.3)' }}
              >
                <div className="position-absolute end-0 top-0 h-100 w-50" style={{ background: 'linear-gradient(90deg, transparent, rgba(147,51,234,0.1))', pointerEvents: 'none' }} />
                
                <div className="d-flex align-items-center gap-4 position-relative z-1">
                  <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 shadow-lg" style={{ width: 70, height: 70, background: 'linear-gradient(135deg, #9333ea, #3b82f6)', color: 'white' }}>
                    <Sparkles size={32} />
                  </div>
                  <div>
                    <h3 className="fw-bolder mb-1 text-white" style={{ letterSpacing: '-0.02em' }}>Make a Difference</h3>
                    <p className="mb-0 text-muted fs-5" style={{ lineHeight: '1.4' }}>
                      Your experience can shape a student's future.
                    </p>
                  </div>
                </div>

                <div className="position-relative z-1">
                  <a href="/alumni/students" className="btn btn-primary rounded-pill px-5 py-3 fw-bold d-flex align-items-center gap-2" style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', border: 'none', whiteSpace: 'nowrap', boxShadow: '0 10px 25px -5px rgba(59,130,246,0.5)' }}>
                    View Student Matches <ArrowRight size={18} />
                  </a>
                </div>
              </motion.div>

              {chartData.length > 0 ? (
                <div style={{ height: '350px', width: '100%', position: 'relative' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.6}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                      <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', color: 'white' }}
                        itemStyle={{ color: '#e2e8f0', fontWeight: 'bold' }}
                      />
                      <Area type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={4} fillOpacity={1} fill="url(#colorTotal)" activeDot={{ r: 8, strokeWidth: 0, fill: '#60a5fa' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="d-flex flex-column align-items-center justify-content-center text-muted" style={{ height: '350px' }}>
                  <TrendingUp size={48} className="mb-3 opacity-25" />
                  <p className="fw-medium">No engagement data available for this period.</p>
                </div>
              )}
            </div>
          </div>

          {/* Pending Requests */}
          <div className="col-lg-4">
            <div className="premium-glass-panel p-4 h-100 d-flex flex-column rounded-4 position-relative overflow-hidden">
              <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom" style={{ borderColor: 'rgba(255,255,255,0.05) !important' }}>
                <h5 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ color: "var(--text)" }}>
                  <Users className="text-warning" /> Pending Requests
                </h5>
                <a href="/alumni/connections" className="badge bg-secondary bg-opacity-25 rounded-pill text-muted px-3 py-2 text-decoration-none hover-glow">View All</a>
              </div>
              
              <div className="d-flex flex-column gap-3 overflow-auto custom-scrollbar" style={{ maxHeight: '430px', paddingRight: '5px' }}>
                {stats?.pendingRequests?.length > 0 ? (
                  stats.pendingRequests.map((req, idx) => (
                    <motion.div
                      key={req._id || idx}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="d-flex flex-column gap-3 p-3 rounded-4 shadow-sm"
                      style={{
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      <div className="d-flex gap-3 align-items-start">
                        <img 
                          src={req.student?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(req.student?.name || 'St')}`} 
                          alt="Student Avatar" 
                          className="rounded-circle border" 
                          style={{ width: 42, height: 42, borderColor: 'rgba(255,255,255,0.1)' }} 
                        />
                        <div className="flex-grow-1">
                          <h6 className="fw-bold mb-1 text-truncate" style={{ color: "var(--text)", fontSize: '0.95rem' }}>{req.student?.name}</h6>
                          <div className="d-flex flex-column text-muted small lh-sm">
                            <span>{req.student?.year} • {req.student?.department}</span>
                            <span className="mt-1 opacity-75">Target: {req.student?.targetRole}</span>
                          </div>
                        </div>
                        <span className="badge rounded-pill fw-medium" style={{ fontSize: "0.7rem", background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>
                          {new Date(req.time).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      
                      <p className="mb-0 text-muted small fst-italic" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        "{req.message}"
                      </p>

                      <div className="d-flex gap-2 mt-1">
                        <button className="btn btn-sm btn-success fw-bold flex-grow-1 rounded-pill" style={{ fontSize: '0.8rem' }}>Accept</button>
                        <button className="btn btn-sm btn-outline-danger fw-bold flex-grow-1 rounded-pill" style={{ fontSize: '0.8rem' }}>Reject</button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center p-5 rounded-4 h-100 d-flex flex-column align-items-center justify-content-center" style={{ border: "1px dashed rgba(255,255,255,0.1)", background: 'rgba(255,255,255,0.01)' }}>
                    <Users size={40} className="text-muted mb-3 opacity-25" />
                    <h6 className="fw-bold text-muted mb-1">You're all caught up!</h6>
                    <p className="text-muted small mb-0">No pending requests.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Recommended Students */}
        <motion.div variants={itemVariants} className="mt-2">
          <RecommendedStudentsWidget />
        </motion.div>
      </motion.div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.02);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.2);
        }
        .alumni-hover-text:hover {
          color: var(--text) !important;
        }
        .text-gradient-purple {
          background: linear-gradient(135deg, #d8b4fe 0%, #c084fc 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          display: inline-block;
        }
      `}</style>
    </div>
  );
}
