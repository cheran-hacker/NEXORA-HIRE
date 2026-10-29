import express from 'express';
import { getListings, createListing, proposeTrade, updateEscrow } from '../controllers/textbookController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getListings);
router.post('/', createListing);
router.post('/:id/trade', proposeTrade);
router.put('/:id/escrow', updateEscrow);

export default router;
