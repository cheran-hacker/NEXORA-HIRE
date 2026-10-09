import express from 'express';
import { getMyKeys, generateKey, revokeKey } from '../controllers/developerController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getMyKeys);
router.post('/', generateKey);
router.delete('/:id', revokeKey);

export default router;
