import mongoose from 'mongoose';

const mentorshipSessionSchema = new mongoose.Schema({
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mentee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  scheduledDate: {
    type: Date,
    required: false
  },
  durationMinutes: {
    type: Number,
    default: 30
  },
  topic: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
  },
  targetRole: {
    type: String
  },
  skillGaps: [String],
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Active', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  meetingLink: {
    type: String
  },
  notes: {
    type: String
  }
}, { timestamps: true });

export const MentorshipSession = mongoose.models.MentorshipSession || mongoose.model('MentorshipSession', mentorshipSessionSchema);
