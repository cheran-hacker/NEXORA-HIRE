import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  Search,
  MapPin,
  Building2,
  Clock,
  DollarSign,
  Wifi,
  CheckCircle2,
  Bookmark,
  Sparkles,
  ChevronRight,
  AlertCircle,
  Filter,
  Zap,
  FileText
} from "lucide-react";
import { jobService, studentService } from "../../services/api.js";
import { useToast } from "../../context/ToastContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const JOB_TYPES = ["All", "Full-Time", "Internship", "Part-Time", "Contract"];

const JobBoard = () => {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [filter, setFilter] = useState("All");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);
  
  const [appliedJobs, setAppliedJobs] = useState(new Set());
  const [savedJobs, setSavedJobs] = useState(new Set(user?.studentProfile?.savedJobs || []));
  const [selectedJob, setSelectedJob] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchInput]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const params = {
          status: 'Open',
          approvalStatus: 'Approved'
        };
        if (debouncedSearch) params.search = debouncedSearch;
        if (filter !== 'All') params.type = filter;
        if (remoteOnly) params.location = 'Remote';

        const res = await jobService.getAll(params);
        const apiJobs = res.data.data;
        
        let myApps = [];
        try {
           const appRes = await jobService.getMyApplications();
           myApps = appRes.data.data.map(app => app.jobId._id.toString());
           setAppliedJobs(new Set(myApps));
        } catch (e) {
           console.error("Failed to fetch my applications", e);
        }

        const studentSkills = user?.studentProfile?.skills || [];

        const mappedJobs = apiJobs.map((j) => {
          const requiredSkills = j.skills || [];
          const matchedSkills = requiredSkills.filter(s => 
            studentSkills.some(ss => ss.toLowerCase() === s.toLowerCase())
          );
          const missingSkills = requiredSkills.filter(s => 
            !studentSkills.some(ss => ss.toLowerCase() === s.toLowerCase())
          );
          const matchScore = requiredSkills.length > 0 
            ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
            : 0;

          return {
            _id: j._id,
            title: j.title,
            company: {
              name: j.company || j.recruiterId?.recruiterProfile?.companyName || "Unknown",
              logoUrl: j.recruiterId?.avatar || `https://ui-avatars.com/api/?name=${j.company?.[0] || "C"}&background=random&color=fff`,
            },
            jobType: j.type,
            location: j.location,
            isRemote: j.location?.toLowerCase().includes("remote"),
            salaryRange: j.salary || { min: 0, max: 0, currency: "INR", hidden: false },
            skillsRequired: requiredSkills,
            createdAt: j.createdAt,
            deadline: j.deadline,
            description: j.description || "No description provided.",
            requirements: j.requirements || [],
            match: {
              score: matchScore,
              matched: matchedSkills,
              missing: missingSkills
            }
          };
        });

        mappedJobs.sort((a, b) => {
           if (b.match.score !== a.match.score) return b.match.score - a.match.score;
           return new Date(b.createdAt) - new Date(a.createdAt);
        });

        setJobs(mappedJobs);
        if (mappedJobs.length > 0) setSelectedJob(mappedJobs[0]);
        else setSelectedJob(null);
      } catch (err) {
        console.error("Failed to fetch jobs", err);
        addToast("Failed to load opportunities", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [debouncedSearch, filter, remoteOnly]);

  const handleApplyClick = () => {
    if (!user?.studentProfile?.resumeUrl) {
      addToast("Please upload a resume in your profile before applying.", "error");
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmApply = async () => {
    setShowConfirmModal(false);
    setApplying(true);
    try {
      await jobService.apply(selectedJob._id, { resumeUrl: user.studentProfile.resumeUrl });
      setAppliedJobs((prev) => new Set(prev).add(selectedJob._id));
      addToast("Application submitted successfully! 🚀", "success");
    } catch (err) {
      console.error("Failed to apply", err);
      addToast(
        err.response?.data?.message || "Application failed. You might have already applied.",
        "error"
      );
    } finally {
      setApplying(false);
    }
  };

  const daysAgo = (date) => {
    const diff = Math.floor((Date.now() - new Date(date)) / 86400000);
    return diff === 0 ? "Today" : `${diff}d ago`;
  };

  const isExpired = (deadline) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  return (
    <div
      className="container-fluid py-4 px-xl-5 position-relative overflow-hidden"
      style={{
        background: "var(--bg)",
        minHeight: "100dvh",
        color: "var(--text)",
      }}
    >
      {/* Decorative ambient background */}
      <div 
        className="position-absolute top-0 start-50 translate-middle pointer-events-none opacity-25"
        style={{
          width: '100vw',
          height: '50vh',
          background: 'radial-gradient(ellipse at center, rgba(139, 92, 246, 0.4) 0%, transparent 70%)',
          zIndex: 0,
          mixBlendMode: 'screen'
        }}
      />
      <div 
        className="position-absolute bottom-0 end-0 pointer-events-none opacity-25"
        style={{
          width: '80vw',
          height: '60vh',
          background: 'radial-gradient(circle at center, rgba(16, 185, 129, 0.2) 0%, transparent 60%)',
          zIndex: 0,
          mixBlendMode: 'screen',
          transform: 'translate(30%, 30%)'
        }}
      />

      <div className="position-relative z-1">
        <div className="d-flex justify-content-between align-items-end mb-4">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="fw-black mb-2 d-flex align-items-center gap-3"
              style={{
                fontSize: "3.5rem",
                letterSpacing: "-0.03em",
                color: "var(--text)",
                background: "linear-gradient(to right, #fff, #a78bfa)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}
            >
              Opportunities
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-muted mb-0 fw-medium fs-5"
            >
              Discover {jobs.length} premium roles curated for your digital twin profile
            </motion.p>
          </div>
        </div>

        {/* Search & Filter Bar - Glassmorphism */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-4 mb-4 p-3 shadow-lg"
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          <div className="row g-3 align-items-center">
            <div className="col-md-5">
              <div className="input-group input-group-lg border-0">
                <span className="input-group-text bg-transparent border-0 pe-1">
                  <Search size={22} className="text-primary" />
                </span>
                <input
                  type="text"
                  className="form-control bg-transparent border-0 text-body shadow-none fw-medium"
                  placeholder="Search job title or company..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  style={{ color: 'var(--text)' }}
                />
              </div>
            </div>
            <div className="col-md-4">
              <div className="d-flex gap-2 flex-wrap border-start border-secondary-subtle ps-3">
                {JOB_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilter(type)}
                    className={`btn btn-sm rounded-pill fw-bold transition-fast px-3 py-2 ${
                      filter === type 
                        ? "btn-primary shadow-sm" 
                        : "btn-outline-secondary border-0 hover-bg-subtle"
                    }`}
                    style={filter === type ? {
                      background: "linear-gradient(135deg, var(--primary), var(--purple))",
                      border: "none",
                    } : {}}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <div className="col-md-3 d-flex align-items-center justify-content-end gap-3 pe-4">
              <div className="form-check form-switch mb-0">
                <input
                  className="form-check-input shadow-none cursor-pointer"
                  type="checkbox"
                  id="remoteSwitch"
                  checked={remoteOnly}
                  onChange={(e) => setRemoteOnly(e.target.checked)}
                  style={{ transform: 'scale(1.2)' }}
                />
                <label className="form-check-label fw-bold ms-2 cursor-pointer" htmlFor="remoteSwitch">
                  Remote Only
                </label>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="row g-4">
          {/* Job List */}
          <div className="col-lg-5">
            <div
              className="d-flex flex-column gap-3 pe-2 custom-scrollbar"
              style={{ maxHeight: "calc(100dvh - 270px)", overflowY: "auto" }}
            >
              {loading ? (
                 <div className="text-center py-5 d-flex flex-column align-items-center h-100 justify-content-center">
                   <div className="spinner-grow text-primary mb-3" style={{width: '3rem', height: '3rem'}} />
                   <p className="fw-bold fs-5 text-primary">Curating opportunities...</p>
                 </div>
              ) : jobs.length === 0 ? (
                <div
                  className="text-center py-5 rounded-4 shadow-sm d-flex flex-column align-items-center justify-content-center h-100 glass-panel"
                >
                  <div className="p-4 rounded-circle mb-3" style={{background: 'rgba(255,255,255,0.05)'}}>
                    <Briefcase size={48} className="opacity-50" strokeWidth={1.5} />
                  </div>
                  <h4 className="fw-bold mb-2">No roles found</h4>
                  <p className="text-muted fw-medium">Try adjusting your filters or search terms.</p>
                </div>
              ) : (
                <AnimatePresence>
                  {jobs.map((job, idx) => (
                    <motion.div
                      key={job._id}
                      className={`rounded-4 p-4 cursor-pointer transition-fast position-relative overflow-hidden ${
                        selectedJob?._id === job._id ? "selected-job-card shadow-lg" : "job-card hover-lift"
                      }`}
                      onClick={() => setSelectedJob(job)}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      style={{
                        background: selectedJob?._id === job._id 
                          ? "rgba(139, 92, 246, 0.1)" 
                          : "rgba(255, 255, 255, 0.02)",
                        backdropFilter: "blur(10px)",
                        border: selectedJob?._id === job._id 
                          ? "1px solid rgba(139, 92, 246, 0.5)" 
                          : "1px solid rgba(255, 255, 255, 0.08)",
                      }}
                    >
                      {/* Selection glow effect */}
                      {selectedJob?._id === job._id && (
                        <motion.div 
                          layoutId="activeGlow"
                          className="position-absolute top-0 start-0 w-100 h-100 pointer-events-none"
                          style={{
                            boxShadow: "inset 0 0 20px rgba(139, 92, 246, 0.2)",
                            borderLeft: "4px solid var(--primary)"
                          }}
                        />
                      )}

                      <div className="d-flex align-items-start gap-3 position-relative z-1">
                        <div className="position-relative">
                          <img
                            src={job.company.logoUrl}
                            width={56}
                            height={56}
                            className="rounded-4 shadow-sm"
                            alt={job.company.name}
                            style={{ 
                              border: "1px solid rgba(255,255,255,0.1)", 
                              background: '#fff', 
                              objectFit: 'contain',
                              padding: '2px'
                            }}
                          />
                          {job.match.score > 80 && (
                            <div className="position-absolute top-0 start-100 translate-middle bg-warning rounded-circle p-1 d-flex align-items-center justify-content-center shadow" style={{width: 24, height: 24}}>
                              <Zap size={14} className="text-dark" fill="currentColor"/>
                            </div>
                          )}
                        </div>
                        <div className="flex-grow-1 min-w-0">
                          <div className="d-flex justify-content-between align-items-start mb-1">
                            <h5 className="fw-bold mb-0 text-truncate pe-2" style={{ color: "var(--text)" }}>
                              {job.title}
                            </h5>
                            <small className="text-muted flex-shrink-0 fw-bold" style={{ fontSize: '0.75rem' }}>
                              {daysAgo(job.createdAt)}
                            </small>
                          </div>
                          <div className="d-flex align-items-center gap-2 mb-3 text-muted fw-medium" style={{ fontSize: '0.85rem' }}>
                            <Building2 size={14} /> {job.company.name}
                            <span className="opacity-50">•</span> 
                            <MapPin size={14} /> {job.location}
                          </div>
                          <div className="d-flex gap-2 flex-wrap">
                            <span className="badge rounded-pill px-3 py-2 fw-semibold" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                              {job.jobType}
                            </span>
                            {job.isRemote && (
                              <span className="badge rounded-pill px-3 py-2 fw-semibold text-success d-flex align-items-center gap-1" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                <Wifi size={12} /> Remote
                              </span>
                            )}
                            {job.match.score > 0 && (
                              <span className="badge rounded-pill px-3 py-2 fw-semibold text-warning d-flex align-items-center gap-1" style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                                <Sparkles size={12} /> {job.match.score}% Match
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>

          {/* Job Detail Panel - Premium Glass */}
          <div className="col-lg-7">
            <AnimatePresence mode="wait">
              {!loading && selectedJob ? (
                <motion.div
                  key={selectedJob._id}
                  className="rounded-4 h-100 d-flex flex-column position-relative overflow-hidden shadow-lg"
                  style={{
                    background: "rgba(255, 255, 255, 0.02)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    maxHeight: "calc(100dvh - 270px)", 
                  }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  {/* Decorative Banner Background */}
                  <div 
                    className="position-absolute w-100" 
                    style={{
                      height: '140px',
                      background: `linear-gradient(135deg, rgba(var(--primary-rgb), 0.2), rgba(var(--purple-rgb), 0.2))`,
                      top: 0,
                      left: 0,
                      borderBottom: '1px solid rgba(255,255,255,0.05)'
                    }}
                  />
                  
                  <div className="p-4 p-md-5 position-relative z-1 custom-scrollbar flex-grow-1" style={{ overflowY: "auto" }}>
                    
                    <div className="d-flex align-items-end gap-4 mb-5" style={{ marginTop: '20px' }}>
                      <div className="bg-white p-2 rounded-4 shadow-lg position-relative" style={{ border: '1px solid rgba(255,255,255,0.2)' }}>
                        <img
                          src={selectedJob.company.logoUrl}
                          width={96}
                          height={96}
                          className="rounded-3"
                          alt={selectedJob.company.name}
                          style={{ objectFit: 'contain' }}
                        />
                      </div>
                      <div className="pb-2">
                        <h2 className="fw-black mb-2" style={{ color: "var(--text)", letterSpacing: '-0.02em' }}>
                          {selectedJob.title}
                        </h2>
                        <div className="d-flex align-items-center gap-3 text-muted fw-bold fs-6">
                          <span className="d-flex align-items-center gap-1 text-primary"><Building2 size={18} /> {selectedJob.company.name}</span>
                          <span className="opacity-50">•</span> 
                          <span className="d-flex align-items-center gap-1"><MapPin size={18} /> {selectedJob.location}</span>
                        </div>
                      </div>
                    </div>

                    <div className="d-flex gap-3 flex-wrap mb-5">
                      <div className="p-3 rounded-4 flex-grow-1" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div className="text-muted small fw-bold mb-1 text-uppercase tracking-wider">Job Type</div>
                        <div className="fw-bold fs-5">{selectedJob.jobType}</div>
                      </div>
                      {selectedJob.salaryRange?.hidden === false && (
                         <div className="p-3 rounded-4 flex-grow-1" style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                           <div className="text-success small fw-bold mb-1 text-uppercase tracking-wider">Compensation</div>
                           <div className="fw-bold fs-5 text-success">{selectedJob.salaryRange.min} - {selectedJob.salaryRange.max} {selectedJob.salaryRange.currency}</div>
                         </div>
                      )}
                      <div className="p-3 rounded-4 flex-grow-1" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div className="text-muted small fw-bold mb-1 text-uppercase tracking-wider">Deadline</div>
                        <div className={`fw-bold fs-5 ${isExpired(selectedJob.deadline) ? 'text-danger' : ''}`}>
                          {selectedJob.deadline ? new Date(selectedJob.deadline).toLocaleDateString() : 'Rolling'}
                        </div>
                      </div>
                    </div>

                    {selectedJob.skillsRequired.length > 0 && (
                      <div className="mb-5 position-relative p-4 rounded-4" style={{ background: 'rgba(139, 92, 246, 0.03)', border: '1px solid rgba(139, 92, 246, 0.1)' }}>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                          <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
                            <Sparkles size={20} className="text-primary"/> Digital Twin Match
                          </h5>
                          <div className="fw-black fs-3 text-primary">{selectedJob.match.score}%</div>
                        </div>
                        
                        <div className="row g-4">
                          <div className="col-md-6">
                            <h6 className="text-success fw-bold d-flex align-items-center gap-2 mb-3">
                              <CheckCircle2 size={16}/> Matched Skills
                            </h6>
                            <div className="d-flex flex-wrap gap-2">
                              {selectedJob.match.matched.length > 0 ? selectedJob.match.matched.map(s => (
                                <span key={s} className="badge rounded-pill px-3 py-2 fw-semibold" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }}>{s}</span>
                              )) : <span className="text-muted small fw-medium">No overlapping skills found in your profile.</span>}
                            </div>
                          </div>
                          <div className="col-md-6">
                            <h6 className="text-warning fw-bold d-flex align-items-center gap-2 mb-3">
                              <AlertCircle size={16}/> Missing Skills
                            </h6>
                            <div className="d-flex flex-wrap gap-2">
                              {selectedJob.match.missing.length > 0 ? selectedJob.match.missing.map(s => (
                                <span key={s} className="badge rounded-pill px-3 py-2 fw-semibold" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}>{s}</span>
                              )) : <span className="text-success small fw-bold">You hit every requirement!</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mb-5">
                      <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                        <Briefcase size={20} className="text-primary"/> About the Role
                      </h5>
                      <div className="text-muted lh-lg fs-6 fw-medium" style={{ whiteSpace: "pre-wrap", opacity: 0.9 }}>
                        {selectedJob.description}
                      </div>
                    </div>

                    {selectedJob.requirements.length > 0 && (
                      <div className="mb-5">
                        <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
                          <Filter size={20} className="text-primary"/> Key Requirements
                        </h5>
                        <ul className="text-muted lh-lg fw-medium d-flex flex-column gap-3 list-unstyled">
                          {selectedJob.requirements.map((req, i) => (
                            <li key={i} className="d-flex align-items-start gap-3">
                              <div className="mt-1 bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 24, height: 24 }}>
                                <CheckCircle2 size={14} />
                              </div>
                              <span style={{ opacity: 0.9 }}>{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                  </div>

                  {/* Sticky Premium Apply Footer */}
                  <div 
                    className="flex-shrink-0 w-100 p-4 d-flex gap-3 align-items-center justify-content-between"
                    style={{ 
                      background: 'var(--surface)', 
                      borderTop: '1px solid var(--border)',
                      zIndex: 10
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1, paddingRight: '1rem' }}>
                      <div className="fw-bold text-truncate" style={{ color: 'var(--text)' }}>{selectedJob.title}</div>
                      <div className="text-muted small fw-medium text-truncate">{selectedJob.company.name}</div>
                    </div>
                    
                    <div className="d-flex gap-3">
                      <button
                        onClick={async () => {
                          try {
                            const res = await studentService.toggleSavedJob(selectedJob._id);
                            if (res.data.saved) {
                              setSavedJobs((prev) => new Set([...prev, selectedJob._id]));
                              addToast("Job saved!", "success");
                            } else {
                              setSavedJobs((prev) => {
                                const next = new Set(prev);
                                next.delete(selectedJob._id);
                                return next;
                              });
                              addToast("Removed from saved jobs", "info");
                            }
                          } catch (err) {
                            console.error(err);
                            addToast("Failed to save job", "error");
                          }
                        }}
                        className="btn btn-dark rounded-pill px-4 d-flex align-items-center gap-2 fw-bold"
                        style={{ 
                          border: '1px solid rgba(255,255,255,0.2)',
                          color: savedJobs.has(selectedJob._id) ? "var(--warning)" : "white" 
                        }}
                      >
                        <Bookmark size={18} fill={savedJobs.has(selectedJob._id) ? "currentColor" : "none"} />
                        <span className="d-none d-sm-inline">{savedJobs.has(selectedJob._id) ? "Saved" : "Save"}</span>
                      </button>

                      {appliedJobs.has(selectedJob._id) ? (
                        <button className="btn btn-success rounded-pill px-5 py-2 fw-bold d-flex justify-content-center align-items-center gap-2 shadow-lg" disabled>
                          <CheckCircle2 size={18} /> Applied
                        </button>
                      ) : isExpired(selectedJob.deadline) ? (
                        <button className="btn btn-secondary rounded-pill px-5 py-2 fw-bold d-flex justify-content-center align-items-center gap-2" disabled>
                          <AlertCircle size={18} /> Closed
                        </button>
                      ) : (
                        <button
                          onClick={handleApplyClick}
                          disabled={applying}
                          className="btn btn-primary rounded-pill px-5 py-2 fw-black d-flex justify-content-center align-items-center gap-2 shadow-lg hover-scale flex-shrink-0"
                          style={{
                            background: "linear-gradient(135deg, var(--primary), var(--purple))",
                            border: "none",
                            boxShadow: '0 0 20px rgba(139, 92, 246, 0.4)'
                          }}
                        >
                          {applying ? (
                            <div className="spinner-border spinner-border-sm text-light" role="status"></div>
                          ) : (
                            <>Apply Now <ChevronRight size={18} /></>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                </motion.div>
              ) : (
                !loading && (
                  <div
                    className="rounded-4 h-100 d-flex flex-column align-items-center justify-content-center py-5 shadow-sm"
                    style={{
                      background: "rgba(255, 255, 255, 0.02)",
                      border: "1px solid rgba(255, 255, 255, 0.05)",
                    }}
                  >
                    <div className="position-relative mb-4">
                      <div className="position-absolute top-50 start-50 translate-middle rounded-circle bg-primary opacity-25 blur-xl" style={{width: 100, height: 100, filter: 'blur(30px)'}}></div>
                      <Briefcase size={64} className="text-muted position-relative z-1" strokeWidth={1} />
                    </div>
                    <h4 className="fw-bold mb-2">Select an Opportunity</h4>
                    <p className="text-muted fw-medium">View the complete profile match and apply</p>
                  </div>
                )
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      {/* Confirmation Modal */}
      {showConfirmModal && selectedJob && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg" style={{ background: "var(--surface)" }}>
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold" style={{ color: "var(--text)" }}>Confirm Application</h5>
                <button type="button" className="btn-close" onClick={() => setShowConfirmModal(false)}></button>
              </div>
              <div className="modal-body py-4">
                <p className="text-muted mb-3">You are about to apply for <strong style={{color: "var(--text)"}}>{selectedJob.title}</strong> at <strong style={{color: "var(--text)"}}>{selectedJob.company.name}</strong>.</p>
                
                <div className="p-3 rounded-3 mb-3" style={{ background: "var(--bg)", border: "1px solid var(--border)" }}>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <FileText size={18} className="text-primary" />
                    <span className="fw-semibold small" style={{ color: "var(--text)" }}>Resume Attached</span>
                  </div>
                  <p className="small text-muted mb-0 text-truncate">
                    {user?.studentProfile?.resumeUrl || "Profile Resume"}
                  </p>
                </div>
                
                {selectedJob.match.score < 50 && (
                  <div className="alert alert-warning d-flex gap-2 py-2 mb-0 border-0 rounded-3" style={{ fontSize: "0.85rem", background: "rgba(245, 158, 11, 0.1)", color: "#f59e0b" }}>
                    <AlertCircle size={16} className="flex-shrink-0 mt-1" />
                    <div>Your profile match score is {selectedJob.match.score}%. Are you sure you want to proceed?</div>
                  </div>
                )}
              </div>
              <div className="modal-footer border-top-0 pt-0">
                <button type="button" className="btn btn-light rounded-pill px-4 fw-medium" onClick={() => setShowConfirmModal(false)}>Cancel</button>
                <button type="button" disabled={applying} className="btn btn-primary rounded-pill px-4 fw-bold" onClick={handleConfirmApply}>
                  {applying ? "Applying..." : "Confirm & Apply"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobBoard;
