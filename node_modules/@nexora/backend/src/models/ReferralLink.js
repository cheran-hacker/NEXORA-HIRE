import mongoose from 'mongoose';

const referralLinkSchema = new mongoose.Schema({
  alumni: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    required: true
  },
  company: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true,
    unique: true
  },
  clicks: {
    type: Number,
    default: 0
  },
  requiredSkills: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['Pending', 'Verified', 'Rejected', 'Expired'],
    default: 'Pending'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

export const ReferralLink = mongoose.models.ReferralLink || mongoose.model('ReferralLink', referralLinkSchema);
