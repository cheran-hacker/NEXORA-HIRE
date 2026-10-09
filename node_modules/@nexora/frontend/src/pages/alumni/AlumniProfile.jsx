import React, { useState } from 'react';
import { User, Briefcase, MapPin, Building, Globe, Save, Award, HeartHandshake, BookOpen } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '../../services/api.js';

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
        <div className="premium-glass-panel p-4 rounded-4 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 shadow-sm border border-subtle">
          <div className="d-flex align-items-center gap-4">
            <div className="position-relative">
              <img 
                src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&size=120&background=9333ea&color=fff&bold=true`} 
                alt="Avatar" 
                className="rounded-circle shadow-lg" 
                style={{ width: 90, height: 90, border: '4px solid rgba(255,255,255,0.1)' }} 
              />
            </div>
            <div>
              <h2 className="fw-bolder mb-1 text-white">{profile.name || 'Alumni User'}</h2>
              <p className="mb-0 text-muted fs-5 d-flex align-items-center gap-2">
                <Briefcase size={18} /> {profile.designation || 'Your Designation'} at {profile.company || 'Company'}
              </p>
            </div>
          </div>
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="btn btn-primary rounded-pill px-5 py-3 fw-bold d-flex align-items-center gap-2 shadow-lg"
            style={{ background: 'linear-gradient(135deg, #9333ea, #3b82f6)', border: 'none' }}
          >
            {saving ? <span className="spinner-border spinner-border-sm" /> : <Save size={20} />} 
            Save Profile
          </button>
        </div>

        {/* Content Body */}
        <div className="row g-4">
          {/* Tabs Navigation */}
          <div className="col-lg-3">
            <div className="premium-glass-panel p-3 rounded-4 border border-subtle h-100 d-flex flex-column gap-2">
              <button 
                onClick={() => setActiveTab('basic')}
                className={`btn d-flex align-items-center gap-3 text-start px-4 py-3 rounded-3 fw-bold w-100 border-0 ${activeTab === 'basic' ? 'bg-primary bg-opacity-25 text-white' : 'text-muted'}`}
                style={{ background: activeTab === 'basic' ? 'linear-gradient(90deg, rgba(147,51,234,0.2) 0%, transparent 100%)' : 'transparent', transition: 'all 0.3s' }}
              >
                <User size={20} className={activeTab === 'basic' ? 'text-purple' : ''} /> Basic Info
              </button>
              <button 
                onClick={() => setActiveTab('professional')}
                className={`btn d-flex align-items-center gap-3 text-start px-4 py-3 rounded-3 fw-bold w-100 border-0 ${activeTab === 'professional' ? 'bg-primary bg-opacity-25 text-white' : 'text-muted'}`}
                style={{ background: activeTab === 'professional' ? 'linear-gradient(90deg, rgba(59,130,246,0.2) 0%, transparent 100%)' : 'transparent', transition: 'all 0.3s' }}
              >
                <Award size={20} className={activeTab === 'professional' ? 'text-primary' : ''} /> Professional
              </button>
              <button 
                onClick={() => setActiveTab('mentoring')}
                className={`btn d-flex align-items-center gap-3 text-start px-4 py-3 rounded-3 fw-bold w-100 border-0 ${activeTab === 'mentoring' ? 'bg-primary bg-opacity-25 text-white' : 'text-muted'}`}
                style={{ background: activeTab === 'mentoring' ? 'linear-gradient(90deg, rgba(236,72,153,0.2) 0%, transparent 100%)' : 'transparent', transition: 'all 0.3s' }}
              >
                <HeartHandshake size={20} className={activeTab === 'mentoring' ? 'text-pink' : ''} /> Mentoring
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="col-lg-9">
            <div className="premium-glass-panel p-5 rounded-4 border border-subtle min-vh-50">
              <AnimatePresence mode="wait">
                {activeTab === 'basic' && (
                  <motion.div key="basic" variants={tabVariants} initial="hidden" animate="visible" exit="exit" transition={{ duration: 0.2 }}>
                    <h4 className="fw-bold mb-4 d-flex align-items-center gap-2"><User className="text-purple" /> Basic Information</h4>
                    <div className="row g-4">
                      <div className="col-md-6">
                        <label className="form-label text-muted small fw-bold text-uppercase">Full Name</label>
                        <input type="text" className="form-control premium-input rounded-3 py-2" name="name" value={profile.name} onChange={handleChange} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-muted small fw-bold text-uppercase">Graduation Year</label>
                        <input type="number" className="form-control premium-input rounded-3 py-2" name="graduationYear" value={profile.graduationYear} onChange={handleChange} />
                      </div>
                      <div className="col-md-12">
                        <label className="form-label text-muted small fw-bold text-uppercase">Department / Major</label>
                        <input type="text" className="form-control premium-input rounded-3 py-2" name="department" value={profile.department} onChange={handleChange} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-muted small fw-bold text-uppercase">Location</label>
                        <input type="text" className="form-control premium-input rounded-3 py-2" name="location" value={profile.location} onChange={handleChange} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-muted small fw-bold text-uppercase">Portfolio / LinkedIn</label>
                        <input type="url" className="form-control premium-input rounded-3 py-2" name="portfolioUrl" value={profile.portfolioUrl} onChange={handleChange} />
                      </div>
                      <div className="col-md-12">
                        <label className="form-label text-muted small fw-bold text-uppercase">Bio</label>
                        <textarea className="form-control premium-input rounded-3 py-2" name="bio" value={profile.bio} onChange={handleChange} rows="4"></textarea>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'professional' && (
                  <motion.div key="professional" variants={tabVariants} initial="hidden" animate="visible" exit="exit" transition={{ duration: 0.2 }}>
                    <h4 className="fw-bold mb-4 d-flex align-items-center gap-2"><Award className="text-primary" /> Professional Details</h4>
                    <div className="row g-4">
                      <div className="col-md-6">
                        <label className="form-label text-muted small fw-bold text-uppercase">Current Job Title</label>
                        <input type="text" className="form-control premium-input rounded-3 py-2" name="designation" value={profile.designation} onChange={handleChange} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-muted small fw-bold text-uppercase">Current Company</label>
                        <input type="text" className="form-control premium-input rounded-3 py-2" name="company" value={profile.company} onChange={handleChange} />
                      </div>
                      <div className="col-md-12">
                        <label className="form-label text-muted small fw-bold text-uppercase">Professional Skills (Comma separated)</label>
                        <input type="text" className="form-control premium-input rounded-3 py-2" name="skills" value={profile.skills} onChange={handleChange} placeholder="e.g. React, System Design, Product Management" />
                        <div className="form-text mt-2 text-muted"><BookOpen size={14} className="me-1" /> These skills help us match you with students looking for mentorship.</div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'mentoring' && (
                  <motion.div key="mentoring" variants={tabVariants} initial="hidden" animate="visible" exit="exit" transition={{ duration: 0.2 }}>
                    <h4 className="fw-bold mb-3 d-flex align-items-center gap-2"><HeartHandshake className="text-pink" /> Mentoring Preferences</h4>
                    <p className="text-muted mb-4">Select how you would like to contribute back to the student ecosystem. Your selections directly power the student recommendations and requests.</p>
                    <div className="row g-4">
                      {Object.keys(profile.contributionPreferences || {}).map(pref => (
                        <div className="col-md-6" key={pref}>
                          <div className="premium-glass-panel p-3 rounded-3 border d-flex align-items-center justify-content-between h-100" style={{ borderColor: profile.contributionPreferences[pref] ? 'rgba(236,72,153,0.3)' : 'rgba(255,255,255,0.05)', background: profile.contributionPreferences[pref] ? 'rgba(236,72,153,0.05)' : 'rgba(255,255,255,0.02)' }}>
                            <label className="form-check-label fw-bold text-capitalize text-white mb-0" htmlFor={pref} style={{ cursor: 'pointer' }}>
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
          background: rgba(255,255,255,0.03) !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          color: white !important;
          transition: all 0.2s;
        }
        .premium-input:focus {
          background: rgba(255,255,255,0.05) !important;
          border-color: var(--bs-primary) !important;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1) !important;
        }
        .text-purple { color: #d8b4fe !important; }
        .text-pink { color: #f9a8d4 !important; }
        .bg-purple { background-color: #9333ea !important; }
      `}</style>
    </div>
  );
}