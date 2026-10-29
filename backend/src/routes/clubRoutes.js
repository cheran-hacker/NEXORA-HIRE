import express from 'express';
import { getClubs, createClub, joinClub, getMyClubs, approveMember } from '../controllers/clubController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getClubs);
router.post('/', protect, authorize('Student', 'Placement', 'Admin'), createClub);
router.post('/:id/join', protect, authorize('Student', 'Placement'), joinClub);
router.get('/my-clubs', protect, getMyClubs);
router.post('/:id/approve', protect, approveMember);

export default router;
