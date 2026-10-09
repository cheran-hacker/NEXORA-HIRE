import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ClipboardCheck,
  ListChecks,
  History,
  Clock,
  Play,
  Trophy,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { assessmentService } from "../../services/api";
const DIFFICULTY_COLOR = { Easy: "success", Medium: "warning", Hard: "danger" };
const Assessments = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("available");
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        setLoading(true); // Get all available assessments
        const resAssessments = await assessmentService.getAll();
        const allAssessments = resAssessments.data.data || []; // Get student's past submissions
        const resHistory = await assessmentService.getMyAssessments();
        const historyData = resHistory.data.data || [];
        setHistory(historyData); // Filter out completed ones from available
        const completedIds = new Set(
          historyData.map((h) => h.assessmentId?._id || h.assessmentId),
        );
        setAssessments(allAssessments.filter((a) => !completedIds.has(a._id)));
      } catch (err) {
        console.error("Failed to fetch assessments:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssessments();
  }, []);
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };
  return (
    <div
      className="container-fluid py-4 px-xl-5"
      style={{
        background: "var(--bg)",
        minHeight: "100dvh",
        color: "var(--text)",
      }}
    >
      {" "}
      <div className="d-flex justify-content-between align-items-center mb-5 flex-wrap gap-3">
        {" "}
        <div>
          {" "}
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="fw-black mb-1 text-ultra d-flex align-items-center gap-3"
            style={{
              fontSize: "2.5rem",
              letterSpacing: "-0.02em",
              color: "var(--text)",
            }}
          >
            {" "}
            <ClipboardCheck
              size={36}
              className="text-primary"
              strokeWidth={2.5}
            />{" "}
            Assessments{" "}
          </motion.h2>{" "}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-0 ms-1 fw-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            {" "}
            Take scheduled assessments and track your performance history.{" "}
          </motion.p>{" "}
        </div>{" "}
      </div>{" "}
      {/* Tabs */}{" "}
      <ul
        className="nav nav-pills mb-4 p-2 rounded-pill d-inline-flex gap-2 shadow-sm"
        style={{
          background: "var(--bg-secondary)",
          border: "1px solid var(--border)",
        }}
      >
        {" "}
        <li className="nav-item">
          {" "}
          <button
            className={`nav-link rounded-pill fw-bold d-flex align-items-center gap-2 px-4 transition-fast ${activeTab === "available" ? "active bg-primary text-white shadow" : "text-muted hover-bg"}`}
            onClick={() => setActiveTab("available")}
          >
            {" "}
            <ListChecks size={18} /> Available ({assessments.length}){" "}
          </button>{" "}
        </li>{" "}
        <li className="nav-item">
          {" "}
          <button
            className={`nav-link rounded-pill fw-bold d-flex align-items-center gap-2 px-4 transition-fast ${activeTab === "history" ? "active bg-primary text-white shadow" : "text-muted hover-bg"}`}
            onClick={() => setActiveTab("history")}
          >
            {" "}
            <History size={18} /> History ({history.length}){" "}
          </button>{" "}
        </li>{" "}
      </ul>{" "}
      <AnimatePresence mode="wait">
        {" "}
        {activeTab === "available" && (
          <motion.div
            key="available"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {" "}
            <div className="row g-4">
              {" "}
              {loading ? (
                <div className="col-12 py-5 text-center">
                  {" "}
                  <span className="spinner-border text-primary" />{" "}
                </div>
              ) : assessments.length === 0 ? (
                <div className="col-12 text-center py-5">
                  {" "}
                  <p style={{ color: "var(--text-muted)" }}>
                    No assessments currently available.
                  </p>{" "}
                </div>
              ) : (
                assessments.map((assessment, idx) => (
                  <div className="col-md-6 col-xl-4" key={assessment._id}>
                    {" "}
                    <motion.div
                      className="bento-card h-100 d-flex flex-column p-4 hover-glow hover-scale"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      {" "}
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        {" "}
                        <span
                          className={`badge bg-${DIFFICULTY_COLOR[assessment.difficulty]}-subtle text-${DIFFICULTY_COLOR[assessment.difficulty]} rounded-pill px-3 py-2 fw-bold shadow-sm`}
                          style={{
                            border: `1px solid var(--${DIFFICULTY_COLOR[assessment.difficulty]})`,
                          }}
                        >
                          {" "}
                          {assessment.difficulty}{" "}
                        </span>{" "}
                        <span
                          className="badge bg-primary-subtle text-primary rounded-pill px-3 py-2 fw-bold d-flex align-items-center gap-1 shadow-sm"
                          style={{ border: "1px solid var(--primary)" }}
                        >
                          {" "}
                          <Clock size={14} /> {assessment.durationMinutes}{" "}
                          min{" "}
                        </span>{" "}
                      </div>{" "}
                      <h5
                        className="fw-black mb-2 fs-5"
                        style={{ color: "var(--text)" }}
                      >
                        {assessment.title}
                      </h5>{" "}
                      <p className="text-muted small flex-grow-1 lh-base">
                        {assessment.description}
                      </p>{" "}
                      <hr className="border opacity-50 mb-4 mt-2" />{" "}
                      <div className="row g-2 mb-4 text-center">
                        {" "}
                        <div className="col-4">
                          {" "}
                          <p className="fw-black mb-0 fs-5 text-primary">
                            {assessment.questions.length}
                          </p>{" "}
                          <small
                            className="text-muted fw-semibold"
                            style={{ fontSize: "0.75rem" }}
                          >
                            Questions
                          </small>{" "}
                        </div>{" "}
                        <div className="col-4">
                          {" "}
                          <p className="fw-black mb-0 fs-5 text-success">
                            {assessment.questions?.reduce(
                              (sum, q) => sum + (q.marks || 1),
                              0,
                            ) || 0}
                          </p>{" "}
                          <small
                            className="text-muted fw-semibold"
                            style={{ fontSize: "0.75rem" }}
                          >
                            Marks
                          </small>{" "}
                        </div>{" "}
                        <div className="col-4">
                          {" "}
                          <p className="fw-black mb-0 fs-5 text-warning">
                            {assessment.passingPercentage}%
                          </p>{" "}
                          <small
                            className="text-muted fw-semibold"
                            style={{ fontSize: "0.75rem" }}
                          >
                            Pass Mark
                          </small>{" "}
                        </div>{" "}
                      </div>{" "}
                      <button
                        className="btn btn-primary rounded-pill w-100 fw-bold py-2 d-flex align-items-center justify-content-center gap-2 shadow-sm hover-lift"
                        onClick={() => setSelectedAssessment(assessment)}
                        style={{
                          background:
                            "linear-gradient(135deg, var(--primary), var(--purple))",
                          border: "none",
                        }}
                      >
                        {" "}
                        <Play size={18} fill="currentColor" /> Start
                        Assessment{" "}
                      </button>{" "}
                    </motion.div>{" "}
                  </div>
                ))
              )}{" "}
            </div>{" "}
          </motion.div>
        )}{" "}
        {activeTab === "history" && (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {" "}
            <div className="bento-card p-0 overflow-hidden hover-glow">
              {" "}
              <div className="table-responsive">
                <table className="table table-hover table-borderless align-middle mb-0">
                  <thead style={{ background: "var(--bg-secondary)" }}>
                    <tr className="text-muted small fw-bold text-uppercase">
                      <th className="px-4 py-3">Assessment</th><th className="py-3">Score</th><th className="py-3">Result</th><th className="py-3">Time Taken</th><th className="px-4 py-3">Date</th></tr></thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="5" className="text-center py-4">
                          <span className="spinner-border spinner-border-sm text-primary" />
                        </td>
                      </tr>
                    ) : history.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-4 text-muted">
                          No past assessments found.
                        </td>
                      </tr>
                    ) : (
                      history.map((h, i) => (
                        <tr
                          key={h._id}
                          style={{
                            borderTop:
                              i > 0 ? "1px solid var(--border)" : "none",
                          }}
                        >
                          <td
                            className="fw-bold px-4 py-4"
                            style={{ color: "var(--text)" }}
                          >
                            {h.assessmentId?.title || "Unknown Assessment"}
                          </td><td className="py-4">
                            
                            <div className="d-flex align-items-center gap-3">
                              {" "}
                              <span
                                className={`fw-black fs-5 text-${h.scorePercentage >= 60 ? "success" : "danger"}`}
                              >
                                {" "}
                                {h.totalMarksObtained}/{h.totalMarks}{" "}
                              </span>{" "}
                              <div
                                className="progress bg-secondary"
                                style={{
                                  width: "100px",
                                  height: "6px",
                                  borderRadius: "100px",
                                }}
                              >
                                {" "}
                                <div
                                  className={`progress-bar bg-${h.scorePercentage >= 60 ? "success" : "danger"} rounded-pill`}
                                  style={{ width: `${h.scorePercentage}%` }}
                                />{" "}
                              </div>{" "}
                            </div>
                          </td><td className="py-4">
                            
                            <span
                              className={`badge rounded-pill bg-${h.isPassed ? "success" : "danger"}-subtle text-${h.isPassed ? "success" : "danger"} px-3 py-2 fw-bold d-inline-flex align-items-center gap-1 border border-${h.isPassed ? "success" : "danger"}`}
                            >
                              {" "}
                              {h.isPassed ? (
                                <CheckCircle2 size={14} />
                              ) : (
                                <XCircle size={14} />
                              )}{" "}
                              {h.isPassed ? "Passed" : "Failed"}{" "}
                            </span>
                          </td><td className="text-muted fw-medium py-4 d-flex align-items-center gap-1">
                            <Clock size={16} /> {formatTime(h.timeTakenSeconds)}
                          </td><td className="text-muted fw-medium small px-4 py-4">
                            {new Date(h.endTime).toLocaleDateString()}
                          </td></tr>
                      ))
                    )}</tbody></table>
              </div>{" "}
            </div>{" "}
          </motion.div>
        )}{" "}
      </AnimatePresence>{" "}
      {/* Start Confirmation Modal */}{" "}
      <AnimatePresence>
        {" "}
        {selectedAssessment && (
          <>
            {" "}
            <motion.div
              className="modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAssessment(null)}
              style={{
                position: 'fixed',
                inset: 0,
                background: "#000",
                zIndex: 1040,
              }}
            />{" "}
            <motion.div
              className="d-flex align-items-center justify-content-center"
              style={{ position: 'fixed', inset: 0, zIndex: 1050 }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              {" "}
              <div
                className="bento-card p-5 shadow-lg"
                style={{
                  maxWidth: "520px",
                  width: "100%",
                  border: "1px solid var(--primary)",
                }}
              >
                {" "}
                <div className="text-center mb-5">
                  {" "}
                  <div
                    className="icon-circle bg-primary-subtle text-primary mb-3 shadow-sm mx-auto border border-primary"
                    style={{ width: 80, height: 80 }}
                  >
                    {" "}
                    <ClipboardCheck size={40} strokeWidth={2.5} />{" "}
                  </div>{" "}
                  <h4
                    className="fw-black fs-3 text-ultra"
                    style={{ color: "var(--text)", letterSpacing: "-0.02em" }}
                  >
                    {selectedAssessment.title}
                  </h4>{" "}
                  <p className="text-muted mt-2 fw-medium lh-base px-3">
                    {selectedAssessment.description}
                  </p>{" "}
                </div>{" "}
                <div className="row g-3 mb-5 text-center">
                  {" "}
                  {[
                    {
                      label: "Duration",
                      value: `${selectedAssessment.durationMinutes} mins`,
                      icon: Clock,
                      color: "primary",
                    },
                    {
                      label: "Questions",
                      value: selectedAssessment.questions?.length || 0,
                      icon: ListChecks,
                      color: "info",
                    },
                    {
                      label: "Pass Mark",
                      value: `${selectedAssessment.passingPercentage || 60}%`,
                      icon: Trophy,
                      color: "warning",
                    },
                  ].map((stat) => {
                    const StatIcon = stat.icon;
                    return (
                      <div key={stat.label} className="col-4">
                        {" "}
                        <div
                          className="p-3 rounded-4 hover-glow"
                          style={{ border: "1px solid var(--border)" }}
                        >
                          {" "}
                          <StatIcon
                            size={24}
                            className={`text-${stat.color} mb-2 mx-auto`}
                            strokeWidth={2.5}
                          />{" "}
                          <p
                            className="fw-black mb-0 fs-5"
                            style={{ color: "var(--text)" }}
                          >
                            {stat.value}
                          </p>{" "}
                          <small
                            className="text-muted fw-semibold"
                            style={{ fontSize: "0.75rem" }}
                          >
                            {stat.label}
                          </small>{" "}
                        </div>{" "}
                      </div>
                    );
                  })}{" "}
                </div>{" "}
                <div className="alert bg-warning-subtle text-warning border-warning d-flex align-items-center gap-3 py-3 px-4 rounded-4 mb-4 fw-medium shadow-sm">
                  {" "}
                  <AlertTriangle
                    size={24}
                    className="flex-shrink-0"
                    strokeWidth={2.5}
                  />{" "}
                  <p className="mb-0 small lh-base">
                    Once started, the timer cannot be paused. Ensure a stable
                    internet connection.
                  </p>{" "}
                </div>{" "}
                <div className="d-flex gap-3">
                  {" "}
                  <button
                    className="btn btn-outline-secondary rounded-pill flex-grow-1 fw-bold py-3 hover-glow"
                    onClick={() => setSelectedAssessment(null)}
                  >
                    Cancel
                  </button>{" "}
                  <button
                    className="btn btn-primary rounded-pill flex-grow-1 fw-bold py-3 d-flex align-items-center justify-content-center gap-2 shadow-sm hover-lift"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--primary), var(--purple))",
                      border: "none",
                    }}
                    onClick={() => {
                      setSelectedAssessment(null);
                      navigate(
                        `/student/assessments/${selectedAssessment._id}`,
                      );
                    }}
                  >
                    {" "}
                    <Play size={18} fill="currentColor" /> Begin Now{" "}
                  </button>{" "}
                </div>{" "}
              </div>{" "}
            </motion.div>{" "}
          </>
        )}{" "}
      </AnimatePresence>{" "}
    </div>
  );
};
export default Assessments;
