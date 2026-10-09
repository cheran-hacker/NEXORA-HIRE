import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { colosseumService } from "../../services/api.js";
import {
  PlayCircle,
  Tv,
  Users,
  Calendar,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Video,
} from "lucide-react";
import { useToast } from "../../context/ToastContext";
const Colosseum = () => {
  const { addToast } = useToast();
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSchedule, setShowSchedule] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    interviewerRole: "",
    scheduledTime: "",
  }); // Stream viewer state
  const [activeStream, setActiveStream] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  useEffect(() => {
    fetchStreams();
  }, []);
  const fetchStreams = async () => {
    try {
      setLoading(true);
      const res = await colosseumService.getStreams();
      setStreams(res.data.data || []);
    } catch (err) {
      addToast("Failed to load Colosseum streams", "error");
    } finally {
      setLoading(false);
    }
  };
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await colosseumService.scheduleStream(formData);
      addToast("Interview Scheduled!", "success");
      setShowSchedule(false);
      setFormData({ title: "", interviewerRole: "", scheduledTime: "" });
      fetchStreams();
    } catch (err) {
      addToast("Failed to schedule interview", "error");
    }
  };
  const handleVote = async (type) => {
    if (!activeStream) return;
    try {
      await colosseumService.voteHire(activeStream._id, type);
      addToast("Vote Cast!", "success"); // Update local state to reflect vote immediately
      setActiveStream((prev) => ({
        ...prev,
        hireVotes: type === "hire" ? prev.hireVotes + 1 : prev.hireVotes,
        noHireVotes:
          type === "nohire" ? prev.noHireVotes + 1 : prev.noHireVotes,
      }));
    } catch (err) {
      addToast("Failed to vote", "error");
    }
  };
  const sendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatMessages([...chatMessages, { user: "You", text: chatInput }]);
    setChatInput("");
  };
  if (loading)
    return (
      <div className="container-fluid py-4 d-flex justify-content-center">
        <div className="spinner-border text-primary"></div>
      </div>
    );
  return (
    <div className="container-fluid py-4 px-xl-5">
      {" "}
      <div className="d-flex justify-content-between align-items-center mb-5 flex-wrap gap-3">
        {" "}
        <div>
          {" "}
          <h2 className="fw-black mb-1 text-gradient-primary d-flex align-items-center gap-2">
            {" "}
            The Colosseum <Tv size={28} />{" "}
          </h2>{" "}
          <p className="text-muted mb-0">
            Watch your peers face the hot seat in live technical interviews.
            Chat, learn, and vote to hire.
          </p>{" "}
        </div>{" "}
        <button
          className="btn btn-primary rounded-pill px-4 shadow-sm"
          onClick={() => setShowSchedule(true)}
        >
          {" "}
          <Calendar size={20} className="me-2" /> Enter the Hot Seat{" "}
        </button>{" "}
      </div>{" "}
      {!activeStream ? (
        <div className="row g-4">
          {" "}
          {streams.map((stream, i) => (
            <div className="col-lg-4 col-md-6" key={stream._id}>
              {" "}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bento-card p-0 h-100 overflow-hidden d-flex flex-column"
              >
                {" "}
                <div
                  className="bg-light position-relative d-flex align-items-center justify-content-center"
                  style={{ height: "180px" }}
                >
                  {" "}
                  <PlayCircle size={64} className="text-foreground opacity-50" />{" "}
                  <div className="position-absolute top-0 start-0 m-3 badge bg-danger d-flex align-items-center gap-1 animate-pulse">
                    {" "}
                    <Video size={14} /> {stream.status}{" "}
                  </div>{" "}
                  <div className="position-absolute bottom-0 end-0 m-3 badge bg-black bg-opacity-50 text-foreground d-flex align-items-center gap-1">
                    {" "}
                    <Users size={14} /> {stream.viewers || 0} Viewers{" "}
                  </div>{" "}
                </div>{" "}
                <div className="p-4 flex-grow-1">
                  {" "}
                  <h5 className="fw-bold mb-2">{stream.title}</h5>{" "}
                  <div className="small text-muted fw-bold mb-3">
                    Candidate: {stream.candidate?.name}
                  </div>{" "}
                  <div className="d-flex align-items-center gap-2 mb-4">
                    {" "}
                    <span className="badge bg-primary-subtle text-primary-emphasis rounded-pill">
                      Interviewer: {stream.interviewerRole}
                    </span>{" "}
                  </div>{" "}
                  <button
                    className="btn btn-primary w-100 rounded-pill fw-bold d-flex justify-content-center align-items-center gap-2"
                    onClick={() => setActiveStream(stream)}
                  >
                    {" "}
                    Join Theater <PlayCircle size={18} />{" "}
                  </button>{" "}
                </div>{" "}
              </motion.div>{" "}
            </div>
          ))}{" "}
          {streams.length === 0 && (
            <div className="col-12 text-center p-5 bento-card ">
              {" "}
              <Tv
                size={48}
                className="text-muted mb-3 opacity-25 mx-auto"
              />{" "}
              <h5 className="fw-bold text-muted">No scheduled interviews.</h5>{" "}
              <p className="text-muted small">
                Be the brave soul to enter the hot seat.
              </p>{" "}
            </div>
          )}{" "}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="row g-4 h-100"
        >
          {" "}
          <div className="col-12 mb-3">
            {" "}
            <button
              className="btn btn-outline-secondary rounded-pill px-4"
              onClick={() => setActiveStream(null)}
            >
              {" "}
              &larr; Back to Lobby{" "}
            </button>{" "}
          </div>{" "}
          <div className="col-lg-8">
            {" "}
            <div
              className="bento-card bg-black rounded-4 overflow-hidden shadow-lg position-relative d-flex align-items-center justify-content-center"
              style={{ minHeight: "500px" }}
            >
              {" "}
              <div className="text-center text-foreground">
                {" "}
                <Video size={64} className="opacity-25 mb-3 mx-auto" />{" "}
                <h4 className="fw-bold opacity-50">
                  Live Video Stream Simulation
                </h4>{" "}
                <p className="small opacity-50">
                  WebRTC connection goes here
                </p>{" "}
              </div>{" "}
              <div className="position-absolute top-0 start-0 p-4 w-100 bg-gradient-to-b from-black to-transparent">
                {" "}
                <h5 className="text-foreground fw-bold m-0">
                  {activeStream.title}
                </h5>{" "}
                <span className="text-foreground-50 small">
                  Candidate: {activeStream.candidate?.name} • Interviewer:{" "}
                  {activeStream.interviewerRole}
                </span>{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
          <div
            className="col-lg-4 d-flex flex-column h-100"
            style={{ maxHeight: "500px" }}
          >
            {" "}
            <div className="bento-card flex-grow-1 d-flex flex-column overflow-hidden mb-3">
              {" "}
              <div className="p-3 border-bottom bg-light d-flex align-items-center gap-2 fw-bold">
                {" "}
                <MessageSquare size={18} /> Live Chat{" "}
              </div>{" "}
              <div
                className="p-3 flex-grow-1 overflow-auto bg-card"
                style={{ height: "250px" }}
              >
                {" "}
                {chatMessages.map((msg, i) => (
                  <div key={i} className="mb-2 small">
                    {" "}
                    <span
                      className={`fw-bold ${msg.user === "You" ? "text-primary" : "text-foreground"}`}
                    >
                      {msg.user}:
                    </span>{" "}
                    {msg.text}{" "}
                  </div>
                ))}{" "}
              </div>{" "}
              <form className="p-3 border-top bg-light" onSubmit={sendChat}>
                {" "}
                <div className="input-group">
                  {" "}
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Send a message..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                  />{" "}
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm fw-bold"
                  >
                    Send
                  </button>{" "}
                </div>{" "}
              </form>{" "}
            </div>{" "}
            <div className="bento-card p-3">
              {" "}
              <div className="fw-bold mb-2 text-center small text-uppercase text-muted">
                Audience Poll
              </div>{" "}
              <h6 className="fw-bold text-center mb-3">
                Would you hire {activeStream.candidate?.name}?
              </h6>{" "}
              <div className="d-flex gap-2">
                {" "}
                <button
                  className="btn btn-success flex-grow-1 fw-bold d-flex flex-column align-items-center py-2"
                  onClick={() => handleVote("hire")}
                >
                  {" "}
                  <ThumbsUp size={18} className="mb-1" /> Hire (
                  {activeStream.hireVotes}){" "}
                </button>{" "}
                <button
                  className="btn btn-danger flex-grow-1 fw-bold d-flex flex-column align-items-center py-2"
                  onClick={() => handleVote("nohire")}
                >
                  {" "}
                  <ThumbsDown size={18} className="mb-1" /> Pass (
                  {activeStream.noHireVotes}){" "}
                </button>{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
        </motion.div>
      )}{" "}
      {/* Schedule Modal */}{" "}
      <AnimatePresence>
        {" "}
        {showSchedule && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-backdrop-blur"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "rgba(0,0,0,0.02)",
              zIndex: 1050,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {" "}
            <div
              className="bento-card bg-card p-4"
              style={{ width: "90%", maxWidth: "500px" }}
            >
              {" "}
              <h4 className="fw-bold mb-4">Enter the Hot Seat</h4>{" "}
              <form onSubmit={handleCreate}>
                {" "}
                <div className="mb-3">
                  {" "}
                  <label className="form-label fw-bold">
                    Session Title
                  </label>{" "}
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="e.g. Mock Frontend Interview with FAANG Engineer"
                  />{" "}
                </div>{" "}
                <div className="mb-3">
                  {" "}
                  <label className="form-label fw-bold">
                    Interviewer Role
                  </label>{" "}
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={formData.interviewerRole}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        interviewerRole: e.target.value,
                      })
                    }
                    placeholder="e.g. Senior SWE"
                  />{" "}
                </div>{" "}
                <div className="mb-4">
                  {" "}
                  <label className="form-label fw-bold">
                    Scheduled Time
                  </label>{" "}
                  <input
                    type="datetime-local"
                    className="form-control"
                    required
                    value={formData.scheduledTime}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        scheduledTime: e.target.value,
                      })
                    }
                  />{" "}
                </div>{" "}
                <div className="d-flex justify-content-end gap-2">
                  {" "}
                  <button
                    type="button"
                    className="btn btn-light rounded-pill px-4"
                    onClick={() => setShowSchedule(false)}
                  >
                    Cancel
                  </button>{" "}
                  <button
                    type="submit"
                    className="btn btn-primary rounded-pill px-4"
                  >
                    Schedule Stream
                  </button>{" "}
                </div>{" "}
              </form>{" "}
            </div>{" "}
          </motion.div>
        )}{" "}
      </AnimatePresence>{" "}
    </div>
  );
};
export default Colosseum;
