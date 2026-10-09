import express from 'express';
import { submitContactMessage } from '../controllers/contactController.js';

const router = express.Router();

// Public route (no protect middleware needed for contact us)
router.post('/', submitContactMessage);

export default router;
