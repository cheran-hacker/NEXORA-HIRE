import mongoose from 'mongoose';

const bountySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  rewardAmount: {
    type: Number,
    required: true
  },
  rewardCurrency: {
    type: String,
    default: 'USD'
  },
  tags: [String], // e.g., ['React', 'SQL', 'Figma']
  deadline: {
    type: Date
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Under Review', 'Completed'],
    default: 'Open'
  },
  poster: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  submissions: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    solutionUrl: String, // e.g., GitHub PR link or Figma link
    message: String,
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Rejected'],
      default: 'Pending'
    },
    submittedAt: {
      type: Date,
      default: Date.now
    }
  }],
  awardedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

export const Bounty = mongoose.models.Bounty || mongoose.model('Bounty', bountySchema);
