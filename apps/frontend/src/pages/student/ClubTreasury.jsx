import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { treasuryService } from "../../services/api.js";
import {
  Landmark,
  FileText,
  CheckCircle,
  XCircle,
  Plus,
  DollarSign,
  Users,
} from "lucide-react";
import { useToast } from "../../context/ToastContext";
const ClubTreasury = () => {
  const { addToast } = useToast();
  const [clubs, setClubs] = useState([]);
  const [expenses, setExpenses] = useState({});
  const [loading, setLoading] = useState(true);
  const [showAddClub, setShowAddClub] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [activeClub, setActiveClub] = useState(null);
  const [clubData, setClubData] = useState({ clubName: "", balance: 5000 });
  const [expenseData, setExpenseData] = useState({
    amount: "",
    description: "",
  });
  useEffect(() => {
    fetchClubs();
  }, []);
  const fetchClubs = async () => {
    try {
      setLoading(true);
      const res = await treasuryService.getTreasury();
      setClubs(res.data.data || []); // Fetch expenses for each club
      res.data.data.forEach((club) => fetchExpenses(club._id));
    } catch (err) {
      addToast("Failed to load treasury data", "error");
    } finally {
      setLoading(false);
    }
  };
  const fetchExpenses = async (clubId) => {
    try {
      const res = await treasuryService.getExpenses(clubId);
      setExpenses((prev) => ({ ...prev, [clubId]: res.data.data }));
    } catch (err) {
      console.error(err);
    }
  };
  const handleCreateClub = async (e) => {
    e.preventDefault();
    try {
      await treasuryService.createClub(clubData);
      addToast("Club Treasury Initialized! 🏦", "success");
      setShowAddClub(false);
      setClubData({ clubName: "", balance: 5000 });
      fetchClubs();
    } catch (err) {
      addToast("Failed to create club", "error");
    }
  };
  const handleRequestExpense = async (e) => {
    e.preventDefault();
    try {
      await treasuryService.requestExpense(activeClub._id, expenseData);
      addToast("Expense Request submitted for Advisor approval! 📝", "success");
      setShowAddExpense(false);
      setExpenseData({ amount: "", description: "" });
      fetchExpenses(activeClub._id);
    } catch (err) {
      addToast("Failed to request expense", "error");
    }
  };
  const handleApprove = async (expenseId, clubId) => {
    try {
      await treasuryService.approveExpense(expenseId);
      addToast("Expense Approved! Funds deducted from ledger. ✅", "success");
      fetchClubs();
    } catch (err) {
      addToast("Failed to approve", "error");
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
          <h2 className="fw-black mb-1 text-gradient-primary d-flex align-items-center gap-2">
            {" "}
            Club Treasury Ledger <Landmark size={28} />{" "}
          </h2>{" "}
          <p className="text-muted mb-0">
            Dual-signature transparent digital wallets for student clubs.
          </p>{" "}
        </div>{" "}
        <button
          className="btn btn-outline-dark rounded-pill px-4 shadow-sm fw-bold d-flex align-items-center gap-2"
          onClick={() => setShowAddClub(true)}
        >
          {" "}
          <Plus size={20} /> (Dev) Initialize Club{" "}
        </button>{" "}
      </div>{" "}
      <div className="row g-4">
        {" "}
        {clubs.map((club, i) => (
          <div className="col-lg-6" key={club._id}>
            {" "}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bento-card p-0 h-100 overflow-hidden d-flex flex-column border border-success border-2 shadow-sm"
            >
              {" "}
              <div className="bg-success text-white p-4 d-flex justify-content-between align-items-center">
                {" "}
                <div>
                  {" "}
                  <h4 className="fw-black mb-1 d-flex align-items-center gap-2">
                    <Users size={20} /> {club.clubName}
                  </h4>{" "}
                  <div className="small opacity-75 fw-bold">
                    President: {club.president?.name}
                  </div>{" "}
                </div>{" "}
                <div className="text-end">
                  {" "}
                  <div className="fs-3 fw-black d-flex align-items-center">
                    <DollarSign size={24} />
                    {club.balance.toFixed(2)}
                  </div>{" "}
                  <div className="small opacity-75 fw-bold text-uppercase">
                    Current Balance
                  </div>{" "}
                </div>{" "}
              </div>{" "}
              <div className="p-4 bg-light d-flex justify-content-between align-items-center border-bottom">
                {" "}
                <span className="fw-bold text-muted small">
                  Club Advisor:{" "}
                  <span className="text-foreground">{club.facultyAdvisor?.name}</span>
                </span>{" "}
                <button
                  className="btn btn-sm btn-dark rounded-pill px-3 fw-bold shadow-sm"
                  onClick={() => {
                    setActiveClub(club);
                    setShowAddExpense(true);
                  }}
                >
                  {" "}
                  Request Funds{" "}
                </button>{" "}
              </div>{" "}
              <div className="p-4 flex-grow-1 bg-card">
                {" "}
                <h6 className="fw-bold text-muted text-uppercase small mb-3">
                  Pending Expense Requests
                </h6>{" "}
                <div className="d-flex flex-column gap-2">
                  {" "}
                  {(expenses[club._id] || [])
                    .filter((e) => e.status === "Pending")
                    .map((exp) => (
                      <div
                        key={exp._id}
                        className="bg-light p-3 rounded-3 d-flex justify-content-between align-items-center border border-warning"
                      >
                        {" "}
                        <div>
                          {" "}
                          <div className="fw-bold text-foreground">
                            {exp.description}
                          </div>{" "}
                          <div className="small text-muted">
                            Requested by: {exp.requestedBy?.name}
                          </div>{" "}
                        </div>{" "}
                        <div className="d-flex align-items-center gap-3">
                          {" "}
                          <span className="fw-black text-danger">
                            -${exp.amount.toFixed(2)}
                          </span>{" "}
                          <button
                            className="btn btn-sm btn-success rounded-circle p-2 shadow-sm"
                            onClick={() => handleApprove(exp._id, club._id)}
                          >
                            {" "}
                            <CheckCircle size={16} />{" "}
                          </button>{" "}
                        </div>{" "}
                      </div>
                    ))}{" "}
                  {(expenses[club._id] || []).filter(
                    (e) => e.status === "Pending",
                  ).length === 0 && (
                    <div className="text-muted small fst-italic">
                      No pending requests.
                    </div>
                  )}{" "}
                </div>{" "}
                <h6 className="fw-bold text-muted text-uppercase small mt-4 mb-3">
                  Recent Transactions
                </h6>{" "}
                <div className="d-flex flex-column gap-2">
                  {" "}
                  {(expenses[club._id] || [])
                    .filter((e) => e.status === "Approved")
                    .map((exp) => (
                      <div
                        key={exp._id}
                        className="bg-light p-3 rounded-3 d-flex justify-content-between align-items-center border border-success-subtle opacity-75"
                      >
                        {" "}
                        <div>
                          {" "}
                          <div className="fw-bold text-foreground text-decoration-line-through">
                            {exp.description}
                          </div>{" "}
                          <div className="small text-success fw-bold d-flex align-items-center gap-1">
                            <CheckCircle size={12} /> Approved
                          </div>{" "}
                        </div>{" "}
                        <span className="fw-black text-danger">
                          -${exp.amount.toFixed(2)}
                        </span>{" "}
                      </div>
                    ))}{" "}
                </div>{" "}
              </div>{" "}
            </motion.div>{" "}
          </div>
        ))}{" "}
        {clubs.length === 0 && (
          <div className="col-12 text-center p-5 bento-card ">
            {" "}
            <Landmark
              size={48}
              className="text-muted mb-3 opacity-25 mx-auto"
            />{" "}
            <h5 className="fw-bold text-muted">
              No clubs have digital treasuries yet.
            </h5>{" "}
          </div>
        )}{" "}
      </div>{" "}
      {/* Initialize Club Modal */}{" "}
      <AnimatePresence>
        {" "}
        {showAddClub && (
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
                <div className="bg-card text-foreground rounded-circle d-inline-flex p-3 mb-3 shadow-sm">
                  {" "}
                  <Landmark size={32} />{" "}
                </div>{" "}
                <h4 className="fw-bold">Initialize Club</h4>{" "}
              </div>{" "}
              <form onSubmit={handleCreateClub}>
                {" "}
                <div className="mb-3">
                  {" "}
                  <label className="form-label fw-bold small">
                    Club Name
                  </label>{" "}
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={clubData.clubName}
                    onChange={(e) =>
                      setClubData({ ...clubData, clubName: e.target.value })
                    }
                    placeholder="e.g. AI Club"
                  />{" "}
                </div>{" "}
                <div className="mb-4">
                  {" "}
                  <label className="form-label fw-bold small">
                    Starting Balance ($)
                  </label>{" "}
                  <input
                    type="number"
                    className="form-control"
                    required
                    value={clubData.balance}
                    onChange={(e) =>
                      setClubData({
                        ...clubData,
                        balance: Number(e.target.value),
                      })
                    }
                  />{" "}
                </div>{" "}
                <div className="d-flex justify-content-end gap-2">
                  {" "}
                  <button
                    type="button"
                    className="btn btn-light rounded-pill px-4"
                    onClick={() => setShowAddClub(false)}
                  >
                    Cancel
                  </button>{" "}
                  <button
                    type="submit"
                    className="btn btn-dark rounded-pill px-4 fw-bold"
                  >
                    Create Ledger
                  </button>{" "}
                </div>{" "}
              </form>{" "}
            </div>{" "}
          </motion.div>
        )}{" "}
      </AnimatePresence>{" "}
      {/* Request Expense Modal */}{" "}
      <AnimatePresence>
        {" "}
        {showAddExpense && activeClub && (
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
                <div className="bg-warning text-foreground rounded-circle d-inline-flex p-3 mb-3 shadow-sm">
                  {" "}
                  <FileText size={32} />{" "}
                </div>{" "}
                <h4 className="fw-bold text-foreground">Request Funds</h4>{" "}
                <p className="text-muted small mb-0">
                  for {activeClub.clubName}
                </p>{" "}
              </div>{" "}
              <form onSubmit={handleRequestExpense}>
                {" "}
                <div className="mb-3">
                  {" "}
                  <label className="form-label fw-bold small text-muted">
                    Amount Needed ($)
                  </label>{" "}
                  <div className="input-group">
                    {" "}
                    <span className="input-group-text bg-light border-end-0 fw-bold">
                      <DollarSign size={16} />
                    </span>{" "}
                    <input
                      type="number"
                      className="form-control border-start-0 ps-0 fw-bold text-danger fs-5"
                      required
                      value={expenseData.amount}
                      onChange={(e) =>
                        setExpenseData({
                          ...expenseData,
                          amount: Number(e.target.value),
                        })
                      }
                    />{" "}
                  </div>{" "}
                </div>{" "}
                <div className="mb-4">
                  {" "}
                  <label className="form-label fw-bold small text-muted">
                    Description / Reason
                  </label>{" "}
                  <textarea
                    className="form-control fw-semibold"
                    rows="2"
                    required
                    value={expenseData.description}
                    onChange={(e) =>
                      setExpenseData({
                        ...expenseData,
                        description: e.target.value,
                      })
                    }
                    placeholder="e.g. Pizza for Friday's HackNight"
                  ></textarea>{" "}
                </div>{" "}
                <div className="d-flex justify-content-between gap-2">
                  {" "}
                  <button
                    type="button"
                    className="btn btn-light rounded-pill px-4 flex-grow-1"
                    onClick={() => setShowAddExpense(false)}
                  >
                    Cancel
                  </button>{" "}
                  <button
                    type="submit"
                    className="btn btn-warning rounded-pill px-4 fw-bold flex-grow-1"
                  >
                    Submit to Advisor
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
export default ClubTreasury;
