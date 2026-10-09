import React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
export default function Sidebar({ role, navigation, isOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  return (
    <>
      {" "}
      <div
        className={`sidebar-overlay ${isOpen ? "show" : ""}`}
        onClick={onClose}
        style={{ zIndex: 99 }}
      ></div>{" "}
      <aside
        className={`nexora-sidebar ${isOpen ? "mobile-open" : ""}`}
        style={{ zIndex: 100 }}
      >
        {" "}
        <div className="nexora-sidebar-header">
          {" "}
          <div
            className="w-8 h-8 rounded bg-gradient-primary d-flex align-items-center justify-content-center fw-bold text-foreground shadow-sm"
            style={{ width: "32px", height: "32px", borderRadius: "8px" }}
          >
            {" "}
            N{" "}
          </div>{" "}
          <span className="nexora-sidebar-logo-text">NEXORA</span>{" "}
        </div>{" "}
        <nav className="nexora-sidebar-nav" style={{ overflowY: "auto", flex: 1, paddingBottom: "1rem" }}>
          {" "}
          {navigation.map((item, idx) => {
            if (item.isSection) {
              return (
                <div 
                  key={`section-${idx}`} 
                  className="text-muted small fw-bold px-3 mt-4 mb-2" 
                  style={{ letterSpacing: '0.08em', fontSize: '0.7rem', textTransform: 'uppercase' }}
                >
                  {item.name}
                </div>
              );
            }
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `sidebar-nav-item d-flex align-items-center gap-3 px-3 py-2 mb-1 rounded-3 text-decoration-none ${isActive ? "active shadow-sm" : ""}`
                }
                style={({ isActive }) => ({
                  background: isActive ? "var(--primary)" : "transparent",
                  color: isActive ? "white" : "var(--text-secondary)",
                })}
              >
                {" "}
                <item.icon
                  size={18}
                  className={
                    location.pathname.startsWith(item.href)
                      ? "text-foreground"
                      : "text-muted-custom"
                  }
                />{" "}
                <span className="fw-semibold" style={{ fontSize: "0.9rem" }}>
                  {item.name}
                </span>{" "}
              </NavLink>
            );
          })}{" "}
        </nav>{" "}
        <div
          className="nexora-sidebar-footer p-3 border-top"
          style={{ borderColor: "var(--border)" }}
        >
          {" "}
          <button
            className="sidebar-nav-item w-100 bg-transparent border-0 text-danger hover-glow d-flex align-items-center gap-3 px-3 py-2 rounded-3"
            onClick={handleLogout}
          >
            {" "}
            <LogOut size={18} />{" "}
            <span className="fw-semibold" style={{ fontSize: "0.9rem" }}>
              Sign Out
            </span>{" "}
          </button>{" "}
        </div>{" "}
      </aside>{" "}
    </>
  );
}
