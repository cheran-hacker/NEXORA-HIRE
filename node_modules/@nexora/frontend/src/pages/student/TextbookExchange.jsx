import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { textbookService } from "../../services/api.js";
import { BookMarked, RefreshCcw, Handshake, Search, Plus } from "lucide-react";
import { useToast } from "../../context/ToastContext";
const TextbookExchange = () => {
  const { addToast } = useToast();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({ haveBook: "", needBook: "" });
  useEffect(() => {
    fetchListings();
  }, []);
  const fetchListings = async () => {
    try {
      setLoading(true);
      const res = await textbookService.getListings();
      setListings(res.data.data || []);
    } catch (err) {
      addToast("Failed to load textbook listings", "error");
    } finally {
      setLoading(false);
    }
  };
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await textbookService.createListing(formData);
      addToast(
        "Your trade request is live in the exchange pool! 📚🔄",
        "success",
      );
      setShowAdd(false);
      setFormData({ haveBook: "", needBook: "" });
      fetchListings();
    } catch (err) {
      addToast("Failed to list textbook", "error");
    }
  };
  const handleTrade = async (id) => {
    try {
      await textbookService.proposeTrade(id);
      addToast(
        "Trade accepted! Check your messages to coordinate meetup. 🤝",
        "success",
      );
      fetchListings();
    } catch (err) {
      addToast(err.response?.data?.message || "Trade failed", "error");
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
            Textbook Exchange <RefreshCcw size={28} />{" "}
          </h2>{" "}
          <p className="text-muted mb-0">
            Stop buying $200 textbooks. Trade the ones you have for the ones you
            need.
          </p>{" "}
        </div>{" "}
        <button
          className="btn btn-dark rounded-pill px-4 shadow-sm fw-bold d-flex align-items-center gap-2"
          onClick={() => setShowAdd(true)}
        >
          {" "}
          <Plus size={20} /> List a Trade{" "}
        </button>{" "}
      </div>{" "}
      <div className="row g-4">
        {" "}
        {listings.map((listing, i) => (
          <div className="col-lg-4 col-md-6" key={listing._id}>
            {" "}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bento-card p-4 h-100 position-relative overflow-hidden border border-primary-subtle border-2"
            >
              {" "}
              <div className="d-flex justify-content-between align-items-center mb-4">
                {" "}
                <div className="d-flex align-items-center gap-2">
                  {" "}
                  <div
                    className="bg-card text-foreground rounded-circle d-flex align-items-center justify-content-center fw-bold"
                    style={{ width: 40, height: 40 }}
                  >
                    {" "}
                    {listing.student?.name?.charAt(0) || "?"}{" "}
                  </div>{" "}
                  <div>
                    {" "}
                    <div className="fw-bold fs-6 lh-1">
                      {listing.student?.name}
                    </div>{" "}
                    <div className="small text-muted">
                      is looking to trade
                    </div>{" "}
                  </div>{" "}
                </div>{" "}
              </div>{" "}
              <div className="d-flex flex-column gap-3 mb-4">
                {" "}
                {/* HAVE */}{" "}
                <div className="bg-primary-subtle p-3 rounded-3 position-relative">
                  {" "}
                  <div className="badge bg-primary position-absolute top-0 start-50 translate-middle rounded-pill border border-white">
                    HAVE
                  </div>{" "}
                  <div className="text-center mt-2 fw-black text-primary-emphasis fs-5">
                    {listing.haveBook}
                  </div>{" "}
                </div>{" "}
                <div className="text-center text-muted">
                  {" "}
                  <RefreshCcw size={20} className="opacity-50" />{" "}
                </div>{" "}
                {/* NEED */}{" "}
                <div className="bg-warning-subtle p-3 rounded-3 position-relative">
                  {" "}
                  <div className="badge bg-warning text-foreground position-absolute top-0 start-50 translate-middle rounded-pill border border-white">
                    NEED
                  </div>{" "}
                  <div className="text-center mt-2 fw-black text-warning-emphasis fs-5">
                    {listing.needBook}
                  </div>{" "}
                </div>{" "}
              </div>{" "}
              {listing.status === "Looking" ? (
                <button
                  className="btn btn-primary w-100 rounded-pill fw-bold py-2 d-flex align-items-center justify-content-center gap-2 shadow-sm"
                  onClick={() => handleTrade(listing._id)}
                >
                  {" "}
                  <Handshake size={18} /> Accept Trade{" "}
                </button>
              ) : (
                <div className="bg-light p-3 rounded-3 text-center border">
                  {" "}
                  <div className="small fw-bold text-muted mb-1 text-uppercase">
                    Escrow Status
                  </div>{" "}
                  <div className="badge bg-warning text-foreground mb-2">
                    {listing.escrowStatus}
                  </div>{" "}
                  <div className="small text-muted fst-italic">
                    Locker: {listing.inventoryStatus}
                  </div>{" "}
                  {listing.escrowStatus !== "Completed" && (
                    <button
                      className="btn btn-sm btn-outline-success w-100 mt-2 fw-bold"
                      onClick={async () => {
                        await textbookService.updateEscrow(
                          listing._id,
                          "Completed",
                        );
                        addToast("Escrow marked as completed!", "success");
                        fetchListings();
                      }}
                    >
                      {" "}
                      Mark Picked Up{" "}
                    </button>
                  )}{" "}
                </div>
              )}{" "}
            </motion.div>{" "}
          </div>
        ))}{" "}
        {listings.length === 0 && (
          <div className="col-12 text-center p-5 bento-card ">
            {" "}
            <BookMarked
              size={48}
              className="text-muted mb-3 opacity-25 mx-auto"
            />{" "}
            <h5 className="fw-bold text-muted">No trades available.</h5>{" "}
            <p className="text-muted small">
              Be the first to list a textbook you don't need anymore.
            </p>{" "}
          </div>
        )}{" "}
      </div>{" "}
      {/* List Trade Modal */}{" "}
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
                <div className="bg-card text-foreground rounded-circle d-inline-flex p-3 mb-3 shadow-sm">
                  {" "}
                  <RefreshCcw size={32} />{" "}
                </div>{" "}
                <h4 className="fw-bold">List a Trade</h4>{" "}
                <p className="text-muted small">
                  What book do you have? What do you want for it?
                </p>{" "}
              </div>{" "}
              <form onSubmit={handleCreate}>
                {" "}
                <div className="mb-3 p-3 bg-light rounded-3 border">
                  {" "}
                  <label className="form-label fw-bold text-primary mb-1">
                    I Have (Giving Away)
                  </label>{" "}
                  <div className="input-group">
                    {" "}
                    <span className="input-group-text bg-card border-end-0 text-muted">
                      <Search size={16} />
                    </span>{" "}
                    <input
                      type="text"
                      className="form-control border-start-0 ps-0 fw-semibold"
                      required
                      value={formData.haveBook}
                      onChange={(e) =>
                        setFormData({ ...formData, haveBook: e.target.value })
                      }
                      placeholder="e.g. Bio 101, 7th Edition"
                    />{" "}
                  </div>{" "}
                </div>{" "}
                <div className="text-center my-2 text-muted">
                  {" "}
                  <RefreshCcw size={20} />{" "}
                </div>{" "}
                <div className="mb-4 p-3 bg-light rounded-3 border">
                  {" "}
                  <label className="form-label fw-bold text-warning mb-1">
                    I Need (Receiving)
                  </label>{" "}
                  <div className="input-group">
                    {" "}
                    <span className="input-group-text bg-card border-end-0 text-muted">
                      <Search size={16} />
                    </span>{" "}
                    <input
                      type="text"
                      className="form-control border-start-0 ps-0 fw-semibold"
                      required
                      value={formData.needBook}
                      onChange={(e) =>
                        setFormData({ ...formData, needBook: e.target.value })
                      }
                      placeholder="e.g. Calc 201, 5th Edition"
                    />{" "}
                  </div>{" "}
                </div>{" "}
                <div className="d-flex justify-content-between gap-2">
                  {" "}
                  <button
                    type="button"
                    className="btn btn-light rounded-pill px-4 flex-grow-1"
                    onClick={() => setShowAdd(false)}
                  >
                    Cancel
                  </button>{" "}
                  <button
                    type="submit"
                    className="btn btn-dark rounded-pill px-4 fw-bold flex-grow-1"
                  >
                    Post Trade
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
export default TextbookExchange;
