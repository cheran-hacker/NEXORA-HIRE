import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
const ThemeToggle = ({ collapsed = false, className = "" }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  return (
    <motion.button
      onClick={toggleTheme}
      className={`sidebar-nav-item w-100 border-0 mb-1 d-flex align-items-center ${className}`}
      style={{
        background: "none",
        cursor: "pointer",
        padding: "10px 12px",
        borderRadius: "var(--radius-md)",
      }}
      whileHover={{ backgroundColor: "var(--bg-secondary-subtle)" }}
      whileTap={{ scale: 0.95 }}
    >
      {" "}
      <div
        style={{
          position: 'relative',
          width: 20,
          height: 20,
          flexShrink: 0,
        }}
      >
        {" "}
        <AnimatePresence mode="wait" initial={false}>
          {" "}
          {isDark ? (
            <motion.div
              key="moon"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ position: 'absolute', top: 0, left: 0 }}
            >
              {" "}
              <Moon size={20} strokeWidth={1.8} className="text-primary" />{" "}
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ position: 'absolute', top: 0, left: 0 }}
            >
              {" "}
              <Sun size={20} strokeWidth={1.8} className="text-accent" />{" "}
            </motion.div>
          )}{" "}
        </AnimatePresence>{" "}
      </div>{" "}
      {!collapsed && (
        <motion.span
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="ms-3 fw-semibold"
          style={{ color: "var(--text)" }}
        >
          {" "}
          {isDark ? "Light Mode" : "Dark Mode"}{" "}
        </motion.span>
      )}{" "}
    </motion.button>
  );
};
export default ThemeToggle;
