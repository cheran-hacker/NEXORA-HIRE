import mongoose from 'mongoose';

const escapeRoomTaskSchema = new mongoose.Schema({
  level: {
    type: Number,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  riddle: {
    type: String,
    required: true
  },
  answer: {
    type: String,
    required: true
  },
  rewardBadge: {
    type: String
  }
}, { timestamps: true });

export const EscapeRoomTask = mongoose.models.EscapeRoomTask || mongoose.model('EscapeRoomTask', escapeRoomTaskSchema);
