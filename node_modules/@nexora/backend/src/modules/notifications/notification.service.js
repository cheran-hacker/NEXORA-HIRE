import Notification from './notification.model.js';

/**
 * Create and persist a notification for a user.
 */
export const createNotification = async ({ recipient, sender, type, title, message, link, metadata }) => {
  const notification = await Notification.create({
    recipient,
    sender,
    type,
    title,
    message,
    link,
    metadata
  });
  return notification;
};

/**
 * Get all notifications for a user, paginated.
 */
export const getUserNotifications = async (userId, page = 1, limit = 20) => {
  const [notifications, unreadCount] = await Promise.all([
    Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('sender', 'name avatar')
      .lean(),
    Notification.countDocuments({ recipient: userId, isRead: false })
  ]);

  return { notifications, unreadCount };
};

/**
 * Mark a single notification as read.
 */
export const markAsRead = async (notificationId, userId) => {
  return Notification.findOneAndUpdate(
    { _id: notificationId, recipient: userId },
    { isRead: true },
    { new: true }
  );
};

/**
 * Mark ALL notifications as read for a user.
 */
export const markAllAsRead = async (userId) => {
  return Notification.updateMany(
    { recipient: userId, isRead: false },
    { isRead: true }
  );
};
