import express from 'express';
import { 
  getPlacementStats, 
  getAnalyticsReports, 
  getPlacementStudents,
  getPlacementStudentById,
  getStudentResume,
  getPlacementCompanies,
  createPlacementPartner,
  updatePlacementPartner,
  getPlacementPartnerById,
  getRecruitmentPipeline,
  getStudentProjects,
  evaluateProject,
  getCareerGuidance,
  scheduleGuidanceMentorship,
  updateGuidanceDiscussionStatus,
  getPlacementTracking,
  getPlacementApplicationById,
  updateApplicationStatus
} from '../controllers/placementController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all placement routes
router.use(protect);
router.use(authorize('Placement', 'Admin'));

router.get('/stats', getPlacementStats);
router.get('/pipeline', getRecruitmentPipeline);
router.get('/reports', getAnalyticsReports);

router.get('/students', getPlacementStudents);
router.get('/students/:id', getPlacementStudentById);
router.get('/students/:id/resume', getStudentResume);

// Partner Companies
router.get('/companies', getPlacementCompanies);
router.post('/companies', createPlacementPartner);
router.get('/companies/:id', getPlacementPartnerById);
router.put('/companies/:id', updatePlacementPartner);

router.get('/projects', getStudentProjects);
router.put('/projects/:id/evaluate', evaluateProject);

router.get('/guidance', getCareerGuidance);
router.post('/guidance/schedule-mentorship', scheduleGuidanceMentorship);
router.put('/guidance/discussions/:id', updateGuidanceDiscussionStatus);

// Placement Tracking & Applications
router.get('/tracking', getPlacementTracking);
router.get('/applications/:id', getPlacementApplicationById);
router.put('/applications/:id/status', updateApplicationStatus);

export default router;
