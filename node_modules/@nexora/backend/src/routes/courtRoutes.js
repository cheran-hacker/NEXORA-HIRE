import express from 'express';
import { getAppeals, createAppeal, voteOnAppeal } from '../controllers/courtController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getAppeals);
router.post('/', createAppeal);
router.post('/:id/vote', voteOnAppeal);

export default router;
