import mongoose from 'mongoose';

const careerTargetHistorySchema = new mongoose.Schema({
  roleName: {
    type: String,
    required: true,
    trim: true
  },
  roleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RoleSkillMap'
  },
  status: {
    type: String,
    enum: ['active', 'previous'],
    default: 'previous'
  },
  targetCompanies: [{ type: String }],
  preferredLocations: [{ type: String }],
  preferredWorkModes: [{ type: String }],
  preferredJobTypes: [{ type: String }],
  setAt: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

const careerTargetSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // 1-to-1 relationship with Student
  },
  targetRole: {
    type: String, // String representation e.g. "Software Engineer"
    required: true,
    trim: true
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
  }],
  history: [careerTargetHistorySchema]
}, { timestamps: true });

if (mongoose.models.CareerTarget) {
  delete mongoose.models.CareerTarget;
}

export const CareerTarget = mongoose.model('CareerTarget', careerTargetSchema);
