import { useToast } from "../context/ToastContext";
import React from "react";
import { Bell, CheckCircle, Info, AlertCircle } from "lucide-react";
export default function NotificationWidget({ notifications }) {
  const { addToast } = useToast();
  if (!notifications || notifications.length === 0) {
    return (
      <div
        className="position-absolute end-0 rounded-4 shadow-sm rounded-4 shadow-lg overflow-hidden z-3 p-4 text-center"
        style={{
          top: "3.5rem",
          width: "320px",
          border: "1px solid rgba(0,0,0,0.05)",
        }}
      >
        {" "}
        <Bell size={24} className="text-muted mx-auto mb-2" />{" "}
        <p className="text-muted small m-0">
          You have no new notifications.
        </p>{" "}
      </div>
    );
  }
  return (
    <div
      className="position-absolute end-0 rounded-4 shadow-lg overflow-hidden z-3"
      style={{
        top: "3.5rem",
        width: "320px",
        border: "1px solid var(--border)",
      }}
    >
      {" "}
      <div
        className="d-flex align-items-center justify-content-between px-3 py-2 border-bottom"
        style={{
          borderColor: "rgba(0,0,0,0.05)",
          background: "rgba(0,0,0,0.05)",
        }}
      >
        {" "}
        <h6 className="text-foreground fw-bold m-0 small">Notifications</h6>{" "}
        <button
          onClick={() => addToast("Marking all as read...", "info")}
          className="btn btn-link p-0 text-decoration-none small"
          style={{ color: "var(--primary)", fontSize: "0.75rem" }}
        >
          Mark all as read
        </button>{" "}
      </div>{" "}
      <div className="overflow-y-auto" style={{ maxHeight: "320px" }}>
        {" "}
        {notifications.map((notif, idx) => (
          <div
            key={idx}
            className="d-flex gap-3 px-3 py-2 border-bottom cursor-pointer transition-fast"
            style={{ borderColor: "rgba(0,0,0,0.05)" }}
            onMouseOver={(e) =>
              (e.currentTarget.style.background = "rgba(0,0,0,0.05)")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            {" "}
            <div className="mt-1">
              {" "}
              {notif.type === "success" && (
                <CheckCircle size={16} className="text-success" />
              )}{" "}
              {notif.type === "info" && (
                <Info size={16} className="text-primary" />
              )}{" "}
              {notif.type === "alert" && (
                <AlertCircle size={16} className="text-danger" />
              )}{" "}
            </div>{" "}
            <div>
              {" "}
              <p className="small text-foreground m-0" style={{ lineHeight: "1.2" }}>
                {notif.message}
              </p>{" "}
              <span
                className="text-muted mt-1 d-block"
                style={{ fontSize: "0.65rem" }}
              >
                {notif.time}
              </span>{" "}
            </div>{" "}
          </div>
        ))}{" "}
      </div>{" "}
      <div
        className="p-2 text-center"
        style={{ background: "rgba(0,0,0,0.05)" }}
      >
        {" "}
        <button
          onClick={() => (window.location.href = "/notifications")}
          className="btn btn-link p-0 text-decoration-none small text-muted hover-text-foreground transition-fast"
        >
          View all
        </button>{" "}
      </div>{" "}
    </div>
  );
}
