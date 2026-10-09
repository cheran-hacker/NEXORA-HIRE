import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { alumniAuthService } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import Button from '../../shared/components/Button.jsx';
import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

// Import newly built futuristic components
import './components/alumni-registration/FuturisticRegistration.css';
import LeftIdentityPanel from './components/alumni-registration/LeftIdentityPanel.jsx';
import RegistrationProgress from './components/alumni-registration/RegistrationProgress.jsx';
import StepPersonal from './components/alumni-registration/StepPersonal.jsx';
import StepAcademic from './components/alumni-registration/StepAcademic.jsx';
import StepProfessional from './components/alumni-registration/StepProfessional.jsx';
import StepReview from './components/alumni-registration/StepReview.jsx';

export default function AlumniRegistration() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [invitation, setInvitation] = useState(null);
  const [error, setError] = useState(null);

  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    registerNumber: '',
    phone: '',
    location: '',
    degree: '',
    department: '',
    graduationYear: '',
    batch: '',
    currentCompany: '',
    currentJobTitle: '',
    industry: '',
    experience: '',
    skills: '',
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
    professionalSummary: '',
    careerDomain: '',
    vacancySharingPreference: false
  });

  useEffect(() => {
    // Add dark theme class dynamically to ensure the CSS variables work properly if the whole app isn't forcing it
    document.documentElement.setAttribute('data-bs-theme', 'dark');

    alumniAuthService.validateInvitation(token)
      .then(res => {
        const invData = res.data.data;
        setInvitation(invData);
        setFormData(prev => ({
          ...prev,
          name: invData.name || '',
          email: invData.email || '',
          department: invData.department || '',
          batch: invData.batch || '',
          currentCompany: invData.company || '',
        }));
        setLoading(false);
      })
      .catch(err => {
        if (!err.response) {
          setError({ type: 'network', message: 'Unable to connect to the registration service.' });
        } else if (err.response.status === 404) {
          setError({ type: 'invalid', message: 'This invitation link is invalid.' });
        } else if (err.response.status === 400 && err.response.data.message.includes('expired')) {
          setError({ type: 'expired', message: 'This invitation has expired.' });
        } else if (err.response.status === 400 && err.response.data.message.includes('already submitted')) {
          setError({ type: 'used', message: 'This invitation has already been used.' });
        } else {
          setError({ type: 'invalid', message: err.response?.data?.message || 'Invalid invitation link.' });
        }
        setLoading(false);
      });

      return () => {
        // Optional cleanup if we want to restore theme
        // document.documentElement.removeAttribute('data-bs-theme');
      }
  }, [token]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNext = () => {
    // Basic validation before proceeding can be added here
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        skills: formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(Boolean) : []
      };
      await alumniAuthService.register(token, payload);
      addToast('Identity Initialized successfully! Pending admin approval.', 'success');
      setIsSubmitted(true);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to initialize identity', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // -------------------------------------------------------------
  // STATE RENDERING
  // -------------------------------------------------------------

  if (loading) return (
    <div className="fr-container d-flex h-screen vh-100 items-center justify-center align-items-center">
      <div className="d-flex flex-column align-items-center gap-3 text-center">
        <div className="spinner-border" style={{ color: 'var(--fr-primary)' }} role="status"></div>
        <p className="fw-medium mt-3" style={{ color: 'var(--fr-text-main)', letterSpacing: '2px', textTransform: 'uppercase' }}>
          VERIFYING SECURE INVITATION CHANNEL...
        </p>
      </div>
    </div>
  );

  if (error) {
    const isNetwork = error.type === 'network';
    const isUsed = error.type === 'used';
    return (
      <div className="fr-container d-flex h-screen vh-100 items-center justify-center align-items-center">
        <div className="fr-form-panel p-5 text-center mx-4" style={{ maxWidth: '450px' }}>
          <div className="mb-4 d-flex justify-content-center">
            {isNetwork ? <AlertCircle size={56} className="text-warning" /> : <XCircle size={56} className="text-danger" />}
          </div>
          <h2 className="fs-3 fw-bold mb-3 text-uppercase tracking-wide" style={{ color: 'var(--fr-text-main)' }}>
            {isNetwork ? 'SYSTEM UNAVAILABLE' : (isUsed ? 'REGISTRATION ALREADY SUBMITTED' : 'ACCESS DENIED')}
          </h2>
          <p className="mb-5" style={{ color: 'var(--fr-text-muted)' }}>{error.message}</p>
          <button 
            onClick={() => isUsed ? window.location.href='/' : window.location.reload()} 
            className="fr-btn-secondary w-100 text-uppercase" style={{ letterSpacing: '1px' }}
          >
            {isNetwork ? 'Retry Connection' : (isUsed ? 'Return Home' : 'Refresh Page')}
          </button>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="fr-container d-flex h-screen vh-100 items-center justify-center align-items-center">
        <div className="fr-form-panel p-5 text-center mx-4" style={{ maxWidth: '500px' }}>
          <div className="mb-4 d-flex justify-content-center">
            <motion.div
               initial={{ scale: 0 }}
               animate={{ scale: 1 }}
               transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              <CheckCircle2 size={64} style={{ color: 'var(--fr-primary)' }} className="fr-animate-pulse rounded-circle" />
            </motion.div>
          </div>
          <h2 className="fs-3 fw-bold mb-3 text-uppercase tracking-wider" style={{ color: 'var(--fr-text-main)' }}>
            IDENTITY INITIALIZED
          </h2>
          <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-4 border" style={{ borderColor: 'var(--fr-border)', backgroundColor: 'rgba(255, 193, 7, 0.1)', color: '#ffc107', fontSize: '0.75rem', letterSpacing: '1px' }}>
            STATUS: PENDING ADMIN APPROVAL
          </div>
          <p className="mb-4" style={{ color: 'var(--fr-text-muted)', lineHeight: '1.6' }}>
            Registration submitted successfully. Your profile will become active after administrator approval.
          </p>
          <button onClick={() => window.location.href='/'} className="fr-btn-primary w-100 text-uppercase" style={{ letterSpacing: '1px' }}>
            Return to Homepage
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // MAIN WIZARD
  // -------------------------------------------------------------
  return (
    <div className="fr-container container-fluid p-0">
      <div className="row g-0 min-vh-100">
        
        {/* Left Side: Hero / Identity Info */}
        <LeftIdentityPanel />

        {/* Right Side: Registration Form Wizard */}
        <div className="col-12 col-lg-7 d-flex flex-column vh-100 overflow-auto fr-scrollbar position-relative" style={{ scrollBehavior: 'smooth', backgroundColor: 'var(--fr-bg)', color: 'var(--fr-text-main)' }}>
          
          {/* Header Controls (Theme Toggle & Secure Badge) */}
          <div className="d-flex justify-content-end align-items-center p-4 position-relative z-3 w-100" style={{ gap: '2rem' }}>
            <div className="d-flex align-items-center gap-2">
              <div className="fr-trust-icon" style={{ width: '28px', height: '28px' }}><CheckCircle2 size={14}/></div>
              <div>
                <div className="fw-bolder text-uppercase" style={{ fontSize: '0.7rem', color: 'var(--fr-primary)', letterSpacing: '1px' }}>SECURE REGISTRATION</div>
                <div className="text-muted" style={{ fontSize: '0.65rem' }}>Your data is encrypted and protected</div>
              </div>
            </div>
            
            {/* Simple theme toggle */}
            <div className="d-flex align-items-center rounded-pill px-2 py-1 border" style={{ borderColor: 'var(--fr-border)', backgroundColor: 'var(--fr-card-bg)', gap: '4px' }}>
              <span className="small px-2" style={{ cursor: 'pointer', color: 'var(--fr-text-main)', borderRadius: '20px', padding: '2px 10px' }} onClick={() => document.documentElement.setAttribute('data-bs-theme', 'dark')}>☾</span>
              <span className="small px-2" style={{ cursor: 'pointer', color: 'var(--fr-text-muted)', borderLeft: '1px solid var(--fr-border)', borderRadius: '20px', padding: '2px 10px' }} onClick={() => document.documentElement.setAttribute('data-bs-theme', 'light')}>☀</span>
            </div>
          </div>

          <div className="flex-grow-1 d-flex flex-column px-4 pb-5 pt-2 mx-auto w-100 position-relative z-1" style={{ maxWidth: '800px' }}>
            
            {/* Main Form Panel */}
            <div className="fr-form-panel p-4 p-md-5 mt-auto mb-auto">
              {/* Corner Accents */}
              <div className="fr-corner-top-left"></div>
              <div className="fr-corner-top-right"></div>
              <div className="fr-corner-bottom-left"></div>
              <div className="fr-corner-bottom-right"></div>

              {/* Panel Header */}
              <div className="mb-4 d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-uppercase fw-bold mb-1" style={{ fontSize: '0.7rem', letterSpacing: '2px', color: 'var(--fr-text-muted)' }}>ALUMNI REGISTRATION</div>
                  <h2 className="fw-bolder mb-2" style={{ fontSize: '1.75rem', color: 'var(--fr-text-main)' }}>Create Your Alumni Identity</h2>
                  <p className="small mb-0" style={{ color: 'var(--fr-text-muted)' }}>Complete your profile to join the NEXORA alumni ecosystem.</p>
                </div>
                <div className="small fw-bolder" style={{ color: 'var(--fr-text-muted)' }}>Step {currentStep} of 4</div>
              </div>

              {/* Progress Bar */}
              <RegistrationProgress currentStep={currentStep} />

              {/* Form Steps */}
              <div className="position-relative" style={{ minHeight: '400px' }}>
                <AnimatePresence mode="wait">
                  {currentStep === 1 && (
                    <StepPersonal 
                      key="step1" 
                      formData={formData} 
                      handleChange={handleChange} 
                      onNext={handleNext} 
                    />
                  )}
                  {currentStep === 2 && (
                    <StepAcademic 
                      key="step2" 
                      formData={formData} 
                      handleChange={handleChange} 
                      onNext={handleNext} 
                      onPrev={handlePrev} 
                    />
                  )}
                  {currentStep === 3 && (
                    <StepProfessional 
                      key="step3" 
                      formData={formData} 
                      handleChange={handleChange} 
                      onNext={handleNext} 
                      onPrev={handlePrev} 
                    />
                  )}
                  {currentStep === 4 && (
                    <StepReview 
                      key="step4" 
                      formData={formData} 
                      onPrev={handlePrev} 
                      onSubmit={handleSubmit}
                      submitting={submitting}
                    />
                  )}
                </AnimatePresence>
              </div>

            </div>
          </div>

          {/* Footer inside right panel */}
          <div className="d-flex justify-content-between align-items-center px-5 py-4 border-top" style={{ borderColor: 'var(--fr-border)!important' }}>
            <div className="small">
              <span className="fw-bold me-2" style={{ color: 'var(--fr-text-main)' }}>NEXORA</span> <span style={{ color: 'var(--fr-text-muted)' }}>| BITSathy Alumni Network</span>
              <div className="mt-1" style={{ fontSize: '0.7rem', color: 'var(--fr-text-muted)' }}>Reconnect · Network · Grow · Give Back</div>
            </div>
            <div className="d-flex gap-4 small" style={{ color: 'var(--fr-text-muted)' }}>
              <span style={{ cursor: 'pointer' }}>Privacy</span>
              <span style={{ cursor: 'pointer' }}>Terms</span>
              <span style={{ cursor: 'pointer' }}>Help</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
