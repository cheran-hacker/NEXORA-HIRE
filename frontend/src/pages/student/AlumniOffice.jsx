import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { alumniofficeService } from "../../services/api.js";
import {
  Headphones,
  Radio,
  Users,
  Building2,
  Mic,
  StopCircle,
} from "lucide-react";
import { useToast } from "../../context/ToastContext";
const AlumniOffice = () => {
  const { addToast } = useToast();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeRoom, setActiveRoom] = useState(null);
  useEffect(() => {
    fetchRooms();
  }, []);
  const fetchRooms = async () => {
    try {
      setLoading(true);
      const res = await alumniofficeService.getLiveRooms();
      setRooms(res.data.data || []);
    } catch (err) {
      addToast("Failed to load Alumni rooms", "error");
    } finally {
      setLoading(false);
    }
  };
  const handleJoin = (room) => {
    setActiveRoom(room);
    addToast(`Joined ${room.alumniName}'s Office Hours! 🎧`, "success");
  };
  const handleLeave = () => {
    setActiveRoom(null);
    addToast("Left the room.", "info");
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
            Alumni Office Hours{" "}
            <Headphones size={28} className="text-primary" />{" "}
          </h2>{" "}
          <p className="text-muted mb-0 fw-medium">
            Clubhouse-style live audio rooms. Drop in spontaneously to chat with
            elite alumni.
          </p>{" "}
        </div>{" "}
        <div
          className="badge pulse px-3 py-2 rounded-pill d-flex align-items-center gap-2 shadow-sm"
          style={{
            background: "rgba(var(--danger-rgb), 0.1)",
            color: "var(--danger)",
            border: "1px solid rgba(var(--danger-rgb), 0.2)",
          }}
        >
          {" "}
          <Radio size={16} /> LIVE NOW{" "}
        </div>{" "}
      </div>{" "}
      {activeRoom && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bento-card p-4 mb-5 d-flex justify-content-between align-items-center shadow-lg"
          style={{
            background:
              "linear-gradient(135deg, rgba(var(--primary-rgb), 0.1), rgba(var(--purple-rgb), 0.1))",
            border: "1px solid var(--primary)",
          }}
        >
          {" "}
          <div className="d-flex align-items-center gap-4">
            {" "}
            <div className="position-relative">
              {" "}
              <div
                className="rounded-circle p-4 shadow-sm"
                style={{ background: "var(--primary)", color: "#fff" }}
              >
                <Mic size={32} />
              </div>{" "}
              <span
                className="position-absolute bottom-0 end-0 p-2 border border-2 rounded-circle"
                style={{
                  background: "var(--success)",
                  borderColor: "var(--bg)",
                }}
              ></span>{" "}
            </div>{" "}
            <div>
              {" "}
              <div
                className="badge rounded-pill px-3 py-1 mb-2 fw-semibold"
                style={{
                  background: "rgba(var(--primary-rgb), 0.2)",
                  color: "var(--primary)",
                }}
              >
                Now Listening To
              </div>{" "}
              <h4 className="fw-black mb-1" style={{ color: "var(--text)" }}>
                {activeRoom.topic}
              </h4>{" "}
              <p
                className="mb-0 fw-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                Hosted by {activeRoom.alumniName} ({activeRoom.company})
              </p>{" "}
            </div>{" "}
          </div>{" "}
          <button
            className="btn btn-outline-danger rounded-pill px-4 fw-bold d-flex align-items-center gap-2 hover-bg"
            onClick={handleLeave}
          >
            {" "}
            <StopCircle size={20} /> Leave Room{" "}
          </button>{" "}
        </motion.div>
      )}{" "}
      <h5
        className="fw-bold mb-4 d-flex align-items-center gap-2"
        style={{ color: "var(--text)" }}
      >
        <Radio size={20} className="text-danger" /> Active Drop-in Rooms
      </h5>{" "}
      <div className="row g-4">
        {" "}
        {rooms.map((room, i) => (
          <div className="col-lg-4 col-md-6" key={room._id}>
            {" "}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bento-card p-4 h-100 d-flex flex-column hover-glow hover-scale cursor-pointer"
            >
              {" "}
              <div className="d-flex justify-content-between align-items-start mb-4">
                {" "}
                <div>
                  {" "}
                  <h5
                    className="fw-black mb-1"
                    style={{ color: "var(--text)" }}
                  >
                    {room.alumniName}
                  </h5>{" "}
                  <div
                    className="small d-flex align-items-center gap-1 fw-bold"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <Building2 size={14} /> {room.company}
                  </div>{" "}
                </div>{" "}
                <div
                  className="badge rounded-pill d-flex align-items-center gap-1 px-3 py-1 shadow-sm"
                  style={{
                    background: "rgba(var(--danger-rgb), 0.1)",
                    color: "var(--danger)",
                    border: "1px solid rgba(var(--danger-rgb), 0.2)",
                  }}
                >
                  {" "}
                  <Radio size={12} /> Live{" "}
                </div>{" "}
              </div>{" "}
              <div
                className="p-3 rounded-3 mb-4 flex-grow-1"
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                }}
              >
                {" "}
                <div
                  className="small fw-bold text-uppercase mb-1"
                  style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}
                >
                  Discussion Topic
                </div>{" "}
                <p className="fw-bold mb-0" style={{ color: "var(--text)" }}>
                  {room.topic}
                </p>{" "}
              </div>{" "}
              <div className="d-flex justify-content-between align-items-center">
                {" "}
                <div
                  className="d-flex align-items-center gap-2 fw-bold"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {" "}
                  <Users size={18} className="text-primary" />{" "}
                  {room.currentListeners} tuning in{" "}
                </div>{" "}
                <button
                  className={`btn rounded-pill px-4 fw-bold shadow-sm ${activeRoom?._id === room._id ? "btn-secondary" : "btn-primary hover-lift"}`}
                  onClick={() => handleJoin(room)}
                  disabled={activeRoom?._id === room._id}
                  style={
                    activeRoom?._id !== room._id
                      ? {
                          background:
                            "linear-gradient(135deg, var(--primary), var(--purple))",
                          border: "none",
                        }
                      : {}
                  }
                >
                  {" "}
                  {activeRoom?._id === room._id
                    ? "Listening..."
                    : "Drop In"}{" "}
                </button>{" "}
              </div>{" "}
            </motion.div>{" "}
          </div>
        ))}{" "}
        {rooms.length === 0 && (
          <div className="col-12 text-center p-5 text-muted">
            {" "}
            <Headphones size={48} className="mb-3 opacity-25" />{" "}
            <h5 className="fw-bold">No Alumni are currently online.</h5>{" "}
          </div>
        )}{" "}
      </div>{" "}
    </div>
  );
};
export default AlumniOffice;
