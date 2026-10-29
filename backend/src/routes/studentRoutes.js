import express from 'express';
import multer from 'multer';
import { 
  submitFeedback,
  getStudentStats,
  getMatchedAlumniNetwork,
  getPublicProfile,
  getCareerDigitalTwin,
  uploadStudentResume,
  serveResumeFile,
  getResumeAnalysis,
  analyzeResumeForProfile,
  applyResumeProfile,
  toggleSavedJob,
  requestConnection,
  disconnectAlumni,
  getCareerTarget,
  getCareerTargetHistory,
  updateCareerTarget,
  submitValidationRequest,
  getStudentValidations
} from '../controllers/studentController.js';
import {
  getStudentRoadmaps,
  getRoadmapById,
  createRoadmap,
  updateMilestoneStatus,
  addRoadmapNote,
  deleteRoadmap
} from '../controllers/roadmapController.js';
import { protect, authorize } from '../middleware/auth.js';
import { cacheMiddleware } from '../utils/cache.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed!'), false);
    }
  }
});

const router = express.Router();

// Public route for Smart Resume
router.get('/public/:id', getPublicProfile);

// Public routes for viewing uploaded resume documents (in new tab or iframe)
router.get('/resume/file/:filename', serveResumeFile);
router.get('/resume/file', serveResumeFile);

// Apply auth middleware to all student routes
router.use(protect);
router.use(authorize('Student', 'Admin'));

router.get('/stats', getStudentStats);

// Career Target Persistence routes
router.get('/career-target', getCareerTarget);
router.get('/career-target/history', getCareerTargetHistory);
router.put('/career-target', updateCareerTarget);

// Career Roadmap Persistence routes
router.get('/roadmaps', getStudentRoadmaps);
router.get('/roadmaps/:id', getRoadmapById);
router.post('/roadmaps', createRoadmap);
router.patch('/roadmaps/:id/milestone', updateMilestoneStatus);
router.post('/roadmaps/:id/notes', addRoadmapNote);
router.delete('/roadmaps/:id', deleteRoadmap);

// Alumni Network Matching (dynamic connection statuses)
router.get('/matched-alumni', getMatchedAlumniNetwork);
router.post('/connect-alumni', requestConnection);
router.post('/disconnect-alumni', disconnectAlumni);

// Career Digital Twin
router.get('/digital-twin', cacheMiddleware(300), getCareerDigitalTwin);

// Feedback route
router.post('/feedback', submitFeedback);

// Saved Jobs
router.post('/saved-jobs/:id', toggleSavedJob);

// Resume Intelligence routes
router.post('/resume/upload', upload.single('resume'), uploadStudentResume);
router.get('/resume/analysis', getResumeAnalysis);

// Resume → Profile auto-fill routes (2-step: analyze then apply)
router.post('/resume/analyze', upload.single('resume'), analyzeResumeForProfile);
router.post('/resume/apply', applyResumeProfile);

// Evidence & Skill Validation routes
router.get('/validations', getStudentValidations);
router.post('/validations', submitValidationRequest);

export default router;
