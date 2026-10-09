import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  instructors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  credits: { type: Number, required: true, default: 3 },
  description: { type: String },
  semester: { type: Number, required: true },
  status: { type: String, enum: ['Active', 'Archived'], default: 'Active' }
}, { timestamps: true });

export const Course = mongoose.models.Course || mongoose.model('Course', courseSchema);
