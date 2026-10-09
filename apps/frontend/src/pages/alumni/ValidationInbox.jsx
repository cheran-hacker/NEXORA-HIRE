import React, { useState, useEffect } from 'react';
import { Shield, ExternalLink, Check, X, Sparkles, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../../context/ToastContext';
import { alumniofficeService, aiService } from '../../services/api';

export default function ValidationInbox() {
  const { addToast } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [rubrics, setRubrics] = useState({});
  const [rubricLoading, setRubricLoading] = useState({});

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await alumniofficeService.getPendingValidations();
      setRequests(res.data.data || []);
    } catch (err) {
      addToast("Failed to load validation requests", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async (id, status) => {
    try {
      await alumniofficeService.validateSkill(id, status, 'Reviewed.');
      setRequests(requests.filter(r => r._id !== id));
      addToast(`Skill validation marked as ${status}.`, "success");
    } catch (err) {
      addToast("Failed to validate skill", "error");
    }
  };

  const toggleExpand = async (req) => {
    if (expandedId === req._id) {
      setExpandedId(null);
      return;
    }
    
    setExpandedId(req._id);
    
    if (!rubrics[req._id]) {
      try {
        setRubricLoading(prev => ({ ...prev, [req._id]: true }));
        const res = await aiService.generateVerificationRubric({ skillName: req.skill });
        setRubrics(prev => ({
          ...prev,
          [req._id]: res.data.data?.criteria || ["Check code quality", "Check documentation", "Check implementation relevance"]
        }));
      } catch (err) {
        console.error("Failed to load AI Rubric", err);
        setRubrics(prev => ({
          ...prev,
          [req._id]: ["Unable to generate rubric at this time. Please use your best judgment."]
        }));
      } finally {
        setRubricLoading(prev => ({ ...prev, [req._id]: false }));
      }
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }}></div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4 px-xl-5" style={{ background: "transparent" }}>
      <div className="d-flex flex-column gap-4 mx-auto" style={{ maxWidth: "1200px" }}>
        
        <div className="d-flex flex-column mb-3">
          <div className="d-flex align-items-center gap-3 mb-2">
            <div className="p-2 rounded-3 shadow-sm" style={{ background: "linear-gradient(135deg,var(--primary),var(--purple))", color: "#fff" }}>
              <Shield size={28} />
            </div>
            <div>
              <h2 className="fw-black mb-0" style={{ color: 'var(--premium-text-main)', letterSpacing: '-0.02em' }}>
                Skill Validation Inbox
              </h2>
            </div>
          </div>
          <p className="text-muted fw-medium" style={{ fontSize: '1.1rem' }}>
            Verify student evidence efficiently with AI-assisted review rubrics.
          </p>
        </div>

        {requests.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
            className="text-center p-5 rounded-4 shadow-sm" style={{ background: 'var(--premium-surface)', border: '1px solid var(--premium-border)' }}>
            <div className="mb-3">
              <Check size={48} className="text-success opacity-50" />
            </div>
            <h4 className="fw-bold mb-2">Inbox Zero!</h4>
            <p className="text-muted">There are no pending skill validation requests at this time.</p>
          </motion.div>
        ) : (
          <div className="d-flex flex-column gap-4">
            <AnimatePresence>
              {requests.map(req => {
                const isExpanded = expandedId === req._id;
                
                return (
                  <motion.div 
                    key={req._id} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="rounded-4 overflow-hidden shadow-sm"
                    style={{ background: 'var(--premium-surface)', border: '1px solid var(--premium-border)' }}
                  >
                    <div 
                      className="p-4 d-flex justify-content-between align-items-center cursor-pointer transition-fast hover-bg-subtle"
                      onClick={() => toggleExpand(req)}
                    >
                      <div className="d-flex flex-column gap-1">
                        <div className="d-flex align-items-center gap-2">
                          <h5 className="fw-bold mb-0 text-foreground">{req.student?.name || 'Unknown Student'}</h5>
                          <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-3 py-1">
                            {req.skill}
                          </span>
                        </div>
                        <p className="text-muted small mb-0 mt-1 d-flex align-items-center gap-1">
                          Submitted on {new Date(req.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="d-flex align-items-center gap-3">
                        <button className="btn btn-light rounded-circle p-2" onClick={(e) => { e.stopPropagation(); toggleExpand(req); }}>
                          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                      </div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-top"
                          style={{ borderColor: 'var(--premium-border)' }}
                        >
                          <div className="p-4 bg-light bg-opacity-10">
                            <div className="row g-4">
                              <div className="col-md-6">
                                <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                                  <ExternalLink size={16} className="text-primary"/> Student Evidence
                                </h6>
                                <div className="p-3 rounded-3 border bg-white shadow-sm d-flex justify-content-between align-items-center">
                                  <span className="text-truncate text-muted">{req.evidenceUrl}</span>
                                  <a href={req.evidenceUrl} target="_blank" rel="noreferrer" className="btn btn-sm btn-primary rounded-pill px-3">
                                    Open Link
                                  </a>
                                </div>
                                <div className="mt-4">
                                  <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                                    <AlertCircle size={16} className="text-muted"/> Alumni Decision
                                  </h6>
                                  <div className="d-flex gap-2">
                                    <button onClick={() => handleValidate(req._id, 'Insufficient')} className="btn btn-outline-danger rounded-pill px-4 py-2 fw-bold d-flex align-items-center gap-2 flex-grow-1 justify-content-center">
                                      <X size={18} /> Reject
                                    </button>
                                    <button onClick={() => handleValidate(req._id, 'Demonstrated')} className="btn btn-success rounded-pill px-4 py-2 fw-bold d-flex align-items-center gap-2 flex-grow-1 justify-content-center shadow-sm">
                                      <Check size={18} /> Verify Skill
                                    </button>
                                  </div>
                                </div>
                              </div>
                              <div className="col-md-6">
                                <div className="p-4 rounded-3 h-100 position-relative overflow-hidden shadow-sm" style={{ background: 'linear-gradient(to bottom right, rgba(147,51,234,0.05), rgba(79,70,229,0.05))', border: '1px solid rgba(147,51,234,0.2)' }}>
                                  <div className="position-absolute top-0 end-0 p-3 opacity-25">
                                    <Sparkles size={64} className="text-purple" />
                                  </div>
                                  <h6 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: 'var(--purple)' }}>
                                    <Sparkles size={16} /> AI Verification Rubric
                                  </h6>
                                  
                                  {rubricLoading[req._id] ? (
                                    <div className="d-flex flex-column gap-2 mt-4">
                                      <div className="placeholder-glow"><span className="placeholder col-12 rounded"></span></div>
                                      <div className="placeholder-glow"><span className="placeholder col-10 rounded"></span></div>
                                      <div className="placeholder-glow"><span className="placeholder col-11 rounded"></span></div>
                                      <p className="text-muted small mt-2">AI is generating evaluation criteria...</p>
                                    </div>
                                  ) : (
                                    <ul className="list-unstyled mb-0 d-flex flex-column gap-3 position-relative z-1">
                                      {rubrics[req._id]?.map((criterion, idx) => (
                                        <li key={idx} className="d-flex align-items-start gap-2">
                                          <div className="mt-1 flex-shrink-0 text-purple">
                                            <Check size={16} />
                                          </div>
                                          <span className="text-muted fw-medium" style={{ fontSize: '0.95rem' }}>{criterion}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
