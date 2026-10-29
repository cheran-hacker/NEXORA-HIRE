import express from 'express';
import { applyForJob, getMyApplications, getJobApplicants, updateApplicationStatus } from '../controllers/applicationController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Student routes
router.post('/apply', protect, authorize('Student'), applyForJob);
router.get('/my-applications', protect, authorize('Student'), getMyApplications);

// Recruiter routes
router.get('/job/:jobId', protect, authorize('Placement', 'Admin'), getJobApplicants);
router.put('/:id/status', protect, authorize('Placement', 'Admin'), updateApplicationStatus);

export default router;
