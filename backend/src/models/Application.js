import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  resumeUrl: { type: String, required: true },
  coverLetter: { type: String },
  
  // AI specific analysis
  aiAnalysis: {
    atsScore: { type: Number },
    matchedSkills: [String],
    missingSkills: [String],
    summary: String
  },
  
  status: { 
    type: String, 
    enum: [
      'Applied',
      'Screening',
      'Under Review',
      'Shortlisted',
      'Interview',
      'Interview Scheduled',
      'Offered',
      'Selected',
      'Rejected',
      'Joined'
    ],
    default: 'Applied'
  },
  
  // Interview tracking
  interviewRounds: [{
    title: String,
    scheduledAt: Date,
    interviewer: String,
    feedback: String,
    result: { type: String, enum: ['Pass', 'Fail', 'Pending'], default: 'Pending' }
  }],
  
  appliedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Prevent multiple applications to same job by same student
applicationSchema.index({ jobId: 1, studentId: 1 }, { unique: true });

export const Application = mongoose.models.Application || mongoose.model('Application', applicationSchema);
