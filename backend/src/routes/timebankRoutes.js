import express from 'express';
import { getMyTimeBank, transactTime } from '../controllers/timebankController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/me', getMyTimeBank);
router.post('/transact', authorize('Student'), transactTime);

export default router;
