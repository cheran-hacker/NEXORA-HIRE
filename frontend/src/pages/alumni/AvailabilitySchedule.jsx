import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Save,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Globe,
  Sliders,
  ChevronDown,
  X,
  RotateCcw,
  Sparkles,
  Info,
  CalendarCheck,
  Check,
  Zap,
  ListFilter
} from "lucide-react";
import { useToast } from "../../context/ToastContext";
import { mentorshipService } from "../../services/api";

const WEEKDAYS = [
  { key: "monday", label: "Monday", short: "Mon" },
  { key: "tuesday", label: "Tuesday", short: "Tue" },
  { key: "wednesday", label: "Wednesday", short: "Wed" },
  { key: "thursday", label: "Thursday", short: "Thu" },
  { key: "friday", label: "Friday", short: "Fri" },
  { key: "saturday", label: "Saturday", short: "Sat" },
  { key: "sunday", label: "Sunday", short: "Sun" },
];

const SESSION_TYPES = [
  { value: "1:1 Mentorship", label: "1:1 Mentorship", color: "#6366f1" },
  { value: "Resume Review", label: "Resume Review", color: "#10b981" },
  { value: "Mock Technical Interview", label: "Mock Technical Interview", color: "#8b5cf6" },
  { value: "Career Guidance", label: "Career Guidance", color: "#f59e0b" },
  { value: "Portfolio Review", label: "Portfolio Review", color: "#ec4899" },
];

const TIMEZONE_OPTIONS = [
  { value: "Asia/Kolkata", label: "Asia/Kolkata (IST, UTC+5:30)" },
  { value: "America/New_York", label: "America/New_York (EST/EDT, UTC-5)" },
  { value: "America/Los_Angeles", label: "America/Los_Angeles (PST/PDT, UTC-8)" },
  { value: "America/Chicago", label: "America/Chicago (CST/CDT, UTC-6)" },
  { value: "Europe/London", label: "Europe/London (GMT/BST, UTC+0)" },
  { value: "Europe/Berlin", label: "Europe/Berlin (CET/CEST, UTC+1)" },
  { value: "Asia/Singapore", label: "Asia/Singapore (SGT, UTC+8)" },
  { value: "Asia/Dubai", label: "Asia/Dubai (GST, UTC+4)" },
  { value: "Australia/Sydney", label: "Australia/Sydney (AEST, UTC+10)" },
];

const TIME_PRESETS = [
  { label: "Morning", start: "09:00", end: "10:30" },
  { label: "Midday", start: "11:30", end: "13:00" },
  { label: "Afternoon", start: "14:00", end: "15:30" },
  { label: "Evening", start: "18:00", end: "19:30" },
  { label: "Night", start: "20:00", end: "21:30" },
];

// Helper: parse HH:mm to minutes
const parseTimeToMinutes = (timeStr) => {
  if (!timeStr || typeof timeStr !== "string") return null;
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return h * 60 + m;
};

