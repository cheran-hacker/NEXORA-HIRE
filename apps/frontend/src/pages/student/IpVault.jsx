import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ipvaultService } from "../../services/api.js";
import {
  Shield,
  Fingerprint,
  Lock,
  CheckCircle,
  Plus,
  FileCode,
  Search,
} from "lucide-react";
import { useToast } from "../../context/ToastContext";
const IpVault = () => {
  const { addToast } = useToast();
  const [ips, setIps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    projectName: "",
    description: "",
  });
  useEffect(() => {
    fetchIps();
  }, []);
  const fetchIps = async () => {
    try {
      setLoading(true);
      const res = await ipvaultService.getMyIPs();
      setIps(res.data.data || []);
    } catch (err) {
      addToast("Failed to load IP Vault", "error");
    } finally {
      setLoading(false);
    }
  };
  const handleSecure = async (e) => {
    e.preventDefault();
    try {
      await ipvaultService.secureIP(formData);
      addToast("Project hashed and secured on ledger! 🔒", "success");
      setShowAdd(false);
      setFormData({ projectName: "", description: "" });
      fetchIps();
    } catch (err) {
      addToast("Failed to secure IP", "error");
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
          <h2 className="fw-black mb-1 text-foreground d-flex align-items-center gap-2">
            {" "}
            Intellectual Property Vault <Fingerprint size={28} />{" "}
          </h2>{" "}
          <p className="text-muted mb-0">
            Secure your project ideas and algorithms with an immutable timestamp
            on the campus ledger.
          </p>{" "}
        </div>{" "}
        <button
          className="btn btn-dark rounded-pill px-4 shadow-sm fw-bold d-flex align-items-center gap-2"
          onClick={() => setShowAdd(true)}
        >
          {" "}
          <Lock size={20} /> Secure New IP{" "}
        </button>{" "}
      </div>{" "}
      <div className="row g-4">
        {" "}
        {ips.map((ip, i) => (
          <div className="col-12" key={ip._id}>
            {" "}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bento-card bg-card p-4 d-flex align-items-center justify-content-between border border-2 border-dark"
            >
              {" "}
              <div className="d-flex align-items-center gap-4">
                {" "}
                <div className="bg-card text-foreground rounded-circle p-4 shadow-sm">
                  {" "}
                  <Shield size={32} />{" "}
                </div>{" "}
                <div>
                  {" "}
                  <h4 className="fw-black text-foreground mb-1 d-flex align-items-center gap-2">
                    {" "}
                    {ip.projectName}{" "}
                    {ip.status === "Secured" && (
                      <CheckCircle size={18} className="text-success" />
                    )}{" "}
                  </h4>{" "}
                  <p className="text-muted small mb-2">{ip.description}</p>{" "}
                  <div className="d-flex gap-4">
                    {" "}
                    <div>
                      {" "}
                      <div
                        className="small text-muted fw-bold text-uppercase"
                        style={{ fontSize: "0.7rem" }}
                      >
                        Ledger TxID
                      </div>{" "}
                      <code className="text-primary fw-bold bg-primary-subtle px-2 py-1 rounded">
                        {ip.txId}
                      </code>{" "}
                    </div>{" "}
                    <div>
                      {" "}
                      <div
                        className="small text-muted fw-bold text-uppercase"
                        style={{ fontSize: "0.7rem" }}
                      >
                        SHA-256 Signature
                      </div>{" "}
                      <code
                        className="text-foreground bg-light px-2 py-1 rounded d-inline-block text-truncate"
                        style={{ maxWidth: "200px" }}
                      >
                        {ip.fileHash}
                      </code>{" "}
                    </div>{" "}
                    <div>
                      {" "}
                      <div
                        className="small text-muted fw-bold text-uppercase"
                        style={{ fontSize: "0.7rem" }}
                      >
                        Timestamp
                      </div>{" "}
                      <span className="small fw-bold">
                        {new Date(ip.createdAt).toLocaleString()}
                      </span>{" "}
                    </div>{" "}
                  </div>{" "}
                </div>{" "}
              </div>{" "}
              <div className="text-center">
                {" "}
                <button
                  onClick={() => {
                    window.open(
                      `https://etherscan.io/search?q=${encodeURIComponent(ip.hash || ip._id)}`,
                      "_blank",
                    );
                    addToast("Opening blockchain verification...", "info");
                  }}
                  className="btn btn-outline-dark rounded-circle p-3"
                >
                  <Search size={20} />
                </button>{" "}
                <div className="small fw-bold mt-2">Verify</div>{" "}
              </div>{" "}
            </motion.div>{" "}
          </div>
        ))}{" "}
      </div>{" "}
      {/* Add Modal */}{" "}
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
                  <FileCode size={32} />{" "}
                </div>{" "}
                <h4 className="fw-bold">Secure Project</h4>{" "}
              </div>{" "}
              <form onSubmit={handleSecure}>
                {" "}
                <div className="mb-3">
                  {" "}
                  <label className="form-label fw-bold small">
                    Project / Algorithm Name
                  </label>{" "}
                  <input
                    type="text"
                    className="form-control fw-bold"
                    required
                    value={formData.projectName}
                    onChange={(e) =>
                      setFormData({ ...formData, projectName: e.target.value })
                    }
                  />{" "}
                </div>{" "}
                <div className="mb-4">
                  {" "}
                  <label className="form-label fw-bold small">
                    Description (Abstract)
                  </label>{" "}
                  <textarea
                    className="form-control"
                    rows="3"
                    required
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
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
                    className="btn btn-dark rounded-pill px-4 fw-bold"
                  >
                    Sign & Secure
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
export default IpVault;
