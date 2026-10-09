import express from 'express';
import { getProposals, createProposal, stakeOnProposal, claimTicket } from '../controllers/daoController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/proposals', getProposals);
router.post('/proposals', createProposal);
router.post('/proposals/:id/stake', stakeOnProposal);
router.post('/proposals/:id/claim', claimTicket);

export default router;
