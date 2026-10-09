import express from 'express';
import { getJobs, getJob, createJob, updateJob, getMyJobs, getJobApplications, getMyApplications, updateApplicationStatus, applyJob, deleteJob, getMyInterviews, scheduleInterview, shareOpportunity, approveVacancy } from '../controllers/jobController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Publicly accessible but we can protect it if needed
router.get('/', protect, getJobs);
router.get('/my-jobs', protect, authorize('Placement', 'Admin'), getMyJobs);
router.get('/my-applications', protect, authorize('Student'), getMyApplications);
router.get('/interviews/all', protect, authorize('Placement', 'Admin'), getMyInterviews);
router.get('/:id', protect, getJob);

// Student only
router.post('/:id/apply', protect, authorize('Student'), applyJob);

// Alumni only
router.post('/share', protect, authorize('Alumni'), shareOpportunity);

// Recruiter/Admin only
router.post('/', protect, authorize('Placement', 'Admin'), createJob);
router.put('/:id', protect, authorize('Placement', 'Admin'), updateJob);
router.delete('/:id', protect, authorize('Placement', 'Admin'), deleteJob);
router.get('/:id/applications', protect, authorize('Placement', 'Admin'), getJobApplications);
router.patch('/:id/applications/:appId/status', protect, authorize('Placement', 'Admin'), updateApplicationStatus);
router.post('/:id/applications/:appId/interview', protect, authorize('Placement', 'Admin'), scheduleInterview);
router.put('/:id/approve', protect, authorize('Placement', 'Admin'), approveVacancy);

export default router;
