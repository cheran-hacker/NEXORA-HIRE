import express from 'express';
import { getTopics, createTopic, voteTopic } from '../controllers/syllabusController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getTopics);
router.post('/', authorize('Admin', 'Placement'), createTopic);
router.post('/:id/vote', authorize('Placement'), voteTopic);

export default router;
