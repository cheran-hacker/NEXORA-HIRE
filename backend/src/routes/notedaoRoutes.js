import express from 'express';
import { getNotes, uploadNote, voteNote } from '../controllers/notedaoController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getNotes);
router.post('/', uploadNote);
router.post('/:id/vote', voteNote);

export default router;
