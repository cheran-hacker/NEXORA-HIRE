import express from 'express';
import { getMyBadges, issueBadge } from '../controllers/badgeController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getMyBadges);
router.post('/', issueBadge);

export default router;
