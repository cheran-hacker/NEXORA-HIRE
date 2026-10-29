import mongoose from 'mongoose';

const studentListSchema = new mongoose.Schema({
  regNo: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  department: { type: String },
  program: { type: String },
  year: { type: String },
  section: { type: String },
  importedAt: { type: Date, default: Date.now }
});

export const StudentList = mongoose.models.StudentList || mongoose.model('StudentList', studentListSchema);
