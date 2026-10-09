import express from 'express';
import { getPosts, createPost, toggleLikePost, addComment } from '../controllers/postController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getPosts); // Public or protect if forum is closed
router.post('/', protect, createPost);
router.put('/:id/like', protect, toggleLikePost);
router.post('/:id/comments', protect, addComment);

export default router;
