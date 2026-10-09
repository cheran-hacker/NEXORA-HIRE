import mongoose from 'mongoose';

const karmaLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true // e.g., 'Answered Forum Question', 'Mentored a Junior'
  },
  points: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export const KarmaLog = mongoose.models.KarmaLog || mongoose.model('KarmaLog', karmaLogSchema);
