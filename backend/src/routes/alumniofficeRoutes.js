import express from 'express';
import { getLiveRooms } from '../controllers/alumniofficeController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getLiveRooms);

export default router;
