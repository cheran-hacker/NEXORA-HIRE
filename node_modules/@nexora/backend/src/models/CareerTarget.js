import mongoose from 'mongoose';

const careerTargetSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // 1-to-1 relationship with Student
  },
  targetRole: {
    type: String, // String representation e.g. "Software Engineer"
    required: true
  },
  roleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RoleSkillMap' // Explicit map to existing architecture role
  },
  targetCompanies: [{ type: String }],
  preferredLocations: [{ type: String }],
  preferredWorkModes: [{ 
    type: String, 
    enum: ['Remote', 'Hybrid', 'On-site'] 
  }],
  preferredJobTypes: [{
    type: String,
    enum: ['Full-Time', 'Part-Time', 'Internship', 'Contract']
  }]
}, { timestamps: true });

export const CareerTarget = mongoose.models.CareerTarget || mongoose.model('CareerTarget', careerTargetSchema);
