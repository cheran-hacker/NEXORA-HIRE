import express from 'express';
import { getSlots, addSlot, bookSlot } from '../controllers/consultingController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getSlots);
router.post('/', addSlot);
router.post('/:id/book', bookSlot);

export default router;
