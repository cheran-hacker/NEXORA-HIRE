import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { foodRescueService } from "../../services/api.js";
import {
  Utensils,
  AlertTriangle,
  Package,
  CheckCircle,
  Clock,
} from "lucide-react";
import { useToast } from "../../context/ToastContext";
const FoodRescue = () => {
  const { addToast } = useToast();
  const [rescues, setRescues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTrigger, setShowTrigger] = useState(false);
  const [formData, setFormData] = useState({
    cafeteriaName: "",
    foodDescription: "",
    boxesAvailable: 10,
  });
  useEffect(() => {
    fetchRescues();
  }, []);
  const fetchRescues = async () => {
    try {
      setLoading(true);
      const res = await foodRescueService.getRescues();
      setRescues(res.data.data || []);
    } catch (err) {
      addToast("Failed to load active food rescues", "error");
    } finally {
      setLoading(false);
    }
  };
  const handleTrigger = async (e) => {
    e.preventDefault();
    try {
      await foodRescueService.triggerRescue(formData);
      addToast(
        "Food Rescue Alert Broadcasted to all students! 🚨🍽️",
        "success",
      );
      setShowTrigger(false);
      setFormData({
        cafeteriaName: "",
        foodDescription: "",
        boxesAvailable: 10,
      });
      fetchRescues();
    } catch (err) {
      addToast("Failed to trigger alert", "error");
    }
  };
  const handleClaim = async (id) => {
    try {
      await foodRescueService.claimBox(id);
      addToast(
        "Box claimed! Show your app at the cafeteria in the next 15 mins. 🏃💨",
        "success",
      );
      fetchRescues();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to claim box", "error");
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
            Zero-Waste Campus <Utensils size={28} />{" "}
          </h2>{" "}
          <p className="text-muted mb-0">
            Claim $1 rescue boxes right before dining halls close to fight food
            waste and save money.
          </p>{" "}
        </div>{" "}
        <button
          className="btn btn-outline-danger rounded-pill px-4 shadow-sm fw-bold d-flex align-items-center gap-2"
          onClick={() => setShowTrigger(true)}
        >
          {" "}
          <AlertTriangle size={20} /> (Admin) Trigger Rescue Alert{" "}
        </button>{" "}
      </div>{" "}
      <div className="row g-4">
        {" "}
        {rescues.map((rescue, i) => (
          <div className="col-lg-4 col-md-6" key={rescue._id}>
            {" "}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bento-card p-0 h-100 overflow-hidden d-flex flex-column border border-warning"
              style={{ borderWidth: "2px" }}
            >
              {" "}
              <div className="bg-warning text-foreground p-3 text-center fw-black d-flex justify-content-center align-items-center gap-2 animate-pulse">
                {" "}
                <AlertTriangle size={18} /> ACTIVE FOOD RESCUE{" "}
              </div>{" "}
              <div className="p-4 flex-grow-1 bg-card">
                {" "}
                <h4 className="fw-bold mb-1">{rescue.cafeteriaName}</h4>{" "}
                <div className="text-muted small fw-bold mb-4 d-flex align-items-center gap-1">
                  {" "}
                  <Clock size={14} /> Closes in 15 minutes{" "}
                </div>{" "}
                <div className="bg-light p-3 rounded-3 mb-4 border border-warning-subtle">
                  {" "}
                  <span className="fw-bold d-block mb-1 text-foreground">
                    What's inside:
                  </span>{" "}
                  <span className="text-muted small">
                    {rescue.foodDescription}
                  </span>{" "}
                </div>{" "}
                <div className="d-flex justify-content-between align-items-center mb-4">
                  {" "}
                  <div>
                    {" "}
                    <div className="fs-3 fw-black text-success">
                      ${rescue.pricePerBox.toFixed(2)}
                    </div>{" "}
                    <div className="small text-muted fw-bold text-uppercase">
                      Per Box
                    </div>{" "}
                  </div>{" "}
                  <div className="text-end">
                    {" "}
                    <div className="fs-4 fw-black text-danger">
                      {rescue.boxesAvailable}
                    </div>{" "}
                    <div className="small text-muted fw-bold text-uppercase">
                      Boxes Left
                    </div>{" "}
                  </div>{" "}
                </div>{" "}
                <button
                  className="btn btn-warning w-100 rounded-pill fw-bold py-3 d-flex align-items-center justify-content-center gap-2 shadow-sm text-foreground"
                  onClick={() => handleClaim(rescue._id)}
                  disabled={rescue.boxesAvailable <= 0}
                >
                  {" "}
                  <Package size={20} />{" "}
                  {rescue.boxesAvailable > 0
                    ? "Claim Rescue Box"
                    : "Sold Out"}{" "}
                </button>{" "}
              </div>{" "}
            </motion.div>{" "}
          </div>
        ))}{" "}
        {rescues.length === 0 && (
          <div className="col-12 text-center p-5 bento-card ">
            {" "}
            <Utensils
              size={48}
              className="text-muted mb-3 opacity-25 mx-auto"
            />{" "}
            <h5 className="fw-bold text-muted">No active rescues right now.</h5>{" "}
            <p className="text-muted small">
              Keep an eye out! Alerts usually drop late at night.
            </p>{" "}
          </div>
        )}{" "}
      </div>{" "}
      {/* Admin Trigger Alert Modal */}{" "}
      <AnimatePresence>
        {" "}
        {showTrigger && (
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
                <div className="bg-danger text-white rounded-circle d-inline-flex p-3 mb-3 animate-pulse shadow-sm">
                  {" "}
                  <AlertTriangle size={32} />{" "}
                </div>{" "}
                <h4 className="fw-bold text-danger">Trigger Rescue Alert</h4>{" "}
                <p className="text-muted small">
                  Notify all students that food is available for $1 before you
                  throw it away.
                </p>{" "}
              </div>{" "}
              <form onSubmit={handleTrigger}>
                {" "}
                <div className="mb-3">
                  {" "}
                  <label className="form-label fw-bold small">
                    Cafeteria Name
                  </label>{" "}
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={formData.cafeteriaName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        cafeteriaName: e.target.value,
                      })
                    }
                    placeholder="e.g. North Campus Dining"
                  />{" "}
                </div>{" "}
                <div className="mb-3">
                  {" "}
                  <label className="form-label fw-bold small">
                    Food Description (Mystery Box contents)
                  </label>{" "}
                  <textarea
                    className="form-control"
                    rows="2"
                    required
                    value={formData.foodDescription}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        foodDescription: e.target.value,
                      })
                    }
                    placeholder="e.g. Assorted sandwiches, salads, and baked goods."
                  ></textarea>{" "}
                </div>{" "}
                <div className="mb-4">
                  {" "}
                  <label className="form-label fw-bold small">
                    Boxes Available
                  </label>{" "}
                  <input
                    type="number"
                    className="form-control"
                    required
                    min="1"
                    value={formData.boxesAvailable}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        boxesAvailable: Number(e.target.value),
                      })
                    }
                  />{" "}
                </div>{" "}
                <div className="d-flex justify-content-end gap-2">
                  {" "}
                  <button
                    type="button"
                    className="btn btn-light rounded-pill px-4"
                    onClick={() => setShowTrigger(false)}
                  >
                    Cancel
                  </button>{" "}
                  <button
                    type="submit"
                    className="btn btn-danger rounded-pill px-4 fw-bold"
                  >
                    Broadcast Alert
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
export default FoodRescue;
