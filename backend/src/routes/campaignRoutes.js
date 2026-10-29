import express from 'express';
import { getCampaigns, createCampaign, donateToCampaign } from '../controllers/campaignController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getCampaigns);
router.post('/', authorize('Admin', 'Alumni'), createCampaign);
router.post('/:id/donate', donateToCampaign);

export default router;
