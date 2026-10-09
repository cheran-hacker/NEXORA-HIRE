import mongoose from 'mongoose';

const liveInterviewStreamSchema = new mongoose.Schema({
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  interviewerRole: {
    type: String,
    required: true // e.g., 'Senior SWE at Google'
  },
  title: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Live', 'Ended'],
    default: 'Scheduled'
  },
  scheduledTime: {
    type: Date,
    required: true
  },
  viewers: {
    type: Number,
    default: 0
  },
  hireVotes: {
    type: Number,
    default: 0
  },
  noHireVotes: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

export const LiveInterviewStream = mongoose.models.LiveInterviewStream || mongoose.model('LiveInterviewStream', liveInterviewStreamSchema);
