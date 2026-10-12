import React, { useState, useEffect } from "react";
import {
  Clock,
  CheckCircle,
  Save,
  Calendar as CalendarIcon,
  X,
  Sparkles,
  Power,
  RotateCcw,
  Plus,
  Globe,
  Sliders,
  ShieldAlert,
  Trash2
} from "lucide-react";
import { useToast } from "../../context/ToastContext";
import { motion, AnimatePresence } from "framer-motion";
import { mentorshipService } from "../../services/api";
import api from "../../services/api";

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const TIMEZONES = [
  "Asia/Kolkata",
  "America/New_York",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Berlin",
  "Asia/Dubai",
  "Asia/Singapore",
  "Australia/Sydney"
];

export default function AvailabilitySchedule() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [available, setAvailable] = useState(true);
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [sessionDuration, setSessionDuration] = useState(30);
  const [bufferMinutes, setBufferMinutes] = useState(15);
  const [maxSessionsPerDay, setMaxSessionsPerDay] = useState(4);
  const [maxActiveMentees, setMaxActiveMentees] = useState(5);
  const [exceptions, setExceptions] = useState([]);

  // Block date form state
  const [blockDate, setBlockDate] = useState("");
  const [blockReason, setBlockReason] = useState("");

  const [schedule, setSchedule] = useState({
    monday: [{ start: "18:00", end: "20:00" }],
    tuesday: [],
    wednesday: [{ start: "18:00", end: "20:00" }],
    thursday: [],
    friday: [{ start: "18:00", end: "20:00" }],
    saturday: [{ start: "10:00", end: "13:00" }],
    sunday: [],
  });

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      const res = await mentorshipService.getMyAvailability();
      if (res.data?.success && res.data.data) {
        const d = res.data.data;
        if (typeof d.isAvailable === "boolean") setAvailable(d.isAvailable);
        if (d.weeklySchedule) setSchedule(d.weeklySchedule);
        if (d.timezone) setTimezone(d.timezone);
        if (d.sessionDuration) setSessionDuration(d.sessionDuration);
        if (typeof d.bufferMinutes === "number") setBufferMinutes(d.bufferMinutes);
        if (d.maxSessionsPerDay) setMaxSessionsPerDay(d.maxSessionsPerDay);
        if (d.maxActiveMentees) setMaxActiveMentees(d.maxActiveMentees);
        if (d.exceptions) setExceptions(d.exceptions);
      }
    } catch (err) {
      // Fallback to legacy endpoint if any error
      try {
        const legacyRes = await api.get("/alumni/availability");
        if (legacyRes.data?.success) {
          if (typeof legacyRes.data.available === "boolean") setAvailable(legacyRes.data.available);
          if (legacyRes.data.schedule) setSchedule(legacyRes.data.schedule);
        }
      } catch (lErr) {
        console.warn("Could not load saved availability, using defaults");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddTime = (day) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: [...(prev[day] || []), { start: "18:00", end: "19:00" }],
    }));
  };

  const handleRemoveTime = (day, index) => {
    setSchedule((prev) => {
      const newTimes = [...(prev[day] || [])];
      newTimes.splice(index, 1);
      return { ...prev, [day]: newTimes };
    });
  };

  const handleChangeTime = (day, index, field, value) => {
    setSchedule((prev) => {
      const newTimes = [...(prev[day] || [])];
      newTimes[index] = { ...newTimes[index], [field]: value };
      return { ...prev, [day]: newTimes };
    });
  };

  const applyPreset = (presetType) => {
    if (presetType === "evenings") {
      setSchedule({
        monday: [{ start: "18:00", end: "20:00" }],
        tuesday: [{ start: "18:00", end: "20:00" }],
        wednesday: [{ start: "18:00", end: "20:00" }],
        thursday: [{ start: "18:00", end: "20:00" }],
        friday: [{ start: "18:00", end: "20:00" }],
        saturday: [],
        sunday: [],
      });
      addToast("Applied Weekday Evenings preset!", "success");
    } else if (presetType === "weekends") {
      setSchedule({
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [{ start: "10:00", end: "13:00" }],
        sunday: [{ start: "10:00", end: "13:00" }],
      });
      addToast("Applied Weekend Mornings preset!", "success");
    } else if (presetType === "clear") {
      setSchedule({
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: [],
      });
      addToast("Cleared all schedule slots", "info");
    }
  };

  const handleAddBlockedDate = (e) => {
    e.preventDefault();
    if (!blockDate) return;
    setExceptions((prev) => [
      ...prev,
      { date: new Date(blockDate), reason: blockReason || "Unavailable", type: "UNAVAILABLE" }
    ]);
    setBlockDate("");
    setBlockReason("");
    addToast("Date added to blocked list", "success");
  };

  const handleRemoveBlockedDate = (index) => {
    setExceptions((prev) => prev.filter((_, i) => i !== index));
    addToast("Blocked date removed", "info");
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      isAvailable: available,
      available,
      schedule,
      weeklySchedule: schedule,
      timezone,
      sessionDuration: Number(sessionDuration),
      bufferMinutes: Number(bufferMinutes),
      maxSessionsPerDay: Number(maxSessionsPerDay),
      maxActiveMentees: Number(maxActiveMentees),
      exceptions
    };

    try {
      await mentorshipService.updateMyAvailability(payload);
      // Also update legacy endpoint for full backward sync
      await api.put("/alumni/availability", { schedule, available }).catch(() => {});
      addToast("Mentorship availability and constraints saved to MongoDB!", "success");
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to save schedule", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleMasterAvailability = async () => {
    const nextStatus = !available;
    setAvailable(nextStatus);
    try {
      await mentorshipService.updateMyAvailability({ isAvailable: nextStatus, available: nextStatus });
      await api.put("/alumni/availability", { available: nextStatus }).catch(() => {});
      addToast(
        nextStatus
          ? "Mentorship intake active! Students can book your available slots."
          : "Mentorship intake paused. Students will see you are taking a break.",
        nextStatus ? "success" : "info"
      );
    } catch (err) {
      addToast("Failed to update status", "error");
      setAvailable(!nextStatus);
    }
  };

  // Calculate total weekly hours committed
  const calculateTotalWeeklyHours = () => {
    let totalMinutes = 0;
    let activeDays = 0;

    DAYS.forEach((day) => {
      const slots = schedule[day] || [];
      if (slots.length > 0) activeDays++;
      slots.forEach((slot) => {
        if (slot.start && slot.end) {
          const [sh, sm] = slot.start.split(":").map(Number);
          const [eh, em] = slot.end.split(":").map(Number);
          const diff = eh * 60 + em - (sh * 60 + sm);
          if (diff > 0) totalMinutes += diff;
        }
      });
    });

    const hours = (totalMinutes / 60).toFixed(1);
    return { hours: Number(hours), activeDays };
  };

  const { hours: totalHours, activeDays } = calculateTotalWeeklyHours();

  if (loading) {
    return (
      <div className="container-fluid py-5 d-flex flex-column align-items-center justify-content-center" style={{ minHeight: "60vh" }}>
        <div className="spinner-border text-primary mb-3" role="status" style={{ width: "3rem", height: "3rem" }} />
        <p className="text-muted fw-semibold">Loading your availability schedule...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4 px-xl-5 space-y-4" style={{ maxWidth: "1150px" }}>
      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-2 text-primary fw-semibold small" style={{ background: "rgba(var(--primary-rgb), 0.1)", border: "1px solid rgba(var(--primary-rgb), 0.2)" }}>
            <Clock size={14} /> Student Mentorship Calendar
          </div>
          <h2 className="fw-black mb-1 d-flex align-items-center gap-2 text-foreground" style={{ fontSize: "2rem", letterSpacing: "-0.02em" }}>
            <CalendarIcon size={30} className="text-primary" /> Availability & Session Rules
          </h2>
          <p className="mb-0 text-muted" style={{ fontSize: "0.95rem" }}>
            Configure real-time time slots, session durations, buffer periods, and block holiday dates.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            className="btn rounded-pill px-4 py-2 fw-bold shadow-sm d-flex align-items-center gap-2"
            onClick={handleSave}
            disabled={saving}
            style={{
              background: "var(--primary)",
              color: "#fff",
              border: "none",
            }}
          >
            {saving ? (
              <span className="spinner-border spinner-border-sm" />
            ) : (
              <Save size={18} />
            )}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Overview Status & Summary Bar */}
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <div
            className="p-4 rounded-4 d-flex align-items-center justify-content-between shadow-sm h-100"
            style={{
              background: "var(--surface)",
              border: available ? "1px solid rgba(34,197,94,0.3)" : "1px solid var(--border)",
            }}
          >
            <div className="d-flex align-items-center gap-3">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  width: 48,
                  height: 48,
                  background: available ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
                  color: available ? "#16a34a" : "#dc2626",
                }}
              >
                <Power size={22} />
              </div>
              <div>
                <div className="small text-muted fw-semibold">Mentorship Intake Status</div>
                <h5 className="fw-bold mb-0 text-foreground">
                  {available ? "Active & Accepting Requests" : "Paused (Taking a Break)"}
                </h5>
              </div>
            </div>
            <button
              onClick={handleToggleMasterAvailability}
              className={`btn btn-sm rounded-pill px-3 py-2 fw-bold d-flex align-items-center gap-2 ${
                available ? "btn-outline-danger" : "btn-success"
              }`}
            >
              {available ? "Pause Intake" : "Activate Intake"}
            </button>
          </div>
        </div>

        <div className="col-md-6">
          <div
            className="p-4 rounded-4 shadow-sm h-100 d-flex align-items-center justify-content-between"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
            }}
          >
            <div>
              <div className="small text-muted fw-semibold">Weekly Commitment</div>
              <h4 className="fw-black mb-0 text-foreground">
                {totalHours} hrs / week
                <span className="fs-6 fw-normal text-muted ms-2">
                  across {activeDays} active day{activeDays === 1 ? "" : "s"}
                </span>
              </h4>
            </div>
            <div className="text-end">
              <span
                className="badge rounded-pill px-3 py-2 fw-semibold"
                style={{
                  background: "rgba(var(--primary-rgb), 0.1)",
                  color: "var(--primary)",
                  border: "1px solid rgba(var(--primary-rgb), 0.2)",
                }}
              >
                {activeDays > 0 ? "Bookable by Students" : "No Slots Set"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Session Rules & Timezone Settings Card */}
      <div className="bento-card p-4 rounded-4 shadow-sm mb-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        <h5 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: "var(--text)" }}>
          <Sliders size={20} className="text-primary" /> Session Constraints & Timezone
        </h5>
        <div className="row g-3">
          <div className="col-md-4">
            <label className="small fw-bold mb-1 text-muted d-flex align-items-center gap-1">
              <Globe size={14} /> Timezone
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="form-select rounded-3 shadow-none"
              style={{ background: "var(--surface)", color: "var(--text)", borderColor: "var(--border)" }}
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>

          <div className="col-md-2">
            <label className="small fw-bold mb-1 text-muted">Session Duration</label>
            <select
              value={sessionDuration}
              onChange={(e) => setSessionDuration(Number(e.target.value))}
              className="form-select rounded-3 shadow-none"
              style={{ background: "var(--surface)", color: "var(--text)", borderColor: "var(--border)" }}
            >
              <option value={15}>15 mins</option>
              <option value={30}>30 mins</option>
              <option value={45}>45 mins</option>
              <option value={60}>60 mins</option>
            </select>
          </div>

          <div className="col-md-2">
            <label className="small fw-bold mb-1 text-muted">Buffer Time</label>
            <select
              value={bufferMinutes}
              onChange={(e) => setBufferMinutes(Number(e.target.value))}
              className="form-select rounded-3 shadow-none"
              style={{ background: "var(--surface)", color: "var(--text)", borderColor: "var(--border)" }}
            >
              <option value={0}>No buffer</option>
              <option value={10}>10 mins</option>
              <option value={15}>15 mins</option>
              <option value={30}>30 mins</option>
            </select>
          </div>

          <div className="col-md-2">
            <label className="small fw-bold mb-1 text-muted">Max Sessions / Day</label>
            <input
              type="number"
              min={1}
              max={10}
              value={maxSessionsPerDay}
              onChange={(e) => setMaxSessionsPerDay(Number(e.target.value))}
              className="form-control rounded-3 shadow-none"
              style={{ background: "var(--surface)", color: "var(--text)", borderColor: "var(--border)" }}
            />
          </div>

          <div className="col-md-2">
            <label className="small fw-bold mb-1 text-muted">Max Active Mentees</label>
            <input
              type="number"
              min={1}
              max={25}
              value={maxActiveMentees}
              onChange={(e) => setMaxActiveMentees(Number(e.target.value))}
              className="form-control rounded-3 shadow-none"
              style={{ background: "var(--surface)", color: "var(--text)", borderColor: "var(--border)" }}
            />
          </div>
        </div>
      </div>

      {/* Quick Presets Bar */}
      <div
        className="p-3 mb-4 rounded-4 d-flex flex-wrap align-items-center justify-content-between gap-2 shadow-sm"
        style={{
          background: "var(--bg-secondary)",
          border: "1px solid var(--border)",
        }}
      >
        <span className="small fw-bold text-muted text-uppercase d-flex align-items-center gap-2">
          <Sparkles size={16} className="text-primary" /> Quick Schedule Presets:
        </span>
        <div className="d-flex flex-wrap gap-2">
          <button
            onClick={() => applyPreset("evenings")}
            className="btn btn-sm btn-outline-primary rounded-pill px-3 fw-semibold"
          >
            Weekday Evenings (6-8 PM)
          </button>
          <button
            onClick={() => applyPreset("weekends")}
            className="btn btn-sm btn-outline-primary rounded-pill px-3 fw-semibold"
          >
            Weekend Mornings (10 AM - 1 PM)
          </button>
          <button
            onClick={() => applyPreset("clear")}
            className="btn btn-sm btn-outline-secondary rounded-pill px-3 fw-semibold text-muted"
          >
            <RotateCcw size={13} className="me-1" /> Clear All
          </button>
        </div>
      </div>

      {/* Main Schedule Days Card */}
      <div className="bento-card p-4 p-md-5 rounded-4 shadow-sm mb-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        <h5 className="fw-bold mb-4" style={{ color: "var(--text)" }}>Weekly Time Windows</h5>
        <div className="d-flex flex-column gap-4">
          {DAYS.map((day) => {
            const slots = schedule[day] || [];
            const hasSlots = slots.length > 0;

            return (
              <div
                key={day}
                className="row g-3 align-items-start pb-4"
                style={{ borderBottom: "1px dashed var(--border)" }}
              >
                {/* Day Name */}
                <div className="col-12 col-md-3">
                  <div className="d-flex align-items-center gap-2 pt-1">
                    {hasSlots ? (
                      <CheckCircle size={20} className="text-success flex-shrink-0" />
                    ) : (
                      <div
                        className="rounded-circle border flex-shrink-0"
                        style={{ width: 20, height: 20, borderColor: "var(--border)" }}
                      />
                    )}
                    <div>
                      <h6
                        className="fw-bold m-0 text-capitalize text-foreground"
                        style={{ fontSize: "1.05rem" }}
                      >
                        {day}
                      </h6>
                      <small className="text-muted">
                        {hasSlots ? `${slots.length} window${slots.length === 1 ? "" : "s"}` : "Not available"}
                      </small>
                    </div>
                  </div>
                </div>

                {/* Slots List */}
                <div className="col-12 col-md-9">
                  <div className="d-flex flex-column gap-2">
                    <AnimatePresence>
                      {slots.map((slot, index) => (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          key={index}
                          className="d-flex flex-wrap align-items-center gap-2 p-2 rounded-3"
                          style={{
                            background: "var(--bg-secondary)",
                            border: "1px solid var(--border)",
                            maxWidth: "460px",
                          }}
                        >
                          <input
                            type="time"
                            className="form-control form-control-sm w-auto fw-bold shadow-none"
                            value={slot.start}
                            onChange={(e) =>
                              handleChangeTime(day, index, "start", e.target.value)
                            }
                            style={{
                              border: "1px solid var(--border)",
                              color: "var(--text)",
                              background: "var(--card)",
                            }}
                          />
                          <span className="text-muted fw-bold small px-1">to</span>
                          <input
                            type="time"
                            className="form-control form-control-sm w-auto fw-bold shadow-none"
                            value={slot.end}
                            onChange={(e) =>
                              handleChangeTime(day, index, "end", e.target.value)
                            }
                            style={{
                              border: "1px solid var(--border)",
                              color: "var(--text)",
                              background: "var(--card)",
                            }}
                          />
                          <button
                            className="btn btn-sm btn-link text-danger p-1 ms-auto"
                            onClick={() => handleRemoveTime(day, index)}
                            title="Remove window"
                          >
                            <X size={18} />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    <div>
                      <button
                        className="btn btn-sm btn-outline-secondary rounded-pill fw-semibold mt-1 d-inline-flex align-items-center gap-1"
                        onClick={() => handleAddTime(day)}
                        style={{ border: "1px solid var(--border)", color: "var(--text)" }}
                      >
                        <Plus size={14} /> Add Time Window
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Blocked Dates / Exceptions Section */}
      <div className="bento-card p-4 rounded-4 shadow-sm" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        <h5 className="fw-bold mb-2 d-flex align-items-center gap-2" style={{ color: "var(--text)" }}>
          <ShieldAlert size={20} className="text-warning" /> Block Specific Dates (Vacations / Exam Days)
        </h5>
        <p className="small text-muted mb-4">
          Students will not be able to book any mentorship slots on these blocked dates, overriding your regular weekly schedule.
        </p>

        <form onSubmit={handleAddBlockedDate} className="row g-2 mb-4">
          <div className="col-md-4">
            <input
              type="date"
              value={blockDate}
              onChange={(e) => setBlockDate(e.target.value)}
              className="form-control rounded-3"
              style={{ background: "var(--surface)", color: "var(--text)", borderColor: "var(--border)" }}
              required
            />
          </div>
          <div className="col-md-6">
            <input
              type="text"
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              placeholder="Reason (e.g. Travel, College Function, Hackathon Judge)"
              className="form-control rounded-3"
              style={{ background: "var(--surface)", color: "var(--text)", borderColor: "var(--border)" }}
            />
          </div>
          <div className="col-md-2">
            <button type="submit" className="btn btn-warning rounded-3 w-100 fw-bold">
              Block Date
            </button>
          </div>
        </form>

        <div className="space-y-2">
          {exceptions.length === 0 ? (
            <p className="small text-muted mb-0">No dates are currently blocked.</p>
          ) : (
            exceptions.map((ex, i) => (
              <div
                key={i}
                className="p-3 rounded-3 bg-surface-2 border d-flex align-items-center justify-content-between"
                style={{ borderColor: "var(--border)" }}
              >
                <div>
                  <strong className="d-block small" style={{ color: "var(--text)" }}>
                    {new Date(ex.date).toLocaleDateString(undefined, { weekday: "short", year: "numeric", month: "short", day: "numeric" })}
                  </strong>
                  <span className="small text-muted">{ex.reason || "Unavailable"}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveBlockedDate(i)}
                  className="btn btn-sm btn-link text-danger p-0"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
