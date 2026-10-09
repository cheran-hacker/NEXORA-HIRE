import express from 'express';
import { 
  inviteAlumni, 
  validateInvitation, 
  registerAlumni, 
  getInvitations, 
  approveAlumni,
  resendInvitation
} from '../controllers/alumniInvitationController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes for the alumni themselves
router.get('/validate/:token', validateInvitation);
router.post('/register/:token', registerAlumni);

// Admin-only routes
router.use(protect);
router.use(authorize('Admin'));

router.post('/invite', inviteAlumni);
router.post('/resend/:id', resendInvitation);
router.get('/', getInvitations);
router.post('/approve/:id', approveAlumni);

export default router;
