import express from 'express';
import { 
  getPlacementStats, 
  getAnalyticsReports, 
  getPlacementStudents, 
  getPlacementCompanies,
  getRecruitmentPipeline,
  getStudentProjects,
  evaluateProject,
  getCareerGuidance,
  getPlacementTracking,
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
router.get('/companies', getPlacementCompanies);

router.get('/projects', getStudentProjects);
router.put('/projects/:id/evaluate', evaluateProject);

router.get('/guidance', getCareerGuidance);

router.get('/tracking', getPlacementTracking);
router.put('/applications/:id/status', updateApplicationStatus);

export default router;
