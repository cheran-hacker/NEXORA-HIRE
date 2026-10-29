import React from 'react';
import { GraduationCap, Hash, Building, BookOpen, Calendar, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const StepAcademic = ({ formData, handleChange, onNext, onPrev }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="d-flex align-items-center gap-3 mb-4">
        <div className="fr-trust-icon" style={{ width: '32px', height: '32px' }}>
          <GraduationCap size={16} />
        </div>
        <div>
          <h3 className="h5 fw-bold mb-0" style={{ color: 'var(--fr-text-main)' }}>Academic Background</h3>
          <p className="small mb-0" style={{ color: 'var(--fr-text-muted)' }}>Connect your alumni identity with your academic record.</p>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-12">
          <div className="fr-trust-card flex-column align-items-start py-3 px-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <Building size={16} className="text-primary"/> 
              <span className="fw-bolder" style={{ fontSize: '0.85rem', letterSpacing: '1px' }}>INSTITUTIONAL IDENTITY</span>
            </div>
            <div className="row w-100 g-3">
              <div className="col-md-6 col-lg-3">
                <div className="text-muted" style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>Register Number</div>
                <div className="fw-bold" style={{ fontSize: '0.9rem' }}>{formData.registerNumber || '-'}</div>
              </div>
              <div className="col-md-6 col-lg-3">
                <div className="text-muted" style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>Department</div>
                <div className="fw-bold" style={{ fontSize: '0.9rem' }}>{formData.department || '-'}</div>
              </div>
              <div className="col-md-6 col-lg-3">
                <div className="text-muted" style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>Degree</div>
                <div className="fw-bold" style={{ fontSize: '0.9rem' }}>{formData.degree || '-'}</div>
              </div>
              <div className="col-md-6 col-lg-3">
                <div className="text-muted" style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>Graduation Year</div>
                <div className="fw-bold" style={{ fontSize: '0.9rem' }}>{formData.graduationYear || '-'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12">
          <div className="fr-input-group">
            <label className="fr-label">Register Number / Alumni ID *</label>
            <div className="fr-input-wrapper">
              <Hash className="fr-input-icon" size={18} />
              <input 
                type="text" 
                name="registerNumber"
                value={formData.registerNumber || ''}
                onChange={handleChange}
                className="fr-input" 
                placeholder="Enter Register Number" 
                required
              />
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="fr-input-group">
            <label className="fr-label">Degree *</label>
            <div className="fr-input-wrapper">
              <GraduationCap className="fr-input-icon" size={18} />
              <input 
                type="text" 
                name="degree"
                value={formData.degree || ''}
                onChange={handleChange}
                className="fr-input" 
                placeholder="e.g. B.Tech, M.S" 
                required
              />
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="fr-input-group">
            <label className="fr-label">Department / Major *</label>
            <div className="fr-input-wrapper">
              <BookOpen className="fr-input-icon" size={18} />
              <input 
                type="text" 
                name="department"
                value={formData.department || ''}
                onChange={handleChange}
                className="fr-input" 
                placeholder="Enter Department" 
                required
              />
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="fr-input-group">
            <label className="fr-label">Graduation Year *</label>
            <div className="fr-input-wrapper">
              <Calendar className="fr-input-icon" size={18} />
              <input 
                type="number" 
                name="graduationYear"
                min="1990"
                max="2030"
                value={formData.graduationYear || ''}
                onChange={handleChange}
                className="fr-input" 
                placeholder="2023" 
                required
              />
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="fr-input-group">
            <label className="fr-label">Batch Name (Optional)</label>
            <div className="fr-input-wrapper">
              <Users className="fr-input-icon" size={18} />
              <input 
                type="text" 
                name="batch"
                value={formData.batch || ''}
                onChange={handleChange}
                className="fr-input" 
                placeholder="Enter Batch Name" 
              />
            </div>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-between mt-5 pt-3 border-top" style={{ borderColor: 'var(--fr-border) !important' }}>
        <button type="button" className="fr-btn-secondary" onClick={onPrev}>
          ← Back
        </button>
        <button type="button" className="fr-btn-primary" onClick={onNext}>
          Continue →
        </button>
      </div>
    </motion.div>
  );
};

export default StepAcademic;
