import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Palette } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const ThemeToggle = ({ collapsed = false, className = "" }) => {
  const { actualTheme, toggleTheme } = useTheme();

  const getThemeDetails = () => {
    if (actualTheme === "dark") {
      return {
        label: "Dark Mode",
        next: "Purple Theme",
        icon: <Moon size={18} strokeWidth={2} className="text-primary" />
      };
    }
    if (actualTheme === "purple") {
      return {
        label: "Purple Mode",
        next: "Light Theme",
        icon: <Palette size={18} strokeWidth={2} style={{ color: "var(--premium-neon-purple, #c084fc)" }} />
      };
    }
    return {
      label: "Light Mode",
      next: "Dark Theme",
      icon: <Sun size={18} strokeWidth={2} style={{ color: "#f59e0b" }} />
    };
  };

  const details = getThemeDetails();

  return (
    <motion.button
      onClick={toggleTheme}
      className={`sidebar-nav-item w-100 border-0 mb-1 d-flex align-items-center ${className}`}
      title={`Current: ${details.label} (Click to switch to ${details.next})`}
      style={{
        background: "none",
        cursor: "pointer",
        padding: "10px 12px",
        borderRadius: "var(--radius-md, 8px)",
      }}
      whileHover={{ backgroundColor: "var(--bg-secondary-subtle, rgba(255,255,255,0.05))" }}
      whileTap={{ scale: 0.95 }}
    >
      <div
        style={{
          position: "relative",
          width: 20,
          height: 20,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={actualTheme}
            initial={{ rotate: -45, opacity: 0, scale: 0.8 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 45, opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            {details.icon}
          </motion.div>
        </AnimatePresence>
      </div>
      {!collapsed && (
        <motion.span
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="ms-3 fw-semibold small"
          style={{ color: "var(--text)" }}
        >
          {details.label}
        </motion.span>
      )}
    </motion.button>
  );
};
export default ThemeToggle;
