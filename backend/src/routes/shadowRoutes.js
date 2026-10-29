import express from 'express';
import { getShadowPrograms, joinShadowProgram } from '../controllers/shadowController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getShadowPrograms);
router.post('/:id/join', joinShadowProgram);

export default router;
