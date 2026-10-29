import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Lock, FileText, Globe } from "lucide-react";

const Privacy = () => {
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
            <Shield size={32} />
          </div>
          <h1 className="fw-black mb-3 text-gradient-primary">Privacy Policy</h1>
          <p className="text-muted fs-5">Your privacy is our priority. Last updated: September 2026.</p>
        </div>

        <div className="bento-card p-5">
          <section className="mb-5">
            <h4 className="fw-bold d-flex align-items-center gap-2 mb-3">
              <Lock size={20} className="text-primary" /> 1. Data Collection
            </h4>
            <p className="text-muted lh-lg">
              We collect information that you provide directly to us when you create an account, build your profile, use our AI tools, or communicate with us. This includes your name, email address, academic history, resume content, and platform interactions.
            </p>
          </section>

          <section className="mb-5">
            <h4 className="fw-bold d-flex align-items-center gap-2 mb-3">
              <FileText size={20} className="text-primary" /> 2. Data Usage
            </h4>
            <p className="text-muted lh-lg">
              Your data is used to provide personalized career recommendations, generate AI-driven resume analysis, and match you with potential placement opportunities. We do not sell your personal information to third parties.
            </p>
          </section>

          <section className="mb-4">
            <h4 className="fw-bold d-flex align-items-center gap-2 mb-3">
              <Globe size={20} className="text-primary" /> 3. Data Security
            </h4>
            <p className="text-muted lh-lg">
              We employ robust security measures to protect your information, including encryption at rest and in transit. However, no internet transmission is completely secure, and we cannot guarantee absolute security.
            </p>
          </section>
        </div>
      </motion.div>
    </div>
  );
};

export default Privacy;
