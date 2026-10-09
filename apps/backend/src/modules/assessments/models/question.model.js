import mongoose from 'mongoose';
import { DIFFICULTY_LEVELS, QUESTION_TYPES } from '../../../../../../packages/shared-constants/index.js';

const QuestionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: Object.values(QUESTION_TYPES),
      required: true
    },
    difficulty: {
      type: String,
      enum: Object.values(DIFFICULTY_LEVELS),
      default: DIFFICULTY_LEVELS.MEDIUM
    },
    category: {
      type: String,
      required: true
    },
    tags: [String],
    // For MCQ questions
    options: [{
      text: String,
      isCorrect: Boolean
    }],
    // For Coding questions
    testCases: [{
      input: String,
      expectedOutput: String,
      isHidden: { type: Boolean, default: false }
    }],
    initialCode: {
      type: Map,
      of: String // Language code to initial code template
    },
    marks: {
      type: Number,
      default: 1
    },
    negativeMarks: {
      type: Number,
      default: 0
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.models.Question || mongoose.model('Question', QuestionSchema);
