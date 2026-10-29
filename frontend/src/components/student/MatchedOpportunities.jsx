import React from 'react';
import { Briefcase, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function MatchedOpportunities({ opportunities = [] }) {
  if (opportunities.length === 0) {
    return (
      <div className="bento-card p-4 text-center">
        <Briefcase size={48} className="text-muted mb-3 mx-auto" />
        <h5 className="fw-bold">No Verified Opportunities</h5>
        <p className="text-muted small">We'll notify you when an alumni shares a vacancy that matches your Digital Twin evidence.</p>
      </div>
    );
  }

  return (
    <div className="bento-card p-4 border border-success border-opacity-25">
      <h4 className="fw-black mb-4 d-flex align-items-center gap-2">
        <Briefcase className="text-success" /> Verified Matches
      </h4>
      <div className="d-flex flex-column gap-3">
        {opportunities.map((opp, idx) => (
          <div key={idx} className="bg-light p-3 rounded-3 border position-relative overflow-hidden">
            <div className="position-absolute top-0 start-0 w-100 h-100 bg-success opacity-10 pe-none"></div>
            <div className="d-flex justify-content-between align-items-start position-relative z-1">
              <div>
                <h5 className="fw-bold mb-1">{opp.role}</h5>
                <p className="text-muted small fw-bold mb-2">{opp.company}</p>
              </div>
              <span className="badge bg-success text-white px-3 py-2 rounded-pill shadow-sm">
                Potentially Relevant
              </span>
            </div>
            
            <div className="mt-3 pt-3 border-top position-relative z-1">
              {opp.missingSkills?.length > 0 ? (
                <div>
                  <div className="small fw-bold text-foreground mb-1 d-flex align-items-center gap-1">
                    <AlertCircle size={14} className="text-warning" /> Missing Evidence:
                  </div>
                  <div className="d-flex gap-2 flex-wrap">
                    {opp.missingSkills.map(skill => (
                      <span key={skill} className="badge bg-card border text-secondary">{skill}</span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="small fw-bold text-success d-flex align-items-center gap-1">
                  <CheckCircle2 size={16} /> Profile fully matches required evidence!
                </div>
              )}
            </div>
            
            <div className="mt-3 text-end position-relative z-1">
              <a href={opp.url} target="_blank" rel="noreferrer" className="btn btn-sm btn-dark rounded-pill px-4 fw-bold">
                View Opportunity
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
