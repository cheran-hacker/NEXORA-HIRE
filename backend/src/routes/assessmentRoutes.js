import express from 'express';
import { 
  getAssessments, 
  getAssessmentById, 
  submitAssessment,
  getMyAssessments,
  createAssessment,
  updateAssessment,
  deleteAssessment,
  startAssessment
} from '../controllers/assessmentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public / Student facing (requires auth eventually, but currently just uses standard get)
router.route('/')
  .get(getAssessments)
  .post(protect, authorize('Placement', 'Admin', 'Placement'), createAssessment);

router.route('/my-assessments')
  .get(protect, getMyAssessments);

router.route('/:id')
  .get(getAssessmentById)
  .put(protect, authorize('Placement', 'Admin', 'Placement'), updateAssessment)
  .delete(protect, authorize('Placement', 'Admin', 'Placement'), deleteAssessment);

router.route('/:id/submit')
  .post(protect, submitAssessment);

router.route('/:id/start')
  .post(protect, startAssessment);


export default router;
