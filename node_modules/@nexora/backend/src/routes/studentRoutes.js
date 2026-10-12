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
  disconnectAlumni
} from '../controllers/studentController.js';
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

export default router;
