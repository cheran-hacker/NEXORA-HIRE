import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Star, Briefcase, GraduationCap, Award } from 'lucide-react';
import { swipeService } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function CandidateSwipe() {
  const { addToast } = useToast();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const res = await swipeService.getCandidatesForRecruiter();
      setCandidates(res.data.data || []);
    } catch (err) {
      addToast('Failed to load candidate pool', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (dir) => {
    const candidate = candidates[0];
    if (!candidate) return;
    setDirection(dir);
    try {
      // dir: 1 for right (like), -1 for left (pass)
      await swipeService.recordSwipe({
        targetId: candidate.id || candidate._id,
        action: dir === 1 ? 'like' : 'pass'
      });
      if (dir === 1) addToast(`Liked ${candidate.name}!`, 'success');
    } catch (err) {
      console.error('Failed to record swipe', err);
    }
    setTimeout(() => {
      setCandidates((prev) => prev.slice(1));
      setDirection(0);
    }, 300);
  };

  if (loading) {
    return (
      <div className="vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary"></div>
      </div>
    );
  }

  if (candidates.length === 0) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center text-center vh-100">
        <div
          className="rounded-circle d-flex align-items-center justify-content-center mb-4 shadow-lg"
          style={{
            width: '96px',
            height: '96px',
            background: 'rgba(var(--primary-rgb), 0.1)',
            color: 'var(--primary)'
          }}
        >
          <Star size={40} className="text-primary animate-pulse" />
        </div>
        <h2 className="fw-bold mb-2" style={{ color: 'var(--text)' }}>
          You're all caught up!
        </h2>
        <p className="fw-medium mx-auto" style={{ color: 'var(--text-secondary)', maxWidth: '400px' }}>
          We'll notify you when the AI MatchMaker finds more candidates that fit your open roles.
        </p>
        <button
          onClick={fetchCandidates}
          className="btn rounded-pill px-4 py-2 mt-4 fw-bold hover-lift"
          style={{
            background: 'var(--surface-2)',
            color: 'var(--text)',
            border: '1px solid var(--border)'
          }}
        >
          Refresh Pool
        </button>
      </div>
    );
  }

  const activeCandidate = candidates[0];

  return (
    <div className="container-fluid d-flex flex-column pt-4 pb-5 position-relative vh-100" style={{ maxWidth: '450px' }}>
      <div className="text-center mb-4">
        <h4 className="fw-bold d-flex align-items-center justify-content-center gap-2" style={{ color: 'var(--text)' }}>
          <Heart size={20} className="text-primary" /> Swipe-to-Hire
        </h4>
        <p className="small fw-medium" style={{ color: 'var(--text-secondary)' }}>
          AI MatchMaker Queue: {candidates.length} candidates
        </p>
      </div>

      <div className="flex-grow-1 position-relative" style={{ perspective: '1000px' }}>
        <AnimatePresence mode="popLayout">
          <motion.div
            key={activeCandidate.id || activeCandidate._id}
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{
              scale: 1,
              opacity: 1,
              y: 0,
              x: direction === 1 ? 400 : direction === -1 ? -400 : 0,
              rotate: direction === 1 ? 15 : direction === -1 ? -15 : 0
            }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.8}
            onDragEnd={(e, { offset }) => {
              const swipeThreshold = 100;
              if (offset.x > swipeThreshold) handleSwipe(1);
              else if (offset.x < -swipeThreshold) handleSwipe(-1);
            }}
            className="position-absolute w-100 h-100 rounded-4 overflow-hidden d-flex flex-column"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
              touchAction: 'none'
            }}
          >
            {/* Candidate Image */}
            <div className="position-relative w-100" style={{ height: '55%', background: 'var(--surface-2)' }}>
              <img
                src={activeCandidate.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(activeCandidate.name || 'Candidate')}&size=400`}
                alt={activeCandidate.name}
                className="w-100 h-100 object-fit-cover pe-none"
              />
              <div
                className="position-absolute w-100 h-100 pe-none"
                style={{
                  top: 0,
                  left: 0,
                  background: 'linear-gradient(to top, var(--surface) 0%, transparent 60%)'
                }}
              ></div>

              {/* Match Badge */}
              <div
                className="position-absolute badge rounded-pill d-flex align-items-center gap-1 shadow-lg border"
                style={{
                  top: '1rem',
                  right: '1rem',
                  background: 'rgba(var(--success-rgb), 0.9)',
                  borderColor: 'rgba(0,0,0,0.05)'
                }}
              >
                <Star size={14} className="text-white fill-white" />
                <span className="text-white fw-bold">{activeCandidate.matchScore || 85}% Match</span>
              </div>
            </div>

            {/* Details */}
            <div className="p-4 flex-grow-1 d-flex flex-column pe-none">
              <div className="mb-2">
                <h2 className="fw-black text-foreground mb-1 tracking-tight" style={{ fontSize: '1.75rem' }}>
                  {activeCandidate.name}
                </h2>
                <div className="d-flex align-items-center gap-2 fw-medium" style={{ color: 'var(--primary)' }}>
                  <Briefcase size={16} /> {activeCandidate.role || 'Software Engineer'}
                </div>
              </div>

              <div className="d-flex align-items-center gap-3 small mb-3" style={{ color: 'var(--text-secondary)' }}>
                {activeCandidate.college && (
                  <span className="d-flex align-items-center gap-1">
                    <GraduationCap size={16} /> {activeCandidate.college}
                  </span>
                )}
                {activeCandidate.batch && (
                  <span className="d-flex align-items-center gap-1">
                    <Award size={16} /> Class of {activeCandidate.batch}
                  </span>
                )}
              </div>

              <div className="d-flex flex-wrap gap-2 mb-3">
                {(activeCandidate.skills || []).map((skill, i) => (
                  <span
                    key={i}
                    className="badge rounded-pill fw-medium"
                    style={{
                      background: 'rgba(var(--primary-rgb), 0.08)',
                      color: 'var(--primary)',
                      border: '1px solid rgba(var(--primary-rgb), 0.15)'
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>

              {activeCandidate.bio && (
                <p
                  className="small mb-auto"
                  style={{
                    color: 'var(--text-secondary)',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {activeCandidate.bio}
                </p>
              )}

              {/* Stats */}
              <div className="d-flex gap-3 pt-3 mt-auto" style={{ borderTop: '1px solid var(--border)' }}>
                <div className="flex-grow-1 text-center rounded-3 py-2" style={{ background: 'var(--surface-2)' }}>
                  <div className="fw-bold fs-5 text-foreground">{activeCandidate.github || 120}</div>
                  <div className="small fw-bold text-uppercase" style={{ color: 'var(--text-secondary)', fontSize: '0.65rem' }}>
                    GitHub Commits
                  </div>
                </div>
                <div className="flex-grow-1 text-center rounded-3 py-2" style={{ background: 'var(--surface-2)' }}>
                  <div className="fw-bold fs-5 text-foreground">{activeCandidate.leetcode || 450}</div>
                  <div className="small fw-bold text-uppercase" style={{ color: 'var(--text-secondary)', fontSize: '0.65rem' }}>
                    LeetCode Points
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      <div className="d-flex justify-content-center gap-4 mt-4 position-relative z-1">
        <button
          onClick={() => handleSwipe(-1)}
          className="btn rounded-circle d-flex align-items-center justify-content-center hover-lift"
          style={{
            width: '64px',
            height: '64px',
            background: 'rgba(var(--danger-rgb), 0.1)',
            border: '1px solid rgba(var(--danger-rgb), 0.2)',
            color: 'var(--danger)',
            boxShadow: '0 0 30px rgba(var(--danger-rgb), 0.15)'
          }}
          title="Pass"
          aria-label="Pass"
        >
          <X size={32} />
        </button>
        <button
          onClick={() => handleSwipe(1)}
          className="btn rounded-circle d-flex align-items-center justify-content-center hover-lift"
          style={{
            width: '64px',
            height: '64px',
            background: 'rgba(var(--success-rgb), 0.1)',
            border: '1px solid rgba(var(--success-rgb), 0.2)',
            color: 'var(--success)',
            boxShadow: '0 0 30px rgba(var(--success-rgb), 0.15)'
          }}
          title="Like"
          aria-label="Like"
        >
          <Heart size={32} className="fill-success" />
        </button>
      </div>
    </div>
  );
}