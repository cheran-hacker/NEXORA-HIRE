import React, { useState, useEffect } from "react";
import { Users, CheckCircle, XCircle, Shield, Briefcase, Info } from "lucide-react";
import { alumniService } from "../../services/api.js";
import { useToast } from "../../context/ToastContext";
import { motion, AnimatePresence } from "framer-motion";

export default function ConnectionRequests() {
  const { addToast } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("Pending");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await alumniService.getConnectionRequests();
      setRequests(res.data.data || []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load connection requests.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id, status) => {
    try {
      await alumniService.updateConnectionRequest(id, status);
      addToast(`Connection request ${status.toLowerCase()}`, "success");
      setRequests(prev => prev.map(r => r._id === id ? { ...r, status } : r));
    } catch (err) {
      addToast("Failed to update status", "error");
    }
  };

  const filteredRequests = requests.filter(r => filter === "All" || r.status === filter);

  if (loading) {
    return (
      <div className="container-fluid py-4 d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid py-5 text-center">
        <Info size={48} className="text-danger mb-3" />
        <h4 className="fw-bold">{error}</h4>
        <button className="btn btn-primary rounded-pill mt-3 px-4" onClick={fetchRequests}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4 px-xl-5" style={{ background: "var(--bg)", minHeight: "100dvh", color: "var(--text)" }}>
      {/* Header Info */}
      <div className="bento-card p-4 mb-5 position-relative overflow-hidden">
        <div className="position-absolute top-0 end-0 bg-primary opacity-25 blur-3 rounded-circle pe-none" style={{ width: 300, height: 300, filter: "blur(120px)" }}></div>
        <div className="position-relative z-1">
          <h2 className="fw-black mb-2 d-flex align-items-center gap-3" style={{ fontSize: "2.5rem", letterSpacing: "-0.02em", color: "var(--text)" }}>
            <Users className="text-primary" size={36} /> Connection Requests
          </h2>
          <p className="mb-0 fw-medium" style={{ color: "var(--text-secondary)", maxWidth: "800px", fontSize: "1.1rem" }}>
            Review students who want to connect with you based on your career trajectory and skills.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="row g-4 mb-5">
        <div className="col-lg-12">
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
            <h4 className="fw-bold m-0" style={{ color: "var(--text)" }}>Student Requests</h4>
            <div className="d-flex gap-2">
              {['Pending', 'Accepted', 'Rejected', 'All'].map(f => (
                <button 
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`btn rounded-pill px-4 fw-bold ${filter === f ? 'btn-primary' : 'btn-outline-secondary'}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {filteredRequests.length === 0 ? (
            <div className="bento-card p-5 text-center">
              <Users size={64} className="text-muted mb-3 opacity-50" />
              <h4 className="fw-bold mb-2">No {filter !== 'All' ? filter.toLowerCase() : ''} requests found.</h4>
              <p className="text-muted mb-0">Check back later for new connections.</p>
            </div>
          ) : (
            <div className="row g-4">
              <AnimatePresence>
                {filteredRequests.map((req, index) => {
                  const student = req.student || {};
                  const profile = student.studentProfile || {};
                  
                  return (
                    <motion.div 
                      key={req._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="col-xl-6"
                    >
                      <div className="bento-card h-100 p-4 d-flex flex-column hover-glow">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div className="d-flex gap-3 align-items-center">
                            <div className="avatar-wrapper">
                              <img src={student.avatar || "https://ui-avatars.com/api/?name="+encodeURIComponent(student.name || 'Student')} alt={student.name} className="rounded-circle shadow-sm" style={{ width: 64, height: 64, objectFit: "cover", border: "2px solid var(--border)" }} />
                            </div>
                            <div>
                              <h5 className="fw-bold mb-1 d-flex align-items-center gap-2">
                                {student.name} <Shield size={16} className="text-success" />
                              </h5>
                              <div className="d-flex flex-column small text-muted">
                                <span className="fw-medium text-foreground"><Briefcase size={14} className="me-1"/> Target: {profile.targetCareerRole || 'Unspecified'}</span>
                                {profile.college && <span>🎓 {profile.college}</span>}
                              </div>
                            </div>
                          </div>
                          <div>
                            <span className={`badge rounded-pill px-3 py-1 fw-bold bg-${req.status === 'Pending' ? 'warning text-dark' : req.status === 'Accepted' ? 'success' : 'danger'}`}>
                              {req.status}
                            </span>
                          </div>
                        </div>

                        {req.message && (
                          <div className="p-3 rounded-4 mb-3 flex-grow-1" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                            <h6 className="fw-bold mb-2 small text-muted text-uppercase">Message from Student</h6>
                            <p className="mb-0 small fw-medium text-muted fst-italic">"{req.message}"</p>
                          </div>
                        )}

                        {req.status === 'Pending' && (
                          <div className="d-flex gap-2 mt-3 pt-3 border-top" style={{ borderColor: "var(--border) !important" }}>
                            <button 
                              onClick={() => handleUpdate(req._id, 'Accepted')}
                              className="btn btn-success rounded-pill fw-bold flex-grow-1 d-flex align-items-center justify-content-center gap-2 hover-lift"
                            >
                              <CheckCircle size={18} /> Accept
                            </button>
                            <button 
                              onClick={() => handleUpdate(req._id, 'Rejected')}
                              className="btn btn-outline-danger rounded-pill fw-bold flex-grow-1 d-flex align-items-center justify-content-center gap-2 hover-lift"
                            >
                              <XCircle size={18} /> Decline
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
