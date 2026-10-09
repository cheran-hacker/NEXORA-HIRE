import mongoose from 'mongoose';

const skillBadgeSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  badgeName: { type: String, required: true },
  issuer: { type: String, required: true }, // e.g. "Google HashCode 2024"
  contractAddress: { type: String }, // simulated
  issuedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export const SkillBadge = mongoose.models.SkillBadge || mongoose.model('SkillBadge', skillBadgeSchema);
