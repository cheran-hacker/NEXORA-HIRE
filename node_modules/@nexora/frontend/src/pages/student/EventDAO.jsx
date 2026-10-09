import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { daoService } from "../../services/api.js";
import {
  Vote,
  Plus,
  Zap,
  Coins,
  CheckCircle,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { useToast } from "../../context/ToastContext";
const EventDAO = () => {
  const { addToast } = useToast();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    estimatedCost: 500,
  });
  const [qrCodeModal, setQrCodeModal] = useState(null);
  useEffect(() => {
    fetchProposals();
  }, []);
  const fetchProposals = async () => {
    try {
      setLoading(true);
      const res = await daoService.getProposals();
      setProposals(res.data.data || []);
    } catch (err) {
      addToast("Failed to load Event DAO", "error");
    } finally {
      setLoading(false);
    }
  };
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await daoService.createProposal(formData);
      addToast("Event proposed to the DAO! 📜", "success");
      setShowAdd(false);
      setFormData({ title: "", description: "", estimatedCost: 500 });
      fetchProposals();
    } catch (err) {
      addToast("Failed to create proposal", "error");
    }
  };
  const handleStake = async (id, amount) => {
    try {
      await daoService.stakeOnProposal(id, amount);
      addToast(`Staked ${amount} Campus Coins!`, "success");
      fetchProposals();
    } catch (err) {
      addToast(err.response?.data?.message || "Staking failed", "error");
    }
  };
  const handleClaim = async (id) => {
    try {
      const res = await daoService.claimTicket(id);
      setQrCodeModal(res.data.data.qrCode);
      addToast("Ticket claimed successfully!", "success");
      fetchProposals();
    } catch (err) {
      addToast(
        err.response?.data?.message || "Failed to claim ticket",
        "error",
      );
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
            Event DAO <Vote size={28} className="text-primary" />{" "}
          </h2>{" "}
          <p className="text-muted mb-0 fw-medium">
            Decentralized campus event planning. Stake your Campus Coins to fund
            the events YOU actually want to see.
          </p>{" "}
        </div>{" "}
        <button
          className="btn btn-primary rounded-pill px-4 shadow-sm fw-bold d-flex align-items-center hover-lift"
          onClick={() => setShowAdd(true)}
          style={{
            background:
              "linear-gradient(135deg, var(--primary), var(--purple))",
            border: "none",
          }}
        >
          {" "}
          <Plus size={20} className="me-2" /> Propose Event{" "}
        </button>{" "}
      </div>{" "}
      <div className="row g-4">
        {" "}
        {proposals.map((prop, i) => {
          const threshold = 100;
          const progress = Math.min((prop.totalStake / threshold) * 100, 100);
          return (
            <div className="col-md-6 col-lg-4" key={prop._id}>
              {" "}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bento-card p-4 h-100 d-flex flex-column position-relative overflow-hidden hover-glow"
              >
                {" "}
                <div className="d-flex justify-content-between align-items-start mb-3">
                  {" "}
                  <span
                    className={`badge ${prop.status === "Funded" ? "bg-success-subtle text-success border border-success-subtle" : prop.status === "Rejected" ? "bg-danger-subtle text-danger border border-danger-subtle" : "bg-warning-subtle text-warning-emphasis border border-warning-subtle"} rounded-pill shadow-sm px-3 py-1`}
                  >
                    {" "}
                    Status: {prop.status}{" "}
                  </span>{" "}
                  <div
                    className="small fw-bold d-flex align-items-center gap-1"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {" "}
                    Cost: ${prop.estimatedCost}{" "}
                  </div>{" "}
                </div>{" "}
                <h4 className="fw-bold mb-2" style={{ color: "var(--text)" }}>
                  {prop.title}
                </h4>{" "}
                <div
                  className="small fw-bold mb-3"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Proposed by {prop.proposer?.name}
                </div>{" "}
                <p
                  className="small mb-4 flex-grow-1"
                  style={{
                    color: "var(--text-muted)",
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {" "}
                  {prop.description}{" "}
                </p>{" "}
                <div className="mb-4">
                  {" "}
                  <div className="d-flex justify-content-between small mb-1 fw-bold">
                    {" "}
                    <span className="d-flex align-items-center gap-1 text-primary">
                      <Coins size={14} /> {prop.totalStake} Staked
                    </span>{" "}
                    <span style={{ color: "var(--text-muted)" }}>
                      Goal: {threshold} Coins
                    </span>{" "}
                  </div>{" "}
                  <div
                    className="progress rounded-pill shadow-inner"
                    style={{ height: "10px", background: "var(--surface-2)" }}
                  >
                    {" "}
                    <div
                      className={`progress-bar progress-bar-striped progress-bar-animated ${progress >= 100 ? "bg-success" : "bg-primary"}`}
                      style={{ width: `${progress}%` }}
                    ></div>{" "}
                  </div>{" "}
                </div>{" "}
                <div
                  className="mt-auto border-top pt-3 d-flex gap-2"
                  style={{ borderColor: "var(--border) !important" }}
                >
                  {" "}
                  {prop.status === "Voting" ? (
                    <>
                      {" "}
                      <button
                        className="btn btn-outline-primary rounded-pill flex-grow-1 fw-bold d-flex align-items-center justify-content-center gap-1"
                        onClick={() => handleStake(prop._id, 5)}
                      >
                        {" "}
                        <TrendingUp size={16} /> Stake 5 Coins{" "}
                      </button>{" "}
                      <button
                        className="btn btn-primary rounded-pill flex-grow-1 fw-bold d-flex align-items-center justify-content-center gap-1"
                        onClick={() => handleStake(prop._id, 20)}
                      >
                        {" "}
                        <Zap size={16} /> Max Stake (20){" "}
                      </button>{" "}
                    </>
                  ) : (
                    <div
                      className={`w-100 text-center fw-bold p-2 rounded-3 ${prop.status === "Funded" ? "bg-success-subtle text-success-emphasis" : "bg-danger-subtle text-danger-emphasis"} d-flex flex-column gap-2`}
                    >
                      {" "}
                      <div>
                        {prop.status === "Funded" ? (
                          <>
                            <CheckCircle size={18} className="me-2" /> Event
                            Approved by DAO!
                          </>
                        ) : (
                          <>
                            <XCircle size={18} className="me-2" /> Proposal
                            Rejected
                          </>
                        )}
                      </div>{" "}
                      {prop.status === "Funded" && (
                        <button
                          className="btn btn-success fw-bold"
                          onClick={() => handleClaim(prop._id)}
                        >
                          Claim Your Ticket
                        </button>
                      )}{" "}
                    </div>
                  )}{" "}
                </div>{" "}
              </motion.div>{" "}
            </div>
          );
        })}{" "}
      </div>{" "}
      {/* Propose Event Modal */}{" "}
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
              className="bento-card p-4 border shadow-lg"
              style={{ width: "90%", maxWidth: "500px" }}
            >
              {" "}
              <h4 className="fw-bold mb-4" style={{ color: "var(--text)" }}>
                Propose Event to DAO
              </h4>{" "}
              <form onSubmit={handleCreate}>
                {" "}
                <div className="mb-3">
                  {" "}
                  <label
                    className="form-label fw-bold"
                    style={{ color: "var(--text)" }}
                  >
                    Event Title
                  </label>{" "}
                  <input
                    type="text"
                    className="form-control text-body"
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="e.g. Invite Sam Altman for Tech Talk"
                    style={{
                      border: "1px solid var(--border)",
                      background: "transparent",
                    }}
                  />{" "}
                </div>{" "}
                <div className="mb-3">
                  {" "}
                  <label
                    className="form-label fw-bold"
                    style={{ color: "var(--text)" }}
                  >
                    Estimated Cost ($)
                  </label>{" "}
                  <input
                    type="number"
                    className="form-control text-body"
                    required
                    value={formData.estimatedCost}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        estimatedCost: Number(e.target.value),
                      })
                    }
                    style={{
                      border: "1px solid var(--border)",
                      background: "transparent",
                    }}
                  />{" "}
                </div>{" "}
                <div className="mb-4">
                  {" "}
                  <label
                    className="form-label fw-bold"
                    style={{ color: "var(--text)" }}
                  >
                    Pitch (Why should students fund this?)
                  </label>{" "}
                  <textarea
                    className="form-control text-body"
                    rows="4"
                    required
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Explain the value this brings to campus..."
                    style={{
                      border: "1px solid var(--border)",
                      background: "transparent",
                    }}
                  ></textarea>{" "}
                </div>{" "}
                <div className="d-flex justify-content-end gap-2">
                  {" "}
                  <button
                    type="button"
                    className="btn btn-outline-secondary rounded-pill px-4 fw-bold"
                    onClick={() => setShowAdd(false)}
                  >
                    Cancel
                  </button>{" "}
                  <button
                    type="submit"
                    className="btn btn-primary rounded-pill px-4"
                  >
                    Submit Proposal
                  </button>{" "}
                </div>{" "}
              </form>{" "}
            </div>{" "}
          </motion.div>
        )}{" "}
      </AnimatePresence>{" "}
      {/* QR Code Modal */}{" "}
      <AnimatePresence>
        {" "}
        {qrCodeModal && (
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
              className="bento-card p-4 border shadow-lg text-center"
              style={{ width: "90%", maxWidth: "400px" }}
            >
              {" "}
              <h4 className="fw-bold mb-4" style={{ color: "var(--text)" }}>
                Your Ticket
              </h4>{" "}
              <div className="bg-card p-4 rounded-4 mb-4 d-inline-block">
                {" "}
                {/* Simulated QR Code using a generic QR image with text overlay or just styling */}{" "}
                <div
                  style={{
                    width: "200px",
                    height: "200px",
                    background: `url('https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrCodeModal}') no-repeat center center`,
                    backgroundSize: "contain",
                    margin: "0 auto",
                  }}
                ></div>{" "}
              </div>{" "}
              <div className="small text-muted mb-4 font-monospace">
                {qrCodeModal}
              </div>{" "}
              <button
                className="btn btn-outline-secondary rounded-pill px-4 fw-bold w-100"
                onClick={() => setQrCodeModal(null)}
              >
                Close
              </button>{" "}
            </div>{" "}
          </motion.div>
        )}{" "}
      </AnimatePresence>{" "}
    </div>
  );
};
export default EventDAO;
