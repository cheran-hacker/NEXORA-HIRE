import express from 'express';
import { getProfiles, createProfile, swipeProfile } from '../controllers/roomieController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getProfiles);
router.post('/', createProfile);
router.post('/:id/swipe', swipeProfile);

export default router;
