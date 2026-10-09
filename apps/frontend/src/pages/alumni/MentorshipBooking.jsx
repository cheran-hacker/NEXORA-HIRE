import React, { useState, useEffect } from "react";
import { Users, Clock, Calendar, Check, X, Search, Video } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Modal from "../../shared/components/Modal";
import { useToast } from "../../context/ToastContext";
import api from "../../services/api.js";
export default function MentorshipBooking() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState("requests");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchSessions();
  }, []);
  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await api.get("/alumni/mentorship/my-sessions");
      setSessions(res.data.data || []);
    } catch (err) {
      addToast("Failed to load mentorship sessions", "error");
    } finally {
      setLoading(false);
    }
  };
  const pendingRequests = sessions.filter((s) => s.status === "Pending");
  const upcomingSessions = sessions.filter((s) => s.status === "Approved");
  const handleApprove = (req) => {
    setSelectedRequest(req);
  };
  const confirmApprove = async () => {
    try {
      await api.put(`/alumni/mentorship/${selectedRequest._id}/status`, {
        status: "Approved",
        meetingLink: null, // Requires real video API integration
      });
      addToast(`Successfully scheduled session!`, "success");
      setSelectedRequest(null);
      fetchSessions();
    } catch (err) {
      addToast("Failed to approve session", "error");
    }
  };
  const handleReject = async (id) => {
    try {
      await api.put(`/alumni/mentorship/${id}/status`, { status: "Rejected" });
      addToast("Session rejected", "success");
      fetchSessions();
    } catch (err) {
      addToast("Failed to reject session", "error");
    }
  };
  return (
    <div className="container-fluid space-y-4" style={{ maxWidth: "1000px" }}>
      {" "}
      <div className="d-flex align-items-center justify-content-between mb-4">
        {" "}
        <div>
          {" "}
          <h2
            className="fw-black mb-1"
            style={{ color: "var(--text)", fontSize: "2rem" }}
          >
            Mentorship Hub
          </h2>{" "}
          <p
            className="fw-medium mb-0"
            style={{ color: "var(--text-secondary)" }}
          >
            Manage your 1-on-1 sessions with students.
          </p>{" "}
        </div>{" "}
        <button
          onClick={() => navigate("/alumni/availability")}
          className="btn rounded-pill px-4 fw-bold shadow-sm hover-lift"
          style={{ background: "var(--primary)", color: "#fff" }}
        >
          {" "}
          Update Availability{" "}
        </button>{" "}
      </div>{" "}
      <div className="bento-card overflow-hidden p-0">
        {" "}
        <div
          className="d-flex border-bottom"
          style={{ borderColor: "var(--border) !important" }}
        >
          {" "}
          <button
            className={`flex-grow-1 py-3 text-center fw-bold transition-fast ${activeTab === "requests" ? "border-bottom border-2 border-primary" : ""}`}
            style={{
              background:
                activeTab === "requests" ? "var(--surface-2)" : "transparent",
              color:
                activeTab === "requests"
                  ? "var(--text)"
                  : "var(--text-secondary)",
              border: "none",
            }}
            onClick={() => setActiveTab("requests")}
          >
            {" "}
            Pending Requests{" "}
            {pendingRequests.length > 0 && (
              <span
                className="badge rounded-pill ms-2"
                style={{
                  background: "rgba(var(--primary-rgb), 0.2)",
                  color: "var(--primary)",
                }}
              >
                {pendingRequests.length}
              </span>
            )}{" "}
          </button>{" "}
          <button
            className={`flex-grow-1 py-3 text-center fw-bold transition-fast ${activeTab === "upcoming" ? "border-bottom border-2 border-primary" : ""}`}
            style={{
              background:
                activeTab === "upcoming" ? "var(--surface-2)" : "transparent",
              color:
                activeTab === "upcoming"
                  ? "var(--text)"
                  : "var(--text-secondary)",
              border: "none",
            }}
            onClick={() => setActiveTab("upcoming")}
          >
            {" "}
            Upcoming Sessions{" "}
          </button>{" "}
        </div>{" "}
        <div className="p-4 p-md-5">
          {" "}
          {activeTab === "requests" && (
            <div className="d-flex flex-column gap-4">
              {" "}
              <div className="position-relative mb-4">
                {" "}
                <Search
                  className="position-absolute text-muted"
                  size={18}
                  style={{
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                />{" "}
                <input
                  type="text"
                  placeholder="Search requests..."
                  className="form-control bg-transparent rounded-pill ps-5"
                  style={{ color: "var(--text)", borderColor: "var(--border)" }}
                />{" "}
              </div>{" "}
              {pendingRequests.map((req) => (
                <div
                  key={req._id}
                  className="bento-card p-4 d-flex justify-content-between align-items-center mb-3"
                >
                  {" "}
                  <div className="d-flex align-items-center gap-3">
                    {" "}
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm text-foreground fs-5 overflow-hidden"
                      style={{
                        width: "48px",
                        height: "48px",
                        background:
                          "linear-gradient(135deg, var(--primary), var(--purple))",
                      }}
                    >
                      {" "}
                      {req.mentee?.avatarUrl ? (
                        <img
                          src={req.mentee.avatarUrl}
                          alt=""
                          className="w-100 h-100 object-fit-cover"
                        />
                      ) : (
                        req.mentee?.name?.charAt(0)
                      )}{" "}
                    </div>{" "}
                    <div>
                      {" "}
                      <h5
                        className="fw-bold m-0"
                        style={{ color: "var(--text)" }}
                      >
                        {req.mentee?.name}
                      </h5>{" "}
                      <p
                        className="small m-0"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {req.topic}
                      </p>{" "}
                    </div>{" "}
                  </div>{" "}
                  <div className="d-flex align-items-center gap-4">
                    {" "}
                    <div className="text-end">
                      {" "}
                      <div
                        className="small fw-medium d-flex align-items-center gap-1 justify-content-end"
                        style={{ color: "var(--text)" }}
                      >
                        {" "}
                        <Clock
                          size={14}
                          style={{ color: "var(--text-secondary)" }}
                        />{" "}
                        {new Date(req.scheduledDate).toLocaleDateString()}{" "}
                      </div>{" "}
                      <div
                        className="small fw-bold mt-1"
                        style={{ color: "var(--primary)" }}
                      >
                        {" "}
                        {req.matchPercentage}% Match{" "}
                      </div>{" "}
                    </div>{" "}
                    <div className="d-flex gap-2">
                      {" "}
                      <button
                        onClick={() => handleApprove(req)}
                        className="btn rounded-circle d-flex align-items-center justify-content-center p-0 hover-lift"
                        style={{
                          width: "36px",
                          height: "36px",
                          background: "rgba(var(--success-rgb), 0.1)",
                          color: "var(--success)",
                          border: "none",
                        }}
                        title="Accept"
                      >
                        {" "}
                        <Check size={18} />{" "}
                      </button>{" "}
                      <button
                        className="btn rounded-circle d-flex align-items-center justify-content-center p-0 hover-lift"
                        style={{
                          width: "36px",
                          height: "36px",
                          background: "rgba(var(--danger-rgb), 0.1)",
                          color: "var(--danger)",
                          border: "none",
                        }}
                        title="Decline"
                        onClick={() => handleReject(req._id)}
                      >
                        {" "}
                        <X size={18} />{" "}
                      </button>{" "}
                    </div>{" "}
                  </div>{" "}
                </div>
              ))}{" "}
            </div>
          )}{" "}
          {activeTab === "upcoming" && (
            <div className="space-y-4">
              {" "}
              {upcomingSessions.map((session) => (
                <div
                  key={session.id}
                  className="bento-card p-4 d-flex gap-3 mb-3"
                >
                  {" "}
                  <div
                    className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{
                      width: "48px",
                      height: "48px",
                      background: "rgba(var(--primary-rgb), 0.15)",
                      color: "var(--primary)",
                    }}
                  >
                    {" "}
                    <Calendar size={24} />{" "}
                  </div>{" "}
                  <div className="flex-grow-1">
                    {" "}
                    <h5
                      className="fw-bold mb-1"
                      style={{ color: "var(--text)" }}
                    >
                      1:1 with {session.student}
                    </h5>{" "}
                    <p
                      className="small mb-3"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Topic: {session.topic}
                    </p>{" "}
                    <div className="d-flex align-items-center gap-3">
                      {" "}
                      <span
                        className="badge rounded-pill d-flex align-items-center gap-2 px-3 py-2 fw-medium"
                        style={{
                          background: "rgba(0,0,0,0.05)",
                          color: "var(--text)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        {" "}
                        <Clock
                          size={14}
                          style={{ color: "var(--primary)" }}
                        />{" "}
                        {session.time}{" "}
                      </span>{" "}
                      <a
                        href={session.link}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-sm rounded-pill d-flex align-items-center gap-2 px-3 py-2 fw-medium hover-lift"
                        style={{ background: "var(--primary)", color: "#fff" }}
                      >
                        {" "}
                        <Video size={14} /> Join Meeting{" "}
                      </a>{" "}
                    </div>{" "}
                  </div>{" "}
                </div>
              ))}{" "}
            </div>
          )}{" "}
        </div>{" "}
      </div>{" "}
      <Modal
        isOpen={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        title="Approve Mentorship Session"
        actions={
          <>
            {" "}
            <button
              className="btn bg-transparent fw-medium transition-fast hover-text-foreground"
              style={{ color: "var(--text-secondary)" }}
              onClick={() => setSelectedRequest(null)}
            >
              {" "}
              Cancel{" "}
            </button>{" "}
            <button
              className="btn rounded-3 fw-medium px-4 py-2 hover-lift d-flex align-items-center gap-2"
              style={{
                background: "var(--primary)",
                color: "#fff",
                border: "none",
                boxShadow: "0 4px 12px rgba(var(--primary-rgb), 0.2)",
              }}
              onClick={confirmApprove}
            >
              {" "}
              Confirm Appointment{" "}
            </button>{" "}
          </>
        }
      >
        {" "}
        {selectedRequest && (
          <div className="text-body">
            {" "}
            <p className="mb-4">
              You are about to accept a mentorship request from{" "}
              <strong className="text-foreground">{selectedRequest.student}</strong>.
            </p>{" "}
            <div
              className="p-3 rounded-3 mb-3 d-flex flex-column gap-2"
              style={{
                background: "rgba(0,0,0,0.02)",
                border: "1px solid var(--border)",
              }}
            >
              {" "}
              <div className="d-flex justify-content-between small">
                {" "}
                <span style={{ color: "var(--text-secondary)" }}>
                  Topic:
                </span>{" "}
                <span className="fw-medium" style={{ color: "var(--text)" }}>
                  {selectedRequest.topic}
                </span>{" "}
              </div>{" "}
              <div className="d-flex justify-content-between small">
                {" "}
                <span style={{ color: "var(--text-secondary)" }}>
                  Proposed Time:
                </span>{" "}
                <span className="fw-medium" style={{ color: "var(--text)" }}>
                  {selectedRequest.time}
                </span>{" "}
              </div>{" "}
            </div>{" "}
            <p className="small text-muted">
              An email with the Google Meet link will be automatically sent to
              both of you.
            </p>{" "}
          </div>
        )}{" "}
      </Modal>{" "}
    </div>
  );
}
