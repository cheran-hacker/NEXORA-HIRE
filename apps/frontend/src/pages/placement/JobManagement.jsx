import React, { useState, useEffect } from "react";
import { useToast } from '../../context/ToastContext';
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  Plus,
  Users,
  Search,
  Clock,
  MapPin,
  Building,
  DollarSign,
  MoreVertical,
  X,
  Save,
  CheckCircle2,
  XCircle,
  FileText,
  Calendar,
  GraduationCap
} from "lucide-react";
import { jobService } from "../../services/api.js";

const JobManagement = () => {
  const { addToast } = useToast();
  const [jobs, setJobs] = useState([]);
  const [activeTab, setActiveTab] = useState('MyJobs');
  const [loading, setLoading] = useState(true); 

  // Create Job State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newJob, setNewJob] = useState({
    title: "",
    company: "",
    description: "",
    location: "",
    type: "Full-Time",
    salary: { min: "", max: "", currency: "INR" },
    skills: "",
    requirements: "",
    deadline: "",
    minimumCGPA: "",
    eligibleBatches: "",
    eligibleBranches: ""
  }); 

  // Applications View State
  const [selectedJob, setSelectedJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [appsLoading, setAppsLoading] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, [activeTab]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      let res;
      if (activeTab === 'MyJobs') {
        res = await jobService.getMyJobs();
      } else {
        res = await jobService.getAll({ source: 'Alumni', approvalStatus: 'Pending' });
      }
      setJobs(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch recruiter jobs", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newJob,
        company: newJob.company.trim(),
        skills: newJob.skills.split(",").map(s => s.trim()).filter(Boolean),
        requirements: newJob.requirements.split(",").map(s => s.trim()).filter(Boolean),
        salary: {
          min: Number(newJob.salary.min),
          max: Number(newJob.salary.max),
          currency: newJob.salary.currency,
        },
        deadline: newJob.deadline ? new Date(newJob.deadline).toISOString() : undefined,
        minimumCGPA: newJob.minimumCGPA ? Number(newJob.minimumCGPA) : 0,
        eligibleBatches: newJob.eligibleBatches.split(",").map(s => Number(s.trim())).filter(Boolean),
        eligibleBranches: newJob.eligibleBranches.split(",").map(s => s.trim()).filter(Boolean),
      };
      
      await jobService.create(payload);
      setShowCreateModal(false);
      
      // Reset
      setNewJob({
        title: "", company: "", description: "", location: "", type: "Full-Time",
        salary: { min: "", max: "", currency: "INR" }, skills: "", requirements: "",
        deadline: "", minimumCGPA: "", eligibleBatches: "", eligibleBranches: ""
      });
      addToast("Opportunity successfully created", "success");
      fetchJobs();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to create opportunity", 'error');
    }
  };

  const handleDeleteJob = async (id) => {
    if (window.confirm("Are you sure you want to withdraw this opportunity? All applications will be lost.")) {
      try {
        await jobService.delete(id);
        fetchJobs();
      } catch (err) {
        addToast("Failed to delete job", 'error');
      }
    }
  };

  const viewApplications = async (job) => {
    setSelectedJob(job);
    setAppsLoading(true);
    try {
      const res = await jobService.getApplications(job._id);
      setApplications(res.data.data || []);
    } catch (err) {
      console.error("Failed to load apps", err);
    } finally {
      setAppsLoading(false);
    }
  };

  const updateStatus = async (appId, status) => {
    try {
      await jobService.updateStatus(selectedJob._id, appId, status);
      setApplications((prev) =>
        prev.map((app) => (app._id === appId ? { ...app, status } : app)),
      );
      addToast(`Status updated to ${status}`, "success");
    } catch (err) {
      addToast("Failed to update status", 'error');
    }
  };

  const handleApproveVacancy = async (id) => {
    try {
      await jobService.approveVacancy(id);
      addToast("Vacancy approved and students notified", 'success');
      fetchJobs();
    } catch (err) {
      addToast("Failed to approve vacancy", 'error');
    }
  };

  return (
    <div className="container-fluid py-4 px-xl-5" style={{ position: 'relative' }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-5">
        <div>
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="fw-black mb-1 d-flex align-items-center gap-3"
            style={{ fontSize: "2.5rem", letterSpacing: "-0.02em", color: "var(--text)" }}
          >
            Placement Dashboard
          </motion.h2>
          <p className="text-muted fw-medium">
            Manage campus recruitment, view applicants, and update status.
          </p>
        </div>
        <button
          className="btn btn-primary rounded-pill px-4 fw-bold d-flex align-items-center gap-2 shadow-sm hover-lift"
          style={{ background: "linear-gradient(135deg, var(--primary), var(--purple))", border: "none" }}
          onClick={() => setShowCreateModal(true)}
        >
          <Plus size={18} /> Post New Opportunity
        </button>
      </div>

      {/* Tabs */}
      {!selectedJob && (
        <ul className="nav nav-pills mb-4 gap-2">
          <li className="nav-item">
            <button 
              className={`nav-link rounded-pill fw-bold px-4 ${activeTab === 'MyJobs' ? 'active' : 'bg-card text-muted border'}`}
              onClick={() => setActiveTab('MyJobs')}
            >
              My Opportunities
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link rounded-pill fw-bold px-4 ${activeTab === 'Pending' ? 'active' : 'bg-card text-muted border'}`}
              onClick={() => setActiveTab('Pending')}
            >
              Pending Alumni Vacancies
            </button>
          </li>
        </ul>
      )}

      {/* Main Content */}
      {!selectedJob ? (
        <div className="row g-4">
          {loading ? (
            <div className="col-12 text-center py-5">
              <div className="spinner-border text-primary" />
            </div>
          ) : jobs.length === 0 ? (
            <div className="col-12 text-center py-5 bento-card w-100">
              <Briefcase size={48} className="text-muted mb-3 mx-auto" />
              <h5 className="fw-bold">No jobs posted yet</h5>
              <p className="text-muted">Click 'Post New Opportunity' to start recruiting.</p>
            </div>
          ) : (
            jobs.map((job) => (
              <motion.div key={job._id} className="col-md-6 col-lg-4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <div className="bento-card p-4 h-100 hover-glow d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h5 className="fw-bold mb-1">{job.title}</h5>
                      <div className="d-flex align-items-center gap-2">
                        <span className={`badge ${job.status === "Closed" ? "bg-danger-subtle text-danger" : "bg-success-subtle text-success"} rounded-pill`}>
                          {job.status}
                        </span>
                        <small className="text-muted fw-bold">{job.company}</small>
                      </div>
                    </div>
                    <button className="btn btn-sm btn-light rounded-circle text-danger hover-scale" onClick={() => handleDeleteJob(job._id)}>
                      <X size={16} />
                    </button>
                  </div>
                  
                  <div className="text-muted small fw-semibold d-flex flex-column gap-2 mb-4 flex-grow-1">
                    <span className="d-flex align-items-center gap-2"><MapPin size={14} /> {job.location}</span>
                    <span className="d-flex align-items-center gap-2"><Briefcase size={14} /> {job.type}</span>
                    {job.salary && (
                      <span className="d-flex align-items-center gap-2"><DollarSign size={14} /> {job.salary.min} - {job.salary.max} {job.salary.currency}</span>
                    )}
                    {job.deadline && (
                      <span className="d-flex align-items-center gap-2 text-warning"><Clock size={14} /> Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                    )}
                  </div>
                  
                  <div className="d-flex justify-content-between align-items-center pt-3 border-top" style={{ borderColor: "var(--border)" }}>
                    <div className="d-flex align-items-center gap-2 text-primary fw-bold small">
                      <Users size={16} /> {job.metrics?.applications || 0} Apps
                    </div>
                    {activeTab === 'Pending' ? (
                      <button className="btn btn-sm btn-success rounded-pill fw-bold" onClick={() => handleApproveVacancy(job._id)}>Approve Vacancy</button>
                    ) : (
                      <button className="btn btn-sm btn-outline-primary rounded-pill fw-bold" onClick={() => viewApplications(job)}>Review Apps</button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      ) : (
        /* Applications View */
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bento-card p-0 overflow-hidden">
          <div className="p-4 border-bottom d-flex justify-content-between align-items-center bg-primary-subtle">
            <div>
              <h4 className="fw-bold text-primary mb-1">{selectedJob.title} Candidates</h4>
              <p className="text-primary opacity-75 small mb-0">{selectedJob.company} • {selectedJob.location} • {selectedJob.type}</p>
            </div>
            <button className="btn btn-light rounded-pill px-4 fw-bold shadow-sm hover-scale" onClick={() => setSelectedJob(null)}>
              Back to Jobs
            </button>
          </div>
          
          <div className="p-0">
            {appsLoading ? (
              <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
            ) : applications.length === 0 ? (
              <div className="text-center py-5 text-muted">No applications received yet.</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0" style={{ "--bs-table-bg": "transparent", "--bs-table-color": "var(--text)" }}>
                  <thead style={{ background: "var(--bg-secondary)" }}>
                    <tr>
                      <th className="px-4 py-3 border-0 text-muted fw-bold small text-uppercase">Applicant</th>
                      <th className="py-3 border-0 text-muted fw-bold small text-uppercase">AI Match Score</th>
                      <th className="py-3 border-0 text-muted fw-bold small text-uppercase">Resume</th>
                      <th className="py-3 border-0 text-muted fw-bold small text-uppercase">Applied On</th>
                      <th className="py-3 border-0 text-muted fw-bold small text-uppercase">Status</th>
                      <th className="px-4 py-3 border-0 text-muted fw-bold small text-uppercase text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app, i) => (
                      <tr key={app._id} style={{ borderTop: i > 0 ? "1px solid var(--border)" : "none" }}>
                        <td className="px-4 py-3">
                          <div className="d-flex align-items-center gap-3">
                            <img src={app.studentId?.avatar || `https://ui-avatars.com/api/?name=${app.studentId?.name?.[0] || 'S'}&background=random`} width={40} height={40} className="rounded-circle shadow-sm" alt="Student" />
                            <div>
                              <div className="fw-bold text-body">{app.studentId?.name || "Unknown"}</div>
                              <div className="text-muted small">{app.studentId?.studentProfile?.branch || "No branch"} • {app.studentId?.studentProfile?.cgpa || "No CGPA"} CGPA</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3">
                          <span className={`badge ${app.aiAnalysis?.atsScore >= 70 ? 'bg-success-subtle text-success' : app.aiAnalysis?.atsScore >= 40 ? 'bg-warning-subtle text-warning' : 'bg-danger-subtle text-danger'}`}>
                            {app.aiAnalysis?.atsScore || 0}%
                          </span>
                        </td>
                        <td className="py-3">
                          <a href={app.resumeUrl} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-secondary rounded-pill d-flex align-items-center gap-1 w-max-content">
                            <FileText size={14} /> View
                          </a>
                        </td>
                        <td className="py-3 text-muted small fw-medium">{new Date(app.createdAt).toLocaleDateString()}</td>
                        <td className="py-3">
                          <select 
                            className="form-select form-select-sm fw-bold border-0 shadow-sm w-auto"
                            style={{ 
                              background: app.status === 'Applied' ? 'var(--bg-secondary)' : app.status === 'Shortlisted' ? 'var(--info-subtle)' : app.status === 'Interview' ? 'var(--warning-subtle)' : app.status === 'Offered' ? 'var(--success-subtle)' : 'var(--danger-subtle)',
                              color: app.status === 'Applied' ? 'var(--text)' : app.status === 'Shortlisted' ? 'var(--info)' : app.status === 'Interview' ? 'var(--warning)' : app.status === 'Offered' ? 'var(--success)' : 'var(--danger)',
                            }}
                            value={app.status}
                            onChange={(e) => updateStatus(app._id, e.target.value)}
                          >
                            <option value="Applied">Applied</option>
                            <option value="Screening">Screening</option>
                            <option value="Shortlisted">Shortlisted</option>
                            <option value="Interview">Interview</option>
                            <option value="Offered">Offered</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 text-end">
                          <button className="btn btn-sm btn-light rounded-circle shadow-sm">
                            <MoreVertical size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Create Modal overlay */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="modal-backdrop show" style={{ zIndex: 1040 }}></div>
        )}
      </AnimatePresence>
      <div className={`modal fade ${showCreateModal ? "show d-block" : ""}`} tabIndex="-1" style={{ zIndex: 1050 }}>
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="modal-content rounded-4 border-0 shadow-lg" style={{ background: "var(--bg)" }}>
            <div className="modal-header border-bottom-0 pb-0 px-4 pt-4">
              <h4 className="fw-black text-ultra mb-0" style={{ color: "var(--text)" }}>Create New Opportunity</h4>
              <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)}></button>
            </div>
            <div className="modal-body p-4">
              <form onSubmit={handleCreateJob}>
                
                <h6 className="fw-bold text-primary mb-3"><Briefcase size={16} className="me-2" /> Basic Details</h6>
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Job Title *</label>
                    <input type="text" className="form-control" required value={newJob.title} onChange={e => setNewJob({...newJob, title: e.target.value})} placeholder="e.g. Frontend Engineer" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Company Name *</label>
                    <input type="text" className="form-control" required value={newJob.company} onChange={e => setNewJob({...newJob, company: e.target.value})} placeholder="e.g. Google" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Location *</label>
                    <input type="text" className="form-control" required value={newJob.location} onChange={e => setNewJob({...newJob, location: e.target.value})} placeholder="e.g. Remote, Bangalore" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Job Type *</label>
                    <select className="form-select" value={newJob.type} onChange={e => setNewJob({...newJob, type: e.target.value})}>
                      <option>Full-Time</option>
                      <option>Internship</option>
                      <option>Part-Time</option>
                      <option>Contract</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="form-label small fw-bold">Job Description *</label>
                    <textarea className="form-control" rows="3" required value={newJob.description} onChange={e => setNewJob({...newJob, description: e.target.value})} placeholder="Describe the role..." />
                  </div>
                </div>

                <h6 className="fw-bold text-primary mb-3 mt-4"><GraduationCap size={16} className="me-2" /> Eligibility & Requirements</h6>
                <div className="row g-3 mb-4 p-3 bg-secondary-subtle rounded-3">
                  <div className="col-md-4">
                    <label className="form-label small fw-bold">Minimum CGPA</label>
                    <input type="number" step="0.1" className="form-control" value={newJob.minimumCGPA} onChange={e => setNewJob({...newJob, minimumCGPA: e.target.value})} placeholder="e.g. 7.5" />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-bold">Eligible Batches</label>
                    <input type="text" className="form-control" value={newJob.eligibleBatches} onChange={e => setNewJob({...newJob, eligibleBatches: e.target.value})} placeholder="e.g. 2024, 2025" />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-bold">Eligible Branches</label>
                    <input type="text" className="form-control" value={newJob.eligibleBranches} onChange={e => setNewJob({...newJob, eligibleBranches: e.target.value})} placeholder="e.g. CSE, IT" />
                  </div>
                  <div className="col-12 mt-3">
                    <label className="form-label small fw-bold">Skills Required (Comma separated)</label>
                    <input type="text" className="form-control" value={newJob.skills} onChange={e => setNewJob({...newJob, skills: e.target.value})} placeholder="e.g. React, Node.js, MongoDB" />
                  </div>
                  <div className="col-12 mt-3">
                    <label className="form-label small fw-bold">Additional Requirements (Comma separated)</label>
                    <input type="text" className="form-control" value={newJob.requirements} onChange={e => setNewJob({...newJob, requirements: e.target.value})} placeholder="e.g. Strong communication, 6 months internship" />
                  </div>
                </div>

                <h6 className="fw-bold text-primary mb-3 mt-4"><DollarSign size={16} className="me-2" /> Compensation & Timeline</h6>
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label small fw-bold">Min Salary</label>
                    <input type="number" className="form-control" required value={newJob.salary.min} onChange={e => setNewJob({...newJob, salary: {...newJob.salary, min: e.target.value}})} placeholder="e.g. 500000" />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-bold">Max Salary</label>
                    <input type="number" className="form-control" required value={newJob.salary.max} onChange={e => setNewJob({...newJob, salary: {...newJob.salary, max: e.target.value}})} placeholder="e.g. 800000" />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-bold text-danger">Application Deadline</label>
                    <input type="date" className="form-control border-danger-subtle" required value={newJob.deadline} onChange={e => setNewJob({...newJob, deadline: e.target.value})} />
                  </div>
                </div>

                <div className="mt-5 d-flex gap-3 justify-content-end">
                  <button type="button" className="btn btn-light rounded-pill px-4 fw-bold" onClick={() => setShowCreateModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary rounded-pill px-5 fw-bold d-flex align-items-center gap-2" style={{ background: "linear-gradient(135deg, var(--primary), var(--purple))", border: "none" }}>
                    <Save size={18} /> Publish Opportunity
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default JobManagement;
