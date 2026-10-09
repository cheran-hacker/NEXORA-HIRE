import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema({
  alumni: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  purpose: { type: String, enum: ['General Fund', 'Scholarship', 'Infrastructure', 'Research'], default: 'General Fund' },
  status: { type: String, enum: ['Pending', 'Completed', 'Failed'], default: 'Pending' },
  transactionId: { type: String },
  isAnonymous: { type: Boolean, default: false }
}, { timestamps: true });

export const Donation = mongoose.models.Donation || mongoose.model('Donation', donationSchema);
