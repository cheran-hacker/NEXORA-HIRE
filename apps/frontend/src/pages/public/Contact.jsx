import React, { useState } from "react";
import { Mail, MessageSquare, Send, MapPin, Phone } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "../../context/ToastContext";
import { contactService } from "../../services/api";
export default function Contact() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    message: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await contactService.sendMessage({
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        subject: 'General Inquiry',
        message: formData.message
      });
      addToast("Your message has been sent to our team!", "success");
      setFormData({ firstName: "", lastName: "", email: "", message: "" });
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to send message", "error");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div
      className="container-fluid py-5 px-xl-5"
      style={{
        background: "var(--bg)",
        minHeight: "100dvh",
        color: "var(--text)",
      }}
    >
      {" "}
      <div className="container py-5" style={{ maxWidth: "900px" }}>
        {" "}
        <div className="text-center mb-5">
          {" "}
          <h1
            className="fw-black mb-3 display-4"
            style={{ color: "var(--text)" }}
          >
            {" "}
            Get in <span className="text-primary">Touch</span>{" "}
          </h1>{" "}
          <p className="fs-5" style={{ color: "var(--text-secondary)" }}>
            {" "}
            Have a question, feedback, or need support? Our team is here to
            help.{" "}
          </p>{" "}
        </div>{" "}
        <div className="row g-5 align-items-center">
          {" "}
          {/* Contact Info */}{" "}
          <div className="col-lg-4">
            {" "}
            <div className="bento-card p-4 mb-4 d-flex align-items-start gap-3 hover-glow">
              {" "}
              <div
                className="rounded-3 p-3 shadow-sm flex-shrink-0"
                style={{
                  background: "rgba(var(--primary-rgb), 0.1)",
                  color: "var(--primary)",
                }}
              >
                {" "}
                <Mail size={24} />{" "}
              </div>{" "}
              <div>
                {" "}
                <h5 className="fw-bold mb-1" style={{ color: "var(--text)" }}>
                  Email Us
                </h5>{" "}
                <p
                  className="small mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Our friendly team is here to help.
                </p>{" "}
                <p className="fw-bold mb-0" style={{ color: "var(--text)" }}>
                  hello@nexora.edu
                </p>{" "}
              </div>{" "}
            </div>{" "}
            <div className="bento-card p-4 mb-4 d-flex align-items-start gap-3 hover-glow">
              {" "}
              <div
                className="rounded-3 p-3 shadow-sm flex-shrink-0"
                style={{
                  background: "rgba(var(--success-rgb), 0.1)",
                  color: "var(--success)",
                }}
              >
                {" "}
                <MapPin size={24} />{" "}
              </div>{" "}
              <div>
                {" "}
                <h5 className="fw-bold mb-1" style={{ color: "var(--text)" }}>
                  Visit Us
                </h5>{" "}
                <p
                  className="small mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Come say hello at our campus HQ.
                </p>{" "}
                <p className="fw-bold mb-0" style={{ color: "var(--text)" }}>
                  Innovation Center, Block C
                </p>{" "}
              </div>{" "}
            </div>{" "}
            <div className="bento-card p-4 mb-4 d-flex align-items-start gap-3 hover-glow">
              {" "}
              <div
                className="rounded-3 p-3 shadow-sm flex-shrink-0"
                style={{
                  background: "rgba(var(--warning-rgb), 0.1)",
                  color: "var(--warning)",
                }}
              >
                {" "}
                <Phone size={24} />{" "}
              </div>{" "}
              <div>
                {" "}
                <h5 className="fw-bold mb-1" style={{ color: "var(--text)" }}>
                  Phone
                </h5>{" "}
                <p
                  className="small mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Mon-Fri from 8am to 5pm.
                </p>{" "}
                <p className="fw-bold mb-0" style={{ color: "var(--text)" }}>
                  +1 (555) 000-0000
                </p>{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
          {/* Contact Form */}{" "}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="col-lg-8"
          >
            {" "}
            <div className="bento-card p-4 p-md-5">
              {" "}
              <h3
                className="fw-bold mb-4 d-flex align-items-center gap-2"
                style={{ color: "var(--text)" }}
              >
                {" "}
                <MessageSquare size={24} className="text-primary" /> Send us a
                Message{" "}
              </h3>{" "}
              <form onSubmit={handleSubmit}>
                {" "}
                <div className="row g-4 mb-4">
                  {" "}
                  <div className="col-md-6">
                    {" "}
                    <label
                      className="form-label small fw-bold"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      First Name
                    </label>{" "}
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      className="form-control p-3"
                      style={{
                        color: "var(--text)",
                        borderColor: "var(--border)",
                      }}
                      placeholder="Jane"
                    />{" "}
                  </div>{" "}
                  <div className="col-md-6">
                    {" "}
                    <label
                      className="form-label small fw-bold"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Last Name
                    </label>{" "}
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      className="form-control p-3"
                      style={{
                        color: "var(--text)",
                        borderColor: "var(--border)",
                      }}
                      placeholder="Doe"
                    />{" "}
                  </div>{" "}
                </div>{" "}
                <div className="mb-4">
                  {" "}
                  <label
                    className="form-label small fw-bold"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Email
                  </label>{" "}
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="form-control p-3"
                    style={{
                      color: "var(--text)",
                      borderColor: "var(--border)",
                    }}
                    placeholder="jane@example.com"
                  />{" "}
                </div>{" "}
                <div className="mb-4">
                  {" "}
                  <label
                    className="form-label small fw-bold"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Message
                  </label>{" "}
                  <textarea
                    rows="4"
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="form-control p-3"
                    style={{
                      color: "var(--text)",
                      borderColor: "var(--border)",
                      resize: "vertical",
                    }}
                    placeholder="How can we help you?"
                  ></textarea>{" "}
                </div>{" "}
                <button
                  type="submit"
                  className="btn rounded-pill px-5 py-3 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2 hover-lift w-100"
                  disabled={loading}
                  style={{
                    background:
                      "linear-gradient(135deg, var(--primary), var(--secondary))",
                    color: "#fff",
                    border: "none",
                  }}
                >
                  {" "}
                  {loading ? (
                    <span className="spinner-border spinner-border-sm"></span>
                  ) : (
                    <>
                      {" "}
                      <Send size={18} /> Send Message{" "}
                    </>
                  )}{" "}
                </button>{" "}
              </form>{" "}
            </div>{" "}
          </motion.div>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}
