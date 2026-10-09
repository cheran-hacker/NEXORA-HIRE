import express from 'express';
import { getSettings, updateSetting } from '../controllers/settingsController.js';
import { protect, authorize } from '../middleware/auth.js';
import { cacheMiddleware } from '../utils/cache.js';

const router = express.Router();

// Get settings - cache for 1 hour since settings rarely change
router.get('/', cacheMiddleware(3600), getSettings);

// Update settings - Admin only
router.put('/', protect, authorize('Admin'), updateSetting);

export default router;
