import express from 'express';
import { getSessions, createSession, submitRating } from '../controllers/hotseatController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getSessions);
router.post('/', createSession);
router.post('/:id/rate', submitRating);

export default router;
