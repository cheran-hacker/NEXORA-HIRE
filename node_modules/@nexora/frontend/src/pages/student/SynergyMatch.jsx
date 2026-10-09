import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { synergyService } from "../../services/api.js";
import {
  Users,
  Lightbulb,
  Rocket,
  Settings,
  Check,
  X,
  ArrowRight,
  UserPlus,
  ShieldAlert,
} from "lucide-react";
import { useToast } from "../../context/ToastContext";
const SynergyMatch = () => {
  const { addToast } = useToast();
  const [profile, setProfile] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfig, setShowConfig] = useState(false);
  const [formData, setFormData] = useState({
    primaryRole: "Hacker",
    lookingFor: ["Hustler"],
    ideaStage: "Just Exploring",
    commitmentLevel: "Part-time (Evenings)",
    pitchIdea: "",
  });
  useEffect(() => {
    fetchData();
  }, []);
  const fetchData = async () => {
    try {
      setLoading(true);
      const profileRes = await synergyService.getMyProfile();
      if (profileRes.data.data) {
        setProfile(profileRes.data.data);
        setFormData(profileRes.data.data);
        const matchesRes = await synergyService.getMatches();
        setMatches(matchesRes.data.data || []);
      } else {
        setShowConfig(true); // Force them to create a profile
      }
    } catch (err) {
      if (err.response?.status !== 400) {
        addToast("Failed to load synergy data", "error");
      }
    } finally {
      setLoading(false);
    }
  };
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      await synergyService.createOrUpdateProfile(formData);
      addToast("Synergy Profile updated!", "success");
      setShowConfig(false);
      fetchData(); // Reload matches
    } catch (err) {
      addToast("Failed to save profile", "error");
    }
  };
  const toggleLookingFor = (role) => {
    setFormData((prev) => {
      const exists = prev.lookingFor.includes(role);
      let newRoles = [];
      if (exists) {
        newRoles = prev.lookingFor.filter((r) => r !== role);
      } else {
        newRoles = [...prev.lookingFor, role];
      }
      return { ...prev, lookingFor: newRoles };
    });
  };
  const RoleIcon = ({ role }) => {
    if (role === "Hacker") return <Code2 size={16} className="text-primary" />;
    if (role === "Hustler") return <Target size={16} className="text-danger" />;
    return <Brush size={16} className="text-info" />; // Hipster
  };
  if (loading) {
    return (
      <div className="container-fluid py-4 d-flex justify-content-center">
        {" "}
        <div className="spinner-border text-primary"></div>{" "}
      </div>
    );
  }
  return (
    <div className="container-fluid py-4 px-xl-5">
      {" "}
      <div className="d-flex justify-content-between align-items-center mb-5">
        {" "}
        <div>
          {" "}
          <h2 className="fw-black mb-1 text-gradient-primary">
            Startup Synergy <Rocket className="d-inline pb-1 text-primary" />
          </h2>{" "}
          <p className="text-muted mb-0">
            Find the Wozniak to your Jobs. Cross-disciplinary co-founder
            matching.
          </p>{" "}
        </div>{" "}
        {profile && (
          <button
            className="btn btn-outline-primary rounded-pill px-4 d-flex align-items-center gap-2"
            onClick={() => setShowConfig(true)}
          >
            {" "}
            <Settings size={18} /> My Profile{" "}
          </button>
        )}{" "}
      </div>{" "}
      {!profile && !showConfig ? (
        <div className="text-center py-5">
          {" "}
          <Users size={64} className="text-primary mb-3 opacity-75" />{" "}
          <h3 className="fw-bold">Ready to build something?</h3>{" "}
          <p className="text-muted mb-4 max-w-2xl mx-auto">
            Create your Synergy Profile to let the algorithm match you with
            students from other departments who have the complementary skills
            you need.
          </p>{" "}
          <button
            className="btn btn-primary rounded-pill px-5 py-2 fs-5 fw-bold"
            onClick={() => setShowConfig(true)}
          >
            {" "}
            Initialize Synergy Matrix{" "}
          </button>{" "}
        </div>
      ) : (
        <div className="row g-4">
          {" "}
          <div className="col-12 mb-2">
            {" "}
            <h5 className="fw-bold mb-0">
              Based on your profile, here are your top matches:
            </h5>{" "}
          </div>{" "}
          {matches.length > 0
            ? matches.map((match, i) => (
                <div className="col-md-6 col-lg-4" key={match._id}>
                  {" "}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="bento-card h-100 d-flex flex-column hover-scale"
                    style={{
                      borderTop: `4px solid ${match.primaryRole === "Hacker" ? "#1677ff" : match.primaryRole === "Hustler" ? "#f5222d" : "#13c2c2"}`,
                    }}
                  >
                    {" "}
                    <div className="p-4 d-flex flex-column h-100">
                      {" "}
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        {" "}
                        <div className="d-flex align-items-center gap-3">
                          {" "}
                          <div
                            className="bg-light rounded-circle d-flex align-items-center justify-content-center fw-bold fs-4 text-primary"
                            style={{ width: 50, height: 50 }}
                          >
                            {" "}
                            {match.user?.name?.charAt(0)}{" "}
                          </div>{" "}
                          <div>
                            {" "}
                            <h5 className="fw-bold mb-0">
                              {match.user?.name}
                            </h5>{" "}
                            <div className="text-muted small fw-semibold">
                              {match.primaryRole}
                            </div>{" "}
                          </div>{" "}
                        </div>{" "}
                        <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill">
                          {" "}
                          98% Match{" "}
                        </span>{" "}
                      </div>{" "}
                      <div className="mb-4">
                        {" "}
                        <div
                          className="text-muted small fw-bold mb-1 text-uppercase"
                          style={{ letterSpacing: "1px" }}
                        >
                          Stage
                        </div>{" "}
                        <div className="d-flex align-items-center gap-2 fw-semibold">
                          {" "}
                          <Lightbulb size={16} className="text-warning" />{" "}
                          {match.ideaStage}{" "}
                        </div>{" "}
                      </div>{" "}
                      {match.pitchIdea && (
                        <div className="mb-4 p-3 bg-light rounded-3 border border-dashed">
                          {" "}
                          <div className="text-muted small fw-bold mb-1">
                            Their Idea
                          </div>{" "}
                          <p className="small mb-0 fst-italic">
                            "{match.pitchIdea}"
                          </p>{" "}
                        </div>
                      )}{" "}
                      <div
                        className="mt-auto pt-3 border-top d-flex justify-content-between align-items-center"
                        style={{ borderColor: "var(--border) !important" }}
                      >
                        {" "}
                        <div className="text-muted small">
                          {" "}
                          Looking for:{" "}
                          <span className="fw-bold">
                            {match.lookingFor.join(", ")}
                          </span>{" "}
                        </div>{" "}
                        <button
                          onClick={async () => {
                            try {
                              await synergyService.connectWithMatch(match._id);
                              addToast(
                                `Connection request sent to ${match.name}! 🤝`,
                                "success",
                              );
                            } catch (err) {
                              addToast(
                                err.message || "Failed to connect",
                                "error",
                              );
                            }
                          }}
                          className="btn btn-primary rounded-circle p-2 hover-glow"
                          title="Connect"
                        >
                          {" "}
                          <UserPlus size={18} />{" "}
                        </button>{" "}
                      </div>{" "}
                    </div>{" "}
                  </motion.div>{" "}
                </div>
              ))
            : profile && (
                <div className="col-12 text-center py-5">
                  {" "}
                  <ShieldAlert
                    size={64}
                    className="text-muted mb-3 opacity-50"
                  />{" "}
                  <h4 className="fw-bold text-muted">
                    No perfect matches found right now
                  </h4>{" "}
                  <p className="text-muted">
                    We couldn't find anyone looking for a {profile.primaryRole}{" "}
                    who is also a {profile.lookingFor.join(" or ")}. Try
                    broadening your search criteria.
                  </p>{" "}
                </div>
              )}{" "}
        </div>
      )}{" "}
      {/* Config Modal */}{" "}
      <AnimatePresence>
        {" "}
        {showConfig && (
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
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bento-card p-0 overflow-hidden"
              style={{
                width: "90%",
                maxWidth: "600px",
                maxHeight: "90vh",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {" "}
              <div
                className="p-4 border-bottom"
                style={{
                  borderColor: "var(--border) !important",
                  background: "var(--surface-2)",
                }}
              >
                {" "}
                <h4 className="fw-bold mb-0">Your Synergy Profile</h4>{" "}
              </div>{" "}
              <div className="p-4 overflow-auto">
                {" "}
                <form onSubmit={handleSaveProfile}>
                  {" "}
                  <div className="mb-4">
                    {" "}
                    <label className="form-label fw-bold">
                      1. Who are you?
                    </label>{" "}
                    <div className="d-flex gap-2">
                      {" "}
                      {["Hacker", "Hustler", "Hipster"].map((role) => (
                        <button
                          key={role}
                          type="button"
                          className={`btn flex-fill ${formData.primaryRole === role ? "btn-primary" : "btn-outline-secondary"}`}
                          onClick={() =>
                            setFormData({ ...formData, primaryRole: role })
                          }
                        >
                          {" "}
                          {role}{" "}
                        </button>
                      ))}{" "}
                    </div>{" "}
                    <div className="form-text mt-2">
                      {" "}
                      <strong>Hacker:</strong> Engineer/Dev.{" "}
                      <strong>Hustler:</strong> Sales/Business.{" "}
                      <strong>Hipster:</strong> Design/UX.{" "}
                    </div>{" "}
                  </div>{" "}
                  <div className="mb-4">
                    {" "}
                    <label className="form-label fw-bold">
                      2. Who are you looking for?
                    </label>{" "}
                    <div className="d-flex gap-2">
                      {" "}
                      {["Hacker", "Hustler", "Hipster"].map((role) => (
                        <button
                          key={role}
                          type="button"
                          className={`btn flex-fill ${formData.lookingFor.includes(role) ? "btn-primary" : "btn-outline-secondary"}`}
                          onClick={() => toggleLookingFor(role)}
                        >
                          {" "}
                          {role}{" "}
                        </button>
                      ))}{" "}
                    </div>{" "}
                  </div>{" "}
                  <div className="mb-4">
                    {" "}
                    <label className="form-label fw-bold">
                      3. What stage are you at?
                    </label>{" "}
                    <select
                      className="form-select"
                      value={formData.ideaStage}
                      onChange={(e) =>
                        setFormData({ ...formData, ideaStage: e.target.value })
                      }
                    >
                      {" "}
                      <option value="Just Exploring">
                        Just Exploring
                      </option>{" "}
                      <option value="Have an Idea">Have an Idea</option>{" "}
                      <option value="Building MVP">Building MVP</option>{" "}
                      <option value="Have Revenue">Have Revenue</option>{" "}
                    </select>{" "}
                  </div>{" "}
                  {["Have an Idea", "Building MVP", "Have Revenue"].includes(
                    formData.ideaStage,
                  ) && (
                    <div className="mb-4">
                      {" "}
                      <label className="form-label fw-bold">
                        4. Pitch your idea (1-2 sentences)
                      </label>{" "}
                      <textarea
                        className="form-control"
                        rows="2"
                        value={formData.pitchIdea}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            pitchIdea: e.target.value,
                          })
                        }
                        maxLength="150"
                      ></textarea>{" "}
                    </div>
                  )}{" "}
                  <div
                    className="d-flex justify-content-end gap-2 pt-4 border-top"
                    style={{ borderColor: "var(--border) !important" }}
                  >
                    {" "}
                    {profile && (
                      <button
                        type="button"
                        className="btn btn-light rounded-pill px-4"
                        onClick={() => setShowConfig(false)}
                      >
                        Cancel
                      </button>
                    )}{" "}
                    <button
                      type="submit"
                      className="btn btn-primary rounded-pill px-4 fw-bold"
                    >
                      {" "}
                      Save Profile & Match{" "}
                    </button>{" "}
                  </div>{" "}
                </form>{" "}
              </div>{" "}
            </motion.div>{" "}
          </motion.div>
        )}{" "}
      </AnimatePresence>{" "}
    </div>
  );
}; // Add missing icon components for this file since they are just used here
const Target = ({ size, className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);
const Code2 = ({ size, className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);
const Brush = ({ size, className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m9.06 11.9 8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08" />
    <path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-3-3.02z" />
  </svg>
);
export default SynergyMatch;
