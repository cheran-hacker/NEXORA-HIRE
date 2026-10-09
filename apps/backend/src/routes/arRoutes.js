import express from 'express';
import { getNodes, createNode } from '../controllers/arController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/nodes', getNodes);
router.post('/nodes', authorize('Admin'), createNode);

export default router;
