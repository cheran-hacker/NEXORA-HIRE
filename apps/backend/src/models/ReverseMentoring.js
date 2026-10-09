import mongoose from 'mongoose';

const reverseMentoringSchema = new mongoose.Schema({
  studentMentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topic: { type: String, required: true }, // e.g., "TikTok Marketing for Boomers"
  hourlyRate: { type: Number, required: true }, // in USD or Karma
  corporateExecName: { type: String }, // mock for MVP
  status: { type: String, enum: ['Available', 'Booked'], default: 'Available' }
}, { timestamps: true });

export const ReverseMentoring = mongoose.models.ReverseMentoring || mongoose.model('ReverseMentoring', reverseMentoringSchema);
