import { OpenSourceTracker } from '../models/OpenSourceTracker.js';

export const getLeaderboard = async (req, res, next) => {
  try {
    const trackers = await OpenSourceTracker.find().populate('student', 'name').sort('-mergedPRs');
    res.status(200).json({ success: true, data: trackers });
  } catch (error) {
    next(error);
  }
};

export const syncGithub = async (req, res, next) => {
  try {
    const { githubUsername } = req.body;
    
    // Check if exists
    let tracker = await OpenSourceTracker.findOne({ student: req.user.id });
    
    if (!tracker) {
      // Initialize with empty real data (Requires GitHub API integration)
      tracker = await OpenSourceTracker.create({
        student: req.user.id,
        githubUsername,
        mergedPRs: 0, 
        campusCreditsEarned: 0,
        topRepositories: [],
        recentCommits: []
      });
    } else {
      // If we had a real GitHub API, we'd fetch and update here.
      // For now, do not artificially inflate numbers.
      tracker.githubUsername = githubUsername;
      await tracker.save();
    }

    res.status(200).json({ success: true, data: tracker });
  } catch (error) {
    next(error);
  }
};
