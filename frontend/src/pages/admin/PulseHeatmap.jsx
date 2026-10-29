import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { pulseService } from "../../services/api";
import { Activity, MapPin, Users, Wifi, AlertTriangle } from "lucide-react";
import Skeleton from "../../shared/components/Skeleton"; // Hardcoded campus zones to ensure they all render even if they have 0 count
const CAMPUS_ZONES = [
  { id: "Library", label: "Central Library", icon: "📚" },
  { id: "Engineering", label: "Engineering Block", icon: "⚙️" },
  { id: "Business", label: "Business School", icon: "💼" },
  { id: "Cafeteria", label: "Main Cafeteria", icon: "🍔" },
  { id: "Quad", label: "Campus Quad", icon: "🌳" },
  { id: "Sports Complex", label: "Sports Complex", icon: "🏀" },
  { id: "Admin", label: "Admin Building", icon: "🏢" },
];
export default function PulseHeatmap() {
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  useEffect(() => {
    fetchHeatmap(); // Poll every 10 seconds for real-time feel
    const interval = setInterval(fetchHeatmap, 10000);
    return () => clearInterval(interval);
  }, []);
  const fetchHeatmap = async () => {
    try {
      const res = await pulseService.getHeatmap();
      setHeatmapData(res.data.data || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to fetch heatmap", err);
    } finally {
      setLoading(false);
    }
  }; // Helper to merge predefined zones with API data
  const getZoneData = (zoneId) => {
    const data = heatmapData.find((z) => z.zone === zoneId);
    return data || { intensity: 0, recentActivity: "None" };
  }; // Helper to calculate glow and color based on intensity
  const getHeatStyle = (intensity) => {
    if (intensity === 0)
      return {
        bg: "rgba(128,128,128,0.02)",
        border: "var(--premium-border)",
        shadow: "none",
        text: "var(--premium-text-muted)",
      };
    if (intensity < 5)
      return {
        bg: "rgba(59, 130, 246, 0.05)",
        border: "rgba(59, 130, 246, 0.2)",
        shadow: "0 0 20px rgba(59, 130, 246, 0.05)",
        text: "var(--premium-neon-blue)",
      };
    if (intensity < 15)
      return {
        bg: "rgba(234, 179, 8, 0.05)",
        border: "rgba(234, 179, 8, 0.2)",
        shadow: "0 0 30px rgba(234, 179, 8, 0.05)",
        text: "var(--warning)",
      };
    return {
      bg: "rgba(239, 68, 68, 0.08)",
      border: "rgba(239, 68, 68, 0.2)",
      shadow: "0 0 40px rgba(239, 68, 68, 0.1)",
      text: "var(--danger)",
    };
  };
  if (loading && heatmapData.length === 0) {
    return (
      <div className="container-fluid py-4">
        {" "}
        <div className="row g-4 mt-5 pt-5">
          {" "}
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="col-xl-4 col-lg-6">
              {" "}
              <Skeleton variant="card" height="200px" />{" "}
            </div>
          ))}{" "}
        </div>{" "}
      </div>
    );
  }
  const totalActive = heatmapData.reduce(
    (acc, curr) => acc + curr.intensity,
    0,
  );
  return (
    <div className="container-fluid py-4 px-xl-5" style={{ background: "transparent" }}>
      {" "}
      <div className="d-flex justify-content-between align-items-center mb-5 flex-wrap gap-4 mx-auto" style={{ maxWidth: "1500px" }}>
        {" "}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {" "}
          <h2
            className="fw-bold mb-2 d-flex align-items-center gap-3"
            style={{ fontSize: "2rem", color: "var(--premium-text-main)", letterSpacing: "-0.02em" }}
          >
            {" "}
            <div
              className="d-flex align-items-center justify-content-center rounded-circle"
              style={{
                width: "48px",
                height: "48px",
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.2)",
              }}
            >
              {" "}
              <Activity size={24} className="text-danger" />{" "}
            </div>{" "}
            Campus Pulse Heatmap{" "}
          </h2>{" "}
          <p
            style={{
              color: "var(--premium-text-muted)",
              fontSize: "1rem",
              maxWidth: "600px",
            }}
          >
            Real-time spatial density monitoring based on student check-ins.
          </p>{" "}
        </motion.div>{" "}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="d-flex gap-4 align-items-center"
        >
          {" "}
          <div className="text-end">
            {" "}
            <div className="mb-0 small fw-bold text-success d-flex align-items-center gap-2 justify-content-end">
              <div
                className="rounded-circle bg-success"
                style={{ width: 8, height: 8 }}
              ></div>{" "}
              Live Signal Active
            </div>{" "}
            <p
              className="mb-0 small"
              style={{ color: "var(--premium-text-muted)" }}
            >
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>{" "}
          </div>{" "}
          <div
            className="premium-glass-panel py-2 px-4 d-flex flex-column align-items-center justify-content-center"
            style={{
              minWidth: "150px"
            }}
          >
            {" "}
            <h3 className="fw-black mb-0 text-danger">{totalActive}</h3>{" "}
            <span className="small fw-semibold" style={{ color: "var(--premium-text-muted)" }}>
              Total Active
            </span>{" "}
          </div>{" "}
        </motion.div>{" "}
      </div>{" "}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
        className="row g-4 mx-auto"
        style={{ maxWidth: "1500px" }}
      >
        {" "}
        {CAMPUS_ZONES.map((zone) => {
          const data = getZoneData(zone.id);
          const heat = getHeatStyle(data.intensity);
          const isHot = data.intensity > 10;
          return (
            <motion.div
              key={zone.id}
              className="col-xl-4 col-lg-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              {" "}
              <motion.div
                animate={isHot ? { scale: [1, 1.02, 1] } : {}}
                transition={
                  isHot
                    ? { repeat: Infinity, duration: 2, ease: "easeInOut" }
                    : {}
                }
                className="premium-glass-panel p-4 h-100 position-relative overflow-hidden"
                style={{
                  background: heat.bg,
                  border: `1px solid ${heat.border}`,
                  boxShadow: heat.shadow,
                  transition: "all 0.5s ease",
                }}
              >
                {" "}
                {/* Background Pattern for Hot Zones */}{" "}
                {isHot && (
                  <div
                    className="position-absolute top-0 start-0 w-100 h-100 pointer-events-none opacity-25"
                    style={{
                      background:
                        "radial-gradient(circle at center, rgba(239, 68, 68, 0.4) 0%, transparent 70%)",
                      mixBlendMode: "screen",
                    }}
                  />
                )}{" "}
                <div className="position-relative z-1">
                  {" "}
                  <div className="d-flex justify-content-between align-items-start mb-4">
                    {" "}
                    <div className="d-flex align-items-center gap-3">
                      {" "}
                      <span className="fs-2">{zone.icon}</span>{" "}
                      <h4
                        className="fw-bold mb-0"
                        style={{ color: "var(--premium-text-main)" }}
                      >
                        {zone.label}
                      </h4>{" "}
                    </div>{" "}
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center fw-black fs-4"
                      style={{
                        width: "60px",
                        height: "60px",
                        background: heat.bg,
                        color: heat.text,
                        border: `2px solid ${heat.text}`,
                      }}
                    >
                      {" "}
                      {data.intensity}{" "}
                    </div>{" "}
                    </div>{" "}
                  {isHot && (
                    <div className="mt-3 py-2 px-3 rounded-3 d-flex align-items-center gap-2" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                      {" "}
                      <AlertTriangle size={16} className="text-danger" />{" "}
                      <span className="small fw-bold text-danger">
                        High Density Alert
                      </span>{" "}
                    </div>
                  )}{" "}
                </div>{" "}
              </motion.div>{" "}
            </motion.div>
          );
        })}{" "}
      </motion.div>{" "}
    </div>
  );
}
