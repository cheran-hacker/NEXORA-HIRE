import React, { useState, useEffect } from 'react';
import { Route, MapPin, Briefcase } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function TrajectoryVisualizer() {
  const { addToast } = useToast();
  const [trajectories, setTrajectories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrajectories = async () => {
      try {
        const res = await api.get('/alumni/trajectory-match');
        setTrajectories(res.data.data || []);
      } catch (err) {
        addToast("Failed to load trajectory data", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchTrajectories();
  }, []);

  if (loading) return <div className="p-3 text-center"><div className="spinner-border text-primary"></div></div>;

  if (trajectories.length === 0) {
    return (
      <div className="bento-card p-4 text-center">
        <Route size={48} className="text-muted mb-3 mx-auto" />
        <h5 className="fw-bold">No Trajectory Data Yet</h5>
        <p className="text-muted small">More alumni career data is needed to identify patterns similar to your profile.</p>
      </div>
    );
  }

  return (
    <div className="bento-card p-4">
      <div className="d-flex align-items-center gap-3 mb-4">
        <div className="bg-primary bg-opacity-10 p-3 rounded-circle text-primary">
          <Route size={24} />
        </div>
        <div>
          <h4 className="fw-black mb-1">Similar Observed Alumni Trajectory</h4>
          <p className="text-muted small mb-0">Based on students with your skills who graduated 3+ years ago.</p>
        </div>
      </div>

      <div className="position-relative ps-4 ms-2" style={{ borderLeft: '2px dashed var(--border)' }}>
        {trajectories[0].careerHistory?.map((history, idx) => (
          <div key={idx} className="mb-4 position-relative">
            <div className="position-absolute bg-primary rounded-circle" style={{ width: '12px', height: '12px', left: '-27px', top: '5px' }}></div>
            <h5 className="fw-bold mb-1 d-flex align-items-center gap-2">
              <Briefcase size={16} className="text-primary" /> {history.role}
            </h5>
            <div className="text-muted fw-bold small mb-2 d-flex align-items-center gap-1">
              <MapPin size={14} /> {history.company}
            </div>
            {history.skillsAcquired?.length > 0 && (
              <div className="d-flex flex-wrap gap-2">
                {history.skillsAcquired.map((skill, i) => (
                  <span key={i} className="badge bg-light text-foreground border">{skill}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="alert alert-info border-0 bg-info bg-opacity-10 mt-3 small fw-medium">
        <strong>Note:</strong> This shows a similar observed alumni trajectory. It does not predict certainty, but rather shows a verified path to your target role.
      </div>
    </div>
  );
}
