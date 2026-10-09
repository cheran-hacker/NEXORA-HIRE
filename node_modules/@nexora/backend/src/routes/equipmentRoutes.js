import express from 'express';
import { getEquipments, createEquipment, requestEquipment } from '../controllers/equipmentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getEquipments);
router.post('/', authorize('Student'), createEquipment);
router.post('/:id/request', authorize('Student'), requestEquipment);

export default router;
