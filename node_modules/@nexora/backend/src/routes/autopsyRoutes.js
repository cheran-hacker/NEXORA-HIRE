import express from 'express';
import { getAutopsies, createAutopsy, upvoteAutopsy } from '../controllers/autopsyController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getAutopsies);
router.post('/', createAutopsy);
router.put('/:id/upvote', upvoteAutopsy);

export default router;
