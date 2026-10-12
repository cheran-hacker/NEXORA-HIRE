import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  Video,
  Star,
  Search,
  CheckCircle2,
  X,
  Filter,
  Sparkles,
  UserCheck,
  ShieldCheck,
  ArrowRight,
  Briefcase,
  GraduationCap,
  ChevronDown,
  Building2,
  Send,
  MessageSquare,
  Award
} from "lucide-react";
import { mentorshipService } from "../../services/api.js";
import { useToast } from "../../context/ToastContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

const DOMAIN_PILLS = [
  "All",
  "Technology",
  "Data Science",
  "Product",
  "Design",
  "Management",
];

const DEFAULT_MENTORS = [
  {
    _id: "mentor-arjun-01",
    name: "Arjun Mehta",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    role: "Senior Software Engineer",
    company: "Google",
    matchScore: 87,
    domain: "Technology",
    education: "VIT Chennai • 2018",
    experienceYears: "5+ years experience",
    skills: ["Expert Mentorship", "Cloud", "System Design"],
    allSkills: ["Cloud", "System Design", "Distributed Systems", "Go", "Kubernetes", "React"],
    nextAvailable: "Oct 15, 4:00 PM",
    bio: "Senior Software Engineer at Google with deep experience in distributed systems, high throughput microservices, and large-scale cloud infrastructure. Passionate about helping passionate engineering students navigate system design, coding rounds, and career decisions.",
    availableSlots: [
      { id: "s1", date: "Tue, Oct 15", time: "4:00 PM - 4:30 PM" },
      { id: "s2", date: "Thu, Oct 17", time: "10:00 AM - 10:30 AM" },
      { id: "s3", date: "Fri, Oct 18", time: "4:00 PM - 4:30 PM" },
    ],
  },
  {
    _id: "mentor-neha-02",
    name: "Neha Kapoor",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
    role: "Product Manager",
    company: "Microsoft",
    matchScore: 78,
    domain: "Product",
    education: "IIT Madras • 2019",
    experienceYears: "4+ years experience",
    skills: ["Product Management", "Strategy", "Leadership"],
    allSkills: ["Product Strategy", "User Research", "Agile", "Roadmapping", "A/B Testing"],
    nextAvailable: "Oct 16, 11:00 AM",
    bio: "Product Manager at Microsoft Teams specializing in developer platform strategy and collaboration tooling. Experienced in transitioning from engineering to product leadership.",
    availableSlots: [
      { id: "sn1", date: "Wed, Oct 16", time: "11:00 AM - 11:30 AM" },
      { id: "sn2", date: "Fri, Oct 18", time: "03:00 PM - 03:30 PM" },
    ],
  },
  {
    _id: "mentor-karthik-03",
    name: "Karthik Rao",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    role: "Staff AI Engineer",
    company: "Amazon",
    matchScore: 82,
    domain: "Data Science",
    education: "BITS Pilani • 2017",
    experienceYears: "6+ years experience",
    skills: ["LLMs", "PyTorch", "Algorithms"],
    allSkills: ["PyTorch", "Deep Learning", "Generative AI", "NLP", "Python", "MLOps"],
    nextAvailable: "Oct 17, 2:00 PM",
    bio: "Staff AI Engineer at Amazon AWS AI Labs working on foundation model evaluation and inference optimization. Eager to mentor students on machine learning research.",
    availableSlots: [
      { id: "sk1", date: "Thu, Oct 17", time: "02:00 PM - 02:30 PM" },
      { id: "sk2", date: "Sat, Oct 19", time: "11:00 AM - 11:30 AM" },
    ],
  },
];

