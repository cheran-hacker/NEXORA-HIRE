import express from 'express';
import { getRoleSkillMaps, getRoleSkillMap, createRoleSkillMap, updateRoleSkillMap, deleteRoleSkillMap } from '../controllers/roleSkillController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getRoleSkillMaps);
router.get('/:id', getRoleSkillMap);

// Admin only routes for managing mapping
router.use(authorize('Admin'));
router.post('/', createRoleSkillMap);
router.put('/:id', updateRoleSkillMap);
router.delete('/:id', deleteRoleSkillMap);

export default router;
