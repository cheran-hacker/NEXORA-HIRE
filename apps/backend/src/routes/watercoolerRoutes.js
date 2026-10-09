import express from 'express';
import { getActiveSessions, startListening, joinSession } from '../controllers/watercoolerController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getActiveSessions);
router.post('/start', startListening);
router.post('/:id/join', joinSession);

export default router;
