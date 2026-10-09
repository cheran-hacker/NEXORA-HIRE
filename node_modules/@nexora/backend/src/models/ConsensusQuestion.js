import mongoose from 'mongoose';

const consensusQuestionSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  question: {
    type: String,
    required: true,
    trim: true
  },
  industryContext: {
    type: String,
    trim: true
  },
  targetRole: {
    type: String,
    trim: true
  },
  responses: [{
    alumniId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    answer: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

export const ConsensusQuestion = mongoose.models.ConsensusQuestion || mongoose.model('ConsensusQuestion', consensusQuestionSchema);
