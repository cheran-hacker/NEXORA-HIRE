import express from 'express';
import { createOrder, verifyPayment } from '../controllers/paymentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All payments require authentication

router.post('/create-order', createOrder);
router.post('/verify', verifyPayment);

export default router;