// Helper: format HH:mm into 12-hour AM/PM
const formatTime12Hour = (timeStr) => {
  if (!timeStr) return "";
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return timeStr;
  let h = parseInt(match[1], 10);
  const m = match[2];
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${m} ${ampm}`;
};

export default function AvailabilitySchedule() {
  const { addToast } = useToast();
  const formRef = useRef(null);

  // Loading & Saving state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Availability Settings
  const [isAvailable, setIsAvailable] = useState(true);
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [sessionDuration, setSessionDuration] = useState(30);
  const [bufferMinutes, setBufferMinutes] = useState(15);
  const [activeTab, setActiveTab] = useState("calendar"); // 'calendar' | 'list'

  // Weekly Schedule State
  const [schedule, setSchedule] = useState({
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: [],
  });

  // Form State (Add / Edit)
  const [editingSlotId, setEditingSlotId] = useState(null);
  const [editingDay, setEditingDay] = useState(null);
  const [formSelectedDays, setFormSelectedDays] = useState(["monday"]);
  const [formStartTime, setFormStartTime] = useState("18:00");
  const [formEndTime, setFormEndTime] = useState("19:30");
  const [formSessionType, setFormSessionType] = useState("1:1 Mentorship");
  const [formDuration, setFormDuration] = useState(30);
  const [formNotes, setFormNotes] = useState("");
  const [formError, setFormError] = useState("");

  // Fetch Availability on Mount
  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      const res = await mentorshipService.getMyAvailability();
      if (res.data?.success && res.data.data) {
        const d = res.data.data;
        if (typeof d.isAvailable === "boolean") setIsAvailable(d.isAvailable);
        if (d.timezone) setTimezone(d.timezone);
        if (d.sessionDuration) setSessionDuration(d.sessionDuration);
        if (typeof d.bufferMinutes === "number") setBufferMinutes(d.bufferMinutes);

        if (d.weeklySchedule) {
          const cleanSchedule = {};
          WEEKDAYS.forEach((w) => {
            const daySlots = Array.isArray(d.weeklySchedule[w.key]) ? d.weeklySchedule[w.key] : [];
            cleanSchedule[w.key] = daySlots.map((s, idx) => ({
              id: s.id || `${w.key}-slot-${Date.now()}-${idx}`,
              start: s.start || "18:00",
              end: s.end || "20:00",
              enabled: s.enabled !== false,
              sessionType: s.sessionType || "1:1 Mentorship",
              duration: s.duration || d.sessionDuration || 30,
              notes: s.notes || "",
            }));
          });
          setSchedule(cleanSchedule);
        }
        setHasUnsavedChanges(false);
      }
    } catch (err) {
      console.error("Failed to load availability from backend:", err);
      addToast(err.response?.data?.message || "Failed to load schedule from server", "error");
    } finally {
      setLoading(false);
    }
  };

  // Live validation for time range
  useEffect(() => {
    if (!formStartTime || !formEndTime) {
      setFormError("Both start and end times are required.");
      return;
    }
    const startMins = parseTimeToMinutes(formStartTime);
    const endMins = parseTimeToMinutes(formEndTime);

    if (startMins === null || endMins === null) {
      setFormError("Please enter valid times in 24-hour format.");
      return;
    }

    if (endMins <= startMins) {
      setFormError(`End time (${formatTime12Hour(formEndTime)}) must be strictly later than start time (${formatTime12Hour(formStartTime)}).`);
      return;
    }

    setFormError("");
  }, [formStartTime, formEndTime]);

  // Statistics Summary
  const stats = useMemo(() => {
    let totalSlots = 0;
    let enabledSlots = 0;
    let totalMinutes = 0;
    let activeDaysCount = 0;

    WEEKDAYS.forEach((w) => {
      const daySlots = schedule[w.key] || [];
      totalSlots += daySlots.length;
      let dayHasEnabled = false;

      daySlots.forEach((s) => {
        if (s.enabled) {
          enabledSlots++;
          dayHasEnabled = true;
          const sMins = parseTimeToMinutes(s.start);
          const eMins = parseTimeToMinutes(s.end);
          if (sMins !== null && eMins !== null && eMins > sMins) {
            totalMinutes += eMins - sMins;
          }
        }
      });

      if (dayHasEnabled) activeDaysCount++;
    });

    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const timeFormatted = mins > 0 ? `${hours}h ${mins}m` : `${hours} hrs`;

    return { totalSlots, enabledSlots, timeFormatted, activeDaysCount };
  }, [schedule]);

  // Handle Day Pill Toggle in Form
  const toggleFormDay = (dayKey) => {
    if (editingSlotId) {
      // In edit mode, allow switching the target day
      setFormSelectedDays([dayKey]);
      return;
    }
    setFormSelectedDays((prev) => {
      if (prev.includes(dayKey)) {
        if (prev.length === 1) return prev; // Keep at least one day selected
        return prev.filter((d) => d !== dayKey);
      }
      return [...prev, dayKey];
    });
  };

  const handleSelectAllWeekdays = () => {
    setFormSelectedDays(["monday", "tuesday", "wednesday", "thursday", "friday"]);
  };

  const handleSelectWeekends = () => {
    setFormSelectedDays(["saturday", "sunday"]);
  };

  const handleSelectAllDays = () => {
    setFormSelectedDays(WEEKDAYS.map((w) => w.key));
  };

  // Apply a Time Preset
  const handleApplyPreset = (preset) => {
    setFormStartTime(preset.start);
    setFormEndTime(preset.end);
  };

  // Reset Add/Edit Form
  const resetForm = () => {
    setEditingSlotId(null);
    setEditingDay(null);
    setFormSelectedDays(["monday"]);
    setFormStartTime("18:00");
    setFormEndTime("19:30");
    setFormSessionType("1:1 Mentorship");
    setFormDuration(30);
    setFormNotes("");
    setFormError("");
  };

  // Begin Editing a Slot
  const handleStartEdit = (dayKey, slot) => {
    setEditingSlotId(slot.id);
    setEditingDay(dayKey);
    setFormSelectedDays([dayKey]);
    setFormStartTime(slot.start);
    setFormEndTime(slot.end);
    setFormSessionType(slot.sessionType || "1:1 Mentorship");
    setFormDuration(slot.duration || 30);
    setFormNotes(slot.notes || "");
    setFormError("");

    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Check Overlaps for a specific day
  const checkOverlap = (dayKey, startMins, endMins, ignoreSlotId = null) => {
    const existingSlots = schedule[dayKey] || [];
    for (const slot of existingSlots) {
      if (ignoreSlotId && slot.id === ignoreSlotId) continue;
      if (!slot.enabled) continue; // Only active slots conflict
      const sMins = parseTimeToMinutes(slot.start);
      const eMins = parseTimeToMinutes(slot.end);
      if (sMins === null || eMins === null) continue;

      // Overlap condition: start < other.end && end > other.start
      if (startMins < eMins && endMins > sMins) {
        return {
          hasOverlap: true,
          conflictingSlot: slot,
          dayKey,
        };
      }
    }
    return { hasOverlap: false };
  };

  // Handle Add or Update Slot Submission
  const handleSubmitSlot = (e) => {
    e.preventDefault();
    const startMins = parseTimeToMinutes(formStartTime);
    const endMins = parseTimeToMinutes(formEndTime);

    if (startMins === null || endMins === null || endMins <= startMins) {
      addToast("End time must be strictly later than start time.", "error");
      return;
    }

    if (formSelectedDays.length === 0) {
      addToast("Please select at least one day.", "error");
      return;
    }

    if (editingSlotId && editingDay) {
      // EDIT MODE
      const targetDay = formSelectedDays[0] || editingDay;
      const overlap = checkOverlap(targetDay, startMins, endMins, editingSlotId);
      if (overlap.hasOverlap) {
        addToast(
          `Time conflicts with [${formatTime12Hour(overlap.conflictingSlot.start)} - ${formatTime12Hour(overlap.conflictingSlot.end)}] on ${targetDay.toUpperCase()}`,
          "error"
        );
        return;
      }

      let updatedSchedule = { ...schedule };
      if (targetDay !== editingDay) {
        updatedSchedule[editingDay] = (updatedSchedule[editingDay] || []).filter((s) => s.id !== editingSlotId);
        const updatedSlot = {
          id: editingSlotId,
          start: formStartTime,
          end: formEndTime,
          enabled: true,
          sessionType: formSessionType,
          duration: Number(formDuration) || 30,
          notes: formNotes.trim(),
        };
        updatedSchedule[targetDay] = [...(updatedSchedule[targetDay] || []), updatedSlot];
      } else {
        updatedSchedule[editingDay] = (updatedSchedule[editingDay] || []).map((s) =>
          s.id === editingSlotId
            ? {
                ...s,
                start: formStartTime,
                end: formEndTime,
                sessionType: formSessionType,
                duration: Number(formDuration) || 30,
                notes: formNotes.trim(),
              }
            : s
        );
      }

      setSchedule(updatedSchedule);
      resetForm();
      // Auto-save to MongoDB database
      handleSaveAll(updatedSchedule, "Slot updated and saved to database!");
    } else {
      // ADD MODE (Supports multi-day creation)
      for (const dayKey of formSelectedDays) {
        const overlap = checkOverlap(dayKey, startMins, endMins);
        if (overlap.hasOverlap) {
          addToast(
            `Time slot conflicts on ${dayKey.toUpperCase()} with existing slot [${formatTime12Hour(overlap.conflictingSlot.start)} - ${formatTime12Hour(overlap.conflictingSlot.end)}].`,
            "error"
          );
          return;
        }
      }

      const updatedSchedule = { ...schedule };
      formSelectedDays.forEach((dayKey, i) => {
        const newSlot = {
          id: `${dayKey}-slot-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
          start: formStartTime,
          end: formEndTime,
          enabled: true,
          sessionType: formSessionType,
          duration: Number(formDuration) || 30,
          notes: formNotes.trim(),
        };
        updatedSchedule[dayKey] = [...(updatedSchedule[dayKey] || []), newSlot];
      });

      setSchedule(updatedSchedule);
      resetForm();
      // Auto-save to MongoDB database
      handleSaveAll(
        updatedSchedule,
        `Added slot [${formatTime12Hour(formStartTime)} - ${formatTime12Hour(formEndTime)}] across ${formSelectedDays.length} day(s) & saved to database!`
      );
    }
  };

  // Toggle slot enabled state with auto-save
  const handleToggleSlot = (dayKey, slotId) => {
    const nextSchedule = {
      ...schedule,
      [dayKey]: schedule[dayKey].map((s) => (s.id === slotId ? { ...s, enabled: !s.enabled } : s)),
    };
    setSchedule(nextSchedule);
    handleSaveAll(nextSchedule, "Schedule status updated in database!");
  };

  // Delete a slot with auto-save
  const handleDeleteSlot = (dayKey, slotId) => {
    const nextSchedule = {
      ...schedule,
      [dayKey]: schedule[dayKey].filter((s) => s.id !== slotId),
    };
    setSchedule(nextSchedule);
    if (editingSlotId === slotId) {
      resetForm();
    }
    handleSaveAll(nextSchedule, "Slot removed from database schedule.");
  };

  // Quick Add for a Specific Day Column
  const handleQuickAddForDay = (dayKey) => {
    resetForm();
    setFormSelectedDays([dayKey]);
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Master Save to MongoDB Backend
  const handleSaveAll = async (overrideSchedule = null, customSuccessMsg = null) => {
    setSaving(true);
    try {
      const targetSchedule = overrideSchedule || schedule;
      const payload = {
        isAvailable,
        timezone,
        sessionDuration: Number(sessionDuration) || 30,
        bufferMinutes: Number(bufferMinutes) || 15,
        weeklySchedule: targetSchedule,
      };

      const res = await mentorshipService.updateMyAvailability(payload);
      if (res.data?.success) {
        addToast(customSuccessMsg || "Availability schedule saved to database successfully! 🎉", "success");
        setHasUnsavedChanges(false);
        // Sync fresh data from response
        if (res.data.data?.weeklySchedule) {
          setSchedule(res.data.data.weeklySchedule);
        }
      } else {
        throw new Error(res.data?.message || "Failed to save availability");
      }
    } catch (err) {
      console.error("Save availability error:", err);
      const msg = err.response?.data?.message || err.message || "Failed to persist availability to database.";
      addToast(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="container-fluid py-4 px-3 px-md-4"
      style={{
        minHeight: "100vh",
        background: "var(--premium-bg, var(--bg, #f8fafc))",
        color: "var(--premium-text-main, var(--text, #0f172a))",
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      }}
    >
      <div className="mx-auto" style={{ maxWidth: "1280px" }}>
        {/* Top Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span
                className="badge rounded-pill px-3 py-1 fw-bold text-uppercase"
                style={{
                  background: "rgba(99, 102, 241, 0.12)",
                  color: "#6366f1",
                  fontSize: "0.75rem",
                  letterSpacing: "0.05em",
                }}
              >
                Alumni Mentorship Portal
              </span>
              {hasUnsavedChanges && (
                <span
                  className="badge rounded-pill px-3 py-1 fw-semibold animate-pulse"
                  style={{
                    background: "rgba(245, 158, 11, 0.15)",
                    color: "#d97706",
                    fontSize: "0.75rem",
                  }}
                >
                  Unsaved Changes
                </span>
              )}
            </div>
            <h1 className="fw-bold mb-1" style={{ fontSize: "1.9rem", letterSpacing: "-0.03em" }}>
              Mentorship Availability & Schedule
            </h1>
            <p className="text-muted small mb-0">
              Configure regular weekly time slots when enrolled engineering students can book 1:1 sessions, mock interviews, and resume reviews with you.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary rounded-pill px-3 py-2 fw-semibold d-flex align-items-center gap-2"
              onClick={fetchAvailability}
              disabled={loading || saving}
              title="Reload from database"
            >
              <RotateCcw size={15} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>

            <button
              type="button"
              className="btn btn-sm rounded-pill px-4 py-2 fw-bold shadow-sm d-flex align-items-center gap-2"
              onClick={handleSaveAll}
              disabled={saving}
              style={{
                background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
                color: "#ffffff",
                border: "none",
                fontSize: "0.9rem",
              }}
            >
              {saving ? (
                <span className="spinner-border spinner-border-sm" role="status" />
              ) : (
                <Save size={16} />
              )}
              {saving ? "Saving Schedule..." : "Save Availability"}
            </button>
          </div>
        </div>

        {/* Status Strip: Master Switch & Global Settings */}
        <div
          className="card border-0 rounded-4 shadow-sm p-4 mb-4"
          style={{
            background: "var(--premium-surface, #ffffff)",
            border: "1px solid var(--premium-border, rgba(0, 0, 0, 0.08))",
          }}
        >
          <div className="row g-4 align-items-center">
            {/* Master Mentorship Toggle */}
            <div className="col-lg-4 col-md-6 border-md-end" style={{ borderColor: "var(--premium-border, #e2e8f0)" }}>
              <div className="d-flex align-items-center justify-content-between p-2">
                <div>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <span
                      className="rounded-circle d-inline-block"
                      style={{
                        width: "10px",
                        height: "10px",
                        backgroundColor: isAvailable ? "#10b981" : "#94a3b8",
                      }}
                    />
                    <label htmlFor="masterAvailableSwitch" className="fw-bold mb-0 cursor-pointer" style={{ fontSize: "1.05rem" }}>
                      Mentoring Status
                    </label>
                  </div>
                  <p className="text-muted small mb-0">
                    {isAvailable
                      ? "Active — Students can view and book available slots"
                      : "Paused — Bookings temporarily disabled for students"}
                  </p>
                </div>

                <div className="form-check form-switch m-0 ms-3">
                  <input
                    className="form-check-input cursor-pointer"
                    type="checkbox"
                    role="switch"
                    id="masterAvailableSwitch"
                    checked={isAvailable}
                    onChange={(e) => {
                      setIsAvailable(e.target.checked);
                      setHasUnsavedChanges(true);
                      addToast(
                        e.target.checked
                          ? "Mentorship active! Click Save to confirm."
                          : "Mentorship paused. Click Save to confirm.",
                        "info"
                      );
                    }}
                    style={{
                      width: "48px",
                      height: "26px",
                      backgroundColor: isAvailable ? "#10b981" : "#cbd5e1",
                      borderColor: "transparent",
                      cursor: "pointer",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Timezone Selector */}
            <div className="col-lg-4 col-md-6 border-lg-end" style={{ borderColor: "var(--premium-border, #e2e8f0)" }}>
              <div className="d-flex align-items-center gap-2 mb-1">
                <Globe size={16} className="text-primary" />
                <span className="small fw-bold text-uppercase text-muted" style={{ letterSpacing: "0.04em" }}>
                  Your Timezone
                </span>
              </div>
              <select
                className="form-select form-select-sm fw-semibold rounded-3 py-2 px-3 mt-1"
                value={timezone}
                onChange={(e) => {
                  setTimezone(e.target.value);
                  setHasUnsavedChanges(true);
                }}
                style={{
                  border: "1px solid var(--premium-border, #e2e8f0)",
                  background: "var(--premium-surface, #ffffff)",
                  color: "var(--premium-text-main, #0f172a)",
                }}
              >
                {TIMEZONE_OPTIONS.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Session Defaults */}
            <div className="col-lg-4 col-md-12">
              <div className="row g-2">
                <div className="col-6">
                  <span className="small fw-bold text-uppercase text-muted d-block mb-1" style={{ letterSpacing: "0.04em" }}>
                    Default Duration
                  </span>
                  <select
                    className="form-select form-select-sm fw-semibold rounded-3 py-2"
                    value={sessionDuration}
                    onChange={(e) => {
                      setSessionDuration(Number(e.target.value));
                      setHasUnsavedChanges(true);
                    }}
                    style={{
                      border: "1px solid var(--premium-border, #e2e8f0)",
                      background: "var(--premium-surface, #ffffff)",
                      color: "var(--premium-text-main, #0f172a)",
                    }}
                  >
                    <option value={15}>15 Minutes</option>
                    <option value={30}>30 Minutes</option>
                    <option value={45}>45 Minutes</option>
                    <option value={60}>60 Minutes</option>
                    <option value={90}>90 Minutes</option>
                  </select>
                </div>

                <div className="col-6">
                  <span className="small fw-bold text-uppercase text-muted d-block mb-1" style={{ letterSpacing: "0.04em" }}>
                    Buffer Time
                  </span>
                  <select
                    className="form-select form-select-sm fw-semibold rounded-3 py-2"
                    value={bufferMinutes}
                    onChange={(e) => {
                      setBufferMinutes(Number(e.target.value));
                      setHasUnsavedChanges(true);
                    }}
                    style={{
                      border: "1px solid var(--premium-border, #e2e8f0)",
                      background: "var(--premium-surface, #ffffff)",
                      color: "var(--premium-text-main, #0f172a)",
                    }}
                  >
                    <option value={0}>No Buffer</option>
                    <option value={10}>10 Minutes</option>
                    <option value={15}>15 Minutes</option>
                    <option value={20}>20 Minutes</option>
                    <option value={30}>30 Minutes</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="row g-3 mt-3 pt-3 border-top" style={{ borderColor: "var(--premium-border, #e2e8f0)" }}>
            <div className="col-6 col-md-3">
              <div className="p-2 rounded-3" style={{ background: "rgba(99, 102, 241, 0.05)" }}>
                <span className="text-muted small d-block">Active Weekly Hours</span>
                <span className="fw-bold fs-5" style={{ color: "#4f46e5" }}>
                  {stats.timeFormatted}
                </span>
              </div>
            </div>

            <div className="col-6 col-md-3">
              <div className="p-2 rounded-3" style={{ background: "rgba(16, 185, 129, 0.05)" }}>
                <span className="text-muted small d-block">Configured Slots</span>
                <span className="fw-bold fs-5" style={{ color: "#10b981" }}>
                  {stats.enabledSlots} <small className="text-muted fs-6">/ {stats.totalSlots} total</small>
                </span>
              </div>
            </div>

            <div className="col-6 col-md-3">
              <div className="p-2 rounded-3" style={{ background: "rgba(245, 158, 11, 0.05)" }}>
                <span className="text-muted small d-block">Available Days</span>
                <span className="fw-bold fs-5" style={{ color: "#f59e0b" }}>
                  {stats.activeDaysCount} of 7 days
                </span>
              </div>
            </div>

            <div className="col-6 col-md-3">
              <div className="p-2 rounded-3" style={{ background: "rgba(139, 92, 246, 0.05)" }}>
                <span className="text-muted small d-block">Persistence</span>
                <span className="fw-bold fs-6 d-flex align-items-center gap-1 mt-1" style={{ color: "#8b5cf6" }}>
                  <CheckCircle2 size={16} /> MongoDB Atlas Synced
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Add / Edit Availability Form */}
        <div
          ref={formRef}
          className="card border-0 rounded-4 shadow-sm p-4 p-md-4 mb-4"
          style={{
            background: "var(--premium-surface, #ffffff)",
            border: editingSlotId
              ? "2px solid #6366f1"
              : "1px solid var(--premium-border, rgba(0, 0, 0, 0.08))",
            boxShadow: editingSlotId ? "0 8px 30px rgba(99, 102, 241, 0.15)" : undefined,
            transition: "all 0.3s ease",
          }}
        >
          {/* Form Header */}
          <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom" style={{ borderColor: "var(--premium-border, #e2e8f0)" }}>
            <div className="d-flex align-items-center gap-2">
              <div
                className="rounded-3 p-2 d-flex align-items-center justify-content-center"
                style={{
                  background: editingSlotId ? "rgba(99, 102, 241, 0.15)" : "rgba(79, 70, 229, 0.1)",
                  color: "#4f46e5",
                }}
              >
                {editingSlotId ? <Edit2 size={18} /> : <Plus size={18} />}
              </div>
              <div>
                <h5 className="fw-bold mb-0">
                  {editingSlotId ? "Edit Availability Slot" : "Add Availability Slot"}
                </h5>
                <p className="text-muted small mb-0">
                  {editingSlotId
                    ? `Updating slot on ${editingDay?.toUpperCase()}`
                    : "Configure time, day, session type, and meeting duration."}
                </p>
              </div>
            </div>

            {editingSlotId && (
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary rounded-pill px-3 d-flex align-items-center gap-1"
                onClick={resetForm}
              >
                <X size={14} /> Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmitSlot}>
            {/* Weekday Selection Controls */}
            <div className="mb-4">
              <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-2">
                <label className="fw-bold small text-uppercase text-muted mb-0" style={{ letterSpacing: "0.04em" }}>
                  Select Weekday(s) {editingSlotId && <span className="text-primary">(Target Day)</span>}
                </label>
                {!editingSlotId && (
                  <div className="d-flex align-items-center gap-2">
                    <button
                      type="button"
                      className="btn btn-link p-0 small fw-semibold text-decoration-none"
                      style={{ fontSize: "0.8rem", color: "#4f46e5" }}
                      onClick={handleSelectAllWeekdays}
                    >
                      Mon-Fri
                    </button>
                    <span className="text-muted">•</span>
                    <button
                      type="button"
                      className="btn btn-link p-0 small fw-semibold text-decoration-none"
                      style={{ fontSize: "0.8rem", color: "#4f46e5" }}
                      onClick={handleSelectWeekends}
                    >
                      Weekends
                    </button>
                    <span className="text-muted">•</span>
                    <button
                      type="button"
                      className="btn btn-link p-0 small fw-semibold text-decoration-none"
                      style={{ fontSize: "0.8rem", color: "#4f46e5" }}
                      onClick={handleSelectAllDays}
                    >
                      All 7 Days
                    </button>
                  </div>
                )}
              </div>

              {/* Day Pills */}
              <div className="d-flex flex-wrap gap-2">
                {WEEKDAYS.map((w) => {
                  const isSelected = formSelectedDays.includes(w.key);
                  const hasSlots = (schedule[w.key] || []).length > 0;
                  return (
                    <button
                      key={w.key}
                      type="button"
                      onClick={() => toggleFormDay(w.key)}
                      className={`btn btn-sm rounded-pill px-3 py-2 fw-semibold d-flex align-items-center gap-2 transition-all ${
                        isSelected ? "shadow-sm" : ""
                      }`}
                      style={{
                        background: isSelected
                          ? "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)"
                          : "var(--premium-surface-solid, #f1f5f9)",
                        color: isSelected ? "#ffffff" : "var(--premium-text-main, #334155)",
                        border: isSelected ? "1px solid #4f46e5" : "1px solid var(--premium-border, #e2e8f0)",
                        fontSize: "0.85rem",
                      }}
                    >
                      {isSelected ? <Check size={14} /> : null}
                      {w.label}
                      {hasSlots && (
                        <span
                          className="badge rounded-pill"
                          style={{
                            background: isSelected ? "rgba(255, 255, 255, 0.25)" : "rgba(99, 102, 241, 0.15)",
                            color: isSelected ? "#ffffff" : "#4f46e5",
                            fontSize: "0.7rem",
                          }}
                        >
                          {(schedule[w.key] || []).length}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Selectors & Presets */}
            <div className="row g-3 mb-3">
              {/* Start Time */}
              <div className="col-md-3 col-sm-6">
                <label className="fw-bold small text-uppercase text-muted d-block mb-1" style={{ letterSpacing: "0.04em" }}>
                  Start Time (24h)
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-transparent" style={{ borderColor: "var(--premium-border, #e2e8f0)" }}>
                    <Clock size={16} className="text-muted" />
                  </span>
                  <input
                    type="time"
                    required
                    className="form-control fw-bold"
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    style={{
                      border: "1px solid var(--premium-border, #e2e8f0)",
                      background: "var(--premium-surface, #ffffff)",
                      color: "var(--premium-text-main, #0f172a)",
                    }}
                  />
                </div>
                <small className="text-muted d-block mt-1">
                  12h: {formatTime12Hour(formStartTime) || "—"}
                </small>
              </div>

              {/* End Time */}
              <div className="col-md-3 col-sm-6">
                <label className="fw-bold small text-uppercase text-muted d-block mb-1" style={{ letterSpacing: "0.04em" }}>
                  End Time (24h)
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-transparent" style={{ borderColor: "var(--premium-border, #e2e8f0)" }}>
                    <Clock size={16} className="text-muted" />
                  </span>
                  <input
                    type="time"
                    required
                    className={`form-control fw-bold ${formError ? "is-invalid" : ""}`}
                    value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                    style={{
                      border: formError ? "1px solid #ef4444" : "1px solid var(--premium-border, #e2e8f0)",
                      background: "var(--premium-surface, #ffffff)",
                      color: "var(--premium-text-main, #0f172a)",
                    }}
                  />
                </div>
                <small className="text-muted d-block mt-1">
                  12h: {formatTime12Hour(formEndTime) || "—"}
                </small>
              </div>

              {/* Session Type */}
              <div className="col-md-3 col-sm-6">
                <label className="fw-bold small text-uppercase text-muted d-block mb-1" style={{ letterSpacing: "0.04em" }}>
                  Session Type
                </label>
                <select
                  className="form-select fw-semibold"
                  value={formSessionType}
                  onChange={(e) => setFormSessionType(e.target.value)}
                  style={{
                    border: "1px solid var(--premium-border, #e2e8f0)",
                    background: "var(--premium-surface, #ffffff)",
                    color: "var(--premium-text-main, #0f172a)",
                  }}
                >
                  {SESSION_TYPES.map((st) => (
                    <option key={st.value} value={st.value}>
                      {st.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Meeting Duration */}
              <div className="col-md-3 col-sm-6">
                <label className="fw-bold small text-uppercase text-muted d-block mb-1" style={{ letterSpacing: "0.04em" }}>
                  Duration (Minutes)
                </label>
                <select
                  className="form-select fw-semibold"
                  value={formDuration}
                  onChange={(e) => setFormDuration(Number(e.target.value))}
                  style={{
                    border: "1px solid var(--premium-border, #e2e8f0)",
                    background: "var(--premium-surface, #ffffff)",
                    color: "var(--premium-text-main, #0f172a)",
                  }}
                >
                  <option value={15}>15 Minutes</option>
                  <option value={30}>30 Minutes</option>
                  <option value={45}>45 Minutes</option>
                  <option value={60}>60 Minutes</option>
                  <option value={90}>90 Minutes</option>
                  <option value={120}>120 Minutes</option>
                </select>
              </div>
            </div>

            {/* Quick Time Presets Strip */}
            <div className="d-flex align-items-center gap-2 flex-wrap mb-3">
              <span className="small text-muted fw-semibold">Quick Presets:</span>
              {TIME_PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  className="btn btn-sm btn-light rounded-pill px-2 py-1 text-muted fw-semibold"
                  style={{ fontSize: "0.75rem", border: "1px solid var(--premium-border, #e2e8f0)" }}
                  onClick={() => handleApplyPreset(p)}
                >
                  {p.label} ({p.start}-{p.end})
                </button>
              ))}
            </div>

            {/* Optional Notes */}
            <div className="mb-3">
              <label className="fw-bold small text-uppercase text-muted d-block mb-1" style={{ letterSpacing: "0.04em" }}>
                Session Instructions / Notes (Optional)
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Focus on Distributed Systems, please share resume URL in advance."
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                style={{
                  border: "1px solid var(--premium-border, #e2e8f0)",
                  background: "var(--premium-surface, #ffffff)",
                  color: "var(--premium-text-main, #0f172a)",
                }}
              />
            </div>

            {/* Live Error Banner */}
            {formError && (
              <div
                className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 rounded-3 mb-3"
                role="alert"
                style={{ fontSize: "0.85rem" }}
              >
                <AlertCircle size={16} />
                <span>{formError}</span>
              </div>
            )}

            {/* Submit / Reset Actions */}
            <div className="d-flex justify-content-between align-items-center pt-2 border-top" style={{ borderColor: "var(--premium-border, #e2e8f0)" }}>
              <button
                type="button"
                className="btn btn-link text-muted p-0 small text-decoration-none"
                onClick={resetForm}
              >
                Clear / Reset Fields
              </button>

              <div className="d-flex align-items-center gap-2">
                {editingSlotId && (
                  <button
                    type="button"
                    className="btn btn-secondary rounded-pill px-4 py-2 fw-semibold"
                    onClick={resetForm}
                  >
                    Cancel
                  </button>
                )}

                <button
                  type="submit"
                  disabled={!!formError}
                  className="btn rounded-pill px-4 py-2 fw-bold text-white shadow-sm d-flex align-items-center gap-2"
                  style={{
                    background: editingSlotId
                      ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                      : "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
                    border: "none",
                  }}
                >
                  {editingSlotId ? <Check size={16} /> : <Plus size={16} />}
                  {editingSlotId ? "Update Slot" : "Add Slot to Schedule"}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* View Toggle (Calendar vs List) */}
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center gap-2">
            <h4 className="fw-bold mb-0" style={{ fontSize: "1.3rem" }}>
              Weekly Schedule View
            </h4>
            <span
              className="badge rounded-pill px-3 py-1 fw-bold"
              style={{ background: "rgba(99, 102, 241, 0.12)", color: "#6366f1" }}
            >
              {stats.enabledSlots} Active Slot{stats.enabledSlots !== 1 ? "s" : ""}
            </span>
          </div>

          <div
            className="btn-group rounded-pill p-1 shadow-sm"
            role="group"
            style={{ background: "var(--premium-surface, #ffffff)", border: "1px solid var(--premium-border, #e2e8f0)" }}
          >
            <button
              type="button"
              className={`btn btn-sm rounded-pill px-3 py-1 fw-semibold ${
                activeTab === "calendar" ? "btn-primary" : "btn-light text-muted"
              }`}
              onClick={() => setActiveTab("calendar")}
            >
              Calendar View
            </button>
            <button
              type="button"
              className={`btn btn-sm rounded-pill px-3 py-1 fw-semibold ${
                activeTab === "list" ? "btn-primary" : "btn-light text-muted"
              }`}
              onClick={() => setActiveTab("list")}
            >
              Detailed List
            </button>
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }}>
              <span className="visually-hidden">Loading availability...</span>
            </div>
            <p className="text-muted mt-3 fw-semibold">Loading your saved schedule from MongoDB...</p>
          </div>
        ) : activeTab === "calendar" ? (
          /* WEEKLY CALENDAR VIEW (7 COLUMNS) */
          <div className="row g-3">
            {WEEKDAYS.map((day) => {
              const daySlots = schedule[day.key] || [];
              const isTargetEditingDay = editingDay === day.key;

              return (
                <div key={day.key} className="col-xl col-md-4 col-sm-6">
                  <div
                    className="card h-100 border-0 rounded-4 shadow-sm"
                    style={{
                      background: "var(--premium-surface, #ffffff)",
                      border: isTargetEditingDay
                        ? "2px solid #6366f1"
                        : "1px solid var(--premium-border, rgba(0, 0, 0, 0.08))",
                      minHeight: "360px",
                    }}
                  >
                    {/* Day Column Header */}
                    <div
                      className="p-3 border-bottom d-flex align-items-center justify-content-between"
                      style={{
                        borderColor: "var(--premium-border, #e2e8f0)",
                        background: "rgba(99, 102, 241, 0.03)",
                      }}
                    >
                      <div>
                        <span className="fw-bold d-block" style={{ fontSize: "0.95rem" }}>
                          {day.label}
                        </span>
                        <span className="text-muted small" style={{ fontSize: "0.75rem" }}>
                          {daySlots.filter((s) => s.enabled).length} active
                        </span>
                      </div>

                      <button
                        type="button"
                        className="btn btn-sm btn-light rounded-circle p-1 text-primary hover-scale"
                        title={`Add slot to ${day.label}`}
                        onClick={() => handleQuickAddForDay(day.key)}
                        style={{ width: "28px", height: "28px" }}
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    {/* Slots List in Column */}
                    <div className="p-2 d-flex flex-column gap-2 flex-grow-1">
                      {daySlots.length === 0 ? (
                        <div className="text-center py-4 my-auto px-2">
                          <p className="text-muted small mb-2">No slots configured</p>
                          <button
                            type="button"
                            className="btn btn-sm btn-link text-primary p-0 text-decoration-none fw-semibold"
                            style={{ fontSize: "0.8rem" }}
                            onClick={() => handleQuickAddForDay(day.key)}
                          >
                            + Add slot
                          </button>
                        </div>
                      ) : (
                        daySlots.map((slot) => {
                          const isBeingEdited = editingSlotId === slot.id;
                          const typeMeta =
                            SESSION_TYPES.find((st) => st.value === slot.sessionType) || SESSION_TYPES[0];

                          return (
                            <div
                              key={slot.id}
                              className="p-2 rounded-3 transition-all position-relative"
                              style={{
                                background: slot.enabled
                                  ? "var(--premium-surface-solid, #ffffff)"
                                  : "rgba(148, 163, 184, 0.1)",
                                border: isBeingEdited
                                  ? "2px solid #6366f1"
                                  : "1px solid var(--premium-border, #e2e8f0)",
                                borderLeft: `4px solid ${slot.enabled ? typeMeta.color : "#94a3b8"}`,
                                opacity: slot.enabled ? 1 : 0.65,
                              }}
                            >
                              {/* Slot Time */}
                              <div className="d-flex align-items-center justify-content-between mb-1">
                                <span className="fw-bold small d-flex align-items-center gap-1" style={{ fontSize: "0.8rem" }}>
                                  <Clock size={12} className="text-muted" />
                                  {formatTime12Hour(slot.start)} - {formatTime12Hour(slot.end)}
                                </span>

                                {/* Switch */}
                                <div className="form-check form-switch m-0 p-0">
                                  <input
                                    className="form-check-input cursor-pointer m-0"
                                    type="checkbox"
                                    role="switch"
                                    checked={slot.enabled}
                                    onChange={() => handleToggleSlot(day.key, slot.id)}
                                    title={slot.enabled ? "Disable Slot" : "Enable Slot"}
                                    style={{
                                      width: "28px",
                                      height: "16px",
                                      backgroundColor: slot.enabled ? "#10b981" : "#cbd5e1",
                                      borderColor: "transparent",
                                    }}
                                  />
                                </div>
                              </div>

                              {/* Session Type Badge */}
                              <div className="d-flex align-items-center gap-1 mb-1 flex-wrap">
                                <span
                                  className="badge rounded-pill px-2 py-0 fw-semibold"
                                  style={{
                                    fontSize: "0.65rem",
                                    background: `${typeMeta.color}15`,
                                    color: typeMeta.color,
                                  }}
                                >
                                  {slot.sessionType || "1:1 Mentorship"}
                                </span>
                                <span
                                  className="badge rounded-pill bg-light text-muted px-2 py-0"
                                  style={{ fontSize: "0.65rem" }}
                                >
                                  {slot.duration || 30}m
                                </span>
                              </div>

                              {/* Slot Notes (if any) */}
                              {slot.notes && (
                                <p
                                  className="text-muted mb-2 text-truncate"
                                  style={{ fontSize: "0.7rem", maxWidth: "160px" }}
                                  title={slot.notes}
                                >
                                  {slot.notes}
                                </p>
                              )}

                              {/* Action Buttons (Edit / Delete) */}
                              <div className="d-flex justify-content-end gap-1 pt-1 border-top" style={{ borderColor: "var(--premium-border, #f1f5f9)" }}>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-link p-1 text-primary"
                                  title="Edit Slot"
                                  onClick={() => handleStartEdit(day.key, slot)}
                                >
                                  <Edit2 size={13} />
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-link p-1 text-danger"
                                  title="Delete Slot"
                                  onClick={() => handleDeleteSlot(day.key, slot.id)}
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* DETAILED LIST VIEW */
          <div
            className="card border-0 rounded-4 shadow-sm p-4"
            style={{
              background: "var(--premium-surface, #ffffff)",
              border: "1px solid var(--premium-border, rgba(0, 0, 0, 0.08))",
            }}
          >
            <div className="d-flex flex-column gap-4">
              {WEEKDAYS.map((day) => {
                const daySlots = schedule[day.key] || [];

                return (
                  <div key={day.key} className="border-bottom pb-3" style={{ borderColor: "var(--premium-border, #e2e8f0)" }}>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <span className="fw-bold fs-6">{day.label}</span>
                        <span
                          className="badge rounded-pill px-2 py-0"
                          style={{ background: "rgba(99, 102, 241, 0.12)", color: "#6366f1", fontSize: "0.75rem" }}
                        >
                          {daySlots.length} slot{daySlots.length !== 1 ? "s" : ""}
                        </span>
                      </div>

                      <button
                        type="button"
                        className="btn btn-sm btn-link text-primary p-0 fw-semibold text-decoration-none"
                        onClick={() => handleQuickAddForDay(day.key)}
                      >
                        + Add Slot
                      </button>
                    </div>

                    {daySlots.length === 0 ? (
                      <p className="text-muted small mb-0 fst-italic">No availability configured for {day.label}.</p>
                    ) : (
                      <div className="d-flex flex-column gap-2">
                        {daySlots.map((slot) => {
                          const typeMeta =
                            SESSION_TYPES.find((st) => st.value === slot.sessionType) || SESSION_TYPES[0];

                          return (
                            <div
                              key={slot.id}
                              className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 p-3 rounded-3"
                              style={{
                                background: slot.enabled ? "var(--premium-surface-solid, #f8fafc)" : "rgba(148, 163, 184, 0.1)",
                                border: "1px solid var(--premium-border, #e2e8f0)",
                                borderLeft: `4px solid ${slot.enabled ? typeMeta.color : "#94a3b8"}`,
                              }}
                            >
                              <div className="d-flex align-items-center gap-3 flex-wrap">
                                <span className="fw-bold" style={{ fontSize: "0.95rem" }}>
                                  {formatTime12Hour(slot.start)} - {formatTime12Hour(slot.end)}
                                </span>
                                <span
                                  className="badge rounded-pill px-2 py-1"
                                  style={{
                                    background: `${typeMeta.color}15`,
                                    color: typeMeta.color,
                                    fontSize: "0.75rem",
                                  }}
                                >
                                  {slot.sessionType}
                                </span>
                                <span className="badge rounded-pill bg-light text-muted px-2 py-1" style={{ fontSize: "0.75rem" }}>
                                  {slot.duration || 30} mins
                                </span>
                                {slot.notes && (
                                  <span className="text-muted small fst-italic">
                                    "{slot.notes}"
                                  </span>
                                )}
                              </div>

                              <div className="d-flex align-items-center gap-3">
                                {/* Switch */}
                                <div className="form-check form-switch m-0">
                                  <input
                                    className="form-check-input cursor-pointer"
                                    type="checkbox"
                                    role="switch"
                                    checked={slot.enabled}
                                    onChange={() => handleToggleSlot(day.key, slot.id)}
                                    style={{
                                      width: "36px",
                                      height: "20px",
                                      backgroundColor: slot.enabled ? "#10b981" : "#cbd5e1",
                                      borderColor: "transparent",
                                    }}
                                  />
                                </div>

                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-primary rounded-pill px-3 py-1 d-flex align-items-center gap-1"
                                  onClick={() => handleStartEdit(day.key, slot)}
                                >
                                  <Edit2 size={13} /> Edit
                                </button>

                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-danger rounded-pill px-3 py-1 d-flex align-items-center gap-1"
                                  onClick={() => handleDeleteSlot(day.key, slot.id)}
                                >
                                  <Trash2 size={13} /> Delete
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Bottom Floating Save Banner when there are unsaved changes */}
        {hasUnsavedChanges && (
          <div
            className="card border-0 rounded-4 shadow-lg p-3 mt-4 sticky-bottom d-flex flex-row justify-content-between align-items-center"
            style={{
              background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
              color: "#ffffff",
              bottom: "20px",
              zIndex: 1000,
            }}
          >
            <div className="d-flex align-items-center gap-3">
              <Zap size={22} className="text-warning animate-pulse" />
              <div>
                <span className="fw-bold d-block" style={{ fontSize: "0.95rem" }}>
                  You have unsaved changes in your availability schedule!
                </span>
                <span className="text-white-50 small">
                  Changes will not be visible to students until saved to MongoDB.
                </span>
              </div>
            </div>

            <button
              type="button"
              className="btn rounded-pill px-4 py-2 fw-bold text-white shadow-sm d-flex align-items-center gap-2"
              disabled={saving}
              onClick={handleSaveAll}
              style={{
                background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
                border: "none",
              }}
            >
              {saving ? <span className="spinner-border spinner-border-sm" /> : <Save size={16} />}
              {saving ? "Saving..." : "Save All Changes"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
