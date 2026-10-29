import express from 'express';
import { getActiveAuctions, placeBid, getMyBids, getBidsForRoom } from '../controllers/auctionController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('Student')); // Only students can bid on rooms

router.get('/', getActiveAuctions);
router.get('/:roomId/bids', getBidsForRoom);
router.post('/bid', placeBid);
router.get('/my-bids', getMyBids);

export default router;
