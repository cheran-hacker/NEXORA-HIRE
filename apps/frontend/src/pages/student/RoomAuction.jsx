import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { auctionService } from "../../services/api.js";
import { Gavel, Clock, MapPin, Zap, User, Coins, Award } from "lucide-react";
import { useToast } from "../../context/ToastContext";
const RoomAuction = () => {
  const { addToast } = useToast();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeRoom, setActiveRoom] = useState(null);
  const [bids, setBids] = useState([]);
  const [bidAmount, setBidAmount] = useState(""); // Simulated Karma Balance
  const [karmaBalance, setKarmaBalance] = useState(500);
  useEffect(() => {
    fetchRooms();
  }, []);
  const fetchRooms = async () => {
    try {
      setLoading(true);
      const res = await auctionService.getActiveAuctions();
      setRooms(res.data.data || []);
      if (res.data.data.length > 0) {
        handleSelectRoom(res.data.data[0]);
      }
    } catch (err) {
      addToast("Failed to load auction rooms", "error");
    } finally {
      setLoading(false);
    }
  };
  const handleSelectRoom = async (room) => {
    setActiveRoom(room);
    setBidAmount(room.basePriceKarma + 10);
    try {
      const res = await auctionService.getBidsForRoom(room.id || room._id);
      setBids(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };
  const handlePlaceBid = async (e) => {
    e.preventDefault();
    if (karmaBalance < bidAmount)
      return addToast(
        "Insufficient Karma Balance! Earn more by helping others.",
        "error",
      );
    try {
      await auctionService.placeBid(
        activeRoom.id || activeRoom._id,
        Number(bidAmount),
        "2026-10-15 14:00-16:00",
      );
      addToast("Bid placed successfully! 🔨", "success");
      setKarmaBalance((prev) => prev - bidAmount); // deduct locally for mvp
      handleSelectRoom(activeRoom); // refresh bids
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to place bid", "error");
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
            Study-Room Auction <Gavel size={28} />{" "}
          </h2>{" "}
          <p className="text-muted mb-0">
            Use your Campus Karma to bid on prime library study rooms.
          </p>{" "}
        </div>{" "}
        <div className="bg-warning bg-opacity-10 px-4 py-2 rounded-pill d-flex align-items-center gap-2 border border-warning">
          {" "}
          <Zap size={20} className="text-warning fill-warning" />{" "}
          <span className="fw-black text-warning-emphasis fs-5">
            {karmaBalance} Karma
          </span>{" "}
        </div>{" "}
      </div>{" "}
      <div className="row g-4">
        {" "}
        {/* Room List */}{" "}
        <div className="col-lg-4">
          {" "}
          <h5 className="fw-bold mb-3 text-muted">Available Rooms</h5>{" "}
          <div className="d-flex flex-column gap-3">
            {" "}
            {rooms.map((room) => (
              <div
                key={room._id}
                className={`bento-card p-3 cursor-pointer border-2 transition-fast ${activeRoom?._id === room._id ? "border-primary bg-primary-subtle shadow" : "border-light bg-card hover-shadow"}`}
                onClick={() => handleSelectRoom(room)}
              >
                {" "}
                <div className="d-flex justify-content-between align-items-start mb-2">
                  {" "}
                  <h6 className="fw-bold mb-0 text-foreground d-flex align-items-center gap-1">
                    <MapPin size={16} /> {room.roomName}
                  </h6>{" "}
                  <div className="badge bg-light rounded-pill px-2">
                    {room.capacity} Seats
                  </div>{" "}
                </div>{" "}
                <div className="small text-muted fw-bold d-flex align-items-center gap-1 mt-2">
                  {" "}
                  <Coins size={14} className="text-warning" /> Base Price:{" "}
                  {room.basePriceKarma} Karma{" "}
                </div>{" "}
              </div>
            ))}{" "}
          </div>{" "}
        </div>{" "}
        {/* Auction Panel */}{" "}
        <div className="col-lg-8">
          {" "}
          <AnimatePresence mode="wait">
            {" "}
            {activeRoom ? (
              <motion.div
                key={activeRoom._id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bento-card p-4 h-100 d-flex flex-column"
              >
                {" "}
                <div className="bg-card text-foreground p-4 rounded-3 mb-4 d-flex justify-content-between align-items-center">
                  {" "}
                  <div>
                    {" "}
                    <h3 className="fw-black mb-1">
                      {activeRoom.roomName}
                    </h3>{" "}
                    <div className="d-flex align-items-center gap-2 text-warning fw-bold">
                      {" "}
                      <Clock size={16} /> Time Slot: Oct 15, 2026 (2:00 PM -
                      4:00 PM){" "}
                    </div>{" "}
                  </div>{" "}
                  <Gavel size={48} className="opacity-25" />{" "}
                </div>{" "}
                <div className="row g-4 flex-grow-1">
                  {" "}
                  {/* Bid Form */}{" "}
                  <div className="col-md-5 border-end">
                    {" "}
                    <h5 className="fw-bold mb-3 text-foreground">
                      Place Your Bid
                    </h5>{" "}
                    <form onSubmit={handlePlaceBid}>
                      {" "}
                      <div className="mb-3">
                        {" "}
                        <label className="form-label small fw-bold text-muted">
                          Bid Amount (Karma)
                        </label>{" "}
                        <div className="input-group input-group-lg">
                          {" "}
                          <span className="input-group-text bg-warning-subtle text-warning-emphasis border-warning fw-black">
                            <Zap size={20} />
                          </span>{" "}
                          <input
                            type="number"
                            className="form-control border-warning fw-bold fs-4 text-foreground"
                            required
                            value={bidAmount}
                            onChange={(e) => setBidAmount(e.target.value)}
                            min={activeRoom.basePriceKarma}
                          />{" "}
                        </div>{" "}
                      </div>{" "}
                      <button
                        type="submit"
                        className="btn btn-primary w-100 py-3 rounded-pill fw-bold fs-5 shadow"
                      >
                        {" "}
                        Submit Bid{" "}
                      </button>{" "}
                    </form>{" "}
                    <div className="alert alert-info mt-4 small fw-bold">
                      {" "}
                      Highest bidder at the end of the auction secures the room.
                      Outbid students get their Karma refunded.{" "}
                    </div>{" "}
                  </div>{" "}
                  {/* Bid History */}{" "}
                  <div className="col-md-7">
                    {" "}
                    <h5 className="fw-bold mb-3 text-foreground d-flex align-items-center justify-content-between">
                      {" "}
                      Bid History{" "}
                      <div
                        className="spinner-grow spinner-grow-sm text-danger"
                        role="status"
                      ></div>{" "}
                    </h5>{" "}
                    <div
                      className="d-flex flex-column gap-2 overflow-auto"
                      style={{ maxHeight: "300px" }}
                    >
                      {" "}
                      {bids.map((bid, i) => (
                        <div
                          key={bid._id}
                          className={`p-3 rounded-3 d-flex justify-content-between align-items-center border ${i === 0 ? "bg-success-subtle border-success" : "bg-light border-light"}`}
                        >
                          {" "}
                          <div className="d-flex align-items-center gap-2">
                            {" "}
                            {i === 0 && (
                              <Award size={20} className="text-success" />
                            )}{" "}
                            {i !== 0 && (
                              <User size={20} className="text-muted" />
                            )}{" "}
                            <div>
                              {" "}
                              <div
                                className={`fw-bold ${i === 0 ? "text-success-emphasis" : "text-foreground"}`}
                              >
                                {bid.student?.name}
                              </div>{" "}
                              <div className="small text-muted">
                                {new Date(bid.createdAt).toLocaleTimeString()}
                              </div>{" "}
                            </div>{" "}
                          </div>{" "}
                          <div className="fs-5 fw-black d-flex align-items-center gap-1">
                            {" "}
                            <Zap
                              size={16}
                              className={
                                i === 0 ? "text-success" : "text-muted"
                              }
                            />{" "}
                            {bid.bidAmount}{" "}
                          </div>{" "}
                        </div>
                      ))}{" "}
                      {bids.length === 0 && (
                        <div className="text-center p-4 text-muted fst-italic">
                          {" "}
                          No bids placed yet. Be the first!{" "}
                        </div>
                      )}{" "}
                    </div>{" "}
                  </div>{" "}
                </div>{" "}
              </motion.div>
            ) : (
              <div className="bento-card h-100 d-flex align-items-center justify-content-center text-muted">
                {" "}
                Select a room to view auction details.{" "}
              </div>
            )}{" "}
          </AnimatePresence>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
};
export default RoomAuction;
