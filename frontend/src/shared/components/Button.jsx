import React from "react";
import { motion } from "framer-motion";
const Button = ({
  children,
  variant = "primary",
  className = "",
  onClick,
  type = "button",
  disabled = false,
  isLoading = false,
}) => {
  const baseStyle = "btn px-4 py-2 fw-semibold rounded-pill";
  const variants = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    outline: "btn-outline-primary",
    danger: "btn-danger",
    glass: "glass-panel text-foreground border",
  };
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      type={type}
      className={`${baseStyle} ${variants[variant]} ${className}`}
      onClick={onClick}
      disabled={disabled || isLoading}
    >
      {" "}
      {isLoading ? (
        <span
          className="spinner-border spinner-border-sm me-2"
          role="status"
          aria-hidden="true"
        ></span>
      ) : null}{" "}
      {children}{" "}
    </motion.button>
  );
};
export default Button;
