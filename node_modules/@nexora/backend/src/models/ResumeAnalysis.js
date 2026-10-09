import mongoose from 'mongoose';

const resumeAnalysisSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileName: { type: String, required: true },
  fileUrl: { type: String },
  extractedText: { type: String },
  atsScore: { type: Number, default: 0 },
  skills: { type: [String], default: [] },
  missingSkills: { type: [String], default: [] },
  suggestions: { type: [String], default: [] },
  summary: { type: String },
  experienceLevel: { type: String },
  // Full profile extracted by AI — stored for the review modal
  extractedProfile: {
    name: String,
    email: String,
    phone: String,
    location: String,
    bio: String,
    college: String,
    branch: String,
    batchYear: Number,
    cgpa: Number,
    githubUrl: String,
    linkedinUrl: String,
    websiteUrl: String,
  },
  extractedProjects: [{
    name: String,
    stack: String,
    desc: String,
    github: String,
  }],
  extractedCertificates: [{
    name: String,
    issuer: String,
    date: String,
  }],
  extractedExperience: [{
    company: String,
    role: String,
    duration: String,
    description: String,
  }],
  // 'pending_review' | 'confirmed' | 'dismissed'
  status: { type: String, enum: ['pending_review', 'confirmed', 'dismissed'], default: 'confirmed' },
  analyzedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export const ResumeAnalysis = mongoose.models.ResumeAnalysis || mongoose.model('ResumeAnalysis', resumeAnalysisSchema);

