import express from 'express';
import { getHiringDrives, createHiringDrive, updateHiringDrive, deleteHiringDrive } from '../controllers/hiringDriveController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getHiringDrives);
router.post('/', authorize('Placement', 'Admin'), createHiringDrive);
router.put('/:id', authorize('Placement', 'Admin'), updateHiringDrive);
router.delete('/:id', authorize('Placement', 'Admin'), deleteHiringDrive);

export default router;
