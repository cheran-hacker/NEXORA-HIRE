import React from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const StepReview = ({ formData, onPrev, onSubmit, submitting }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="d-flex align-items-center gap-3 mb-4">
        <div className="fr-trust-icon" style={{ width: '32px', height: '32px' }}>
          <CheckCircle2 size={16} />
        </div>
        <div>
          <h3 className="h5 fw-bold mb-0 text-uppercase tracking-wide">Review & Verify</h3>
          <p className="text-muted small mb-0">Confirm your information before initializing your alumni profile.</p>
        </div>
      </div>

      <div className="d-flex flex-column gap-3 mb-4">
        {/* Personal */}
        <div className="fr-trust-card flex-column align-items-start py-3 px-4 w-100">
          <div className="d-flex justify-content-between align-items-center w-100 mb-2">
            <span className="fw-bolder text-primary" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>PERSONAL IDENTITY</span>
          </div>
          <div className="row w-100 g-2">
            <div className="col-md-6">
              <span className="text-muted small d-block">Name</span>
              <span className="fw-medium">{formData.name || 'Not provided'}</span>
            </div>
            <div className="col-md-6">
              <span className="text-muted small d-block">Email</span>
              <span className="fw-medium">{formData.email || 'Not provided'}</span>
            </div>
            <div className="col-md-6">
              <span className="text-muted small d-block">Phone</span>
              <span className="fw-medium">{formData.phone || 'Not provided'}</span>
            </div>
            <div className="col-md-6">
              <span className="text-muted small d-block">Location</span>
              <span className="fw-medium">{formData.location || 'Not provided'}</span>
            </div>
          </div>
        </div>

        {/* Academic */}
        <div className="fr-trust-card flex-column align-items-start py-3 px-4 w-100">
          <div className="d-flex justify-content-between align-items-center w-100 mb-2">
            <span className="fw-bolder text-primary" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>ACADEMIC BACKGROUND</span>
          </div>
          <div className="row w-100 g-2">
            <div className="col-md-4">
              <span className="text-muted small d-block">Register Number</span>
              <span className="fw-medium">{formData.registerNumber || 'Not provided'}</span>
            </div>
            <div className="col-md-4">
              <span className="text-muted small d-block">Degree & Dept</span>
              <span className="fw-medium">{formData.degree} - {formData.department}</span>
            </div>
            <div className="col-md-4">
              <span className="text-muted small d-block">Batch/Year</span>
              <span className="fw-medium">{formData.batch ? `${formData.batch} (${formData.graduationYear})` : formData.graduationYear}</span>
            </div>
          </div>
        </div>

        {/* Professional */}
        <div className="fr-trust-card flex-column align-items-start py-3 px-4 w-100">
          <div className="d-flex justify-content-between align-items-center w-100 mb-2">
            <span className="fw-bolder text-primary" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>PROFESSIONAL JOURNEY</span>
          </div>
          <div className="row w-100 g-2">
            <div className="col-md-6">
              <span className="text-muted small d-block">Current Role</span>
              <span className="fw-medium">{formData.currentJobTitle} at {formData.currentCompany}</span>
            </div>
            <div className="col-md-6">
              <span className="text-muted small d-block">Industry / Exp.</span>
              <span className="fw-medium">{formData.industry} / {formData.experience} Years</span>
            </div>
          </div>
        </div>
        
        <div className="form-check d-flex align-items-center gap-3 mt-3 px-2">
          <input 
            type="checkbox" 
            className="form-check-input mt-0 border-primary" 
            style={{ width: '1.4rem', height: '1.4rem', cursor: 'pointer', backgroundColor: 'transparent' }} 
            checked
            readOnly
          />
          <label className="form-check-label user-select-none text-muted small" style={{ cursor: 'pointer' }}>
            I confirm that the information provided is accurate.
          </label>
        </div>
      </div>

      <div className="d-flex justify-content-between mt-4 pt-3 border-top" style={{ borderColor: 'var(--fr-border) !important' }}>
        <button type="button" className="fr-btn-secondary" onClick={onPrev} disabled={submitting}>
          ← Back to Edit
        </button>
        <button 
          type="button" 
          className="fr-btn-primary d-flex align-items-center gap-2" 
          onClick={onSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <>
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              INITIALIZING...
            </>
          ) : (
            <>
              CONFIRM & INITIALIZE <ArrowRight size={18} />
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default StepReview;
