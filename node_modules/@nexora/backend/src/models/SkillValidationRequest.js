import mongoose from 'mongoose';

const skillValidationRequestSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  skill: {
    type: String,
    required: true
  },
  evidenceUrl: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Demonstrated', 'Insufficient'],
    default: 'Pending'
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  feedback: {
    type: String
  }
}, { timestamps: true });

export const SkillValidationRequest = mongoose.models.SkillValidationRequest || mongoose.model('SkillValidationRequest', skillValidationRequestSchema);
