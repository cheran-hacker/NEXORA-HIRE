import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ventService } from "../../services/api.js";
import { Wind, Send, Clock, AlertTriangle, ShieldCheck } from "lucide-react";
import { useToast } from "../../context/ToastContext";
import { io } from "socket.io-client";
const SOCKET_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";
const VentSpace = () => {
  const { addToast } = useToast();
  const [vents, setVents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState(""); // Random calming gradient colors for bubbles
  const colors = [
    "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
    "linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)",
    "linear-gradient(to top, #cfd9df 0%, #e2ebf0 100%)",
    "linear-gradient(to right, #ffecd2 0%, #fcb69f 100%)",
    "linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)",
  ];
  useEffect(() => {
    fetchVents(); // Connect to WebSocket for Real-time Venting
    const socket = io(SOCKET_URL);
    socket.on("new_vent", (newVent) => {
      setVents((prev) => [newVent, ...prev].slice(0, 50)); // Keep max 50 on client
    });
    return () => {
      socket.disconnect();
    };
  }, []);
  const fetchVents = async () => {
    try {
      const res = await ventService.getVents();
      setVents(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    try {
      const colorIndex = content.length % colors.length;
      const randomColor = colors[colorIndex];
      await ventService.createVent({ content, color: randomColor });
      addToast("Released into the void. 🌬️", "success");
      setContent(""); // No need to fetchVents(), the socket will broadcast it back to us instantly!
    } catch (err) {
      addToast("Failed to post", "error");
    }
  }; // Helper to format remaining time
  const getRemainingHours = (expiresAt) => {
    const hours = Math.round(
      (new Date(expiresAt) - new Date()) / (1000 * 60 * 60),
    );
    return hours > 0 ? `${hours}h left` : "Expiring soon";
  };
  if (loading)
    return (
      <div className="container-fluid py-4 d-flex justify-content-center">
        <div className="spinner-border text-primary"></div>
      </div>
    );
  return (
    <div className="container-fluid py-4 px-xl-5" style={{ minHeight: "80vh" }}>
      {" "}
      <div className="d-flex justify-content-between align-items-center mb-5 flex-wrap gap-3">
        {" "}
        <div>
          {" "}
          <h2
            className="fw-black mb-1 d-flex align-items-center gap-2"
            style={{ color: "#6c757d" }}
          >
            {" "}
            The Void <Wind size={28} />{" "}
          </h2>{" "}
          <p className="text-muted mb-0">
            A completely anonymous space to vent your stress. Posts
            automatically vanish after 24 hours.
          </p>{" "}
        </div>{" "}
        <div className="badge bg-light text-muted border px-3 py-2 d-flex align-items-center gap-2 shadow-sm rounded-pill">
          {" "}
          <ShieldCheck size={16} /> 100% Untraceable{" "}
        </div>{" "}
      </div>{" "}
      <div className="row justify-content-center mb-5">
        {" "}
        <div className="col-lg-8">
          {" "}
          <form onSubmit={handleSubmit} className="position-relative">
            {" "}
            <textarea
              className="form-control bg-light border-0 p-4 fs-5 rounded-4 shadow-sm"
              rows="3"
              placeholder="What's weighing on your mind today?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              style={{ resize: "none" }}
              required
            ></textarea>{" "}
            <button
              type="submit"
              className="btn btn-dark position-absolute bottom-0 end-0 m-3 rounded-circle p-3 d-flex align-items-center justify-content-center shadow"
              disabled={!content.trim()}
            >
              {" "}
              <Send size={20} />{" "}
            </button>{" "}
          </form>{" "}
          <div className="text-center mt-3 small text-muted d-flex align-items-center justify-content-center gap-2">
            {" "}
            <AlertTriangle size={14} /> Please be respectful. Do not post
            illegal content.{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
      {/* Floating Bubbles Board */}{" "}
      <div
        className="position-relative w-100 p-4 rounded-4"
        style={{
          minHeight: "600px",
          backgroundColor: "#f8f9fa",
          overflow: "hidden",
        }}
      >
        {" "}
        <h5 className="fw-bold text-muted text-center mb-5 opacity-50">
          Recent Echoes
        </h5>{" "}
        <div className="d-flex flex-wrap justify-content-center gap-4">
          {" "}
          <AnimatePresence>
            {" "}
            {vents.map((vent, i) => (
              <motion.div
                key={vent._id}
                initial={{ opacity: 0, scale: 0.5, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.5 }}
                transition={{
                  type: "spring",
                  stiffness: 50,
                  damping: 10,
                  delay: (i % 10) * 0.1,
                }}
                className="vent-bubble p-4 shadow-sm text-foreground position-relative"
                style={{
                  background: vent.color,
                  borderRadius: "30px 30px 30px 5px",
                  maxWidth: "300px",
                  minWidth: "200px",
                }}
              >
                {" "}
                <p
                  className="fw-bold mb-3 fs-6"
                  style={{ wordWrap: "break-word" }}
                >
                  {vent.content}
                </p>{" "}
                <div className="text-end small opacity-75 fw-bold d-flex align-items-center justify-content-end gap-1">
                  {" "}
                  <Clock size={12} /> {getRemainingHours(vent.expiresAt)}{" "}
                </div>{" "}
              </motion.div>
            ))}{" "}
          </AnimatePresence>{" "}
          {vents.length === 0 && (
            <div className="text-center w-100 mt-5 opacity-25">
              {" "}
              <Wind size={64} className="mb-3" />{" "}
              <h4>The void is empty.</h4>{" "}
            </div>
          )}{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
};
export default VentSpace;
