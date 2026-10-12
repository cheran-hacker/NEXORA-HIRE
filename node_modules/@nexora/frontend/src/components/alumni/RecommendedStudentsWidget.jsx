import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, ExternalLink, ArrowRight, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { alumniService } from "../../services/api";
import { getAvatarUrl, handleImageError } from "../../utils/avatar";

export default function RecommendedStudentsWidget() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    alumniService.getStats().then(res => {
      const directory = res.data.networkDirectory || [];
      setStudents(directory);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="premium-glass-panel p-4 rounded-4 mb-4" style={{ minHeight: '200px' }}>
        <div className="d-flex justify-content-center align-items-center h-100">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="premium-glass-panel p-4 rounded-4 mb-4 position-relative overflow-hidden">
      <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom" style={{ borderColor: 'rgba(255,255,255,0.05) !important' }}>
        <h5 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ color: "var(--text)" }}>
          <Star className="text-warning" /> Recommended Students For You
        </h5>
        <Link to="/alumni/network" className="badge bg-secondary bg-opacity-25 rounded-pill text-muted px-3 py-2 text-decoration-none hover-glow d-flex align-items-center gap-1">
          View All <ArrowRight size={14} />
        </Link>
      </div>

      {students.length > 0 ? (
        <div className="row g-3">
          {students.slice(0, 3).map((student, idx) => (
            <div className="col-md-4" key={student.id || idx}>
              <motion.div 
                whileHover={{ y: -5 }}
                className="p-3 rounded-4 h-100 d-flex flex-column shadow-sm"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
              >
                <div className="d-flex gap-3 align-items-center mb-3">
                  <img 
                    src={getAvatarUrl(student.name, student.avatar)} 
                    alt={student.name}
                    onError={(e) => handleImageError(e, student.name)}
                    className="rounded-circle border"
                    style={{ width: 48, height: 48, borderColor: 'rgba(255,255,255,0.1)', objectFit: 'cover' }}
                  />
                  <div>
                    <h6 className="fw-bold mb-0 text-truncate" style={{ color: "var(--text)" }}>{student.name}</h6>
                    <small className="text-muted">{student.company || 'Student'}</small>
                  </div>
                </div>

                <div className="mb-3 flex-grow-1">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <span className="badge rounded-pill bg-success bg-opacity-10 text-success border border-success border-opacity-25">{student.matchScore || 'High'} Match</span>
                    <span className="small text-muted text-truncate">Target: {student.role}</span>
                  </div>
                </div>

                <Link to={`/p/${student.id}`} className="btn btn-sm premium-btn rounded-pill fw-bold" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text)' }}>View Profile</Link>
              </motion.div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4">
          <Users size={32} className="text-muted mb-2 opacity-50" />
          <p className="text-muted mb-0">No matches found yet. Keep your profile updated!</p>
        </div>
      )}
    </div>
  );
}
