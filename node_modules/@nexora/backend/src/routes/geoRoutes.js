import express from 'express';
import { getActiveEvents, createGeoEvent, checkInGeoEvent } from '../controllers/geoController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/events', getActiveEvents);
router.post('/events', authorize('Admin'), createGeoEvent);
router.post('/checkin', checkInGeoEvent);

export default router;
