import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Sparkles, Network, Briefcase, Shield, CheckCircle2,
  FileText, BrainCircuit, Users, Target, BarChart3, ChevronDown, Rocket, Layout,
  Layers, MessagesSquare, Lightbulb, GraduationCap, Map, Cpu, Zap, Activity, UserCheck
} from "lucide-react";

export default function Landing() {
  const [openFaq, setOpenFaq] = useState(0);

  // Simplified and guaranteed visible variants
  const fadeIn = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const featureList = [
    { icon: <FileText size={20} />, title: "AI Resume Analyzer", desc: "Automated scoring and improvement suggestions.", link: "/student/resume" },
    { icon: <Target size={20} />, title: "Smart Skill Gap Analysis", desc: "Map your skills against your dream job.", link: "/student/learning-paths" },
    { icon: <Briefcase size={20} />, title: "Intelligent Job Matching", desc: "Get matched with opportunities that fit you.", link: "/student/jobs" },
    { icon: <BrainCircuit size={20} />, title: "AI Assessments", desc: "Adaptive testing powered by AI.", link: "/student/assessments" },
    { icon: <Zap size={20} />, title: "PDF → AI Assessment", desc: "Turn any study material into a quiz instantly.", link: "/student/assessments" },
    { icon: <MessagesSquare size={20} />, title: "AI Interview Simulator", desc: "Practice with an AI voice copilot.", link: "/student/interviews" },
    { icon: <Users size={20} />, title: "Alumni Network", desc: "Connect with graduates for mentorship.", link: "/alumni/dashboard" },
    { icon: <BarChart3 size={20} />, title: "Career Analytics", desc: "Track your growth over time.", link: "/student/learning-paths" },
    { icon: <Layout size={20} />, title: "Placement Management", desc: "Complete ATS for placement teams.", link: "/placement/dashboard" },
    { icon: <Layers size={20} />, title: "Role-Skill Mapping", desc: "Understand exactly what companies want.", link: "/student/learning-paths" },
    { icon: <Lightbulb size={20} />, title: "Ask Alumni", desc: "Get answers from experienced professionals.", link: "/student/ask-alumni" },
    { icon: <Map size={20} />, title: "Career Guidance", desc: "Personalized roadmaps for your journey.", link: "/student/learning-paths" },
  ];

  const faqs = [
    { q: "What is Nexora Campus?", a: "Nexora Campus brings student development, career preparation, alumni engagement and placement management into one connected digital ecosystem." },
    { q: "Who can use the platform?", a: "Students, Alumni, Placement Officers, and Administrators all have dedicated roles and dashboards." },
    { q: "How does skill-gap analysis work?", a: "The AI compares your current verified skills against industry standard requirements for your target role and generates a custom learning path." },
    { q: "How does job matching work?", a: "Our algorithm matches student skill vectors against company job requirements to provide high-accuracy placement recommendations." },
    { q: "How does alumni interaction work?", a: "Students can request mentorship sessions, ask questions on the forum, and apply for bounties posted by alumni." },
    { q: "Can placement teams create assessments?", a: "Yes, placement teams can generate custom assessments or leverage the AI to create question banks from uploaded PDFs." },
    { q: "Can assessments be generated from PDFs?", a: "Yes! Students and placement teams can upload PDFs. The AI instantly extracts context and creates a dynamic, graded quiz." }
  ];

  return (
    <div style={{ background: "var(--bg)", minHeight: "100dvh", overflowX: "hidden" }}>
      
      {/* ── 1. HERO SECTION ─────────────────────────────── */}
      <section className="position-relative d-flex align-items-center" style={{ paddingTop: "140px", paddingBottom: "100px", minHeight: "90vh" }}>
        <div className="position-absolute rounded-circle" style={{ top: "10%", left: "20%", width: "50vw", height: "50vw", background: "radial-gradient(circle, rgba(var(--primary-rgb), 0.12) 0%, transparent 60%)", filter: "blur(80px)", zIndex: 0, pointerEvents: "none" }}></div>
        
        <div className="container position-relative z-1">
          <div className="row align-items-center g-5">
            {/* HERO CONTENT: Animate immediately on load */}
            <motion.div 
              className="col-lg-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <div className="d-inline-flex align-items-center gap-2 px-3 py-2 rounded-pill mb-4" style={{ background: "rgba(var(--primary-rgb), 0.1)", border: "1px solid rgba(var(--primary-rgb), 0.2)", color: "var(--primary)", fontWeight: "700", fontSize: "0.85rem" }}>
                <Sparkles size={16} /> AI-POWERED STUDENT SUCCESS ECOSYSTEM
              </div>
              <h1 className="fw-black mb-4" style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)", lineHeight: "1.1", letterSpacing: "-0.03em", color: "var(--text)" }}>
                Build Your Career.<br/>
                Discover Your Potential.<br/>
                <span style={{ background: "linear-gradient(to right, var(--primary), var(--secondary))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Shape Your Future.</span>
              </h1>
              <p className="mb-5" style={{ fontSize: "1.1rem", color: "var(--text)", opacity: 0.8, maxWidth: "550px", lineHeight: "1.6" }}>
                One intelligent ecosystem connecting students, alumni, placement teams and career opportunities through personalized skills, assessments, guidance and recruitment.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Link to="/login" className="btn btn-primary btn-lg fw-bold rounded-pill px-5 d-flex align-items-center gap-2 hover-scale">
                  Get Started <ArrowRight size={20} />
                </Link>
                <a href="#features" className="btn btn-outline-secondary btn-lg fw-bold rounded-pill px-5 hover-scale" style={{ color: "var(--text)", borderColor: "var(--border)" }}>
                  Explore Platform
                </a>
              </div>
            </motion.div>
            
            {/* HERO VISUAL DASHBOARD: Animate immediately on load */}
            <motion.div 
              className="col-lg-6 d-none d-lg-block"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            >
              <div className="position-relative w-100 rounded-4 p-4 shadow-lg" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <div className="d-flex align-items-center gap-2 mb-4 border-bottom pb-3" style={{ borderColor: "var(--border) !important" }}>
                  <div className="rounded-circle bg-danger" style={{width: 12, height: 12}}></div>
                  <div className="rounded-circle bg-warning" style={{width: 12, height: 12}}></div>
                  <div className="rounded-circle bg-success" style={{width: 12, height: 12}}></div>
                  <span className="ms-2 fw-medium text-muted" style={{fontSize: "0.85rem"}}>Premium Student Career Intelligence</span>
                </div>
                
                <div className="row g-3">
                  <div className="col-12">
                    <div className="p-3 rounded-3" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="fw-semibold text-muted" style={{fontSize: "0.9rem"}}><Activity size={16} className="me-2 text-primary"/> Career Readiness</span>
                        <span className="fw-bold text-success">85% High</span>
                      </div>
                      <div className="progress" style={{ height: "8px", background: "var(--bg)" }}>
                        <div className="progress-bar bg-success" style={{ width: "85%" }}></div>
                      </div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 rounded-3 h-100" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                      <span className="d-block fw-semibold text-muted mb-1" style={{fontSize: "0.85rem"}}>Target Role</span>
                      <span className="fw-bold" style={{color: "var(--text)"}}>Frontend Engineer</span>
                      <div className="mt-3 d-flex align-items-center gap-2 text-primary fw-medium" style={{fontSize: "0.85rem"}}>
                        <Target size={16} /> 92% Skill Match
                      </div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 rounded-3 h-100" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                      <span className="d-block fw-semibold text-muted mb-1" style={{fontSize: "0.85rem"}}>Alumni Connection</span>
                      <span className="fw-bold" style={{color: "var(--text)"}}>3 Mentors Available</span>
                      <div className="mt-3 d-flex align-items-center gap-2 text-info fw-medium" style={{fontSize: "0.85rem"}}>
                        <Users size={16} /> Book Session
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 2. TRUST / VALUE STRIP ─────────────────────────────── */}
      <section className="py-4 border-top border-bottom" style={{ borderColor: "var(--border) !important", background: "var(--surface-2)" }}>
        <div className="container">
          <div className="d-flex flex-wrap justify-content-center align-items-center gap-4 gap-md-5 text-center">
            <span className="fw-black text-muted" style={{ letterSpacing: "0.1em", fontSize: "0.8rem" }}>ONE ECOSYSTEM FOR THE COMPLETE STUDENT CAREER JOURNEY:</span>
            <div className="d-flex gap-4 fw-bold" style={{ color: "var(--text)", opacity: 0.8 }}>
              <span>Students</span> • <span>Alumni</span> • <span>Placement</span> • <span>Administration</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. FEATURES SECTION ─────────────────────────────── */}
      <section id="features" className="py-6 py-md-7">
        <div className="container">
          <div className="text-center mb-6 max-w-2xl mx-auto">
            <h2 className="fw-black mb-3" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", color: "var(--text)" }}>Everything You Need to Move Forward</h2>
            <p className="fs-5 text-muted">From skill discovery to placement, bring your entire career journey into one intelligent ecosystem.</p>
          </div>

          <div className="row g-4">
            {featureList.map((f, i) => (
              <div className="col-lg-3 col-md-4 col-sm-6" key={i}>
                <Link to={f.link} className="text-decoration-none">
                  <motion.div 
                    initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeIn}
                    className="bento-card h-100 p-4 hover-scale"
                    style={{ transition: "all 0.3s" }}
                  >
                    <div className="icon-circle bg-primary text-white mb-4" style={{ width: 48, height: 48 }}>
                      {f.icon}
                    </div>
                    <h5 className="fw-bold mb-2" style={{ color: "var(--text)" }}>{f.title}</h5>
                    <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>{f.desc}</p>
                  </motion.div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. CAREER INTELLIGENCE WORKFLOW ─────────────────────────────── */}
      <section className="py-6 py-md-7" style={{ background: "var(--surface-2)" }}>
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-5">
              <h2 className="fw-black mb-4" style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)", color: "var(--text)" }}>Career Intelligence, Visualized.</h2>
              <p className="fs-5 text-muted mb-4">A structured pipeline from onboarding to placement, guided by artificial intelligence at every step.</p>
              <ul className="list-unstyled d-flex flex-column gap-3 mb-0">
                {["Student Profile Creation", "Target Career Role Selection", "Skill Gap Analysis", "Learning & AI Assessment", "Job Matching & Placement"].map((step, i) => (
                  <li key={i} className="d-flex align-items-center gap-3 fw-semibold" style={{ color: "var(--text)" }}>
                    <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: 28, height: 28, fontSize: "0.85rem" }}>{i+1}</div>
                    {step}
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-lg-7">
              <div className="bento-card p-4 p-md-5 text-center shadow-lg" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                 <div className="d-flex flex-column align-items-center gap-3 position-relative text-muted">
                   <div className="p-3 border rounded-3 fw-bold shadow-sm w-75" style={{ background: "var(--bg)" }}>Student Profile</div>
                   <ArrowRight size={24} style={{ transform: "rotate(90deg)" }} />
                   <div className="p-3 border rounded-3 fw-bold shadow-sm w-75" style={{ background: "var(--bg)" }}>Target Role</div>
                   <ArrowRight size={24} style={{ transform: "rotate(90deg)" }} />
                   <div className="p-3 border rounded-3 fw-bold shadow-sm w-75 border-primary text-primary" style={{ background: "var(--bg)" }}>Skill Gap Assessment</div>
                   <ArrowRight size={24} style={{ transform: "rotate(90deg)" }} />
                   <div className="p-3 border rounded-3 fw-bold shadow-sm w-75" style={{ background: "var(--bg)" }}>Job Matching & Interview Prep</div>
                   <ArrowRight size={24} style={{ transform: "rotate(90deg)" }} />
                   <div className="p-3 border rounded-3 fw-bold shadow-sm w-75 text-success border-success" style={{ background: "var(--bg)" }}>Placement Success</div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. ROLE-SKILL INTELLIGENCE (SKILL GAP) ─────────────────────────────── */}
      <section className="py-6 py-md-7">
        <div className="container">
          <div className="text-center mb-6 max-w-2xl mx-auto">
            <h2 className="fw-black mb-3" style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)", color: "var(--text)" }}>Know Exactly What Your Career Target Requires</h2>
            <p className="fs-5 text-muted">Identify exactly which skills you're missing for your dream role with our Skill Gap Engine.</p>
          </div>
          
          <div className="row g-4 justify-content-center">
            <div className="col-lg-8">
              <div className="bento-card p-4 p-md-5 shadow-sm">
                <div className="row g-4">
                  <div className="col-md-6 border-end" style={{ borderColor: "var(--border) !important" }}>
                    <h5 className="fw-bold mb-4 text-muted">Target Role: <span className="text-primary">Frontend Developer</span></h5>
                    <ul className="list-unstyled d-flex flex-column gap-3 mb-0" style={{ color: "var(--text)" }}>
                      <li className="d-flex justify-content-between"><span>HTML/CSS</span> <span className="badge bg-success">Verified</span></li>
                      <li className="d-flex justify-content-between"><span>JavaScript</span> <span className="badge bg-success">Verified</span></li>
                      <li className="d-flex justify-content-between"><span>React.js</span> <span className="badge bg-success">Verified</span></li>
                      <li className="d-flex justify-content-between"><span>REST APIs</span> <span className="badge bg-warning text-dark">Missing</span></li>
                    </ul>
                  </div>
                  <div className="col-md-6 d-flex flex-column justify-content-center align-items-center text-center">
                    <div className="display-3 fw-black text-gradient-primary mb-2">75%</div>
                    <h5 className="fw-bold text-muted">Skill Coverage</h5>
                    <p className="small text-muted mt-3">Visual data is illustrative. Connect your profile to see real metrics.</p>
                    <Link to="/student/learning-paths" className="btn btn-outline-primary rounded-pill mt-2">Analyze Your Skills</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. AI ASSESSMENT & ALUMNI SECTIONS ─────────────────────────────── */}
      <section className="py-6 py-md-7" style={{ background: "var(--surface-2)" }}>
        <div className="container">
          <div className="row g-5">
            {/* Assessment */}
            <div className="col-lg-6">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeIn} className="bento-card p-5 h-100 shadow-sm border">
                <div className="icon-circle bg-primary text-white mb-4" style={{ width: 56, height: 56 }}><BrainCircuit size={28} /></div>
                <h3 className="fw-black mb-3 text-gradient-primary">Turn Learning Material Into Assessments</h3>
                <p className="text-muted lh-lg mb-4">Upload any PDF document, and our AI instantly extracts the content, generates intelligent questions, and creates a valid assessment for practice.</p>
                
                <div className="d-flex flex-column gap-2 fw-medium text-muted small mt-4 p-3 rounded-3" style={{ background: "var(--bg)" }}>
                  <div className="d-flex align-items-center gap-2"><FileText size={16}/> PDF Upload</div>
                  <div className="d-flex align-items-center gap-2 ps-3 text-primary"><ArrowRight size={14}/> Content Extraction</div>
                  <div className="d-flex align-items-center gap-2 ps-4 text-info"><ArrowRight size={14}/> AI Question Generation</div>
                  <div className="d-flex align-items-center gap-2 ps-5 text-success"><ArrowRight size={14}/> Graded Assessment Ready</div>
                </div>
                
                <Link to="/student/assessments" className="btn btn-link px-0 fw-bold mt-3">Try AI Assessment <ArrowRight size={16} className="ms-1" /></Link>
              </motion.div>
            </div>
            
            {/* Alumni */}
            <div className="col-lg-6">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeIn} className="bento-card p-5 h-100 shadow-sm border">
                <div className="icon-circle bg-success text-white mb-4" style={{ width: 56, height: 56 }}><Network size={28} /></div>
                <h3 className="fw-black mb-3 text-success">Your Network Can Become Your Next Opportunity</h3>
                <p className="text-muted lh-lg mb-4">A complete alumni ecosystem. Connect with graduates, ask questions on the forum, request mentorship sessions, and discover referral opportunities.</p>
                
                <div className="d-flex align-items-center justify-content-between p-3 rounded-3 fw-bold text-center mt-4 border" style={{ background: "var(--bg)", color: "var(--text)" }}>
                  <div className="d-flex flex-column"><Users size={24} className="mx-auto mb-1 text-primary"/>Student</div>
                  <ArrowRight size={20} className="text-muted"/>
                  <div className="d-flex flex-column"><UserCheck size={24} className="mx-auto mb-1 text-success"/>Alumni</div>
                  <ArrowRight size={20} className="text-muted"/>
                  <div className="d-flex flex-column"><Briefcase size={24} className="mx-auto mb-1 text-warning"/>Company</div>
                </div>
                
                <Link to="/student/ask-alumni" className="btn btn-link text-success px-0 fw-bold mt-3">Ask Alumni <ArrowRight size={16} className="ms-1" /></Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. PLACEMENT & PIPELINE SECTION ─────────────────────────────── */}
      <section className="py-6 py-md-7">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6 order-2 order-lg-1">
              <div className="bento-card p-4 shadow-lg border">
                 <div className="d-flex flex-column gap-2 text-muted fw-bold text-center">
                    <div className="p-3 border rounded text-primary" style={{ background: "var(--bg)" }}>1. Job Posting Published</div>
                    <div className="p-3 border rounded text-info" style={{ background: "var(--bg)" }}>2. Student Applications & Assessments</div>
                    <div className="p-3 border rounded text-warning" style={{ background: "var(--bg)" }}>3. Skill-Based Shortlisting</div>
                    <div className="p-3 border rounded text-success" style={{ background: "var(--bg)" }}>4. Interview & Final Placement</div>
                 </div>
              </div>
            </div>
            <div className="col-lg-6 order-1 order-lg-2">
              <h2 className="fw-black mb-3" style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)", color: "var(--text)" }}>Streamlined Placement Operations</h2>
              <p className="fs-5 text-muted lh-lg mb-4">Complete applicant tracking system (ATS) for campus recruiters and placement officers. Monitor metrics, schedule interviews, and find the perfect candidates automatically.</p>
              <Link to="/placement/dashboard" className="btn btn-outline-primary rounded-pill fw-bold">Enter Placement Hub</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. HOW IT WORKS ─────────────────────────────── */}
      <section className="py-6 py-md-7 text-center" style={{ background: "var(--surface-2)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div className="container">
          <h2 className="fw-black mb-5" style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)", color: "var(--text)" }}>How It Works</h2>
          <div className="row g-4 justify-content-center">
            {[
              { num: "01", title: "Build Your Profile", text: "Add skills, resume, and academics." },
              { num: "02", title: "Define Career Goal", text: "Select your target role and industry." },
              { num: "03", title: "Develop & Assess", text: "Close the skill gap using AI tools." },
              { num: "04", title: "Discover Opportunities", text: "Get matched with top recruiters." }
            ].map((step, i) => (
              <div className="col-lg-3 col-md-6" key={i}>
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="h-100 p-3">
                  <div className="display-4 fw-black mb-3" style={{ color: "var(--primary)", opacity: 0.3 }}>{step.num}</div>
                  <h5 className="fw-bold mb-2" style={{ color: "var(--text)" }}>{step.title}</h5>
                  <p className="text-muted small">{step.text}</p>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 9. PLATFORM ROLES ─────────────────────────────── */}
      <section className="py-6 py-md-7">
        <div className="container">
          <div className="text-center mb-6 max-w-2xl mx-auto">
            <h2 className="fw-black mb-3" style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)", color: "var(--text)" }}>Dedicated Portals for Every Role</h2>
          </div>
          
          <div className="row g-4">
            {[
              { role: "STUDENT", desc: "Discover • Prepare • Apply • Grow", icon: <GraduationCap size={32}/>, link: "/student/dashboard", color: "primary" },
              { role: "ALUMNI", desc: "Guide • Connect • Share • Support", icon: <Users size={32}/>, link: "/alumni/dashboard", color: "success" },
              { role: "PLACEMENT", desc: "Manage • Assess • Match • Place", icon: <Briefcase size={32}/>, link: "/placement/dashboard", color: "warning" },
              { role: "ADMIN", desc: "Control • Monitor • Analyze • Improve", icon: <Shield size={32}/>, link: "/admin/dashboard", color: "danger" }
            ].map((r, i) => (
              <div className="col-lg-3 col-md-6" key={i}>
                <Link to={r.link} className="text-decoration-none">
                  <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeIn} className="bento-card p-4 text-center h-100 hover-scale shadow-sm">
                    <div className={`text-${r.color} mb-3`}>{r.icon}</div>
                    <h5 className="fw-black mb-2" style={{ color: "var(--text)", letterSpacing: "0.05em" }}>{r.role}</h5>
                    <p className="text-muted small fw-medium mb-0">{r.desc}</p>
                  </motion.div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 10. ABOUT & FAQ ─────────────────────────────── */}
      <section id="faq" className="py-6 py-md-7">
        <div className="container">
          <div className="row g-5">
            <div className="col-lg-5">
              <h2 className="fw-black mb-4" id="about" style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)", color: "var(--text)" }}>About Nexora Campus</h2>
              <p className="fs-5 text-muted lh-lg mb-4">
                Nexora Campus brings student development, career preparation, alumni engagement and placement management into one connected digital ecosystem. We bridge the gap between academic learning and industry expectations.
              </p>
              <Link to="/about" className="btn btn-outline-primary rounded-pill fw-bold">Read the Full Story</Link>
            </div>
            
            <div className="col-lg-7">
              <h3 className="fw-bold mb-4" style={{ color: "var(--text)" }}>Frequently Asked Questions</h3>
              <div className="d-flex flex-column gap-3">
                {faqs.map((faq, i) => (
                  <div key={i} className="bento-card overflow-hidden shadow-sm">
                    <button 
                      className="w-100 p-4 text-start border-0 bg-transparent d-flex justify-content-between align-items-center"
                      onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                      style={{ color: "var(--text)", cursor: "pointer" }}
                    >
                      <span className="fw-bold">{faq.q}</span>
                      <ChevronDown size={20} style={{ transform: openFaq === i ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
                    </button>
                    <AnimatePresence>
                      {openFaq === i && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="px-4 pb-4 text-muted fw-medium border-top"
                          style={{ borderColor: "var(--border) !important", lineHeight: "1.6", overflow: "hidden" }}
                        >
                          <div className="pt-3">{faq.a}</div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 11. CTA SECTION ─────────────────────────────── */}
      <section className="py-6 py-md-7 text-center position-relative overflow-hidden" style={{ background: "var(--surface)" }}>
        <div className="position-absolute top-50 start-50 translate-middle w-100 h-100" style={{ background: "radial-gradient(ellipse at center, rgba(var(--primary-rgb), 0.1) 0%, transparent 60%)", zIndex: 0, pointerEvents: "none" }}></div>
        <div className="container position-relative z-1">
          <div style={{ opacity: 1, transform: "none" }}>
            <h2 className="fw-black mb-4" style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", color: "var(--text)", letterSpacing: "-0.03em" }}>Your Career Journey<br/>Shouldn't Be Fragmented.</h2>
            <p className="fs-5 text-muted mb-5 max-w-2xl mx-auto">
              Bring skills, preparation, opportunities, alumni guidance and placement into one intelligent ecosystem.
            </p>
            <div className="d-flex flex-wrap justify-content-center gap-3">
              <Link to="/login" className="btn btn-primary btn-lg fw-bold rounded-pill px-5 d-flex align-items-center gap-2 hover-scale">
                Get Started <Rocket size={20} />
              </Link>
              <a href="#features" className="btn btn-outline-secondary btn-lg fw-bold rounded-pill px-5 hover-scale" style={{ color: "var(--text)", borderColor: "var(--border)" }}>
                Explore Platform
              </a>
            </div>
          </div>
        </div>
      </section>
      
    </div>
  );
}
