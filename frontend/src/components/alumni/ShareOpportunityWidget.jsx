import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Send, Plus, X } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

export default function ShareOpportunityWidget() {
  const { addToast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [opportunity, setOpportunity] = useState({
    title: '',
    company: '',
    location: '',
    type: 'Full-time',
    skills: '',
    url: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!opportunity.title || !opportunity.company) return;

    try {
      setSubmitting(true);
      // We will post to the standard job posting route, but as an Alumni
      await api.post('/jobs/share', {
        ...opportunity,
        skills: opportunity.skills.split(',').map(s => s.trim())
      });
      
      addToast("Opportunity shared successfully! Students will be notified.", "success");
      setShowModal(false);
      setOpportunity({
        title: '', company: '', location: '', type: 'Full-time', skills: '', url: ''
      });
    } catch (err) {
      addToast("Failed to share opportunity.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="premium-glass-panel p-4 h-100 rounded-4 position-relative overflow-hidden" style={{ border: '1px solid rgba(34, 197, 94, 0.3)' }}>
        <div className="position-absolute end-0 top-0 h-100 w-50" style={{ background: 'linear-gradient(90deg, transparent, rgba(34,197,94,0.05))', pointerEvents: 'none' }} />
        
        <div className="d-flex flex-column h-100 position-relative z-1">
          <div className="d-flex align-items-center gap-3 mb-4">
            <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 shadow-sm" style={{ width: 48, height: 48, background: 'linear-gradient(135deg, #22c55e, #14b8a6)', color: 'white' }}>
              <Briefcase size={22} fill="currentColor" />
            </div>
            <div>
              <h5 className="fw-bold mb-0" style={{ color: 'var(--text)' }}>Share Vacancy</h5>
              <p className="text-muted small mb-0">Help students find jobs at your company.</p>
            </div>
          </div>
          
          <div className="mt-auto">
            <button 
              className="btn w-100 rounded-pill fw-bold d-flex align-items-center justify-content-center gap-2"
              onClick={() => setShowModal(true)}
              style={{ background: 'transparent', border: '1px solid #22c55e', color: '#4ade80', padding: '0.6rem 1.5rem', transition: 'all 0.2s ease' }}
              onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(34,197,94,0.1)'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <Plus size={18} /> Post an Opportunity
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              style={{ position: 'fixed', inset: 0, background: "#000", zIndex: 1040 }}
            />
            <motion.div
              className="d-flex align-items-center justify-content-center"
              style={{ position: 'fixed', inset: 0, zIndex: 1050, padding: '1rem' }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="premium-glass-panel p-4 shadow-lg rounded-4 position-relative overflow-hidden" style={{ maxWidth: 500, width: "100%", border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="position-absolute end-0 top-0 w-100" style={{ height: '4px', background: 'linear-gradient(90deg, #22c55e, #14b8a6)' }} />
                
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="fw-bold m-0 d-flex align-items-center gap-2" style={{ color: "var(--text)" }}>
                    <Briefcase size={20} className="text-success" /> Share Job Opportunity
                  </h5>
                  <button className="btn btn-sm btn-link text-muted p-0" onClick={() => setShowModal(false)}>
                    <X size={22} />
                  </button>
                </div>
                
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted">Job Title</label>
                    <input 
                      type="text" 
                      className="form-control premium-input shadow-none rounded-3" 
                      placeholder="e.g. Backend Developer" 
                      value={opportunity.title}
                      onChange={(e) => setOpportunity({...opportunity, title: e.target.value})}
                      required
                      style={{ background: 'rgba(0,0,0,0.1)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text)' }}
                    />
                  </div>
                  
                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold text-muted">Company</label>
                      <input 
                        type="text" 
                        className="form-control premium-input shadow-none rounded-3" 
                        value={opportunity.company}
                        onChange={(e) => setOpportunity({...opportunity, company: e.target.value})}
                        required
                        style={{ background: 'rgba(0,0,0,0.1)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text)' }}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold text-muted">Type</label>
                      <select 
                        className="form-select premium-input shadow-none rounded-3 cursor-pointer"
                        value={opportunity.type}
                        onChange={(e) => setOpportunity({...opportunity, type: e.target.value})}
                        style={{ background: 'rgba(0,0,0,0.1)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text)' }}
                      >
                        <option value="Full-time" style={{ color: 'black' }}>Full-time</option>
                        <option value="Internship" style={{ color: 'black' }}>Internship</option>
                        <option value="Contract" style={{ color: 'black' }}>Contract</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted">Target Skills (comma separated)</label>
                    <input 
                      type="text" 
                      className="form-control premium-input shadow-none rounded-3" 
                      placeholder="e.g. Node.js, React, MongoDB" 
                      value={opportunity.skills}
                      onChange={(e) => setOpportunity({...opportunity, skills: e.target.value})}
                      style={{ background: 'rgba(0,0,0,0.1)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text)' }}
                    />
                    <small className="text-muted mt-1 d-block" style={{ fontSize: '0.75rem' }}>We will notify students who have these as Target Roles or Skills.</small>
                  </div>

                  <div className="mb-4">
                    <label className="form-label small fw-bold text-muted">Application Link</label>
                    <input 
                      type="url" 
                      className="form-control premium-input shadow-none rounded-3" 
                      placeholder="https://company.com/careers" 
                      value={opportunity.url}
                      onChange={(e) => setOpportunity({...opportunity, url: e.target.value})}
                      required
                      style={{ background: 'rgba(0,0,0,0.1)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text)' }}
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="btn premium-btn w-100 rounded-pill fw-bold py-2 d-flex justify-content-center align-items-center gap-2 shadow-sm"
                    disabled={submitting}
                    style={{ background: 'linear-gradient(135deg, #22c55e, #14b8a6)', color: 'white', border: 'none' }}
                  >
                    {submitting ? <span className="spinner-border spinner-border-sm" /> : <Send size={18} />}
                    {submitting ? 'Sharing...' : 'Share with Students'}
                  </button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
