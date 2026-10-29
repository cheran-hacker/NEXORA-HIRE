import express from 'express';
import { getPapers, swipePaper } from '../controllers/researchmatchController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getPapers);
router.post('/:id/swipe', swipePaper);

export default router;
