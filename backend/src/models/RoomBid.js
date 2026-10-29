import mongoose from 'mongoose';

const roomBidSchema = new mongoose.Schema({
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudyRoom',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bidAmount: {
    type: Number,
    required: true
  },
  timeSlot: {
    type: String, // e.g. "2026-10-12 14:00-16:00"
    required: true
  },
  status: {
    type: String,
    enum: ['Leading', 'Outbid', 'Won', 'Lost'],
    default: 'Leading'
  }
}, { timestamps: true });

export const RoomBid = mongoose.models.RoomBid || mongoose.model('RoomBid', roomBidSchema);
