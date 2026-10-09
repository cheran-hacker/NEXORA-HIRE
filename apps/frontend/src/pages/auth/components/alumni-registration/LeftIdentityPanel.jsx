import React from 'react';
import { ShieldCheck, Building2, Lock, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

const LeftIdentityPanel = () => {
  return (
    <div className="col-12 col-lg-5 d-flex flex-column justify-content-between p-4 p-md-5 fr-hero-panel">
      {/* Header */}
      <div className="mb-5 position-relative z-3">
        <h1 className="fw-bolder tracking-tighter mb-1" style={{ fontSize: '2rem', color: 'var(--fr-text-main)' }}>
          <span style={{ color: 'var(--fr-primary)' }}>NEXORA</span>
          <span className="ms-3 fs-6 fw-medium border-start ps-3" style={{ color: 'var(--fr-text-muted)', borderColor: 'var(--fr-border)' }}>ALUMNI NETWORK</span>
        </h1>
        <p className="small mt-2" style={{ maxWidth: '280px', lineHeight: '1.4', color: 'var(--fr-text-muted)' }}>
          CONNECTING GENERATIONS <br /> BUILDING TOMORROW
        </p>
      </div>

      {/* Main Title Area */}
      <div className="mb-4 position-relative z-3">
        <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-3 border" style={{ borderColor: 'var(--fr-border)', backgroundColor: 'var(--fr-card-bg)', fontSize: '0.75rem', letterSpacing: '1px', color: 'var(--fr-text-muted)' }}>
          ALUMNI PORTAL / V1.0
        </div>
        <h2 className="display-4 fw-bolder mb-3" style={{ lineHeight: '1.1', color: 'var(--fr-text-main)' }}>
          Your Journey <br />
          <span style={{ color: 'var(--fr-primary)' }}>Lives On</span>
        </h2>
        <p style={{ maxWidth: '350px', color: 'var(--fr-text-muted)' }}>
          Join the NEXORA alumni network and stay connected, contribute, and create new opportunities together.
        </p>
      </div>

      {/* Digital Globe Visualization */}
      <div className="flex-grow-1 d-flex flex-column justify-content-center align-items-center mb-5 position-relative z-3">
        <div className="fr-globe-container">
          <motion.div 
            className="fr-globe fr-animate-pulse"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 60, ease: "linear" }}
          >
            <div className="fw-bolder" style={{ fontSize: '3rem', color: 'var(--fr-primary)' }}>N</div>
          </motion.div>
          
          {/* Nodes around the globe */}
          <div className="fr-node" style={{ top: '0', left: '50%', transform: 'translate(-50%, -50%)' }}>
            <div className="fr-node-icon"><span className="fw-bold">AL</span></div>
            <span className="fr-node-label">ACADEMIC LEGACY</span>
          </div>
          
          <div className="fr-node" style={{ top: '50%', left: '0', transform: 'translate(-50%, -50%)' }}>
            <div className="fr-node-icon"><span className="fw-bold">ID</span></div>
            <span className="fr-node-label">IDENTITY</span>
          </div>

          <div className="fr-node" style={{ top: '50%', right: '0', transform: 'translate(50%, -50%)' }}>
            <div className="fr-node-icon"><span className="fw-bold">CG</span></div>
            <span className="fr-node-label">CAREER GROWTH</span>
          </div>

          <div className="fr-node" style={{ bottom: '0', left: '20%', transform: 'translate(-50%, 50%)' }}>
            <div className="fr-node-icon"><span className="fw-bold">NW</span></div>
            <span className="fr-node-label">NETWORK</span>
          </div>

          <div className="fr-node" style={{ bottom: '0', right: '20%', transform: 'translate(50%, 50%)' }}>
            <div className="fr-node-icon"><span className="fw-bold">GB</span></div>
            <span className="fr-node-label">GIVE BACK</span>
          </div>
        </div>
      </div>

      {/* Trust Cards */}
      <div className="row g-3 position-relative z-3">
        <div className="col-12 col-md-6">
          <div className="fr-trust-card">
            <div className="fr-trust-icon"><ShieldCheck size={20} /></div>
            <div>
              <div className="fw-bold" style={{ fontSize: '0.85rem', color: 'var(--fr-text-main)' }}>Verified Invitations</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--fr-text-muted)' }}>Secure &amp; authenticated</div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-6">
          <div className="fr-trust-card">
            <div className="fr-trust-icon"><Building2 size={20} /></div>
            <div>
              <div className="fw-bold" style={{ fontSize: '0.85rem', color: 'var(--fr-text-main)' }}>Institution Connected</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--fr-text-muted)' }}>Official network</div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-6">
          <div className="fr-trust-card">
            <div className="fr-trust-icon"><Lock size={20} /></div>
            <div>
              <div className="fw-bold" style={{ fontSize: '0.85rem', color: 'var(--fr-text-main)' }}>One-time Registration</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--fr-text-muted)' }}>Simple &amp; secure</div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-6">
          <div className="fr-trust-card">
            <div className="fr-trust-icon"><Globe size={20} /></div>
            <div>
              <div className="fw-bold" style={{ fontSize: '0.85rem', color: 'var(--fr-text-main)' }}>Global Community</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--fr-text-muted)' }}>Lifelong connections</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer Branding */}
      <div className="text-center mt-5 pt-3 position-relative z-3 opacity-50">
        <small className="fw-bold tracking-widest text-uppercase" style={{ letterSpacing: '3px', color: 'var(--fr-text-muted)' }}>
          "Always a part of NEXORA"
        </small>
      </div>
    </div>
  );
};

export default LeftIdentityPanel;
