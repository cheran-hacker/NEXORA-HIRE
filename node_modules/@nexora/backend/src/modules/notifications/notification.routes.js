import express from 'express';
import { getUserNotifications, markAsRead, markAllAsRead } from './notification.service.js';
import { protect } from '../../core/middlewares/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const data = await getUserNotifications(req.user._id, Number(page), Number(limit));
    res.status(200).json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/read', async (req, res, next) => {
  try {
    const notification = await markAsRead(req.params.id, req.user._id);
    res.status(200).json({ status: 'success', data: notification });
  } catch (error) {
    next(error);
  }
});

router.patch('/mark-all-read', async (req, res, next) => {
  try {
    await markAllAsRead(req.user._id);
    res.status(200).json({ status: 'success', message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
});

export default router;
