import React, { useState, useEffect } from "react";
import { MapPin, Users, Zap, Search } from "lucide-react";
import { useToast } from "../../context/ToastContext";
import { geoService } from "../../services/api";
export default function GeoRadar() {
  const { addToast } = useToast();
  const [scanning, setScanning] = useState(true);
  const [events, setEvents] = useState([]);
  const [blips, setBlips] = useState([]);
  const fetchEvents = async () => {
    try {
      setScanning(true);
      const res = await geoService.getActiveEvents();
      const realEvents = res.data.data || [];
      setEvents(realEvents); // Map real events to visual radar blips deterministically
      const mappedBlips = realEvents.map((evt, index) => {
        const radius = ((index * 13) % 40) + 10;
        const angle = (index * 73) % 360;
        return {
          id: evt._id,
          type: evt.title.toLowerCase().includes("alumni")
            ? "alumni"
            : "student",
          top: `calc(50% + ${Math.sin(angle) * radius}%)`,
          left: `calc(50% + ${Math.cos(angle) * radius}%)`,
          name: evt.title,
          delay: (index % 5) * 0.4,
          participants: evt.activeParticipants?.length || 0,
          location: evt.locationName,
        };
      });
      setBlips(mappedBlips);
    } catch (err) {
      addToast("Failed to scan campus network", "error");
    } finally {
      setScanning(false);
    }
  };
  useEffect(() => {
    fetchEvents();
  }, []);
  const handleCheckIn = async (eventId) => {
    if (!navigator.geolocation) {
      addToast("Geolocation is not supported by your browser", "error");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await geoService.checkInGeoEvent({
            eventId,
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          addToast("Successfully checked into network node!", "success");
          fetchEvents();
        } catch (err) {
          addToast("Failed to check in", "error");
        }
      },
      (error) => {
        addToast("Please enable location services to check in", "error");
      },
    );
  };
  const handlePing = () => {
    fetchEvents();
    addToast("Radar sweep initiated. Scanning campus network...", "info");
  };
  return (
    <div
      className="container-fluid space-y-4 py-5"
      style={{
        maxWidth: "1200px",
        background: "var(--bg)",
        minHeight: "100dvh",
        color: "var(--text)",
      }}
    >
      {" "}
      <div className="d-flex align-items-center justify-content-between mb-4">
        {" "}
        <div>
          {" "}
          <h2
            className="fw-black mb-1 d-flex align-items-center gap-2"
            style={{ color: "var(--text)", fontSize: "2rem" }}
          >
            {" "}
            <Zap className="text-primary" size={32} /> GeoRadar{" "}
          </h2>{" "}
          <p
            className="fw-medium mb-0"
            style={{ color: "var(--text-secondary)" }}
          >
            Discover nearby alumni, study groups, and hackathon teams in
            real-time.
          </p>{" "}
        </div>{" "}
      </div>{" "}
      <div className="row g-4">
        {" "}
        {/* Radar Map */}{" "}
        <div
          className="col-lg-8 rounded-4 d-flex align-items-center justify-content-center position-relative overflow-hidden shadow-sm"
          style={{
            minHeight: "600px",
            background: "var(--surface)",
            border: "1px solid var(--border)",
          }}
        >
          {" "}
          {/* Radar Circles */}{" "}
          <div className="position-absolute top-0 start-0 w-100 h-100 flex align-items-center justify-content-center opacity-25">
            {" "}
            <div
              className="rounded-circle position-absolute"
              style={{
                width: "80%",
                height: "80%",
                border: "1px solid var(--primary)",
              }}
            ></div>{" "}
            <div
              className="rounded-circle position-absolute"
              style={{
                width: "60%",
                height: "60%",
                border: "1px solid var(--primary)",
              }}
            ></div>{" "}
            <div
              className="rounded-circle position-absolute"
              style={{
                width: "40%",
                height: "40%",
                border: "1px solid var(--primary)",
              }}
            ></div>{" "}
            <div
              className="rounded-circle position-absolute"
              style={{
                width: "20%",
                height: "20%",
                border: "1px solid var(--primary)",
                background: "rgba(var(--primary-rgb), 0.1)",
              }}
            ></div>{" "}
          </div>{" "}
          {/* Crosshairs */}{" "}
          <div className="position-absolute w-100 h-100 d-flex align-items-center justify-content-center opacity-25">
            {" "}
            <div
              className="w-100 position-absolute"
              style={{ height: "1px", background: "var(--primary)" }}
            ></div>{" "}
            <div
              className="h-100 position-absolute"
              style={{ width: "1px", background: "var(--primary)" }}
            ></div>{" "}
          </div>{" "}
          {/* Radar Sweep Animation */}{" "}
          {scanning && (
            <div
              className="position-absolute radar-sweep"
              style={{
                width: "50%",
                height: "50%",
                transformOrigin: "bottom right",
                bottom: "50%",
                right: "50%",
                background:
                  "linear-gradient(to top right, transparent, rgba(var(--primary-rgb), 0.4))",
              }}
            ></div>
          )}{" "}
          {/* Center User */}{" "}
          <div
            className="position-absolute rounded-circle bg-card shadow-lg z-3"
            style={{
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "16px",
              height: "16px",
              boxShadow: "0 0 15px #fff",
            }}
          ></div>{" "}
          {/* Render Blips */}{" "}
          {blips.map((blip) => (
            <div
              key={blip.id}
              className={`position-absolute rounded-circle animate-ping-slow cursor-pointer`}
              style={{
                top: blip.top,
                left: blip.left,
                animationDelay: `${blip.delay}s`,
                width: "12px",
                height: "12px",
                background:
                  blip.type === "alumni" ? "var(--success)" : "var(--primary)",
                boxShadow:
                  blip.type === "alumni"
                    ? "0 0 10px var(--success)"
                    : "0 0 10px var(--primary)",
              }}
              onClick={() => handleCheckIn(blip.id)}
            >
              {" "}
              <div
                className="position-absolute text-center bg-light px-2 py-1 rounded opacity-0 hover-opacity-100 transition-opacity z-2 pe-none"
                style={{
                  top: "-40px",
                  left: "-60px",
                  width: "140px",
                  border: "1px solid var(--border)",
                }}
              >
                {" "}
                <div
                  className="small fw-bold text-foreground"
                  style={{ fontSize: "11px" }}
                >
                  {blip.name}
                </div>{" "}
                <div className="text-muted" style={{ fontSize: "9px" }}>
                  {blip.location} • {blip.participants} Users
                </div>{" "}
              </div>{" "}
            </div>
          ))}{" "}
        </div>{" "}
        <div className="col-lg-4 d-flex flex-column gap-4">
          {" "}
          <div
            className="rounded-4 p-4 shadow-sm"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
            }}
          >
            {" "}
            <h4 className="fw-bold mb-4" style={{ color: "var(--text)" }}>
              Scanner Controls
            </h4>{" "}
            <button
              onClick={handlePing}
              className={`btn w-100 py-3 rounded-pill fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm ${scanning ? "btn-outline-primary" : "btn-primary"}`}
            >
              {" "}
              {scanning ? (
                <>
                  <Zap size={18} className="animate-pulse" /> Scanning Campus...
                </>
              ) : (
                <>
                  <Search size={18} /> Ping Area
                </>
              )}{" "}
            </button>{" "}
            <div className="mt-4 d-flex flex-column gap-2">
              {" "}
              <div
                className="d-flex align-items-center justify-content-between small fw-bold"
                style={{ color: "var(--text-secondary)" }}
              >
                {" "}
                <span>Scan Radius</span>{" "}
                <span className="text-primary">500m</span>{" "}
              </div>{" "}
              <input
                type="range"
                className="form-range"
                min="100"
                max="2000"
                defaultValue="500"
              />{" "}
            </div>{" "}
          </div>{" "}
          <div
            className="rounded-4 p-4 shadow-sm"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
            }}
          >
            {" "}
            <h4 className="fw-bold mb-4" style={{ color: "var(--text)" }}>
              Live Signals
            </h4>{" "}
            <div className="d-flex flex-column gap-3">
              {" "}
              <div className="d-flex align-items-center gap-3">
                {" "}
                <div
                  className="rounded-circle animate-pulse"
                  style={{
                    width: "12px",
                    height: "12px",
                    background: "var(--success)",
                    boxShadow: "0 0 8px var(--success)",
                  }}
                ></div>{" "}
                <div className="flex-grow-1">
                  {" "}
                  <div
                    className="small fw-bold"
                    style={{ color: "var(--text)" }}
                  >
                    Alumni Nodes
                  </div>{" "}
                  <div className="text-muted" style={{ fontSize: "12px" }}>
                    Available for networking
                  </div>{" "}
                </div>{" "}
                <span
                  className="badge rounded-pill fw-bold"
                  style={{
                    background: "rgba(var(--success-rgb), 0.1)",
                    color: "var(--success)",
                  }}
                >
                  {blips.filter((b) => b.type === "alumni").length} Found
                </span>{" "}
              </div>{" "}
              <div className="d-flex align-items-center gap-3">
                {" "}
                <div
                  className="rounded-circle animate-pulse"
                  style={{
                    width: "12px",
                    height: "12px",
                    background: "var(--primary)",
                    boxShadow: "0 0 8px var(--primary)",
                  }}
                ></div>{" "}
                <div className="flex-grow-1">
                  {" "}
                  <div
                    className="small fw-bold"
                    style={{ color: "var(--text)" }}
                  >
                    Student Nodes
                  </div>{" "}
                  <div className="text-muted" style={{ fontSize: "12px" }}>
                    Study groups & events
                  </div>{" "}
                </div>{" "}
                <span
                  className="badge rounded-pill fw-bold"
                  style={{
                    background: "rgba(var(--primary-rgb), 0.1)",
                    color: "var(--primary)",
                  }}
                >
                  {blips.filter((b) => b.type === "student").length} Active
                </span>{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}
