import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { parkingService } from "../../services/api.js";
import {
  Car,
  MapPin,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Map,
  Navigation,
  Plus,
} from "lucide-react";
import { useToast } from "../../context/ToastContext";
const SpotFinder = () => {
  const { addToast } = useToast();
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({ name: "", totalSpots: 100 });
  useEffect(() => {
    fetchLots(); // Poll every 30s to simulate live updates
    const interval = setInterval(fetchLots, 30000);
    return () => clearInterval(interval);
  }, []);
  const fetchLots = async () => {
    try {
      setLoading(true);
      const res = await parkingService.getLots();
      setLots(res.data.data || []);
    } catch (err) {
      addToast("Failed to load parking lots", "error");
    } finally {
      setLoading(false);
    }
  };
  const handleCreateLot = async (e) => {
    e.preventDefault();
    try {
      await parkingService.createLot(formData);
      addToast("Parking Lot Added! 🅿️", "success");
      setShowAdd(false);
      setFormData({ name: "", totalSpots: 100 });
      fetchLots();
    } catch (err) {
      addToast("Failed to add lot", "error");
    }
  };
  const handleUpdateStatus = async (id, status) => {
    try {
      await parkingService.updateStatus(id, status);
      addToast(`Lot status updated to ${status}`, "success");
      fetchLots();
    } catch (err) {
      // No local fallback, rely on real API
      addToast("Failed to update status", "error");
      console.error(err);
    }
  };
  const getStatusColor = (status) => {
    switch (status) {
      case "Empty":
        return "success";
      case "Filling Fast":
        return "warning";
      case "Full":
        return "danger";
      default:
        return "secondary";
    }
  };
  const getStatusIcon = (status) => {
    switch (status) {
      case "Empty":
        return <CheckCircle size={20} className="text-success" />;
      case "Filling Fast":
        return <AlertTriangle size={20} className="text-warning" />;
      case "Full":
        return <XCircle size={20} className="text-danger" />;
      default:
        return null;
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
            SpotFinder <Car size={28} />{" "}
          </h2>{" "}
          <p className="text-muted mb-0">
            Crowdsourced real-time parking availability. Don't waste 20 minutes
            circling the lot.
          </p>{" "}
        </div>{" "}
        <button
          className="btn btn-outline-dark rounded-pill px-4 shadow-sm fw-bold d-flex align-items-center gap-2"
          onClick={() => setShowAdd(true)}
        >
          {" "}
          <Plus size={20} /> (Dev) Add Lot{" "}
        </button>{" "}
      </div>{" "}
      <div className="row g-4">
        {" "}
        {lots.length === 0 && (
          <div className="col-12 text-center p-5 bento-card ">
            {" "}
            <Car
              size={48}
              className="text-muted mb-3 opacity-25 mx-auto"
            />{" "}
            <h5 className="fw-bold text-muted">No Parking Lots Found</h5>{" "}
            <p className="text-muted small">
              Add a parking lot to start tracking availability.
            </p>{" "}
          </div>
        )}{" "}
        {lots.map((lot, i) => (
          <div className="col-lg-4 col-md-6" key={lot._id}>
            {" "}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`bento-card p-0 h-100 overflow-hidden border-${getStatusColor(lot.currentStatus)}`}
              style={{ borderWidth: "2px" }}
            >
              {" "}
              <div
                className={`p-4 bg-${getStatusColor(lot.currentStatus)}-subtle d-flex justify-content-between align-items-center`}
              >
                {" "}
                <div className="d-flex align-items-center gap-2">
                  {" "}
                  <div
                    className={`bg-${getStatusColor(lot.currentStatus)} text-foreground p-2 rounded-circle shadow-sm`}
                  >
                    {" "}
                    <MapPin size={20} />{" "}
                  </div>{" "}
                  <h5
                    className={`fw-black mb-0 text-${getStatusColor(lot.currentStatus)}-emphasis`}
                  >
                    {lot.name}
                  </h5>{" "}
                </div>{" "}
              </div>{" "}
              <div className="p-4 bg-card d-flex flex-column h-100">
                {" "}
                <div className="d-flex justify-content-between align-items-center mb-4">
                  {" "}
                  <div className="fw-bold text-muted small text-uppercase">
                    Current Status
                  </div>{" "}
                  <div className="d-flex align-items-center gap-2 fw-bold fs-5">
                    {" "}
                    {getStatusIcon(lot.currentStatus)} {lot.currentStatus}{" "}
                  </div>{" "}
                </div>{" "}
                <div className="mb-4">
                  {" "}
                  <div className="small text-muted fw-bold mb-2">
                    Capacity
                  </div>{" "}
                  <div className="progress" style={{ height: "8px" }}>
                    {" "}
                    <div
                      className={`progress-bar bg-${getStatusColor(lot.currentStatus)}`}
                      role="progressbar"
                      style={{
                        width:
                          lot.currentStatus === "Empty"
                            ? "10%"
                            : lot.currentStatus === "Filling Fast"
                              ? "70%"
                              : "100%",
                      }}
                    ></div>{" "}
                  </div>{" "}
                  <div className="text-end small text-muted mt-1 fw-semibold">
                    {lot.totalSpots} Total Spots
                  </div>{" "}
                </div>{" "}
                <div className="mt-auto">
                  {" "}
                  <p className="small fw-bold text-center text-muted mb-2">
                    Update Status (Crowdsource)
                  </p>{" "}
                  <div className="d-flex gap-2 justify-content-center">
                    {" "}
                    <button
                      className="btn btn-sm btn-outline-success flex-grow-1 fw-bold"
                      onClick={() => handleUpdateStatus(lot._id, "Empty")}
                    >
                      Empty
                    </button>{" "}
                    <button
                      className="btn btn-sm btn-outline-warning flex-grow-1 fw-bold"
                      onClick={() =>
                        handleUpdateStatus(lot._id, "Filling Fast")
                      }
                    >
                      Filling
                    </button>{" "}
                    <button
                      className="btn btn-sm btn-outline-danger flex-grow-1 fw-bold"
                      onClick={() => handleUpdateStatus(lot._id, "Full")}
                    >
                      Full
                    </button>{" "}
                  </div>{" "}
                </div>{" "}
                {lot.currentStatus !== "Full" && (
                  <button
                    onClick={() =>
                      window.open(
                        `https://maps.google.com/?q=${encodeURIComponent(lot.name + " parking")}`,
                        "_blank",
                      )
                    }
                    className="btn btn-dark w-100 rounded-pill mt-4 fw-bold py-2 d-flex align-items-center justify-content-center gap-2"
                  >
                    {" "}
                    <Navigation size={18} /> Navigate Here{" "}
                  </button>
                )}{" "}
              </div>{" "}
            </motion.div>{" "}
          </div>
        ))}{" "}
      </div>{" "}
      {/* Add Lot Modal */}{" "}
      <AnimatePresence>
        {" "}
        {showAdd && (
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
                <div className="bg-card text-foreground rounded-circle d-inline-flex p-3 mb-3">
                  {" "}
                  <MapPin size={32} />{" "}
                </div>{" "}
                <h4 className="fw-bold">Add Parking Lot</h4>{" "}
              </div>{" "}
              <form onSubmit={handleCreateLot}>
                {" "}
                <div className="mb-3">
                  {" "}
                  <label className="form-label fw-bold small">
                    Lot Name / Zone
                  </label>{" "}
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g. South Campus Deck"
                  />{" "}
                </div>{" "}
                <div className="mb-4">
                  {" "}
                  <label className="form-label fw-bold small">
                    Total Capacity
                  </label>{" "}
                  <input
                    type="number"
                    className="form-control"
                    required
                    value={formData.totalSpots}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        totalSpots: Number(e.target.value),
                      })
                    }
                  />{" "}
                </div>{" "}
                <div className="d-flex justify-content-end gap-2">
                  {" "}
                  <button
                    type="button"
                    className="btn btn-light rounded-pill px-4"
                    onClick={() => setShowAdd(false)}
                  >
                    Cancel
                  </button>{" "}
                  <button
                    type="submit"
                    className="btn btn-dark rounded-pill px-4 fw-bold"
                  >
                    Add Lot
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
export default SpotFinder;
