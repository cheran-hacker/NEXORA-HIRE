import express from 'express';
import { getMyNotifications, markAsRead, markAllAsRead } from '../controllers/notificationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All notification routes require auth

router.route('/').get(getMyNotifications);
router.route('/mark-all-read').patch(markAllAsRead);
router.route('/:id/read').patch(markAsRead);

export default router;
