import React, { useState, useEffect } from "react";
import { capstoneService } from "../../services/api.js";
import { Lightbulb, DollarSign, Users, PieChart } from "lucide-react";
import { useToast } from "../../context/ToastContext";
const Capstones = () => {
  const { addToast } = useToast();
  const [capstones, setCapstones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    pitch: "",
    fundingGoal: "",
    equityOffered: "",
  });
  useEffect(() => {
    fetchCapstones();
  }, []);
  const fetchCapstones = async () => {
    try {
      const res = await capstoneService.getCapstones();
      setCapstones(res.data.data || []);
    } catch (err) {
      addToast("Failed to load capstones", "error");
    } finally {
      setLoading(false);
    }
  };
  const handleInvest = async (id) => {
    const amountStr = window.prompt("Enter investment amount ($):");
    if (!amountStr) return;
    const amount = Number(amountStr);
    try {
      await capstoneService.investInCapstone(id, amount);
      addToast(`Invested $${amount} into capstone!`, "success");
      fetchCapstones();
    } catch (err) {
      addToast("Investment failed", "error");
    }
  };
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await capstoneService.createCapstone({
        ...formData,
        fundingGoal: Number(formData.fundingGoal),
        equityOffered: Number(formData.equityOffered),
        milestones: [
          {
            title: "Initial Prototype",
            description: "MVP development",
            dueDate: new Date(),
          },
        ],
      });
      addToast("Capstone Created and Pending Approval! 🚀", "success");
      setShowAdd(false);
      setFormData({ title: "", pitch: "", fundingGoal: "", equityOffered: "" });
      fetchCapstones();
    } catch (err) {
      addToast("Failed to create capstone", "error");
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
            Equity Capstones <Lightbulb size={28} />{" "}
          </h2>{" "}
          <p className="text-muted mb-0">
            Pitch your senior project to alumni investors in exchange for
            simulated seed equity.
          </p>{" "}
        </div>{" "}
        <button
          className="btn btn-success rounded-pill px-4 shadow-sm fw-bold d-flex align-items-center gap-2"
          onClick={() => setShowAdd(true)}
        >
          {" "}
          Pitch New Capstone{" "}
        </button>{" "}
      </div>{" "}
      <div className="row g-4">
        {" "}
        {capstones.map((cap) => (
          <div className="col-lg-6" key={cap._id}>
            {" "}
            <div className="bento-card bg-card p-4 h-100 shadow-sm border border-success border-opacity-25 d-flex flex-column">
              {" "}
              <div className="d-flex justify-content-between align-items-start mb-2">
                {" "}
                <h4 className="fw-black text-foreground mb-0">{cap.title}</h4>{" "}
                {cap.status && (
                  <span
                    className={`badge ${cap.status === "Approved" ? "bg-success" : cap.status === "Rejected" ? "bg-danger" : "bg-warning text-foreground"}`}
                  >
                    {" "}
                    {cap.status}{" "}
                  </span>
                )}{" "}
              </div>{" "}
              <p className="text-muted">{cap.pitch}</p>{" "}
              <div className="row g-3 mb-4">
                {" "}
                <div className="col-6">
                  {" "}
                  <div className="bg-light p-3 rounded-3 text-center border">
                    {" "}
                    <div className="small text-muted fw-bold text-uppercase">
                      Funding Goal
                    </div>{" "}
                    <div className="fs-5 fw-black text-success">
                      ${cap.fundingGoal}
                    </div>{" "}
                  </div>{" "}
                </div>{" "}
                <div className="col-6">
                  {" "}
                  <div className="bg-light p-3 rounded-3 text-center border">
                    {" "}
                    <div className="small text-muted fw-bold text-uppercase">
                      Equity Offered
                    </div>{" "}
                    <div className="fs-5 fw-black text-foreground">
                      {cap.equityOffered}%
                    </div>{" "}
                  </div>{" "}
                </div>{" "}
              </div>{" "}
              <div className="mb-4">
                {" "}
                <div className="d-flex justify-content-between small fw-bold mb-1">
                  {" "}
                  <span>${cap.currentFunding} Raised</span>{" "}
                  <span className="text-muted">
                    {Math.round((cap.currentFunding / cap.fundingGoal) * 100)}%
                  </span>{" "}
                </div>{" "}
                <div className="progress" style={{ height: "8px" }}>
                  {" "}
                  <div
                    className="progress-bar bg-success"
                    style={{
                      width: `${Math.min((cap.currentFunding / cap.fundingGoal) * 100, 100)}%`,
                    }}
                  ></div>{" "}
                </div>{" "}
              </div>{" "}
              <div className="mt-auto">
                {" "}
                {cap.milestones && cap.milestones.length > 0 && (
                  <div className="mb-3">
                    {" "}
                    <div className="small fw-bold text-muted mb-2 text-uppercase">
                      Milestones
                    </div>{" "}
                    {cap.milestones.map((m, idx) => (
                      <div
                        key={idx}
                        className="d-flex align-items-center gap-2 small text-foreground mb-1"
                      >
                        {" "}
                        <div
                          className={`rounded-circle ${m.completed ? "bg-success" : "bg-secondary"}`}
                          style={{ width: "8px", height: "8px" }}
                        ></div>{" "}
                        {m.title}{" "}
                      </div>
                    ))}{" "}
                  </div>
                )}{" "}
                <button
                  className="btn btn-success w-100 fw-bold rounded-pill"
                  onClick={() => handleInvest(cap._id)}
                >
                  {" "}
                  <DollarSign size={18} /> Invest Seed Money{" "}
                </button>{" "}
              </div>{" "}
            </div>{" "}
          </div>
        ))}{" "}
      </div>{" "}
      {/* Form Modal */}{" "}
      {showAdd && (
        <div
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
            <h4 className="fw-bold mb-4">Pitch New Capstone</h4>{" "}
            <form onSubmit={handleCreate}>
              {" "}
              <div className="mb-3">
                {" "}
                <label className="form-label fw-bold small">
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
                />{" "}
              </div>{" "}
              <div className="mb-3">
                {" "}
                <label className="form-label fw-bold small">
                  Elevator Pitch
                </label>{" "}
                <textarea
                  className="form-control"
                  rows="3"
                  required
                  value={formData.pitch}
                  onChange={(e) =>
                    setFormData({ ...formData, pitch: e.target.value })
                  }
                ></textarea>{" "}
              </div>{" "}
              <div className="row">
                {" "}
                <div className="col-6 mb-4">
                  {" "}
                  <label className="form-label fw-bold small">
                    Funding Goal ($)
                  </label>{" "}
                  <input
                    type="number"
                    className="form-control"
                    required
                    value={formData.fundingGoal}
                    onChange={(e) =>
                      setFormData({ ...formData, fundingGoal: e.target.value })
                    }
                  />{" "}
                </div>{" "}
                <div className="col-6 mb-4">
                  {" "}
                  <label className="form-label fw-bold small">
                    Equity Offered (%)
                  </label>{" "}
                  <input
                    type="number"
                    className="form-control"
                    required
                    value={formData.equityOffered}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        equityOffered: e.target.value,
                      })
                    }
                    max="100"
                  />{" "}
                </div>{" "}
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
                  Submit Pitch
                </button>{" "}
              </div>{" "}
            </form>{" "}
          </div>{" "}
        </div>
      )}{" "}
    </div>
  );
};
export default Capstones;
