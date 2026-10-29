import express from 'express';
import { getInternships, getInternshipById, createInternship } from '../controllers/internshipController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/').get(getInternships).post(protect, authorize('Placement', 'Admin'), createInternship);
router.route('/:id').get(getInternshipById);

export default router;
