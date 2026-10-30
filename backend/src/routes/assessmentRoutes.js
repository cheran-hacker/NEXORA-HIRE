import express from 'express';
import { 
  getAssessments, 
  getAssessmentById, 
  submitAssessment,
  getMyAssessments,
  createAssessment,
  updateAssessment,
  deleteAssessment,
  startAssessment,
  getSubmissions
} from '../controllers/assessmentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public / Student listing, and authenticated assessment creation
router.route('/')
  .get(getAssessments)
  .post(protect, authorize('Placement', 'Admin', 'Recruiter'), createAssessment);

router.route('/my-assessments')
  .get(protect, getMyAssessments);

router.route('/:id')
  .get(getAssessmentById)
  .put(protect, authorize('Placement', 'Admin', 'Recruiter'), updateAssessment)
  .delete(protect, authorize('Placement', 'Admin', 'Recruiter'), deleteAssessment);

router.route('/:id/submit')
  .post(protect, submitAssessment);

router.route('/:id/start')
  .post(protect, startAssessment);

router.route('/:id/submissions')
  .get(protect, authorize('Placement', 'Admin', 'Recruiter'), getSubmissions);

export default router;
