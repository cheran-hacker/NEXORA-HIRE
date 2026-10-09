import { useToast } from "../../context/ToastContext";
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Map,
  MapPin,
  Camera,
  ScanLine,
  Trophy,
  ArrowRight,
  Target,
  Navigation,
  CheckCircle2,
  QrCode,
} from "lucide-react";
import { argService } from "../../services/api";
export default function ScavengerHunt() {
  const { addToast } = useToast();
  const [scanning, setScanning] = useState(false);
  const [completed, setCompleted] = useState([1]);
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  React.useEffect(() => {
    const fetchNodes = async () => {
      try {
        const res = await argService.getNodes();
        setMissions(res.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNodes();
  }, []);
  const handleScan = () => {
    alert(
      "Camera scanning functionality requires a real device and backend integration.",
    );
  };
  return (
    <div
      className="container-fluid space-y-4 pb-5"
      style={{ maxWidth: "1400px" }}
    >
      {" "}
      {/* Header */}{" "}
      <div
        className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-4 bento-card p-4 position-relative overflow-hidden mb-4"
        style={{ borderColor: "rgba(16,185,129,0.2)" }}
      >
        {" "}
        <div
          className="position-absolute rounded-circle pe-none"
          style={{
            top: 0,
            right: 0,
            width: "250px",
            height: "250px",
            background: "rgba(16,185,129,0.1)",
            filter: "blur(100px)",
          }}
        ></div>{" "}
        <div className="position-relative z-1">
          {" "}
          <h2
            className="fw-black mb-2 d-flex align-items-center gap-3"
            style={{ fontSize: "2.5rem", color: "var(--text)" }}
          >
            {" "}
            <Map className="text-success" size={32} /> Freshman ARG Hunt{" "}
          </h2>{" "}
          <p
            className="fw-medium mb-0"
            style={{ color: "var(--text-secondary)" }}
          >
            Discover the campus, complete real-world missions, and earn your
            first Nexora Karma points.
          </p>{" "}
        </div>{" "}
        <div className="position-relative z-1 d-flex gap-3">
          {" "}
          <div
            className="rounded-4 p-3 d-flex align-items-center gap-3"
            style={{
              background: "rgba(var(--success-rgb), 0.2)",
              border: "1px solid rgba(var(--success-rgb), 0.3)",
            }}
          >
            {" "}
            <Trophy className="text-success" size={24} />{" "}
            <div>
              {" "}
              <div className="small fw-bold text-uppercase tracking-wider text-success">
                Total Earned
              </div>{" "}
              <div
                className="h4 fw-black mb-0"
                style={{ color: "var(--text)" }}
              >
                50 Karma
              </div>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
      <div className="row g-4">
        {" "}
        {/* Mission List */}{" "}
        <div className="col-lg-8 space-y-4">
          {" "}
          <h4
            className="fw-black mb-4 d-flex align-items-center gap-2"
            style={{ color: "var(--text)" }}
          >
            {" "}
            <Target className="text-success" /> Active Missions{" "}
          </h4>{" "}
          {missions.map((mission, i) => {
            const isCompleted = completed.includes(mission.id);
            const isLocked = mission.status === "locked";
            return (
              <motion.div
                key={mission._id || mission.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`bento-card p-4 transition-fast mb-3 ${isCompleted ? "border-success" : isLocked ? "opacity-50" : "hover-glow"}`}
                style={{
                  background: isCompleted
                    ? "rgba(var(--success-rgb), 0.05)"
                    : "var(--surface)",
                  borderColor: isCompleted
                    ? "rgba(var(--success-rgb), 0.3)"
                    : isLocked
                      ? "rgba(0,0,0,0.05)"
                      : "rgba(var(--success-rgb), 0.1)",
                }}
              >
                {" "}
                <div className="d-flex flex-column flex-md-row justify-content-between gap-4">
                  {" "}
                  <div className="flex-grow-1">
                    {" "}
                    <div className="d-flex align-items-center gap-3 mb-2">
                      {" "}
                      {isCompleted ? (
                        <div
                          className="rounded-circle p-2"
                          style={{
                            color: "var(--success)",
                            background: "rgba(var(--success-rgb), 0.2)",
                          }}
                        >
                          {" "}
                          <CheckCircle2 size={20} />{" "}
                        </div>
                      ) : (
                        <div
                          className="rounded-circle p-2"
                          style={{
                            color: "var(--text-secondary)",
                            background: "var(--bg-light)",
                          }}
                        >
                          {" "}
                          <MapPin size={20} />{" "}
                        </div>
                      )}{" "}
                      <h4
                        className={`fw-bold m-0 ${isCompleted ? "text-success" : ""}`}
                        style={{
                          color: isCompleted ? "var(--success)" : "var(--text)",
                        }}
                      >
                        {" "}
                        {mission.title}{" "}
                      </h4>{" "}
                    </div>{" "}
                    <p className="small text-muted mb-4">{mission.hint}</p>{" "}
                    <div className="flex align-items-center gap-4 small fw-bold uppercase tracking-wider">
                      {" "}
                      <span className="flex align-items-center gap-1 text-secondary">
                        {" "}
                        <Navigation size={14} /> {mission.location}{" "}
                      </span>{" "}
                      <span className="text-warning">
                        +{mission.points} Karma
                      </span>{" "}
                    </div>{" "}
                  </div>{" "}
                  {!isCompleted && !isLocked && (
                    <div className="d-flex align-items-center">
                      {" "}
                      <button
                        onClick={handleScan}
                        className="btn rounded-4 px-4 py-2 fw-bold d-flex align-items-center justify-content-center gap-2 hover-lift w-100"
                        style={{
                          background: "var(--success)",
                          color: "#fff",
                          border: "none",
                        }}
                      >
                        {" "}
                        <QrCode size={18} /> Scan Location QR{" "}
                      </button>{" "}
                    </div>
                  )}{" "}
                  {isLocked && (
                    <div
                      className="d-flex align-items-center justify-content-center w-100 px-4 py-2 fw-bold rounded-4"
                      style={{
                        background: "var(--bg-light)",
                        color: "var(--text-secondary)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      {" "}
                      Locked{" "}
                    </div>
                  )}{" "}
                </div>{" "}
              </motion.div>
            );
          })}{" "}
        </div>{" "}
        {/* Scanner HUD Sidebar */}{" "}
        <div
          className="bento-card rounded-4 p-4 sticky-top"
          style={{ top: "6rem" }}
        >
          {" "}
          <div className="text-center mb-4">
            {" "}
            <h5 className="fw-bold text-foreground mb-2">Scanner HUD</h5>{" "}
            <p className="small text-muted mb-0">
              Point your camera at campus QR codes to claim missions.
            </p>{" "}
          </div>{" "}
          <div
            className="position-relative w-100 bg-black rounded-4 overflow-hidden border mb-4 d-flex align-items-center justify-content-center cursor-pointer group"
            style={{
              aspectRatio: "3/4",
              borderColor: "rgba(var(--success-rgb), 0.2)",
            }}
            onClick={handleScan}
          >
            {" "}
            <div
              className="position-absolute w-100 h-100 opacity-25"
              style={{
                background:
                  "url('https://www.transparenttextures.com/patterns/black-scales.png')",
              }}
            ></div>{" "}
            {scanning ? (
              <div className="d-flex flex-column align-items-center gap-3 z-1">
                {" "}
                <ScanLine
                  className="animate-pulse"
                  size={64}
                  style={{ color: "var(--success)" }}
                />{" "}
                <span
                  className="fw-bold text-uppercase tracking-widest small animate-pulse"
                  style={{ color: "var(--success)" }}
                >
                  Scanning...
                </span>{" "}
              </div>
            ) : (
              <div className="d-flex flex-column align-items-center gap-3 z-1 transition-transform group-hover-scale">
                {" "}
                <Camera className="text-muted" size={64} />{" "}
                <span className="text-muted fw-bold text-uppercase tracking-widest small">
                  Tap to Activate
                </span>{" "}
              </div>
            )}{" "}
            {/* HUD Elements */}{" "}
            <div
              className="position-absolute"
              style={{
                top: "1rem",
                left: "1rem",
                width: "2rem",
                height: "2rem",
                borderTop: "2px solid var(--success)",
                borderLeft: "2px solid var(--success)",
              }}
            ></div>{" "}
            <div
              className="position-absolute"
              style={{
                top: "1rem",
                right: "1rem",
                width: "2rem",
                height: "2rem",
                borderTop: "2px solid var(--success)",
                borderRight: "2px solid var(--success)",
              }}
            ></div>{" "}
            <div
              className="position-absolute"
              style={{
                bottom: "1rem",
                left: "1rem",
                width: "2rem",
                height: "2rem",
                borderBottom: "2px solid var(--success)",
                borderLeft: "2px solid var(--success)",
              }}
            ></div>{" "}
            <div
              className="position-absolute"
              style={{
                bottom: "1rem",
                right: "1rem",
                width: "2rem",
                height: "2rem",
                borderBottom: "2px solid var(--success)",
                borderRight: "2px solid var(--success)",
              }}
            ></div>{" "}
            {/* Scanning Line Animation */}{" "}
            {scanning && (
              <motion.div
                className="position-absolute w-100"
                style={{
                  left: 0,
                  height: "4px",
                  background: "var(--success)",
                  boxShadow: "0 0 20px var(--success)",
                }}
                animate={{ top: ["0%", "100%", "0%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            )}{" "}
          </div>{" "}
          <div
            className="rounded-4 p-3 border"
            style={{
              background: "rgba(var(--success-rgb), 0.1)",
              borderColor: "rgba(var(--success-rgb), 0.2)",
            }}
          >
            {" "}
            <h4 className="small fw-bold text-foreground mb-2 d-flex align-items-center gap-2">
              {" "}
              <MapPin size={16} style={{ color: "var(--success)" }} /> Current
              Sector{" "}
            </h4>{" "}
            <div
              className="font-monospace small"
              style={{ color: "var(--success)" }}
            >
              {" "}
              LAT: 34.0205
              <br /> LNG: -118.2854
              <br /> ZONE: ENGINEERING{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}
