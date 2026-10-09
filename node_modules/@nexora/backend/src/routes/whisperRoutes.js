import express from 'express';
import { getActiveChats, createChat, joinChat, getMessages, sendMessage } from '../controllers/whisperController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getActiveChats);
router.post('/', createChat);
router.post('/:id/join', joinChat);
router.get('/:id/messages', getMessages);
router.post('/:id/messages', sendMessage);

export default router;
