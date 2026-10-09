import express from 'express';
import { getMarketOverview, getMyPortfolio, investInStudent } from '../controllers/talentExchangeController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/market', getMarketOverview);
router.get('/portfolio', getMyPortfolio);
router.post('/invest', investInStudent);

export default router;
