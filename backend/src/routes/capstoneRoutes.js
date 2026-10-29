import express from 'express';
import { getCapstones, investInCapstone, createCapstone, approveCapstone } from '../controllers/capstoneController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getCapstones);
router.post('/', createCapstone);
router.post('/:id/invest', investInCapstone);
router.put('/:id/approve', approveCapstone);

export default router;
