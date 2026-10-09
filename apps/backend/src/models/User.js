import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String, required: true, unique: true },
  regNo: { type: String, sparse: true }, // Added for Student Excel Auth matching
  password: { type: String }, // optional for OAuth users
  role: { 
    type: String, 
    enum: ['Student', 'Placement', 'Alumni', 'Admin', 'Guest'],
    default: 'Guest'
  },
  avatar: { type: String, default: '' },
  phone: { type: String },
  
  // Shared Profile Fields (for complete profile requirement)
  bio: String,
  skills: [String],
  linkedinUrl: String,
  githubUrl: String,
  portfolioUrl: String,
  resumeUrl: String,
  department: String,
  course: String,
  year: String,
  college: String,
  location: String,
  timezone: String,
  language: { type: String, default: 'en' },
  themePreference: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
  notificationSettings: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true }
  },

  // Role specific profiles
  studentProfile: {
    registerNumber: { type: String, trim: true },
    college: String,
    branch: String,
    batchYear: Number,
    cgpa: Number,
    skills: [String],
    resumeUrl: String,
    githubUrl: String,
    linkedinUrl: String,
    portfolioUrl: String,
    websiteUrl: String,
    availableFrom: String,
    preferredRoles: String,
    softSkills: [String],
    languages: [String],
    interests: [String],
    projects: [{
      name: String,
      stack: String,
      desc: String,
      github: String
    }],
    certificates: [{
      name: String,
      issuer: String,
      date: String
    }],
    readinessScore: { type: Number, default: 0 },
    verified: { type: Boolean, default: false },
    karma: { type: Number, default: 0 },
    resumeScore: { type: Number, default: 0 },
    targetCareerRole: { type: String, default: '' },
    savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }]
  },
  
  placementProfile: {
    department: String, // E.g. "Computer Science" or "Placement Cell"
    designation: String, // E.g. "Placement Officer", "Professor"
    companyName: String, // Optional, if they also represent a company for recruitment
    companyWebsite: String,
    verified: { type: Boolean, default: false }
  },
  
  alumniProfile: {
    // Identity & Academic
    registerNumber: String,
    collegeEmail: String,
    personalEmail: String,
    degree: String,
    program: String,
    department: String,
    batch: String,
    graduationYear: Number,
    cgpa: Number,
    college: String,
    
    // Professional
    company: String,
    designation: String,
    industry: String,
    experienceYears: Number,
    location: String,
    bio: String,
    linkedin: String,
    github: String,
    portfolio: String,

    // Career History Array
    careerHistory: [{
      company: String,
      role: String,
      industry: String,
      location: String,
      startDate: Date,
      endDate: Date,
      description: String,
      skillsUsed: [String]
    }],

    // Skills & Expertise
    skills: [String],
    expertise: [String], // keeping existing

    // Mentoring Interests
    mentoringInterests: {
      careerRoles: [String],
      skills: [String],
      industries: [String],
      topics: [String],
      preferredStudentDepartments: [String],
      availability: String,
      maxActiveMentorships: { type: Number, default: 3 }
    },

    // Mentorship metrics
    rating: { type: Number, default: 0 },
    sessionsCompleted: { type: Number, default: 0 },
    available: { type: Boolean, default: true },
    
    // Legacy mapping (keeping for compatibility)
    contributionPreferences: {
      mentorship: { type: Boolean, default: false },
      resumeReview: { type: Boolean, default: false },
      vacancySharing: { type: Boolean, default: false },
      industryInsights: { type: Boolean, default: false },
      challenges: { type: Boolean, default: false },
      skillValidation: { type: Boolean, default: false },
      mockInterview: { type: Boolean, default: false },
      careerGuidance: { type: Boolean, default: false },
      technicalQA: { type: Boolean, default: false },
      referrals: { type: Boolean, default: false }
    }
  },

  // Preferences
  themePreference: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
  notificationSettings: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    jobAlerts: { type: Boolean, default: true },
    assessmentReminders: { type: Boolean, default: true },
    newsletter: { type: Boolean, default: false }
  },

  // Auth & Security
  provider: { type: String, enum: ['local', 'google', 'microsoft', 'linkedin'], default: 'local' },
  loginCount: { type: Number, default: 0 },
  googleId: String,
  microsoftId: String,
  linkedinId: String,
  twoFactorSecret: String,
  isTwoFactorEnabled: { type: Boolean, default: false },
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: String,
  emailVerificationExpire: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  lastLogin: Date,
  
  // Alumni Invitation Tracking
  invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  activationToken: String,
  activationExpire: Date,
  
  status: { type: String, enum: ['Active', 'Pending', 'Suspended', 'Invited'], default: 'Active' }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for avatar fallback
userSchema.virtual('avatarUrl').get(function() {
  if (this.avatar) return this.avatar;
  const init = this.name ? this.name.substring(0, 2).toUpperCase() : 'NA';
  return `https://ui-avatars.com/api/?name=${init}&background=random`;
});

export const User = mongoose.models.User || mongoose.model('User', userSchema);
