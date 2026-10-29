import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { pulseService } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { MapPin, Activity, CheckCircle, Navigation, Radio } from "lucide-react";
const ZONES = [
  "Library",
  "Engineering",
  "Business",
  "Cafeteria",
  "Quad",
  "Sports Complex",
  "Admin",
];
const ACTIVITIES = ["Studying", "Networking", "Event", "Dining", "Relaxing"];
export default function PulseCheckin() {
  const { addToast } = useToast();
  const [selectedZone, setSelectedZone] = useState("");
  const [selectedActivity, setSelectedActivity] = useState("");
  const [checkingIn, setCheckingIn] = useState(false);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const handleCheckIn = async () => {
    if (!selectedZone || !selectedActivity) {
      addToast("Please select both a zone and an activity.", "warning");
      return;
    }
    try {
      setCheckingIn(true);
      await pulseService.checkIn({
        zone: selectedZone,
        activityType: selectedActivity,
      });
      setHasCheckedIn(true);
      addToast("Checked into the campus network!", "success"); // Reset after 3 seconds so they can check in elsewhere later
      setTimeout(() => setHasCheckedIn(false), 3000);
    } catch (err) {
      addToast("Failed to check in to network", "error");
    } finally {
      setCheckingIn(false);
    }
  };
  return (
    <div
      className="container py-5 d-flex flex-column align-items-center min-vh-100"
      style={{ background: "var(--bg-main)" }}
    >
      {" "}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-5 w-100"
      >
        {" "}
        <div
          className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3 position-relative"
          style={{
            width: "80px",
            height: "80px",
            background:
              "linear-gradient(135deg, rgba(var(--primary-rgb), 0.1), rgba(var(--primary-rgb), 0.2))",
            border: "1px solid rgba(var(--primary-rgb), 0.2)",
          }}
        >
          {" "}
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="position-absolute w-100 h-100 rounded-circle"
            style={{ background: "rgba(var(--primary-rgb), 0.3)" }}
          />{" "}
          <Radio
            size={40}
            className="text-primary position-relative z-1"
          />{" "}
        </div>{" "}
        <h1
          className="fw-black mb-2"
          style={{
            fontSize: "3rem",
            color: "var(--text)",
            letterSpacing: "-0.03em",
          }}
        >
          Campus Pulse Check-In
        </h1>{" "}
        <p
          className="fw-medium mx-auto"
          style={{
            color: "var(--text-secondary)",
            fontSize: "1.2rem",
            maxWidth: "600px",
          }}
        >
          Broadcast your location to the real-time campus heatmap. Let your
          peers know where the action is happening.
        </p>{" "}
      </motion.div>{" "}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bento-card p-5 w-100"
        style={{ maxWidth: "800px", background: "var(--surface)" }}
      >
        {" "}
        <div className="mb-5">
          {" "}
          <h5
            className="fw-bold mb-4 d-flex align-items-center gap-2"
            style={{ color: "var(--text)" }}
          >
            <MapPin size={22} className="text-primary" /> Where are you right
            now?
          </h5>{" "}
          <div className="d-flex flex-wrap gap-3">
            {" "}
            {ZONES.map((zone) => (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                key={zone}
                onClick={() => setSelectedZone(zone)}
                className={`btn fw-bold px-4 py-3 rounded-4 ${selectedZone === zone ? "btn-primary shadow-lg" : "btn-outline-secondary"}`}
                style={{
                  border:
                    selectedZone === zone ? "none" : "1px solid var(--border)",
                  transition: "all 0.2s",
                }}
              >
                {" "}
                {zone}{" "}
              </motion.button>
            ))}{" "}
          </div>{" "}
        </div>{" "}
        <div className="mb-5">
          {" "}
          <h5
            className="fw-bold mb-4 d-flex align-items-center gap-2"
            style={{ color: "var(--text)" }}
          >
            <Activity size={22} className="text-warning" /> What are you doing?
          </h5>{" "}
          <div className="d-flex flex-wrap gap-3">
            {" "}
            {ACTIVITIES.map((act) => (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                key={act}
                onClick={() => setSelectedActivity(act)}
                className={`btn fw-bold px-4 py-3 rounded-4 ${selectedActivity === act ? "btn-warning text-foreground shadow-lg" : "btn-outline-secondary"}`}
                style={{
                  border:
                    selectedActivity === act
                      ? "none"
                      : "1px solid var(--border)",
                  transition: "all 0.2s",
                }}
              >
                {" "}
                {act}{" "}
              </motion.button>
            ))}{" "}
          </div>{" "}
        </div>{" "}
        <div className="text-center mt-5 pt-4 border-top border">
          {" "}
          <AnimatePresence mode="wait">
            {" "}
            {hasCheckedIn ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="d-flex flex-column align-items-center gap-3"
              >
                {" "}
                <CheckCircle size={64} className="text-success" />{" "}
                <h3 className="fw-bold text-success mb-0">
                  Check-in Broadcasted!
                </h3>{" "}
                <p className="text-secondary">
                  Your pulse has been added to the heatmap.
                </p>{" "}
              </motion.div>
            ) : (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCheckIn}
                disabled={checkingIn || !selectedZone || !selectedActivity}
                className="btn btn-primary btn-lg fw-black rounded-pill px-5 py-3 d-inline-flex align-items-center gap-3 shadow-lg hover-glow"
                style={{ fontSize: "1.2rem" }}
              >
                {" "}
                {checkingIn ? (
                  <div className="spinner-border spinner-border-sm"></div>
                ) : (
                  <Navigation size={24} />
                )}{" "}
                Broadcast My Pulse{" "}
              </motion.button>
            )}{" "}
          </AnimatePresence>{" "}
        </div>{" "}
      </motion.div>{" "}
    </div>
  );
}
