import express from 'express';
import {
  getAlumni, bookSession, getMySessions, confirmSession, leaveFeedback
} from '../controllers/mentorshipController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/alumni', protect, getAlumni);
router.post('/book', protect, authorize('Student'), bookSession);
router.get('/sessions', protect, getMySessions);
router.patch('/sessions/:id/confirm', protect, authorize('Alumni'), confirmSession);
router.patch('/sessions/:id/feedback', protect, authorize('Student'), leaveFeedback);

export default router;
