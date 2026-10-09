import express from 'express';
import { getRecruiterStats, getCandidates } from '../controllers/recruiterController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all recruiter routes
router.use(protect);
router.use(authorize('Placement', 'Admin'));

router.get('/stats', getRecruiterStats);
router.get('/candidates', getCandidates);

export default router;
