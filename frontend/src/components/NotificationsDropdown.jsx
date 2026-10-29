import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Check,
  Info,
  AlertCircle,
  CheckCircle2,
  MessageSquare,
  X,
} from "lucide-react";
import axios from "axios";
import io from "socket.io-client";
import { notificationService } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
const SOCKET_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace("/api", "")
  : "http:http://localhost:5000";
const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnectionAttempts: 3,
  reconnectionDelay: 2000,
  timeout: 5000,
});
const NotificationsDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();
  const userId = user?.id || user?._id;
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await notificationService.getNotifications();
        const liveData = res.data.data || [];
        setNotifications(liveData);
        setUnreadCount(liveData.filter((n) => !n.read).length);
      } catch (error) {
        console.error("Failed to fetch notifications");
      }
    };
    fetchNotifications(); // 2. Try to connect socket — gracefully, won't spam if backend is offline
    try {
      if (userId) {
        socket.connect();
        socket.emit("join_user_room", userId);
      }
      const handleNewNotification = (notif) => {
        setNotifications((prev) => [notif, ...prev]);
        setUnreadCount((prev) => prev + 1);
      };
      socket.on("new_notification", handleNewNotification);
      return () => {
        socket.off("new_notification", handleNewNotification);
        socket.disconnect();
      };
    } catch (e) {
      console.warn("Backend notification socket unavailable.");
    }
  }, [userId]);
  const handleMarkAsRead = async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n)),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    try {
      await notificationService.markAsRead(id);
    } catch (err) {}
  };
  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    try {
      await notificationService.markAllAsRead();
    } catch (err) {}
  };
  const getIcon = (type) => {
    switch (type) {
      case "SUCCESS":
        return <CheckCircle2 size={16} className="text-success" />;
      case "WARNING":
        return <AlertCircle size={16} className="text-warning" />;
      case "ERROR":
        return <AlertCircle size={16} className="text-danger" />;
      case "MESSAGE":
        return <MessageSquare size={16} className="text-primary" />;
      default:
        return <Info size={16} className="text-info" />;
    }
  };
  const timeAgo = (date) => {
    const min = Math.round((new Date() - new Date(date)) / 60000);
    if (min < 60) return `${min}m ago`;
    const hrs = Math.round(min / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.round(hrs / 24)}d ago`;
  };
  return (
    <div className="position-relative">
      {" "}
      <div style={{ cursor: "pointer" }} onClick={() => setIsOpen(!isOpen)}>
        {" "}
        <Bell size={20} style={{ color: "var(--text-secondary)" }} />{" "}
        {unreadCount > 0 && (
          <span
            className="position-absolute rounded-circle bg-danger d-flex align-items-center justify-content-center text-foreground"
            style={{
              width: 14,
              height: 14,
              top: -4,
              right: -4,
              border: "2px solid var(--surface)",
              fontSize: "9px",
              fontWeight: "bold",
            }}
          >
            {" "}
            {unreadCount > 9 ? "9+" : unreadCount}{" "}
          </span>
        )}{" "}
      </div>{" "}
      <AnimatePresence>
        {" "}
        {isOpen && (
          <>
            {" "}
            <div
              className="position-fixed top-0 start-0 w-100 h-100"
              style={{ inset: 0, zIndex: 90 }}
              onClick={() => setIsOpen(false)}
            />{" "}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="position-absolute shadow-xl rounded-4"
              style={{
                top: "150%",
                right: 0,
                width: 340,
                background: "var(--surface)",
                border: "1px solid var(--border)",
                zIndex: 100,
                overflow: "hidden",
              }}
            >
              {" "}
              <div
                className="d-flex align-items-center justify-content-between p-3 border-bottom"
                style={{
                  borderColor: "var(--border) !important",
                  background: "var(--bg-secondary)",
                }}
              >
                {" "}
                <h6
                  className="mb-0 fw-bold d-flex align-items-center gap-2"
                  style={{ color: "var(--text)" }}
                >
                  {" "}
                  Notifications{" "}
                  {unreadCount > 0 && (
                    <span className="badge bg-primary rounded-pill">
                      {unreadCount} New
                    </span>
                  )}{" "}
                </h6>{" "}
                <div className="d-flex gap-2">
                  {" "}
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="btn btn-link p-0 text-decoration-none"
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        color: "var(--primary)",
                      }}
                    >
                      {" "}
                      Mark all read{" "}
                    </button>
                  )}{" "}
                </div>{" "}
              </div>{" "}
              <div
                style={{ maxHeight: 400, overflowY: "auto" }}
                className="p-2"
              >
                {" "}
                {notifications.length === 0 ? (
                  <div className="text-center p-4 text-muted">
                    {" "}
                    <Bell size={32} className="mb-2 opacity-50" />{" "}
                    <p className="mb-0 small fw-semibold">
                      No notifications yet
                    </p>{" "}
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      className="d-flex gap-3 p-2 rounded-3 hover-bg mb-1 position-relative"
                      style={{ transition: "background 0.2s" }}
                    >
                      {" "}
                      <div className="mt-1 flex-shrink-0">
                        {getIcon(n.type)}
                      </div>{" "}
                      <div className="flex-grow-1" style={{ minWidth: 0 }}>
                        {" "}
                        <div className="d-flex justify-content-between align-items-start mb-1">
                          {" "}
                          <span
                            className={`fw-semibold d-block text-truncate ${!n.read ? "text-text" : "text-muted"}`}
                            style={{
                              fontSize: "0.85rem",
                              color: !n.read
                                ? "var(--text)"
                                : "var(--text-secondary)",
                            }}
                          >
                            {" "}
                            {n.title}{" "}
                          </span>{" "}
                        </div>{" "}
                        <p
                          className="mb-1 text-muted lh-sm"
                          style={{ fontSize: "0.78rem" }}
                        >
                          {n.message}
                        </p>{" "}
                        <span
                          className="text-muted"
                          style={{ fontSize: "0.7rem" }}
                        >
                          {timeAgo(n.createdAt)}
                        </span>{" "}
                      </div>{" "}
                      {!n.read && (
                        <button
                          className="btn btn-link p-0 position-absolute text-muted hover-primary"
                          style={{ top: "10px", right: "10px" }}
                          onClick={() => handleMarkAsRead(n._id)}
                        >
                          {" "}
                          <Check size={14} />{" "}
                        </button>
                      )}{" "}
                    </div>
                  ))
                )}{" "}
              </div>{" "}
              <div
                className="p-2 border-top text-center"
                style={{
                  borderColor: "var(--border) !important",
                  background: "var(--bg-secondary)",
                }}
              >
                {" "}
                <button
                  onClick={() => (window.location.href = "/notifications")}
                  className="btn btn-link w-100 p-1 text-decoration-none fw-semibold"
                  style={{ fontSize: "0.8rem", color: "var(--text)" }}
                >
                  {" "}
                  View All Notifications{" "}
                </button>{" "}
              </div>{" "}
            </motion.div>{" "}
          </>
        )}{" "}
      </AnimatePresence>{" "}
    </div>
  );
};
export default NotificationsDropdown;
