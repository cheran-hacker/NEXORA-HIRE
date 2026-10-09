import express from 'express';
import { createOffer, getMyOffers, updateOfferStatus } from '../controllers/offerController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, authorize('Placement', 'Admin'), createOffer);
router.get('/my-offers', protect, getMyOffers); // Student or Recruiter
router.patch('/:id/status', protect, authorize('Student'), updateOfferStatus);

export default router;
