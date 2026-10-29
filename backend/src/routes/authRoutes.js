import express from 'express';
import { 
  register, login, getMe, googleAuth, updateMe,
  forgotPassword, resetPassword,
  generate2FA, verify2FA,
  microsoftAuth, linkedinAuth,
  completeProfile, activateAlumniAccount,
  verifyEmail, resendVerification
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [Student, Alumni, Placement, Recruiter, Admin]
 *     responses:
 *       201:
 *         description: User successfully registered
 *       400:
 *         description: Validation error or user exists
 */
router.post('/register', register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Authenticate a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Returns JWT token and user info
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', login);
router.post('/activate/:token', activateAlumniAccount);
router.post('/google', googleAuth);
router.post('/microsoft', microsoftAuth);
router.post('/linkedin', linkedinAuth);
router.post('/complete-profile', protect, completeProfile);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

router.post('/2fa/generate', protect, generate2FA);
router.post('/2fa/verify', protect, verify2FA);

router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);

export default router;
