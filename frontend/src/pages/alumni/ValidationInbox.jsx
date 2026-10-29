import React, { useState, useEffect } from 'react';
import {
  Shield,
  ExternalLink,
  Check,
  X,
  Sparkles,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  FileCode,
  FolderGit2,
  Award,
  Calendar,
  User,
  MessageSquare,
  CheckCircle2
} from 'lucide-react';
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
  const [feedbackMap, setFeedbackMap] = useState({});
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await alumniofficeService.getPendingValidations();
      const list = res.data?.data || (Array.isArray(res.data) ? res.data : []);
      setRequests(list);
    } catch (err) {
      console.error("Failed to load validation requests:", err);
      addToast(err?.response?.data?.message || "Failed to load validation requests", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async (id, status) => {
    if (actionLoading[id]) return;
    
    setActionLoading(prev => ({ ...prev, [id]: true }));
    const feedbackText = feedbackMap[id] || '';

    try {
      const res = await alumniofficeService.validateSkill(id, status, feedbackText);
      setRequests(prev => prev.filter(r => r._id !== id));
      addToast(res.data?.message || `Validation marked as ${status}.`, "success");
    } catch (err) {
      console.error("Failed to validate request:", err);
      addToast(err?.response?.data?.message || "Failed to submit decision", "error");
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const toggleExpand = async (req) => {
    if (expandedId === req._id) {
      setExpandedId(null);
      return;
    }
    
    setExpandedId(req._id);
    const skillOrTitle = req.title || req.skill || "Technical Evidence";
    
    if (!rubrics[req._id]) {
      try {
        setRubricLoading(prev => ({ ...prev, [req._id]: true }));
        const res = await aiService.generateVerificationRubric({ skillName: skillOrTitle });
        setRubrics(prev => ({
          ...prev,
          [req._id]: res.data?.data?.criteria || [
            "Verify code structure and modularity",
            "Check live deployment or repository commits",
            "Confirm documentation and real-world applicability"
          ]
        }));
      } catch (err) {
        console.error("Failed to load AI Rubric:", err);
        setRubrics(prev => ({
          ...prev,
          [req._id]: [
            "Review student's implementation against industry standards",
            "Check commit history, code clarity, and architectural soundness",
            "Verify relevant tools and dependencies"
          ]
        }));
      } finally {
        setRubricLoading(prev => ({ ...prev, [req._id]: false }));
      }
    }
  };

  const getTypeBadge = (type = 'skill') => {
    switch (type?.toLowerCase()) {
      case 'project':
        return (
          <span className="badge bg-purple-subtle text-purple border border-purple border-opacity-25 rounded-pill px-3 py-1 small fw-bold d-inline-flex align-items-center gap-1.5" style={{ background: 'rgba(147, 51, 234, 0.1)', color: '#9333ea' }}>
            <FolderGit2 size={13} /> Project Evidence
          </span>
        );
      case 'certification':
        return (
          <span className="badge bg-warning-subtle text-warning border border-warning border-opacity-25 rounded-pill px-3 py-1 small fw-bold d-inline-flex align-items-center gap-1.5">
            <Award size={13} /> Certification
          </span>
        );
      default:
        return (
          <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-3 py-1 small fw-bold d-inline-flex align-items-center gap-1.5">
            <FileCode size={13} /> Skill Evidence
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-primary mb-3" style={{ width: '2.5rem', height: '2.5rem' }}></div>
        <p className="text-muted fw-semibold small">Loading pending validation requests from MongoDB...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4 px-xl-5" style={{ background: "transparent" }}>
      <div className="d-flex flex-column gap-4 mx-auto" style={{ maxWidth: "1200px" }}>
        
        {/* Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-2">
          <div>
            <div className="d-flex align-items-center gap-3 mb-1">
              <div
                className="p-2.5 rounded-3 shadow-sm d-flex align-items-center justify-content-center"
                style={{
                  background: "linear-gradient(135deg, var(--primary, #6366f1), var(--purple, #a855f7))",
                  color: "#fff",
                  width: "48px",
                  height: "48px"
                }}
              >
                <Shield size={26} />
              </div>
              <div>
                <h2 className="fw-black mb-0 text-foreground" style={{ letterSpacing: '-0.02em' }}>
                  Validation Inbox
                </h2>
                <span className="badge rounded-pill bg-primary-subtle text-primary border border-primary-subtle px-2.5 py-0.5 small">
                  {requests.length} Pending {requests.length === 1 ? 'Review' : 'Reviews'}
                </span>
              </div>
            </div>
            <p className="text-muted fw-medium small mb-0 mt-1">
              Review and verify authentic student skill and project submissions with AI evaluation rubrics.
            </p>
          </div>

          <button
            onClick={fetchRequests}
            className="btn btn-outline-secondary btn-sm px-3 py-2 rounded-pill fw-semibold d-inline-flex align-items-center gap-2"
          >
            <RefreshCw size={14} className={loading ? "spin" : ""} />
            <span>Refresh Inbox</span>
          </button>
        </div>

        {/* Empty Inbox State */}
        {requests.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center p-5 rounded-4 shadow-sm my-3"
            style={{
              background: 'var(--surface, #ffffff)',
              border: '2px dashed var(--border, rgba(0,0,0,0.1))',
              minHeight: '360px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div
              className="d-flex align-items-center justify-content-center rounded-circle mb-3"
              style={{
                width: '72px',
                height: '72px',
                background: 'rgba(16, 185, 129, 0.1)',
                color: 'var(--success, #10b981)'
              }}
            >
              <CheckCircle2 size={40} />
            </div>
            <h4 className="fw-black mb-1 text-foreground">Inbox Zero! 🎉</h4>
            <p className="text-muted small mb-0" style={{ maxWidth: '440px', lineHeight: 1.6 }}>
              You have no pending student skill or project validation requests assigned to your queue at this time.
              New submissions from students will appear here automatically.
            </p>
          </motion.div>
        ) : (
          <div className="d-flex flex-column gap-3">
            <AnimatePresence>
              {requests.map(req => {
                const isExpanded = expandedId === req._id;
                const studentName = req.student?.name || 'Student';
                const studentEmail = req.student?.email || '';
                const studentBranch = req.student?.studentProfile?.branch || req.student?.studentProfile?.college || '';
                const submissionDate = req.createdAt
                  ? new Date(req.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })
                  : 'Recent';
                const reqTitle = req.title || req.skill || 'Evidence Verification';
                const isSubmitting = !!actionLoading[req._id];

                return (
                  <motion.div 
                    key={req._id} 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    className="rounded-4 overflow-hidden shadow-sm"
                    style={{
                      background: 'var(--surface, #ffffff)',
                      border: isExpanded ? '2px solid var(--primary, #6366f1)' : '1px solid var(--border)'
                    }}
                  >
                    {/* Collapsed Card Header */}
                    <div 
                      className="p-4 d-flex justify-content-between align-items-center cursor-pointer transition-fast hover-bg-subtle"
                      onClick={() => toggleExpand(req)}
                    >
                      <div className="d-flex align-items-center gap-3">
                        <div
                          className="d-flex align-items-center justify-content-center flex-shrink-0 rounded-circle"
                          style={{
                            width: '46px',
                            height: '46px',
                            background: 'rgba(99, 102, 241, 0.1)',
                            color: 'var(--primary, #6366f1)'
                          }}
                        >
                          <User size={22} />
                        </div>

                        <div>
                          <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                            <h5 className="fw-bold mb-0 text-foreground" style={{ fontSize: '1.05rem' }}>
                              {studentName}
                            </h5>
                            {getTypeBadge(req.type)}
                            <span
                              className="badge rounded-pill fw-bold small px-2.5 py-0.5"
                              style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary, #6366f1)' }}
                            >
                              {reqTitle}
                            </span>
                          </div>

                          <div className="d-flex align-items-center gap-3 text-muted small" style={{ fontSize: '0.8rem' }}>
                            {studentEmail && <span>{studentEmail}</span>}
                            {studentBranch && <span>• {studentBranch}</span>}
                            <span className="d-flex align-items-center gap-1">
                              • <Calendar size={12} /> {submissionDate}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="d-flex align-items-center gap-3">
                        <button
                          type="button"
                          className="btn btn-sm btn-light rounded-circle p-2 text-muted"
                          onClick={(e) => { e.stopPropagation(); toggleExpand(req); }}
                        >
                          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                      </div>
                    </div>

                    {/* Expanded Review Panel */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-top"
                          style={{ borderColor: 'var(--border)' }}
                        >
                          <div className="p-4" style={{ background: 'rgba(0, 0, 0, 0.015)' }}>
                            <div className="row g-4">
                              {/* Left Column: Evidence & Decision */}
                              <div className="col-lg-6">
                                <div className="mb-3">
                                  <h6 className="fw-bold mb-1 d-flex align-items-center gap-2 text-foreground">
                                    <FileCode size={16} className="text-primary" /> Submitted Work / Evidence
                                  </h6>
                                  <div className="fw-semibold text-primary mb-2" style={{ fontSize: '0.92rem' }}>
                                    {reqTitle}
                                  </div>
                                  <p className="text-muted small mb-3" style={{ lineHeight: 1.55 }}>
                                    {req.evidenceDescription || 'No additional written description provided with this submission.'}
                                  </p>

                                  {/* Supporting Link / Document URL */}
                                  <div className="p-3 rounded-3 border bg-white d-flex justify-content-between align-items-center gap-2 mb-4 shadow-sm" style={{ background: 'var(--surface)' }}>
                                    <div className="text-truncate small text-muted font-monospace" style={{ maxWidth: '320px' }}>
                                      {req.evidenceUrl}
                                    </div>
                                    <a
                                      href={req.evidenceUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="btn btn-sm btn-primary rounded-pill px-3 py-1.5 fw-semibold d-inline-flex align-items-center gap-1.5 flex-shrink-0 shadow-sm"
                                    >
                                      <span>Open Evidence</span>
                                      <ExternalLink size={13} />
                                    </a>
                                  </div>
                                </div>

                                {/* Review Decision & Optional Feedback */}
                                <div className="p-3 rounded-3 border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                                  <h6 className="fw-bold mb-2 d-flex align-items-center gap-2 text-foreground">
                                    <MessageSquare size={16} className="text-primary" /> Reviewer Feedback & Decision
                                  </h6>
                                  <p className="text-muted small mb-2">
                                    Provide constructive feedback or milestone notes for the student (optional):
                                  </p>
                                  <textarea
                                    className="form-control form-control-sm mb-3 rounded-3"
                                    rows={2}
                                    placeholder="Add feedback or suggestions for the student..."
                                    value={feedbackMap[req._id] || ''}
                                    onChange={(e) => setFeedbackMap(prev => ({ ...prev, [req._id]: e.target.value }))}
                                    disabled={isSubmitting}
                                  />

                                  <div className="d-flex gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleValidate(req._id, 'Rejected')}
                                      disabled={isSubmitting}
                                      className="btn btn-outline-danger rounded-pill px-3 py-2 fw-bold d-flex align-items-center gap-1.5 flex-grow-1 justify-content-center"
                                    >
                                      {isSubmitting ? (
                                        <span className="spinner-border spinner-border-sm" role="status" />
                                      ) : (
                                        <>
                                          <X size={16} />
                                          <span>Reject Evidence</span>
                                        </>
                                      )}
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleValidate(req._id, 'Approved')}
                                      disabled={isSubmitting}
                                      className="btn btn-success rounded-pill px-4 py-2 fw-bold d-flex align-items-center gap-1.5 flex-grow-1 justify-content-center shadow-sm"
                                    >
                                      {isSubmitting ? (
                                        <span className="spinner-border spinner-border-sm" role="status" />
                                      ) : (
                                        <>
                                          <Check size={16} strokeWidth={2.5} />
                                          <span>Approve & Verify</span>
                                        </>
                                      )}
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Right Column: AI Verification Rubric */}
                              <div className="col-lg-6">
                                <div
                                  className="p-4 rounded-3 h-100 position-relative overflow-hidden shadow-sm"
                                  style={{
                                    background: 'linear-gradient(to bottom right, rgba(147,51,234,0.05), rgba(79,70,229,0.05))',
                                    border: '1px solid rgba(147,51,234,0.2)'
                                  }}
                                >
                                  <div className="position-absolute top-0 end-0 p-3 opacity-25">
                                    <Sparkles size={64} className="text-purple" />
                                  </div>
                                  <h6 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: 'var(--purple, #a855f7)' }}>
                                    <Sparkles size={16} /> AI Verification Rubric
                                  </h6>
                                  
                                  {rubricLoading[req._id] ? (
                                    <div className="d-flex flex-column gap-2 mt-4">
                                      <div className="placeholder-glow"><span className="placeholder col-12 rounded"></span></div>
                                      <div className="placeholder-glow"><span className="placeholder col-10 rounded"></span></div>
                                      <div className="placeholder-glow"><span className="placeholder col-11 rounded"></span></div>
                                      <p className="text-muted small mt-2">AI is analyzing evaluation criteria for {reqTitle}...</p>
                                    </div>
                                  ) : (
                                    <ul className="list-unstyled mb-0 d-flex flex-column gap-2.5 position-relative z-1">
                                      {(rubrics[req._id] || []).map((criterion, idx) => (
                                        <li key={idx} className="d-flex align-items-start gap-2">
                                          <div className="mt-1 flex-shrink-0" style={{ color: 'var(--purple, #a855f7)' }}>
                                            <Check size={16} />
                                          </div>
                                          <span className="text-muted fw-medium small" style={{ fontSize: '0.88rem', lineHeight: 1.5 }}>
                                            {criterion}
                                          </span>
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
