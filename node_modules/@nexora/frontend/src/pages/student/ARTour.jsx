import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { arService } from "../../services/api.js";
import { Camera, MapPin, Compass, AlertCircle, RefreshCw } from "lucide-react";
import { useToast } from "../../context/ToastContext";
const ARTour = () => {
  const { addToast } = useToast();
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cameraError, setCameraError] = useState("");
  const [activeNode, setActiveNode] = useState(null);
  useEffect(() => {
    fetchNodes();
    startCamera();
    return () => {
      // Cleanup camera stream
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);
  const fetchNodes = async () => {
    try {
      const res = await arService.getNodes();
      const dbNodes = res.data.data;
      setNodes(dbNodes || []);
    } catch (err) {
      addToast("Failed to load AR locations", "error");
    } finally {
      setLoading(false);
    }
  };
  const startCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" }, // Rear camera
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } else {
        setCameraError("AR not supported on this browser.");
      }
    } catch (err) {
      setCameraError("Camera access denied or unavailable.");
    }
  };
  const handleScan = () => {
    setActiveNode(null);
    if (nodes.length === 0) {
      addToast("No AR nodes found nearby.", "info");
      return;
    }
    addToast("Scanning environment for AR nodes...", "success"); // Lock onto the first verified node from the database instead of randomly simulating
    setTimeout(() => {
      setActiveNode(nodes[0]);
    }, 1500);
  };
  return (
    <div
      className="container-fluid p-0"
      style={{
        height: "calc(100dvh - 70px)",
        position: 'relative',
        overflow: "hidden",
        background: "#000",
      }}
    >
      {" "}
      {/* Camera Feed Layer */}{" "}
      {cameraError ? (
        <div className="h-100 d-flex flex-column align-items-center justify-content-center text-foreground p-4 text-center">
          {" "}
          <AlertCircle size={48} className="text-danger mb-3" />{" "}
          <h4 className="fw-bold">Camera Unavailable</h4>{" "}
          <p className="text-foreground-50">{cameraError}</p>{" "}
          <p className="small text-foreground-50">
            To use the AR Campus Tour, you must allow camera permissions and use
            a secure (HTTPS) connection.
          </p>{" "}
        </div>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      )}{" "}
      {/* AR UI Overlay Layer */}{" "}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 10,
          pointerEvents: "none",
        }}
      >
        {" "}
        {/* HUD Top Bar */}{" "}
        <div
          className="p-4 d-flex justify-content-between align-items-start"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.02) 0%, transparent 100%)",
          }}
        >
          {" "}
          <div>
            {" "}
            <h3
              className="fw-black text-foreground mb-0 d-flex align-items-center gap-2"
              style={{ textShadow: "0 2px 4px rgba(0,0,0,0.02)" }}
            >
              {" "}
              AR Tour <Compass size={24} className="text-primary" />{" "}
            </h3>{" "}
            <p className="text-foreground-50 small fw-semibold">
              Point camera at campus buildings
            </p>{" "}
          </div>{" "}
          <button
            className="btn btn-primary rounded-circle p-3 shadow-lg"
            style={{ pointerEvents: "auto" }}
            onClick={handleScan}
          >
            {" "}
            <RefreshCw size={24} />{" "}
          </button>{" "}
        </div>{" "}
        {/* Floating AR Markers (Simulated) */}{" "}
        <AnimatePresence>
          {" "}
          {activeNode && !cameraError && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5 }}
              style={{
                position: 'absolute',
                top: "40%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                pointerEvents: "auto",
              }}
            >
              {" "}
              <div className="d-flex flex-column align-items-center cursor-pointer hover-scale">
                {" "}
                <div
                  className="bg-card text-foreground px-4 py-2 rounded-pill fw-bold shadow-lg mb-2 border"
                  style={{
                    borderBottom: `4px solid ${activeNode.arContent?.color || "var(--primary)"} !important`,
                  }}
                >
                  {" "}
                  {activeNode.arContent?.textOverlay || activeNode.name}{" "}
                </div>{" "}
                {/* Simulated Distance/Line */}{" "}
                <div
                  style={{
                    width: 2,
                    height: 60,
                    background: "rgba(0,0,0,0.05)",
                    boxShadow: "0 0 10px rgba(0,0,0,0.05)",
                  }}
                ></div>{" "}
                <div
                  className="bento-card bg-card p-3 shadow-lg mt-2 text-center"
                  style={{ width: 250 }}
                >
                  {" "}
                  <h6 className="fw-bold mb-1">{activeNode.name}</h6>{" "}
                  <p className="text-muted small mb-2 lh-sm">
                    {activeNode.description}
                  </p>{" "}
                  <button
                    className="btn btn-sm btn-outline-primary rounded-pill w-100"
                    onClick={() => setActiveNode(null)}
                  >
                    Dismiss
                  </button>{" "}
                </div>{" "}
              </div>{" "}
            </motion.div>
          )}{" "}
        </AnimatePresence>{" "}
        {/* Scan Reticle */}{" "}
        {!activeNode && !cameraError && (
          <div
            style={{
              position: 'absolute',
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              opacity: 0.5,
            }}
          >
            {" "}
            <div
              style={{
                width: 200,
                height: 200,
                border: "2px dashed white",
                borderRadius: "20px",
              }}
            ></div>{" "}
            <div className="text-center text-foreground mt-3 fw-bold tracking-widest text-uppercase small">
              Scanning
            </div>{" "}
          </div>
        )}{" "}
      </div>{" "}
    </div>
  );
};
export default ARTour;
