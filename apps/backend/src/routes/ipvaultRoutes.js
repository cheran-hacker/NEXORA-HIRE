import express from 'express';
import { getMyIPs, secureIP } from '../controllers/ipvaultController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getMyIPs);
router.post('/', secureIP);

export default router;
