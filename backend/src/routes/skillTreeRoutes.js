import express from 'express';
import { getSkillTree, addNode } from '../controllers/skillTreeController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getSkillTree);
router.post('/', addNode); // Dev only typically

export default router;
