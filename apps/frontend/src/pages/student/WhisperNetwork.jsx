import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { whisperService } from "../../services/api.js";
import {
  MessageCircle,
  HeartPulse,
  UserCircle,
  Plus,
  Send,
  XCircle,
  ShieldCheck,
} from "lucide-react";
import { useToast } from "../../context/ToastContext";
const WhisperNetwork = () => {
  const { addToast } = useToast();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [activeChat, setActiveChat] = useState(null);
  const [topic, setTopic] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    fetchChats();
  }, []);
  const fetchChats = async () => {
    try {
      setLoading(true);
      const res = await whisperService.getActiveChats();
      setChats(res.data.data || []);
    } catch (err) {
      addToast("Failed to load active sessions", "error");
    } finally {
      setLoading(false);
    }
  };
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await whisperService.createChat({ topic });
      addToast("Session created. Waiting for a listener...", "success");
      setShowAdd(false);
      setTopic("");
      setActiveChat({ ...res.data.data, role: "Speaker" });
      fetchChats();
    } catch (err) {
      addToast("Failed to create session", "error");
    }
  };
  const handleJoin = async (id) => {
    try {
      const res = await whisperService.joinChat(id);
      addToast("Joined anonymously as Listener", "success");
      setActiveChat({ ...res.data.data, role: "Listener" });
      fetchChats();
    } catch (err) {
      addToast("Failed to join session", "error");
    }
  };

  useEffect(() => {
    let interval;
    if (activeChat) {
      const fetchMessages = async () => {
        try {
          const res = await whisperService.getMessages(activeChat._id);
          setMessages(res.data.data || []);
        } catch (e) {
          console.error(e);
        }
      };
      fetchMessages();
      interval = setInterval(fetchMessages, 3000); // poll every 3s
    } else {
      setMessages([]);
    }
    return () => clearInterval(interval);
  }, [activeChat]);

  if (loading)
    return (
      <div className="container-fluid py-4 d-flex justify-content-center">
        <div className="spinner-border text-primary"></div>
      </div>
    );
  return (
    <div className="container-fluid py-4 px-xl-5">
      {" "}
      {!activeChat ? (
        <>
          {" "}
          <div className="d-flex justify-content-between align-items-center mb-5">
            {" "}
            <div>
              {" "}
              <h2 className="fw-black mb-1 text-gradient-primary d-flex align-items-center gap-2">
                {" "}
                The Whisper Network{" "}
                <HeartPulse size={28} className="text-danger" />{" "}
              </h2>{" "}
              <p className="text-muted mb-0">
                A safe, anonymous, and ephemeral space to vent or lend an ear.
                Chats auto-delete.
              </p>{" "}
            </div>{" "}
            <button
              className="btn btn-primary rounded-pill px-4 shadow-sm"
              onClick={() => setShowAdd(true)}
            >
              {" "}
              <Plus size={20} className="me-2" /> I need to vent{" "}
            </button>{" "}
          </div>{" "}
          <div className="row g-4">
            {" "}
            <div className="col-12 mb-2">
              {" "}
              <div className="bg-primary-subtle text-primary-emphasis p-3 rounded-3 small fw-bold d-flex align-items-center gap-2">
                {" "}
                <ShieldCheck size={18} /> Identity is hidden. IP is not logged.
                Please be respectful and supportive.{" "}
              </div>{" "}
            </div>{" "}
            {chats.length > 0 ? (
              chats.map((chat, i) => (
                <div className="col-md-6 col-lg-4" key={chat._id}>
                  {" "}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="bento-card p-4 h-100 d-flex flex-column"
                  >
                    {" "}
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      {" "}
                      <div className="d-flex align-items-center gap-2">
                        {" "}
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center"
                          style={{
                            width: 40,
                            height: 40,
                            background: "var(--surface-2)",
                            color: "var(--text)",
                          }}
                        >
                          {" "}
                          <UserCircle size={24} />{" "}
                        </div>{" "}
                        <div>
                          {" "}
                          <div
                            className="fw-bold lh-1"
                            style={{ color: "var(--text)" }}
                          >
                            Anonymous
                          </div>{" "}
                          <span className="small text-muted">Speaker</span>{" "}
                        </div>{" "}
                      </div>{" "}
                      <span className="badge bg-warning text-foreground rounded-pill shadow-sm">
                        Waiting
                      </span>{" "}
                    </div>{" "}
                    <p className="fw-bold mb-4 flex-grow-1 fs-5">
                      "{chat.topic}"
                    </p>{" "}
                    <button
                      className="btn btn-outline-primary rounded-pill w-100 fw-bold d-flex align-items-center justify-content-center gap-2"
                      onClick={() => handleJoin(chat._id)}
                    >
                      {" "}
                      <MessageCircle size={18} /> Be a Listener{" "}
                    </button>{" "}
                  </motion.div>{" "}
                </div>
              ))
            ) : (
              <div className="col-12 text-center p-5 bento-card mt-4">
                {" "}
                <HeartPulse
                  size={48}
                  className="text-muted mb-3 opacity-25"
                />{" "}
                <h5 className="fw-bold text-muted">
                  No active sessions waiting.
                </h5>{" "}
                <p className="text-muted small">
                  If you're feeling overwhelmed, don't hesitate to start one.
                </p>{" "}
              </div>
            )}{" "}
          </div>{" "}
        </>
      ) : (
        /* Active Chat UI */ <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bento-card d-flex flex-column overflow-hidden mx-auto shadow-lg"
          style={{ maxWidth: 800, height: "75vh" }}
        >
          {" "}
          <div className="bg-card text-foreground p-4 d-flex justify-content-between align-items-center">
            {" "}
            <div className="d-flex align-items-center gap-3">
              {" "}
              <div className="bg-card bg-opacity-10 rounded-circle p-2">
                {" "}
                <ShieldCheck size={24} className="text-success" />{" "}
              </div>{" "}
              <div>
                {" "}
                <h5 className="fw-bold mb-0">Secure Session</h5>{" "}
                <div className="small text-foreground-50">
                  You are the{" "}
                  <strong className="text-foreground">{activeChat.role}</strong>
                </div>{" "}
              </div>{" "}
            </div>{" "}
            <button
              className="btn btn-danger btn-sm rounded-pill px-3 fw-bold d-flex align-items-center gap-2"
              onClick={() => setActiveChat(null)}
            >
              {" "}
              <XCircle size={16} /> End & Erase{" "}
            </button>{" "}
          </div>{" "}
          <div
            className="p-3 border-bottom text-center small fw-bold"
            style={{
              background: "var(--surface-2)",
              color: "var(--text-secondary)",
              borderColor: "var(--border)",
            }}
          >
            {" "}
            Topic: {activeChat.topic}{" "}
          </div>{" "}
          <div
            className="flex-grow-1 p-4 d-flex flex-column gap-3 overflow-auto"
            style={{ background: "var(--surface-1)" }}
          >
            {" "}
            <div className="text-center mb-4 mt-2">
              {" "}
              <span className="badge bg-secondary-subtle text-secondary rounded-pill px-3 py-2">
                {" "}
                Connection secured. Messages will auto-destroy.{" "}
              </span>{" "}
            </div>{" "}
            {messages.map((msg, idx) => {
              const isMine = msg.sender === activeChat.role;
              return (
                <div key={idx} className={`d-flex ${isMine ? 'justify-content-end' : 'justify-content-start'}`}>
                  <div className={`p-3 rounded-4 shadow-sm ${isMine ? 'bg-primary text-white' : 'bg-surface-2 text-foreground'}`} style={{ maxWidth: '75%' }}>
                    <div className="small fw-bold mb-1 opacity-75">{msg.sender}</div>
                    <div>{msg.content}</div>
                  </div>
                </div>
              );
            })}
          </div>{" "}
          <div
            className="p-3 border-top"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
            }}
          >
            {" "}
            <div className="input-group">
              {" "}
              <input
                id="whisper-input"
                type="text"
                className="form-control rounded-pill border-0 ps-4 py-3"
                placeholder="Type a message..."
                style={{ background: "var(--surface-2)", color: "var(--text)" }}
                onKeyDown={async (e) => {
                  if (e.key === "Enter" && e.target.value.trim()) {
                    try {
                      if (activeChat?._id)
                        await whisperService.sendMessage(activeChat._id, {
                          content: e.target.value.trim(),
                        });
                      e.target.value = "";
                    } catch {
                      addToast("Failed to send message", "error");
                    }
                  }
                }}
              />{" "}
              <button
                onClick={async () => {
                  const input = document.getElementById("whisper-input");
                  if (!input?.value.trim()) return;
                  try {
                    if (activeChat?._id)
                      await whisperService.sendMessage(activeChat._id, {
                        content: input.value.trim(),
                      });
                    input.value = "";
                  } catch {
                    addToast("Failed to send message", "error");
                  }
                }}
                className="btn btn-dark rounded-pill px-4 ms-2 shadow-sm d-flex align-items-center justify-content-center"
              >
                {" "}
                <Send size={18} />{" "}
              </button>{" "}
            </div>{" "}
          </div>{" "}
        </motion.div>
      )}{" "}
      {/* Add Chat Modal */}{" "}
      <AnimatePresence>
        {" "}
        {showAdd && (
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
              className="bento-card p-4"
              style={{
                width: "90%",
                maxWidth: "400px",
                background: "var(--surface)",
              }}
            >
              {" "}
              <h4
                className="fw-bold mb-4 text-center"
                style={{ color: "var(--text)" }}
              >
                Start a Session
              </h4>{" "}
              <form onSubmit={handleCreate}>
                {" "}
                <div className="mb-4">
                  {" "}
                  <label
                    className="form-label fw-bold"
                    style={{ color: "var(--text)" }}
                  >
                    What's on your mind?
                  </label>{" "}
                  <textarea
                    className="form-control"
                    rows="3"
                    required
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., Feeling really burnt out from finals. Just need to talk."
                    style={{
                      background: "var(--surface-2)",
                      color: "var(--text)",
                      border: "1px solid var(--border)",
                    }}
                  ></textarea>{" "}
                  <div className="form-text mt-2 small text-muted">
                    <ShieldCheck size={12} /> Your identity is completely
                    hidden.
                  </div>{" "}
                </div>{" "}
                <div className="d-flex justify-content-end gap-2">
                  {" "}
                  <button
                    type="button"
                    className="btn btn-light rounded-pill px-4"
                    onClick={() => setShowAdd(false)}
                  >
                    Cancel
                  </button>{" "}
                  <button
                    type="submit"
                    className="btn btn-primary rounded-pill px-4"
                  >
                    Find a Listener
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
export default WhisperNetwork;
