import React, { useState, useEffect } from 'react';
import { Users, Send, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { consensusService } from '../../services/api';

export default function AskConsensus() {
  const { addToast } = useToast();
  const [question, setQuestion] = useState('');
  const [industryContext, setIndustryContext] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [previousQuestions, setPreviousQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const res = await consensusService.getQuestions();
      setPreviousQuestions(res.data.data || []);
    } catch (err) {
      addToast("Failed to load consensus questions", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim() || !industryContext.trim()) {
      addToast("Question and Context are required", "warning");
      return;
    }
    
    setSubmitting(true);
    try {
      await consensusService.askQuestion({ question, industryContext, targetRole });
      setSubmitting(false);
      setSubmitted(true);
      addToast("Question routed to relevant alumni!", "success");
      fetchQuestions();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to ask question", "error");
      setSubmitting(false);
    }
  };

  return (
    <div className="container-fluid py-4 px-xl-5">
      <div className="mb-5">
        <h2 className="fw-black mb-1 text-foreground d-flex align-items-center gap-2">
          Ask Multiple Alumni <Users size={28} />
        </h2>
        <p className="text-muted mb-0">Get industry consensus by routing your question to a pool of relevant alumni.</p>
      </div>

      <div className="row g-4">
        <div className="col-lg-5">
          <div className="bento-card bg-card p-4 h-100 shadow-sm border">
            <h4 className="fw-bold mb-4">Post a Question</h4>
            {submitted ? (
              <div className="text-center py-5">
                <CheckCircle2 size={48} className="text-success mb-3 mx-auto" />
                <h5 className="fw-bold">Question Sent!</h5>
                <p className="text-muted small">We've routed your question. You'll be notified when alumni respond.</p>
                <button onClick={() => {setSubmitted(false); setQuestion('');}} className="btn btn-outline-primary mt-3 rounded-pill fw-bold">Ask Another</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-bold small text-muted">Your Question / Assumption</label>
                  <textarea 
                    className="form-control" 
                    rows="3" 
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="e.g. Do I need to learn Kubernetes for a junior backend role?"
                    required
                  ></textarea>
                </div>
                <div className="mb-4">
                  <label className="form-label fw-bold small text-muted">Target Industry / Role</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={industryContext}
                    onChange={(e) => setIndustryContext(e.target.value)}
                    placeholder="e.g. Backend Engineering"
                    required
                  />
                </div>
                <button type="submit" disabled={submitting} className="btn btn-dark w-100 rounded-pill fw-bold py-2 d-flex align-items-center justify-content-center gap-2">
                  {submitting ? 'Routing...' : <>Route to Alumni <Send size={16} /></>}
                </button>
              </form>
            )}
          </div>
        </div>
        
        <div className="col-lg-7">
          <div className="bento-card bg-light p-4 h-100 border">
            <h4 className="fw-bold mb-4">Past Consensus Checks</h4>
            <div className="d-flex flex-column gap-3">
              {previousQuestions.map(q => (
                <div key={q._id} className="bg-card p-4 rounded-3 border">
                  <div className="badge bg-secondary mb-2">{q.industryContext}</div>
                  <h5 className="fw-bold mb-3">Q: {q.question}</h5>
                  <div className="ps-3 border-start border-2 border-primary">
                    <p className="small text-muted fw-bold mb-2">{q.responses.length} Alumni Responses</p>
                    {q.responses.map((r, i) => (
                      <div key={i} className="mb-2">
                        <div className="small text-foreground fst-italic">"{r.answer}"</div>
                        <div className="small text-muted mt-1">— {r.alumniId?.name} ({new Date(r.date).toLocaleDateString()})</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
