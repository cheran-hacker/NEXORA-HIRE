import express from 'express';
import { getMentors, offerMentoring, bookMentoring } from '../controllers/reversementoringController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getMentors);
router.post('/', offerMentoring);
router.post('/:sessionId/book', bookMentoring);

export default router;
