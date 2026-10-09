import React, { useState, useEffect } from 'react';
import { Lightbulb, TrendingUp, AlertTriangle } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function IndustryHub() {
  const { addToast } = useToast();
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const res = await api.get('/alumni/insights');
        setInsights(res.data.data || []);
      } catch (err) {
        addToast("Failed to load industry insights", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, []);

  const getIcon = (type) => {
    switch(type) {
      case 'SkillSignal': return <TrendingUp className="text-primary" />;
      case 'LessonLearned': return <AlertTriangle className="text-warning" />;
      case 'RealityCheck': return <Lightbulb className="text-info" />;
      default: return <Lightbulb />;
    }
  };

  if (loading) return <div className="p-5 text-center"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="container-fluid py-4 px-xl-5">
      <div className="mb-4">
        <h2 className="fw-black mb-1 d-flex align-items-center gap-2">
          Industry Hub
        </h2>
        <p className="text-muted">Aggregated micro-contributions and insights from verified alumni.</p>
      </div>

      {insights.length === 0 ? (
        <div className="text-center p-5 bento-card text-muted">
          No alumni industry insights yet. Once alumni contribute, insights will appear here.
        </div>
      ) : (
        <div className="row g-4">
          {insights.map(insight => (
            <div className="col-md-6 col-lg-4" key={insight._id}>
              <div className="bento-card p-4 h-100 hover-lift bg-card">
                <div className="d-flex align-items-center gap-3 mb-3 pb-3 border-bottom">
                  <div className="bg-light p-2 rounded-circle border">
                    {getIcon(insight.type)}
                  </div>
                  <div>
                    <div className="badge bg-secondary mb-1">{insight.type}</div>
                    <div className="small fw-bold text-muted">{insight.industryContext || 'General Industry'}</div>
                  </div>
                </div>
                
                <h5 className="fw-bold mb-3" style={{ fontSize: '1rem' }}>{insight.topic}</h5>
                <p className="text-foreground fst-italic bg-light p-3 rounded-3 border-start border-4 border-primary">
                  "{insight.response}"
                </p>
                
                <div className="mt-auto pt-3 text-end small fw-bold text-muted">
                  — {insight.alumniId?.name || 'Verified Alumni'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
