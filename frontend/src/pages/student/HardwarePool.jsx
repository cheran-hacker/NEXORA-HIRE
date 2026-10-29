import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { hardwarepoolService } from "../../services/api.js";
import {
  Cpu,
  Zap,
  ShoppingBag,
  BatteryCharging,
  Gamepad2,
  Camera,
} from "lucide-react";
import { useToast } from "../../context/ToastContext";
const HardwarePool = () => {
  const { addToast } = useToast();
  const [hardware, setHardware] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchHardware();
  }, []);
  const fetchHardware = async () => {
    try {
      setLoading(true);
      const res = await hardwarepoolService.getAvailableHardware();
      setHardware(res.data.data || []);
    } catch (err) {
      addToast("Failed to load Hardware Pool", "error");
    } finally {
      setLoading(false);
    }
  };
  const handleBorrow = async (id, collateral) => {
    if (
      !window.confirm(
        `Borrowing this requires locking ${collateral} Karma as collateral. Proceed?`,
      )
    )
      return;
    try {
      await hardwarepoolService.borrowHardware(id);
      addToast(
        "Hardware requested! Contact owner to pick it up. 📦",
        "success",
      );
      fetchHardware();
    } catch (err) {
      addToast(
        err.response?.data?.message || "Failed to borrow hardware",
        "error",
      );
    }
  };
  const getIcon = (category) => {
    switch (category) {
      case "GPU":
        return <Cpu size={32} />;
      case "VR":
        return <Gamepad2 size={32} />;
      case "Drone":
        return <Camera size={32} />;
      default:
        return <BatteryCharging size={32} />;
    }
  };
  const [showListModal, setShowListModal] = React.useState(false);
  const [listForm, setListForm] = React.useState({
    itemName: "",
    category: "GPU",
    collateralKarma: 100,
  });
  const handleListHardware = async (e) => {
    e.preventDefault();
    try {
      await hardwarepoolService.listHardware(listForm);
      addToast(
        "Hardware listed successfully! Other students can now borrow it.",
        "success",
      );
      setShowListModal(false);
      fetchHardware();
    } catch (err) {
      addToast(err.message || "Failed to list hardware", "error");
    }
  };
  if (loading)
    return (
      <div className="container-fluid py-4 d-flex justify-content-center">
        <div className="spinner-border text-primary"></div>
      </div>
    );
  return (
    <div className="container-fluid py-4 px-xl-5 position-relative">
      {" "}
      <div className="d-flex justify-content-between align-items-center mb-5 flex-wrap gap-3">
        {" "}
        <div>
          {" "}
          <h2 className="fw-black mb-1 text-primary d-flex align-items-center gap-2">
            {" "}
            Hardware Resource Pool <Cpu size={28} />{" "}
          </h2>{" "}
          <p className="text-muted mb-0">
            Borrow expensive tech (GPUs, VR, Drones) from peers using Campus
            Karma as collateral.
          </p>{" "}
        </div>{" "}
        <button
          onClick={() => setShowListModal(true)}
          className="btn btn-primary rounded-pill px-4 shadow-sm fw-bold"
        >
          {" "}
          List My Hardware{" "}
        </button>{" "}
      </div>{" "}
      <div className="row g-4">
        {" "}
        {hardware.map((item, i) => (
          <div className="col-lg-4 col-md-6" key={item._id}>
            {" "}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="glass-panel p-4 h-100 d-flex flex-column"
            >
              {" "}
              <div className="d-flex justify-content-between align-items-start mb-4">
                {" "}
                <div
                  className={`p-3 rounded-4 ${item.status === "Available" ? "bg-primary-subtle text-primary" : "bg-light text-muted"}`}
                >
                  {" "}
                  {getIcon(item.category)}{" "}
                </div>{" "}
                <div
                  className={`badge rounded-pill ${item.status === "Available" ? "bg-success" : "bg-secondary"}`}
                >
                  {" "}
                  {item.status}{" "}
                </div>{" "}
              </div>{" "}
              <h4 className="fw-bold text-foreground mb-1">{item.itemName}</h4>{" "}
              <p className="small text-muted mb-4">
                Owned by: {item.owner?.name}
              </p>{" "}
              <div className="mt-auto bg-light p-3 rounded-3 d-flex justify-content-between align-items-center border">
                {" "}
                <div>
                  {" "}
                  <div
                    className="small fw-bold text-muted text-uppercase mb-1"
                    style={{ fontSize: "0.7rem" }}
                  >
                    Collateral Required
                  </div>{" "}
                  <div className="fs-5 fw-black text-warning d-flex align-items-center gap-1">
                    <Zap size={18} className="fill-warning" />{" "}
                    {item.collateralKarma}
                  </div>{" "}
                </div>{" "}
                <button
                  className="btn btn-primary rounded-circle p-3 shadow-sm"
                  disabled={item.status === "Borrowed"}
                  onClick={() => handleBorrow(item._id, item.collateralKarma)}
                >
                  {" "}
                  <ShoppingBag size={20} />{" "}
                </button>{" "}
              </div>{" "}
            </motion.div>{" "}
          </div>
        ))}{" "}
        {hardware.length === 0 && (
          <div className="col-12 text-center py-5">
            <p className="text-muted mb-0">No hardware available in the pool yet. Be the first to list yours!</p>
          </div>
        )}
      </div>{" "}

      {/* List Hardware Modal */}
      {showListModal && (
        <div className="modal-backdrop fade show d-flex align-items-center justify-content-center" style={{ zIndex: 1050, background: "rgba(0,0,0,0.5)" }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-surface p-4 rounded-4 shadow-lg mx-3" style={{ width: "100%", maxWidth: "500px", zIndex: 1051, border: "1px solid var(--border)" }}>
            <h5 className="fw-bold mb-4">List Hardware to Pool</h5>
            <form onSubmit={handleListHardware}>
              <div className="mb-3">
                <label className="form-label small fw-bold text-muted">Item Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. NVIDIA RTX 3080"
                  required
                  value={listForm.itemName}
                  onChange={(e) => setListForm({ ...listForm, itemName: e.target.value })}
                />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-bold text-muted">Category</label>
                <select
                  className="form-select"
                  value={listForm.category}
                  onChange={(e) => setListForm({ ...listForm, category: e.target.value })}
                >
                  <option value="GPU">GPU / Compute</option>
                  <option value="VR">VR / AR Headset</option>
                  <option value="Drone">Drone</option>
                  <option value="Other">Other Electronics</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="form-label small fw-bold text-muted">Karma Collateral (To prevent theft)</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="100"
                  min="0"
                  required
                  value={listForm.collateralKarma}
                  onChange={(e) => setListForm({ ...listForm, collateralKarma: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="d-flex gap-2 justify-content-end">
                <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setShowListModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary rounded-pill px-4">List Item</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
export default HardwarePool;
