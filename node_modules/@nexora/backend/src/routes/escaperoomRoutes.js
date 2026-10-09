import express from 'express';
import { getTasks, verifyAnswer } from '../controllers/escaperoomController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/tasks', getTasks);
router.post('/verify', verifyAnswer);

export default router;
