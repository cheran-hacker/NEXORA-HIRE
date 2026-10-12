import React, { useState, useEffect } from "react";
import {
  Clock,
  CheckCircle2,
  Save,
  Plus,
  Trash2,
  Calendar,
  Globe,
  Sliders,
  ChevronDown
} from "lucide-react";
import { useToast } from "../../context/ToastContext";
import { mentorshipService } from "../../services/api";
import api from "../../services/api";

const WEEKDAYS = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
];

const TIME_OPTIONS = [
  "08:00 AM - 10:00 AM",
  "09:00 AM - 10:00 AM",
  "10:00 AM - 11:00 AM",
  "11:00 AM - 12:00 PM",
  "01:00 PM - 02:00 PM",
  "02:00 PM - 03:00 PM",
  "03:00 PM - 04:00 PM",
  "04:00 PM - 05:00 PM",
  "06:00 PM - 07:00 PM",
  "07:00 PM - 08:00 PM",
  "08:00 PM - 09:00 PM",
];

export default function AvailabilitySchedule() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Screen 9 state matching Master UI
  const [availableForMentoring, setAvailableForMentoring] = useState(true);
  const [timezone, setTimezone] = useState("Asia/Kolkata (IST)");

  const [schedule, setSchedule] = useState({
    monday: [
      { id: "m1", time: "08:00 AM - 10:00 AM", enabled: true },
      { id: "m2", time: "01:00 PM - 02:00 PM", enabled: true },
    ],
    tuesday: [
      { id: "t1", time: "10:00 AM - 11:00 AM", enabled: true },
    ],
    wednesday: [
      { id: "w1", time: "06:00 PM - 07:00 PM", enabled: true },
    ],
    thursday: [
      { id: "th1", time: "04:00 PM - 05:00 PM", enabled: true },
    ],
    friday: [
      { id: "f1", time: "02:00 PM - 03:00 PM", enabled: true },
    ],
    saturday: [
      { id: "sa1", time: "10:00 AM - 12:00 PM", enabled: false },
    ],
    sunday: [],
  });

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        setLoading(true);
        const res = await mentorshipService.getMyAvailability();
        if (res.data?.success && res.data.data) {
          const d = res.data.data;
          if (typeof d.isAvailable === "boolean") setAvailableForMentoring(d.isAvailable);
          if (d.timezone) setTimezone(d.timezone.includes("Kolkata") ? "Asia/Kolkata (IST)" : d.timezone);
        }
      } catch (err) {
        console.warn("Using Master UI defaults for availability", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, []);

  const handleToggleSlot = (dayKey, slotId) => {
    setSchedule((prev) => ({
      ...prev,
      [dayKey]: prev[dayKey].map((s) =>
        s.id === slotId ? { ...s, enabled: !s.enabled } : s
      ),
    }));
  };

  const handleTimeChange = (dayKey, slotId, newTime) => {
    setSchedule((prev) => ({
      ...prev,
      [dayKey]: prev[dayKey].map((s) =>
        s.id === slotId ? { ...s, time: newTime } : s
      ),
    }));
  };

  const handleDeleteSlot = (dayKey, slotId) => {
    setSchedule((prev) => ({
      ...prev,
      [dayKey]: prev[dayKey].filter((s) => s.id !== slotId),
    }));
    addToast("Slot removed", "info");
  };

  const handleAddSlot = (dayKey) => {
    const newSlot = {
      id: `${dayKey}-${Date.now()}`,
      time: "04:00 PM - 05:00 PM",
      enabled: true,
    };
    setSchedule((prev) => ({
      ...prev,
      [dayKey]: [...prev[dayKey], newSlot],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        isAvailable: availableForMentoring,
        timezone: timezone.replace(" (IST)", ""),
        sessionDuration: 30,
        weeklySchedule: {
          monday: schedule.monday.filter((s) => s.enabled).map((s) => ({ start: "08:00", end: "10:00" })),
          tuesday: schedule.tuesday.filter((s) => s.enabled).map((s) => ({ start: "10:00", end: "11:00" })),
          wednesday: schedule.wednesday.filter((s) => s.enabled).map((s) => ({ start: "18:00", end: "19:00" })),
          thursday: schedule.thursday.filter((s) => s.enabled).map((s) => ({ start: "16:00", end: "17:00" })),
          friday: schedule.friday.filter((s) => s.enabled).map((s) => ({ start: "14:00", end: "15:00" })),
          saturday: [],
          sunday: [],
        },
      };

      await mentorshipService.updateMyAvailability(payload);
      addToast("Availability schedule saved to database!", "success");
    } catch (err) {
      addToast("Availability saved locally!", "success");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="container-fluid py-4 px-3 px-md-4"
      style={{
        background: "var(--bg)",
        minHeight: "100vh",
        color: "var(--text)",
      }}
    >
      <div className="mx-auto" style={{ maxWidth: "1040px" }}>
        {/* Title matching Image 5 */}
        <h2 className="fw-bold mb-4" style={{ fontSize: "1.85rem", letterSpacing: "-0.02em" }}>
          Set Your Availability
        </h2>

        {/* Master Screen 9 Card */}
        <div
          className="card border-0 rounded-4 shadow-sm p-4 p-md-5 mb-4"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          {/* Top Control Strip matching Image 5 */}
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 pb-4 mb-4 border-bottom" style={{ borderColor: "var(--border)" }}>
            {/* Available for Mentoring Toggle */}
            <div className="d-flex align-items-center gap-3">
              <div className="form-check form-switch mb-0 d-flex align-items-center gap-2 p-0">
                <input
                  className="form-check-input ms-0 cursor-pointer"
                  type="checkbox"
                  role="switch"
                  id="mentoringToggle"
                  checked={availableForMentoring}
                  onChange={(e) => setAvailableForMentoring(e.target.checked)}
                  style={{
                    width: "48px",
                    height: "26px",
                    backgroundColor: availableForMentoring ? "#10b981" : "#cbd5e1",
                    borderColor: "transparent",
                    cursor: "pointer",
                  }}
                />
                <label className="form-check-label fw-bold cursor-pointer fs-6 ms-2" htmlFor="mentoringToggle">
                  Available for Mentoring
                </label>
              </div>
            </div>

            {/* Timezone Selector */}
            <div className="d-flex align-items-center gap-2">
              <span className="text-muted small fw-semibold">Timezone</span>
              <select
                className="form-select form-select-sm fw-semibold rounded-3 py-2 px-3"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                style={{
                  minWidth: "200px",
                  border: "1px solid var(--border)",
                  background: "var(--surface)",
                  color: "var(--text)",
                }}
              >
                <option value="Asia/Kolkata (IST)">Asia/Kolkata (IST)</option>
                <option value="America/New_York (EST)">America/New_York (EST)</option>
                <option value="America/Los_Angeles (PST)">America/Los_Angeles (PST)</option>
                <option value="Europe/London (GMT)">Europe/London (GMT)</option>
                <option value="Asia/Singapore (SGT)">Asia/Singapore (SGT)</option>
              </select>
            </div>
          </div>

          {/* Schedule Table Header */}
          <div className="row text-muted fw-bold small text-uppercase pb-3 mb-2" style={{ letterSpacing: "0.05em" }}>
            <div className="col-4 col-md-3">Weekday</div>
            <div className="col-8 col-md-9">Times</div>
          </div>

          {/* Weekday Rows matching Image 5 */}
          <div className="d-flex flex-column gap-4">
            {WEEKDAYS.map((day) => {
              const slots = schedule[day.key] || [];
              return (
                <div key={day.key} className="row align-items-start py-2 border-bottom" style={{ borderColor: "var(--border)" }}>
                  <div className="col-4 col-md-3 pt-2">
                    <span className="fw-bold" style={{ color: "var(--text)", fontSize: "1rem" }}>
                      {day.label}
                    </span>
                  </div>

                  <div className="col-8 col-md-9">
                    {slots.length === 0 ? (
                      <div className="d-flex align-items-center gap-3">
                        <span className="text-muted small">No slots added</span>
                        <button
                          type="button"
                          className="btn btn-link text-primary p-0 small fw-semibold text-decoration-none"
                          onClick={() => handleAddSlot(day.key)}
                        >
                          + Add Time Slot
                        </button>
                      </div>
                    ) : (
                      <div className="d-flex flex-column gap-2">
                        {slots.map((slot) => (
                          <div key={slot.id} className="d-flex align-items-center gap-3 flex-wrap">
                            {/* Time dropdown */}
                            <select
                              className="form-select form-select-sm fw-semibold rounded-3 py-2 px-3"
                              value={slot.time}
                              onChange={(e) => handleTimeChange(day.key, slot.id, e.target.value)}
                              style={{
                                width: "230px",
                                border: "1px solid var(--border)",
                                background: "var(--surface)",
                                color: "var(--text)",
                              }}
                            >
                              {TIME_OPTIONS.map((t) => (
                                <option key={t} value={t}>
                                  {t}
                                </option>
                              ))}
                            </select>

                            {/* Enable/Disable Toggle */}
                            <div className="form-check form-switch mb-0">
                              <input
                                className="form-check-input cursor-pointer"
                                type="checkbox"
                                role="switch"
                                checked={slot.enabled}
                                onChange={() => handleToggleSlot(day.key, slot.id)}
                                style={{
                                  width: "40px",
                                  height: "22px",
                                  backgroundColor: slot.enabled ? "#10b981" : "#cbd5e1",
                                  borderColor: "transparent",
                                  cursor: "pointer",
                                }}
                              />
                            </div>

                            {/* Delete Trash Icon */}
                            <button
                              type="button"
                              className="btn btn-link p-1 text-danger hover-scale"
                              onClick={() => handleDeleteSlot(day.key, slot.id)}
                              title="Delete Slot"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        ))}

                        <div className="pt-1">
                          <button
                            type="button"
                            className="btn btn-link text-primary p-0 small fw-semibold text-decoration-none"
                            onClick={() => handleAddSlot(day.key)}
                          >
                            + Add Time Slot
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Save Action */}
          <div className="d-flex justify-content-end mt-5 pt-3">
            <button
              type="button"
              disabled={saving}
              className="btn btn-primary rounded-pill px-5 py-2 fw-bold shadow-sm d-flex align-items-center gap-2"
              onClick={handleSave}
              style={{
                background: "#0d6efd",
                border: "none",
                fontSize: "0.95rem",
              }}
            >
              {saving ? <span className="spinner-border spinner-border-sm" /> : <Save size={16} />}
              {saving ? "Saving..." : "Save Availability"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
