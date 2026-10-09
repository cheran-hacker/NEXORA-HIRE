import express from 'express';
import { getQuestions, askQuestion, answerQuestion } from '../controllers/consensusController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

router.get('/', getQuestions);
router.post('/', askQuestion);
router.post('/:id/answer', answerQuestion);

export default router;
