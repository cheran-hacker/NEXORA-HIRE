import express from 'express';
import {
  createJob,
  getAllJobs,
  getJobById,
  applyToJob,
  updateApplicationStatus,
  getMyApplications
} from './recruitment.controller.js';
import { protect, authorize } from '../../middleware/auth.js';
import { ROLES } from '../../../../../packages/shared-constants/index.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getAllJobs)
  .post(authorize(ROLES.RECRUITER, ROLES.ADMIN), createJob);

router.get('/my-applications', authorize(ROLES.STUDENT), getMyApplications);

router.route('/:id')
  .get(getJobById);

router.post('/:id/apply', authorize(ROLES.STUDENT), applyToJob);
router.patch('/:id/applications/:appId/status', authorize(ROLES.RECRUITER, ROLES.ADMIN), updateApplicationStatus);

export default router;
