import express from 'express';
import { getLots, createLot, updateStatus } from '../controllers/parkingController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getLots);
router.post('/', createLot);
router.put('/:id', updateStatus);

export default router;
