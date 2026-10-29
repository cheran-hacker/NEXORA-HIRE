import express from 'express';
import { createSnippet, getSnippets, roastSnippet, upvoteRoast } from '../controllers/snippetController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/', authorize('Student'), createSnippet);
router.get('/', getSnippets);
router.post('/:id/roast', authorize('Student'), roastSnippet);
router.put('/:id/roast/upvote', authorize('Student'), upvoteRoast);

export default router;
