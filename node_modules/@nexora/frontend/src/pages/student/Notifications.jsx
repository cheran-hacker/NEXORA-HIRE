import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, CheckCircle, Info, AlertCircle, CheckCircle2 } from 'lucide-react';
import { notificationService } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await notificationService.getNotifications();
      if (res.data?.data) {
        setNotifications(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      fetchNotifications();
    } catch (err) {
      addToast('Failed to mark as read', 'danger');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      fetchNotifications();
      addToast('All marked as read', 'success');
    } catch (err) {
      addToast('Failed to mark all as read', 'danger');
    }
  };

  return (
    <div className="container-fluid p-4" style={{ background: 'var(--bg)', minHeight: '100dvh', color: 'var(--text)' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-black m-0 d-flex align-items-center gap-2">
          <Bell size={28} className="text-primary" /> Notifications
        </h2>
        {notifications.length > 0 && (
          <button 
            className="btn btn-outline-primary rounded-pill btn-sm fw-bold d-flex align-items-center gap-2"
            onClick={handleMarkAllAsRead}
          >
            <CheckCircle2 size={16} /> Mark all as read
          </button>
        )}
      </div>

      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <span className="spinner-border text-primary" />
        </div>
      ) : notifications.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 text-center rounded-4 border"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <Bell size={48} className="text-muted mx-auto mb-3 opacity-50" />
          <h5 className="fw-bold text-muted">All caught up!</h5>
          <p className="text-muted small">You have no new notifications.</p>
        </motion.div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {notifications.map((notif, idx) => (
            <motion.div 
              key={notif._id || idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-4 rounded-4 border d-flex gap-3 hover-glow"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <div className="mt-1 flex-shrink-0">
                {notif.type === 'success' && <CheckCircle size={24} className="text-success" />}
                {notif.type === 'info' && <Info size={24} className="text-primary" />}
                {notif.type === 'alert' && <AlertCircle size={24} className="text-danger" />}
                {!['success', 'info', 'alert'].includes(notif.type) && <Bell size={24} className="text-muted" />}
              </div>
              <div className="flex-grow-1">
                <p className="mb-1 text-foreground" style={{ fontSize: '1rem', lineHeight: '1.4' }}>
                  {notif.message}
                </p>
                <small className="text-muted fw-semibold">{notif.time || new Date(notif.createdAt).toLocaleString()}</small>
              </div>
              {!notif.read && (
                <button 
                  className="btn btn-sm btn-light rounded-circle p-2 flex-shrink-0 align-self-center hover-scale"
                  onClick={() => handleMarkAsRead(notif._id)}
                  title="Mark as read"
                >
                  <CheckCircle size={16} className="text-primary" />
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
