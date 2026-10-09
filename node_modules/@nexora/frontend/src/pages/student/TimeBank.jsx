import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { timebankService } from "../../services/api.js";
import { Clock, Zap, Repeat, BookOpen, GraduationCap } from "lucide-react";
import { useToast } from "../../context/ToastContext";
const TimeBank = () => {
  const { addToast } = useToast();
  const [ledger, setLedger] = useState(null);
  const [market, setMarket] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTransact, setShowTransact] = useState(null);
  const [transactType, setTransactType] = useState("Spent"); // Spent = I am learning from them. Earned = I taught them.
  useEffect(() => {
    fetchData();
  }, []);
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await timebankService.getMyTimeBank();
      setLedger(res.data.data.ledger);
      setMarket(res.data.data.market);
    } catch (err) {
      addToast("Failed to load TimeBank", "error");
    } finally {
      setLoading(false);
    }
  };
  const handleTransaction = async (e) => {
    e.preventDefault();
    if (!showTransact) return;
    try {
      await timebankService.transactTime({
        partnerId: showTransact.user._id,
        skill: showTransact.skill,
        type: transactType,
      });
      addToast("Time transaction recorded!", "success");
      setShowTransact(null);
      fetchData();
    } catch (err) {
      addToast(err.response?.data?.message || "Transaction failed", "error");
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
            TimeBank <Clock size={28} />{" "}
          </h2>{" "}
          <p className="text-muted mb-0">
            Trade your time. Teach a skill to earn a TimeCoin, spend it to learn
            something new.
          </p>{" "}
        </div>{" "}
      </div>{" "}
      <div className="row g-4 mb-5">
        {" "}
        {/* Balance Card */}{" "}
        <div className="col-md-5 col-xl-4">
          {" "}
          <div
            className="bento-card p-4 h-100 text-center"
            style={{
              background:
                "linear-gradient(135deg, var(--surface-1) 0%, var(--surface-2) 100%)",
              border: "2px solid var(--primary)",
            }}
          >
            {" "}
            <h5 className="fw-bold text-muted mb-3">Your Balance</h5>{" "}
            <div className="display-1 fw-black text-primary mb-3 d-flex align-items-center justify-content-center gap-2">
              {" "}
              {ledger?.balance || 0}{" "}
              <Zap size={40} className="text-warning" />{" "}
            </div>{" "}
            <p className="text-muted small fw-semibold mb-0">
              TimeCoins (Hours)
            </p>{" "}
          </div>{" "}
        </div>{" "}
        {/* Ledger / History */}{" "}
        <div className="col-md-7 col-xl-8">
          {" "}
          <div className="bento-card p-4 h-100">
            {" "}
            <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
              {" "}
              <Repeat size={20} className="text-primary" /> Transaction
              History{" "}
            </h5>{" "}
            {ledger?.transactions?.length > 0 ? (
              <div className="table-responsive">
                <table className="table align-middle">
                  <tbody>
                    {ledger.transactions
                      .slice()
                      .reverse()
                      .map((tx) => (
                        <tr key={tx._id}>
                          <td>
                            
                            <div
                              className={`fw-bold ${tx.type === "Earned" ? "text-success" : "text-danger"}`}
                            >
                              {" "}
                              {tx.type === "Earned" ? "+1" : "-1"} Coin{" "}
                            </div>{" "}
                            <div
                              className="text-muted"
                              style={{ fontSize: "0.75rem" }}
                            >
                              {new Date(tx.timestamp).toLocaleDateString()}
                            </div>
                          </td><td>
                            
                            <div className="fw-semibold">
                              {tx.type === "Earned" ? "Taught" : "Learned"}{" "}
                              <span className="text-primary">{tx.skill}</span>
                            </div>{" "}
                            <div className="text-muted small">
                              with {tx.partner?.name || "Unknown"}
                            </div>
                          </td></tr>
                      ))}</tbody></table>
              </div>
            ) : (
              <div className="text-center p-4 bg-light rounded-3">
                {" "}
                <p className="text-muted mb-0">No transactions yet.</p>{" "}
              </div>
            )}{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
      <h4 className="fw-bold mb-4">Skills Market</h4>{" "}
      <div className="row g-4">
        {" "}
        {market.map((mkt, i) =>
          mkt.user.studentProfile?.skills?.map((skill, j) => (
            <div className="col-md-6 col-lg-4 col-xl-3" key={`${mkt._id}-${j}`}>
              {" "}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (i + j) * 0.05 }}
                className="bento-card p-4 h-100 d-flex flex-column"
              >
                {" "}
                <div className="d-flex align-items-center gap-3 mb-3">
                  {" "}
                  <div
                    className="bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold fs-5"
                    style={{ width: 48, height: 48 }}
                  >
                    {" "}
                    {mkt.user.name.charAt(0)}{" "}
                  </div>{" "}
                  <div>
                    {" "}
                    <h6 className="fw-bold mb-0">{mkt.user.name}</h6>{" "}
                    <div className="text-muted small">
                      Offers: <span className="fw-bold text-foreground">{skill}</span>
                    </div>{" "}
                  </div>{" "}
                </div>{" "}
                <div className="mt-auto pt-3 d-flex gap-2">
                  {" "}
                  <button
                    className="btn btn-outline-primary flex-fill rounded-pill d-flex align-items-center justify-content-center gap-2 text-nowrap"
                    onClick={() => {
                      setShowTransact({ user: mkt.user, skill });
                      setTransactType("Spent");
                    }}
                  >
                    {" "}
                    <BookOpen size={16} /> Learn{" "}
                  </button>{" "}
                  <button
                    className="btn btn-outline-success flex-fill rounded-pill d-flex align-items-center justify-content-center gap-2 text-nowrap"
                    onClick={() => {
                      setShowTransact({ user: mkt.user, skill });
                      setTransactType("Earned");
                    }}
                  >
                    {" "}
                    <GraduationCap size={16} /> Teach{" "}
                  </button>{" "}
                </div>{" "}
              </motion.div>{" "}
            </div>
          )),
        )}{" "}
      </div>{" "}
      {/* Transaction Modal */}{" "}
      <AnimatePresence>
        {" "}
        {showTransact && (
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
              justifyItems: "center",
              justifyContent: "center",
            }}
          >
            {" "}
            <div
              className="bento-card bg-card p-4"
              style={{ width: "90%", maxWidth: "400px" }}
            >
              {" "}
              <h4 className="fw-bold mb-3">Confirm Session</h4>{" "}
              <p className="text-muted mb-4">
                {" "}
                Did you just complete a 1-hour session about{" "}
                <strong>{showTransact.skill}</strong> with{" "}
                <strong>{showTransact.user.name}</strong>?{" "}
              </p>{" "}
              <div className="bg-light p-3 rounded-3 mb-4 text-center">
                {" "}
                {transactType === "Spent" ? (
                  <span className="text-danger fw-bold d-flex align-items-center justify-content-center gap-2">
                    {" "}
                    -1 TimeCoin <Zap size={16} />{" "}
                  </span>
                ) : (
                  <span className="text-success fw-bold d-flex align-items-center justify-content-center gap-2">
                    {" "}
                    +1 TimeCoin <Zap size={16} />{" "}
                  </span>
                )}{" "}
              </div>{" "}
              <div className="d-flex justify-content-end gap-2">
                {" "}
                <button
                  type="button"
                  className="btn btn-light rounded-pill px-4"
                  onClick={() => setShowTransact(null)}
                >
                  Cancel
                </button>{" "}
                <button
                  type="button"
                  className="btn btn-primary rounded-pill px-4"
                  onClick={handleTransaction}
                >
                  Confirm
                </button>{" "}
              </div>{" "}
            </div>{" "}
          </motion.div>
        )}{" "}
      </AnimatePresence>{" "}
    </div>
  );
};
export default TimeBank;
