import express from 'express';
import { getJobsForStudent, getCandidatesForRecruiter, recordSwipe } from '../controllers/swipeController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/action', recordSwipe);
router.get('/jobs', authorize('Student'), getJobsForStudent);
router.get('/candidates', authorize('Placement', 'Placement'), getCandidatesForRecruiter);

export default router;
