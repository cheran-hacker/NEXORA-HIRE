import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sprintService } from "../../services/api.js";
import {
  Zap,
  Clock,
  Users,
  Building,
  DollarSign,
  Plus,
  CheckCircle,
  ShieldCheck,
} from "lucide-react";
import { useToast } from "../../context/ToastContext";
const StartupSprints = () => {
  const { addToast } = useToast();
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    projectBrief: "",
    bountyAmount: 1000,
    requiredRoles: "",
  });
  useEffect(() => {
    fetchSprints();
  }, []);
  const fetchSprints = async () => {
    try {
      setLoading(true);
      const res = await sprintService.getSprints();
      setSprints(res.data.data || []);
    } catch (err) {
      addToast("Failed to load sprints", "error");
    } finally {
      setLoading(false);
    }
  };
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const formattedData = {
        ...formData,
        requiredRoles: formData.requiredRoles.split(",").map((r) => r.trim()),
      };
      await sprintService.createSprint(formattedData);
      addToast("Sprint Bounty Posted! 💸", "success");
      setShowAdd(false);
      setFormData({
        companyName: "",
        projectBrief: "",
        bountyAmount: 1000,
        requiredRoles: "",
      });
      fetchSprints();
    } catch (err) {
      addToast("Failed to post sprint", "error");
    }
  };
  const handleLockIn = async (id) => {
    try {
      await sprintService.lockInSprint(id);
      addToast("Locked In! The 48-Hour Timer starts NOW. ⏳", "success");
      fetchSprints();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to lock in", "error");
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
          <h2 className="fw-black mb-1 text-gradient-primary d-flex align-items-center gap-2">
            {" "}
            48-Hour Startup Sprints <Zap size={28} />{" "}
          </h2>{" "}
          <p className="text-muted mb-0">
            High-octane freelance work. Companies post a $1000 bounty. You have
            48 hours to deliver.
          </p>{" "}
        </div>{" "}
        <button
          className="btn btn-dark rounded-pill px-4 shadow-sm"
          onClick={() => setShowAdd(true)}
        >
          {" "}
          <Plus size={20} className="me-2" /> Post Sprint Bounty (Simulate
          Company){" "}
        </button>{" "}
      </div>{" "}
      <div className="row g-4">
        {" "}
        {sprints.map((sprint, i) => {
          let timeRemaining = "48:00:00";
          if (sprint.status === "Locked_In") {
            const start = new Date(sprint.sprintStartTime).getTime();
            const now = new Date().getTime();
            const diff = 48 * 60 * 60 * 1000 - (now - start);
            if (diff > 0) {
              const h = Math.floor(diff / (1000 * 60 * 60));
              const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
              timeRemaining = `${h}h ${m}m remaining`;
            } else {
              timeRemaining = "TIME UP";
            }
          }
          return (
            <div className="col-lg-6" key={sprint._id}>
              {" "}
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className={`bento-card p-0 h-100 overflow-hidden d-flex flex-column ${sprint.status === "Locked_In" ? "border-danger" : "border-0 "}`}
                style={{
                  borderWidth: sprint.status === "Locked_In" ? "4px" : "0",
                }}
              >
                {" "}
                <div
                  className={`p-4 d-flex justify-content-between align-items-center text-foreground ${sprint.status === "Locked_In" ? "bg-danger" : sprint.status === "Completed" ? "bg-success" : "bg-light"}`}
                >
                  {" "}
                  <div className="d-flex align-items-center gap-2">
                    {" "}
                    <Building size={20} />{" "}
                    <span className="fw-bold fs-5">
                      {sprint.companyName}
                    </span>{" "}
                  </div>{" "}
                  <div className="badge bg-card text-foreground rounded-pill fs-6 px-3 shadow-sm d-flex align-items-center gap-1">
                    {" "}
                    <DollarSign size={16} /> {sprint.bountyAmount}{" "}
                  </div>{" "}
                </div>{" "}
                <div className="p-4 flex-grow-1 bg-card">
                  {" "}
                  <div className="text-muted small fw-bold mb-2">
                    Project Brief:
                  </div>{" "}
                  <p className="mb-4 text-foreground fw-semibold">
                    {sprint.projectBrief}
                  </p>{" "}
                  <div className="mb-4">
                    {" "}
                    <div className="text-muted small fw-bold mb-2 d-flex align-items-center gap-2">
                      <Users size={16} /> Required Roles:
                    </div>{" "}
                    <div className="d-flex flex-wrap gap-2">
                      {" "}
                      {sprint.requiredRoles.map((role, idx) => (
                        <span
                          key={idx}
                          className="badge bg-light text-foreground border px-2 py-1"
                        >
                          {role}
                        </span>
                      ))}{" "}
                    </div>{" "}
                  </div>{" "}
                  {sprint.status === "Open" ? (
                    <button
                      className="btn btn-outline-danger w-100 rounded-pill fw-bold py-3"
                      onClick={() => handleLockIn(sprint._id)}
                    >
                      {" "}
                      <Zap size={18} className="me-2" /> Lock In for 48
                      Hours{" "}
                    </button>
                  ) : sprint.status === "Locked_In" ? (
                    <div className="bg-danger-subtle text-danger-emphasis p-4 rounded-4 text-center border border-danger shadow-inner">
                      {" "}
                      <Clock size={32} className="mb-2 animate-pulse" />{" "}
                      <h3 className="fw-black mb-1">{timeRemaining}</h3>{" "}
                      <div className="small fw-bold text-uppercase">
                        Sprint is Active
                      </div>{" "}
                    </div>
                  ) : (
                    <div className="bg-success-subtle text-success-emphasis p-3 rounded-4 text-center border border-success">
                      {" "}
                      <ShieldCheck size={24} className="mb-1" />{" "}
                      <h5 className="fw-bold mb-0">Bounty Completed</h5>{" "}
                    </div>
                  )}{" "}
                </div>{" "}
              </motion.div>{" "}
            </div>
          );
        })}{" "}
        {sprints.length === 0 && (
          <div className="col-12 text-center p-5 bento-card ">
            {" "}
            <Zap
              size={48}
              className="text-muted mb-3 opacity-25 mx-auto"
            />{" "}
            <h5 className="fw-bold text-muted">No active sprint bounties.</h5>{" "}
            <p className="text-muted small">
              Check back later when startups need rapid prototypes.
            </p>{" "}
          </div>
        )}{" "}
      </div>{" "}
      {/* Post Bounty Modal */}{" "}
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
              overflowY: "auto",
            }}
          >
            {" "}
            <div
              className="bento-card bg-card p-4 my-4"
              style={{ width: "90%", maxWidth: "500px" }}
            >
              {" "}
              <div className="d-flex align-items-center gap-3 mb-4">
                {" "}
                <div className="bg-card text-foreground p-3 rounded-4 shadow">
                  {" "}
                  <DollarSign size={32} className="text-success" />{" "}
                </div>{" "}
                <div>
                  {" "}
                  <h4 className="fw-bold mb-0">Post Sprint Bounty</h4>{" "}
                  <p className="text-muted small mb-0">
                    Simulate a company requesting a prototype
                  </p>{" "}
                </div>{" "}
              </div>{" "}
              <form onSubmit={handleCreate}>
                {" "}
                <div className="mb-3">
                  {" "}
                  <label className="form-label fw-bold">
                    Company Name
                  </label>{" "}
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={formData.companyName}
                    onChange={(e) =>
                      setFormData({ ...formData, companyName: e.target.value })
                    }
                    placeholder="e.g. Acme Startups"
                  />{" "}
                </div>{" "}
                <div className="mb-3">
                  {" "}
                  <label className="form-label fw-bold">
                    Bounty Amount ($)
                  </label>{" "}
                  <input
                    type="number"
                    className="form-control"
                    required
                    value={formData.bountyAmount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bountyAmount: Number(e.target.value),
                      })
                    }
                  />{" "}
                </div>{" "}
                <div className="mb-3">
                  {" "}
                  <label className="form-label fw-bold">
                    Project Brief
                  </label>{" "}
                  <textarea
                    className="form-control"
                    rows="3"
                    required
                    value={formData.projectBrief}
                    onChange={(e) =>
                      setFormData({ ...formData, projectBrief: e.target.value })
                    }
                    placeholder="e.g. We need a React Native mobile app mockup with 3 screens..."
                  ></textarea>{" "}
                </div>{" "}
                <div className="mb-4">
                  {" "}
                  <label className="form-label fw-bold">
                    Required Roles (comma separated)
                  </label>{" "}
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={formData.requiredRoles}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        requiredRoles: e.target.value,
                      })
                    }
                    placeholder="e.g. Frontend Dev, UI/UX Designer, Backend Dev"
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
                    className="btn btn-dark rounded-pill px-4 d-flex align-items-center gap-2"
                  >
                    <Zap size={16} /> Post Bounty
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
export default StartupSprints;
