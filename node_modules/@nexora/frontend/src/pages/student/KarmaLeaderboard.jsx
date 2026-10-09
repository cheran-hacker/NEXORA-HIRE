import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { karmaService } from "../../services/api.js";
import {
  Award,
  Plus,
  Heart,
  HelpCircle,
  Users,
  CheckCircle,
} from "lucide-react";
import { useToast } from "../../context/ToastContext";
const KarmaLeaderboard = () => {
  const { addToast } = useToast();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    action: "Answered Forum Question",
    points: 10,
  });
  useEffect(() => {
    fetchLeaderboard();
  }, []);
  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await karmaService.getLeaderboard();
      setLeaderboard(res.data.data || []);
    } catch (err) {
      addToast("Failed to load Karma Leaderboard", "error");
    } finally {
      setLoading(false);
    }
  };
  const handleLogKarma = async (e) => {
    e.preventDefault();
    try {
      await karmaService.logKarma(formData);
      addToast("+10 Karma! Good deed logged 💖", "success");
      setShowAdd(false);
      fetchLeaderboard();
    } catch (err) {
      addToast("Failed to log Karma", "error");
    }
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
      <div className="d-flex justify-content-between align-items-center mb-5">
        {" "}
        <div>
          {" "}
          <h2 className="fw-black mb-1 text-gradient-primary d-flex align-items-center gap-2">
            {" "}
            Campus Karma <Award size={28} />{" "}
          </h2>{" "}
          <p className="text-muted mb-0">
            Good deeds don't go unnoticed. Top karma earners are highlighted to
            recruiters as culture-fit leaders.
          </p>{" "}
        </div>{" "}
        <button
          className="btn btn-primary rounded-pill px-4 shadow-sm"
          onClick={() => setShowAdd(true)}
        >
          {" "}
          <Plus size={20} className="me-2" /> Log Good Deed{" "}
        </button>{" "}
      </div>{" "}
      <div className="row">
        {" "}
        <div className="col-lg-8 mx-auto">
          {" "}
          <div
            className="rounded-4 overflow-hidden p-0 shadow-sm"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
            }}
          >
            {" "}
            <div
              className="p-4 d-flex justify-content-between align-items-center"
              style={{
                borderBottom: "1px solid var(--border)",
                background: "var(--bg)",
              }}
            >
              {" "}
              <h5 className="fw-bold mb-0" style={{ color: "var(--text)" }}>
                Leaderboard
              </h5>{" "}
              <span className="small fw-semibold text-primary bg-primary-subtle px-3 py-1 rounded-pill">
                Updated Real-time
              </span>{" "}
            </div>{" "}
            <div className="list-group list-group-flush">
              {" "}
              {leaderboard.length > 0 ? (
                leaderboard.map((user, index) => (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    key={user._id}
                    className={`list-group-item d-flex align-items-center p-4 ${index < 3 ? "bg-primary-subtle bg-opacity-25" : ""}`}
                  >
                    {" "}
                    <div
                      className="fw-black text-muted me-4 fs-5"
                      style={{ width: 30 }}
                    >
                      #{index + 1}
                    </div>{" "}
                    <div
                      className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold fs-5 me-3 shadow-sm"
                      style={{ width: 50, height: 50 }}
                    >
                      {" "}
                      {user.name?.charAt(0) || "U"}{" "}
                    </div>{" "}
                    <div className="flex-grow-1">
                      {" "}
                      <h5
                        className="fw-bold mb-1 d-flex align-items-center gap-2"
                        style={{ color: "var(--text)" }}
                      >
                        {" "}
                        {user.name}{" "}
                        {index === 0 && (
                          <Award size={18} className="text-warning" />
                        )}{" "}
                      </h5>{" "}
                      <div className="small text-muted">
                        Latest: {user.recentAction || "Being awesome"}
                      </div>{" "}
                    </div>{" "}
                    <div className="text-end">
                      {" "}
                      <div className="fw-black text-primary fs-4 d-flex align-items-center gap-1">
                        {" "}
                        {user.totalKarma}{" "}
                        <Heart size={20} className="text-danger" />{" "}
                      </div>{" "}
                    </div>{" "}
                  </motion.div>
                ))
              ) : (
                <div className="p-5 text-center text-muted">
                  {" "}
                  <Award size={48} className="mb-3 opacity-50" />{" "}
                  <h5>No Karma yet.</h5>{" "}
                  <p>Be the first to log a good deed on campus!</p>{" "}
                </div>
              )}{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
      {/* Add Karma Modal */}{" "}
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
              className="rounded-4 p-4 shadow-lg border"
              style={{
                width: "90%",
                maxWidth: "400px",
                background: "var(--surface)",
                borderColor: "var(--border)",
              }}
            >
              {" "}
              <h4
                className="fw-bold mb-4 text-center"
                style={{ color: "var(--text)" }}
              >
                Log a Good Deed
              </h4>{" "}
              <form onSubmit={handleLogKarma}>
                {" "}
                <div className="mb-4">
                  {" "}
                  <label
                    className="form-label fw-bold"
                    style={{ color: "var(--text)" }}
                  >
                    What did you do?
                  </label>{" "}
                  <div className="d-flex flex-column gap-2">
                    {" "}
                    {[
                      "Answered Forum Question",
                      "Mentored a Junior",
                      "Organized a Study Group",
                      "Found & Returned Item",
                    ].map((action) => (
                      <div
                        key={action}
                        className={`p-3 rounded-3 border cursor-pointer transition-fast ${formData.action === action ? "border-primary bg-primary-subtle text-primary fw-bold" : "text-muted"}`}
                        onClick={() => setFormData({ action, points: 10 })}
                        style={{
                          borderColor:
                            formData.action === action
                              ? "var(--primary)"
                              : "var(--border)",
                          background:
                            formData.action === action
                              ? "var(--primary-subtle)"
                              : "var(--bg)",
                        }}
                      >
                        {" "}
                        <div className="d-flex align-items-center gap-2">
                          {" "}
                          {formData.action === action ? (
                            <CheckCircle size={18} />
                          ) : (
                            <div
                              style={{
                                width: 18,
                                height: 18,
                                borderRadius: "50%",
                                border: "1px solid var(--border)",
                              }}
                            ></div>
                          )}{" "}
                          {action}{" "}
                        </div>{" "}
                      </div>
                    ))}{" "}
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
                    Claim Karma
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
export default KarmaLeaderboard;
