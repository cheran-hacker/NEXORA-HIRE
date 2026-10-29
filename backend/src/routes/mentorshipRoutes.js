import express from 'express';
import {
  getMentorshipOverview,
  getMentors,
  getRecommendedMentors,
  getMentorAvailability,
  getMyAvailability,
  updateMyAvailability,
  createMentorshipRequest,
  getMentorshipRequests,
  acceptMentorshipRequest,
  rejectMentorshipRequest,
  cancelMentorshipRequest,
  getSessions,
  getSessionById,
  updateSessionStatus,
  rescheduleSession,
  updateSessionNotes,
  addActionItem,
  updateActionItem,
  submitFeedback
} from '../controllers/mentorshipController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// ─── OVERVIEW METRICS ────────────────────────────────────────────────────────
router.get('/overview', protect, getMentorshipOverview);

// ─── DISCOVERY & MATCHING ───────────────────────────────────────────────────
router.get('/mentors', protect, getMentors);
router.get('/alumni', protect, getMentors); // alias
router.get('/recommended', protect, getRecommendedMentors);

// ─── AVAILABILITY ────────────────────────────────────────────────────────────
router.get('/availability/:alumniId', protect, getMentorAvailability);
router.get('/my-availability', protect, authorize('Alumni', 'Admin'), getMyAvailability);
router.put('/my-availability', protect, authorize('Alumni', 'Admin'), updateMyAvailability);
router.post('/my-availability', protect, authorize('Alumni', 'Admin'), updateMyAvailability);

// ─── REQUESTS (STUDENT ↔ ALUMNI) ─────────────────────────────────────────────
router.post('/requests', protect, authorize('Student', 'Alumni', 'Admin'), createMentorshipRequest);
router.post('/book', protect, authorize('Student', 'Alumni', 'Admin'), createMentorshipRequest); // backward-compatible alias
router.get('/requests', protect, getMentorshipRequests);
router.patch('/requests/:id/accept', protect, authorize('Alumni', 'Admin'), acceptMentorshipRequest);
router.put('/requests/:id/accept', protect, authorize('Alumni', 'Admin'), acceptMentorshipRequest);
router.patch('/requests/:id/reject', protect, authorize('Alumni', 'Admin'), rejectMentorshipRequest);
router.put('/requests/:id/reject', protect, authorize('Alumni', 'Admin'), rejectMentorshipRequest);
router.patch('/requests/:id/cancel', protect, cancelMentorshipRequest);
router.delete('/requests/:id', protect, cancelMentorshipRequest);

// ─── 1-ON-1 SESSIONS ─────────────────────────────────────────────────────────
router.get('/sessions', protect, getSessions);
router.get('/my-sessions', protect, getSessions); // alias
router.get('/sessions/:id', protect, getSessionById);
router.patch('/sessions/:id/status', protect, updateSessionStatus);
router.put('/sessions/:id/status', protect, updateSessionStatus);
router.patch('/sessions/:id/reschedule', protect, rescheduleSession);
router.put('/sessions/:id/reschedule', protect, rescheduleSession);
router.post('/sessions/:id/reschedule', protect, rescheduleSession);
router.patch('/sessions/:id/confirm', protect, authorize('Alumni', 'Admin'), acceptMentorshipRequest); // legacy compatibility
router.patch('/sessions/:id/notes', protect, updateSessionNotes);
router.put('/sessions/:id/notes', protect, updateSessionNotes);
router.post('/sessions/:id/action-items', protect, addActionItem);
router.patch('/sessions/:id/action-items/:itemId', protect, updateActionItem);
router.post('/sessions/:id/feedback', protect, submitFeedback);
router.patch('/sessions/:id/feedback', protect, submitFeedback);

export default router;
