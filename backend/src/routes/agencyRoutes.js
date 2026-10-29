import express from 'express';
import { getAgencies, createAgency, addFounder } from '../controllers/agencyController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getAgencies);
router.post('/', createAgency);
router.post('/:id/founders', addFounder);

export default router;
