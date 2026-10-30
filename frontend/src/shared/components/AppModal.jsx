import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, AlertCircle } from "lucide-react";
import "./modal.css";

/**
 * Header component for master-standard modals
 */
export function AppModalHeader({
  title,
  subtitle,
  icon: Icon = Sparkles,
  iconElement,
  onClose,
  badge
}) {
  return (
    <div className="nexora-modal-header">
      <div className="nexora-modal-header-left">
        <div className="nexora-modal-icon-badge">
          {iconElement || (Icon && <Icon size={22} strokeWidth={2.2} />)}
        </div>
        <div style={{ minWidth: 0 }}>
          <div className="d-flex align-items-center gap-2">
            <h4 className="nexora-modal-title">{title}</h4>
            {badge && <span>{badge}</span>}
          </div>
          {subtitle && <p className="nexora-modal-subtitle">{subtitle}</p>}
        </div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="nexora-modal-close-btn"
          title="Close modal"
          aria-label="Close modal"
        >
          <X size={18} strokeWidth={2.2} />
        </button>
      )}
    </div>
  );
}

/**
 * Body component for master-standard modals
 */
export function AppModalBody({ children, className = "", style = {} }) {
  return (
    <div className={`nexora-modal-body ${className}`} style={style}>
      {children}
    </div>
  );
}

/**
 * Footer component for master-standard modals
 */
export function AppModalFooter({
  onCancel,
  cancelText = "Cancel",
  onSubmit,
  submitText = "Save",
  submitIcon: SubmitIcon,
  submitting = false,
  submittingText = "Saving...",
  disabled = false,
  hintText = "* Required fields must be completed",
  children
}) {
  return (
    <div className="nexora-modal-footer">
      {hintText !== false && (
        <span className="nexora-modal-footer-hint d-none d-sm-inline">
          {hintText}
        </span>
      )}
      <div className="nexora-modal-footer-actions">
        {children ? (
          children
        ) : (
          <>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="nexora-modal-btn-cancel"
                disabled={submitting}
              >
                {cancelText}
              </button>
            )}
            {onSubmit && (
              <motion.button
                type={onSubmit === "submit" ? "submit" : "button"}
                whileHover={!disabled && !submitting ? { scale: 1.02 } : {}}
                whileTap={!disabled && !submitting ? { scale: 0.98 } : {}}
                onClick={typeof onSubmit === "function" ? onSubmit : undefined}
                disabled={disabled || submitting}
                className="nexora-modal-btn-primary"
              >
                {submitting ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    />
                    <span>{submittingText}</span>
                  </>
                ) : (
                  <>
                    {SubmitIcon && <SubmitIcon size={18} />}
                    <span>{submitText}</span>
                  </>
                )}
              </motion.button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Master Design System Modal Component
 */
export default function AppModal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon = Sparkles,
  iconElement,
  badge,
  children,
  size = "lg", // 'sm' | 'md' | 'lg' | 'xl'
  maxWidth,
  onCancel,
  cancelText = "Cancel",
  onSubmit,
  submitText = "Save",
  submitIcon,
  submitting = false,
  submittingText = "Saving...",
  submitDisabled = false,
  hintText = "* Required fields must be completed",
  footer,
  error,
  closeOnOverlay = true
}) {
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e) => {
      if (e.key === "Escape" && onClose) onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="nexora-modal-backdrop"
          onClick={(e) => {
            if (closeOnOverlay && e.target === e.currentTarget && onClose) {
              onClose();
            }
          }}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 20, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`nexora-modal-container size-${size}`}
            style={maxWidth ? { maxWidth } : {}}
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            {title && (
              <AppModalHeader
                title={title}
                subtitle={subtitle}
                icon={icon}
                iconElement={iconElement}
                badge={badge}
                onClose={onClose}
              />
            )}

            {/* Body */}
            <AppModalBody>
              {error && (
                <div className="alert alert-danger d-flex align-items-center gap-2 mb-4 rounded-3 py-2 px-3 small">
                  <AlertCircle size={16} className="flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              {children}
            </AppModalBody>

            {/* Footer */}
            {footer !== null && (
              footer || (
                <AppModalFooter
                  onCancel={onCancel || onClose}
                  cancelText={cancelText}
                  onSubmit={onSubmit}
                  submitText={submitText}
                  submitIcon={submitIcon}
                  submitting={submitting}
                  submittingText={submittingText}
                  disabled={submitDisabled}
                  hintText={hintText}
                />
              )
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
