import express from 'express';
import { getSprints, createSprint, lockInSprint, updateGoal, failSprint } from '../controllers/sprintController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getSprints);
router.post('/', createSprint);
router.post('/:id/lock-in', lockInSprint);
router.post('/:id/goals', updateGoal);
router.post('/:id/fail', failSprint);

export default router;
