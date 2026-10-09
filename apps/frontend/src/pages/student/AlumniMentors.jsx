import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Search,
  CheckCircle,
  Briefcase,
  Star,
  BookOpen,
  Award,
  Link as LinkIcon,
  MessageSquare,
  Shield,
  Building2,
  ExternalLink,
  Info,
  Target
} from "lucide-react";
import { studentService } from "../../services/api.js";
import { useToast } from "../../context/ToastContext";
import { Link } from "react-router-dom";

export default function AlumniMentors() {
  const { addToast } = useToast();
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAlumni, setSelectedAlumni] = useState(null);
  const [connectMessage, setConnectMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const res = await studentService.getMatchedAlumniNetwork();
      setAlumni(res.data.data || []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Unable to generate alumni recommendations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (e) => {
    e.preventDefault();
    if (!selectedAlumni) return;

    try {
      setIsSubmitting(true);
      await studentService.requestConnection({
        alumniId: selectedAlumni._id,
        message: connectMessage
      });
      addToast(`Connection request sent to ${selectedAlumni.name}`, "success");
      
      // Update UI state directly
      setAlumni(prev => prev.map(a => {
        if(a._id === selectedAlumni._id) {
          return { ...a, connectionStatus: "Pending" };
        }
        return a;
      }));
      
      setSelectedAlumni(null);
      setConnectMessage("");
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to send request", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredAlumni = alumni.filter(a => {
    const searchString = `${a.name} ${a.alumniProfile?.company} ${a.alumniProfile?.designation} ${(a.alumniProfile?.expertise || []).join(' ')}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

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
        <button className="btn btn-primary rounded-pill mt-3 px-4" onClick={fetchMatches}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4 px-xl-5 position-relative overflow-hidden" style={{ minHeight: "100vh", background: "var(--bg-main)", color: "var(--text)" }}>
      {/* Ambient Backgrounds */}
      <div className="position-absolute rounded-circle blur-3xl" style={{ width: '40vw', height: '40vw', top: '-10%', right: '-10%', background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, rgba(0,0,0,0) 70%)', zIndex: 0 }} />
      <div className="position-absolute rounded-circle blur-3xl" style={{ width: '30vw', height: '30vw', bottom: '10%', left: '-5%', background: 'radial-gradient(circle, rgba(147,51,234,0.08) 0%, rgba(0,0,0,0) 70%)', zIndex: 0 }} />

      {/* Header Info */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="premium-glass-panel p-5 mb-5 position-relative overflow-hidden rounded-4" style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="position-absolute end-0 top-0 h-100 w-50" style={{ background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.1))', pointerEvents: 'none' }} />
        <div className="position-relative z-1">
          <h2 className="fw-bolder mb-2 d-flex align-items-center gap-3" style={{ fontSize: "2.5rem", letterSpacing: "-0.03em", color: "var(--text)" }}>
            <Users size={40} className="text-primary" /> Recommended Alumni & Mentors
          </h2>
          <p className="mb-0 text-muted" style={{ maxWidth: "800px", fontSize: "1.15rem", lineHeight: '1.5' }}>
            Professionals selected based on your career target, resume, skills and development needs.
          </p>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="row g-4 mb-5 position-relative z-1">
        <div className="col-lg-12">
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
            <h4 className="fw-bold m-0" style={{ color: "var(--text)", letterSpacing: '-0.01em' }}>Top Matches</h4>
            <div className="position-relative" style={{ minWidth: "300px" }}>
              <div className="position-absolute top-50 translate-middle-y ms-3 text-muted">
                <Search size={18} />
              </div>
              <input 
                type="text" 
                placeholder="Search alumni, companies, skills..." 
                className="form-control premium-input rounded-pill ps-5 py-2 shadow-none" 
                style={{ background: "rgba(255,255,255,0.03)", color: "var(--text)", border: "1px solid rgba(255,255,255,0.1)" }}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {filteredAlumni.length === 0 ? (
            <div className="premium-glass-panel p-5 text-center rounded-4 border-dashed" style={{ border: '1px dashed rgba(255,255,255,0.15)' }}>
              <Users size={72} className="text-muted mb-4 opacity-25" />
              <h4 className="fw-bold mb-3" style={{ color: 'var(--text)' }}>No matching alumni found yet.</h4>
              <p className="text-muted mb-4 px-md-5 mx-md-5" style={{ fontSize: '1.1rem' }}>Update your career target or improve your resume to get better recommendations.</p>
              <div className="d-flex justify-content-center gap-3 flex-wrap">
                <Link to="/student/learning" className="btn premium-btn rounded-pill px-4 py-2" style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: 'white', border: 'none' }}>Set Career Target</Link>
                <Link to="/student/smart-resume" className="btn btn-outline-light rounded-pill px-4 py-2 text-muted" style={{ border: '1px solid rgba(255,255,255,0.2)' }}>Update Resume</Link>
              </div>
            </div>
          ) : (
            <div className="row g-4">
              <AnimatePresence>
                {filteredAlumni.map((alumnus, index) => {
                  const profile = alumnus.alumniProfile || {};
                  return (
                    <motion.div 
                      key={alumnus._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.01 }}
                      className="col-xl-6"
                    >
                      <div className="premium-glass-panel h-100 p-4 d-flex flex-column rounded-4 position-relative overflow-hidden cursor-pointer shadow-sm" style={{ border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.3s ease' }}>
                        <div className="position-absolute end-0 top-0 w-100 h-100 opacity-0 hover-opacity-100 transition-opacity" style={{ background: 'radial-gradient(circle at top right, rgba(59,130,246,0.08), transparent 70%)', pointerEvents: 'none' }} />
                        
                        {/* Header & Match Score */}
                        <div className="d-flex justify-content-between align-items-start mb-4 position-relative z-1">
                          <div className="d-flex gap-3 align-items-center">
                            <div className="position-relative">
                              <img src={alumnus.avatar || "https://ui-avatars.com/api/?name="+encodeURIComponent(alumnus.name)} alt={alumnus.name} className="rounded-circle shadow-sm" style={{ width: 64, height: 64, objectFit: "cover", border: "2px solid rgba(59,130,246,0.3)" }} />
                              {alumnus.isVerified && <div className="position-absolute bottom-0 end-0 bg-success rounded-circle border border-dark p-1"><CheckCircle size={10} color="white" /></div>}
                            </div>
                            <div>
                              <h5 className="fw-bold mb-1 d-flex align-items-center gap-2 text-truncate" style={{ maxWidth: '200px', color: 'var(--text)' }}>
                                {alumnus.name} <Shield size={16} className="text-primary" />
                              </h5>
                              <div className="d-flex flex-column small text-muted">
                                <span className="fw-medium text-light"><Briefcase size={14} className="me-1"/> {profile.designation || 'Professional'}</span>
                                <span><Building2 size={14} className="me-1"/> {profile.company || 'Alumni'}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="d-flex flex-column align-items-end">
                            <div className="badge rounded-pill d-flex align-items-center gap-2 py-2 px-3 shadow-sm" style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.1))", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.2)" }}>
                              <Star size={16} fill="currentColor"/> 
                              <span className="fw-black fs-6">{alumnus.matchScore}% Match</span>
                            </div>
                            {alumnus.recommendationLabel && (
                              <span className="badge mt-2 rounded-pill px-3 py-1 fw-bold" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', fontSize: "0.75rem", border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                                {alumnus.recommendationLabel}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Match Reasons */}
                        <div className="p-3 rounded-4 mb-4 position-relative z-1" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                          <h6 className="fw-bold mb-2 small text-muted text-uppercase d-flex align-items-center gap-2"><Award size={14} className="text-warning" /> Why this match?</h6>
                          <ul className="mb-0 ps-0" style={{ listStyle: 'none' }}>
                            {alumnus.matchReasons?.slice(0, 3).map((reason, i) => (
                              <li key={i} className="mb-1 small fw-medium" style={{ color: "var(--text-muted)", lineHeight: '1.4' }}><span className="text-primary me-2">•</span>{reason}</li>
                            ))}
                          </ul>
                        </div>                        {/* Skills and Gaps */}
                        <div className="d-flex flex-column gap-2 mb-4 flex-grow-1">
                          {alumnus.matchedSkills?.length > 0 && (
                            <div>
                              <div className="small fw-bold mb-2 d-flex align-items-center gap-2" style={{ color: "var(--text)" }}><CheckCircle size={14} className="text-success"/> Shared Skills</div>
                              <div className="d-flex flex-wrap gap-2">
                                {alumnus.matchedSkills.slice(0, 4).map(s => (
                                  <span key={s} className="badge rounded-pill px-3 py-1" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#4ade80', border: '1px solid rgba(34, 197, 94, 0.2)' }}>{s}</span>
                                ))}
                                {alumnus.matchedSkills.length > 4 && <span className="badge rounded-pill px-3 py-1" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.1)' }}>+{alumnus.matchedSkills.length - 4} more</span>}
                              </div>
                            </div>
                          )}
                          
                          {alumnus.relevantSkillGaps?.length > 0 && (
                            <div className="mt-2">
                              <div className="small fw-bold mb-2 d-flex align-items-center gap-2" style={{ color: "var(--text)" }}><Target size={14} className="text-primary"/> Can guide you on</div>
                              <div className="d-flex flex-wrap gap-2">
                                {alumnus.relevantSkillGaps.map(s => (
                                  <span key={s} className="badge rounded-pill px-3 py-1" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.2)' }}>{s}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="d-flex gap-2 mt-auto pt-3 border-top" style={{ borderColor: "rgba(255,255,255,0.05) !important" }}>
                          <Link to={`/p/${alumnus._id}`} className="btn premium-btn rounded-pill fw-bold flex-grow-1 d-flex align-items-center justify-content-center gap-2" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text)', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <ExternalLink size={16} /> View Profile
                          </Link>
                          
                          {alumnus.connectionStatus === 'Pending' ? (
                            <button className="btn rounded-pill fw-bold flex-grow-1 text-muted" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }} disabled>
                              Request Pending
                            </button>
                          ) : alumnus.connectionStatus === 'Accepted' ? (
                            <button className="btn rounded-pill fw-bold flex-grow-1" style={{ background: 'rgba(34,197,94,0.1)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.2)' }} disabled>
                              Connected
                            </button>
                          ) : (
                            <button 
                              onClick={() => setSelectedAlumni(alumnus)}
                              data-bs-toggle="modal" 
                              data-bs-target="#connectModal"
                              className="btn premium-btn rounded-pill fw-bold flex-grow-1 d-flex align-items-center justify-content-center gap-2"
                              style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: 'white', border: 'none' }}
                            >
                              <LinkIcon size={16} /> Connect
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Connect Modal */}
      <div className="modal fade" id="connectModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content bento-card border-0">
            <div className="modal-header border-bottom-0 pb-0">
              <h5 className="modal-title fw-black d-flex align-items-center gap-2">
                <LinkIcon className="text-primary" /> Request Connection
              </h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              {selectedAlumni && (
                <>
                  <div className="d-flex align-items-center gap-3 mb-4 p-3 rounded-4" style={{ background: "var(--surface-2)" }}>
                    <img src={selectedAlumni.avatar || "https://ui-avatars.com/api/?name="+encodeURIComponent(selectedAlumni.name)} alt="avatar" className="rounded-circle shadow-sm" style={{ width: 48, height: 48 }} />
                    <div>
                      <h6 className="fw-bold mb-0">{selectedAlumni.name}</h6>
                      <small className="text-muted">{selectedAlumni.alumniProfile?.designation} at {selectedAlumni.alumniProfile?.company}</small>
                    </div>
                  </div>
                  
                  <div className="form-group mb-3">
                    <label className="form-label fw-bold small text-muted">Personalized Message</label>
                    <textarea 
                      className="form-control rounded-4 p-3 bg-transparent" 
                      style={{ color: "var(--text)", borderColor: "var(--border)", minHeight: "120px" }}
                      placeholder="Hi! I am currently preparing for a role in your field and would love to connect..."
                      value={connectMessage}
                      onChange={e => setConnectMessage(e.target.value)}
                    ></textarea>
                    <small className="text-muted mt-2 d-block">Adding a personalized message increases your chances of connection.</small>
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer border-top-0 pt-0">
              <button type="button" className="btn btn-link text-muted fw-bold text-decoration-none" data-bs-dismiss="modal">Cancel</button>
              <button 
                type="button" 
                className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm d-flex align-items-center gap-2" 
                onClick={(e) => {
                  handleConnect(e);
                  const modal = window.bootstrap.Modal.getInstance(document.getElementById('connectModal'));
                  if(modal) modal.hide();
                }}
                disabled={isSubmitting}
              >
                {isSubmitting ? <span className="spinner-border spinner-border-sm"></span> : <MessageSquare size={16} />}
                Send Request
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
