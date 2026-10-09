import { Bounty } from '../models/Bounty.js';
import { User } from '../models/User.js';

export const createBounty = async (req, res, next) => {
  try {
    const { title, description, rewardAmount, tags, deadline } = req.body;
    
    const bounty = await Bounty.create({
      title,
      description,
      rewardAmount,
      tags,
      deadline,
      poster: req.user.id
    });

    res.status(201).json({ success: true, data: bounty });
  } catch (error) {
    next(error);
  }
};

export const getOpenBounties = async (req, res, next) => {
  try {
    const bounties = await Bounty.find({ status: { $in: ['Open', 'In Progress'] } })
      .populate('poster', 'name role profile.company')
      .sort('-createdAt');
      
    res.status(200).json({ success: true, count: bounties.length, data: bounties });
  } catch (error) {
    next(error);
  }
};

export const getMyBounties = async (req, res, next) => {
  try {
    const bounties = await Bounty.find({ poster: req.user.id })
      .populate('submissions.student', 'name studentProfile.skills')
      .sort('-createdAt');
      
    res.status(200).json({ success: true, count: bounties.length, data: bounties });
  } catch (error) {
    next(error);
  }
};

export const submitSolution = async (req, res, next) => {
  try {
    const { solutionUrl, message } = req.body;
    const bountyId = req.params.id;

    const bounty = await Bounty.findById(bountyId);
    if (!bounty) return res.status(404).json({ message: 'Bounty not found' });
    if (bounty.status === 'Completed') return res.status(400).json({ message: 'Bounty already completed' });

    // Check if already submitted
    const existingSubmission = bounty.submissions.find(s => s.student.toString() === req.user.id);
    if (existingSubmission) {
      return res.status(400).json({ message: 'You have already submitted a solution.' });
    }

    bounty.submissions.push({
      student: req.user.id,
      solutionUrl,
      message
    });
    
    if (bounty.status === 'Open') bounty.status = 'In Progress';

    await bounty.save();
    res.status(200).json({ success: true, data: bounty });
  } catch (error) {
    next(error);
  }
};

export const awardBounty = async (req, res, next) => {
  try {
    const { submissionId } = req.body;
    const bountyId = req.params.id;

    const bounty = await Bounty.findById(bountyId);
    if (!bounty) return res.status(404).json({ message: 'Bounty not found' });
    if (bounty.poster.toString() !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });

    // Find submission
    const submission = bounty.submissions.id(submissionId);
    if (!submission) return res.status(404).json({ message: 'Submission not found' });

    // Award
    submission.status = 'Accepted';
    bounty.status = 'Completed';
    bounty.awardedTo = submission.student;

    // Reject others
    bounty.submissions.forEach(sub => {
      if (sub._id.toString() !== submissionId) {
        sub.status = 'Rejected';
      }
    });

    // Auto-payout logic: Reward the winner with bounty amount (simulated as karma/credits)
    await User.findByIdAndUpdate(submission.student, {
      $inc: { 'studentProfile.karma': bounty.rewardAmount }
    });

    await bounty.save();
    res.status(200).json({ success: true, data: bounty });
  } catch (error) {
    next(error);
  }
};
