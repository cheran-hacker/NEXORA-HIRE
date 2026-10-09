import React from "react"; /** * A reusable loading skeleton component with a glassmorphic pulse effect. * @param {string} variant - 'text', 'circular', 'rectangular', or 'card' * @param {string} width - CSS width (e.g., '100%', '40px') * @param {string} height - CSS height (e.g., '20px', '40px') * @param {string} className - Additional CSS classes */
export default function Skeleton({
  variant = "text",
  width,
  height,
  className = "",
}) {
  const baseClasses = "placeholder-glow";
  let variantClasses = "";
  switch (variant) {
    case "circular":
      variantClasses = "rounded-circle";
      break;
    case "rectangular":
      variantClasses = "rounded-3";
      break;
    case "card":
      variantClasses = "rounded-4 shadow-sm";
      break;
    case "text":
    default:
      variantClasses = "rounded";
      break;
  }
  const style = {
    width: width || (variant === "text" ? "100%" : undefined),
    height: height || (variant === "text" ? "1rem" : undefined),
  };
  return (
    <div
      className={`${baseClasses} ${className}`}
      style={style}
      role="status"
      aria-label="Loading..."
    >
      {" "}
      <span
        className={`placeholder ${variantClasses} w-100 h-100`}
        style={{ background: "var(--surface-2)" }}
      ></span>{" "}
    </div>
  );
}
