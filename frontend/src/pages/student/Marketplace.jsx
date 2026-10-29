import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { listingService } from "../../services/api.js";
import {
  ShoppingBag,
  Plus,
  Tag,
  DollarSign,
  MapPin,
  Search,
} from "lucide-react";
import { useToast } from "../../context/ToastContext";
const Marketplace = () => {
  const { addToast } = useToast();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: 0,
    category: "Misc",
  });
  useEffect(() => {
    fetchListings();
  }, []);
  const fetchListings = async () => {
    try {
      setLoading(true);
      const res = await listingService.getListings();
      setListings(res.data.data || []);
    } catch (err) {
      addToast("Failed to load marketplace", "error");
    } finally {
      setLoading(false);
    }
  };
  const handleCreate = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      await listingService.createListing(formData);
      addToast("Item listed on Campus Marketplace! 🛒", "success");
      setShowAdd(false);
      setFormData({ title: "", description: "", price: 0, category: "Misc" });
      fetchListings();
    } catch (err) {
      addToast("Failed to list item", "error");
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleBuy = (title) => {
    addToast(
      `Message sent to seller for: ${title}! Check your DMs.`,
      "success",
    );
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
            Campus Marketplace <ShoppingBag size={28} />{" "}
          </h2>{" "}
          <p className="text-muted mb-0">
            Buy and sell securely with verified campus students. No scammers.
          </p>{" "}
        </div>{" "}
        <button
          className="btn btn-primary rounded-pill px-4 shadow-sm"
          onClick={() => setShowAdd(true)}
        >
          {" "}
          <Plus size={20} className="me-2" /> List an Item{" "}
        </button>{" "}
      </div>{" "}
      <div className="row g-4">
        {" "}
        {listings.map((item, i) => (
          <div className="col-md-6 col-lg-4 col-xl-3" key={item._id}>
            {" "}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bento-card h-100 d-flex flex-column p-0 overflow-hidden"
            >
              {" "}
              <div
                className="bg-light p-4 d-flex justify-content-center align-items-center"
                style={{ height: 180, background: "var(--surface-1)" }}
              >
                {" "}
                <Tag size={64} className="text-muted opacity-25" />{" "}
              </div>{" "}
              <div className="p-4 d-flex flex-column flex-grow-1">
                {" "}
                <div className="d-flex justify-content-between align-items-start mb-2">
                  {" "}
                  <h5 className="fw-bold mb-0 text-truncate" title={item.title}>
                    {item.title}
                  </h5>{" "}
                  <span className="badge bg-success text-white px-2 py-1 fs-6">
                    ${item.price}
                  </span>{" "}
                </div>{" "}
                <div className="text-muted small fw-bold mb-3 d-flex align-items-center gap-1">
                  {" "}
                  <MapPin size={12} /> Listed by {item.seller?.name}{" "}
                </div>{" "}
                <p
                  className="small text-muted mb-4 text-truncate-2"
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {" "}
                  {item.description}{" "}
                </p>{" "}
                <div className="mt-auto">
                  {" "}
                  <button
                    className="btn btn-outline-primary w-100 rounded-pill fw-bold"
                    onClick={() => handleBuy(item.title)}
                  >
                    {" "}
                    Contact Seller{" "}
                  </button>{" "}
                </div>{" "}
              </div>{" "}
            </motion.div>{" "}
          </div>
        ))}{" "}
        {listings.length === 0 && (
          <div className="col-12">
            {" "}
            <div className="text-center p-5 bento-card ">
              {" "}
              <ShoppingBag
                size={48}
                className="text-muted mb-3 opacity-50 mx-auto"
              />{" "}
              <h5 className="fw-bold">No items listed right now.</h5>{" "}
              <p className="text-muted">
                Need to get rid of an old mini-fridge? List it here.
              </p>{" "}
            </div>{" "}
          </div>
        )}{" "}
      </div>{" "}
      {/* Add Listing Modal */}{" "}
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
              <h4 className="fw-bold mb-4">List an Item</h4>{" "}
              <form onSubmit={handleCreate}>
                {" "}
                <div className="mb-3">
                  {" "}
                  <label className="form-label fw-bold">Title</label>{" "}
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="e.g. lightly used Mini Fridge"
                  />{" "}
                </div>{" "}
                <div className="row mb-3">
                  {" "}
                  <div className="col-6">
                    {" "}
                    <label className="form-label fw-bold">Price ($)</label>{" "}
                    <input
                      type="number"
                      min="0"
                      className="form-control"
                      required
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          price: Number(e.target.value),
                        })
                      }
                    />{" "}
                  </div>{" "}
                  <div className="col-6">
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
                      {[
                        "Textbooks",
                        "Electronics",
                        "Furniture",
                        "Clothing",
                        "Misc",
                      ].map((c) => (
                        <option key={c}>{c}</option>
                      ))}{" "}
                    </select>{" "}
                  </div>{" "}
                </div>{" "}
                <div className="mb-4">
                  {" "}
                  <label className="form-label fw-bold">Description</label>{" "}
                  <textarea
                    className="form-control"
                    rows="3"
                    required
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Condition, pickup location, etc."
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
                    disabled={isSubmitting}
                  >
                    {" "}
                    {isSubmitting ? (
                      <span className="spinner-border spinner-border-sm me-2"></span>
                    ) : null}{" "}
                    Post Listing{" "}
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
export default Marketplace;
