import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { equipmentService } from "../../services/api.js";
import {
  Cpu,
  Plus,
  Search,
  CheckCircle,
  Smartphone,
  Clock,
} from "lucide-react";
import { useToast } from "../../context/ToastContext";
const EquipmentSharing = () => {
  const { addToast } = useToast();
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showQR, setShowQR] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "Hardware",
  });
  useEffect(() => {
    fetchEquipments();
  }, []);
  const fetchEquipments = async () => {
    try {
      setLoading(true);
      const res = await equipmentService.getEquipments();
      setEquipments(res.data.data || []);
    } catch (err) {
      addToast("Failed to load equipment", "error");
    } finally {
      setLoading(false);
    }
  };
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await equipmentService.createEquipment(formData);
      addToast("Item listed successfully!", "success");
      setShowAdd(false);
      setFormData({ name: "", description: "", category: "Hardware" });
      fetchEquipments();
    } catch (err) {
      addToast("Failed to list item", "error");
    }
  };
  const handleRequest = async (id) => {
    try {
      await equipmentService.requestEquipment(id);
      addToast(
        "Request sent! Please meet the owner to scan QR code.",
        "success",
      ); // Simulate showing QR for MVP
      setShowQR(id);
      fetchEquipments();
    } catch (err) {
      addToast(err.response?.data?.message || "Request failed", "error");
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
      <div className="d-flex justify-content-between align-items-center mb-5">
        {" "}
        <div>
          {" "}
          <h2 className="fw-black mb-1 text-gradient-primary d-flex align-items-center gap-2">
            {" "}
            Maker Space <Cpu size={28} />{" "}
          </h2>{" "}
          <p className="text-muted mb-0">
            Peer-to-peer sharing economy for hardware, tools, and textbooks.
          </p>{" "}
        </div>{" "}
        <button
          className="btn btn-primary rounded-pill px-4"
          onClick={() => setShowAdd(true)}
        >
          {" "}
          <Plus size={20} className="me-2" /> List an Item{" "}
        </button>{" "}
      </div>{" "}
      <div className="row g-4">
        {" "}
        {equipments.map((item, i) => (
          <div className="col-md-6 col-lg-4" key={item._id}>
            {" "}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="bento-card p-4 h-100 d-flex flex-column"
            >
              {" "}
              <div className="d-flex justify-content-between align-items-start mb-2">
                {" "}
                <h5 className="fw-bold mb-0">{item.name}</h5>{" "}
                <span
                  className={`badge ${item.status === "Available" ? "bg-success" : "bg-warning"} rounded-pill`}
                >
                  {" "}
                  {item.status}{" "}
                </span>{" "}
              </div>{" "}
              <span className="text-muted small fw-bold mb-3 d-inline-block">
                {item.category}
              </span>{" "}
              <p className="text-muted small mb-4 flex-grow-1">
                {item.description}
              </p>{" "}
              <div
                className="d-flex justify-content-between align-items-center pt-3 border-top"
                style={{ borderColor: "var(--border) !important" }}
              >
                {" "}
                <span className="small text-muted fw-semibold">
                  Owner: {item.owner?.name || "Unknown"}
                </span>{" "}
                {item.status === "Available" ? (
                  <button
                    className="btn btn-sm btn-outline-primary rounded-pill px-3 fw-bold"
                    onClick={() => handleRequest(item._id)}
                  >
                    {" "}
                    Borrow{" "}
                  </button>
                ) : (
                  <button
                    className="btn btn-sm btn-secondary rounded-pill px-3"
                    disabled
                  >
                    {" "}
                    <Clock size={14} className="me-1" /> Pending Handoff{" "}
                  </button>
                )}{" "}
              </div>{" "}
            </motion.div>{" "}
          </div>
        ))}{" "}
      </div>{" "}
      {/* Add Item Modal */}{" "}
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
              style={{ width: "90%", maxWidth: "500px" }}
            >
              {" "}
              <h4 className="fw-bold mb-4">List an Item</h4>{" "}
              <form onSubmit={handleCreate}>
                {" "}
                <div className="mb-3">
                  {" "}
                  <label className="form-label fw-bold">Item Name</label>{" "}
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g. Arduino Uno Rev3"
                  />{" "}
                </div>{" "}
                <div className="mb-3">
                  {" "}
                  <label className="form-label fw-bold">Category</label>{" "}
                  <select
                    className="form-select"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                  >
                    {" "}
                    <option>Hardware</option> <option>Textbooks</option>{" "}
                    <option>Electronics</option> <option>Misc</option>{" "}
                  </select>{" "}
                </div>{" "}
                <div className="mb-4">
                  {" "}
                  <label className="form-label fw-bold">Description</label>{" "}
                  <textarea
                    className="form-control"
                    rows="3"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Condition, cables included, etc."
                  ></textarea>{" "}
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
                    className="btn btn-primary rounded-pill px-4"
                  >
                    List Item
                  </button>{" "}
                </div>{" "}
              </form>{" "}
            </div>{" "}
          </motion.div>
        )}{" "}
        {/* QR Code Simulation Modal */}{" "}
        {showQR && (
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
            onClick={() => setShowQR(null)}
          >
            {" "}
            <div
              className="bento-card bg-card p-5 text-center"
              style={{ width: "90%", maxWidth: "400px" }}
              onClick={(e) => e.stopPropagation()}
            >
              {" "}
              <h4 className="fw-bold mb-2">Handoff Verification</h4>{" "}
              <p className="text-muted small mb-4">
                Meet the owner and have them scan this code to confirm the
                transfer.
              </p>{" "}
              <div
                className="bg-light mx-auto mb-4 d-flex align-items-center justify-content-center"
                style={{
                  width: 200,
                  height: 200,
                  border: "4px solid var(--primary)",
                  borderRadius: "12px",
                }}
              >
                {" "}
                <Smartphone
                  size={64}
                  className="text-primary opacity-50"
                />{" "}
                <div
                  className="position-absolute fw-black text-foreground"
                  style={{ letterSpacing: "4px" }}
                >
                  SIMULATED QR
                </div>{" "}
              </div>{" "}
              <button
                className="btn btn-success rounded-pill w-100 fw-bold"
                onClick={() => {
                  addToast("Handoff Complete!", "success");
                  setShowQR(null);
                }}
              >
                {" "}
                <CheckCircle size={18} className="me-2" /> Simulate Scan
                Success{" "}
              </button>{" "}
            </div>{" "}
          </motion.div>
        )}{" "}
      </AnimatePresence>{" "}
    </div>
  );
};
export default EquipmentSharing;
