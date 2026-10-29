import mongoose from 'mongoose';

const hackathonEventSchema = new mongoose.Schema({
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  eventName: {
    type: String,
    required: true
  },
  theme: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  teams: [{
    name: String,
    members: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  }],
  status: {
    type: String,
    enum: ['Upcoming', 'Live', 'Judging', 'Completed'],
    default: 'Upcoming'
  },
  isBoxGenerated: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

export const HackathonEvent = mongoose.models.HackathonEvent || mongoose.model('HackathonEvent', hackathonEventSchema);
