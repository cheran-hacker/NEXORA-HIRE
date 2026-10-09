import express from 'express';
import { getFoundItems, createFoundItem, claimItem } from '../controllers/lostfoundController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getFoundItems);
router.post('/', createFoundItem);
router.put('/:id/claim', claimItem);

export default router;
