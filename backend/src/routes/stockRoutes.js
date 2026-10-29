import express from 'express';
import { getMyPortfolio, getMarket, investInStudent } from '../controllers/stockController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/portfolio', getMyPortfolio);
router.get('/market', getMarket);
router.post('/:id/invest', authorize('Student', 'Alumni'), investInStudent);

export default router;
