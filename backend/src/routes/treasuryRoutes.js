import express from 'express';
import { getTreasury, createClub, requestExpense, getExpenses, approveExpense } from '../controllers/treasuryController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getTreasury);
router.post('/', createClub);
router.post('/:clubId/expenses', requestExpense);
router.get('/:clubId/expenses', getExpenses);
router.post('/expenses/:id/approve', approveExpense);

export default router;
