import express from 'express';
import { getListings, createListing, markListingSold } from '../controllers/listingController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getListings);
router.post('/', createListing);
router.put('/:id/sold', markListingSold);

export default router;
