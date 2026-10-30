import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Search, Plus, MapPin, Tag, Star } from "lucide-react";
import { useToast } from "../../context/ToastContext";
import { clubService } from "../../services/api";
import Modal from "../../shared/components/Modal";

const ClubsDirectory = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("All");
  const [clubs, setClubs] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [clubForm, setClubForm] = useState({
    name: "",
    category: "Technical",
    description: "",
    tags: "Coding, AI, Web",
  });
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const u = JSON.parse(localStorage.getItem("nexora_user"));
        setCurrentUser(u);
      } catch (e) {}
    };
    fetchUser();
  }, []);
  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const res = await clubService.getClubs();
        setClubs(res.data.data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchClubs();
  }, []);
  const handleJoin = async (id) => {
    try {
      await clubService.joinClub(id);
      addToast("Membership request sent to club admins.", "success");
      const res = await clubService.getClubs();
      setClubs(res.data.data || []);
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to join club", "error");
    }
  };
  const handleApprove = async (clubId, userId, status) => {
    try {
      await clubService.approveMember(clubId, { userId, status });
      addToast(`Member ${status.toLowerCase()}!`, "success");
      const res = await clubService.getClubs();
      setClubs(res.data.data || []);
    } catch (err) {
      addToast("Failed to update member status", "error");
    }
  };
  const filteredClubs = clubs.filter(
    (c) =>
      (category === "All" || c.category === category) &&
      (c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description.toLowerCase().includes(searchTerm.toLowerCase())),
  );
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
        className="mb-5 d-flex justify-content-between align-items-center"
      >
        {" "}
        <div>
          {" "}
          <h2
            className="fw-black mb-1 d-flex align-items-center gap-3"
            style={{ color: "var(--text)" }}
          >
            {" "}
            <Users size={32} className="text-primary" /> Campus Clubs{" "}
          </h2>{" "}
          <p className="text-muted fw-medium">
            Discover student organizations and join communities that match your
            interests.
          </p>{" "}
        </div>{" "}
        <button
          className="btn btn-primary rounded-pill fw-bold px-4 d-flex align-items-center gap-2"
          onClick={() => addToast("Opening new club charter form...", "info")}
        >
          {" "}
          <Plus size={18} /> Start a Club{" "}
        </button>{" "}
      </motion.div>{" "}
      {/* Filters & Search */}{" "}
      <div className="bento-card p-3 mb-4 d-flex flex-wrap justify-content-between align-items-center gap-3">
        {" "}
        <div className="d-flex flex-wrap gap-2">
          {" "}
          {["All", "Technical", "Cultural", "Sports", "Social"].map((cat) => (
            <button
              key={cat}
              className={`btn fw-bold rounded-pill px-4 ${category === cat ? "btn-primary shadow" : "btn-outline-secondary border-0"}`}
              onClick={() => setCategory(cat)}
            >
              {" "}
              {cat}{" "}
            </button>
          ))}{" "}
        </div>{" "}
        <div
          className="position-relative flex-grow-1"
          style={{ maxWidth: "300px" }}
        >
          {" "}
          <Search
            size={16}
            className="position-absolute top-50 translate-middle-y ms-3 text-muted"
          />{" "}
          <input
            type="text"
            className="form-control rounded-pill ps-5"
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              color: "var(--text)",
            }}
            placeholder="Search clubs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />{" "}
        </div>{" "}
      </div>{" "}
      <div className="row g-4">
        {" "}
        {filteredClubs.map((club, idx) => (
          <div className="col-md-6 col-lg-4" key={club._id || club.id}>
            {" "}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="bento-card p-4 h-100 d-flex flex-column hover-glow transition-fast"
            >
              {" "}
              <div className="d-flex justify-content-between align-items-start mb-3">
                {" "}
                <div className="d-flex align-items-center gap-3">
                  {" "}
                  <div
                    className="rounded-3 d-flex align-items-center justify-content-center text-foreground fw-bold fs-5 shadow-sm"
                    style={{
                      width: 48,
                      height: 48,
                      background:
                        "linear-gradient(135deg, var(--primary), var(--purple))",
                    }}
                  >
                    {" "}
                    {club.name.charAt(0)}{" "}
                  </div>{" "}
                  <div>
                    {" "}
                    <h5 className="fw-bold mb-0">{club.name}</h5>{" "}
                    <span className="badge bg-secondary-subtle text-secondary rounded-pill mt-1">
                      {club.category}
                    </span>{" "}
                  </div>{" "}
                </div>{" "}
              </div>{" "}
              <p className="text-muted small mb-3 flex-grow-1 lh-base">
                {club.description}
              </p>{" "}
              <div className="d-flex flex-wrap gap-2 mb-4">
                {" "}
                {(club.tags || []).map((tag, i) => (
                  <span
                    key={i}
                    className="badge bg-light border text-muted rounded-pill d-flex align-items-center gap-1"
                  >
                    {" "}
                    <Tag size={10} /> {tag}{" "}
                  </span>
                ))}{" "}
              </div>{" "}
              <div className="d-flex justify-content-between align-items-center mt-auto flex-wrap gap-2">
                {" "}
                <div className="d-flex align-items-center gap-2 text-muted small fw-semibold">
                  {" "}
                  <Users size={16} className="text-primary" />{" "}
                  {club.members?.length || 0} Members{" "}
                </div>{" "}
                {currentUser && club.president?._id === currentUser.id ? (
                  <div className="dropdown">
                    {" "}
                    <button
                      className="btn btn-sm btn-outline-primary rounded-pill fw-bold dropdown-toggle"
                      data-bs-toggle="dropdown"
                    >
                      {" "}
                      Manage Requests (
                      {club.members?.filter((m) => m.status === "Pending")
                        .length || 0}
                      ){" "}
                    </button>{" "}
                    <ul
                      className="dropdown-menu dropdown-menu-end p-2 bg-light border shadow"
                      style={{ minWidth: 250 }}
                    >
                      {" "}
                      {club.members?.filter((m) => m.status === "Pending")
                        .length === 0 && (
                        <li className="text-muted small text-center p-2">
                          No pending requests
                        </li>
                      )}{" "}
                      {club.members
                        ?.filter((m) => m.status === "Pending")
                        .map((m) => (
                          <li
                            key={m.user}
                            className="d-flex justify-content-between align-items-center mb-2 p-1 border-bottom border"
                          >
                            {" "}
                            <span className="small text-foreground">
                              User ID: {m.user.toString().slice(-4)}
                            </span>{" "}
                            <div className="d-flex gap-1">
                              {" "}
                              <button
                                onClick={() =>
                                  handleApprove(club._id, m.user, "Approved")
                                }
                                className="btn btn-xs btn-success py-0 px-2 rounded-pill"
                              >
                                Approve
                              </button>{" "}
                              <button
                                onClick={() =>
                                  handleApprove(club._id, m.user, "Rejected")
                                }
                                className="btn btn-xs btn-danger py-0 px-2 rounded-pill"
                              >
                                Reject
                              </button>{" "}
                            </div>{" "}
                          </li>
                        ))}{" "}
                    </ul>{" "}
                  </div>
                ) : (
                  <button
                    onClick={() => handleJoin(club._id)}
                    disabled={club.members?.some(
                      (m) => m.user === currentUser?.id,
                    )}
                    className={`btn rounded-pill px-4 fw-bold ${club.members?.some((m) => m.user === currentUser?.id) ? "btn-outline-secondary" : "btn-primary shadow-sm"}`}
                  >
                    {" "}
                    {club.members?.some((m) => m.user === currentUser?.id)
                      ? club.members.find((m) => m.user === currentUser?.id)
                          .status === "Pending"
                        ? "Pending Approval"
                        : "Joined"
                      : "Join Club"}{" "}
                  </button>
                )}{" "}
              </div>{" "}
            </motion.div>{" "}
          </div>
        ))}{" "}
      </div>{" "}
    </div>
  );
};
export default ClubsDirectory;
