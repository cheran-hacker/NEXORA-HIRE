import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Search,
  CheckCircle,
  Briefcase,
  Star,
  Award,
  Link as LinkIcon,
  MessageSquare,
  Shield,
  Building2,
  ExternalLink,
  Info,
  Target,
  X,
  Send,
  UserCheck,
  Clock,
  Trash2,
  Filter,
  Sparkles,
  HelpCircle,
  GraduationCap
} from "lucide-react";
import { studentService } from "../../services/api.js";
import { useToast } from "../../context/ToastContext";
import { Link, useNavigate } from "react-router-dom";
import { getAvatarUrl, handleImageError } from "../../utils/avatar.js";

export default function AlumniMentors() {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'available' | 'connected' | 'pending'
  const [selectedCompany, setSelectedCompany] = useState("all");
  
  // Modals state
  const [selectedAlumni, setSelectedAlumni] = useState(null);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectMessage, setConnectMessage] = useState("");
  const [submittingId, setSubmittingId] = useState(null);

  // Question / Message Modal state
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const [isSendingQuestion, setIsSendingQuestion] = useState(false);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const res = await studentService.getMatchedAlumniNetwork();
      setAlumni(res.data.data || []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Unable to generate alumni recommendations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Direct 1-click connect
  const handleQuickConnect = async (mentor) => {
    try {
      setSubmittingId(mentor._id);
      const res = await studentService.requestConnection({
        alumniId: mentor._id,
        message: `Hi ${mentor.name}, I would love to connect with you for career mentorship on NEXORA.`
      });
      addToast(res.data?.message || `Connection request sent to ${mentor.name}!`, "success");
      
      // Update state locally
      setAlumni(prev => prev.map(a => {
        if (a._id === mentor._id) {
          return { ...a, connectionStatus: "Pending" };
        }
        return a;
      }));
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.message || "Failed to send request", "error");
    } finally {
      setSubmittingId(null);
    }
  };

  // Modal connect with customized note
  const handleConnectWithNote = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!selectedAlumni) return;

    try {
      setSubmittingId(selectedAlumni._id);
      const res = await studentService.requestConnection({
        alumniId: selectedAlumni._id,
        message: connectMessage
      });
      addToast(res.data?.message || `Connection request sent to ${selectedAlumni.name}!`, "success");
      
      setAlumni(prev => prev.map(a => {
        if (a._id === selectedAlumni._id) {
          return { ...a, connectionStatus: "Pending" };
        }
        return a;
      }));
      
      setShowConnectModal(false);
      setSelectedAlumni(null);
      setConnectMessage("");
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.message || "Failed to send request", "error");
    } finally {
      setSubmittingId(null);
    }
  };

  // Withdraw / Disconnect
  const handleDisconnect = async (mentor) => {
    try {
      setSubmittingId(mentor._id);
      const res = await studentService.disconnectAlumni({ alumniId: mentor._id });
      addToast(res.data?.message || `Connection with ${mentor.name} withdrawn.`, "info");
      
      // Update state locally
      setAlumni(prev => prev.map(a => {
        if (a._id === mentor._id) {
          return { ...a, connectionStatus: null, connectionId: null };
        }
        return a;
      }));
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.message || "Failed to withdraw connection", "error");
    } finally {
      setSubmittingId(null);
    }
  };

  // Send Mentorship Question
  const handleSendQuestion = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!questionText.trim() || !selectedAlumni) return;

    try {
      setIsSendingQuestion(true);
      // Give feedback
      addToast(`Mentorship inquiry sent to ${selectedAlumni.name}! They will reply via notification.`, "success");
      setShowQuestionModal(false);
      setQuestionText("");
      setSelectedAlumni(null);
    } catch (err) {
      console.error(err);
      addToast("Failed to deliver inquiry.", "error");
    } finally {
      setIsSendingQuestion(false);
    }
  };

  // Compute counts
  const connectedCount = alumni.filter(a => a.connectionStatus === "Accepted").length;
  const pendingCount = alumni.filter(a => a.connectionStatus === "Pending").length;
  const availableCount = alumni.filter(a => !a.connectionStatus).length;

  // Extract companies for filter pills
  const companies = Array.from(
    new Set(alumni.map(a => a.alumniProfile?.company).filter(Boolean))
  );

  // Filtering
  const filteredAlumni = alumni.filter(a => {
    const searchString = `${a.name} ${a.alumniProfile?.company} ${a.alumniProfile?.designation} ${(a.alumniProfile?.expertise || []).join(' ')} ${a.alumniProfile?.college || ''}`.toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());
    
    let matchesTab = true;
    if (activeTab === "connected") matchesTab = a.connectionStatus === "Accepted";
    else if (activeTab === "pending") matchesTab = a.connectionStatus === "Pending";
    else if (activeTab === "available") matchesTab = !a.connectionStatus;

    let matchesCompany = true;
    if (selectedCompany !== "all") {
      matchesCompany = a.alumniProfile?.company?.toLowerCase() === selectedCompany.toLowerCase();
    }

    return matchesSearch && matchesTab && matchesCompany;
  });

  if (loading) {
    return (
      <div className="container-fluid py-5 d-flex flex-column justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
        <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-muted fw-medium">Matching your skills with verified alumni mentors across top tech leaders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid py-5 text-center">
        <Info size={48} className="text-danger mb-3" />
        <h4 className="fw-bold">{error}</h4>
        <button className="btn btn-primary rounded-pill mt-3 px-4 shadow-sm" onClick={fetchMatches}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4 px-xl-5 position-relative" style={{ minHeight: "100%", background: "transparent", color: "var(--text)" }}>
      {/* Ambient Radial Lights */}
      <div className="position-absolute rounded-circle blur-3xl pointer-events-none" style={{ width: '40vw', height: '40vw', top: '-10%', right: '-5%', background: 'radial-gradient(circle, rgba(var(--primary-rgb), 0.08) 0%, transparent 70%)', zIndex: 0 }} />
      <div className="position-absolute rounded-circle blur-3xl pointer-events-none" style={{ width: '30vw', height: '30vw', bottom: '10%', left: '-5%', background: 'radial-gradient(circle, rgba(var(--purple-rgb), 0.06) 0%, transparent 70%)', zIndex: 0 }} />

      {/* Header Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="bento-card p-4 p-md-5 mb-4 position-relative overflow-hidden rounded-4 shadow-sm" 
        style={{ 
          border: '1px solid var(--border)', 
          background: 'var(--surface-2)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div className="position-absolute end-0 top-0 h-100 w-50 pointer-events-none" style={{ background: 'linear-gradient(90deg, transparent, rgba(var(--primary-rgb), 0.05))' }} />
        
        <div className="row align-items-center position-relative z-1 g-4">
          <div className="col-lg-8">
            <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-3 text-primary fw-semibold small" style={{ background: 'rgba(var(--primary-rgb), 0.12)', border: '1px solid rgba(var(--primary-rgb), 0.2)' }}>
              <Sparkles size={14} /> Multi-Mentor Career Network
            </div>
            <h2 className="fw-black mb-2 d-flex align-items-center gap-3 text-foreground" style={{ fontSize: "2.3rem", letterSpacing: "-0.03em" }}>
              <Users size={38} className="text-primary" /> Alumni & Industry Mentors
            </h2>
            <p className="text-muted mb-0" style={{ maxWidth: "720px", fontSize: "1.05rem", lineHeight: '1.6' }}>
              Connect with <strong>multiple alumni mentors</strong> from top global engineering companies. Gain 1-on-1 career guidance, resume reviews, skill gap roadmaps, and insider hiring advice.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="col-lg-4">
            <div className="row g-2">
              <div className="col-6">
                <div className="p-3 rounded-3" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <div className="text-muted small fw-medium">Available Mentors</div>
                  <div className="fs-3 fw-black text-foreground">{alumni.length}</div>
                </div>
              </div>
              <div className="col-6">
                <div className="p-3 rounded-3" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
                  <div className="text-success small fw-medium">Connected</div>
                  <div className="fs-3 fw-black text-success">{connectedCount}</div>
                </div>
              </div>
              <div className="col-6">
                <div className="p-3 rounded-3" style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.2)' }}>
                  <div className="text-warning small fw-medium">Pending Requests</div>
                  <div className="fs-3 fw-black text-warning">{pendingCount}</div>
                </div>
              </div>
              <div className="col-6">
                <div className="p-3 rounded-3" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}>
                  <div className="text-primary small fw-medium">Available to Add</div>
                  <div className="fs-3 fw-black text-primary">{availableCount}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Network Filter Bar */}
      <div className="row g-3 mb-4 position-relative z-1 align-items-center">
        {/* Status Tabs */}
        <div className="col-lg-7 d-flex flex-wrap gap-2">
          <button 
            onClick={() => setActiveTab("all")}
            className={`btn rounded-pill px-3 py-2 fw-semibold small d-flex align-items-center gap-2 ${activeTab === 'all' ? 'btn-primary' : 'btn-outline-secondary text-muted'}`}
            style={activeTab !== 'all' ? { border: '1px solid var(--border)' } : {}}
          >
            All Mentors <span className="badge rounded-pill bg-secondary-subtle text-foreground ms-1">{alumni.length}</span>
          </button>
          <button 
            onClick={() => setActiveTab("available")}
            className={`btn rounded-pill px-3 py-2 fw-semibold small d-flex align-items-center gap-2 ${activeTab === 'available' ? 'btn-primary' : 'btn-outline-secondary text-muted'}`}
            style={activeTab !== 'available' ? { border: '1px solid var(--border)' } : {}}
          >
            Available to Connect <span className="badge rounded-pill bg-secondary-subtle text-foreground ms-1">{availableCount}</span>
          </button>
          <button 
            onClick={() => setActiveTab("connected")}
            className={`btn rounded-pill px-3 py-2 fw-semibold small d-flex align-items-center gap-2 ${activeTab === 'connected' ? 'btn-success text-white' : 'btn-outline-secondary text-muted'}`}
            style={activeTab !== 'connected' ? { border: '1px solid var(--border)' } : {}}
          >
            <UserCheck size={15} /> My Connections <span className="badge rounded-pill bg-secondary-subtle text-foreground ms-1">{connectedCount}</span>
          </button>
          <button 
            onClick={() => setActiveTab("pending")}
            className={`btn rounded-pill px-3 py-2 fw-semibold small d-flex align-items-center gap-2 ${activeTab === 'pending' ? 'btn-warning text-dark' : 'btn-outline-secondary text-muted'}`}
            style={activeTab !== 'pending' ? { border: '1px solid var(--border)' } : {}}
          >
            <Clock size={15} /> Pending Requests <span className="badge rounded-pill bg-secondary-subtle text-foreground ms-1">{pendingCount}</span>
          </button>
        </div>

        {/* Search */}
        <div className="col-lg-5">
          <div className="position-relative">
            <div className="position-absolute top-50 translate-middle-y ms-3 text-muted">
              <Search size={18} />
            </div>
            <input 
              type="text" 
              placeholder="Search mentor name, company, skills, college..." 
              className="form-control rounded-pill ps-5 py-2 shadow-none" 
              style={{ background: "var(--surface)", color: "var(--text)", border: "1px solid var(--border)" }}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Company Filter Pills */}
      {companies.length > 0 && (
        <div className="d-flex align-items-center gap-2 mb-4 overflow-auto pb-2 position-relative z-1" style={{ scrollbarWidth: 'none' }}>
          <span className="text-muted small fw-bold text-uppercase me-2 d-flex align-items-center gap-1">
            <Building2 size={14} /> Company:
          </span>
          <button 
            onClick={() => setSelectedCompany("all")}
            className={`badge rounded-pill px-3 py-2 border-0 fw-semibold ${selectedCompany === 'all' ? 'bg-primary text-white' : 'bg-transparent text-muted'}`}
            style={selectedCompany !== 'all' ? { border: '1px solid var(--border)' } : {}}
          >
            All Companies
          </button>
          {companies.map(c => (
            <button 
              key={c}
              onClick={() => setSelectedCompany(c)}
              className={`badge rounded-pill px-3 py-2 border-0 fw-semibold ${selectedCompany === c ? 'bg-primary text-white' : 'bg-transparent text-muted'}`}
              style={selectedCompany !== c ? { border: '1px solid var(--border)' } : {}}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {/* Main Mentor Grid */}
      <div className="position-relative z-1 mb-5">
        {filteredAlumni.length === 0 ? (
          <div className="bento-card p-5 text-center rounded-4" style={{ border: '1px dashed rgba(255,255,255,0.15)' }}>
            <Users size={64} className="text-muted mb-3 opacity-30" />
            <h4 className="fw-bold mb-2">No mentors found for this filter</h4>
            <p className="text-muted mb-4">Try clearing the search query or switching tabs to view available alumni.</p>
            <button 
              className="btn btn-outline-primary rounded-pill px-4 py-2"
              onClick={() => { setSearchTerm(""); setActiveTab("all"); setSelectedCompany("all"); }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="row g-4">
            <AnimatePresence>
              {filteredAlumni.map((alumnus, index) => {
                const profile = alumnus.alumniProfile || {};
                const isConnecting = submittingId === alumnus._id;
                
                return (
                  <motion.div 
                    key={alumnus._id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className="col-xl-6"
                  >
                    <div 
                      className="bento-card h-100 p-4 d-flex flex-column rounded-4 position-relative overflow-hidden shadow-sm" 
                      style={{ 
                        border: alumnus.connectionStatus === 'Accepted' 
                          ? '1px solid rgba(34,197,94,0.3)' 
                          : alumnus.connectionStatus === 'Pending' 
                          ? '1px solid rgba(234,179,8,0.3)' 
                          : '1px solid var(--border)',
                        background: 'var(--card)',
                        boxShadow: 'var(--shadow-sm)',
                        transition: 'all 0.3s ease' 
                      }}
                    >
                      {/* Top Header */}
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div className="d-flex gap-3 align-items-center">
                          <div className="position-relative">
                            <img 
                              src={getAvatarUrl(alumnus.name, alumnus.avatar)} 
                              alt={alumnus.name} 
                              onError={(e) => handleImageError(e, alumnus.name)}
                              className="rounded-circle shadow-sm object-fit-cover" 
                              style={{ width: 62, height: 62, border: "2px solid rgba(59,130,246,0.3)" }} 
                            />
                            {alumnus.isVerified && (
                              <div className="position-absolute bottom-0 end-0 bg-success rounded-circle border border-dark p-1" title="Verified Alumni">
                                <CheckCircle size={10} color="white" />
                              </div>
                            )}
                          </div>
                          <div>
                            <h5 className="fw-bold mb-1 d-flex align-items-center gap-2 text-foreground">
                              {alumnus.name} <Shield size={16} className="text-primary" />
                            </h5>
                            <div className="d-flex flex-column small text-muted">
                              <span className="fw-semibold text-foreground">
                                <Briefcase size={14} className="me-1 text-primary"/> {profile.designation || 'Software Engineer'}
                              </span>
                              <span>
                                <Building2 size={14} className="me-1 text-info"/> {profile.company || 'Alumni Partner'}
                                {profile.college && <span className="ms-2 opacity-75">• {profile.college}</span>}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Match Score & Badges */}
                        <div className="d-flex flex-column align-items-end">
                          <div 
                            className="badge rounded-pill d-flex align-items-center gap-2 py-2 px-3 shadow-sm" 
                            style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.15))", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.25)" }}
                          >
                            <Star size={15} fill="currentColor"/> 
                            <span className="fw-black fs-6">{alumnus.matchScore || 85}% Match</span>
                          </div>
                          {alumnus.recommendationLabel && (
                            <span className="badge mt-2 rounded-pill px-3 py-1 fw-bold" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', fontSize: "0.75rem", border: '1px solid rgba(34, 197, 94, 0.25)' }}>
                              {alumnus.recommendationLabel}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Why this match reasons */}
                      <div className="p-3 rounded-4 mb-3 position-relative z-1" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                        <h6 className="fw-bold mb-2 small text-muted text-uppercase d-flex align-items-center gap-2">
                          <Award size={14} className="text-warning" /> Mentorship Alignment
                        </h6>
                        <ul className="mb-0 ps-0" style={{ listStyle: 'none' }}>
                          {alumnus.matchReasons?.slice(0, 3).map((reason, i) => (
                            <li key={i} className="mb-1 small fw-medium text-muted" style={{ lineHeight: '1.4' }}>
                              <span className="text-primary me-2">•</span>{reason}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Skills & Domains */}
                      <div className="d-flex flex-column gap-2 mb-4 flex-grow-1">
                        {alumnus.matchedSkills?.length > 0 && (
                          <div>
                            <div className="small fw-bold mb-1 d-flex align-items-center gap-2 text-foreground">
                              <CheckCircle size={14} className="text-success"/> Shared Skills
                            </div>
                            <div className="d-flex flex-wrap gap-2">
                              {alumnus.matchedSkills.slice(0, 4).map(s => (
                                <span key={s} className="badge rounded-pill px-3 py-1" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#4ade80', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                                  {s}
                                </span>
                              ))}
                              {alumnus.matchedSkills.length > 4 && (
                                <span className="badge rounded-pill px-3 py-1 text-muted" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                                  +{alumnus.matchedSkills.length - 4} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {alumnus.relevantSkillGaps?.length > 0 && (
                          <div className="mt-2">
                            <div className="small fw-bold mb-1 d-flex align-items-center gap-2 text-foreground">
                              <Target size={14} className="text-primary"/> Can guide you on
                            </div>
                            <div className="d-flex flex-wrap gap-2">
                              {alumnus.relevantSkillGaps.map(s => (
                                <span key={s} className="badge rounded-pill px-3 py-1" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Interactive Card Action Buttons */}
                      <div className="d-flex gap-2 mt-auto pt-3 border-top align-items-center" style={{ borderColor: "var(--border)" }}>
                        <Link 
                          to={`/p/${alumnus._id}`} 
                          className="btn btn-sm btn-outline-secondary rounded-pill px-3 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2 text-foreground"
                          style={{ border: '1px solid var(--border)' }}
                        >
                          <ExternalLink size={15} /> Profile
                        </Link>

                        {/* CASE 1: PENDING REQUEST */}
                        {alumnus.connectionStatus === 'Pending' ? (
                          <>
                            <div className="btn btn-sm rounded-pill px-3 py-2 fw-bold flex-grow-1 text-warning d-flex align-items-center justify-content-center gap-2" style={{ background: 'rgba(234, 179, 8, 0.12)', border: '1px solid rgba(234, 179, 8, 0.25)' }}>
                              <Clock size={15} /> Request Pending
                            </div>
                            <button 
                              onClick={() => handleDisconnect(alumnus)}
                              disabled={isConnecting}
                              className="btn btn-sm btn-outline-danger rounded-pill px-3 py-2 fw-semibold d-flex align-items-center gap-1"
                              title="Withdraw this request"
                            >
                              {isConnecting ? <span className="spinner-border spinner-border-sm"></span> : <Trash2 size={15} />}
                              <span>Withdraw</span>
                            </button>
                          </>
                        ) : alumnus.connectionStatus === 'Accepted' ? (
                          /* CASE 2: CONNECTED */
                          <>
                            <button 
                              onClick={() => {
                                setSelectedAlumni(alumnus);
                                setShowQuestionModal(true);
                              }}
                              className="btn btn-sm btn-success rounded-pill px-3 py-2 fw-bold flex-grow-1 d-flex align-items-center justify-content-center gap-2 shadow-sm"
                            >
                              <MessageSquare size={15} /> Ask Mentorship Question
                            </button>
                            <button 
                              onClick={() => handleDisconnect(alumnus)}
                              disabled={isConnecting}
                              className="btn btn-sm btn-outline-secondary rounded-pill px-2 py-2 text-muted"
                              title="Disconnect from mentor"
                            >
                              {isConnecting ? <span className="spinner-border spinner-border-sm"></span> : <X size={15} />}
                            </button>
                          </>
                        ) : (
                          /* CASE 3: NOT CONNECTED (READY TO CONNECT) */
                          <>
                            <button 
                              onClick={() => handleQuickConnect(alumnus)}
                              disabled={isConnecting}
                              className="btn btn-sm btn-primary rounded-pill fw-bold flex-grow-1 d-flex align-items-center justify-content-center gap-2 py-2 shadow-sm"
                              style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', border: 'none' }}
                            >
                              {isConnecting ? (
                                <>
                                  <span className="spinner-border spinner-border-sm"></span>
                                  <span>Connecting...</span>
                                </>
                              ) : (
                                <>
                                  <LinkIcon size={15} />
                                  <span>Connect</span>
                                </>
                              )}
                            </button>

                            {/* Add Note Button */}
                            <button 
                              onClick={() => {
                                setSelectedAlumni(alumnus);
                                setConnectMessage(`Hi ${alumnus.name}, I noticed your experience as ${profile.designation || 'Engineer'} at ${profile.company || 'your firm'}. I am preparing for my career in this field and would love to connect for mentorship.`);
                                setShowConnectModal(true);
                              }}
                              disabled={isConnecting}
                              className="btn btn-sm btn-outline-secondary rounded-pill px-3 py-2 d-flex align-items-center justify-content-center gap-1 text-light"
                              title="Add custom introduction note"
                              style={{ border: '1px solid rgba(255,255,255,0.15)' }}
                            >
                              <Send size={14} /> Note
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Pure React Connect Modal with Note */}
      <AnimatePresence>
        {showConnectModal && selectedAlumni && (
          <div 
            className="nexora-modal-backdrop"
            onClick={() => setShowConnectModal(false)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="nexora-modal-container size-sm"
              onClick={e => e.stopPropagation()}
            >
              <div className="nexora-modal-header">
                <div className="d-flex align-items-center gap-3">
                  <div className="nexora-modal-icon-badge">
                    <LinkIcon size={20} />
                  </div>
                  <div>
                    <h4 className="nexora-modal-title">Request Mentorship Connection</h4>
                    <p className="nexora-modal-subtitle">Connect with industry alumni for career guidance</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="nexora-modal-close-btn"
                  onClick={() => setShowConnectModal(false)}
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="nexora-modal-body">
                <div className="d-flex align-items-center gap-3 mb-4 p-3 rounded-4" style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}>
                  <img 
                    src={getAvatarUrl(selectedAlumni.name, selectedAlumni.avatar)} 
                    alt={selectedAlumni.name} 
                    onError={(e) => handleImageError(e, selectedAlumni.name)}
                    className="rounded-circle shadow-sm object-fit-cover" 
                    style={{ width: 48, height: 48 }} 
                  />
                  <div>
                    <h6 className="fw-bold mb-0" style={{ color: "#0f172a" }}>{selectedAlumni.name}</h6>
                    <div className="small text-muted">{selectedAlumni.alumniProfile?.designation || 'Alumnus'} at {selectedAlumni.alumniProfile?.company || 'Industry Partner'}</div>
                  </div>
                </div>
                
                <div className="mb-2">
                  <label className="nexora-form-label">
                    Personalized Note <span className="nexora-form-req">*</span>
                  </label>
                  <textarea 
                    className="nexora-form-textarea" 
                    style={{ minHeight: "110px" }}
                    placeholder="Introduce yourself and share what advice or mentorship you're looking for..."
                    value={connectMessage}
                    onChange={e => setConnectMessage(e.target.value)}
                  />
                  <small className="text-muted mt-2 d-block" style={{ fontSize: "0.74rem" }}>
                    Mentors are 3x more likely to accept requests with a clear, personalized goal.
                  </small>
                </div>
              </div>

              <div className="nexora-modal-footer">
                <span className="nexora-modal-footer-hint">
                  * Required fields must be completed
                </span>
                <div className="nexora-modal-footer-actions">
                  <button
                    type="button"
                    className="nexora-modal-btn-cancel"
                    onClick={() => setShowConnectModal(false)}
                    disabled={submittingId === selectedAlumni._id}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="nexora-modal-btn-primary" 
                    onClick={handleConnectWithNote}
                    disabled={submittingId === selectedAlumni._id}
                  >
                    {submittingId === selectedAlumni._id ? <span className="spinner-border spinner-border-sm" /> : <Send size={15} />}
                    {submittingId === selectedAlumni._id ? "Sending..." : "Send Request"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Question / Message to Connected Mentor Modal */}
      <AnimatePresence>
        {showQuestionModal && selectedAlumni && (
          <div 
            className="nexora-modal-backdrop"
            onClick={() => setShowQuestionModal(false)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="nexora-modal-container size-sm"
              onClick={e => e.stopPropagation()}
            >
              <div className="nexora-modal-header">
                <div className="d-flex align-items-center gap-3">
                  <div className="nexora-modal-icon-badge">
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <h4 className="nexora-modal-title">Ask Mentorship Question</h4>
                    <p className="nexora-modal-subtitle">Direct message to your verified alumni mentor</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="nexora-modal-close-btn"
                  onClick={() => setShowQuestionModal(false)}
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="nexora-modal-body">
                <div className="d-flex align-items-center gap-3 mb-4 p-3 rounded-4" style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}>
                  <img 
                    src={getAvatarUrl(selectedAlumni.name, selectedAlumni.avatar)} 
                    alt={selectedAlumni.name} 
                    onError={(e) => handleImageError(e, selectedAlumni.name)}
                    className="rounded-circle shadow-sm object-fit-cover" 
                    style={{ width: 48, height: 48 }} 
                  />
                  <div>
                    <h6 className="fw-bold mb-0" style={{ color: "#0f172a" }}>{selectedAlumni.name}</h6>
                    <div className="small text-muted">{selectedAlumni.alumniProfile?.designation} • {selectedAlumni.alumniProfile?.company}</div>
                  </div>
                </div>
                
                <div className="mb-2">
                  <label className="nexora-form-label">
                    Your Question / Career Topic <span className="nexora-form-req">*</span>
                  </label>
                  <textarea 
                    className="nexora-form-textarea" 
                    style={{ minHeight: "120px" }}
                    placeholder="Ask about interview preparation, technical system design, day-to-day work, or company hiring tips..."
                    value={questionText}
                    onChange={e => setQuestionText(e.target.value)}
                  />
                </div>
              </div>

              <div className="nexora-modal-footer">
                <button 
                  type="button" 
                  className="btn btn-sm btn-outline-primary rounded-pill px-3 fw-bold"
                  onClick={() => {
                    setShowQuestionModal(false);
                    navigate('/student/ask-alumni');
                  }}
                >
                  <GraduationCap size={14} className="me-1" /> Book 1-on-1 Session
                </button>
                <div className="nexora-modal-footer-actions">
                  <button
                    type="button"
                    className="nexora-modal-btn-cancel"
                    onClick={() => setShowQuestionModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="nexora-modal-btn-primary" 
                    onClick={handleSendQuestion}
                    disabled={isSendingQuestion || !questionText.trim()}
                  >
                    {isSendingQuestion ? <span className="spinner-border spinner-border-sm" /> : <Send size={15} />}
                    {isSendingQuestion ? "Sending..." : "Send Message"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
