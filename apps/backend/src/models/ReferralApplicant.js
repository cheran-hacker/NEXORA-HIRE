import mongoose from 'mongoose';

const referralApplicantSchema = new mongoose.Schema({
  referralLink: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ReferralLink',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  matchScore: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending Review', 'Interviewing', 'Hired', 'Rejected'],
    default: 'Pending Review'
  }
}, { timestamps: true });

export const ReferralApplicant = mongoose.models.ReferralApplicant || mongoose.model('ReferralApplicant', referralApplicantSchema);
