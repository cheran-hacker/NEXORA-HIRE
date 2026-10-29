import mongoose from 'mongoose';

const skillValidationRequestSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  alumni: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  type: {
    type: String,
    enum: ['skill', 'project', 'certification'],
    default: 'skill'
  },
  title: {
    type: String,
    trim: true
  },
  skill: {
    type: String,
    trim: true
  },
  evidenceDescription: {
    type: String,
    default: '',
    trim: true
  },
  evidenceUrl: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Demonstrated', 'Insufficient'],
    default: 'Pending',
    index: true
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  feedback: {
    type: String,
    default: '',
    trim: true
  },
  reviewedAt: {
    type: Date
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Ensure title and skill remain synchronized for compatibility
skillValidationRequestSchema.pre('save', function (next) {
  if (!this.title && this.skill) {
    this.title = this.skill;
  }
  if (!this.skill && this.title) {
    this.skill = this.title;
  }
  next();
});

// Virtuals for alternative naming
skillValidationRequestSchema.virtual('studentId').get(function () {
  return this.student;
});
skillValidationRequestSchema.virtual('alumniId').get(function () {
  return this.alumni;
});

export const SkillValidationRequest = mongoose.models.SkillValidationRequest || mongoose.model('SkillValidationRequest', skillValidationRequestSchema);
