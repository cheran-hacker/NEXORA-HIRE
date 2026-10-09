import express from 'express';
import { createOrUpdateProfile, getMyProfile, getMatches } from '../controllers/synergyController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/', authorize('Student'), createOrUpdateProfile);
router.get('/me', authorize('Student'), getMyProfile);
router.get('/matches', authorize('Student'), getMatches);

export default router;
