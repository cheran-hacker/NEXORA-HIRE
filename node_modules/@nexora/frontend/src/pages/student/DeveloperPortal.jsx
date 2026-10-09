import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { developerService } from "../../services/api.js";
import {
  Code2,
  Key,
  TerminalSquare,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  Zap,
  Plus,
  ExternalLink,
} from "lucide-react";
import { useToast } from "../../context/ToastContext";
const DeveloperPortal = () => {
  const { addToast } = useToast();
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appName, setAppName] = useState("");
  const [showKeyId, setShowKeyId] = useState(null);
  useEffect(() => {
    fetchKeys();
  }, []);
  const fetchKeys = async () => {
    try {
      setLoading(true);
      const res = await developerService.getMyKeys();
      setKeys(res.data.data || []);
    } catch (err) {
      addToast("Failed to load API keys", "error");
    } finally {
      setLoading(false);
    }
  };
  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!appName) return addToast("App Name is required", "error");
    try {
      await developerService.generateKey({ appName });
      addToast("API Key Generated Successfully! 🔑", "success");
      setAppName("");
      fetchKeys();
    } catch (err) {
      addToast("Failed to generate key", "error");
    }
  };
  const handleRevoke = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to revoke this key? Any app using it will immediately break.",
      )
    )
      return;
    try {
      await developerService.revokeKey(id);
      addToast("API Key Revoked ❌", "success");
      fetchKeys();
    } catch (err) {
      addToast("Failed to revoke key", "error");
    }
  };
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    addToast("Copied to clipboard!", "success");
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
            Developer API Portal <Code2 size={28} />{" "}
          </h2>{" "}
          <p className="text-muted mb-0">
            Build your own tools using campus data. Generate a read-only API key
            to get started.
          </p>{" "}
        </div>{" "}
        <button
          onClick={() => window.open("/api-docs", "_blank")}
          className="btn btn-dark rounded-pill px-4 shadow-sm fw-bold d-flex align-items-center gap-2"
        >
          {" "}
          <TerminalSquare size={20} /> Read the Docs{" "}
          <ExternalLink size={14} />{" "}
        </button>{" "}
      </div>{" "}
      <div className="row g-4">
        {" "}
        <div className="col-lg-4">
          {" "}
          <div className="bento-card p-4 h-100 border border-primary border-2 shadow-sm">
            {" "}
            <h4 className="fw-black mb-4 d-flex align-items-center gap-2">
              <Key size={24} /> Generate New Key
            </h4>{" "}
            <form onSubmit={handleGenerate}>
              {" "}
              <div className="mb-4">
                {" "}
                <label className="form-label fw-bold small text-muted">
                  Application Name
                </label>{" "}
                <input
                  type="text"
                  className="form-control fw-bold"
                  placeholder="e.g. My Campus Discord Bot"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  required
                />{" "}
              </div>{" "}
              <button
                type="submit"
                className="btn btn-primary w-100 rounded-pill fw-bold d-flex justify-content-center align-items-center gap-2 py-3 shadow-sm"
              >
                {" "}
                <Plus size={18} /> Generate API Key{" "}
              </button>{" "}
            </form>{" "}
            <hr className="my-4" />{" "}
            <div className="bg-light p-3 rounded-3 border">
              {" "}
              <h6 className="fw-bold mb-2 text-foreground">
                <Zap size={16} className="text-warning" /> Rate Limits
              </h6>{" "}
              <p className="small text-muted mb-0">
                Standard tier API keys are limited to{" "}
                <strong>100 requests per minute</strong>. For production
                scaling, contact Campus IT.
              </p>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
        <div className="col-lg-8">
          {" "}
          <div className="bento-card p-4 h-100">
            {" "}
            <h4 className="fw-black mb-4 d-flex align-items-center gap-2 text-foreground">
              Active Keys
            </h4>{" "}
            <div className="d-flex flex-column gap-3">
              {" "}
              {keys.map((key) => (
                <div
                  key={key._id}
                  className={`p-4 rounded-3 border ${key.status === "Active" ? "bg-card border-success-subtle shadow-sm" : "bg-light border-danger-subtle opacity-75"}`}
                >
                  {" "}
                  <div className="d-flex justify-content-between align-items-start mb-3 flex-wrap gap-2">
                    {" "}
                    <div>
                      {" "}
                      <h5 className="fw-bold mb-1">{key.appName}</h5>{" "}
                      <span
                        className={`badge ${key.status === "Active" ? "bg-success" : "bg-danger"} small rounded-pill`}
                      >
                        {key.status}
                      </span>{" "}
                    </div>{" "}
                    <div className="text-end">
                      {" "}
                      <div className="small text-muted fw-bold">
                        Total Requests
                      </div>{" "}
                      <div className="fs-5 fw-black text-primary">
                        {key.requestsCount}
                      </div>{" "}
                    </div>{" "}
                  </div>{" "}
                  <div className="bg-card text-foreground p-3 rounded d-flex justify-content-between align-items-center mb-3">
                    {" "}
                    <code className="text-foreground user-select-all fs-6">
                      {" "}
                      {key.status === "Revoked"
                        ? "••••••••••••••••••••••••"
                        : showKeyId === key._id
                          ? key.keyString
                          : "••••••••••••••••••••••••"}{" "}
                    </code>{" "}
                    <div className="d-flex gap-2">
                      {" "}
                      <button
                        className="btn btn-sm btn-outline-light rounded-circle p-2"
                        onClick={() =>
                          setShowKeyId(showKeyId === key._id ? null : key._id)
                        }
                        disabled={key.status === "Revoked"}
                      >
                        {" "}
                        {showKeyId === key._id ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}{" "}
                      </button>{" "}
                      <button
                        className="btn btn-sm btn-light rounded-circle p-2"
                        onClick={() => copyToClipboard(key.keyString)}
                        disabled={key.status === "Revoked"}
                      >
                        {" "}
                        <Copy size={16} />{" "}
                      </button>{" "}
                    </div>{" "}
                  </div>{" "}
                  {key.status === "Active" && (
                    <div className="text-end">
                      {" "}
                      <button
                        className="btn btn-sm btn-outline-danger fw-bold rounded-pill px-3"
                        onClick={() => handleRevoke(key._id)}
                      >
                        {" "}
                        <Trash2 size={14} className="me-1" /> Revoke Key{" "}
                      </button>{" "}
                    </div>
                  )}{" "}
                </div>
              ))}{" "}
              {keys.length === 0 && (
                <div className="text-center p-5 text-muted">
                  {" "}
                  <Key size={48} className="mb-3 opacity-25" />{" "}
                  <h5 className="fw-bold">No API Keys Generated</h5>{" "}
                  <p className="small">
                    Generate a key to start building cool stuff.
                  </p>{" "}
                </div>
              )}{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
};
export default DeveloperPortal;
