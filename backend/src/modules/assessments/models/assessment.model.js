import mongoose from 'mongoose';
import { STATUSES } from '../../../../../../packages/shared-constants/index.js';

const AssessmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: String,
    instructions: String,
    durationMinutes: {
      type: Number,
      required: true
    },
    startTime: Date,
    endTime: Date,
    questions: [{
      questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question'
      },
      marks: Number
    }],
    totalMarks: {
      type: Number,
      required: true
    },
    passingPercentage: {
      type: Number,
      default: 50
    },
    isProctored: {
      type: Boolean,
      default: false
    },
    randomizeQuestions: {
      type: Boolean,
      default: true
    },
    status: {
      type: String,
      enum: Object.values(STATUSES),
      default: STATUSES.PENDING
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    allowedDepartments: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department'
    }],
    allowedBatches: [Number]
  },
  { timestamps: true }
);

export default mongoose.models.Assessment || mongoose.model('Assessment', AssessmentSchema);
