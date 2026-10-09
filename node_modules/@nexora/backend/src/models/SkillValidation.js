import mongoose from 'mongoose';

const skillValidationSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  alumniId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  skill: {
    type: String,
    required: true,
    trim: true
  },
  evidenceUrl: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Demonstrated', 'Insufficient'],
    default: 'Pending'
  },
  feedback: {
    type: String,
    trim: true
  }
}, { timestamps: true });

export const SkillValidation = mongoose.models.SkillValidation || mongoose.model('SkillValidation', skillValidationSchema);
