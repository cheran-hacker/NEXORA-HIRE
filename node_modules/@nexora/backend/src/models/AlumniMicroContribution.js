import mongoose from 'mongoose';

const alumniMicroContributionSchema = new mongoose.Schema({
  alumniId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['SkillSignal', 'LessonLearned', 'RealityCheck', 'CareerInsight'],
    required: true
  },
  topic: {
    type: String,
    required: true,
    trim: true
  },
  response: {
    type: String,
    required: true,
    trim: true
  },
  industryContext: {
    type: String,
    trim: true
  },
  upvotes: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

export const AlumniMicroContribution = mongoose.models.AlumniMicroContribution || mongoose.model('AlumniMicroContribution', alumniMicroContributionSchema);
