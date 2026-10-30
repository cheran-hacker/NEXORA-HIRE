import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  Search,
  MapPin,
  Building2,
  Clock,
  Sparkles,
  CheckCircle2,
  Filter,
  X,
  Send,
  FileText,
  DollarSign
} from "lucide-react";
import { jobService } from "../../services/api.js";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import CompanyLogo from "../../components/common/CompanyLogo.jsx";
import { formatSalaryRange } from "../../utils/salaryHelper.js";

const FILTER_PILLS = ["All", "Full-time", "Internship", "Remote", "On-site"];

const DEFAULT_SEED_JOBS = [
  {
    _id: "seed-swe",
    title: "Software Engineer",
    company: {
      name: "Google",
    },
    salaryText: "₹5–12 LPA",
    location: "Remote",
    jobType: "Full-time",
    description: "Join Google's Core Engineering team to design, build, and deploy distributed systems at global scale. You will work on low-latency microservices, cloud infrastructure, and modern web applications.",
    requirements: ["Proficiency in Go, Java, or C++", "Strong knowledge of Data Structures & Algorithms", "Experience with scalable microservices and Docker"],
    skills: ["Data Structures", "Algorithms", "Go", "Java", "Cloud", "System Design"],
    matchScore: 92,
  },
  {
    _id: "seed-fullstack",
    title: "Full Stack Developer",
    company: {
      name: "Atlassian",
    },
    salaryText: "₹6–12 LPA",
    location: "Bangalore",
    jobType: "Full-time",
    description: "Build robust, high-performance web applications using React, TypeScript, Node.js, and cloud backends with end-to-end reliability and exceptional user experiences.",
    requirements: ["Proficiency in React & Node.js", "Hands-on experience with REST APIs and databases", "Knowledge of CI/CD pipelines"],
    skills: ["React", "Node.js", "TypeScript", "MongoDB", "REST APIs"],
    matchScore: 89,
  },
  {
    _id: "seed-backend",
    title: "Backend Developer",
    company: {
      name: "Microsoft",
    },
    salaryText: "₹4–8 LPA",
    location: "Hyderabad",
    jobType: "Full-time",
    description: "Design and implement high-throughput RESTful services, database schemas, and message queues supporting enterprise cloud services.",
    requirements: ["Solid backend engineering in Java / Node.js", "Experience with relational and NoSQL databases", "Understanding of API security and caching"],
    skills: ["Node.js", "Java", "SQL", "Redis", "Microservices"],
    matchScore: 86,
  },
  {
    _id: "seed-frontend",
    title: "Frontend Developer",
    company: {
      name: "Amazon",
    },
    salaryText: "₹5–10 LPA",
    location: "Bangalore",
    jobType: "Full-time",
    description: "Create pixel-perfect, accessible, and responsive user interfaces for millions of customers using modern React workflows and component systems.",
    requirements: ["Extensive experience with modern React & CSS", "Responsive design and performance optimization", "Familiarity with state management"],
    skills: ["React", "JavaScript", "CSS3", "Tailwind", "HTML5"],
    matchScore: 84,
  },
  {
    _id: "seed-ai-ml",
    title: "AI/ML Engineer",
    company: {
      name: "NVIDIA",
    },
    salaryText: "₹6–15 LPA",
    location: "Remote",
    jobType: "Full-time",
    description: "Train, evaluate, and optimize machine learning models and deep learning pipelines for inference acceleration across edge and datacenter GPU clusters.",
    requirements: ["Strong foundations in PyTorch / TensorFlow", "Experience fine-tuning neural networks and transformers", "Python and CUDA performance awareness"],
    skills: ["Python", "PyTorch", "Machine Learning", "Deep Learning", "TensorFlow"],
    matchScore: 90,
  },
  {
    _id: "seed-data-analyst",
    title: "Data Analyst",
    company: {
      name: "Uber",
    },
    salaryText: "₹4–7 LPA",
    location: "Bangalore",
    jobType: "Full-time",
    description: "Translate complex transactional data into actionable operational and business intelligence using modern analytics tooling and SQL dashboards.",
    requirements: ["Strong SQL queries and aggregation skills", "Proficiency in Python data stack (pandas, numpy)", "Dashboarding with Tableau or PowerBI"],
    skills: ["SQL", "Python", "Tableau", "Data Analysis", "Statistics"],
    matchScore: 81,
  },
];

