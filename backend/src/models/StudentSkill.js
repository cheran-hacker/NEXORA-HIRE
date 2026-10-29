import mongoose from 'mongoose';

const studentSkillSchema = new mongoose.Schema({
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  skillId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Skill', 
    required: true 
  },
  source: {
    type: String,
    enum: ['manual', 'resume', 'assessment', 'profile', 'admin'],
    default: 'profile'
  },
  proficiency: {
    type: Number,
    min: 0,
    max: 100,
    default: 50 // Default baseline
  },
  verified: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Prevent duplicate skills for the same student
studentSkillSchema.index({ studentId: 1, skillId: 1 }, { unique: true });

export const StudentSkill = mongoose.models.StudentSkill || mongoose.model('StudentSkill', studentSkillSchema);
