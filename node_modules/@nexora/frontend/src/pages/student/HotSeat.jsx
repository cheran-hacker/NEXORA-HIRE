import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { hotseatService } from "../../services/api.js";
import {
  Flame,
  Video,
  Users,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  PlayCircle,
  Plus,
} from "lucide-react";
import { useToast } from "../../context/ToastContext";
const HotSeat = () => {
  const { addToast } = useToast();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({ topic: "", scheduledTime: "" });
  useEffect(() => {
    fetchSessions();
  }, []);
  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await hotseatService.getSessions();
      setSessions(res.data.data || []);
    } catch (err) {
      addToast("Failed to load Hot Seat sessions", "error");
    } finally {
      setLoading(false);
    }
  };
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await hotseatService.createSession(formData);
      addToast("Hot Seat Session Scheduled! 🔥", "success");
      setShowAdd(false);
      setFormData({ topic: "", scheduledTime: "" });
      fetchSessions();
    } catch (err) {
      addToast("Failed to schedule session", "error");
    }
  };
  const handleRate = async (id, rating) => {
    try {
      await hotseatService.submitRating(id, rating);
      addToast("Rating submitted!", "success");
      fetchSessions();
    } catch (err) {
      // Log error but don't fake data
      addToast("Failed to submit rating", "error");
      console.error(err);
    }
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
          <h2 className="fw-black mb-1 text-danger d-flex align-items-center gap-2">
            {" "}
            The Hot Seat <Flame size={28} className="fill-danger" />{" "}
          </h2>{" "}
          <p className="text-muted mb-0">
            Live gladiator-style mock interviews. Watch your peers crack under
            pressure, or jump in the seat yourself.
          </p>{" "}
        </div>{" "}
        <button
          className="btn btn-dark rounded-pill px-4 shadow-sm fw-bold d-flex align-items-center gap-2"
          onClick={() => setShowAdd(true)}
        >
          {" "}
          <Plus size={20} /> Schedule Session{" "}
        </button>{" "}
      </div>{" "}
      <div className="row g-4">
        {" "}
        {sessions.map((session, i) => (
          <div className="col-lg-6" key={session._id}>
            {" "}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`bento-card p-0 h-100 overflow-hidden border-2 ${session.status === "Live" ? "border-danger shadow-lg" : "border-light shadow-sm bg-card"}`}
            >
              {" "}
              {/* Video Player Mockup */}{" "}
              <div
                className="position-relative bg-light"
                style={{ height: "250px" }}
              >
                {" "}
                {session.status === "Live" ? (
                  <>
                    {" "}
                    <div className="w-100 h-100 d-flex align-items-center justify-content-center bg-light text-muted">
                      {" "}
                      <Video size={48} className="opacity-25" />{" "}
                    </div>{" "}
                    <div className="position-absolute top-0 start-0 m-3 badge bg-danger d-flex align-items-center gap-1 pulse">
                      {" "}
                      <div
                        className="spinner-grow spinner-grow-sm text-foreground"
                        style={{ width: "0.5rem", height: "0.5rem" }}
                      ></div>{" "}
                      LIVE{" "}
                    </div>{" "}
                    <div className="position-absolute top-0 end-0 m-3 badge bg-light bg-opacity-75 d-flex align-items-center gap-1">
                      {" "}
                      <Users size={14} /> {session.viewerCount}{" "}
                    </div>{" "}
                    <div className="position-absolute top-50 start-50 translate-middle">
                      {" "}
                      <button
                        onClick={() =>
                          addToast(
                            "Connecting to live stream... WebRTC session starting.",
                            "info",
                          )
                        }
                        className="btn btn-danger rounded-circle p-3 shadow-lg"
                      >
                        <PlayCircle size={32} />
                      </button>{" "}
                    </div>{" "}
                  </>
                ) : (
                  <div className="w-100 h-100 d-flex flex-column align-items-center justify-content-center text-foreground-50">
                    {" "}
                    <Video size={48} className="mb-2 opacity-50" />{" "}
                    <div className="fw-bold">
                      Starts{" "}
                      {new Date(session.scheduledTime).toLocaleDateString()}
                    </div>{" "}
                  </div>
                )}{" "}
              </div>{" "}
              {/* Info Section */}{" "}
              <div className="p-4 bg-card">
                {" "}
                <h4 className="fw-black text-foreground mb-1">
                  {session.topic}
                </h4>{" "}
                <div className="small text-muted fw-bold mb-4">
                  Candidate: {session.candidate?.name}
                </div>{" "}
                <div className="d-flex justify-content-between align-items-end">
                  {" "}
                  <div className="bg-light p-3 rounded-3 border">
                    {" "}
                    <div className="small fw-bold text-uppercase text-muted mb-1 d-flex align-items-center gap-1">
                      {" "}
                      <Flame size={14} /> Community Rating{" "}
                    </div>{" "}
                    <div className="d-flex align-items-center gap-2">
                      {" "}
                      <h3
                        className={`fw-black mb-0 ${session.communityRating >= 80 ? "text-success" : session.communityRating >= 50 ? "text-warning" : session.communityRating > 0 ? "text-danger" : "text-muted"}`}
                      >
                        {" "}
                        {session.communityRating > 0
                          ? `${session.communityRating}/100`
                          : "N/A"}{" "}
                      </h3>{" "}
                      {session.status === "Live" && (
                        <div className="d-flex gap-1 ms-3">
                          {" "}
                          <button
                            className="btn btn-sm btn-outline-success rounded-circle p-1"
                            onClick={() => handleRate(session._id, 100)}
                          >
                            <ThumbsUp size={16} />
                          </button>{" "}
                          <button
                            className="btn btn-sm btn-outline-danger rounded-circle p-1"
                            onClick={() => handleRate(session._id, 0)}
                          >
                            <ThumbsDown size={16} />
                          </button>{" "}
                        </div>
                      )}{" "}
                    </div>{" "}
                  </div>{" "}
                  <button
                    className="btn btn-light rounded-pill px-4 fw-bold border shadow-sm"
                    disabled={session.status !== "Live"}
                  >
                    {" "}
                    <MessageSquare size={18} className="me-2" /> Live Chat{" "}
                  </button>{" "}
                </div>{" "}
              </div>{" "}
            </motion.div>{" "}
          </div>
        ))}{" "}
        {sessions.length === 0 && (
          <div className="col-12 text-center p-5 bento-card ">
            {" "}
            <Flame
              size={48}
              className="text-muted mb-3 opacity-25 mx-auto"
            />{" "}
            <h5 className="fw-bold text-muted">No Hot Seat Sessions</h5>{" "}
            <p className="text-muted small">
              Schedule one to start the gauntlet.
            </p>{" "}
          </div>
        )}{" "}
      </div>{" "}
      {/* Schedule Modal */}{" "}
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
              className="bento-card bg-card p-4"
              style={{ width: "90%", maxWidth: "400px" }}
            >
              {" "}
              <div className="text-center mb-4">
                {" "}
                <div className="bg-danger text-white rounded-circle d-inline-flex p-3 mb-3 shadow-sm">
                  {" "}
                  <Flame size={32} />{" "}
                </div>{" "}
                <h4 className="fw-bold text-danger">Enter the Hot Seat</h4>{" "}
              </div>{" "}
              <form onSubmit={handleCreate}>
                {" "}
                <div className="mb-3">
                  {" "}
                  <label className="form-label fw-bold small">
                    Interview Topic
                  </label>{" "}
                  <input
                    type="text"
                    className="form-control fw-bold"
                    required
                    value={formData.topic}
                    onChange={(e) =>
                      setFormData({ ...formData, topic: e.target.value })
                    }
                    placeholder="e.g. System Design: Uber"
                  />{" "}
                </div>{" "}
                <div className="mb-4">
                  {" "}
                  <label className="form-label fw-bold small">
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
                    onClick={() => setShowAdd(false)}
                  >
                    Cancel
                  </button>{" "}
                  <button
                    type="submit"
                    className="btn btn-danger rounded-pill px-4 fw-bold"
                  >
                    Schedule Arena
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
export default HotSeat;
