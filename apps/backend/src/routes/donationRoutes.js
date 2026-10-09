import express from 'express';
import { createDonation, getMyDonations, getAllDonations } from '../controllers/donationController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, authorize('Alumni'), createDonation);
router.get('/my-donations', protect, authorize('Alumni'), getMyDonations);
router.get('/', protect, authorize('Admin'), getAllDonations);

export default router;
