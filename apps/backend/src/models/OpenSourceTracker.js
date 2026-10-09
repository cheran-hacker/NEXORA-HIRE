import mongoose from 'mongoose';

const openSourceTrackerSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  githubUsername: {
    type: String,
    required: true
  },
  mergedPRs: {
    type: Number,
    default: 0
  },
  campusCreditsEarned: {
    type: Number,
    default: 0
  },
  topRepositories: [{
    type: String // e.g. "facebook/react", "torvalds/linux"
  }],
  recentCommits: [{
    repo: String,
    message: String,
    date: Date
  }]
}, { timestamps: true });

export const OpenSourceTracker = mongoose.models.OpenSourceTracker || mongoose.model('OpenSourceTracker', openSourceTrackerSchema);
