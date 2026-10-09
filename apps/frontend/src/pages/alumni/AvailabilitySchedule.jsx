import React, { useState } from "react";
import {
  Clock,
  CheckCircle,
  Save,
  Calendar as CalendarIcon,
  X,
} from "lucide-react";
import { useToast } from "../../context/ToastContext";
import { motion } from "framer-motion";
import api from "../../services/api";
export default function AvailabilitySchedule() {
  const { addToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [schedule, setSchedule] = useState({
    monday: [{ start: "09:00", end: "11:00" }],
    tuesday: [],
    wednesday: [{ start: "14:00", end: "16:00" }],
    thursday: [],
    friday: [],
    saturday: [{ start: "10:00", end: "12:00" }],
    sunday: [],
  });
  const DAYS = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];
  const handleAddTime = (day) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: [...prev[day], { start: "09:00", end: "10:00" }],
    }));
  };
  const handleRemoveTime = (day, index) => {
    setSchedule((prev) => {
      const newTimes = [...prev[day]];
      newTimes.splice(index, 1);
      return { ...prev, [day]: newTimes };
    });
  };
  const handleChangeTime = (day, index, field, value) => {
    setSchedule((prev) => {
      const newTimes = [...prev[day]];
      newTimes[index][field] = value;
      return { ...prev, [day]: newTimes };
    });
  };
  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put("/alumni/availability", { schedule });
      addToast("Availability updated successfully!", "success");
    } catch (err) {
      addToast("Failed to save schedule", "error");
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="container-fluid space-y-4" style={{ maxWidth: "900px" }}>
      {" "}
      <div className="d-flex align-items-center justify-content-between mb-4">
        {" "}
        <div>
          {" "}
          <h2
            className="fw-black mb-1 d-flex align-items-center gap-2"
            style={{ color: "var(--text)" }}
          >
            {" "}
            <CalendarIcon size={32} className="text-primary" /> Availability
            Schedule{" "}
          </h2>{" "}
          <p
            className="fw-medium mb-0"
            style={{ color: "var(--text-secondary)" }}
          >
            Configure the times you are available for student mentorship.
          </p>{" "}
        </div>{" "}
        <button
          className="btn rounded-pill px-4 fw-bold shadow-sm d-flex align-items-center gap-2 transition-fast hover-scale"
          onClick={handleSave}
          disabled={saving}
          style={{
            background: "var(--primary)",
            color: "#fff",
            border: "none",
          }}
        >
          {" "}
          {saving ? (
            <span className="spinner-border spinner-border-sm" />
          ) : (
            <Save size={18} />
          )}{" "}
          Save Changes{" "}
        </button>{" "}
      </div>{" "}
      <div className="bento-card p-4 p-md-5">
        {" "}
        <div className="d-flex flex-column gap-4">
          {" "}
          {DAYS.map((day) => (
            <div
              key={day}
              className="row g-3 align-items-center pb-4"
              style={{ borderBottom: "1px dashed var(--border)" }}
            >
              {" "}
              <div className="col-12 col-md-3">
                {" "}
                <h6
                  className="fw-bold m-0 text-capitalize d-flex align-items-center gap-2"
                  style={{ color: "var(--text)" }}
                >
                  {" "}
                  {schedule[day].length > 0 ? (
                    <CheckCircle size={18} className="text-success" />
                  ) : (
                    <div style={{ width: 18, height: 18 }} />
                  )}{" "}
                  {day}{" "}
                </h6>{" "}
              </div>{" "}
              <div className="col-12 col-md-9">
                {" "}
                <div className="d-flex flex-column gap-2">
                  {" "}
                  {schedule[day].map((slot, index) => (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={index}
                      className="d-flex align-items-center gap-3"
                    >
                      {" "}
                      <input
                        type="time"
                        className="form-control form-control-sm w-auto fw-bold"
                        value={slot.start}
                        onChange={(e) =>
                          handleChangeTime(day, index, "start", e.target.value)
                        }
                        style={{
                          border: "1px solid var(--border)",
                          color: "var(--text)",
                        }}
                      />{" "}
                      <span className="text-muted fw-bold">to</span>{" "}
                      <input
                        type="time"
                        className="form-control form-control-sm w-auto fw-bold"
                        value={slot.end}
                        onChange={(e) =>
                          handleChangeTime(day, index, "end", e.target.value)
                        }
                        style={{
                          border: "1px solid var(--border)",
                          color: "var(--text)",
                        }}
                      />{" "}
                      <button
                        className="btn btn-sm btn-link text-danger p-0 ms-2"
                        onClick={() => handleRemoveTime(day, index)}
                      >
                        {" "}
                        <X size={18} />{" "}
                      </button>{" "}
                    </motion.div>
                  ))}{" "}
                  <div>
                    {" "}
                    <button
                      className="btn btn-sm btn-outline-secondary rounded-pill fw-bold mt-2"
                      onClick={() => handleAddTime(day)}
                    >
                      {" "}
                      + Add Time Slot{" "}
                    </button>{" "}
                  </div>{" "}
                </div>{" "}
              </div>{" "}
            </div>
          ))}{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}