const JobBoard = () => {
  const { addToast } = useToast();
  const { user } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedJobs, setAppliedJobs] = useState(new Set());
  const [selectedJob, setSelectedJob] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applying, setApplying] = useState(false);
  const [coverNote, setCoverNote] = useState("");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const res = await jobService.getAll({ status: "Open" });
        const apiJobs = res.data?.data || [];

        let myApps = [];
        try {
          const appRes = await jobService.getMyApplications();
          myApps = (appRes.data?.data || []).map((app) =>
            (app.jobId?._id || app.jobId)?.toString()
          );
          setAppliedJobs(new Set(myApps));
        } catch (e) {
          console.warn("Could not fetch user applications", e);
        }

        const studentSkills = user?.studentProfile?.skills || [];

        const normalizedApiJobs = apiJobs.map((j) => {
          const reqSkills = j.skills || [];
          const matchedSkills = reqSkills.filter((s) =>
            studentSkills.some((ss) => ss.toLowerCase() === s.toLowerCase())
          );
          const score = reqSkills.length > 0
            ? Math.round((matchedSkills.length / reqSkills.length) * 100)
            : 75;

          const salaryFormatted = formatSalaryRange(j.salary, j.salaryText || "₹6-12 LPA");

          return {
            _id: j._id,
            title: j.title,
            company: {
              name: j.company || j.recruiterId?.recruiterProfile?.companyName || "Tech Corp",
              logoUrl: j.companyLogo || j.recruiterId?.avatar || `https://ui-avatars.com/api/?name=${j.company?.[0] || "T"}&background=0d6efd&color=fff`,
            },
            salaryText: salaryFormatted,
            location: j.location || "Remote",
            jobType: j.type || "Full-time",
            description: j.description || "Join our high-performing team to build scalable systems.",
            requirements: j.requirements || ["Strong problem-solving skills", "Proficiency in required stack"],
            skills: reqSkills,
            matchScore: score,
          };
        });

        const combined = [...normalizedApiJobs];
        DEFAULT_SEED_JOBS.forEach((seed) => {
          if (!combined.some((j) => j.title.toLowerCase() === seed.title.toLowerCase() && j.company.name.toLowerCase() === seed.company.name.toLowerCase())) {
            combined.push(seed);
          }
        });

        setJobs(combined);
      } catch (err) {
        console.error("Failed to fetch jobs", err);
        setJobs(DEFAULT_SEED_JOBS);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [user]);

  const filteredJobs = jobs.filter((job) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      job.title.toLowerCase().includes(q) ||
      job.company.name.toLowerCase().includes(q) ||
      (job.skills || []).some((s) => s.toLowerCase().includes(q));

    let matchesFilter = true;
    if (activeFilter === "Full-time") {
      matchesFilter = job.jobType?.toLowerCase().includes("full");
    } else if (activeFilter === "Internship") {
      matchesFilter = job.jobType?.toLowerCase().includes("intern");
    } else if (activeFilter === "Remote") {
      matchesFilter = job.location?.toLowerCase().includes("remote");
    } else if (activeFilter === "On-site") {
      matchesFilter = !job.location?.toLowerCase().includes("remote");
    }

    return matchesSearch && matchesFilter;
  });

  const handleOpenApply = (job, e) => {
    e?.stopPropagation();
    setSelectedJob(job);
    setCoverNote("");
    setShowApplyModal(true);
  };

  const handleConfirmApply = async () => {
    if (!selectedJob) return;
    setApplying(true);
    try {
      if (!selectedJob._id.startsWith("seed-")) {
        await jobService.apply(selectedJob._id, {
          resumeUrl: user?.studentProfile?.resumeUrl,
          coverLetter: coverNote,
        });
      }
      setAppliedJobs((prev) => new Set(prev).add(selectedJob._id));
      addToast(`Applied to ${selectedJob.title} at ${selectedJob.company?.name || selectedJob.company || "company"}! 🎉`, "success");
      setShowApplyModal(false);
      setCoverNote("");
    } catch (err) {
      console.error("Application error:", err);
      const msg = err?.response?.data?.message || err?.message || "Failed to submit application. Please check your eligibility.";
      if (msg.toLowerCase().includes("already applied")) {
        setAppliedJobs((prev) => new Set(prev).add(selectedJob._id));
        setShowApplyModal(false);
      }
      addToast(msg, "error");
    } finally {
      setApplying(false);
    }
  };

  return (
    <div
      className="container-fluid py-4 px-3 px-md-4"
      style={{
        background: "var(--bg)",
        minHeight: "100vh",
        color: "var(--text)",
      }}
    >
      <div className="mx-auto" style={{ maxWidth: "1080px" }}>
        {/* Header (Matching Screen 4 in Master UI) */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold mb-0" style={{ fontSize: "1.85rem", letterSpacing: "-0.02em" }}>
            Job Opportunities
          </h2>
        </div>

        {/* Search Bar matching Image 4 */}
        <div
          className="card border-0 rounded-4 shadow-sm mb-4 p-2 px-3 d-flex flex-row align-items-center"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
          }}
        >
          <Search size={20} className="text-muted me-2" />
          <input
            type="text"
            className="form-control border-0 shadow-none py-2"
            placeholder="Search jobs, companies, or skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: "transparent",
              color: "var(--text)",
              fontSize: "0.95rem",
            }}
          />
          {searchQuery && (
            <button
              className="btn btn-link text-muted p-0 me-2"
              onClick={() => setSearchQuery("")}
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Filter Pills matching Image 4 */}
        <div className="d-flex gap-2 flex-wrap mb-4">
          {FILTER_PILLS.map((pill) => {
            const isActive = activeFilter === pill;
            return (
              <button
                key={pill}
                type="button"
                className="btn rounded-pill px-4 py-2 fw-semibold"
                onClick={() => setActiveFilter(pill)}
                style={{
                  background: isActive ? "#0d6efd" : "var(--surface)",
                  color: isActive ? "#ffffff" : "var(--text)",
                  border: isActive ? "none" : "1px solid var(--border)",
                  fontSize: "0.9rem",
                  transition: "all 0.2s ease",
                }}
              >
                {pill}
              </button>
            );
          })}
        </div>

        {/* Job Cards List (Pixel-perfect to Screen 4) */}
        {loading ? (
          <div className="text-center py-5">
            <span className="spinner-border text-primary" />
            <p className="mt-2 text-muted fw-semibold">Loading opportunities...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div
            className="card border-0 rounded-4 shadow-sm p-5 text-center"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <Briefcase size={40} className="text-muted mx-auto mb-2 opacity-50" />
            <h5 className="fw-bold">No jobs matching your criteria</h5>
            <p className="text-muted small">Try switching filters or clearing your search term.</p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {filteredJobs.map((job) => {
              const isApplied = appliedJobs.has(job._id);
              return (
                <motion.div
                  key={job._id}
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                  className="card border-0 rounded-4 shadow-sm p-3 p-md-4 cursor-pointer"
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                  }}
                  onClick={() => handleOpenApply(job)}
                >
                  <div className="d-flex align-items-center justify-content-between gap-3">
                    {/* Left: Company Logo */}
                    <div className="d-flex align-items-center gap-3 gap-md-4 flex-grow-1">
                      <div
                        className="rounded-3 bg-white p-2 d-flex align-items-center justify-content-center shadow-sm flex-shrink-0"
                        style={{
                          width: "56px",
                          height: "56px",
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        <CompanyLogo company={job.company} size={36} />
                      </div>

                      {/* Middle: Job Title, Company, Details Line */}
                      <div>
                        <h5 className="fw-bold mb-1" style={{ fontSize: "1.1rem", color: "var(--text)" }}>
                          {job.title}
                        </h5>
                        <div className="text-muted fw-semibold small mb-2">
                          {job.company.name}
                        </div>
                        <div className="d-flex align-items-center gap-3 text-muted small flex-wrap">
                          <span className="fw-bold" style={{ color: "var(--text)" }}>
                            {job.salaryText}
                          </span>
                          <span className="d-flex align-items-center gap-1">
                            <MapPin size={14} className="text-muted" /> {job.location}
                          </span>
                          <span className="d-flex align-items-center gap-1">
                            <Briefcase size={14} className="text-muted" /> {job.jobType}
                          </span>
                          {job.matchScore && (
                            <span className="badge bg-primary-subtle text-primary rounded-pill fw-bold">
                              {job.matchScore}% Match
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Apply Button matching Image 4 */}
                    <div className="flex-shrink-0">
                      {isApplied ? (
                        <button
                          type="button"
                          disabled
                          className="btn btn-secondary rounded-pill px-4 py-2 fw-semibold btn-sm"
                        >
                          Applied
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-primary rounded-pill px-4 py-2 fw-semibold shadow-sm btn-sm"
                          onClick={(e) => handleOpenApply(job, e)}
                          style={{
                            background: "#0d6efd",
                            border: "none",
                            fontSize: "0.92rem",
                            minWidth: "96px",
                          }}
                        >
                          Apply
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Job Detail & Quick Apply Modal */}
        <AnimatePresence>
          {showApplyModal && selectedJob && (
            <div
              className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
              style={{
                background: "rgba(0, 0, 0, 0.5)",
                zIndex: 9999,
                backdropFilter: "blur(4px)",
              }}
              onClick={() => setShowApplyModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="card border-0 rounded-4 shadow-lg p-4 p-md-5"
                style={{
                  maxWidth: "560px",
                  width: "100%",
                  background: "var(--surface)",
                  color: "var(--text)",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex align-items-center gap-3">
                    <div
                      className="rounded-3 bg-white p-2 d-flex align-items-center justify-content-center shadow-sm flex-shrink-0"
                      style={{
                        width: "50px",
                        height: "50px",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <CompanyLogo company={selectedJob.company} size={32} />
                    </div>
                    <div>
                      <h5 className="fw-bold mb-0">{selectedJob.title}</h5>
                      <small className="text-muted fw-semibold">{selectedJob.company.name}</small>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-link text-muted p-0"
                    onClick={() => setShowApplyModal(false)}
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="d-flex gap-3 text-muted small mb-3">
                  <span>💰 {selectedJob.salaryText}</span>
                  <span>📍 {selectedJob.location}</span>
                  <span>💼 {selectedJob.jobType}</span>
                </div>

                <p className="text-muted small mb-3" style={{ lineHeight: "1.6" }}>
                  {selectedJob.description}
                </p>

                <div className="mb-3">
                  <label className="fw-semibold small d-block mb-1">
                    Cover Note / Elevator Pitch (Optional)
                  </label>
                  <textarea
                    rows={3}
                    className="form-control"
                    placeholder="Briefly explain why you're a standout fit for this role..."
                    value={coverNote}
                    onChange={(e) => setCoverNote(e.target.value)}
                  />
                </div>

                <div className="d-flex gap-2 justify-content-end mt-4">
                  <button
                    type="button"
                    className="btn btn-outline-secondary rounded-pill px-4 fw-semibold"
                    onClick={() => setShowApplyModal(false)}
                  >
                    Cancel
                  </button>
                  {appliedJobs.has(selectedJob._id) ? (
                    <button
                      type="button"
                      disabled
                      className="btn btn-secondary rounded-pill px-4 fw-bold"
                    >
                      Already Applied
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={applying}
                      className="btn btn-primary rounded-pill px-4 fw-bold d-flex align-items-center gap-2"
                      onClick={handleConfirmApply}
                      style={{ background: "#0d6efd", border: "none" }}
                    >
                      {applying ? (
                        <span className="spinner-border spinner-border-sm" />
                      ) : (
                        <Send size={15} />
                      )}
                      {applying ? "Submitting..." : "Submit Application"}
                    </button>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default JobBoard;
