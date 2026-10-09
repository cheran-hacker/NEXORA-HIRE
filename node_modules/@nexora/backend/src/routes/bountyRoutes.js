import express from 'express';
import { createBounty, getOpenBounties, getMyBounties, submitSolution, awardBounty } from '../controllers/bountyController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/', authorize('Alumni', 'Placement', 'Admin'), createBounty);
router.get('/open', getOpenBounties);
router.get('/my-bounties', authorize('Alumni', 'Placement', 'Admin'), getMyBounties);
router.post('/:id/submit', authorize('Student'), submitSolution);
router.put('/:id/award', authorize('Alumni', 'Placement', 'Admin'), awardBounty);

export default router;
