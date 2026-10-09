import express from 'express';
import {
  createAssessment,
  getAllAssessments,
  getAssessmentById,
  startAssessment,
  submitAssessment,
  getSubmissionsByAssessment
} from './assessment.controller.js';
import { protect, authorize } from '../../middleware/auth.js';
import { ROLES } from '../../../../../packages/shared-constants/index.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(authorize(ROLES.ADMIN, ROLES.ALUMNI, ROLES.PLACEMENT_OFFICER), getAllAssessments)
  .post(authorize(ROLES.ADMIN, ROLES.PLACEMENT_OFFICER), createAssessment);

router.get('/:id', getAssessmentById);
router.post('/:id/start', authorize(ROLES.STUDENT), startAssessment);
router.post('/:id/submit', authorize(ROLES.STUDENT), submitAssessment);
router.get('/:id/submissions', authorize(ROLES.ADMIN, ROLES.PLACEMENT_OFFICER), getSubmissionsByAssessment);

export default router;
