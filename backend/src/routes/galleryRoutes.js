import express from 'express';
import { getMyGallery, updateGallery } from '../controllers/galleryController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getMyGallery);
router.post('/', updateGallery);

export default router;
