import express from 'express';
import { getReels, createReel, toggleLike } from '../controllers/reelController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getReels);
router.post('/', createReel);
router.post('/:id/like', toggleLike);

export default router;
