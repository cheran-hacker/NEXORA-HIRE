import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sosService } from "../../services/api.js";
import {
  ShieldAlert,
  MapPin,
  Radio,
  CheckCircle,
  AlertTriangle,
  PhoneCall,
  Shield,
} from "lucide-react";
import { useToast } from "../../context/ToastContext";
const SosMesh = () => {
  const { addToast } = useToast();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPressing, setIsPressing] = useState(false);
  const [pressProgress, setPressProgress] = useState(0); // Geolocation would go here in a real app
  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 15000);
    return () => clearInterval(interval);
  }, []);
  const fetchAlerts = async () => {
    try {
      const res = await sosService.getActiveAlerts();
      setAlerts(res.data.data || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };
  const triggerSOS = async () => {
    try {
      const location = "Unknown Location (Geolocation API required)";
      await sosService.triggerSOS({ location });
      addToast(
        "SOS Signal Broadcasted! Help is on the way. 🚨",
        { duration: 5000, style: { background: "#dc3545", color: "#fff" } },
        "success",
      );
      fetchAlerts();
    } catch (err) {
      addToast("Failed to trigger SOS", "error");
    }
  };
  const resolveAlert = async (id, status) => {
    try {
      await sosService.resolveAlert(id, status);
      addToast("Alert resolved.", "success");
      fetchAlerts();
    } catch (err) {
      addToast("Failed to resolve alert", "error");
    }
  }; // Hold-to-Trigger Logic to prevent accidental presses
  useEffect(() => {
    let timer;
    if (isPressing) {
      timer = setInterval(() => {
        setPressProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            setIsPressing(false);
            triggerSOS();
            return 0;
          }
          return prev + 5; // 2 seconds total (20 * 100ms)
        });
      }, 100);
    } else {
      setPressProgress(0);
    }
    return () => clearInterval(timer);
  }, [isPressing]);
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
            Campus SOS Mesh <ShieldAlert size={28} />{" "}
          </h2>{" "}
          <p className="text-muted mb-0">
            Emergency WebSocket broadcasting network. Hold the button to alert
            security instantly.
          </p>{" "}
        </div>{" "}
        <div className="d-flex align-items-center gap-2">
          {" "}
          <div
            className="spinner-grow spinner-grow-sm text-danger"
            role="status"
          ></div>{" "}
          <span className="fw-bold text-danger">Live Mesh Active</span>{" "}
        </div>{" "}
      </div>{" "}
      <div className="row g-4 align-items-stretch">
        {" "}
        {/* Panic Button Area */}{" "}
        <div className="col-lg-6">
          {" "}
          <div className="bento-card p-5 h-100 d-flex flex-column align-items-center justify-content-center position-relative overflow-hidden border border-danger border-2">
            {" "}
            <div
              className="position-absolute w-100 h-100 top-0 start-0 z-0 opacity-10"
              style={{
                background:
                  "repeating-radial-gradient(circle, #dc3545, #dc3545 10px, transparent 10px, transparent 20px)",
              }}
            ></div>{" "}
            <h4 className="fw-black text-foreground position-relative z-1 mb-5 text-center">
              Hold for 2 Seconds to Broadcast SOS
            </h4>{" "}
            <div
              className="position-relative z-1 mb-5"
              style={{ width: "250px", height: "250px" }}
            >
              {" "}
              {/* Progress Ring */}{" "}
              <svg
                className="position-absolute top-0 start-0 w-100 h-100"
                viewBox="0 0 100 100"
                style={{ transform: "rotate(-90deg)" }}
              >
                {" "}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#ffe5e5"
                  strokeWidth="10"
                />{" "}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#dc3545"
                  strokeWidth="10"
                  strokeDasharray="283"
                  strokeDashoffset={283 - (283 * pressProgress) / 100}
                  style={{ transition: "stroke-dashoffset 0.1s linear" }}
                />{" "}
              </svg>{" "}
              {/* The Button */}{" "}
              <button
                className="btn btn-danger w-100 h-100 rounded-circle shadow-lg position-absolute top-0 start-0 d-flex flex-column align-items-center justify-content-center gap-2 border border-5 border-white"
                onMouseDown={() => setIsPressing(true)}
                onMouseUp={() => setIsPressing(false)}
                onMouseLeave={() => setIsPressing(false)}
                onTouchStart={() => setIsPressing(true)}
                onTouchEnd={() => setIsPressing(false)}
                style={{
                  transform: isPressing ? "scale(0.95)" : "scale(1)",
                  transition: "transform 0.2s",
                }}
              >
                {" "}
                <Radio
                  size={64}
                  className={isPressing ? "animate-pulse" : ""}
                />{" "}
                <h3 className="fw-black mb-0 text-foreground">SOS</h3>{" "}
              </button>{" "}
            </div>{" "}
            <div className="alert alert-danger mb-0 position-relative z-1 fw-bold border border-danger">
              {" "}
              <AlertTriangle size={18} className="me-2" /> Misuse of the SOS
              system may result in disciplinary action.{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
        {/* Active Alerts Feed */}{" "}
        <div className="col-lg-6">
          {" "}
          <div className="bento-card bg-card text-foreground p-4 h-100 d-flex flex-column">
            {" "}
            <h4 className="fw-black mb-4 d-flex align-items-center gap-2 text-warning">
              <Radio size={24} className="animate-pulse" /> Security Dispatch
              Feed
            </h4>{" "}
            <div
              className="flex-grow-1 overflow-auto d-flex flex-column gap-3 pe-2"
              style={{ maxHeight: "400px" }}
            >
              {" "}
              <AnimatePresence>
                {" "}
                {alerts.map((alert) => (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    key={alert._id}
                    className="bg-black bg-opacity-50 p-3 rounded-3 border border-danger border-opacity-50 position-relative overflow-hidden"
                  >
                    {" "}
                    <div className="position-absolute top-0 start-0 h-100 w-1 bg-danger shadow-lg blur"></div>{" "}
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      {" "}
                      <div className="fw-bold text-danger d-flex align-items-center gap-2">
                        {" "}
                        <ShieldAlert size={18} /> ACTIVE ALERT{" "}
                      </div>{" "}
                      <div className="small text-foreground-50">
                        {new Date(alert.createdAt).toLocaleTimeString()}
                      </div>{" "}
                    </div>{" "}
                    <h5 className="fw-bold mb-1">
                      <MapPin size={18} className="text-warning" />{" "}
                      {alert.location}
                    </h5>{" "}
                    <p className="small text-foreground-50 mb-3">
                      Reported by: {alert.reportedBy?.name || "Anonymous User"}
                    </p>{" "}
                    <div className="d-flex gap-2">
                      {" "}
                      <button
                        className="btn btn-sm btn-outline-light flex-grow-1"
                        onClick={() => resolveAlert(alert._id, "Resolved")}
                      >
                        Mark Safe
                      </button>{" "}
                      <button
                        className="btn btn-sm btn-outline-danger flex-grow-1"
                        onClick={() => resolveAlert(alert._id, "FalseAlarm")}
                      >
                        False Alarm
                      </button>{" "}
                    </div>{" "}
                  </motion.div>
                ))}{" "}
              </AnimatePresence>{" "}
              {alerts.length === 0 && (
                <div className="text-center text-foreground-50 py-5">
                  {" "}
                  <Shield size={48} className="mb-3 opacity-25" />{" "}
                  <h5>No active alerts on campus.</h5>{" "}
                  <p className="small">The campus is currently secure.</p>{" "}
                </div>
              )}{" "}
            </div>{" "}
            <div className="mt-4 bg-black bg-opacity-50 p-3 rounded-3 d-flex align-items-center justify-content-between">
              {" "}
              <div>
                {" "}
                <div className="small text-foreground-50 fw-bold text-uppercase">
                  Direct Line
                </div>{" "}
                <div className="fw-black fs-5">Campus Security</div>{" "}
              </div>{" "}
              <a
                href="tel:911"
                className="btn btn-warning rounded-circle p-3 shadow-sm"
              >
                {" "}
                <PhoneCall size={20} className="text-foreground" />{" "}
              </a>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
};
export default SosMesh;
