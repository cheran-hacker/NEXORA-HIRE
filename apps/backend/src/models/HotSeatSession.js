import mongoose from 'mongoose';

const hotSeatSessionSchema = new mongoose.Schema({
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  topic: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Live', 'Completed'],
    default: 'Scheduled'
  },
  scheduledTime: {
    type: Date,
    required: true
  },
  viewerCount: {
    type: Number,
    default: 0
  },
  communityRating: {
    type: Number, // out of 100
    default: 0
  }
}, { timestamps: true });

export const HotSeatSession = mongoose.models.HotSeatSession || mongoose.model('HotSeatSession', hotSeatSessionSchema);
