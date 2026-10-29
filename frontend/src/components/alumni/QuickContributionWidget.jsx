import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Send, CheckCircle } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

export default function QuickContributionWidget() {
  const { addToast } = useToast();
  const [poll, setPoll] = useState(null);
  const [response, setResponse] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchPoll = async () => {
      try {
        const res = await api.get('/alumni/micro-contributions/poll');
        setPoll(res.data.data);
      } catch (err) {
        console.error("Failed to fetch poll", err);
      }
    };
    fetchPoll();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!response.trim()) return;
    
    try {
      setSubmitting(true);
      await api.post('/alumni/micro-contributions', {
        type: poll.type,
        topic: poll.topic,
        industryContext: poll.industryContext,
        response
      });
      setSubmitted(true);
      addToast("Thanks for your 30-second contribution!", "success");
    } catch (err) {
      addToast("Failed to submit contribution", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (!poll && !submitted) return null;

  return (
    <div className="premium-glass-panel p-4 h-100 rounded-4 position-relative overflow-hidden" style={{ border: '1px solid rgba(147, 51, 234, 0.3)' }}>
      <div className="position-absolute end-0 top-0 h-100 w-50" style={{ background: 'linear-gradient(90deg, transparent, rgba(147,51,234,0.05))', pointerEvents: 'none' }} />
      {submitted ? (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4 h-100 d-flex flex-column justify-content-center">
          <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: 64, height: 64, background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>
            <CheckCircle size={32} />
          </div>
          <h4 className="fw-bold mb-2" style={{ color: 'var(--text)' }}>Impact Made!</h4>
          <p className="text-muted small mb-0 px-3">Your insight is now helping students make better career decisions.</p>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="d-flex flex-column h-100 position-relative z-1">
          <div className="d-flex align-items-center gap-3 mb-4">
            <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 shadow-sm" style={{ width: 48, height: 48, background: 'linear-gradient(135deg, #9333ea, #ec4899)', color: 'white' }}>
              <Zap size={22} fill="currentColor" />
            </div>
            <div>
              <h5 className="fw-bold mb-0" style={{ color: 'var(--text)' }}>30-Second Impact</h5>
              <p className="text-muted small mb-0">Help a student today.</p>
            </div>
          </div>
          
          <div className="p-3 rounded-4 mb-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <span className="badge rounded-pill mb-2 fw-medium" style={{ background: 'rgba(147, 51, 234, 0.2)', color: '#d8b4fe' }}>{poll?.type}</span>
            <p className="fw-medium mb-0" style={{ color: 'var(--text)', fontSize: '0.95rem', lineHeight: '1.5' }}>{poll?.topic}</p>
          </div>
          
          <form onSubmit={handleSubmit} className="mt-auto">
            <textarea
              className="form-control premium-input mb-3 rounded-4 p-3 shadow-none"
              rows="2"
              placeholder="Your quick insight..."
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              disabled={submitting}
              style={{ background: 'rgba(0,0,0,0.1)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text)', resize: 'none' }}
            ></textarea>
            <button 
              type="submit" 
              className="btn premium-btn w-100 rounded-pill fw-bold d-flex align-items-center justify-content-center gap-2"
              disabled={submitting || !response.trim()}
              style={{ background: 'linear-gradient(135deg, #9333ea, #3b82f6)', color: 'white', border: 'none', padding: '0.6rem 1.5rem' }}
            >
              {submitting ? 'Submitting...' : <>Share Insight <Send size={16} /></>}
            </button>
          </form>
        </motion.div>
      )}
    </div>
  );
}
