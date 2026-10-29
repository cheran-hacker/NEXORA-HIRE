import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { argService } from "../../services/api.js";
import {
  Map,
  MapPin,
  QrCode,
  Unlock,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { useToast } from "../../context/ToastContext";
const FreshmanARG = () => {
  const { addToast } = useToast();
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScanner, setShowScanner] = useState(false);
  const [scannedCode, setScannedCode] = useState("");
  useEffect(() => {
    fetchNodes();
  }, []);
  const fetchNodes = async () => {
    try {
      setLoading(true);
      const res = await argService.getNodes();
      setNodes(res.data.data || []);
    } catch (err) {
      addToast("Failed to load ARG data", "error");
    } finally {
      setLoading(false);
    }
  };
  const handleScan = async (e) => {
    e.preventDefault();
    try {
      const res = await argService.scanNode({ nodeId: scannedCode });
      addToast(`Unlocked: ${res.data.data.unlocksModule}! 🎉`, "success");
      setShowScanner(false);
      setScannedCode(""); // In a real app, update local state to show node as unlocked
    } catch (err) {
      addToast(err.response?.data?.message || "Invalid Code", "error");
    }
  };
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
          <h2 className="fw-black mb-1 text-gradient-primary d-flex align-items-center gap-2">
            {" "}
            Campus ARG <QrCode size={28} />{" "}
          </h2>{" "}
          <p className="text-muted mb-0">
            Solve riddles, find hidden QR codes on campus, and unlock your
            orientation modules.
          </p>{" "}
        </div>{" "}
        <button
          className="btn btn-primary rounded-pill px-4 shadow-sm"
          onClick={() => setShowScanner(true)}
        >
          {" "}
          <QrCode size={20} className="me-2" /> Scan Found Code{" "}
        </button>{" "}
      </div>{" "}
      <div className="row g-4">
        {" "}
        {nodes.map((node, i) => (
          <div className="col-md-6 col-lg-4" key={node._id}>
            {" "}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bento-card p-4 h-100 d-flex flex-column position-relative"
            >
              {" "}
              <div
                className="position-absolute opacity-10"
                style={{ right: -20, top: -20 }}
              >
                {" "}
                <Map size={150} />{" "}
              </div>{" "}
              <div className="d-flex justify-content-between align-items-start mb-4 position-relative z-1">
                {" "}
                <div className="badge bg-card text-foreground px-3 py-2 rounded-pill shadow-sm d-flex align-items-center gap-2">
                  {" "}
                  <Unlock size={14} /> {node.pointsAwarded} pts{" "}
                </div>{" "}
              </div>{" "}
              <h5 className="fw-bold text-primary mb-2 position-relative z-1 d-flex align-items-center gap-2">
                {" "}
                <AlertCircle size={20} /> Riddle:{" "}
              </h5>{" "}
              <p className="fw-semibold fs-5 mb-4 position-relative z-1 fst-italic">
                "{node.riddle}"
              </p>{" "}
              <div
                className="mt-auto border-top pt-3 position-relative z-1"
                style={{ borderColor: "var(--border) !important" }}
              >
                {" "}
                <div className="text-muted small fw-bold d-flex align-items-center gap-1 mb-2">
                  {" "}
                  <MapPin size={14} /> Hint: {node.locationHint}{" "}
                </div>{" "}
                <div className="text-muted small d-flex align-items-center gap-1">
                  {" "}
                  <Sparkles size={14} /> Unlocks:{" "}
                  <strong>{node.unlocksModule}</strong>{" "}
                </div>{" "}
              </div>{" "}
            </motion.div>{" "}
          </div>
        ))}{" "}
        {nodes.length === 0 && (
          <div className="col-12 text-center p-5 bento-card ">
            {" "}
            <QrCode
              size={48}
              className="text-muted mb-3 opacity-25 mx-auto"
            />{" "}
            <h5 className="fw-bold text-muted">
              No active missions right now.
            </h5>{" "}
          </div>
        )}{" "}
      </div>{" "}
      {/* Scanner Modal MVP (Text input simulation) */}{" "}
      <AnimatePresence>
        {" "}
        {showScanner && (
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
              style={{ width: "90%", maxWidth: "400px" }}
            >
              {" "}
              <div className="text-center mb-4">
                {" "}
                <div className="bg-card text-foreground rounded-4 p-4 d-inline-block mb-3 shadow-lg">
                  {" "}
                  <QrCode size={64} className="animate-pulse" />{" "}
                </div>{" "}
                <h4 className="fw-bold mb-1">Scan Code</h4>{" "}
                <p className="text-muted small">
                  Enter the node ID found on the physical QR code to simulate a
                  scan.
                </p>{" "}
              </div>{" "}
              <form onSubmit={handleScan}>
                {" "}
                <div className="mb-4">
                  {" "}
                  <input
                    type="text"
                    className="form-control form-control-lg text-center fw-bold text-primary"
                    required
                    value={scannedCode}
                    onChange={(e) => setScannedCode(e.target.value)}
                    placeholder="e.g. lib-01"
                  />{" "}
                </div>{" "}
                <div className="d-flex justify-content-center gap-2">
                  {" "}
                  <button
                    type="button"
                    className="btn btn-light rounded-pill px-4"
                    onClick={() => setShowScanner(false)}
                  >
                    Cancel
                  </button>{" "}
                  <button
                    type="submit"
                    className="btn btn-primary rounded-pill px-4 fw-bold"
                  >
                    Verify Scan
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
export default FreshmanARG;
