import express from 'express';
import {
  createBounty,
  getOpenBounties,
  getMyBounties,
  getMyStudentBounties,
  getBountyById,
  updateBounty,
  deleteBounty,
  applyForBounty,
  updateApplicationStatus,
  assignBounty,
  submitSolution,
  reviewSubmission,
  awardBounty,
  reopenBounty
} from '../controllers/bountyController.js';
import { protect, authorize, optionalProtect } from '../middleware/auth.js';

const router = express.Router();

// ── Public / Semi-public listing ──────────────────────────────────────────
router.get('/open', optionalProtect, getOpenBounties);

// ── Authenticated Routes ──────────────────────────────────────────────────
router.use(protect);

// Student specific routes
router.get('/my-applications', authorize('Student', 'Admin'), getMyStudentBounties);
router.post('/:id/apply', authorize('Student', 'Admin'), applyForBounty);
router.post('/:id/submit', authorize('Student', 'Admin'), submitSolution);

// Alumni / Creator specific routes
router.get('/my-bounties', authorize('Alumni', 'Placement', 'Admin'), getMyBounties);
router.post('/', authorize('Alumni', 'Placement', 'Admin'), createBounty);
router.put('/:id', authorize('Alumni', 'Placement', 'Admin'), updateBounty);
router.delete('/:id', authorize('Alumni', 'Placement', 'Admin'), deleteBounty);
router.post('/:id/reopen', authorize('Alumni', 'Placement', 'Admin'), reopenBounty);

// Task assignment & Application approval
router.put('/:id/applications/:appId/status', authorize('Alumni', 'Placement', 'Admin'), updateApplicationStatus);
router.post('/:id/assign', authorize('Alumni', 'Placement', 'Admin'), assignBounty);

// Submission reviews & Awards
router.put('/:id/submissions/:submissionId/review', authorize('Alumni', 'Placement', 'Admin'), reviewSubmission);
router.put('/:id/award', authorize('Alumni', 'Placement', 'Admin'), awardBounty);

// Bounty details (accessible to any authenticated user)
router.get('/:id', getBountyById);

export default router;
