import express from 'express';
import { getPivotRecords, createPivotRecord } from '../controllers/pivotController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getPivotRecords);
router.post('/', authorize('Student'), createPivotRecord);

export default router;
