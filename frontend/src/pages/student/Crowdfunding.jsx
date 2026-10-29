import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api, { campaignService } from "../../services/api.js";
import {
  Rocket,
  Target,
  Users,
  DollarSign,
  Plus,
  CheckCircle,
  Clock,
} from "lucide-react";
import { useToast } from "../../context/ToastContext";
const Crowdfunding = () => {
  const { addToast } = useToast();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    goalAmount: 500,
    category: "Hardware",
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Default 30 days
  });
  useEffect(() => {
    fetchCampaigns();
  }, []);
  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const res = await campaignService.getCampaigns();
      setCampaigns(res.data.data || []);
    } catch (err) {
      addToast("Failed to load campaigns", "error");
    } finally {
      setLoading(false);
    }
  };
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await campaignService.createCampaign(formData);
      addToast("Campaign launched successfully! 🚀", "success");
      setShowAdd(false);
      setFormData({
        title: "",
        description: "",
        goalAmount: 500,
        category: "Hardware",
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
      fetchCampaigns();
    } catch (err) {
      addToast("Failed to launch campaign", "error");
    }
  };
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleDonate = async (id, amount) => {
    try {
      const res = await loadRazorpayScript();
      if (!res) {
        addToast("Razorpay SDK failed to load. Check your connection.", "error");
        return;
      }

      // Create Order
      const orderRes = await api.post('/payment/create-order', {
        amount,
        type: 'CROWDFUNDING',
        referenceId: id
      });

      const { orderId, amount: rzpAmount, currency, key, transactionId } = orderRes.data.data;

      const options = {
        key,
        amount: rzpAmount,
        currency,
        name: "NEXORA Campus",
        description: "Crowdfunding Donation",
        order_id: orderId,
        handler: async function (response) {
          try {
            // Verify Payment
            const verifyRes = await api.post('/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              transactionId
            });

            if (verifyRes.data.success) {
              await campaignService.donateToCampaign(id, amount);
              addToast(`Successfully Donated $${amount}! 🎉`, "success");
              fetchCampaigns();
            }
          } catch (err) {
            addToast("Payment verification failed", "error");
          }
        },
        prefill: {
          name: "Student",
          email: "student@nexora.ai",
          contact: "9999999999"
        },
        theme: {
          color: "#4a90e2"
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      addToast("Failed to initiate payment", "error");
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
      <div className="d-flex justify-content-between align-items-center mb-5">
        {" "}
        <div>
          {" "}
          <h2 className="fw-black mb-1 text-gradient-primary d-flex align-items-center gap-2">
            {" "}
            Campus Kickstart <Rocket size={28} />{" "}
          </h2>{" "}
          <p className="text-muted mb-0">
            Fund the next big student startup or hardware project right here on
            campus.
          </p>{" "}
        </div>{" "}
        <button
          className="btn btn-primary rounded-pill px-4"
          onClick={() => setShowAdd(true)}
        >
          {" "}
          <Plus size={20} className="me-2" /> Start a Campaign{" "}
        </button>{" "}
      </div>{" "}
      <div className="row g-4">
        {" "}
        {campaigns.map((camp, i) => {
          const progress = Math.min(
            (camp.currentAmount / camp.goalAmount) * 100,
            100,
          );
          return (
            <div className="col-md-6 col-lg-4" key={camp._id}>
              {" "}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="glass-panel p-4 h-100 d-flex flex-column"
              >
                {" "}
                <div className="d-flex justify-content-between align-items-start mb-2">
                  {" "}
                  <h5 className="fw-bold mb-0">{camp.title}</h5>{" "}
                  <span
                    className={`badge ${camp.status === "Funded" ? "bg-success" : "bg-primary"} rounded-pill`}
                  >
                    {" "}
                    {camp.status}{" "}
                  </span>{" "}
                </div>{" "}
                <div className="text-muted small fw-bold mb-3">
                  {camp.category} • by {camp.creator?.name}
                </div>{" "}
                <p className="text-muted small mb-4 flex-grow-1">
                  {camp.description}
                </p>{" "}
                <div className="mb-4">
                  {" "}
                  <div className="d-flex justify-content-between small mb-1 fw-bold">
                    {" "}
                    <span>${camp.currentAmount} raised</span>{" "}
                    <span className="text-muted">
                      Goal: ${camp.goalAmount}
                    </span>{" "}
                  </div>{" "}
                  <div className="progress" style={{ height: "8px" }}>
                    {" "}
                    <div
                      className={`progress-bar ${progress >= 100 ? "bg-success" : "bg-primary"}`}
                      style={{ width: `${progress}%` }}
                    ></div>{" "}
                  </div>{" "}
                </div>{" "}
                <div
                  className="d-flex justify-content-between align-items-center pt-3 border-top"
                  style={{ borderColor: "var(--border) !important" }}
                >
                  {" "}
                  <div className="text-muted small d-flex align-items-center gap-1">
                    {" "}
                    <Users size={14} /> {camp.donations?.length || 0}{" "}
                    Backers{" "}
                  </div>{" "}
                  {camp.status === "Active" ? (
                    <button
                      className="btn btn-sm btn-outline-primary rounded-pill px-3 fw-bold d-flex align-items-center gap-1"
                      onClick={() => handleDonate(camp._id, 50)}
                    >
                      {" "}
                      <DollarSign size={14} /> Back ($50){" "}
                    </button>
                  ) : (
                    <span className="text-success fw-bold d-flex align-items-center gap-1">
                      <CheckCircle size={16} /> Goal Reached
                    </span>
                  )}{" "}
                </div>{" "}
              </motion.div>{" "}
            </div>
          );
        })}{" "}
      </div>{" "}
      {/* Add Campaign Modal */}{" "}
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
              style={{ width: "90%", maxWidth: "500px" }}
            >
              {" "}
              <h4 className="fw-bold mb-4">Start a Campaign</h4>{" "}
              <form onSubmit={handleCreate}>
                {" "}
                <div className="mb-3">
                  {" "}
                  <label className="form-label fw-bold">
                    Project Title
                  </label>{" "}
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="e.g. Brain-Computer Interface v1"
                  />{" "}
                </div>{" "}
                <div className="row mb-3">
                  {" "}
                  <div className="col-4">
                    {" "}
                    <label className="form-label fw-bold">Goal ($)</label>{" "}
                    <input
                      type="number"
                      min="10"
                      className="form-control"
                      required
                      value={formData.goalAmount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          goalAmount: Number(e.target.value),
                        })
                      }
                    />{" "}
                  </div>{" "}
                  <div className="col-4">
                    {" "}
                    <label className="form-label fw-bold">Category</label>{" "}
                    <select
                      className="form-select"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                    >
                      {" "}
                      <option>Hardware</option> <option>Software</option>{" "}
                      <option>Event</option> <option>Research</option>{" "}
                    </select>{" "}
                  </div>{" "}
                  <div className="col-4">
                    {" "}
                    <label className="form-label fw-bold">Deadline</label>{" "}
                    <input
                      type="date"
                      className="form-control"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={formData.deadline}
                      onChange={(e) =>
                        setFormData({ ...formData, deadline: e.target.value })
                      }
                    />{" "}
                  </div>{" "}
                </div>{" "}
                <div className="mb-4">
                  {" "}
                  <label className="form-label fw-bold">
                    Pitch (Description)
                  </label>{" "}
                  <textarea
                    className="form-control"
                    rows="3"
                    required
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="What are you building and why do you need funding?"
                  ></textarea>{" "}
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
                    className="btn btn-primary rounded-pill px-4"
                  >
                    Launch Campaign
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
export default Crowdfunding;
