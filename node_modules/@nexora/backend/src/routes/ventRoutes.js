import express from 'express';
import { getVents, createVent } from '../controllers/ventController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getVents);
router.post('/', createVent);

export default router;