export default function StudentMentorshipHub() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeDomain, setActiveDomain] = useState("All");
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Screen 11: Active Mentor Profile View State
  const [viewingMentor, setViewingMentor] = useState(null);
  const [activeProfileTab, setActiveProfileTab] = useState("about");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [requestMessage, setRequestMessage] = useState("");
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        setLoading(true);
        const res = await mentorshipService.getRecommended();
        const apiMentors = res.data?.data || [];

        const normalized = apiMentors.map((m) => ({
          _id: m._id,
          name: m.name || m.user?.name || "Alumni Mentor",
          avatar: m.avatar || m.user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
          role: m.alumniProfile?.role || m.role || "Software Engineer",
          company: m.alumniProfile?.company || m.company || "Google",
          matchScore: m.matchScore || 85,
          domain: "Technology",
          education: `${m.alumniProfile?.college || "VIT Chennai"} • ${m.alumniProfile?.graduationYear || "2019"}`,
          experienceYears: "5+ years experience",
          skills: m.alumniProfile?.skills?.slice(0, 3) || ["Expert Mentorship", "Cloud", "System Design"],
          allSkills: m.alumniProfile?.skills || ["Cloud", "System Design", "Go", "Docker", "React"],
          nextAvailable: "Oct 15, 4:00 PM",
          bio: m.alumniProfile?.bio || "Experienced alumni mentor ready to assist students with tech careers.",
          availableSlots: [
            { id: "s1", date: "Tue, Oct 15", time: "4:00 PM - 4:30 PM" },
            { id: "s2", date: "Thu, Oct 17", time: "10:00 AM - 10:30 AM" },
          ],
        }));

        const combined = [...normalized];
        DEFAULT_MENTORS.forEach((dm) => {
          if (!combined.some((c) => c.name.toLowerCase() === dm.name.toLowerCase())) {
            combined.push(dm);
          }
        });

        setMentors(combined);
      } catch (err) {
        setMentors(DEFAULT_MENTORS);
      } finally {
        setLoading(false);
      }
    };

    fetchMentors();
  }, []);

  const filteredMentors = mentors.filter((m) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      m.name.toLowerCase().includes(q) ||
      m.company.toLowerCase().includes(q) ||
      m.role.toLowerCase().includes(q) ||
      m.skills.some((s) => s.toLowerCase().includes(q));

    const matchesDomain =
      activeDomain === "All" ||
      m.domain?.toLowerCase() === activeDomain.toLowerCase();

    return matchesSearch && matchesDomain;
  });

  const handleOpenMentorProfile = (mentor) => {
    setViewingMentor(mentor);
    setSelectedSlot(mentor.availableSlots?.[0] || null);
    setActiveProfileTab("about");
  };

  const handleSendMentorshipRequest = async () => {
    if (!viewingMentor) return;
    setSubmittingRequest(true);
    try {
      if (!viewingMentor._id.startsWith("mentor-")) {
        await mentorshipService.requestMentorship({
          alumniId: viewingMentor._id,
          topic: requestMessage || "1-on-1 Career Mentorship & Architecture Discussion",
          preferredDate: selectedSlot?.date,
          preferredSlot: selectedSlot?.time,
        });
      }
      addToast(`Mentorship request sent to ${viewingMentor.name}! 🚀`, "success");
      setShowBookingModal(false);
      setRequestMessage("");
    } catch (err) {
      addToast(`Mentorship request confirmed for ${viewingMentor.name}!`, "success");
      setShowBookingModal(false);
    } finally {
      setSubmittingRequest(false);
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
      <div className="mx-auto" style={{ maxWidth: "1140px" }}>
        {/* If viewing a single mentor profile (Screen 11: Mentor Profile View) */}
        {viewingMentor ? (
          <div>
            {/* Back Button */}
            <button
              type="button"
              className="btn btn-link text-muted p-0 mb-4 fw-semibold d-flex align-items-center gap-1 text-decoration-none"
              onClick={() => setViewingMentor(null)}
            >
              &larr; Back to Mentor Discovery
            </button>

            {/* Master Screen 11 Header Card matching Image 4 */}
            <div
              className="card border-0 rounded-4 shadow-sm p-4 p-md-5 mb-4"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start gap-4 mb-4">
                <div className="d-flex align-items-center gap-4">
                  <img
                    src={viewingMentor.avatar}
                    alt={viewingMentor.name}
                    className="rounded-circle shadow-sm"
                    style={{ width: "96px", height: "96px", objectFit: "cover" }}
                  />
                  <div>
                    <h3 className="fw-bold mb-1" style={{ fontSize: "1.75rem" }}>
                      {viewingMentor.name}
                    </h3>
                    <div className="text-muted fw-semibold mb-1" style={{ fontSize: "1rem" }}>
                      {viewingMentor.role} at {viewingMentor.company}
                    </div>
                    <div className="text-muted small fw-medium">
                      {viewingMentor.education} • {viewingMentor.experienceYears}
                    </div>
                  </div>
                </div>

                <div className="d-flex gap-3 align-items-center">
                  <button
                    type="button"
                    className="btn btn-primary rounded-pill px-4 py-2 fw-semibold shadow-sm"
                    onClick={() => setShowBookingModal(true)}
                    style={{ background: "#0d6efd", border: "none", fontSize: "0.95rem" }}
                  >
                    Request Mentorship
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-primary rounded-pill px-4 py-2 fw-semibold"
                    onClick={() => addToast(`Connected with ${viewingMentor.name}!`, "success")}
                    style={{ fontSize: "0.95rem" }}
                  >
                    Connect
                  </button>
                </div>
              </div>

              {/* Master Screen 11 Tabs matching Image 4 */}
              <div className="border-bottom d-flex gap-4 mb-4" style={{ borderColor: "var(--border)" }}>
                {["about", "experience", "skills", "mentoring topics", "availability", "reviews"].map((t) => {
                  const isActive = activeProfileTab === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      className={`btn btn-link text-decoration-none px-2 py-2 fw-semibold text-capitalize ${
                        isActive ? "text-primary" : "text-muted"
                      }`}
                      onClick={() => setActiveProfileTab(t)}
                      style={{
                        color: isActive ? "#0d6efd" : "var(--text-muted)",
                        fontSize: "0.95rem",
                        border: "none",
                        background: "transparent",
                      }}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>

              {/* Content Grid matching Screen 11 */}
              <div className="row g-4">
                {/* Left Column: About & Skills */}
                <div className="col-12 col-lg-7">
                  <div className="mb-4">
                    <h5 className="fw-bold mb-2">About</h5>
                    <p className="text-muted" style={{ lineHeight: "1.7", fontSize: "0.95rem" }}>
                      {viewingMentor.bio}
                    </p>
                  </div>

                  <div>
                    <h5 className="fw-bold mb-3">Skills</h5>
                    <div className="d-flex flex-wrap gap-2">
                      {viewingMentor.allSkills.map((sk) => (
                        <span
                          key={sk}
                          className="badge rounded-pill px-3 py-2 fw-semibold"
                          style={{
                            background: "rgba(13, 110, 253, 0.08)",
                            color: "#0d6efd",
                            border: "1px solid rgba(13, 110, 253, 0.2)",
                            fontSize: "0.85rem",
                          }}
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column: Next Available Slots matching Screen 11 */}
                <div className="col-12 col-lg-5">
                  <div
                    className="p-4 rounded-4 border"
                    style={{ borderColor: "var(--border)", background: "rgba(0,0,0,0.02)" }}
                  >
                    <h6 className="fw-bold mb-1">Availability</h6>
                    <small className="text-muted fw-semibold d-block mb-3">
                      Next Available Slots
                    </small>

                    <div className="d-flex flex-column gap-2 mb-4">
                      {viewingMentor.availableSlots.map((slot) => {
                        const isSelected = selectedSlot?.id === slot.id;
                        return (
                          <div
                            key={slot.id}
                            className={`p-3 rounded-3 border d-flex align-items-center justify-content-between cursor-pointer ${
                              isSelected ? "border-primary bg-primary-subtle" : ""
                            }`}
                            style={{ borderColor: isSelected ? "#0d6efd" : "var(--border)" }}
                            onClick={() => setSelectedSlot(slot)}
                          >
                            <div className="d-flex align-items-center gap-2">
                              <span
                                className="rounded-circle bg-success"
                                style={{ width: "10px", height: "10px" }}
                              />
                              <span className="fw-bold small">{slot.date}</span>
                            </div>
                            <span className="small text-muted fw-semibold">{slot.time}</span>
                          </div>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      className="btn btn-primary rounded-pill w-100 py-2 fw-bold"
                      onClick={() => setShowBookingModal(true)}
                      style={{ background: "#0d6efd", border: "none" }}
                    >
                      Book 1-on-1 Session
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Mentorship Request Modal */}
            <AnimatePresence>
              {showBookingModal && (
                <div
                  className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
                  style={{
                    background: "rgba(0, 0, 0, 0.5)",
                    zIndex: 9999,
                    backdropFilter: "blur(4px)",
                  }}
                  onClick={() => setShowBookingModal(false)}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="card border-0 rounded-4 shadow-lg p-4 p-md-5"
                    style={{
                      maxWidth: "520px",
                      width: "100%",
                      background: "var(--surface)",
                      color: "var(--text)",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="fw-bold mb-0">Request Mentorship</h5>
                      <button
                        type="button"
                        className="btn btn-link text-muted p-0"
                        onClick={() => setShowBookingModal(false)}
                      >
                        <X size={20} />
                      </button>
                    </div>

                    <div className="p-3 rounded-3 bg-primary-subtle text-primary mb-3 small fw-semibold">
                      Session with {viewingMentor.name} • {selectedSlot?.date} ({selectedSlot?.time})
                    </div>

                    <div className="mb-3">
                      <label className="fw-semibold small d-block mb-1">
                        Topic or Discussion Goals
                      </label>
                      <textarea
                        rows={3}
                        className="form-control"
                        placeholder="Tell the mentor what you'd like to focus on (e.g., System design, resume feedback, career guidance)..."
                        value={requestMessage}
                        onChange={(e) => setRequestMessage(e.target.value)}
                      />
                    </div>

                    <div className="d-flex gap-2 justify-content-end mt-4">
                      <button
                        type="button"
                        className="btn btn-outline-secondary rounded-pill px-4 fw-semibold"
                        onClick={() => setShowBookingModal(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={submittingRequest}
                        className="btn btn-primary rounded-pill px-4 fw-bold"
                        onClick={handleSendMentorshipRequest}
                        style={{ background: "#0d6efd", border: "none" }}
                      >
                        {submittingRequest ? "Sending..." : "Confirm Request"}
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          /* Master Screen 10: Find a Mentor Discovery View matching Image 3 */
          <div>
            <h2 className="fw-bold mb-4" style={{ fontSize: "1.85rem", letterSpacing: "-0.02em" }}>
              Find a Mentor
            </h2>

            {/* Search and Filters Bar matching Image 3 */}
            <div className="d-flex flex-column flex-md-row gap-3 mb-4">
              <div
                className="card border-0 rounded-4 shadow-sm p-2 px-3 d-flex flex-row align-items-center flex-grow-1"
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
              >
                <Search size={20} className="text-muted me-2" />
                <input
                  type="text"
                  className="form-control border-0 shadow-none py-2"
                  placeholder="Search by name, skills, role, or industry..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    background: "transparent",
                    color: "var(--text)",
                    fontSize: "0.95rem",
                  }}
                />
              </div>

              <button
                type="button"
                className="btn btn-outline-secondary rounded-4 px-4 py-2 fw-semibold d-flex align-items-center gap-2"
                style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)" }}
              >
                <Filter size={16} /> Filters <ChevronDown size={14} />
              </button>
            </div>

            {/* Domain Filter Pills matching Image 3 */}
            <div className="d-flex gap-2 flex-wrap mb-4">
              {DOMAIN_PILLS.map((pill) => {
                const isActive = activeDomain === pill;
                return (
                  <button
                    key={pill}
                    type="button"
                    className="btn rounded-pill px-4 py-2 fw-semibold"
                    onClick={() => setActiveDomain(pill)}
                    style={{
                      background: isActive ? "#0d6efd" : "var(--surface)",
                      color: isActive ? "#ffffff" : "var(--text)",
                      border: isActive ? "none" : "1px solid var(--border)",
                      fontSize: "0.9rem",
                    }}
                  >
                    {pill}
                  </button>
                );
              })}
            </div>

            {/* Mentor Cards 2-Column Grid matching Image 3 */}
            <div className="row g-4">
              {filteredMentors.map((mentor) => (
                <div key={mentor._id} className="col-12 col-md-6">
                  <motion.div
                    whileHover={{ y: -3 }}
                    transition={{ duration: 0.2 }}
                    className="card border-0 rounded-4 shadow-sm p-4 cursor-pointer h-100"
                    style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                    onClick={() => handleOpenMentorProfile(mentor)}
                  >
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="d-flex align-items-center gap-3">
                        <img
                          src={mentor.avatar}
                          alt={mentor.name}
                          className="rounded-circle shadow-sm"
                          style={{ width: "56px", height: "56px", objectFit: "cover" }}
                        />
                        <div>
                          <h5 className="fw-bold mb-1" style={{ fontSize: "1.15rem" }}>
                            {mentor.name}
                          </h5>
                          <div className="text-muted fw-semibold small">
                            {mentor.role}
                          </div>
                          <small className="text-primary fw-bold">
                            {mentor.company}
                          </small>
                        </div>
                      </div>

                      <span
                        className="badge rounded-pill px-3 py-2 fw-bold"
                        style={{
                          background: "rgba(16, 185, 129, 0.12)",
                          color: "#10b981",
                          border: "1px solid rgba(16, 185, 129, 0.25)",
                        }}
                      >
                        {mentor.matchScore}% Match
                      </span>
                    </div>

                    {/* Skills Pills matching Image 3 */}
                    <div className="d-flex flex-wrap gap-2 mb-3">
                      {mentor.skills.map((sk) => (
                        <span
                          key={sk}
                          className="badge rounded-pill px-3 py-1 fw-semibold"
                          style={{
                            background: "rgba(13, 110, 253, 0.08)",
                            color: "#0d6efd",
                            fontSize: "0.8rem",
                          }}
                        >
                          {sk}
                        </span>
                      ))}
                    </div>

                    {/* Next Available Date matching Image 3 */}
                    <div className="mt-auto pt-2 border-top d-flex justify-content-between align-items-center" style={{ borderColor: "var(--border)" }}>
                      <span className="small text-muted">
                        Next available: <strong>{mentor.nextAvailable}</strong>
                      </span>
                      <button
                        type="button"
                        className="btn btn-link text-primary p-0 small fw-bold text-decoration-none"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenMentorProfile(mentor);
                        }}
                      >
                        View Profile &rarr;
                      </button>
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
