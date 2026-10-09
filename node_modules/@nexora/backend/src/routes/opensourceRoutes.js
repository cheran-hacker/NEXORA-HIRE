import express from 'express';
import { getLeaderboard, syncGithub } from '../controllers/opensourceController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/leaderboard', getLeaderboard);
router.post('/sync', syncGithub);

export default router;
