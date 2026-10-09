import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  BookOpen,
  Star,
  Building2,
  Briefcase,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import api from "../../services/api.js";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
export default function AlumniDirectory() {
  const { user } = useAuth();
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMatchedMode, setIsMatchedMode] = useState(false);
  const [selectedAlum, setSelectedAlum] = useState(null);
  useEffect(() => {
    fetchDirectory();
  }, []);
  const fetchDirectory = async () => {
    try {
      setLoading(true);
      if (user?.role === 'Student') {
        const res = await api.get("/student/matched-alumni");
        setAlumni(res.data || []);
        setIsMatchedMode(true);
      } else {
        const res = await api.get("/alumni/directory");
        setAlumni(res.data.data || []);
      }
    } catch (err) {
      addToast("Failed to load alumni directory", "error");
    } finally {
      setLoading(false);
    }
  };
  const handleBook = async (e) => {
    e.preventDefault();
    try {
      await api.post("/alumni/mentorship/book", {
        mentorId: selectedAlum.id,
        scheduledDate: new Date().toISOString(), // In a real app this comes from the date picker topic: 'General Career Guidance', durationMinutes: 30
      });
      addToast("Mentorship requested successfully!", "success");
      setSelectedAlum(null);
    } catch (err) {
      addToast(
        err.response?.data?.message || "Failed to request mentorship",
        "error",
      );
    }
  };
  const filteredAlumni = alumni.filter(
    (alum) =>
      alum.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alum.company?.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  return (
    <div className="container-fluid space-y-4">
      {" "}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
        {" "}
        <div>
          {" "}
          <h2
            className="fw-black mb-1"
            style={{ color: "var(--text)", fontSize: "2rem" }}
          >
            Alumni Network
          </h2>{" "}
          <p
            className="fw-medium mb-0"
            style={{ color: "var(--text-secondary)" }}
          >
            Connect with graduates for mentorship and guidance.
          </p>{" "}
        </div>{" "}
        <div className="d-flex align-items-center gap-3 w-100 w-md-auto">
          {" "}
          <div
            className="position-relative flex-grow-1"
            style={{ maxWidth: "300px" }}
          >
            {" "}
            <Search
              className="position-absolute text-muted"
              size={18}
              style={{
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
              }}
            />{" "}
            <input
              type="text"
              placeholder="Search by name or company..."
              className="form-control bg-transparent rounded-pill ps-5"
              style={{ color: "var(--text)", borderColor: "var(--border)" }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />{" "}
          </div>{" "}
          <button
            onClick={() =>
              addToast(
                "Filter by company, graduation year, or skills using the search bar above.",
                "info",
              )
            }
            className="btn btn-outline-light d-flex align-items-center gap-2 rounded-4"
          >
            {" "}
            <Filter size={18} /> Filters{" "}
          </button>{" "}
        </div>{" "}
      </div>{" "}

      {isMatchedMode && alumni.length > 0 && (
        <div className="alert alert-info d-flex align-items-center gap-2 mb-4 rounded-4" style={{ background: "rgba(139, 92, 246, 0.1)", color: "var(--primary)", border: "1px solid rgba(139, 92, 246, 0.2)" }}>
          <Star size={20} className="text-primary" />
          <div className="fw-medium">Showing Alumni explicitly matched to your Target Career Roles.</div>
        </div>
      )}

      {loading ? (
        <div className="d-flex justify-content-center p-5">
          {" "}
          <div className="spinner-border text-primary"></div>{" "}
        </div>
      ) : (
        <div className="row g-4 mt-2">
          {" "}
          {filteredAlumni.map((alum, idx) => (
            <div className="col-12 col-md-6 col-xl-4" key={alum.id}>
              {" "}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bento-card p-4 d-flex flex-column h-100 hover-glow cursor-pointer"
                onClick={() => setSelectedAlum(alum)}
              >
                {" "}
                <div className="d-flex align-items-start justify-content-between mb-3">
                  {" "}
                  <div className="d-flex align-items-center gap-3">
                    {" "}
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm overflow-hidden"
                      style={{
                        width: "56px",
                        height: "56px",
                        background:
                          "linear-gradient(135deg, var(--primary), var(--purple))",
                        color: "#fff",
                        fontSize: "1.25rem",
                      }}
                    >
                      {" "}
                      {alum.avatar ? (
                        <img
                          src={alum.avatar}
                          alt={alum.name}
                          className="w-100 h-100 object-fit-cover"
                        />
                      ) : (
                        alum.name?.charAt(0)
                      )}{" "}
                    </div>{" "}
                    <div>
                      {" "}
                      <h5
                        className="fw-bold mb-1"
                        style={{ color: "var(--text)" }}
                      >
                        {alum.name}
                      </h5>{" "}
                      <span
                        className="badge rounded-pill"
                        style={{
                          background: "rgba(var(--primary-rgb), 0.1)",
                          color: "var(--primary)",
                        }}
                      >
                        Class of {alum.graduationYear}
                      </span>{" "}
                    </div>{" "}
                  </div>{" "}
                  {alum.mentorshipAvailable && (
                    <div
                      className="badge rounded-pill px-2 py-1 fw-bold text-uppercase d-flex align-items-center gap-1"
                      style={{
                        background: "rgba(var(--success-rgb), 0.2)",
                        color: "var(--success)",
                      }}
                    >
                      {" "}
                      <Star size={12} className="fill-success" /> Mentor{" "}
                    </div>
                  )}{" "}
                </div>{" "}
                <div className="d-flex flex-column gap-2 mb-4 flex-grow-1">
                  {" "}
                  <div
                    className="d-flex align-items-center gap-2 small fw-medium"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {" "}
                    <Briefcase size={16} /> <span>{alum.title}</span>{" "}
                  </div>{" "}
                  <div
                    className="d-flex align-items-center gap-2 small fw-medium"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {" "}
                    <Building2 size={16} /> <span>{alum.company}</span>{" "}
                  </div>{" "}
                  {alum.expertise && alum.expertise.length > 0 && (
                    <div className="pt-2 d-flex flex-wrap gap-2">
                      {" "}
                      {alum.expertise.slice(0, 3).map((skill, i) => (
                        <span
                          key={i}
                          className="badge rounded-pill fw-medium"
                          style={{
                            background: "var(--surface-2)",
                            color: "var(--text-secondary)",
                            border: "1px solid var(--border)",
                          }}
                        >
                          {" "}
                          {skill}{" "}
                        </span>
                      ))}{" "}
                      {alum.expertise.length > 3 && (
                        <span className="small fw-bold text-muted">
                          +{alum.expertise.length - 3} more
                        </span>
                      )}{" "}
                    </div>
                  )}{" "}
                </div>{" "}
                <button
                  onClick={() => {
                    addToast(`Viewing ${al.name}'s profile`, "info");
                    window.open(`/alumni/profile/${al._id || al.id}`, "_self");
                  }}
                  className="btn rounded-pill w-100 fw-bold hover-lift d-flex align-items-center justify-content-center gap-2"
                  style={{
                    background: "var(--surface-2)",
                    color: "var(--text)",
                    border: "1px solid var(--border)",
                  }}
                >
                  {" "}
                  View Profile <ChevronRight size={16} />{" "}
                </button>{" "}
              </motion.div>{" "}
            </div>
          ))}{" "}
        </div>
      )}{" "}
      {/* Quick Booking Modal */}{" "}
      {selectedAlum && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{ background: "rgba(0,0,0,0.02)", zIndex: 1050 }}
        >
          {" "}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bento-card p-4 w-100 shadow-lg"
            style={{
              maxWidth: "450px",
              border: "1px solid rgba(var(--primary-rgb), 0.3)",
            }}
          >
            {" "}
            <div className="d-flex justify-content-between align-items-start mb-4">
              {" "}
              <h3 className="h4 fw-bold m-0" style={{ color: "var(--text)" }}>
                Book Mentorship
              </h3>{" "}
              <button
                onClick={() => setSelectedAlum(null)}
                className="btn-close btn-close-white"
                aria-label="Close"
              ></button>{" "}
            </div>{" "}
            <div
              className="d-flex align-items-center gap-3 mb-4 p-3 rounded-3"
              style={{
                background: "rgba(0,0,0,0.05)",
                border: "1px solid var(--border)",
              }}
            >
              {" "}
              <div
                className="rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm text-foreground"
                style={{
                  width: "48px",
                  height: "48px",
                  background:
                    "linear-gradient(135deg, var(--primary), var(--purple))",
                }}
              >
                {" "}
                {selectedAlum.name?.charAt(0)}{" "}
              </div>{" "}
              <div>
                {" "}
                <div className="fw-bold" style={{ color: "var(--text)" }}>
                  {selectedAlum.name}
                </div>{" "}
                <div
                  className="small fw-medium"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {selectedAlum.title} @ {selectedAlum.company}
                </div>{" "}
              </div>{" "}
            </div>{" "}
            <form onSubmit={handleBook} className="d-flex flex-column gap-3">
              {" "}
              <div>
                {" "}
                <label
                  className="form-label small fw-bold"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Topic
                </label>{" "}
                <input
                  type="text"
                  className="form-control bg-card text-foreground border"
                  defaultValue="General Career Guidance"
                  style={{ background: "rgba(0,0,0,0.02) !important" }}
                />{" "}
              </div>{" "}
              <div>
                {" "}
                <label
                  className="form-label small fw-bold"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Date
                </label>{" "}
                <input
                  type="date"
                  className="form-control bg-card text-foreground border"
                  style={{ background: "rgba(0,0,0,0.02) !important" }}
                />{" "}
              </div>{" "}
              <button
                type="submit"
                className="btn w-100 fw-bold mt-2"
                style={{
                  background: "var(--primary)",
                  color: "#fff",
                  border: "none",
                }}
              >
                {" "}
                Request Session{" "}
              </button>{" "}
            </form>{" "}
          </motion.div>{" "}
        </div>
      )}{" "}
    </div>
  );
}

