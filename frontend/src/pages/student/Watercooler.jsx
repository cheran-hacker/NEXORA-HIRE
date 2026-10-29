import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { watercoolerService } from "../../services/api.js";
import {
  Coffee,
  Mic,
  Headphones,
  PhoneCall,
  Radio,
  PlayCircle,
} from "lucide-react";
import { useToast } from "../../context/ToastContext";
const Watercooler = () => {
  const { addToast } = useToast();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showListen, setShowListen] = useState(false);
  const [topic, setTopic] = useState("");
  const [activeCall, setActiveCall] = useState(null);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  useEffect(() => {
    let timer;
    if (activeCall && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      endCall();
    }
    return () => clearInterval(timer);
  }, [activeCall, timeLeft]);
  useEffect(() => {
    fetchSessions();
  }, []);
  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await watercoolerService.getActiveSessions();
      setSessions(res.data.data || []);
    } catch (err) {
      addToast("Failed to load Watercooler sessions", "error");
    } finally {
      setLoading(false);
    }
  };
  const handleStartListening = async (e) => {
    e.preventDefault();
    try {
      await watercoolerService.startListening({ topic });
      addToast("You are now listening on the Watercooler! 🎧", "success");
      setShowListen(false);
      setTopic("");
      fetchSessions();
    } catch (err) {
      addToast("Failed to start listening mode", "error");
    }
  };
  const handleJoin = async (id) => {
    try {
      const res = await watercoolerService.joinSession(id);
      setActiveCall(res.data.data);
      setTimeLeft(300);
      addToast("Connected! 5-minute timer started.", "success");
      fetchSessions();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to join", "error");
    }
  };
  const endCall = () => {
    setActiveCall(null);
    setTimeLeft(300);
    addToast("Call ended. 👋", "success");
  };
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };
  if (loading)
    return (
      <div className="container-fluid py-4 d-flex justify-content-center">
        <div className="spinner-border text-primary"></div>
      </div>
    );
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
          <h2
            className="fw-black mb-1 d-flex align-items-center gap-2"
            style={{
              fontSize: "2.5rem",
              letterSpacing: "-0.02em",
              color: "var(--text)",
            }}
          >
            {" "}
            The Watercooler <Coffee size={28} className="text-primary" />{" "}
          </h2>{" "}
          <p
            className="mb-0 fw-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            Drop in on alumni for an instant 5-minute audio chat while they
            commute.
          </p>{" "}
        </div>{" "}
        <button
          className="btn rounded-pill px-4 shadow-sm d-flex align-items-center gap-2 fw-bold hover-lift"
          onClick={() => setShowListen(true)}
          style={{
            background: "var(--surface-2)",
            color: "var(--text)",
            border: "1px solid var(--border)",
          }}
        >
          {" "}
          <Headphones size={20} className="text-primary" /> (Alumni) Start
          Listening{" "}
        </button>{" "}
      </div>{" "}
      {!activeCall ? (
        <div className="row g-4">
          {" "}
          {sessions.map((session, i) => (
            <div className="col-lg-4 col-md-6" key={session._id}>
              {" "}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className={`bento-card p-4 h-100 position-relative overflow-hidden hover-glow ${session.status === "Listening" ? "" : "opacity-50"}`}
                style={{
                  border:
                    session.status === "Listening"
                      ? "2px solid var(--primary)"
                      : "1px solid var(--border)",
                  background:
                    session.status === "Listening"
                      ? "var(--surface)"
                      : "var(--surface-2)",
                }}
              >
                {" "}
                {session.status === "Listening" && (
                  <div className="position-absolute top-0 end-0 m-3">
                    {" "}
                    <span
                      className="badge rounded-pill animate-pulse d-flex align-items-center gap-1 shadow-sm px-3 py-1"
                      style={{
                        background: "rgba(var(--danger-rgb), 0.1)",
                        color: "var(--danger)",
                        border: "1px solid rgba(var(--danger-rgb), 0.2)",
                      }}
                    >
                      {" "}
                      <Radio size={14} /> LIVE{" "}
                    </span>{" "}
                  </div>
                )}{" "}
                <div className="d-flex flex-column align-items-center text-center mb-4 mt-3">
                  {" "}
                  <div
                    className="rounded-circle p-4 mb-3 position-relative shadow-sm"
                    style={{
                      background: "rgba(var(--primary-rgb), 0.1)",
                      color: "var(--primary)",
                    }}
                  >
                    {" "}
                    <Headphones size={32} />{" "}
                    {session.status === "Listening" && (
                      <span
                        className="position-absolute top-0 start-100 translate-middle p-2 rounded-circle animate-pulse"
                        style={{
                          background: "var(--success)",
                          border: "2px solid var(--bg)",
                        }}
                      >
                        {" "}
                        <span className="visually-hidden">New alerts</span>{" "}
                      </span>
                    )}{" "}
                  </div>{" "}
                  <h5
                    className="fw-black mb-1"
                    style={{ color: "var(--text)" }}
                  >
                    {session.alumni?.name || "Alumni"}
                  </h5>{" "}
                  <div
                    className="small fw-bold"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {session.topic || "Open to Chat"}
                  </div>{" "}
                </div>{" "}
                <div className="bg-card p-3 rounded-3 mb-4 text-center shadow-sm">
                  {" "}
                  <span className="text-muted small d-block mb-1">
                    Topic
                  </span>{" "}
                  <span className="fw-bold">"{session.topic}"</span>{" "}
                </div>{" "}
                {session.status === "Listening" ? (
                  <button
                    className="btn btn-primary w-100 rounded-pill fw-bold py-2 d-flex align-items-center justify-content-center gap-2"
                    onClick={() => handleJoin(session._id)}
                  >
                    {" "}
                    <PhoneCall size={18} /> Join Chat (5 mins){" "}
                  </button>
                ) : (
                  <button
                    className="btn btn-secondary w-100 rounded-pill fw-bold py-2"
                    disabled
                  >
                    {" "}
                    Currently in a call{" "}
                  </button>
                )}{" "}
              </motion.div>{" "}
            </div>
          ))}{" "}
          {sessions.length === 0 && (
            <div className="col-12 text-center p-5 bento-card ">
              {" "}
              <Headphones
                size={48}
                className="text-muted mb-3 opacity-25 mx-auto"
              />{" "}
              <h5 className="fw-bold text-muted">The watercooler is quiet.</h5>{" "}
              <p className="text-muted small">
                No alumni are currently listening. Check back later!
              </p>{" "}
            </div>
          )}{" "}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="row justify-content-center h-100"
        >
          {" "}
          <div className="col-lg-8">
            {" "}
            <div
              className="bento-card bg-card text-foreground rounded-4 overflow-hidden shadow-lg p-5 text-center d-flex flex-column align-items-center justify-content-center"
              style={{ minHeight: "400px" }}
            >
              {" "}
              <div className="d-flex justify-content-center align-items-center gap-5 mb-5">
                {" "}
                <div className="text-center">
                  {" "}
                  <div className="bg-secondary bg-opacity-50 rounded-circle p-4 mb-2 shadow-inner">
                    {" "}
                    <Mic size={48} className="text-foreground" />{" "}
                  </div>{" "}
                  <div className="fw-bold">You</div>{" "}
                </div>{" "}
                <div className="d-flex flex-column align-items-center">
                  {" "}
                  <div className="d-flex gap-2 mb-2">
                    {" "}
                    <span
                      className="bg-primary rounded-circle"
                      style={{ width: 8, height: 8 }}
                    ></span>{" "}
                    <span
                      className="bg-primary rounded-circle"
                      style={{ width: 8, height: 8 }}
                    ></span>{" "}
                    <span
                      className="bg-primary rounded-circle"
                      style={{ width: 8, height: 8 }}
                    ></span>{" "}
                  </div>{" "}
                  <div className="badge bg-danger rounded-pill fw-bold fs-5 animate-pulse">
                    {formatTime(timeLeft)}
                  </div>{" "}
                </div>{" "}
                <div className="text-center">
                  {" "}
                  <div className="bg-primary bg-opacity-25 rounded-circle p-4 mb-2 shadow-inner">
                    {" "}
                    <Headphones size={48} className="text-primary" />{" "}
                  </div>{" "}
                  <div className="fw-bold">Alumni</div>{" "}
                </div>{" "}
              </div>{" "}
              <h4 className="fw-bold mb-2">Topic: {activeCall.topic}</h4>{" "}
              <p className="text-foreground-50 small mb-5">
                WebRTC Audio Connection Simulated
              </p>{" "}
              <button
                className="btn btn-danger rounded-pill px-5 py-3 fw-bold shadow-lg"
                onClick={endCall}
              >
                {" "}
                End Call{" "}
              </button>{" "}
            </div>{" "}
          </div>{" "}
        </motion.div>
      )}{" "}
      {/* Start Listening Modal */}{" "}
      <AnimatePresence>
        {" "}
        {showListen && (
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
              style={{ width: "90%", maxWidth: "400px" }}
            >
              {" "}
              <div className="text-center mb-4">
                {" "}
                <div className="bg-card text-foreground rounded-circle d-inline-flex p-3 mb-3">
                  {" "}
                  <Headphones size={32} />{" "}
                </div>{" "}
                <h4 className="fw-bold">Start Listening Mode</h4>{" "}
                <p className="text-muted small">
                  Let students drop in for a quick 5-min chat while you commute
                  or grab coffee.
                </p>{" "}
              </div>{" "}
              <form onSubmit={handleStartListening}>
                {" "}
                <div className="mb-4">
                  {" "}
                  <label className="form-label fw-bold text-center w-100">
                    What do you want to talk about?
                  </label>{" "}
                  <input
                    type="text"
                    className="form-control text-center"
                    required
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Ask me about PM roles"
                  />{" "}
                </div>{" "}
                <div className="d-flex justify-content-center gap-2">
                  {" "}
                  <button
                    type="button"
                    className="btn btn-light rounded-pill px-4"
                    onClick={() => setShowListen(false)}
                  >
                    Cancel
                  </button>{" "}
                  <button
                    type="submit"
                    className="btn btn-dark rounded-pill px-4"
                  >
                    Go Live
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
export default Watercooler;
