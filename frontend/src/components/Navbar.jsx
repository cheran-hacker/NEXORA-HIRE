import React, { useState, useEffect } from "react";
import {
  Bell,
  Search,
  Sun,
  Moon,
  CheckCircle,
  Info,
  AlertTriangle,
  Palette,
  Check,
  User,
  Settings,
  HelpCircle,
  LogOut,
  ChevronDown,
  Menu,
  Monitor,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { notificationService } from "../services/api.js";
import { useTheme } from "../context/ThemeContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { getAvatarUrl, handleImageError } from "../utils/avatar.js";
export default function Navbar({ pageTitle, user, onToggleSidebar }) {
  const navigate = useNavigate();
  const { theme, actualTheme, setTheme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { logout } = useAuth();
  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);
  const fetchNotifications = async () => {
    try {
      const res = await notificationService.getNotifications();
      if (res.data.success) {
        setNotifications(res.data.data);
        setUnreadCount(res.data.unreadCount);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    }
  };
  const markAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };
  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };
  const triggerSearch = () => {
    window.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", ctrlKey: true }),
    );
  };
  const handleProfileClick = () => {
    setShowProfileMenu(!showProfileMenu);
  };
  const handleNavigate = (path) => {
    setShowProfileMenu(false);
    navigate(path);
  };
  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  return (
    <header className="nexora-navbar">
      {" "}
      <div className="navbar-brand d-flex align-items-center gap-3">
        {" "}
        <button className="navbar-icon-btn d-lg-none" onClick={onToggleSidebar}>
          {" "}
          <Menu size={24} style={{ color: "var(--text)" }} />{" "}
        </button>{" "}
        <h4
          className="m-0 fw-bold tracking-tight d-none d-sm-block"
          style={{ color: "var(--text)" }}
        >
          {pageTitle}
        </h4>{" "}
      </div>{" "}
      <div className="navbar-actions">
        {" "}
        <div className="position-relative">
          <button
            className="navbar-icon-btn"
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            title={`Theme: ${actualTheme === "dark" ? "Dark" : actualTheme === "purple" ? "Purple" : "Light"} (Click to select theme)`}
          >
            {actualTheme === "dark" ? (
              <Moon size={20} className="text-primary" />
            ) : actualTheme === "purple" ? (
              <Palette size={20} style={{ color: "var(--premium-neon-purple, #c084fc)" }} />
            ) : (
              <Sun size={20} style={{ color: "#f59e0b" }} />
            )}
          </button>
          {showThemeMenu && (
            <div
              className="position-absolute end-0 mt-2 rounded-3 shadow-lg p-2 d-flex flex-column gap-1"
              style={{
                width: "165px",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                zIndex: 1000,
              }}
            >
              <div className="px-2 py-1 small fw-bold text-muted text-uppercase" style={{ fontSize: "0.68rem" }}>
                Theme Appearance
              </div>
              <button
                onClick={() => {
                  setTheme("light");
                  setShowThemeMenu(false);
                }}
                className={`btn btn-sm text-start border-0 fw-semibold d-flex align-items-center justify-content-between rounded-2 px-2 py-1 ${
                  actualTheme === "light" ? "bg-primary text-white" : "text-muted hover-bg"
                }`}
              >
                <span className="d-flex align-items-center gap-2">
                  <Sun size={15} style={{ color: actualTheme === "light" ? "white" : "#f59e0b" }} /> Light
                </span>
                {actualTheme === "light" && <Check size={14} />}
              </button>

              <button
                onClick={() => {
                  setTheme("dark");
                  setShowThemeMenu(false);
                }}
                className={`btn btn-sm text-start border-0 fw-semibold d-flex align-items-center justify-content-between rounded-2 px-2 py-1 ${
                  actualTheme === "dark" ? "bg-primary text-white" : "text-muted hover-bg"
                }`}
              >
                <span className="d-flex align-items-center gap-2">
                  <Moon size={15} style={{ color: actualTheme === "dark" ? "white" : "var(--primary)" }} /> Dark
                </span>
                {actualTheme === "dark" && <Check size={14} />}
              </button>

              <button
                onClick={() => {
                  setTheme("purple");
                  setShowThemeMenu(false);
                }}
                className={`btn btn-sm text-start border-0 fw-semibold d-flex align-items-center justify-content-between rounded-2 px-2 py-1 ${
                  actualTheme === "purple" ? "bg-primary text-white" : "text-muted hover-bg"
                }`}
              >
                <span className="d-flex align-items-center gap-2">
                  <Palette size={15} style={{ color: actualTheme === "purple" ? "white" : "#c084fc" }} /> Purple
                </span>
                {actualTheme === "purple" && <Check size={14} />}
              </button>
            </div>
          )}
        </div>{" "}
        <button
          className="navbar-icon-btn"
          onClick={triggerSearch}
          title="Global Search (Ctrl+K)"
        >
          {" "}
          <Search size={20} style={{ color: "var(--text-muted)" }} />{" "}
        </button>{" "}
        <div className="position-relative">
          <button
            className="navbar-icon-btn position-relative"
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "10px",
              border: "1px solid var(--border)",
              background: "var(--surface)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease"
            }}
          >
            <Bell size={18} style={{ color: "var(--text-muted)" }} />
            {unreadCount > 0 && (
              <span
                className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-light"
                style={{ fontSize: "0.625rem", padding: "0.22em 0.45em", minWidth: "18px" }}
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
          {showNotifications && (
            <div
              className="position-absolute end-0 mt-2 rounded-3 shadow-lg p-0"
              style={{
                width: "320px",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                zIndex: 1000,
                overflow: "hidden",
              }}
            >
              <div
                className="d-flex justify-content-between align-items-center p-3 border-bottom"
                style={{ borderColor: "var(--border)" }}
              >
                <h6 className="m-0 fw-bold" style={{ color: "var(--text)" }}>
                  Notifications
                </h6>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="btn btn-link btn-sm p-0 text-decoration-none small text-primary"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div style={{ maxHeight: "350px", overflowY: "auto" }}>
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-muted small">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      onClick={() => markAsRead(n._id)}
                      className={`p-3 border-bottom d-flex gap-3 align-items-start ${!n.read ? "bg-primary-subtle" : ""}`}
                      style={{
                        borderColor: "var(--border)",
                        cursor: "pointer",
                        transition: "0.2s",
                      }}
                    >
                      <div
                        className={`mt-1 text-${n.type === "Alert" ? "danger" : n.type === "Success" ? "success" : "primary"}`}
                      >
                        {n.type === "Alert" ? (
                          <AlertTriangle size={16} />
                        ) : n.type === "Success" ? (
                          <CheckCircle size={16} />
                        ) : (
                          <Info size={16} />
                        )}
                      </div>
                      <div>
                        <h6
                          className={`small m-0 mb-1 ${!n.read ? "fw-bold" : "fw-semibold"}`}
                          style={{ color: "var(--text)" }}
                        >
                          {n.title}
                        </h6>
                        <p
                          className="small m-0 text-muted"
                          style={{ fontSize: "0.75rem" }}
                        >
                          {n.message}
                        </p>
                        <small
                          className="text-muted d-block mt-1"
                          style={{ fontSize: "0.65rem" }}
                        >
                          {new Date(n.createdAt).toLocaleString()}
                        </small>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        <div className="position-relative">
          <div
            className="user-profile-btn d-flex align-items-center gap-2"
            onClick={handleProfileClick}
            style={{
              cursor: "pointer",
              padding: "4px 12px 4px 4px",
              borderRadius: "50px",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
              transition: "all 0.2s ease"
            }}
          >
            <div
              className="user-avatar overflow-hidden rounded-circle position-relative"
              style={{
                background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                color: "white",
                width: "32px",
                height: "32px",
                padding: "1.5px",
                boxShadow: "0 2px 6px rgba(79, 70, 229, 0.25)"
              }}
            >
              <img
                src={getAvatarUrl(user?.name, user?.avatar || user?.avatarUrl)}
                alt="Avatar"
                onError={(e) => handleImageError(e, user?.name)}
                className="w-100 h-100 object-fit-cover rounded-circle"
              />
            </div>
            <div className="user-info pr-1 d-none d-md-block">
              <div
                className="user-name fw-semibold lh-1"
                style={{ color: "var(--text)", fontSize: "0.85rem" }}
              >
                {user?.name || "User"}
              </div>
              <div
                className="user-role lh-1 mt-1 text-muted"
                style={{ fontSize: "0.7rem" }}
              >
                {user?.role || "Guest"}
              </div>
            </div>
            <ChevronDown size={14} className="text-muted ms-1" />
          </div>{" "}
          {showProfileMenu && (
            <div
              className="position-absolute end-0 mt-2 rounded-3 shadow-lg p-2 d-flex flex-column gap-1"
              style={{
                width: "200px",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                zIndex: 1000,
              }}
            >
              {" "}
              <button
                onClick={() =>
                  handleNavigate(
                    `/${user?.role?.toLowerCase() || "student"}/profile`,
                  )
                }
                className="btn btn-sm text-start border-0 fw-semibold d-flex align-items-center gap-2 rounded-2 hover-bg-subtle text-muted"
              >
                {" "}
                <User size={16} /> View Profile{" "}
              </button>{" "}
              <button
                onClick={() =>
                  handleNavigate(
                    `/${user?.role?.toLowerCase() || "student"}/settings`,
                  )
                }
                className="btn btn-sm text-start border-0 fw-semibold d-flex align-items-center gap-2 rounded-2 hover-bg-subtle text-muted"
              >
                {" "}
                <Settings size={16} /> Settings{" "}
              </button>{" "}
              <button
                onClick={() => handleNavigate("/faq")}
                className="btn btn-sm text-start border-0 fw-semibold d-flex align-items-center gap-2 rounded-2 hover-bg-subtle text-muted"
              >
                {" "}
                <HelpCircle size={16} /> Help & Support{" "}
              </button>{" "}
              <hr className="my-1 border opacity-25" />{" "}
              <button
                onClick={handleLogout}
                className="btn btn-sm text-start border-0 fw-semibold d-flex align-items-center gap-2 rounded-2 hover-bg-subtle text-danger"
              >
                {" "}
                <LogOut size={16} /> Logout{" "}
              </button>{" "}
            </div>
          )}{" "}
        </div>{" "}
      </div>{" "}
    </header>
  );
}
