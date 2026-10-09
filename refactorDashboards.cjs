const fs = require('fs');
const path = require('path');

const dashboards = [
  {
    path: 'apps/frontend/src/pages/recruiter/Dashboard.jsx',
    content: `import React, { useState, useEffect } from 'react';
import { Briefcase, Users, Zap, CheckCircle, Clock, Calendar, ArrowRight, UserCheck, XCircle } from 'lucide-react';
import KPIWidget from '../../widgets/KPIWidget';
import ChartWidget from '../../widgets/ChartWidget';
import { useToast } from '../../context/ToastContext';
import { recruiterService } from '../../services/api';

export default function RecruiterDashboard() {
  const { addToast } = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await recruiterService.getStats();
        setStats(res.data);
      } catch (error) {
        addToast('Failed to load dashboard data', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [addToast]);

  const pipelineData = stats?.pipeline?.labels?.map((label, i) => ({
    name: label,
    value: stats.pipeline.data[i]
  })) || [];

  const recentApplications = stats?.recentApplications || [];

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Under Review': return <span className="neon-badge bg-warning-subtle text-warning border-warning">REVIEW</span>;
      case 'Shortlisted': return <span className="neon-badge bg-primary-subtle text-primary border-primary">SHORTLIST</span>;
      case 'Interviewing': return <span className="neon-badge bg-info-subtle text-info border-info">INTERVIEW</span>;
      case 'Offered': return <span className="neon-badge bg-success-subtle text-success border-success">OFFERED</span>;
      case 'Rejected': return <span className="neon-badge bg-danger-subtle text-danger border-danger">REJECTED</span>;
      default: return <span className="neon-badge bg-secondary-subtle text-secondary border-secondary">{status || 'PENDING'}</span>;
    }
  };

  if (loading) return <div className="p-4 d-flex justify-content-center"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="p-4" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
        <div>
          <h1 className="fw-bold mb-2" style={{ fontSize: '2rem', color: 'var(--text)', letterSpacing: '-0.03em' }}>Recruitment Command Center</h1>
          <p className="fw-medium m-0" style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Monitor your talent pipeline and active drives.</p>
        </div>
        <div className="d-flex gap-2 align-items-center">
          <button className="btn fw-semibold rounded-2 d-flex align-items-center gap-2 transition-fast" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }} onClick={() => addToast('Opening Schedule Drive module...', 'info')}>
            <Calendar size={16} /> Schedule Drive
          </button>
          <button className="btn fw-semibold rounded-2 d-flex align-items-center gap-2 transition-fast" style={{ background: 'var(--text)', border: '1px solid var(--text)', color: 'var(--bg)' }} onClick={() => addToast('Opening Job Post builder...', 'info')}>
            <Briefcase size={16} /> Post Job
          </button>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <KPIWidget title="Total Candidates" value={stats?.kpis?.totalApplicants || 0} change="Overall" trend="up" icon={Users} colorClass="text-primary" />
        <KPIWidget title="Active Jobs" value={stats?.kpis?.activeJobs || 0} change="Current" trend="up" icon={Briefcase} colorClass="text-warning" />
        <KPIWidget title="AI Top Matches" value={stats?.kpis?.aiTopMatches || 0} change="> 80% Match" trend="up" icon={Zap} colorClass="text-pink" />
        <KPIWidget title="Interviews Today" value={stats?.kpis?.interviewsToday || 0} change="Scheduled" trend="up" icon={Clock} colorClass="text-secondary" />
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-8">
          <div className="bento-card transition-fast">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-semibold m-0" style={{ color: 'var(--text)' }}>Talent Pipeline Breakdown</h5>
            </div>
            {pipelineData.length > 0 ? (
              <ChartWidget data={pipelineData} xKey="name" yKey="value" height={300} color="var(--secondary)" />
            ) : (
              <div className="text-center text-muted p-5">No pipeline data available. Post a job to get started.</div>
            )}
          </div>
        </div>

        <div className="col-lg-4 d-flex flex-column gap-4">
          <div className="bento-card hover-glow position-relative overflow-hidden cursor-pointer" style={{ background: 'linear-gradient(135deg, rgba(var(--primary-rgb),0.1), transparent)', border: '1px solid var(--border)' }}>
            <div className="position-relative z-1">
              <div className="rounded-3 d-flex align-items-center justify-content-center mb-3 bg-primary-subtle" style={{ width: 48, height: 48 }}>
                <Zap size={24} className="text-primary" />
              </div>
              <h5 className="fw-bold mb-2" style={{ color: 'var(--text)' }}>Swipe to Hire</h5>
              <p className="fw-medium mb-4" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Discover top talent through our AI-curated matching interface.</p>
              <button className="btn w-100 fw-semibold rounded-2 transition-fast d-flex align-items-center justify-content-center gap-2" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }} onClick={() => addToast('Initializing AI Swiping Interface...', 'info')}>
                Start Swiping <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bento-card p-0 overflow-hidden">
        <div className="p-4 d-flex justify-content-between align-items-center flex-wrap gap-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <h5 className="fw-semibold mb-0" style={{ color: 'var(--text)' }}>Recent Applications</h5>
        </div>
        <div className="table-responsive">
          <table className="table table-borderless align-middle mb-0">
            <thead style={{ borderBottom: '1px solid var(--border)' }}>
              <tr>
                <th className="ps-4 py-3 text-uppercase tracking-wide" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Candidate</th>
                <th className="py-3 text-uppercase tracking-wide" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Applied Role</th>
                <th className="py-3 text-uppercase tracking-wide" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Status</th>
                <th className="py-3 text-uppercase tracking-wide" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>AI Match</th>
              </tr>
            </thead>
            <tbody>
              {recentApplications.map((app, i) => (
                <tr key={app.id || i} className="transition-fast" style={{ borderBottom: i !== recentApplications.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <td className="ps-4 py-3">
                    <span className="fw-semibold" style={{ color: 'var(--text)', fontSize: '0.9rem' }}>{app.name}</span>
                  </td>
                  <td className="py-3 fw-medium" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{app.role}</td>
                  <td className="py-3">{getStatusBadge(app.status)}</td>
                  <td className="py-3">
                    <span className="fw-bold" style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{app.matchScore}%</span>
                  </td>
                </tr>
              ))}
              {recentApplications.length === 0 && (
                <tr><td colSpan="4" className="text-center p-4 text-muted">No applications found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
`
  }
];

dashboards.forEach(d => {
  const fullPath = path.join(__dirname, d.path);
  fs.writeFileSync(fullPath, d.content, 'utf8');
  console.log('Processed:', d.path);
});
