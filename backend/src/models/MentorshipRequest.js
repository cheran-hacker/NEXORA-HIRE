import mongoose from 'mongoose';

const mentorshipRequestSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  alumni: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  topic: {
    type: String,
    required: true,
    trim: true
  },
  careerGoal: {
    type: String,
    trim: true
  },
  targetRole: {
    type: String,
    trim: true
  },
  skillGaps: [{
    type: String
  }],
  message: {
    type: String,
    trim: true
  },
  requestedDate: {
    type: Date,
    required: true
  },
  requestedStartTime: {
    type: String, // e.g. "18:00"
    required: true
  },
  requestedEndTime: {
    type: String, // e.g. "18:30"
    required: true
  },
  durationMinutes: {
    type: Number,
    default: 30
  },
  timezone: {
    type: String,
    default: 'Asia/Kolkata'
  },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Rejected', 'Cancelled', 'Expired'],
    default: 'Pending',
    index: true
  },
  rejectionReason: {
    type: String
  },
  respondedAt: {
    type: Date
  },
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MentorshipSession'
  }
}, { timestamps: true });

// Prevent duplicate active requests between same student and alumni
mentorshipRequestSchema.index({ student: 1, alumni: 1, status: 1 });
mentorshipRequestSchema.index({ alumni: 1, status: 1 });
mentorshipRequestSchema.index({ student: 1, status: 1 });

export const MentorshipRequest = mongoose.models.MentorshipRequest || mongoose.model('MentorshipRequest', mentorshipRequestSchema);
