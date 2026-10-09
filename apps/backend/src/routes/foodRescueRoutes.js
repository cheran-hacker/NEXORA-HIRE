import express from 'express';
import { getRescues, triggerRescue, claimBox } from '../controllers/foodRescueController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getRescues);
router.post('/trigger', triggerRescue);
router.post('/:id/claim', claimBox);

export default router;
