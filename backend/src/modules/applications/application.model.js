import mongoose from 'mongoose';
import { APPLICATION_STATUSES } from '../../../../../packages/shared-constants/index.js';

const ApplicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    resumeUrl: {
      type: String,
      required: true
    },
    coverLetter: String,
    aiMatchScore: {
      type: Number,
      default: 0
    },
    aiMatchFeedback: String,
    status: {
      type: String,
      enum: Object.values(APPLICATION_STATUSES),
      default: APPLICATION_STATUSES.APPLIED
    },
    rounds: [{
      name: String, // e.g., 'Aptitude Test', 'Technical Interview', 'HR Round'
      status: String,
      score: Number,
      feedback: String,
      date: Date
    }],
    appliedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

ApplicationSchema.index({ job: 1, student: 1 }, { unique: true });

export default mongoose.models.Application || mongoose.model('Application', ApplicationSchema);
