import express from 'express';
import { getMyReviews, submitReview } from '../controllers/reviewController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getMyReviews);
router.post('/', submitReview);

export default router;
