import express from 'express';
import { getStreams, scheduleStream, voteHire } from '../controllers/colosseumController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getStreams);
router.post('/', scheduleStream);
router.post('/:id/vote', voteHire);

export default router;
