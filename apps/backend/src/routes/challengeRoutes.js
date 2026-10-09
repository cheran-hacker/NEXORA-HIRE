import express from 'express';
import { getChallenges, submitChallenge } from '../controllers/challengeController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getChallenges);
router.post('/:id/submit', submitChallenge);

export default router;
