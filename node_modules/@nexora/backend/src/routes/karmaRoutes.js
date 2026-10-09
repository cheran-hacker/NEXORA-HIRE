import express from 'express';
import { getKarmaLeaderboard, logKarma } from '../controllers/karmaController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/leaderboard', getKarmaLeaderboard);
router.post('/log', logKarma);

export default router;
