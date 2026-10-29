import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { reversementoringService } from "../../services/api.js";
import {
  Briefcase,
  Building,
  DollarSign,
  TrendingUp,
  BookOpen,
  Plus,
} from "lucide-react";
import { useToast } from "../../context/ToastContext";
const ReverseMentoring = () => {
  const { addToast } = useToast();
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({ topic: "", hourlyRate: "" });
  useEffect(() => {
    fetchMentors();
  }, []);
  const fetchMentors = async () => {
    try {
      setLoading(true);
      const res = await reversementoringService.getMentors();
      setMentors(res.data.data || []);
    } catch (err) {
      addToast("Failed to load Mentorship data", "error");
    } finally {
      setLoading(false);
    }
  };
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await reversementoringService.offerMentoring(formData);
      addToast("Mentorship Offer Listed! 🚀", "success");
      setShowAdd(false);
      setFormData({ topic: "", hourlyRate: "" });
      fetchMentors();
    } catch (err) {
      addToast("Failed to list offer", "error");
    }
  };
  const handleBook = async (id) => {
    try {
      await reversementoringService.bookMentoring(id);
      addToast("Successfully Booked Session! 🎓", "success");
      fetchMentors();
    } catch (err) {
      addToast(
        err?.response?.data?.message || "Failed to book session",
        "error",
      );
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
          <h2 className="fw-black mb-1 text-success d-flex align-items-center gap-2">
            {" "}
            Reverse Mentoring <TrendingUp size={28} />{" "}
          </h2>{" "}
          <p className="text-muted mb-0">
            Offer your Gen-Z tech expertise to corporate executives and earn
            high consulting rates.
          </p>{" "}
        </div>{" "}
        <button
          className="btn btn-success rounded-pill px-4 shadow-sm fw-bold d-flex align-items-center gap-2"
          onClick={() => setShowAdd(true)}
        >
          {" "}
          <Plus size={20} /> Offer Consulting{" "}
        </button>{" "}
      </div>{" "}
      <div className="row g-4">
        {" "}
        {mentors.map((mentor, i) => (
          <div className="col-lg-6" key={mentor._id}>
            {" "}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bento-card p-0 h-100 overflow-hidden border-0 shadow"
            >
              {" "}
              <div className="bg-success text-white p-4 d-flex justify-content-between align-items-center">
                {" "}
                <div>
                  {" "}
                  <div className="badge bg-card text-success rounded-pill px-3 py-2 mb-2 d-inline-flex align-items-center gap-1">
                    {" "}
                    <BookOpen size={14} /> {mentor.status}{" "}
                  </div>{" "}
                  <h4 className="fw-black mb-0">{mentor.topic}</h4>{" "}
                </div>{" "}
                <TrendingUp size={48} className="opacity-25" />{" "}
              </div>{" "}
              <div className="p-4 bg-card">
                {" "}
                <div className="d-flex justify-content-between align-items-center mb-4">
                  {" "}
                  <div className="d-flex align-items-center gap-3">
                    {" "}
                    <div className="bg-light text-foreground rounded-circle p-3 shadow-sm border">
                      <Briefcase size={24} />
                    </div>{" "}
                    <div>
                      {" "}
                      <h6 className="fw-bold mb-0">Student Consultant</h6>{" "}
                      <div className="text-muted small">
                        {mentor.studentMentor?.name}
                      </div>{" "}
                    </div>{" "}
                  </div>{" "}
                  <div className="text-end">
                    {" "}
                    <div className="small text-muted fw-bold text-uppercase">
                      Hourly Rate
                    </div>{" "}
                    <div className="fs-4 fw-black text-success d-flex align-items-center justify-content-end gap-1">
                      <DollarSign size={20} /> {mentor.hourlyRate}/hr
                    </div>{" "}
                  </div>{" "}
                </div>{" "}
                <div className="bg-light p-3 rounded-3 border border-light mb-4">
                  {" "}
                  <div className="small fw-bold text-muted mb-2 d-flex align-items-center gap-2">
                    <Building size={16} /> Target Audience
                  </div>{" "}
                  <p className="small mb-0 text-foreground">
                    Senior Corporate Executives, VPs, and Directors looking to
                    understand Gen-Z consumer behavior, modern AI tooling, and
                    social media trends.
                  </p>{" "}
                </div>{" "}
                {mentor.status === "Available" ? (
                  <button
                    onClick={() => handleBook(mentor._id)}
                    className="btn btn-success w-100 rounded-pill fw-bold py-2 shadow-sm"
                  >
                    {" "}
                    Book Session{" "}
                  </button>
                ) : (
                  <button
                    disabled
                    className="btn btn-secondary w-100 rounded-pill fw-bold py-2 shadow-sm"
                  >
                    {" "}
                    Already Booked by{" "}
                    {mentor.corporateExecName || "an Executive"}{" "}
                  </button>
                )}{" "}
              </div>{" "}
            </motion.div>{" "}
          </div>
        ))}{" "}
      </div>{" "}
      {/* Form Modal */}{" "}
      <AnimatePresence>
        {" "}
        {showAdd && (
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
                <div className="bg-success text-white rounded-circle d-inline-flex p-3 mb-3 shadow-sm">
                  {" "}
                  <TrendingUp size={32} />{" "}
                </div>{" "}
                <h4 className="fw-bold">List Consulting Offer</h4>{" "}
              </div>{" "}
              <form onSubmit={handleCreate}>
                {" "}
                <div className="mb-3">
                  {" "}
                  <label className="form-label fw-bold small">
                    Topic of Expertise
                  </label>{" "}
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={formData.topic}
                    onChange={(e) =>
                      setFormData({ ...formData, topic: e.target.value })
                    }
                    placeholder="e.g. Using ChatGPT for Strategy"
                  />{" "}
                </div>{" "}
                <div className="mb-4">
                  {" "}
                  <label className="form-label fw-bold small">
                    Hourly Rate ($)
                  </label>{" "}
                  <input
                    type="number"
                    className="form-control"
                    required
                    value={formData.hourlyRate}
                    onChange={(e) =>
                      setFormData({ ...formData, hourlyRate: e.target.value })
                    }
                  />{" "}
                </div>{" "}
                <div className="d-flex justify-content-end gap-2">
                  {" "}
                  <button
                    type="button"
                    className="btn btn-light rounded-pill px-4"
                    onClick={() => setShowAdd(false)}
                  >
                    Cancel
                  </button>{" "}
                  <button
                    type="submit"
                    className="btn btn-success rounded-pill px-4 fw-bold"
                  >
                    List Offer
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
export default ReverseMentoring;
