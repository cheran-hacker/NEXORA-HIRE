import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Shield, User, Bell, Monitor, Lock, Link, Save, CheckCircle2, ChevronRight,
  Moon, Sun, Smartphone, FileText, Upload, X, Plus, Trash2, Sparkles,
  AlertCircle, CheckCircle, GraduationCap, Award, ExternalLink, RotateCcw,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import { authService, studentService } from "../../services/api.js";

const ResumeReviewModal = ({ analysis, onClose, onApply, applying }) => {
  const [profile, setProfile] = useState({
    name: analysis.profile?.name || "",
    phone: analysis.profile?.phone || "",
    location: analysis.profile?.location || "",
    bio: analysis.profile?.bio || "",
    college: analysis.profile?.college || "",
    branch: analysis.profile?.branch || "",
    batchYear: analysis.profile?.batchYear || "",
    cgpa: analysis.profile?.cgpa || "",
    githubUrl: analysis.profile?.githubUrl || "",
    linkedinUrl: analysis.profile?.linkedinUrl || "",
    websiteUrl: analysis.profile?.websiteUrl || "",
  });
  const [skills, setSkills] = useState(analysis.extractedSkills || []);
  const [newSkill, setNewSkill] = useState("");
  const [projects, setProjects] = useState(analysis.projects || []);
  const [certificates, setCertificates] = useState(analysis.certificates || []);
  const existingSkillsSet = new Set((analysis.existingSkills || []).map(s => s.toLowerCase()));
  const newSkills = skills.filter(s => !existingSkillsSet.has(s.toLowerCase()));
  const scoreColor = analysis.atsScore >= 80 ? "success" : analysis.atsScore >= 60 ? "warning" : "danger";

  return (
    <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.75)", zIndex: 9999, backdropFilter: "blur(8px)" }}>
      <div className="modal-dialog modal-xl modal-dialog-scrollable" style={{ maxWidth: "900px" }}>
        <div className="modal-content border-0 rounded-4 shadow-lg" style={{ background: "var(--surface)", color: "var(--text)" }}>
          <div className="modal-header border-0 px-5 pt-5 pb-3">
            <div className="d-flex align-items-center gap-3">
              <div className="p-2 rounded-3" style={{ background: "linear-gradient(135deg,var(--primary),var(--purple))", color: "#fff" }}>
                <Sparkles size={24} />
              </div>
              <div>
                <h4 className="fw-black mb-0">Resume Profile Review</h4>
                <p className="text-muted small mb-0">AI extracted from <strong>{analysis.fileName}</strong>. Review, edit, then confirm.</p>
              </div>
            </div>
            <button onClick={onClose} className="btn-close btn-close-white ms-auto" />
          </div>
          <div className="modal-body px-5 pb-2">
            <div className={`alert alert-${scoreColor} d-flex align-items-center gap-3 rounded-3 border-0 mb-4`}>
              <div className={`fw-black fs-2 text-${scoreColor}`}>{analysis.atsScore}/100</div>
              <div>
                <div className="fw-bold">ATS Score — {analysis.experienceLevel} Level</div>
                <div className="text-muted small">{analysis.summary}</div>
                {analysis.fallback && <span className="badge bg-warning-subtle text-warning border border-warning-subtle mt-1">Pattern matching fallback (AI temporarily unavailable)</span>}
              </div>
            </div>
            <div className="row g-4">
              <div className="col-md-6">
                <h6 className="fw-bold text-muted text-uppercase mb-3 d-flex align-items-center gap-2"><User size={16} className="text-primary" /> Personal</h6>
                {[["name","Full Name"],["phone","Phone"],["location","Location"]].map(([key,label]) => (
                  <div key={key} className="mb-3">
                    <label className="form-label small fw-semibold text-muted mb-1">{label}</label>
                    <input className="form-control bg-transparent text-body border rounded-3" style={{ borderColor:"var(--border)" }}
                      value={profile[key]||""} placeholder="Not found in resume"
                      onChange={e => setProfile(p=>({...p,[key]:e.target.value}))} />
                  </div>
                ))}
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-muted mb-1">Professional Bio / Summary</label>
                  <textarea className="form-control bg-transparent text-body border rounded-3" style={{ borderColor:"var(--border)",resize:"vertical",minHeight:"80px" }}
                    value={profile.bio||""} placeholder="Not found in resume"
                    onChange={e => setProfile(p=>({...p,bio:e.target.value}))} />
                </div>
                <h6 className="fw-bold text-muted text-uppercase mb-3 d-flex align-items-center gap-2 mt-4"><GraduationCap size={16} className="text-info" /> Education</h6>
                {[["college","College / Institution"],["branch","Department / Branch"]].map(([key,label]) => (
                  <div key={key} className="mb-3">
                    <label className="form-label small fw-semibold text-muted mb-1">{label}</label>
                    <input className="form-control bg-transparent text-body border rounded-3" style={{ borderColor:"var(--border)" }}
                      value={profile[key]||""} placeholder="Not found in resume"
                      onChange={e => setProfile(p=>({...p,[key]:e.target.value}))} />
                  </div>
                ))}
                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <label className="form-label small fw-semibold text-muted mb-1">Batch Year</label>
                    <input type="number" className="form-control bg-transparent text-body border rounded-3" style={{ borderColor:"var(--border)" }}
                      value={profile.batchYear||""} placeholder="e.g. 2027"
                      onChange={e => setProfile(p=>({...p,batchYear:e.target.value}))} />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-semibold text-muted mb-1">CGPA</label>
                    <input type="number" step="0.01" className="form-control bg-transparent text-body border rounded-3" style={{ borderColor:"var(--border)" }}
                      value={profile.cgpa||""} placeholder="e.g. 8.5"
                      onChange={e => setProfile(p=>({...p,cgpa:e.target.value}))} />
                  </div>
                </div>
                <h6 className="fw-bold text-muted text-uppercase mb-3 d-flex align-items-center gap-2 mt-4"><ExternalLink size={16} className="text-success" /> Links</h6>
                {[["githubUrl","GitHub URL"],["linkedinUrl","LinkedIn URL"],["websiteUrl","Portfolio URL"]].map(([key,label]) => (
                  <div key={key} className="mb-3">
                    <label className="form-label small fw-semibold text-muted mb-1">{label}</label>
                    <input className="form-control bg-transparent text-body border rounded-3" style={{ borderColor:"var(--border)" }}
                      value={profile[key]||""} placeholder="Not found in resume"
                      onChange={e => setProfile(p=>({...p,[key]:e.target.value}))} />
                  </div>
                ))}
              </div>
              <div className="col-md-6">
                <h6 className="fw-bold text-muted text-uppercase mb-3 d-flex align-items-center gap-2">
                  <BadgeCheck size={16} className="text-primary" /> Skills ({skills.length} extracted, {newSkills.length} new)
                </h6>
                {analysis.existingSkills?.length > 0 && (
                  <div className="mb-2">
                    <small className="text-muted fw-semibold">Already in your profile:</small>
                    <div className="d-flex flex-wrap gap-1 mt-1">
                      {analysis.existingSkills.map((s,i)=>(
                        <span key={i} className="badge bg-secondary-subtle text-secondary border px-2 py-1" style={{fontSize:"0.72rem"}}>{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="mb-2">
                  <small className="text-success fw-semibold">New from resume:</small>
                  <div className="d-flex flex-wrap gap-1 mt-1">
                    {skills.map((s,i)=>(
                      <span key={i} className={`badge px-3 py-2 d-inline-flex align-items-center gap-2 ${existingSkillsSet.has(s.toLowerCase())?"bg-secondary-subtle text-secondary border":"bg-success-subtle text-success border border-success-subtle"}`} style={{fontSize:"0.85rem"}}>
                        {s} 
                        <button 
                          onClick={()=>setSkills(prev=>prev.filter((_,idx)=>idx!==i))}
                          aria-label={`Remove ${s}`}
                          title="Remove skill"
                          className="btn p-0 d-flex align-items-center justify-content-center text-muted hover-scale"
                          style={{
                            width: "18px",
                            height: "18px",
                            border: "none",
                            background: "transparent",
                            borderRadius: "50%",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = "var(--danger)";
                            e.currentTarget.style.background = "var(--danger-subtle)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = "var(--text-muted)";
                            e.currentTarget.style.background = "transparent";
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.outline = "2px solid var(--primary)";
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.outline = "none";
                          }}
                        >
                          <X size={14} strokeWidth={2.5} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
                <div className="input-group mt-2 mb-4">
                  <input className="form-control bg-transparent text-body border" style={{borderColor:"var(--border)"}}
                    value={newSkill} placeholder="Add a skill manually..."
                    onChange={e=>setNewSkill(e.target.value)}
                    onKeyDown={e=>{if(e.key==="Enter"&&newSkill.trim()&&!skills.map(s=>s.toLowerCase()).includes(newSkill.trim().toLowerCase())){setSkills(prev=>[...prev,newSkill.trim()]);setNewSkill("");}}} />
                  <button className="btn btn-outline-primary" onClick={()=>{if(newSkill.trim()&&!skills.map(s=>s.toLowerCase()).includes(newSkill.trim().toLowerCase())){setSkills(prev=>[...prev,newSkill.trim()]);setNewSkill("");}}}>
                    <Plus size={16} />
                  </button>
                </div>
                {projects.length > 0 && (
                  <div className="mb-4">
                    <h6 className="fw-bold text-muted text-uppercase mb-3">Projects ({projects.length})</h6>
                    {projects.map((proj,i)=>(
                      <div key={i} className="p-3 border rounded-3 mb-2" style={{borderColor:"var(--border)"}}>
                        <div className="d-flex justify-content-between mb-1">
                          <input className="form-control form-control-sm bg-transparent text-body border-0 fw-semibold p-0" value={proj.name||""} placeholder="Project name"
                            onChange={e=>setProjects(prev=>prev.map((p,idx)=>idx===i?{...p,name:e.target.value}:p))} />
                          <button className="btn btn-link text-danger p-0 ms-2" onClick={()=>setProjects(prev=>prev.filter((_,idx)=>idx!==i))}><Trash2 size={14}/></button>
                        </div>
                        <input className="form-control form-control-sm bg-transparent text-muted border-0 p-0 small" value={proj.stack||""} placeholder="Technologies"
                          onChange={e=>setProjects(prev=>prev.map((p,idx)=>idx===i?{...p,stack:e.target.value}:p))} />
                        <input className="form-control form-control-sm bg-transparent text-muted border-0 p-0 small" value={proj.desc||""} placeholder="Description"
                          onChange={e=>setProjects(prev=>prev.map((p,idx)=>idx===i?{...p,desc:e.target.value}:p))} />
                      </div>
                    ))}
                  </div>
                )}
                {certificates.length > 0 && (
                  <div className="mb-4">
                    <h6 className="fw-bold text-muted text-uppercase mb-3"><Award size={16} className="me-1 text-info" />Certifications ({certificates.length})</h6>
                    {certificates.map((cert,i)=>(
                      <div key={i} className="p-3 border rounded-3 mb-2 d-flex justify-content-between align-items-center" style={{borderColor:"var(--border)"}}>
                        <div>
                          <div className="fw-semibold small">{cert.name}</div>
                          <div className="text-muted" style={{fontSize:"0.72rem"}}>{cert.issuer}{cert.date&&` · ${cert.date}`}</div>
                        </div>
                        <button className="btn btn-link text-danger p-0" onClick={()=>setCertificates(prev=>prev.filter((_,idx)=>idx!==i))}><Trash2 size={14}/></button>
                      </div>
                    ))}
                  </div>
                )}
                {analysis.missingSkills?.length > 0 && (
                  <div>
                    <h6 className="fw-bold text-muted text-uppercase mb-2 d-flex align-items-center gap-2"><AlertCircle size={14} className="text-danger"/>Missing for {analysis.targetRole}</h6>
                    <div className="d-flex flex-wrap gap-1">
                      {analysis.missingSkills.map((s,i)=>(
                        <span key={i} className="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1" style={{fontSize:"0.72rem"}}>{s}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="modal-footer border-0 px-5 py-4 d-flex gap-3">
            <button onClick={onClose} className="btn btn-outline-secondary rounded-pill px-4 fw-semibold flex-shrink-0">Cancel</button>
            <div className="flex-grow-1 text-muted small d-flex align-items-center gap-2">
              <CheckCircle size={14} className="text-success"/>Skills will be merged. Existing data is preserved.
            </div>
            <button onClick={()=>onApply({analysisId:analysis.analysisId,profile,skills,projects,certificates})}
              disabled={applying}
              className="btn btn-primary rounded-pill px-5 fw-bold d-flex align-items-center gap-2 shadow-sm"
              style={{background:"linear-gradient(135deg,var(--primary),var(--purple))",border:"none"}}>
              {applying?<><span className="spinner-border spinner-border-sm"/>Saving...</>:<><CheckCircle size={16}/>Update My Profile</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Settings = () => {
  const { user, setUser } = useAuth();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState("account");
  const [saving, setSaving] = useState(false);
  const { theme, setTheme } = useTheme();
  const [preferredRoles, setPreferredRoles] = useState(user?.studentProfile?.preferredRoles || "");
  const [notifications, setNotifications] = useState(user?.notificationSettings || { email:true, push:true, jobAlerts:true, assessmentReminders:true, newsletter:false });
  const [analyzing, setAnalyzing] = useState(false);
  const [applying, setApplying] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [resumeStatus, setResumeStatus] = useState(null);
  const fileInputRef = useRef(null);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await authService.updateMe({ themePreference:theme, notificationSettings:notifications, studentProfile:{preferredRoles} });
      if (data?.user && typeof setUser==="function") setUser(data.user);
      addToast("Settings saved successfully","success");
    } catch(err) { addToast(err?.message||"Failed to save settings","error"); }
    finally { setSaving(false); }
  };

  const handleResumeFile = async (file) => {
    if (!file) return;
    if (file.type !== "application/pdf") { addToast("Please upload a PDF file.","error"); return; }
    if (file.size > 5*1024*1024) { addToast("File must be under 5MB.","error"); return; }
    setAnalyzing(true);
    setResumeStatus({ type:"analyzing", msg:"Extracting text and running AI analysis..." });
    try {
      const formData = new FormData();
      formData.append("resume", file);
      const { data } = await studentService.analyzeResumeForProfile(formData);
      if (data.success) {
        setAnalysisResult(data.data);
        setResumeStatus({ type:"ready", msg:`Analysis complete — ${data.data.extractedSkills?.length||0} skills found, ATS: ${data.data.atsScore}/100` });
        setShowModal(true);
      } else {
        setResumeStatus({ type:"error", msg:data.message||"Analysis failed" });
        addToast(data.message||"Analysis failed","error");
      }
    } catch(err) {
      const msg = err?.message||err?.response?.data?.message||"Failed to analyze resume";
      setResumeStatus({ type:"error", msg });
      addToast(msg,"error");
    } finally {
      setAnalyzing(false);
      if (fileInputRef.current) fileInputRef.current.value = null;
    }
  };

  const handleApplyProfile = async (confirmedData) => {
    setApplying(true);
    try {
      const { data } = await studentService.applyResumeProfile(confirmedData);
      if (data.success) {
        if (typeof setUser==="function"&&data.data?.user) {
          setUser(data.data.user);
          localStorage.setItem("nexora_user",JSON.stringify(data.data.user));
        }
        addToast(data.message||"Profile updated from resume!","success");
        setShowModal(false);
        const sp = data.data?.user?.studentProfile;
        setResumeStatus({ type:"done", msg:`Profile updated! ${(sp?.skills||[]).length} skills, ATS: ${sp?.resumeScore||0}/100` });
      }
    } catch(err) { addToast(err?.message||"Failed to apply profile changes","error"); }
    finally { setApplying(false); }
  };

  const tabs = [
    { id:"account", label:"Account", icon:User },
    { id:"resume", label:"Resume", icon:FileText },
    { id:"security", label:"Security", icon:Shield },
    { id:"appearance", label:"Appearance", icon:Monitor },
    { id:"notifications", label:"Notifications", icon:Bell },
    { id:"privacy", label:"Privacy", icon:Lock },
    { id:"connected", label:"Connected Apps", icon:Link },
  ];

  return (
    <div className="container-fluid py-5 px-xl-5" style={{ background:"var(--bg)", minHeight:"100dvh", color:"var(--text)" }}>
      {showModal && analysisResult && (
        <ResumeReviewModal analysis={analysisResult} onClose={()=>setShowModal(false)} onApply={handleApplyProfile} applying={applying} />
      )}
      <div className="d-flex justify-content-between align-items-center mb-5">
        <div>
          <h2 className="fw-black mb-1" style={{ fontSize:"2.5rem", letterSpacing:"-0.02em", color:"var(--text)" }}>Settings</h2>
          <p className="text-muted fw-medium">Manage your preferences, security, and notifications.</p>
        </div>
        {activeTab !== "resume" && (
          <button className="btn btn-primary rounded-pill px-4 fw-bold d-flex align-items-center gap-2 shadow-sm hover-lift"
            style={{ background:"linear-gradient(135deg,var(--primary),var(--purple))", border:"none" }} onClick={handleSave} disabled={saving}>
            {saving?<span className="spinner-border spinner-border-sm"/>:<Save size={16}/>}
            {saving?"Saving...":"Save Changes"}
          </button>
        )}
      </div>
      <div className="row g-4">
        <div className="col-lg-3">
          <div className="bento-card p-3">
            {tabs.map(tab=>(
              <button key={tab.id} onClick={()=>setActiveTab(tab.id)}
                className={`w-100 text-start d-flex align-items-center justify-content-between p-3 rounded-3 mb-2 border-0 transition-fast ${activeTab===tab.id?"bg-primary text-white shadow-sm":"bg-transparent text-muted hover-bg-subtle"}`}>
                <div className="d-flex align-items-center gap-3 fw-semibold"><tab.icon size={18}/> {tab.label}</div>
                {activeTab===tab.id&&<ChevronRight size={16}/>}
              </button>
            ))}
          </div>
        </div>
        <div className="col-lg-9">
          <motion.div key={activeTab} initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} transition={{duration:0.2}} className="bento-card p-5 h-100">

            {activeTab==="account"&&(
              <div>
                <h4 className="fw-bold mb-4">Account Information</h4>
                <div className="row g-4">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold text-muted">Full Name</label>
                    <input type="text" className="form-control" defaultValue={user?.name||"Student"} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold text-muted">Email Address</label>
                    <input type="email" className="form-control" defaultValue={user?.email||""} disabled />
                    <small className="text-muted mt-1 d-block">Contact admin to change university email.</small>
                  </div>
                  <div className="col-md-12">
                    <label className="form-label fw-semibold text-muted">Target Career Role</label>
                    <input type="text" className="form-control" placeholder="e.g. Backend Engineer, Data Scientist"
                      value={preferredRoles} onChange={e=>setPreferredRoles(e.target.value)} />
                    <small className="text-muted mt-1 d-block">Used for alumni matching and job recommendations.</small>
                  </div>
                </div>
              </div>
            )}

            {activeTab==="resume"&&(
              <div>
                <div className="d-flex align-items-center gap-3 mb-4">
                  <div className="p-2 rounded-3" style={{ background:"linear-gradient(135deg,var(--primary),var(--purple))", color:"#fff" }}>
                    <FileText size={22}/>
                  </div>
                  <div>
                    <h4 className="fw-bold mb-0">Resume Intelligence</h4>
                    <p className="text-muted small mb-0">Upload your resume to auto-fill your profile with real extracted data</p>
                  </div>
                </div>
                {(user?.studentProfile?.resumeUrl||user?.studentProfile?.resumeScore>0)&&(
                  <div className="p-4 rounded-3 border mb-4 d-flex align-items-center gap-4" style={{ borderColor:"var(--border)", background:"var(--surface)" }}>
                    <div className="p-3 rounded-3" style={{ background:"rgba(var(--primary-rgb),0.1)" }}>
                      <FileText size={32} className="text-primary"/>
                    </div>
                    <div className="flex-grow-1">
                      <div className="fw-bold">{user?.studentProfile?.resumeUrl||"Uploaded Resume"}</div>
                      <div className="d-flex gap-3 mt-1 flex-wrap">
                        {user?.studentProfile?.resumeScore>0&&(
                          <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 fw-semibold">
                            ATS Score: {user.studentProfile.resumeScore}/100
                          </span>
                        )}
                        {user?.studentProfile?.skills?.length>0&&(
                          <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 fw-semibold">
                            {user.studentProfile.skills.length} skills in profile
                          </span>
                        )}
                      </div>
                    </div>
                    <button className="btn btn-outline-primary rounded-pill px-3 fw-semibold d-flex align-items-center gap-2 flex-shrink-0"
                      onClick={()=>fileInputRef.current?.click()} disabled={analyzing}>
                      <RotateCcw size={16}/> Re-analyze
                    </button>
                  </div>
                )}
                {resumeStatus&&(
                  <div className={`alert alert-${resumeStatus.type==="error"?"danger":resumeStatus.type==="done"?"success":"info"} d-flex align-items-center gap-2 rounded-3 border-0 mb-4`}>
                    {resumeStatus.type==="analyzing"?<span className="spinner-border spinner-border-sm"/>:
                     resumeStatus.type==="error"?<AlertCircle size={18}/>:<CheckCircle size={18}/>}
                    {resumeStatus.msg}
                  </div>
                )}
                <div className="border border-2 rounded-4 p-5 text-center d-flex flex-column align-items-center justify-content-center hover-glow"
                  style={{ borderColor:"var(--primary)", borderStyle:"dashed", background:"rgba(var(--primary-rgb),0.03)", minHeight:"200px", cursor:analyzing?"not-allowed":"pointer" }}
                  onClick={()=>!analyzing&&fileInputRef.current?.click()}
                  onDragOver={e=>e.preventDefault()}
                  onDrop={e=>{e.preventDefault();handleResumeFile(e.dataTransfer.files[0]);}}>
                  <input ref={fileInputRef} type="file" accept="application/pdf" style={{display:"none"}} onChange={e=>handleResumeFile(e.target.files[0])} />
                  {analyzing?(
                    <>
                      <div className="position-relative mb-3">
                        <span className="spinner-grow text-primary" style={{width:"3rem",height:"3rem",opacity:0.3}}/>
                        <Sparkles size={24} className="text-primary position-absolute top-50 start-50 translate-middle"/>
                      </div>
                      <h6 className="fw-bold text-primary mb-1">AI is analyzing your resume...</h6>
                      <small className="text-muted">Extracting name, education, skills, projects, and more</small>
                    </>
                  ):(
                    <>
                      <div className="mb-3 p-3 rounded-circle" style={{background:"rgba(var(--primary-rgb),0.1)"}}>
                        <Upload size={36} className="text-primary"/>
                      </div>
                      <h6 className="fw-bold mb-1">Drop your PDF resume here</h6>
                      <p className="text-muted small mb-3">or click to browse — Max 5MB, PDF only</p>
                      <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 fw-semibold">
                        AI will extract name, education, skills, projects and more
                      </span>
                    </>
                  )}
                </div>
                <div className="mt-4 p-4 rounded-3" style={{background:"var(--surface)",border:"1px solid var(--border)"}}>
                  <h6 className="fw-bold mb-3">What gets extracted:</h6>
                  <div className="row g-2">
                    {["Full Name","Phone","Location","College & Branch","Batch Year & CGPA","Professional Bio","GitHub & LinkedIn","Technical Skills","Projects","Certifications","ATS Score","Missing Skills"].map(item=>(
                      <div key={item} className="col-md-4">
                        <div className="d-flex align-items-center gap-2 small text-muted">
                          <CheckCircle2 size={14} className="text-success flex-shrink-0"/>{item}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 p-3 rounded-3 bg-warning-subtle border border-warning-subtle">
                    <small className="text-warning-emphasis fw-semibold">
                      You will review all extracted data before anything is saved. Nothing updates without your confirmation.
                    </small>
                  </div>
                </div>
              </div>
            )}

            {activeTab==="appearance"&&(
              <div>
                <h4 className="fw-bold mb-4">Theme Preferences</h4>
                <div className="row g-3">
                  {[{id:"light",label:"Light",icon:Sun},{id:"dark",label:"Dark",icon:Moon},{id:"system",label:"System",icon:Smartphone}].map(t=>(
                    <div className="col-md-4" key={t.id}>
                      <div onClick={()=>setTheme(t.id)}
                        className={`p-4 rounded-3 border d-flex flex-column align-items-center gap-3 cursor-pointer transition-fast ${theme===t.id?"border-primary bg-primary-subtle text-primary shadow-sm":"border hover-bg-subtle text-muted"}`}>
                        <t.icon size={32}/><span className="fw-bold">{t.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab==="notifications"&&(
              <div>
                <h4 className="fw-bold mb-4">Notification Preferences</h4>
                <div className="d-flex flex-column gap-3">
                  {[
                    {key:"email",label:"Email Notifications",desc:"Receive summaries and major alerts via email."},
                    {key:"push",label:"Push Notifications",desc:"Real-time alerts in your browser."},
                    {key:"jobAlerts",label:"Job Alerts",desc:"Notify me when matching jobs are posted."},
                    {key:"assessmentReminders",label:"Assessment Reminders",desc:"24h and 1h reminders before tests."},
                  ].map(setting=>(
                    <div key={setting.key} className="p-4 rounded-3 border d-flex justify-content-between align-items-center hover-glow" style={{borderColor:"var(--border)"}}>
                      <div><h6 className="fw-bold mb-1">{setting.label}</h6><p className="text-muted small mb-0">{setting.desc}</p></div>
                      <div className="form-check form-switch fs-4 m-0 p-0">
                        <input className="form-check-input ms-0" type="checkbox" role="switch"
                          checked={notifications[setting.key]||false}
                          onChange={e=>setNotifications({...notifications,[setting.key]:e.target.checked})}
                          style={{cursor:"pointer"}} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(activeTab==="security"||activeTab==="privacy"||activeTab==="connected")&&(
              <div className="text-center py-5">
                <Shield size={64} className="text-muted mb-3 opacity-50"/>
                <h4 className="fw-bold mb-2">Secure &amp; Encrypted</h4>
                <p className="text-muted">Your {activeTab} settings are managed through the central SSO provider.</p>
              </div>
            )}

          </motion.div>
        </div>
      </div>
    </div>
  );
};
export default Settings;