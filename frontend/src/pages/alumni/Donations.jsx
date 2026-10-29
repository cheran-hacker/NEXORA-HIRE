import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, DollarSign, CheckCircle, Gift, TrendingUp } from "lucide-react";
import { useToast } from "../../context/ToastContext";
const Donations = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("General Fund");
  const [anonymous, setAnonymous] = useState(false);
  const [donations, setDonations] = useState([]);
  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const { campaignService } = await import("../../services/api");
        const res = await campaignService.getCampaigns();
        setDonations(res.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDonations();
  }, []);
  const handleDonate = (e) => {
    e.preventDefault();
    if (!amount) return;
    const newDonation = {
      id: Date.now(),
      amount: Number(amount),
      purpose,
      date: new Date().toISOString().split("T")[0],
      status: "Pending",
    };
    setDonations([newDonation, ...donations]);
    setAmount("");
    addToast(
      "Thank you for your generous pledge! Redirecting to payment gateway...",
      "success",
    );
  };
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
        className="mb-5"
      >
        {" "}
        <h2
          className="fw-black mb-1 d-flex align-items-center gap-3"
          style={{ color: "var(--text)" }}
        >
          {" "}
          <Heart size={32} className="text-danger" fill="currentColor" /> Alumni
          Giving{" "}
        </h2>{" "}
        <p className="text-muted fw-medium">
          Support the next generation of students and campus initiatives.
        </p>{" "}
      </motion.div>{" "}
      <div className="row g-4">
        {" "}
        {/* Donation Form */}{" "}
        <div className="col-lg-5">
          {" "}
          <motion.div
            className="bento-card p-4 h-100"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {" "}
            <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
              <Gift size={20} className="text-primary" /> Make a Donation
            </h5>{" "}
            <form onSubmit={handleDonate}>
              {" "}
              <div className="mb-3">
                {" "}
                <label className="form-label fw-semibold text-muted small">
                  Donation Amount (USD)
                </label>{" "}
                <div className="input-group">
                  {" "}
                  <span className="input-group-text border-end-0">
                    <DollarSign size={16} />
                  </span>{" "}
                  <input
                    type="number"
                    min="1"
                    className="form-control border-start-0 ps-0"
                    placeholder="e.g. 100"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />{" "}
                </div>{" "}
              </div>{" "}
              <div className="mb-3">
                {" "}
                <label className="form-label fw-semibold text-muted small">
                  Purpose / Fund
                </label>{" "}
                <select
                  className="form-select "
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                >
                  {" "}
                  <option value="General Fund">General Campus Fund</option>{" "}
                  <option value="Scholarship">Student Scholarships</option>{" "}
                  <option value="Infrastructure">Infrastructure & Labs</option>{" "}
                  <option value="Research">Research & Innovation</option>{" "}
                </select>{" "}
              </div>{" "}
              <div className="mb-4 form-check">
                {" "}
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="anonymousCheck"
                  checked={anonymous}
                  onChange={(e) => setAnonymous(e.target.checked)}
                />{" "}
                <label
                  className="form-check-label text-muted small"
                  htmlFor="anonymousCheck"
                >
                  Make this donation anonymously
                </label>{" "}
              </div>{" "}
              <button
                type="submit"
                className="btn btn-primary w-100 rounded-pill fw-bold py-2 d-flex justify-content-center align-items-center gap-2 shadow-sm"
                style={{
                  background:
                    "linear-gradient(135deg, var(--primary), var(--purple))",
                  border: "none",
                }}
              >
                {" "}
                <Heart size={18} /> Donate Now{" "}
              </button>{" "}
            </form>{" "}
          </motion.div>{" "}
        </div>{" "}
        {/* Donation History */}{" "}
        <div className="col-lg-7">
          {" "}
          <motion.div
            className="bento-card p-4 h-100"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            {" "}
            <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
              <TrendingUp size={20} className="text-success" /> Your Impact
              History
            </h5>{" "}
            <div className="d-flex flex-column gap-3">
              {" "}
              {donations.map((donation) => (
                <div
                  key={donation._id || donation.id}
                  className="p-3 rounded-4 border d-flex justify-content-between align-items-center bg-light hover-glow"
                >
                  {" "}
                  <div className="d-flex align-items-center gap-3">
                    {" "}
                    <div
                      className="icon-circle bg-success-subtle text-success flex-shrink-0"
                      style={{ width: 40, height: 40 }}
                    >
                      {" "}
                      <DollarSign size={20} />{" "}
                    </div>{" "}
                    <div>
                      {" "}
                      <h6 className="fw-bold mb-0">
                        ${donation.amount.toLocaleString()}
                      </h6>{" "}
                      <small className="text-muted fw-semibold">
                        {donation.purpose} •{" "}
                        {new Date(donation.date).toLocaleDateString()}
                      </small>{" "}
                    </div>{" "}
                  </div>{" "}
                  {donation.status === "Completed" ? (
                    <span className="badge bg-success-subtle text-success rounded-pill d-flex align-items-center gap-1 px-3 py-2">
                      <CheckCircle size={12} /> Completed
                    </span>
                  ) : (
                    <span className="badge bg-warning-subtle text-warning rounded-pill px-3 py-2">
                      Pending
                    </span>
                  )}{" "}
                </div>
              ))}{" "}
              {donations.length === 0 && (
                <p className="text-muted small text-center p-4">
                  No donation history found.
                </p>
              )}{" "}
            </div>{" "}
          </motion.div>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
};
export default Donations;
