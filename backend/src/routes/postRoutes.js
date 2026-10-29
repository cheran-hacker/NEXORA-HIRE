import express from 'express';
import { 
  getPosts, 
  getPostById, 
  createPost, 
  updatePost, 
  deletePost, 
  toggleLikePost, 
  addComment,
  getForumStats 
} from '../controllers/postController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Optional authentication on GET: attaches user if token provided
const optionalProtect = (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    return protect(req, res, next);
  }
  next();
};

router.get('/', optionalProtect, getPosts);
router.get('/stats', optionalProtect, getForumStats);
router.get('/:id', optionalProtect, getPostById);
router.post('/', protect, createPost);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);

// Vote / Like endpoints
router.put('/:id/like', protect, toggleLikePost);
router.put('/:id/vote', protect, toggleLikePost);

// Comments / Replies endpoints
router.post('/:id/comments', protect, addComment);
router.post('/:id/replies', protect, addComment);

export default router;
