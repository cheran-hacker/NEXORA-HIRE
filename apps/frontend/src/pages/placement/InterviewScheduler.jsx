import React, { useState } from "react";
import { useToast } from '../../context/ToastContext';
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  Video,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { jobService } from "../../services/api";
export default function InterviewScheduler() {
  const { addToast } = useToast();
  const [activeDate, setActiveDate] = useState(new Date());
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [myJobs, setMyJobs] = useState([]);
  const [jobApps, setJobApps] = useState([]);
  const [scheduleData, setScheduleData] = useState({
    jobId: "",
    appId: "",
    title: "Technical Round",
    scheduledAt: "",
    duration: "45 mins",
    interviewer: "",
    link: "",
  });
  useEffect(() => {
    fetchInterviews();
  }, []);
  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const res = await jobService.getMyInterviews();
      setInterviews(res.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
  const handleOpenModal = async () => {
    setShowModal(true);
    try {
      const res = await jobService.getMyJobs();
      setMyJobs(res.data.data || []);
      if (res.data.data.length > 0) {
        handleJobChange(res.data.data[0]._id);
      }
    } catch (e) {
      console.error(e);
    }
  };
  const handleJobChange = async (jobId) => {
    setScheduleData((prev) => ({ ...prev, jobId, appId: "" }));
    setJobApps([]);
    try {
      const res = await jobService.getApplications(jobId);
      setJobApps(res.data.data || []);
      if (res.data.data.length > 0) {
        setScheduleData((prev) => ({ ...prev, appId: res.data.data[0]._id }));
      }
    } catch (e) {
      console.error(e);
    }
  };
  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (
      !scheduleData.jobId ||
      !scheduleData.appId ||
      !scheduleData.scheduledAt
    ) {
      addToast("Please select Job, Candidate, and Date/Time", 'warning');
      return;
    }
    setModalLoading(true);
    try {
      await jobService.scheduleInterview(
        scheduleData.jobId,
        scheduleData.appId,
        {
          title: scheduleData.title,
          type: scheduleData.title,
          scheduledAt: scheduleData.scheduledAt,
          interviewer: scheduleData.interviewer,
          duration: scheduleData.duration,
        },
      );
      setShowModal(false);
      fetchInterviews();
    } catch (e) {
      console.error(e);
      addToast("Failed to schedule interview", 'error');
    } finally {
      setModalLoading(false);
    }
  };
  const filteredInterviews = interviews.filter(
    (i) =>
      i.candidate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.role.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  return (
    <div className="container-fluid space-y-4" style={{ maxWidth: "1200px" }}>
      {" "}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
        {" "}
        <div>
          {" "}
          <h2
            className="fw-black mb-1 d-flex align-items-center gap-2"
            style={{ color: "var(--text)" }}
          >
            {" "}
            <CalendarIcon size={32} className="text-primary" /> Interview
            Scheduler{" "}
          </h2>{" "}
          <p
            className="fw-medium mb-0"
            style={{ color: "var(--text-secondary)" }}
          >
            Manage technical and HR rounds across your talent pool.
          </p>{" "}
        </div>{" "}
        <button
          onClick={handleOpenModal}
          className="btn rounded-pill px-4 py-2 fw-bold shadow-sm d-flex align-items-center gap-2 hover-lift"
          style={{
            background:
              "linear-gradient(135deg, var(--primary), var(--purple))",
            color: "#fff",
            border: "none",
          }}
        >
          {" "}
          <Plus size={18} /> Schedule Interview{" "}
        </button>{" "}
      </div>{" "}
      <div className="row g-4">
        {" "}
        {/* Calendar Sidebar */}{" "}
        <div className="col-lg-4">
          {" "}
          <div className="bento-card p-4 mb-4">
            {" "}
            <div className="d-flex justify-content-between align-items-center mb-4">
              {" "}
              <h5 className="fw-bold m-0" style={{ color: "var(--text)" }}>
                August 2026
              </h5>{" "}
              <div className="d-flex gap-1">
                {" "}
                <button
                  onClick={() => addToast("Previous week", 'info')}
                  className="btn btn-sm btn-outline-secondary rounded-circle p-1"
                >
                  <ChevronLeft size={16} />
                </button>{" "}
                <button
                  onClick={() => addToast("Next week", 'info')}
                  className="btn btn-sm btn-outline-secondary rounded-circle p-1"
                >
                  <ChevronRight size={16} />
                </button>{" "}
              </div>{" "}
            </div>{" "}
            <div
              className="d-grid text-center mb-2 text-muted fw-bold small"
              style={{ gridTemplateColumns: "repeat(7, 1fr)" }}
            >
              {" "}
              <div>Su</div>
              <div>Mo</div>
              <div>Tu</div>
              <div>We</div>
              <div>Th</div>
              <div>Fr</div>
              <div>Sa</div>{" "}
            </div>{" "}
            <div
              className="d-grid text-center gap-1"
              style={{ gridTemplateColumns: "repeat(7, 1fr)" }}
            >
              {" "}
              {/* Mock Calendar Grid */}{" "}
              {Array.from({ length: 31 }).map((_, i) => (
                <div
                  key={i}
                  className={`p-2 rounded-circle cursor-pointer fw-medium transition-fast ${i + 1 === 12 ? "bg-primary text-white shadow-sm" : "hover-bg"}`}
                  style={{ color: i + 1 === 12 ? "#fff" : "var(--text)" }}
                >
                  {" "}
                  {i + 1}{" "}
                </div>
              ))}{" "}
            </div>{" "}
          </div>{" "}
          <div className="bento-card p-4">
            {" "}
            <h5 className="fw-bold mb-4" style={{ color: "var(--text)" }}>
              Quick Stats
            </h5>{" "}
            <div className="d-flex flex-column gap-3">
              {" "}
              <div
                className="d-flex justify-content-between align-items-center p-3 rounded-3"
                style={{ background: "var(--surface-2)" }}
              >
                {" "}
                <span className="text-muted fw-bold small text-uppercase">
                  Today
                </span>{" "}
                <span
                  className="fw-black fs-5"
                  style={{ color: "var(--text)" }}
                >
                  {interviews.length}
                </span>{" "}
              </div>{" "}
              <div
                className="d-flex justify-content-between align-items-center p-3 rounded-3"
                style={{ background: "var(--surface-2)" }}
              >
                {" "}
                <span className="text-muted fw-bold small text-uppercase">
                  This Week
                </span>{" "}
                <span
                  className="fw-black fs-5"
                  style={{ color: "var(--text)" }}
                >
                  {interviews.length}
                </span>{" "}
              </div>{" "}
              <div
                className="d-flex justify-content-between align-items-center p-3 rounded-3"
                style={{ background: "var(--surface-2)" }}
              >
                {" "}
                <span className="text-muted fw-bold small text-uppercase">
                  Pending Response
                </span>{" "}
                <span className="fw-black fs-5 text-warning">
                  {interviews.filter((i) => i.status === "Pending").length}
                </span>{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
        {/* Schedule List */}{" "}
        <div className="col-lg-8">
          {" "}
          <div className="bento-card p-0 overflow-hidden h-100 d-flex flex-column">
            {" "}
            <div
              className="p-4 border-bottom d-flex flex-wrap gap-3 justify-content-between align-items-center"
              style={{
                borderColor: "var(--border) !important",
                background: "var(--surface-2)",
              }}
            >
              {" "}
              <h5 className="fw-bold m-0" style={{ color: "var(--text)" }}>
                Schedule for Aug 12, 2026
              </h5>{" "}
              <div className="input-group w-auto">
                {" "}
                <span className="input-group-text ">
                  <Search size={16} />
                </span>{" "}
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-control form-control-sm"
                  placeholder="Search candidate..."
                  style={{
                    border: "1px solid var(--border)",
                    color: "var(--text)",
                  }}
                />{" "}
              </div>{" "}
            </div>{" "}
            <div className="flex-grow-1 p-4 d-flex flex-column gap-3 overflow-auto">
              {" "}
              {loading ? (
                <div className="d-flex justify-content-center py-5">
                  {" "}
                  <div className="spinner-border text-primary"></div>{" "}
                </div>
              ) : filteredInterviews.length > 0 ? (
                filteredInterviews.map((interview, i) => (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={interview.id}
                    className="p-4 rounded-4 position-relative overflow-hidden hover-scale cursor-pointer"
                    style={{
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {" "}
                    <div
                      className="position-absolute top-0 bottom-0 start-0"
                      style={{
                        width: "4px",
                        background:
                          interview.status === "Confirmed"
                            ? "var(--success)"
                            : "var(--warning)",
                      }}
                    />{" "}
                    <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
                      {" "}
                      <div className="d-flex gap-3">
                        {" "}
                        <div
                          className="text-center rounded-3 p-2"
                          style={{
                            background: "var(--surface-2)",
                            minWidth: "70px",
                          }}
                        >
                          {" "}
                          <span
                            className="d-block fw-black fs-5"
                            style={{ color: "var(--text)", lineHeight: "1" }}
                          >
                            {interview.time.split(" ")[0]}
                          </span>{" "}
                          <span className="text-muted fw-bold small">
                            {interview.time.split(" ")[1]}
                          </span>{" "}
                        </div>{" "}
                        <div>
                          {" "}
                          <h5
                            className="fw-bold mb-1"
                            style={{ color: "var(--text)" }}
                          >
                            {interview.candidate}
                          </h5>{" "}
                          <p className="text-muted fw-medium small mb-2 d-flex align-items-center gap-2">
                            {" "}
                            <Users size={14} /> {interview.role}{" "}
                          </p>{" "}
                          <div className="d-flex gap-2">
                            {" "}
                            <span className="badge bg-secondary-subtle text-secondary rounded-pill fw-bold">
                              {interview.type}
                            </span>{" "}
                            <span className="badge bg-primary-subtle text-primary rounded-pill fw-bold d-flex align-items-center gap-1">
                              {" "}
                              <Clock size={12} /> {interview.duration}{" "}
                            </span>{" "}
                          </div>{" "}
                        </div>{" "}
                      </div>{" "}
                      <div className="text-end">
                        {" "}
                        {interview.status === "Confirmed" ? (
                          <span className="badge bg-success-subtle text-success rounded-pill px-3 py-2 fw-bold d-inline-flex align-items-center gap-1 mb-2">
                            {" "}
                            <CheckCircle size={14} /> Confirmed{" "}
                          </span>
                        ) : (
                          <span className="badge bg-warning-subtle text-warning rounded-pill px-3 py-2 fw-bold mb-2">
                            {" "}
                            Pending{" "}
                          </span>
                        )}{" "}
                        <p className="text-muted small fw-medium m-0">
                          Interviewer:{" "}
                          <span style={{ color: "var(--text)" }}>
                            {interview.interviewer}
                          </span>
                        </p>{" "}
                      </div>{" "}
                    </div>{" "}
                    <div
                      className="d-flex gap-2 mt-4 pt-3 border-top"
                      style={{ borderColor: "var(--border) !important" }}
                    >
                      {" "}
                      <button
                        onClick={() => window.open(interview.link, "_blank")}
                        className="btn btn-sm btn-primary rounded-pill px-4 fw-bold d-flex align-items-center gap-2 flex-grow-1 flex-md-grow-0 justify-content-center"
                      >
                        {" "}
                        <Video size={16} /> Join Video Call{" "}
                      </button>{" "}
                      <button
                        onClick={() => addToast("Reschedule interview", 'info')}
                        className="btn btn-sm btn-outline-secondary rounded-pill px-4 fw-bold flex-grow-1 flex-md-grow-0"
                      >
                        {" "}
                        Reschedule{" "}
                      </button>{" "}
                    </div>{" "}
                  </motion.div>
                ))
              ) : (
                <div className="text-center p-5 text-muted">
                  {" "}
                  <Video
                    size={48}
                    className="mb-3 text-muted opacity-50"
                  />{" "}
                  <h5>No Interviews Scheduled</h5>{" "}
                  <p>You have no interviews scheduled for this date.</p>{" "}
                </div>
              )}{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
      <AnimatePresence>
        {" "}
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
            style={{
              background: "rgba(0,0,0,0.02)",
              zIndex: 1050,
              inset: 0,
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
            onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
          >
            {" "}
            <motion.div
              initial={{ scale: 0.9, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 40 }}
              className="bento-card p-4 p-lg-5"
              style={{
                width: "100%",
                maxWidth: 600,
                maxHeight: "90vh",
                overflowY: "auto",
                background: "var(--surface)",
              }}
            >
              {" "}
              <div className="d-flex align-items-center justify-content-between mb-4">
                {" "}
                <h4
                  className="fw-black mb-0 d-flex align-items-center gap-2"
                  style={{ color: "var(--text)" }}
                >
                  {" "}
                  <CalendarIcon size={22} className="text-primary" /> Schedule
                  Interview{" "}
                </h4>{" "}
                <button
                  onClick={() => setShowModal(false)}
                  className="btn btn-sm btn-outline-secondary rounded-circle"
                  style={{ width: 36, height: 36 }}
                >
                  {" "}
                  <X size={16} />{" "}
                </button>{" "}
              </div>{" "}
              <form
                onSubmit={handleScheduleSubmit}
                className="d-flex flex-column gap-3"
              >
                {" "}
                <div>
                  {" "}
                  <label
                    className="form-label fw-semibold small"
                    style={{ color: "var(--text)" }}
                  >
                    Select Job *
                  </label>{" "}
                  <select
                    className="form-select text-body border"
                    required
                    value={scheduleData.jobId}
                    onChange={(e) => handleJobChange(e.target.value)}
                  >
                    {" "}
                    <option value="" disabled>
                      Select Job
                    </option>{" "}
                    {myJobs.map((job) => (
                      <option key={job._id} value={job._id}>
                        {job.title}
                      </option>
                    ))}{" "}
                  </select>{" "}
                </div>{" "}
                <div>
                  {" "}
                  <label
                    className="form-label fw-semibold small"
                    style={{ color: "var(--text)" }}
                  >
                    Select Candidate *
                  </label>{" "}
                  <select
                    className="form-select text-body border"
                    required
                    value={scheduleData.appId}
                    onChange={(e) =>
                      setScheduleData((p) => ({ ...p, appId: e.target.value }))
                    }
                  >
                    {" "}
                    <option value="" disabled>
                      Select Candidate
                    </option>{" "}
                    {jobApps.map((app) => (
                      <option key={app._id} value={app._id}>
                        {app.studentId?.name || "Unknown"} (ATS:{" "}
                        {app.aiMatchScore || 0}%)
                      </option>
                    ))}{" "}
                  </select>{" "}
                  {jobApps.length === 0 && scheduleData.jobId && (
                    <small className="text-danger mt-1">
                      No applicants found for this job.
                    </small>
                  )}{" "}
                </div>{" "}
                <div className="row g-3">
                  {" "}
                  <div className="col-md-6">
                    {" "}
                    <label
                      className="form-label fw-semibold small"
                      style={{ color: "var(--text)" }}
                    >
                      Interview Type
                    </label>{" "}
                    <select
                      className="form-select text-body border"
                      value={scheduleData.title}
                      onChange={(e) =>
                        setScheduleData((p) => ({
                          ...p,
                          title: e.target.value,
                        }))
                      }
                    >
                      {" "}
                      <option>Technical Round</option> <option>HR Round</option>{" "}
                      <option>Screening Call</option>{" "}
                      <option>Culture Fit</option>{" "}
                    </select>{" "}
                  </div>{" "}
                  <div className="col-md-6">
                    {" "}
                    <label
                      className="form-label fw-semibold small"
                      style={{ color: "var(--text)" }}
                    >
                      Duration
                    </label>{" "}
                    <select
                      className="form-select text-body border"
                      value={scheduleData.duration}
                      onChange={(e) =>
                        setScheduleData((p) => ({
                          ...p,
                          duration: e.target.value,
                        }))
                      }
                    >
                      {" "}
                      <option>30 mins</option> <option>45 mins</option>{" "}
                      <option>60 mins</option> <option>90 mins</option>{" "}
                    </select>{" "}
                  </div>{" "}
                </div>{" "}
                <div className="row g-3">
                  {" "}
                  <div className="col-md-6">
                    {" "}
                    <label
                      className="form-label fw-semibold small"
                      style={{ color: "var(--text)" }}
                    >
                      Date & Time *
                    </label>{" "}
                    <input
                      type="datetime-local"
                      className="form-control text-body border"
                      required
                      value={scheduleData.scheduledAt}
                      onChange={(e) =>
                        setScheduleData((p) => ({
                          ...p,
                          scheduledAt: e.target.value,
                        }))
                      }
                    />{" "}
                  </div>{" "}
                  <div className="col-md-6">
                    {" "}
                    <label
                      className="form-label fw-semibold small"
                      style={{ color: "var(--text)" }}
                    >
                      Interviewer
                    </label>{" "}
                    <input
                      type="text"
                      className="form-control text-body border"
                      required
                      value={scheduleData.interviewer}
                      onChange={(e) =>
                        setScheduleData((p) => ({
                          ...p,
                          interviewer: e.target.value,
                        }))
                      }
                    />{" "}
                  </div>{" "}
                </div>{" "}
                <div>
                  {" "}
                  <label
                    className="form-label fw-semibold small"
                    style={{ color: "var(--text)" }}
                  >
                    Meeting Link
                  </label>{" "}
                  <input
                    type="url"
                    className="form-control text-body border"
                    value={scheduleData.link}
                    onChange={(e) =>
                      setScheduleData((p) => ({ ...p, link: e.target.value }))
                    }
                  />{" "}
                </div>{" "}
                <div className="d-flex gap-3 mt-4">
                  {" "}
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn btn-outline-secondary rounded-pill flex-fill fw-semibold"
                  >
                    {" "}
                    Cancel{" "}
                  </button>{" "}
                  <button
                    type="submit"
                    disabled={modalLoading}
                    className="btn btn-primary rounded-pill flex-fill fw-bold d-flex align-items-center justify-content-center gap-2"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--primary), var(--purple))",
                      border: "none",
                    }}
                  >
                    {" "}
                    {modalLoading ? (
                      <span className="spinner-border spinner-border-sm" />
                    ) : (
                      <CheckCircle size={18} />
                    )}{" "}
                    {modalLoading ? "Scheduling..." : "Schedule Now"}{" "}
                  </button>{" "}
                </div>{" "}
              </form>{" "}
            </motion.div>{" "}
          </motion.div>
        )}{" "}
      </AnimatePresence>{" "}
    </div>
  );
}
