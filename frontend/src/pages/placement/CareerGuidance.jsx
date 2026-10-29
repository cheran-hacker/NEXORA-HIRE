import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Target,
  Users,
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Search,
  Mail,
  Calendar,
  Clock,
  MessageSquare,
  Video,
  ExternalLink,
  Briefcase,
  GraduationCap,
  Sparkles,
  Plus,
  X,
  FileText,
  UserCheck,
  Check
} from "lucide-react";
import { placementService } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { motion, AnimatePresence } from "framer-motion";

export default function CareerGuidance() {
  const [data, setData] = useState({
    attentionRequired: [],
    allStudents: [],
    discussions: [],
    mentors: []
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [discussionFilter, setDiscussionFilter] = useState("ALL");
  const { addToast } = useToast();

  // Modals state
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Mentorship schedule form
  const [formData, setFormData] = useState({
    studentId: "",
    mentorId: "",
    topic: "Soft Skills & Interview Prep",
    skillGaps: ["Soft Skills", "Interview Prep"],
    scheduledDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    scheduledStartTime: "18:00",
    durationMinutes: 30,
    notes: ""
  });

  // Notes form for discussion
  const [discussionNotes, setDiscussionNotes] = useState("");

  useEffect(() => {
    fetchGuidance();
  }, []);

  const fetchGuidance = async () => {
    try {
      setLoading(true);
      const res = await placementService.getGuidance();
      setData(
        res.data?.data || {
          attentionRequired: [],
          allStudents: [],
          discussions: [],
          mentors: []
        }
      );
    } catch (err) {
      console.error("Failed to load guidance data:", err);
      addToast("Failed to load guidance data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSchedule = (student = null) => {
    const targetStudent = student || data.attentionRequired[0] || data.allStudents[0];
    const targetMentor = data.mentors?.[0] || null;

    setSelectedStudent(targetStudent);
    setFormData({
      studentId: targetStudent?._id || "",
      mentorId: targetMentor?._id || "",
      topic: targetStudent?.skillGap?.length
        ? `${targetStudent.skillGap.join(" & ")} Coaching`
        : "Career Guidance & Mock Interview",
      skillGaps: targetStudent?.skillGap || ["Interview Prep", "Soft Skills"],
      scheduledDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
      scheduledStartTime: "18:00",
      durationMinutes: 30,
      notes: targetStudent?.needsAttention
        ? `Student has 0 job applications. Needs guidance in interview readiness and confidence.`
        : ""
    });
    setIsScheduleModalOpen(true);
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.studentId || !formData.mentorId) {
      addToast("Please select both a student and an alumni mentor", "warning");
      return;
    }

    try {
      setSubmitting(true);
      const res = await placementService.scheduleGuidanceMentorship(formData);
      addToast(
        res.data?.message || "Alumni mentorship discussion successfully scheduled!",
        "success"
      );
      setIsScheduleModalOpen(false);
      fetchGuidance();
    } catch (err) {
      console.error("Failed to schedule mentorship:", err);
      addToast(
        err.message || err.response?.data?.message || "Failed to schedule mentorship discussion",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (discussionId, newStatus) => {
    try {
      await placementService.updateDiscussionStatus(discussionId, { status: newStatus });
      addToast(`Discussion status marked as ${newStatus}`, "success");
      fetchGuidance();
    } catch (err) {
      addToast("Failed to update discussion status", "error");
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedDiscussion) return;
    try {
      setSubmitting(true);
      await placementService.updateDiscussionStatus(selectedDiscussion._id, {
        sharedNotes: discussionNotes
      });
      addToast("Guidance discussion notes updated!", "success");
      setIsNotesModalOpen(false);
      fetchGuidance();
    } catch (err) {
      addToast("Failed to save notes", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAttention = (data.attentionRequired || []).filter((s) =>
    s.name?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredAll = (data.allStudents || []).filter(
    (s) =>
      s.name?.toLowerCase().includes(search.toLowerCase()) && !s.needsAttention
  );

  const filteredDiscussions = (data.discussions || []).filter((d) => {
    const studentName = d.mentee?.name?.toLowerCase() || "";
    const mentorName = d.mentor?.name?.toLowerCase() || "";
    const topic = d.topic?.toLowerCase() || "";
    const matchesSearch =
      studentName.includes(search.toLowerCase()) ||
      mentorName.includes(search.toLowerCase()) ||
      topic.includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (discussionFilter === "ALL") return true;
    return d.status?.toUpperCase() === discussionFilter;
  });

  const quickTopics = [
    "Soft Skills & Interview Prep",
    "Mock Technical Coding (LeetCode/DSA)",
    "System Design & Cloud Architecture",
    "Resume Overhaul & ATS Optimization",
    "Placement Drive Strategy & Negotiation"
  ];

  return (
    <div className="container-fluid py-4 px-xl-5">
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <h2 className="fw-black m-0 text-gradient-primary">
              Career Guidance & Alumni Mentorship 🧭
            </h2>
            <span className="badge bg-primary-subtle text-primary border border-primary border-opacity-25 rounded-pill px-3 py-1">
              Live Guidance Hub
            </span>
          </div>
          <p className="fw-medium m-0 text-muted">
            Identify at-risk students, connect them with industry Alumni for 1-on-1 discussions, and track interview readiness.
          </p>
        </div>

        <button
          className="btn btn-primary d-flex align-items-center gap-2 rounded-pill px-4 py-2 fw-bold shadow-sm"
          onClick={() => handleOpenSchedule()}
        >
          <Plus size={18} /> Pair Mentorship Discussion
        </button>
      </div>

      {/* Metrics Row */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div
            className="bento-card p-3 border border-danger border-opacity-25"
            style={{ background: "var(--surface-2)" }}
          >
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <small className="text-muted fw-bold text-uppercase d-block" style={{ fontSize: "0.7rem" }}>
                  Requires Attention
                </small>
                <h4 className="fw-black text-danger m-0 mt-1">
                  {data.attentionRequired?.length || 0}
                </h4>
              </div>
              <div
                className="rounded-circle bg-danger-subtle text-danger d-flex align-items-center justify-content-center"
                style={{ width: "42px", height: "42px" }}
              >
                <AlertTriangle size={20} />
              </div>
            </div>
            <small className="text-muted d-block mt-2" style={{ fontSize: "0.75rem" }}>
              Students with 0 applications
            </small>
          </div>
        </div>

        <div className="col-md-3">
          <div
            className="bento-card p-3 border border-primary border-opacity-25"
            style={{ background: "var(--surface-2)" }}
          >
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <small className="text-muted fw-bold text-uppercase d-block" style={{ fontSize: "0.7rem" }}>
                  Student ↔ Alumni Discussions
                </small>
                <h4 className="fw-black text-primary m-0 mt-1">
                  {data.discussions?.length || 0}
                </h4>
              </div>
              <div
                className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center"
                style={{ width: "42px", height: "42px" }}
              >
                <MessageSquare size={20} />
              </div>
            </div>
            <small className="text-muted d-block mt-2" style={{ fontSize: "0.75rem" }}>
              Active 1-on-1 mentorship sessions
            </small>
          </div>
        </div>

        <div className="col-md-3">
          <div
            className="bento-card p-3 border border-info border-opacity-25"
            style={{ background: "var(--surface-2)" }}
          >
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <small className="text-muted fw-bold text-uppercase d-block" style={{ fontSize: "0.7rem" }}>
                  Alumni Mentors Ready
                </small>
                <h4 className="fw-black text-info m-0 mt-1">
                  {data.mentors?.length || 0}
                </h4>
              </div>
              <div
                className="rounded-circle bg-info-subtle text-info d-flex align-items-center justify-content-center"
                style={{ width: "42px", height: "42px" }}
              >
                <GraduationCap size={20} />
              </div>
            </div>
            <small className="text-muted d-block mt-2" style={{ fontSize: "0.75rem" }}>
              Google, Microsoft, AWS & more
            </small>
          </div>
        </div>

        <div className="col-md-3">
          <div
            className="bento-card p-3 border border-success border-opacity-25"
            style={{ background: "var(--surface-2)" }}
          >
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <small className="text-muted fw-bold text-uppercase d-block" style={{ fontSize: "0.7rem" }}>
                  On Track Students
                </small>
                <h4 className="fw-black text-success m-0 mt-1">
                  {data.allStudents?.filter((s) => !s.needsAttention)?.length || 0}
                </h4>
              </div>
              <div
                className="rounded-circle bg-success-subtle text-success d-flex align-items-center justify-content-center"
                style={{ width: "42px", height: "42px" }}
              >
                <CheckCircle size={20} />
              </div>
            </div>
            <small className="text-muted d-block mt-2" style={{ fontSize: "0.75rem" }}>
              Actively applying & interviewing
            </small>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bento-card mb-4 p-3" style={{ background: "var(--surface)" }}>
        <div className="position-relative">
          <Search
            className="position-absolute top-50 translate-middle-y ms-3 text-muted"
            size={18}
          />
          <input
            type="text"
            className="form-control ps-5 rounded-pill"
            placeholder="Search student names, alumni mentors, skill gaps, or discussion topics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              height: "46px",
              background: "var(--surface-2)",
              color: "var(--text)",
              border: "1px solid var(--border)"
            }}
          />
        </div>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center p-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {/* SECTION 1: Requires Immediate Attention */}
          <div className="col-12">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="fw-bold m-0 text-danger d-flex align-items-center gap-2">
                <AlertTriangle size={20} /> Requires Immediate Attention
              </h5>
              <span className="badge bg-danger-subtle text-danger rounded-pill px-3 py-1">
                {filteredAttention.length} Flagged
              </span>
            </div>

            <div className="row g-3">
              {filteredAttention.map((student, idx) => (
                <div className="col-md-6 col-lg-4" key={student._id}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    className="bento-card h-100 p-4 border border-danger border-opacity-25 d-flex flex-column justify-content-between"
                    style={{ background: "var(--surface-2)" }}
                  >
                    <div>
                      <div className="d-flex align-items-center gap-3 mb-3">
                        <div
                          className="rounded-circle overflow-hidden bg-danger-subtle d-flex align-items-center justify-content-center border border-danger border-opacity-25"
                          style={{ width: "50px", height: "50px", flexShrink: 0 }}
                        >
                          {student.avatar ? (
                            <img
                              src={student.avatar}
                              alt={student.name}
                              className="w-100 h-100 object-fit-cover"
                            />
                          ) : (
                            <Users size={22} className="text-danger" />
                          )}
                        </div>
                        <div className="overflow-hidden">
                          <h6 className="fw-bold m-0 text-truncate">{student.name}</h6>
                          <div className="d-flex align-items-center gap-2 mt-1">
                            <span className="badge bg-danger text-white" style={{ fontSize: "0.68rem" }}>
                              0 Applications
                            </span>
                            <span className="text-muted small text-truncate">
                              {student.branch || "Tech"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mb-3">
                        <small
                          className="text-muted text-uppercase fw-bold d-block mb-2"
                          style={{ fontSize: "0.7rem" }}
                        >
                          Identified Skill Gaps
                        </small>
                        <div className="d-flex flex-wrap gap-1">
                          {(student.skillGap || []).map((gap, i) => (
                            <span
                              key={i}
                              className="badge bg-danger-subtle text-danger border border-danger border-opacity-25"
                              style={{ fontSize: "0.75rem" }}
                            >
                              {gap}
                            </span>
                          ))}
                          {(!student.skillGap || student.skillGap.length === 0) && (
                            <span className="text-muted small">No specific gap recorded</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="d-flex gap-2 pt-2 border-top border-secondary border-opacity-10">
                      <button
                        className="btn btn-danger btn-sm w-100 rounded-pill fw-bold d-flex align-items-center justify-content-center gap-2 py-2"
                        onClick={() => handleOpenSchedule(student)}
                      >
                        <Mail size={15} /> Schedule Alumni Mentorship
                      </button>
                      <button
                        className="btn btn-outline-secondary btn-sm rounded-circle p-2"
                        title="View Student Profile"
                        onClick={() => {
                          setSelectedStudent(student);
                          setIsStudentModalOpen(true);
                        }}
                      >
                        <ArrowRight size={15} />
                      </button>
                    </div>
                  </motion.div>
                </div>
              ))}

              {filteredAttention.length === 0 && (
                <div className="col-12">
                  <div className="text-center p-4 text-muted bento-card border-dashed">
                    ✓ All students currently have active job applications!
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 2: Active Student ↔ Alumni Discussions Feed */}
          <div className="col-12 mt-2">
            <div className="bento-card p-4" style={{ background: "var(--surface)" }}>
              <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
                <div>
                  <h5 className="fw-bold m-0 text-primary d-flex align-items-center gap-2">
                    <MessageSquare size={20} /> Student ↔ Alumni Mentorship & Guidance Discussions
                  </h5>
                  <p className="text-muted small m-0 mt-1">
                    Live 1-on-1 interaction sessions between students and alumni mentors.
                  </p>
                </div>

                <div className="d-flex align-items-center gap-2">
                  {["ALL", "SCHEDULED", "CONFIRMED", "COMPLETED"].map((tab) => (
                    <button
                      key={tab}
                      className={`btn btn-sm rounded-pill px-3 fw-bold ${
                        discussionFilter === tab
                          ? "btn-primary"
                          : "btn-outline-secondary border-opacity-25"
                      }`}
                      onClick={() => setDiscussionFilter(tab)}
                    >
                      {tab === "ALL" ? "All Discussions" : tab.charAt(0) + tab.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="row g-3">
                {filteredDiscussions.map((disc, idx) => (
                  <div className="col-lg-6" key={disc._id || idx}>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-3 rounded-4 border position-relative"
                      style={{
                        background: "var(--surface-2)",
                        borderColor:
                          disc.status === "Completed"
                            ? "var(--bs-success)"
                            : "var(--border)"
                      }}
                    >
                      {/* Top Bar: Mentee ⇄ Mentor */}
                      <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom border-secondary border-opacity-10 flex-wrap gap-2">
                        {/* Student / Mentee */}
                        <div className="d-flex align-items-center gap-2">
                          <div
                            className="rounded-circle bg-primary-subtle d-flex align-items-center justify-content-center text-primary fw-bold"
                            style={{ width: "36px", height: "36px" }}
                          >
                            {disc.mentee?.name?.charAt(0) || "S"}
                          </div>
                          <div>
                            <span className="badge bg-secondary-subtle text-secondary" style={{ fontSize: "0.65rem" }}>
                              STUDENT
                            </span>
                            <div className="fw-bold small">{disc.mentee?.name || "Student"}</div>
                          </div>
                        </div>

                        <div className="text-muted fw-bold small px-2">⇄</div>

                        {/* Alumni / Mentor */}
                        <div className="d-flex align-items-center gap-2">
                          <div
                            className="rounded-circle bg-info-subtle d-flex align-items-center justify-content-center text-info fw-bold"
                            style={{ width: "36px", height: "36px" }}
                          >
                            {disc.mentor?.name?.charAt(0) || "A"}
                          </div>
                          <div>
                            <span className="badge bg-info-subtle text-info" style={{ fontSize: "0.65rem" }}>
                              ALUMNI MENTOR
                            </span>
                            <div className="fw-bold small">
                              {disc.mentor?.name || "Alumni"}
                              {disc.mentor?.alumniProfile?.company && (
                                <span className="badge bg-dark text-white ms-1" style={{ fontSize: "0.65rem" }}>
                                  {disc.mentor.alumniProfile.company}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <span
                          className={`badge rounded-pill ms-auto px-3 py-1 ${
                            disc.status === "Completed"
                              ? "bg-success text-white"
                              : disc.status === "Confirmed"
                              ? "bg-primary text-white"
                              : "bg-warning-subtle text-warning"
                          }`}
                        >
                          {disc.status || "Scheduled"}
                        </span>
                      </div>

                      {/* Topic & Focus */}
                      <div className="mb-3">
                        <div className="fw-bold mb-1" style={{ color: "var(--text)" }}>
                          {disc.topic}
                        </div>
                        {disc.skillGaps && disc.skillGaps.length > 0 && (
                          <div className="d-flex flex-wrap gap-1 mt-1">
                            {disc.skillGaps.map((gap, i) => (
                              <span
                                key={i}
                                className="badge bg-secondary-subtle text-secondary"
                                style={{ fontSize: "0.7rem" }}
                              >
                                {gap}
                              </span>
                            ))}
                          </div>
                        )}
                        {disc.sharedNotes && (
                          <div
                            className="p-2 rounded-3 mt-2 text-muted small border border-secondary border-opacity-10"
                            style={{ background: "var(--surface)", fontStyle: "italic" }}
                          >
                            "{disc.sharedNotes}"
                          </div>
                        )}
                      </div>

                      {/* Schedule info & Actions */}
                      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 pt-2 border-top border-secondary border-opacity-10">
                        <div className="d-flex align-items-center gap-3 text-muted small">
                          <span className="d-flex align-items-center gap-1">
                            <Calendar size={14} />
                            {new Date(disc.scheduledStart || disc.scheduledDate).toLocaleDateString()}
                          </span>
                          <span className="d-flex align-items-center gap-1">
                            <Clock size={14} />
                            {new Date(disc.scheduledStart || disc.scheduledDate).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </span>
                        </div>

                        <div className="d-flex align-items-center gap-2">
                          <Link
                            to={`/mentorship/session/${disc._id}`}
                            className="btn btn-outline-primary btn-sm rounded-pill d-flex align-items-center gap-1 px-3"
                            title="Join 1-on-1 Discussion Room"
                          >
                            <Video size={14} /> Join Room
                          </Link>

                          <button
                            className="btn btn-outline-secondary btn-sm rounded-pill d-flex align-items-center gap-1 px-3"
                            onClick={() => {
                              setSelectedDiscussion(disc);
                              setDiscussionNotes(disc.sharedNotes || disc.notes || "");
                              setIsNotesModalOpen(true);
                            }}
                          >
                            <FileText size={14} /> Notes
                          </button>

                          {disc.status !== "Completed" ? (
                            <button
                              className="btn btn-outline-success btn-sm rounded-pill d-flex align-items-center gap-1 px-2"
                              title="Mark Discussion as Completed"
                              onClick={() => handleUpdateStatus(disc._id, "Completed")}
                            >
                              <Check size={14} /> Done
                            </button>
                          ) : (
                            <span className="badge bg-success-subtle text-success d-flex align-items-center gap-1">
                              <CheckCircle size={12} /> Finished
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </div>
                ))}

                {filteredDiscussions.length === 0 && (
                  <div className="col-12">
                    <div className="text-center p-5 text-muted bento-card border-dashed">
                      <MessageSquare size={36} className="text-muted mb-2 opacity-50" />
                      <h6 className="fw-bold">No Mentorship Discussions Found</h6>
                      <p className="small mb-3">
                        Pair a student from the Requires Attention section above to initiate an Alumni Discussion.
                      </p>
                      <button
                        className="btn btn-primary btn-sm rounded-pill px-4 fw-bold"
                        onClick={() => handleOpenSchedule()}
                      >
                        + Schedule Discussion Now
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 3: On Track Students */}
          <div className="col-12 mt-2">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="fw-bold m-0 text-success d-flex align-items-center gap-2">
                <CheckCircle size={20} /> On Track Students
              </h5>
              <span className="badge bg-success-subtle text-success rounded-pill px-3 py-1">
                {filteredAll.length} Active Applicants
              </span>
            </div>

            <div className="row g-3">
              {filteredAll.map((student, idx) => (
                <div className="col-md-6 col-lg-3" key={student._id}>
                  <div
                    className="bento-card p-3 d-flex align-items-center justify-content-between border border-success border-opacity-10 h-100"
                    style={{ background: "var(--surface-2)" }}
                  >
                    <div className="d-flex align-items-center gap-2 overflow-hidden">
                      <div
                        className="rounded-circle bg-success-subtle d-flex align-items-center justify-content-center text-success fw-bold"
                        style={{ width: "36px", height: "36px", flexShrink: 0 }}
                      >
                        {student.name.charAt(0)}
                      </div>
                      <div className="overflow-hidden">
                        <h6 className="m-0 fw-bold fs-6 text-truncate" title={student.name}>
                          {student.name}
                        </h6>
                        <small className="text-success fw-semibold" style={{ fontSize: "0.72rem" }}>
                          {student.applications} Applications
                        </small>
                      </div>
                    </div>
                    <button
                      className="btn btn-sm btn-light rounded-circle p-2 ms-2"
                      title="View Student Details / Connect Alumni"
                      onClick={() => {
                        setSelectedStudent(student);
                        setIsStudentModalOpen(true);
                      }}
                    >
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              ))}

              {filteredAll.length === 0 && (
                <div className="col-12">
                  <div className="text-center p-4 text-muted bento-card border-dashed">
                    No other students found matching criteria.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: Schedule Student ↔ Alumni Mentorship Discussion */}
      <AnimatePresence>
        {isScheduleModalOpen && (
          <div
            className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
            style={{ zIndex: 1060 }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="position-absolute top-0 start-0 w-100 h-100"
              style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
              onClick={() => setIsScheduleModalOpen(false)}
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="position-relative rounded-4 shadow-lg w-100 d-flex flex-column overflow-hidden border"
              style={{
                maxWidth: "680px",
                maxHeight: "92vh",
                background: "var(--card)",
                borderColor: "var(--border)",
                color: "var(--text)"
              }}
              role="dialog"
            >
              {/* Modal Header */}
              <div
                className="d-flex align-items-center justify-content-between px-4 py-3 border-bottom"
                style={{ borderColor: "var(--border)" }}
              >
                <div className="d-flex align-items-center gap-2">
                  <div
                    className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center"
                    style={{ width: "36px", height: "36px" }}
                  >
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h5 className="fw-black m-0">Schedule Student ↔ Alumni Discussion</h5>
                    <small className="text-muted">
                      1-on-1 Guidance, Skill Gap Coaching, & Mock Interview
                    </small>
                  </div>
                </div>
                <button
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="btn btn-link p-1 text-muted text-decoration-none"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-4 overflow-auto" style={{ maxHeight: "calc(92vh - 140px)" }}>
                <form onSubmit={handleScheduleSubmit}>
                  {/* Student Selection */}
                  <div className="mb-3">
                    <label className="form-label fw-bold small text-muted text-uppercase">
                      1. Select Student
                    </label>
                    <select
                      className="form-select rounded-3 py-2"
                      value={formData.studentId}
                      onChange={(e) => {
                        const sid = e.target.value;
                        const st =
                          data.attentionRequired.find((s) => s._id === sid) ||
                          data.allStudents.find((s) => s._id === sid);
                        setSelectedStudent(st);
                        setFormData({
                          ...formData,
                          studentId: sid,
                          topic: st?.skillGap?.length
                            ? `${st.skillGap.join(" & ")} Coaching`
                            : formData.topic,
                          skillGaps: st?.skillGap || ["Interview Prep"]
                        });
                      }}
                      style={{
                        background: "var(--surface-2)",
                        color: "var(--text)",
                        borderColor: "var(--border)"
                      }}
                      required
                    >
                      <optgroup label="⚠️ Requires Immediate Attention (0 Applications)">
                        {data.attentionRequired.map((s) => (
                          <option key={s._id} value={s._id}>
                            {s.name} — 0 Apps ({s.skillGap?.join(", ") || "General Gap"})
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="✓ On Track Students">
                        {data.allStudents
                          .filter((s) => !s.needsAttention)
                          .map((s) => (
                            <option key={s._id} value={s._id}>
                              {s.name} — {s.applications} Applications
                            </option>
                          ))}
                      </optgroup>
                    </select>
                  </div>

                  {/* Alumni Mentor Selection */}
                  <div className="mb-3">
                    <label className="form-label fw-bold small text-muted text-uppercase">
                      2. Pair with Alumni Mentor
                    </label>
                    <div className="row g-2">
                      {(data.mentors || []).slice(0, 4).map((mentor) => (
                        <div className="col-sm-6" key={mentor._id}>
                          <div
                            className={`p-3 rounded-3 border cursor-pointer h-100 transition-all ${
                              formData.mentorId === mentor._id
                                ? "border-primary bg-primary-subtle shadow-sm"
                                : "border-secondary border-opacity-25"
                            }`}
                            style={{
                              background:
                                formData.mentorId === mentor._id
                                  ? undefined
                                  : "var(--surface-2)",
                              cursor: "pointer"
                            }}
                            onClick={() =>
                              setFormData({ ...formData, mentorId: mentor._id })
                            }
                          >
                            <div className="d-flex align-items-center gap-2 mb-1">
                              <div
                                className="rounded-circle bg-dark text-white d-flex align-items-center justify-content-center fw-bold small"
                                style={{ width: "30px", height: "30px" }}
                              >
                                {mentor.name.charAt(0)}
                              </div>
                              <div className="overflow-hidden">
                                <div className="fw-bold small text-truncate">
                                  {mentor.name}
                                </div>
                                <span className="badge bg-primary text-white" style={{ fontSize: "0.65rem" }}>
                                  {mentor.company}
                                </span>
                              </div>
                            </div>
                            <small className="text-muted d-block text-truncate" style={{ fontSize: "0.7rem" }}>
                              {mentor.designation}
                            </small>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Discussion Topic & Skill Gaps */}
                  <div className="mb-3">
                    <label className="form-label fw-bold small text-muted text-uppercase">
                      3. Discussion Topic / Focus Area
                    </label>
                    <div className="d-flex flex-wrap gap-1 mb-2">
                      {quickTopics.map((topic, i) => (
                        <button
                          key={i}
                          type="button"
                          className={`btn btn-sm rounded-pill ${
                            formData.topic === topic
                              ? "btn-primary"
                              : "btn-outline-secondary border-opacity-25"
                          }`}
                          style={{ fontSize: "0.72rem" }}
                          onClick={() => setFormData({ ...formData, topic })}
                        >
                          {topic}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      className="form-control rounded-3"
                      value={formData.topic}
                      onChange={(e) =>
                        setFormData({ ...formData, topic: e.target.value })
                      }
                      style={{
                        background: "var(--surface-2)",
                        color: "var(--text)",
                        borderColor: "var(--border)"
                      }}
                      required
                    />
                  </div>

                  {/* Date, Time, Duration */}
                  <div className="row g-2 mb-3">
                    <div className="col-sm-5">
                      <label className="form-label fw-bold small text-muted text-uppercase">
                        Date
                      </label>
                      <input
                        type="date"
                        className="form-control rounded-3"
                        min={new Date().toISOString().split("T")[0]}
                        value={formData.scheduledDate}
                        onChange={(e) =>
                          setFormData({ ...formData, scheduledDate: e.target.value })
                        }
                        style={{
                          background: "var(--surface-2)",
                          color: "var(--text)",
                          borderColor: "var(--border)"
                        }}
                        required
                      />
                    </div>
                    <div className="col-sm-4">
                      <label className="form-label fw-bold small text-muted text-uppercase">
                        Start Time
                      </label>
                      <input
                        type="time"
                        className="form-control rounded-3"
                        value={formData.scheduledStartTime}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            scheduledStartTime: e.target.value
                          })
                        }
                        style={{
                          background: "var(--surface-2)",
                          color: "var(--text)",
                          borderColor: "var(--border)"
                        }}
                        required
                      />
                    </div>
                    <div className="col-sm-3">
                      <label className="form-label fw-bold small text-muted text-uppercase">
                        Duration
                      </label>
                      <select
                        className="form-select rounded-3"
                        value={formData.durationMinutes}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            durationMinutes: Number(e.target.value)
                          })
                        }
                        style={{
                          background: "var(--surface-2)",
                          color: "var(--text)",
                          borderColor: "var(--border)"
                        }}
                      >
                        <option value={30}>30 min</option>
                        <option value={45}>45 min</option>
                        <option value={60}>60 min</option>
                      </select>
                    </div>
                  </div>

                  {/* Placement Guidance Notes */}
                  <div className="mb-3">
                    <label className="form-label fw-bold small text-muted text-uppercase">
                      Placement Officer's Guidance Instructions
                    </label>
                    <textarea
                      rows={3}
                      className="form-control rounded-3"
                      placeholder="e.g., Focus on interview confidence, soft skills, and solving resume rejection points."
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      style={{
                        background: "var(--surface-2)",
                        color: "var(--text)",
                        borderColor: "var(--border)"
                      }}
                    />
                  </div>

                  {/* Submit Actions */}
                  <div className="d-flex justify-content-end gap-2 pt-3 border-top border-secondary border-opacity-10">
                    <button
                      type="button"
                      className="btn btn-outline-secondary rounded-pill px-4"
                      onClick={() => setIsScheduleModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn btn-primary rounded-pill px-4 fw-bold d-flex align-items-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm" /> Scheduling...
                        </>
                      ) : (
                        <>
                          <Check size={16} /> Confirm & Dispatch Discussion
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: Discussion Notes & Outcomes */}
      <AnimatePresence>
        {isNotesModalOpen && selectedDiscussion && (
          <div
            className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
            style={{ zIndex: 1060 }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="position-absolute top-0 start-0 w-100 h-100"
              style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
              onClick={() => setIsNotesModalOpen(false)}
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="position-relative rounded-4 shadow-lg w-100 border p-4"
              style={{
                maxWidth: "540px",
                background: "var(--card)",
                borderColor: "var(--border)",
                color: "var(--text)"
              }}
            >
              <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom border-secondary border-opacity-10">
                <h5 className="fw-bold m-0 d-flex align-items-center gap-2">
                  <FileText size={18} className="text-primary" /> Discussion Notes & Feedback
                </h5>
                <button
                  onClick={() => setIsNotesModalOpen(false)}
                  className="btn btn-link p-1 text-muted text-decoration-none"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mb-3">
                <small className="text-muted d-block mb-1">Discussion Pairing:</small>
                <div className="fw-bold">
                  {selectedDiscussion.mentee?.name} (Student) ⇄ {selectedDiscussion.mentor?.name} (Alumni Mentor)
                </div>
                <div className="text-muted small mt-1">Topic: {selectedDiscussion.topic}</div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold small text-muted text-uppercase">
                  Shared Guidance Notes & Action Items
                </label>
                <textarea
                  rows={4}
                  className="form-control rounded-3"
                  value={discussionNotes}
                  onChange={(e) => setDiscussionNotes(e.target.value)}
                  placeholder="Record key guidance recommendations, mock interview feedback, or next steps..."
                  style={{
                    background: "var(--surface-2)",
                    color: "var(--text)",
                    borderColor: "var(--border)"
                  }}
                />
              </div>

              <div className="d-flex justify-content-end gap-2">
                <button
                  className="btn btn-outline-secondary rounded-pill px-4"
                  onClick={() => setIsNotesModalOpen(false)}
                >
                  Close
                </button>
                <button
                  disabled={submitting}
                  className="btn btn-primary rounded-pill px-4 fw-bold"
                  onClick={handleSaveNotes}
                >
                  {submitting ? "Saving..." : "Save Notes"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: Student Details & Quick Mentorship */}
      <AnimatePresence>
        {isStudentModalOpen && selectedStudent && (
          <div
            className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
            style={{ zIndex: 1060 }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="position-absolute top-0 start-0 w-100 h-100"
              style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
              onClick={() => setIsStudentModalOpen(false)}
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="position-relative rounded-4 shadow-lg w-100 border p-4"
              style={{
                maxWidth: "520px",
                background: "var(--card)",
                borderColor: "var(--border)",
                color: "var(--text)"
              }}
            >
              <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom border-secondary border-opacity-10">
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="rounded-circle bg-primary-subtle text-primary fw-bold d-flex align-items-center justify-content-center"
                    style={{ width: "42px", height: "42px" }}
                  >
                    {selectedStudent.name?.charAt(0)}
                  </div>
                  <div>
                    <h5 className="fw-bold m-0">{selectedStudent.name}</h5>
                    <small className="text-muted">{selectedStudent.email}</small>
                  </div>
                </div>
                <button
                  onClick={() => setIsStudentModalOpen(false)}
                  className="btn btn-link p-1 text-muted text-decoration-none"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="row g-2 mb-3">
                <div className="col-6">
                  <div className="p-3 rounded-3 border border-secondary border-opacity-10" style={{ background: "var(--surface-2)" }}>
                    <small className="text-muted d-block">Applications</small>
                    <h5 className="fw-bold m-0 mt-1">
                      {selectedStudent.applications || 0}
                    </h5>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-3 rounded-3 border border-secondary border-opacity-10" style={{ background: "var(--surface-2)" }}>
                    <small className="text-muted d-block">Department</small>
                    <h6 className="fw-bold m-0 mt-1 text-truncate">
                      {selectedStudent.branch || "Information Technology"}
                    </h6>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <small className="text-muted fw-bold text-uppercase d-block mb-2">Technical Skills</small>
                <div className="d-flex flex-wrap gap-1">
                  {(selectedStudent.skills || ["JavaScript", "React", "Node.js"]).map((sk, i) => (
                    <span key={i} className="badge bg-secondary-subtle text-secondary">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              <div className="d-flex gap-2">
                <button
                  className="btn btn-outline-secondary rounded-pill w-100"
                  onClick={() => setIsStudentModalOpen(false)}
                >
                  Close
                </button>
                <button
                  className="btn btn-primary rounded-pill w-100 fw-bold d-flex align-items-center justify-content-center gap-2"
                  onClick={() => {
                    setIsStudentModalOpen(false);
                    handleOpenSchedule(selectedStudent);
                  }}
                >
                  <Mail size={16} /> Schedule Alumni Mentorship
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
