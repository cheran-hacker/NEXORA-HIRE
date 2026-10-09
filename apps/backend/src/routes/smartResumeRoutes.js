import express from 'express';
import { getRules, createRule, deleteRule } from '../controllers/smartResumeController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getRules);
router.post('/', createRule);
router.delete('/:id', deleteRule);

export default router;
