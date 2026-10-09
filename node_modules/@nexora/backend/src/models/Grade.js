import mongoose from 'mongoose';

const gradeSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  assessmentName: { type: String, required: true },
  type: { type: String, enum: ['Quiz', 'Midterm', 'Final', 'Assignment', 'Project'], required: true },
  score: { type: Number, required: true },
  maxScore: { type: Number, required: true },
  grade: { type: String }, // e.g. A, B+, etc. (Optional, can be computed)
  feedback: { type: String },
  gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export const Grade = mongoose.models.Grade || mongoose.model('Grade', gradeSchema);
