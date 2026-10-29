import express from 'express';
import { getAvailableHardware, borrowHardware, listHardware } from '../controllers/hardwarepoolController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getAvailableHardware);
router.post('/', listHardware);
router.post('/:id/borrow', borrowHardware);

export default router;
