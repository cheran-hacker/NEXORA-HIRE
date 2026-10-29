import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext";
import { GoogleLogin } from "@react-oauth/google";
import {
  GraduationCap,
  Briefcase,
  Users,
  Building,
  ShieldCheck,
  UserCheck,
  ArrowRight,
  Sun,
  Moon,
  Lock,
  Mail,
  Key,
  ShieldAlert,
  Loader2,
  CheckCircle2
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext.jsx";
import { authService } from "../../services/api.js";

const ROLES = [
  { id: "student", label: "Student", icon: GraduationCap, color: "var(--primary)" },
  { id: "placement", label: "Placement", icon: Building, color: "var(--purple)" },
  { id: "alumni", label: "Alumni", icon: UserCheck, color: "var(--info)" },
  { id: "admin", label: "Admin", icon: ShieldCheck, color: "var(--danger)" },
];

const AbstractCard = ({ delay, width, height, gradient, yOffset, opacity = 1 }) => (
  <motion.div
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: [yOffset, yOffset - 10, yOffset], opacity }}
    transition={{ 
      y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay },
      opacity: { duration: 0.8, delay: delay * 0.5 }
    }}
    style={{
      width, height,
      background: gradient,
      borderRadius: '16px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      border: '1px solid rgba(255,255,255,0.1)',
      backdropFilter: 'blur(10px)',
      marginBottom: '16px'
    }}
  >
    {/* Abstract Skeleton Content */}
    <div className="p-3 d-flex flex-column gap-2 h-100 justify-content-center">
      <div style={{ width: '40%', height: '8px', background: 'rgba(255,255,255,0.2)', borderRadius: '4px' }}></div>
      <div style={{ width: '70%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}></div>
      <div className="mt-auto d-flex justify-content-between align-items-end">
         <div style={{ width: '32px', height: '32px', background: 'rgba(255,255,255,0.15)', borderRadius: '50%' }}></div>
         <div style={{ width: '30%', height: '8px', background: 'rgba(255,255,255,0.2)', borderRadius: '4px' }}></div>
      </div>
    </div>
  </motion.div>
);

const Login = () => {
  const [searchParams] = useSearchParams();
  const roleFromUrl = searchParams.get("role")?.toLowerCase();
  const initialRole = ["student", "placement", "alumni", "admin"].includes(roleFromUrl)
    ? roleFromUrl
    : "student";

  const [activeRole, setActiveRole] = useState(initialRole);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successStep, setSuccessStep] = useState(null); // 'verifying' | 'verified'
  const [useStudentEmailLogin, setUseStudentEmailLogin] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();
  
  const navigate = useNavigate();
  const { login, googleLogin } = useAuth();
  const { addToast } = useToast();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const roleParam = searchParams.get("role")?.toLowerCase();
    if (roleParam && ["student", "placement", "alumni", "admin"].includes(roleParam)) {
      setActiveRole(roleParam);
      if (roleParam === "alumni") {
        setValue("email", "ravi.k@alumni.edu");
        setValue("password", "password123");
      }
    }
  }, [searchParams, setValue]);

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setIsLoading(true);
      setErrorMsg(null);
      setSuccessStep('verifying');
      
      const { user, requiresOnboarding } = await googleLogin(
        credentialResponse.credential,
        activeRole,
      );
      
      setSuccessStep('verified');
      
      // Delay navigation slightly to show success state
      setTimeout(() => {
        if (requiresOnboarding) {
          navigate("/onboarding");
          return;
        }
        const roleId = user.role?.toLowerCase() || "student";
        if (roleId === "admin") navigate("/admin/dashboard");
        else if (roleId === "recruiter") navigate("/recruiter/dashboard");
        else if (roleId === "placement") navigate("/placement/dashboard");
        else if (roleId === "alumni") navigate("/alumni/dashboard");
        else navigate("/student/dashboard");
      }, 800);
      
    } catch (err) {
      console.error(err);
      setSuccessStep(null);
      setIsLoading(false);
      const msg = err?.response?.data?.message || "Authentication failed.";
      setErrorMsg(msg);
      addToast(msg, "error");
    }
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const email = data.email?.trim();
      const password = data.password?.trim();
      const result = await login(email, password);
      
      if (!result.success) {
        setErrorMsg(result.message || "Invalid credentials");
        setIsLoading(false);
        return;
      }
      
      const userRole = result.role || activeRole; 
      const targetRole = userRole.toLowerCase();
      if (targetRole === "admin") navigate("/admin/dashboard");
      else if (targetRole === "recruiter") navigate("/recruiter/dashboard");
      else if (targetRole === "placement") navigate("/placement/dashboard");
      else if (targetRole === "alumni") navigate("/alumni/dashboard");
      else navigate("/student/dashboard");
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || "Invalid email or password");
      setIsLoading(false);
    }
  };

  const handleRoleSwitch = (roleId) => {
    setActiveRole(roleId);
    setErrorMsg(null);
    if (roleId === 'alumni') {
      setValue("email", "ravi.k@alumni.edu");
      setValue("password", "password123");
    } else if (roleId === 'placement') {
      setValue("email", "placement@nexora.com");
      setValue("password", "password123");
    } else if (roleId === 'admin') {
      setValue("email", "cheran@it");
      setValue("password", "admin123");
    } else if (roleId === 'student') {
      setValue("email", "cheran.it23@bitsathy.ac.in");
      setValue("password", "password123");
    } else {
      setValue("email", "");
      setValue("password", "");
    }
  };

  return (
    <div 
      className="min-vh-100 d-flex overflow-hidden"
      style={{ 
        background: theme === 'dark' ? 'var(--bg)' : '#f8fafc',
        color: 'var(--text)'
      }}
    >
      {/* ── LEFT PANEL: BRANDING (Desktop 45%, Mobile Hidden/Compact) ── */}
      <div 
        className="d-none d-lg-flex flex-column justify-content-between position-relative overflow-hidden"
        style={{
          width: "45%",
          background: theme === 'dark' 
            ? 'linear-gradient(180deg, #0f172a 0%, #020617 100%)' 
            : 'linear-gradient(180deg, #f1f5f9 0%, #e2e8f0 100%)',
          borderRight: "1px solid var(--border)",
          padding: "3.5rem"
        }}
      >
        {/* Glow Effects */}
        <div className="position-absolute rounded-circle" style={{ top: '-10%', left: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(var(--primary-rgb),0.12) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="position-absolute rounded-circle" style={{ bottom: '-10%', right: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(var(--purple-rgb),0.1) 0%, transparent 70%)', filter: 'blur(80px)' }} />

        <div className="position-relative z-1">
          <Link to="/" className="d-flex align-items-center gap-3 text-decoration-none mb-5 hover-lift" style={{ width: 'fit-content' }}>
            <div className="d-flex align-items-center justify-content-center rounded-3 shadow" style={{ width: "42px", height: "42px", background: "linear-gradient(135deg, var(--primary), var(--purple))" }}>
              <Users color="white" size={22} strokeWidth={2.5} />
            </div>
            <span className="fw-black m-0" style={{ fontSize: "1.4rem", letterSpacing: "1.5px", color: "var(--text)" }}>
              NEXORA
            </span>
          </Link>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h1 className="fw-black mb-4" style={{ fontSize: "3.5rem", lineHeight: "1.05", letterSpacing: "-0.04em" }}>
              Your campus,<br />
              <span style={{ 
                background: 'linear-gradient(135deg, var(--primary), var(--purple))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block'
              }}>supercharged.</span>
            </h1>
            <p className="fs-5 fw-medium" style={{ color: "var(--text-muted)", maxWidth: "420px", lineHeight: '1.6' }}>
              Connect with peers, discover opportunities, manage your campus journey, and accelerate your career.
            </p>
          </motion.div>
        </div>

        {/* Abstract Campus Visuals */}
        <div className="position-relative z-1 mt-auto d-flex justify-content-center align-items-end h-100 pb-4" style={{ perspective: '1000px' }}>
           <div className="d-flex gap-4 align-items-end" style={{ transform: 'rotateX(5deg) rotateY(-5deg)' }}>
              {/* Column 1 */}
              <div className="d-flex flex-column justify-content-end">
                 <AbstractCard delay={0.2} width="160px" height="120px" gradient="linear-gradient(135deg, rgba(var(--primary-rgb),0.8), rgba(var(--purple-rgb),0.6))" yOffset={0} />
                 <AbstractCard delay={0.5} width="160px" height="180px" gradient={theme === 'dark' ? 'rgba(30,41,59,0.7)' : 'rgba(255,255,255,0.7)'} yOffset={10} opacity={0.7} />
              </div>
              {/* Column 2 */}
              <div className="d-flex flex-column justify-content-end pb-4">
                 <AbstractCard delay={0.3} width="200px" height="160px" gradient={theme === 'dark' ? 'rgba(30,41,59,0.8)' : 'rgba(255,255,255,0.8)'} yOffset={-10} />
                 <AbstractCard delay={0.6} width="200px" height="140px" gradient="linear-gradient(135deg, rgba(var(--info-rgb),0.7), rgba(var(--primary-rgb),0.5))" yOffset={5} />
              </div>
           </div>
        </div>
      </div>

      {/* ── RIGHT PANEL: AUTHENTICATION (Desktop 55%, Mobile 100%) ── */}
      <div 
        className="flex-grow-1 d-flex flex-column align-items-center justify-content-center position-relative p-4 p-md-5" 
        style={{ minHeight: "100dvh", overflowY: 'auto' }}
      >
        {/* Mobile Logo / Theme Toggle Area */}
        <div className="position-absolute top-0 start-0 w-100 p-4 d-flex justify-content-between align-items-center z-2">
          <Link to="/" className="d-lg-none d-flex align-items-center gap-2 text-decoration-none">
            <div className="d-flex align-items-center justify-content-center rounded shadow-sm" style={{ width: "32px", height: "32px", background: "linear-gradient(135deg, var(--primary), var(--purple))" }}>
              <Users color="white" size={16} />
            </div>
            <span className="fw-black m-0" style={{ fontSize: "1.2rem", color: "var(--text)" }}>NEXORA</span>
          </Link>
          <button onClick={toggleTheme} className="btn btn-link p-2 rounded-circle ms-auto shadow-sm" style={{ color: "var(--text)", background: "var(--surface)", border: '1px solid var(--border)' }}>
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        {/* AUTH CARD */}
        <motion.div 
          className="w-100"
          style={{ maxWidth: "520px", marginTop: '3rem' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="text-center mb-5">
            <h2 className="fw-black mb-3" style={{ fontSize: "2.2rem", letterSpacing: "-0.02em", color: "var(--text)" }}>
              Welcome back
            </h2>
            <p className="fw-medium m-0" style={{ fontSize: "1.05rem", color: "var(--text-muted)" }}>
              Sign in securely to continue to your campus workspace.
            </p>
          </div>

          {/* Card Container */}
          <div 
            className="p-4 p-md-5 rounded-4 shadow-lg position-relative overflow-hidden" 
            style={{ 
              background: theme === 'dark' ? 'rgba(15, 23, 42, 0.6)' : '#ffffff',
              border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
              backdropFilter: 'blur(20px)'
            }}
          >
            {/* Segmented Role Selector */}
            <div 
              className="d-flex p-1 rounded-3 mb-5" 
              style={{ background: theme === 'dark' ? 'rgba(0,0,0,0.3)' : '#f1f5f9' }}
            >
              {ROLES.map((role) => {
                const isActive = activeRole === role.id;
                return (
                  <button
                    key={role.id}
                    onClick={() => handleRoleSwitch(role.id)}
                    className="flex-grow-1 btn position-relative border-0"
                    style={{
                      padding: "10px 0",
                      fontSize: "0.85rem",
                      fontWeight: isActive ? "700" : "600",
                      color: isActive ? "white" : "var(--text-secondary)",
                      zIndex: 1,
                      transition: 'color 0.2s ease'
                    }}
                  >
                    {isActive && (
                      <motion.div 
                        layoutId="activeRoleBg"
                        className="position-absolute top-0 start-0 w-100 h-100 rounded-2 shadow-sm"
                        style={{ background: 'linear-gradient(135deg, var(--primary), var(--purple))', zIndex: -1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="d-flex align-items-center justify-content-center gap-2">
                      <role.icon size={16} /> <span className="d-none d-sm-inline">{role.label}</span>
                    </span>
                  </button>
                )
              })}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeRole}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {/* ── ROLE HEADERS ── */}
                <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom" style={{ borderColor: 'var(--border) !important' }}>
                  {(() => {
                    const RoleIcon = ROLES.find(r => r.id === activeRole)?.icon || UserCheck;
                    const roleColor = ROLES.find(r => r.id === activeRole)?.color;
                    return (
                      <div className="p-2 rounded-3" style={{ background: `color-mix(in srgb, ${roleColor} 15%, transparent)`, color: roleColor }}>
                        <RoleIcon size={24} strokeWidth={2.5} />
                      </div>
                    )
                  })()}
                  <div>
                    <h4 className="fw-bold m-0">{ROLES.find(r => r.id === activeRole)?.label} Access</h4>
                    <span className="small text-muted fw-medium">
                      {activeRole === 'student' ? 'Institutional Google Auth Required' : 'Secure Credentials Required'}
                    </span>
                  </div>
                </div>

                {/* ── STUDENT LOGIN VIEW ── */}
                {activeRole === 'student' && !useStudentEmailLogin ? (
                  <div className="d-flex flex-column gap-3">
                    {/* Method Selector Tabs */}
                    <div className="d-flex p-1 rounded-pill mb-1" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                      <button
                        type="button"
                        className="btn btn-sm rounded-pill flex-fill fw-bold py-1 btn-primary"
                        onClick={() => setUseStudentEmailLogin(false)}
                      >
                        Institutional Google
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm rounded-pill flex-fill fw-bold py-1 text-muted"
                        onClick={() => {
                          setUseStudentEmailLogin(true);
                          setValue("email", "cheran.it23@bitsathy.ac.in");
                          setValue("password", "password123");
                        }}
                      >
                        Student ID & Password
                      </button>
                    </div>

                    <p className="fw-medium text-center m-0 small" style={{ color: "var(--text)" }}>
                      Use your approved institutional Google account to access NEXORA.
                    </p>
                    
                    {/* States Handler */}
                    <div className="d-flex justify-content-center">
                      {successStep === 'verifying' && (
                        <div className="text-center py-4 text-primary d-flex flex-column align-items-center gap-3">
                          <Loader2 size={32} className="animate-spin" />
                          <span className="fw-bold">Verifying your institutional account...</span>
                        </div>
                      )}
                      
                      {successStep === 'verified' && (
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-center py-4 text-success d-flex flex-column align-items-center gap-3">
                          <CheckCircle2 size={36} />
                          <span className="fw-bold fs-5">Account verified</span>
                        </motion.div>
                      )}

                      {!successStep && (
                        <div style={{ width: '100%', maxWidth: '320px', minHeight: '56px' }} className="d-flex align-items-center justify-content-center shadow-sm rounded-pill overflow-hidden">
                          <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => {
                              setUseStudentEmailLogin(true);
                              setValue("email", "cheran.it23@bitsathy.ac.in");
                              setValue("password", "password123");
                              setErrorMsg("Google Sign-In is restricted for this origin in local development. Switched to Student Email/Password.");
                            }}
                            theme={theme === "dark" ? "filled_black" : "outline"}
                            shape="pill"
                            size="large"
                            text="continue_with"
                            width="320"
                          />
                        </div>
                      )}
                    </div>

                    <div className="text-center">
                      <button
                        type="button"
                        className="btn btn-link text-decoration-none small fw-bold"
                        style={{ color: "var(--primary)" }}
                        onClick={() => {
                          setUseStudentEmailLogin(true);
                          setValue("email", "cheran.it23@bitsathy.ac.in");
                          setValue("password", "password123");
                        }}
                      >
                        ⚡ Or Sign in with Student Email & Password
                      </button>
                    </div>

                    <div className="d-flex flex-column gap-2 p-3 rounded-3 mt-1" style={{ background: theme === 'dark' ? 'rgba(0,0,0,0.2)' : '#f8fafc', border: '1px solid var(--border)' }}>
                      <div className="d-flex gap-2 align-items-start">
                        <ShieldCheck size={16} className="text-primary mt-1 flex-shrink-0" />
                        <span className="small fw-semibold text-muted">Only approved <strong>@bitsathy.ac.in</strong> accounts are permitted.</span>
                      </div>
                      <div className="d-flex gap-2 align-items-start">
                        <Lock size={16} className="text-secondary mt-1 flex-shrink-0" />
                        <span className="small fw-medium text-muted">Your account must be added and approved by the administrator before access is granted.</span>
                      </div>
                    </div>

                    {errorMsg && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="alert alert-danger d-flex gap-3 align-items-start border-0 shadow-sm p-3 mt-2">
                        <ShieldAlert size={20} className="flex-shrink-0 mt-1" />
                        <div>
                          <strong className="d-block mb-1">Access Notice</strong>
                          <span className="small">{errorMsg}</span>
                        </div>
                      </motion.div>
                    )}
                  </div>
                ) : (
                  /* ── PLACEMENT, ALUMNI, ADMIN & STUDENT EMAIL VIEW ── */
                  <form onSubmit={handleSubmit(onSubmit)} className="d-flex flex-column gap-3">
                    
                    {activeRole === 'student' && useStudentEmailLogin && (
                      <>
                        <div className="d-flex p-1 rounded-pill mb-1" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                          <button
                            type="button"
                            className="btn btn-sm rounded-pill flex-fill fw-bold py-1 text-muted"
                            onClick={() => setUseStudentEmailLogin(false)}
                          >
                            Institutional Google
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm rounded-pill flex-fill fw-bold py-1 btn-primary"
                            onClick={() => setUseStudentEmailLogin(true)}
                          >
                            Student ID & Password
                          </button>
                        </div>
                        <div className="p-2 px-3 rounded-3 d-flex justify-content-between align-items-center" style={{ background: 'rgba(37, 99, 235, 0.1)', border: '1px solid rgba(37, 99, 235, 0.25)' }}>
                          <div className="small">
                            <span className="text-muted">Student: </span>
                            <strong className="text-white">cheran.it23@bitsathy.ac.in</strong>
                            <span className="text-muted ms-2">Pass: </span>
                            <code className="text-primary">password123</code>
                          </div>
                          <button 
                            type="button" 
                            className="btn btn-sm btn-outline-primary rounded-pill px-2 py-0 fw-semibold"
                            style={{ fontSize: '0.75rem' }}
                            onClick={() => {
                              setValue('email', 'cheran.it23@bitsathy.ac.in');
                              setValue('password', 'password123');
                            }}
                          >
                            Auto Fill
                          </button>
                        </div>
                      </>
                    )}

                    
                    {activeRole === 'placement' && (
                      <div className="p-2 px-3 rounded-3 d-flex justify-content-between align-items-center" style={{ background: 'rgba(147, 51, 234, 0.1)', border: '1px solid rgba(147, 51, 234, 0.25)' }}>
                        <div className="small">
                          <span className="text-muted">Placement Login: </span>
                          <strong className="text-white">placement@nexora.com</strong>
                          <span className="text-muted ms-2">Pass: </span>
                          <code className="text-primary">password123</code>
                        </div>
                        <button 
                          type="button" 
                          className="btn btn-sm btn-outline-primary rounded-pill px-2 py-0 fw-semibold"
                          style={{ fontSize: '0.75rem' }}
                          onClick={() => {
                            setValue('email', 'placement@nexora.com');
                            setValue('password', 'password123');
                          }}
                        >
                          Auto Fill
                        </button>
                      </div>
                    )}

                    {activeRole === 'alumni' && (
                      <div className="p-2 px-3 rounded-3 d-flex justify-content-between align-items-center" style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.25)' }}>
                        <div className="small">
                          <span className="text-muted">Alumni Login: </span>
                          <strong className="text-white">ravi.k@alumni.edu</strong>
                          <span className="text-muted ms-2">Pass: </span>
                          <code className="text-info">password123</code>
                        </div>
                        <button 
                          type="button" 
                          className="btn btn-sm btn-outline-info rounded-pill px-2 py-0 fw-semibold"
                          style={{ fontSize: '0.75rem' }}
                          onClick={() => {
                            setValue('email', 'ravi.k@alumni.edu');
                            setValue('password', 'password123');
                          }}
                        >
                          Auto Fill
                        </button>
                      </div>
                    )}

                    {activeRole === 'admin' && (
                      <div className="p-2 px-3 rounded-3 d-flex justify-content-between align-items-center" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)' }}>
                        <div className="small">
                          <span className="text-muted">Admin Login: </span>
                          <strong className="text-white">cheran@it</strong>
                          <span className="text-muted ms-2">Pass: </span>
                          <code className="text-danger">admin123</code>
                        </div>
                        <button 
                          type="button" 
                          className="btn btn-sm btn-outline-danger rounded-pill px-2 py-0 fw-semibold"
                          style={{ fontSize: '0.75rem' }}
                          onClick={() => {
                            setValue('email', 'cheran@it');
                            setValue('password', 'admin123');
                          }}
                        >
                          Auto Fill
                        </button>
                      </div>
                    )}

                    <div>
                      <label className="form-label small fw-bold text-uppercase" style={{ letterSpacing: "0.05em", color: "var(--text-muted)" }}>
                        Email address
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-transparent border-end-0 text-muted px-3" style={{ borderColor: "var(--border)" }}>
                          <Mail size={18} />
                        </span>
                        <input
                          type="email"
                          className={`form-control bg-transparent border-start-0 ps-0 py-3 ${errors.email ? "is-invalid" : ""}`}
                          style={{ borderColor: "var(--border)", color: "var(--text)" }}
                          placeholder="name@institution.edu"
                          {...register("email", { required: "Email is required" })}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <label className="form-label small fw-bold text-uppercase m-0" style={{ letterSpacing: "0.05em", color: "var(--text-muted)" }}>
                          Password
                        </label>
                        <Link to="/forgot-password" className="small text-decoration-none text-primary fw-bold hover-glow">
                          Forgot password?
                        </Link>
                      </div>
                      <div className="input-group">
                        <span className="input-group-text bg-transparent border-end-0 text-muted px-3" style={{ borderColor: "var(--border)" }}>
                          <Key size={18} />
                        </span>
                        <input
                          type="password"
                          className={`form-control bg-transparent border-start-0 ps-0 py-3 ${errors.password ? "is-invalid" : ""}`}
                          style={{ borderColor: "var(--border)", color: "var(--text)" }}
                          placeholder="••••••••"
                          {...register("password", { required: "Password is required" })}
                        />
                      </div>
                    </div>

                    {errorMsg && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="alert alert-danger border-0 p-3 small d-flex gap-2 align-items-center">
                        <ShieldAlert size={16} className="flex-shrink-0" />
                        <span className="fw-semibold">{errorMsg}</span>
                      </motion.div>
                    )}

                    <button
                      type="submit"
                      className="btn w-100 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm hover-lift mt-2"
                      style={{ 
                        padding: "16px", 
                        borderRadius: "12px",
                        background: ROLES.find(r => r.id === activeRole)?.color,
                        color: 'white',
                        border: 'none'
                      }}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="spinner-border spinner-border-sm" />
                      ) : (
                        <>Sign In securely <ArrowRight size={18} /></>
                      )}
                    </button>
                  </form>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
          
          {/* Footer */}
          <div className="text-center mt-4">
            <span className="small fw-medium text-muted">
              &copy; {new Date().getFullYear()} NEXORA Campus Ecosystem. All rights reserved.
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
