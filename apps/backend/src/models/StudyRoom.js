import mongoose from 'mongoose';

const studyRoomSchema = new mongoose.Schema({
  roomName: {
    type: String,
    required: true,
    unique: true
  },
  capacity: {
    type: Number,
    required: true
  },
  basePriceKarma: {
    type: Number,
    default: 50 // starting bid in karma/coins
  }
}, { timestamps: true });

export const StudyRoom = mongoose.models.StudyRoom || mongoose.model('StudyRoom', studyRoomSchema);
