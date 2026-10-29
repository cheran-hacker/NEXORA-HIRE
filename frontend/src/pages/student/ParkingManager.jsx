import { useToast } from "../../context/ToastContext";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Car, MapPin, Clock, Search, ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { parkingService } from "../../services/api";
const ParkingManager = () => {
  const { addToast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [parkingSpots, setParkingSpots] = useState([]);
  useEffect(() => {
    const fetchSpots = async () => {
      try {
        const res = await parkingService.getLots();
        setParkingSpots(res.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSpots();
  }, []);
  if (loading)
    return (
      <div className="p-5 text-center">
        <span className="spinner-border text-primary" />
      </div>
    );
  return (
    <div className="container-fluid py-4 px-xl-5">
      {" "}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5 d-flex justify-content-between align-items-end flex-wrap gap-3"
      >
        {" "}
        <div>
          {" "}
          <h2
            className="fw-black mb-1 d-flex align-items-center gap-3"
            style={{ color: "var(--text)" }}
          >
            {" "}
            <Car size={32} className="text-primary" /> Smart Parking{" "}
          </h2>{" "}
          <p className="text-muted fw-medium m-0">
            Find and reserve parking spots across the campus in real-time.
          </p>{" "}
        </div>{" "}
      </motion.div>{" "}
      <div className="row g-4">
        {" "}
        {/* Your Vehicle */}{" "}
        <div className="col-lg-4">
          {" "}
          <div className="bento-card p-4 mb-4">
            {" "}
            <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
              <ShieldCheck size={20} className="text-success" /> Registered
              Vehicle
            </h5>{" "}
            <div className="p-3 rounded-4 bg-light border mb-3">
              {" "}
              <div className="d-flex justify-content-between mb-2">
                {" "}
                <span className="text-muted small">License Plate</span>{" "}
                <span className="fw-bold">XYZ-9876</span>{" "}
              </div>{" "}
              <div className="d-flex justify-content-between mb-2">
                {" "}
                <span className="text-muted small">Make/Model</span>{" "}
                <span className="fw-bold">Honda Civic (Black)</span>{" "}
              </div>{" "}
              <div className="d-flex justify-content-between">
                {" "}
                <span className="text-muted small">Permit Type</span>{" "}
                <span className="badge bg-primary-subtle text-primary rounded-pill">
                  Resident Student
                </span>{" "}
              </div>{" "}
            </div>{" "}
            <button
              onClick={async () => {
                const plate = window.prompt("Enter your license plate number:");
                if (!plate) return;
                try {
                  await parkingService.registerVehicle({
                    licensePlate: plate,
                    make: "Honda Civic",
                    color: "Black",
                    permitType: "Resident Student",
                  });
                  addToast("Vehicle info updated successfully!", "info");
                } catch (err) {
                  addToast(err.message || "Failed to update vehicle info", "error");
                }
              }}
              className="btn btn-outline-primary w-100 fw-bold rounded-pill"
            >
              Update Vehicle Info
            </button>{" "}
          </div>{" "}
        </div>{" "}
        {/* Live Parking Lots */}{" "}
        <div className="col-lg-8">
          {" "}
          <div className="bento-card p-4">
            {" "}
            <div className="d-flex justify-content-between align-items-center mb-4">
              {" "}
              <h5 className="fw-bold mb-0">Live Lot Status</h5>{" "}
              <div className="position-relative">
                {" "}
                <Search
                  size={14}
                  className="position-absolute top-50 translate-middle-y ms-3 text-muted"
                />{" "}
                <input
                  type="text"
                  className="form-control form-control-sm rounded-pill ps-5"
                  style={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    color: "var(--text)",
                  }}
                  placeholder="Search lots..."
                />{" "}
              </div>{" "}
            </div>{" "}
            <div className="d-flex flex-column gap-3">
              {" "}
              {parkingSpots.map((spot, idx) => {
                const availabilityRatio = spot.available / spot.total;
                const statusColor =
                  availabilityRatio > 0.5
                    ? "success"
                    : availabilityRatio > 0.1
                      ? "warning"
                      : "danger";
                return (
                  <motion.div
                    key={spot._id || spot.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-4 rounded-4 border d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 hover-glow"
                    style={{
                      borderColor: "var(--border)",
                      background: "var(--surface-2)",
                    }}
                  >
                    {" "}
                    <div>
                      {" "}
                      <h6 className="fw-bold mb-1">{spot.lotName}</h6>{" "}
                      <div className="d-flex gap-3 text-muted small fw-semibold">
                        {" "}
                        <span className="d-flex align-items-center gap-1">
                          <MapPin size={14} /> {spot.distance}
                        </span>{" "}
                        <span className="d-flex align-items-center gap-1">
                          <Clock size={14} /> {spot.rate}
                        </span>{" "}
                        <span className="badge bg-secondary-subtle text-secondary rounded-pill">
                          {spot.type}
                        </span>{" "}
                      </div>{" "}
                    </div>{" "}
                    <div className="d-flex align-items-center gap-4">
                      {" "}
                      <div className="text-end">
                        {" "}
                        <h4 className={`fw-black text-${statusColor} mb-0`}>
                          {spot.available}
                        </h4>{" "}
                        <small
                          className="text-muted fw-bold text-uppercase"
                          style={{ fontSize: "0.65rem" }}
                        >
                          Spots Left
                        </small>{" "}
                      </div>{" "}
                      <button
                        onClick={() => {
                          if (spot.available > 0)
                            addToast(
                              `Reserved spot in ${spot.name}`,
                              "success",
                            );
                        }}
                        className={`btn fw-bold rounded-pill px-4 ${spot.available > 0 ? "btn-primary" : "btn-outline-secondary disabled"}`}
                      >
                        {" "}
                        {spot.available > 0 ? "Reserve" : "Full"}{" "}
                      </button>{" "}
                    </div>{" "}
                  </motion.div>
                );
              })}{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
};
export default ParkingManager;
