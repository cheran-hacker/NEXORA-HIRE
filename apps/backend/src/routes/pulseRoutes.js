import express from 'express';
import { getPulseMap, checkInPulse } from '../controllers/pulseController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getPulseMap);
router.post('/checkin', checkInPulse);

export default router;
