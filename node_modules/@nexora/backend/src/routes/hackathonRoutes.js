import express from 'express';
import { getHackathons, generateHackathonBox, joinHackathon, formTeams } from '../controllers/hackathonController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getHackathons);
router.post('/generate', generateHackathonBox);
router.post('/:id/join', joinHackathon);
router.post('/:id/form-teams', formTeams);

export default router;
