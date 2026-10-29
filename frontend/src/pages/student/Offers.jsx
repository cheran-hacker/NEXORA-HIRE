import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Briefcase, Download, CheckCircle, XCircle, Clock } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { offerService } from "../../services/api";
const Offers = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [offers, setOffers] = useState([]);
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const res = await offerService.getOffers();
        setOffers(res.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
  }, []);
  const handleAction = (id, newStatus) => {
    setOffers(
      offers.map((o) => (o.id === id ? { ...o, status: newStatus } : o)),
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
          <Briefcase size={32} className="text-primary" /> Job Offers{" "}
        </h2>{" "}
        <p className="text-muted fw-medium">
          Manage and review your placement and internship offers.
        </p>{" "}
      </motion.div>{" "}
      <div className="row g-4">
        {" "}
        {offers.map((offer, idx) => (
          <div className="col-md-6 col-lg-4" key={offer._id || offer.id}>
            {" "}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="bento-card p-4 h-100 d-flex flex-column"
            >
              {" "}
              <div className="d-flex justify-content-between align-items-start mb-3">
                {" "}
                <div className="d-flex align-items-center gap-3">
                  {" "}
                  <div
                    className="rounded-3 d-flex align-items-center justify-content-center text-foreground fw-bold fs-5 shadow-sm"
                    style={{
                      width: 48,
                      height: 48,
                      background:
                        "linear-gradient(135deg, var(--primary), var(--purple))",
                    }}
                  >
                    {" "}
                    {offer.company.charAt(0)}{" "}
                  </div>{" "}
                  <div>
                    {" "}
                    <h5 className="fw-bold mb-0">{offer.company}</h5>{" "}
                    <small className="text-muted fw-semibold">
                      {offer.role}
                    </small>{" "}
                  </div>{" "}
                </div>{" "}
                {offer.status === "Pending" && (
                  <span className="badge bg-warning text-foreground px-3 py-2 rounded-pill">
                    <Clock size={12} /> Pending
                  </span>
                )}{" "}
                {offer.status === "Accepted" && (
                  <span className="badge bg-success px-3 py-2 rounded-pill">
                    <CheckCircle size={12} /> Accepted
                  </span>
                )}{" "}
                {offer.status === "Rejected" && (
                  <span className="badge bg-danger px-3 py-2 rounded-pill">
                    <XCircle size={12} /> Rejected
                  </span>
                )}{" "}
              </div>{" "}
              <div className="mt-3 p-3 rounded-4 bg-light border mb-4 flex-grow-1">
                {" "}
                <div className="d-flex justify-content-between mb-2">
                  {" "}
                  <span className="text-muted small">Package</span>{" "}
                  <span className="fw-bold text-success">
                    {offer.package}
                  </span>{" "}
                </div>{" "}
                <div className="d-flex justify-content-between">
                  {" "}
                  <span className="text-muted small">Joining Date</span>{" "}
                  <span className="fw-bold">
                    {new Date(offer.joiningDate).toLocaleDateString()}
                  </span>{" "}
                </div>{" "}
              </div>{" "}
              <div className="d-flex gap-2">
                {" "}
                <a
                  href={offer.offerLetterUrl}
                  className="btn btn-outline-secondary w-100 fw-bold rounded-pill d-flex align-items-center justify-content-center gap-2"
                >
                  {" "}
                  <Download size={16} /> Letter{" "}
                </a>{" "}
                {offer.status === "Pending" && (
                  <>
                    {" "}
                    <button
                      onClick={() => handleAction(offer.id, "Accepted")}
                      className="btn btn-success w-100 fw-bold rounded-pill"
                    >
                      Accept
                    </button>{" "}
                    <button
                      onClick={() => handleAction(offer.id, "Rejected")}
                      className="btn btn-outline-danger w-100 fw-bold rounded-pill"
                    >
                      Reject
                    </button>{" "}
                  </>
                )}{" "}
              </div>{" "}
            </motion.div>{" "}
          </div>
        ))}{" "}
      </div>{" "}
    </div>
  );
};
export default Offers;
