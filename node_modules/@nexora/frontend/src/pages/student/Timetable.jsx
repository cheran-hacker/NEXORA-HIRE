import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext.jsx";
import { timetableService } from "../../services/api";
const Timetable = () => {
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState({
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
  });
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const [activeDay, setActiveDay] = useState("Monday");
  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const res = await timetableService.getTimetable();
        setSchedule(
          res.data.data || {
            Monday: [],
            Tuesday: [],
            Wednesday: [],
            Thursday: [],
            Friday: [],
          },
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTimetable();
  }, []);
  if (loading) {
    return (
      <div className="p-5 text-center">
        <span className="spinner-border text-primary" />
      </div>
    );
  }
  return (
    <div className="container-fluid py-4 px-xl-5">
      {" "}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5"
      >
        {" "}
        <h2
          className="fw-black mb-1 d-flex align-items-center gap-3"
          style={{ color: "var(--text)" }}
        >
          {" "}
          <Calendar size={32} className="text-primary" /> Academic
          Timetable{" "}
        </h2>{" "}
        <p className="text-muted fw-medium">
          View your weekly class schedule and locations.
        </p>{" "}
      </motion.div>{" "}
      <div className="bento-card p-4">
        {" "}
        {/* Day Tabs */}{" "}
        <div
          className="d-flex flex-wrap gap-2 mb-4 pb-3 border-bottom"
          style={{ borderColor: "var(--border)" }}
        >
          {" "}
          {days.map((day) => (
            <button
              key={day}
              className={`btn fw-bold rounded-pill px-4 ${activeDay === day ? "btn-primary shadow" : "btn-outline-secondary border-0"}`}
              onClick={() => setActiveDay(day)}
            >
              {" "}
              {day}{" "}
            </button>
          ))}{" "}
        </div>{" "}
        {/* Schedule List */}{" "}
        <div className="d-flex flex-column gap-3">
          {" "}
          {schedule[activeDay].length === 0 ? (
            <div className="text-center p-5 text-muted fw-bold">
              {" "}
              <Calendar size={48} className="mb-3 opacity-50" />{" "}
              <p>No classes scheduled for {activeDay}. Enjoy your day!</p>{" "}
            </div>
          ) : (
            schedule[activeDay].map((cls, idx) => (
              <motion.div
                key={cls._id || cls.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-4 rounded-4 border d-flex justify-content-between align-items-center hover-glow"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--surface-2)",
                }}
              >
                {" "}
                <div className="d-flex align-items-center gap-4">
                  {" "}
                  <div
                    className="text-center"
                    style={{
                      minWidth: "120px",
                      borderRight: "2px solid var(--border)",
                      paddingRight: "1rem",
                    }}
                  >
                    {" "}
                    <h5 className="fw-black text-primary mb-1">
                      {cls.time.split("-")[0].trim()}
                    </h5>{" "}
                    <small className="text-muted fw-bold text-uppercase">
                      {cls.time.split("-")[1].trim()}
                    </small>{" "}
                  </div>{" "}
                  <div>
                    {" "}
                    <h5 className="fw-bold mb-1">{cls.course}</h5>{" "}
                    <div className="d-flex gap-3 text-muted small fw-semibold">
                      {" "}
                      <span className="d-flex align-items-center gap-1">
                        <MapPin size={14} /> {cls.room}
                      </span>{" "}
                      <span className="d-flex align-items-center gap-1 text-info">
                        <Users size={14} /> {cls.type}
                      </span>{" "}
                    </div>{" "}
                  </div>{" "}
                </div>{" "}
                <span className="badge bg-secondary-subtle text-secondary rounded-pill">
                  {cls.code}
                </span>{" "}
              </motion.div>
            ))
          )}{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
};
export default Timetable;
