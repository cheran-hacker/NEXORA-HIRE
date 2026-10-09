import express from 'express';
import { getScholarships, autoApply } from '../controllers/scholarshipController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getScholarships);
router.post('/:id/apply', autoApply);

export default router;
