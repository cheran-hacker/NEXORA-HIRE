import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { talentExchangeService } from "../../services/api.js";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  PieChart,
  Info,
} from "lucide-react";
import { useToast } from "../../context/ToastContext";
const TalentExchange = () => {
  const { addToast } = useToast();
  const [market, setMarket] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInvest, setShowInvest] = useState(null);
  const [sharesToBuy, setSharesToBuy] = useState(10);
  useEffect(() => {
    fetchData();
  }, []);
  const fetchData = async () => {
    try {
      setLoading(true);
      const [marketRes, portRes] = await Promise.all([
        talentExchangeService.getMarketOverview(),
        talentExchangeService.getMyPortfolio(),
      ]);
      setMarket(marketRes.data.data || []);
      setPortfolio(portRes.data.data || []);
    } catch (err) {
      addToast("Failed to load Talent Exchange", "error");
    } finally {
      setLoading(false);
    }
  };
  const handleInvest = async (e) => {
    e.preventDefault();
    try {
      await talentExchangeService.investInStudent({
        stockProfileId: showInvest._id,
        shares: sharesToBuy,
      });
      addToast(
        `Successfully invested in ${showInvest.student?.name}! 📈`,
        "success",
      );
      setShowInvest(null);
      setSharesToBuy(10);
      fetchData();
    } catch (err) {
      addToast("Investment failed", "error");
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
      <div className="mb-5">
        {" "}
        <h2 className="fw-black mb-1 text-gradient-primary d-flex align-items-center gap-2">
          {" "}
          Talent Exchange <Activity size={28} />{" "}
        </h2>{" "}
        <p className="text-muted mb-0">
          The Campus Stock Market. Invest virtual points in your peers. Their
          stock price rises as they ace assessments and land jobs.
        </p>{" "}
      </div>{" "}
      <div className="row g-4">
        {" "}
        {/* Market Overview */}{" "}
        <div className="col-lg-8">
          {" "}
          <div className="bento-card p-4 h-100">
            {" "}
            <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
              <TrendingUp className="text-success" /> Market Top Performers
            </h5>{" "}
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr className="text-muted small text-uppercase">
                    <th>Student (Ticker)</th> <th>Current Price</th><th>Trend</th> <th>Action</th></tr></thead>
                <tbody>
                  {market.map((profile, i) => (
                    <tr key={profile._id}>
                      <td>
                        
                        <div className="d-flex align-items-center gap-2">
                          {" "}
                          <div
                            className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold small"
                            style={{ width: 32, height: 32 }}
                          >
                            {" "}
                            {profile.student?.name?.charAt(0)}{" "}
                          </div>{" "}
                          <span className="fw-bold">
                            {profile.student?.name}
                          </span>{" "}
                        </div>
                      </td><td className="fw-bold fs-5 text-foreground">
                        ${profile.currentPrice.toFixed(2)}
                      </td><td>
                        
                        <span className="badge bg-success-subtle text-success-emphasis rounded-pill">
                          {" "}
                          <TrendingUp size={14} className="me-1" /> +1.2%{" "}
                        </span>
                      </td><td>
                        
                        <button
                          className="btn btn-sm btn-outline-primary rounded-pill px-3 fw-bold"
                          onClick={() => setShowInvest(profile)}
                        >
                          {" "}
                          Invest{" "}
                        </button>
                      </td></tr>
                  ))}{" "}
                  {market.length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center py-4 text-muted">
                        Market is empty.
                      </td>
                    </tr>
                  )}</tbody></table>
            </div>{" "}
          </div>{" "}
        </div>{" "}
        {/* My Portfolio */}{" "}
        <div className="col-lg-4">
          {" "}
          <div className="bento-card p-4 h-100 bg-primary-subtle text-primary-emphasis">
            {" "}
            <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
              <PieChart size={20} /> My Portfolio
            </h5>{" "}
            {portfolio.length > 0 ? (
              <div className="d-flex flex-column gap-3">
                {" "}
                {portfolio.map((inv) => {
                  const currentVal =
                    inv.stockProfile?.currentPrice * inv.sharesOwned;
                  const profit =
                    currentVal - inv.averageBuyPrice * inv.sharesOwned;
                  const isProfit = profit >= 0;
                  return (
                    <div
                      className="bg-card p-3 rounded-4 shadow-sm"
                      key={inv._id}
                    >
                      {" "}
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        {" "}
                        <span className="fw-bold">
                          {inv.stockProfile?.student?.name}
                        </span>{" "}
                        <span className="small text-muted">
                          {inv.sharesOwned} shares
                        </span>{" "}
                      </div>{" "}
                      <div className="d-flex justify-content-between align-items-end">
                        {" "}
                        <span className="fs-5 fw-black">
                          ${currentVal.toFixed(2)}
                        </span>{" "}
                        <span
                          className={`small fw-bold ${isProfit ? "text-success" : "text-danger"}`}
                        >
                          {" "}
                          {isProfit ? "+" : ""}${profit.toFixed(2)}{" "}
                        </span>{" "}
                      </div>{" "}
                    </div>
                  );
                })}{" "}
              </div>
            ) : (
              <div className="text-center py-5">
                {" "}
                <DollarSign
                  size={48}
                  className="mb-3 opacity-25 mx-auto"
                />{" "}
                <h6>No Investments Yet</h6>{" "}
                <p className="small opacity-75">
                  Start backing your friends on the exchange.
                </p>{" "}
              </div>
            )}{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
      {/* Invest Modal */}{" "}
      <AnimatePresence>
        {" "}
        {showInvest && (
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
              <h4 className="fw-bold mb-1">Buy Shares</h4>{" "}
              <p className="text-muted small">
                Investing in {showInvest.student?.name}
              </p>{" "}
              <div className="bg-light p-3 rounded-3 mb-4 text-center">
                {" "}
                <div className="text-muted small">Current Price</div>{" "}
                <div className="fs-3 fw-black text-primary">
                  ${showInvest.currentPrice.toFixed(2)}
                </div>{" "}
              </div>{" "}
              <form onSubmit={handleInvest}>
                {" "}
                <div className="mb-4">
                  {" "}
                  <label className="form-label fw-bold">
                    Number of Shares
                  </label>{" "}
                  <input
                    type="number"
                    min="1"
                    className="form-control form-control-lg"
                    required
                    value={sharesToBuy}
                    onChange={(e) => setSharesToBuy(Number(e.target.value))}
                  />{" "}
                  <div className="form-text text-end fw-bold mt-2">
                    {" "}
                    Total Cost: $
                    {(showInvest.currentPrice * sharesToBuy).toFixed(2)}{" "}
                  </div>{" "}
                </div>{" "}
                <div className="d-flex justify-content-end gap-2">
                  {" "}
                  <button
                    type="button"
                    className="btn btn-light rounded-pill px-4"
                    onClick={() => setShowInvest(null)}
                  >
                    Cancel
                  </button>{" "}
                  <button
                    type="submit"
                    className="btn btn-primary rounded-pill px-4 fw-bold"
                  >
                    Execute Trade
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
export default TalentExchange;
