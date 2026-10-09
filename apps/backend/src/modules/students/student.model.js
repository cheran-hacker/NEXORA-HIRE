import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    rollNumber: {
      type: String,
      unique: true,
      sparse: true
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department'
    },
    batch: {
      type: Number // e.g., 2025
    },
    cgpa: {
      type: Number,
      min: 0,
      max: 10,
      default: 0
    },
    skills: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill'
    }],
    githubUrl: String,
    linkedinUrl: String,
    portfolioUrl: String,
    resumeUrl: String, // Link to stored PDF
    resumeAtsScore: {
      type: Number,
      default: 0
    },
    readinessScore: {
      type: Number,
      default: 0
    },
    tier: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
      default: 'Beginner'
    }
  },
  { timestamps: true }
);

export default mongoose.models.Student || mongoose.model('Student', StudentSchema);
