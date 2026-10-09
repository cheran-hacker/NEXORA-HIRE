import express from 'express';
import { register, login, googleLogin, activate } from './auth.controller.js';
import { authLimiter } from '../../core/middlewares/rateLimiter.js';

const router = express.Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/google', googleLogin);
router.post('/activate/:token', authLimiter, activate);

export default router;
