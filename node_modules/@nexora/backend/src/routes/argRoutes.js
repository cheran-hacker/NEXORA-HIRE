import express from 'express';
import { getNodes, scanNode } from '../controllers/argController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/nodes', getNodes);
router.post('/scan', scanNode);

export default router;
