import React from 'react';
import { User, Mail, Phone, MapPin, Camera, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const StepPersonal = ({ formData, handleChange, onNext }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="d-flex align-items-center gap-3 mb-4">
        <div className="fr-trust-icon" style={{ width: '32px', height: '32px' }}>
          <User size={16} />
        </div>
        <div>
          <h3 className="h5 fw-bold mb-0" style={{ color: 'var(--fr-text-main)' }}>Personal Identity</h3>
          <p className="small mb-0" style={{ color: 'var(--fr-text-muted)' }}>Let's start with your basic information from your invitation.</p>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-md-6">
          <div className="fr-input-group">
            <label className="fr-label">Full Name *</label>
            <div className="fr-input-wrapper">
              <User className="fr-input-icon" size={18} />
              <input 
                type="text" 
                className="fr-input" 
                name="name"
                value={formData.name || ''}
                onChange={handleChange}
                placeholder="Enter your full name" 
                required
              />
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="fr-input-group">
            <label className="fr-label">Email Address *</label>
            <div className="fr-input-wrapper">
              <Mail className="fr-input-icon" size={18} />
              <input 
                type="email" 
                className="fr-input" 
                value={formData.email || ''} 
                disabled 
              />
              <CheckCircle2 size={16} className="text-success position-absolute" style={{ right: '1rem' }} />
            </div>
            <div className="small mt-1 d-flex align-items-center gap-1" style={{ color: 'var(--fr-success)' }}>
              <CheckCircle2 size={12} /> Verified through invitation
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="fr-input-group">
            <label className="fr-label">Phone Number *</label>
            <div className="fr-input-wrapper">
              <Phone className="fr-input-icon" size={18} />
              <input 
                type="tel" 
                name="phone"
                value={formData.phone || ''}
                onChange={handleChange}
                className="fr-input" 
                placeholder="+91 Enter your phone number" 
                required
              />
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="fr-input-group">
            <label className="fr-label">Current Location *</label>
            <div className="fr-input-wrapper">
              <MapPin className="fr-input-icon" size={18} />
              <input 
                type="text" 
                name="location"
                value={formData.location || ''}
                onChange={handleChange}
                className="fr-input" 
                placeholder="City, State, Country" 
                required
              />
            </div>
          </div>
        </div>

        <div className="col-12">
          <label className="fr-label">Profile Photo</label>
          <div className="row g-3">
            <div className="col-md-7">
              <div className="fr-upload-zone">
                <Camera size={32} className="text-muted mb-2" />
                <div className="fw-medium">Upload Your Photo</div>
                <div className="small text-muted mt-1">JPG, PNG or WebP (Max 5MB)</div>
                {/* Note: This is UI-only as per backend limitations; would connect to S3/Cloudinary in reality */}
              </div>
            </div>
            <div className="col-md-5">
              <div className="fr-trust-card h-100 flex-column align-items-start justify-content-center" style={{ padding: '1.25rem' }}>
                <div className="fw-bold mb-2" style={{ fontSize: '0.8rem', color: 'var(--fr-primary)' }}>A professional photo helps others recognize you</div>
                <ul className="list-unstyled small mb-0 d-flex flex-column gap-2" style={{ fontSize: '0.75rem', color: 'var(--fr-text-muted)' }}>
                  <li className="d-flex align-items-center gap-2"><CheckCircle2 size={12} style={{ color: 'var(--fr-success)' }}/> Clear face photo</li>
                  <li className="d-flex align-items-center gap-2"><CheckCircle2 size={12} style={{ color: 'var(--fr-success)' }}/> Good lighting</li>
                  <li className="d-flex align-items-center gap-2"><CheckCircle2 size={12} style={{ color: 'var(--fr-success)' }}/> JPG, PNG or WebP format</li>
                  <li className="d-flex align-items-center gap-2"><CheckCircle2 size={12} style={{ color: 'var(--fr-success)' }}/> Maximum 5MB size</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-between mt-5 pt-3 border-top" style={{ borderColor: 'var(--fr-border) !important' }}>
        <button type="button" className="fr-btn-secondary" style={{ visibility: 'hidden' }}>Back</button>
        <button type="button" className="fr-btn-primary" onClick={onNext}>
          Continue →
        </button>
      </div>
    </motion.div>
  );
};

export default StepPersonal;
