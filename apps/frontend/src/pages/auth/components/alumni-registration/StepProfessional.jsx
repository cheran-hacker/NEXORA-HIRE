import React, { useState } from 'react';
import { Briefcase, Building2, MapPin, Code, Link as LinkIcon, FileText, Plus, X } from 'lucide-react';
import { motion } from 'framer-motion';

const StepProfessional = ({ formData, handleChange, onNext, onPrev }) => {
  const [skillInput, setSkillInput] = useState('');

  const currentSkills = formData.skills 
    ? formData.skills.split(',').map(s => s.trim()).filter(Boolean) 
    : [];

  const handleAddSkill = () => {
    if (skillInput.trim()) {
      const newSkills = [...currentSkills, skillInput.trim()];
      handleChange({ target: { name: 'skills', value: newSkills.join(', ') } });
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    const newSkills = currentSkills.filter(s => s !== skillToRemove);
    handleChange({ target: { name: 'skills', value: newSkills.join(', ') } });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="d-flex align-items-center gap-3 mb-4">
        <div className="fr-trust-icon" style={{ width: '32px', height: '32px' }}>
          <Briefcase size={16} />
        </div>
        <div>
          <h3 className="h5 fw-bold mb-0">Professional Journey</h3>
          <p className="text-muted small mb-0">Share your career progress with the community.</p>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-md-6">
          <div className="fr-input-group">
            <label className="fr-label">Current Company *</label>
            <div className="fr-input-wrapper">
              <Building2 className="fr-input-icon" size={18} />
              <input 
                type="text" 
                name="currentCompany"
                value={formData.currentCompany || ''}
                onChange={handleChange}
                className="fr-input" 
                placeholder="Where do you work?" 
                required
              />
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="fr-input-group">
            <label className="fr-label">Job Title *</label>
            <div className="fr-input-wrapper">
              <Briefcase className="fr-input-icon" size={18} />
              <input 
                type="text" 
                name="currentJobTitle"
                value={formData.currentJobTitle || ''}
                onChange={handleChange}
                className="fr-input" 
                placeholder="What is your role?" 
                required
              />
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="fr-input-group">
            <label className="fr-label">Industry *</label>
            <div className="fr-input-wrapper">
              <MapPin className="fr-input-icon" size={18} />
              <input 
                type="text" 
                name="industry"
                value={formData.industry || ''}
                onChange={handleChange}
                className="fr-input" 
                placeholder="e.g. Technology, Finance" 
                required
              />
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="fr-input-group">
            <label className="fr-label">Experience (Years) *</label>
            <div className="fr-input-wrapper">
              <Code className="fr-input-icon" size={18} />
              <input 
                type="number" 
                name="experience"
                min="0"
                value={formData.experience || ''}
                onChange={handleChange}
                className="fr-input" 
                placeholder="e.g. 3" 
                required
              />
            </div>
          </div>
        </div>
        
        <div className="col-12">
          <div className="fr-input-group">
            <label className="fr-label">Career Domain *</label>
            <div className="fr-input-wrapper">
              <Code className="fr-input-icon" size={18} />
              <input 
                type="text" 
                name="careerDomain"
                value={formData.careerDomain || ''}
                onChange={handleChange}
                className="fr-input" 
                placeholder="e.g. AI/ML, Product Management, Frontend" 
                required
              />
            </div>
          </div>
        </div>

        {/* Skill Matrix */}
        <div className="col-12">
          <div className="fr-trust-card flex-column align-items-start py-3 px-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <Code size={16} className="text-primary"/> 
              <span className="fw-bolder" style={{ fontSize: '0.85rem', letterSpacing: '1px' }}>SKILL MATRIX</span>
            </div>
            
            <div className="d-flex flex-wrap gap-2 mb-3">
              {currentSkills.map((skill, index) => (
                <div key={index} className="fr-skill-tag">
                  {skill}
                  <X size={14} className="fr-skill-tag-remove" onClick={() => handleRemoveSkill(skill)} />
                </div>
              ))}
            </div>

            <div className="d-flex gap-2 w-100">
              <input 
                type="text" 
                className="fr-input flex-grow-1" 
                placeholder="Add a skill and press Enter" 
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{ paddingLeft: '1rem' }}
              />
              <button type="button" className="fr-btn-secondary px-3" onClick={handleAddSkill}>
                <Plus size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Network Connections */}
        <div className="col-12">
          <div className="fr-trust-card flex-column align-items-start py-3 px-4 mt-2">
            <div className="d-flex align-items-center gap-2 mb-3">
              <LinkIcon size={16} className="text-primary"/> 
              <span className="fw-bolder" style={{ fontSize: '0.85rem', letterSpacing: '1px' }}>NETWORK CONNECTIONS</span>
            </div>
            
            <div className="row w-100 g-3">
              <div className="col-md-4">
                <input type="url" name="linkedinUrl" value={formData.linkedinUrl || ''} onChange={handleChange} className="fr-input w-100" placeholder="LinkedIn URL" style={{ paddingLeft: '1rem' }} />
              </div>
              <div className="col-md-4">
                <input type="url" name="githubUrl" value={formData.githubUrl || ''} onChange={handleChange} className="fr-input w-100" placeholder="GitHub URL" style={{ paddingLeft: '1rem' }} />
              </div>
              <div className="col-md-4">
                <input type="url" name="portfolioUrl" value={formData.portfolioUrl || ''} onChange={handleChange} className="fr-input w-100" placeholder="Portfolio URL" style={{ paddingLeft: '1rem' }} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="fr-input-group mt-2 mb-0">
            <label className="fr-label">About Your Journey</label>
            <div className="position-relative">
              <FileText className="fr-input-icon" size={18} style={{ top: '1rem' }} />
              <textarea 
                name="professionalSummary"
                value={formData.professionalSummary || ''}
                onChange={handleChange}
                className="fr-input fr-scrollbar" 
                placeholder="Tell the alumni community about your professional journey, interests and experience." 
                rows="3"
                maxLength="500"
                style={{ resize: 'none' }}
              ></textarea>
              <div className="position-absolute text-muted small" style={{ bottom: '10px', right: '15px', fontSize: '0.7rem' }}>
                {(formData.professionalSummary || '').length} / 500
              </div>
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

export default StepProfessional;
