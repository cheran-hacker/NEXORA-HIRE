import mongoose from 'mongoose';

const roleSkillMapSchema = new mongoose.Schema({
  roleName: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true 
  },
  requiredSkills: [{
    type: String,
    trim: true
  }],
  optionalSkills: [{
    type: String,
    trim: true
  }],
  industryTrends: [{
    type: String,
    trim: true
  }]
}, { timestamps: true });

export const RoleSkillMap = mongoose.models.RoleSkillMap || mongoose.model('RoleSkillMap', roleSkillMapSchema);
