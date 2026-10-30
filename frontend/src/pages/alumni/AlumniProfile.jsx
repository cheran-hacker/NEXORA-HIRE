import React, { useState } from 'react';
import { User, Briefcase, MapPin, Building, Globe, Save, Award, HeartHandshake, BookOpen } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '../../services/api.js';
import { getAvatarUrl, handleImageError } from '../../utils/avatar.js';

export default function AlumniProfile() {
  const { user, setUser } = useAuth();
  const { addToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic'); // basic, professional, mentoring

  const [profile, setProfile] = useState({
    name: user?.name || '',
    designation: user?.alumniProfile?.designation || '',
    company: user?.alumniProfile?.company || '',
    location: user?.alumniProfile?.location || '',
    bio: user?.alumniProfile?.bio || '',
    portfolioUrl: user?.alumniProfile?.portfolioUrl || '',
    graduationYear: user?.alumniProfile?.graduationYear || '',
    department: user?.alumniProfile?.department || '',
    skills: user?.alumniProfile?.skills?.join(', ') || '',
    contributionPreferences: user?.alumniProfile?.contributionPreferences || {
      mentorship: false,
      resumeReview: false,
      vacancySharing: false,
      industryInsights: false,
      mockInterview: false,
      referrals: false
    }
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setProfile(p => ({
        ...p,
        contributionPreferences: {
          ...p.contributionPreferences,
          [name]: checked
        }
      }));
    } else {
      setProfile(p => ({ ...p, [name]: value }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: profile.name,
        alumniProfile: {
          designation: profile.designation,
          company: profile.company,
          location: profile.location,
          bio: profile.bio,
          portfolioUrl: profile.portfolioUrl,
          graduationYear: profile.graduationYear,
          department: profile.department,
          skills: profile.skills.split(',').map(s => s.trim()).filter(Boolean),
          contributionPreferences: profile.contributionPreferences
        }
      };
      const { data } = await authService.updateMe(payload);
      if (setUser) setUser(data.user);
      localStorage.setItem('nexora_user', JSON.stringify(data.user));
      addToast('Profile updated successfully!', 'success');
    } catch (err) {
      addToast('Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const tabVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 }
  };

  return (
    <div className="container-fluid py-4 px-xl-5 position-relative overflow-hidden" style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>
      {/* Ambient Background */}
      <div className="position-absolute rounded-circle blur-3xl" style={{ width: '40vw', height: '40vw', top: '-10%', right: '-10%', background: 'radial-gradient(circle, rgba(147,51,234,0.1) 0%, rgba(0,0,0,0) 70%)', zIndex: 0 }} />

      <div className="d-flex flex-column gap-4 mx-auto position-relative z-1" style={{ maxWidth: "1000px" }}>
        {/* Header */}
        <div className="premium-glass-panel p-4 rounded-4 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 shadow-sm border" style={{ borderColor: 'var(--border, #e2e8f0)', background: 'var(--surface-1, #ffffff)' }}>
          <div className="d-flex align-items-center gap-4">
            <div className="position-relative">
              <img 
                src={getAvatarUrl(profile.name || user?.name, user?.avatar)} 
                alt="Avatar" 
                onError={(e) => handleImageError(e, profile.name || user?.name)}
                className="rounded-circle shadow-sm" 
                style={{ width: 90, height: 90, border: '4px solid rgba(99, 102, 241, 0.2)', objectFit: 'cover' }} 
              />
            </div>
            <div>
              <h2 className="fw-bolder mb-1" style={{ color: 'var(--text, #0f172a)' }}>{profile.name || 'Alumni User'}</h2>
              <p className="mb-0 fs-6 d-flex align-items-center gap-2" style={{ color: 'var(--text-muted, #64748b)' }}>
                <Briefcase size={18} className="text-primary" /> {profile.designation || 'Your Designation'} at {profile.company || 'Company'}
              </p>
            </div>
          </div>
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="btn btn-primary rounded-pill px-5 py-3 fw-bold d-flex align-items-center gap-2 shadow-sm"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', border: 'none' }}
          >
            {saving ? <span className="spinner-border spinner-border-sm" /> : <Save size={20} />} 
            Save Profile
          </button>
        </div>

        {/* Content Body */}
        <div className="row g-4">
          {/* Tabs Navigation */}
          <div className="col-lg-3">
            <div className="premium-glass-panel p-3 rounded-4 border h-100 d-flex flex-column gap-2" style={{ borderColor: 'var(--border, #e2e8f0)', background: 'var(--surface-1, #ffffff)' }}>
              <button 
                onClick={() => setActiveTab('basic')}
                className={`btn d-flex align-items-center gap-3 text-start px-4 py-3 rounded-3 fw-bold w-100 border-0`}
                style={{ 
                  background: activeTab === 'basic' ? 'rgba(99, 102, 241, 0.12)' : 'transparent', 
                  color: activeTab === 'basic' ? '#4f46e5' : '#64748b',
                  borderLeft: activeTab === 'basic' ? '3px solid #6366f1' : '3px solid transparent',
                  transition: 'all 0.2s ease' 
                }}
              >
                <User size={20} className={activeTab === 'basic' ? 'text-primary' : ''} /> Basic Info
              </button>
              <button 
                onClick={() => setActiveTab('professional')}
                className={`btn d-flex align-items-center gap-3 text-start px-4 py-3 rounded-3 fw-bold w-100 border-0`}
                style={{ 
                  background: activeTab === 'professional' ? 'rgba(99, 102, 241, 0.12)' : 'transparent', 
                  color: activeTab === 'professional' ? '#4f46e5' : '#64748b',
                  borderLeft: activeTab === 'professional' ? '3px solid #6366f1' : '3px solid transparent',
                  transition: 'all 0.2s ease' 
                }}
              >
                <Award size={20} className={activeTab === 'professional' ? 'text-primary' : ''} /> Professional
              </button>
              <button 
                onClick={() => setActiveTab('mentoring')}
                className={`btn d-flex align-items-center gap-3 text-start px-4 py-3 rounded-3 fw-bold w-100 border-0`}
                style={{ 
                  background: activeTab === 'mentoring' ? 'rgba(99, 102, 241, 0.12)' : 'transparent', 
                  color: activeTab === 'mentoring' ? '#4f46e5' : '#64748b',
                  borderLeft: activeTab === 'mentoring' ? '3px solid #6366f1' : '3px solid transparent',
                  transition: 'all 0.2s ease' 
                }}
              >
                <HeartHandshake size={20} className={activeTab === 'mentoring' ? 'text-primary' : ''} /> Mentoring
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="col-lg-9">
            <div className="premium-glass-panel p-4 p-md-5 rounded-4 border min-vh-50" style={{ borderColor: 'var(--border, #e2e8f0)', background: 'var(--surface-1, #ffffff)' }}>
              <AnimatePresence mode="wait">
                {activeTab === 'basic' && (
                  <motion.div key="basic" variants={tabVariants} initial="hidden" animate="visible" exit="exit" transition={{ duration: 0.2 }}>
                    <h4 className="fw-bold mb-4 d-flex align-items-center gap-2" style={{ color: 'var(--text, #0f172a)' }}>
                      <User className="text-primary" /> Basic Information
                    </h4>
                    <div className="row g-4">
                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-uppercase" style={{ color: '#475569', letterSpacing: '0.04em', fontSize: '0.75rem' }}>Full Name</label>
                        <input type="text" className="form-control premium-input rounded-3 py-2" name="name" value={profile.name} onChange={handleChange} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-uppercase" style={{ color: '#475569', letterSpacing: '0.04em', fontSize: '0.75rem' }}>Graduation Year</label>
                        <input type="number" className="form-control premium-input rounded-3 py-2" name="graduationYear" value={profile.graduationYear} onChange={handleChange} />
                      </div>
                      <div className="col-md-12">
                        <label className="form-label small fw-bold text-uppercase" style={{ color: '#475569', letterSpacing: '0.04em', fontSize: '0.75rem' }}>Department / Major</label>
                        <input type="text" className="form-control premium-input rounded-3 py-2" name="department" value={profile.department} onChange={handleChange} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-uppercase" style={{ color: '#475569', letterSpacing: '0.04em', fontSize: '0.75rem' }}>Location</label>
                        <input type="text" className="form-control premium-input rounded-3 py-2" name="location" value={profile.location} onChange={handleChange} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-uppercase" style={{ color: '#475569', letterSpacing: '0.04em', fontSize: '0.75rem' }}>Portfolio / LinkedIn</label>
                        <input type="url" className="form-control premium-input rounded-3 py-2" name="portfolioUrl" value={profile.portfolioUrl} onChange={handleChange} />
                      </div>
                      <div className="col-md-12">
                        <label className="form-label small fw-bold text-uppercase" style={{ color: '#475569', letterSpacing: '0.04em', fontSize: '0.75rem' }}>Bio</label>
                        <textarea className="form-control premium-input rounded-3 py-2" name="bio" value={profile.bio} onChange={handleChange} rows="4"></textarea>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'professional' && (
                  <motion.div key="professional" variants={tabVariants} initial="hidden" animate="visible" exit="exit" transition={{ duration: 0.2 }}>
                    <h4 className="fw-bold mb-4 d-flex align-items-center gap-2" style={{ color: 'var(--text, #0f172a)' }}>
                      <Award className="text-primary" /> Professional Details
                    </h4>
                    <div className="row g-4">
                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-uppercase" style={{ color: '#475569', letterSpacing: '0.04em', fontSize: '0.75rem' }}>Current Job Title</label>
                        <input type="text" className="form-control premium-input rounded-3 py-2" name="designation" value={profile.designation} onChange={handleChange} placeholder="e.g. Senior Software Engineer" />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-uppercase" style={{ color: '#475569', letterSpacing: '0.04em', fontSize: '0.75rem' }}>Current Company</label>
                        <input type="text" className="form-control premium-input rounded-3 py-2" name="company" value={profile.company} onChange={handleChange} placeholder="e.g. Google India" />
                      </div>
                      <div className="col-md-12">
                        <label className="form-label small fw-bold text-uppercase" style={{ color: '#475569', letterSpacing: '0.04em', fontSize: '0.75rem' }}>Professional Skills (Comma separated)</label>
                        <input type="text" className="form-control premium-input rounded-3 py-2" name="skills" value={profile.skills} onChange={handleChange} placeholder="e.g. React, TypeScript, System Design, Web Performance" />
                        <div className="form-text mt-2 d-flex align-items-center gap-1" style={{ color: '#64748b', fontSize: '0.825rem' }}>
                          <BookOpen size={14} className="text-primary flex-shrink-0" /> These skills help us match you with students looking for mentorship.
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'mentoring' && (
                  <motion.div key="mentoring" variants={tabVariants} initial="hidden" animate="visible" exit="exit" transition={{ duration: 0.2 }}>
                    <h4 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: 'var(--text, #0f172a)' }}>
                      <HeartHandshake className="text-pink" /> Mentoring Preferences
                    </h4>
                    <p className="mb-4" style={{ color: '#64748b' }}>Select how you would like to contribute back to the student ecosystem. Your selections directly power the student recommendations and requests.</p>
                    <div className="row g-4">
                      {Object.keys(profile.contributionPreferences || {}).map(pref => (
                        <div className="col-md-6" key={pref}>
                          <div 
                            className="p-3 rounded-3 border d-flex align-items-center justify-content-between h-100" 
                            style={{ 
                              borderColor: profile.contributionPreferences[pref] ? 'rgba(99, 102, 241, 0.4)' : '#e2e8f0', 
                              background: profile.contributionPreferences[pref] ? 'rgba(99, 102, 241, 0.06)' : '#ffffff',
                              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <label 
                              className="form-check-label fw-bold text-capitalize mb-0" 
                              htmlFor={pref} 
                              style={{ cursor: 'pointer', color: 'var(--text, #0f172a)' }}
                            >
                              {pref.replace(/([A-Z])/g, ' $1').trim()}
                            </label>
                            <div className="form-check form-switch m-0 p-0 d-flex align-items-center">
                              <input 
                                className="form-check-input m-0" 
                                type="checkbox" 
                                id={pref} 
                                name={pref} 
                                checked={profile.contributionPreferences[pref]} 
                                onChange={handleChange}
                                style={{ width: '2.5rem', height: '1.25rem', cursor: 'pointer' }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        .premium-input {
          background: #ffffff !important;
          border: 1px solid #cbd5e1 !important;
          color: #0f172a !important;
          font-weight: 500 !important;
          font-size: 0.95rem !important;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.04) !important;
          transition: border-color 0.15s ease, box-shadow 0.15s ease !important;
        }
        .premium-input:focus {
          background: #ffffff !important;
          border-color: #6366f1 !important;
          color: #0f172a !important;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.18) !important;
          outline: none !important;
        }
        .premium-input::placeholder {
          color: #94a3b8 !important;
          font-weight: 400 !important;
        }
        [data-theme="dark"] .premium-input {
          background: rgba(30, 41, 59, 0.75) !important;
          border-color: rgba(255, 255, 255, 0.15) !important;
          color: #f8fafc !important;
        }
        [data-theme="dark"] .premium-input:focus {
          background: rgba(30, 41, 59, 0.95) !important;
          border-color: #818cf8 !important;
          color: #ffffff !important;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.3) !important;
        }
        [data-theme="dark"] .premium-input::placeholder {
          color: #64748b !important;
        }
        .text-purple { color: #8b5cf6 !important; }
        .text-pink { color: #ec4899 !important; }
        .bg-purple { background-color: #9333ea !important; }
      `}</style>
    </div>
  );
}