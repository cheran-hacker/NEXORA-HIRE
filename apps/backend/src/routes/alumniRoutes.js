import express from 'express';
import { 
  getAlumniStats, 
  getAvailability,
  toggleAvailability,
  getAlumniDirectory,
  bookMentorship,
  getMyMentorships,
  updateMentorshipStatus,
  postBounty,
  getAlumniBounties,
  getReferrals,
  generateReferralLink,
  getLiveRooms,
  getTrajectorySimilarities,
  getPendingValidations,
  validateSkill,
  getConnectionRequests,
  updateConnectionRequest
} from '../controllers/alumniController.js';
import { getActivePoll, submitContribution, getAggregatedInsights } from '../controllers/microContributionController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public/Student accessible routes
router.get('/directory', protect, getAlumniDirectory);
router.get('/rooms', protect, getLiveRooms);
router.get('/trajectory-match', protect, authorize('Student'), getTrajectorySimilarities);
router.get('/insights', protect, getAggregatedInsights);
router.post('/mentorship/book', protect, authorize('Student', 'Alumni', 'Admin'), bookMentorship);

// Alumni/Student shared routes
router.get('/mentorship/my-sessions', protect, getMyMentorships);

// Alumni only routes
router.get('/stats', protect, authorize('Alumni', 'Admin'), getAlumniStats);
router.get('/availability', protect, authorize('Alumni', 'Admin'), getAvailability);
router.put('/availability', protect, authorize('Alumni', 'Admin'), toggleAvailability);

router.put('/mentorship/:id/status', protect, authorize('Alumni', 'Admin'), updateMentorshipStatus);

router.post('/bounties', protect, authorize('Alumni', 'Admin'), postBounty);
router.get('/bounties', protect, authorize('Alumni', 'Admin'), getAlumniBounties);
router.get('/referrals', protect, authorize('Alumni', 'Admin'), getReferrals);
router.post('/referrals', protect, authorize('Alumni', 'Admin'), generateReferralLink);

// Novelty features for Alumni
router.get('/micro-contributions/poll', protect, authorize('Alumni', 'Admin'), getActivePoll);
router.post('/micro-contributions', protect, authorize('Alumni', 'Admin'), submitContribution);

router.get('/validations', protect, authorize('Alumni', 'Admin'), getPendingValidations);
router.post('/validate-skill', protect, authorize('Alumni', 'Admin'), validateSkill);

router.get('/connections', protect, authorize('Alumni', 'Admin'), getConnectionRequests);
router.put('/connections/:id', protect, authorize('Alumni', 'Admin'), updateConnectionRequest);

export default router;

