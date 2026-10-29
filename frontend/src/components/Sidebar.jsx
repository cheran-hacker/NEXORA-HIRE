import React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import ThemeToggle from "./ThemeToggle.jsx";

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
      <div
        className={`sidebar-overlay ${isOpen ? "show" : ""}`}
        onClick={onClose}
        style={{ zIndex: 99 }}
      ></div>
      <aside
        className={`nexora-sidebar ${isOpen ? "mobile-open" : ""}`}
        style={{ zIndex: 100 }}
      >
        <div className="nexora-sidebar-header d-flex align-items-center justify-content-between px-3 py-3 border-bottom" style={{ borderColor: "var(--border)" }}>
          <div className="d-flex align-items-center gap-2.5">
            <div
              className="d-flex align-items-center justify-content-center fw-bold shadow-sm"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                color: "#ffffff",
                boxShadow: "0 4px 12px rgba(79, 70, 229, 0.35)",
                fontSize: "1.1rem",
                letterSpacing: "-0.02em",
                flexShrink: 0
              }}
            >
              N
            </div>
            <div className="d-flex flex-column">
              <span className="nexora-sidebar-logo-text fw-black tracking-tight" style={{ fontSize: "1.2rem", lineHeight: 1.1 }}>
                NEXORA
              </span>
              <span className="text-muted fw-semibold" style={{ fontSize: "0.625rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Enterprise Career OS
              </span>
            </div>
          </div>
        </div>
        <nav className="nexora-sidebar-nav" style={{ overflowY: "auto", flex: 1, padding: "1rem 0.75rem" }}>
          {navigation.map((item, idx) => {
            if (item.isSection) {
              return (
                <div 
                  key={`section-${idx}`} 
                  className="text-muted small fw-bold px-3 mt-3 mb-1.5" 
                  style={{ letterSpacing: '0.08em', fontSize: '0.68rem', textTransform: 'uppercase' }}
                >
                  {item.name}
                </div>
              );
            }
            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => {
                  if (onClose) onClose();
                }}
                className={({ isActive }) =>
                  `sidebar-nav-item d-flex align-items-center gap-3 px-3 py-2.5 mb-1 rounded-3 text-decoration-none ${isActive ? "active" : ""}`
                }
              >
                <item.icon
                  size={18}
                  style={{ width: "18px", height: "18px", minWidth: "18px", minHeight: "18px", flexShrink: 0 }}
                  className={
                    location.pathname.startsWith(item.href)
                      ? "text-foreground"
                      : "text-muted-custom"
                  }
                />
                <span className="fw-medium" style={{ fontSize: "0.875rem" }}>
                  {item.name}
                </span>
              </NavLink>
            );
          })}
        </nav>
        <div
          className="nexora-sidebar-footer p-3 border-top"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="mb-2">
            <ThemeToggle />
          </div>
          <button
            className="sidebar-nav-item w-100 bg-transparent border-0 text-danger hover-glow d-flex align-items-center gap-3 px-3 py-2.5 rounded-3"
            onClick={handleLogout}
            style={{ transition: "all 0.2s ease" }}
          >
            <LogOut size={18} style={{ width: "18px", height: "18px", minWidth: "18px", minHeight: "18px", flexShrink: 0 }} />
            <span className="fw-semibold" style={{ fontSize: "0.875rem" }}>
              Sign Out
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
