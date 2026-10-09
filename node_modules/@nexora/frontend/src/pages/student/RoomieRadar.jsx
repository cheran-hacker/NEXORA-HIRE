import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { roomieService } from "../../services/api.js";
import {
  Home,
  Heart,
  X,
  Moon,
  Sparkles,
  Users,
  MessageSquare,
} from "lucide-react";
import { useToast } from "../../context/ToastContext";
const RoomieRadar = () => {
  const { addToast } = useToast();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [formData, setFormData] = useState({
    sleepSchedule: "Early Bird",
    cleanliness: "Average",
    socialMeter: "Chill Hangouts",
    bio: "",
  }); // Swipe state
  const [currentIndex, setCurrentIndex] = useState(0);
  useEffect(() => {
    fetchProfiles();
  }, []);
  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const res = await roomieService.getProfiles();
      setProfiles(res.data.data || []);
      setCurrentIndex(0);
    } catch (err) {
      addToast("Failed to load roomie profiles", "error");
    } finally {
      setLoading(false);
    }
  };
  const handleCreateProfile = async (e) => {
    e.preventDefault();
    try {
      await roomieService.createProfile(formData);
      addToast("Habit Profile Saved! 🏡", "success");
      setShowProfileSetup(false);
    } catch (err) {
      addToast("Failed to save profile", "error");
    }
  };
  const handleSwipe = async (id, action) => {
    try {
      await roomieService.swipeProfile(id, action);
      if (action === "like") {
        addToast("Liked! We will notify you if they like back. ❤️", "success");
      }
      setCurrentIndex((prev) => prev + 1);
    } catch (err) {
      addToast("Swipe failed", "error");
    }
  };
  if (loading)
    return (
      <div className="container-fluid py-4 d-flex justify-content-center">
        <div className="spinner-border text-primary"></div>
      </div>
    );
  const currentProfile = profiles[currentIndex];
  return (
    <div className="container-fluid py-4 px-xl-5">
      {" "}
      <div className="d-flex justify-content-between align-items-center mb-5 flex-wrap gap-3">
        {" "}
        <div>
          {" "}
          <h2 className="fw-black mb-1 text-gradient-primary d-flex align-items-center gap-2">
            {" "}
            RoomieRadar <Home size={28} />{" "}
          </h2>{" "}
          <p className="text-muted mb-0">
            Find the perfect freshman roommate based on actual living habits,
            not just majors.
          </p>{" "}
        </div>{" "}
        <button
          className="btn btn-outline-primary rounded-pill px-4 shadow-sm"
          onClick={() => setShowProfileSetup(true)}
        >
          {" "}
          Update My Habit Profile{" "}
        </button>{" "}
      </div>{" "}
      <div className="row justify-content-center">
        {" "}
        <div className="col-lg-5 col-md-8">
          {" "}
          <AnimatePresence mode="wait">
            {" "}
            {currentProfile ? (
              <motion.div
                key={currentProfile._id}
                initial={{ opacity: 0, scale: 0.9, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: -100 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="bento-card p-0 overflow-hidden shadow-lg border-0"
                style={{
                  height: "600px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {" "}
                <div
                  className="bg-card text-foreground p-5 text-center position-relative d-flex flex-column justify-content-center align-items-center"
                  style={{ height: "250px" }}
                >
                  {" "}
                  <div
                    className="bg-primary rounded-circle d-flex align-items-center justify-content-center fw-black mb-3 shadow-lg"
                    style={{ width: 80, height: 80, fontSize: "2rem" }}
                  >
                    {" "}
                    {currentProfile.student?.name?.charAt(0) || "?"}{" "}
                  </div>{" "}
                  <h3 className="fw-black mb-0">
                    {currentProfile.student?.name}
                  </h3>{" "}
                  <div className="badge bg-card text-foreground mt-2 rounded-pill px-3 py-2 shadow-sm">
                    {" "}
                    {currentProfile.compatibilityScore || "High"} Compatibility
                    Match{" "}
                  </div>{" "}
                </div>{" "}
                <div className="p-4 flex-grow-1 bg-card d-flex flex-column">
                  {" "}
                  <p className="fst-italic text-center text-muted mb-4">
                    "
                    {currentProfile.bio || "Just looking for a chill roommate."}
                    "
                  </p>{" "}
                  <div className="row g-3 mb-4 flex-grow-1">
                    {" "}
                    <div className="col-12">
                      {" "}
                      <div className="bg-light p-3 rounded-3 d-flex justify-content-between align-items-center">
                        {" "}
                        <span className="fw-bold d-flex align-items-center gap-2">
                          <Moon size={18} className="text-primary" /> Sleep
                          Schedule
                        </span>{" "}
                        <span className="badge bg-primary-subtle text-primary-emphasis">
                          {currentProfile.sleepSchedule}
                        </span>{" "}
                      </div>{" "}
                    </div>{" "}
                    <div className="col-12">
                      {" "}
                      <div className="bg-light p-3 rounded-3 d-flex justify-content-between align-items-center">
                        {" "}
                        <span className="fw-bold d-flex align-items-center gap-2">
                          <Sparkles size={18} className="text-warning" />{" "}
                          Cleanliness
                        </span>{" "}
                        <span className="badge bg-warning-subtle text-warning-emphasis">
                          {currentProfile.cleanliness}
                        </span>{" "}
                      </div>{" "}
                    </div>{" "}
                    <div className="col-12">
                      {" "}
                      <div className="bg-light p-3 rounded-3 d-flex justify-content-between align-items-center">
                        {" "}
                        <span className="fw-bold d-flex align-items-center gap-2">
                          <Users size={18} className="text-success" /> Social
                          Meter
                        </span>{" "}
                        <span className="badge bg-success-subtle text-success-emphasis">
                          {currentProfile.socialMeter}
                        </span>{" "}
                      </div>{" "}
                    </div>{" "}
                  </div>{" "}
                  <div className="d-flex justify-content-center gap-4 mt-auto">
                    {" "}
                    <button
                      className="btn btn-outline-danger rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                      style={{ width: 64, height: 64 }}
                      onClick={() => handleSwipe(currentProfile._id, "pass")}
                    >
                      {" "}
                      <X size={32} />{" "}
                    </button>{" "}
                    <button
                      className="btn btn-outline-success rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                      style={{ width: 64, height: 64 }}
                      onClick={() => handleSwipe(currentProfile._id, "like")}
                    >
                      {" "}
                      <Heart size={32} />{" "}
                    </button>{" "}
                  </div>{" "}
                </div>{" "}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bento-card p-5 text-center h-100 d-flex flex-column justify-content-center"
              >
                {" "}
                <Home
                  size={64}
                  className="text-muted opacity-25 mx-auto mb-4"
                />{" "}
                <h4 className="fw-bold text-muted">You've swiped everyone!</h4>{" "}
                <p className="text-muted small">
                  Check your matches in the messages tab.
                </p>{" "}
                <button
                  className="btn btn-primary rounded-pill mt-3 mx-auto d-flex align-items-center gap-2"
                  onClick={() => fetchProfiles()}
                >
                  {" "}
                  <MessageSquare size={18} /> View Matches (Coming Soon){" "}
                </button>{" "}
              </motion.div>
            )}{" "}
          </AnimatePresence>{" "}
        </div>{" "}
      </div>{" "}
      {/* Profile Setup Modal */}{" "}
      <AnimatePresence>
        {" "}
        {showProfileSetup && (
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
              <div className="text-center mb-4">
                {" "}
                <h4 className="fw-bold">Your Living Habit Profile</h4>{" "}
                <p className="text-muted small">
                  Be honest. Your future roommate will thank you.
                </p>{" "}
              </div>{" "}
              <form onSubmit={handleCreateProfile}>
                {" "}
                <div className="mb-3">
                  {" "}
                  <label className="form-label fw-bold">
                    Sleep Schedule
                  </label>{" "}
                  <select
                    className="form-select"
                    value={formData.sleepSchedule}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sleepSchedule: e.target.value,
                      })
                    }
                  >
                    {" "}
                    <option>Early Bird</option> <option>Night Owl</option>{" "}
                    <option>Flexible</option>{" "}
                  </select>{" "}
                </div>{" "}
                <div className="mb-3">
                  {" "}
                  <label className="form-label fw-bold">
                    Cleanliness Level
                  </label>{" "}
                  <select
                    className="form-select"
                    value={formData.cleanliness}
                    onChange={(e) =>
                      setFormData({ ...formData, cleanliness: e.target.value })
                    }
                  >
                    {" "}
                    <option>Neat Freak</option> <option>Average</option>{" "}
                    <option>Messy</option>{" "}
                  </select>{" "}
                </div>{" "}
                <div className="mb-3">
                  {" "}
                  <label className="form-label fw-bold">
                    Social Meter
                  </label>{" "}
                  <select
                    className="form-select"
                    value={formData.socialMeter}
                    onChange={(e) =>
                      setFormData({ ...formData, socialMeter: e.target.value })
                    }
                  >
                    {" "}
                    <option>Party Animal</option>{" "}
                    <option>Chill Hangouts</option>{" "}
                    <option>Quiet Study</option>{" "}
                  </select>{" "}
                </div>{" "}
                <div className="mb-4">
                  {" "}
                  <label className="form-label fw-bold">Short Bio</label>{" "}
                  <textarea
                    className="form-control"
                    rows="2"
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    placeholder="e.g. I study CS and play guitar (with headphones on!)"
                  ></textarea>{" "}
                </div>{" "}
                <div className="d-flex justify-content-end gap-2">
                  {" "}
                  <button
                    type="button"
                    className="btn btn-light rounded-pill px-4"
                    onClick={() => setShowProfileSetup(false)}
                  >
                    Cancel
                  </button>{" "}
                  <button
                    type="submit"
                    className="btn btn-primary rounded-pill px-4"
                  >
                    Save Profile
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
export default RoomieRadar;
