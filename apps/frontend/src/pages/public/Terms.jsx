import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { FileSignature, AlertCircle, Scale } from "lucide-react";

const Terms = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="container py-5" style={{ minHeight: "80vh", marginTop: "80px" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto"
        style={{ maxWidth: "800px" }}
      >
        <div className="text-center mb-5">
          <div className="icon-circle bg-primary text-white mx-auto mb-3" style={{ width: 64, height: 64 }}>
            <FileSignature size={32} />
          </div>
          <h1 className="fw-black mb-3 text-gradient-primary">Terms of Service</h1>
          <p className="text-muted fs-5">Please read these terms carefully. Last updated: September 2026.</p>
        </div>

        <div className="bento-card p-5">
          <section className="mb-5">
            <h4 className="fw-bold d-flex align-items-center gap-2 mb-3">
              <Scale size={20} className="text-primary" /> 1. Acceptance of Terms
            </h4>
            <p className="text-muted lh-lg">
              By accessing or using Nexora Campus, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service. These terms apply to all visitors, students, alumni, and administrators.
            </p>
          </section>

          <section className="mb-5">
            <h4 className="fw-bold d-flex align-items-center gap-2 mb-3">
              <AlertCircle size={20} className="text-primary" /> 2. User Responsibilities
            </h4>
            <p className="text-muted lh-lg">
              You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password. You agree not to disclose your password to any third party or misuse the platform's AI, community, or placement features.
            </p>
          </section>

          <section className="mb-4">
            <h4 className="fw-bold d-flex align-items-center gap-2 mb-3">
              <FileSignature size={20} className="text-primary" /> 3. Intellectual Property
            </h4>
            <p className="text-muted lh-lg">
              The Service and its original content, features, AI capabilities, and functionality are and will remain the exclusive property of Nexora Technologies and its licensors. You may not duplicate, copy, or reuse any portion of the HTML/CSS, JavaScript, or visual design elements.
            </p>
          </section>
        </div>
      </motion.div>
    </div>
  );
};

export default Terms;
