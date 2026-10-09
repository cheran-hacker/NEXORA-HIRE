const fs = require('fs');
const path = require('path');

const dashboards = [
  {
    path: 'apps/frontend/src/pages/faculty/Dashboard.jsx',
    content: `import React, { useState, useEffect } from 'react';
import { BookOpen, Users, FileText, Award, Calendar, CheckCircle, ArrowRight, Book, Activity } from 'lucide-react';
import KPIWidget from '../../widgets/KPIWidget';
import ChartWidget from '../../widgets/ChartWidget';
import { useToast } from '../../context/ToastContext';
import { facultyService } from '../../services/api';

export default function FacultyDashboard() {
  const { addToast } = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await facultyService.getStats();
        setStats(res.data);
      } catch (error) {
        addToast('Failed to load dashboard data', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [addToast]);

  const classesData = stats?.classesData || [];
  const assignments = stats?.assignments || [];

  if (loading) return <div className="p-4 d-flex justify-content-center"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="p-4" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
        <div>
          <h1 className="fw-bold mb-2" style={{ fontSize: '2rem', color: 'var(--text)', letterSpacing: '-0.03em' }}>Faculty Command Center</h1>
          <p className="fw-medium m-0" style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Manage your courses, evaluations, and research.</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn fw-semibold rounded-2 d-flex align-items-center gap-2" style={{ background: 'var(--text)', color: 'var(--bg)' }}>
            <FileText size={16} /> New Assignment
          </button>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <KPIWidget title="Active Courses" value={stats?.kpis?.activeCourses || 0} change="This semester" trend="up" icon={BookOpen} colorClass="text-primary" />
        <KPIWidget title="Total Students" value={stats?.kpis?.totalStudents || 0} change="Across all courses" trend="up" icon={Users} colorClass="text-warning" />
        <KPIWidget title="Pending Evaluations" value={stats?.kpis?.pendingEvaluations || 0} change="Needs review" trend="down" icon={CheckCircle} colorClass="text-danger" />
        <KPIWidget title="Research Publications" value={stats?.kpis?.publications || 0} change="Current year" trend="up" icon={Award} colorClass="text-secondary" />
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-8">
          <div className="bento-card">
            <h5 className="fw-semibold mb-4" style={{ color: 'var(--text)' }}>Student Attendance Trend</h5>
            {classesData.length > 0 ? (
              <ChartWidget data={classesData} xKey="name" yKey="value" height={300} color="var(--primary)" />
            ) : (
              <div className="text-center p-5 text-muted">No attendance data available.</div>
            )}
          </div>
        </div>

        <div className="col-lg-4">
          <div className="bento-card">
            <h5 className="fw-semibold mb-4" style={{ color: 'var(--text)' }}>Pending Assignments</h5>
            <div className="d-flex flex-column gap-3">
              {assignments.map((item, i) => (
                <div key={i} className="d-flex align-items-center justify-content-between p-3 rounded-3" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                  <div>
                    <h6 className="fw-bold mb-1" style={{ color: 'var(--text)' }}>{item.title}</h6>
                    <small style={{ color: 'var(--text-muted)' }}>{item.course}</small>
                  </div>
                  <div className="text-end">
                    <span className="badge bg-warning text-dark mb-1">{item.submitted} Submitted</span>
                    <br />
                    <small className="text-danger">Due: {item.dueDate}</small>
                  </div>
                </div>
              ))}
              {assignments.length === 0 && <div className="text-center p-3 text-muted">No pending assignments.</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
`
  },
  {
    path: 'apps/frontend/src/pages/placement/Dashboard.jsx',
    content: `import React, { useState, useEffect } from 'react';
import { Briefcase, Users, TrendingUp, Building, ArrowRight, Activity, CheckCircle, Clock } from 'lucide-react';
import KPIWidget from '../../widgets/KPIWidget';
import ChartWidget from '../../widgets/ChartWidget';
import { useToast } from '../../context/ToastContext';
import { placementService } from '../../services/api';

export default function PlacementDashboard() {
  const { addToast } = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await placementService.getStats();
        setStats(res.data);
      } catch (error) {
        addToast('Failed to load dashboard data', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [addToast]);

  const placementTrend = stats?.placementTrend || [];
  const upcomingDrives = stats?.upcomingDrives || [];

  if (loading) return <div className="p-4 d-flex justify-content-center"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="p-4" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
        <div>
          <h1 className="fw-bold mb-2" style={{ fontSize: '2rem', color: 'var(--text)', letterSpacing: '-0.03em' }}>Placement Command Center</h1>
          <p className="fw-medium m-0" style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Manage campus drives, student readiness, and industry relations.</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn fw-semibold rounded-2 d-flex align-items-center gap-2" style={{ background: 'var(--text)', color: 'var(--bg)' }}>
            <Building size={16} /> New Drive
          </button>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <KPIWidget title="Total Placed" value={stats?.kpis?.totalPlaced || 0} change="This academic year" trend="up" icon={CheckCircle} colorClass="text-success" />
        <KPIWidget title="Active Drives" value={stats?.kpis?.activeDrives || 0} change="Ongoing campus recruitment" trend="up" icon={Building} colorClass="text-primary" />
        <KPIWidget title="Eligible Students" value={stats?.kpis?.eligibleStudents || 0} change="Ready for placement" trend="up" icon={Users} colorClass="text-info" />
        <KPIWidget title="Avg. Package" value={stats?.kpis?.avgPackage || '₹0 LPA'} change="CTC trend" trend="up" icon={TrendingUp} colorClass="text-warning" />
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-8">
          <div className="bento-card">
            <h5 className="fw-semibold mb-4" style={{ color: 'var(--text)' }}>Placement Year-over-Year Trend</h5>
            {placementTrend.length > 0 ? (
              <ChartWidget data={placementTrend} xKey="year" yKey="placed" height={300} color="var(--success)" />
            ) : (
              <div className="text-center p-5 text-muted">No placement trend data available.</div>
            )}
          </div>
        </div>

        <div className="col-lg-4">
          <div className="bento-card">
            <h5 className="fw-semibold mb-4" style={{ color: 'var(--text)' }}>Upcoming Company Drives</h5>
            <div className="d-flex flex-column gap-3">
              {upcomingDrives.map((drive, i) => (
                <div key={i} className="d-flex align-items-center justify-content-between p-3 rounded-3" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                  <div>
                    <h6 className="fw-bold mb-1" style={{ color: 'var(--text)' }}>{drive.company}</h6>
                    <small style={{ color: 'var(--text-muted)' }}>Role: {drive.role}</small>
                  </div>
                  <div className="text-end">
                    <span className="badge bg-primary-subtle text-primary border border-primary mb-1">{drive.date}</span>
                  </div>
                </div>
              ))}
              {upcomingDrives.length === 0 && <div className="text-center p-3 text-muted">No upcoming drives scheduled.</div>}
            </div>
          </div>
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
