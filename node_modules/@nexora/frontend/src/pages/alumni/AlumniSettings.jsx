import React, { useState } from "react";
import { Settings, Bell, Shield, Key, Save } from "lucide-react";
import { useToast } from "../../context/ToastContext";
import { motion } from "framer-motion";
import api from "../../services/api.js";
export default function AlumniSettings() {
  const { addToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    mentorshipRequests: true,
    publicProfile: true,
    twoFactor: false,
  });
  const handleToggle = (key) => {
    setSettings((p) => ({ ...p, [key]: !p[key] }));
  };
  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put("/alumni/settings", settings);
      addToast("Settings updated successfully!", "success");
    } catch (err) {
      addToast("Failed to update settings", "error");
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="container-fluid space-y-4" style={{ maxWidth: "800px" }}>
      {" "}
      <div className="d-flex align-items-center justify-content-between mb-4">
        {" "}
        <div>
          {" "}
          <h2
            className="fw-black mb-1 d-flex align-items-center gap-2"
            style={{ color: "var(--text)" }}
          >
            {" "}
            <Settings size={32} className="text-primary" /> Account
            Settings{" "}
          </h2>{" "}
          <p
            className="fw-medium mb-0"
            style={{ color: "var(--text-secondary)" }}
          >
            Configure your preferences and security.
          </p>{" "}
        </div>{" "}
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn rounded-pill px-4 fw-bold shadow-sm d-flex align-items-center gap-2 hover-lift"
          style={{
            background: "var(--primary)",
            color: "#fff",
            border: "none",
          }}
        >
          {" "}
          {saving ? (
            <span className="spinner-border spinner-border-sm" />
          ) : (
            <Save size={18} />
          )}{" "}
          Save Changes{" "}
        </button>{" "}
      </div>{" "}
      <div className="row g-4">
        {" "}
        <div className="col-12">
          {" "}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bento-card p-4 p-md-5"
          >
            {" "}
            <h5
              className="fw-bold mb-4 d-flex align-items-center gap-2"
              style={{ color: "var(--text)" }}
            >
              {" "}
              <Bell size={20} className="text-primary" /> Notifications{" "}
            </h5>{" "}
            <div
              className="d-flex align-items-center justify-content-between mb-3 pb-3"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              {" "}
              <div>
                {" "}
                <h6 className="fw-bold mb-1" style={{ color: "var(--text)" }}>
                  Email Notifications
                </h6>{" "}
                <small className="text-muted fw-medium">
                  Receive updates about new mentorship requests.
                </small>{" "}
              </div>{" "}
              <div className="form-check form-switch fs-4 m-0">
                {" "}
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  checked={settings.emailNotifications}
                  onChange={() => handleToggle("emailNotifications")}
                />{" "}
              </div>{" "}
            </div>{" "}
            <div className="d-flex align-items-center justify-content-between">
              {" "}
              <div>
                {" "}
                <h6 className="fw-bold mb-1" style={{ color: "var(--text)" }}>
                  Mentorship Requests
                </h6>{" "}
                <small className="text-muted fw-medium">
                  Allow students to book mentorship sessions with you.
                </small>{" "}
              </div>{" "}
              <div className="form-check form-switch fs-4 m-0">
                {" "}
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  checked={settings.mentorshipRequests}
                  onChange={() => handleToggle("mentorshipRequests")}
                />{" "}
              </div>{" "}
            </div>{" "}
          </motion.div>{" "}
        </div>{" "}
        <div className="col-12">
          {" "}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bento-card p-4 p-md-5"
          >
            {" "}
            <h5
              className="fw-bold mb-4 d-flex align-items-center gap-2"
              style={{ color: "var(--text)" }}
            >
              {" "}
              <Shield size={20} className="text-primary" /> Privacy &
              Security{" "}
            </h5>{" "}
            <div
              className="d-flex align-items-center justify-content-between mb-3 pb-3"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              {" "}
              <div>
                {" "}
                <h6 className="fw-bold mb-1" style={{ color: "var(--text)" }}>
                  Public Profile
                </h6>{" "}
                <small className="text-muted fw-medium">
                  Make your profile visible in the Alumni Directory.
                </small>{" "}
              </div>{" "}
              <div className="form-check form-switch fs-4 m-0">
                {" "}
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  checked={settings.publicProfile}
                  onChange={() => handleToggle("publicProfile")}
                />{" "}
              </div>{" "}
            </div>{" "}
            <div className="d-flex align-items-center justify-content-between mb-4">
              {" "}
              <div>
                {" "}
                <h6 className="fw-bold mb-1" style={{ color: "var(--text)" }}>
                  Two-Factor Authentication
                </h6>{" "}
                <small className="text-muted fw-medium">
                  Add an extra layer of security to your account.
                </small>{" "}
              </div>{" "}
              <div className="form-check form-switch fs-4 m-0">
                {" "}
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  checked={settings.twoFactor}
                  onChange={() => handleToggle("twoFactor")}
                />{" "}
              </div>{" "}
            </div>{" "}
            <button
              onClick={() =>
                addToast(
                  "Change password module will be available in the next update",
                  "info",
                )
              }
              className="btn btn-outline-danger fw-bold rounded-pill px-4 d-flex align-items-center gap-2"
            >
              {" "}
              <Key size={16} /> Change Password{" "}
            </button>{" "}
          </motion.div>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}
