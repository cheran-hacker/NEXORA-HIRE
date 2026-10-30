import React from "react";
import AppModal, { AppModalHeader, AppModalBody, AppModalFooter } from "./AppModal";
import { Sparkles } from "lucide-react";

export { AppModalHeader, AppModalBody, AppModalFooter };

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon = Sparkles,
  children,
  actions,
  size = "lg",
  maxWidth,
  error
}) {
  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      icon={icon}
      size={size}
      maxWidth={maxWidth}
      error={error}
      footer={
        actions ? (
          <div className="nexora-modal-footer">
            <span className="nexora-modal-footer-hint d-none d-sm-inline">
              * Required fields must be completed
            </span>
            <div className="nexora-modal-footer-actions ms-auto">
              {actions}
            </div>
          </div>
        ) : null
      }
    >
      {children}
    </AppModal>
  );
}
