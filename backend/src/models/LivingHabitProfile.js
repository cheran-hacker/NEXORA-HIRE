import mongoose from 'mongoose';

const livingHabitProfileSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sleepSchedule: {
    type: String,
    enum: ['Early Bird', 'Night Owl', 'Flexible'],
    required: true
  },
  cleanliness: {
    type: String,
    enum: ['Neat Freak', 'Average', 'Messy'],
    required: true
  },
  socialMeter: {
    type: String,
    enum: ['Party Animal', 'Chill Hangouts', 'Quiet Study'],
    required: true
  },
  bio: {
    type: String
  },
  matches: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, { timestamps: true });

export const LivingHabitProfile = mongoose.models.LivingHabitProfile || mongoose.model('LivingHabitProfile', livingHabitProfileSchema);
