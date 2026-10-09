import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sliders, Shield, Bell, Plug, CreditCard, Save, Briefcase, Plus, X, Trash2 } from "lucide-react";
import { useToast } from "../../context/ToastContext";
import { roleSkillService, settingsService } from "../../services/api";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("general");
  const { addToast } = useToast();
  
  // Role-Skill Map State
  const [roleSkills, setRoleSkills] = useState([]);
  const [newRole, setNewRole] = useState("");
  const [newSkills, setNewSkills] = useState("");

  // Settings State
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [platformName, setPlatformName] = useState("NEXORA");
  const [supportEmail, setSupportEmail] = useState("support@nexora.ai");

  useEffect(() => {
    fetchGlobalSettings();
  }, []);

  const fetchGlobalSettings = async () => {
    try {
      const res = await settingsService.getSettings();
      if (res.data.data) {
        if (res.data.data.isMaintenanceMode !== undefined) setIsMaintenanceMode(res.data.data.isMaintenanceMode);
        if (res.data.data.platformName !== undefined) setPlatformName(res.data.data.platformName);
        if (res.data.data.supportEmail !== undefined) setSupportEmail(res.data.data.supportEmail);
      }
    } catch (error) {
      console.error("Failed to fetch settings", error);
    }
  };

  useEffect(() => {
    if (activeTab === 'role-skills') {
      fetchRoleSkills();
    }
  }, [activeTab]);

  const fetchRoleSkills = async () => {
    try {
      const res = await roleSkillService.getAll();
      setRoleSkills(res.data.data);
    } catch (error) {
      addToast("Failed to fetch role skills", "error");
    }
  };

  const handleAddRoleSkill = async () => {
    if (!newRole.trim() || !newSkills.trim()) {
      addToast("Role Name and Skills are required", "error");
      return;
    }
    try {
      const reqSkills = newSkills.split(',').map(s => s.trim()).filter(Boolean);
      await roleSkillService.create({ roleName: newRole, requiredSkills: reqSkills });
      setNewRole("");
      setNewSkills("");
      addToast("Role Map created successfully", "success");
      fetchRoleSkills();
    } catch (error) {
      addToast("Failed to create role map", "error");
    }
  };

  const handleDeleteRoleSkill = async (id) => {
    if (!window.confirm("Delete this role mapping?")) return;
    try {
      await roleSkillService.delete(id);
      addToast("Role Map deleted", "success");
      fetchRoleSkills();
    } catch (error) {
      addToast("Failed to delete role map", "error");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (activeTab === 'general') {
        await Promise.all([
          settingsService.updateSetting('isMaintenanceMode', isMaintenanceMode),
          settingsService.updateSetting('platformName', platformName),
          settingsService.updateSetting('supportEmail', supportEmail)
        ]);
      }
      addToast("Settings saved successfully", "success");
    } catch (error) {
      addToast("Failed to save settings", "error");
    }
  };
  const TABS = [
    { id: "general", label: "General", icon: Sliders },
    { id: "role-skills", label: "Role-Skill Map", icon: Briefcase },
    { id: "security", label: "Security", icon: Shield },

  ];
  return (
    <div
      className="container-fluid py-4 px-xl-5"
      style={{
        background: "var(--bg)",
        minHeight: "100dvh",
        color: "var(--text)",
      }}
    >
      {" "}
      <div className="mb-4">
        {" "}
        <h2 className="fw-black mb-1" style={{ color: "var(--text)" }}>
          Platform Settings ⚙️
        </h2>{" "}
        <p className="text-muted fw-medium">
          Configure global NEXORA settings and features.
        </p>{" "}
      </div>{" "}
      <div className="row g-4">
        {" "}
        {/* Navigation Sidebar */}{" "}
        <div className="col-lg-3">
          {" "}
          <motion.div
            className="rounded-4 p-3 shadow-sm"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
            }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {" "}
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  className={`btn w-100 text-start border-0 fw-bold mb-2 d-flex align-items-center gap-3 py-3 px-3 rounded-3 transition-fast ${activeTab === tab.id ? "bg-primary-subtle text-primary" : "text-secondary hover-bg-light hover-scale"}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {" "}
                  <Icon size={18} /> {tab.label}{" "}
                </button>
              );
            })}{" "}
          </motion.div>{" "}
        </div>{" "}
        {/* Content Area */}{" "}
        <div className="col-lg-9">
          {" "}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {" "}
            {activeTab === "general" && (
              <form
                onSubmit={handleSave}
                className="rounded-4 p-4 shadow-sm"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                }}
              >
                {" "}
                <h5 className="fw-bold mb-4" style={{ color: "var(--text)" }}>
                  General Settings
                </h5>{" "}
                <div className="mb-4">
                  {" "}
                  <label
                    className="form-label fw-bold"
                    style={{ color: "var(--text)" }}
                  >
                    Platform Name
                  </label>{" "}
                  <input
                    type="text"
                    className="form-control fw-semibold"
                    style={{
                      background: "var(--bg)",
                      border: "1px solid var(--border)",
                      color: "var(--text)",
                    }}
                    value={platformName}
                    onChange={(e) => setPlatformName(e.target.value)}
                  />{" "}
                  <div className="form-text mt-2 fw-medium text-muted">
                    The name displayed on emails and public pages.
                  </div>{" "}
                </div>{" "}
                <div className="mb-4">
                  {" "}
                  <label
                    className="form-label fw-bold"
                    style={{ color: "var(--text)" }}
                  >
                    Support Email
                  </label>{" "}
                  <input
                    type="email"
                    className="form-control fw-semibold"
                    style={{
                      background: "var(--bg)",
                      border: "1px solid var(--border)",
                      color: "var(--text)",
                    }}
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                  />{" "}
                </div>{" "}
                <div className="mb-4">
                  {" "}
                  <label className="form-label fw-bold">
                    Maintenance Mode
                  </label>{" "}
                  <div className="form-check form-switch mt-2">
                    {" "}
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="maintenanceSwitch"
                      checked={isMaintenanceMode}
                      onChange={(e) => setIsMaintenanceMode(e.target.checked)}
                      style={{ transform: "scale(1.2)" }}
                    />{" "}
                    <label
                      className="form-check-label fw-semibold ms-2"
                      htmlFor="maintenanceSwitch"
                    >
                      Enable Maintenance Mode
                    </label>{" "}
                  </div>{" "}
                  <div className="form-text mt-2 fw-medium text-muted">
                    Only admins can access the platform when enabled.
                  </div>{" "}
                </div>{" "}
                <hr className="my-4" />{" "}
                <div className="d-flex justify-content-end">
                  {" "}
                  <button
                    type="submit"
                    className="btn btn-primary rounded-pill px-4 py-2 fw-bold d-flex align-items-center gap-2 shadow-sm"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--primary), var(--purple))",
                      border: "none",
                    }}
                  >
                    {" "}
                    <Save size={18} /> Save Changes{" "}
                  </button>{" "}
                </div>{" "}
              </form>
            )}{" "}

            {activeTab === "role-skills" && (
                <div
                  className="rounded-4 p-4 shadow-sm"
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <h5 className="fw-bold mb-4" style={{ color: "var(--text)" }}>
                    Career Digital Twin: Role-Skill Maps
                  </h5>
                  <p className="text-muted small mb-4">
                    Define the required skills for target career roles. This powers the Student Skill Gap Analysis.
                  </p>
                  
                  <div className="d-flex gap-3 mb-4 flex-wrap">
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Role (e.g. Backend Developer)" 
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      style={{ maxWidth: '250px' }}
                    />
                    <input 
                      type="text" 
                      className="form-control flex-grow-1" 
                      placeholder="Skills (comma separated)" 
                      value={newSkills}
                      onChange={(e) => setNewSkills(e.target.value)}
                    />
                    <button className="btn btn-primary rounded-pill d-flex align-items-center gap-2" onClick={handleAddRoleSkill}>
                      <Plus size={16} /> Add Map
                    </button>
                  </div>

                  <div className="table-responsive">
                    <table className="table align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>Role Name</th>
                          <th>Required Skills</th>
                          <th className="text-end">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {roleSkills.map(map => (
                          <tr key={map._id}>
                            <td className="fw-bold">{map.roleName}</td>
                            <td>
                              <div className="d-flex flex-wrap gap-1">
                                {map.requiredSkills.map((s, i) => (
                                  <span key={i} className="badge bg-primary-subtle text-primary border">{s}</span>
                                ))}
                              </div>
                            </td>
                            <td className="text-end">
                              <button className="btn btn-sm btn-outline-danger rounded-circle" onClick={() => handleDeleteRoleSkill(map._id)}>
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {roleSkills.length === 0 && (
                          <tr><td colSpan="3" className="text-center text-muted py-4">No role maps defined yet.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            {activeTab === "security" && (
              <form
                onSubmit={handleSave}
                className="rounded-4 p-4 shadow-sm"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                }}
              >
                {" "}
                <h5 className="fw-bold mb-4" style={{ color: "var(--text)" }}>
                  Security Settings
                </h5>{" "}
                <div className="mb-4">
                  {" "}
                  <label className="form-label fw-bold">
                    Two-Factor Authentication (2FA)
                  </label>{" "}
                  <div className="form-check form-switch mt-2">
                    {" "}
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="tfaSwitch"
                      defaultChecked
                      style={{ transform: "scale(1.2)" }}
                    />{" "}
                    <label
                      className="form-check-label fw-semibold ms-2"
                      htmlFor="tfaSwitch"
                    >
                      Enforce 2FA for all Admins
                    </label>{" "}
                  </div>{" "}
                </div>{" "}
                <div className="mb-4">
                  {" "}
                  <label
                    className="form-label fw-bold"
                    style={{ color: "var(--text)" }}
                  >
                    Session Timeout
                  </label>{" "}
                  <select
                    className="form-select fw-semibold"
                    style={{
                      background: "var(--bg)",
                      border: "1px solid var(--border)",
                      color: "var(--text)",
                    }}
                  >
                    {" "}
                    <option>15 Minutes</option> <option>30 Minutes</option>{" "}
                    <option>1 Hour</option> <option>24 Hours</option>{" "}
                  </select>{" "}
                </div>{" "}
                <hr className="my-4" />{" "}
                <div className="d-flex justify-content-end">
                  {" "}
                  <button
                    type="submit"
                    className="btn btn-primary rounded-pill px-4 py-2 fw-bold d-flex align-items-center gap-2 shadow-sm"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--primary), var(--purple))",
                      border: "none",
                    }}
                  >
                    {" "}
                    <Save size={18} /> Save Changes{" "}
                  </button>{" "}
                </div>{" "}
              </form>
            )}{" "}

          </motion.div>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
};
export default Settings;
