import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Laptop,
  Key,
  QrCode,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext";
const SecurityCenter = () => {
  const { addToast } = useToast();
  const { user } = useAuth();
  const [is2FAEnabled, setIs2FAEnabled] = useState(
    user?.isTwoFactorEnabled || false,
  );
  const [qrCode, setQrCode] = useState(null);
  const [secret, setSecret] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const start2FASetup = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:5000/api/auth/2fa/generate",
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.data.success) {
        setQrCode(res.data.qrCode);
        setSecret(res.data.secret);
        setShow2FASetup(true);
      }
    } catch (err) {
      addToast("Failed to generate 2FA token", "error");
    } finally {
      setIsLoading(false);
    }
  };
  const verify2FA = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:5000/api/auth/2fa/verify",
        { token: verificationCode },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.data.success) {
        setIs2FAEnabled(true);
        setShow2FASetup(false);
        addToast("2FA successfully enabled!", "success");
      }
    } catch (err) {
      addToast("Invalid verification code", "error");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="container-fluid py-4" style={{ color: "var(--text)" }}>
      {" "}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4"
      >
        {" "}
        <h2 className="fw-black mb-1 d-flex align-items-center gap-2">
          {" "}
          <Shield size={32} className="text-primary" /> Security Center{" "}
        </h2>{" "}
        <p style={{ color: "var(--text-muted)" }}>
          Manage your account security and authentication methods
        </p>{" "}
      </motion.div>{" "}
      <div className="row g-4">
        {" "}
        {/* 2FA Section */}{" "}
        <div className="col-lg-6">
          {" "}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="card border-0 shadow-sm h-100"
            style={{ background: "var(--surface)", borderRadius: "16px" }}
          >
            {" "}
            <div className="card-body p-4">
              {" "}
              <div className="d-flex align-items-center justify-content-between mb-4">
                {" "}
                <div className="d-flex align-items-center gap-3">
                  {" "}
                  <div
                    className={`p-3 rounded-circle ${is2FAEnabled ? "bg-success" : "bg-warning"}`}
                    style={{ bgOpacity: 0.2 }}
                  >
                    {" "}
                    {is2FAEnabled ? (
                      <ShieldCheck size={24} className="text-foreground" />
                    ) : (
                      <ShieldAlert size={24} className="text-foreground" />
                    )}{" "}
                  </div>{" "}
                  <div>
                    {" "}
                    <h5 className="fw-bold mb-1">
                      Two-Factor Authentication
                    </h5>{" "}
                    <span
                      className={`badge ${is2FAEnabled ? "bg-success" : "bg-warning text-foreground"}`}
                    >
                      {" "}
                      {is2FAEnabled ? "Enabled" : "Not Configured"}{" "}
                    </span>{" "}
                  </div>{" "}
                </div>{" "}
              </div>{" "}
              {!is2FAEnabled && !show2FASetup && (
                <div>
                  {" "}
                  <p
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: "0.9rem",
                    }}
                  >
                    {" "}
                    Add an extra layer of security to your account. We'll ask
                    for a login code in addition to your password.{" "}
                  </p>{" "}
                  <button
                    className="btn btn-primary fw-bold"
                    onClick={start2FASetup}
                    disabled={isLoading}
                  >
                    {" "}
                    {isLoading ? "Setting up..." : "Set up 2FA"}{" "}
                  </button>{" "}
                </div>
              )}{" "}
              {show2FASetup && (
                <div
                  className="border rounded-4 p-4 mt-3"
                  style={{ borderColor: "var(--border)" }}
                >
                  {" "}
                  <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                    <QrCode size={18} /> Scan QR Code
                  </h6>{" "}
                  <p className="small text-muted mb-3">
                    Scan this code with Google Authenticator or Authy.
                  </p>{" "}
                  <div className="text-center mb-4">
                    {" "}
                    <img
                      src={qrCode}
                      alt="2FA QR Code"
                      className="img-fluid rounded"
                      style={{ maxWidth: "200px" }}
                    />{" "}
                  </div>{" "}
                  <div className="mb-3">
                    {" "}
                    <label className="form-label small fw-bold">
                      Verification Code
                    </label>{" "}
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter 6-digit code"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      maxLength="6"
                      style={{
                        letterSpacing: "0.5em",
                        textAlign: "center",
                        fontSize: "1.2rem",
                        fontWeight: "bold",
                      }}
                    />{" "}
                  </div>{" "}
                  <div className="d-flex gap-2">
                    {" "}
                    <button
                      className="btn btn-secondary flex-grow-1 fw-bold"
                      onClick={() => setShow2FASetup(false)}
                    >
                      Cancel
                    </button>{" "}
                    <button
                      className="btn btn-primary flex-grow-1 fw-bold"
                      onClick={verify2FA}
                      disabled={isLoading || verificationCode.length !== 6}
                    >
                      {" "}
                      {isLoading ? "Verifying..." : "Verify & Enable"}{" "}
                    </button>{" "}
                  </div>{" "}
                </div>
              )}{" "}
              {is2FAEnabled && (
                <div>
                  {" "}
                  <p
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: "0.9rem",
                    }}
                  >
                    {" "}
                    Your account is protected by 2FA. You will be prompted for a
                    code each time you sign in on a new device.{" "}
                  </p>{" "}
                  <button
                    onClick={() => addToast("Disabling 2FA...", "info")}
                    className="btn btn-outline-danger fw-bold btn-sm"
                  >
                    Disable 2FA
                  </button>{" "}
                </div>
              )}{" "}
            </div>{" "}
          </motion.div>{" "}
        </div>{" "}
        {/* Device Management Section (Mocked for UI purposes) */}{" "}
        <div className="col-lg-6">
          {" "}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="card border-0 shadow-sm h-100"
            style={{ background: "var(--surface)", borderRadius: "16px" }}
          >
            {" "}
            <div className="card-body p-4">
              {" "}
              <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
                {" "}
                <Laptop size={20} className="text-primary" /> Active
                Devices{" "}
              </h5>{" "}
              <div className="d-flex flex-column gap-3">
                {" "}
                <div
                  className="d-flex justify-content-between align-items-center p-3 border rounded-3"
                  style={{ borderColor: "var(--border)" }}
                >
                  {" "}
                  <div className="d-flex align-items-center gap-3">
                    {" "}
                    <div className="bg-primary bg-opacity-10 p-2 rounded text-primary">
                      {" "}
                      <Laptop size={24} />{" "}
                    </div>{" "}
                    <div>
                      {" "}
                      <h6 className="mb-0 fw-bold">
                        MacBook Pro (This Device)
                      </h6>{" "}
                      <small className="text-success">
                        Active now • Chrome on macOS
                      </small>{" "}
                    </div>{" "}
                  </div>{" "}
                </div>{" "}
                <div
                  className="d-flex justify-content-between align-items-center p-3 border rounded-3"
                  style={{ borderColor: "var(--border)" }}
                >
                  {" "}
                  <div className="d-flex align-items-center gap-3">
                    {" "}
                    <div className="bg-secondary bg-opacity-10 p-2 rounded text-secondary">
                      {" "}
                      <Smartphone size={24} />{" "}
                    </div>{" "}
                    <div>
                      {" "}
                      <h6 className="mb-0 fw-bold">iPhone 14 Pro</h6>{" "}
                      <small className="text-muted">
                        Last active 2 hrs ago • Safari on iOS
                      </small>{" "}
                    </div>{" "}
                  </div>{" "}
                  <button
                    onClick={() => addToast("Revoking session...", "info")}
                    className="btn btn-sm btn-outline-danger"
                  >
                    Revoke
                  </button>{" "}
                </div>{" "}
              </div>{" "}
            </div>{" "}
          </motion.div>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
};
export default SecurityCenter;
