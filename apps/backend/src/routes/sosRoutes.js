import express from 'express';
import { getActiveAlerts, triggerSOS, resolveAlert } from '../controllers/sosController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getActiveAlerts);
router.post('/', triggerSOS);
router.put('/:id/resolve', resolveAlert);

export default router;
