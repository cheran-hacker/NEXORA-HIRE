import mongoose from 'mongoose';

const researchPaperSchema = new mongoose.Schema({
  professor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  professorName: { type: String, required: true },
  title: { type: String, required: true },
  abstract: { type: String, required: true },
  tags: [{ type: String }],
  swipedRightBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

export const ResearchPaper = mongoose.models.ResearchPaper || mongoose.model('ResearchPaper', researchPaperSchema);
