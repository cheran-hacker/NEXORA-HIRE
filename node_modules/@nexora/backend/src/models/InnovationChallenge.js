import mongoose from 'mongoose';

const innovationChallengeSchema = new mongoose.Schema({
  company: { type: String, required: true },
  problemStatement: { type: String, required: true },
  bounty: { type: String, required: true },
  staffAdopters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  submissions: [{
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    solutionLink: String,
    code: String,
    passed: Boolean
  }]
}, { timestamps: true });

export const InnovationChallenge = mongoose.models.InnovationChallenge || mongoose.model('InnovationChallenge', innovationChallengeSchema);
