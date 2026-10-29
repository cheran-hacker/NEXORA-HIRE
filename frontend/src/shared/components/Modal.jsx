import React, { useEffect } from "react";
import { X } from "lucide-react";
export default function Modal({ isOpen, onClose, title, children, actions }) {
  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);
  if (!isOpen) return null;
  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-4" style={{ zIndex: 1050 }}>
      {/* Backdrop */}
      <div
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />
      {/* Modal Content */}
      <div
        className="position-relative border rounded-4 shadow-lg w-100 d-flex flex-column overflow-hidden"
        style={{ maxWidth: "500px", maxHeight: "90dvh", background: "var(--surface)", borderColor: "var(--border)" }}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between px-4 py-3 border-bottom" style={{ borderColor: "var(--border)" }}>
          <h2 className="fs-5 fw-bold m-0" style={{ color: "var(--text)" }}>{title}</h2>
          <button
            onClick={onClose}
            className="btn btn-link p-1 text-muted text-decoration-none"
          >
            <X size={20} />
          </button>
        </div>
        {/* Body */} 
        <div className="p-4 overflow-auto" style={{ maxHeight: "calc(90dvh - 130px)" }}> 
          {children} 
        </div>
        {/* Footer / Actions */}
        {actions && (
          <div className="d-flex align-items-center justify-content-end gap-3 px-4 py-3 border-top" style={{ borderColor: "var(--border)" }}>
            {actions}
          </div>
        )}{" "}
      </div>{" "}
    </div>
  );
}
