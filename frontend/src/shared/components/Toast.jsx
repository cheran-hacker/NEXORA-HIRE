import React, { useEffect, useState } from "react";
import { CheckCircle, AlertTriangle, Info, XCircle, X } from "lucide-react";
const icons = {
  success: <CheckCircle className="text-[#10b981]" size={20} />,
  error: <XCircle className="text-danger" size={20} />,
  warning: <AlertTriangle className="text-warning" size={20} />,
  info: <Info className="text-primary" size={20} />,
};
const ToastItem = ({ toast, removeToast }) => {
  const [progress, setProgress] = useState(100);
  const { id, message, type, duration } = toast;
  useEffect(() => {
    let interval;
    if (duration) {
      const step = 100 / (duration / 50);
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev <= 0) {
            clearInterval(interval);
            return 0;
          }
          return prev - step;
        });
      }, 50);
      const timeout = setTimeout(() => {
        removeToast(id);
      }, duration);
      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [id, duration, removeToast]);
  return (
    <div className="toast-item glass-card overflow-hidden pe-auto d-flex flex-column mb-3 position-relative min-w-[300px] shadow-lg rounded-4 border border-[rgba(0,0,0,0.05)]">
      {" "}
      <div className="flex align-items-start gap-3 p-4 bg-[#0d1323]">
        {" "}
        <div className="mt-0.5 flex-shrink-0">{icons[type]}</div>{" "}
        <div className="flex-grow-1 small fw-medium text-light">{message}</div>{" "}
        <button
          onClick={() => removeToast(id)}
          className="text-muted hover:text-foreground transition-fast"
        >
          {" "}
          <X size={16} />{" "}
        </button>{" "}
      </div>{" "}
      {/* Progress Bar */}{" "}
      {duration && (
        <div className="h-1 bg-[rgba(0,0,0,0.05)] w-100">
          {" "}
          <div
            className={`h-100 transition-fast ${type === "success" ? "bg-[#10b981]" : type === "error" ? "bg-danger" : type === "warning" ? "bg-warning" : "bg-primary"}`}
            style={{ width: `${progress}%` }}
          />{" "}
        </div>
      )}{" "}
    </div>
  );
};
export default function ToastContainer({ toasts, removeToast }) {
  if (toasts.length === 0) return null;
  return (
    <div className="position-fixed bottom-6 right-6 z-[9999] d-flex flex-column align-items-end pe-none">
      {" "}
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} removeToast={removeToast} />
      ))}{" "}
    </div>
  );
}
