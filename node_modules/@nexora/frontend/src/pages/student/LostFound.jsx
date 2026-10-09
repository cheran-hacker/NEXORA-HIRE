import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { lostfoundService } from "../../services/api.js";
import {
  Search,
  Plus,
  MapPin,
  Sparkles,
  CheckCircle,
  Package,
} from "lucide-react";
import { useToast } from "../../context/ToastContext";
const LostFound = () => {
  const { addToast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    description: "",
    locationFound: "",
  });
  useEffect(() => {
    fetchItems();
  }, [searchQuery]);
  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await lostfoundService.getFoundItems(searchQuery);
      setItems(res.data.data || []);
    } catch (err) {
      addToast("Failed to load items", "error");
    } finally {
      setLoading(false);
    }
  };
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await lostfoundService.createFoundItem(formData);
      addToast(
        "Item reported! The AI has auto-tagged it for searchability. 🤖",
        "success",
      );
      setShowAdd(false);
      setFormData({ description: "", locationFound: "" });
      fetchItems();
    } catch (err) {
      addToast("Failed to report item", "error");
    }
  };
  const handleClaim = async (id) => {
    try {
      await lostfoundService.claimItem(id);
      addToast("Claim request sent! The finder will be notified.", "success");
      fetchItems();
    } catch (err) {
      addToast("Failed to claim item", "error");
    }
  };
  if (loading && items.length === 0)
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
            Smart Lost & Found <Package size={28} />{" "}
          </h2>{" "}
          <p className="text-muted mb-0">
            Lose something? Type what you lost. AI tags match it instantly.
          </p>{" "}
        </div>{" "}
        <div className="d-flex gap-3 align-items-center">
          {" "}
          <div className="input-group" style={{ width: "300px" }}>
            {" "}
            <span className="input-group-text bg-card border-end-0 text-muted">
              <Search size={18} />
            </span>{" "}
            <input
              type="text"
              className="form-control border-start-0 ps-0"
              placeholder="e.g. blue water bottle"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />{" "}
          </div>{" "}
          <button
            className="btn btn-primary rounded-pill px-4 shadow-sm text-nowrap"
            onClick={() => setShowAdd(true)}
          >
            {" "}
            <Plus size={20} className="me-2" /> Report Found Item{" "}
          </button>{" "}
        </div>{" "}
      </div>{" "}
      <div className="row g-4">
        {" "}
        {items.map((item, i) => (
          <div className="col-md-6 col-lg-4" key={item._id}>
            {" "}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="bento-card p-4 h-100 d-flex flex-column"
            >
              {" "}
              <div className="d-flex justify-content-between align-items-start mb-3">
                {" "}
                <div className="d-flex align-items-center gap-2 text-primary fw-bold small bg-primary-subtle px-3 py-1 rounded-pill">
                  {" "}
                  <Sparkles size={14} /> AI Tagged{" "}
                </div>{" "}
                <span className="small text-muted">
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>{" "}
              </div>{" "}
              <h5 className="fw-bold mb-2">{item.description}</h5>{" "}
              <div className="text-muted small mb-3 d-flex align-items-center gap-1">
                {" "}
                <MapPin size={14} /> Found at:{" "}
                <strong>{item.locationFound}</strong>{" "}
              </div>{" "}
              <div className="d-flex flex-wrap gap-2 mb-4">
                {" "}
                {item.aiTags?.map((tag, j) => (
                  <span
                    key={j}
                    className="badge bg-light text-foreground border border-opacity-25 px-2 py-1 rounded-3 small"
                  >
                    {" "}
                    {tag}{" "}
                  </span>
                ))}{" "}
              </div>{" "}
              <div
                className="mt-auto pt-3 border-top d-flex justify-content-between align-items-center"
                style={{ borderColor: "var(--border) !important" }}
              >
                {" "}
                <div className="small text-muted">
                  Found by {item.finder?.name}
                </div>{" "}
                <button
                  className="btn btn-sm btn-outline-primary rounded-pill px-3 fw-bold"
                  onClick={() => handleClaim(item._id)}
                >
                  {" "}
                  It's Mine!{" "}
                </button>{" "}
              </div>{" "}
            </motion.div>{" "}
          </div>
        ))}{" "}
        {items.length === 0 && !loading && (
          <div className="col-12">
            {" "}
            <div className="text-center p-5 bento-card ">
              {" "}
              <Search
                size={48}
                className="text-muted mb-3 opacity-50 mx-auto"
              />{" "}
              <h5 className="fw-bold">No items found matching your search.</h5>{" "}
              <p className="text-muted">Hopefully it turns up soon!</p>{" "}
            </div>{" "}
          </div>
        )}{" "}
      </div>{" "}
      {/* Report Found Item Modal */}{" "}
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
              <h4 className="fw-bold mb-4">Report Found Item</h4>{" "}
              <form onSubmit={handleCreate}>
                {" "}
                <div className="mb-3">
                  {" "}
                  <label className="form-label fw-bold">
                    Describe the item
                  </label>{" "}
                  <textarea
                    className="form-control"
                    rows="2"
                    required
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="e.g. Found a blue hydroflask water bottle with a Github sticker."
                  ></textarea>{" "}
                  <div className="form-text text-primary small d-flex align-items-center gap-1 mt-2">
                    {" "}
                    <Sparkles size={12} /> AI will automatically read this
                    description and tag key features for searchability.{" "}
                  </div>{" "}
                </div>{" "}
                <div className="mb-4">
                  {" "}
                  <label className="form-label fw-bold">
                    Location Found
                  </label>{" "}
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={formData.locationFound}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        locationFound: e.target.value,
                      })
                    }
                    placeholder="e.g. Library 2nd Floor desk"
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
                    className="btn btn-primary rounded-pill px-4"
                  >
                    Submit to AI Matcher
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
export default LostFound;
