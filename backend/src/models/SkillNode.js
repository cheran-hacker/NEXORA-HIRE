import mongoose from 'mongoose';

const skillNodeSchema = new mongoose.Schema({
  courseCode: {
    type: String,
    required: true,
    unique: true
  },
  courseName: {
    type: String,
    required: true
  },
  credits: {
    type: Number,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Boss'],
    default: 'Beginner'
  },
  prerequisites: [{
    type: String // courseCodes of prerequisites
  }],
  category: {
    type: String // e.g. 'Core', 'Elective', 'Math'
  }
}, { timestamps: true });

export const SkillNode = mongoose.models.SkillNode || mongoose.model('SkillNode', skillNodeSchema);
