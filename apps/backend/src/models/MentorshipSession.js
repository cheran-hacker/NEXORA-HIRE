import mongoose from 'mongoose';

const actionItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  assignedTo: {
    type: String,
    enum: ['Student', 'Mentor'],
    default: 'Student'
  },
  dueDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['TODO', 'IN_PROGRESS', 'COMPLETED'],
    default: 'TODO'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

const mentorshipSessionSchema = new mongoose.Schema({
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  mentee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  requestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MentorshipRequest'
  },
  scheduledDate: {
    type: Date,
    required: false
  },
  scheduledStart: {
    type: Date,
    required: false
  },
  scheduledEnd: {
    type: Date,
    required: false
  },
  durationMinutes: {
    type: Number,
    default: 30
  },
  timezone: {
    type: String,
    default: 'Asia/Kolkata'
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
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Scheduled', 'Confirmed', 'Active', 'InProgress', 'Completed', 'Cancelled', 'Rescheduled', 'Rejected', 'NoShow'],
    default: 'Scheduled',
    index: true
  },
  meetingProvider: {
    type: String,
    default: 'InternalRoom'
  },
  meetingLink: {
    type: String
  },
  agenda: [{
    type: String
  }],
  // Notes separation: privateMentorNotes is STRICTLY hidden from student!
  sharedNotes: {
    type: String,
    default: ''
  },
  privateMentorNotes: {
    type: String,
    default: ''
  },
  studentNotes: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  },
  actionItems: [actionItemSchema],
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    trim: true
  },
  mentorFeedback: {
    type: String,
    trim: true
  },
  cancellationReason: {
    type: String
  },
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  completedAt: {
    type: Date
  },
  cancelledAt: {
    type: Date
  }
}, { timestamps: true });

// Pre-save hook to synchronize scheduledDate with scheduledStart and notes with sharedNotes
mentorshipSessionSchema.pre('save', function (next) {
  if (this.scheduledStart && !this.scheduledDate) {
    this.scheduledDate = this.scheduledStart;
  } else if (this.scheduledDate && !this.scheduledStart) {
    this.scheduledStart = this.scheduledDate;
  }
  if (this.scheduledStart && this.durationMinutes && !this.scheduledEnd) {
    this.scheduledEnd = new Date(this.scheduledStart.getTime() + this.durationMinutes * 60000);
  }
  if (this.sharedNotes && !this.notes) {
    this.notes = this.sharedNotes;
  } else if (this.notes && !this.sharedNotes) {
    this.sharedNotes = this.notes;
  }
  next();
});

mentorshipSessionSchema.index({ mentor: 1, scheduledDate: 1 });
mentorshipSessionSchema.index({ mentee: 1, scheduledDate: 1 });
mentorshipSessionSchema.index({ status: 1 });

export const MentorshipSession = mongoose.models.MentorshipSession || mongoose.model('MentorshipSession', mentorshipSessionSchema);
