import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'model'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const aiInterviewSessionSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetRole: { type: String, required: true },
  messages: [messageSchema],
  status: { type: String, enum: ['In Progress', 'Completed', 'Abandoned'], default: 'In Progress' },
  overallFeedback: { type: String },
  score: { type: Number }
}, {
  timestamps: true
});

export const AIInterviewSession = mongoose.model('AIInterviewSession', aiInterviewSessionSchema);
