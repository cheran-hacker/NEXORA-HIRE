import express from 'express';
import {
  getStudentRoadmaps,
  getRoadmapById,
  createRoadmap,
  updateMilestoneStatus,
  addRoadmapNote,
  deleteRoadmap
} from '../controllers/roadmapController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('Student', 'Admin'));

router.get('/', getStudentRoadmaps);
router.get('/:id', getRoadmapById);
router.post('/', createRoadmap);
router.patch('/:id/milestone', updateMilestoneStatus);
router.post('/:id/notes', addRoadmapNote);
router.delete('/:id', deleteRoadmap);

export default router;
