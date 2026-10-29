import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Briefcase, MapPin, Building, CheckCircle2, AlertCircle, Clock, DollarSign, Sparkles, FileText } from "lucide-react";
import api, { jobService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null); // 'success', 'error', or null
  const [errorMsg, setErrorMsg] = useState("");
  const [hasApplied, setHasApplied] = useState(false);
  const [matchData, setMatchData] = useState({ score: 0, matched: [], missing: [] });
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/jobs/${id}`);
      const jobData = response.data.data || response.data;
      setJob(jobData);

      // Check if already applied
      try {
        const appsRes = await jobService.getMyApplications();
        const apps = appsRes.data.data;
        if (apps.some(app => app.jobId._id === id || app.jobId === id)) {
          setHasApplied(true);
          setApplicationStatus("success");
        }
      } catch (e) {
        console.error("Failed to fetch applications", e);
      }

      // Calculate match
      const requiredSkills = jobData.skills || [];
      const studentSkills = user?.studentProfile?.skills || [];
      const matchedSkills = requiredSkills.filter(s => studentSkills.some(ss => ss.toLowerCase() === s.toLowerCase()));
      const missingSkills = requiredSkills.filter(s => !studentSkills.some(ss => ss.toLowerCase() === s.toLowerCase()));
      const matchScore = requiredSkills.length > 0 ? Math.round((matchedSkills.length / requiredSkills.length) * 100) : 0;
      
      setMatchData({ score: matchScore, matched: matchedSkills, missing: missingSkills });
      
    } catch (error) {
      console.error("Error fetching job:", error);
      setErrorMsg("Failed to load job details. The job may have been removed.");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyClick = () => {
    if (!user?.studentProfile?.resumeUrl) {
      setErrorMsg("Please upload a resume in your profile before applying.");
      setApplicationStatus("error");
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmApply = async () => {
    setShowConfirmModal(false);
    setApplying(true);
    setApplicationStatus(null);
    try {
      await api.post(`/jobs/${id}/apply`, { resumeUrl: user.studentProfile.resumeUrl });
      setApplicationStatus("success");
      setHasApplied(true);
    } catch (error) {
      console.error("Error applying:", error);
      setApplicationStatus("error");
      setErrorMsg(error.response?.data?.message || "Failed to submit application.");
    } finally {
      setApplying(false);
    }
  };

  const isExpired = (deadline) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100" style={{background: "var(--bg)"}}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 text-center px-3" style={{background: "var(--bg)"}}>
        <AlertCircle size={48} className="text-danger mb-3" />
        <h4 className="fw-bold" style={{ color: "var(--text)" }}>Job Not Found</h4>
        <p className="text-muted">{errorMsg || "The opportunity you are looking for does not exist."}</p>
        <button onClick={() => navigate("/student/jobs")} className="btn btn-primary rounded-pill mt-3 px-4 fw-bold">
          Back to Opportunities
        </button>
      </div>
    );
  }

  const expired = isExpired(job.deadline);

  return (
    <div className="container py-4 py-md-5" style={{background: "var(--bg)", minHeight: "100vh"}}>
      <button onClick={() => navigate('/student/jobs')} className="btn btn-link text-decoration-none d-flex align-items-center gap-2 mb-4 p-0 fw-bold" style={{ color: "var(--text-secondary)" }}>
        <ArrowLeft size={18} /> Back to Job Board
      </button>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="rounded-4 p-4 p-md-5 mb-4 shadow-sm" style={{background: "var(--surface)", border: "1px solid var(--border)"}}>
            <div className="d-flex align-items-start gap-4 mb-4">
              <img
                src={job.recruiterId?.avatar || `https://ui-avatars.com/api/?name=${job.company?.[0] || "C"}&background=random&color=fff`}
                width={80}
                height={80}
                className="rounded-4 shadow-sm border"
                alt={job.company}
              />
              <div>
                <h2 className="fw-black mb-2" style={{ color: "var(--text)" }}>{job.title}</h2>
                <div className="d-flex flex-wrap gap-3 text-muted fw-medium">
                  <span className="d-flex align-items-center gap-1"><Building size={16} /> {job.company}</span>
                  <span className="d-flex align-items-center gap-1"><MapPin size={16} /> {job.location || "Remote"}</span>
                  <span className="d-flex align-items-center gap-1"><Briefcase size={16} /> {job.type || "Full-time"}</span>
                  {job.deadline && (
                     <span className={`d-flex align-items-center gap-1 ${expired ? 'text-danger' : 'text-info'}`}>
                       <Clock size={16} /> {expired ? 'Closed' : `Deadline: ${new Date(job.deadline).toLocaleDateString()}`}
                     </span>
                  )}
                </div>
              </div>
            </div>

            <hr className="border opacity-50 mb-5" />

            <div className="mb-5">
              <h5 className="fw-bold mb-3 d-flex align-items-center gap-2 text-primary">
                <Sparkles size={20} /> Match Analysis
              </h5>
              <div className="p-4 rounded-4" style={{background: "var(--bg)", border: "1px solid var(--border)"}}>
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="fw-bold fs-3" style={{color: matchData.score >= 70 ? "var(--success)" : matchData.score >= 40 ? "var(--warning)" : "var(--danger)"}}>
                    {matchData.score}%
                  </div>
                  <div className="text-muted fw-semibold">Profile Match</div>
                </div>
                
                {job.skills && job.skills.length > 0 ? (
                  <div className="row g-3 mt-2">
                    <div className="col-md-6">
                      <small className="text-muted fw-bold d-block mb-2">Matched Skills</small>
                      <div className="d-flex flex-wrap gap-2">
                        {matchData.matched.length > 0 ? matchData.matched.map(s => (
                          <span key={s} className="badge bg-success-subtle text-success px-2 py-1"><CheckCircle2 size={12} className="me-1"/>{s}</span>
                        )) : <small className="text-muted">None</small>}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <small className="text-muted fw-bold d-block mb-2">Missing Skills</small>
                      <div className="d-flex flex-wrap gap-2">
                        {matchData.missing.length > 0 ? matchData.missing.map(s => (
                          <span key={s} className="badge bg-danger-subtle text-danger px-2 py-1"><AlertCircle size={12} className="me-1"/>{s}</span>
                        )) : <small className="text-success">You have all required skills!</small>}
                      </div>
                    </div>
                  </div>
                ) : (
                  <small className="text-muted">No specific skills required.</small>
                )}
              </div>
            </div>

            <div className="mb-5">
              <h5 className="fw-bold mb-3" style={{ color: "var(--text)" }}>About this Role</h5>
              <p className="text-muted lh-lg" style={{ whiteSpace: "pre-wrap" }}>
                {job.description || "No description provided."}
              </p>
            </div>

            {job.requirements && job.requirements.length > 0 && (
              <div className="mb-5">
                <h5 className="fw-bold mb-3" style={{ color: "var(--text)" }}>Requirements</h5>
                <ul className="text-muted lh-lg d-flex flex-column gap-2" style={{listStyle: "none", paddingLeft: 0}}>
                  {job.requirements.map((req, index) => (
                    <li key={index} className="d-flex align-items-start gap-2">
                      <CheckCircle2 size={18} className="text-primary mt-1 flex-shrink-0" /> {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="col-lg-4">
          <div className="rounded-4 p-4 shadow-sm position-sticky" style={{ top: "100px", background: "var(--surface)", border: "1px solid var(--border)" }}>
            <h5 className="fw-bold mb-4 text-center" style={{ color: "var(--text)" }}>Ready to Join?</h5>
            
            {hasApplied || applicationStatus === "success" ? (
              <div className="text-center p-4 bg-success-subtle text-success rounded-4 border border-success">
                <CheckCircle2 size={36} className="mb-2" />
                <h6 className="fw-bold m-0">Application Submitted!</h6>
                <p className="small mt-2 mb-0">Track this in your Applications tab.</p>
              </div>
            ) : expired ? (
              <div className="text-center p-4 bg-danger-subtle text-danger rounded-4 border border-danger">
                <AlertCircle size={36} className="mb-2" />
                <h6 className="fw-bold m-0">Deadline Passed</h6>
                <p className="small mt-2 mb-0">This opportunity is no longer accepting applications.</p>
              </div>
            ) : (
              <>
                <button 
                  onClick={handleApplyClick} 
                  disabled={applying || applicationStatus === "success"}
                  className="btn btn-primary w-100 rounded-pill py-3 fw-bold mb-3 d-flex align-items-center justify-content-center gap-2 shadow-sm hover-scale"
                  style={{background: "linear-gradient(135deg, var(--primary), var(--purple))", border: "none"}}
                >
                  {applying ? (
                    <div className="spinner-border spinner-border-sm text-light" role="status"></div>
                  ) : (
                    "Submit Application"
                  )}
                </button>
                {applicationStatus === "error" && (
                  <div className="text-danger small text-center fw-medium mt-2 p-2 bg-danger-subtle rounded-2">
                    <AlertCircle size={14} className="me-1 mb-1" /> {errorMsg}
                  </div>
                )}
                <p className="text-muted small text-center mt-3 lh-sm">
                  Applying will share your current student profile and resume with the placement recruiter.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg" style={{ background: "var(--surface)" }}>
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold" style={{ color: "var(--text)" }}>Confirm Application</h5>
                <button type="button" className="btn-close" onClick={() => setShowConfirmModal(false)}></button>
              </div>
              <div className="modal-body py-4">
                <p className="text-muted mb-3">You are about to apply for <strong>{job.title}</strong> at <strong>{job.company}</strong>.</p>
                
                <div className="p-3 rounded-3 mb-3" style={{ background: "var(--bg)", border: "1px solid var(--border)" }}>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <FileText size={18} className="text-primary" />
                    <span className="fw-semibold small" style={{ color: "var(--text)" }}>Resume Attached</span>
                  </div>
                  <p className="small text-muted mb-0 text-truncate">
                    {user?.studentProfile?.resumeUrl || "Profile Resume"}
                  </p>
                </div>
                
                {matchData.score < 50 && (
                  <div className="alert alert-warning d-flex gap-2 py-2 mb-0 border-0 rounded-3" style={{ fontSize: "0.85rem" }}>
                    <AlertCircle size={16} className="flex-shrink-0 mt-1" />
                    <div>Your profile match score is {matchData.score}%. Are you sure you want to proceed?</div>
                  </div>
                )}
              </div>
              <div className="modal-footer border-top-0 pt-0">
                <button type="button" className="btn btn-light rounded-pill px-4 fw-medium" onClick={() => setShowConfirmModal(false)}>Cancel</button>
                <button type="button" className="btn btn-primary rounded-pill px-4 fw-bold" onClick={handleConfirmApply}>
                  Confirm & Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
