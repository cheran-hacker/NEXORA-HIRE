import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mentee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  type: { type: String, enum: ['Mock Interview', 'Resume Review', 'Career Guidance'], required: true },
  
  scheduledAt: { type: Date, required: true },
  durationMinutes: { type: Number, default: 30 },
  
  status: { type: String, enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'], default: 'Pending' },
  
  meetingLink: { type: String }, // e.g. Google Meet link
  
  menteeNotes: { type: String }, // Pre-session notes from mentee
  mentorFeedback: { type: String }, // Post-session feedback from mentor
  
  rating: { type: Number, min: 1, max: 5 }, // Rating given by mentee
  review: { type: String }
}, { timestamps: true });

export const Session = mongoose.models.Session || mongoose.model('Session', sessionSchema);
